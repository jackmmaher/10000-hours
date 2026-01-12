/**
 * Database Module
 *
 * Comprehensive local database using Dexie (IndexedDB wrapper).
 *
 * Architecture:
 * - Session storage with metadata
 * - User profile and settings
 * - Insights and pearls
 * - Planned sessions and courses
 * - Wellbeing tracking
 *
 * This file is a barrel re-export for backward compatibility.
 * See src/lib/db/ for the modular implementation.
 */

// Types
export type {
  Session,
  AppState,
  TierType,
  Achievement,
  UserProfile,
  ThemeMode,
  VisualEffects,
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
} from './db/index'

// Schema and db instance
export { MeditationDB, db } from './db/index'

// App State
export { initAppState, markEnlightenmentReached } from './db/index'

// Sessions
export {
  getAllSessions,
  addSession,
  updateSession,
  getSessionByUuid,
  deleteSession,
  updateSessionFull,
  getTotalSeconds,
} from './db/index'

// Profile
export { getProfile, updateProfile, setFirstSessionDate } from './db/index'

// Settings
export { getSettings, updateSettings } from './db/index'

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
} from './db/index'

// Achievements
export { getAchievements, addAchievement, recordMilestoneIfNew } from './db/index'

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
} from './db/index'

// Plans
export {
  addPlannedSession,
  getPlannedSession,
  getIncompletePlansForDate,
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
} from './db/index'

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
} from './db/index'

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
} from './db/index'

// Preferences
export { getUserPreferences, updateUserPreferences } from './db/index'

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
} from './db/index'

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
} from './db/index'
