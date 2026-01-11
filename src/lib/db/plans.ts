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

// Get the next upcoming planned session (today or future, not completed)
// Pass afterDate to skip plans on that date (useful when today already has a session)
export async function getNextPlannedSession(
  afterDate?: number
): Promise<PlannedSession | undefined> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTime = today.getTime()

  // Get all plans from today onwards
  const plans = await db.plannedSessions.where('date').aboveOrEqual(todayTime).toArray()

  return plans
    .filter((p) => {
      if (p.completed || p.linkedSessionUuid) return false
      // Defensive check: exclude plans from past days (handles edge cases)
      if (p.date < todayTime) return false
      // If afterDate provided, skip plans on that same calendar day
      if (afterDate !== undefined && isSameDay(p.date, afterDate)) return false
      return true
    })
    .sort((a, b) => a.date - b.date)[0]
}

// Session-Plan Linking helpers
export async function linkSessionToPlan(
  sessionUuid: string,
  date: number
): Promise<PlannedSession | null> {
  // Find an unlinked plan for the given date and link it to the session
  // Use date range (same calendar day) to handle any timestamp discrepancies
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  const plan = await db.plannedSessions
    .where('date')
    .between(dayStart.getTime(), dayEnd.getTime(), true, true)
    .filter((p) => !p.linkedSessionUuid)
    .first()

  if (plan && plan.id) {
    await db.plannedSessions.update(plan.id, {
      completed: true,
      linkedSessionUuid: sessionUuid,
    })
    // Return the linked plan for caller to handle additional side effects (e.g., template completion tracking)
    return { ...plan, completed: true, linkedSessionUuid: sessionUuid }
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
 * Useful for fixing plans that weren't auto-linked due to timestamp mismatches
 */
export async function relinkOrphanedPlans(sessions: Session[]): Promise<number> {
  const unlinkedPlans = await db.plannedSessions
    .filter((p) => !p.completed && !p.linkedSessionUuid)
    .toArray()

  let linkedCount = 0

  for (const plan of unlinkedPlans) {
    // Find a session on the same day as this plan
    const matchingSession = sessions.find((session) => isSameDay(session.startTime, plan.date))

    if (matchingSession && plan.id) {
      await db.plannedSessions.update(plan.id, {
        completed: true,
        linkedSessionUuid: matchingSession.uuid,
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
