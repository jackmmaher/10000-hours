/**
 * Tests for Lock Analytics Service
 *
 * Tests analytics tracking for the meditation lock:
 * - Completion tracking by day
 * - Skip usage tracking
 * - Streak calculations
 * - Summary statistics
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the DB
vi.mock('../db/meditationLockSettings', () => ({
  getMeditationLockSettings: vi.fn(),
  updateMeditationLockSettings: vi.fn(),
}))

import {
  getMeditationLockSettings,
  updateMeditationLockSettings,
} from '../db/meditationLockSettings'
import {
  trackCompletion,
  trackSkipUsage,
  getAnalyticsSummary,
  getHardestDays,
  getCompletionRate,
  resetAnalytics,
} from '../lockAnalytics'

describe('lockAnalytics', () => {
  const mockSettings = {
    id: 1,
    enabled: true,
    totalUnlocks: 15,
    totalSkipsUsed: 3,
    totalHardDayFallbacks: 2,
    streakDays: 7,
    completionsByDayOfWeek: [2, 5, 4, 5, 4, 3, 1], // Sun-Sat
    lastUnlockAt: Date.now() - 86400000, // Yesterday
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getMeditationLockSettings).mockResolvedValue(mockSettings as any)
  })

  describe('trackCompletion', () => {
    it('should increment totalUnlocks', async () => {
      await trackCompletion(false)

      expect(updateMeditationLockSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          totalUnlocks: 16,
        })
      )
    })

    it('should increment completion for current day of week', async () => {
      const dayOfWeek = new Date().getDay()
      const expectedCompletions = [...mockSettings.completionsByDayOfWeek]
      expectedCompletions[dayOfWeek] += 1

      await trackCompletion(false)

      expect(updateMeditationLockSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          completionsByDayOfWeek: expectedCompletions,
        })
      )
    })

    it('should increment totalHardDayFallbacks when isFallback is true', async () => {
      await trackCompletion(true)

      expect(updateMeditationLockSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          totalHardDayFallbacks: 3,
        })
      )
    })

    it('should update lastUnlockAt timestamp', async () => {
      const before = Date.now()
      await trackCompletion(false)
      const after = Date.now()

      expect(updateMeditationLockSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          lastUnlockAt: expect.any(Number),
        })
      )

      const call = vi.mocked(updateMeditationLockSettings).mock.calls[0][0]
      expect(call.lastUnlockAt).toBeGreaterThanOrEqual(before)
      expect(call.lastUnlockAt).toBeLessThanOrEqual(after)
    })
  })

  describe('trackSkipUsage', () => {
    it('should increment totalSkipsUsed', async () => {
      await trackSkipUsage()

      expect(updateMeditationLockSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          totalSkipsUsed: 4,
        })
      )
    })
  })

  describe('getAnalyticsSummary', () => {
    it('should return comprehensive analytics data', async () => {
      const summary = await getAnalyticsSummary()

      expect(summary).toEqual(
        expect.objectContaining({
          totalCompletions: 15,
          totalSkips: 3,
          totalFallbacks: 2,
          currentStreak: 7,
          completionsByDay: [2, 5, 4, 5, 4, 3, 1],
        })
      )
    })

    it('should calculate completion rate', async () => {
      const summary = await getAnalyticsSummary()

      // 15 completions, 3 skips = 15/(15+3) = 83.3%
      expect(summary.completionRate).toBeCloseTo(83.3, 1)
    })

    it('should identify best and worst days', async () => {
      const summary = await getAnalyticsSummary()

      expect(summary.bestDay).toBe(1) // Monday (5 completions)
      expect(summary.worstDay).toBe(6) // Saturday (1 completion)
    })
  })

  describe('getHardestDays', () => {
    it('should return days sorted by completion count (lowest first)', async () => {
      const hardestDays = await getHardestDays()

      // Saturday (1), Sunday (2), Friday (3), Tuesday (4), Thursday (4), Monday (5), Wednesday (5)
      expect(hardestDays[0].dayIndex).toBe(6) // Saturday
      expect(hardestDays[0].completions).toBe(1)
    })

    it('should return day names', async () => {
      const hardestDays = await getHardestDays()

      expect(hardestDays[0].dayName).toBe('Saturday')
    })
  })

  describe('getCompletionRate', () => {
    it('should calculate rate from completions and skips', async () => {
      const rate = await getCompletionRate()

      // 15 completions / (15 completions + 3 skips) = 83.3%
      expect(rate).toBeCloseTo(83.3, 1)
    })

    it('should return 100 when no skips', async () => {
      vi.mocked(getMeditationLockSettings).mockResolvedValue({
        ...mockSettings,
        totalSkipsUsed: 0,
      } as any)

      const rate = await getCompletionRate()

      expect(rate).toBe(100)
    })

    it('should return 0 when no completions', async () => {
      vi.mocked(getMeditationLockSettings).mockResolvedValue({
        ...mockSettings,
        totalUnlocks: 0,
        totalSkipsUsed: 5,
      } as any)

      const rate = await getCompletionRate()

      expect(rate).toBe(0)
    })
  })

  describe('resetAnalytics', () => {
    it('should reset all analytics to zero', async () => {
      await resetAnalytics()

      expect(updateMeditationLockSettings).toHaveBeenCalledWith({
        totalUnlocks: 0,
        totalSkipsUsed: 0,
        totalHardDayFallbacks: 0,
        streakDays: 0,
        completionsByDayOfWeek: [0, 0, 0, 0, 0, 0, 0],
        lastUnlockAt: null,
      })
    })
  })
})
