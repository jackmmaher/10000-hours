/**
 * Commitment Reminder Service
 *
 * Handles scheduling reminders for commitment mode practice windows:
 * - Pre-window reminders (e.g., 10 min before window starts)
 * - Window closing reminders (e.g., 1 hour before window ends)
 * - Dynamic content based on reminder style
 */

import { getCommitmentSettings, updateCommitmentSettings } from '../db/commitmentSettings'
import { isDayRequired, isWithinWindow } from './schedule'

// Notification stub interface (to be implemented with native support)
interface NotificationPayload {
  id: string
  title: string
  body: string
}

/**
 * Schedule a local notification (stub - to be implemented with native support)
 */
async function scheduleLocalNotification(
  payload: NotificationPayload,
  scheduledAt: Date
): Promise<boolean> {
  // TODO: Implement with @capacitor/local-notifications when native support is added
  console.debug('[CommitmentReminders] Would schedule notification:', payload, 'at', scheduledAt)
  return true
}

/**
 * Cancel a scheduled notification (stub - to be implemented with native support)
 */
async function cancelNotification(notificationId: string): Promise<boolean> {
  // TODO: Implement with @capacitor/local-notifications when native support is added
  console.debug('[CommitmentReminders] Would cancel notification:', notificationId)
  return true
}

// Notification IDs for commitment-related notifications
export const COMMITMENT_NOTIFICATION_IDS = {
  WINDOW_START: 'commitment-window-start',
  WINDOW_CLOSING: 'commitment-window-closing',
  DAILY_REMINDER: 'commitment-daily-reminder',
} as const

/**
 * Get reminder message based on style
 */
function getReminderMessage(
  style: 'simple' | 'motivational' | 'custom',
  customMessage: string | null,
  minimumMinutes: number,
  identityStatement: string | null
): { title: string; body: string } {
  switch (style) {
    case 'motivational':
      if (identityStatement) {
        return {
          title: 'Time to practice',
          body: `Remember: You're becoming someone who ${identityStatement}. ${minimumMinutes} minutes today.`,
        }
      }
      return {
        title: 'Your practice awaits',
        body: `${minimumMinutes} minutes of meditation. You've got this.`,
      }

    case 'custom':
      if (customMessage) {
        return {
          title: 'Time to meditate',
          body: customMessage,
        }
      }
      // Fall through to simple if no custom message
      return {
        title: 'Time to meditate',
        body: `Your ${minimumMinutes} minute session is waiting.`,
      }

    case 'simple':
    default:
      return {
        title: 'Time to meditate',
        body: `Your ${minimumMinutes} minute session is waiting.`,
      }
  }
}

/**
 * Schedule the daily commitment reminder
 *
 * Called on app launch and after settings changes to ensure
 * reminders are properly scheduled.
 */
export async function scheduleCommitmentReminder(): Promise<boolean> {
  const settings = await getCommitmentSettings()

  // Don't schedule if commitment not active or reminders disabled
  if (!settings.isActive || !settings.reminderEnabled) {
    await cancelCommitmentReminders()
    return false
  }

  // Don't schedule if window type is 'anytime' (no specific time)
  if (settings.windowType === 'anytime') {
    return false
  }

  // Check if today is a required day
  const now = new Date()
  if (!isDayRequired(now.getTime(), settings)) {
    return false
  }

  // Calculate reminder time based on window start
  let reminderDate: Date

  if (settings.windowType === 'morning') {
    // Morning window: 5am - 12pm, remind at 5am - reminderMinutesBefore
    reminderDate = new Date(now)
    reminderDate.setHours(5, 0, 0, 0)
    reminderDate.setMinutes(reminderDate.getMinutes() - (settings.reminderMinutesBefore || 10))
  } else if (
    settings.windowType === 'specific' &&
    settings.windowStartHour !== undefined &&
    settings.windowStartMinute !== undefined
  ) {
    // Specific window: remind before window start
    reminderDate = new Date(now)
    reminderDate.setHours(settings.windowStartHour, settings.windowStartMinute, 0, 0)
    reminderDate.setMinutes(reminderDate.getMinutes() - (settings.reminderMinutesBefore || 10))
  } else {
    return false
  }

  // If reminder time has already passed today, don't schedule
  if (reminderDate.getTime() <= now.getTime()) {
    return false
  }

  // Get reminder content
  const { title, body } = getReminderMessage(
    settings.reminderStyle || 'simple',
    settings.customReminderMessage,
    settings.minimumSessionMinutes,
    settings.identityStatement
  )

  // Schedule the notification
  await scheduleLocalNotification(
    {
      id: COMMITMENT_NOTIFICATION_IDS.DAILY_REMINDER,
      title,
      body,
    },
    reminderDate
  )

  return true
}

/**
 * Schedule a "window closing soon" reminder
 *
 * Called during the practice window to remind user
 * if they haven't completed their session yet.
 */
export async function scheduleWindowClosingReminder(): Promise<boolean> {
  const settings = await getCommitmentSettings()

  // Don't schedule if commitment not active
  if (!settings.isActive) {
    return false
  }

  // Don't schedule if already completed today
  // This check would need to query the day log - simplified for now

  // Calculate 1 hour before window end
  const now = new Date()
  let closingReminderDate: Date | null = null

  if (settings.windowType === 'morning') {
    // Morning window ends at 12pm
    closingReminderDate = new Date(now)
    closingReminderDate.setHours(11, 0, 0, 0) // 1 hour before noon
  } else if (
    settings.windowType === 'specific' &&
    settings.windowEndHour !== undefined &&
    settings.windowEndMinute !== undefined
  ) {
    closingReminderDate = new Date(now)
    closingReminderDate.setHours(settings.windowEndHour, settings.windowEndMinute, 0, 0)
    closingReminderDate.setHours(closingReminderDate.getHours() - 1) // 1 hour before end
  }

  if (!closingReminderDate || closingReminderDate.getTime() <= now.getTime()) {
    return false
  }

  await scheduleLocalNotification(
    {
      id: COMMITMENT_NOTIFICATION_IDS.WINDOW_CLOSING,
      title: 'Window closing soon',
      body: `Your practice window ends in 1 hour. ${settings.minimumSessionMinutes} minutes to keep your streak.`,
    },
    closingReminderDate
  )

  return true
}

/**
 * Cancel all commitment reminders
 */
export async function cancelCommitmentReminders(): Promise<void> {
  await Promise.all([
    cancelNotification(COMMITMENT_NOTIFICATION_IDS.DAILY_REMINDER),
    cancelNotification(COMMITMENT_NOTIFICATION_IDS.WINDOW_CLOSING),
    cancelNotification(COMMITMENT_NOTIFICATION_IDS.WINDOW_START),
  ])
}

/**
 * Check and reschedule reminders
 *
 * Called on app launch and when commitment settings change.
 * Ensures reminders are always properly scheduled.
 */
export async function refreshCommitmentReminders(): Promise<void> {
  const settings = await getCommitmentSettings()

  if (!settings.isActive) {
    await cancelCommitmentReminders()
    return
  }

  // Schedule daily reminder
  await scheduleCommitmentReminder()

  // If currently in window and not completed, schedule closing reminder
  const now = Date.now()
  if (isWithinWindow(now, settings)) {
    await scheduleWindowClosingReminder()
  }
}

/**
 * Toggle reminders on/off
 */
export async function setRemindersEnabled(enabled: boolean): Promise<void> {
  await updateCommitmentSettings({ reminderEnabled: enabled })

  if (enabled) {
    await refreshCommitmentReminders()
  } else {
    await cancelCommitmentReminders()
  }
}

/**
 * Update reminder settings
 */
export async function updateReminderSettings(updates: {
  reminderMinutesBefore?: number
  reminderStyle?: 'simple' | 'motivational' | 'custom'
  customReminderMessage?: string | null
}): Promise<void> {
  await updateCommitmentSettings(updates)
  await refreshCommitmentReminders()
}
