/**
 * JourneyNextSession - "Your Next Moment" card
 *
 * Shows the next planned session or invites user to plan.
 * Warm, inviting design - never shaming for not having a plan.
 */

import { useMemo } from 'react'
import { PlannedSession } from '../lib/db'
import { useSessionStore } from '../stores/useSessionStore'
import { ORB_COLORS, ANIMATION_BREATHE_DURATION } from '../lib/animations'

interface JourneyNextSessionProps {
  plannedSession: PlannedSession | null
  onPlanClick: () => void
}

export function JourneyNextSession({
  plannedSession,
  onPlanClick
}: JourneyNextSessionProps) {
  const { setView } = useSessionStore()

  // Format the date for display
  const dateDisplay = useMemo(() => {
    if (!plannedSession) return null

    const planDate = new Date(plannedSession.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

    if (planDate.getTime() === today.getTime()) {
      return plannedSession.plannedTime
        ? `Today, ${plannedSession.plannedTime}`
        : 'Today'
    }

    if (planDate.getTime() === tomorrow.getTime()) {
      return plannedSession.plannedTime
        ? `Tomorrow, ${plannedSession.plannedTime}`
        : 'Tomorrow'
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayName = dayNames[planDate.getDay()]

    return plannedSession.plannedTime
      ? `${dayName}, ${plannedSession.plannedTime}`
      : dayName
  }, [plannedSession])

  // If there's a planned session, show the card
  if (plannedSession) {
    return (
      <div className="mb-10">
        <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">
          Your Next Moment
        </p>

        <div className="bg-cream-deep rounded-2xl p-5 relative overflow-hidden">
          {/* Subtle orb glow in corner */}
          <div
            className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-30 animate-breathe"
            style={{
              background: `radial-gradient(circle, ${ORB_COLORS.moss}60, transparent)`,
              animationDuration: `${ANIMATION_BREATHE_DURATION}ms`
            }}
          />

          <div className="relative">
            {/* Date/Time */}
            <p className="text-sm text-ink/60 mb-2">
              {dateDisplay}
            </p>

            {/* Title - from guided meditation or fallback */}
            <p className="font-serif text-xl text-ink mb-2">
              {plannedSession.title || plannedSession.discipline || 'Meditation'}
            </p>

            {/* Details row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink/50 mb-4">
              {plannedSession.discipline && (
                <span>{plannedSession.discipline}</span>
              )}
              {plannedSession.pose && (
                <span>{plannedSession.pose}</span>
              )}
              {plannedSession.notes && !plannedSession.title && (
                <span className="truncate max-w-[200px]">{plannedSession.notes}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setView('timer')}
                className="flex-1 py-3 px-4 bg-moss text-cream rounded-xl text-sm font-medium
                  hover:bg-moss/90 transition-colors active:scale-[0.98]"
              >
                Begin Now
              </button>
              <button
                onClick={onPlanClick}
                className="py-3 px-4 text-ink/50 hover:text-ink/70 transition-colors text-sm"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No planned session - gentle invite to plan (not shaming)
  return (
    <div className="mb-10">
      <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">
        Your Next Moment
      </p>

      <button
        onClick={onPlanClick}
        className="w-full bg-cream-deep rounded-2xl p-5 text-left hover:bg-cream-deep/80 transition-colors group"
      >
        <div className="flex items-center gap-4">
          {/* Soft orb indicator */}
          <div
            className="w-10 h-10 rounded-full flex-shrink-0 animate-breathe"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${ORB_COLORS.moss}40, ${ORB_COLORS.slate}20)`,
              animationDuration: `${ANIMATION_BREATHE_DURATION}ms`
            }}
          />

          <div className="flex-1 min-w-0">
            <p className="font-serif text-lg text-ink group-hover:text-ink/80 transition-colors">
              Plan your next meditation
            </p>
          </div>

          {/* Arrow */}
          <svg
            className="w-5 h-5 text-ink/30 group-hover:text-ink/50 transition-colors flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      {/* Quick start option */}
      <div className="text-center mt-4">
        <button
          onClick={() => setView('timer')}
          className="text-sm text-moss hover:text-moss/80 transition-colors"
        >
          Or just begin now →
        </button>
      </div>
    </div>
  )
}
