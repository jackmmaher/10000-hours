/**
 * useAudioFeedback - Optional audio cues for key moments
 *
 * Provides subtle, meditative audio feedback using Web Audio API:
 * - complete: Singing bowl tone for session completion
 * - milestone: Deeper, richer bowl for milestones
 * - tick: Very subtle soft click
 *
 * Sound design philosophy:
 * - Organic, not electronic (multiple harmonics like real bells)
 * - Slow decay (singing bowls ring for seconds, not milliseconds)
 * - Lower frequencies (calming, not alerting)
 * - No arpeggios or melodies (single mindful moment)
 *
 * All sounds are synthesized (no external audio files needed).
 * Respects user preference (default: disabled).
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
        audioContextRef.current = new (
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        )()
      } catch {
        // Web Audio not supported
        return null
      }
    }
    return audioContextRef.current
  }, [])

  /**
   * Create a singing bowl / bell tone
   * Multiple detuned oscillators create organic warmth
   */
  const playSingingBowl = useCallback(
    (ctx: AudioContext, baseFreq: number, duration: number, volume: number) => {
      const now = ctx.currentTime

      // Harmonics ratios for bell-like tone (fundamental + overtones)
      const harmonics = [
        { ratio: 1, gain: 1 }, // Fundamental
        { ratio: 2.0, gain: 0.4 }, // Octave
        { ratio: 3.0, gain: 0.2 }, // Fifth above octave
        { ratio: 4.2, gain: 0.15 }, // Slightly sharp double octave (bell character)
        { ratio: 5.4, gain: 0.1 }, // Higher partial
      ]

      // Slight detune for warmth (like real bowls have imperfections)
      const detuneAmount = 3 // cents

      harmonics.forEach(({ ratio, gain: harmonicGain }) => {
        // Create two slightly detuned oscillators per harmonic for richness
        for (let detune = -detuneAmount; detune <= detuneAmount; detune += detuneAmount * 2) {
          const osc = ctx.createOscillator()
          const gainNode = ctx.createGain()

          osc.connect(gainNode)
          gainNode.connect(ctx.destination)

          osc.type = 'sine'
          osc.frequency.value = baseFreq * ratio
          osc.detune.value = detune

          // Soft attack, long natural decay
          const peakGain = volume * harmonicGain * 0.5
          gainNode.gain.setValueAtTime(0, now)
          gainNode.gain.linearRampToValueAtTime(peakGain, now + 0.02) // Soft 20ms attack
          gainNode.gain.exponentialRampToValueAtTime(peakGain * 0.3, now + duration * 0.3)
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)

          osc.start(now)
          osc.stop(now + duration)
        }
      })
    },
    []
  )

  const play = useCallback(
    (cue: AudioCue) => {
      if (!audioFeedbackEnabled) return

      const ctx = getAudioContext()
      if (!ctx) return

      // Resume context if suspended (autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      switch (cue) {
        case 'complete': {
          // Gentle singing bowl - F3 (174Hz) - warm, grounding
          // 5s duration allows natural exponential decay without abrupt cutoff
          playSingingBowl(ctx, 174.61, 5.0, 0.15)
          break
        }

        case 'milestone': {
          // Richer, slightly higher bowl - A3 (220Hz) - more presence
          // 6s duration for fuller, more celebratory resonance
          playSingingBowl(ctx, 220.0, 6.0, 0.18)
          break
        }

        case 'tick': {
          // Very subtle soft thud (for potential future use)
          const now = ctx.currentTime
          const osc = ctx.createOscillator()
          const gainNode = ctx.createGain()

          osc.connect(gainNode)
          gainNode.connect(ctx.destination)
          osc.type = 'sine'
          osc.frequency.value = 150

          gainNode.gain.setValueAtTime(0.02, now)
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

          osc.start(now)
          osc.stop(now + 0.1)
          break
        }
      }
    },
    [audioFeedbackEnabled, getAudioContext, playSingingBowl]
  )

  return {
    complete: () => play('complete'),
    milestone: () => play('milestone'),
    tick: () => play('tick'),
    play,
  }
}
