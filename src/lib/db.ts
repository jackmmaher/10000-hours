import Dexie, { Table } from 'dexie'

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

export type ThemeMode = 'auto' | 'light' | 'warm' | 'dark'

export interface UserSettings {
  id: 1
  hideTimeDisplay: boolean
  themeMode: ThemeMode
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

class MeditationDB extends Dexie {
  sessions!: Table<Session>
  appState!: Table<AppState>
  profile!: Table<UserProfile>
  settings!: Table<UserSettings>
  insights!: Table<Insight>
  plannedSessions!: Table<PlannedSession>
  courseProgress!: Table<UserCourseProgress>
  savedTemplates!: Table<SavedTemplate>

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
      themeMode: 'auto'
    }
    await db.settings.put(settings)
  }
  // Backfill themeMode for existing users
  if (!settings.themeMode) {
    settings.themeMode = 'auto'
    await db.settings.put(settings)
  }
  return settings
}

export async function updateSettings(updates: Partial<Omit<UserSettings, 'id'>>): Promise<void> {
  await db.settings.update(1, updates)
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

export async function getInsights(): Promise<Insight[]> {
  return db.insights.orderBy('createdAt').reverse().toArray()
}

export async function getInsightById(id: string): Promise<Insight | undefined> {
  return db.insights.get(id)
}

export async function updateInsight(
  id: string,
  updates: Partial<Pick<Insight, 'rawText' | 'formattedText'>>
): Promise<void> {
  await db.insights.update(id, {
    ...updates,
    updatedAt: new Date()
  })
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
      // If afterDate provided, skip plans on that exact date
      if (afterDate !== undefined && p.date === afterDate) return false
      return true
    })
    .sort((a, b) => a.date - b.date)[0]
}

export async function getLatestInsight(): Promise<Insight | undefined> {
  return db.insights.orderBy('createdAt').reverse().first()
}

// Session-Plan Linking helpers
export async function linkSessionToPlan(sessionUuid: string, date: number): Promise<boolean> {
  // Find an unlinked plan for the given date and link it to the session
  const plan = await db.plannedSessions
    .where('date')
    .equals(date)
    .filter(p => !p.linkedSessionUuid)
    .first()

  if (plan && plan.id) {
    await db.plannedSessions.update(plan.id, {
      completed: true,
      linkedSessionUuid: sessionUuid
    })
    return true
  }
  return false
}

export async function getPlannedSessionByLinkedUuid(sessionUuid: string): Promise<PlannedSession | undefined> {
  return db.plannedSessions.where('linkedSessionUuid').equals(sessionUuid).first()
}

export async function getAllPlannedSessions(): Promise<PlannedSession[]> {
  return db.plannedSessions.orderBy('date').reverse().toArray()
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
