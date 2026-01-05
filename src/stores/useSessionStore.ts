import { create } from 'zustand'
import { Session, addSession, getAllSessions, initAppState, markEnlightenmentReached } from '../lib/db'
import { GOAL_SECONDS } from '../lib/constants'

type AppView = 'timer' | 'stats' | 'calendar' | 'settings'
type TimerPhase = 'idle' | 'preparing' | 'running' | 'complete' | 'enlightenment'

interface SessionState {
  // App state
  view: AppView
  setView: (view: AppView) => void

  // Sessions
  sessions: Session[]
  totalSeconds: number
  isLoading: boolean

  // Timer state
  timerPhase: TimerPhase
  startedAt: number | null
  lastSessionDuration: number | null

  // Enlightenment state
  hasReachedEnlightenment: boolean
  justReachedEnlightenment: boolean

  // Actions
  hydrate: () => Promise<void>
  startPreparing: () => void
  startTimer: () => void
  stopTimer: () => Promise<void>
  clearLastSession: () => void
  acknowledgeEnlightenment: () => void
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  view: 'timer',
  sessions: [],
  totalSeconds: 0,
  isLoading: true,
  timerPhase: 'idle',
  startedAt: null,
  lastSessionDuration: null,
  hasReachedEnlightenment: false,
  justReachedEnlightenment: false,

  setView: (view) => set({ view }),

  hydrate: async () => {
    const [sessions, appState] = await Promise.all([
      getAllSessions(),
      initAppState()
    ])

    const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0)

    set({
      sessions,
      totalSeconds,
      hasReachedEnlightenment: appState.hasReachedEnlightenment,
      isLoading: false
    })
  },

  startPreparing: () => {
    set({ timerPhase: 'preparing' })
  },

  startTimer: () => {
    set({
      timerPhase: 'running',
      startedAt: performance.now(),
      lastSessionDuration: null
    })
  },

  stopTimer: async () => {
    const { startedAt, totalSeconds, sessions, hasReachedEnlightenment } = get()

    if (!startedAt) return

    const elapsed = performance.now() - startedAt
    const durationSeconds = Math.floor(elapsed / 1000)

    // Don't save sessions under 1 second
    if (durationSeconds < 1) {
      set({ timerPhase: 'idle', startedAt: null })
      return
    }

    const now = Date.now()
    const session: Omit<Session, 'id'> = {
      uuid: crypto.randomUUID(),
      startTime: now - durationSeconds * 1000,
      endTime: now,
      durationSeconds
    }

    await addSession(session)

    const newTotalSeconds = totalSeconds + durationSeconds
    const newSessions = [...sessions, { ...session, id: Date.now() }]

    // Check if we just crossed the enlightenment threshold
    const crossedThreshold = !hasReachedEnlightenment && newTotalSeconds >= GOAL_SECONDS

    if (crossedThreshold) {
      await markEnlightenmentReached()
      set({
        timerPhase: 'enlightenment',
        startedAt: null,
        lastSessionDuration: durationSeconds,
        sessions: newSessions,
        totalSeconds: newTotalSeconds,
        hasReachedEnlightenment: true,
        justReachedEnlightenment: true
      })
    } else {
      set({
        timerPhase: 'complete',
        startedAt: null,
        lastSessionDuration: durationSeconds,
        sessions: newSessions,
        totalSeconds: newTotalSeconds
      })
    }
  },

  clearLastSession: () => {
    set({ timerPhase: 'idle', lastSessionDuration: null })
  },

  acknowledgeEnlightenment: () => {
    set({
      timerPhase: 'idle',
      justReachedEnlightenment: false,
      lastSessionDuration: null
    })
  }
}))
