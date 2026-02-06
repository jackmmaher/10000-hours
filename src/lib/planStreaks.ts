/**
 * Plan Adherence Streak Calculator
 *
 * Calculates streak and compliance statistics for planned meditation sessions.
 * A streak day is a day where ALL planned sessions were completed.
 * Days with no plans are skipped (not streak-breakers).
 * Today is excluded (the day is not over yet).
 */

import { db } from './db/schema'
import type { PlannedSession } from './db/types'

export interface PlanStreakStats {
  currentStreak: number
  longestStreak: number
  thisWeekCompleted: number
  thisWeekTotal: number
  thisMonthRate: number
}

function startOfDay(timestamp: number): number {
  const d = new Date(timestamp)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function getWeekStart(): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const day = now.getDay()
  const diff = day === 0 ? 6 : day - 1
  now.setDate(now.getDate() - diff)
  return now.getTime()
}

function getMonthStart(): number {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime()
}

function getMonthEnd(): number {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime()
}

function groupByDay(plans: PlannedSession[]): Map<number, PlannedSession[]> {
  const map = new Map<number, PlannedSession[]>()
  for (const plan of plans) {
    const dayKey = startOfDay(plan.date)
    const existing = map.get(dayKey)
    if (existing) {
      existing.push(plan)
    } else {
      map.set(dayKey, [plan])
    }
  }
  return map
}

function calculateStreaks(byDay: Map<number, PlannedSession[]>): {
  currentStreak: number
  longestStreak: number
} {
  if (byDay.size === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  const daysAsc = Array.from(byDay.keys()).sort((a, b) => a - b)

  let longestStreak = 0
  let runningStreak = 0

  for (const day of daysAsc) {
    const plans = byDay.get(day)!
    const allCompleted = plans.every((p) => p.completed === true)
    if (allCompleted) {
      runningStreak++
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak
      }
    } else {
      runningStreak = 0
    }
  }

  const yesterday = startOfDay(Date.now()) - 24 * 60 * 60 * 1000
  let currentStreak = 0
  let checkDate = yesterday
  const oneYearAgo = checkDate - 365 * 24 * 60 * 60 * 1000

  while (checkDate >= oneYearAgo) {
    const plans = byDay.get(checkDate)
    if (plans) {
      const allCompleted = plans.every((p) => p.completed === true)
      if (allCompleted) {
        currentStreak++
      } else {
        break
      }
    }
    checkDate -= 24 * 60 * 60 * 1000
  }

  return { currentStreak, longestStreak }
}

export async function getPlanStreakStats(): Promise<PlanStreakStats> {
  const allPlans = await db.plannedSessions.orderBy('date').toArray()

  if (allPlans.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      thisWeekCompleted: 0,
      thisWeekTotal: 0,
      thisMonthRate: 0,
    }
  }

  const byDay = groupByDay(allPlans)
  const { currentStreak, longestStreak } = calculateStreaks(byDay)

  const weekStart = getWeekStart()
  const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000
  const weekPlans = allPlans.filter((p) => p.date >= weekStart && p.date < weekEnd)
  const thisWeekTotal = weekPlans.length
  const thisWeekCompleted = weekPlans.filter((p) => p.completed === true).length

  const monthStart = getMonthStart()
  const monthEnd = getMonthEnd()
  const monthPlans = allPlans.filter((p) => p.date >= monthStart && p.date < monthEnd)
  const monthTotal = monthPlans.length
  const monthCompleted = monthPlans.filter((p) => p.completed === true).length
  const thisMonthRate = monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0

  return {
    currentStreak,
    longestStreak,
    thisWeekCompleted,
    thisWeekTotal,
    thisMonthRate,
  }
}
