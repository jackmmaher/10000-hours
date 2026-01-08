/**
 * Progress Insights - Analysis functions for the Progress tab
 *
 * Transforms raw session/planning data into actionable insights.
 * Design principle: Pattern recognition, not data dumps.
 */

import { Session, PlannedSession, SavedTemplate, UserCourseProgress, Insight } from './db'

// ============================================
// TYPES
// ============================================

export interface PatternStrength {
  label: string
  value: string
  strength: number // 0-5 dots
  percentage: number
  detail?: string
}

export interface PracticeShape {
  timeOfDay: PatternStrength | null
  discipline: PatternStrength | null
  pose: PatternStrength | null
  dayOfWeek: PatternStrength | null
}

export interface CommitmentStats {
  plannedHours: number
  actualHours: number
  overUnderPercent: number // positive = over-delivered
  completionRate: number // 0-100
  plansCreated: number
  plansCompleted: number
  trend: 'improving' | 'stable' | 'declining' | 'new'
}

export interface MonthlyAverage {
  label: string // "Oct", "Nov", etc.
  avgMinutes: number
  sessionCount: number
}

export interface GrowthTrajectory {
  months: MonthlyAverage[]
  trend: 'deepening' | 'stable' | 'shortening' | 'new'
  oldestAvg: number
  newestAvg: number
  changePercent: number
}

export interface SuggestedAction {
  id: string
  type: 'course' | 'template' | 'discipline' | 'day' | 'insight' | 'pose'
  message: string
  detail?: string
  actionLabel?: string
  actionView?: 'journey' | 'explore' | 'timer'
  priority: number // lower = more important
}

// ============================================
// PRACTICE SHAPE ANALYSIS
// ============================================

/**
 * Analyze practice patterns across multiple dimensions
 */
export function getPracticeShape(sessions: Session[]): PracticeShape {
  if (sessions.length < 5) {
    return {
      timeOfDay: null,
      discipline: null,
      pose: null,
      dayOfWeek: null
    }
  }

  return {
    timeOfDay: analyzeTimeOfDay(sessions),
    discipline: analyzeDiscipline(sessions),
    pose: analyzePose(sessions),
    dayOfWeek: analyzeDayOfWeek(sessions)
  }
}

function analyzeTimeOfDay(sessions: Session[]): PatternStrength | null {
  const buckets = {
    morning: 0,    // 5am - 12pm
    afternoon: 0,  // 12pm - 5pm
    evening: 0,    // 5pm - 10pm
    night: 0       // 10pm - 5am
  }

  for (const session of sessions) {
    const hour = new Date(session.startTime).getHours()
    if (hour >= 5 && hour < 12) buckets.morning++
    else if (hour >= 12 && hour < 17) buckets.afternoon++
    else if (hour >= 17 && hour < 22) buckets.evening++
    else buckets.night++
  }

  const total = sessions.length
  const entries = Object.entries(buckets) as [keyof typeof buckets, number][]
  const sorted = entries.sort((a, b) => b[1] - a[1])
  const [topTime, topCount] = sorted[0]
  const percentage = Math.round((topCount / total) * 100)

  // Only show if there's a clear pattern (>40%)
  if (percentage < 40) return null

  const labels: Record<string, string> = {
    morning: 'Morning practitioner',
    afternoon: 'Afternoon practitioner',
    evening: 'Evening practitioner',
    night: 'Night owl practitioner'
  }

  const details: Record<string, string> = {
    morning: 'before noon',
    afternoon: '12pm-5pm',
    evening: '5pm-10pm',
    night: 'after 10pm'
  }

  return {
    label: labels[topTime],
    value: topTime,
    strength: percentageToStrength(percentage),
    percentage,
    detail: `${percentage}% ${details[topTime]}`
  }
}

function analyzeDiscipline(sessions: Session[]): PatternStrength | null {
  const counts: Record<string, number> = {}
  let withDiscipline = 0

  for (const session of sessions) {
    if (session.discipline) {
      counts[session.discipline] = (counts[session.discipline] || 0) + 1
      withDiscipline++
    }
  }

  if (withDiscipline < 5) return null

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const [topDiscipline, topCount] = entries[0]
  const percentage = Math.round((topCount / withDiscipline) * 100)

  // Only show if there's focus (>30%)
  if (percentage < 30) return null

  return {
    label: `${topDiscipline}-focused`,
    value: topDiscipline,
    strength: percentageToStrength(percentage),
    percentage,
    detail: `${percentage}% of sessions`
  }
}

function analyzePose(sessions: Session[]): PatternStrength | null {
  const counts: Record<string, number> = {}
  let withPose = 0

  for (const session of sessions) {
    if (session.pose) {
      counts[session.pose] = (counts[session.pose] || 0) + 1
      withPose++
    }
  }

  if (withPose < 5) return null

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const [topPose, topCount] = entries[0]
  const percentage = Math.round((topCount / withPose) * 100)

  // Only show if there's a pattern (>40%)
  if (percentage < 40) return null

  return {
    label: `${topPose} sitter`,
    value: topPose,
    strength: percentageToStrength(percentage),
    percentage,
    detail: `${percentage}% of sessions`
  }
}

function analyzeDayOfWeek(sessions: Session[]): PatternStrength | null {
  const dayCounts = [0, 0, 0, 0, 0, 0, 0] // Sun-Sat
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  for (const session of sessions) {
    const day = new Date(session.startTime).getDay()
    dayCounts[day]++
  }

  // Find strongest day
  let maxDay = 0
  let maxCount = dayCounts[0]
  for (let i = 1; i < 7; i++) {
    if (dayCounts[i] > maxCount) {
      maxCount = dayCounts[i]
      maxDay = i
    }
  }

  const total = sessions.length
  const percentage = Math.round((maxCount / total) * 100)

  // Check if weekday vs weekend pattern
  const weekdayCount = dayCounts[1] + dayCounts[2] + dayCounts[3] + dayCounts[4] + dayCounts[5]
  const weekendCount = dayCounts[0] + dayCounts[6]
  const weekdayPct = Math.round((weekdayCount / total) * 100)

  if (weekdayPct >= 75) {
    return {
      label: 'Weekday practitioner',
      value: 'weekday',
      strength: percentageToStrength(weekdayPct),
      percentage: weekdayPct,
      detail: `${weekdayPct}% Mon-Fri`
    }
  }

  if (weekendCount / total >= 0.4) {
    return {
      label: 'Weekend warrior',
      value: 'weekend',
      strength: percentageToStrength(Math.round((weekendCount / total) * 100)),
      percentage: Math.round((weekendCount / total) * 100),
      detail: `Strong Sat/Sun practice`
    }
  }

  // Only show specific day if very dominant (>25% for single day is a lot)
  if (percentage >= 25) {
    return {
      label: `${dayNames[maxDay]}s are your day`,
      value: dayNames[maxDay].toLowerCase(),
      strength: percentageToStrength(percentage * 2), // Boost since single day
      percentage,
      detail: `${maxCount} sessions`
    }
  }

  return null
}

function percentageToStrength(percentage: number): number {
  if (percentage >= 80) return 5
  if (percentage >= 65) return 4
  if (percentage >= 50) return 3
  if (percentage >= 35) return 2
  return 1
}

// ============================================
// COMMITMENT ANALYSIS
// ============================================

/**
 * Analyze planned vs actual meditation commitment
 */
export function getCommitmentStats(
  sessions: Session[],
  plannedSessions: PlannedSession[]
): CommitmentStats {
  // Filter to plans that have passed (not future)
  const now = Date.now()
  const pastPlans = plannedSessions.filter(p => p.date < now)

  if (pastPlans.length === 0) {
    return {
      plannedHours: 0,
      actualHours: 0,
      overUnderPercent: 0,
      completionRate: 0,
      plansCreated: 0,
      plansCompleted: 0,
      trend: 'new'
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
  const completedPlans = pastPlans.filter(p => p.completed || p.linkedSessionUuid)

  for (const plan of completedPlans) {
    if (plan.linkedSessionUuid) {
      const linkedSession = sessions.find(s => s.uuid === plan.linkedSessionUuid)
      if (linkedSession) {
        actualMinutes += linkedSession.durationSeconds / 60
      }
    }
  }

  // If no duration data, use session averages
  if (plansWithDuration === 0 && completedPlans.length > 0) {
    // Estimate planned as 20min per session (reasonable default)
    plannedMinutes = completedPlans.length * 20
  }

  const completionRate = pastPlans.length > 0
    ? Math.round((completedPlans.length / pastPlans.length) * 100)
    : 0

  const overUnderPercent = plannedMinutes > 0
    ? Math.round(((actualMinutes - plannedMinutes) / plannedMinutes) * 100)
    : 0

  // Determine trend by comparing recent vs older completion rates
  const fourWeeksAgo = now - (28 * 24 * 60 * 60 * 1000)
  const recentPlans = pastPlans.filter(p => p.date >= fourWeeksAgo)
  const olderPlans = pastPlans.filter(p => p.date < fourWeeksAgo)

  let trend: CommitmentStats['trend'] = 'stable'

  if (olderPlans.length < 4) {
    trend = 'new'
  } else if (recentPlans.length >= 4) {
    const recentRate = recentPlans.filter(p => p.completed || p.linkedSessionUuid).length / recentPlans.length
    const olderRate = olderPlans.filter(p => p.completed || p.linkedSessionUuid).length / olderPlans.length

    if (recentRate > olderRate + 0.15) trend = 'improving'
    else if (recentRate < olderRate - 0.15) trend = 'declining'
  }

  return {
    plannedHours: Math.round(plannedMinutes / 60 * 10) / 10,
    actualHours: Math.round(actualMinutes / 60 * 10) / 10,
    overUnderPercent,
    completionRate,
    plansCreated: pastPlans.length,
    plansCompleted: completedPlans.length,
    trend
  }
}

// ============================================
// GROWTH TRAJECTORY
// ============================================

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
      changePercent: 0
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
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const months: MonthlyAverage[] = []
  const sortedKeys = Array.from(monthMap.keys()).sort()

  for (const key of sortedKeys) {
    const [_year, monthIdx] = key.split('-').map(Number)
    const data = monthMap.get(key)!
    months.push({
      label: monthNames[monthIdx],
      avgMinutes: Math.round(data.total / data.count),
      sessionCount: data.count
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
      changePercent: 0
    }
  }

  const oldestAvg = recentMonths[0].avgMinutes
  const newestAvg = recentMonths[recentMonths.length - 1].avgMinutes
  const changePercent = oldestAvg > 0
    ? Math.round(((newestAvg - oldestAvg) / oldestAvg) * 100)
    : 0

  let trend: GrowthTrajectory['trend'] = 'stable'
  if (changePercent >= 20) trend = 'deepening'
  else if (changePercent <= -20) trend = 'shortening'

  return {
    months: recentMonths,
    trend,
    oldestAvg,
    newestAvg,
    changePercent
  }
}

// ============================================
// SUGGESTED ACTIONS
// ============================================

/**
 * Generate conditional, actionable suggestions based on practice gaps
 */
export function getSuggestedActions(
  sessions: Session[],
  plannedSessions: PlannedSession[],
  savedTemplates: SavedTemplate[],
  courseProgress: UserCourseProgress[],
  insights: Insight[]
): SuggestedAction[] {
  const suggestions: SuggestedAction[] = []

  // 1. Unfinished courses
  const activeCourses = courseProgress.filter(c => c.status === 'active')
  for (const course of activeCourses) {
    const remaining = getCourseTotalSessions(course.courseId) - course.sessionsCompleted.length
    if (remaining > 0) {
      suggestions.push({
        id: `course-${course.courseId}`,
        type: 'course',
        message: `${remaining} session${remaining > 1 ? 's' : ''} remain in your course`,
        detail: `${course.sessionsCompleted.length} of ${getCourseTotalSessions(course.courseId)} complete`,
        actionLabel: 'Continue',
        actionView: 'journey',
        priority: 1
      })
    }
  }

  // 2. Saved but unused templates
  const usedTemplateIds = new Set(
    plannedSessions
      .filter(p => p.sourceTemplateId)
      .map(p => p.sourceTemplateId)
  )
  const unusedTemplates = savedTemplates.filter(t => !usedTemplateIds.has(t.templateId))
  if (unusedTemplates.length > 0) {
    suggestions.push({
      id: 'unused-templates',
      type: 'template',
      message: `${unusedTemplates.length} saved meditation${unusedTemplates.length > 1 ? 's' : ''} you haven't tried`,
      actionLabel: 'View saved',
      actionView: 'journey',
      priority: 2
    })
  }

  // 3. Discipline imbalance
  const disciplineCounts: Record<string, number> = {}
  let totalWithDiscipline = 0
  for (const session of sessions) {
    if (session.discipline) {
      disciplineCounts[session.discipline] = (disciplineCounts[session.discipline] || 0) + 1
      totalWithDiscipline++
    }
  }

  if (totalWithDiscipline >= 10) {
    const sorted = Object.entries(disciplineCounts).sort((a, b) => b[1] - a[1])
    if (sorted.length >= 2) {
      const [topName, topCount] = sorted[0]
      const [bottomName, bottomCount] = sorted[sorted.length - 1]
      const topPct = Math.round((topCount / totalWithDiscipline) * 100)

      if (topPct > 40 && bottomCount < 5) {
        suggestions.push({
          id: 'discipline-imbalance',
          type: 'discipline',
          message: `${bottomName}: ${bottomCount} sessions`,
          detail: `${topName}: ${topCount} sessions (${topPct}%)`,
          actionLabel: 'Explore styles',
          actionView: 'explore',
          priority: 3
        })
      }
    }
  }

  // 4. Weak day of week
  if (sessions.length >= 14) {
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]
    const dayNames = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays']

    for (const session of sessions) {
      dayCounts[new Date(session.startTime).getDay()]++
    }

    const avgPerDay = sessions.length / 7
    let weakestDay = -1
    let weakestCount = Infinity

    for (let i = 0; i < 7; i++) {
      if (dayCounts[i] < weakestCount) {
        weakestCount = dayCounts[i]
        weakestDay = i
      }
    }

    // Only suggest if significantly below average (less than 50%)
    if (weakestCount < avgPerDay * 0.5 && weakestCount < sessions.length * 0.1) {
      suggestions.push({
        id: 'weak-day',
        type: 'day',
        message: `${dayNames[weakestDay]} are your quietest`,
        detail: `${weakestCount} sessions vs ${Math.round(avgPerDay)} avg`,
        priority: 4
      })
    }
  }

  // 5. Insights not shared as pearls
  const unsharedInsights = insights.filter(i =>
    i.rawText &&
    i.rawText.trim().length > 20 &&
    !i.sharedPearlId
  )
  if (unsharedInsights.length >= 3) {
    suggestions.push({
      id: 'unshared-insights',
      type: 'insight',
      message: `${unsharedInsights.length} insights could become pearls`,
      detail: 'Share wisdom with the community',
      actionLabel: 'View insights',
      actionView: 'journey',
      priority: 5
    })
  }

  // 6. Pose variety (if they only use one pose)
  const poseCounts: Record<string, number> = {}
  let totalWithPose = 0
  for (const session of sessions) {
    if (session.pose) {
      poseCounts[session.pose] = (poseCounts[session.pose] || 0) + 1
      totalWithPose++
    }
  }

  if (totalWithPose >= 10) {
    const poses = Object.keys(poseCounts)
    if (poses.length === 1) {
      suggestions.push({
        id: 'pose-variety',
        type: 'pose',
        message: `Always ${poses[0]}?`,
        detail: 'Different poses can unlock different experiences',
        priority: 6
      })
    }
  }

  // Sort by priority and limit to top 4
  return suggestions.sort((a, b) => a.priority - b.priority).slice(0, 4)
}

// Helper to get course total sessions (would need course data)
// For now, default to 5 if unknown
function getCourseTotalSessions(_courseId: string): number {
  // TODO: Look up from course data
  return 5
}

// ============================================
// DISCIPLINE DISTRIBUTION (for detailed view)
// ============================================

export interface DisciplineBreakdown {
  name: string
  count: number
  percentage: number
  totalMinutes: number
}

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
      totalMinutes: Math.round(d.minutes)
    }))
    .sort((a, b) => b.count - a.count)
}

// ============================================
// WEEKLY STATS COMPARISON
// ============================================

export interface WeekComparison {
  thisWeek: { sessions: number; minutes: number }
  lastWeek: { sessions: number; minutes: number }
  trend: 'up' | 'down' | 'same'
  changePercent: number
}

export function getWeekComparison(sessions: Session[]): WeekComparison {
  const now = new Date()
  const startOfThisWeek = new Date(now)
  startOfThisWeek.setDate(now.getDate() - now.getDay())
  startOfThisWeek.setHours(0, 0, 0, 0)

  const startOfLastWeek = new Date(startOfThisWeek)
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)

  const thisWeekSessions = sessions.filter(s => s.startTime >= startOfThisWeek.getTime())
  const lastWeekSessions = sessions.filter(s =>
    s.startTime >= startOfLastWeek.getTime() &&
    s.startTime < startOfThisWeek.getTime()
  )

  const thisWeek = {
    sessions: thisWeekSessions.length,
    minutes: Math.round(thisWeekSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60)
  }

  const lastWeek = {
    sessions: lastWeekSessions.length,
    minutes: Math.round(lastWeekSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60)
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
