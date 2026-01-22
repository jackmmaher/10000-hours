/**
 * RacingMindOrb - PixiJS canvas wrapper component
 *
 * Renders the animated orb visualization.
 * The canvas fills the container and handles the PixiJS lifecycle.
 */

import { useRef } from 'react'
import { useRacingMindOrb } from './useRacingMindOrb'
import { RACING_MIND_COLORS } from '../../lib/racingMindAnimation'

interface RacingMindOrbProps {
  getProgress: () => number
  isActive: boolean
}

export function RacingMindOrb({ getProgress, isActive }: RacingMindOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize and manage PixiJS lifecycle
  useRacingMindOrb({
    containerRef,
    getProgress,
    isActive,
  })

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ backgroundColor: RACING_MIND_COLORS.background }}
    />
  )
}
