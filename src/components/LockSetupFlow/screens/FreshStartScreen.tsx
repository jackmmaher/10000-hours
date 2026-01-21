/**
 * Screen 8: Forgiveness & Fresh Start
 *
 * Final screen with:
 * - Emergency skips selector (1/2/3/5 per month)
 * - Grace period selector (None/30 min/1 hour/2 hours)
 * - Safety auto-unlock selector (2 hours/4 hours/No auto-unlock)
 * - Fresh start date selector with actual calculated dates
 * - Summary card showing all commitments
 * - Forgiveness message
 *
 * CRITICAL: Dates must be calculated from actual current date,
 * not hardcoded. This is a verification gate requirement.
 */

import type { ScreenProps } from '../types'
import { SelectionPill } from '../SelectionPill'
import { Button } from '../../Button'
import { useTapFeedback } from '../../../hooks/useTapFeedback'

// Fresh start date options with dynamic date calculation
type FreshStartOption = 'tomorrow' | 'next-monday' | 'first-of-month' | 'today'

export function FreshStartScreen({ formState, updateForm, onNext, onBack }: ScreenProps) {
  const haptic = useTapFeedback()

  // Calculate actual dates dynamically
  const today = new Date()

  // Tomorrow
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Next Monday
  const nextMonday = new Date(today)
  const daysUntilMonday = (8 - today.getDay()) % 7 || 7 // If today is Monday, get next Monday
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday)

  // First of next month
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

  // Format date for display
  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  // Fresh start date options with actual dates
  const freshStartOptions = [
    { id: 'today' as FreshStartOption, label: 'Today', date: today },
    {
      id: 'tomorrow' as FreshStartOption,
      label: `Tomorrow`,
      sublabel: formatDateDisplay(tomorrow),
      date: tomorrow,
    },
    {
      id: 'next-monday' as FreshStartOption,
      label: 'Next Monday',
      sublabel: formatDateDisplay(nextMonday),
      date: nextMonday,
    },
    {
      id: 'first-of-month' as FreshStartOption,
      label: 'First of month',
      sublabel: formatDateDisplay(firstOfMonth),
      date: firstOfMonth,
    },
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

  const anchorTimeStr = formatTime(formState.anchorTimeHour, formState.anchorTimeMinute)
  const selectedFreshStart = getCurrentFreshStart()
  const selectedDate = freshStartOptions.find((o) => o.id === selectedFreshStart)?.date || today

  return (
    <div className="pt-8 pb-32">
      {/* Title */}
      <h1 className="font-serif text-2xl mb-4" style={{ color: 'var(--text-primary)' }}>
        Forgiveness & Fresh Start
      </h1>

      {/* Subtitle */}
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Build in flexibility for hard days
      </p>

      {/* Emergency skips */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Emergency skips per month
        </p>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          Use sparingly — these reset on the 1st
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
      </div>

      {/* Grace period */}
      <div className="mb-6">
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
      </div>

      {/* Safety auto-unlock */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Safety auto-unlock
        </p>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          Apps unlock automatically after this time (for emergencies)
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 2, label: '2 hours', recommended: true },
            { value: 4, label: '4 hours', recommended: false },
            { value: null, label: 'No auto-unlock', recommended: false },
          ].map((option) => (
            <SelectionPill
              key={option.label}
              label={option.recommended ? `${option.label} (recommended)` : option.label}
              selected={formState.safetyAutoUnlockHours === option.value}
              onSelect={() => {
                haptic.light()
                updateForm({ safetyAutoUnlockHours: option.value })
              }}
            />
          ))}
        </div>
      </div>

      {/* Fresh start date */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          When do you want to start?
        </p>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          Research shows Mondays and month starts boost success
        </p>
        <div className="space-y-2">
          {freshStartOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleFreshStartSelect(option.id)}
              className="w-full p-3 rounded-xl text-left transition-all duration-150 flex items-center gap-3 active:scale-[0.99] touch-manipulation"
              style={{
                background:
                  selectedFreshStart === option.id
                    ? 'color-mix(in oklab, var(--accent) 10%, transparent)'
                    : 'var(--bg-elevated)',
                border: `1.5px solid ${selectedFreshStart === option.id ? 'var(--accent)' : 'var(--border-subtle)'}`,
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  border: `2px solid ${selectedFreshStart === option.id ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  background: selectedFreshStart === option.id ? 'var(--accent)' : 'transparent',
                }}
              >
                {selectedFreshStart === option.id && (
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
                {option.sublabel && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {option.sublabel}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary card */}
      <div
        className="p-5 rounded-2xl mb-6"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
          Your commitment:
        </p>

        {/* Identity */}
        <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
          "I am becoming someone who{' '}
          <span style={{ color: 'var(--accent)' }}>{formState.identityStatement}</span>"
        </p>

        {/* Anchor */}
        <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
          I will meditate at <span style={{ color: 'var(--accent)' }}>{anchorTimeStr}</span> after{' '}
          <span style={{ color: 'var(--accent)' }}>{formState.anchorRoutine}</span>
        </p>

        {/* Duration */}
        <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
          For{' '}
          <span style={{ color: 'var(--accent)' }}>{formState.unlockDurationMinutes} minutes</span>{' '}
          (minimum: {formState.minimumFallbackMinutes} min)
        </p>

        {/* Celebration */}
        {formState.celebrationRitual && (
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            Then I will{' '}
            <span style={{ color: 'var(--accent)' }}>{formState.celebrationRitual}</span>
          </p>
        )}
      </div>

      {/* Activation date highlight */}
      <div
        className="p-4 rounded-xl mb-6 text-center"
        style={{
          background: 'color-mix(in oklab, var(--accent) 10%, transparent)',
          border: '1px solid var(--accent)',
        }}
      >
        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
          Starting
        </p>
        <p className="text-lg font-medium" style={{ color: 'var(--accent)' }}>
          {formatDateDisplay(selectedDate)}
        </p>
      </div>

      {/* Forgiveness message */}
      <div
        className="p-4 rounded-xl mb-6"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <p className="text-sm italic text-center" style={{ color: 'var(--text-muted)' }}>
          "If you miss a day, that's okay. Every day is a fresh start. What matters is showing up
          again tomorrow."
        </p>
      </div>

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
