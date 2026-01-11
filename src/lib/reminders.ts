/**
 * Gentle Reminders System
 *
 * Creates in-app notifications before planned meditation sessions.
 * Respects user's reminderMinutesBefore setting (15, 30, or 60 min).
 *
 * Design principles (Zen philosophy):
 * - Gentle, not nagging
 * - Only reminds once per session
 * - Respects user's preferences
 */

import { getSettings, addNotification, getUnreadNotifications } from './db'
import { InAppNotification } from './notifications'

// Check key for localStorage to track last reminder check
const LAST_REMINDER_CHECK_KEY = 'lastReminderCheck'
const REMINDER_COOLDOWN_MS = 60000 // Check at most once per minute

/**
 * Get today's planned sessions that have a scheduled time
 */
async function getTodaysPlannedSessionsWithTime() {
  // Import dynamically to avoid circular dependency
  const { db } = await import('./db')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTimestamp = today.getTime()

  const plans = await db.plannedSessions
    .where('date')
    .equals(todayTimestamp)
    .toArray()

  // Only return sessions that have a plannedTime and aren't completed
  return plans.filter(p => p.plannedTime && !p.completed)
}

/**
 * Parse plannedTime ("07:30") to today's Date object
 */
function parseTimeToToday(plannedTime: string): Date | null {
  const match = plannedTime.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null

  const [, hours, minutes] = match
  const date = new Date()
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
  return date
}

/**
 * Check if a reminder already exists for this planned session
 * Uses the session ID in notification metadata
 */
async function hasReminderForSession(sessionId: number): Promise<boolean> {
  const notifications = await getUnreadNotifications()
  return notifications.some(n =>
    n.type === 'gentle_reminder' &&
    n.metadata?.contentId === String(sessionId)
  )
}

/**
 * Check and create reminders for upcoming planned sessions
 */
export async function checkAndCreateReminders(): Promise<void> {
  try {
    // Cooldown check - don't run too frequently
    const lastCheck = localStorage.getItem(LAST_REMINDER_CHECK_KEY)
    if (lastCheck && Date.now() - parseInt(lastCheck, 10) < REMINDER_COOLDOWN_MS) {
      return
    }
    localStorage.setItem(LAST_REMINDER_CHECK_KEY, String(Date.now()))

    // Get settings
    const settings = await getSettings()
    if (!settings.notificationPreferences?.gentleRemindersEnabled) {
      return
    }

    const reminderMinutes = settings.notificationPreferences.reminderMinutesBefore || 30
    const now = new Date()

    // Get today's planned sessions with times
    const sessions = await getTodaysPlannedSessionsWithTime()

    for (const session of sessions) {
      if (!session.plannedTime || !session.id) continue

      const sessionTime = parseTimeToToday(session.plannedTime)
      if (!sessionTime) continue

      // Calculate time until session
      const minutesUntil = (sessionTime.getTime() - now.getTime()) / (1000 * 60)

      // Check if we should create a reminder
      // Create reminder when we're within the reminder window but session hasn't started
      if (minutesUntil > 0 && minutesUntil <= reminderMinutes) {
        // Check if reminder already exists for this session
        const hasReminder = await hasReminderForSession(session.id)
        if (hasReminder) continue

        // Create reminder notification
        const notification: InAppNotification = {
          id: crypto.randomUUID(),
          type: 'gentle_reminder',
          title: session.title || 'Meditation',
          body: minutesUntil <= 5
            ? 'Your session begins soon'
            : `Your session is in ${Math.round(minutesUntil)} minutes`,
          createdAt: Date.now(),
          metadata: {
            contentId: String(session.id)
          }
        }

        await addNotification(notification)
      }
    }
  } catch (err) {
    console.warn('Failed to check reminders:', err)
  }
}
