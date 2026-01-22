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

interface PhonemeIndicatorProps {
  detectedPhoneme: Phoneme
  expectedPhase: CyclePhase
  confidence: number
  isBreathing: boolean
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
 * Check if two phonemes are adjacent (close match)
 */
function areAdjacent(a: Phoneme, b: Phoneme): boolean {
  const order: Phoneme[] = ['silence', 'A', 'U', 'M']
  const indexA = order.indexOf(a)
  const indexB = order.indexOf(b)
  return Math.abs(indexA - indexB) === 1
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
}: PhonemeIndicatorProps) {
  const expectedPhoneme = phaseToPhoneme(expectedPhase)
  const isSilent = detectedPhoneme === 'silence'

  // During breathing phase, show muted indicator
  if (isBreathing) {
    return (
      <div className="flex gap-2 opacity-40">
        {(['A', 'U', 'M'] as const).map((p) => (
          <div
            key={p}
            className="flex-1 py-2 rounded-lg text-center transition-all duration-150"
            style={{ backgroundColor: 'var(--elevated)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
              {getLabel(p)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      {(['A', 'U', 'M'] as const).map((p) => {
        const isDetected = detectedPhoneme === p && !isSilent
        const isExpected = expectedPhoneme === p
        const isMatch = isDetected && isExpected
        // Reserved for future "close match" styling
        void (isDetected && expectedPhoneme !== null && areAdjacent(p, expectedPhoneme))

        // Determine styling
        let bgColor = 'var(--elevated)'
        let ringStyle = 'none'
        let textColor = 'var(--text-tertiary)'

        if (isMatch) {
          // Perfect match - green
          bgColor = 'color-mix(in srgb, var(--color-emerald-500, #10b981) 20%, transparent)'
          ringStyle = '0 0 0 2px var(--color-emerald-500, #10b981)'
          textColor = 'var(--color-emerald-600, #059669)'
        } else if (isDetected && !isExpected) {
          // Detected but wrong - amber
          bgColor = 'color-mix(in srgb, var(--color-amber-500, #f59e0b) 15%, transparent)'
          ringStyle = '0 0 0 1px var(--color-amber-500, #f59e0b)'
          textColor = 'var(--color-amber-600, #d97706)'
        } else if (isExpected) {
          // Expected but not detected - subtle outline
          bgColor = 'var(--elevated)'
          ringStyle = '0 0 0 1px var(--text-muted)'
          textColor = 'var(--text-secondary)'
        }

        return (
          <motion.div
            key={p}
            className="flex-1 py-2 rounded-lg text-center transition-colors duration-150"
            style={{
              backgroundColor: bgColor,
              boxShadow: ringStyle,
            }}
            animate={{
              scale: isDetected ? 1.02 : 1,
            }}
            transition={{ duration: 0.1 }}
          >
            <span
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: textColor }}
            >
              {getLabel(p)}
            </span>
            {/* Confidence indicator for detected phoneme */}
            {isDetected && confidence > 0 && (
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
