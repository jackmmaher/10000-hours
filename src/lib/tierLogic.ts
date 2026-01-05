/**
 * Tier Logic - Core business logic for Trial → Downgrade model
 *
 * Key concepts:
 * - Days 1-30: Implicit Premium trial (user sees full experience)
 * - Day 31: Paywall trigger (first session where daysSinceFirst >= 31)
 * - Day 31+ FREE: Degraded experience (rolling window, faded calendar)
 * - Premium: Full experience restored ($4.99/year)
 */

import { Session, TierType } from './db'

// Constants
const TRIAL_DAYS = 30
const CALENDAR_LOOKBACK_DAYS = 90
const MS_PER_DAY = 24 * 60 * 60 * 1000

// Adaptive goal constraints
const MIN_WEEKLY_GOAL_HOURS = 1
const MAX_WEEKLY_GOAL_HOURS = 35 // 5h/day max
const DEFAULT_WEEKLY_GOAL_HOURS = 5
const GOAL_PERCENTAGE = 0.8 // 80% of trial average

/**
 * Determines if the Day 31 paywall should be triggered
 *
 * @param daysSinceFirst - Days since user's first session
 * @param trialExpired - Whether user has already seen/dismissed paywall
 * @returns true if paywall should be shown
 */
export function shouldTriggerPaywall(
  daysSinceFirst: number,
  trialExpired: boolean
): boolean {
  // Already dismissed paywall - don't show again
  if (trialExpired) return false

  // Show on day 31 or later (first session after trial period)
  return daysSinceFirst >= TRIAL_DAYS + 1
}

/**
 * Calculates days since user's first session
 *
 * @param firstSessionDate - Timestamp of first session (ms)
 * @returns Number of days since first session (0 if no sessions)
 */
export function getDaysSinceFirstSession(firstSessionDate?: number): number {
  if (!firstSessionDate) return 0

  const now = Date.now()
  const diffMs = now - firstSessionDate
  return Math.floor(diffMs / MS_PER_DAY)
}

/**
 * Determines if user is in trial period (has premium features)
 *
 * @param daysSinceFirst - Days since first session
 * @param tier - Current tier (free or premium)
 * @param trialExpired - Whether trial has ended
 * @returns true if user should see premium features
 */
export function isInTrialOrPremium(
  daysSinceFirst: number,
  tier: TierType,
  trialExpired: boolean
): boolean {
  // Premium users always have full access
  if (tier === 'premium') return true

  // Free users in trial (first 30 days, haven't seen paywall)
  if (!trialExpired && daysSinceFirst <= TRIAL_DAYS) return true

  return false
}

/**
 * Gets the calendar fade opacity for a given day age
 * Used for FREE tier after Day 31 - creates FOMO with fading history
 *
 * @param dayAge - Age of the calendar entry in days
 * @returns Opacity value 0-1
 */
export function getCalendarFadeOpacity(dayAge: number): number {
  if (dayAge <= 30) return 1.0    // Full visibility
  if (dayAge <= 60) return 0.6    // Noticeably faded
  if (dayAge <= 90) return 0.3    // Hard to read
  return 0.1                       // Shapes visible, detail hidden
}

/**
 * Determines if a calendar entry should be visible and its opacity
 *
 * @param dayAge - Age of the calendar entry in days
 * @param tier - Current tier
 * @param trialExpired - Whether trial has ended
 * @returns { visible: boolean, opacity: number }
 */
export function getCalendarVisibility(
  dayAge: number,
  tier: TierType,
  trialExpired: boolean
): { visible: boolean; opacity: number; blurred: boolean } {
  // Premium users see everything at full opacity
  if (tier === 'premium') {
    return { visible: true, opacity: 1.0, blurred: false }
  }

  // Trial users (not yet expired) see everything
  if (!trialExpired) {
    return { visible: true, opacity: 1.0, blurred: false }
  }

  // FREE after trial: 90-day lookback with fade
  if (dayAge > CALENDAR_LOOKBACK_DAYS) {
    return { visible: false, opacity: 0, blurred: true }
  }

  const opacity = getCalendarFadeOpacity(dayAge)
  const blurred = dayAge > 90 // Blur anything beyond 90 days

  return { visible: true, opacity, blurred }
}

/**
 * Determines if a session is visible to the user
 *
 * @param session - The session to check
 * @param tier - Current tier
 * @param trialExpired - Whether trial has ended
 * @returns true if session should be visible in UI
 */
export function isSessionVisible(
  session: Session,
  tier: TierType,
  trialExpired: boolean
): boolean {
  // Premium sees all
  if (tier === 'premium') return true

  // Trial (not expired) sees all
  if (!trialExpired) return true

  // FREE after trial: only 90-day lookback
  const dayAge = Math.floor((Date.now() - session.startTime) / MS_PER_DAY)
  return dayAge <= CALENDAR_LOOKBACK_DAYS
}

/**
 * Calculates rolling 7-day hours from sessions
 * Used for FREE tier after Day 31
 *
 * @param sessions - All user sessions
 * @returns Hours in the last 7 days
 */
export function getWeeklyRollingHours(sessions: Session[]): number {
  const sevenDaysAgo = Date.now() - 7 * MS_PER_DAY

  const weekSessions = sessions.filter(s => s.startTime >= sevenDaysAgo)
  const totalSeconds = weekSessions.reduce((sum, s) => sum + s.durationSeconds, 0)

  return Math.round((totalSeconds / 3600) * 10) / 10 // Round to 1 decimal
}

/**
 * Calculates the adaptive weekly goal based on trial period behavior
 * Formula: weeklyGoal = avg(dailyMinutes during trial) * 7 * 0.8
 *
 * @param sessions - All user sessions
 * @param trialEndDate - Timestamp when trial ended (used to filter trial sessions)
 * @returns Weekly goal in hours
 */
export function calculateAdaptiveWeeklyGoal(
  sessions: Session[],
  trialEndDate?: number
): number {
  // If no trial end date, use default goal
  if (!trialEndDate) return DEFAULT_WEEKLY_GOAL_HOURS

  // Get sessions from trial period only
  const trialSessions = sessions.filter(s => s.startTime < trialEndDate)

  if (trialSessions.length === 0) return DEFAULT_WEEKLY_GOAL_HOURS

  // Calculate average daily minutes during trial
  const firstSession = Math.min(...trialSessions.map(s => s.startTime))
  const trialDays = Math.max(1, Math.floor((trialEndDate - firstSession) / MS_PER_DAY))

  const totalTrialSeconds = trialSessions.reduce((sum, s) => sum + s.durationSeconds, 0)
  const avgDailyMinutes = (totalTrialSeconds / 60) / trialDays

  // Weekly goal = avg daily * 7 * 0.8 (in hours)
  const weeklyGoalHours = (avgDailyMinutes * 7 * GOAL_PERCENTAGE) / 60

  // Clamp to min/max
  return Math.max(
    MIN_WEEKLY_GOAL_HOURS,
    Math.min(MAX_WEEKLY_GOAL_HOURS, Math.round(weeklyGoalHours * 10) / 10)
  )
}

/**
 * Gets the progress toward weekly goal
 *
 * @param sessions - All user sessions
 * @param trialEndDate - Timestamp when trial ended
 * @returns { current: number, goal: number, percent: number }
 */
export function getWeeklyGoalProgress(
  sessions: Session[],
  trialEndDate?: number
): { current: number; goal: number; percent: number } {
  const current = getWeeklyRollingHours(sessions)
  const goal = calculateAdaptiveWeeklyGoal(sessions, trialEndDate)
  const percent = Math.min(100, Math.round((current / goal) * 100))

  return { current, goal, percent }
}

/**
 * Gets available stat windows based on tier
 * FREE (after trial): 7d, 30d only
 * Premium/Trial: All windows
 *
 * @param tier - Current tier
 * @param trialExpired - Whether trial has ended
 * @returns Array of available window keys
 */
export type StatWindow = '7d' | '30d' | '90d' | 'year' | 'all'

export function getAvailableStatWindows(
  tier: TierType,
  trialExpired: boolean
): { window: StatWindow; available: boolean }[] {
  const windows: StatWindow[] = ['7d', '30d', '90d', 'year', 'all']

  const hasPremiumAccess = tier === 'premium' || !trialExpired

  return windows.map(window => ({
    window,
    available: hasPremiumAccess || window === '7d' || window === '30d'
  }))
}

/**
 * Gets the last achieved milestone for frozen display
 *
 * @param totalHours - User's total hours
 * @returns { achieved: number, name: string } or null if none achieved
 */
export function getLastAchievedMilestone(
  totalHours: number
): { achieved: number; name: string } | null {
  const milestones = [10, 25, 50, 100, 250, 500, 750, 1000, 1500, 2000, 2500, 3500, 5000, 6500, 7500, 8500, 10000]

  // Find highest achieved milestone
  const achieved = milestones.filter(m => totalHours >= m).pop()

  if (!achieved) return null

  const name = achieved >= 1000
    ? `${achieved / 1000}k hours`
    : `${achieved} hours`

  return { achieved, name }
}
