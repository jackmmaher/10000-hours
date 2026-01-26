/**
 * CommitmentMissedAlert - Notification for missed commitment sessions
 *
 * Shows when the app detects missed sessions from previous days.
 * Displays:
 * - Number of days missed
 * - Total penalty applied
 * - Option to use grace period (if available)
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

  // Don't show if no result, no missed days, or no penalty
  if (!result || result.missedDays.length === 0) {
    return null
  }

  const totalPenalty = result.missedDays.reduce(
    (sum, day) => sum + Math.abs(day.penalty.minutesChange),
    0
  )
  const dayCount = result.missedDays.length

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
          className="p-4 rounded-2xl shadow-lg"
          style={{
            background: 'var(--bg-base)',
            border: '1px solid color-mix(in oklab, var(--danger, #ef4444) 30%, transparent)',
          }}
        >
          <div className="flex items-start gap-3">
            {/* Warning icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
              style={{
                background: 'color-mix(in oklab, var(--danger, #ef4444) 15%, transparent)',
              }}
            >
              <span role="img" aria-label="warning">
                ⚠️
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Missed {dayCount} commitment {dayCount === 1 ? 'day' : 'days'}
              </h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {totalPenalty > 0 ? (
                  <>
                    <span style={{ color: 'var(--danger, #ef4444)' }}>-{totalPenalty} min</span>{' '}
                    deducted from your hour bank
                  </>
                ) : (
                  'No penalty applied (grace periods used)'
                )}
              </p>
            </div>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
              style={{
                background: 'var(--bg-elevated)',
              }}
            >
              <svg
                className="w-4 h-4"
                style={{ color: 'var(--text-muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Details for multiple days */}
          {dayCount > 1 && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                Breakdown:
              </p>
              <div className="space-y-1">
                {result.missedDays.slice(0, 3).map((day, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {new Date(day.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span style={{ color: 'var(--danger, #ef4444)' }}>
                      -{Math.abs(day.penalty.minutesChange)} min
                    </span>
                  </div>
                ))}
                {dayCount > 3 && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    +{dayCount - 3} more {dayCount - 3 === 1 ? 'day' : 'days'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
