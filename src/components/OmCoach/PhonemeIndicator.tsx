/**
 * PhonemeIndicator - Real-time phoneme feedback during Aum practice
 *
 * Shows detected phoneme vs expected phoneme with visual feedback:
 * - Three segments: Ah | Oo | Mm
 * - Current detected phoneme is highlighted
 * - Green glow when matches expected phase
 * - Amber when close (adjacent phoneme)
 * - Subtle during breathing phase
 *
 * Designed to match the quality of FrequencyScale component.
 */

import { memo } from 'react'
import { motion } from 'framer-motion'
import type { Phoneme } from '../../hooks/useFormantDetection'
import type { CyclePhase } from '../../hooks/useGuidedOmCycle'

// Grace period at start of each phoneme phase (ms)
const GRACE_PERIOD_MS = 500

// Upcoming indicator before phase ends (ms)
const UPCOMING_INDICATOR_MS = 1000

interface PhonemeIndicatorProps {
  detectedPhoneme: Phoneme
  expectedPhase: CyclePhase
  confidence: number
  isBreathing: boolean
  /** Time elapsed in current phase (ms) - for grace period calculation */
  phaseElapsedMs?: number
  /** Time remaining in current phase (ms) - for upcoming indicator */
  phaseRemainingMs?: number
}

/**
 * Map cycle phase to expected phoneme
 */
function phaseToPhoneme(phase: CyclePhase): Phoneme | null {
  switch (phase) {
    case 'ah':
      return 'A'
    case 'oo':
      return 'U'
    case 'mm':
      return 'M'
    default:
      return null
  }
}

/**
 * Get display label for phoneme segment
 */
function getLabel(p: 'A' | 'U' | 'M'): string {
  switch (p) {
    case 'A':
      return 'Ah'
    case 'U':
      return 'Oo'
    case 'M':
      return 'Mm'
  }
}

export const PhonemeIndicator = memo(function PhonemeIndicator({
  detectedPhoneme,
  expectedPhase,
  confidence,
  isBreathing,
  phaseElapsedMs = 0,
  phaseRemainingMs = Infinity,
}: PhonemeIndicatorProps) {
  const expectedPhoneme = phaseToPhoneme(expectedPhase)
  const isSilent = detectedPhoneme === 'silence'

  // Grace period: don't mark "wrong" during first 500ms of a phoneme phase
  // Users need time to transition from breathe/previous sound
  const isInGracePeriod = !isBreathing && phaseElapsedMs < GRACE_PERIOD_MS

  // Upcoming: show indicator when next phase is approaching (last 1s)
  const isUpcoming = phaseRemainingMs <= UPCOMING_INDICATOR_MS

  // Get the next phase for upcoming indicator
  const getNextPhase = (): 'A' | 'U' | 'M' | null => {
    switch (expectedPhase) {
      case 'breathe':
        return 'A'
      case 'ah':
        return 'U'
      case 'oo':
        return 'M'
      default:
        return null
    }
  }
  const nextPhoneme = getNextPhase()

  // During breathing phase, show muted indicator (with upcoming hint for Ah)
  if (isBreathing) {
    const ahIsUpcoming = isUpcoming // Ah is always next after breathe
    return (
      <div className="flex gap-2">
        {(['A', 'U', 'M'] as const).map((p) => {
          const isAhAndUpcoming = p === 'A' && ahIsUpcoming
          return (
            <div
              key={p}
              className={`flex-1 py-2 rounded-lg text-center transition-all duration-150 ${isAhAndUpcoming ? 'animate-pulse' : ''}`}
              style={{
                backgroundColor: 'var(--elevated)',
                boxShadow: isAhAndUpcoming ? '0 0 0 1px var(--text-muted)' : 'none',
                opacity: isAhAndUpcoming ? 0.8 : 0.4,
              }}
            >
              <span
                className="text-sm font-medium"
                style={{
                  color: isAhAndUpcoming ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                }}
              >
                {getLabel(p)}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      {(['A', 'U', 'M'] as const).map((p) => {
        const isDetected = detectedPhoneme === p && !isSilent
        const isExpected = expectedPhoneme === p
        const isMatch = isDetected && isExpected
        const isNextUp = nextPhoneme === p && isUpcoming

        // Determine styling
        let bgColor = 'var(--elevated)'
        let ringStyle = 'none'
        let textColor = 'var(--text-tertiary)'
        let shouldPulse = false

        if (isMatch) {
          // Perfect match - green
          bgColor = 'color-mix(in srgb, var(--color-emerald-500, #10b981) 20%, transparent)'
          ringStyle = '0 0 0 2px var(--color-emerald-500, #10b981)'
          textColor = 'var(--color-emerald-600, #059669)'
        } else if (isDetected && !isExpected && !isInGracePeriod) {
          // Detected but wrong - amber (but NOT during grace period)
          // During grace period, we forgive wrong detection as user is transitioning
          bgColor = 'color-mix(in srgb, var(--color-amber-500, #f59e0b) 15%, transparent)'
          ringStyle = '0 0 0 1px var(--color-amber-500, #f59e0b)'
          textColor = 'var(--color-amber-600, #d97706)'
        } else if (isExpected) {
          // Expected but not detected - subtle outline
          bgColor = 'var(--elevated)'
          ringStyle = '0 0 0 1px var(--text-muted)'
          textColor = 'var(--text-secondary)'
        } else if (isNextUp) {
          // Upcoming phase - subtle pulse to prepare user
          bgColor = 'var(--elevated)'
          ringStyle = '0 0 0 1px var(--text-muted)'
          textColor = 'var(--text-secondary)'
          shouldPulse = true
        }

        return (
          <motion.div
            key={p}
            className={`flex-1 py-2 rounded-lg text-center transition-colors duration-150 ${shouldPulse ? 'animate-pulse' : ''}`}
            style={{
              backgroundColor: bgColor,
              boxShadow: ringStyle,
            }}
            animate={{
              scale: isDetected && !isInGracePeriod ? 1.02 : 1,
            }}
            transition={{ duration: 0.1 }}
          >
            <span
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: textColor }}
            >
              {getLabel(p)}
            </span>
            {/* Confidence indicator for detected phoneme (hidden during grace period) */}
            {isDetected && confidence > 0 && !isInGracePeriod && (
              <motion.div
                className="mt-1 mx-auto rounded-full"
                style={{
                  height: '2px',
                  backgroundColor: isMatch
                    ? 'var(--color-emerald-500, #10b981)'
                    : 'var(--color-amber-500, #f59e0b)',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(100, confidence * 100)}%` }}
                transition={{ duration: 0.15 }}
              />
            )}
          </motion.div>
        )
      })}
    </div>
  )
})

/**
 * Compact phoneme indicator for constrained layouts
 */
export const PhonemeIndicatorCompact = memo(function PhonemeIndicatorCompact({
  detectedPhoneme,
  expectedPhase,
  confidence: _confidence,
}: Omit<PhonemeIndicatorProps, 'isBreathing'>) {
  const expectedPhoneme = phaseToPhoneme(expectedPhase)
  const isSilent = detectedPhoneme === 'silence'
  const isMatch = !isSilent && detectedPhoneme === expectedPhoneme

  if (isSilent || expectedPhoneme === null) {
    return (
      <div
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
        style={{
          backgroundColor: 'var(--elevated)',
          color: 'var(--text-tertiary)',
        }}
      >
        <span>—</span>
      </div>
    )
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: isMatch
          ? 'color-mix(in srgb, var(--color-emerald-500, #10b981) 20%, transparent)'
          : 'color-mix(in srgb, var(--color-amber-500, #f59e0b) 15%, transparent)',
        color: isMatch ? 'var(--color-emerald-600, #059669)' : 'var(--color-amber-600, #d97706)',
      }}
    >
      <span>{getLabel(detectedPhoneme as 'A' | 'U' | 'M')}</span>
      {!isMatch && expectedPhoneme && (
        <>
          <span style={{ opacity: 0.5 }}>→</span>
          <span style={{ opacity: 0.7 }}>{getLabel(expectedPhoneme as 'A' | 'U' | 'M')}</span>
        </>
      )}
    </div>
  )
})
