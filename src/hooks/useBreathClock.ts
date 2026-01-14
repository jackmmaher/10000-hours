import { useState, useCallback } from 'react'

/**
 * Breath Clock Hook
 *
 * Tracks position in the 16-second box breathing cycle (4-4-4-4).
 * Enables synchronizing timer transitions to breath phases.
 *
 * Cycle:
 * 0-4s:   inhale    (scale 1 → 1.03)
 * 4-8s:   hold-in   (scale 1.03)
 * 8-12s:  exhale    (scale 1.03 → 1)
 * 12-16s: hold-out  (scale 1)
 */

const CYCLE_DURATION = 16000 // 16 seconds total
const PHASE_DURATION = 4000 // 4 seconds per phase

export type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out'

export interface BreathClock {
  /** Get current breath phase */
  getPhase: () => BreathPhase
  /** Wait for a specific phase to begin (returns Promise that resolves at phase start) */
  waitForPhase: (target: BreathPhase) => Promise<void>
  /** Timestamp when the cycle started (for CSS sync) */
  cycleStart: number
}

export function useBreathClock(): BreathClock {
  // Initialize cycle start time once on mount
  const [cycleStart] = useState(() => Date.now())

  /**
   * Determine current breath phase based on elapsed time
   */
  const getPhase = useCallback((): BreathPhase => {
    const elapsed = (Date.now() - cycleStart) % CYCLE_DURATION

    if (elapsed < 4000) return 'inhale'
    if (elapsed < 8000) return 'hold-in'
    if (elapsed < 12000) return 'exhale'
    return 'hold-out'
  }, [cycleStart])

  /**
   * Wait for a specific breath phase to begin
   * Resolves when we're at the START of the target phase (within 100ms tolerance)
   */
  const waitForPhase = useCallback(
    (target: BreathPhase): Promise<void> => {
      return new Promise((resolve) => {
        const check = () => {
          const currentPhase = getPhase()
          const elapsed = (Date.now() - cycleStart) % CYCLE_DURATION
          const phaseProgress = elapsed % PHASE_DURATION

          // Are we at the START of the target phase? (within 100ms tolerance)
          if (currentPhase === target && phaseProgress < 100) {
            resolve()
          } else {
            requestAnimationFrame(check)
          }
        }
        check()
      })
    },
    [cycleStart, getPhase]
  )

  return {
    getPhase,
    waitForPhase,
    cycleStart,
  }
}
