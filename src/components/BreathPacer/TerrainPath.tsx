/**
 * TerrainPath - SVG terrain visualization for breath pacer
 *
 * Renders:
 * - Static terrain path (pre-generated from pattern)
 * - Terrain fill (subtle gradient below the line)
 * - Animated ball (circle + glow) moving along the terrain
 *
 * Performance: 60fps via requestAnimationFrame + direct ref manipulation.
 * Zero React re-renders during animation — all position updates via setAttribute.
 */

import { useEffect, useRef, useMemo } from 'react'
import {
  generateTerrainPath,
  generateTerrainFillPath,
  getBallPosition,
  type BreathPattern,
  type BreathTheme,
} from '../../lib/breathPatterns'

// SVG coordinate system
const SVG_WIDTH = 400
const SVG_HEIGHT = 200
const TOP_Y = 40
const BOTTOM_Y = 160
const PADDING = 30

interface TerrainPathProps {
  pattern: BreathPattern
  theme: BreathTheme
  /** Getter that returns current cycle progress (0-1). Called each RAF frame. */
  getCycleProgress: () => number
  /** Whether the animation is active */
  isActive: boolean
}

export function TerrainPath({ pattern, theme, getCycleProgress, isActive }: TerrainPathProps) {
  const ballRef = useRef<SVGCircleElement>(null)
  const glowRef = useRef<SVGCircleElement>(null)
  const glowStopRef = useRef<SVGStopElement>(null)
  const rafRef = useRef<number>(0)

  // Pre-generate terrain paths (only recalculate when pattern changes)
  const terrainD = useMemo(
    () => generateTerrainPath(pattern, SVG_WIDTH, TOP_Y, BOTTOM_Y, PADDING),
    [pattern]
  )
  const terrainFillD = useMemo(
    () => generateTerrainFillPath(pattern, SVG_WIDTH, TOP_Y, BOTTOM_Y, PADDING),
    [pattern]
  )

  // Animation loop — runs at 60fps, updates ball position via refs
  useEffect(() => {
    if (!isActive) return

    const animate = () => {
      const progress = getCycleProgress()
      const pos = getBallPosition(pattern, progress, SVG_WIDTH, TOP_Y, BOTTOM_Y, PADDING)

      if (ballRef.current) {
        ballRef.current.setAttribute('cx', String(pos.x))
        ballRef.current.setAttribute('cy', String(pos.y))
      }
      if (glowRef.current) {
        glowRef.current.setAttribute('cx', String(pos.x))
        glowRef.current.setAttribute('cy', String(pos.y))
      }
      // Glow opacity: brighter at top (breathLevel=1), dimmer at bottom
      if (glowStopRef.current) {
        const opacity = 0.15 + pos.breathLevel * 0.45
        glowStopRef.current.setAttribute('stop-opacity', String(opacity))
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isActive, pattern, getCycleProgress])

  return (
    <svg
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Ball glow gradient */}
        <radialGradient id="ball-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={theme.glowColor} ref={glowStopRef} stopOpacity="0.4" />
          <stop offset="100%" stopColor={theme.glowColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Terrain fill (subtle area below the line) */}
      <path d={terrainFillD} fill={theme.fillColor} />

      {/* Terrain line */}
      <path d={terrainD} fill="none" stroke={theme.pathColor} strokeWidth="1.5" />

      {/* Ball glow (larger, blurred circle) */}
      <circle ref={glowRef} cx={PADDING} cy={BOTTOM_Y} r="24" fill="url(#ball-glow)" />

      {/* Ball core */}
      <circle ref={ballRef} cx={PADDING} cy={BOTTOM_Y} r="6" fill={theme.ballColor} />
    </svg>
  )
}
