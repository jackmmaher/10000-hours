/**
 * Lock Forgiveness Service
 *
 * Handles the "forgiveness" features of the meditation lock:
 * - Emergency skips (bypass lock without meditation)
 * - Monthly freeze reset (streak freezes refresh each month)
 * - Grace period logic (extra time after anchor)
 * - Safety auto-unlock (prevent indefinite lockout)
 * - Backup anchor notifications (reminder when morning anchor missed)
 * - Reminder notifications with dynamic content
 */

import {
  consumeEmergencySkip as nativeConsumeEmergencySkip,
  getLockState,
  unblockApps,
  EmergencySkipResult,
} from './meditationLock'
import {
  getMeditationLockSettings,
  updateMeditationLockSettings,
} from './db/meditationLockSettings'
import type { MeditationLockSettings } from './db/types'

// Notification stub interface (to be implemented with native support)
interface NotificationPayload {
  id: string
  title: string
  body: string
}

/**
 * Schedule a local notification (stub - to be implemented with native support)
 * @param payload The notification content
 * @param scheduledAt When to fire the notification
 */
async function scheduleLocalNotification(
  payload: NotificationPayload,
  scheduledAt: Date
): Promise<boolean> {
  // TODO: Implement with @capacitor/local-notifications when native support is added
  console.debug('[LockForgiveness] Would schedule notification:', payload, 'at', scheduledAt)
  return true
}

/**
 * Cancel a scheduled notification (stub - to be implemented with native support)
 * @param notificationId The notification ID to cancel
 */
async function cancelNotification(notificationId: string): Promise<boolean> {
  // TODO: Implement with @capacitor/local-notifications when native support is added
  console.debug('[LockForgiveness] Would cancel notification:', notificationId)
  return true
}

// Notification IDs for lock-related notifications
export const NOTIFICATION_IDS = {
  BACKUP_ANCHOR: 'lock-backup-anchor',
  REMINDER: 'lock-reminder',
  SAFETY_UNLOCK: 'lock-safety-unlock',
} as const

export interface ForgivenessStatus {
  skipsRemaining: number
  skipsPerMonth: number
  gracePeriodActive: boolean
  gracePeriodMinutesLeft: number | null
  safetyUnlockPending: boolean
  safetyUnlockMinutesLeft: number | null
  isLockActive: boolean
  streakDays: number
}

export interface EmergencySkipServiceResult extends EmergencySkipResult {
  notificationSent?: boolean
}

export interface MonthlyResetResult {
  wasReset: boolean
  newCount: number
  previousCount: number
}

/**
 * Perform an emergency skip - bypass the lock without meditation
 * Decrements streak freezes and updates analytics
 */
export async function performEmergencySkip(): Promise<EmergencySkipServiceResult> {
  const settings = await getMeditationLockSettings()

  // Check if skips available
  if (settings.streakFreezesRemaining <= 0) {
    return {
      success: false,
      reason: 'No skips remaining this month',
    }
  }

  // Call native layer to actually skip
  const nativeResult = await nativeConsumeEmergencySkip()

  if (!nativeResult.success) {
    return nativeResult
  }

  // Update local DB with new counts
  const newSkipsRemaining = nativeResult.skipsRemaining ?? settings.streakFreezesRemaining - 1
  await updateMeditationLockSettings({
    streakFreezesRemaining: newSkipsRemaining,
    totalSkipsUsed: settings.totalSkipsUsed + 1,
  })

  return {
    success: true,
    skipsRemaining: newSkipsRemaining,
  }
}

/**
 * Check if monthly freeze reset is needed and perform it
 * Resets streakFreezesRemaining to streakFreezesPerMonth on new month
 */
export async function checkAndResetMonthlyFreezes(): Promise<MonthlyResetResult> {
  const settings = await getMeditationLockSettings()
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Get last reset date
  const lastResetAt = settings.lastFreezeResetAt

  if (!lastResetAt) {
    // First time - set initial timestamp without resetting
    await updateMeditationLockSettings({
      lastFreezeResetAt: now.getTime(),
    })
    return {
      wasReset: false,
      newCount: settings.streakFreezesRemaining,
      previousCount: settings.streakFreezesRemaining,
    }
  }

  const lastResetDate = new Date(lastResetAt)
  const lastMonth = lastResetDate.getMonth()
  const lastYear = lastResetDate.getFullYear()

  // Check if we're in a new month
  const isNewMonth = currentMonth !== lastMonth || currentYear !== lastYear

  if (!isNewMonth) {
    return {
      wasReset: false,
      newCount: settings.streakFreezesRemaining,
      previousCount: settings.streakFreezesRemaining,
    }
  }

  // Reset freezes to monthly allocation
  const previousCount = settings.streakFreezesRemaining
  const newCount = settings.streakFreezesPerMonth

  await updateMeditationLockSettings({
    streakFreezesRemaining: newCount,
    lastFreezeResetAt: now.getTime(),
  })

  return {
    wasReset: true,
    newCount,
    previousCount,
  }
}

/**
 * Check if current time is within grace period after anchor time
 *
 * @param anchorTime The anchor time (start of lock window)
 * @param gracePeriodMinutes Grace period in minutes (null = disabled)
 * @returns true if within grace period
 */
export function isWithinGracePeriod(anchorTime: Date, gracePeriodMinutes: number | null): boolean {
  if (gracePeriodMinutes === null || gracePeriodMinutes === 0) {
    return false
  }

  const now = new Date()
  const anchorMs = anchorTime.getTime()
  const nowMs = now.getTime()
  const graceMs = gracePeriodMinutes * 60 * 1000

  // Within grace period if:
  // - Anchor hasn't happened yet (future)
  // - Or time since anchor is less than grace period
  if (nowMs < anchorMs) {
    return true // Anchor is in the future
  }

  const elapsed = nowMs - anchorMs
  return elapsed < graceMs
}

/**
 * Check if safety auto-unlock should trigger
 *
 * @param lockActivatedAt Timestamp when lock was activated
 * @param safetyHours Hours before safety unlock (null = disabled)
 * @returns true if safety unlock should trigger
 */
export function shouldSafetyAutoUnlock(
  lockActivatedAt: number,
  safetyHours: number | null
): boolean {
  if (safetyHours === null) {
    return false
  }

  const now = Date.now()
  const elapsed = now - lockActivatedAt
  const safetyMs = safetyHours * 60 * 60 * 1000

  return elapsed >= safetyMs
}

/**
 * Schedule a backup anchor notification
 * Fires when primary anchor window ends without session completion
 */
export async function scheduleBackupAnchorNotification(
  settings: MeditationLockSettings
): Promise<boolean> {
  if (!settings.backupAnchor || !settings.backupAnchorTimeHour) {
    return false
  }

  // Calculate notification time (backup anchor time)
  const notificationTime = new Date()
  notificationTime.setHours(
    settings.backupAnchorTimeHour,
    settings.backupAnchorTimeMinute || 0,
    0,
    0
  )

  // If notification time has passed today, schedule for tomorrow
  if (notificationTime.getTime() <= Date.now()) {
    notificationTime.setDate(notificationTime.getDate() + 1)
  }

  const body = `Time for your backup: ${settings.backupAnchor}. ${settings.unlockDurationMinutes} minutes to keep your streak.`

  await scheduleLocalNotification(
    {
      id: NOTIFICATION_IDS.BACKUP_ANCHOR,
      title: 'Morning anchor passed',
      body,
    },
    notificationTime
  )

  return true
}

/**
 * Schedule a reminder notification before anchor time
 * Uses dynamic content based on reminder style
 */
export async function scheduleReminderNotification(
  settings: MeditationLockSettings
): Promise<boolean> {
  if (!settings.reminderEnabled) {
    return false
  }

  // Calculate notification time (anchor time - reminder minutes)
  const notificationTime = new Date()
  notificationTime.setHours(settings.anchorTimeHour, settings.anchorTimeMinute, 0, 0)
  notificationTime.setMinutes(notificationTime.getMinutes() - settings.reminderMinutesBefore)

  // If notification time has passed today, schedule for tomorrow
  if (notificationTime.getTime() <= Date.now()) {
    notificationTime.setDate(notificationTime.getDate() + 1)
  }

  // Build message based on style
  let body: string
  switch (settings.reminderStyle) {
    case 'simple':
      body = 'Time to meditate'
      break
    case 'custom':
      body = settings.customReminderMessage || 'Time to meditate'
      break
    case 'motivational':
    default:
      body = `Your ${settings.unlockDurationMinutes} minutes await`
      break
  }

  await scheduleLocalNotification(
    {
      id: NOTIFICATION_IDS.REMINDER,
      title: 'Still Hours',
      body,
    },
    notificationTime
  )

  return true
}

/**
 * Cancel all lock-related notifications
 */
export async function cancelLockNotifications(): Promise<void> {
  await cancelNotification(NOTIFICATION_IDS.BACKUP_ANCHOR)
  await cancelNotification(NOTIFICATION_IDS.REMINDER)
  await cancelNotification(NOTIFICATION_IDS.SAFETY_UNLOCK)
}

/**
 * Get current forgiveness status
 * Combines native lock state with settings
 */
export async function getForgivenessStatus(): Promise<ForgivenessStatus> {
  const [settings, lockState] = await Promise.all([getMeditationLockSettings(), getLockState()])

  // Calculate grace period status
  let gracePeriodActive = false
  let gracePeriodMinutesLeft: number | null = null

  if (lockState.isLockActive && settings.gracePeriodMinutes) {
    const anchorTime = new Date()
    anchorTime.setHours(settings.anchorTimeHour, settings.anchorTimeMinute, 0, 0)

    if (isWithinGracePeriod(anchorTime, settings.gracePeriodMinutes)) {
      gracePeriodActive = true
      const elapsed = Date.now() - anchorTime.getTime()
      const remaining = settings.gracePeriodMinutes * 60 * 1000 - elapsed
      gracePeriodMinutesLeft = Math.max(0, Math.ceil(remaining / 60000))
    }
  }

  // Calculate safety unlock status
  let safetyUnlockPending = false
  let safetyUnlockMinutesLeft: number | null = null

  if (lockState.isLockActive && settings.safetyAutoUnlockHours) {
    const elapsed = Date.now() - lockState.lockActivatedAt
    const safetyMs = settings.safetyAutoUnlockHours * 60 * 60 * 1000
    const remaining = safetyMs - elapsed

    if (remaining <= 15 * 60 * 1000) {
      // Within 15 minutes
      safetyUnlockPending = true
      safetyUnlockMinutesLeft = Math.max(0, Math.ceil(remaining / 60000))
    }
  }

  return {
    skipsRemaining: settings.streakFreezesRemaining,
    skipsPerMonth: settings.streakFreezesPerMonth,
    gracePeriodActive,
    gracePeriodMinutesLeft,
    safetyUnlockPending,
    safetyUnlockMinutesLeft,
    isLockActive: lockState.isLockActive,
    streakDays: lockState.streakDays,
  }
}

/**
 * Perform safety auto-unlock if conditions are met
 * Called periodically to check if lock should be released
 */
export async function checkAndPerformSafetyUnlock(): Promise<boolean> {
  const [settings, lockState] = await Promise.all([getMeditationLockSettings(), getLockState()])

  if (!lockState.isLockActive) {
    return false
  }

  if (!shouldSafetyAutoUnlock(lockState.lockActivatedAt, settings.safetyAutoUnlockHours)) {
    return false
  }

  // Perform the unlock
  const unlocked = await unblockApps()

  if (unlocked) {
    console.debug('[LockForgiveness] Safety auto-unlock triggered')
  }

  return unlocked
}
