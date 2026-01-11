import { create } from 'zustand'
import { Session, Achievement, addSession, getAllSessions, initAppState, markEnlightenmentReached, recordMilestoneIfNew, linkSessionToPlan, getUserPreferences, getSettings, addNotification } from '../lib/db'
import { generateMilestones, checkSessionMilestone, checkWeeklyFirst, SessionMilestone, WeeklyFirstMilestone } from '../lib/milestones'
import { recordTemplateCompletion } from '../lib/templates'
import { supabase } from '../lib/supabase'
import { InAppNotification } from '../lib/notifications'

// Re-export AppView from navigation store for backwards compatibility during migration
export type { AppView } from './useNavigationStore'

type TimerPhase = 'idle' | 'preparing' | 'running' | 'complete' | 'enlightenment'

interface SessionState {
  // Sessions
  sessions: Session[]
  totalSeconds: number
  isLoading: boolean

  // Timer state
  timerPhase: TimerPhase
  startedAt: number | null           // performance.now() for elapsed calculation
  sessionStartTime: number | null    // Date.now() wall-clock time for storage
  lastSessionDuration: number | null

  // Enlightenment state
  hasReachedEnlightenment: boolean
  justReachedEnlightenment: boolean

  // Milestone celebration state
  justAchievedMilestone: Achievement | SessionMilestone | WeeklyFirstMilestone | null

  // Last session ID for insight linking
  lastSessionUuid: string | null

  // Plan refresh trigger (timestamp updated when plans change)
  lastPlanChange: number

  // Actions
  hydrate: () => Promise<void>
  startPreparing: () => void
  startTimer: () => void
  stopTimer: () => Promise<void>
  clearLastSession: () => void
  acknowledgeEnlightenment: () => void
  clearMilestoneCelebration: () => void
  createInsightReminder: (sessionId: string) => Promise<void>
  completeSession: () => void
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  sessions: [],
  totalSeconds: 0,
  isLoading: true,
  timerPhase: 'idle',
  startedAt: null,
  sessionStartTime: null,
  lastSessionDuration: null,
  hasReachedEnlightenment: false,
  justReachedEnlightenment: false,
  justAchievedMilestone: null,
  lastSessionUuid: null,
  lastPlanChange: 0,

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
      sessionStartTime: Date.now(),
      lastSessionDuration: null
    })
  },

  stopTimer: async () => {
    const { startedAt, sessionStartTime, totalSeconds, sessions, hasReachedEnlightenment } = get()

    if (!startedAt || !sessionStartTime) return

    const elapsed = performance.now() - startedAt
    const durationSeconds = Math.floor(elapsed / 1000)

    // Don't save sessions under 1 second
    if (durationSeconds < 1) {
      set({ timerPhase: 'idle', startedAt: null, sessionStartTime: null })
      return
    }

    const endTime = sessionStartTime + durationSeconds * 1000
    const sessionUuid = crypto.randomUUID()
    const session: Omit<Session, 'id'> = {
      uuid: sessionUuid,
      startTime: sessionStartTime,
      endTime,
      durationSeconds
    }

    await addSession(session)

    // Silent session-plan linking: auto-link to any plan for this day
    const todayStart = new Date(sessionStartTime)
    todayStart.setHours(0, 0, 0, 0)
    const linkedPlan = await linkSessionToPlan(sessionUuid, todayStart.getTime())

    // Trigger plan refresh so Journey tab updates immediately
    if (linkedPlan) {
      set({ lastPlanChange: Date.now() })
    }

    // Track community template completion if this session was linked to a community template
    if (linkedPlan?.sourceTemplateId && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await recordTemplateCompletion(linkedPlan.sourceTemplateId, user.id, sessionUuid)
        }
      } catch (err) {
        console.warn('Failed to record template completion:', err)
      }
    }

    const newTotalSeconds = totalSeconds + durationSeconds
    // Use a hash of UUID for local ID (ensures uniqueness)
    const localId = sessionUuid.split('-')[0]
    const newSessions = [...sessions, { ...session, id: parseInt(localId, 16) }]

    // Get user's practice goal for dynamic milestones
    const userPrefs = await getUserPreferences()
    const userGoalHours = userPrefs?.practiceGoalHours

    // Check for milestone achievements with dynamic milestones
    const newTotalHours = newTotalSeconds / 3600
    const milestones = generateMilestones(userGoalHours)
    const hourMilestone = await recordMilestoneIfNew(newTotalHours, milestones)

    // Check for session count milestone (50th, 100th, etc.)
    const sessionMilestone = checkSessionMilestone(newSessions.length)

    // Check for weekly first milestone (first morning/evening/long session this week)
    const weekStart = new Date(sessionStartTime)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1))
    weekStart.setHours(0, 0, 0, 0)
    const weekSessions = newSessions.filter(s => s.startTime >= weekStart.getTime())
    const weeklyMilestone = checkWeeklyFirst(sessionStartTime, durationSeconds, weekSessions)

    // Priority: hour milestone > session count > weekly first
    const achievedMilestone = hourMilestone || sessionMilestone || weeklyMilestone

    // Create notification for milestone (if enabled in settings)
    if (achievedMilestone) {
      try {
        const settings = await getSettings()
        if (settings.notificationPreferences?.milestoneEnabled) {
          // Determine notification content based on milestone type
          let title = ''
          let body = ''

          if ('type' in achievedMilestone) {
            // SessionMilestone or WeeklyFirstMilestone
            title = achievedMilestone.label
            body = achievedMilestone.zenMessage
          } else {
            // Achievement (hour milestone)
            title = `${achievedMilestone.hours} hours reached`
            body = `You've reached ${achievedMilestone.name} of practice`
          }

          const notification: InAppNotification = {
            id: crypto.randomUUID(),
            type: 'milestone',
            title,
            body,
            createdAt: Date.now()
          }
          await addNotification(notification)
        }
      } catch (err) {
        console.warn('Failed to create milestone notification:', err)
      }
    }

    // Check if we just crossed the enlightenment threshold
    // Only trigger enlightenment if user has explicit goal AND reached it
    const userGoalSeconds = userGoalHours ? userGoalHours * 3600 : null
    const crossedThreshold = userGoalSeconds
      && !hasReachedEnlightenment
      && newTotalSeconds >= userGoalSeconds

    if (crossedThreshold) {
      await markEnlightenmentReached()
      set({
        timerPhase: 'enlightenment',
        startedAt: null,
        sessionStartTime: null,
        lastSessionDuration: durationSeconds,
        lastSessionUuid: sessionUuid,
        sessions: newSessions,
        totalSeconds: newTotalSeconds,
        hasReachedEnlightenment: true,
        justReachedEnlightenment: true,
        justAchievedMilestone: achievedMilestone
      })
    } else {
      set({
        timerPhase: 'complete',
        startedAt: null,
        sessionStartTime: null,
        lastSessionDuration: durationSeconds,
        lastSessionUuid: sessionUuid,
        sessions: newSessions,
        totalSeconds: newTotalSeconds,
        justAchievedMilestone: achievedMilestone
      })
    }
  },

  clearLastSession: () => {
    set({ timerPhase: 'idle', lastSessionDuration: null, justAchievedMilestone: null })
  },

  acknowledgeEnlightenment: () => {
    set({
      timerPhase: 'idle',
      justReachedEnlightenment: false,
      lastSessionDuration: null,
      justAchievedMilestone: null
    })
  },

  clearMilestoneCelebration: () => {
    set({ justAchievedMilestone: null })
  },

  createInsightReminder: async (sessionId: string) => {
    try {
      const notification: InAppNotification = {
        id: crypto.randomUUID(),
        type: 'insight_reminder',
        title: 'Capture your insight',
        body: 'You have a moment waiting to be remembered',
        createdAt: Date.now(),
        metadata: { sessionId }
      }
      await addNotification(notification)
    } catch (err) {
      console.warn('Failed to create insight reminder:', err)
    }
  },

  completeSession: () => {
    set({
      timerPhase: 'idle',
      lastSessionDuration: null,
      lastSessionUuid: null,
      justAchievedMilestone: null
    })
  }
}))
