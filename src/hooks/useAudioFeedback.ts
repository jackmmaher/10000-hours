/**
 * useAudioFeedback - Meditative audio synchronized with visual transitions
 *
 * Sound design philosophy:
 * - Organic, not electronic (multiple harmonics like real bells)
 * - Synchronized with animation (crescendo matches visual settling)
 * - Lower frequencies (calming, not alerting)
 * - Soft presence (felt more than heard)
 *
 * The completion chime follows a breath-aligned 4-second ceremony:
 * - Begins softly during "completing" phase (0-1500ms exhale)
 * - Crescendos during "resolving" phase (1500-4000ms inhale)
 * - Peaks as animation settles (~4000ms)
 * - Natural decay over 4 seconds after peak
 *
 * Like the Disney castle intro or Pixar lamp - the transition itself
 * is part of the experience, not just a bridge between states.
 *
 * All sounds are synthesized (no external audio files needed).
 * Respects user preference (default: disabled).
 */

import { useCallback, useRef } from 'react'
import { useSettingsStore } from '../stores/useSettingsStore'

type AudioCue = 'complete' | 'milestone' | 'tick'

// Animation timing constants for breath-aligned ceremony
// 4 second total transition synchronized with breathing cycle
const COMPLETING_DURATION = 1.5 // 1500ms - ceremonial exhale
const RESOLVING_DURATION = 2.5 // 2500ms - ceremonial inhale
const CRESCENDO_DURATION = COMPLETING_DURATION + RESOLVING_DURATION // 4s breath cycle

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
   * Create a synchronized singing bowl tone
   *
   * The envelope is designed to match the visual animation:
   * - Soft emergence during visual dissolve
   * - Peak presence as new cumulative settles
   * - Gentle decay as stillness takes hold
   */
  const playSynchronizedBowl = useCallback(
    (
      ctx: AudioContext,
      baseFreq: number,
      crescendoDuration: number,
      decayDuration: number,
      peakVolume: number
    ) => {
      const now = ctx.currentTime

      // Harmonics for warm, bell-like tone
      const harmonics = [
        { ratio: 1, gain: 1 }, // Fundamental
        { ratio: 2.0, gain: 0.35 }, // Octave (slightly reduced)
        { ratio: 3.0, gain: 0.15 }, // Fifth above octave
        { ratio: 4.2, gain: 0.1 }, // Bell character
        { ratio: 5.4, gain: 0.05 }, // Shimmer (very subtle)
      ]

      // Slight detune for organic warmth
      const detuneAmount = 2 // cents (reduced for cleaner tone)

      harmonics.forEach(({ ratio, gain: harmonicGain }) => {
        for (let detune = -detuneAmount; detune <= detuneAmount; detune += detuneAmount * 2) {
          const osc = ctx.createOscillator()
          const gainNode = ctx.createGain()

          osc.connect(gainNode)
          gainNode.connect(ctx.destination)

          osc.type = 'sine'
          osc.frequency.value = baseFreq * ratio
          osc.detune.value = detune

          const peak = peakVolume * harmonicGain * 0.4

          // Synchronized envelope:
          // 1. Start barely audible
          // 2. Slow crescendo matching visual transition (~1.1s)
          // 3. Brief hold at peak
          // 4. Long, peaceful decay
          gainNode.gain.setValueAtTime(0.001, now)

          // Crescendo: exponential rise feels more natural than linear
          // Start very soft, build gradually
          gainNode.gain.exponentialRampToValueAtTime(peak * 0.15, now + crescendoDuration * 0.4)
          gainNode.gain.exponentialRampToValueAtTime(peak * 0.6, now + crescendoDuration * 0.8)
          gainNode.gain.linearRampToValueAtTime(peak, now + crescendoDuration)

          // Brief sustain at peak (the "arrival" moment)
          gainNode.gain.setValueAtTime(peak, now + crescendoDuration + 0.1)

          // Gentle decay - exponential for natural bell-like fade
          gainNode.gain.exponentialRampToValueAtTime(
            peak * 0.4,
            now + crescendoDuration + decayDuration * 0.3
          )
          gainNode.gain.exponentialRampToValueAtTime(
            peak * 0.1,
            now + crescendoDuration + decayDuration * 0.6
          )
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + crescendoDuration + decayDuration)

          osc.start(now)
          osc.stop(now + crescendoDuration + decayDuration + 0.1)
        }
      })
    },
    []
  )

  /**
   * Legacy instant bowl for milestone (more celebratory, immediate presence)
   */
  const playInstantBowl = useCallback(
    (ctx: AudioContext, baseFreq: number, duration: number, volume: number) => {
      const now = ctx.currentTime

      const harmonics = [
        { ratio: 1, gain: 1 },
        { ratio: 2.0, gain: 0.4 },
        { ratio: 3.0, gain: 0.2 },
        { ratio: 4.2, gain: 0.12 },
      ]

      harmonics.forEach(({ ratio, gain: harmonicGain }) => {
        for (let detune = -3; detune <= 3; detune += 6) {
          const osc = ctx.createOscillator()
          const gainNode = ctx.createGain()

          osc.connect(gainNode)
          gainNode.connect(ctx.destination)

          osc.type = 'sine'
          osc.frequency.value = baseFreq * ratio
          osc.detune.value = detune

          const peakGain = volume * harmonicGain * 0.5
          gainNode.gain.setValueAtTime(0, now)
          gainNode.gain.linearRampToValueAtTime(peakGain, now + 0.08) // Soft 80ms attack
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
          // Synchronized singing bowl - G3 (196Hz) - warm, centered
          // Crescendo matches animation (~1.1s), then 4s decay
          playSynchronizedBowl(ctx, 196.0, CRESCENDO_DURATION, 4.0, 0.12)
          break
        }

        case 'milestone': {
          // Richer bowl with quicker presence - A3 (220Hz)
          // Still soft attack but more immediate than complete
          playInstantBowl(ctx, 220.0, 5.0, 0.14)
          break
        }

        case 'tick': {
          // Very subtle soft presence (for potential future use)
          const now = ctx.currentTime
          const osc = ctx.createOscillator()
          const gainNode = ctx.createGain()

          osc.connect(gainNode)
          gainNode.connect(ctx.destination)
          osc.type = 'sine'
          osc.frequency.value = 150

          gainNode.gain.setValueAtTime(0.015, now)
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

          osc.start(now)
          osc.stop(now + 0.15)
          break
        }
      }
    },
    [audioFeedbackEnabled, getAudioContext, playSynchronizedBowl, playInstantBowl]
  )

  return {
    complete: () => play('complete'),
    milestone: () => play('milestone'),
    tick: () => play('tick'),
    play,
  }
}
