/**
 * Screen 9: What to Expect
 *
 * Warm, honest explanation of how commitment mode works:
 * - Show up → consistency grows
 * - Miss a day → consistency dips, but progress isn't erased
 * - Grace periods → safety net for life's surprises
 * - Full autonomy → pause, adjust, or stop at any time
 */

import { motion } from 'framer-motion'
import type { ScreenProps } from '../types'
import { Button } from '../../Button'

export function StakesScreen({ formState, onNext, onBack }: ScreenProps) {
  const gracePeriods = Math.floor(formState.commitmentDuration / 30) * 3

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
        What to expect
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-8"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Simple, honest rules — no surprises
      </motion.p>

      {/* Show up */}
      <motion.div
        className="flex items-start gap-4 mb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'color-mix(in oklab, var(--success, #22c55e) 15%, transparent)' }}
        >
          <svg
            className="w-5 h-5"
            style={{ color: 'var(--success, #22c55e)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1 pt-1">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Show up
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Your consistency grows. One session at a time, the rhythm builds.
          </p>
        </div>
      </motion.div>

      {/* Miss a day */}
      <motion.div
        className="flex items-start gap-4 mb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'color-mix(in oklab, var(--warning, #f59e0b) 15%, transparent)' }}
        >
          <svg
            className="w-5 h-5"
            style={{ color: 'var(--warning, #f59e0b)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01"
            />
          </svg>
        </div>
        <div className="flex-1 pt-1">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Miss a day
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Your consistency dips, but one miss doesn't erase your progress. 13 out of 14 days is
            still 93%.
          </p>
        </div>
      </motion.div>

      {/* Grace periods */}
      <motion.div
        className="flex items-start gap-4 mb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'color-mix(in oklab, var(--accent) 15%, transparent)' }}
        >
          <svg
            className="w-5 h-5"
            style={{ color: 'var(--accent)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <div className="flex-1 pt-1">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Grace periods
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {gracePeriods} days where missing won't affect your score. For when life gets in the
            way.
          </p>
        </div>
      </motion.div>

      {/* You're in control */}
      <motion.div
        className="flex items-start gap-4 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'color-mix(in oklab, var(--text-muted) 15%, transparent)' }}
        >
          <svg
            className="w-5 h-5"
            style={{ color: 'var(--text-secondary)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
        </div>
        <div className="flex-1 pt-1">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            You're always in control
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            You can pause, adjust your schedule, or stop at any time — no penalties.
          </p>
        </div>
      </motion.div>

      {/* Warm closing note */}
      <motion.div
        className="p-4 rounded-xl"
        style={{
          background: 'color-mix(in oklab, var(--accent) 8%, transparent)',
          border: '1px solid var(--border-subtle)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
          This commitment is a container for your practice, not a cage. The goal is to build a habit
          that outlasts the commitment itself.
        </p>
      </motion.div>

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
