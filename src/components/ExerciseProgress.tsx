/**
 * ExerciseProgress - Dedicated exercise analytics for Progress tab
 *
 * Shows per-module breakdown with:
 * - Global exercise summary (total sessions, time, tools used)
 * - Per-tool cards with frequency, duration, scores
 * - Evidence-based progress tracking (Racing Mind self-assessment trends)
 * - Score progression sparklines
 */

import { useMemo } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useNavigationStore } from '../stores/useNavigationStore'
import {
  getExerciseOverview,
  formatExerciseDuration,
  EXERCISE_TOOL_VIEWS,
  type ExerciseToolStats,
  type ExerciseOverview,
} from '../lib/exerciseAnalytics'

/** Mini sparkline for score progression */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const width = 80
  const height = 24
  const padding = 2

  const points = values
    .map((v, i) => {
      const x = padding + (i / (values.length - 1)) * (width - 2 * padding)
      const y = height - padding - ((v - min) / range) * (height - 2 * padding)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.6}
      />
      {/* Latest point dot */}
      <circle
        cx={width - padding}
        cy={height - padding - ((values[values.length - 1] - min) / range) * (height - 2 * padding)}
        r={2.5}
        fill={color}
      />
    </svg>
  )
}

/** Summary row for a stat */
function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-xs text-ink/50">{label}</span>
      <span className="text-xs text-ink tabular-nums">{value}</span>
    </div>
  )
}

/** Per-tool detail card */
function ToolCard({ stats }: { stats: ExerciseToolStats }) {
  const setView = useNavigationStore((s) => s.setView)

  const handleTap = () => {
    const view = EXERCISE_TOOL_VIEWS[stats.toolId]
    if (view) setView(view)
  }

  const avgMinutes = Math.round(stats.avgDurationSeconds / 60)

  return (
    <button
      onClick={handleTap}
      className="w-full text-left bg-elevated rounded-xl p-4 shadow-sm
        hover:shadow-md transition-all touch-manipulation"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stats.color }} />
          <span className="text-sm font-medium text-ink">{stats.toolName}</span>
        </div>
        {stats.scoreProgression && stats.scoreProgression.length >= 2 && (
          <Sparkline values={stats.scoreProgression} color={stats.color} />
        )}
      </div>

      {/* Stats grid */}
      <div className="space-y-1.5">
        <StatRow label="Sessions" value={`${stats.sessionCount}`} />
        <StatRow label="Total time" value={formatExerciseDuration(stats.totalDurationSeconds)} />
        <StatRow label="Avg session" value={`${avgMinutes}m`} />
        <StatRow
          label="Frequency"
          value={
            stats.sessionsPerWeek >= 1
              ? `${stats.sessionsPerWeek.toFixed(1)}/week`
              : stats.sessionCount === 1
                ? 'First session'
                : `${stats.sessionCount} total`
          }
        />

        {/* Latest score */}
        {stats.latestScore != null && (
          <StatRow
            label="Latest score"
            value={
              stats.toolId === 'posture-training'
                ? `${Math.round(stats.latestScore)}% aligned`
                : stats.toolId === 'om-coach'
                  ? `${Math.round(stats.latestScore)}% coherence`
                  : `${stats.latestScore}/10`
            }
          />
        )}
      </div>

      {/* Evidence-based progress (Racing Mind self-assessment) */}
      {stats.selfAssessmentProgress && (
        <div className="mt-3 pt-3 border-t border-ink/5">
          <p className="text-xs text-ink/40 mb-1">Self-reported progress</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink/60">
              Started at {stats.selfAssessmentProgress.firstAvg}/10
            </span>
            <span className="text-xs text-ink/60">
              Now {stats.selfAssessmentProgress.recentAvg}/10
            </span>
          </div>
          {stats.selfAssessmentProgress.improvement > 0 && (
            <p className="text-xs text-moss mt-1">
              {stats.selfAssessmentProgress.improvement.toFixed(1)} point improvement over{' '}
              {stats.selfAssessmentProgress.totalSessions} sessions
            </p>
          )}
          {stats.selfAssessmentProgress.improvement <= 0 && (
            <p className="text-xs text-ink/40 mt-1">
              {stats.selfAssessmentProgress.totalSessions} sessions tracked
            </p>
          )}
        </div>
      )}

      {/* Last practiced */}
      {stats.lastSessionAt && (
        <p className="text-xs text-ink/30 mt-2">Last: {formatLastPracticed(stats.lastSessionAt)}</p>
      )}
    </button>
  )
}

function formatLastPracticed(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Global exercise overview header */
function ExerciseOverviewHeader({ overview }: { overview: ExerciseOverview }) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      <div className="bg-cream-deep rounded-xl p-3 text-center">
        <p className="text-lg text-ink tabular-nums">{overview.totalSessions}</p>
        <p className="text-xs text-ink/40">sessions</p>
      </div>
      <div className="bg-cream-deep rounded-xl p-3 text-center">
        <p className="text-lg text-ink tabular-nums">
          {formatExerciseDuration(overview.totalDurationSeconds)}
        </p>
        <p className="text-xs text-ink/40">total time</p>
      </div>
      <div className="bg-cream-deep rounded-xl p-3 text-center">
        <p className="text-lg text-ink tabular-nums">{overview.toolsUsed}</p>
        <p className="text-xs text-ink/40">tools used</p>
      </div>
    </div>
  )
}

export function ExerciseProgress() {
  const sessions = useSessionStore((s) => s.sessions)
  const setView = useNavigationStore((s) => s.setView)

  const overview = useMemo(() => getExerciseOverview(sessions), [sessions])

  // Don't show if no exercise sessions
  if (overview.totalSessions === 0) return null

  return (
    <div className="mb-10">
      <div className="flex items-baseline justify-between mb-5">
        <p className="font-serif text-sm text-ink/50 tracking-wide">Exercise Practice</p>
        <button
          onClick={() => setView('exercises')}
          className="text-xs text-accent hover:text-accent/80 transition-colors touch-manipulation"
        >
          Start exercise
        </button>
      </div>

      {/* Global overview */}
      <ExerciseOverviewHeader overview={overview} />

      {/* Per-tool cards */}
      <div className="space-y-3">
        {overview.tools.map((tool) => (
          <ToolCard key={tool.toolId} stats={tool} />
        ))}
      </div>
    </div>
  )
}
