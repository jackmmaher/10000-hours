/**
 * Screen 5: Minimum Session Duration
 *
 * "How long will you commit to?"
 * Main duration + "hard day" minimum fallback
 *
 * Adapted from CommitmentScreen in LockSetupFlow
 */

import { motion } from 'framer-motion'
import type { ScreenProps } from '../types'
import { SelectionPill } from '../SelectionPill'
import { Button } from '../../Button'
import { useTapFeedback } from '../../../hooks/useTapFeedback'

const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60]
const FALLBACK_OPTIONS = [2, 3, 5]

export function MinSessionScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const haptic = useTapFeedback()

  const handleDurationSelect = (minutes: number) => {
    haptic.light()
    updateForm({ minimumSessionMinutes: minutes })
  }

  const handleFallbackSelect = (minutes: number) => {
    haptic.light()
    updateForm({ minimumFallbackMinutes: minutes })
  }

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) return `${minutes / 60}h`
    return `${minutes} min`
  }

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
        How long will you commit to?
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-8"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Sessions shorter than this won't count toward your commitment
      </motion.p>

      {/* Main duration */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          Minimum session length
        </p>

        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((minutes) => (
            <SelectionPill
              key={minutes}
              label={formatDuration(minutes)}
              selected={formState.minimumSessionMinutes === minutes}
              onSelect={() => handleDurationSelect(minutes)}
            />
          ))}
        </div>

        {/* Current selection highlight */}
        <div
          className="mt-4 p-4 rounded-xl text-center"
          style={{
            background: 'color-mix(in oklab, var(--accent) 8%, transparent)',
            border: '1px solid var(--accent)',
          }}
        >
          <p className="text-2xl font-serif" style={{ color: 'var(--accent)' }}>
            {formState.minimumSessionMinutes} minutes
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            per session to count
          </p>
        </div>
      </motion.div>

      {/* Hard day fallback */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          "Hard day" minimum
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          On tough days, this shorter session still counts
        </p>

        <div className="flex flex-wrap gap-2">
          {FALLBACK_OPTIONS.map((minutes) => (
            <SelectionPill
              key={minutes}
              label={`${minutes} min`}
              selected={formState.minimumFallbackMinutes === minutes}
              onSelect={() => handleFallbackSelect(minutes)}
            />
          ))}
        </div>

        <p className="text-xs mt-3 italic" style={{ color: 'var(--text-muted)' }}>
          (Use this option in your obstacle plan: "If I'm running late, I'll do my{' '}
          {formState.minimumFallbackMinutes}-min minimum")
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
