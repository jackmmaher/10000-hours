/**
 * SuggestedActions - Conditional, actionable suggestions
 *
 * Shows personalized suggestions based on practice gaps.
 * Each suggestion is tappable and navigates to relevant view.
 *
 * Design: Gentle nudges, not guilt trips
 */

import { SuggestedAction } from '../lib/progressInsights'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useTapFeedback } from '../hooks/useTapFeedback'

interface SuggestedActionsProps {
  actions: SuggestedAction[]
}

export function SuggestedActions({ actions }: SuggestedActionsProps) {
  const { setView } = useNavigationStore()
  const haptic = useTapFeedback()

  if (actions.length === 0) {
    return null
  }

  const handleActionClick = (action: SuggestedAction) => {
    haptic.light()
    if (action.actionView) {
      setView(action.actionView)
    }
  }

  return (
    <div className="mb-10">
      <p className="font-serif text-sm text-ink/50 tracking-wide mb-5">
        You Might Consider
      </p>

      <div className="space-y-3">
        {actions.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            onClick={() => handleActionClick(action)}
          />
        ))}
      </div>
    </div>
  )
}

function ActionCard({
  action,
  onClick
}: {
  action: SuggestedAction
  onClick: () => void
}) {
  const hasAction = !!action.actionView

  const content = (
    <>
      <div className="flex items-start gap-3">
        <ActionIcon type={action.type} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-ink leading-snug">
            {action.message}
          </p>
          {action.detail && (
            <p className="text-xs text-ink/40 mt-1">
              {action.detail}
            </p>
          )}
        </div>
        {hasAction && (
          <svg
            className="w-4 h-4 text-ink/20 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </div>
    </>
  )

  if (hasAction) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left bg-card/90 backdrop-blur-md border border-ink/5 shadow-sm
          rounded-xl p-4 hover:bg-card/95 hover:shadow-md transition-all active:scale-[0.99] touch-manipulation"
      >
        {content}
      </button>
    )
  }

  return (
    <div className="bg-card/60 backdrop-blur-sm border border-ink/5 rounded-xl p-4">
      {content}
    </div>
  )
}

function ActionIcon({ type }: { type: SuggestedAction['type'] }) {
  const iconClass = "w-5 h-5 text-ink/30 flex-shrink-0"

  switch (type) {
    case 'course':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    case 'template':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )
    case 'discipline':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    case 'day':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    case 'insight':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    case 'pose':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    default:
      return (
        <div className="w-1.5 h-1.5 rounded-full bg-ink/30 mt-1.5 ml-1.5 mr-1.5" />
      )
  }
}
