/**
 * Insights Constants
 *
 * Named constants for all thresholds and magic numbers used in insight analysis.
 * Centralizing these makes the logic self-documenting and enables future A/B testing.
 */

// =============================================================================
// MINIMUM DATA REQUIREMENTS
// These thresholds determine when we have enough data for meaningful analysis
// =============================================================================

export const MIN_DATA = {
  /** Minimum sessions before showing any patterns */
  SESSIONS_FOR_PATTERNS: 5,

  /** Minimum sessions with a specific attribute (discipline, pose) */
  SESSIONS_WITH_ATTRIBUTE: 5,

  /** Minimum sessions for discipline imbalance detection */
  SESSIONS_FOR_DISCIPLINE_BALANCE: 10,

  /** Minimum sessions for day-of-week analysis */
  SESSIONS_FOR_DAY_ANALYSIS: 14,

  /** Minimum sessions for pose variety suggestion */
  SESSIONS_FOR_POSE_VARIETY: 10,

  /** Minimum plans to calculate commitment trend */
  PLANS_FOR_TREND: 4,

  /** Minimum months for growth trajectory */
  MONTHS_FOR_GROWTH: 2,
} as const

// =============================================================================
// PATTERN DETECTION THRESHOLDS
// Percentages that determine when a pattern is "clear enough" to surface
// =============================================================================

export const PATTERN_THRESHOLDS = {
  /** Time of day needs >40% concentration to be a pattern */
  TIME_OF_DAY_PATTERN: 40,

  /** Discipline focus needs >30% to be notable */
  DISCIPLINE_FOCUS: 30,

  /** Pose preference needs >40% to be a pattern */
  POSE_PATTERN: 40,

  /** Weekday practitioner needs >=75% Mon-Fri */
  WEEKDAY_PRACTITIONER: 75,

  /** Weekend warrior threshold (fraction) */
  WEEKEND_WARRIOR: 0.4,

  /** Single day dominance threshold (for "Tuesdays are your day") */
  SINGLE_DAY_DOMINANT: 25,

  /** Discipline imbalance - top discipline dominance */
  DISCIPLINE_DOMINANT: 40,

  /** Minimum sessions for underrepresented discipline */
  DISCIPLINE_UNDERREPRESENTED: 5,
} as const

// =============================================================================
// STRENGTH CONVERSION
// Map percentages to 1-5 strength scores for UI display
// =============================================================================

export const STRENGTH_LEVELS = {
  /** Percentage thresholds for strength scores 5, 4, 3, 2, 1 */
  LEVEL_5: 80,
  LEVEL_4: 65,
  LEVEL_3: 50,
  LEVEL_2: 35,
} as const

// =============================================================================
// TREND DETECTION
// Thresholds for determining improving/declining/stable trends
// =============================================================================

export const TREND_THRESHOLDS = {
  /** Commitment rate change to be considered improving/declining */
  COMMITMENT_CHANGE: 0.15,

  /** Growth trajectory change percent for deepening/shortening */
  GROWTH_CHANGE: 20,

  /** Week-over-week change percent for up/down trend */
  WEEKLY_CHANGE: 10,
} as const

// =============================================================================
// TIME BUCKETS
// Hour boundaries for time-of-day analysis
// =============================================================================

export const TIME_BUCKETS = {
  /** Morning starts at 5am */
  MORNING_START: 5,

  /** Afternoon starts at noon */
  AFTERNOON_START: 12,

  /** Evening starts at 5pm */
  EVENING_START: 17,

  /** Night starts at 10pm */
  NIGHT_START: 22,
} as const

// =============================================================================
// TIME WINDOWS
// Duration thresholds for recent vs older data
// =============================================================================

export const TIME_WINDOWS = {
  /** Days to consider "recent" for commitment analysis (4 weeks) */
  RECENT_DAYS: 28,

  /** Number of months to show in growth chart */
  MONTHS_TO_SHOW: 4,
} as const

// =============================================================================
// SUGGESTIONS
// Thresholds for when to show various suggestions
// =============================================================================

export const SUGGESTION_THRESHOLDS = {
  /** Below this fraction of avg is "significantly below average" */
  WEAK_DAY_FRACTION: 0.5,

  /** Below this fraction of total makes a day "weak" */
  WEAK_DAY_MAX_FRACTION: 0.1,

  /** Minimum insight text length to be shareable */
  INSIGHT_MIN_LENGTH: 20,

  /** Minimum unshared insights before suggesting to share */
  UNSHARED_INSIGHTS_MIN: 3,

  /** Minimum suggestions before adding fallbacks */
  MIN_SUGGESTIONS: 2,

  /** Minimum sessions for fallback suggestions */
  SESSIONS_FOR_FALLBACKS: 3,

  /** Minimum insights before suggesting to record more */
  INSIGHTS_THRESHOLD: 3,

  /** Minimum sessions for insight recording suggestion */
  SESSIONS_FOR_INSIGHT_SUGGESTION: 5,

  /** Minimum unique practice days for consistency note */
  UNIQUE_DAYS_FOR_CONSISTENCY: 5,

  /** Maximum suggestions to show */
  MAX_SUGGESTIONS: 4,
} as const

// =============================================================================
// DEFAULTS
// Fallback values when data is missing
// =============================================================================

export const DEFAULTS = {
  /** Default planned minutes per session when no duration set */
  PLANNED_MINUTES_PER_SESSION: 20,

  /** Default total sessions in a course */
  COURSE_TOTAL_SESSIONS: 5,
} as const
