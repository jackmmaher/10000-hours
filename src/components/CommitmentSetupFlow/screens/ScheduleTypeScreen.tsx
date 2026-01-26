/**
 * Screen 3: Schedule Type
 *
 * "How often will you practice?"
 * Options: Daily / Weekday Warrior / Custom Weekly / Flexible Target
 */

import { motion } from 'framer-motion'
import type { ScreenProps } from '../types'
import { Button } from '../../Button'
import { useTapFeedback } from '../../../hooks/useTapFeedback'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const SCHEDULE_OPTIONS = [
  {
    id: 'daily',
    label: 'Daily',
    description: 'Practice every single day',
    icon: '7/7',
  },
  {
    id: 'weekday',
    label: 'Weekday Warrior',
    description: 'Monday through Friday',
    icon: '5/7',
  },
  {
    id: 'custom',
    label: 'Custom Weekly',
    description: 'Choose specific days',
    icon: '?/7',
  },
  {
    id: 'flexible',
    label: 'Flexible Target',
    description: 'X sessions per week, any days',
    icon: 'X/wk',
  },
] as const

export function ScheduleTypeScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const haptic = useTapFeedback()

  const handleScheduleChange = (scheduleType: 'daily' | 'weekday' | 'custom' | 'flexible') => {
    haptic.light()
    updateForm({ scheduleType })

    // Set sensible defaults for each type
    if (scheduleType === 'weekday') {
      updateForm({ customDays: [false, true, true, true, true, true, false] })
    } else if (scheduleType === 'daily') {
      updateForm({ customDays: [true, true, true, true, true, true, true] })
    }
  }

  const handleDayToggle = (dayIndex: number) => {
    haptic.light()
    const newDays = [...formState.customDays]
    newDays[dayIndex] = !newDays[dayIndex]
    updateForm({ customDays: newDays })
  }

  const handleFlexibleTargetChange = (value: number) => {
    updateForm({ flexibleTarget: value })
  }

  const selectedDaysCount = formState.customDays.filter(Boolean).length

  const canProceed = formState.scheduleType !== 'custom' || selectedDaysCount > 0

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
        How often will you practice?
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-8"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Choose a schedule that fits your lifestyle
      </motion.p>

      {/* Schedule options */}
      <motion.div
        className="space-y-3 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {SCHEDULE_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => handleScheduleChange(option.id)}
            className="w-full p-4 rounded-xl text-left transition-all duration-150 ease-out active:scale-[0.99] touch-manipulation"
            style={{
              background:
                formState.scheduleType === option.id
                  ? 'color-mix(in oklab, var(--accent) 10%, transparent)'
                  : 'var(--bg-elevated)',
              border: `1.5px solid ${formState.scheduleType === option.id ? 'var(--accent)' : 'var(--border-subtle)'}`,
            }}
          >
            <div className="flex items-center gap-4">
              {/* Icon badge */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold"
                style={{
                  background:
                    formState.scheduleType === option.id ? 'var(--accent)' : 'var(--bg-base)',
                  color:
                    formState.scheduleType === option.id
                      ? 'var(--text-on-accent)'
                      : 'var(--text-muted)',
                }}
              >
                {option.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {option.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {option.description}
                </p>
              </div>
              {/* Radio indicator */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  border: `2px solid ${formState.scheduleType === option.id ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  background:
                    formState.scheduleType === option.id ? 'var(--accent)' : 'transparent',
                }}
              >
                {formState.scheduleType === option.id && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: 'var(--text-on-accent)' }}
                  />
                )}
              </div>
            </div>
          </button>
        ))}
      </motion.div>

      {/* Custom days picker */}
      {formState.scheduleType === 'custom' && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            Select your practice days
          </p>
          <div className="flex gap-2 justify-between">
            {DAY_NAMES.map((day, index) => (
              <button
                key={day}
                onClick={() => handleDayToggle(index)}
                className="flex-1 py-3 rounded-xl text-xs font-medium transition-all duration-150"
                style={{
                  background: formState.customDays[index] ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: formState.customDays[index]
                    ? 'var(--text-on-accent)'
                    : 'var(--text-muted)',
                  border: `1px solid ${formState.customDays[index] ? 'var(--accent)' : 'var(--border-subtle)'}`,
                }}
              >
                {day}
              </button>
            ))}
          </div>
          <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
            {selectedDaysCount} day{selectedDaysCount !== 1 ? 's' : ''} selected
          </p>
        </motion.div>
      )}

      {/* Flexible target slider */}
      {formState.scheduleType === 'flexible' && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Sessions per week
            </p>
            <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
              {formState.flexibleTarget}
            </p>
          </div>
          <input
            type="range"
            min={1}
            max={7}
            value={formState.flexibleTarget}
            onChange={(e) => handleFlexibleTargetChange(parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((formState.flexibleTarget - 1) / 6) * 100}%, var(--border-subtle) ${((formState.flexibleTarget - 1) / 6) * 100}%, var(--border-subtle) 100%)`,
            }}
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              1
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              7
            </span>
          </div>
          <p className="text-xs mt-2 text-center italic" style={{ color: 'var(--text-muted)' }}>
            Complete on any days you choose
          </p>
        </motion.div>
      )}

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 safe-area-bottom bg-gradient-to-t from-[var(--bg-base)] to-transparent pt-12">
        <div className="max-w-[400px] mx-auto flex gap-3">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button variant="primary" fullWidth onClick={onNext} disabled={!canProceed}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
