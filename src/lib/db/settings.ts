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
    // NEW users get neutral-auto as default
    settings = {
      id: 1,
      hideTimeDisplay: false,
      skipInsightCapture: false,
      themeMode: 'neutral-auto',
      visualEffects: 'calm',
      audioFeedbackEnabled: false,
      notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
    }
    await db.settings.put(settings)
  }
  // Migrate legacy theme modes for EXISTING users
  // 'auto' -> 'living-auto' (preserve their living theme experience)
  // 'manual' -> 'living-manual' (preserve their manual selection)
  if (settings.themeMode === 'auto') {
    settings.themeMode = 'living-auto'
    await db.settings.put(settings)
  } else if (settings.themeMode === 'manual') {
    settings.themeMode = 'living-manual'
    await db.settings.put(settings)
  } else if (!settings.themeMode) {
    // Backfill missing themeMode for very old users
    settings.themeMode = 'neutral-auto'
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
