/**
 * DayItemsCarousel - Swipeable carousel for day items
 *
 * A simple horizontal swipe component that:
 * - Shows dot indicators at top showing total items and current position
 * - Supports touch swipe gestures (swipe left = next, swipe right = previous)
 * - Renders children inside a swipeable container
 * - Calls onIndexChange when user swipes to a different item
 */

import { useState } from 'react'

interface DayItemsCarouselProps {
  itemCount: number
  currentIndex: number
  onIndexChange: (index: number) => void
  children: React.ReactNode
}

export function DayItemsCarousel({
  itemCount,
  currentIndex,
  onIndexChange,
  children,
}: DayItemsCarouselProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const touchEnd = e.changedTouches[0].clientX
    const delta = touchStart - touchEnd

    if (Math.abs(delta) > 50) {
      if (delta > 0 && currentIndex < itemCount - 1) {
        // Swiped left - go to next item
        onIndexChange(currentIndex + 1)
      } else if (delta < 0 && currentIndex > 0) {
        // Swiped right - go to previous item
        onIndexChange(currentIndex - 1)
      }
    }
    setTouchStart(null)
  }

  // Don't render carousel UI if only one item
  if (itemCount <= 1) {
    return <>{children}</>
  }

  return (
    <div className="w-full">
      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mb-4">
        {Array.from({ length: itemCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => onIndexChange(i)}
            aria-label={`Go to item ${i + 1}`}
            aria-current={i === currentIndex ? 'true' : undefined}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i === currentIndex ? 'bg-accent' : 'bg-ink/40'
            }`}
          />
        ))}
      </div>

      {/* Swipeable container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full touch-pan-y"
      >
        {children}
      </div>
    </div>
  )
}
