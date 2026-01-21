/**
 * Screen 10: Safety Settings
 *
 * Split from the original dense FreshStartScreen.
 * Focus: Emergency skips, grace period, safety auto-unlock
 *
 * "Build in flexibility for hard days"
 */

import { motion } from 'framer-motion'
import type { ScreenProps } from '../types'
import { SelectionPill } from '../SelectionPill'
import { Button } from '../../Button'
import { useTapFeedback } from '../../../hooks/useTapFeedback'

export function SafetySettingsScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const haptic = useTapFeedback()

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
        Your safety net
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-8"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Build in flexibility for hard days
      </motion.p>

      {/* Emergency skips */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Emergency skips per month
        </p>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          Use sparingly - these reset on the 1st
        </p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 5].map((count) => (
            <SelectionPill
              key={count}
              label={`${count} skip${count > 1 ? 's' : ''}`}
              selected={formState.streakFreezesPerMonth === count}
              onSelect={() => {
                haptic.light()
                updateForm({ streakFreezesPerMonth: count })
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Grace period */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Grace period after anchor time
        </p>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          Extra time before the lock fully engages
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { value: null, label: 'None' },
            { value: 30, label: '30 min' },
            { value: 60, label: '1 hour' },
            { value: 120, label: '2 hours' },
          ].map((option) => (
            <SelectionPill
              key={option.label}
              label={option.label}
              selected={formState.gracePeriodMinutes === option.value}
              onSelect={() => {
                haptic.light()
                updateForm({ gracePeriodMinutes: option.value })
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Safety auto-unlock */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Safety auto-unlock
        </p>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          Apps unlock automatically after this time (for emergencies)
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 2, label: '2 hours (recommended)', recommended: true },
            { value: 4, label: '4 hours', recommended: false },
            { value: null, label: 'No auto-unlock', recommended: false },
          ].map((option) => (
            <SelectionPill
              key={option.label}
              label={option.label}
              selected={formState.safetyAutoUnlockHours === option.value}
              onSelect={() => {
                haptic.light()
                updateForm({ safetyAutoUnlockHours: option.value })
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Reassurance message */}
      <motion.div
        className="mt-8 p-4 rounded-xl"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm italic text-center" style={{ color: 'var(--text-muted)' }}>
          "If you miss a day, that's okay. Every day is a fresh start. What matters is showing up
          again tomorrow."
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
