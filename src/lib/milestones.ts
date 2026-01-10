/**
 * Milestone generation for Still Hours
 *
 * Principles:
 * - Round numbers only (no 17h or 33h)
 * - Prefer even numbers where possible
 * - Logarithmic: dense at start, sparse toward end
 * - Universal early wins: 2h, 5h, 10h always exist
 */

export const GOAL_PRESETS = [25, 50, 100, 250, 500, 1000, 2500, 5000, 10000] as const

/**
 * Infinite mode milestone sequence.
 * Used when user has no explicit goal.
 */
const INFINITE_MILESTONES = [
  2, 5, 10, 25, 50, 100,
  150, 200, 250, 300, 400, 500,
  750, 1000, 1500, 2000, 2500,
  3000, 4000, 5000, 6000, 7500,
  10000, 15000, 20000, 25000, 50000, 100000
]

/**
 * Round to "nice" numbers for milestones.
 */
function roundToNiceNumber(n: number): number {
  if (n <= 10) return Math.round(n / 5) * 5 || 5
  if (n <= 50) return Math.round(n / 5) * 5
  if (n <= 100) return Math.round(n / 25) * 25
  if (n <= 500) return Math.round(n / 50) * 50
  if (n <= 1000) return Math.round(n / 100) * 100
  return Math.round(n / 250) * 250
}

/**
 * Generate milestones based on user's practice goal.
 *
 * @param goalHours - User's goal, or undefined for infinite mode
 * @returns Array of milestone hours
 */
export function generateMilestones(goalHours?: number): number[] {
  if (!goalHours) {
    return INFINITE_MILESTONES
  }

  const earlyWins = [2, 5, 10]
  const milestones: number[] = []

  // Add early wins below goal
  for (const m of earlyWins) {
    if (m < goalHours) {
      milestones.push(m)
    }
  }

  // Generate percentage-based milestones (~20%, ~40%, ~60%, ~80%)
  const percentages = [0.2, 0.4, 0.6, 0.8]

  for (const pct of percentages) {
    const raw = goalHours * pct
    const rounded = roundToNiceNumber(raw)
    const last = milestones[milestones.length - 1] || 0

    if (rounded > last && rounded < goalHours) {
      milestones.push(rounded)
    }
  }

  // Always end with goal
  milestones.push(goalHours)

  return milestones
}

/**
 * Generate milestones for goal extension.
 * Returns only NEW milestones between previous goal and new goal.
 *
 * @param previousGoal - The goal user just completed
 * @param newGoal - The extended goal
 * @returns Array of new milestone hours (excludes already-achieved)
 */
export function generateExtensionMilestones(
  previousGoal: number,
  newGoal: number
): number[] {
  const fullMilestones = generateMilestones(newGoal)
  return fullMilestones.filter(m => m > previousGoal)
}

/**
 * Get the next milestone for given hours and goal.
 */
export function getNextMilestone(
  currentHours: number,
  goalHours?: number
): number | null {
  const milestones = generateMilestones(goalHours)
  return milestones.find(m => m > currentHours) ?? null
}

/**
 * Get the previous milestone (most recently achieved).
 */
export function getPreviousMilestone(
  currentHours: number,
  goalHours?: number
): number {
  const milestones = generateMilestones(goalHours)
  const achieved = milestones.filter(m => m <= currentHours)
  return achieved[achieved.length - 1] || 0
}

// ============================================================================
// SESSION COUNT MILESTONES (Variable Dopamine Rewards)
// ============================================================================

/**
 * Session count milestone type.
 * These are surprise rewards - less predictable than hour milestones.
 */
export interface SessionMilestone {
  type: 'sessions'
  count: number
  label: string
  zenMessage: string
}

/**
 * Session counts that trigger milestones.
 * Spaced to create surprise without predictability.
 */
const SESSION_MILESTONES = [50, 100, 200, 365, 500, 1000, 2000, 5000, 10000]

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, 4th, etc.)
 */
function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

/**
 * Check if a session count is a milestone.
 */
export function checkSessionMilestone(sessionCount: number): SessionMilestone | null {
  if (SESSION_MILESTONES.includes(sessionCount)) {
    return {
      type: 'sessions',
      count: sessionCount,
      label: `${sessionCount}${getOrdinalSuffix(sessionCount)} session`,
      zenMessage: 'Each moment matters.'
    }
  }
  return null
}

// ============================================================================
// WEEKLY "FIRST" MILESTONES (Variable Dopamine Rewards)
// ============================================================================

/**
 * Weekly first milestone type.
 * Celebrates first occurrences each week for surprise factor.
 */
export interface WeeklyFirstMilestone {
  type: 'weekly_first'
  kind: 'morning' | 'evening' | 'long_session'
  label: string
  zenMessage: string
}

const MORNING_START = 5   // 5am
const MORNING_END = 10    // 10am
const EVENING_START = 18  // 6pm
const EVENING_END = 22    // 10pm
const LONG_SESSION_THRESHOLD = 1800  // 30 minutes in seconds

/**
 * Get the start of the current week (Monday).
 */
function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)  // Monday start
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Check if a session is the first of a particular kind this week.
 * Returns a milestone if this is a "first" worth celebrating.
 *
 * @param sessionStartTime - Start time of the completed session
 * @param sessionDuration - Duration in seconds
 * @param weekSessions - All sessions this week (including the just-completed one)
 */
export function checkWeeklyFirst(
  sessionStartTime: number,
  sessionDuration: number,
  weekSessions: Array<{ startTime: number; durationSeconds: number }>
): WeeklyFirstMilestone | null {
  const sessionDate = new Date(sessionStartTime)
  const hour = sessionDate.getHours()
  const weekStart = getStartOfWeek(sessionDate)

  // Filter to sessions before this one (within this week)
  const previousSessionsThisWeek = weekSessions.filter(s =>
    s.startTime < sessionStartTime && s.startTime >= weekStart.getTime()
  )

  // Check if first morning session this week
  if (hour >= MORNING_START && hour < MORNING_END) {
    const previousMorningSessions = previousSessionsThisWeek.filter(s => {
      const h = new Date(s.startTime).getHours()
      return h >= MORNING_START && h < MORNING_END
    })
    if (previousMorningSessions.length === 0) {
      return {
        type: 'weekly_first',
        kind: 'morning',
        label: 'First morning sit this week',
        zenMessage: 'A beautiful beginning.'
      }
    }
  }

  // Check if first evening session this week
  if (hour >= EVENING_START && hour < EVENING_END) {
    const previousEveningSessions = previousSessionsThisWeek.filter(s => {
      const h = new Date(s.startTime).getHours()
      return h >= EVENING_START && h < EVENING_END
    })
    if (previousEveningSessions.length === 0) {
      return {
        type: 'weekly_first',
        kind: 'evening',
        label: 'First evening sit this week',
        zenMessage: 'A peaceful close.'
      }
    }
  }

  // Check if first long session (30+ min) this week
  if (sessionDuration >= LONG_SESSION_THRESHOLD) {
    const previousLongSessions = previousSessionsThisWeek.filter(s =>
      s.durationSeconds >= LONG_SESSION_THRESHOLD
    )
    if (previousLongSessions.length === 0) {
      return {
        type: 'weekly_first',
        kind: 'long_session',
        label: 'First 30+ minute sit this week',
        zenMessage: 'Depth found in stillness.'
      }
    }
  }

  return null
}

// ============================================================================
// NEAR-MISS VISIBILITY
// ============================================================================

/**
 * Check if user is close to next hour milestone.
 * Returns the hours remaining if within threshold.
 */
export function getNearMissInfo(
  currentHours: number,
  goalHours?: number
): { hoursRemaining: number; nextMilestone: number } | null {
  const next = getNextMilestone(currentHours, goalHours)
  if (!next) return null

  const remaining = next - currentHours
  // Show near-miss if within 0.5 hours (30 minutes)
  if (remaining <= 0.5 && remaining > 0) {
    return {
      hoursRemaining: remaining,
      nextMilestone: next
    }
  }
  return null
}
