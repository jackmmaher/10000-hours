import { Session } from './db'
import { GOAL_SECONDS } from './constants'

export interface WindowStats {
  totalSeconds: number
  totalHours: number
  sessionCount: number
  avgSessionMinutes: number
  dailyAverageMinutes: number
  longestSessionMinutes: number
}

export interface ProjectionInsight {
  remainingHours: number
  remainingSeconds: number
  percentComplete: number
  projectedDate: Date | null
  daysToCompletion: number | null
  currentPace: {
    dailyMinutes: number
    description: string
  }
  recommendation: {
    dailyMinutesRequired: number
    description: string
  }
  scenarios: ProjectionScenario[]
}

export interface ProjectionScenario {
  description: string
  dailyMinutes: number
  daysToCompletion: number
  completionDate: Date
}

export interface MonthData {
  year: number
  month: number // 0-11
  totalSeconds: number
  sessionCount: number
  intensity: number // 0-1 relative to peak month
}

// Get days since first session for daily average calculation
function daysSinceFirst(sessions: Session[]): number {
  if (sessions.length === 0) return 1
  const first = Math.min(...sessions.map(s => s.startTime))
  const days = (Date.now() - first) / (24 * 60 * 60 * 1000)
  return Math.max(1, days)
}

export function getStatsForWindow(
  sessions: Session[],
  days: number | null
): WindowStats {
  const cutoff = days
    ? Date.now() - days * 24 * 60 * 60 * 1000
    : 0

  const filtered = sessions.filter(s => s.startTime >= cutoff)
  const totalSeconds = filtered.reduce((sum, s) => sum + s.durationSeconds, 0)
  const divisorDays = days ?? daysSinceFirst(sessions)

  const durations = filtered.map(s => s.durationSeconds)
  const longestSeconds = durations.length > 0 ? Math.max(...durations) : 0

  return {
    totalSeconds,
    totalHours: totalSeconds / 3600,
    sessionCount: filtered.length,
    avgSessionMinutes: filtered.length
      ? (totalSeconds / filtered.length) / 60
      : 0,
    dailyAverageMinutes: (totalSeconds / divisorDays) / 60,
    longestSessionMinutes: longestSeconds / 60
  }
}

export function getProjection(sessions: Session[]): ProjectionInsight {
  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0)
  const remainingSeconds = Math.max(0, GOAL_SECONDS - totalSeconds)
  const remainingHours = remainingSeconds / 3600
  const percentComplete = (totalSeconds / GOAL_SECONDS) * 100

  // Use 90-day rolling average for projection
  const recent90 = getStatsForWindow(sessions, 90)
  const dailyAverageSeconds = recent90.dailyAverageMinutes * 60

  const daysToCompletion = dailyAverageSeconds > 0
    ? remainingSeconds / dailyAverageSeconds
    : null

  const projectedDate = daysToCompletion
    ? new Date(Date.now() + daysToCompletion * 24 * 60 * 60 * 1000)
    : null

  // Format current pace description
  const paceMinutes = Math.round(recent90.dailyAverageMinutes)
  const paceDescription = paceMinutes >= 60
    ? `${Math.floor(paceMinutes / 60)}h ${paceMinutes % 60}m daily`
    : `${paceMinutes} min daily`

  // Recommendation to complete by projected date
  const requiredDaily = daysToCompletion
    ? Math.round((remainingSeconds / daysToCompletion) / 60)
    : 0

  const requiredDescription = requiredDaily >= 60
    ? `${Math.floor(requiredDaily / 60)}h ${requiredDaily % 60}m daily`
    : `${requiredDaily} min daily`

  // Alternative scenarios
  const scenarios = [30, 60, 90, 120].map(dailyMinutes => {
    const dailySeconds = dailyMinutes * 60
    const days = remainingSeconds / dailySeconds
    const completionDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

    let description: string
    if (dailyMinutes < 60) {
      description = `${dailyMinutes} min daily`
    } else if (dailyMinutes % 60 === 0) {
      description = `${dailyMinutes / 60} hour${dailyMinutes > 60 ? 's' : ''} daily`
    } else {
      description = `${Math.floor(dailyMinutes / 60)}h ${dailyMinutes % 60}m daily`
    }

    return {
      description,
      dailyMinutes,
      daysToCompletion: Math.ceil(days),
      completionDate
    }
  })

  return {
    remainingHours: Math.round(remainingHours * 10) / 10,
    remainingSeconds,
    percentComplete: Math.round(percentComplete * 100) / 100,
    projectedDate,
    daysToCompletion: daysToCompletion ? Math.ceil(daysToCompletion) : null,
    currentPace: {
      dailyMinutes: paceMinutes,
      description: paceDescription
    },
    recommendation: {
      dailyMinutesRequired: requiredDaily,
      description: requiredDescription
    },
    scenarios
  }
}

// Aggregate sessions by month for heat map
export function getMonthlyData(sessions: Session[]): MonthData[] {
  if (sessions.length === 0) return []

  // Group by year-month
  const monthMap = new Map<string, { seconds: number; count: number }>()

  for (const session of sessions) {
    const date = new Date(session.startTime)
    const key = `${date.getFullYear()}-${date.getMonth()}`

    const existing = monthMap.get(key) || { seconds: 0, count: 0 }
    existing.seconds += session.durationSeconds
    existing.count += 1
    monthMap.set(key, existing)
  }

  // Find peak month for intensity calculation
  const values = Array.from(monthMap.values())
  const peakSeconds = Math.max(...values.map(v => v.seconds), 1)

  // Convert to array with intensity
  const result: MonthData[] = []

  for (const [key, data] of monthMap) {
    const [year, month] = key.split('-').map(Number)
    result.push({
      year,
      month,
      totalSeconds: data.seconds,
      sessionCount: data.count,
      intensity: data.seconds / peakSeconds
    })
  }

  // Sort by date
  result.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.month - b.month
  })

  return result
}

// Get sessions for a specific date
export function getSessionsForDate(sessions: Session[], date: Date): Session[] {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)

  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  return sessions.filter(s =>
    s.startTime >= start.getTime() && s.startTime <= end.getTime()
  )
}

// Get total for a specific date
export function getTotalForDate(sessions: Session[], date: Date): number {
  const daySessions = getSessionsForDate(sessions, date)
  return daySessions.reduce((sum, s) => sum + s.durationSeconds, 0)
}

// Check if date has any sessions
export function dateHasSession(sessions: Session[], date: Date): boolean {
  return getSessionsForDate(sessions, date).length > 0
}

// Get dates with sessions for a month (for calendar dots)
export function getSessionDatesForMonth(
  sessions: Session[],
  year: number,
  month: number
): Set<number> {
  const dates = new Set<number>()

  const monthStart = new Date(year, month, 1).getTime()
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime()

  for (const session of sessions) {
    if (session.startTime >= monthStart && session.startTime <= monthEnd) {
      const date = new Date(session.startTime).getDate()
      dates.add(date)
    }
  }

  return dates
}
