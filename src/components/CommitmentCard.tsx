/**
 * CommitmentCard - Planned vs Actual meditation commitment
 *
 * Shows how well the user follows through on their planned sessions.
 * Displays planned hours, actual hours, and completion rate.
 *
 * Design: Celebrate follow-through, not shame gaps
 */

import { CommitmentStats } from '../lib/progressInsights'

interface CommitmentCardProps {
  stats: CommitmentStats
}

export function CommitmentCard({ stats }: CommitmentCardProps) {
  // Don't show if no planning data
  if (stats.plansCreated === 0) {
    return null
  }

  const showHourComparison = stats.plannedHours > 0 && stats.actualHours > 0

  return (
    <div className="mb-10">
      <p className="font-serif text-sm text-ink/50 tracking-wide mb-5">
        Following Through
      </p>

      <div className="bg-cream-deep rounded-xl p-5">
        {showHourComparison && (
          <div className="mb-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm text-ink/50">Planned</span>
              <span className="text-sm text-ink tabular-nums">
                {formatHours(stats.plannedHours)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink/50">Actual</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink tabular-nums">
                  {formatHours(stats.actualHours)}
                </span>
                {stats.overUnderPercent !== 0 && (
                  <span className={`
                    text-xs font-medium tabular-nums
                    ${stats.overUnderPercent > 0 ? 'text-moss' : 'text-ink/40'}
                  `}>
                    {stats.overUnderPercent > 0 ? '+' : ''}{stats.overUnderPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Completion rate */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink/50">
            {stats.plansCompleted} of {stats.plansCreated} planned sessions
          </span>
          <span className={`
            text-sm font-medium tabular-nums
            ${stats.completionRate >= 70 ? 'text-moss' : 'text-ink'}
          `}>
            {stats.completionRate}%
          </span>
        </div>

        {/* Trend indicator */}
        {stats.trend !== 'new' && stats.trend !== 'stable' && (
          <div className="mt-3 pt-3 border-t border-ink/5">
            <p className="text-xs text-ink/40">
              {stats.trend === 'improving' && (
                <>
                  <span className="text-moss">Improving</span> — better follow-through recently
                </>
              )}
              {stats.trend === 'declining' && (
                <>
                  <span className="text-bark">Slipping</span> — commitment drifting
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`
  }
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
