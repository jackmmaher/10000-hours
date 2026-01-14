/**
 * WeekStones - Shared week visualization component
 *
 * River stones representing days of the week.
 * Used in both Journey tab and Progress tab.
 * Now fully theme-aware using CSS variables.
 *
 * States:
 * - completed: Session done (any session, planned or not)
 * - fulfilled: Planned + completed (past plan was executed)
 * - today: Current day without session or plan (prominent glow)
 * - today-with-session: Today with completed session (prominent glow + filled)
 * - today-with-plan: Today with future plan (prominent glow + plan indicator)
 * - today-dual: Today with both session and future plan
 * - planned: Future day with a plan (accent indicator)
 * - future: Future day, no plan yet (neutral)
 * - missed: Past day with no session
 *
 * Journey tab usage: Display-only, clicks scroll to Calendar
 * Progress tab usage: Display-only streak visualization
 */

import { useMemo } from 'react'
import { DayStatus } from '../lib/calculations'
import { useTapFeedback } from '../hooks/useTapFeedback'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Extended status types for Journey tab
export type ExtendedDayStatus =
  | DayStatus
  | 'fulfilled'
  | 'planned'
  | 'today-with-session'
  | 'today-with-plan'
  | 'today-dual'

interface WeekStoneProps {
  status: ExtendedDayStatus
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

// Individual stone component - now using CSS variables
export function WeekStone({ status, onClick, size = 'sm' }: WeekStoneProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const baseSize = sizeClasses[size]

  // Past day: Completed session (any session done, not today)
  if (status === 'completed') {
    return (
      <div
        className={`${baseSize} rounded-full cursor-pointer`}
        style={{
          background: `radial-gradient(circle at 30% 30%, var(--stone-completed-inner), var(--stone-completed))`,
          boxShadow: 'var(--shadow-elevation-1)',
        }}
        onClick={onClick}
      />
    )
  }

  // Past day: Fulfilled - planned AND completed (the best state for past days)
  if (status === 'fulfilled') {
    return (
      <div
        className={`${baseSize} rounded-full cursor-pointer relative`}
        style={{
          background: `radial-gradient(circle at 30% 30%, var(--accent), var(--stone-completed))`,
          boxShadow: 'var(--shadow-elevation-1)',
        }}
        onClick={onClick}
      >
        {/* Small checkmark indicator */}
        <div
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full flex items-center justify-center"
          style={{ background: 'var(--accent)' }}
        >
          <svg
            className="w-1.5 h-1.5"
            style={{ color: 'var(--text-on-accent)' }}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    )
  }

  // TODAY states - all have prominent glow ring to draw the eye

  // Today without session or plan - neutral with glow
  if (status === 'today') {
    return (
      <div
        className={`${baseSize} rounded-full cursor-pointer`}
        style={{
          background: 'var(--stone-today)',
          boxShadow: '0 0 0 2px var(--accent), 0 0 6px var(--accent-muted)',
        }}
        onClick={onClick}
      />
    )
  }

  // Today with completed session only - filled with glow
  if (status === 'today-with-session') {
    return (
      <div
        className={`${baseSize} rounded-full cursor-pointer`}
        style={{
          background: `radial-gradient(circle at 30% 30%, var(--stone-completed-inner), var(--stone-completed))`,
          boxShadow: '0 0 0 2px var(--accent), 0 0 6px var(--accent-muted)',
        }}
        onClick={onClick}
      />
    )
  }

  // Today with future plan only - glow + plan dot
  if (status === 'today-with-plan') {
    return (
      <div
        className={`${baseSize} rounded-full cursor-pointer relative`}
        style={{
          background: 'var(--accent-muted)',
          boxShadow: '0 0 0 2px var(--accent), 0 0 6px var(--accent-muted)',
        }}
        onClick={onClick}
      >
        {/* Plan indicator dot */}
        <div
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
          style={{ background: 'var(--accent)' }}
        />
      </div>
    )
  }

  // Today with both session AND future plan - filled with glow + plan dot
  if (status === 'today-dual') {
    return (
      <div
        className={`${baseSize} rounded-full cursor-pointer relative`}
        style={{
          background: `radial-gradient(circle at 30% 30%, var(--stone-completed-inner), var(--stone-completed))`,
          boxShadow: '0 0 0 2px var(--accent), 0 0 6px var(--accent-muted)',
        }}
        onClick={onClick}
      >
        {/* Plan indicator dot - shows there's still a plan coming */}
        <div
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
          style={{ background: 'var(--accent)' }}
        />
      </div>
    )
  }

  // FUTURE states

  // Future day with a plan - accent indicator
  if (status === 'planned') {
    return (
      <div
        className={`${baseSize} rounded-full cursor-pointer relative`}
        style={{
          background: 'var(--accent-muted)',
          border: '2px solid var(--accent)',
        }}
        onClick={onClick}
      >
        {/* Small plan dot */}
        <div
          className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
          style={{ background: 'var(--accent)' }}
        />
      </div>
    )
  }

  // Future or empty - neutral dot (no special treatment for "tomorrow")
  return (
    <div
      className={`${baseSize} rounded-full cursor-pointer transition-colors`}
      style={{ background: 'var(--stone-empty)' }}
      onClick={onClick}
    />
  )
}

interface WeekStonesRowProps {
  days: ExtendedDayStatus[]
  onDayClick?: (dayIndex: number, date: Date) => void
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
}

// Full week row component
export function WeekStonesRow({
  days,
  onDayClick,
  showLabels = true,
  size = 'sm',
}: WeekStonesRowProps) {
  const haptic = useTapFeedback()

  // Calculate dates for each day (Monday-based week)
  const dayDates = useMemo(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    monday.setHours(0, 0, 0, 0)

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      return date
    })
  }, [])

  const handleDayClick = (index: number) => {
    haptic.light()
    if (onDayClick) {
      onDayClick(index, dayDates[index])
    }
  }

  return (
    <div className="flex justify-between items-end px-1">
      {days.map((status, i) => (
        <button
          key={i}
          onClick={() => handleDayClick(i)}
          className="flex flex-col items-center gap-2 cursor-pointer active:scale-90 transition-transform touch-manipulation"
        >
          <WeekStone status={status} size={size} />
          {showLabels && (
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {DAY_LABELS[i]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// Helper to determine status based on session and plan data
export function getDayStatusWithPlan(
  hasSession: boolean,
  hasPlan: boolean,
  isToday: boolean,
  isFuture: boolean,
  _isNextPlannable: boolean, // Deprecated - kept for backward compatibility, ignored
  isPast: boolean = false
): ExtendedDayStatus {
  // TODAY states - always draw attention to today
  if (isToday) {
    if (hasSession && hasPlan) return 'today-dual' // Session done + future plan
    if (hasSession) return 'today-with-session' // Session done, no more plans
    if (hasPlan) return 'today-with-plan' // Future plan today
    return 'today' // Empty today
  }

  // PAST states
  if (isPast) {
    if (hasSession && hasPlan) return 'fulfilled' // Plan was executed
    if (hasSession) return 'completed' // Session done (unplanned)
    return 'missed' // No session
  }

  // FUTURE states
  if (isFuture) {
    if (hasPlan) return 'planned' // Future day with plan
    return 'future' // Future day, no plan
  }

  return 'missed'
}
