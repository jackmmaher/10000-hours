import { useState, useEffect, useCallback, useRef } from 'react'
import { useSessionStore } from '../stores/useSessionStore'

export function useTimer() {
  const { timerPhase, startedAt } = useSessionStore()
  const [elapsed, setElapsed] = useState(0)
  const frameRef = useRef<number>()

  useEffect(() => {
    if (timerPhase !== 'running' || !startedAt) {
      setElapsed(0)
      return
    }

    const tick = () => {
      const now = performance.now()
      setElapsed(Math.floor((now - startedAt) / 1000))
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [timerPhase, startedAt])

  return { elapsed, isRunning: timerPhase === 'running' }
}

export function useWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
    } catch (err) {
      // Wake lock request failed - usually means tab is not visible
      console.debug('Wake lock request failed:', err)
    }
  }, [])

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
        wakeLockRef.current = null
      } catch (err) {
        console.debug('Wake lock release failed:', err)
      }
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }

    return () => {
      releaseWakeLock()
    }
  }, [enabled, requestWakeLock, releaseWakeLock])

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, requestWakeLock])
}
