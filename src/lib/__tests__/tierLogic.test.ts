import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  shouldTriggerPaywall,
  getDaysSinceFirstSession,
  isInTrialOrPremium,
  getCalendarFadeOpacity,
  getCalendarVisibility,
  isSessionVisible,
  getWeeklyRollingHours,
  calculateAdaptiveWeeklyGoal,
  getWeeklyGoalProgress,
  getAvailableStatWindows,
  getLastAchievedMilestone
} from '../tierLogic'
import { Session } from '../db'

// Helper to create a session at a specific time
function createSession(daysAgo: number, durationMinutes: number): Session {
  const now = Date.now()
  const startTime = now - daysAgo * 24 * 60 * 60 * 1000
  return {
    id: Math.random(),
    uuid: crypto.randomUUID(),
    startTime,
    endTime: startTime + durationMinutes * 60 * 1000,
    durationSeconds: durationMinutes * 60
  }
}

describe('tierLogic', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ===================
  // PAYWALL TRIGGER TESTS
  // ===================
  describe('shouldTriggerPaywall', () => {
    it('should NOT trigger paywall on day 30 (still in trial)', () => {
      expect(shouldTriggerPaywall(30, false)).toBe(false)
    })

    it('should trigger paywall on day 31 (first day after trial)', () => {
      expect(shouldTriggerPaywall(31, false)).toBe(true)
    })

    it('should NOT trigger paywall if already expired (user dismissed)', () => {
      expect(shouldTriggerPaywall(31, true)).toBe(false)
      expect(shouldTriggerPaywall(45, true)).toBe(false)
    })

    it('should trigger paywall on day 60 if not yet expired', () => {
      expect(shouldTriggerPaywall(60, false)).toBe(true)
    })
  })

  // ===================
  // DAYS SINCE FIRST SESSION
  // ===================
  describe('getDaysSinceFirstSession', () => {
    it('should return 0 if no first session date', () => {
      expect(getDaysSinceFirstSession(undefined)).toBe(0)
    })

    it('should calculate days correctly', () => {
      const now = Date.now()
      const tenDaysAgo = now - 10 * 24 * 60 * 60 * 1000
      expect(getDaysSinceFirstSession(tenDaysAgo)).toBe(10)
    })
  })

  // ===================
  // TRIAL/PREMIUM STATUS
  // ===================
  describe('isInTrialOrPremium', () => {
    it('should return true for premium users regardless of days', () => {
      expect(isInTrialOrPremium(0, 'premium', false)).toBe(true)
      expect(isInTrialOrPremium(100, 'premium', true)).toBe(true)
    })

    it('should return true for free users in first 30 days', () => {
      expect(isInTrialOrPremium(1, 'free', false)).toBe(true)
      expect(isInTrialOrPremium(30, 'free', false)).toBe(true)
    })

    it('should return false for free users after trial expired', () => {
      expect(isInTrialOrPremium(31, 'free', true)).toBe(false)
      expect(isInTrialOrPremium(60, 'free', true)).toBe(false)
    })
  })

  // ===================
  // CALENDAR FADE TESTS
  // ===================
  describe('getCalendarFadeOpacity', () => {
    it('should return 1.0 for entries 0-30 days old', () => {
      expect(getCalendarFadeOpacity(0)).toBe(1.0)
      expect(getCalendarFadeOpacity(15)).toBe(1.0)
      expect(getCalendarFadeOpacity(29)).toBe(1.0)
      expect(getCalendarFadeOpacity(30)).toBe(1.0)
    })

    it('should return 0.6 for entries 31-60 days old', () => {
      expect(getCalendarFadeOpacity(31)).toBe(0.6)
      expect(getCalendarFadeOpacity(45)).toBe(0.6)
      expect(getCalendarFadeOpacity(60)).toBe(0.6)
    })

    it('should return 0.3 for entries 61-90 days old', () => {
      expect(getCalendarFadeOpacity(61)).toBe(0.3)
      expect(getCalendarFadeOpacity(75)).toBe(0.3)
      expect(getCalendarFadeOpacity(90)).toBe(0.3)
    })

    it('should return 0.1 for entries over 90 days old', () => {
      expect(getCalendarFadeOpacity(91)).toBe(0.1)
      expect(getCalendarFadeOpacity(120)).toBe(0.1)
      expect(getCalendarFadeOpacity(365)).toBe(0.1)
    })
  })

  // ===================
  // CALENDAR VISIBILITY
  // ===================
  describe('getCalendarVisibility', () => {
    it('should show full visibility for premium users', () => {
      const result = getCalendarVisibility(100, 'premium', true)
      expect(result.visible).toBe(true)
      expect(result.opacity).toBe(1.0)
      expect(result.blurred).toBe(false)
    })

    it('should show full visibility for trial users', () => {
      const result = getCalendarVisibility(100, 'free', false)
      expect(result.visible).toBe(true)
      expect(result.opacity).toBe(1.0)
      expect(result.blurred).toBe(false)
    })

    it('should hide entries beyond 90 days for free after trial', () => {
      const result = getCalendarVisibility(91, 'free', true)
      expect(result.visible).toBe(false)
    })

    it('should fade entries within 90 days for free after trial', () => {
      const result = getCalendarVisibility(45, 'free', true)
      expect(result.visible).toBe(true)
      expect(result.opacity).toBe(0.6)
    })
  })

  // ===================
  // SESSION VISIBILITY
  // ===================
  describe('isSessionVisible', () => {
    it('should always show sessions for premium users', () => {
      const oldSession = createSession(120, 30) // 120 days ago
      expect(isSessionVisible(oldSession, 'premium', true)).toBe(true)
    })

    it('should always show sessions for trial users', () => {
      const oldSession = createSession(120, 30)
      expect(isSessionVisible(oldSession, 'free', false)).toBe(true)
    })

    it('should show recent sessions for free after trial', () => {
      const recentSession = createSession(29, 30) // 29 days ago
      expect(isSessionVisible(recentSession, 'free', true)).toBe(true)
    })

    it('should hide old sessions for free after trial', () => {
      const oldSession = createSession(91, 30) // 91 days ago
      expect(isSessionVisible(oldSession, 'free', true)).toBe(false)
    })
  })

  // ===================
  // ROLLING WINDOW TESTS
  // ===================
  describe('getWeeklyRollingHours', () => {
    it('should return 0 for empty sessions', () => {
      expect(getWeeklyRollingHours([])).toBe(0)
    })

    it('should sum only sessions from last 7 days', () => {
      const sessions = [
        createSession(1, 60),   // 1 day ago, 1 hour
        createSession(3, 60),   // 3 days ago, 1 hour
        createSession(6, 60),   // 6 days ago, 1 hour
        createSession(10, 60),  // 10 days ago, NOT counted
      ]
      expect(getWeeklyRollingHours(sessions)).toBe(3.0)
    })

    it('should round to 1 decimal place', () => {
      const sessions = [
        createSession(1, 45),   // 0.75 hours
        createSession(2, 33),   // 0.55 hours
      ]
      // 0.75 + 0.55 = 1.3
      expect(getWeeklyRollingHours(sessions)).toBe(1.3)
    })
  })

  // ===================
  // ADAPTIVE GOAL TESTS
  // ===================
  describe('calculateAdaptiveWeeklyGoal', () => {
    it('should return default 5 hours if no trial end date', () => {
      const sessions = [createSession(5, 60)]
      expect(calculateAdaptiveWeeklyGoal(sessions, undefined)).toBe(5)
    })

    it('should return default 5 hours if no trial sessions', () => {
      const trialEndDate = Date.now() - 31 * 24 * 60 * 60 * 1000
      expect(calculateAdaptiveWeeklyGoal([], trialEndDate)).toBe(5)
    })

    it('should calculate 80% of trial average', () => {
      // Create sessions: 30 min/day for 30 days = 15 hours total
      // avg daily = 30 min = 0.5 hours
      // weekly goal = 0.5 * 7 * 0.8 = 2.8 hours
      const now = Date.now()
      const trialEndDate = now - 1 * 24 * 60 * 60 * 1000 // 1 day ago

      const sessions: Session[] = []
      for (let i = 2; i <= 31; i++) {
        sessions.push(createSession(i, 30)) // 30 min each day
      }

      const goal = calculateAdaptiveWeeklyGoal(sessions, trialEndDate)
      expect(goal).toBeCloseTo(2.8, 1)
    })

    it('should respect minimum goal of 1 hour', () => {
      const now = Date.now()
      const trialEndDate = now - 1 * 24 * 60 * 60 * 1000
      // Very few sessions
      const sessions = [createSession(15, 5)] // 5 minutes, 15 days ago

      const goal = calculateAdaptiveWeeklyGoal(sessions, trialEndDate)
      expect(goal).toBe(1)
    })

    it('should respect maximum goal of 35 hours', () => {
      const now = Date.now()
      const trialEndDate = now - 1 * 24 * 60 * 60 * 1000

      // Heavy user: 8 hours/day for 30 days
      const sessions: Session[] = []
      for (let i = 2; i <= 31; i++) {
        sessions.push(createSession(i, 480)) // 8 hours each day
      }

      const goal = calculateAdaptiveWeeklyGoal(sessions, trialEndDate)
      expect(goal).toBe(35)
    })
  })

  // ===================
  // WEEKLY GOAL PROGRESS
  // ===================
  describe('getWeeklyGoalProgress', () => {
    it('should calculate progress correctly', () => {
      const sessions = [
        createSession(1, 60),  // 1 hour
        createSession(2, 60),  // 1 hour
      ]
      // Current: 2 hours, Goal: 5 hours (default), Percent: 40%
      const progress = getWeeklyGoalProgress(sessions, undefined)
      expect(progress.current).toBe(2.0)
      expect(progress.goal).toBe(5)
      expect(progress.percent).toBe(40)
    })

    it('should cap percent at 100', () => {
      const sessions = [
        createSession(1, 180),  // 3 hours
        createSession(2, 180),  // 3 hours
      ]
      // Current: 6 hours, Goal: 5 hours (default), Percent: capped at 100
      const progress = getWeeklyGoalProgress(sessions, undefined)
      expect(progress.percent).toBe(100)
    })
  })

  // ===================
  // STAT WINDOWS
  // ===================
  describe('getAvailableStatWindows', () => {
    it('should unlock all windows for premium users', () => {
      const windows = getAvailableStatWindows('premium', true)
      expect(windows.every(w => w.available)).toBe(true)
    })

    it('should unlock all windows for trial users', () => {
      const windows = getAvailableStatWindows('free', false)
      expect(windows.every(w => w.available)).toBe(true)
    })

    it('should only unlock 7d and 30d for free after trial', () => {
      const windows = getAvailableStatWindows('free', true)

      const available = windows.filter(w => w.available).map(w => w.window)
      expect(available).toEqual(['7d', '30d'])

      const locked = windows.filter(w => !w.available).map(w => w.window)
      expect(locked).toEqual(['90d', 'year', 'all'])
    })
  })

  // ===================
  // MILESTONE TESTS
  // ===================
  describe('getLastAchievedMilestone', () => {
    it('should return null if no milestones achieved', () => {
      expect(getLastAchievedMilestone(5)).toBe(null)
    })

    it('should return correct milestone for small hours', () => {
      const result = getLastAchievedMilestone(42)
      expect(result?.achieved).toBe(25)
      expect(result?.name).toBe('25 hours')
    })

    it('should format large milestones with k', () => {
      const result = getLastAchievedMilestone(2800)
      expect(result?.achieved).toBe(2500)
      expect(result?.name).toBe('2.5k hours')
    })

    it('should return 10000 for completed journey', () => {
      const result = getLastAchievedMilestone(10500)
      expect(result?.achieved).toBe(10000)
      expect(result?.name).toBe('10k hours')
    })
  })
})
