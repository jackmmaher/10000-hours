/**
 * useAudioFeedback - Meditative audio synchronized with visual transitions
 *
 * Sound design philosophy:
 * - Organic, not electronic (multiple harmonics like real bells)
 * - Synchronized with animation (crescendo matches visual settling)
 * - Lower frequencies (calming, not alerting)
 * - Soft presence (felt more than heard)
 *
 * The completion chime follows an adaptive three-phase ceremony:
 *
 * Timeline:
 * T=0          T=X            T=X+4                              T=X+19
 * |------------|--------------|-----------------------------------|
 *   Holding     Crescendo       Natural Decay (15s)
 *   (synced)    (synced)        (independent - runs to completion)
 *
 * Three phases:
 * 1. Holding Phase (T=0 to T=X): Extremely soft ambient presence (~1.5% volume).
 *    Acknowledges tap without jarring. Like a distant bell heard through walls.
 *
 * 2. Crescendo Phase (T=X to T=X+4): Gradual build synced with seconds dissolving.
 *    Exponential ramp to peak. Matches the visual "letting go" of the timer.
 *
 * 3. Decay Phase (T=X+4 to T=X+19): Natural untruncated fade to silence.
 *    Peak occurs as "tap to meditate" returns. The visual journey completes around
 *    T=X+8, but the bell's resonance continues fading naturally - this is intentional.
 *    Like real singing bowls (40-60s) and meditation app audio (14-45s).
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

// Timing constants for breath-aligned ceremony
const CRESCENDO_DURATION = 4.0 // Matches seconds dissolve (4s)
const DECAY_DURATION = 15.0 // Natural untruncated decay (within 14-45s app audio range)
const HOLDING_VOLUME_RATIO = 0.015 // 1.5% of peak - barely audible presence

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
   * Create an adaptive synchronized singing bowl tone
   *
   * Three-phase envelope designed to match variable visual animation:
   * 1. Holding: Barely audible presence during breath alignment wait
   * 2. Crescendo: Gradual awakening as seconds dissolve
   * 3. Decay: Natural return to silence as UI settles
   */
  const playSynchronizedBowl = useCallback(
    (
      ctx: AudioContext,
      baseFreq: number,
      holdingDuration: number, // Time until visual settling begins (in seconds)
      crescendoDuration: number,
      decayDuration: number,
      peakVolume: number
    ) => {
      const now = ctx.currentTime
      const totalDuration = holdingDuration + crescendoDuration + decayDuration

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
          const holdingVolume = peak * HOLDING_VOLUME_RATIO

          // Phase 1: Holding (barely audible presence)
          // Like a distant bell heard through walls - acknowledges tap without jarring
          gainNode.gain.setValueAtTime(0.001, now)
          gainNode.gain.linearRampToValueAtTime(holdingVolume, now + 0.5) // Gentle fade in
          if (holdingDuration > 0.5) {
            gainNode.gain.setValueAtTime(holdingVolume, now + holdingDuration) // Hold steady
          }

          // Phase 2: Crescendo (awakening)
          // Exponential rise feels more natural - matches visual "letting go"
          const crescendoStart = now + holdingDuration
          gainNode.gain.exponentialRampToValueAtTime(
            peak * 0.15,
            crescendoStart + crescendoDuration * 0.4
          )
          gainNode.gain.exponentialRampToValueAtTime(
            peak * 0.6,
            crescendoStart + crescendoDuration * 0.8
          )
          gainNode.gain.linearRampToValueAtTime(peak, crescendoStart + crescendoDuration)

          // Brief sustain at peak (the "arrival" moment)
          const decayStart = crescendoStart + crescendoDuration
          gainNode.gain.setValueAtTime(peak, decayStart + 0.1)

          // Phase 3: Decay (logarithmic return to silence)
          // Exponential for natural bell-like fade, then linear to true zero
          gainNode.gain.exponentialRampToValueAtTime(peak * 0.4, decayStart + decayDuration * 0.3)
          gainNode.gain.exponentialRampToValueAtTime(peak * 0.1, decayStart + decayDuration * 0.6)
          gainNode.gain.exponentialRampToValueAtTime(0.001, decayStart + decayDuration * 0.95)
          // Final ramp to TRUE zero - exponential can't reach 0, linear can
          // This eliminates the click/snap when oscillator stops
          gainNode.gain.linearRampToValueAtTime(0, decayStart + decayDuration)

          osc.start(now)
          osc.stop(now + totalDuration + 0.5)
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
    async (cue: AudioCue, holdingDurationMs?: number) => {
      if (!audioFeedbackEnabled) return

      const ctx = getAudioContext()
      if (!ctx) return

      // Resume context if suspended (autoplay policy)
      // MUST await on iOS - context won't play until resumed
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume()
        } catch {
          // Resume failed - likely no user gesture or blocked
          return
        }
      }

      switch (cue) {
        case 'complete': {
          // Adaptive synchronized singing bowl - G3 (196Hz) - warm, centered
          // Holding duration from breath alignment, then crescendo + decay
          const holdingDurationSec = (holdingDurationMs ?? 0) / 1000
          playSynchronizedBowl(
            ctx,
            196.0,
            holdingDurationSec,
            CRESCENDO_DURATION,
            DECAY_DURATION,
            0.06
          )
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
    /** Play completion chime with optional holding duration (ms until visual settling begins) */
    complete: (holdingDurationMs?: number) => play('complete', holdingDurationMs),
    milestone: () => play('milestone'),
    tick: () => play('tick'),
    play,
  }
}
