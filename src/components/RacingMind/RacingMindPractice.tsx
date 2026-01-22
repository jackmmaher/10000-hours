/**
 * RacingMindPractice - Full-screen practice view
 *
 * Features:
 * - Dark background with PixiJS canvas
 * - Subtle elapsed time display (bottom center)
 * - End button (top-right)
 * - Auto-ends when duration completes
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { RacingMindOrb } from './RacingMindOrb'
import { formatElapsedTime, RACING_MIND_COLORS } from '../../lib/racingMindAnimation'

interface RacingMindPracticeProps {
  durationSeconds: number
  getProgress: () => number
  getElapsedSeconds: () => number
  onEnd: () => void
  onCancel: () => void
}

export function RacingMindPractice({
  durationSeconds,
  getProgress,
  getElapsedSeconds,
  onEnd,
  onCancel,
}: RacingMindPracticeProps) {
  const [elapsedDisplay, setElapsedDisplay] = useState('0:00')
  const [isActive, setIsActive] = useState(true)
  const hasEndedRef = useRef(false)

  // Update elapsed time display every second
  useEffect(() => {
    if (!isActive) return

    const updateDisplay = () => {
      const elapsed = getElapsedSeconds()
      setElapsedDisplay(formatElapsedTime(elapsed))

      // Check if session should auto-end
      if (elapsed >= durationSeconds && !hasEndedRef.current) {
        hasEndedRef.current = true
        setIsActive(false)
        onEnd()
      }
    }

    // Initial update
    updateDisplay()

    // Update every second
    const interval = setInterval(updateDisplay, 1000)

    return () => clearInterval(interval)
  }, [isActive, durationSeconds, getElapsedSeconds, onEnd])

  // Handle manual end
  const handleEnd = useCallback(() => {
    if (hasEndedRef.current) return
    hasEndedRef.current = true
    setIsActive(false)
    onEnd()
  }, [onEnd])

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (hasEndedRef.current) return
    hasEndedRef.current = true
    setIsActive(false)
    onCancel()
  }, [onCancel])

  return (
    <div
      className="relative w-full h-full"
      style={{ backgroundColor: RACING_MIND_COLORS.background }}
    >
      {/* PixiJS Canvas */}
      <RacingMindOrb getProgress={getProgress} isActive={isActive} />

      {/* Cancel button - top left */}
      <button
        onClick={handleCancel}
        className="absolute top-4 left-4 text-sm text-white/40 hover:text-white/70 transition-colors z-10"
      >
        Cancel
      </button>

      {/* End button - top right */}
      <button
        onClick={handleEnd}
        className="absolute top-4 right-4 text-sm font-medium text-white/70 hover:text-white transition-colors z-10"
      >
        End
      </button>

      {/* Elapsed time - bottom center */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
        <span className="text-sm text-white/40 tabular-nums">{elapsedDisplay}</span>
      </div>

      {/* Safe area padding for newer iPhones */}
      <div className="absolute bottom-0 left-0 right-0 h-safe-area-inset-bottom" />
    </div>
  )
}
