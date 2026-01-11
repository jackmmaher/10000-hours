/**
 * Progress Insights - Re-export barrel
 *
 * This file re-exports from the modular insights/ folder for backward compatibility.
 * New code should import directly from './insights' or './insights/[module]'.
 */

export type {
  PatternStrength,
  PracticeShape,
  CommitmentStats,
  MonthlyAverage,
  GrowthTrajectory,
  SuggestedAction,
  DisciplineBreakdown,
  WeekComparison,
} from './insights'

export {
  getPracticeShape,
  getCommitmentStats,
  getGrowthTrajectory,
  getSuggestedActions,
  getDisciplineBreakdown,
  getWeekComparison,
} from './insights'
