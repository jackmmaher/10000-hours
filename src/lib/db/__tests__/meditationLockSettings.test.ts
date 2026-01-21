/**
 * Tests for MeditationLockSettings CRUD operations
 *
 * Tests the database functions for storing and retrieving
 * meditation lock configuration (singleton table).
 */

import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../schema'
import {
  getMeditationLockSettings,
  updateMeditationLockSettings,
  getDefaultMeditationLockSettings,
} from '../meditationLockSettings'

describe('MeditationLockSettings CRUD operations', () => {
  beforeEach(async () => {
    // Clear the table before each test
    await db.meditationLockSettings.clear()
  })

  describe('getDefaultMeditationLockSettings', () => {
    it('should return default settings object', () => {
      const defaults = getDefaultMeditationLockSettings()

      expect(defaults.id).toBe(1)
      expect(defaults.enabled).toBe(false)
      expect(defaults.authorizationStatus).toBe('notDetermined')
      expect(defaults.unlockDurationMinutes).toBe(10)
      expect(defaults.minimumFallbackMinutes).toBe(2)
      expect(defaults.streakFreezesPerMonth).toBe(3)
      expect(defaults.activeDays).toEqual([false, true, true, true, true, true, false])
    })
  })

  describe('getMeditationLockSettings', () => {
    it('should return defaults on first call when no settings exist', async () => {
      const settings = await getMeditationLockSettings()

      expect(settings.id).toBe(1)
      expect(settings.enabled).toBe(false)
      expect(settings.authorizationStatus).toBe('notDetermined')
      expect(settings.identityStatement).toBe('')
      expect(settings.anchorRoutine).toBe('')
      expect(settings.unlockDurationMinutes).toBe(10)
      expect(settings.minimumFallbackMinutes).toBe(2)
    })

    it('should persist defaults to database on first call', async () => {
      await getMeditationLockSettings()

      // Verify it was saved
      const saved = await db.meditationLockSettings.get(1)
      expect(saved).toBeDefined()
      expect(saved?.enabled).toBe(false)
    })

    it('should return existing settings when they exist', async () => {
      // Pre-populate with custom settings
      await db.meditationLockSettings.put({
        id: 1,
        enabled: true,
        authorizationStatus: 'authorized',
        activationDate: Date.now(),
        identityStatement: 'meditates daily',
        whyItMatters: 'For my mental health',
        anchorRoutine: 'wake up',
        anchorLocation: 'bedroom',
        anchorTimeHour: 7,
        anchorTimeMinute: 0,
        backupAnchor: 'lunch',
        backupAnchorTimeHour: 12,
        backupAnchorTimeMinute: 0,
        unlockDurationMinutes: 15,
        minimumFallbackMinutes: 3,
        celebrationRitual: 'smile',
        obstacles: [{ obstacle: 'running late', copingResponse: 'do my 3-min minimum' }],
        accountabilityEnabled: false,
        accountabilityPhone: null,
        accountabilityMethod: 'sms',
        notifyOnCompletion: true,
        notifyOnSkip: false,
        blockedAppTokens: ['token1', 'token2'],
        scheduleWindows: [{ startHour: 7, startMinute: 0, endHour: 9, endMinute: 0 }],
        activeDays: [false, true, true, true, true, true, false],
        streakFreezesPerMonth: 3,
        streakFreezesRemaining: 3,
        gracePeriodMinutes: 30,
        safetyAutoUnlockHours: 2,
        lastFreezeResetAt: null,
        reminderEnabled: true,
        reminderMinutesBefore: 15,
        reminderStyle: 'motivational',
        customReminderMessage: null,
        totalUnlocks: 5,
        totalSkipsUsed: 1,
        totalHardDayFallbacks: 2,
        lastUnlockAt: Date.now(),
        streakDays: 7,
        completionsByDayOfWeek: [0, 1, 1, 1, 1, 1, 0],
      })

      const settings = await getMeditationLockSettings()

      expect(settings.enabled).toBe(true)
      expect(settings.authorizationStatus).toBe('authorized')
      expect(settings.identityStatement).toBe('meditates daily')
      expect(settings.unlockDurationMinutes).toBe(15)
      expect(settings.minimumFallbackMinutes).toBe(3)
      expect(settings.streakDays).toBe(7)
    })
  })

  describe('updateMeditationLockSettings', () => {
    it('should update specific fields', async () => {
      // Initialize defaults
      await getMeditationLockSettings()

      // Update specific fields
      await updateMeditationLockSettings({
        enabled: true,
        identityStatement: 'trains mentally',
        unlockDurationMinutes: 20,
      })

      const settings = await getMeditationLockSettings()

      expect(settings.enabled).toBe(true)
      expect(settings.identityStatement).toBe('trains mentally')
      expect(settings.unlockDurationMinutes).toBe(20)
      // Other fields should remain at defaults
      expect(settings.minimumFallbackMinutes).toBe(2)
    })

    it('should update authorizationStatus', async () => {
      await getMeditationLockSettings()

      await updateMeditationLockSettings({
        authorizationStatus: 'authorized',
      })

      const settings = await getMeditationLockSettings()
      expect(settings.authorizationStatus).toBe('authorized')
    })

    it('should update obstacles array', async () => {
      await getMeditationLockSettings()

      const obstacles = [
        { obstacle: 'running late', copingResponse: 'do my 2-min minimum' },
        { obstacle: 'too tired', copingResponse: 'meditate during lunch' },
      ]

      await updateMeditationLockSettings({ obstacles })

      const settings = await getMeditationLockSettings()
      expect(settings.obstacles).toHaveLength(2)
      expect(settings.obstacles[0].obstacle).toBe('running late')
      expect(settings.obstacles[1].copingResponse).toBe('meditate during lunch')
    })

    it('should update scheduleWindows array', async () => {
      await getMeditationLockSettings()

      const scheduleWindows = [
        { startHour: 7, startMinute: 0, endHour: 9, endMinute: 0 },
        { startHour: 18, startMinute: 0, endHour: 20, endMinute: 0 },
      ]

      await updateMeditationLockSettings({ scheduleWindows })

      const settings = await getMeditationLockSettings()
      expect(settings.scheduleWindows).toHaveLength(2)
      expect(settings.scheduleWindows[0].startHour).toBe(7)
      expect(settings.scheduleWindows[1].startHour).toBe(18)
    })

    it('should update activeDays array', async () => {
      await getMeditationLockSettings()

      // All days active
      const activeDays = [true, true, true, true, true, true, true]

      await updateMeditationLockSettings({ activeDays })

      const settings = await getMeditationLockSettings()
      expect(settings.activeDays).toEqual([true, true, true, true, true, true, true])
    })

    it('should update blockedAppTokens', async () => {
      await getMeditationLockSettings()

      await updateMeditationLockSettings({
        blockedAppTokens: ['token1', 'token2', 'token3'],
      })

      const settings = await getMeditationLockSettings()
      expect(settings.blockedAppTokens).toHaveLength(3)
    })

    it('should increment analytics counters', async () => {
      await getMeditationLockSettings()

      await updateMeditationLockSettings({
        totalUnlocks: 1,
        streakDays: 1,
      })

      let settings = await getMeditationLockSettings()
      expect(settings.totalUnlocks).toBe(1)
      expect(settings.streakDays).toBe(1)

      await updateMeditationLockSettings({
        totalUnlocks: 2,
        streakDays: 2,
      })

      settings = await getMeditationLockSettings()
      expect(settings.totalUnlocks).toBe(2)
      expect(settings.streakDays).toBe(2)
    })

    it('should handle anchor time updates', async () => {
      await getMeditationLockSettings()

      await updateMeditationLockSettings({
        anchorTimeHour: 6,
        anchorTimeMinute: 30,
        anchorRoutine: 'pour my coffee',
        anchorLocation: 'kitchen',
      })

      const settings = await getMeditationLockSettings()
      expect(settings.anchorTimeHour).toBe(6)
      expect(settings.anchorTimeMinute).toBe(30)
      expect(settings.anchorRoutine).toBe('pour my coffee')
      expect(settings.anchorLocation).toBe('kitchen')
    })

    it('should handle accountability settings', async () => {
      await getMeditationLockSettings()

      await updateMeditationLockSettings({
        accountabilityEnabled: true,
        accountabilityPhone: '+1234567890',
        accountabilityMethod: 'whatsapp',
        notifyOnCompletion: true,
        notifyOnSkip: true,
      })

      const settings = await getMeditationLockSettings()
      expect(settings.accountabilityEnabled).toBe(true)
      expect(settings.accountabilityPhone).toBe('+1234567890')
      expect(settings.accountabilityMethod).toBe('whatsapp')
      expect(settings.notifyOnCompletion).toBe(true)
      expect(settings.notifyOnSkip).toBe(true)
    })
  })
})
