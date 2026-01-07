import { useRef, useCallback, TouchEvent } from 'react'

interface SwipeHandlers {
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

interface SwipeState {
  startX: number
  startY: number
  startTime: number
}

const SWIPE_THRESHOLD = 150  // Higher threshold prevents accidental navigation while scrolling
const SWIPE_TIMEOUT = 400
const SCROLL_TOLERANCE = 30  // If scrolled more than this, ignore swipe

export function useSwipe(handlers: SwipeHandlers) {
  const swipeRef = useRef<SwipeState | null>(null)
  const scrollStartRef = useRef<number>(0)

  const onTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    swipeRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now()
    }
    // Track scroll position at start
    const target = e.currentTarget as HTMLElement
    scrollStartRef.current = target?.scrollTop || 0
  }, [])

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (!swipeRef.current) return

    const touch = e.changedTouches[0]
    const { startX, startY, startTime } = swipeRef.current

    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY
    const deltaTime = Date.now() - startTime

    swipeRef.current = null

    // Check if swipe was quick enough
    if (deltaTime > SWIPE_TIMEOUT) return

    // Check if user was scrolling (scroll position changed significantly)
    const target = e.currentTarget as HTMLElement
    const scrollEnd = target?.scrollTop || 0
    const scrollDelta = Math.abs(scrollEnd - scrollStartRef.current)
    if (scrollDelta > SCROLL_TOLERANCE) return

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    // Require clear directional intent (one axis must dominate)
    const directionRatio = Math.max(absX, absY) / (Math.min(absX, absY) + 1)
    if (directionRatio < 2) return  // Not a clear swipe direction

    // Determine primary direction
    if (absX > absY && absX > SWIPE_THRESHOLD) {
      // Horizontal swipe
      if (deltaX > 0) {
        handlers.onSwipeRight?.()
      } else {
        handlers.onSwipeLeft?.()
      }
    } else if (absY > absX && absY > SWIPE_THRESHOLD) {
      // Vertical swipe
      if (deltaY > 0) {
        handlers.onSwipeDown?.()
      } else {
        handlers.onSwipeUp?.()
      }
    }
  }, [handlers])

  return {
    onTouchStart,
    onTouchEnd
  }
}
