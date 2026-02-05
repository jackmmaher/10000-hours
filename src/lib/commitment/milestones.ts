/**
 * Commitment Streak Milestones
 *
 * Defines milestone thresholds for commitment streaks.
 * Used by CommitmentOutcomeModal to display milestone celebrations.
 */

interface MilestoneInfo {
  title: string
  message: string
}

const STREAK_MILESTONES: Record<number, MilestoneInfo> = {
  3: { title: '3 days', message: 'Building momentum.' },
  7: { title: '1 week', message: 'One week strong.' },
  14: { title: '2 weeks', message: 'The habit is forming.' },
  21: { title: '3 weeks', message: 'This is who you are now.' },
  30: { title: '1 month', message: 'Unbreakable.' },
  60: { title: '2 months', message: 'Extraordinary.' },
  90: { title: '90 days', message: 'Master.' },
}

/**
 * Get streak milestone info if the given day count matches a milestone.
 *
 * @param days - The current streak day count
 * @returns Milestone info if this is a milestone day, null otherwise
 */
export function getStreakMilestone(days: number): MilestoneInfo | null {
  return STREAK_MILESTONES[days] ?? null
}
