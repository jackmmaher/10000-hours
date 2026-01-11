/**
 * Settings Helpers
 *
 * Functions for managing user settings.
 */

import { db } from './schema'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../notifications'
import type { UserSettings } from './types'

export async function getSettings(): Promise<UserSettings> {
  let settings = await db.settings.get(1)
  if (!settings) {
    settings = {
      id: 1,
      hideTimeDisplay: false,
      skipInsightCapture: false,
      themeMode: 'auto',
      visualEffects: 'calm',
      audioFeedbackEnabled: false,
      notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
    }
    await db.settings.put(settings)
  }
  // Backfill themeMode for existing users
  if (!settings.themeMode) {
    settings.themeMode = 'auto'
    await db.settings.put(settings)
  }
  // Backfill visualEffects for existing users
  if (!settings.visualEffects) {
    settings.visualEffects = 'calm'
    await db.settings.put(settings)
  }
  // Backfill skipInsightCapture for existing users
  if (settings.skipInsightCapture === undefined) {
    settings.skipInsightCapture = false
    await db.settings.put(settings)
  }
  // Backfill audioFeedbackEnabled for existing users
  if (settings.audioFeedbackEnabled === undefined) {
    settings.audioFeedbackEnabled = false
    await db.settings.put(settings)
  }
  // Backfill notificationPreferences for existing users
  if (!settings.notificationPreferences) {
    settings.notificationPreferences = DEFAULT_NOTIFICATION_PREFERENCES
    await db.settings.put(settings)
  }
  return settings
}

export async function updateSettings(updates: Partial<Omit<UserSettings, 'id'>>): Promise<void> {
  await db.settings.update(1, updates)
}
