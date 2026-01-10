/**
 * useAudioFeedback - Optional audio cues for key moments
 *
 * Provides subtle audio feedback using Web Audio API:
 * - complete: Gentle chime for session completion
 * - milestone: Achievement tone for milestones
 * - tick: Very subtle click (optional for longer sessions)
 *
 * All sounds are synthesized (no external audio files needed).
 * Respects user preference (default: disabled).
 * Falls back gracefully if Web Audio unavailable.
 */

import { useCallback, useRef } from 'react'
import { useSettingsStore } from '../stores/useSettingsStore'

type AudioCue = 'complete' | 'milestone' | 'tick'

export function useAudioFeedback() {
  const audioFeedbackEnabled = useSettingsStore((s) => s.audioFeedbackEnabled)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Lazy-init AudioContext on first use (browser requirement)
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      } catch {
        // Web Audio not supported
        return null
      }
    }
    return audioContextRef.current
  }, [])

  const play = useCallback((cue: AudioCue) => {
    if (!audioFeedbackEnabled) return

    const ctx = getAudioContext()
    if (!ctx) return

    // Resume context if suspended (autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // Create oscillator and gain nodes
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.type = 'sine'

    // Configure based on cue type
    switch (cue) {
      case 'complete': {
        // Gentle major chord arpeggio (C5 -> E5 -> G5)
        const now = ctx.currentTime
        oscillator.frequency.setValueAtTime(523.25, now)       // C5
        oscillator.frequency.setValueAtTime(659.25, now + 0.1) // E5
        oscillator.frequency.setValueAtTime(783.99, now + 0.2) // G5
        gainNode.gain.setValueAtTime(0.1, now)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
        oscillator.start(now)
        oscillator.stop(now + 0.5)
        break
      }

      case 'milestone': {
        // Brighter, more celebratory (E5 -> G5 -> B5)
        const now = ctx.currentTime
        oscillator.frequency.setValueAtTime(659.25, now)        // E5
        oscillator.frequency.setValueAtTime(783.99, now + 0.15) // G5
        oscillator.frequency.setValueAtTime(987.77, now + 0.3)  // B5
        gainNode.gain.setValueAtTime(0.12, now)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6)
        oscillator.start(now)
        oscillator.stop(now + 0.6)
        break
      }

      case 'tick': {
        // Very subtle click
        const now = ctx.currentTime
        oscillator.frequency.setValueAtTime(1000, now)
        gainNode.gain.setValueAtTime(0.03, now)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
        oscillator.start(now)
        oscillator.stop(now + 0.05)
        break
      }
    }
  }, [audioFeedbackEnabled, getAudioContext])

  return {
    complete: () => play('complete'),
    milestone: () => play('milestone'),
    tick: () => play('tick'),
    play
  }
}
