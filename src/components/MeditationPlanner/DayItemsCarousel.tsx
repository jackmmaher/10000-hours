/**
 * DayItemsCarousel - Tab-based navigation for multiple sessions/plans on same day
 *
 * Shows labeled tabs at top indicating what each item is:
 * - Past sessions: "6:34 AM" (time they occurred)
 * - Future plans: "11:20 AM" with plan indicator
 *
 * Navigation is TAB-ONLY (no swipe) to avoid conflicts with
 * horizontally scrollable content inside (position/technique selectors).
 */

import type { DayItem } from './types'

interface DayItemsCarouselProps {
  items: DayItem[]
  currentIndex: number
  onIndexChange: (index: number) => void
  children: React.ReactNode
}

/**
 * Format a timestamp or time string for display
 */
function formatItemLabel(item: DayItem): string {
  if (item.type === 'session' && item.session) {
    // Past session - show the time it started
    const date = new Date(item.session.startTime)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (item.type === 'plan' && item.plan) {
    // Future plan - show planned time or "Planned"
    if (item.plan.plannedTime) {
      // Convert "HH:MM" to readable time
      const [hours, minutes] = item.plan.plannedTime.split(':').map(Number)
      const date = new Date()
      date.setHours(hours, minutes)
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    }
    return 'Planned'
  }

  return `Item ${item.id}`
}

/**
 * Get a short type indicator
 */
function getTypeIndicator(item: DayItem): string | null {
  if (item.type === 'plan') {
    return 'plan'
  }
  return null // Sessions don't need an indicator, they're the default
}

export function DayItemsCarousel({
  items,
  currentIndex,
  onIndexChange,
  children,
}: DayItemsCarouselProps) {
  // Don't render carousel UI if only one item
  if (items.length <= 1) {
    return <>{children}</>
  }

  return (
    <div className="w-full">
      {/* Tab navigation - shows what each item is (scrollable for many items) */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
        {items.map((item, i) => {
          const label = formatItemLabel(item)
          const typeIndicator = getTypeIndicator(item)
          const isActive = i === currentIndex

          return (
            <button
              key={item.id}
              onClick={() => onIndexChange(i)}
              aria-label={`View ${item.type === 'plan' ? 'planned session' : 'session'} at ${label}`}
              aria-current={isActive ? 'true' : undefined}
              className={`
                px-3 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0
                ${isActive ? 'bg-accent text-on-accent' : 'bg-ink/10 text-ink/60 hover:bg-ink/20'}
              `}
            >
              {label}
              {typeIndicator && (
                <span className={`ml-1 ${isActive ? 'text-on-accent/70' : 'text-ink/40'}`}>
                  ({typeIndicator})
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content - NO swipe handlers, just renders children */}
      <div className="w-full">{children}</div>
    </div>
  )
}
