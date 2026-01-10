/**
 * useBreathPacing - Manages breath pacing state and haptic feedback
 *
 * Tracks current breath phase and progress within phase.
 * Triggers haptic feedback on phase transitions when enabled.
 *
 * Uses 100ms ticks for smooth visual updates.
 */

import { useState, useEffect, useRef } from 'react'
import type { BreathPattern, BreathPhase } from '../lib/breathPacing'
import { useTapFeedback } from './useTapFeedback'
import { useSettingsStore } from '../stores/useSettingsStore'

export interface BreathPacingState {
  phase: BreathPhase
  progress: number  // 0-1 within current phase
  phaseTimeRemaining: number
  cycleCount: number
}

export function useBreathPacing(
  pattern: BreathPattern | null | undefined,
  isActive: boolean
): BreathPacingState | null {
  const [state, setState] = useState<BreathPacingState | null>(null)
  const tapFeedback = useTapFeedback()
  const breathHapticsEnabled = useSettingsStore((s) => s.breathHapticsEnabled)

  const intervalRef = useRef<number | null>(null)
  const phaseIndexRef = useRef(0)
  const phaseTimeRef = useRef(0)
  const cycleCountRef = useRef(0)

  useEffect(() => {
    if (!pattern || !isActive) {
      setState(null)
      phaseIndexRef.current = 0
      phaseTimeRef.current = 0
      cycleCountRef.current = 0
      return
    }

    // Initialize state
    const initialPhase = pattern.phases[0]
    setState({
      phase: initialPhase.phase,
      progress: 0,
      phaseTimeRemaining: initialPhase.duration,
      cycleCount: 0
    })

    // Start breath pacing
    const tick = () => {
      const currentPhaseIndex = phaseIndexRef.current
      const currentPhase = pattern.phases[currentPhaseIndex]

      phaseTimeRef.current += 0.1  // 100ms ticks

      if (phaseTimeRef.current >= currentPhase.duration) {
        // Move to next phase
        phaseTimeRef.current = 0
        const nextIndex = (currentPhaseIndex + 1) % pattern.phases.length

        // Track cycle completion
        if (nextIndex === 0) {
          cycleCountRef.current += 1
        }

        phaseIndexRef.current = nextIndex

        // Haptic feedback on phase transition
        if (breathHapticsEnabled) {
          const nextPhase = pattern.phases[nextIndex]
          if (nextPhase.phase === 'inhale') {
            tapFeedback.breatheIn()
          } else if (nextPhase.phase === 'exhale') {
            tapFeedback.breatheOut()
          }
        }
      }

      const phase = pattern.phases[phaseIndexRef.current]
      setState({
        phase: phase.phase,
        progress: phaseTimeRef.current / phase.duration,
        phaseTimeRemaining: phase.duration - phaseTimeRef.current,
        cycleCount: cycleCountRef.current
      })
    }

    intervalRef.current = window.setInterval(tick, 100)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [pattern, isActive, breathHapticsEnabled, tapFeedback])

  return state
}
