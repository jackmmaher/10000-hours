/**
 * WeekStones - Shared week visualization component
 *
 * River stones representing days of the week.
 * Used in both Journey tab and Progress tab.
 *
 * States:
 * - completed: Session done (any session, planned or not)
 * - fulfilled: Planned + completed (the plan was executed)
 * - planned: Upcoming plan exists
 * - today: Current day with breathing animation
 * - next: Next plannable day with breathing animation
 * - future: No plan yet
 */

import { useMemo } from 'react'
import { DayStatus } from '../lib/calculations'
import { ANIMATION_BREATHE_DURATION, ORB_COLORS } from '../lib/animations'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Extended status types for Journey tab (adds 'fulfilled' and 'planned')
export type ExtendedDayStatus = DayStatus | 'fulfilled' | 'planned'

interface WeekStoneProps {
  status: ExtendedDayStatus
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

// Individual stone component
export function WeekStone({ status, onClick, size = 'sm' }: WeekStoneProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  // Animated sizes must be slightly larger than base for breathing effect
  // Using Tailwind arbitrary values since w-4.5/w-5.5 don't exist
  const animatedSizeClasses = {
    sm: 'w-3.5 h-3.5',           // 0.875rem - valid Tailwind class
    md: 'w-[1.125rem] h-[1.125rem]', // 18px - between w-4 (16px) and w-5 (20px)
    lg: 'w-[1.375rem] h-[1.375rem]'  // 22px - between w-5 (20px) and w-6 (24px)
  }

  const baseSize = sizeClasses[size]
  const animatedSize = animatedSizeClasses[size]

  // Completed session (any session done)
  if (status === 'completed') {
    return (
      <div
        className={`${baseSize} rounded-full shadow-sm cursor-default`}
        style={{
          background: `radial-gradient(circle at 30% 30%, ${ORB_COLORS.slate}, ${ORB_COLORS.indigo})`
        }}
        onClick={onClick}
      />
    )
  }

  // Fulfilled: planned AND completed (the best state)
  if (status === 'fulfilled') {
    return (
      <div
        className={`${baseSize} rounded-full shadow-sm cursor-pointer relative`}
        style={{
          background: `radial-gradient(circle at 30% 30%, ${ORB_COLORS.moss}, ${ORB_COLORS.slate})`
        }}
        onClick={onClick}
      >
        {/* Small checkmark indicator */}
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-moss rounded-full flex items-center justify-center">
          <svg className="w-1.5 h-1.5 text-cream" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    )
  }

  // Today or next plannable day - breathing animation
  if (status === 'today' || status === 'next') {
    return (
      <div
        className={`${animatedSize} rounded-full animate-breathe ring-2 ring-ink/15 ring-offset-2 ring-offset-cream cursor-pointer`}
        style={{
          background: `radial-gradient(circle at 30% 30%, ${ORB_COLORS.moss}, ${ORB_COLORS.slate})`,
          animationDuration: `${ANIMATION_BREATHE_DURATION}ms`
        }}
        onClick={onClick}
      />
    )
  }

  // Planned (future day with a plan)
  if (status === 'planned') {
    return (
      <div
        className={`${baseSize} rounded-full cursor-pointer border-2 border-moss/50`}
        style={{
          background: `radial-gradient(circle at 30% 30%, ${ORB_COLORS.moss}20, ${ORB_COLORS.slate}20)`
        }}
        onClick={onClick}
      />
    )
  }

  // Future or empty - just a subtle dot
  return (
    <div
      className={`${baseSize} rounded-full bg-cream-deep cursor-pointer hover:bg-ink/10 transition-colors`}
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

  // Determine if a day is clickable
  const isClickable = (_status: ExtendedDayStatus) => {
    // All days are clickable for viewing details or planning
    return true
  }

  return (
    <div className="flex justify-between items-end px-1">
      {days.map((status, i) => (
        <button
          key={i}
          onClick={() => isClickable(status) && handleDayClick(i)}
          className="flex flex-col items-center gap-2 cursor-pointer active:scale-90 transition-transform"
        >
          <WeekStone
            status={status}
            size={size}
          />
          {showLabels && (
            <span className="text-[10px] text-ink/30">
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
  if (isToday) return 'today'
  if (isNextPlannable) return 'next'
  if (hasPlan && isFuture) return 'planned'
  if (isFuture) return 'future'
  return 'missed' // Past days without sessions
}
