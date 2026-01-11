/**
 * Profile Helpers
 *
 * Functions for managing user profile data.
 */

import { db } from './schema'
import type { UserProfile } from './types'

export async function getProfile(): Promise<UserProfile> {
  let profile = await db.profile.get(1)
  if (!profile) {
    // Initialize profile for new users
    const firstSession = await db.sessions.orderBy('startTime').first()
    profile = {
      id: 1,
      tier: 'free',
      firstSessionDate: firstSession?.startTime,
      trialExpired: false,
    }
    await db.profile.put(profile)
  }
  return profile
}

export async function updateProfile(updates: Partial<Omit<UserProfile, 'id'>>): Promise<void> {
  await db.profile.update(1, updates)
}

export async function setFirstSessionDate(timestamp: number): Promise<void> {
  const profile = await getProfile()
  if (!profile.firstSessionDate) {
    await updateProfile({ firstSessionDate: timestamp })
  }
}
