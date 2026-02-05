/**
 * User Preferences Helpers
 *
 * Functions for managing user meditation preferences.
 */

import { db } from './schema'
import type { UserPreferences } from './types'

export async function getUserPreferences(): Promise<UserPreferences> {
  let prefs = await db.userPreferences.get(1)
  if (!prefs) {
    prefs = {
      id: 1,
      updatedAt: Date.now(),
    }
    await db.userPreferences.put(prefs)
  }
  return prefs
}

export async function updateUserPreferences(
  updates: Partial<Omit<UserPreferences, 'id'>>
): Promise<void> {
  const existing = await db.userPreferences.get(1)
  const merged = { ...existing, ...updates, id: 1 as const, updatedAt: Date.now() }
  await db.userPreferences.put(merged)
}
