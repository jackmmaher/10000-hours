/**
 * Notification Helpers
 *
 * CRUD operations for in-app notifications.
 */

import { db } from './schema'
import type { InAppNotification } from '../notifications'

export async function addNotification(notification: InAppNotification): Promise<void> {
  await db.notifications.add(notification)
}

export async function getUnreadNotifications(): Promise<InAppNotification[]> {
  return db.notifications
    .filter((n) => !n.readAt && !n.dismissedAt && (!n.snoozedUntil || n.snoozedUntil < Date.now()))
    .sortBy('createdAt')
    .then((notifications) => notifications.reverse()) // Newest first
}

export async function getAllNotifications(): Promise<InAppNotification[]> {
  return db.notifications.orderBy('createdAt').reverse().toArray()
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await db.notifications.update(id, { readAt: Date.now() })
}

export async function dismissNotification(id: string): Promise<void> {
  await db.notifications.update(id, { dismissedAt: Date.now() })
}

export async function snoozeNotification(id: string, until: number): Promise<void> {
  await db.notifications.update(id, { snoozedUntil: until })
}

export async function getUnreadNotificationCount(): Promise<number> {
  return db.notifications
    .filter((n) => !n.readAt && !n.dismissedAt && (!n.snoozedUntil || n.snoozedUntil < Date.now()))
    .count()
}

export async function deleteNotification(id: string): Promise<void> {
  await db.notifications.delete(id)
}
