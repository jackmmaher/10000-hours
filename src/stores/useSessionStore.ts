import { create } from 'zustand'
import {
  Session,
  Achievement,
  addSession,
  getAllSessions,
  initAppState,
  markEnlightenmentReached,
  recordMilestoneIfNew,
  linkSessionToPlan,
  getUserPreferences,
  getSettings,
  addNotification,
  saveSessionInProgress,
  clearSessionInProgress,
  getSessionInProgress,
} from '../lib/db'
import { consumeHours } from '../lib/hourBank'
import {
  generateMilestones,
  checkSessionMilestone,
  checkWeeklyFirst,
  SessionMilestone,
  WeeklyFirstMilestone,
} from '../lib/milestones'
import { recordTemplateCompletion } from '../lib/templates'
import { getLocalTemplateById } from '../lib/recommendations'
import { deriveImplicitFeedback, updateAffinities } from '../lib/affinities'
import { supabase } from '../lib/supabase'
import { InAppNotification } from '../lib/notifications'

// Re-export AppView from navigation store for backwards compatibility during migration
export type { AppView } from './useNavigationStore'

type TimerPhase = 'idle' | 'preparing' | 'running' | 'complete'

interface SessionState {
  // Sessions
  sessions: Session[]
  totalSeconds: number
  isLoading: boolean

  // Timer state
  timerPhase: TimerPhase
  startedAt: number | null // performance.now() for elapsed calculation
  sessionStartTime: number | null // Date.now() wall-clock time for storage
  lastSessionDuration: number | null

  // Enlightenment state
  hasReachedEnlightenment: boolean
  justReachedEnlightenment: boolean
  goalCompleted: boolean // True when user reached their goal and hasn't set a new one

  // Milestone celebration state
  justAchievedMilestone: Achievement | SessionMilestone | WeeklyFirstMilestone | null

  // Last session ID for insight linking
  lastSessionUuid: string | null

  // Source template ID (if session was from a recommendation)
  lastSourceTemplateId: string | null

  // Plan refresh trigger (timestamp updated when plans change)
  lastPlanChange: number

  // Actions
  hydrate: () => Promise<void>
  triggerPlanChange: () => void
  startPreparing: () => void
  startTimer: () => void
  stopTimer: () => Promise<void>
  clearLastSession: () => void
  acknowledgeEnlightenment: () => void
  clearMilestoneCelebration: () => void
  createInsightReminder: (sessionId: string) => Promise<void>
  completeSession: () => void
  resetGoalCompleted: () => void
  // Dev-only: Override total seconds for testing milestone modals
  devSetTotalSeconds: (seconds: number) => void
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
  goalCompleted: false,
  justAchievedMilestone: null,
  lastSessionUuid: null,
  lastSourceTemplateId: null,
  lastPlanChange: 0,

  triggerPlanChange: () => {
    set({ lastPlanChange: Date.now() })
  },

  hydrate: async () => {
    // GUARD: Never hydrate while timer is active - prevents mid-session state contamination
    const { timerPhase } = get()
    if (timerPhase === 'preparing' || timerPhase === 'running') {
      console.warn('[SessionStore] Hydrate blocked: timer active')
      return
    }

    const [sessions, appState, sessionInProgressTime] = await Promise.all([
      getAllSessions(),
      initAppState(),
      getSessionInProgress(),
    ])

    const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0)

    // Check if goal is completed (totalHours >= goalHours and enlightenment reached)
    const userPrefs = await getUserPreferences()
    const goalCompleted =
      appState.hasReachedEnlightenment &&
      userPrefs?.practiceGoalHours &&
      totalSeconds / 3600 >= userPrefs.practiceGoalHours

    // Check for session recovery (app was killed while timer was running)
    // GUARD: Don't recover if Timer.tsx is already managing a session (prevents collision)
    if (sessionInProgressTime) {
      const currentPhase = get().timerPhase
      if (currentPhase !== 'idle') {
        // Timer component is active, don't hijack it with recovery
        await clearSessionInProgress()
      } else {
        const elapsedMs = Date.now() - sessionInProgressTime
        // Only recover if the session is less than 24 hours old (sanity check)
        if (elapsedMs > 0 && elapsedMs < 24 * 60 * 60 * 1000) {
          // Recover the session by setting startedAt to maintain correct elapsed calculation
          // startedAt = performance.now() - elapsedMs
          // This ensures (performance.now() - startedAt) / 1000 = correct elapsed seconds
          set({
            sessions,
            totalSeconds,
            hasReachedEnlightenment: appState.hasReachedEnlightenment,
            goalCompleted: goalCompleted || false,
            isLoading: false,
            timerPhase: 'running',
            startedAt: performance.now() - elapsedMs,
            sessionStartTime: sessionInProgressTime,
          })
          return
        } else {
          // Session too old, clear it
          await clearSessionInProgress()
        }
      }
    }

    set({
      sessions,
      totalSeconds,
      hasReachedEnlightenment: appState.hasReachedEnlightenment,
      goalCompleted: goalCompleted || false,
      isLoading: false,
    })
  },

  startPreparing: () => {
    set({ timerPhase: 'preparing' })
  },

  startTimer: () => {
    const sessionStartTime = Date.now()
    // Persist to IndexedDB for crash recovery
    saveSessionInProgress(sessionStartTime)
    set({
      timerPhase: 'running',
      startedAt: performance.now(),
      sessionStartTime,
      lastSessionDuration: null,
    })
  },

  stopTimer: async () => {
    const { startedAt, sessionStartTime, totalSeconds, sessions, hasReachedEnlightenment } = get()

    if (!startedAt || !sessionStartTime) return

    // Clear session-in-progress from IndexedDB (no longer needed for recovery)
    await clearSessionInProgress()

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
      durationSeconds,
    }

    await addSession(session)

    // Consume hours from hour bank (for consumption-based pricing)
    try {
      await consumeHours(durationSeconds)
    } catch (err) {
      console.warn('Failed to consume hours:', err)
    }

    // Silent session-plan linking: auto-link to a time-matched plan for this day
    const linkedPlan = await linkSessionToPlan(sessionUuid, sessionStartTime)

    // Trigger plan refresh so Journey tab updates immediately
    if (linkedPlan) {
      set({ lastPlanChange: Date.now() })
    }

    // Track community template completion if this session was linked to a community template
    if (linkedPlan?.sourceTemplateId && supabase) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          await recordTemplateCompletion(linkedPlan.sourceTemplateId, user.id, sessionUuid)
        }
      } catch (err) {
        console.warn('Failed to record template completion:', err)
      }
    }

    // Update adaptive recommendation affinities
    // This learns from user behavior to improve future recommendations
    try {
      const completedSession: Session = {
        uuid: sessionUuid,
        startTime: sessionStartTime,
        endTime,
        durationSeconds,
        discipline: linkedPlan?.discipline,
      }

      // Get template for intent tags
      const template = linkedPlan?.sourceTemplateId
        ? getLocalTemplateById(linkedPlan.sourceTemplateId)
        : null

      // Derive implicit feedback from session behavior
      const feedbackScore = await deriveImplicitFeedback(completedSession, {
        plannedDurationMinutes: linkedPlan?.duration,
      })

      // Update affinities based on feedback
      await updateAffinities(completedSession, template, feedbackScore)
    } catch (err) {
      console.warn('Failed to update recommendation affinities:', err)
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
    weekStart.setDate(
      weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1)
    )
    weekStart.setHours(0, 0, 0, 0)
    const weekSessions = newSessions.filter((s) => s.startTime >= weekStart.getTime())
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
            createdAt: Date.now(),
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
    const crossedThreshold =
      userGoalSeconds && !hasReachedEnlightenment && newTotalSeconds >= userGoalSeconds

    if (crossedThreshold) {
      await markEnlightenmentReached()
      set({
        timerPhase: 'complete',
        startedAt: null,
        sessionStartTime: null,
        lastSessionDuration: durationSeconds,
        lastSessionUuid: sessionUuid,
        lastSourceTemplateId: linkedPlan?.sourceTemplateId || null,
        sessions: newSessions,
        totalSeconds: newTotalSeconds,
        hasReachedEnlightenment: true,
        justReachedEnlightenment: true,
        goalCompleted: true, // Mark goal as completed immediately
        justAchievedMilestone: achievedMilestone,
      })
    } else {
      set({
        timerPhase: 'complete',
        startedAt: null,
        sessionStartTime: null,
        lastSessionDuration: durationSeconds,
        lastSessionUuid: sessionUuid,
        lastSourceTemplateId: linkedPlan?.sourceTemplateId || null,
        sessions: newSessions,
        totalSeconds: newTotalSeconds,
        justAchievedMilestone: achievedMilestone,
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
      justAchievedMilestone: null,
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
        metadata: { sessionId },
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
      lastSourceTemplateId: null,
      // Note: justAchievedMilestone preserved for Progress tab indicator
    })
  },

  resetGoalCompleted: () => {
    set({ goalCompleted: false })
  },

  // Dev-only: Override total seconds for testing milestone modals
  devSetTotalSeconds: (seconds: number) => {
    if (!import.meta.env.DEV) {
      console.warn('devSetTotalSeconds is only available in development mode')
      return
    }
    set({ totalSeconds: seconds })
  },
}))
