import Dexie, { Table } from 'dexie'

export interface Session {
  id?: number
  uuid: string
  startTime: number  // Unix timestamp (ms)
  endTime: number    // Unix timestamp (ms)
  durationSeconds: number
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

export interface UserSettings {
  id: 1
  hideTimeDisplay: boolean
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
  pose?: string             // Seating position/pose
  discipline?: string       // Meditation discipline (e.g., "Vipassana", "Zen")
  notes?: string            // Guidance notes
  createdAt: number
  completed?: boolean       // Marked when session is done
}

class MeditationDB extends Dexie {
  sessions!: Table<Session>
  appState!: Table<AppState>
  profile!: Table<UserProfile>
  settings!: Table<UserSettings>
  insights!: Table<Insight>
  plannedSessions!: Table<PlannedSession>

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
      hideTimeDisplay: false
    }
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

export async function updatePlannedSession(
  id: number,
  updates: Partial<Omit<PlannedSession, 'id' | 'createdAt'>>
): Promise<void> {
  await db.plannedSessions.update(id, updates)
}

export async function deletePlannedSession(id: number): Promise<void> {
  await db.plannedSessions.delete(id)
}

export async function getLatestInsight(): Promise<Insight | undefined> {
  return db.insights.orderBy('createdAt').reverse().first()
}
