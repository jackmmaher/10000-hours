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

export interface AdaptiveMilestone {
  currentHours: number
  targetHours: number
  progressPercent: number
  milestoneName: string
  currentFormatted: string  // H:MM format
  targetFormatted: string   // H:MM format
}

export interface WeeklyConsistency {
  days: DayStatus[]  // Monday to Sunday
  sessionsThisWeek: number
  hoursThisWeek: number
  todayIndex: number  // 0-6, which day is today
  todayHasSession: boolean
}

export type DayStatus = 'completed' | 'today' | 'future' | 'missed' | 'next'

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
  // Maturity level determines what we show
  maturityLevel: 'new' | 'building' | 'established'
  // Softened projection message
  projectionMessage: string
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

// Count unique days with sessions
function uniqueDaysWithSessions(sessions: Session[]): number {
  const days = new Set<string>()
  for (const session of sessions) {
    const date = new Date(session.startTime)
    days.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`)
  }
  return days.size
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

// Adaptive milestone system
// Expanded from 11 to 17 milestones to prevent multi-year gaps at higher levels
// Research: Zeigarnik Effect, Flow theory optimal challenge, graded tasks (PMC)
const MILESTONE_HOURS = [
  10, 25, 50, 100,           // Early: habit formation (0-100h)
  250, 500, 750, 1000,       // Building: added 750 (100-1000h)
  1500, 2000, 2500,          // Intermediate: added 1500, 2000 (1000-2500h)
  3500, 5000,                // Advanced: added 3500 (2500-5000h)
  6500, 7500,                // Near-end: added 6500 (5000-7500h)
  8500, 10000                // Final: added 8500 (7500-10000h)
]

// Helper to format hours as Xh Ym
function formatHoursCompact(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.floor((hours - h) * 60)

  if (h === 0) {
    return `${m}m`
  }

  if (m === 0) {
    return `${h}h`
  }

  return `${h}h ${m}m`
}

export function getAdaptiveMilestone(sessions: Session[]): AdaptiveMilestone {
  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0)
  const currentHours = totalSeconds / 3600

  // Find the next milestone
  let targetHours = MILESTONE_HOURS[MILESTONE_HOURS.length - 1]
  let prevMilestone = 0

  for (let i = 0; i < MILESTONE_HOURS.length; i++) {
    if (currentHours < MILESTONE_HOURS[i]) {
      targetHours = MILESTONE_HOURS[i]
      prevMilestone = i > 0 ? MILESTONE_HOURS[i - 1] : 0
      break
    }
    prevMilestone = MILESTONE_HOURS[i]
  }

  // Calculate progress within this milestone band
  const progressInBand = currentHours - prevMilestone
  const bandSize = targetHours - prevMilestone
  const progressPercent = bandSize > 0 ? (progressInBand / bandSize) * 100 : 100

  // Format milestone name
  const milestoneName = targetHours >= 1000
    ? `${(targetHours / 1000).toFixed(targetHours % 1000 === 0 ? 0 : 1)}k hours`
    : `${targetHours} hours`

  return {
    currentHours: Math.round(currentHours * 10) / 10,
    targetHours,
    progressPercent: Math.min(100, Math.round(progressPercent * 10) / 10),
    milestoneName,
    currentFormatted: formatHoursCompact(currentHours),
    targetFormatted: `${targetHours}h`
  }
}

// Weekly consistency tracking
export function getWeeklyConsistency(sessions: Session[]): WeeklyConsistency {
  const now = new Date()
  const today = now.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Convert to Monday-based index (0 = Monday, 6 = Sunday)
  const todayIndex = today === 0 ? 6 : today - 1

  // Get start of this week (Monday 00:00)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - todayIndex)
  startOfWeek.setHours(0, 0, 0, 0)

  // Get sessions this week
  const weekSessions = sessions.filter(s => s.startTime >= startOfWeek.getTime())

  // Calculate hours this week
  const hoursThisWeek = weekSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 3600

  // Determine which days have sessions
  const daysWithSessions = new Set<number>()
  for (const session of weekSessions) {
    const sessionDate = new Date(session.startTime)
    const dayOfWeek = sessionDate.getDay()
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    daysWithSessions.add(dayIndex)
  }

  // Build day status array
  const todayHasSession = daysWithSessions.has(todayIndex)
  const tomorrowIndex = todayIndex < 6 ? todayIndex + 1 : null  // null if today is Sunday

  const days: DayStatus[] = []
  for (let i = 0; i < 7; i++) {
    if (daysWithSessions.has(i)) {
      days.push('completed')
    } else if (i === todayIndex) {
      days.push('today')
    } else if (todayHasSession && tomorrowIndex !== null && i === tomorrowIndex) {
      // Today is complete, tomorrow gets the "next" glow
      days.push('next')
    } else if (i < todayIndex) {
      days.push('missed')  // Past day without session (but we don't emphasize this)
    } else {
      days.push('future')
    }
  }

  return {
    days,
    sessionsThisWeek: weekSessions.length,
    hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
    todayIndex,
    todayHasSession
  }
}

export function getProjection(sessions: Session[]): ProjectionInsight {
  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0)
  const remainingSeconds = Math.max(0, GOAL_SECONDS - totalSeconds)
  const remainingHours = remainingSeconds / 3600
  const percentComplete = (totalSeconds / GOAL_SECONDS) * 100

  // Determine maturity level
  const daysSinceStart = daysSinceFirst(sessions)
  const uniqueDays = uniqueDaysWithSessions(sessions)

  let maturityLevel: 'new' | 'building' | 'established'
  if (daysSinceStart < 7 || uniqueDays < 5) {
    maturityLevel = 'new'
  } else if (daysSinceStart < 30) {
    maturityLevel = 'building'
  } else {
    maturityLevel = 'established'
  }

  // Use 30-day rolling average for projection (more responsive than 90)
  const recent30 = getStatsForWindow(sessions, 30)
  const dailyAverageSeconds = recent30.dailyAverageMinutes * 60

  const daysToCompletion = dailyAverageSeconds > 0
    ? remainingSeconds / dailyAverageSeconds
    : null

  const projectedDate = daysToCompletion && daysToCompletion < 365 * 100  // Cap at 100 years
    ? new Date(Date.now() + daysToCompletion * 24 * 60 * 60 * 1000)
    : null

  // Format current pace description
  const paceMinutes = Math.round(recent30.dailyAverageMinutes)
  const paceDescription = paceMinutes >= 60
    ? `${Math.floor(paceMinutes / 60)}h ${paceMinutes % 60}m daily`
    : `${paceMinutes} min daily`

  // Generate softened projection message
  let projectionMessage: string

  if (maturityLevel === 'new') {
    projectionMessage = 'Keep sitting. Projections appear after your first week.'
  } else if (maturityLevel === 'building') {
    projectionMessage = 'Building your rhythm. Full projections after 30 days.'
  } else if (!projectedDate || !daysToCompletion) {
    projectionMessage = 'Focus on the practice, not the finish line.'
  } else {
    const yearsToCompletion = daysToCompletion / 365

    if (yearsToCompletion > 30) {
      projectionMessage = 'This is a lifetime practice.'
    } else if (yearsToCompletion > 15) {
      projectionMessage = 'A long path ahead. That\'s the point.'
    } else if (yearsToCompletion > 10) {
      projectionMessage = `A decade or more of practice ahead.`
    } else {
      const year = projectedDate.getFullYear()
      projectionMessage = `At current pace: ~${year}`
    }
  }

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
    maturityLevel,
    projectionMessage
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
