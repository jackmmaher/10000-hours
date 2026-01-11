/**
 * Practice Shape Analysis
 *
 * Analyzes practice patterns across multiple dimensions:
 * time of day, discipline, pose, and day of week.
 */

import type { Session } from '../db'
import type { PracticeShape, PatternStrength } from './types'
import { MIN_DATA, PATTERN_THRESHOLDS, STRENGTH_LEVELS, TIME_BUCKETS } from './constants'

/**
 * Analyze practice patterns across multiple dimensions
 */
export function getPracticeShape(sessions: Session[]): PracticeShape {
  if (sessions.length < MIN_DATA.SESSIONS_FOR_PATTERNS) {
    return {
      timeOfDay: null,
      discipline: null,
      pose: null,
      dayOfWeek: null,
    }
  }

  return {
    timeOfDay: analyzeTimeOfDay(sessions),
    discipline: analyzeDiscipline(sessions),
    pose: analyzePose(sessions),
    dayOfWeek: analyzeDayOfWeek(sessions),
  }
}

function analyzeTimeOfDay(sessions: Session[]): PatternStrength | null {
  const buckets = {
    morning: 0, // 5am - 12pm
    afternoon: 0, // 12pm - 5pm
    evening: 0, // 5pm - 10pm
    night: 0, // 10pm - 5am
  }

  for (const session of sessions) {
    const hour = new Date(session.startTime).getHours()
    if (hour >= TIME_BUCKETS.MORNING_START && hour < TIME_BUCKETS.AFTERNOON_START) buckets.morning++
    else if (hour >= TIME_BUCKETS.AFTERNOON_START && hour < TIME_BUCKETS.EVENING_START)
      buckets.afternoon++
    else if (hour >= TIME_BUCKETS.EVENING_START && hour < TIME_BUCKETS.NIGHT_START)
      buckets.evening++
    else buckets.night++
  }

  const total = sessions.length
  const entries = Object.entries(buckets) as [keyof typeof buckets, number][]
  const sorted = entries.sort((a, b) => b[1] - a[1])
  const [topTime, topCount] = sorted[0]
  const percentage = Math.round((topCount / total) * 100)

  // Only show if there's a clear pattern
  if (percentage < PATTERN_THRESHOLDS.TIME_OF_DAY_PATTERN) return null

  const labels: Record<string, string> = {
    morning: 'Morning practitioner',
    afternoon: 'Afternoon practitioner',
    evening: 'Evening practitioner',
    night: 'Night owl practitioner',
  }

  const details: Record<string, string> = {
    morning: 'before noon',
    afternoon: '12pm-5pm',
    evening: '5pm-10pm',
    night: 'after 10pm',
  }

  return {
    label: labels[topTime],
    value: topTime,
    strength: percentageToStrength(percentage),
    percentage,
    detail: `${percentage}% ${details[topTime]}`,
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

  if (withDiscipline < MIN_DATA.SESSIONS_WITH_ATTRIBUTE) return null

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const [topDiscipline, topCount] = entries[0]
  const percentage = Math.round((topCount / withDiscipline) * 100)

  // Only show if there's focus
  if (percentage < PATTERN_THRESHOLDS.DISCIPLINE_FOCUS) return null

  return {
    label: `${topDiscipline}-focused`,
    value: topDiscipline,
    strength: percentageToStrength(percentage),
    percentage,
    detail: `${percentage}% of sessions`,
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

  if (withPose < MIN_DATA.SESSIONS_WITH_ATTRIBUTE) return null

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const [topPose, topCount] = entries[0]
  const percentage = Math.round((topCount / withPose) * 100)

  // Only show if there's a pattern
  if (percentage < PATTERN_THRESHOLDS.POSE_PATTERN) return null

  return {
    label: `${topPose} sitter`,
    value: topPose,
    strength: percentageToStrength(percentage),
    percentage,
    detail: `${percentage}% of sessions`,
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

  if (weekdayPct >= PATTERN_THRESHOLDS.WEEKDAY_PRACTITIONER) {
    return {
      label: 'Weekday practitioner',
      value: 'weekday',
      strength: percentageToStrength(weekdayPct),
      percentage: weekdayPct,
      detail: `${weekdayPct}% Mon-Fri`,
    }
  }

  if (weekendCount / total >= PATTERN_THRESHOLDS.WEEKEND_WARRIOR) {
    return {
      label: 'Weekend warrior',
      value: 'weekend',
      strength: percentageToStrength(Math.round((weekendCount / total) * 100)),
      percentage: Math.round((weekendCount / total) * 100),
      detail: `Strong Sat/Sun practice`,
    }
  }

  // Only show specific day if very dominant
  if (percentage >= PATTERN_THRESHOLDS.SINGLE_DAY_DOMINANT) {
    return {
      label: `${dayNames[maxDay]}s are your day`,
      value: dayNames[maxDay].toLowerCase(),
      strength: percentageToStrength(percentage * 2), // Boost since single day
      percentage,
      detail: `${maxCount} sessions`,
    }
  }

  return null
}

function percentageToStrength(percentage: number): number {
  if (percentage >= STRENGTH_LEVELS.LEVEL_5) return 5
  if (percentage >= STRENGTH_LEVELS.LEVEL_4) return 4
  if (percentage >= STRENGTH_LEVELS.LEVEL_3) return 3
  if (percentage >= STRENGTH_LEVELS.LEVEL_2) return 2
  return 1
}
