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

class MeditationDB extends Dexie {
  sessions!: Table<Session>
  appState!: Table<AppState>

  constructor() {
    super('10000hours')
    this.version(1).stores({
      sessions: '++id, uuid, startTime, endTime',
      appState: 'id'
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
