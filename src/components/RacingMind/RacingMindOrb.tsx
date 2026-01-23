/**
 * RacingMindOrb - PixiJS canvas wrapper component
 *
 * Renders the animated orb visualization.
 * The canvas fills the container and handles the PixiJS lifecycle.
 * Supports eye tracking feedback via glow intensity.
 */

import { useRef } from 'react'
import { useRacingMindOrb } from './useRacingMindOrb'
import { RACING_MIND_COLORS } from '../../lib/racingMindAnimation'

interface RacingMindOrbProps {
  getProgress: () => number
  isActive: boolean
  /** Tracking accuracy 0-100 for glow feedback (higher = brighter glow) */
  trackingAccuracy?: number
  /** Callback when orb position updates (for eye tracking comparison) */
  onPositionUpdate?: (x: number, y: number) => void
  /** Amplitude scale 0-1 for intro/outro animations (1 = full amplitude) */
  amplitudeScale?: number
}

export function RacingMindOrb({
  getProgress,
  isActive,
  trackingAccuracy = 50,
  onPositionUpdate,
  amplitudeScale = 1,
}: RacingMindOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize and manage PixiJS lifecycle
  useRacingMindOrb({
    containerRef,
    getProgress,
    isActive,
    trackingAccuracy,
    onPositionUpdate,
    amplitudeScale,
  })

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ backgroundColor: RACING_MIND_COLORS.background }}
    />
  )
}
