// Main goal
export const GOAL_HOURS = 10000
export const GOAL_SECONDS = GOAL_HOURS * 3600

// Time constants
export const MS_PER_DAY = 24 * 60 * 60 * 1000

// Trial/tier constants
export const TRIAL_DAYS = 30
export const CALENDAR_LOOKBACK_DAYS = 90

// Adaptive weekly goal constraints
export const MIN_WEEKLY_GOAL_HOURS = 1
export const MAX_WEEKLY_GOAL_HOURS = 35  // 5h/day max
export const DEFAULT_WEEKLY_GOAL_HOURS = 5
export const GOAL_PERCENTAGE = 0.8       // 80% of trial average

// Stats time windows
export const TIME_WINDOWS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last 6 months', days: 180 },
  { label: 'Last year', days: 365 },
  { label: 'All time', days: null },
] as const

export type TimeWindow = typeof TIME_WINDOWS[number]

export const ZEN_MESSAGE_BEFORE = 'Before enlightenment, chop wood, carry water.'
export const ZEN_MESSAGE_AFTER = 'After enlightenment, chop wood, carry water.'
