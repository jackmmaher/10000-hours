/**
 * MeditationLockSettings CRUD Operations
 *
 * Handles persistence for meditation lock configuration.
 * Uses a singleton pattern (id: 1) for the settings table.
 */

import { db } from './schema'
import type { MeditationLockSettings } from './types'

/**
 * Get default meditation lock settings
 * Used when initializing for the first time
 */
export function getDefaultMeditationLockSettings(): MeditationLockSettings {
  return {
    id: 1,
    enabled: false,
    authorizationStatus: 'notDetermined',
    activationDate: 0,

    // Identity Framing
    identityStatement: '',
    whyItMatters: null,

    // Implementation Intentions (Anchor)
    anchorRoutine: '',
    anchorLocation: '',
    anchorTimeHour: 7,
    anchorTimeMinute: 0,
    backupAnchor: null,
    backupAnchorTimeHour: null,
    backupAnchorTimeMinute: null,

    // Commitment & Tiny Habits
    unlockDurationMinutes: 10,
    minimumFallbackMinutes: 2,
    celebrationRitual: null,

    // Obstacle Anticipation
    obstacles: [],

    // Accountability
    accountabilityEnabled: false,
    accountabilityPhone: null,
    accountabilityMethod: 'sms',
    notifyOnCompletion: true,
    notifyOnSkip: false,

    // Apps & Schedule
    blockedAppTokens: [],
    scheduleWindows: [],
    activeDays: [false, true, true, true, true, true, false], // Mon-Fri default

    // Forgiveness & Safety
    streakFreezesPerMonth: 3,
    streakFreezesRemaining: 3,
    gracePeriodMinutes: 30,
    safetyAutoUnlockHours: 2,
    lastFreezeResetAt: null,

    // Reminders
    reminderEnabled: false,
    reminderMinutesBefore: 15,
    reminderStyle: 'simple',
    customReminderMessage: null,

    // Analytics
    totalUnlocks: 0,
    totalSkipsUsed: 0,
    totalHardDayFallbacks: 0,
    lastUnlockAt: null,
    streakDays: 0,
    completionsByDayOfWeek: [0, 0, 0, 0, 0, 0, 0],
  }
}

/**
 * Get meditation lock settings
 * Returns existing settings or creates defaults if none exist
 */
export async function getMeditationLockSettings(): Promise<MeditationLockSettings> {
  const existing = await db.meditationLockSettings.get(1)

  if (existing) {
    return existing
  }

  // Initialize with defaults
  const defaults = getDefaultMeditationLockSettings()
  await db.meditationLockSettings.put(defaults)
  return defaults
}

/**
 * Update meditation lock settings
 * Merges partial updates with existing settings
 */
export async function updateMeditationLockSettings(
  updates: Partial<Omit<MeditationLockSettings, 'id'>>
): Promise<MeditationLockSettings> {
  // Ensure settings exist
  const current = await getMeditationLockSettings()

  // Merge updates
  const updated: MeditationLockSettings = {
    ...current,
    ...updates,
    id: 1, // Always keep singleton id
  }

  await db.meditationLockSettings.put(updated)
  return updated
}
