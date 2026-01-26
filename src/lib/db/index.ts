/**
 * Database Module - Barrel Export
 *
 * Re-exports all database types, schema, and helper functions.
 */

// Types
export type {
  Session,
  AppState,
  TierType,
  Achievement,
  UserProfile,
  ThemeMode,
  Season,
  SeasonOverride,
  TimeOverride,
  UserSettings,
  Insight,
  PlannedSession,
  UserCourseProgress,
  SavedTemplate,
  PearlDraft,
  TemplateDraft,
  UserPreferences,
  WellbeingDimension,
  WellbeingCheckIn,
  WellbeingSettings,
  RepeatRule,
  RepeatFrequency,
  UserAffinities,
  CommitmentScheduleType,
  CommitmentWindowType,
  CommitmentEndBehavior,
  CommitmentSettings,
  CommitmentDayLog,
  CommitmentHistory,
} from './types'

// Schema and db instance
export { MeditationDB, db } from './schema'

// App State
export {
  initAppState,
  markEnlightenmentReached,
  saveSessionInProgress,
  clearSessionInProgress,
  getSessionInProgress,
} from './appState'

// Sessions
export {
  getAllSessions,
  addSession,
  updateSession,
  getSessionByUuid,
  deleteSession,
  updateSessionFull,
  getTotalSeconds,
} from './sessions'

// Profile
export { getProfile, updateProfile, setFirstSessionDate } from './profile'

// Settings
export { getSettings, updateSettings } from './settings'

// Notifications
export {
  addNotification,
  getUnreadNotifications,
  getAllNotifications,
  markNotificationAsRead,
  dismissNotification,
  snoozeNotification,
  getUnreadNotificationCount,
  deleteNotification,
  hasNotificationWithTitle,
} from './notifications'

// Achievements
export { getAchievements, addAchievement, recordMilestoneIfNew } from './achievements'

// Insights
export {
  addInsight,
  updateInsight,
  linkInsightToPearl,
  getInsights,
  getInsightsWithContent,
  getInsightById,
  deleteInsight,
  markInsightAsShared,
  getUnsharedInsights,
  getSharedInsights,
  getInsightsBySessionId,
  getLatestInsight,
} from './insights'

// Plans
export {
  addPlannedSession,
  getPlannedSession,
  getIncompletePlansForDate,
  getAllPlansForDate,
  getPlannedSessionsForWeek,
  getPlannedSessionsForMonth,
  updatePlannedSession,
  deletePlannedSession,
  getNextPlannedSession,
  linkSessionToPlan,
  getPlannedSessionByLinkedUuid,
  getAllPlannedSessions,
  relinkOrphanedPlans,
  markPlanCompleted,
  getUpcomingPlans,
} from './plans'

// Courses
export {
  getCourseProgress,
  getAllCourseProgress,
  getActiveCourses,
  startCourse,
  updateCourseProgress,
  markCourseSessionComplete,
  pauseCourse,
  completeCourse,
} from './courses'

// Templates
export {
  saveTemplate,
  unsaveTemplate,
  isTemplateSaved,
  getSavedTemplates,
  savePearlDraft,
  getPearlDraft,
  deletePearlDraft,
  getAllPearlDrafts,
  saveTemplateDraft,
  getTemplateDraft,
  deleteTemplateDraft,
  hasTemplateDraft,
} from './templates'

// Preferences
export { getUserPreferences, updateUserPreferences } from './preferences'

// Wellbeing
export {
  getWellbeingSettings,
  updateWellbeingSettings,
  addWellbeingDimension,
  getWellbeingDimensions,
  getAllWellbeingDimensions,
  archiveWellbeingDimension,
  restoreWellbeingDimension,
  addWellbeingCheckIn,
  getCheckInsForDimension,
  getLatestCheckIns,
  getAllCheckIns,
  getCheckInHistory,
  getImprovementForDimension,
} from './wellbeing'

// Repeat Rules
export {
  addRepeatRule,
  getRepeatRule,
  updateRepeatRule,
  deleteRepeatRule,
  getAllRepeatRules,
  generateSessionsFromRule,
  saveGeneratedSessions,
  createRepeatRuleWithSessions,
} from './repeatRules'

// User Affinities (Adaptive Recommendations)
export { getUserAffinities, saveUserAffinities, resetUserAffinities } from './affinities'

// Commitment Mode
export {
  getDefaultCommitmentSettings,
  getCommitmentSettings,
  updateCommitmentSettings,
  getCommitmentDayLog,
  getCommitmentDayLogs,
  addCommitmentDayLog,
  getCompletedSessionCount,
  getCommitmentHistory,
  archiveCommitment,
  getLastCommitment,
  resetCommitmentSettings,
  clearCommitmentDayLogs,
} from './commitmentSettings'
