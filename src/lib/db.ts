import Dexie, { Table } from 'dexie'
import { InAppNotification, NotificationPreferences, DEFAULT_NOTIFICATION_PREFERENCES } from './notifications'

export interface Session {
  id?: number
  uuid: string
  startTime: number  // Unix timestamp (ms)
  endTime: number    // Unix timestamp (ms)
  durationSeconds: number
  // Per-session metadata (added in v7)
  pose?: string             // Seating position/pose
  discipline?: string       // Meditation technique
  notes?: string            // Intention or notes for this session
}

export interface AppState {
  id: string
  hasReachedEnlightenment: boolean  // True once 10,000 hours reached
  enlightenmentReachedAt?: number   // Timestamp when crossed threshold
}

export type TierType = 'free' | 'premium'

export interface Achievement {
  hours: number                     // Milestone value (2, 5, 10, 25, etc.)
  achievedAt: number                // Timestamp when achieved
  name: string                      // Display name ("2 hours", "5 hours", etc.)
}

export interface UserProfile {
  id: 1
  tier: TierType
  premiumExpiryDate?: number        // When premium subscription expires
  originalPurchaseDate?: number     // First purchase date
  firstSessionDate?: number         // For Day 31 trigger calculation
  trialExpired: boolean             // Has seen Day 31 banner
  trialEndDate?: number             // When trial ended (for adaptive goal)
  achievements?: Achievement[]      // Recorded milestone achievements
}

export type ThemeMode = 'auto' | 'manual'
export type VisualEffects = 'calm' | 'expressive'
export type SeasonOverride = 'spring' | 'summer' | 'autumn' | 'winter' | 'neutral'
export type TimeOverride = 'morning' | 'daytime' | 'evening' | 'night'

export interface UserSettings {
  id: 1
  hideTimeDisplay: boolean
  skipInsightCapture: boolean  // Skip post-session insight recording prompt
  themeMode: ThemeMode
  visualEffects: VisualEffects
  audioFeedbackEnabled: boolean  // Play subtle sounds on complete/milestone
  notificationPreferences: NotificationPreferences  // In-app notification settings
  // Manual theme overrides (only used when themeMode === 'manual')
  manualSeason?: SeasonOverride
  manualTime?: TimeOverride
}

export interface Insight {
  id: string
  sessionId: string | null
  rawText: string
  formattedText: string | null
  sharedPearlId: string | null  // Links to Supabase pearl if shared
  createdAt: Date
  updatedAt: Date | null
}

export interface PlannedSession {
  id?: number
  date: number              // Date timestamp (start of day)
  plannedTime?: string      // "07:30" format
  duration?: number         // Planned duration in minutes
  title?: string            // Session title (e.g., "First Breath Awakening")
  pose?: string             // Seating position/pose
  discipline?: string       // Meditation discipline (e.g., "Vipassana", "Zen")
  notes?: string            // Guidance notes
  createdAt: number
  completed?: boolean       // Marked when session is done
  // v6 additions for session linking
  linkedSessionUuid?: string      // Link to actual Session when completed
  sourceTemplateId?: string       // If adopted from community template
  courseId?: string               // If part of a course
  coursePosition?: number         // Position in course (1 of 5)
}

export interface UserCourseProgress {
  id: string                      // UUID
  courseId: string                // References Supabase course
  sessionsCompleted: number[]     // Array of completed session positions
  startedAt: number               // Timestamp when course started
  lastActivityAt: number          // Last activity timestamp
  status: 'active' | 'paused' | 'completed'
}

export interface SavedTemplate {
  id: string                      // UUID
  templateId: string              // References Supabase session_template
  savedAt: number                 // Timestamp when saved
}

// Pearl draft - work in progress before posting to community
export interface PearlDraft {
  id: string                      // UUID
  insightId: string               // Source insight
  text: string                    // Draft pearl text (≤280 chars)
  createdAt: number               // When draft started
  updatedAt: number               // Last edit
}

// Template draft - work in progress before publishing to community
export interface TemplateDraft {
  id: string                      // Always 'current' - only one draft at a time
  title: string
  tagline: string
  durationGuidance: string
  discipline: string
  posture: string
  bestTime: string
  environment: string
  guidanceNotes: string
  intention: string
  recommendedAfterHours: number
  intentTags: string[]            // Intent-based tags for filtering
  createdAt: number
  updatedAt: number
}

// User profile preferences for meditation
export interface UserPreferences {
  id: 1
  displayName?: string
  avatarUrl?: string               // URL or base64 data URI
  preferredPosture?: string        // 'seated-cushion' | 'seated-chair' | 'lying' | 'walking' | 'varies'
  preferredDiscipline?: string     // 'open' | 'breath' | 'vipassana' | 'zen' | 'loving-kindness' | 'body-scan' | 'varies'
  preferredDuration?: string       // '5-10' | '15-20' | '30+' | 'varies'
  preferredTime?: string           // 'morning' | 'afternoon' | 'evening' | 'varies'
  /**
   * User's practice goal in hours.
   * - undefined/null = infinite mode (no ceiling, milestones continue forever)
   * - number = specific goal (25, 50, 100, etc.)
   */
  practiceGoalHours?: number
  updatedAt: number
}

// Wellbeing dimension being tracked
export interface WellbeingDimension {
  id: string                       // UUID
  name: string                     // 'anxiety' | 'stress' | 'low-mood' | custom
  label: string                    // Display label (e.g., "Anxiety", "Work Stress")
  description?: string             // Optional description
  isCustom: boolean                // True if user-defined
  createdAt: number
  archivedAt?: number              // Soft delete - when user stops tracking
}

// A single check-in entry for a dimension
export interface WellbeingCheckIn {
  id: string                       // UUID
  dimensionId: string              // References WellbeingDimension
  score: number                    // 1-10 scale
  note?: string                    // Optional journal note
  createdAt: number
}

// Wellbeing tracking settings
export interface WellbeingSettings {
  id: 1
  checkInFrequencyDays: number     // 7-30, how often to prompt
  lastCheckInPrompt?: number       // Timestamp of last prompt
  nextCheckInDue?: number          // When next check-in is due
  isEnabled: boolean               // Master toggle for wellbeing tracking
}

class MeditationDB extends Dexie {
  sessions!: Table<Session>
  appState!: Table<AppState>
  profile!: Table<UserProfile>
  settings!: Table<UserSettings>
  insights!: Table<Insight>
  plannedSessions!: Table<PlannedSession>
  courseProgress!: Table<UserCourseProgress>
  savedTemplates!: Table<SavedTemplate>
  pearlDrafts!: Table<PearlDraft>
  templateDrafts!: Table<TemplateDraft>
  userPreferences!: Table<UserPreferences>
  wellbeingDimensions!: Table<WellbeingDimension>
  wellbeingCheckIns!: Table<WellbeingCheckIn>
  wellbeingSettings!: Table<WellbeingSettings>
  notifications!: Table<InAppNotification>

  constructor() {
    super('10000hours')

    // v1: Original schema
    this.version(1).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id'
    })

    // v2: Add profile and settings tables for tier logic
    this.version(2).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id'
    }).upgrade(async tx => {
      // Backfill firstSessionDate from earliest session
      const sessions = await tx.table('sessions').orderBy('startTime').first()
      const firstSessionDate = sessions?.startTime ?? undefined

      // Initialize profile with defaults
      await tx.table('profile').put({
        id: 1,
        tier: 'free',
        firstSessionDate,
        trialExpired: false
      })

      // Initialize settings with defaults
      await tx.table('settings').put({
        id: 1,
        hideTimeDisplay: false
      })
    })

    // v3: Add insights table for voice note capture
    this.version(3).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt'
    })

    // v4: Add sharedPearlId to insights for tracking shared pearls
    this.version(4).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId'
    }).upgrade(async tx => {
      // Backfill existing insights with null sharedPearlId
      await tx.table('insights').toCollection().modify(insight => {
        insight.sharedPearlId = null
      })
    })

    // v5: Add plannedSessions table for meditation planning
    this.version(5).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId',
      plannedSessions: '++id, date, createdAt'
    })

    // v6: Extend plannedSessions with session linking, add course progress and saved templates
    this.version(6).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId',
      plannedSessions: '++id, date, createdAt, linkedSessionUuid, courseId',
      courseProgress: 'id, courseId, status',
      savedTemplates: 'id, templateId, savedAt'
    }).upgrade(async tx => {
      // Backfill existing planned sessions with null linking fields
      await tx.table('plannedSessions').toCollection().modify(plan => {
        plan.linkedSessionUuid = plan.linkedSessionUuid ?? null
        plan.sourceTemplateId = plan.sourceTemplateId ?? null
        plan.courseId = plan.courseId ?? null
        plan.coursePosition = plan.coursePosition ?? null
      })
    })

    // v7: Add per-session metadata (pose, discipline, notes) to sessions
    // No index changes needed - fields are optional and stored directly on session
    this.version(7).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId',
      plannedSessions: '++id, date, createdAt, linkedSessionUuid, courseId',
      courseProgress: 'id, courseId, status',
      savedTemplates: 'id, templateId, savedAt'
    })

    // v8: Add pearl drafts table for work-in-progress pearls
    this.version(8).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId',
      plannedSessions: '++id, date, createdAt, linkedSessionUuid, courseId',
      courseProgress: 'id, courseId, status',
      savedTemplates: 'id, templateId, savedAt',
      pearlDrafts: 'id, insightId, updatedAt'
    })

    // v9: Add template drafts table for work-in-progress templates
    this.version(9).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId',
      plannedSessions: '++id, date, createdAt, linkedSessionUuid, courseId',
      courseProgress: 'id, courseId, status',
      savedTemplates: 'id, templateId, savedAt',
      pearlDrafts: 'id, insightId, updatedAt',
      templateDrafts: 'id, updatedAt'
    })

    // v10: Add user preferences, wellbeing tracking tables
    this.version(10).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId',
      plannedSessions: '++id, date, createdAt, linkedSessionUuid, courseId',
      courseProgress: 'id, courseId, status',
      savedTemplates: 'id, templateId, savedAt',
      pearlDrafts: 'id, insightId, updatedAt',
      templateDrafts: 'id, updatedAt',
      userPreferences: 'id',
      wellbeingDimensions: 'id, name, createdAt',
      wellbeingCheckIns: 'id, dimensionId, createdAt',
      wellbeingSettings: 'id'
    })

    // v11: Add notifications table for in-app notification center
    this.version(11).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt, sharedPearlId',
      plannedSessions: '++id, date, createdAt, linkedSessionUuid, courseId',
      courseProgress: 'id, courseId, status',
      savedTemplates: 'id, templateId, savedAt',
      pearlDrafts: 'id, insightId, updatedAt',
      templateDrafts: 'id, updatedAt',
      userPreferences: 'id',
      wellbeingDimensions: 'id, name, createdAt',
      wellbeingCheckIns: 'id, dimensionId, createdAt',
      wellbeingSettings: 'id',
      notifications: 'id, type, createdAt, readAt'
    })
  }
}

export const db = new MeditationDB()

// Initialize app state if not exists
export async function initAppState(): Promise<AppState> {
  let state = await db.appState.get('main')
  if (!state) {
    state = { id: 'main', hasReachedEnlightenment: false }
    await db.appState.put(state)
  }
  return state
}

export async function markEnlightenmentReached(): Promise<void> {
  await db.appState.put({
    id: 'main',
    hasReachedEnlightenment: true,
    enlightenmentReachedAt: Date.now()
  })
}

export async function getAllSessions(): Promise<Session[]> {
  return db.sessions.orderBy('startTime').toArray()
}

export async function addSession(session: Omit<Session, 'id'>): Promise<number> {
  return db.sessions.add(session as Session)
}

export async function updateSession(
  uuid: string,
  updates: Partial<Pick<Session, 'pose' | 'discipline' | 'notes'>>
): Promise<void> {
  const session = await db.sessions.where('uuid').equals(uuid).first()
  if (session && session.id) {
    await db.sessions.update(session.id, updates)
  }
}

export async function getSessionByUuid(uuid: string): Promise<Session | undefined> {
  return db.sessions.where('uuid').equals(uuid).first()
}

export async function deleteSession(uuid: string): Promise<void> {
  const session = await db.sessions.where('uuid').equals(uuid).first()
  if (session && session.id) {
    await db.sessions.delete(session.id)
  }
}

export async function updateSessionFull(
  uuid: string,
  updates: Partial<Pick<Session, 'startTime' | 'endTime' | 'durationSeconds' | 'pose' | 'discipline' | 'notes'>>
): Promise<void> {
  const session = await db.sessions.where('uuid').equals(uuid).first()
  if (session && session.id) {
    await db.sessions.update(session.id, updates)
  }
}

export async function getTotalSeconds(): Promise<number> {
  const sessions = await db.sessions.toArray()
  return sessions.reduce((sum, s) => sum + s.durationSeconds, 0)
}

// Profile helpers
export async function getProfile(): Promise<UserProfile> {
  let profile = await db.profile.get(1)
  if (!profile) {
    // Initialize profile for new users
    const firstSession = await db.sessions.orderBy('startTime').first()
    profile = {
      id: 1,
      tier: 'free',
      firstSessionDate: firstSession?.startTime,
      trialExpired: false
    }
    await db.profile.put(profile)
  }
  return profile
}

export async function updateProfile(updates: Partial<Omit<UserProfile, 'id'>>): Promise<void> {
  await db.profile.update(1, updates)
}

export async function setFirstSessionDate(timestamp: number): Promise<void> {
  const profile = await getProfile()
  if (!profile.firstSessionDate) {
    await updateProfile({ firstSessionDate: timestamp })
  }
}

// Settings helpers
export async function getSettings(): Promise<UserSettings> {
  let settings = await db.settings.get(1)
  if (!settings) {
    settings = {
      id: 1,
      hideTimeDisplay: false,
      skipInsightCapture: false,
      themeMode: 'auto',
      visualEffects: 'calm',
      audioFeedbackEnabled: false,
      notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES
    }
    await db.settings.put(settings)
  }
  // Backfill themeMode for existing users
  if (!settings.themeMode) {
    settings.themeMode = 'auto'
    await db.settings.put(settings)
  }
  // Backfill visualEffects for existing users
  if (!settings.visualEffects) {
    settings.visualEffects = 'calm'
    await db.settings.put(settings)
  }
  // Backfill skipInsightCapture for existing users
  if (settings.skipInsightCapture === undefined) {
    settings.skipInsightCapture = false
    await db.settings.put(settings)
  }
  // Backfill audioFeedbackEnabled for existing users
  if (settings.audioFeedbackEnabled === undefined) {
    settings.audioFeedbackEnabled = false
    await db.settings.put(settings)
  }
  // Backfill notificationPreferences for existing users
  if (!settings.notificationPreferences) {
    settings.notificationPreferences = DEFAULT_NOTIFICATION_PREFERENCES
    await db.settings.put(settings)
  }
  return settings
}

export async function updateSettings(updates: Partial<Omit<UserSettings, 'id'>>): Promise<void> {
  await db.settings.update(1, updates)
}

// Notification helpers
export async function addNotification(notification: InAppNotification): Promise<void> {
  await db.notifications.add(notification)
}

export async function getUnreadNotifications(): Promise<InAppNotification[]> {
  return db.notifications
    .filter(n => !n.readAt && !n.dismissedAt && (!n.snoozedUntil || n.snoozedUntil < Date.now()))
    .sortBy('createdAt')
    .then(notifications => notifications.reverse())  // Newest first
}

export async function getAllNotifications(): Promise<InAppNotification[]> {
  return db.notifications
    .orderBy('createdAt')
    .reverse()
    .toArray()
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await db.notifications.update(id, { readAt: Date.now() })
}

export async function dismissNotification(id: string): Promise<void> {
  await db.notifications.update(id, { dismissedAt: Date.now() })
}

export async function snoozeNotification(id: string, until: number): Promise<void> {
  await db.notifications.update(id, { snoozedUntil: until })
}

export async function getUnreadNotificationCount(): Promise<number> {
  return db.notifications
    .filter(n => !n.readAt && !n.dismissedAt && (!n.snoozedUntil || n.snoozedUntil < Date.now()))
    .count()
}

export async function deleteNotification(id: string): Promise<void> {
  await db.notifications.delete(id)
}

// Achievement helpers
export async function getAchievements(): Promise<Achievement[]> {
  const profile = await getProfile()
  return profile.achievements ?? []
}

export async function addAchievement(achievement: Achievement): Promise<void> {
  const profile = await getProfile()
  const achievements = profile.achievements ?? []

  // Don't add duplicates
  if (achievements.some(a => a.hours === achievement.hours)) {
    return
  }

  achievements.push(achievement)
  achievements.sort((a, b) => a.hours - b.hours)

  await updateProfile({ achievements })
}

export async function recordMilestoneIfNew(
  totalHours: number,
  milestones: number[]
): Promise<Achievement | null> {
  const profile = await getProfile()
  const achievements = profile.achievements ?? []
  const achievedHours = new Set(achievements.map(a => a.hours))

  // Find milestones that should be achieved but aren't recorded
  for (const milestone of milestones) {
    if (totalHours >= milestone && !achievedHours.has(milestone)) {
      const name = milestone >= 1000
        ? `${(milestone / 1000).toFixed(milestone % 1000 === 0 ? 0 : 1)}k hours`
        : `${milestone} hours`

      const achievement: Achievement = {
        hours: milestone,
        achievedAt: Date.now(),
        name
      }

      await addAchievement(achievement)
      return achievement
    }
  }

  return null
}

// Insight helpers
export async function addInsight(data: {
  sessionId?: string | null
  rawText: string
  formattedText?: string | null
}): Promise<Insight> {
  const insight: Insight = {
    id: crypto.randomUUID(),
    sessionId: data.sessionId ?? null,
    rawText: data.rawText,
    formattedText: data.formattedText ?? null,
    sharedPearlId: null,
    createdAt: new Date(),
    updatedAt: null
  }
  await db.insights.add(insight)
  return insight
}

// Update an insight's text (for editing after voice capture)
export async function updateInsight(
  id: string,
  updates: { rawText?: string; formattedText?: string | null }
): Promise<void> {
  await db.insights.update(id, {
    ...updates,
    updatedAt: new Date()
  })
}

// Link insight to a shared pearl
export async function linkInsightToPearl(insightId: string, pearlId: string): Promise<void> {
  await db.insights.update(insightId, { sharedPearlId: pearlId })
}

export async function getInsights(): Promise<Insight[]> {
  return db.insights.orderBy('createdAt').reverse().toArray()
}

// Get only insights that have content (for My Insights view)
export async function getInsightsWithContent(): Promise<Insight[]> {
  const insights = await db.insights.orderBy('createdAt').reverse().toArray()
  return insights.filter(i => i.rawText && i.rawText.trim().length > 0)
}

export async function getInsightById(id: string): Promise<Insight | undefined> {
  return db.insights.get(id)
}

export async function deleteInsight(id: string): Promise<void> {
  await db.insights.delete(id)
}

export async function markInsightAsShared(insightId: string, pearlId: string): Promise<void> {
  await db.insights.update(insightId, {
    sharedPearlId: pearlId,
    updatedAt: new Date()
  })
}

export async function getUnsharedInsights(): Promise<Insight[]> {
  return db.insights
    .filter(insight => insight.sharedPearlId === null)
    .reverse()
    .sortBy('createdAt')
}

export async function getSharedInsights(): Promise<Insight[]> {
  return db.insights
    .filter(insight => insight.sharedPearlId !== null)
    .reverse()
    .sortBy('createdAt')
}

export async function getInsightsBySessionId(sessionId: string): Promise<Insight[]> {
  return db.insights.where('sessionId').equals(sessionId).toArray()
}

// Planned session helpers
export async function addPlannedSession(data: Omit<PlannedSession, 'id' | 'createdAt'>): Promise<PlannedSession> {
  const planned: PlannedSession = {
    ...data,
    createdAt: Date.now()
  }
  const id = await db.plannedSessions.add(planned)
  return { ...planned, id }
}

export async function getPlannedSession(date: number): Promise<PlannedSession | undefined> {
  // Get planned session for a specific date (start of day)
  return db.plannedSessions.where('date').equals(date).first()
}

export async function getPlannedSessionsForWeek(weekStartDate: number): Promise<PlannedSession[]> {
  const weekEndDate = weekStartDate + 7 * 24 * 60 * 60 * 1000
  return db.plannedSessions
    .where('date')
    .between(weekStartDate, weekEndDate, true, false)
    .toArray()
}

export async function getPlannedSessionsForMonth(year: number, month: number): Promise<PlannedSession[]> {
  const monthStart = new Date(year, month, 1)
  monthStart.setHours(0, 0, 0, 0)
  const monthEnd = new Date(year, month + 1, 1)
  monthEnd.setHours(0, 0, 0, 0)
  return db.plannedSessions
    .where('date')
    .between(monthStart.getTime(), monthEnd.getTime(), true, false)
    .toArray()
}

export async function updatePlannedSession(
  id: number,
  updates: Partial<Omit<PlannedSession, 'id' | 'createdAt'>>
): Promise<void> {
  await db.plannedSessions.update(id, updates)
}

export async function deletePlannedSession(id: number): Promise<void> {
  await db.plannedSessions.delete(id)
}

// Helper to check if two timestamps fall on the same calendar day
function isSameDay(timestamp1: number, timestamp2: number): boolean {
  const d1 = new Date(timestamp1)
  const d2 = new Date(timestamp2)
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}

// Get the next upcoming planned session (today or future, not completed)
// Pass afterDate to skip plans on that date (useful when today already has a session)
export async function getNextPlannedSession(afterDate?: number): Promise<PlannedSession | undefined> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTime = today.getTime()

  // Get all plans from today onwards
  const plans = await db.plannedSessions
    .where('date')
    .aboveOrEqual(todayTime)
    .toArray()

  return plans
    .filter(p => {
      if (p.completed || p.linkedSessionUuid) return false
      // Defensive check: exclude plans from past days (handles edge cases)
      if (p.date < todayTime) return false
      // If afterDate provided, skip plans on that same calendar day
      if (afterDate !== undefined && isSameDay(p.date, afterDate)) return false
      return true
    })
    .sort((a, b) => a.date - b.date)[0]
}

export async function getLatestInsight(): Promise<Insight | undefined> {
  return db.insights.orderBy('createdAt').reverse().first()
}

// Session-Plan Linking helpers
export async function linkSessionToPlan(sessionUuid: string, date: number): Promise<PlannedSession | null> {
  // Find an unlinked plan for the given date and link it to the session
  // Use date range (same calendar day) to handle any timestamp discrepancies
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  const plan = await db.plannedSessions
    .where('date')
    .between(dayStart.getTime(), dayEnd.getTime(), true, true)
    .filter(p => !p.linkedSessionUuid)
    .first()

  if (plan && plan.id) {
    await db.plannedSessions.update(plan.id, {
      completed: true,
      linkedSessionUuid: sessionUuid
    })
    // Return the linked plan for caller to handle additional side effects (e.g., template completion tracking)
    return { ...plan, completed: true, linkedSessionUuid: sessionUuid }
  }
  return null
}

export async function getPlannedSessionByLinkedUuid(sessionUuid: string): Promise<PlannedSession | undefined> {
  return db.plannedSessions.where('linkedSessionUuid').equals(sessionUuid).first()
}

export async function getAllPlannedSessions(): Promise<PlannedSession[]> {
  return db.plannedSessions.orderBy('date').reverse().toArray()
}

/**
 * Retroactively link unlinked plans to sessions on the same day
 * Useful for fixing plans that weren't auto-linked due to timestamp mismatches
 */
export async function relinkOrphanedPlans(sessions: Session[]): Promise<number> {
  const unlinkedPlans = await db.plannedSessions
    .filter(p => !p.completed && !p.linkedSessionUuid)
    .toArray()

  let linkedCount = 0

  for (const plan of unlinkedPlans) {
    // Find a session on the same day as this plan
    const matchingSession = sessions.find(session => isSameDay(session.startTime, plan.date))

    if (matchingSession && plan.id) {
      await db.plannedSessions.update(plan.id, {
        completed: true,
        linkedSessionUuid: matchingSession.uuid
      })
      linkedCount++
    }
  }

  return linkedCount
}

/**
 * Mark a plan as completed without linking to a session
 * Useful for clearing stuck plans
 */
export async function markPlanCompleted(planId: number): Promise<void> {
  await db.plannedSessions.update(planId, {
    completed: true
  })
}

// Course Progress helpers
export async function getCourseProgress(courseId: string): Promise<UserCourseProgress | undefined> {
  return db.courseProgress.where('courseId').equals(courseId).first()
}

export async function getAllCourseProgress(): Promise<UserCourseProgress[]> {
  return db.courseProgress.orderBy('lastActivityAt').reverse().toArray()
}

export async function getActiveCourses(): Promise<UserCourseProgress[]> {
  return db.courseProgress.where('status').equals('active').toArray()
}

export async function startCourse(courseId: string): Promise<UserCourseProgress> {
  const existing = await getCourseProgress(courseId)
  if (existing) {
    // Resume if paused
    if (existing.status === 'paused') {
      await db.courseProgress.update(existing.id, {
        status: 'active',
        lastActivityAt: Date.now()
      })
    }
    return existing
  }

  const progress: UserCourseProgress = {
    id: crypto.randomUUID(),
    courseId,
    sessionsCompleted: [],
    startedAt: Date.now(),
    lastActivityAt: Date.now(),
    status: 'active'
  }
  await db.courseProgress.add(progress)
  return progress
}

export async function updateCourseProgress(
  courseId: string,
  updates: Partial<Omit<UserCourseProgress, 'id' | 'courseId' | 'startedAt'>>
): Promise<void> {
  const progress = await getCourseProgress(courseId)
  if (progress) {
    await db.courseProgress.update(progress.id, {
      ...updates,
      lastActivityAt: Date.now()
    })
  }
}

export async function markCourseSessionComplete(courseId: string, position: number): Promise<void> {
  const progress = await getCourseProgress(courseId)
  if (progress && !progress.sessionsCompleted.includes(position)) {
    const newCompleted = [...progress.sessionsCompleted, position].sort((a, b) => a - b)
    await db.courseProgress.update(progress.id, {
      sessionsCompleted: newCompleted,
      lastActivityAt: Date.now()
    })
  }
}

export async function pauseCourse(courseId: string): Promise<void> {
  await updateCourseProgress(courseId, { status: 'paused' })
}

export async function completeCourse(courseId: string): Promise<void> {
  await updateCourseProgress(courseId, { status: 'completed' })
}

// Saved Templates helpers
export async function saveTemplate(templateId: string): Promise<SavedTemplate> {
  const existing = await db.savedTemplates.where('templateId').equals(templateId).first()
  if (existing) return existing

  const saved: SavedTemplate = {
    id: crypto.randomUUID(),
    templateId,
    savedAt: Date.now()
  }
  await db.savedTemplates.add(saved)
  return saved
}

export async function unsaveTemplate(templateId: string): Promise<void> {
  const saved = await db.savedTemplates.where('templateId').equals(templateId).first()
  if (saved) {
    await db.savedTemplates.delete(saved.id)
  }
}

export async function isTemplateSaved(templateId: string): Promise<boolean> {
  const saved = await db.savedTemplates.where('templateId').equals(templateId).first()
  return !!saved
}

export async function getSavedTemplates(): Promise<SavedTemplate[]> {
  return db.savedTemplates.orderBy('savedAt').reverse().toArray()
}

// Pearl Draft helpers - work-in-progress pearls before posting

export async function savePearlDraft(insightId: string, text: string): Promise<PearlDraft> {
  const existing = await db.pearlDrafts.where('insightId').equals(insightId).first()
  const now = Date.now()

  if (existing) {
    // Update existing draft
    await db.pearlDrafts.update(existing.id, { text, updatedAt: now })
    return { ...existing, text, updatedAt: now }
  } else {
    // Create new draft
    const draft: PearlDraft = {
      id: crypto.randomUUID(),
      insightId,
      text,
      createdAt: now,
      updatedAt: now
    }
    await db.pearlDrafts.add(draft)
    return draft
  }
}

export async function getPearlDraft(insightId: string): Promise<PearlDraft | undefined> {
  return db.pearlDrafts.where('insightId').equals(insightId).first()
}

export async function deletePearlDraft(insightId: string): Promise<void> {
  const draft = await db.pearlDrafts.where('insightId').equals(insightId).first()
  if (draft) {
    await db.pearlDrafts.delete(draft.id)
  }
}

export async function getAllPearlDrafts(): Promise<PearlDraft[]> {
  return db.pearlDrafts.orderBy('updatedAt').reverse().toArray()
}

// Template Draft helpers - work-in-progress meditation templates before publishing

export async function saveTemplateDraft(
  data: Omit<TemplateDraft, 'id' | 'createdAt' | 'updatedAt'>
): Promise<TemplateDraft> {
  const existing = await db.templateDrafts.get('current')
  const now = Date.now()

  if (existing) {
    // Update existing draft
    const updated = { ...existing, ...data, updatedAt: now }
    await db.templateDrafts.update('current', updated)
    return updated
  } else {
    // Create new draft
    const draft: TemplateDraft = {
      id: 'current',
      ...data,
      createdAt: now,
      updatedAt: now
    }
    await db.templateDrafts.add(draft)
    return draft
  }
}

export async function getTemplateDraft(): Promise<TemplateDraft | undefined> {
  return db.templateDrafts.get('current')
}

export async function deleteTemplateDraft(): Promise<void> {
  await db.templateDrafts.delete('current')
}

export async function hasTemplateDraft(): Promise<boolean> {
  const draft = await db.templateDrafts.get('current')
  return !!draft
}

// User Preferences helpers
export async function getUserPreferences(): Promise<UserPreferences> {
  let prefs = await db.userPreferences.get(1)
  if (!prefs) {
    prefs = {
      id: 1,
      updatedAt: Date.now()
    }
    await db.userPreferences.put(prefs)
  }
  return prefs
}

export async function updateUserPreferences(
  updates: Partial<Omit<UserPreferences, 'id'>>
): Promise<void> {
  await db.userPreferences.update(1, { ...updates, updatedAt: Date.now() })
}

// Wellbeing Settings helpers
export async function getWellbeingSettings(): Promise<WellbeingSettings> {
  let settings = await db.wellbeingSettings.get(1)
  if (!settings) {
    settings = {
      id: 1,
      checkInFrequencyDays: 14,
      isEnabled: false
    }
    await db.wellbeingSettings.put(settings)
  }
  return settings
}

export async function updateWellbeingSettings(
  updates: Partial<Omit<WellbeingSettings, 'id'>>
): Promise<void> {
  await db.wellbeingSettings.update(1, updates)
}

// Wellbeing Dimension helpers
export async function addWellbeingDimension(
  data: { name: string; label: string; description?: string; isCustom: boolean }
): Promise<WellbeingDimension> {
  const dimension: WellbeingDimension = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: Date.now()
  }
  await db.wellbeingDimensions.add(dimension)
  return dimension
}

export async function getWellbeingDimensions(): Promise<WellbeingDimension[]> {
  return db.wellbeingDimensions
    .filter(d => !d.archivedAt)
    .toArray()
}

export async function getAllWellbeingDimensions(): Promise<WellbeingDimension[]> {
  return db.wellbeingDimensions.orderBy('createdAt').toArray()
}

export async function archiveWellbeingDimension(id: string): Promise<void> {
  await db.wellbeingDimensions.update(id, { archivedAt: Date.now() })
}

export async function restoreWellbeingDimension(id: string): Promise<void> {
  await db.wellbeingDimensions.update(id, { archivedAt: undefined })
}

// Wellbeing Check-in helpers
export async function addWellbeingCheckIn(
  data: { dimensionId: string; score: number; note?: string }
): Promise<WellbeingCheckIn> {
  const checkIn: WellbeingCheckIn = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: Date.now()
  }
  await db.wellbeingCheckIns.add(checkIn)
  return checkIn
}

export async function getCheckInsForDimension(dimensionId: string): Promise<WellbeingCheckIn[]> {
  return db.wellbeingCheckIns
    .where('dimensionId')
    .equals(dimensionId)
    .reverse()
    .sortBy('createdAt')
}

export async function getLatestCheckIns(): Promise<Map<string, WellbeingCheckIn>> {
  const dimensions = await getWellbeingDimensions()
  const latestMap = new Map<string, WellbeingCheckIn>()

  for (const dim of dimensions) {
    const latest = await db.wellbeingCheckIns
      .where('dimensionId')
      .equals(dim.id)
      .reverse()
      .sortBy('createdAt')
    if (latest.length > 0) {
      latestMap.set(dim.id, latest[0])
    }
  }

  return latestMap
}

export async function getAllCheckIns(): Promise<WellbeingCheckIn[]> {
  return db.wellbeingCheckIns.orderBy('createdAt').reverse().toArray()
}

export async function getCheckInHistory(
  dimensionId: string,
  limit?: number
): Promise<WellbeingCheckIn[]> {
  let query = db.wellbeingCheckIns
    .where('dimensionId')
    .equals(dimensionId)
    .reverse()

  const results = await query.sortBy('createdAt')
  return limit ? results.slice(0, limit) : results
}

// Calculate improvement percentage between first and latest check-in
export async function getImprovementForDimension(
  dimensionId: string
): Promise<{ first: number; latest: number; percentChange: number } | null> {
  const checkIns = await getCheckInsForDimension(dimensionId)
  if (checkIns.length < 2) return null

  const latest = checkIns[0]
  const first = checkIns[checkIns.length - 1]

  // Lower score is better (1-10 scale where 10 is worst)
  const percentChange = ((first.score - latest.score) / first.score) * 100

  return {
    first: first.score,
    latest: latest.score,
    percentChange: Math.round(percentChange)
  }
}
