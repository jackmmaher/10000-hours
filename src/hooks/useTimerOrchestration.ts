import { useState, useCallback, useMemo, useRef } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useTimer } from './useTimer'
import type { TimerPhase } from '../lib/motion'

/**
 * Timer Orchestration Hook
 *
 * Central control for the timer animation timeline.
 * Manages phase transitions as a continuous flow, not discrete state jumps.
 *
 * The key insight: we're orchestrating motion, not managing state.
 * Each phase flows into the next on a timeline, like a film sequence.
 */

interface TimerOrchestration {
  phase: TimerPhase
  beginSession: () => void
  endSession: () => void
  elapsed: number
  totalSeconds: number
  lastSessionDuration: number | null
  isTransitioning: boolean
  activeDisplaySeconds: number
}

// Timeline durations (in ms)
// Breath-aligned ceremony: END transition ~4s, START quicker (~1.5s)
const TIMING = {
  // START sequence - eager energy, quicker
  depart: 800, // exhale duration (releasing cumulative)
  arrive: 700, // inhale duration (receiving active timer)

  // END sequence - ceremonial, breath-aligned
  complete: 1500, // exhale/dissolve (releasing the session)
  resolve: 2500, // inhale/settle (receiving new cumulative)
} as const

export function useTimerOrchestration(): TimerOrchestration {
  const [phase, setPhase] = useState<TimerPhase>('resting')
  const transitioningRef = useRef(false)

  const { startTimer, stopTimer, totalSeconds, lastSessionDuration } = useSessionStore()

  const { elapsed } = useTimer()

  /**
   * Begin a session - orchestrated START sequence
   * Quicker pace (~1.5s) - eager energy to begin
   *
   * Timeline:
   * t=0ms    departing - cumulative exhales out
   * t=800ms  arriving  - active inhales in, timer starts
   * t=1500ms active    - fully running
   */
  const beginSession = useCallback(() => {
    if (transitioningRef.current || phase !== 'resting') return
    transitioningRef.current = true

    // Phase 1: Depart (exhale)
    setPhase('departing')

    // Phase 2: Arrive (inhale) - start timer here for immediate feedback
    setTimeout(() => {
      setPhase('arriving')
      startTimer()

      // Phase 3: Active (running)
      setTimeout(() => {
        setPhase('active')
        transitioningRef.current = false
      }, TIMING.arrive)
    }, TIMING.depart)
  }, [phase, startTimer])

  /**
   * End a session - orchestrated STOP sequence
   * Breath-aligned ceremony (~4s) - meditative settle
   *
   * Timeline:
   * t=0ms     completing - session exhales/dissolves upward
   * t=1500ms  resolving  - cumulative inhales/settles in
   * t=4000ms  resting    - fully at rest
   */
  const endSession = useCallback(() => {
    if (transitioningRef.current || phase !== 'active') return
    transitioningRef.current = true

    // Phase 1: Complete (dissolve)
    setPhase('completing')
    stopTimer()

    // Phase 2: Resolve (settle)
    setTimeout(() => {
      setPhase('resolving')

      // Phase 3: Rest
      setTimeout(() => {
        setPhase('resting')
        transitioningRef.current = false
      }, TIMING.resolve)
    }, TIMING.complete)
  }, [phase, stopTimer])

  /**
   * Active display value - what the active layer shows
   *
   * - arriving: 0 (just started)
   * - active: elapsed seconds (counting up)
   * - completing: lastSessionDuration (frozen final value)
   */
  const activeDisplaySeconds = useMemo(() => {
    switch (phase) {
      case 'arriving':
        return 0
      case 'active':
        return elapsed
      case 'completing':
        return lastSessionDuration ?? 0
      default:
        return 0
    }
  }, [phase, elapsed, lastSessionDuration])

  return {
    phase,
    beginSession,
    endSession,
    elapsed,
    totalSeconds,
    lastSessionDuration,
    isTransitioning: transitioningRef.current,
    activeDisplaySeconds,
  }
}
