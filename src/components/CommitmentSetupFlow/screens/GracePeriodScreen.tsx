/**
 * Screen 9: Grace Periods & Safety
 *
 * Explains grace periods (3 per 30 days)
 * Explains emergency exit option
 */

import { motion } from 'framer-motion'
import type { ScreenProps } from '../types'
import { Button } from '../../Button'

export function GracePeriodScreen({ formState, onNext, onBack }: ScreenProps) {
  const gracePeriods = Math.floor(formState.commitmentDuration / 30) * 3
  const emergencyExitCost = Math.floor(formState.commitmentDuration / 30)

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
        Life happens. We've got you.
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-8"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Built-in forgiveness keeps you on track
      </motion.p>

      {/* Grace Periods Card */}
      <motion.div
        className="p-5 rounded-2xl mb-4"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
            style={{ background: 'color-mix(in oklab, var(--accent) 15%, transparent)' }}
          >
            <span role="img" aria-label="shield">
              🛡
            </span>
          </div>
          <div className="flex-1">
            <p className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              {gracePeriods} Grace Periods
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Skip a day without penalty. Use them when you're sick, traveling, or life throws you a
              curveball. They don't roll over — use them or lose them.
            </p>
          </div>
        </div>

        {/* Visual grace period indicators */}
        <div
          className="flex gap-2 mt-4 pt-4 border-t"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {Array.from({ length: gracePeriods }, (_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{
                background: 'var(--accent)',
                color: 'var(--text-on-accent)',
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Emergency Exit Card */}
      <motion.div
        className="p-5 rounded-2xl mb-4"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
            style={{ background: 'color-mix(in oklab, var(--danger, #ef4444) 15%, transparent)' }}
          >
            <span role="img" aria-label="exit">
              🚪
            </span>
          </div>
          <div className="flex-1">
            <p className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Emergency Exit
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Need to end your commitment early? You can, but it costs up to{' '}
              <strong>
                {emergencyExitCost} hour{emergencyExitCost > 1 ? 's' : ''}
              </strong>{' '}
              from your bank. The cost decreases as you progress through your commitment.
            </p>
          </div>
        </div>
      </motion.div>

      {/* How it works */}
      <motion.div
        className="p-4 rounded-xl"
        style={{
          background: 'color-mix(in oklab, var(--accent) 8%, transparent)',
          border: '1px solid var(--border-subtle)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
          HOW IT WORKS
        </p>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--text-primary)' }}>
          <li className="flex gap-2">
            <span style={{ color: 'var(--accent)' }}>•</span>
            <span>Miss a day? Tap "Use Grace Period" before midnight</span>
          </li>
          <li className="flex gap-2">
            <span style={{ color: 'var(--accent)' }}>•</span>
            <span>No grace periods left? Missing a day costs 25-50 minutes</span>
          </li>
          <li className="flex gap-2">
            <span style={{ color: 'var(--accent)' }}>•</span>
            <span>Emergency exit is always available in Settings</span>
          </li>
        </ul>
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
