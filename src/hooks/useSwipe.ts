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

const SWIPE_THRESHOLD = 50
const SWIPE_TIMEOUT = 300

export function useSwipe(handlers: SwipeHandlers) {
  const swipeRef = useRef<SwipeState | null>(null)

  const onTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    swipeRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now()
    }
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

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

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
