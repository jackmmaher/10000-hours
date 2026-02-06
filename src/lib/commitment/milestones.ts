/**
 * Commitment Streak Milestones
 *
 * Meaning-focused milestones based on habit formation research.
 * 66 days = average habit formation (Lally et al., 2009).
 */

export interface StreakMilestone {
  title: string
  message: string
}

const STREAK_MILESTONES: Record<number, StreakMilestone> = {
  7: { title: '1 week', message: 'One week. The rhythm is forming.' },
  21: { title: '3 weeks', message: 'Three weeks. Your body knows the way now.' },
  30: { title: '1 month', message: 'One month. This practice is part of your life.' },
  66: { title: '66 days', message: 'Research says this is when habits become automatic.' },
  90: { title: '90 days', message: "Ninety days. You don't need this system anymore." },
}

/**
 * Get streak milestone info if the given day count matches a milestone.
 *
 * @param days - The current streak day count
 * @returns Milestone info if this is a milestone day, null otherwise
 */
export function getStreakMilestone(days: number): StreakMilestone | null {
  return STREAK_MILESTONES[days] ?? null
}
