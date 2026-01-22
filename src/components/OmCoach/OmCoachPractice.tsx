/**
 * OmCoachPractice - Main guided Aum practice view
 *
 * Layout (top to bottom):
 * - Circular progress with large phoneme + countdown in center
 * - Frequency scale with Hz and accuracy
 * - Cycle progress counter
 * - Session elapsed time (Timer-tab style)
 */

import { useRef, useEffect, useCallback, useState } from 'react'
import { CircularProgress } from './CircularProgress'
import { FrequencyScale } from './FrequencyScale'
import { CycleCelebration } from './CycleCelebration'
import {
  type GuidedCycleState,
  type CycleQuality,
  getPhaseDurations,
  getReadyDuration,
} from '../../hooks/useGuidedOmCycle'
import type { PitchData } from '../../hooks/usePitchDetection'

interface OmCoachPracticeProps {
  guidedState: GuidedCycleState
  getPitchData: () => PitchData
  isActive: boolean
  celebration: { show: boolean; quality: CycleQuality; cycleNumber: number } | null
  onCelebrationDismiss: () => void
}

/**
 * Format elapsed seconds as MM:SS (Timer-tab style, count-up)
 */
function formatElapsed(ms: number): { minutes: string; seconds: string } {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return {
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  }
}

export function OmCoachPractice({
  guidedState,
  getPitchData,
  isActive,
  celebration,
  onCelebrationDismiss,
}: OmCoachPracticeProps) {
  const [pitch, setPitch] = useState<PitchData>({
    frequency: null,
    clarity: 0,
    cents: null,
    isWithinTolerance: false,
    timestamp: 0,
  })

  const animationRef = useRef<number | null>(null)

  // Animation loop for smooth pitch updates
  const updateLoop = useCallback(() => {
    setPitch(getPitchData())
    if (isActive) {
      animationRef.current = requestAnimationFrame(updateLoop)
    }
  }, [isActive, getPitchData])

  useEffect(() => {
    if (isActive) {
      animationRef.current = requestAnimationFrame(updateLoop)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, updateLoop])

  const frequency = pitch.frequency
  const isWithinTolerance = pitch.isWithinTolerance

  // Check if in getReady phase
  const isGetReady = guidedState.isGetReady

  // Calculate time remaining in current phase (for timed modes)
  let phaseTimeRemainingMs: number | null = null
  if (guidedState.timingMode !== 'flexible') {
    if (isGetReady) {
      // Get Ready phase countdown
      const readyDuration = getReadyDuration(guidedState.timingMode)
      phaseTimeRemainingMs = Math.ceil(readyDuration * (1 - guidedState.getReadyProgress))
    } else {
      // Normal phase countdown
      const phaseDurations = getPhaseDurations(guidedState.timingMode)
      const currentPhaseDuration =
        phaseDurations[guidedState.currentPhase as keyof typeof phaseDurations] ?? 0
      phaseTimeRemainingMs = Math.ceil(currentPhaseDuration * (1 - guidedState.phaseProgress))
    }
  }

  // Format elapsed time (Timer-tab style)
  const elapsed = formatElapsed(guidedState.elapsedMs)

  return (
    <div className="flex-1 flex flex-col bg-base">
      {/* Main content area - centered vertically */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Circular progress with phoneme + countdown */}
        <CircularProgress
          currentPhase={guidedState.currentPhase}
          phaseProgress={guidedState.phaseProgress}
          cycleProgress={guidedState.cycleProgress}
          phaseTimeRemainingMs={phaseTimeRemainingMs}
          timingMode={guidedState.timingMode}
          size={180}
        />

        {/* Spacer */}
        <div className="h-6" />

        {/* Frequency scale */}
        <div
          className="w-full max-w-sm transition-opacity duration-300"
          style={{ opacity: isGetReady ? 0.4 : 1 }}
        >
          <FrequencyScale
            frequency={isGetReady ? null : frequency}
            isWithinTolerance={isGetReady ? false : isWithinTolerance}
          />
        </div>

        {/* Spacer */}
        <div className="h-6" />

        {/* Cycle progress counter */}
        <div
          className="text-center transition-opacity duration-300"
          style={{ opacity: isGetReady ? 0.4 : 1 }}
        >
          <div className="text-base font-medium text-ink">
            Cycle {guidedState.currentCycle} of {guidedState.totalCycles}
          </div>
          {/* Progress bar */}
          <div className="w-40 h-1.5 bg-ink/10 rounded-full mt-2 mx-auto overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300 ease-out rounded-full"
              style={{
                width: `${Math.min(100, ((guidedState.currentCycle - 1) / guidedState.totalCycles) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Session elapsed time - Fixed at bottom, pb-4 since safe-area adds its own padding */}
      <div className="flex-none px-4 pb-4 safe-area-bottom">
        <div
          className="flex items-baseline justify-center gap-3 font-serif transition-opacity duration-300"
          style={{
            fontVariantNumeric: 'tabular-nums lining-nums',
            opacity: isGetReady ? 0.4 : 1,
          }}
        >
          {/* Minutes */}
          <span className="font-semibold text-ink" style={{ fontSize: '3.5rem', lineHeight: 1 }}>
            {elapsed.minutes}
          </span>
          {/* Seconds */}
          <span className="font-light text-ink/40" style={{ fontSize: '2.5rem', lineHeight: 1 }}>
            {elapsed.seconds}
          </span>
        </div>
        {/* Subtle label during getReady */}
        {isGetReady && (
          <div className="text-center text-ink/30 text-xs mt-2">starts after breath</div>
        )}
      </div>

      {/* Celebration overlay */}
      {celebration?.show && (
        <CycleCelebration
          cycleNumber={celebration.cycleNumber}
          quality={celebration.quality}
          onDismiss={onCelebrationDismiss}
        />
      )}
    </div>
  )
}
