/**
 * Planned Session Helpers
 *
 * CRUD operations for planned meditation sessions.
 */

import { db } from './schema'
import type { PlannedSession, Session } from './types'

// Helper to check if two timestamps fall on the same calendar day
function isSameDay(timestamp1: number, timestamp2: number): boolean {
  const d1 = new Date(timestamp1)
  const d2 = new Date(timestamp2)
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export async function addPlannedSession(
  data: Omit<PlannedSession, 'id' | 'createdAt'>
): Promise<PlannedSession> {
  const planned: PlannedSession = {
    ...data,
    createdAt: Date.now(),
  }
  const id = await db.plannedSessions.add(planned)
  return { ...planned, id }
}

export async function getPlannedSession(date: number): Promise<PlannedSession | undefined> {
  // Get planned session for a specific date (start of day)
  return db.plannedSessions.where('date').equals(date).first()
}

export async function getIncompletePlansForDate(date: number): Promise<PlannedSession[]> {
  // Get all incomplete (not yet done) plans for a specific date
  const plans = await db.plannedSessions.where('date').equals(date).toArray()
  return plans.filter((p) => !p.completed && !p.linkedSessionUuid)
}

export async function getAllPlansForDate(date: number): Promise<PlannedSession[]> {
  // Get ALL plans for a specific date (both completed and incomplete)
  return db.plannedSessions.where('date').equals(date).toArray()
}

export async function getPlannedSessionsForWeek(weekStartDate: number): Promise<PlannedSession[]> {
  const weekEndDate = weekStartDate + 7 * 24 * 60 * 60 * 1000
  return db.plannedSessions.where('date').between(weekStartDate, weekEndDate, true, false).toArray()
}

export async function getPlannedSessionsForMonth(
  year: number,
  month: number
): Promise<PlannedSession[]> {
  const monthStart = new Date(year, month, 1)
  monthStart.setHours(0, 0, 0, 0)
  const monthEnd = new Date(year, month + 1, 1)
  monthEnd.setHours(0, 0, 0, 0)
  return db.plannedSessions
    .where('date')
    .between(monthStart.getTime(), monthEnd.getTime(), true, false)
    .toArray()
}

export async function updatePlannedSession(
  id: number,
  updates: Partial<Omit<PlannedSession, 'id' | 'createdAt'>>
): Promise<void> {
  await db.plannedSessions.update(id, updates)
}

export async function deletePlannedSession(id: number): Promise<void> {
  await db.plannedSessions.delete(id)
}

// Helper to convert "HH:MM" time string to minutes from midnight
function timeToMinutes(time: string | undefined): number {
  if (!time) return -1 // No time set = treat as early (show these plans)
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Get the next upcoming planned session (today or future, not completed)
// For today's plans, only include those with plannedTime in the future (or no time set)
export async function getNextPlannedSession(): Promise<PlannedSession | undefined> {
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const todayTime = today.getTime()

  // Current time in minutes from midnight
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  // Get all plans from today onwards
  const plans = await db.plannedSessions.where('date').aboveOrEqual(todayTime).toArray()

  return plans
    .filter((p) => {
      if (p.completed || p.linkedSessionUuid) return false
      // Defensive check: exclude plans from past days (handles edge cases)
      if (p.date < todayTime) return false

      // For today's plans, check if the planned time is still upcoming
      if (isSameDay(p.date, todayTime)) {
        const planMinutes = timeToMinutes(p.plannedTime)
        // Include if: no time set (planMinutes = -1) OR time is in the future
        if (planMinutes !== -1 && planMinutes <= currentMinutes) {
          return false // Plan's time has already passed
        }
      }

      return true
    })
    .sort((a, b) => {
      // Sort by date first
      if (a.date !== b.date) return a.date - b.date
      // Then by planned time (plans without time come last)
      const aMinutes = timeToMinutes(a.plannedTime)
      const bMinutes = timeToMinutes(b.plannedTime)
      if (aMinutes === -1 && bMinutes === -1) return 0
      if (aMinutes === -1) return 1
      if (bMinutes === -1) return -1
      return aMinutes - bMinutes
    })[0]
}

// Session-Plan Linking helpers
export async function linkSessionToPlan(
  sessionUuid: string,
  sessionStartTime: number
): Promise<PlannedSession | null> {
  // Find an unlinked plan for the given date and link it to the session
  // Prefer plans whose plannedTime is closest to the session start time
  const dayStart = new Date(sessionStartTime)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(sessionStartTime)
  dayEnd.setHours(23, 59, 59, 999)

  const plans = await db.plannedSessions
    .where('date')
    .between(dayStart.getTime(), dayEnd.getTime(), true, true)
    .filter((p) => !p.linkedSessionUuid && !p.completed)
    .toArray()

  if (plans.length === 0) return null

  // Session start time in minutes from midnight
  const sessionDate = new Date(sessionStartTime)
  const sessionMinutes = sessionDate.getHours() * 60 + sessionDate.getMinutes()

  // Find the best matching plan:
  // 1. Plans with plannedTime closest to session start time (within 60 min tolerance)
  // 2. Plans without plannedTime as fallback
  let bestPlan: PlannedSession | null = null
  let bestTimeDiff = Infinity

  for (const plan of plans) {
    if (plan.plannedTime) {
      const planMinutes = timeToMinutes(plan.plannedTime)
      const timeDiff = Math.abs(planMinutes - sessionMinutes)

      // Only consider plans within 60 minutes of session start
      if (timeDiff <= 60 && timeDiff < bestTimeDiff) {
        bestTimeDiff = timeDiff
        bestPlan = plan
      }
    } else if (!bestPlan) {
      // Plan without time - use as fallback only if no time-matched plan found
      bestPlan = plan
      bestTimeDiff = Infinity // Keep looking for time-matched plans
    }
  }

  if (bestPlan && bestPlan.id) {
    await db.plannedSessions.update(bestPlan.id, {
      completed: true,
      linkedSessionUuid: sessionUuid,
    })
    // Return the linked plan for caller to handle additional side effects (e.g., template completion tracking)
    return { ...bestPlan, completed: true, linkedSessionUuid: sessionUuid }
  }
  return null
}

export async function getPlannedSessionByLinkedUuid(
  sessionUuid: string
): Promise<PlannedSession | undefined> {
  return db.plannedSessions.where('linkedSessionUuid').equals(sessionUuid).first()
}

export async function getAllPlannedSessions(): Promise<PlannedSession[]> {
  return db.plannedSessions.orderBy('date').reverse().toArray()
}

/**
 * Retroactively link unlinked plans to sessions on the same day
 * Uses time-based matching: prefer sessions closest to the plan's plannedTime
 * Only links if session is within 60 minutes of planned time (or plan has no time set)
 */
export async function relinkOrphanedPlans(sessions: Session[]): Promise<number> {
  const unlinkedPlans = await db.plannedSessions
    .filter((p) => !p.completed && !p.linkedSessionUuid)
    .toArray()

  let linkedCount = 0

  for (const plan of unlinkedPlans) {
    // Find sessions on the same day as this plan
    const sameDaySessions = sessions.filter((session) => isSameDay(session.startTime, plan.date))

    if (sameDaySessions.length === 0) continue

    // Find best matching session using time-based matching
    let bestSession: Session | null = null
    let bestTimeDiff = Infinity

    const planMinutes = timeToMinutes(plan.plannedTime)

    for (const session of sameDaySessions) {
      const sessionDate = new Date(session.startTime)
      const sessionMinutes = sessionDate.getHours() * 60 + sessionDate.getMinutes()

      if (planMinutes !== -1) {
        // Plan has a specific time - find closest session within 60 min tolerance
        const timeDiff = Math.abs(planMinutes - sessionMinutes)
        if (timeDiff <= 60 && timeDiff < bestTimeDiff) {
          bestTimeDiff = timeDiff
          bestSession = session
        }
      } else if (!bestSession) {
        // Plan has no time - use first session on that day as fallback
        bestSession = session
      }
    }

    if (bestSession && plan.id) {
      await db.plannedSessions.update(plan.id, {
        completed: true,
        linkedSessionUuid: bestSession.uuid,
      })
      linkedCount++
    }
  }

  return linkedCount
}

/**
 * Mark a plan as completed without linking to a session
 * Useful for clearing stuck plans
 */
export async function markPlanCompleted(planId: number): Promise<void> {
  await db.plannedSessions.update(planId, {
    completed: true,
  })
}

/**
 * Get upcoming incomplete planned sessions
 */
export async function getUpcomingPlans(daysAhead: number = 14): Promise<PlannedSession[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + daysAhead)

  return db.plannedSessions
    .where('date')
    .between(today.getTime(), endDate.getTime())
    .filter((p) => !p.completed)
    .sortBy('date')
}
