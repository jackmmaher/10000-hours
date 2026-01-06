import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  isPremium,
  getDaysSinceFirstSession,
  getWeeklyRollingSeconds,
  getWeeklyRollingHours,
  getLastAchievedMilestone,
  MILESTONES,
  PremiumFeatures
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

  describe('isPremium', () => {
    it('should return true for premium tier', () => {
      expect(isPremium('premium')).toBe(true)
    })

    it('should return false for free tier', () => {
      expect(isPremium('free')).toBe(false)
    })
  })

  describe('getDaysSinceFirstSession', () => {
    it('should return 0 when no first session date', () => {
      expect(getDaysSinceFirstSession(undefined)).toBe(0)
    })

    it('should calculate days correctly', () => {
      const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000
      expect(getDaysSinceFirstSession(tenDaysAgo)).toBe(10)
    })

    it('should return 0 for session today', () => {
      const today = Date.now() - 1000 // 1 second ago
      expect(getDaysSinceFirstSession(today)).toBe(0)
    })
  })

  describe('getWeeklyRollingSeconds', () => {
    it('should return 0 for empty sessions', () => {
      expect(getWeeklyRollingSeconds([])).toBe(0)
    })

    it('should sum sessions within last 7 days', () => {
      const sessions = [
        createSession(1, 30),  // 30 min yesterday
        createSession(3, 20),  // 20 min 3 days ago
        createSession(6, 15),  // 15 min 6 days ago
      ]
      expect(getWeeklyRollingSeconds(sessions)).toBe((30 + 20 + 15) * 60)
    })

    it('should exclude sessions older than 7 days', () => {
      const sessions = [
        createSession(1, 30),  // 30 min yesterday (included)
        createSession(8, 60),  // 60 min 8 days ago (excluded)
        createSession(10, 45), // 45 min 10 days ago (excluded)
      ]
      expect(getWeeklyRollingSeconds(sessions)).toBe(30 * 60)
    })
  })

  describe('getWeeklyRollingHours', () => {
    it('should convert seconds to hours with one decimal', () => {
      const sessions = [
        createSession(1, 90),  // 1.5 hours
        createSession(2, 30),  // 0.5 hours
      ]
      expect(getWeeklyRollingHours(sessions)).toBe(2)
    })
  })

  describe('getLastAchievedMilestone', () => {
    it('should return null when no milestone achieved', () => {
      expect(getLastAchievedMilestone(1)).toBeNull()
    })

    it('should return correct milestone for 2 hours', () => {
      const result = getLastAchievedMilestone(2)
      expect(result).toEqual({ achieved: 2, name: '2 hours' })
    })

    it('should return correct milestone for 100 hours', () => {
      const result = getLastAchievedMilestone(100)
      expect(result).toEqual({ achieved: 100, name: '100 hours' })
    })

    it('should return correct milestone for 1000 hours', () => {
      const result = getLastAchievedMilestone(1000)
      expect(result).toEqual({ achieved: 1000, name: '1k hours' })
    })

    it('should return highest achieved milestone', () => {
      const result = getLastAchievedMilestone(750)
      expect(result).toEqual({ achieved: 750, name: '750 hours' })
    })

    it('should handle values between milestones', () => {
      const result = getLastAchievedMilestone(55)
      expect(result).toEqual({ achieved: 50, name: '50 hours' })
    })
  })

  describe('MILESTONES', () => {
    it('should contain expected milestones', () => {
      expect(MILESTONES).toContain(2)
      expect(MILESTONES).toContain(100)
      expect(MILESTONES).toContain(1000)
      expect(MILESTONES).toContain(10000)
    })

    it('should be sorted in ascending order', () => {
      const sorted = [...MILESTONES].sort((a, b) => a - b)
      expect(MILESTONES).toEqual(sorted)
    })
  })

  describe('PremiumFeatures', () => {
    it('should gate whisperTranscription to premium', () => {
      expect(PremiumFeatures.whisperTranscription('free')).toBe(false)
      expect(PremiumFeatures.whisperTranscription('premium')).toBe(true)
    })

    it('should gate aiFormatting to premium', () => {
      expect(PremiumFeatures.aiFormatting('free')).toBe(false)
      expect(PremiumFeatures.aiFormatting('premium')).toBe(true)
    })

    it('should gate sharePearls to premium', () => {
      expect(PremiumFeatures.sharePearls('free')).toBe(false)
      expect(PremiumFeatures.sharePearls('premium')).toBe(true)
    })

    it('should gate impactStats to premium', () => {
      expect(PremiumFeatures.impactStats('free')).toBe(false)
      expect(PremiumFeatures.impactStats('premium')).toBe(true)
    })

    it('should gate cloudSync to premium', () => {
      expect(PremiumFeatures.cloudSync('free')).toBe(false)
      expect(PremiumFeatures.cloudSync('premium')).toBe(true)
    })
  })
})
