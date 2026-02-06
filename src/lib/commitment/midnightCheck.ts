/**
 * Midnight Check for Commitment Mode
 *
 * Detects and processes missed sessions from previous days.
 * Should be run on app launch and periodically (e.g., when app comes to foreground).
 *
 * For each required day without a logged session:
 * - Log day as 'missed'
 * - Break streak
 * - Update analytics
 * - Generate contextual encouragement (no penalties)
 */

import {
  getCommitmentSettings,
  updateCommitmentSettings,
  getCommitmentDayLog,
  addCommitmentDayLog,
} from '../db/commitmentSettings'
import {
  isDayRequired,
  getStartOfDay,
  addDays,
  getNextRequiredDate,
  getTotalRequiredDays,
} from './schedule'
import {
  calculateConsistencyScore,
  calculateDayNumber,
  getEncouragementMessage,
  type MissedDayNotice,
} from './outcomes'

/**
 * Result of the midnight check
 */
export interface MidnightCheckResult {
  /** Whether commitment mode is active */
  isActive: boolean
  /** Number of days checked */
  daysChecked: number
  /** Number of missed days found */
  missedDaysCount: number
  /** Missed day notice with encouragement (if any days were missed) */
  notice: MissedDayNotice | null
  /** Any errors encountered */
  errors: string[]
}

/**
 * Process all missed days since last check
 *
 * Checks each day from the last session date (or commitment start) to yesterday.
 * For each required day without a log entry, marks it as missed.
 * No penalties are applied — only streak reset and encouragement.
 *
 * @returns Result with details about missed days and encouragement
 */
export async function processMidnightCheck(): Promise<MidnightCheckResult> {
  const settings = await getCommitmentSettings()

  const result: MidnightCheckResult = {
    isActive: settings.isActive,
    daysChecked: 0,
    missedDaysCount: 0,
    notice: null,
    errors: [],
  }

  if (!settings.isActive) {
    return result
  }

  // Determine the range to check
  // Start from either lastSessionDate or commitmentStartDate (whichever is later)
  const startCheck = settings.lastSessionDate
    ? Math.max(settings.lastSessionDate, settings.commitmentStartDate)
    : settings.commitmentStartDate

  // End at yesterday (don't mark today as missed yet - user still has time)
  const today = getStartOfDay(Date.now())
  const yesterday = addDays(today, -1)

  // Don't check if we're at the start of the commitment
  if (getStartOfDay(startCheck) >= today) {
    return result
  }

  // Check each day in the range
  let checkDate = addDays(getStartOfDay(startCheck), 1) // Start from day after last session
  let totalMissed = 0

  while (checkDate <= yesterday && checkDate <= settings.commitmentEndDate) {
    result.daysChecked++

    // Check if this day was required
    if (isDayRequired(checkDate, settings)) {
      // Check if we have a log for this day
      const existingLog = await getCommitmentDayLog(checkDate)

      if (!existingLog) {
        // Day was required but no session logged - it's a miss
        try {
          await addCommitmentDayLog({
            date: checkDate,
            outcome: 'missed',
            presenceRating: null,
            reflection: null,
          })

          totalMissed++
        } catch (error) {
          result.errors.push(
            `Failed to process missed day ${new Date(checkDate).toDateString()}: ${error}`
          )
        }
      }
    }

    checkDate = addDays(checkDate, 1)
  }

  // Update settings if any days were missed
  if (totalMissed > 0) {
    const previousStreak = settings.currentStreakDays

    await updateCommitmentSettings({
      totalSessionsMissed: settings.totalSessionsMissed + totalMissed,
      lastSessionDate: yesterday, // Update to prevent re-checking these days
      // Break streak on missed days
      currentStreakDays: 0,
    })

    // Calculate updated consistency score
    const totalRequired = getTotalRequiredDays(settings)
    const consistencyScore = calculateConsistencyScore(
      settings.totalSessionsCompleted,
      totalRequired
    )

    // Calculate days remaining in commitment
    const dayNumber = calculateDayNumber(settings.commitmentStartDate, today)
    const daysRemaining = Math.max(0, settings.commitmentDuration - dayNumber + 1)

    // Get next required day
    const nextRequired = getNextRequiredDate(settings, Date.now())

    // Generate contextual encouragement
    const encouragement = getEncouragementMessage({
      daysMissed: totalMissed,
      previousStreak,
      daysRemaining,
      consistencyScore,
    })

    result.notice = {
      daysMissed: totalMissed,
      consistencyScore,
      encouragement,
      nextRequiredDay: nextRequired ? new Date(nextRequired) : null,
    }
  }

  result.missedDaysCount = totalMissed
  return result
}

/**
 * Check if there are any pending missed days to process
 * Useful for showing a warning before the full check
 *
 * @returns Number of days that need to be checked
 */
export async function getPendingMissedDaysCount(): Promise<number> {
  const settings = await getCommitmentSettings()

  if (!settings.isActive) {
    return 0
  }

  const startCheck = settings.lastSessionDate
    ? Math.max(settings.lastSessionDate, settings.commitmentStartDate)
    : settings.commitmentStartDate

  const today = getStartOfDay(Date.now())
  const yesterday = addDays(today, -1)

  if (getStartOfDay(startCheck) >= today) {
    return 0
  }

  let count = 0
  let checkDate = addDays(getStartOfDay(startCheck), 1)

  while (checkDate <= yesterday && checkDate <= settings.commitmentEndDate) {
    if (isDayRequired(checkDate, settings)) {
      const existingLog = await getCommitmentDayLog(checkDate)
      if (!existingLog) {
        count++
      }
    }
    checkDate = addDays(checkDate, 1)
  }

  return count
}

/**
 * Format midnight check result for display
 *
 * @param result - The midnight check result
 * @returns Object with display strings
 */
export function formatMissedDaysForDisplay(result: MidnightCheckResult): {
  title: string
  subtitle: string
  hasImpact: boolean
} {
  if (!result.notice || result.missedDaysCount === 0) {
    return {
      title: 'All caught up',
      subtitle: 'No missed sessions',
      hasImpact: false,
    }
  }

  const dayWord = result.missedDaysCount === 1 ? 'day' : 'days'
  const scorePercent = Math.round(result.notice.consistencyScore * 100)

  return {
    title: `${result.missedDaysCount} missed ${dayWord}`,
    subtitle: result.notice.encouragement || `Consistency: ${scorePercent}%`,
    hasImpact: true,
  }
}
