export const GOAL_HOURS = 10000
export const GOAL_SECONDS = GOAL_HOURS * 3600

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
