/**
 * Commitment Mode Middleware
 *
 * Processes session completions for commitment tracking.
 * Called after each meditation session to:
 * 1. Check if commitment is active
 * 2. Validate session meets requirements (duration, window)
 * 3. Log the day as completed
 * 4. Update streak, consistency, and analytics
 * 5. Check for milestone
 * 6. Return SessionCompletionResult
 */

import {
  getCommitmentSettings,
  updateCommitmentSettings,
  addCommitmentDayLog,
  getCommitmentDayLog,
} from '../db/commitmentSettings'
import { sendAccountabilityMessage } from '../accountability'
import { getUserPreferences } from '../db/preferences'
import {
  isDayRequired,
  isWithinWindow,
  getStartOfDay,
  getDayOfWeek,
  getTotalRequiredDays,
} from './schedule'
import { getStreakMilestone } from './milestones'
import {
  calculateConsistencyScore,
  calculateDayNumber,
  type SessionCompletionResult,
} from './outcomes'

/** Pre-window buffer in milliseconds (60 minutes before window start still counts) */
const PRE_WINDOW_BUFFER_MS = 60 * 60 * 1000

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
  /** Completion result with consistency, streak, milestone info */
  completionResult: SessionCompletionResult | null
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
      completionResult: null,
    }
  }

  const sessionDate = getStartOfDay(sessionStartTime)

  // Check if this day is required
  const dayRequired = isDayRequired(sessionStartTime, settings)

  // Check if session was within allowed window
  // Also allow sessions completed within 60 minutes before window start (pre-window buffer)
  let withinWindow = isWithinWindow(sessionStartTime, settings)
  if (!withinWindow && settings.windowType !== 'anytime') {
    // Check if session end time (start + duration) falls within window
    const sessionEndTime = sessionStartTime + durationSeconds * 1000
    if (isWithinWindow(sessionEndTime, settings)) {
      withinWindow = true
    }
    // Check pre-window buffer: if session started within 60 min before window opens
    if (!withinWindow) {
      const bufferStartTime = sessionStartTime + PRE_WINDOW_BUFFER_MS
      if (isWithinWindow(bufferStartTime, settings)) {
        withinWindow = true
      }
    }
  }

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
      completionResult: null,
      error: 'Day already completed',
    }
  }

  // Session must meet all requirements to count
  const sessionCounts = dayRequired && withinWindow && metMinDuration

  if (!sessionCounts) {
    return {
      isCommitmentActive: true,
      wasDayRequired: dayRequired,
      wasWithinWindow: withinWindow,
      metMinimumDuration: metMinDuration,
      sessionCounted: false,
      completionResult: null,
    }
  }

  // Session counts! Log the day
  await addCommitmentDayLog({
    date: sessionDate,
    outcome: 'completed',
    sessionUuid,
    presenceRating: null,
    reflection: null,
  })

  // Calculate new streak
  const wasConsecutive = settings.lastSessionDate
    ? sessionDate - settings.lastSessionDate <= 24 * 60 * 60 * 1000
    : true
  const newStreakDays = wasConsecutive ? settings.currentStreakDays + 1 : 1
  const newLongestStreak = Math.max(settings.longestStreakDays, newStreakDays)
  const isNewPersonalBest = newStreakDays > settings.longestStreakDays

  // Calculate consistency score
  const totalRequired = getTotalRequiredDays(settings)
  const newCompleted = settings.totalSessionsCompleted + 1
  const dayNumber = calculateDayNumber(settings.commitmentStartDate, sessionDate)
  const consistencyScore = calculateConsistencyScore(newCompleted, totalRequired)

  // Check for milestone
  const milestone = getStreakMilestone(newStreakDays)

  // Update day-of-week completion tracking
  const dayOfWeek = getDayOfWeek(sessionStartTime)
  const newCompletionsByDay = [...(settings.completionsByDayOfWeek || [0, 0, 0, 0, 0, 0, 0])]
  newCompletionsByDay[dayOfWeek] = (newCompletionsByDay[dayOfWeek] || 0) + 1

  // Update settings with streak and analytics
  await updateCommitmentSettings({
    totalSessionsCompleted: newCompleted,
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
      const userPrefs = await getUserPreferences()
      const userName = userPrefs.displayName || 'User'
      await sendAccountabilityMessage({
        phone: settings.accountabilityPhone,
        method: settings.accountabilityMethod || 'sms',
        durationMinutes: Math.round(durationSeconds / 60),
        userName,
        dayNumber,
      })
    } catch (err) {
      console.warn('[Commitment] Failed to send accountability message:', err)
    }
  }

  const completionResult: SessionCompletionResult = {
    dayNumber,
    totalDays: settings.commitmentDuration,
    consistencyScore,
    streakDays: newStreakDays,
    milestone,
    isNewPersonalBest,
  }

  return {
    isCommitmentActive: true,
    wasDayRequired: dayRequired,
    wasWithinWindow: withinWindow,
    metMinimumDuration: metMinDuration,
    sessionCounted: true,
    completionResult,
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
export async function consumeGracePeriod(): Promise<boolean> {
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
    presenceRating: null,
    reflection: null,
  })

  await updateCommitmentSettings({
    gracePeriodUsed: settings.gracePeriodUsed + 1,
  })

  return true
}
