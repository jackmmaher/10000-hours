/**
 * useResonanceHaptics - Haptic feedback for Resonance Anchor
 *
 * Provides three haptic modes:
 * 1. Resonance: Continuous micro-pulses during exhale when humming detected
 * 2. Ghost anchor: Pulses with logarithmically increasing gaps (50ms -> 3000ms over 30s)
 * 3. Off: Inhale phase or no humming
 *
 * Uses navigator.vibrate with graceful fallback (visual-only on iOS web).
 * Does NOT import @capacitor/haptics — pure web API.
 */

import { useCallback, useRef } from 'react'

export interface ResonanceHapticsControls {
  /** Start resonance micro-pulse pattern */
  startResonance: () => void
  /** Stop resonance pulses */
  stopResonance: () => void
  /** Start ghost anchor decay pattern (30s of tapering pulses) */
  startGhostAnchor: () => void
  /** Stop ghost anchor */
  stopGhostAnchor: () => void
  /** Whether haptics are supported on this device */
  isSupported: boolean
}

export function useResonanceHaptics(): ResonanceHapticsControls {
  const resonanceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const ghostTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator

  /**
   * Start resonance pattern — rapid micro-pulses that feel like vibration
   * Pattern: [16ms on, 16ms off] at ~60Hz for continuous resonance feel
   */
  const startResonance = useCallback(() => {
    if (!isSupported) return
    // Stop any existing pattern first
    if (resonanceIntervalRef.current) {
      clearInterval(resonanceIntervalRef.current)
    }

    // Use repeating vibration pattern for smooth resonance
    resonanceIntervalRef.current = setInterval(() => {
      try {
        navigator.vibrate([16, 16])
      } catch {
        // Silently fail
      }
    }, 32)
  }, [isSupported])

  /**
   * Stop resonance haptics
   */
  const stopResonance = useCallback(() => {
    if (resonanceIntervalRef.current) {
      clearInterval(resonanceIntervalRef.current)
      resonanceIntervalRef.current = null
    }
    if (isSupported) {
      try {
        navigator.vibrate(0) // Cancel any ongoing vibration
      } catch {
        // Silently fail
      }
    }
  }, [isSupported])

  /**
   * Start ghost anchor — progressively slower pulses over ~30 seconds
   * Uses logarithmic gap increase: 50ms -> 3000ms
   */
  const startGhostAnchor = useCallback(() => {
    if (!isSupported) return

    // Stop any existing patterns
    stopResonance()
    if (ghostTimeoutRef.current) {
      clearTimeout(ghostTimeoutRef.current)
    }

    let step = 0

    const tick = () => {
      step++

      // Pulse
      try {
        navigator.vibrate(15)
      } catch {
        // Silently fail
      }

      // Calculate next delay (logarithmic increase)
      // Base 50ms, grows by power of 1.1 per step, capped at 3000ms
      const delay = Math.min(50 * Math.pow(1.1, step), 3000)

      // Stop when delay exceeds 3s (roughly 30s of total time)
      if (delay < 3000) {
        ghostTimeoutRef.current = setTimeout(tick, delay)
      } else {
        ghostTimeoutRef.current = null
      }
    }

    tick()
  }, [isSupported, stopResonance])

  /**
   * Stop ghost anchor haptics
   */
  const stopGhostAnchor = useCallback(() => {
    if (ghostTimeoutRef.current) {
      clearTimeout(ghostTimeoutRef.current)
      ghostTimeoutRef.current = null
    }
    if (isSupported) {
      try {
        navigator.vibrate(0)
      } catch {
        // Silently fail
      }
    }
  }, [isSupported])

  return {
    startResonance,
    stopResonance,
    startGhostAnchor,
    stopGhostAnchor,
    isSupported,
  }
}
