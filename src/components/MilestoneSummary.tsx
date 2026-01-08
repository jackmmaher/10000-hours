/**
 * MilestoneSummary - Modal showing details of an achieved milestone
 *
 * Shows when the milestone was reached, stats for that period,
 * and a scrollable list of sessions that contributed to it.
 */

import { useMemo } from 'react'
import { Achievement } from '../lib/db'
import { Session } from '../lib/db'
import { formatDuration } from '../lib/format'

interface MilestoneSummaryProps {
  achievement: Achievement
  previousAchievement: Achievement | null
  sessions: Session[]
  onClose: () => void
}

// Format milestone label (e.g., "2 Hours", "10 Hours", "1,000 Hours")
function formatMilestoneTitle(hours: number): string {
  if (hours >= 1000) {
    return `${hours.toLocaleString()} Hours`
  }
  return `${hours} Hours`
}

// Format date nicely
function formatAchievementDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Format time
function formatAchievementTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
}

// Format session time for list
function formatSessionTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
}

// Format session date for list
function formatSessionDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

export function MilestoneSummary({
  achievement,
  previousAchievement,
  sessions,
  onClose
}: MilestoneSummaryProps) {
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
    const avgSessionSeconds = contributingSessions.length > 0
      ? totalSeconds / contributingSessions.length
      : 0

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
      daysToReach
    }
  }, [achievement, previousAchievement, sessions])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm">
      <div
        className="bg-cream rounded-t-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-ink/20" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b border-ink/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-serif text-2xl text-indigo-deep">
                {formatMilestoneTitle(achievement.hours)}
              </p>
              <p className="text-sm text-ink/50 mt-1">
                {formatAchievementDate(achievement.achievedAt)}
              </p>
              <p className="text-xs text-ink/30">
                at {formatAchievementTime(achievement.achievedAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-ink/40 hover:text-ink/60 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats summary */}
        <div className="px-6 py-4 bg-cream-dark/30">
          <div className="flex justify-between gap-4">
            <div className="text-center flex-1">
              <p className="text-lg font-serif text-ink tabular-nums">
                {milestoneData.totalSessions}
              </p>
              <p className="text-xs text-ink/40">sessions</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-lg font-serif text-ink tabular-nums">
                {formatDuration(milestoneData.avgSessionSeconds)}
              </p>
              <p className="text-xs text-ink/40">avg session</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-lg font-serif text-ink tabular-nums">
                {milestoneData.daysToReach}
              </p>
              <p className="text-xs text-ink/40">days</p>
            </div>
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          <p className="text-xs text-ink/40 mb-3">
            Sessions that earned this milestone
          </p>

          {milestoneData.sessions.length === 0 ? (
            <p className="text-sm text-ink/30 italic py-4">
              Session data not available
            </p>
          ) : (
            <div className="space-y-2">
              {milestoneData.sessions.map((session, i) => (
                <div
                  key={session.id || i}
                  className="flex items-center justify-between py-2 border-b border-ink/5 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-deep/10 flex items-center justify-center">
                      <span className="text-[10px] text-indigo-deep/60 tabular-nums">
                        {i + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-ink">
                        {formatSessionDate(session.startTime)}
                      </p>
                      <p className="text-xs text-ink/40">
                        {formatSessionTime(session.startTime)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-ink/70 tabular-nums">
                    {formatDuration(session.durationSeconds)}
                  </p>
                </div>
              ))}

              {milestoneData.totalSessions > 20 && (
                <p className="text-xs text-ink/30 text-center py-2">
                  Showing last 20 of {milestoneData.totalSessions} sessions
                </p>
              )}
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="px-6 pb-8 pt-4 border-t border-ink/5">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-medium bg-ink/5 text-ink/70 hover:bg-ink/10 transition-colors active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
