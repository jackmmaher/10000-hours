/**
 * Screen 11: Summary & Activation
 *
 * Final screen with:
 * - Fresh start date selection
 * - Complete summary of all selections
 * - Activate Focus Mode button
 *
 * "Review your commitment"
 */

import { motion } from 'framer-motion'
import type { ScreenProps } from '../types'
import { Button } from '../../Button'
import { useTapFeedback } from '../../../hooks/useTapFeedback'

type FreshStartOption = 'today' | 'tomorrow' | 'next-monday' | 'first-of-month'

export function SummaryScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const haptic = useTapFeedback()

  // Calculate actual dates dynamically
  const today = new Date()

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const nextMonday = new Date(today)
  const daysUntilMonday = (8 - today.getDay()) % 7 || 7
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday)

  const firstOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

  // Format date for display
  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateLong = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  // Fresh start date options
  const freshStartOptions: { id: FreshStartOption; label: string; date: Date }[] = [
    { id: 'today', label: 'Today', date: today },
    { id: 'tomorrow', label: 'Tomorrow', date: tomorrow },
    { id: 'next-monday', label: 'Next Monday', date: nextMonday },
    { id: 'first-of-month', label: 'First of month', date: firstOfMonth },
  ]

  // Get current fresh start selection
  const getCurrentFreshStart = (): FreshStartOption => {
    if (formState.activationDate === 0) return 'today'
    const savedDate = new Date(formState.activationDate)
    const savedDateStr = savedDate.toDateString()

    if (savedDateStr === today.toDateString()) return 'today'
    if (savedDateStr === tomorrow.toDateString()) return 'tomorrow'
    if (savedDateStr === nextMonday.toDateString()) return 'next-monday'
    if (savedDateStr === firstOfMonth.toDateString()) return 'first-of-month'
    return 'today'
  }

  const handleFreshStartSelect = (option: FreshStartOption) => {
    haptic.light()
    const dateMap: Record<FreshStartOption, Date> = {
      today,
      tomorrow,
      'next-monday': nextMonday,
      'first-of-month': firstOfMonth,
    }
    updateForm({ activationDate: dateMap[option].getTime() })
  }

  // Format anchor time for display
  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
  }

  const selectedFreshStart = getCurrentFreshStart()
  const selectedDate = freshStartOptions.find((o) => o.id === selectedFreshStart)?.date || today
  const anchorTimeStr = formatTime(formState.anchorTimeHour, formState.anchorTimeMinute)

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
        You're ready
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm mb-6"
        style={{ color: 'var(--text-secondary)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Review your commitment before activating
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
        {/* Identity */}
        <div className="mb-4">
          <p
            className="text-xs uppercase tracking-wide mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Identity
          </p>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            "I am becoming someone who{' '}
            <span style={{ color: 'var(--accent)' }}>{formState.identityStatement}</span>"
          </p>
        </div>

        {/* Anchor */}
        <div className="mb-4">
          <p
            className="text-xs uppercase tracking-wide mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Trigger
          </p>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            After <span style={{ color: 'var(--accent)' }}>{formState.anchorRoutine}</span> at{' '}
            <span style={{ color: 'var(--accent)' }}>{anchorTimeStr}</span>
          </p>
        </div>

        {/* Duration */}
        <div className="mb-4">
          <p
            className="text-xs uppercase tracking-wide mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Commitment
          </p>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--accent)' }}>{formState.unlockDurationMinutes} min</span>{' '}
            daily (min:{' '}
            <span style={{ color: 'var(--accent)' }}>{formState.minimumFallbackMinutes} min</span>)
          </p>
        </div>

        {/* Apps */}
        <div className="mb-4">
          <p
            className="text-xs uppercase tracking-wide mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Blocked until you meditate
          </p>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--accent)' }}>
              {formState.appsToBlock.length > 0
                ? formState.appsToBlock.join(', ')
                : 'No apps selected'}
            </span>
          </p>
        </div>

        {/* Safety */}
        <div>
          <p
            className="text-xs uppercase tracking-wide mb-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Safety net
          </p>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {formState.streakFreezesPerMonth} emergency skip
            {formState.streakFreezesPerMonth > 1 ? 's' : ''}/month
            {formState.gracePeriodMinutes && ` | ${formState.gracePeriodMinutes}min grace`}
            {formState.safetyAutoUnlockHours &&
              ` | ${formState.safetyAutoUnlockHours}hr auto-unlock`}
          </p>
        </div>
      </motion.div>

      {/* Fresh start date */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          When do you want to start?
        </p>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          Research shows Mondays and month starts boost success
        </p>

        <div className="grid grid-cols-2 gap-2">
          {freshStartOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleFreshStartSelect(option.id)}
              className="p-3 rounded-xl text-left transition-all duration-150 active:scale-[0.98] touch-manipulation"
              style={{
                background:
                  selectedFreshStart === option.id
                    ? 'color-mix(in oklab, var(--accent) 12%, transparent)'
                    : 'var(--bg-elevated)',
                border: `1.5px solid ${selectedFreshStart === option.id ? 'var(--accent)' : 'var(--border-subtle)'}`,
                boxShadow: selectedFreshStart === option.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {option.label}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {formatDateShort(option.date)}
              </p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Activation date highlight */}
      <motion.div
        className="p-4 rounded-xl text-center mb-6"
        style={{
          background: 'color-mix(in oklab, var(--accent) 10%, transparent)',
          border: '1px solid var(--accent)',
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
          Starting
        </p>
        <p className="text-lg font-medium" style={{ color: 'var(--accent)' }}>
          {formatDateLong(selectedDate)}
        </p>
      </motion.div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 safe-area-bottom bg-gradient-to-t from-[var(--bg-base)] to-transparent pt-12">
        <div className="max-w-[400px] mx-auto flex gap-3">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button variant="primary" fullWidth onClick={onNext}>
            Activate Focus Mode
          </Button>
        </div>
      </div>
    </div>
  )
}
