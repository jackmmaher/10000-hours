/**
 * WeekStones - Shared week visualization component
 *
 * River stones representing days of the week.
 * Used in both Journey tab and Progress tab.
 * Now fully theme-aware using CSS variables.
 *
 * States:
 * - completed: Session done (any session, planned or not)
 * - fulfilled: Planned + completed (the plan was executed)
 * - planned: Upcoming plan exists (including today with a plan)
 * - today: Current day without plan (cream orb, same as future)
 * - next: Tomorrow - breathing animation to encourage planning ahead
 * - future: No plan yet
 */

import { useMemo } from 'react'
import { DayStatus } from '../lib/calculations'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Extended status types for Journey tab (adds 'fulfilled' and 'planned')
export type ExtendedDayStatus = DayStatus | 'fulfilled' | 'planned'

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
    lg: 'w-5 h-5'
  }

  // Animated sizes must be slightly larger than base for breathing effect
  const animatedSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-[1.125rem] h-[1.125rem]',
    lg: 'w-[1.375rem] h-[1.375rem]'
  }

  const baseSize = sizeClasses[size]
  const animatedSize = animatedSizeClasses[size]

  // Completed session (any session done)
  if (status === 'completed') {
    return (
      <div
        className={`${baseSize} rounded-full cursor-default`}
        style={{
          background: `radial-gradient(circle at 30% 30%, var(--stone-completed-inner), var(--stone-completed))`,
          boxShadow: 'var(--shadow-elevation-1)'
        }}
        onClick={onClick}
      />
    )
  }

  // Fulfilled: planned AND completed (the best state)
  if (status === 'fulfilled') {
    return (
      <div
        className={`${baseSize} rounded-full cursor-pointer relative`}
        style={{
          background: `radial-gradient(circle at 30% 30%, var(--accent), var(--stone-completed))`,
          boxShadow: 'var(--shadow-elevation-1)'
        }}
        onClick={onClick}
      >
        {/* Small checkmark indicator */}
        <div
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full flex items-center justify-center"
          style={{ background: 'var(--accent)' }}
        >
          <svg className="w-1.5 h-1.5" style={{ color: 'var(--text-on-accent)' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    )
  }

  // Next plannable day (tomorrow) - breathing animation to encourage planning ahead
  if (status === 'next') {
    return (
      <div
        className={`${animatedSize} rounded-full animate-breathe cursor-pointer`}
        style={{
          background: `radial-gradient(circle at 30% 30%, var(--accent), var(--stone-completed))`,
          boxShadow: `0 0 0 2px var(--bg-base), 0 0 0 4px var(--border)`,
          animationDuration: '3000ms'
        }}
        onClick={onClick}
      />
    )
  }

  // Today without a session - render as neutral
  if (status === 'today') {
    return (
      <div
        className={`${baseSize} rounded-full cursor-pointer transition-colors`}
        style={{ background: 'var(--stone-today)' }}
        onClick={onClick}
      />
    )
  }

  // Planned (future day with a plan)
  if (status === 'planned') {
    return (
      <div
        className={`${baseSize} rounded-full cursor-pointer`}
        style={{
          background: 'var(--stone-planned)',
          border: '2px solid var(--stone-planned-border)'
        }}
        onClick={onClick}
      />
    )
  }

  // Future or empty - just a subtle dot
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
  size = 'sm'
}: WeekStonesRowProps) {
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
          className="flex flex-col items-center gap-2 cursor-pointer active:scale-90 transition-transform"
        >
          <WeekStone
            status={status}
            size={size}
          />
          {showLabels && (
            <span
              className="text-[10px]"
              style={{ color: 'var(--text-muted)' }}
            >
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
  isNextPlannable: boolean,
  isPast: boolean = false
): ExtendedDayStatus {
  if (hasSession && hasPlan) return 'fulfilled'
  if (hasSession) return 'completed'
  if (isPast && !hasSession) return 'missed'
  if (isNextPlannable) return 'next'
  if (hasPlan && (isFuture || isToday)) return 'planned'
  if (isToday) return 'today'
  if (isFuture) return 'future'
  return 'missed'
}
