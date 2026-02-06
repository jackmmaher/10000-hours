import { PlannedSession } from '../lib/db/types'

interface TodaysPlanCardProps {
  plan: PlannedSession
  enforceGoal: boolean
}

/**
 * TodaysPlanCard - Shows the next planned session on the Timer idle screen.
 * Renders as a subtle card above the timer display when a plan exists for today.
 * Returns null if plan has no meaningful data to display.
 */
export function TodaysPlanCard({ plan, enforceGoal }: TodaysPlanCardProps) {
  // Format planned time for display
  const formattedTime = plan.plannedTime ? formatPlannedTime(plan.plannedTime) : null

  // Duration label
  const durationLabel = plan.duration ? `${plan.duration} min` : null

  // If there is nothing meaningful to show, do not render
  if (!formattedTime && !durationLabel && !plan.discipline && !plan.title) {
    return null
  }

  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '12px 16px',
        width: '100%',
        maxWidth: 320,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Title or discipline as heading */}
      {(plan.title || plan.discipline) && (
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
          }}
        >
          {plan.title || plan.discipline}
        </p>
      )}

      {/* Time and duration row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: plan.title || plan.discipline ? 6 : 0,
        }}
      >
        {formattedTime && (
          <span
            style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              letterSpacing: '0.02em',
            }}
          >
            {formattedTime}
          </span>
        )}

        {formattedTime && durationLabel && (
          <span
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
            }}
          >
            {'\u00B7'}
          </span>
        )}

        {durationLabel && (
          <span
            style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
            }}
          >
            {durationLabel}
          </span>
        )}

        {/* Discipline badge (only if title is shown and discipline differs) */}
        {plan.title && plan.discipline && (
          <span
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              background: 'color-mix(in oklab, var(--text-muted) 12%, transparent)',
              padding: '2px 8px',
              borderRadius: 99,
              marginLeft: 'auto',
            }}
          >
            {plan.discipline}
          </span>
        )}
      </div>

      {/* Enforce goal badge */}
      {enforceGoal && durationLabel && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 8,
            fontSize: 11,
            color: 'var(--accent)',
            background: 'color-mix(in oklab, var(--accent) 10%, transparent)',
            padding: '3px 10px',
            borderRadius: 99,
          }}
        >
          <span>Goal: {durationLabel}</span>
        </div>
      )}
    </div>
  )
}

/** Convert "HH:MM" 24h format to locale time string */
function formatPlannedTime(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}
