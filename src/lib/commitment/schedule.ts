/**
 * Schedule Checker for Commitment Mode
 *
 * Determines when meditation is required based on schedule type and time windows.
 */

import type { CommitmentSettings } from '../db/types'

// ============================================================================
// Date Helpers
// ============================================================================

/**
 * Get start of day timestamp for a given date
 */
export function getStartOfDay(timestamp: number): number {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

/**
 * Get end of day timestamp for a given date
 */
export function getEndOfDay(timestamp: number): number {
  const date = new Date(timestamp)
  date.setHours(23, 59, 59, 999)
  return date.getTime()
}

/**
 * Get day of week (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeek(timestamp: number): number {
  return new Date(timestamp).getDay()
}

/**
 * Get start of week (Sunday) for a given date
 */
export function getStartOfWeek(timestamp: number): number {
  const date = new Date(timestamp)
  const day = date.getDay()
  date.setDate(date.getDate() - day)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

/**
 * Add days to a timestamp
 */
export function addDays(timestamp: number, days: number): number {
  const date = new Date(timestamp)
  date.setDate(date.getDate() + days)
  return date.getTime()
}

// ============================================================================
// Schedule Checking
// ============================================================================

/**
 * Check if meditation is required on a specific day
 *
 * @param date - The date to check (timestamp)
 * @param settings - Commitment settings
 * @returns true if meditation is required on this day
 */
export function isDayRequired(date: number, settings: CommitmentSettings): boolean {
  // Not active = never required
  if (!settings.isActive) {
    return false
  }

  // Outside commitment period = not required
  const dayStart = getStartOfDay(date)
  if (dayStart < settings.commitmentStartDate || dayStart > settings.commitmentEndDate) {
    return false
  }

  const dayOfWeek = getDayOfWeek(date)

  switch (settings.scheduleType) {
    case 'daily':
      // Every day is required
      return true

    case 'weekday':
      // Monday (1) through Friday (5)
      return dayOfWeek >= 1 && dayOfWeek <= 5

    case 'custom':
      // Use customDays array [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
      if (!settings.customDays || settings.customDays.length !== 7) {
        return false
      }
      return settings.customDays[dayOfWeek] === true

    case 'flexible':
      // Flexible target doesn't have required days in the traditional sense
      // The requirement is met by completing N sessions per week
      // Individual days are always "optional" but the week has a target
      return true // All days count toward the weekly target

    default:
      return false
  }
}

/**
 * Check if current time is within the allowed practice window
 *
 * @param timestamp - The timestamp to check
 * @param settings - Commitment settings
 * @returns true if within window, or if no window restriction
 */
export function isWithinWindow(timestamp: number, settings: CommitmentSettings): boolean {
  const date = new Date(timestamp)
  const hour = date.getHours()
  const minute = date.getMinutes()
  const currentMinutes = hour * 60 + minute

  switch (settings.windowType) {
    case 'anytime':
      // No time restriction
      return true

    case 'morning':
      // 5am (300 min) to 12pm (720 min)
      return currentMinutes >= 300 && currentMinutes < 720

    case 'specific': {
      // Use custom window times
      if (
        settings.windowStartHour === undefined ||
        settings.windowStartMinute === undefined ||
        settings.windowEndHour === undefined ||
        settings.windowEndMinute === undefined
      ) {
        // No window defined = anytime
        return true
      }

      const windowStart = settings.windowStartHour * 60 + settings.windowStartMinute
      const windowEnd = settings.windowEndHour * 60 + settings.windowEndMinute

      // Handle overnight windows (e.g., 10pm to 6am)
      if (windowEnd < windowStart) {
        return currentMinutes >= windowStart || currentMinutes < windowEnd
      }

      return currentMinutes >= windowStart && currentMinutes < windowEnd
    }

    default:
      return true
  }
}

/**
 * Get the next required date starting from a given date
 *
 * @param settings - Commitment settings
 * @param fromDate - Start searching from this date (default: now)
 * @returns Next required date timestamp, or null if none within commitment period
 */
export function getNextRequiredDate(
  settings: CommitmentSettings,
  fromDate: number = Date.now()
): number | null {
  if (!settings.isActive) {
    return null
  }

  // Start from tomorrow if checking from today
  let checkDate = getStartOfDay(fromDate)
  const today = getStartOfDay(Date.now())

  if (checkDate <= today) {
    checkDate = addDays(today, 1)
  }

  // Search up to commitment end date
  const endDate = getStartOfDay(settings.commitmentEndDate)

  while (checkDate <= endDate) {
    if (isDayRequired(checkDate, settings)) {
      return checkDate
    }
    checkDate = addDays(checkDate, 1)
  }

  return null
}

/**
 * Get all required dates in a date range
 *
 * @param settings - Commitment settings
 * @param startDate - Range start
 * @param endDate - Range end
 * @returns Array of required date timestamps
 */
export function getRequiredDatesInRange(
  settings: CommitmentSettings,
  startDate: number,
  endDate: number
): number[] {
  const required: number[] = []
  let checkDate = getStartOfDay(startDate)
  const end = getStartOfDay(endDate)

  while (checkDate <= end) {
    if (isDayRequired(checkDate, settings)) {
      required.push(checkDate)
    }
    checkDate = addDays(checkDate, 1)
  }

  return required
}

/**
 * Get the total number of required days in the commitment period
 *
 * @param settings - Commitment settings
 * @returns Total required days
 */
export function getTotalRequiredDays(settings: CommitmentSettings): number {
  if (!settings.isActive) {
    return 0
  }

  return getRequiredDatesInRange(settings, settings.commitmentStartDate, settings.commitmentEndDate)
    .length
}

// ============================================================================
// Flexible Target Helpers
// ============================================================================

/**
 * Get progress toward weekly flexible target
 *
 * @param settings - Commitment settings (must be flexible type)
 * @param completedThisWeek - Number of sessions completed this week
 * @returns Object with target, completed, and remaining
 */
export function getFlexibleWeekProgress(
  settings: CommitmentSettings,
  completedThisWeek: number
): {
  target: number
  completed: number
  remaining: number
  isOnTrack: boolean
} {
  const target = settings.flexibleTarget ?? 5 // Default to 5/week

  return {
    target,
    completed: completedThisWeek,
    remaining: Math.max(0, target - completedThisWeek),
    isOnTrack: completedThisWeek >= target,
  }
}

/**
 * Get days remaining in current week
 *
 * @param timestamp - Current timestamp
 * @returns Days remaining (including today)
 */
export function getDaysRemainingInWeek(timestamp: number = Date.now()): number {
  const dayOfWeek = getDayOfWeek(timestamp)
  return 7 - dayOfWeek
}

// ============================================================================
// Window Display Helpers
// ============================================================================

/**
 * Format window time for display
 *
 * @param settings - Commitment settings
 * @returns Human-readable window string
 */
export function formatWindowForDisplay(settings: CommitmentSettings): string {
  switch (settings.windowType) {
    case 'anytime':
      return 'Anytime'

    case 'morning':
      return '5:00 AM - 12:00 PM'

    case 'specific': {
      if (settings.windowStartHour === undefined || settings.windowEndHour === undefined) {
        return 'Anytime'
      }

      const formatTime = (hour: number, minute: number = 0): string => {
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        const displayMinute = minute.toString().padStart(2, '0')
        return `${displayHour}:${displayMinute} ${period}`
      }

      return `${formatTime(settings.windowStartHour, settings.windowStartMinute ?? 0)} - ${formatTime(settings.windowEndHour, settings.windowEndMinute ?? 0)}`
    }

    default:
      return 'Anytime'
  }
}

/**
 * Format schedule type for display
 *
 * @param settings - Commitment settings
 * @returns Human-readable schedule string
 */
export function formatScheduleForDisplay(settings: CommitmentSettings): string {
  switch (settings.scheduleType) {
    case 'daily':
      return 'Every day'

    case 'weekday':
      return 'Weekdays (Mon-Fri)'

    case 'custom': {
      if (!settings.customDays) {
        return 'Custom'
      }
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const activeDays = settings.customDays
        .map((active, i) => (active ? dayNames[i] : null))
        .filter(Boolean)
      return activeDays.join(', ')
    }

    case 'flexible':
      return `${settings.flexibleTarget ?? 5} sessions per week`

    default:
      return 'Unknown'
  }
}
