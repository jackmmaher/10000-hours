/**
 * CommitmentCard - Planned vs Actual meditation commitment
 *
 * Shows how well the user follows through on their planned sessions.
 * Displays planned hours, actual hours, and completion rate.
 *
 * Design: Celebrate follow-through, not shame gaps
 * Graceful degradation: Show planning invitation when no plans exist
 */

import { CommitmentStats } from '../lib/progressInsights'
import { useNavigationStore } from '../stores/useNavigationStore'

interface CommitmentCardProps {
  stats: CommitmentStats
  totalSessions: number
}

export function CommitmentCard({ stats, totalSessions }: CommitmentCardProps) {
  const { setView } = useNavigationStore()

  // If user has sessions but no plans, invite them to try planning
  if (stats.plansCreated === 0 && totalSessions >= 3) {
    return (
      <div className="mb-10">
        <p className="font-serif text-sm text-ink/50 tracking-wide mb-5">
          Following Through
        </p>

        <button
          onClick={() => setView('journey')}
          className="w-full text-left bg-cream-deep hover:bg-cream-warm rounded-xl p-5 transition-colors active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-ink/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-ink">Try planning your sessions</p>
              <p className="text-xs text-ink/40 mt-0.5">
                Track commitment by scheduling ahead in Journey
              </p>
            </div>
            <svg
              className="w-4 h-4 text-ink/20 flex-shrink-0 ml-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    )
  }

  // Not enough data to show anything
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
