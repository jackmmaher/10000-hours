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
