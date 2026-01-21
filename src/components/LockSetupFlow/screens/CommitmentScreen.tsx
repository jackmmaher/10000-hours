/**
 * Screen 4: Commitment Level (Tiny Habits)
 *
 * "How long will you meditate?"
 * Regular commitment: 5, 10, 12, 15, 20, 30, 45, 60 min
 * "On hard days, my minimum is:" 2, 3, 5 min
 */

import { motion } from 'framer-motion'
import type { ScreenProps } from '../types'
import { SelectionPill } from '../SelectionPill'
import { Button } from '../../Button'
import { useTapFeedback } from '../../../hooks/useTapFeedback'

const DURATION_OPTIONS = [5, 10, 12, 15, 20, 30, 45, 60]
const MINIMUM_OPTIONS = [2, 3, 5]

export function CommitmentScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const haptic = useTapFeedback()

  const handleDurationSelect = (minutes: number) => {
    haptic.light()
    updateForm({ unlockDurationMinutes: minutes })
  }

  const handleMinimumSelect = (minutes: number) => {
    haptic.light()
    updateForm({ minimumFallbackMinutes: minutes })
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
        How long will you meditate?
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-8"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Set your regular commitment and a minimum for hard days
      </motion.p>

      {/* Regular commitment */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
          Regular commitment
        </p>
        <div className="grid grid-cols-4 gap-2">
          {DURATION_OPTIONS.map((minutes) => (
            <SelectionPill
              key={minutes}
              label={`${minutes} min`}
              selected={formState.unlockDurationMinutes === minutes}
              onSelect={() => handleDurationSelect(minutes)}
            />
          ))}
        </div>
      </motion.div>

      {/* Minimum fallback */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
          "On hard days, my minimum is:"
        </p>
        <div className="flex flex-wrap gap-2">
          {MINIMUM_OPTIONS.map((minutes) => (
            <SelectionPill
              key={minutes}
              label={`${minutes} min`}
              selected={formState.minimumFallbackMinutes === minutes}
              onSelect={() => handleMinimumSelect(minutes)}
            />
          ))}
        </div>
      </motion.div>

      {/* Helper text */}
      <motion.p
        className="text-sm italic mt-6"
        style={{ color: 'var(--text-muted)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        (Showing up matters more than duration)
      </motion.p>

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
