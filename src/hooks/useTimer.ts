import { useState, useEffect, useRef } from 'react'
import { useSessionStore } from '../stores/useSessionStore'

export { useWakeLock } from './useWakeLock'

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
