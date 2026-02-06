/**
 * Session Completion & Missed Day Logic for Commitment Mode
 *
 * Evidence-based behavioral model replacing casino mechanics.
 * Provides consistency scoring, contextual encouragement,
 * and simple completion tracking.
 */

import { getStartOfDay } from './schedule'
import type { StreakMilestone } from './milestones'

// ============================================================================
// Types
// ============================================================================

export interface SessionCompletionResult {
  /** Current day number in commitment, e.g. 14 */
  dayNumber: number
  /** Total days in commitment, e.g. 30 */
  totalDays: number
  /** Ratio of completedDays / requiredDays so far (0-1) */
  consistencyScore: number
  /** Current consecutive streak */
  streakDays: number
  /** Milestone hit on this session, if any */
  milestone: StreakMilestone | null
  /** Whether this streak exceeds the user's previous longest */
  isNewPersonalBest: boolean
}

export interface MissedDayNotice {
  /** Number of days missed since last session */
  daysMissed: number
  /** Updated consistency score including the misses */
  consistencyScore: number
  /** Contextual encouragement message */
  encouragement: string
  /** Next date that requires a session, or null if commitment is over */
  nextRequiredDay: Date | null
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate consistency score as completedDays / requiredDays.
 * Returns 1 when no days are required yet (avoid division by zero).
 */
export function calculateConsistencyScore(completedDays: number, requiredDays: number): number {
  if (requiredDays <= 0) return 1
  return Math.min(1, completedDays / requiredDays)
}

/**
 * Calculate the day number within a commitment period.
 * Day 1 = the start date itself.
 *
 * @param startDate - Commitment start timestamp
 * @param currentDate - The date to check
 * @returns 1-based day number
 */
export function calculateDayNumber(startDate: number, currentDate: number): number {
  const startDay = getStartOfDay(startDate)
  const currentDay = getStartOfDay(currentDate)
  const diffMs = currentDay - startDay
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  return diffDays + 1
}

/**
 * Generate a contextual encouragement message for missed days.
 *
 * Message priority:
 * 1. First miss → reassurance with score
 * 2. Multiple misses (2-3) → gentle nudge toward minimum
 * 3. Long streak broken (>14) → acknowledge the streak
 * 4. Near end of commitment (<14 days left) → momentum
 * 5. Default → the seat is always here
 */
export function getEncouragementMessage(context: {
  daysMissed: number
  previousStreak: number
  daysRemaining: number
  consistencyScore: number
}): string {
  const scorePercent = Math.round(context.consistencyScore * 100)

  if (context.daysMissed === 1) {
    return `Missing one day doesn't undo your progress. ${scorePercent}% is still strong.`
  }

  if (context.daysMissed >= 2 && context.daysMissed <= 3) {
    return `It's been ${context.daysMissed} days. No judgement. Start with your 2-minute minimum?`
  }

  if (context.previousStreak > 14) {
    return `${context.previousStreak} days of consistency. One miss doesn't erase that.`
  }

  if (context.daysRemaining > 0 && context.daysRemaining < 14) {
    return `${context.daysRemaining} days left. You've already built something real.`
  }

  return `The seat is always here. Your consistency is ${scorePercent}%.`
}
