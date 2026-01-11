/**
 * Session Store Tests
 *
 * Tests for the session state management store.
 * Focuses on timer phase transitions and synchronous actions.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useSessionStore } from '../useSessionStore'

// Mock the database module
vi.mock('../../lib/db', () => ({
  getAllSessions: vi.fn().mockResolvedValue([]),
  initAppState: vi.fn().mockResolvedValue({ hasReachedEnlightenment: false }),
  addSession: vi.fn().mockResolvedValue(1),
  markEnlightenmentReached: vi.fn().mockResolvedValue(undefined),
  recordMilestoneIfNew: vi.fn().mockResolvedValue(null),
  linkSessionToPlan: vi.fn().mockResolvedValue(null),
  getUserPreferences: vi.fn().mockResolvedValue({ practiceGoalHours: undefined }),
  getSettings: vi.fn().mockResolvedValue({ notificationPreferences: { milestoneEnabled: false } }),
  addNotification: vi.fn().mockResolvedValue(undefined),
}))

// Mock templates module
vi.mock('../../lib/templates', () => ({
  recordTemplateCompletion: vi.fn().mockResolvedValue(undefined),
}))

// Mock supabase
vi.mock('../../lib/supabase', () => ({
  supabase: null,
}))

// Helper to reset store between tests
function resetStore() {
  useSessionStore.setState({
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
  })
}

describe('useSessionStore', () => {
  beforeEach(() => {
    resetStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('starts in idle phase', () => {
      const { timerPhase } = useSessionStore.getState()
      expect(timerPhase).toBe('idle')
    })

    it('starts with loading true', () => {
      const { isLoading } = useSessionStore.getState()
      expect(isLoading).toBe(true)
    })

    it('starts with no sessions', () => {
      const { sessions, totalSeconds } = useSessionStore.getState()
      expect(sessions).toEqual([])
      expect(totalSeconds).toBe(0)
    })

    it('starts without enlightenment', () => {
      const { hasReachedEnlightenment, justReachedEnlightenment } = useSessionStore.getState()
      expect(hasReachedEnlightenment).toBe(false)
      expect(justReachedEnlightenment).toBe(false)
    })

    it('starts with no milestone', () => {
      const { justAchievedMilestone } = useSessionStore.getState()
      expect(justAchievedMilestone).toBeNull()
    })
  })

  describe('timer phase transitions', () => {
    it('idle -> preparing via startPreparing', () => {
      const { startPreparing } = useSessionStore.getState()

      startPreparing()

      expect(useSessionStore.getState().timerPhase).toBe('preparing')
    })

    it('preparing -> running via startTimer', () => {
      const { startPreparing, startTimer } = useSessionStore.getState()

      startPreparing()
      startTimer()

      const state = useSessionStore.getState()
      expect(state.timerPhase).toBe('running')
      expect(state.startedAt).not.toBeNull()
      expect(state.sessionStartTime).not.toBeNull()
    })

    it('startTimer sets timing values', () => {
      const { startTimer } = useSessionStore.getState()

      const beforeStart = performance.now()
      const beforeTime = Date.now()

      startTimer()

      const state = useSessionStore.getState()
      expect(state.startedAt).toBeGreaterThanOrEqual(beforeStart)
      expect(state.sessionStartTime).toBeGreaterThanOrEqual(beforeTime)
      expect(state.lastSessionDuration).toBeNull()
    })

    it('startTimer clears previous session duration', () => {
      // Simulate having a previous session
      useSessionStore.setState({ lastSessionDuration: 1800 })

      const { startTimer } = useSessionStore.getState()
      startTimer()

      expect(useSessionStore.getState().lastSessionDuration).toBeNull()
    })
  })

  describe('stopTimer', () => {
    it('does nothing if timer not running', async () => {
      const { stopTimer } = useSessionStore.getState()

      await stopTimer()

      expect(useSessionStore.getState().timerPhase).toBe('idle')
    })

    it('transitions to complete on stop', async () => {
      const { startTimer, stopTimer } = useSessionStore.getState()

      // Start timer
      startTimer()

      // Simulate some elapsed time
      const startedAt = useSessionStore.getState().startedAt!
      const sessionStartTime = useSessionStore.getState().sessionStartTime!

      // Manually adjust startedAt to simulate 5 seconds passing
      useSessionStore.setState({
        startedAt: startedAt - 5000,
        sessionStartTime: sessionStartTime - 5000,
      })

      await stopTimer()

      const state = useSessionStore.getState()
      expect(state.timerPhase).toBe('complete')
      expect(state.startedAt).toBeNull()
      expect(state.sessionStartTime).toBeNull()
      expect(state.lastSessionDuration).toBeGreaterThanOrEqual(5)
    })

    it('discards sessions under 1 second', async () => {
      const { startTimer, stopTimer } = useSessionStore.getState()

      startTimer()

      // Stop immediately (less than 1 second)
      await stopTimer()

      const state = useSessionStore.getState()
      expect(state.timerPhase).toBe('idle')
      expect(state.sessions).toHaveLength(0)
    })

    it('saves session UUID on complete', async () => {
      const { startTimer, stopTimer } = useSessionStore.getState()

      startTimer()

      // Simulate 10 seconds elapsed
      const startedAt = useSessionStore.getState().startedAt!
      const sessionStartTime = useSessionStore.getState().sessionStartTime!
      useSessionStore.setState({
        startedAt: startedAt - 10000,
        sessionStartTime: sessionStartTime - 10000,
      })

      await stopTimer()

      const state = useSessionStore.getState()
      expect(state.lastSessionUuid).not.toBeNull()
      expect(state.lastSessionUuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      )
    })
  })

  describe('hydrate', () => {
    it('loads sessions from database', async () => {
      const { getAllSessions, initAppState } = await import('../../lib/db')

      const mockSessions = [
        { id: 1, uuid: 'session-1', startTime: 1000, endTime: 2000, durationSeconds: 60 },
        { id: 2, uuid: 'session-2', startTime: 3000, endTime: 4000, durationSeconds: 120 },
      ]

      vi.mocked(getAllSessions).mockResolvedValueOnce(mockSessions)
      vi.mocked(initAppState).mockResolvedValueOnce({ id: 'main', hasReachedEnlightenment: false })

      const { hydrate } = useSessionStore.getState()
      await hydrate()

      const state = useSessionStore.getState()
      expect(state.sessions).toEqual(mockSessions)
      expect(state.totalSeconds).toBe(180) // 60 + 120
      expect(state.isLoading).toBe(false)
    })

    it('loads enlightenment state from database', async () => {
      const { getAllSessions, initAppState } = await import('../../lib/db')

      vi.mocked(getAllSessions).mockResolvedValueOnce([])
      vi.mocked(initAppState).mockResolvedValueOnce({
        id: 'main',
        hasReachedEnlightenment: true,
        enlightenmentReachedAt: 12345,
      })

      const { hydrate } = useSessionStore.getState()
      await hydrate()

      expect(useSessionStore.getState().hasReachedEnlightenment).toBe(true)
    })
  })

  describe('clearLastSession', () => {
    it('resets timer to idle', () => {
      useSessionStore.setState({
        timerPhase: 'complete',
        lastSessionDuration: 1800,
        justAchievedMilestone: { hours: 10, achievedAt: Date.now(), name: '10 hours' },
      })

      const { clearLastSession } = useSessionStore.getState()
      clearLastSession()

      const state = useSessionStore.getState()
      expect(state.timerPhase).toBe('idle')
      expect(state.lastSessionDuration).toBeNull()
      expect(state.justAchievedMilestone).toBeNull()
    })
  })

  describe('acknowledgeEnlightenment', () => {
    it('clears enlightenment celebration state', () => {
      useSessionStore.setState({
        timerPhase: 'enlightenment',
        justReachedEnlightenment: true,
        lastSessionDuration: 3600,
        justAchievedMilestone: { hours: 10000, achievedAt: Date.now(), name: '10k hours' },
      })

      const { acknowledgeEnlightenment } = useSessionStore.getState()
      acknowledgeEnlightenment()

      const state = useSessionStore.getState()
      expect(state.timerPhase).toBe('idle')
      expect(state.justReachedEnlightenment).toBe(false)
      expect(state.lastSessionDuration).toBeNull()
      expect(state.justAchievedMilestone).toBeNull()
    })

    it('preserves hasReachedEnlightenment flag', () => {
      useSessionStore.setState({
        timerPhase: 'enlightenment',
        hasReachedEnlightenment: true,
        justReachedEnlightenment: true,
      })

      const { acknowledgeEnlightenment } = useSessionStore.getState()
      acknowledgeEnlightenment()

      // The flag that enlightenment was reached should persist
      expect(useSessionStore.getState().hasReachedEnlightenment).toBe(true)
    })
  })

  describe('clearMilestoneCelebration', () => {
    it('clears just the milestone', () => {
      useSessionStore.setState({
        timerPhase: 'complete',
        lastSessionDuration: 1800,
        justAchievedMilestone: { hours: 25, achievedAt: Date.now(), name: '25 hours' },
      })

      const { clearMilestoneCelebration } = useSessionStore.getState()
      clearMilestoneCelebration()

      const state = useSessionStore.getState()
      expect(state.justAchievedMilestone).toBeNull()
      // Other state should be preserved
      expect(state.timerPhase).toBe('complete')
      expect(state.lastSessionDuration).toBe(1800)
    })
  })

  describe('completeSession', () => {
    it('resets all session-related state', () => {
      useSessionStore.setState({
        timerPhase: 'complete',
        lastSessionDuration: 1800,
        lastSessionUuid: 'session-123',
        justAchievedMilestone: { hours: 50, achievedAt: Date.now(), name: '50 hours' },
      })

      const { completeSession } = useSessionStore.getState()
      completeSession()

      const state = useSessionStore.getState()
      expect(state.timerPhase).toBe('idle')
      expect(state.lastSessionDuration).toBeNull()
      expect(state.lastSessionUuid).toBeNull()
      expect(state.justAchievedMilestone).toBeNull()
    })
  })

  describe('timer phase workflow', () => {
    it('follows full lifecycle: idle -> preparing -> running -> complete -> idle', async () => {
      const { startPreparing, startTimer, stopTimer, clearLastSession } = useSessionStore.getState()

      // Start at idle
      expect(useSessionStore.getState().timerPhase).toBe('idle')

      // User taps to prepare
      startPreparing()
      expect(useSessionStore.getState().timerPhase).toBe('preparing')

      // Countdown completes, timer starts
      startTimer()
      expect(useSessionStore.getState().timerPhase).toBe('running')

      // Simulate 10 seconds of meditation
      const startedAt = useSessionStore.getState().startedAt!
      const sessionStartTime = useSessionStore.getState().sessionStartTime!
      useSessionStore.setState({
        startedAt: startedAt - 10000,
        sessionStartTime: sessionStartTime - 10000,
      })

      // User stops timer
      await stopTimer()
      expect(useSessionStore.getState().timerPhase).toBe('complete')

      // User dismisses completion screen
      clearLastSession()
      expect(useSessionStore.getState().timerPhase).toBe('idle')
    })
  })
})
