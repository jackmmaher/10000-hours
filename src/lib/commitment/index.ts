/**
 * Commitment Mode Module
 *
 * Evidence-based habit formation with consistency tracking.
 */

// Outcome calculation & types
export {
  calculateConsistencyScore,
  calculateDayNumber,
  getEncouragementMessage,
  type SessionCompletionResult,
  type MissedDayNotice,
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
  consumeGracePeriod,
  type CommitmentSessionResult,
} from './middleware'

// Midnight check for missed sessions
export {
  processMidnightCheck,
  getPendingMissedDaysCount,
  formatMissedDaysForDisplay,
  type MidnightCheckResult,
} from './midnightCheck'

// Streak milestones
export { getStreakMilestone, type StreakMilestone } from './milestones'

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
