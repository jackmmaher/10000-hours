/**
 * Achievement Helpers
 *
 * Functions for managing milestone achievements.
 */

import { getProfile, updateProfile } from './profile'
import type { Achievement } from './types'

export async function getAchievements(): Promise<Achievement[]> {
  const profile = await getProfile()
  return profile.achievements ?? []
}

export async function addAchievement(achievement: Achievement): Promise<void> {
  const profile = await getProfile()
  const achievements = profile.achievements ?? []

  // Don't add duplicates
  if (achievements.some((a) => a.hours === achievement.hours)) {
    return
  }

  achievements.push(achievement)
  achievements.sort((a, b) => a.hours - b.hours)

  await updateProfile({ achievements })
}

export async function recordMilestoneIfNew(
  totalHours: number,
  milestones: number[]
): Promise<Achievement | null> {
  const profile = await getProfile()
  const achievements = profile.achievements ?? []
  const achievedHours = new Set(achievements.map((a) => a.hours))

  // Find milestones that should be achieved but aren't recorded
  for (const milestone of milestones) {
    if (totalHours >= milestone && !achievedHours.has(milestone)) {
      const name =
        milestone >= 1000
          ? `${(milestone / 1000).toFixed(milestone % 1000 === 0 ? 0 : 1)}k hours`
          : `${milestone} hours`

      const achievement: Achievement = {
        hours: milestone,
        achievedAt: Date.now(),
        name,
      }

      await addAchievement(achievement)
      return achievement
    }
  }

  return null
}
