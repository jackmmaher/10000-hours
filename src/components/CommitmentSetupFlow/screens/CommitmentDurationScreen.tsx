/**
 * Screen 6: Commitment Duration
 *
 * "How long will you commit?"
 * Big visual choice: 30 / 60 / 90 days
 * Shows what's at stake and grace periods scale
 */

import { motion } from 'framer-motion'
import type { ScreenProps } from '../types'
import { Button } from '../../Button'
import { useTapFeedback } from '../../../hooks/useTapFeedback'

const DURATION_OPTIONS: Array<{
  days: 30 | 60 | 90
  label: string
  description: string
  gracePeriods: number
  exitCostHours: number
}> = [
  {
    days: 30,
    label: '30 Days',
    description: 'Build the foundation',
    gracePeriods: 3,
    exitCostHours: 1,
  },
  {
    days: 60,
    label: '60 Days',
    description: 'Solidify the habit',
    gracePeriods: 6,
    exitCostHours: 2,
  },
  {
    days: 90,
    label: '90 Days',
    description: 'Transform your practice',
    gracePeriods: 9,
    exitCostHours: 3,
  },
]

export function CommitmentDurationScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const haptic = useTapFeedback()

  const handleDurationSelect = (duration: 30 | 60 | 90) => {
    haptic.medium()
    updateForm({ commitmentDuration: duration })

    // Update grace period count based on duration
    const gracePeriods = Math.floor(duration / 30) * 3
    updateForm({ gracePeriodCount: gracePeriods })
  }

  const selectedOption = DURATION_OPTIONS.find((o) => o.days === formState.commitmentDuration)

  return (
    <div className="pt-8 pb-32">
      {/* Title */}
      <motion.h1
        className="font-serif text-2xl mb-2"
        style={{ color: 'var(--text-primary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        How long will you commit?
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-8"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Longer commitments build stronger habits
      </motion.p>

      {/* Duration cards */}
      <motion.div
        className="space-y-4 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {DURATION_OPTIONS.map((option) => {
          const isSelected = formState.commitmentDuration === option.days
          return (
            <button
              key={option.days}
              onClick={() => handleDurationSelect(option.days)}
              className="w-full p-5 rounded-2xl text-left transition-all duration-200 ease-out active:scale-[0.98] touch-manipulation"
              style={{
                background: isSelected
                  ? 'color-mix(in oklab, var(--accent) 12%, transparent)'
                  : 'var(--bg-elevated)',
                border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border-subtle)'}`,
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-2xl font-serif font-bold"
                    style={{ color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}
                  >
                    {option.label}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {option.description}
                  </p>
                </div>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    background: isSelected ? 'var(--accent)' : 'transparent',
                  }}
                >
                  {isSelected && (
                    <svg
                      className="w-4 h-4"
                      style={{ color: 'var(--text-on-accent)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div
                className="flex gap-4 mt-4 pt-4 border-t"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Grace periods
                  </p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {option.gracePeriods}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Emergency exit cost
                  </p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {option.exitCostHours}h maximum
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </motion.div>

      {/* Selection summary */}
      {selectedOption && (
        <motion.div
          className="p-4 rounded-xl"
          style={{
            background: 'color-mix(in oklab, var(--accent) 8%, transparent)',
            border: '1px solid var(--accent)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            You'll have <strong>{selectedOption.gracePeriods} grace periods</strong> to use when
            life gets in the way. If you need to exit early, the maximum cost is{' '}
            <strong>
              {selectedOption.exitCostHours} hour{selectedOption.exitCostHours > 1 ? 's' : ''}
            </strong>{' '}
            from your bank.
          </p>
        </motion.div>
      )}

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 safe-area-bottom bg-gradient-to-t from-[var(--bg-base)] to-transparent pt-12">
        <div className="max-w-[400px] mx-auto flex gap-3">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button variant="primary" fullWidth onClick={onNext}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
