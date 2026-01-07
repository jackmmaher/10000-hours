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
  /** Called when user wants to add insight to a session (voice capture) */
  onAddInsight?: (session: Session) => void
  /** Called when user wants to create a pearl from an insight */
  onCreatePearl?: (session: SessionWithDetails) => void
  /** Called when a session card is clicked (for Calendar sync) */
  onSessionClick?: (session: Session) => void
}

export interface SessionWithDetails extends Session {
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

export function SessionStream({ sessions, onAddInsight, onCreatePearl, onSessionClick }: SessionStreamProps) {
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
              <SessionCard
                key={session.uuid}
                session={session}
                onAddInsight={onAddInsight}
                onCreatePearl={onCreatePearl}
                onSessionClick={onSessionClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Individual session card - now interactive
function SessionCard({
  session,
  onAddInsight,
  onCreatePearl,
  onSessionClick
}: {
  session: SessionWithDetails
  onAddInsight?: (session: Session) => void
  onCreatePearl?: (session: SessionWithDetails) => void
  onSessionClick?: (session: Session) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasInsight = !!session.insight
  const hasPlan = !!session.plan
  const hasSharedPearl = !!session.insight?.sharedPearlId

  const handleCardClick = () => {
    setIsExpanded(!isExpanded)
    onSessionClick?.(session)
  }

  const handleAddInsight = (e: React.MouseEvent) => {
    e.stopPropagation() // Don't trigger card expand
    onAddInsight?.(session)
  }

  const handleCreatePearl = (e: React.MouseEvent) => {
    e.stopPropagation() // Don't trigger card expand
    onCreatePearl?.(session)
  }

  return (
    <button
      onClick={handleCardClick}
      className="w-full text-left bg-cream-deep rounded-xl p-4 transition-all hover:bg-cream-deep/80 active:scale-[0.99]"
    >
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink font-medium tabular-nums">
            {formatDuration(session.durationSeconds)}
          </span>
          {/* Expand indicator */}
          <svg
            className={`w-4 h-4 text-ink/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
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
          {session.plan.duration && (
            <span className="bg-cream px-2 py-0.5 rounded-full">
              {session.plan.duration} min planned
            </span>
          )}
        </div>
      )}

      {/* Insight preview (collapsed) or full (expanded) */}
      {hasInsight && session.insight && (
        <p className={`text-sm text-ink/70 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
          "{session.insight.formattedText || session.insight.rawText}"
        </p>
      )}

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-ink/5">
          {/* Full date/time */}
          <p className="text-xs text-ink/40 mb-2">
            {new Date(session.startTime).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>

          {/* Notes from plan if any */}
          {hasPlan && session.plan?.notes && (
            <div className="mb-3">
              <p className="text-xs text-ink/40 mb-1">Intention:</p>
              <p className="text-sm text-ink/60 italic">"{session.plan.notes}"</p>
            </div>
          )}

          {/* Actions based on insight state */}
          {!hasInsight ? (
            <button
              onClick={handleAddInsight}
              className="text-sm text-indigo-deep hover:text-indigo-deep/80 transition-colors font-medium"
            >
              Add insight →
            </button>
          ) : hasSharedPearl ? (
            <span className="text-xs text-moss font-medium">
              ✦ Pearl shared
            </span>
          ) : (
            <button
              onClick={handleCreatePearl}
              className="text-sm text-moss hover:text-moss/80 transition-colors font-medium"
            >
              Create Pearl →
            </button>
          )}
        </div>
      )}

      {/* No insight preview - show invite (collapsed only) */}
      {!hasInsight && !isExpanded && (
        <p className="text-sm text-ink/40">
          Tap to add insight
        </p>
      )}
    </button>
  )
}
