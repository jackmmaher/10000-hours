/**
 * Lock Analytics Service
 *
 * Tracks and provides analytics for the meditation lock:
 * - Completion tracking by day of week
 * - Skip usage statistics
 * - Streak calculations
 * - Summary statistics for insights
 */

import {
  getMeditationLockSettings,
  updateMeditationLockSettings,
} from './db/meditationLockSettings'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export interface AnalyticsSummary {
  totalCompletions: number
  totalSkips: number
  totalFallbacks: number
  currentStreak: number
  completionsByDay: number[]
  completionRate: number
  bestDay: number // Day index with most completions
  worstDay: number // Day index with fewest completions
  lastCompletionAt: number | null
}

export interface DayAnalytics {
  dayIndex: number
  dayName: string
  completions: number
}

/**
 * Track a completion event
 *
 * @param isFallback Whether this was a hard day fallback session
 */
export async function trackCompletion(isFallback: boolean): Promise<void> {
  const settings = await getMeditationLockSettings()
  const dayOfWeek = new Date().getDay()

  // Create new completions array with incremented day
  const newCompletions = [...settings.completionsByDayOfWeek]
  newCompletions[dayOfWeek] = (newCompletions[dayOfWeek] || 0) + 1

  await updateMeditationLockSettings({
    totalUnlocks: settings.totalUnlocks + 1,
    completionsByDayOfWeek: newCompletions,
    totalHardDayFallbacks: isFallback
      ? settings.totalHardDayFallbacks + 1
      : settings.totalHardDayFallbacks,
    lastUnlockAt: Date.now(),
  })
}

/**
 * Track a skip usage event
 */
export async function trackSkipUsage(): Promise<void> {
  const settings = await getMeditationLockSettings()

  await updateMeditationLockSettings({
    totalSkipsUsed: settings.totalSkipsUsed + 1,
  })
}

/**
 * Get comprehensive analytics summary
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const settings = await getMeditationLockSettings()

  const completions = settings.completionsByDayOfWeek
  const totalCompletions = settings.totalUnlocks
  const totalSkips = settings.totalSkipsUsed

  // Calculate completion rate
  const total = totalCompletions + totalSkips
  const completionRate = total > 0 ? (totalCompletions / total) * 100 : 0

  // Find best and worst days
  let bestDay = 0
  let worstDay = 0
  let maxCompletions = -1
  let minCompletions = Infinity

  for (let i = 0; i < completions.length; i++) {
    const count = completions[i] || 0
    if (count > maxCompletions) {
      maxCompletions = count
      bestDay = i
    }
    if (count < minCompletions) {
      minCompletions = count
      worstDay = i
    }
  }

  return {
    totalCompletions,
    totalSkips,
    totalFallbacks: settings.totalHardDayFallbacks,
    currentStreak: settings.streakDays,
    completionsByDay: completions,
    completionRate,
    bestDay,
    worstDay,
    lastCompletionAt: settings.lastUnlockAt,
  }
}

/**
 * Get days sorted by difficulty (fewest completions first)
 * Useful for identifying which days the user struggles with
 */
export async function getHardestDays(): Promise<DayAnalytics[]> {
  const settings = await getMeditationLockSettings()
  const completions = settings.completionsByDayOfWeek

  const days: DayAnalytics[] = completions.map((count, index) => ({
    dayIndex: index,
    dayName: DAY_NAMES[index],
    completions: count || 0,
  }))

  // Sort by completions (ascending = hardest first)
  days.sort((a, b) => a.completions - b.completions)

  return days
}

/**
 * Get completion rate as percentage
 * Completions / (Completions + Skips) * 100
 */
export async function getCompletionRate(): Promise<number> {
  const settings = await getMeditationLockSettings()

  const total = settings.totalUnlocks + settings.totalSkipsUsed
  if (total === 0) return 0

  return (settings.totalUnlocks / total) * 100
}

/**
 * Reset all analytics data
 * Used when user wants to start fresh
 */
export async function resetAnalytics(): Promise<void> {
  await updateMeditationLockSettings({
    totalUnlocks: 0,
    totalSkipsUsed: 0,
    totalHardDayFallbacks: 0,
    streakDays: 0,
    completionsByDayOfWeek: [0, 0, 0, 0, 0, 0, 0],
    lastUnlockAt: null,
  })
}

/**
 * Update streak days
 * Called after a successful completion to maintain or increment streak
 *
 * @param newStreakDays The new streak count
 */
export async function updateStreak(newStreakDays: number): Promise<void> {
  await updateMeditationLockSettings({
    streakDays: newStreakDays,
  })
}

/**
 * Break the streak (reset to 0)
 * Called when user misses a day without using an emergency skip
 */
export async function breakStreak(): Promise<void> {
  await updateMeditationLockSettings({
    streakDays: 0,
  })
}
