/**
 * Screen 10: Stakes
 *
 * Clear presentation of risk/reward:
 * - Show up = Safe (with chance of bonus)
 * - Skip = Penalty (guaranteed loss)
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
        How it works
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-8"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Simple rules with real stakes from your hour bank.
      </motion.p>

      {/* SHOW UP = SAFE */}
      <motion.div
        className="p-5 rounded-2xl mb-4"
        style={{
          background: 'color-mix(in oklab, var(--success, #22c55e) 10%, transparent)',
          border: '2px solid color-mix(in oklab, var(--success, #22c55e) 40%, transparent)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center mb-4">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
            style={{ background: 'color-mix(in oklab, var(--success, #22c55e) 20%, transparent)' }}
          >
            <span className="text-2xl">✓</span>
          </div>
          <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Show up = You're safe
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Complete {formState.minimumSessionMinutes}+ min in your window
          </p>
        </div>

        <div
          className="p-3 rounded-xl"
          style={{ background: 'color-mix(in oklab, var(--success, #22c55e) 8%, transparent)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Worst case
            </span>
            <span className="text-sm font-bold" style={{ color: 'var(--success, #22c55e)' }}>
              0 min lost
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              ~{bonusPercent}% chance
            </span>
            <span className="text-sm font-bold" style={{ color: 'var(--success, #22c55e)' }}>
              +{BONUS_MIN_MINUTES}-{BONUS_MAX_MINUTES} min bonus
            </span>
          </div>
        </div>
      </motion.div>

      {/* SKIP = PENALTY */}
      <motion.div
        className="p-5 rounded-2xl mb-6"
        style={{
          background: 'color-mix(in oklab, var(--danger, #ef4444) 10%, transparent)',
          border: '2px solid color-mix(in oklab, var(--danger, #ef4444) 40%, transparent)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="text-center mb-4">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
            style={{ background: 'color-mix(in oklab, var(--danger, #ef4444) 20%, transparent)' }}
          >
            <span className="text-2xl">✗</span>
          </div>
          <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Skip = Penalty
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Miss a required day (no grace periods left)
          </p>
        </div>

        <div
          className="p-3 rounded-xl"
          style={{ background: 'color-mix(in oklab, var(--danger, #ef4444) 8%, transparent)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Guaranteed loss
            </span>
            <span className="text-sm font-bold" style={{ color: 'var(--danger, #ef4444)' }}>
              -{PENALTY_MIN_MINUTES}-{PENALTY_MAX_MINUTES} min
            </span>
          </div>
        </div>
      </motion.div>

      {/* Key insight callout */}
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
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
          <strong>The key:</strong> Just show up. When you meditate, you can never lose time. You
          might win bonus minutes, but you'll never be penalized for completing a session.
        </p>
      </motion.div>

      {/* Grace periods note */}
      <motion.div
        className="flex items-start gap-3 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <span className="text-sm">🛡️</span>
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Grace periods protect you
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            You'll get 3 free passes per month for life's surprises. Use them wisely — they don't
            roll over.
          </p>
        </div>
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
        transition={{ delay: 0.4 }}
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
          I understand the rules
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
