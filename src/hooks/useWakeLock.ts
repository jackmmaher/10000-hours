import { useEffect, useCallback, useRef } from 'react'

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
