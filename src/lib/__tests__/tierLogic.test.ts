import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getDaysSinceFirstSession,
  getWeeklyRollingSeconds,
  getWeeklyRollingHours,
  getLastAchievedMilestone,
  generateMilestones
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

  describe('generateMilestones', () => {
    it('should contain expected milestones in infinite mode', () => {
      const milestones = generateMilestones()
      expect(milestones).toContain(2)
      expect(milestones).toContain(100)
      expect(milestones).toContain(1000)
      expect(milestones).toContain(10000)
    })

    it('should be sorted in ascending order', () => {
      const milestones = generateMilestones()
      const sorted = [...milestones].sort((a, b) => a - b)
      expect(milestones).toEqual(sorted)
    })

    it('should respect user goal', () => {
      const milestones = generateMilestones(50)
      expect(milestones[milestones.length - 1]).toBe(50)
      expect(milestones).not.toContain(100)
    })
  })
})
