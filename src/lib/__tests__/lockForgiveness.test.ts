/**
 * Tests for Lock Forgiveness Service
 *
 * Tests the forgiveness features of the meditation lock:
 * - Emergency skip flow
 * - Month rollover for streak freezes
 * - Grace period logic
 * - Safety auto-unlock
 * - Backup anchor notifications
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the native plugin
vi.mock('../meditationLock', () => ({
  consumeEmergencySkip: vi.fn(),
  getLockState: vi.fn(),
  unblockApps: vi.fn(),
  isNativePlatform: vi.fn().mockReturnValue(true),
  isIOSPlatform: vi.fn().mockReturnValue(true),
}))

// Mock the DB
vi.mock('../db/meditationLockSettings', () => ({
  getMeditationLockSettings: vi.fn(),
  updateMeditationLockSettings: vi.fn(),
}))

import { consumeEmergencySkip as nativeConsumeEmergencySkip, getLockState } from '../meditationLock'
import {
  getMeditationLockSettings,
  updateMeditationLockSettings,
} from '../db/meditationLockSettings'
import {
  performEmergencySkip,
  checkAndResetMonthlyFreezes,
  isWithinGracePeriod,
  shouldSafetyAutoUnlock,
  scheduleBackupAnchorNotification,
  scheduleReminderNotification,
  getForgivenessStatus,
} from '../lockForgiveness'

describe('lockForgiveness', () => {
  const mockSettings = {
    id: 1,
    enabled: true,
    streakFreezesPerMonth: 3,
    streakFreezesRemaining: 2,
    gracePeriodMinutes: 30,
    safetyAutoUnlockHours: 2,
    lastFreezeResetAt: null as number | null,
    anchorTimeHour: 7,
    anchorTimeMinute: 0,
    backupAnchor: 'after lunch',
    backupAnchorTimeHour: 12,
    backupAnchorTimeMinute: 30,
    unlockDurationMinutes: 10,
    minimumFallbackMinutes: 2,
    reminderEnabled: true,
    reminderMinutesBefore: 15,
    reminderStyle: 'motivational' as const,
    customReminderMessage: null,
    identityStatement: 'I am becoming someone who meditates daily',
    totalSkipsUsed: 5,
    accountabilityEnabled: false,
    accountabilityPhone: null,
    accountabilityMethod: 'sms' as const,
    notifyOnSkip: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getMeditationLockSettings).mockResolvedValue(mockSettings as any)
  })

  describe('performEmergencySkip', () => {
    it('should decrement streakFreezesRemaining on successful skip', async () => {
      vi.mocked(nativeConsumeEmergencySkip).mockResolvedValue({
        success: true,
        skipsRemaining: 1,
      })

      const result = await performEmergencySkip()

      expect(result.success).toBe(true)
      expect(result.skipsRemaining).toBe(1)
      expect(updateMeditationLockSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          streakFreezesRemaining: 1,
          totalSkipsUsed: 6,
        })
      )
    })

    it('should fail when no skips remaining', async () => {
      vi.mocked(getMeditationLockSettings).mockResolvedValue({
        ...mockSettings,
        streakFreezesRemaining: 0,
      } as any)

      const result = await performEmergencySkip()

      expect(result.success).toBe(false)
      expect(result.reason).toContain('No skips remaining')
      expect(nativeConsumeEmergencySkip).not.toHaveBeenCalled()
    })

    it('should increment totalSkipsUsed for analytics', async () => {
      vi.mocked(nativeConsumeEmergencySkip).mockResolvedValue({
        success: true,
        skipsRemaining: 1,
      })

      await performEmergencySkip()

      expect(updateMeditationLockSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          totalSkipsUsed: 6,
        })
      )
    })

    it('should handle native skip failure gracefully', async () => {
      vi.mocked(nativeConsumeEmergencySkip).mockResolvedValue({
        success: false,
        reason: 'Native error',
      })

      const result = await performEmergencySkip()

      expect(result.success).toBe(false)
      expect(result.reason).toBe('Native error')
      expect(updateMeditationLockSettings).not.toHaveBeenCalled()
    })
  })

  describe('checkAndResetMonthlyFreezes', () => {
    it('should reset freezes on new month', async () => {
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      vi.mocked(getMeditationLockSettings).mockResolvedValue({
        ...mockSettings,
        streakFreezesRemaining: 1,
        lastFreezeResetAt: lastMonth.getTime(),
      } as any)

      const result = await checkAndResetMonthlyFreezes()

      expect(result.wasReset).toBe(true)
      expect(result.newCount).toBe(3) // Reset to streakFreezesPerMonth
      expect(updateMeditationLockSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          streakFreezesRemaining: 3,
        })
      )
    })

    it('should not reset freezes within same month', async () => {
      const thisMonth = new Date()

      vi.mocked(getMeditationLockSettings).mockResolvedValue({
        ...mockSettings,
        streakFreezesRemaining: 1,
        lastFreezeResetAt: thisMonth.getTime(),
      } as any)

      const result = await checkAndResetMonthlyFreezes()

      expect(result.wasReset).toBe(false)
      expect(result.newCount).toBe(1) // Unchanged
      expect(updateMeditationLockSettings).not.toHaveBeenCalled()
    })

    it('should handle first-time setup (no lastFreezeResetAt)', async () => {
      vi.mocked(getMeditationLockSettings).mockResolvedValue({
        ...mockSettings,
        lastFreezeResetAt: undefined,
      } as any)

      await checkAndResetMonthlyFreezes()

      // Should set initial reset timestamp without changing count
      expect(updateMeditationLockSettings).toHaveBeenCalled()
    })
  })

  describe('isWithinGracePeriod', () => {
    it('should return true within grace period', () => {
      const anchorTime = new Date()
      anchorTime.setMinutes(anchorTime.getMinutes() - 15) // 15 min ago

      const result = isWithinGracePeriod(anchorTime, 30)

      expect(result).toBe(true)
    })

    it('should return false after grace period', () => {
      const anchorTime = new Date()
      anchorTime.setMinutes(anchorTime.getMinutes() - 45) // 45 min ago

      const result = isWithinGracePeriod(anchorTime, 30)

      expect(result).toBe(false)
    })

    it('should return false when grace period is null/disabled', () => {
      const anchorTime = new Date()

      const result = isWithinGracePeriod(anchorTime, null)

      expect(result).toBe(false)
    })

    it('should return true for future anchor time', () => {
      const anchorTime = new Date()
      anchorTime.setMinutes(anchorTime.getMinutes() + 15) // 15 min in future

      const result = isWithinGracePeriod(anchorTime, 30)

      expect(result).toBe(true)
    })
  })

  describe('shouldSafetyAutoUnlock', () => {
    it('should return true when lock exceeded safety hours', () => {
      const lockActivatedAt = new Date()
      lockActivatedAt.setHours(lockActivatedAt.getHours() - 3) // 3 hours ago

      const result = shouldSafetyAutoUnlock(lockActivatedAt.getTime(), 2)

      expect(result).toBe(true)
    })

    it('should return false within safety hours', () => {
      const lockActivatedAt = new Date()
      lockActivatedAt.setHours(lockActivatedAt.getHours() - 1) // 1 hour ago

      const result = shouldSafetyAutoUnlock(lockActivatedAt.getTime(), 2)

      expect(result).toBe(false)
    })

    it('should return false when safety auto-unlock is disabled (null)', () => {
      const lockActivatedAt = new Date()
      lockActivatedAt.setHours(lockActivatedAt.getHours() - 5) // 5 hours ago

      const result = shouldSafetyAutoUnlock(lockActivatedAt.getTime(), null)

      expect(result).toBe(false)
    })
  })

  describe('scheduleBackupAnchorNotification', () => {
    it('should return true when backup anchor is configured', async () => {
      const result = await scheduleBackupAnchorNotification(mockSettings as any)

      expect(result).toBe(true)
    })

    it('should return false if no backup anchor configured', async () => {
      const result = await scheduleBackupAnchorNotification({
        ...mockSettings,
        backupAnchor: null,
      } as any)

      expect(result).toBe(false)
    })

    it('should return false if no backup anchor time configured', async () => {
      const result = await scheduleBackupAnchorNotification({
        ...mockSettings,
        backupAnchorTimeHour: null,
      } as any)

      expect(result).toBe(false)
    })
  })

  describe('scheduleReminderNotification', () => {
    it('should return true when reminders are enabled', async () => {
      const result = await scheduleReminderNotification(mockSettings as any)

      expect(result).toBe(true)
    })

    it('should return true with simple reminder style', async () => {
      const result = await scheduleReminderNotification({
        ...mockSettings,
        reminderStyle: 'simple',
      } as any)

      expect(result).toBe(true)
    })

    it('should return true with custom message', async () => {
      const result = await scheduleReminderNotification({
        ...mockSettings,
        reminderStyle: 'custom',
        customReminderMessage: 'Your breath awaits',
      } as any)

      expect(result).toBe(true)
    })

    it('should return false if reminders disabled', async () => {
      const result = await scheduleReminderNotification({
        ...mockSettings,
        reminderEnabled: false,
      } as any)

      expect(result).toBe(false)
    })
  })

  describe('getForgivenessStatus', () => {
    it('should return all forgiveness data', async () => {
      vi.mocked(getLockState).mockResolvedValue({
        isLockActive: true,
        isSessionInProgress: false,
        lockActivatedAt: Date.now() - 30 * 60 * 1000, // 30 min ago
        lastSessionTimestamp: 0,
        lastSessionDurationSeconds: 0,
        streakFreezesRemaining: 2,
        streakDays: 5,
        totalUnlocks: 10,
      })

      const status = await getForgivenessStatus()

      expect(status).toEqual(
        expect.objectContaining({
          skipsRemaining: 2,
          gracePeriodActive: expect.any(Boolean),
          safetyUnlockPending: expect.any(Boolean),
        })
      )
    })
  })
})
