/**
 * InteractiveTimeline - Session history as tappable dots
 *
 * Shows sessions on a horizontal scrollable timeline.
 * Dots sized by duration, tap to see session details.
 * Supports zoom levels: week, month, year.
 */

import { useMemo, useState, useRef } from 'react'
import { Session } from '../lib/db'
import { formatDuration, formatShortDate } from '../lib/format'

interface InteractiveTimelineProps {
  sessions: Session[]
  onSessionTap?: (session: Session) => void
}

type ZoomLevel = 'week' | 'month' | 'year'

// Get zoom level config
const ZOOM_CONFIG: Record<ZoomLevel, { days: number; label: string; dotSpacing: number }> = {
  week: { days: 7, label: '7 days', dotSpacing: 40 },
  month: { days: 30, label: '30 days', dotSpacing: 12 },
  year: { days: 365, label: '1 year', dotSpacing: 1 }
}

export function InteractiveTimeline({ sessions, onSessionTap }: InteractiveTimelineProps) {
  const [zoom, setZoom] = useState<ZoomLevel>('month')
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const config = ZOOM_CONFIG[zoom]

  // Filter and process sessions
  const { visibleSessions, minTime, maxTime } = useMemo(() => {
    if (sessions.length === 0) {
      return { visibleSessions: [], minTime: Date.now(), maxTime: Date.now() }
    }

    const cutoff = Date.now() - (config.days * 24 * 60 * 60 * 1000)
    const filtered = sessions
      .filter(s => s.startTime >= cutoff)
      .sort((a, b) => a.startTime - b.startTime)

    const min = filtered.length > 0 ? filtered[0].startTime : Date.now()
    const max = Date.now()

    return { visibleSessions: filtered, minTime: min, maxTime: max }
  }, [sessions, config.days])

  // Calculate dot size based on duration (min 6px, max 16px)
  const getDotSize = (duration: number): number => {
    const minutes = duration / 60
    if (minutes < 5) return 6
    if (minutes < 15) return 8
    if (minutes < 30) return 10
    if (minutes < 60) return 12
    return 16
  }

  // Get position for a timestamp
  const getPosition = (timestamp: number): number => {
    const range = maxTime - minTime
    if (range === 0) return 50
    return ((timestamp - minTime) / range) * 100
  }

  const handleDotTap = (session: Session) => {
    setSelectedSession(session === selectedSession ? null : session)
    onSessionTap?.(session)
  }

  const cycleZoom = () => {
    const levels: ZoomLevel[] = ['week', 'month', 'year']
    const current = levels.indexOf(zoom)
    setZoom(levels[(current + 1) % levels.length])
    setSelectedSession(null)
  }

  if (sessions.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-xs text-ink/30 italic">
          Your sessions will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="mb-8">
      {/* Header with zoom toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-serif text-sm text-ink/50 tracking-wide">
          Timeline
        </p>
        <button
          onClick={cycleZoom}
          className="text-xs text-moss hover:text-moss/80 transition-colors"
        >
          {config.label} →
        </button>
      </div>

      {/* Timeline container */}
      <div
        ref={scrollRef}
        className="relative overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide"
      >
        {/* Timeline track */}
        <div
          className="relative h-16"
          style={{ minWidth: `${Math.max(300, visibleSessions.length * config.dotSpacing)}px` }}
        >
          {/* Baseline */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-ink/10" />

          {/* Session dots */}
          {visibleSessions.map((session) => {
            const position = getPosition(session.startTime)
            const size = getDotSize(session.durationSeconds)
            const isSelected = selectedSession?.id === session.id

            return (
              <button
                key={session.id}
                onClick={() => handleDotTap(session)}
                className={`
                  absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-200
                  ${isSelected
                    ? 'bg-moss ring-2 ring-moss/30 scale-125'
                    : 'bg-moss/60 hover:bg-moss hover:scale-110'
                  }
                `}
                style={{
                  left: `${position}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  marginLeft: `-${size / 2}px`
                }}
                title={formatShortDate(new Date(session.startTime))}
              />
            )
          })}

          {/* Date markers */}
          <div className="absolute bottom-0 left-0 text-[9px] text-ink/30">
            {formatShortDate(new Date(minTime))}
          </div>
          <div className="absolute bottom-0 right-0 text-[9px] text-ink/30">
            Today
          </div>
        </div>
      </div>

      {/* Selected session detail */}
      {selectedSession && (
        <div className="mt-4 p-4 bg-cream-deep rounded-xl animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink">
                {formatShortDate(new Date(selectedSession.startTime))}
              </p>
              <p className="text-xs text-ink/50 mt-1">
                {new Date(selectedSession.startTime).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-ink font-medium tabular-nums">
                {formatDuration(selectedSession.durationSeconds)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-3 text-xs text-ink/40 text-center">
        {visibleSessions.length} session{visibleSessions.length !== 1 ? 's' : ''} in {config.label}
      </div>
    </div>
  )
}
