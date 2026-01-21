/**
 * Tests for Deep Link Handler
 *
 * Tests the handler for stillhours://lock-session deep links
 * from the MeditationLock shield extension.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Capacitor App before importing
vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn(),
  },
}))

// Mock db module
vi.mock('../db', () => ({
  addPlannedSession: vi.fn(),
}))

import { parseLockSessionUrl, createLockSession } from '../deepLinkHandler'
import { addPlannedSession } from '../db'

describe('deepLinkHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('parseLockSessionUrl', () => {
    it('should parse valid lock-session URL with all parameters', () => {
      const url = 'stillhours://lock-session?duration=10&fallback=false&anchor=pour%20my%20coffee'
      const result = parseLockSessionUrl(url)

      expect(result).toEqual({
        duration: 10,
        fallback: false,
        anchor: 'pour my coffee',
      })
    })

    it('should parse URL with fallback=true', () => {
      const url = 'stillhours://lock-session?duration=2&fallback=true&anchor=morning'
      const result = parseLockSessionUrl(url)

      expect(result).toEqual({
        duration: 2,
        fallback: true,
        anchor: 'morning',
      })
    })

    it('should handle missing anchor parameter', () => {
      const url = 'stillhours://lock-session?duration=15&fallback=false'
      const result = parseLockSessionUrl(url)

      expect(result).toEqual({
        duration: 15,
        fallback: false,
        anchor: undefined,
      })
    })

    it('should return null for non-lock-session URLs', () => {
      const url = 'stillhours://settings'
      const result = parseLockSessionUrl(url)

      expect(result).toBeNull()
    })

    it('should return null for invalid URLs', () => {
      const url = 'https://example.com'
      const result = parseLockSessionUrl(url)

      expect(result).toBeNull()
    })

    it('should return null for missing duration', () => {
      const url = 'stillhours://lock-session?fallback=false'
      const result = parseLockSessionUrl(url)

      expect(result).toBeNull()
    })

    it('should handle URL-encoded anchor values', () => {
      const url =
        'stillhours://lock-session?duration=10&fallback=false&anchor=wake%20up%20%26%20stretch'
      const result = parseLockSessionUrl(url)

      expect(result?.anchor).toBe('wake up & stretch')
    })
  })

  describe('createLockSession', () => {
    it('should create a PlannedSession with correct parameters', async () => {
      vi.mocked(addPlannedSession).mockResolvedValue({
        id: 1,
        date: Date.now(),
        duration: 10,
        title: '10-min lock session',
        notes: 'After pour my coffee',
        enforceGoal: true,
        createdAt: Date.now(),
      })

      const result = await createLockSession({
        duration: 10,
        fallback: false,
        anchor: 'pour my coffee',
      })

      expect(addPlannedSession).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 10,
          title: '10-min lock session',
          notes: 'After pour my coffee',
          enforceGoal: true,
        })
      )
      expect(result).toBeDefined()
      expect(result?.duration).toBe(10)
    })

    it('should create fallback session with correct title', async () => {
      vi.mocked(addPlannedSession).mockResolvedValue({
        id: 2,
        date: Date.now(),
        duration: 2,
        title: '2-min flexibility session',
        enforceGoal: true,
        createdAt: Date.now(),
      })

      await createLockSession({
        duration: 2,
        fallback: true,
        anchor: 'morning',
      })

      expect(addPlannedSession).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 2,
          title: '2-min flexibility session',
          enforceGoal: true,
        })
      )
    })

    it('should use today date (start of day) for the session', async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      vi.mocked(addPlannedSession).mockResolvedValue({
        id: 3,
        date: today.getTime(),
        duration: 15,
        title: '15-min lock session',
        enforceGoal: true,
        createdAt: Date.now(),
      })

      await createLockSession({
        duration: 15,
        fallback: false,
      })

      expect(addPlannedSession).toHaveBeenCalledWith(
        expect.objectContaining({
          date: today.getTime(),
        })
      )
    })

    it('should NOT set plannedTime (to ensure getNextPlannedSession finds it)', async () => {
      vi.mocked(addPlannedSession).mockResolvedValue({
        id: 4,
        date: Date.now(),
        duration: 10,
        title: '10-min lock session',
        enforceGoal: true,
        createdAt: Date.now(),
      })

      await createLockSession({
        duration: 10,
        fallback: false,
      })

      // Verify plannedTime is NOT set - this ensures getNextPlannedSession won't
      // filter out the session due to plannedTime <= currentTime
      const calledWith = vi.mocked(addPlannedSession).mock.calls[0][0]
      expect(calledWith.plannedTime).toBeUndefined()
    })
  })
})
