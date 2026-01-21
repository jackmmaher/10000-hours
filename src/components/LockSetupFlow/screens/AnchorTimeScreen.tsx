/**
 * Screen 3: Anchor Time
 *
 * Split from the original dense AnchorScreen.
 * Focus: Time picker and backup anchor (2 related decisions)
 *
 * "When do you usually [anchor]?"
 * "If I miss my anchor, I will meditate after..."
 */

import { motion } from 'framer-motion'
import type { ScreenProps } from '../types'
import { SelectionPill } from '../SelectionPill'
import { TimePicker } from '../TimePicker'
import { Button } from '../../Button'
import { useTapFeedback } from '../../../hooks/useTapFeedback'

const BACKUP_OPTIONS = ['lunch', 'dinner']

export function AnchorTimeScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const haptic = useTapFeedback()

  const handleHourChange = (hour: number) => {
    updateForm({ anchorTimeHour: hour })
  }

  const handleMinuteChange = (minute: number) => {
    updateForm({ anchorTimeMinute: minute })
  }

  const handleBackupSelect = (backup: string | null) => {
    haptic.light()
    updateForm({ backupAnchor: backup })
  }

  // Format anchor for display
  const anchorDisplay = formState.anchorRoutine || 'do this'

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
        Set your time
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-8"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        When does your anchor typically happen?
      </motion.p>

      {/* Time picker */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-base mb-4" style={{ color: 'var(--text-primary)' }}>
          "When do you usually <span style={{ color: 'var(--accent)' }}>{anchorDisplay}</span>?"
        </p>

        <TimePicker
          hour={formState.anchorTimeHour}
          minute={formState.anchorTimeMinute}
          onHourChange={handleHourChange}
          onMinuteChange={handleMinuteChange}
        />
      </motion.div>

      {/* Backup anchor */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-base mb-4" style={{ color: 'var(--text-primary)' }}>
          "If I miss my anchor, I will meditate after..."
        </p>

        <div className="flex flex-wrap gap-2">
          {BACKUP_OPTIONS.map((option) => (
            <SelectionPill
              key={option}
              label={option}
              selected={formState.backupAnchor === option}
              onSelect={() => handleBackupSelect(option)}
            />
          ))}
          <SelectionPill
            label="Skip backup"
            selected={formState.backupAnchor === null}
            onSelect={() => handleBackupSelect(null)}
          />
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
        (A backup plan catches the days life gets in the way)
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
