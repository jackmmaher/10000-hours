/**
 * NotificationCenter - Modal showing all notifications
 *
 * Features:
 * - List of notifications (newest first)
 * - Dismiss individual notifications
 * - Mark all as read
 * - Empty state when no notifications
 *
 * Design: Bottom sheet modal with glassmorphic styling
 */

import { useState, useEffect, useCallback } from 'react'
import { getUnreadNotifications, markNotificationAsRead, dismissNotification } from '../lib/db'
import { InAppNotification, NotificationType } from '../lib/notifications'
import { useTapFeedback } from '../hooks/useTapFeedback'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  onInsightReminderClick?: (sessionId: string) => void
}

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  attribution: '\u{1F49D}', // Heart with ribbon for "your content helped"
  milestone: '\u{2728}', // Sparkles for achievement
  voice_growth: '\u{1F331}', // Seedling for voice growth - organic, growing
  gentle_reminder: '\u{1F9D8}', // Person meditating for reminder
  content_reported: '\u{1F4CB}', // Clipboard for content review
  insight_reminder: '\u{1F4AD}', // Thought balloon for insight
}

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  attribution: 'bg-pink-500/10',
  milestone: 'bg-amber-500/10',
  voice_growth: 'bg-emerald-500/10', // Green for growth
  gentle_reminder: 'bg-blue-500/10',
  content_reported: 'bg-orange-500/10',
  insight_reminder: 'bg-indigo-500/10',
}

export function NotificationCenter({
  isOpen,
  onClose,
  onInsightReminderClick,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const haptic = useTapFeedback()

  // Load notifications when opened
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      getUnreadNotifications()
        .then(setNotifications)
        .finally(() => setIsLoading(false))
    }
  }, [isOpen])

  const handleDismiss = useCallback(
    async (id: string) => {
      haptic.light()
      await dismissNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    },
    [haptic]
  )

  const handleMarkAllRead = useCallback(async () => {
    haptic.light()
    await Promise.all(notifications.map((n) => markNotificationAsRead(n.id)))
    setNotifications([])
  }, [notifications, haptic])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />

      {/* Bottom sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 max-h-[70vh] bg-card/95 backdrop-blur-md rounded-t-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10">
          <h2 className="font-serif text-lg text-ink">Notifications</h2>
          <div className="flex items-center gap-3">
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-ink/50 hover:text-ink/70 transition-colors touch-manipulation"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-ink/50 hover:text-ink/70 transition-colors touch-manipulation"
              aria-label="Close notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(70vh-60px)] px-4 py-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-ink/10 border-t-ink/40 rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-ink/40 text-sm mb-2">No new notifications</p>
              <p className="text-ink/30 text-xs italic">
                When you have updates, they'll appear here
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onDismiss={() => handleDismiss(notification.id)}
                onClick={
                  notification.type === 'insight_reminder' && notification.metadata?.sessionId
                    ? () => {
                        onInsightReminderClick?.(notification.metadata!.sessionId!)
                        handleDismiss(notification.id)
                        onClose()
                      }
                    : undefined
                }
              />
            ))
          )}
        </div>

        {/* Safe area padding for mobile */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </div>
  )
}

interface NotificationItemProps {
  notification: InAppNotification
  onDismiss: () => void
  onClick?: () => void
}

function NotificationItem({ notification, onDismiss, onClick }: NotificationItemProps) {
  const icon = NOTIFICATION_ICONS[notification.type]
  const bgColor = NOTIFICATION_COLORS[notification.type]

  // Format relative time
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      className={`flex items-start gap-3 p-4 rounded-xl ${bgColor} ${onClick ? 'w-full text-left cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      {/* Icon */}
      <span className="text-xl flex-shrink-0">{icon}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink">{notification.title}</p>
        <p className="text-xs text-ink/60 mt-0.5">{notification.body}</p>
        <p className="text-xs text-ink/40 mt-2">{formatRelativeTime(notification.createdAt)}</p>
      </div>

      {/* Dismiss button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDismiss()
        }}
        className="flex-shrink-0 p-1 text-ink/30 hover:text-ink/50 transition-colors touch-manipulation"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </Wrapper>
  )
}
