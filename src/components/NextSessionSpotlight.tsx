/**
 * NextSessionSpotlight - Hero display for the Journey tab
 *
 * A prominent, centered display that takes ~2/3 of viewport height.
 * Two states:
 * - Session planned: shows details with "Begin Now" (if today) and "View in Calendar"
 * - No session: shows inviting message with "Plan a Session" and "Or just begin now"
 *
 * This is display-only - planning is handled by the parent via onPlanClick.
 */

import { useMemo } from 'react'
import { PlannedSession } from '../lib/db'
import { useNavigationStore } from '../stores/useNavigationStore'
import { ORB_COLORS, ANIMATION_BREATHE_DURATION } from '../lib/animations'

interface NextSessionSpotlightProps {
  plannedSession: PlannedSession | null
  onPlanClick: () => void
}

export function NextSessionSpotlight({ plannedSession, onPlanClick }: NextSessionSpotlightProps) {
  const { setView } = useNavigationStore()

  // Check if session is scheduled for today
  const isToday = useMemo(() => {
    if (!plannedSession) return false
    const planDate = new Date(plannedSession.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    planDate.setHours(0, 0, 0, 0)
    return planDate.getTime() === today.getTime()
  }, [plannedSession])

  // Format the date for display
  const dateDisplay = useMemo(() => {
    if (!plannedSession) return null

    const planDate = new Date(plannedSession.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Normalize plan date for comparison
    const planDateNorm = new Date(plannedSession.date)
    planDateNorm.setHours(0, 0, 0, 0)

    if (planDateNorm.getTime() === today.getTime()) {
      return 'Today'
    }

    if (planDateNorm.getTime() === tomorrow.getTime()) {
      return 'Tomorrow'
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return dayNames[planDate.getDay()]
  }, [plannedSession])

  // Format duration for display
  const durationDisplay = useMemo(() => {
    if (!plannedSession?.duration) return null
    const mins = plannedSession.duration
    if (mins < 60) return `${mins} min`
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    if (remainingMins === 0) return `${hours} hr`
    return `${hours} hr ${remainingMins} min`
  }, [plannedSession])

  // Session planned state
  if (plannedSession) {
    return (
      <div className="mb-8">
        {/* Card container */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'var(--bg-elevated)',
            boxShadow: 'var(--shadow-elevation-1)',
          }}
        >
          {/* Background breathing orb */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            aria-hidden="true"
          >
            <div
              className="w-48 h-48 rounded-full opacity-30 animate-breathe"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${ORB_COLORS.moss}60, ${ORB_COLORS.slate}30, transparent 70%)`,
                animationDuration: `${ANIMATION_BREATHE_DURATION}ms`,
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center px-6 py-10">
            {/* Label */}
            <p
              className="text-xs font-medium tracking-wider uppercase mb-4"
              style={{ color: 'var(--accent)' }}
            >
              Your next meditation
            </p>

            {/* Date and time */}
            <p className="text-sm text-ink/50 mb-2">
              {dateDisplay}
              {plannedSession.plannedTime && ` at ${plannedSession.plannedTime}`}
            </p>

            {/* Title or technique */}
            <h2 className="font-serif text-2xl text-ink mb-3">
              {plannedSession.title || plannedSession.discipline || 'Meditation'}
            </h2>

            {/* Details row */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-ink/50 mb-4">
              {durationDisplay && <span>{durationDisplay}</span>}
              {plannedSession.pose && <span>{plannedSession.pose}</span>}
            </div>

            {/* Notes preview */}
            {plannedSession.notes && (
              <p className="text-sm text-ink/40 italic mb-6 line-clamp-2">{plannedSession.notes}</p>
            )}

            {/* Actions */}
            <div className="flex flex-col items-center gap-3 mt-6">
              {isToday && (
                <button
                  onClick={() => setView('timer')}
                  className="px-8 py-3 bg-moss text-cream rounded-xl text-base font-medium
                    hover:bg-moss/90 transition-colors active:scale-[0.98] touch-manipulation"
                >
                  Begin Now
                </button>
              )}

              <button
                onClick={onPlanClick}
                className="text-sm text-ink/50 hover:text-ink/70 transition-colors touch-manipulation"
              >
                View in Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No session planned state
  return (
    <div className="mb-8">
      {/* Card container */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-elevated)',
          boxShadow: 'var(--shadow-elevation-1)',
        }}
      >
        {/* Background breathing orb */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="w-48 h-48 rounded-full opacity-20 animate-breathe"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${ORB_COLORS.moss}40, ${ORB_COLORS.slate}20, transparent 70%)`,
              animationDuration: `${ANIMATION_BREATHE_DURATION}ms`,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 py-10">
          {/* Label */}
          <p
            className="text-xs font-medium tracking-wider uppercase mb-4"
            style={{ color: 'var(--text-muted)' }}
          >
            Your next meditation
          </p>

          <h2 className="font-serif text-2xl text-ink mb-2">No session planned</h2>

          <p className="text-sm text-ink/50 mb-8">Set an intention for your practice</p>

          {/* Actions */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={onPlanClick}
              className="px-8 py-3 bg-accent text-on-accent rounded-xl text-base font-medium
                hover:bg-accent/90 transition-colors active:scale-[0.98] touch-manipulation"
            >
              Plan a Session
            </button>

            <button
              onClick={() => setView('timer')}
              className="text-sm text-ink/50 hover:text-ink/70 transition-colors touch-manipulation"
            >
              Or just begin now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
