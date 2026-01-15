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
    // NEW users get 'auto' as default (follows system preference)
    settings = {
      id: 1,
      hideTimeDisplay: false,
      skipInsightCapture: false,
      themeMode: 'auto',
      audioFeedbackEnabled: false,
      notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
    }
    await db.settings.put(settings)
  }
  // Migrate all legacy theme modes to simple auto/light/dark
  const mode = settings.themeMode
  if (
    mode === 'neutral-auto' ||
    mode === 'living-auto' ||
    mode === 'auto' ||
    mode === 'manual' ||
    mode === 'living-manual'
  ) {
    settings.themeMode = 'auto'
    await db.settings.put(settings)
  } else if (mode === 'neutral-light') {
    settings.themeMode = 'light'
    await db.settings.put(settings)
  } else if (mode === 'neutral-dark') {
    settings.themeMode = 'dark'
    await db.settings.put(settings)
  } else if (!settings.themeMode) {
    // Backfill missing themeMode for very old users
    settings.themeMode = 'auto'
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
