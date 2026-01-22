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
}

export function useRacingMindOrb({ containerRef, getProgress, isActive }: UseRacingMindOrbOptions) {
  const appRef = useRef<Application | null>(null)
  const orbRef = useRef<Graphics | null>(null)
  const glowFilterRef = useRef<GlowFilter | null>(null)
  const noiseRef = useRef<SimplexNoise>(new SimplexNoise())
  const startTimeRef = useRef<number>(0)
  const animationIdRef = useRef<number | null>(null)
  const isReducedMotionRef = useRef(prefersReducedMotion())

  /**
   * Initialize PixiJS application
   */
  const initApp = useCallback(async () => {
    const container = containerRef.current
    if (!container || appRef.current) return

    const width = container.clientWidth
    const height = container.clientHeight

    // Create PixiJS Application with battery-efficient settings
    const app = new Application()
    await app.init({
      width,
      height,
      backgroundColor: RACING_MIND_COLORS.background,
      antialias: true,
      powerPreference: 'low-power',
      resolution: Math.min(window.devicePixelRatio, 2), // Cap at 2x for performance
    })

    // Set target FPS
    app.ticker.maxFPS = ANIMATION_PARAMS.targetFps

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

  /**
   * Animation loop - runs at 30fps
   */
  const animate = useCallback(() => {
    if (!isActive || !orbRef.current || !glowFilterRef.current || !appRef.current) {
      return
    }

    const now = performance.now()
    const elapsedMs = now - startTimeRef.current
    const progress = getProgress()

    const { width, height } = appRef.current.screen

    // Calculate orb position
    if (isReducedMotionRef.current) {
      // Reduced motion: static orb in center
      orbRef.current.x = width / 2
      orbRef.current.y = height / 2
    } else {
      const position = calculateOrbPosition(elapsedMs, progress, width, height, noiseRef.current)
      orbRef.current.x = position.x
      orbRef.current.y = position.y
    }

    // Update glow strength
    const glowStrength = getGlowStrength(elapsedMs)
    glowFilterRef.current.outerStrength = glowStrength

    // Schedule next frame
    animationIdRef.current = requestAnimationFrame(animate)
  }, [isActive, getProgress])

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
