import { useState, useRef, useCallback, TouchEvent } from 'react'

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  threshold?: number  // Pull distance to trigger refresh (default 80px)
  resistance?: number // Resistance factor (default 2.5)
}

interface PullToRefreshState {
  isPulling: boolean
  isRefreshing: boolean
  pullDistance: number
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5
}: PullToRefreshOptions) {
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0
  })

  const startYRef = useRef<number>(0)
  const currentYRef = useRef<number>(0)
  const isAtTopRef = useRef<boolean>(false)
  const canPullRef = useRef<boolean>(false)
  const pullDistanceRef = useRef<number>(0)

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (state.isRefreshing) return

    const touch = e.touches[0]
    startYRef.current = touch.clientY
    currentYRef.current = touch.clientY

    // Check if scrollable element is at top
    const target = e.currentTarget as HTMLElement
    isAtTopRef.current = target.scrollTop <= 0
    canPullRef.current = isAtTopRef.current
  }, [state.isRefreshing])

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (state.isRefreshing || !canPullRef.current) return

    const touch = e.touches[0]
    currentYRef.current = touch.clientY

    // Check if still at top (user might have scrolled up then pulled)
    const target = e.currentTarget as HTMLElement
    if (target.scrollTop > 0) {
      canPullRef.current = false
      setState(s => ({ ...s, isPulling: false, pullDistance: 0 }))
      return
    }

    const deltaY = currentYRef.current - startYRef.current

    // Only pull down (positive delta)
    if (deltaY > 0) {
      // Apply resistance to make it feel natural
      const pullDistance = deltaY / resistance
      pullDistanceRef.current = pullDistance
      setState(s => ({ ...s, isPulling: true, pullDistance }))
    } else {
      pullDistanceRef.current = 0
      setState(s => ({ ...s, isPulling: false, pullDistance: 0 }))
    }
  }, [state.isRefreshing, resistance])

  const onTouchEnd = useCallback(async () => {
    if (state.isRefreshing) return

    // Read from ref to get current value (avoids stale closure)
    const pullDistance = pullDistanceRef.current

    if (pullDistance >= threshold) {
      // Trigger refresh
      setState(s => ({ ...s, isRefreshing: true, pullDistance: threshold }))

      try {
        await onRefresh()
      } finally {
        pullDistanceRef.current = 0
        setState({ isPulling: false, isRefreshing: false, pullDistance: 0 })
      }
    } else {
      // Reset without refresh
      pullDistanceRef.current = 0
      setState({ isPulling: false, isRefreshing: false, pullDistance: 0 })
    }

    canPullRef.current = false
  }, [state.isRefreshing, threshold, onRefresh])

  return {
    ...state,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd
    }
  }
}
