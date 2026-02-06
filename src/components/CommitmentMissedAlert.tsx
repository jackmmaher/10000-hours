/**
 * CommitmentMissedAlert - Gentle return notice for missed sessions
 *
 * Shows when the app detects missed sessions from previous days.
 * Displays:
 * - Contextual encouragement message
 * - Consistency score
 * - CTA to begin today's session
 */

import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTapFeedback } from '../hooks/useTapFeedback'
import type { MidnightCheckResult } from '../lib/commitment'

interface CommitmentMissedAlertProps {
  result: MidnightCheckResult | null
  onDismiss: () => void
}

export function CommitmentMissedAlert({ result, onDismiss }: CommitmentMissedAlertProps) {
  const haptic = useTapFeedback()

  const handleDismiss = useCallback(() => {
    haptic.light()
    onDismiss()
  }, [haptic, onDismiss])

  // Don't show if no result, no missed days, or no notice
  if (!result || result.missedDaysCount === 0 || !result.notice) {
    return null
  }

  const { encouragement, consistencyScore } = result.notice
  const consistencyPercent = Math.round(consistencyScore * 100)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-20 left-4 right-4 z-40 max-w-md mx-auto"
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div
          className="p-5 rounded-2xl shadow-lg"
          style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* Encouragement message */}
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }}>
            {encouragement}
          </p>

          {/* Consistency score */}
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Consistency: {consistencyPercent}%
          </p>

          {/* Begin session CTA */}
          <button
            onClick={handleDismiss}
            className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-base)',
            }}
          >
            Begin today's session
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
