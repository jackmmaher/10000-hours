/**
 * NotificationBell - Header icon showing notification count
 *
 * Displays:
 * - Bell icon (subtle, theme-aware)
 * - Red dot badge when unread > 0
 * - Opens NotificationCenter on tap
 */

import { useState, useEffect } from 'react'
import { getUnreadNotificationCount } from '../lib/db'
import { useTapFeedback } from '../hooks/useTapFeedback'

interface NotificationBellProps {
  onPress: () => void
  refreshKey?: number // Increment to trigger refresh
  disabled?: boolean // Disable during settling window
}

export function NotificationBell({ onPress, refreshKey, disabled }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const tapFeedback = useTapFeedback()

  useEffect(() => {
    // Load count on mount and when refreshKey changes
    getUnreadNotificationCount().then(setUnreadCount)

    // Poll every 30s for new notifications
    const interval = setInterval(() => {
      getUnreadNotificationCount().then(setUnreadCount)
    }, 30000)

    return () => clearInterval(interval)
  }, [refreshKey])

  return (
    <button
      onClick={() => {
        if (disabled) return
        tapFeedback.light()
        onPress()
      }}
      disabled={disabled}
      className={`relative p-2 text-ink/40 hover:text-ink/60 transition-colors touch-manipulation ${disabled ? 'cursor-not-allowed' : 'active:scale-[0.95]'}`}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      {/* Bell SVG icon */}
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {/* Unread badge - simple dot, not number (less anxious) */}
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      )}
    </button>
  )
}
