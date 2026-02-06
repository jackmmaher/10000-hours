/**
 * ExerciseActivity - Recent exercise session feed for Journey tab
 *
 * Shows a compact list of recent exercise sessions with:
 * - Exercise type icon/color
 * - Duration and timestamp
 * - Key metric (coherence score, mind score, posture %)
 * - Tap to navigate to exercise
 */

import { useMemo } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useNavigationStore } from '../stores/useNavigationStore'
import {
  getRecentExerciseSessions,
  EXERCISE_TOOL_NAMES,
  EXERCISE_TOOL_COLORS,
  EXERCISE_TOOL_VIEWS,
  formatExerciseDuration,
} from '../lib/exerciseAnalytics'
import type { Session, PracticeToolId } from '../lib/db/types'

function getKeyMetric(session: Session): string | null {
  if (session.practiceToolId === 'om-coach' && session.omCoachMetrics) {
    const score = session.omCoachMetrics.averageAlignmentScore
    return score != null ? `${Math.round(score)}% coherence` : null
  }
  if (session.practiceToolId === 'racing-mind' && session.racingMindMetrics) {
    const pre = session.racingMindMetrics.preSessionMindScore
    const post = session.racingMindMetrics.postSessionMindScore
    if (pre != null && post != null) {
      return `${pre} → ${post}/10`
    }
    if (post != null) return `${post}/10 after`
    return null
  }
  if (session.practiceToolId === 'posture-training' && session.postureMetrics) {
    return `${Math.round(session.postureMetrics.goodPosturePercent)}% aligned`
  }
  if (session.practiceToolId === 'breath-pacer' && session.breathPacerMetrics) {
    return `${session.breathPacerMetrics.completedCycles} cycles`
  }
  return null
}

function formatTimeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Small exercise type icon (colored dot) */
function ExerciseDot({ toolId }: { toolId: PracticeToolId }) {
  return (
    <div
      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{ backgroundColor: EXERCISE_TOOL_COLORS[toolId] || '#888' }}
    />
  )
}

function ExerciseRow({
  session,
  onNavigate,
}: {
  session: Session
  onNavigate: (toolId: PracticeToolId) => void
}) {
  const toolId = session.practiceToolId!
  const metric = getKeyMetric(session)

  return (
    <button
      onClick={() => onNavigate(toolId)}
      className="w-full flex items-center gap-3 py-3 px-1 text-left
        hover:bg-cream-deep/50 rounded-lg transition-colors touch-manipulation"
    >
      <ExerciseDot toolId={toolId} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-ink truncate">{EXERCISE_TOOL_NAMES[toolId] || toolId}</span>
          <span className="text-xs text-ink/30 ml-2 flex-shrink-0">
            {formatTimeAgo(session.startTime)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-ink/40">
            {formatExerciseDuration(session.durationSeconds)}
          </span>
          {metric && (
            <>
              <span className="text-xs text-ink/20">·</span>
              <span className="text-xs text-ink/50">{metric}</span>
            </>
          )}
        </div>
      </div>
    </button>
  )
}

export function ExerciseActivity() {
  const sessions = useSessionStore((s) => s.sessions)
  const setView = useNavigationStore((s) => s.setView)

  const recentExercises = useMemo(() => getRecentExerciseSessions(sessions, 5), [sessions])

  const handleNavigate = (toolId: PracticeToolId) => {
    const view = EXERCISE_TOOL_VIEWS[toolId]
    if (view) setView(view)
  }

  if (recentExercises.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between mb-3">
        <p className="font-serif text-sm text-ink/50 tracking-wide">Exercise Practice</p>
        <button
          onClick={() => setView('exercises')}
          className="text-xs text-accent hover:text-accent/80 transition-colors touch-manipulation"
        >
          All exercises
        </button>
      </div>

      <div className="bg-elevated rounded-xl px-3 py-1 shadow-sm">
        {recentExercises.map((session) => (
          <ExerciseRow key={session.uuid} session={session} onNavigate={handleNavigate} />
        ))}
      </div>
    </div>
  )
}
