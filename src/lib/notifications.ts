/**
 * In-App Notification System
 *
 * Notification types:
 * - attribution: "Your meditation helped 3 people this week"
 * - milestone: "You reached 100 hours!"
 * - gentle_reminder: "Your planned session is in 30 minutes"
 * - content_reported: "Your meditation is under review"
 *
 * Design principles (Zen philosophy):
 * - NO urgency language ("Don't miss!" forbidden)
 * - NO guilt ("You haven't meditated in X days" forbidden)
 * - Gentle, encouraging tone only
 * - Notifications are helpers, not nags
 */

export type NotificationType = 'attribution' | 'milestone' | 'gentle_reminder' | 'content_reported' | 'insight_reminder'

export interface InAppNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  createdAt: number  // Unix timestamp
  readAt?: number
  dismissedAt?: number
  snoozedUntil?: number
  // For attribution notifications
  metadata?: {
    contentId?: string      // Pearl or template ID
    helpedCount?: number    // How many people it helped
    timeframe?: string      // "this week", "today"
    sessionId?: string      // For insight_reminder - links to session
  }
}

export interface NotificationPreferences {
  attributionEnabled: boolean      // "Your content helped X people"
  milestoneEnabled: boolean        // Milestone announcements
  gentleRemindersEnabled: boolean  // Planned session reminders
  reminderMinutesBefore: number    // 15, 30, 60 minutes before planned session
}

// Default preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  attributionEnabled: true,       // Oxytocin trigger - default ON
  milestoneEnabled: true,         // Dopamine trigger - default ON
  gentleRemindersEnabled: false,  // Opt-in for reminders
  reminderMinutesBefore: 30
}
