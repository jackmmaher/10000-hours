/**
 * Progress Insights Module
 *
 * Transforms raw session/planning data into actionable insights.
 * Design principle: Pattern recognition, not data dumps.
 */

// Types
export type {
  PatternStrength,
  PracticeShape,
  CommitmentStats,
  MonthlyAverage,
  GrowthTrajectory,
  SuggestedAction,
  DisciplineBreakdown,
  WeekComparison,
} from './types'

// Practice Shape Analysis
export { getPracticeShape } from './practiceShape'

// Commitment Analysis
export { getCommitmentStats } from './commitment'

// Growth Trajectory
export { getGrowthTrajectory } from './growth'

// Suggested Actions
export { getSuggestedActions } from './suggestions'

// Breakdown Analysis
export { getDisciplineBreakdown, getWeekComparison } from './breakdown'
