/**
 * Commitment Mode Middleware
 *
 * Processes session completions for commitment tracking.
 * Called after each meditation session to:
 * 1. Check if commitment is active
 * 2. Validate session meets requirements (duration, window)
 * 3. Roll RNG for bonus/near-miss outcomes
 * 4. Log the day's outcome
 * 5. Update commitment settings (RNG index, analytics)
 */

import {
  getCommitmentSettings,
  updateCommitmentSettings,
  addCommitmentDayLog,
  getCommitmentDayLog,
} from '../db/commitmentSettings'
import { addBonusHours } from '../hourBank'
import { sendAccountabilityMessage } from '../accountability'
import { createCommitmentRNG } from './rng'
import { calculateSessionCompletion, type SessionOutcome } from './outcomes'
import { isDayRequired, isWithinWindow, getStartOfDay, getDayOfWeek } from './schedule'

/**
 * Result of processing a commitment session
 */
export interface CommitmentSessionResult {
  /** Whether commitment mode is active */
  isCommitmentActive: boolean
  /** Whether this day was required for the commitment */
  wasDayRequired: boolean
  /** Whether the session was within the allowed time window */
  wasWithinWindow: boolean
  /** Whether the session met the minimum duration requirement */
  metMinimumDuration: boolean
  /** Whether the session counted toward the commitment (all requirements met) */
  sessionCounted: boolean
  /** The outcome (bonus, mystery, near-miss, none) if session counted */
  outcome: SessionOutcome | null
  /** Any error message */
  error?: string
}

/**
 * Process a completed session for commitment mode
 *
 * This is the main entry point called after each session completion.
 *
 * @param sessionUuid - The UUID of the completed session
 * @param durationSeconds - Duration of the session in seconds
 * @param sessionStartTime - When the session started (timestamp)
 * @returns Processing result with outcome details
 */
export async function processCommitmentSession(
  sessionUuid: string,
  durationSeconds: number,
  sessionStartTime: number
): Promise<CommitmentSessionResult> {
  const settings = await getCommitmentSettings()

  // Check if commitment is active
  if (!settings.isActive) {
    return {
      isCommitmentActive: false,
      wasDayRequired: false,
      wasWithinWindow: true,
      metMinimumDuration: true,
      sessionCounted: false,
      outcome: null,
    }
  }

  const sessionDate = getStartOfDay(sessionStartTime)

  // Check if this day is required
  const dayRequired = isDayRequired(sessionStartTime, settings)

  // Check if session was within allowed window
  const withinWindow = isWithinWindow(sessionStartTime, settings)

  // Check minimum duration (convert to minutes)
  const durationMinutes = durationSeconds / 60
  const metMinDuration = durationMinutes >= settings.minimumSessionMinutes

  // Check if we already logged this day (prevent double-counting)
  const existingLog = await getCommitmentDayLog(sessionDate)
  if (existingLog && existingLog.outcome === 'completed') {
    return {
      isCommitmentActive: true,
      wasDayRequired: dayRequired,
      wasWithinWindow: withinWindow,
      metMinimumDuration: metMinDuration,
      sessionCounted: false,
      outcome: null,
      error: 'Day already completed',
    }
  }

  // Session must meet all requirements to count
  const sessionCounts = dayRequired && withinWindow && metMinDuration

  if (!sessionCounts) {
    // Session doesn't count but isn't an error - just doesn't meet requirements
    return {
      isCommitmentActive: true,
      wasDayRequired: dayRequired,
      wasWithinWindow: withinWindow,
      metMinimumDuration: metMinDuration,
      sessionCounted: false,
      outcome: null,
    }
  }

  // Session counts! Roll for outcome
  const rng = createCommitmentRNG(settings.rngSeed, settings.rngSequenceIndex)
  const outcome = calculateSessionCompletion(rng)

  // Log the day
  await addCommitmentDayLog({
    date: sessionDate,
    outcome: 'completed',
    sessionUuid,
    minutesAdjustment: outcome.minutesChange,
    adjustmentType: outcome.type,
    wasNearMiss: outcome.wasNearMiss,
  })

  // Apply bonus to hour bank if earned
  if (outcome.minutesChange > 0) {
    const bonusHours = outcome.minutesChange / 60
    const source = outcome.type === 'mystery' ? 'commitment-mystery' : 'commitment-bonus'
    await addBonusHours(bonusHours, source, sessionUuid)
  }

  // Calculate new streak
  const wasConsecutive = settings.lastSessionDate
    ? sessionDate - settings.lastSessionDate <= 24 * 60 * 60 * 1000
    : true
  const newStreakDays = wasConsecutive ? settings.currentStreakDays + 1 : 1
  const newLongestStreak = Math.max(settings.longestStreakDays, newStreakDays)

  // Update day-of-week completion tracking
  const dayOfWeek = getDayOfWeek(sessionStartTime)
  const newCompletionsByDay = [...(settings.completionsByDayOfWeek || [0, 0, 0, 0, 0, 0, 0])]
  newCompletionsByDay[dayOfWeek] = (newCompletionsByDay[dayOfWeek] || 0) + 1

  // Update settings with new RNG index, streak, and analytics
  await updateCommitmentSettings({
    rngSequenceIndex: rng.currentIndex,
    totalSessionsCompleted: settings.totalSessionsCompleted + 1,
    totalBonusMinutesEarned: settings.totalBonusMinutesEarned + Math.max(0, outcome.minutesChange),
    lastSessionDate: sessionDate,
    currentStreakDays: newStreakDays,
    longestStreakDays: newLongestStreak,
    completionsByDayOfWeek: newCompletionsByDay,
  })

  // Send accountability message if enabled
  if (
    settings.accountabilityEnabled &&
    settings.notifyOnCompletion &&
    settings.accountabilityPhone
  ) {
    try {
      await sendAccountabilityMessage({
        type: 'completion',
        phone: settings.accountabilityPhone,
        method: settings.accountabilityMethod || 'sms',
        durationMinutes: Math.round(durationSeconds / 60),
        userName: 'User',
      })
    } catch (err) {
      console.warn('[Commitment] Failed to send accountability message:', err)
    }
  }

  return {
    isCommitmentActive: true,
    wasDayRequired: dayRequired,
    wasWithinWindow: withinWindow,
    metMinimumDuration: metMinDuration,
    sessionCounted: true,
    outcome,
  }
}

/**
 * Check if today's commitment session is still needed
 *
 * @returns Object with status about today's commitment requirement
 */
export async function getTodayCommitmentStatus(): Promise<{
  isActive: boolean
  isRequired: boolean
  isCompleted: boolean
  isWithinWindow: boolean
  minimumMinutes: number
}> {
  const settings = await getCommitmentSettings()

  if (!settings.isActive) {
    return {
      isActive: false,
      isRequired: false,
      isCompleted: false,
      isWithinWindow: true,
      minimumMinutes: 0,
    }
  }

  const now = Date.now()
  const today = getStartOfDay(now)

  const isRequired = isDayRequired(now, settings)
  const withinWindow = isWithinWindow(now, settings)

  // Check if today is already completed
  const todayLog = await getCommitmentDayLog(today)
  const isCompleted = todayLog?.outcome === 'completed'

  return {
    isActive: true,
    isRequired,
    isCompleted,
    isWithinWindow: withinWindow,
    minimumMinutes: settings.minimumSessionMinutes,
  }
}

/**
 * Use a grace period for today (if available)
 *
 * @returns true if grace period was used successfully
 */
export async function useGracePeriod(): Promise<boolean> {
  const settings = await getCommitmentSettings()

  if (!settings.isActive) {
    return false
  }

  // Check if grace periods available
  if (settings.gracePeriodUsed >= settings.gracePeriodCount) {
    return false
  }

  const today = getStartOfDay(Date.now())

  // Check if today is required and not yet logged
  if (!isDayRequired(Date.now(), settings)) {
    return false
  }

  const existingLog = await getCommitmentDayLog(today)
  if (existingLog) {
    return false // Already logged (completed or missed)
  }

  // Use grace period
  await addCommitmentDayLog({
    date: today,
    outcome: 'grace',
    minutesAdjustment: 0,
    adjustmentType: 'none',
    wasNearMiss: false,
  })

  await updateCommitmentSettings({
    gracePeriodUsed: settings.gracePeriodUsed + 1,
  })

  return true
}
