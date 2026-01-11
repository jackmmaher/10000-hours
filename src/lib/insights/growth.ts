/**
 * Growth Trajectory Analysis
 *
 * Analyzes session duration evolution over time.
 */

import type { Session } from '../db'
import type { GrowthTrajectory, MonthlyAverage } from './types'

/**
 * Analyze session duration evolution over time
 */
export function getGrowthTrajectory(sessions: Session[]): GrowthTrajectory {
  if (sessions.length < 5) {
    return {
      months: [],
      trend: 'new',
      oldestAvg: 0,
      newestAvg: 0,
      changePercent: 0,
    }
  }

  // Group sessions by month
  const monthMap = new Map<string, { total: number; count: number }>()

  for (const session of sessions) {
    const date = new Date(session.startTime)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const existing = monthMap.get(key) || { total: 0, count: 0 }
    existing.total += session.durationSeconds / 60
    existing.count++
    monthMap.set(key, existing)
  }

  // Convert to array and sort chronologically
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const months: MonthlyAverage[] = []
  const sortedKeys = Array.from(monthMap.keys()).sort()

  for (const key of sortedKeys) {
    const [_year, monthIdx] = key.split('-').map(Number)
    const data = monthMap.get(key)!
    months.push({
      label: monthNames[monthIdx],
      avgMinutes: Math.round(data.total / data.count),
      sessionCount: data.count,
    })
  }

  // Only show last 4 months max
  const recentMonths = months.slice(-4)

  if (recentMonths.length < 2) {
    return {
      months: recentMonths,
      trend: 'new',
      oldestAvg: recentMonths[0]?.avgMinutes || 0,
      newestAvg: recentMonths[0]?.avgMinutes || 0,
      changePercent: 0,
    }
  }

  const oldestAvg = recentMonths[0].avgMinutes
  const newestAvg = recentMonths[recentMonths.length - 1].avgMinutes
  const changePercent = oldestAvg > 0 ? Math.round(((newestAvg - oldestAvg) / oldestAvg) * 100) : 0

  let trend: GrowthTrajectory['trend'] = 'stable'
  if (changePercent >= 20) trend = 'deepening'
  else if (changePercent <= -20) trend = 'shortening'

  return {
    months: recentMonths,
    trend,
    oldestAvg,
    newestAvg,
    changePercent,
  }
}
