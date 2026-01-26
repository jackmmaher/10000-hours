/**
 * Screen 4: Practice Window
 *
 * "When can you practice?"
 * Options: Anytime / Morning (5am-12pm) / Specific window
 *
 * Adapted from AnchorTimeScreen in LockSetupFlow
 */

import { motion } from 'framer-motion'
import type { ScreenProps } from '../types'
import { Button } from '../../Button'
import { useTapFeedback } from '../../../hooks/useTapFeedback'

const WINDOW_OPTIONS = [
  {
    id: 'anytime',
    label: 'Anytime',
    description: 'Complete your session any time of day',
  },
  {
    id: 'morning',
    label: 'Morning',
    description: '5:00 AM - 12:00 PM',
  },
  {
    id: 'specific',
    label: 'Specific window',
    description: 'Set a custom time range',
  },
] as const

export function WindowScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const haptic = useTapFeedback()

  const handleWindowTypeChange = (windowType: 'anytime' | 'morning' | 'specific') => {
    haptic.light()
    updateForm({ windowType })

    // Set default times for morning
    if (windowType === 'morning') {
      updateForm({
        windowStartHour: 5,
        windowStartMinute: 0,
        windowEndHour: 12,
        windowEndMinute: 0,
      })
    }
  }

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
  }

  const handleTimeChange = (
    field: 'windowStartHour' | 'windowStartMinute' | 'windowEndHour' | 'windowEndMinute',
    value: number
  ) => {
    updateForm({ [field]: value })
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
        When can you practice?
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-8"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Sessions outside this window won't count toward your commitment
      </motion.p>

      {/* Window type options */}
      <motion.div
        className="space-y-3 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {WINDOW_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => handleWindowTypeChange(option.id)}
            className="w-full p-4 rounded-xl text-left transition-all duration-150 ease-out active:scale-[0.99] touch-manipulation"
            style={{
              background:
                formState.windowType === option.id
                  ? 'color-mix(in oklab, var(--accent) 10%, transparent)'
                  : 'var(--bg-elevated)',
              border: `1.5px solid ${formState.windowType === option.id ? 'var(--accent)' : 'var(--border-subtle)'}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  border: `2px solid ${formState.windowType === option.id ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  background: formState.windowType === option.id ? 'var(--accent)' : 'transparent',
                }}
              >
                {formState.windowType === option.id && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: 'var(--text-on-accent)' }}
                  />
                )}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {option.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {option.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </motion.div>

      {/* Specific time picker */}
      {formState.windowType === 'specific' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Start time
              </p>
              <p className="text-sm" style={{ color: 'var(--accent)' }}>
                {formatTime(formState.windowStartHour, formState.windowStartMinute)}
              </p>
            </div>

            <div className="flex gap-3">
              <select
                value={formState.windowStartHour}
                onChange={(e) => handleTimeChange('windowStartHour', parseInt(e.target.value))}
                className="flex-1 px-3 py-2 rounded-lg text-sm"
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                  </option>
                ))}
              </select>
              <select
                value={formState.windowStartMinute}
                onChange={(e) => handleTimeChange('windowStartMinute', parseInt(e.target.value))}
                className="w-20 px-3 py-2 rounded-lg text-sm"
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                {[0, 15, 30, 45].map((min) => (
                  <option key={min} value={min}>
                    :{min.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            className="p-4 rounded-xl"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                End time
              </p>
              <p className="text-sm" style={{ color: 'var(--accent)' }}>
                {formatTime(formState.windowEndHour, formState.windowEndMinute)}
              </p>
            </div>

            <div className="flex gap-3">
              <select
                value={formState.windowEndHour}
                onChange={(e) => handleTimeChange('windowEndHour', parseInt(e.target.value))}
                className="flex-1 px-3 py-2 rounded-lg text-sm"
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                  </option>
                ))}
              </select>
              <select
                value={formState.windowEndMinute}
                onChange={(e) => handleTimeChange('windowEndMinute', parseInt(e.target.value))}
                className="w-20 px-3 py-2 rounded-lg text-sm"
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                {[0, 15, 30, 45].map((min) => (
                  <option key={min} value={min}>
                    :{min.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Helper text */}
      <motion.p
        className="text-sm italic mt-6"
        style={{ color: 'var(--text-muted)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        (Consistent timing builds stronger habits)
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
