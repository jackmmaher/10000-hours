/**
 * Tier Logic - Value-add freemium model
 *
 * FREE tier: Full core functionality
 * - All meditation history (no fading)
 * - All stats windows
 * - Web Speech API transcription
 * - Read/vote/save pearls
 *
 * PREMIUM tier: Enhanced features ($4.99/year)
 * - Whisper API transcription (better accuracy)
 * - AI text formatting
 * - Share pearls to community
 * - Impact stats (karma, saves)
 * - Cloud backup & sync
 */

import { Session, TierType } from './db'
import { MS_PER_DAY } from './constants'

/**
 * Determines if user has premium features
 */
export function isPremium(tier: TierType): boolean {
  return tier === 'premium'
}

/**
 * Calculates days since user's first session
 */
export function getDaysSinceFirstSession(firstSessionDate?: number): number {
  if (!firstSessionDate) return 0

  const now = Date.now()
  const diffMs = now - firstSessionDate
  return Math.floor(diffMs / MS_PER_DAY)
}

/**
 * Calculates rolling 7-day seconds from sessions
 */
export function getWeeklyRollingSeconds(sessions: Session[]): number {
  const sevenDaysAgo = Date.now() - 7 * MS_PER_DAY

  const weekSessions = sessions.filter(s => s.startTime >= sevenDaysAgo)
  const totalSeconds = weekSessions.reduce((sum, s) => sum + s.durationSeconds, 0)

  return totalSeconds
}

/**
 * @deprecated Use getWeeklyRollingSeconds with formatTotalHours instead
 */
export function getWeeklyRollingHours(sessions: Session[]): number {
  const totalSeconds = getWeeklyRollingSeconds(sessions)
  return Math.round((totalSeconds / 3600) * 10) / 10
}

/**
 * Gets the last achieved milestone
 */
export function getLastAchievedMilestone(
  totalHours: number
): { achieved: number; name: string } | null {
  const achieved = MILESTONES.filter(m => totalHours >= m).pop()

  if (!achieved) return null

  const name = achieved >= 1000
    ? `${achieved / 1000}k hours`
    : `${achieved} hours`

  return { achieved, name }
}

/**
 * Milestone array for achievement tracking
 */
export const MILESTONES = [
  2, 5, 10, 25, 50, 100, 250, 500, 750,
  1000, 1500, 2000, 2500, 3500, 5000, 6500, 7500, 8500, 10000
]

/**
 * Premium feature checks - used by components to gate features
 */
export const PremiumFeatures = {
  /** Whisper API for more accurate transcription */
  whisperTranscription: (tier: TierType) => isPremium(tier),

  /** AI formatting of raw transcriptions */
  aiFormatting: (tier: TierType) => isPremium(tier),

  /** Ability to share insights as pearls */
  sharePearls: (tier: TierType) => isPremium(tier),

  /** Impact stats (karma, total saves received) */
  impactStats: (tier: TierType) => isPremium(tier),

  /** Cloud backup and sync across devices */
  cloudSync: (tier: TierType) => isPremium(tier),
} as const
