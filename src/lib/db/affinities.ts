/**
 * User Affinities Database Operations
 *
 * Manages the adaptive recommendation affinities stored in IndexedDB.
 * Affinities drift from 1.0 (neutral) based on implicit feedback.
 */

import { db } from './schema'
import type { UserAffinities } from './types'

/**
 * Default affinities for new users
 * All weights start at 1.0 (neutral)
 */
function createDefaultAffinities(): UserAffinities {
  return {
    id: 1,
    tags: {},
    disciplines: {},
    timeSlots: {},
    durationBuckets: {},
    lastDecayAt: Date.now(),
    totalFeedbackEvents: 0,
  }
}

/**
 * Get the user's current affinities
 * Creates default affinities if none exist
 */
export async function getUserAffinities(): Promise<UserAffinities> {
  const existing = await db.userAffinities.get(1)
  if (existing) return existing

  // Initialize with defaults
  const defaults = createDefaultAffinities()
  await db.userAffinities.put(defaults)
  return defaults
}

/**
 * Save updated user affinities
 */
export async function saveUserAffinities(affinities: UserAffinities): Promise<void> {
  await db.userAffinities.put(affinities)
}

/**
 * Reset affinities to defaults (for testing/debugging)
 */
export async function resetUserAffinities(): Promise<void> {
  await db.userAffinities.put(createDefaultAffinities())
}
