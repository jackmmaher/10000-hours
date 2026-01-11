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

// Constants (for testing or customization)
export {
  MIN_DATA,
  PATTERN_THRESHOLDS,
  STRENGTH_LEVELS,
  TREND_THRESHOLDS,
  TIME_BUCKETS,
  TIME_WINDOWS,
  SUGGESTION_THRESHOLDS,
  DEFAULTS,
} from './constants'
