/**
 * Breakdown Analysis
 *
 * Discipline distribution and weekly stats comparison.
 */

import type { Session } from '../db'
import type { DisciplineBreakdown, WeekComparison } from './types'

/**
 * Get discipline distribution breakdown
 */
export function getDisciplineBreakdown(sessions: Session[]): DisciplineBreakdown[] {
  const data: Record<string, { count: number; minutes: number }> = {}
  let total = 0

  for (const session of sessions) {
    const discipline = session.discipline || 'Unspecified'
    if (!data[discipline]) {
      data[discipline] = { count: 0, minutes: 0 }
    }
    data[discipline].count++
    data[discipline].minutes += session.durationSeconds / 60
    total++
  }

  return Object.entries(data)
    .map(([name, d]) => ({
      name,
      count: d.count,
      percentage: Math.round((d.count / total) * 100),
      totalMinutes: Math.round(d.minutes),
    }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Compare this week vs last week stats
 */
export function getWeekComparison(sessions: Session[]): WeekComparison {
  const now = new Date()
  const startOfThisWeek = new Date(now)
  startOfThisWeek.setDate(now.getDate() - now.getDay())
  startOfThisWeek.setHours(0, 0, 0, 0)

  const startOfLastWeek = new Date(startOfThisWeek)
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)

  const thisWeekSessions = sessions.filter((s) => s.startTime >= startOfThisWeek.getTime())
  const lastWeekSessions = sessions.filter(
    (s) => s.startTime >= startOfLastWeek.getTime() && s.startTime < startOfThisWeek.getTime()
  )

  const thisWeek = {
    sessions: thisWeekSessions.length,
    minutes: Math.round(thisWeekSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60),
  }

  const lastWeek = {
    sessions: lastWeekSessions.length,
    minutes: Math.round(lastWeekSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60),
  }

  let trend: 'up' | 'down' | 'same' = 'same'
  let changePercent = 0

  if (lastWeek.minutes > 0) {
    changePercent = Math.round(((thisWeek.minutes - lastWeek.minutes) / lastWeek.minutes) * 100)
    if (changePercent > 10) trend = 'up'
    else if (changePercent < -10) trend = 'down'
  } else if (thisWeek.minutes > 0) {
    trend = 'up'
    changePercent = 100
  }

  return { thisWeek, lastWeek, trend, changePercent }
}
