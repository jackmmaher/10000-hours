/**
 * GrowthBars - Session duration evolution over time
 *
 * Simple horizontal bars showing average session length by month.
 * Human-readable, not a "college presentation" chart.
 *
 * Design: Show progress simply, celebrate deepening practice
 * Graceful degradation: Show single month with helpful context
 */

import { GrowthTrajectory } from '../lib/progressInsights'

interface GrowthBarsProps {
  trajectory: GrowthTrajectory
  totalSessions: number
}

export function GrowthBars({ trajectory, totalSessions }: GrowthBarsProps) {
  const { months, trend, changePercent } = trajectory

  // Need at least 5 sessions to show anything meaningful
  if (totalSessions < 5) {
    return null
  }

  // Single month case - show with context
  if (months.length === 1) {
    const month = months[0]
    return (
      <div className="mb-10">
        <p className="font-serif text-sm text-ink/50 tracking-wide mb-5">
          Session Length
        </p>

        <div className="flex items-center gap-3">
          <span className="text-xs text-ink/40 w-8 text-right tabular-nums">
            {month.label}
          </span>
          <div className="flex-1 h-4 bg-cream-deep rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-bark to-moss"
              style={{ width: '75%' }}
            />
          </div>
          <span className="text-xs text-ink font-medium tabular-nums w-12 text-right">
            {month.avgMinutes} min
          </span>
        </div>

        <p className="text-xs text-ink/30 mt-4">
          {month.sessionCount} session{month.sessionCount !== 1 ? 's' : ''} this month.
          Growth trends appear with more history.
        </p>
      </div>
    )
  }

  // No months at all (shouldn't happen with 5+ sessions, but safety)
  if (months.length === 0) {
    return null
  }

  // Multi-month case - show comparison
  const maxMinutes = Math.max(...months.map(m => m.avgMinutes), 1)

  const headerText = trend === 'deepening'
    ? 'Sessions Are Deepening'
    : trend === 'shortening'
    ? 'Sessions Shortening'
    : 'Session Length Over Time'

  return (
    <div className="mb-10">
      <div className="flex items-baseline justify-between mb-5">
        <p className="font-serif text-sm text-ink/50 tracking-wide">
          {headerText}
        </p>
        {trend === 'deepening' && changePercent > 0 && (
          <span className="text-xs text-moss font-medium tabular-nums">
            +{changePercent}%
          </span>
        )}
      </div>

      <div className="space-y-3">
        {months.map((month, index) => {
          const widthPercent = (month.avgMinutes / maxMinutes) * 100
          const isNewest = index === months.length - 1

          return (
            <div key={month.label} className="flex items-center gap-3">
              <span className="text-xs text-ink/40 w-8 text-right tabular-nums">
                {month.label}
              </span>
              <div className="flex-1 h-4 bg-cream-deep rounded-full overflow-hidden">
                <div
                  className={`
                    h-full rounded-full transition-all duration-500
                    ${isNewest
                      ? 'bg-gradient-to-r from-bark to-moss'
                      : 'bg-ink/15'
                    }
                  `}
                  style={{ width: `${Math.max(widthPercent, 8)}%` }}
                />
              </div>
              <span className={`
                text-xs tabular-nums w-12 text-right
                ${isNewest ? 'text-ink font-medium' : 'text-ink/40'}
              `}>
                {month.avgMinutes} min
              </span>
            </div>
          )
        })}
      </div>

      {trend === 'deepening' && (
        <p className="text-xs text-ink/40 mt-4">
          Your average session has grown from {trajectory.oldestAvg} to {trajectory.newestAvg} minutes.
        </p>
      )}
    </div>
  )
}
