/**
 * useRacingMindOrb - PixiJS Application lifecycle hook
 *
 * Manages:
 * - PixiJS Application creation/destruction
 * - Canvas setup with proper dimensions
 * - Orb graphics with gradient blur for "soft gaze" effect
 * - Glow filter for visual feedback
 * - Animation loop at 60fps
 * - Reduced motion support
 *
 * Scientific basis for soft-edge gradient:
 * - Blurred edges discourage "hard" fixation and encourage peripheral awareness
 * - Peripheral vision activation is incompatible with high-stress states
 * - Promotes parasympathetic "soft gaze" response
 */

import { useEffect, useRef, useCallback } from 'react'
import { Application, Graphics, Filter } from 'pixi.js'
import { GlowFilter } from 'pixi-filters'
import { SimplexNoise } from '../../lib/noise/SimplexNoise'
import {
  RACING_MIND_COLORS,
  ANIMATION_PARAMS,
  calculateOrbPosition,
  getGlowStrength,
  prefersReducedMotion,
} from '../../lib/racingMindAnimation'

/**
 * Convert hex color string to number
 */
function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

interface UseRacingMindOrbOptions {
  containerRef: React.RefObject<HTMLDivElement | null>
  getProgress: () => number
  isActive: boolean
  /** Tracking accuracy 0-100 for glow feedback */
  trackingAccuracy?: number
  /** Callback when orb position updates */
  onPositionUpdate?: (x: number, y: number) => void
  /** Amplitude scale 0-1 for intro/outro animations (1 = full amplitude) */
  amplitudeScale?: number
}

export function useRacingMindOrb({
  containerRef,
  getProgress,
  isActive,
  trackingAccuracy: _trackingAccuracy = 50,
  onPositionUpdate: _onPositionUpdate,
  amplitudeScale: _amplitudeScale = 1,
}: UseRacingMindOrbOptions) {
  const appRef = useRef<Application | null>(null)
  const orbRef = useRef<Graphics | null>(null)
  const glowFilterRef = useRef<GlowFilter | null>(null)
  const noiseRef = useRef<SimplexNoise>(new SimplexNoise())
  const startTimeRef = useRef<number>(0)
  const animationIdRef = useRef<number | null>(null)
  const isReducedMotionRef = useRef(prefersReducedMotion())

  // Spring physics state for more organic motion
  interface SpringState {
    position: number
    velocity: number
  }
  const springXRef = useRef<SpringState>({ position: 0, velocity: 0 })
  const springYRef = useRef<SpringState>({ position: 0, velocity: 0 })
  const lastFrameTimeRef = useRef<number>(0)
  const springInitializedRef = useRef(false)

  /**
   * Initialize PixiJS application
   * Uses a small delay to ensure container has correct dimensions after layout
   */
  const initApp = useCallback(async () => {
    const container = containerRef.current
    if (!container || appRef.current) return

    // Wait for next frame to ensure layout is complete
    await new Promise((resolve) => requestAnimationFrame(resolve))

    // Get dimensions - use window dimensions as fallback for fullscreen mode
    let width = container.clientWidth
    let height = container.clientHeight

    // If container dimensions seem wrong (too small), use window dimensions
    if (height < 200) {
      width = window.innerWidth
      height = window.innerHeight
    }

    // Create PixiJS Application with smooth animation settings
    const app = new Application()
    await app.init({
      width,
      height,
      backgroundColor: RACING_MIND_COLORS.background,
      antialias: true,
      powerPreference: 'high-performance',
      resolution: Math.min(window.devicePixelRatio, 2), // Cap at 2x for performance
    })

    // Set target FPS
    app.ticker.maxFPS = ANIMATION_PARAMS.targetFps

    // Make canvas fill container
    app.canvas.style.width = '100%'
    app.canvas.style.height = '100%'

    // Add canvas to container
    container.appendChild(app.canvas)
    appRef.current = app

    // Create orb graphics with smooth radial gradient for "soft gaze" effect
    // Many concentric circles create imperceptible transitions
    const orb = new Graphics()
    const radius = ANIMATION_PARAMS.orbRadius
    const orbColor = hexToNumber(RACING_MIND_COLORS.orb)

    // Smooth radial gradient using 24 concentric rings
    // Drawn from outside-in so inner circles overlay outer ones
    const ringCount = 24
    for (let i = ringCount; i >= 0; i--) {
      const t = i / ringCount // 1.0 (outer) to 0.0 (center)
      const ringRadius = radius * (0.3 + t * 0.7) // 30% to 100% of radius

      // Quadratic falloff for natural soft edge (steeper near edge, flatter in core)
      // alpha = 1 at center, fades smoothly to ~0.05 at edge
      const alpha = Math.pow(1 - t, 2) * 0.95 + 0.05

      orb.circle(0, 0, ringRadius)
      orb.fill({ color: orbColor, alpha })
    }

    orb.x = width / 2
    orb.y = height / 2

    // Enable sub-pixel rendering for smoother animation
    // (prevents orb from snapping to integer pixel positions)
    orb.roundPixels = false

    app.stage.addChild(orb)
    orbRef.current = orb

    // Create glow filter - slightly larger distance for soft-edge orb
    const glowFilter = new GlowFilter({
      distance: 30,
      outerStrength: ANIMATION_PARAMS.glowMinStrength,
      innerStrength: 0.3,
      color: hexToNumber(RACING_MIND_COLORS.glow),
      quality: 0.3, // Lower quality for better performance
    })
    orb.filters = [glowFilter as unknown as Filter]
    glowFilterRef.current = glowFilter

    // Record start time
    startTimeRef.current = performance.now()
  }, [containerRef])

  // Ref for tracking accuracy to avoid stale closures
  const trackingAccuracyRef = useRef(_trackingAccuracy)
  trackingAccuracyRef.current = _trackingAccuracy

  // Ref for position update callback
  const onPositionUpdateRef = useRef(_onPositionUpdate)
  onPositionUpdateRef.current = _onPositionUpdate

  // Ref for amplitude scale (intro/outro animations)
  const amplitudeScaleRef = useRef(_amplitudeScale)
  amplitudeScaleRef.current = _amplitudeScale

  /**
   * Slightly underdamped spring for pendulum-like motion
   * Lower stiffness = more gradual following (less snappy)
   * Underdamped = subtle overshoot at turnarounds (natural pendulum feel)
   */
  function springStep(
    state: { position: number; velocity: number },
    target: number,
    deltaMs: number,
    stiffness = 120,
    damping = 20
  ): { position: number; velocity: number } {
    const dt = deltaMs / 1000
    const displacement = state.position - target
    const springForce = -stiffness * displacement
    const dampingForce = -damping * state.velocity
    const acceleration = springForce + dampingForce

    return {
      velocity: state.velocity + acceleration * dt,
      position: state.position + state.velocity * dt,
    }
  }

  /**
   * Animation loop - runs at 60fps with position interpolation
   */
  const animate = useCallback(() => {
    if (!isActive || !orbRef.current || !glowFilterRef.current || !appRef.current) {
      return
    }

    const now = performance.now()
    const elapsedMs = now - startTimeRef.current
    const progress = getProgress()

    // Use container dimensions for accurate centering (handles safe areas)
    const container = containerRef.current
    const width = container?.clientWidth ?? appRef.current.screen.width
    const height = container?.clientHeight ?? appRef.current.screen.height

    // Calculate target orb position
    let targetX: number
    let targetY: number
    const centerX = width / 2
    const centerY = height / 2

    if (isReducedMotionRef.current) {
      // Reduced motion: static orb in center
      targetX = centerX
      targetY = centerY
    } else {
      const position = calculateOrbPosition(elapsedMs, progress, width, height, noiseRef.current)

      // Apply amplitude scale for intro/outro animations
      // Scale the offset from center, not the absolute position
      const scale = amplitudeScaleRef.current
      targetX = centerX + (position.x - centerX) * scale
      targetY = centerY + (position.y - centerY) * scale
    }

    // Frame-rate independent spring physics for organic motion
    const deltaMs = lastFrameTimeRef.current ? now - lastFrameTimeRef.current : 16.67
    lastFrameTimeRef.current = now

    // Initialize spring position on first frame
    if (!springInitializedRef.current) {
      springXRef.current = { position: targetX, velocity: 0 }
      springYRef.current = { position: targetY, velocity: 0 }
      springInitializedRef.current = true
    }

    // Update spring physics
    springXRef.current = springStep(springXRef.current, targetX, deltaMs)
    springYRef.current = springStep(springYRef.current, targetY, deltaMs)

    const orbX = springXRef.current.position
    const orbY = springYRef.current.position

    orbRef.current.x = orbX
    orbRef.current.y = orbY

    // Report position for eye tracking comparison
    onPositionUpdateRef.current?.(orbX, orbY)

    // Update glow strength - base glow plus tracking accuracy boost
    const baseGlow = getGlowStrength(elapsedMs)

    // When eye tracking is active, boost glow based on tracking accuracy
    // trackingAccuracy 0-100 maps to 0-0.5 additional glow strength
    const accuracyBoost = (trackingAccuracyRef.current / 100) * 0.5
    const finalGlow = baseGlow + accuracyBoost

    glowFilterRef.current.outerStrength = finalGlow

    // Schedule next frame
    animationIdRef.current = requestAnimationFrame(animate)
  }, [isActive, getProgress, containerRef])

  /**
   * Start animation loop
   */
  const startAnimation = useCallback(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
    }
    startTimeRef.current = performance.now()
    animationIdRef.current = requestAnimationFrame(animate)
  }, [animate])

  /**
   * Stop animation loop
   */
  const stopAnimation = useCallback(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
      animationIdRef.current = null
    }
  }, [])

  /**
   * Cleanup PixiJS application
   */
  const cleanup = useCallback(() => {
    stopAnimation()

    if (appRef.current) {
      appRef.current.destroy(true, { children: true, texture: true })
      appRef.current = null
    }
    orbRef.current = null
    glowFilterRef.current = null
  }, [stopAnimation])

  // Initialize on mount, cleanup on unmount
  useEffect(() => {
    if (isActive) {
      initApp().then(() => {
        startAnimation()
      })
    }

    return () => {
      cleanup()
    }
  }, [isActive, initApp, startAnimation, cleanup])

  // Handle visibility changes - pause when tab is hidden
  useEffect(() => {
    if (!isActive) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation()
      } else {
        startAnimation()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isActive, startAnimation, stopAnimation])

  return {
    cleanup,
  }
}
