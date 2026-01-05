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

export interface UserProfile {
  id: 1
  tier: TierType
  premiumExpiryDate?: number        // When premium subscription expires
  originalPurchaseDate?: number     // First purchase date
  firstSessionDate?: number         // For Day 31 trigger calculation
  trialExpired: boolean             // Has seen Day 31 banner
  trialEndDate?: number             // When trial ended (for adaptive goal)
}

export interface UserSettings {
  id: 1
  hideTimeDisplay: boolean
}

class MeditationDB extends Dexie {
  sessions!: Table<Session>
  appState!: Table<AppState>
  profile!: Table<UserProfile>
  settings!: Table<UserSettings>

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
