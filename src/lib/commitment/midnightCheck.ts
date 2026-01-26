/**
 * Midnight Check for Commitment Mode
 *
 * Detects and processes missed sessions from previous days.
 * Should be run on app launch and periodically (e.g., when app comes to foreground).
 *
 * For each required day without a logged session:
 * - Apply penalty via consumeCommitmentPenalty()
 * - Log day as 'missed'
 * - Update analytics
 */

import {
  getCommitmentSettings,
  updateCommitmentSettings,
  getCommitmentDayLog,
  addCommitmentDayLog,
} from '../db/commitmentSettings'
import { consumeCommitmentPenalty } from '../hourBank'
import { createCommitmentRNG } from './rng'
import { calculateMissedPenalty, type MissedPenalty } from './outcomes'
import { isDayRequired, getStartOfDay, addDays } from './schedule'

/**
 * Result of a missed day penalty
 */
export interface MissedDayResult {
  date: number
  penalty: MissedPenalty
}

/**
 * Result of the midnight check
 */
export interface MidnightCheckResult {
  /** Whether commitment mode is active */
  isActive: boolean
  /** Number of days checked */
  daysChecked: number
  /** Days that were missed and penalized */
  missedDays: MissedDayResult[]
  /** Total penalty minutes applied */
  totalPenaltyMinutes: number
  /** Any errors encountered */
  errors: string[]
}

/**
 * Process all missed days since last check
 *
 * Checks each day from the last session date (or commitment start) to yesterday.
 * For each required day without a log entry, applies a penalty.
 *
 * @returns Result with details about missed days and penalties
 */
export async function processMidnightCheck(): Promise<MidnightCheckResult> {
  const settings = await getCommitmentSettings()

  const result: MidnightCheckResult = {
    isActive: settings.isActive,
    daysChecked: 0,
    missedDays: [],
    totalPenaltyMinutes: 0,
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

  // End at yesterday (don't penalize today yet - user still has time)
  const today = getStartOfDay(Date.now())
  const yesterday = addDays(today, -1)

  // Don't check if we're at the start of the commitment
  if (getStartOfDay(startCheck) >= today) {
    return result
  }

  // Create RNG for penalty calculation
  const rng = createCommitmentRNG(settings.rngSeed, settings.rngSequenceIndex)
  let currentRngIndex = settings.rngSequenceIndex

  // Check each day in the range
  let checkDate = addDays(getStartOfDay(startCheck), 1) // Start from day after last session
  let totalMissed = 0
  let totalPenalty = 0

  while (checkDate <= yesterday && checkDate <= settings.commitmentEndDate) {
    result.daysChecked++

    // Check if this day was required
    if (isDayRequired(checkDate, settings)) {
      // Check if we have a log for this day
      const existingLog = await getCommitmentDayLog(checkDate)

      if (!existingLog) {
        // Day was required but no session logged - it's a miss!
        try {
          // Calculate penalty
          const penalty = calculateMissedPenalty(rng)
          currentRngIndex = rng.currentIndex

          // Apply penalty to hour bank
          await consumeCommitmentPenalty(Math.abs(penalty.minutesChange) / 60)

          // Log the missed day
          await addCommitmentDayLog({
            date: checkDate,
            outcome: 'missed',
            minutesAdjustment: penalty.minutesChange,
            adjustmentType: 'penalty',
            wasNearMiss: false,
          })

          result.missedDays.push({
            date: checkDate,
            penalty,
          })

          totalMissed++
          totalPenalty += Math.abs(penalty.minutesChange)
        } catch (error) {
          result.errors.push(
            `Failed to process missed day ${new Date(checkDate).toDateString()}: ${error}`
          )
        }
      }
    }

    checkDate = addDays(checkDate, 1)
  }

  // Update settings with new RNG index and analytics
  if (totalMissed > 0) {
    await updateCommitmentSettings({
      rngSequenceIndex: currentRngIndex,
      totalSessionsMissed: settings.totalSessionsMissed + totalMissed,
      totalPenaltyMinutesDeducted: settings.totalPenaltyMinutesDeducted + totalPenalty,
      lastSessionDate: yesterday, // Update to prevent re-checking these days
    })
  }

  result.totalPenaltyMinutes = totalPenalty
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
 * Format missed days result for display
 *
 * @param result - The midnight check result
 * @returns Object with display strings
 */
export function formatMissedDaysForDisplay(result: MidnightCheckResult): {
  title: string
  subtitle: string
  hasImpact: boolean
} {
  if (result.missedDays.length === 0) {
    return {
      title: 'All caught up',
      subtitle: 'No missed sessions',
      hasImpact: false,
    }
  }

  const dayWord = result.missedDays.length === 1 ? 'day' : 'days'
  const totalHours = result.totalPenaltyMinutes / 60

  return {
    title: `${result.missedDays.length} missed ${dayWord}`,
    subtitle: `-${result.totalPenaltyMinutes} minutes (${totalHours.toFixed(1)}h) from your bank`,
    hasImpact: true,
  }
}
