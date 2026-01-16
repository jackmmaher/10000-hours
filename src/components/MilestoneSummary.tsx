/**
 * MilestoneSummary - Modal showing details of an achieved milestone
 *
 * Shows when the milestone was reached, stats for that period,
 * and a scrollable list of sessions that contributed to it.
 */

import { useMemo, useState } from 'react'
import { Achievement } from '../lib/db'
import { Session } from '../lib/db'
import { formatDuration } from '../lib/format'
import { shareMilestone, canShare } from '../lib/share'

interface MilestoneSummaryProps {
  achievement: Achievement
  previousAchievement: Achievement | null
  sessions: Session[]
  onClose: () => void
  isNewlyAchieved?: boolean
}

// Format milestone label (e.g., "2h", "100h", "1,000h")
function formatMilestoneTitle(hours: number): string {
  return `${hours.toLocaleString()}h`
}

// Format date nicely
function formatAchievementDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Format time
function formatAchievementTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Format session time for list
function formatSessionTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Format session date for list
function formatSessionDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function MilestoneSummary({
  achievement,
  previousAchievement,
  sessions,
  onClose,
  isNewlyAchieved = false,
}: MilestoneSummaryProps) {
  const [shareStatus, setShareStatus] = useState<'idle' | 'shared' | 'copied'>('idle')

  // Handle share button click
  const handleShare = async () => {
    const milestoneName = `${achievement.hours.toLocaleString()} hours`
    const success = await shareMilestone(achievement.hours, milestoneName)
    if (success) {
      setShareStatus(canShare() ? 'shared' : 'copied')
      setTimeout(() => setShareStatus('idle'), 2000)
    }
  }

  // Calculate sessions that contributed to this milestone
  const milestoneData = useMemo(() => {
    // Get the starting point (previous milestone's hours, or 0)
    const startHours = previousAchievement?.hours || 0
    const targetHours = achievement.hours

    // Sort sessions by time
    const sortedSessions = [...sessions].sort((a, b) => a.startTime - b.startTime)

    // Find sessions that contributed to this milestone range
    let cumulativeHours = 0
    const contributingSessions: Session[] = []

    for (const session of sortedSessions) {
      const sessionHours = session.durationSeconds / 3600
      const prevCumulative = cumulativeHours
      cumulativeHours += sessionHours

      // Session contributes if it's in the range between previous and current milestone
      if (cumulativeHours > startHours && prevCumulative < targetHours) {
        contributingSessions.push(session)
      }

      // Stop once we've passed the target
      if (cumulativeHours >= targetHours) break
    }

    // Calculate stats
    const totalSeconds = contributingSessions.reduce((sum, s) => sum + s.durationSeconds, 0)
    const avgSessionSeconds =
      contributingSessions.length > 0 ? totalSeconds / contributingSessions.length : 0

    // Days to reach this milestone from previous
    let daysToReach = 0
    if (contributingSessions.length > 0) {
      const firstSession = contributingSessions[0].startTime
      const lastSession = contributingSessions[contributingSessions.length - 1].endTime
      daysToReach = Math.ceil((lastSession - firstSession) / (24 * 60 * 60 * 1000)) + 1
    }

    return {
      sessions: contributingSessions.slice(-20), // Show last 20 for scrolling
      totalSessions: contributingSessions.length,
      totalSeconds,
      avgSessionSeconds,
      daysToReach,
    }
  }, [achievement, previousAchievement, sessions])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm"
      style={{ backgroundColor: 'var(--bg-overlay)' }}
    >
      <div
        className="rounded-t-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-xl animate-slide-up"
        style={{ backgroundColor: 'var(--bg-base)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: 'var(--text-muted)', opacity: 0.3 }}
          />
        </div>

        {/* Header */}
        <div className="px-6 pb-4" style={{ borderBottom: '1px solid var(--divider)' }}>
          {/* Zen message for newly achieved milestones */}
          {isNewlyAchieved && (
            <div
              className="mb-4 py-3 px-4 rounded-xl"
              style={{ backgroundColor: 'var(--accent-muted)' }}
            >
              <p className="text-sm italic text-center" style={{ color: 'var(--accent)' }}>
                The path continues.
              </p>
            </div>
          )}
          <div className="flex items-start justify-between">
            <div>
              <p className="font-serif text-2xl" style={{ color: 'var(--text-primary)' }}>
                {formatMilestoneTitle(achievement.hours)}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {isNewlyAchieved ? 'Just achieved' : formatAchievementDate(achievement.achievedAt)}
              </p>
              {!isNewlyAchieved && (
                <p className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                  at {formatAchievementTime(achievement.achievedAt)}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Close modal"
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

        {/* Stats summary */}
        <div className="px-6 py-4" style={{ backgroundColor: 'var(--bg-deep)' }}>
          <div className="flex justify-between gap-4">
            <div className="text-center flex-1">
              <p
                className="text-lg font-serif tabular-nums"
                style={{ color: 'var(--text-primary)' }}
              >
                {milestoneData.totalSessions}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                sessions
              </p>
            </div>
            <div className="text-center flex-1">
              <p
                className="text-lg font-serif tabular-nums"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatDuration(milestoneData.avgSessionSeconds)}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                avg session
              </p>
            </div>
            <div className="text-center flex-1">
              <p
                className="text-lg font-serif tabular-nums"
                style={{ color: 'var(--text-primary)' }}
              >
                {milestoneData.daysToReach}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                days
              </p>
            </div>
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            Sessions that earned this milestone
          </p>

          {milestoneData.sessions.length === 0 ? (
            <p className="text-sm italic py-4" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
              Session data not available
            </p>
          ) : (
            <div className="space-y-2">
              {milestoneData.sessions.map((session, i) => (
                <div
                  key={session.id || i}
                  className="flex items-center justify-between py-2 last:border-0"
                  style={{ borderBottom: '1px solid var(--divider)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--accent-muted)' }}
                    >
                      <span
                        className="text-[10px] tabular-nums"
                        style={{ color: 'var(--accent)', opacity: 0.7 }}
                      >
                        {i + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {formatSessionDate(session.startTime)}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatSessionTime(session.startTime)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {formatDuration(session.durationSeconds)}
                  </p>
                </div>
              ))}

              {milestoneData.totalSessions > 20 && (
                <p
                  className="text-xs text-center py-2"
                  style={{ color: 'var(--text-muted)', opacity: 0.6 }}
                >
                  Showing last 20 of {milestoneData.totalSessions} sessions
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div
          className="px-6 pb-8 pt-4 flex gap-3"
          style={{ borderTop: '1px solid var(--divider)' }}
        >
          <button
            onClick={handleShare}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}
          >
            {shareStatus === 'shared' ? (
              'Shared!'
            ) : shareStatus === 'copied' ? (
              'Copied!'
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors active:scale-[0.98]"
            style={{ backgroundColor: 'var(--bg-deep)', color: 'var(--text-secondary)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
