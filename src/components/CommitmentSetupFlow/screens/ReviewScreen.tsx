/**
 * Screen 12: Review & Launch
 *
 * Full summary of commitment settings
 * End behavior selection
 * Activation button
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ScreenProps } from '../types'
import { SelectionPill } from '../SelectionPill'
import { Button } from '../../Button'
import { useTapFeedback } from '../../../hooks/useTapFeedback'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const END_BEHAVIOR_OPTIONS = [
  {
    id: 'auto-renew',
    label: 'Auto-renew',
    description: 'Start a new commitment automatically',
  },
  {
    id: 'extend-adjust',
    label: 'Extend & adjust',
    description: 'Review and modify settings',
  },
  {
    id: 'cool-off',
    label: 'Cool-off period',
    description: 'Take a break before recommitting',
  },
] as const

export function ReviewScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const haptic = useTapFeedback()
  const [isActivating, setIsActivating] = useState(false)

  const handleEndBehaviorChange = (behavior: 'auto-renew' | 'extend-adjust' | 'cool-off') => {
    haptic.light()
    updateForm({ endBehavior: behavior })
  }

  const handleActivate = async () => {
    haptic.success()
    setIsActivating(true)

    // Set activation date to now
    updateForm({ activationDate: Date.now() })

    // Small delay for visual feedback before completing
    await new Promise((resolve) => setTimeout(resolve, 300))

    onNext()
  }

  const formatSchedule = () => {
    switch (formState.scheduleType) {
      case 'daily':
        return 'Every day'
      case 'weekday':
        return 'Weekdays (Mon-Fri)'
      case 'custom': {
        const days = formState.customDays
          .map((active, i) => (active ? DAY_NAMES[i] : null))
          .filter(Boolean)
        return days.join(', ')
      }
      case 'flexible':
        return `${formState.flexibleTarget} sessions per week`
      default:
        return ''
    }
  }

  const formatWindow = () => {
    switch (formState.windowType) {
      case 'anytime':
        return 'Anytime'
      case 'morning':
        return '5:00 AM - 12:00 PM'
      case 'specific': {
        const formatTime = (hour: number, minute: number) => {
          const period = hour >= 12 ? 'PM' : 'AM'
          const displayHour = hour % 12 || 12
          return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
        }
        return `${formatTime(formState.windowStartHour, formState.windowStartMinute)} - ${formatTime(formState.windowEndHour, formState.windowEndMinute)}`
      }
      default:
        return ''
    }
  }

  const endDate = new Date(Date.now() + formState.commitmentDuration * 24 * 60 * 60 * 1000)
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
        Ready to commit?
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-8"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Review your commitment details
      </motion.p>

      {/* Summary card */}
      <motion.div
        className="p-5 rounded-2xl mb-6"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Duration header */}
        <div
          className="text-center pb-4 mb-4 border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <p className="text-4xl font-serif font-bold" style={{ color: 'var(--accent)' }}>
            {formState.commitmentDuration} Days
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Ends{' '}
            {endDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Details grid */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Schedule
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {formatSchedule()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Window
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {formatWindow()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Min session
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {formState.minimumSessionMinutes} min
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Grace periods
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {gracePeriods}
            </span>
          </div>
          {formState.identityStatement && (
            <div className="pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Identity
              </span>
              <p className="text-sm mt-1 italic" style={{ color: 'var(--text-primary)' }}>
                "I am becoming someone who {formState.identityStatement}"
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* End behavior */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
          When this commitment ends...
        </p>
        <div className="flex flex-wrap gap-2">
          {END_BEHAVIOR_OPTIONS.map((option) => (
            <SelectionPill
              key={option.id}
              label={option.label}
              selected={formState.endBehavior === option.id}
              onSelect={() => handleEndBehaviorChange(option.id)}
            />
          ))}
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          {END_BEHAVIOR_OPTIONS.find((o) => o.id === formState.endBehavior)?.description}
        </p>
      </motion.div>

      {/* Commitment statement */}
      <motion.div
        className="p-4 rounded-xl"
        style={{
          background: 'color-mix(in oklab, var(--accent) 8%, transparent)',
          border: '1px solid var(--accent)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm text-center" style={{ color: 'var(--text-primary)' }}>
          By activating, I commit to practicing meditation for{' '}
          <strong>{formState.commitmentDuration} days</strong>. I understand that missing sessions
          will cost me time from my hour bank.
        </p>
      </motion.div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 safe-area-bottom bg-gradient-to-t from-[var(--bg-base)] to-transparent pt-12">
        <div className="max-w-[400px] mx-auto flex gap-3">
          <Button variant="ghost" onClick={onBack} disabled={isActivating}>
            Back
          </Button>
          <Button variant="primary" fullWidth onClick={handleActivate} disabled={isActivating}>
            {isActivating ? 'Activating...' : 'Activate Commitment'}
          </Button>
        </div>
      </div>
    </div>
  )
}
