/**
 * Commitment Mode Module
 *
 * Casino-style habit formation with financial stakes via the hour bank.
 */

// RNG for deterministic rewards
export {
  generateCommitmentSeed,
  createCommitmentRNG,
  randomInt,
  randomChance,
  type CommitmentRNG,
} from './rng'

// Outcome calculation
export {
  // Constants
  BONUS_PROBABILITY,
  MYSTERY_PROBABILITY,
  NEAR_MISS_PROBABILITY,
  BONUS_MIN_MINUTES,
  BONUS_MAX_MINUTES,
  MYSTERY_MIN_MINUTES,
  MYSTERY_MAX_MINUTES,
  PENALTY_MIN_MINUTES,
  PENALTY_MAX_MINUTES,
  // Functions
  calculateSessionCompletion,
  calculateMissedPenalty,
  calculateExpectedValue,
  calculateBreakEvenRate,
  formatOutcomeForDisplay,
  // Types
  type SessionOutcomeType,
  type SessionOutcome,
  type MissedPenalty,
} from './outcomes'

// Schedule checking
export {
  // Date helpers
  getStartOfDay,
  getEndOfDay,
  getDayOfWeek,
  getStartOfWeek,
  addDays,
  // Schedule functions
  isDayRequired,
  isWithinWindow,
  getNextRequiredDate,
  getRequiredDatesInRange,
  getTotalRequiredDays,
  // Flexible target helpers
  getFlexibleWeekProgress,
  getDaysRemainingInWeek,
  // Display helpers
  formatWindowForDisplay,
  formatScheduleForDisplay,
} from './schedule'

// Session processing middleware
export {
  processCommitmentSession,
  getTodayCommitmentStatus,
  useGracePeriod,
  type CommitmentSessionResult,
} from './middleware'

// Midnight check for missed sessions
export {
  processMidnightCheck,
  getPendingMissedDaysCount,
  formatMissedDaysForDisplay,
  type MissedDayResult,
  type MidnightCheckResult,
} from './midnightCheck'

// Reminders service
export {
  scheduleCommitmentReminder,
  scheduleWindowClosingReminder,
  cancelCommitmentReminders,
  refreshCommitmentReminders,
  setRemindersEnabled,
  updateReminderSettings,
  COMMITMENT_NOTIFICATION_IDS,
} from './reminders'
