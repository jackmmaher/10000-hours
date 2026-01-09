// Default for projection calculations when no user goal set
// NOT shown to users — internal fallback only
export const DEFAULT_GOAL_HOURS = 10000
export const DEFAULT_GOAL_SECONDS = DEFAULT_GOAL_HOURS * 3600

// Time constants
export const MS_PER_DAY = 24 * 60 * 60 * 1000

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
