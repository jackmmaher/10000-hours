/**
 * OmCoachPractice - Main guided Aum practice view
 *
 * Layout (top to bottom):
 * - Circular progress with large phoneme + countdown in center
 * - Coherence scale with percentage (0-100%)
 * - Cycle progress counter (Practice or Scored)
 * - Session elapsed time (Timer-tab style, only during scored)
 *
 * Flow:
 * - Practice Cycles (1-3): User learns rhythm, not scored
 * - "Session begins now" message appears briefly
 * - Scored Cycles: Count toward session metrics
 */

import { useRef, useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CircularProgress } from './CircularProgress'
import { CoherenceScale } from './CoherenceScale'
import { CycleCelebration } from './CycleCelebration'
import {
  type GuidedCycleState,
  type CycleQuality,
  getPhaseDurations,
  FIRST_BREATHE_MULTIPLIER,
} from '../../hooks/useGuidedOmCycle'
import type { CoherenceData } from '../../hooks/useVocalCoherence'

interface OmCoachPracticeProps {
  guidedState: GuidedCycleState
  getCoherenceData: () => CoherenceData
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
  getCoherenceData,
  isActive,
  celebration,
  onCelebrationDismiss,
}: OmCoachPracticeProps) {
  const [coherence, setCoherence] = useState<CoherenceData>({
    score: 0,
    pitchStabilityScore: 0,
    amplitudeSmoothnessScore: 0,
    voicingContinuityScore: 0,
    sessionMedianFrequency: null,
    rawPitchVarianceCents: 0,
    rawAmplitudeCV: 0,
  })

  const animationRef = useRef<number | null>(null)

  // Animation loop for smooth coherence updates
  const updateLoop = useCallback(() => {
    const coherenceData = getCoherenceData()

    // Only update state if score changed meaningfully (avoid re-renders)
    setCoherence((prev) => {
      if (Math.abs(prev.score - coherenceData.score) >= 1) {
        return { ...coherenceData }
      }
      return prev
    })

    if (isActive) {
      animationRef.current = requestAnimationFrame(updateLoop)
    }
  }, [isActive, getCoherenceData])

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

  // Practice vs Scored state
  const isPractice = guidedState.isPractice
  const showSessionStart = guidedState.showSessionStart

  // Progressive UI dimming — fade secondary elements as session deepens
  // 0.0 = start of scored session, 1.0 = final cycle
  const sessionProgress =
    !isPractice && guidedState.totalCycles > 0
      ? Math.min(1, (guidedState.currentCycle - 1) / guidedState.totalCycles)
      : 0
  // Secondary elements fade from 1.0 → 0.3 over the session
  const secondaryOpacity = Math.max(0.3, 1 - sessionProgress * 0.7)
  // Coherence scale fades from 1.0 → 0.0 over the last third
  const coherenceOpacity =
    sessionProgress < 0.66 ? 1 : Math.max(0, 1 - (sessionProgress - 0.66) * 3)

  // Haptic phase transitions — enable eyes-closed practice
  const prevPhaseForHapticRef = useRef(guidedState.currentPhase)
  useEffect(() => {
    if (guidedState.currentPhase !== prevPhaseForHapticRef.current) {
      prevPhaseForHapticRef.current = guidedState.currentPhase
      if ('vibrate' in navigator) {
        // Distinct haptic patterns per phase transition
        switch (guidedState.currentPhase) {
          case 'breathe':
            navigator.vibrate(20) // Single gentle tap — cycle boundary
            break
          case 'ah':
            navigator.vibrate([15, 30, 15]) // Double tap — begin chanting
            break
          case 'oo':
            navigator.vibrate(15) // Single light tap
            break
          case 'mm':
            navigator.vibrate(15) // Single light tap
            break
        }
      }
    }
  }, [guidedState.currentPhase])

  // Calculate time remaining in current phase
  const phaseDurations = getPhaseDurations(guidedState.timingMode)
  let currentPhaseDuration =
    phaseDurations[guidedState.currentPhase as keyof typeof phaseDurations] ?? 0

  // First cycle's breathe phase is longer
  if (
    guidedState.currentPhase === 'breathe' &&
    isPractice &&
    guidedState.practiceCycleNumber === 1
  ) {
    currentPhaseDuration = currentPhaseDuration * FIRST_BREATHE_MULTIPLIER
  }

  const phaseTimeRemainingMs = Math.ceil(currentPhaseDuration * (1 - guidedState.phaseProgress))

  // Format elapsed time (Timer-tab style)
  const elapsed = formatElapsed(guidedState.elapsedMs)

  // Calculate practice progress
  const practiceProgress = isPractice
    ? ((guidedState.practiceCycleNumber - 1 + guidedState.cycleProgress) /
        guidedState.practiceTotalCycles) *
      100
    : 0

  // Calculate scored progress
  // Clamp to 100% to prevent overflow when cycles exceed totalCycles
  const scoredProgress = !isPractice
    ? Math.min(100, ((guidedState.currentCycle - 1) / guidedState.totalCycles) * 100)
    : 0

  return (
    <div className="flex-1 flex flex-col bg-base relative">
      {/* "Session begins now" overlay */}
      <AnimatePresence>
        {showSessionStart && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center backdrop-blur-sm"
            style={{ backgroundColor: 'var(--bg-overlay)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <div className="font-serif text-2xl" style={{ color: 'var(--text-primary)' }}>
                Session begins now
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area - centered vertically */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Circular progress with phoneme + countdown */}
        <CircularProgress
          currentPhase={guidedState.currentPhase}
          phaseProgress={guidedState.phaseProgress}
          cycleProgress={guidedState.cycleProgress}
          totalProgress={guidedState.totalProgress}
          isFirstCycle={guidedState.isFirstCycle}
          phaseTimeRemainingMs={phaseTimeRemainingMs}
          timingMode={guidedState.timingMode}
          size={180}
        />

        {/* Spacer */}
        <div className="h-6" />

        {/* Coherence scale — fades out in final third of session */}
        <div
          className="w-full max-w-sm transition-opacity duration-1000"
          style={{ opacity: coherenceOpacity }}
        >
          <CoherenceScale
            coherence={coherence.score}
            currentPhase={guidedState.currentPhase}
            phaseTimeRemainingMs={phaseTimeRemainingMs}
          />
        </div>

        {/* Spacer */}
        <div className="h-6" />

        {/* Cycle progress counter - Practice or Scored — fades with session */}
        <div
          className="text-center transition-opacity duration-1000"
          style={{ opacity: isPractice ? 1 : secondaryOpacity }}
        >
          {isPractice ? (
            <>
              {/* Practice cycle label */}
              <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Practice Cycle {guidedState.practiceCycleNumber} of{' '}
                {guidedState.practiceTotalCycles}
              </div>
              {/* Practice progress bar with shimmer */}
              <div
                className="w-40 h-1.5 rounded-full mt-2 mx-auto overflow-hidden relative"
                style={{ backgroundColor: 'var(--progress-track)' }}
              >
                <div
                  className="h-full transition-all duration-300 ease-out rounded-full relative overflow-hidden"
                  style={{
                    width: `${Math.min(100, practiceProgress)}%`,
                    backgroundColor: 'var(--text-muted)',
                  }}
                >
                  {/* Shimmer effect */}
                  <div
                    className="absolute inset-0 -translate-x-full animate-shimmer"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, var(--shimmer-color, rgba(255,255,255,0.3)), transparent)',
                    }}
                  />
                </div>
              </div>
              {/* Subtle helper text */}
              <div className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                Learning the rhythm...
              </div>
            </>
          ) : (
            <>
              {/* Scored cycle label - clamp to totalCycles to prevent overflow display */}
              <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                Cycle {Math.min(guidedState.currentCycle, guidedState.totalCycles)} of{' '}
                {guidedState.totalCycles}
              </div>
              {/* Scored progress bar */}
              <div
                className="w-40 h-1.5 rounded-full mt-2 mx-auto overflow-hidden"
                style={{ backgroundColor: 'var(--progress-track)' }}
              >
                <div
                  className="h-full transition-all duration-300 ease-out rounded-full"
                  style={{
                    width: `${Math.min(100, scoredProgress)}%`,
                    backgroundColor: 'var(--accent)',
                  }}
                />
              </div>
              {/* Evolving guidance — shifts from instructional to contemplative */}
              {sessionProgress < 0.8 && (
                <div
                  className="text-xs mt-2 transition-opacity duration-1000"
                  style={{ color: 'var(--text-tertiary)', opacity: secondaryOpacity }}
                >
                  {sessionProgress < 0.25
                    ? 'Find your rhythm'
                    : sessionProgress < 0.5
                      ? 'Let the sound carry you'
                      : 'Close your eyes'}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Session elapsed time - Fixed at bottom */}
      <div className="flex-none px-4 pb-4 safe-area-bottom">
        <div
          className="flex items-baseline justify-center gap-3 font-serif transition-opacity duration-1000"
          style={{
            fontVariantNumeric: 'tabular-nums lining-nums',
            opacity: isPractice ? 0.4 : secondaryOpacity,
          }}
        >
          {/* Minutes */}
          <span
            className="font-semibold"
            style={{ fontSize: '3.5rem', lineHeight: 1, color: 'var(--text-primary)' }}
          >
            {elapsed.minutes}
          </span>
          {/* Seconds */}
          <span
            className="font-light"
            style={{ fontSize: '2.5rem', lineHeight: 1, color: 'var(--text-tertiary)' }}
          >
            {elapsed.seconds}
          </span>
        </div>
        {/* Placeholder to maintain layout height */}
        <div className="text-center text-xs mt-2 opacity-0" style={{ color: 'var(--text-muted)' }}>
          placeholder
        </div>
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
