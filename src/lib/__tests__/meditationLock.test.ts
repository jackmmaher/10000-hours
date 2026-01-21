/**
 * Tests for MeditationLock native plugin wrapper
 *
 * Tests the TypeScript wrapper that interfaces with the native
 * FamilyControls/ManagedSettings plugin on iOS.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Capacitor } from '@capacitor/core'

// Mock Capacitor before importing the module
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(),
    getPlatform: vi.fn(),
  },
  registerPlugin: vi.fn(() => ({
    requestAuthorization: vi.fn(),
    getAuthorizationStatus: vi.fn(),
    showAppPicker: vi.fn(),
    blockApps: vi.fn(),
    unblockApps: vi.fn(),
    getBlockedApps: vi.fn(),
    // Phase 3: Schedule & Shield methods
    syncSettings: vi.fn(),
    setSchedule: vi.fn(),
    clearSchedule: vi.fn(),
    getLockState: vi.fn(),
    sessionStarted: vi.fn(),
    sessionCompleted: vi.fn(),
    useEmergencySkip: vi.fn(),
  })),
}))

// Import after mocking
import {
  requestAuthorization,
  getAuthorizationStatus,
  showAppPicker,
  blockApps,
  unblockApps,
  getBlockedApps,
  isNativePlatform,
  AuthorizationStatus,
  // Phase 3: Schedule & Shield functions
  syncSettings,
  setSchedule,
  clearSchedule,
  getLockState,
  sessionStarted,
  sessionCompleted,
  useEmergencySkip,
  LockState,
  MeditationLockSyncSettings,
} from '../meditationLock'

describe('meditationLock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('isNativePlatform', () => {
    it('should return true when on native platform', () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
      expect(isNativePlatform()).toBe(true)
    })

    it('should return false when on web', () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
      expect(isNativePlatform()).toBe(false)
    })
  })

  describe('requestAuthorization', () => {
    it('should return notDetermined when not on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
      const result = await requestAuthorization()
      expect(result).toBe('notDetermined')
    })

    it('should call native plugin when on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
      vi.mocked(Capacitor.getPlatform).mockReturnValue('ios')

      // The mock is set up in the vi.mock block above
      const result = await requestAuthorization()
      // On native, it should return the status from the plugin
      // Since our mock doesn't set a return value, it will be undefined
      // We're testing the flow, not the actual native implementation
      expect(result).toBeDefined()
    })
  })

  describe('getAuthorizationStatus', () => {
    it('should return notDetermined when not on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
      const result = await getAuthorizationStatus()
      expect(result).toBe('notDetermined')
    })
  })

  describe('showAppPicker', () => {
    it('should return empty array when not on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
      const result = await showAppPicker()
      expect(result).toEqual([])
    })

    it('should return app tokens when on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
      vi.mocked(Capacitor.getPlatform).mockReturnValue('ios')
      // The actual behavior depends on native implementation
      const result = await showAppPicker()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('blockApps', () => {
    it('should return false when not on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
      const result = await blockApps(['token1', 'token2'])
      expect(result).toBe(false)
    })

    it('should return false when given empty token array', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
      const result = await blockApps([])
      expect(result).toBe(false)
    })
  })

  describe('unblockApps', () => {
    it('should return false when not on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
      const result = await unblockApps()
      expect(result).toBe(false)
    })
  })

  describe('getBlockedApps', () => {
    it('should return empty array when not on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
      const result = await getBlockedApps()
      expect(result).toEqual([])
    })
  })

  describe('AuthorizationStatus type', () => {
    it('should have valid authorization status values', () => {
      const statuses: AuthorizationStatus[] = ['authorized', 'denied', 'notDetermined']
      expect(statuses).toHaveLength(3)
      expect(statuses).toContain('authorized')
      expect(statuses).toContain('denied')
      expect(statuses).toContain('notDetermined')
    })
  })

  // ============================================================================
  // Phase 3: Schedule & Shield Tests
  // ============================================================================

  describe('syncSettings', () => {
    const mockSettings: MeditationLockSyncSettings = {
      enabled: true,
      anchorRoutine: 'pour my coffee',
      anchorLocation: 'kitchen',
      anchorTimeHour: 7,
      anchorTimeMinute: 0,
      unlockDurationMinutes: 10,
      minimumFallbackMinutes: 2,
      celebrationRitual: 'smile',
      identityStatement: 'meditates daily',
      streakFreezesRemaining: 3,
      streakFreezesPerMonth: 3,
      gracePeriodMinutes: 30,
      safetyAutoUnlockHours: 2,
      blockedAppTokens: ['token1', 'token2'],
      obstacles: [{ obstacle: 'Running late', copingResponse: 'do my minimum' }],
      scheduleWindows: [{ startHour: 7, startMinute: 0, endHour: 9, endMinute: 0 }],
      activeDays: [false, true, true, true, true, true, false],
    }

    it('should return false when not on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
      const result = await syncSettings(mockSettings)
      expect(result).toBe(false)
    })

    it('should return false when not on iOS', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
      vi.mocked(Capacitor.getPlatform).mockReturnValue('android')
      const result = await syncSettings(mockSettings)
      expect(result).toBe(false)
    })
  })

  describe('setSchedule', () => {
    it('should return false when not on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
      const result = await setSchedule()
      expect(result).toBe(false)
    })

    it('should return false when not on iOS', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
      vi.mocked(Capacitor.getPlatform).mockReturnValue('android')
      const result = await setSchedule()
      expect(result).toBe(false)
    })
  })

  describe('clearSchedule', () => {
    it('should return false when not on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
      const result = await clearSchedule()
      expect(result).toBe(false)
    })

    it('should return false when not on iOS', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
      vi.mocked(Capacitor.getPlatform).mockReturnValue('android')
      const result = await clearSchedule()
      expect(result).toBe(false)
    })
  })

  describe('getLockState', () => {
    it('should return default state when not on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
      const result = await getLockState()
      expect(result).toEqual({
        isLockActive: false,
        isSessionInProgress: false,
        lockActivatedAt: 0,
        lastSessionTimestamp: 0,
        lastSessionDurationSeconds: 0,
        streakFreezesRemaining: 3,
        streakDays: 0,
        totalUnlocks: 0,
      })
    })

    it('should return default state when not on iOS', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
      vi.mocked(Capacitor.getPlatform).mockReturnValue('android')
      const result = await getLockState()
      expect(result.isLockActive).toBe(false)
      expect(result.streakFreezesRemaining).toBe(3)
    })
  })

  describe('sessionStarted', () => {
    it('should return false when not on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
      const result = await sessionStarted()
      expect(result).toBe(false)
    })

    it('should return false when not on iOS', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
      vi.mocked(Capacitor.getPlatform).mockReturnValue('android')
      const result = await sessionStarted()
      expect(result).toBe(false)
    })
  })

  describe('sessionCompleted', () => {
    it('should return default result when not on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
      const result = await sessionCompleted(600, false) // 10 minutes
      expect(result).toEqual({
        success: false,
        unlocked: false,
      })
    })

    it('should return default result when not on iOS', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
      vi.mocked(Capacitor.getPlatform).mockReturnValue('android')
      const result = await sessionCompleted(120, true) // 2 minutes fallback
      expect(result.success).toBe(false)
      expect(result.unlocked).toBe(false)
    })
  })

  describe('useEmergencySkip', () => {
    it('should return failure result when not on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
      const result = await useEmergencySkip()
      expect(result.success).toBe(false)
      expect(result.reason).toBeDefined()
    })

    it('should return failure result when not on iOS', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
      vi.mocked(Capacitor.getPlatform).mockReturnValue('android')
      const result = await useEmergencySkip()
      expect(result.success).toBe(false)
    })
  })

  describe('LockState type', () => {
    it('should have valid lock state structure', () => {
      const state: LockState = {
        isLockActive: true,
        isSessionInProgress: false,
        lockActivatedAt: Date.now(),
        lastSessionTimestamp: Date.now() - 86400000,
        lastSessionDurationSeconds: 600,
        streakFreezesRemaining: 2,
        streakDays: 5,
        totalUnlocks: 10,
      }
      expect(state.isLockActive).toBe(true)
      expect(state.streakDays).toBe(5)
      expect(typeof state.lockActivatedAt).toBe('number')
    })
  })

  describe('MeditationLockSyncSettings type', () => {
    it('should have valid settings structure', () => {
      const settings: MeditationLockSyncSettings = {
        enabled: true,
        anchorRoutine: 'wake up',
        anchorLocation: 'bedroom',
        anchorTimeHour: 6,
        anchorTimeMinute: 30,
        unlockDurationMinutes: 15,
        minimumFallbackMinutes: 3,
        celebrationRitual: 'take a deep breath',
        identityStatement: 'trains mentally',
        streakFreezesRemaining: 2,
        streakFreezesPerMonth: 3,
        gracePeriodMinutes: 60,
        safetyAutoUnlockHours: 4,
        blockedAppTokens: [],
        obstacles: [],
        scheduleWindows: [],
        activeDays: [true, true, true, true, true, true, true],
      }
      expect(settings.unlockDurationMinutes).toBe(15)
      expect(settings.activeDays.length).toBe(7)
    })
  })
})
