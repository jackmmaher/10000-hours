/**
 * Shared formatting utilities
 *
 * Extracted from components to eliminate duplication and ensure
 * consistent time/date formatting across the app.
 */

/**
 * Format a date string into a human-readable relative time label.
 *
 * Returns compact labels for recent times:
 * - Under 1 minute: "just now"
 * - Under 1 hour: "{N}m"
 * - Under 1 day: "{N}h"
 * - Under 1 week: "{N}d"
 * - Older: abbreviated date (e.g. "Jan 15")
 *
 * @param dateStr - An ISO 8601 date string (e.g. from Supabase timestamps)
 * @returns A compact relative-time label
 */
export function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
