/**
 * useRacingMindOrb - PixiJS Application lifecycle hook
 *
 * Manages:
 * - PixiJS Application creation/destruction
 * - Canvas setup with proper dimensions
 * - Orb graphics with glow filter
 * - Animation loop at 30fps
 * - Reduced motion support
 *
 * Performance optimizations:
 * - powerPreference: 'low-power' for battery efficiency
 * - maxFPS: 30 for iOS Low Power Mode compatibility
 * - Single canvas resize at init (iOS Safari memory leak prevention)
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
import type { OrientationPhase } from './RacingMindPractice'

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
  orientationPhase?: OrientationPhase
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
  orientationPhase = 'portrait',
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

  // Position interpolation refs for smoother animation
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null)
  const lastFrameTimeRef = useRef<number>(0)

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

    // Create orb graphics
    const orb = new Graphics()
    orb.circle(0, 0, ANIMATION_PARAMS.orbRadius)
    orb.fill(RACING_MIND_COLORS.orb)
    orb.x = width / 2
    orb.y = height / 2
    app.stage.addChild(orb)
    orbRef.current = orb

    // Create glow filter
    const glowFilter = new GlowFilter({
      distance: 25,
      outerStrength: ANIMATION_PARAMS.glowMinStrength,
      innerStrength: 0.5,
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
   * Linear interpolation helper for smooth position transitions
   */
  function lerp(current: number, target: number, factor: number): number {
    return current + (target - current) * factor
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

    // Determine if we're in landscape mode
    const isLandscape = orientationPhase === 'landscape'

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
      const position = calculateOrbPosition(
        elapsedMs,
        progress,
        width,
        height,
        noiseRef.current,
        isLandscape
      )

      // Apply amplitude scale for intro/outro animations
      // Scale the offset from center, not the absolute position
      const scale = amplitudeScaleRef.current
      targetX = centerX + (position.x - centerX) * scale
      targetY = centerY + (position.y - centerY) * scale
    }

    // Frame-rate independent lerp for smooth transitions
    const deltaMs = lastFrameTimeRef.current ? now - lastFrameTimeRef.current : 16.67
    lastFrameTimeRef.current = now
    const lerpFactor = 1 - Math.pow(0.85, deltaMs / 16.67) // ~0.15 at 60fps

    let orbX: number
    let orbY: number
    if (lastPositionRef.current === null) {
      orbX = targetX
      orbY = targetY
    } else {
      orbX = lerp(lastPositionRef.current.x, targetX, lerpFactor)
      orbY = lerp(lastPositionRef.current.y, targetY, lerpFactor)
    }
    lastPositionRef.current = { x: orbX, y: orbY }

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
  }, [isActive, getProgress, containerRef, orientationPhase])

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
