/**
 * Commitment Analysis
 *
 * Analyzes planned vs actual meditation commitment.
 */

import type { Session, PlannedSession } from '../db'
import type { CommitmentStats } from './types'
import { MIN_DATA, TREND_THRESHOLDS, TIME_WINDOWS, DEFAULTS } from './constants'

/**
 * Analyze planned vs actual meditation commitment
 */
export function getCommitmentStats(
  sessions: Session[],
  plannedSessions: PlannedSession[]
): CommitmentStats {
  // Filter to plans that have passed (not future)
  const now = Date.now()
  const pastPlans = plannedSessions.filter((p) => p.date < now)

  if (pastPlans.length === 0) {
    return {
      plannedHours: 0,
      actualHours: 0,
      overUnderPercent: 0,
      completionRate: 0,
      plansCreated: 0,
      plansCompleted: 0,
      trend: 'new',
    }
  }

  // Calculate planned duration (if duration was set)
  let plannedMinutes = 0
  let plansWithDuration = 0
  for (const plan of pastPlans) {
    if (plan.duration) {
      plannedMinutes += plan.duration
      plansWithDuration++
    }
  }

  // Calculate actual duration from linked sessions
  let actualMinutes = 0
  const completedPlans = pastPlans.filter((p) => p.completed || p.linkedSessionUuid)

  for (const plan of completedPlans) {
    if (plan.linkedSessionUuid) {
      const linkedSession = sessions.find((s) => s.uuid === plan.linkedSessionUuid)
      if (linkedSession) {
        actualMinutes += linkedSession.durationSeconds / 60
      }
    }
  }

  // If no duration data, use session averages
  if (plansWithDuration === 0 && completedPlans.length > 0) {
    // Estimate planned as default minutes per session
    plannedMinutes = completedPlans.length * DEFAULTS.PLANNED_MINUTES_PER_SESSION
  }

  const completionRate =
    pastPlans.length > 0 ? Math.round((completedPlans.length / pastPlans.length) * 100) : 0

  const overUnderPercent =
    plannedMinutes > 0 ? Math.round(((actualMinutes - plannedMinutes) / plannedMinutes) * 100) : 0

  // Determine trend by comparing recent vs older completion rates
  const recentCutoff = now - TIME_WINDOWS.RECENT_DAYS * 24 * 60 * 60 * 1000
  const recentPlans = pastPlans.filter((p) => p.date >= recentCutoff)
  const olderPlans = pastPlans.filter((p) => p.date < recentCutoff)

  let trend: CommitmentStats['trend'] = 'stable'

  if (olderPlans.length < MIN_DATA.PLANS_FOR_TREND) {
    trend = 'new'
  } else if (recentPlans.length >= MIN_DATA.PLANS_FOR_TREND) {
    const recentRate =
      recentPlans.filter((p) => p.completed || p.linkedSessionUuid).length / recentPlans.length
    const olderRate =
      olderPlans.filter((p) => p.completed || p.linkedSessionUuid).length / olderPlans.length

    if (recentRate > olderRate + TREND_THRESHOLDS.COMMITMENT_CHANGE) trend = 'improving'
    else if (recentRate < olderRate - TREND_THRESHOLDS.COMMITMENT_CHANGE) trend = 'declining'
  }

  return {
    plannedHours: Math.round((plannedMinutes / 60) * 10) / 10,
    actualHours: Math.round((actualMinutes / 60) * 10) / 10,
    overUnderPercent,
    completionRate,
    plansCreated: pastPlans.length,
    plansCompleted: completedPlans.length,
    trend,
  }
}
