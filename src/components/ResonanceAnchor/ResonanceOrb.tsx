/**
 * ResonanceOrb - PixiJS canvas component for breath visualization
 *
 * Renders a radial gradient circle with animating scale and glow.
 * Follows the useRacingMindOrb.ts pattern for PixiJS lifecycle.
 *
 * Visual behavior:
 * - Scale driven by breath engine amplitude (0.7 to 1.3)
 * - Glow intensity driven by humming detection + stability
 * - Color shifts indigo -> cyan when stability is high
 */

import { useEffect, useRef, useCallback } from 'react'
import { Application, Graphics, Filter } from 'pixi.js'
import { GlowFilter } from 'pixi-filters'
import { RESONANCE_COLORS, hexToNumber, getOrbState } from '../../lib/resonanceAnimation'

interface ResonanceOrbProps {
  /** 0-1 breath amplitude from breath engine */
  targetAmplitude: number
  /** Whether user is humming */
  isHumming: boolean
  /** 0-100 stability score */
  stability: number
  /** Whether the orb should be animating */
  isActive: boolean
}

export function ResonanceOrb({
  targetAmplitude,
  isHumming,
  stability,
  isActive,
}: ResonanceOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const orbRef = useRef<Graphics | null>(null)
  const glowFilterRef = useRef<GlowFilter | null>(null)
  const animationIdRef = useRef<number | null>(null)

  // Refs for props to avoid stale closures
  const targetAmplitudeRef = useRef(targetAmplitude)
  targetAmplitudeRef.current = targetAmplitude
  const isHummingRef = useRef(isHumming)
  isHummingRef.current = isHumming
  const stabilityRef = useRef(stability)
  stabilityRef.current = stability

  // Smooth interpolation state
  const currentScaleRef = useRef(1)
  const currentGlowRef = useRef(0.3)

  /**
   * Initialize PixiJS application
   */
  const initApp = useCallback(async () => {
    const container = containerRef.current
    if (!container || appRef.current) return

    await new Promise((resolve) => requestAnimationFrame(resolve))

    let width = container.clientWidth
    let height = container.clientHeight

    if (height < 200) {
      width = window.innerWidth
      height = window.innerHeight
    }

    const app = new Application()
    await app.init({
      width,
      height,
      backgroundColor: hexToNumber(RESONANCE_COLORS.background),
      antialias: true,
      powerPreference: 'high-performance',
      resolution: Math.min(window.devicePixelRatio, 2),
    })

    app.ticker.maxFPS = 60
    app.canvas.style.width = '100%'
    app.canvas.style.height = '100%'

    container.appendChild(app.canvas)
    appRef.current = app

    // Create orb with smooth radial gradient (same technique as Racing Mind)
    const orb = new Graphics()
    const radius = 60
    const orbColor = hexToNumber(RESONANCE_COLORS.orbBase)

    // 24 concentric rings for smooth gradient
    const ringCount = 24
    for (let i = ringCount; i >= 0; i--) {
      const t = i / ringCount
      const ringRadius = radius * (0.3 + t * 0.7)
      const alpha = Math.pow(1 - t, 2) * 0.95 + 0.05

      orb.circle(0, 0, ringRadius)
      orb.fill({ color: orbColor, alpha })
    }

    orb.x = width / 2
    orb.y = height / 2
    orb.roundPixels = false

    app.stage.addChild(orb)
    orbRef.current = orb

    // Glow filter
    const glowFilter = new GlowFilter({
      distance: 35,
      outerStrength: 0.5,
      innerStrength: 0.3,
      color: hexToNumber(RESONANCE_COLORS.orbLocked),
      quality: 0.3,
    })
    orb.filters = [glowFilter as unknown as Filter]
    glowFilterRef.current = glowFilter
  }, [])

  /**
   * Animation loop — smoothly interpolates orb visuals
   */
  const animate = useCallback(() => {
    if (!orbRef.current || !glowFilterRef.current || !appRef.current) return

    const orbState = getOrbState(
      targetAmplitudeRef.current,
      isHummingRef.current,
      stabilityRef.current
    )

    // Smooth interpolation (lerp) for organic feel
    const lerpFactor = 0.08
    currentScaleRef.current += (orbState.scale - currentScaleRef.current) * lerpFactor
    currentGlowRef.current += (orbState.glowIntensity - currentGlowRef.current) * lerpFactor

    orbRef.current.scale.set(currentScaleRef.current)
    glowFilterRef.current.outerStrength = currentGlowRef.current
    glowFilterRef.current.color = orbState.tint

    animationIdRef.current = requestAnimationFrame(animate)
  }, [])

  /**
   * Start animation loop
   */
  const startAnimation = useCallback(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
    }
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
   * Cleanup PixiJS
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

  // Initialize on mount when active, cleanup on unmount
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

  // Handle visibility changes
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

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ backgroundColor: RESONANCE_COLORS.background }}
    />
  )
}
