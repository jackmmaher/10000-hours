/**
 * Tier Logic - Helper functions for sessions and milestones
 *
 * All features are free. Sign-in only required to create/share content.
 */

import { Session } from './db'
import { MS_PER_DAY } from './constants'
import { generateMilestones } from './milestones'

// Re-export for backward compatibility
export { generateMilestones, GOAL_PRESETS } from './milestones'

/**
 * Calculates days since user's first session
 */
export function getDaysSinceFirstSession(firstSessionDate?: number): number {
  if (!firstSessionDate) return 0

  const now = Date.now()
  const diffMs = now - firstSessionDate
  return Math.floor(diffMs / MS_PER_DAY)
}

/**
 * Calculates rolling 7-day seconds from sessions
 */
export function getWeeklyRollingSeconds(sessions: Session[]): number {
  const sevenDaysAgo = Date.now() - 7 * MS_PER_DAY

  const weekSessions = sessions.filter(s => s.startTime >= sevenDaysAgo)
  const totalSeconds = weekSessions.reduce((sum, s) => sum + s.durationSeconds, 0)

  return totalSeconds
}

/**
 * @deprecated Use getWeeklyRollingSeconds with formatTotalHours instead
 */
export function getWeeklyRollingHours(sessions: Session[]): number {
  const totalSeconds = getWeeklyRollingSeconds(sessions)
  return Math.round((totalSeconds / 3600) * 10) / 10
}

/**
 * Gets the last achieved milestone
 */
export function getLastAchievedMilestone(
  totalHours: number,
  goalHours?: number
): { achieved: number; name: string } | null {
  const milestones = generateMilestones(goalHours)
  const achieved = milestones.filter(m => totalHours >= m).pop()

  if (!achieved) return null

  const name = achieved >= 1000
    ? `${achieved / 1000}k hours`
    : `${achieved} hours`

  return { achieved, name }
}
