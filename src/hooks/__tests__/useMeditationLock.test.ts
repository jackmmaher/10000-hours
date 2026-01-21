/**
 * Tests for useMeditationLock hook
 *
 * Tests the React hook that wraps the native MeditationLock plugin
 * including lock state management and session completion.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Mock the meditationLock module
vi.mock('../../lib/meditationLock', () => ({
  isNativePlatform: vi.fn(() => true),
  requestAuthorization: vi.fn(),
  getAuthorizationStatus: vi.fn(),
  showAppPicker: vi.fn(),
  blockApps: vi.fn(),
  unblockApps: vi.fn(),
  getBlockedApps: vi.fn(),
  getLockState: vi.fn(),
  sessionStarted: vi.fn(),
  sessionCompleted: vi.fn(),
}))

// Mock db module
vi.mock('../../lib/db/meditationLockSettings', () => ({
  getMeditationLockSettings: vi.fn(),
  updateMeditationLockSettings: vi.fn(),
}))

import { useMeditationLock } from '../useMeditationLock'
import {
  isNativePlatform,
  getAuthorizationStatus,
  getBlockedApps,
  getLockState,
  sessionStarted,
  sessionCompleted,
} from '../../lib/meditationLock'
import {
  getMeditationLockSettings,
  updateMeditationLockSettings,
} from '../../lib/db/meditationLockSettings'

describe('useMeditationLock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(isNativePlatform).mockReturnValue(true)
    vi.mocked(getAuthorizationStatus).mockResolvedValue('authorized')
    vi.mocked(getBlockedApps).mockResolvedValue([])
    vi.mocked(getLockState).mockResolvedValue({
      isLockActive: false,
      isSessionInProgress: false,
      lockActivatedAt: 0,
      lastSessionTimestamp: 0,
      lastSessionDurationSeconds: 0,
      streakFreezesRemaining: 3,
      streakDays: 0,
      totalUnlocks: 0,
    })
    vi.mocked(getMeditationLockSettings).mockResolvedValue({
      id: 1,
      enabled: true,
      authorizationStatus: 'authorized',
      activationDate: Date.now(),
      identityStatement: 'meditates daily',
      whyItMatters: null,
      anchorRoutine: 'pour my coffee',
      anchorLocation: 'kitchen',
      anchorTimeHour: 7,
      anchorTimeMinute: 0,
      backupAnchor: null,
      backupAnchorTimeHour: null,
      backupAnchorTimeMinute: null,
      unlockDurationMinutes: 10,
      minimumFallbackMinutes: 2,
      celebrationRitual: 'smile',
      obstacles: [],
      accountabilityEnabled: false,
      accountabilityPhone: null,
      accountabilityMethod: 'sms',
      notifyOnCompletion: true,
      notifyOnSkip: false,
      blockedAppTokens: [],
      scheduleWindows: [{ startHour: 7, startMinute: 0, endHour: 9, endMinute: 0 }],
      activeDays: [false, true, true, true, true, true, false],
      streakFreezesPerMonth: 3,
      streakFreezesRemaining: 3,
      gracePeriodMinutes: 30,
      safetyAutoUnlockHours: 2,
      lastFreezeResetAt: null,
      reminderEnabled: false,
      reminderMinutesBefore: 15,
      reminderStyle: 'simple',
      customReminderMessage: null,
      totalUnlocks: 5,
      totalSkipsUsed: 1,
      totalHardDayFallbacks: 0,
      lastUnlockAt: Date.now() - 86400000,
      streakDays: 7,
      completionsByDayOfWeek: [0, 1, 2, 1, 1, 1, 1],
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('lock state', () => {
    it('should provide lockState after initialization', async () => {
      vi.mocked(getLockState).mockResolvedValue({
        isLockActive: true,
        isSessionInProgress: false,
        lockActivatedAt: Date.now(),
        lastSessionTimestamp: 0,
        lastSessionDurationSeconds: 0,
        streakFreezesRemaining: 3,
        streakDays: 5,
        totalUnlocks: 10,
      })

      const { result } = renderHook(() => useMeditationLock())

      await waitFor(() => {
        expect(result.current.lockState).toBeDefined()
        expect(result.current.lockState?.isLockActive).toBe(true)
        expect(result.current.lockState?.streakDays).toBe(5)
      })
    })

    it('should refresh lock state', async () => {
      const { result } = renderHook(() => useMeditationLock())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      vi.mocked(getLockState).mockResolvedValue({
        isLockActive: true,
        isSessionInProgress: true,
        lockActivatedAt: Date.now(),
        lastSessionTimestamp: 0,
        lastSessionDurationSeconds: 0,
        streakFreezesRemaining: 2,
        streakDays: 6,
        totalUnlocks: 11,
      })

      await act(async () => {
        await result.current.refreshLockState()
      })

      expect(result.current.lockState?.isLockActive).toBe(true)
      expect(result.current.lockState?.isSessionInProgress).toBe(true)
    })
  })

  describe('session management', () => {
    it('should mark session as started', async () => {
      vi.mocked(sessionStarted).mockResolvedValue(true)

      const { result } = renderHook(() => useMeditationLock())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success: boolean | undefined
      await act(async () => {
        success = await result.current.startSession()
      })

      expect(sessionStarted).toHaveBeenCalled()
      expect(success).toBe(true)
    })

    it('should complete session and update stats', async () => {
      vi.mocked(sessionCompleted).mockResolvedValue({
        success: true,
        unlocked: true,
        streakDays: 8,
      })
      vi.mocked(updateMeditationLockSettings).mockResolvedValue({} as never)

      const { result } = renderHook(() => useMeditationLock())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let completionResult: { success: boolean; unlocked: boolean; streakDays?: number } | undefined
      await act(async () => {
        completionResult = await result.current.completeSession(600, false)
      })

      expect(sessionCompleted).toHaveBeenCalledWith(600, false)
      expect(completionResult?.success).toBe(true)
      expect(completionResult?.unlocked).toBe(true)
      expect(completionResult?.streakDays).toBe(8)
    })

    it('should handle fallback session completion', async () => {
      vi.mocked(sessionCompleted).mockResolvedValue({
        success: true,
        unlocked: true,
        streakDays: 8,
      })
      vi.mocked(updateMeditationLockSettings).mockResolvedValue({} as never)

      const { result } = renderHook(() => useMeditationLock())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.completeSession(120, true) // 2 min fallback
      })

      expect(sessionCompleted).toHaveBeenCalledWith(120, true)
    })
  })

  describe('settings access', () => {
    it('should provide lock settings', async () => {
      const { result } = renderHook(() => useMeditationLock())

      await waitFor(() => {
        expect(result.current.settings).toBeDefined()
        expect(result.current.settings?.celebrationRitual).toBe('smile')
        expect(result.current.settings?.unlockDurationMinutes).toBe(10)
      })
    })

    it('should calculate next unlock window', async () => {
      const { result } = renderHook(() => useMeditationLock())

      await waitFor(() => {
        expect(result.current.settings).toBeDefined()
      })

      // nextUnlockWindow should be calculated based on scheduleWindows
      expect(result.current.nextUnlockWindow).toBeDefined()
    })
  })
})
