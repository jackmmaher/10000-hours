/**
 * Screen 9: Schedule Configuration
 *
 * Split from the original dense ScheduleScreen.
 * Focus: Block window, active days, and reminders
 *
 * "When are you most tempted to reach for them?"
 */

import { motion } from 'framer-motion'
import type { ScreenProps } from '../types'
import { SelectionPill } from '../SelectionPill'
import { Button } from '../../Button'
import { useTapFeedback } from '../../../hooks/useTapFeedback'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ScheduleConfigScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const haptic = useTapFeedback()

  // Format time for display
  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
  }

  // Calculate reminder time (10 min before anchor)
  const anchorTimeStr = formatTime(formState.anchorTimeHour, formState.anchorTimeMinute)
  let reminderHour = formState.anchorTimeHour
  let reminderMinute = formState.anchorTimeMinute - 10
  if (reminderMinute < 0) {
    reminderMinute += 60
    reminderHour -= 1
    if (reminderHour < 0) reminderHour = 23
  }
  const reminderTimeStr = formatTime(reminderHour, reminderMinute)

  const handleScheduleTypeChange = (type: 'weekdays' | 'everyday') => {
    haptic.light()
    updateForm({
      scheduleType: type,
      activeDays:
        type === 'everyday'
          ? [true, true, true, true, true, true, true]
          : [false, true, true, true, true, true, false],
    })
  }

  const toggleDay = (index: number) => {
    haptic.light()
    const newDays = [...formState.activeDays]
    newDays[index] = !newDays[index]
    updateForm({ activeDays: newDays })
  }

  const handleWindowChange = (field: 'startHour' | 'endHour', value: number) => {
    const currentWindow = formState.scheduleWindows[0] || {
      startHour: 7,
      startMinute: 0,
      endHour: 9,
      endMinute: 0,
    }
    updateForm({
      scheduleWindows: [
        {
          ...currentWindow,
          [field]: value,
        },
      ],
    })
  }

  const window = formState.scheduleWindows[0] || {
    startHour: 7,
    startMinute: 0,
    endHour: 9,
    endMinute: 0,
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
        Set your schedule
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-8"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        When should apps be blocked?
      </motion.p>

      {/* Block window */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
          Block window
        </p>

        <div
          className="p-4 rounded-xl"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-3">
            <select
              value={window.startHour}
              onChange={(e) => handleWindowChange('startHour', parseInt(e.target.value))}
              className="flex-1 px-3 py-2 rounded-lg text-sm"
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {formatTime(i, 0).replace(':00', '')}
                </option>
              ))}
            </select>

            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              to
            </span>

            <select
              value={window.endHour}
              onChange={(e) => handleWindowChange('endHour', parseInt(e.target.value))}
              className="flex-1 px-3 py-2 rounded-lg text-sm"
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {formatTime(i, 0).replace(':00', '')}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Your {anchorTimeStr} meditation anchor falls within this window
          </p>
        </div>
      </motion.div>

      {/* Active days */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
          Active days
        </p>

        <div className="flex gap-2 mb-3">
          <SelectionPill
            label="Weekdays"
            selected={formState.scheduleType === 'weekdays'}
            onSelect={() => handleScheduleTypeChange('weekdays')}
          />
          <SelectionPill
            label="Every day"
            selected={formState.scheduleType === 'everyday'}
            onSelect={() => handleScheduleTypeChange('everyday')}
          />
        </div>

        <div className="flex justify-between gap-1">
          {DAY_LABELS.map((label, index) => (
            <button
              key={index}
              onClick={() => toggleDay(index)}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all active:scale-[0.97] touch-manipulation"
              style={{
                background: formState.activeDays[index] ? 'var(--accent)' : 'var(--bg-elevated)',
                border: `1px solid ${formState.activeDays[index] ? 'var(--accent)' : 'var(--border-subtle)'}`,
              }}
            >
              <span
                className="text-sm font-semibold"
                style={{
                  color: formState.activeDays[index]
                    ? 'var(--text-on-accent)'
                    : 'var(--text-primary)',
                }}
              >
                {label}
              </span>
              <span
                className="text-[10px]"
                style={{
                  color: formState.activeDays[index]
                    ? 'color-mix(in oklab, var(--text-on-accent) 70%, transparent)'
                    : 'var(--text-muted)',
                }}
              >
                {DAY_NAMES[index]}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Reminders */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
          Reminders
        </p>

        {/* Morning reminder */}
        <div
          className="flex items-center justify-between p-4 rounded-xl mb-3"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              10 min before anchor
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {reminderTimeStr} (based on your {anchorTimeStr} anchor)
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formState.reminderEnabled}
              onChange={(e) => updateForm({ reminderEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[var(--toggle-thumb)] after:rounded-full after:h-5 after:w-5 after:transition-all"
              style={{
                background: formState.reminderEnabled ? 'var(--accent)' : 'var(--border-subtle)',
              }}
            />
          </label>
        </div>

        {/* Evening reminder */}
        <div
          className="flex items-center justify-between p-4 rounded-xl"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              Evening check-in
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              8:00 PM - Did you meditate today?
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formState.eveningReminderEnabled}
              onChange={(e) => updateForm({ eveningReminderEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[var(--toggle-thumb)] after:rounded-full after:h-5 after:w-5 after:transition-all"
              style={{
                background: formState.eveningReminderEnabled
                  ? 'var(--accent)'
                  : 'var(--border-subtle)',
              }}
            />
          </label>
        </div>
      </motion.div>

      {/* Helper text */}
      <motion.p
        className="text-sm italic mt-6"
        style={{ color: 'var(--text-muted)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        (You can change these settings anytime)
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
