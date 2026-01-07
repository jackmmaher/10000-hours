/**
 * SessionStream - Infinite scroll list of past sessions
 *
 * Shows sessions with linked insights. Grouped by date.
 * If a session has no insight, shows "Add insight" option.
 */

import { useMemo, useState, useEffect } from 'react'
import { Session, getInsightsBySessionId, Insight, getPlannedSessionByLinkedUuid, PlannedSession } from '../lib/db'
import { formatDuration } from '../lib/format'
import { ORB_COLORS } from '../lib/animations'

interface SessionStreamProps {
  sessions: Session[]
}

interface SessionWithDetails extends Session {
  insight?: Insight | null
  plan?: PlannedSession | null
}

interface GroupedSessions {
  date: string
  displayDate: string
  sessions: SessionWithDetails[]
}

function formatSessionDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))

  if (days === 0) {
    return 'Today'
  } else if (days === 1) {
    return 'Yesterday'
  } else if (days < 7) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return dayNames[date.getDay()]
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
    })
  }
}

function formatSessionTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export function SessionStream({ sessions }: SessionStreamProps) {
  const [sessionsWithDetails, setSessionsWithDetails] = useState<SessionWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load insights and plans for sessions
  useEffect(() => {
    const loadDetails = async () => {
      setIsLoading(true)
      try {
        // Sort sessions by start time (most recent first)
        const sortedSessions = [...sessions].sort((a, b) => b.startTime - a.startTime)

        // Load insights and plans for each session
        const detailed = await Promise.all(
          sortedSessions.map(async (session) => {
            const [insights, plan] = await Promise.all([
              getInsightsBySessionId(session.uuid),
              getPlannedSessionByLinkedUuid(session.uuid)
            ])
            return {
              ...session,
              insight: insights[0] || null,
              plan: plan || null
            }
          })
        )

        setSessionsWithDetails(detailed)
      } catch (err) {
        console.error('Failed to load session details:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDetails()
  }, [sessions])

  // Group sessions by date
  const groupedSessions = useMemo((): GroupedSessions[] => {
    const groups = new Map<string, SessionWithDetails[]>()

    for (const session of sessionsWithDetails) {
      const date = new Date(session.startTime)
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

      if (!groups.has(dateKey)) {
        groups.set(dateKey, [])
      }
      groups.get(dateKey)!.push(session)
    }

    return Array.from(groups.entries()).map(([dateKey, sessions]) => ({
      date: dateKey,
      displayDate: formatSessionDate(sessions[0].startTime),
      sessions
    }))
  }, [sessionsWithDetails])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-ink/10 border-t-ink/40 rounded-full animate-spin" />
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cream-deep flex items-center justify-center">
          <div
            className="w-6 h-6 rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${ORB_COLORS.moss}40, ${ORB_COLORS.slate}20)`
            }}
          />
        </div>
        <p className="text-ink/50 text-sm">
          Your meditation sessions will appear here.
        </p>
        <p className="text-ink/30 text-xs mt-2">
          Start your first sit to begin your journey.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groupedSessions.map((group) => (
        <div key={group.date}>
          {/* Date header */}
          <p className="text-xs text-ink/40 font-medium uppercase tracking-wider mb-3">
            {group.displayDate}
          </p>

          {/* Sessions for this date */}
          <div className="space-y-3">
            {group.sessions.map((session) => (
              <SessionCard key={session.uuid} session={session} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Individual session card
function SessionCard({ session }: { session: SessionWithDetails }) {
  const hasInsight = !!session.insight
  const hasPlan = !!session.plan

  return (
    <div className="bg-cream-deep rounded-xl p-4">
      {/* Header row: time + duration */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Small orb indicator */}
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${ORB_COLORS.slate}, ${ORB_COLORS.indigo})`
            }}
          />
          <span className="text-sm text-ink/60">
            {formatSessionTime(session.startTime)}
          </span>
        </div>
        <span className="text-sm text-ink font-medium tabular-nums">
          {formatDuration(session.durationSeconds)}
        </span>
      </div>

      {/* Plan details if linked */}
      {hasPlan && session.plan && (
        <div className="flex flex-wrap gap-2 text-xs text-ink/50 mb-2">
          {session.plan.discipline && (
            <span className="bg-cream px-2 py-0.5 rounded-full">
              {session.plan.discipline}
            </span>
          )}
          {session.plan.pose && (
            <span className="bg-cream px-2 py-0.5 rounded-full">
              {session.plan.pose}
            </span>
          )}
        </div>
      )}

      {/* Insight preview */}
      {hasInsight && session.insight && (
        <p className="text-sm text-ink/70 leading-relaxed line-clamp-2">
          "{session.insight.formattedText || session.insight.rawText}"
        </p>
      )}

      {/* No insight - gentle invite */}
      {!hasInsight && (
        <button className="text-sm text-ink/40 hover:text-ink/60 transition-colors">
          Add reflection →
        </button>
      )}
    </div>
  )
}
