/**
 * Screen 10: Stakes
 *
 * Show penalty/bonus math visualization
 * "I understand" confirmation required
 */

import { motion } from 'framer-motion'
import type { ScreenProps } from '../types'
import { Button } from '../../Button'
import { useTapFeedback } from '../../../hooks/useTapFeedback'
import {
  BONUS_PROBABILITY,
  MYSTERY_PROBABILITY,
  BONUS_MIN_MINUTES,
  BONUS_MAX_MINUTES,
  PENALTY_MIN_MINUTES,
  PENALTY_MAX_MINUTES,
} from '../../../lib/commitment'

export function StakesScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const haptic = useTapFeedback()

  const handleAcknowledge = () => {
    haptic.medium()
    updateForm({ stakesAcknowledged: true })
  }

  const bonusPercent = Math.round((BONUS_PROBABILITY + MYSTERY_PROBABILITY) * 100)

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
        The stakes
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-8"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Your hour bank is on the line. Here's how it works.
      </motion.p>

      {/* Complete a session - rewards */}
      <motion.div
        className="p-5 rounded-2xl mb-4"
        style={{
          background: 'color-mix(in oklab, var(--success, #22c55e) 10%, transparent)',
          border: '1px solid color-mix(in oklab, var(--success, #22c55e) 30%, transparent)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">✓</div>
          <div>
            <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
              Complete a session
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {formState.minimumSessionMinutes}+ minutes within your window
            </p>
          </div>
        </div>

        <div className="space-y-3 pl-9">
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              ~{bonusPercent}% chance of bonus
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--success, #22c55e)' }}>
              +{BONUS_MIN_MINUTES}-{BONUS_MAX_MINUTES} min
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              ~25% "so close!" (no penalty)
            </span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              0 min
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Rest of completions
            </span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              0 min
            </span>
          </div>
        </div>
      </motion.div>

      {/* Miss a session - penalties */}
      <motion.div
        className="p-5 rounded-2xl mb-6"
        style={{
          background: 'color-mix(in oklab, var(--danger, #ef4444) 10%, transparent)',
          border: '1px solid color-mix(in oklab, var(--danger, #ef4444) 30%, transparent)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">✗</div>
          <div>
            <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
              Miss a required session
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              No grace periods remaining
            </p>
          </div>
        </div>

        <div className="pl-9">
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Penalty deducted
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--danger, #ef4444)' }}>
              -{PENALTY_MIN_MINUTES}-{PENALTY_MAX_MINUTES} min
            </span>
          </div>
        </div>
      </motion.div>

      {/* Break-even explanation */}
      <motion.div
        className="p-4 rounded-xl mb-6"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
          THE MATH
        </p>
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
          Complete ~90% of your sessions and you'll break even. The bonuses are real — but so are
          the penalties. The house has a slight edge, but <strong>you gain the habit</strong>.
        </p>
      </motion.div>

      {/* Acknowledgment checkbox */}
      <motion.button
        onClick={handleAcknowledge}
        className="w-full p-4 rounded-xl text-left transition-all duration-150 flex items-center gap-3 active:scale-[0.99]"
        style={{
          background: formState.stakesAcknowledged
            ? 'color-mix(in oklab, var(--accent) 10%, transparent)'
            : 'var(--bg-elevated)',
          border: `2px solid ${formState.stakesAcknowledged ? 'var(--accent)' : 'var(--border-subtle)'}`,
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
          style={{
            border: `2px solid ${formState.stakesAcknowledged ? 'var(--accent)' : 'var(--border-subtle)'}`,
            background: formState.stakesAcknowledged ? 'var(--accent)' : 'transparent',
          }}
        >
          {formState.stakesAcknowledged && (
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
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          I understand and accept the stakes
        </span>
      </motion.button>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 safe-area-bottom bg-gradient-to-t from-[var(--bg-base)] to-transparent pt-12">
        <div className="max-w-[400px] mx-auto flex gap-3">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={onNext}
            disabled={!formState.stakesAcknowledged}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
