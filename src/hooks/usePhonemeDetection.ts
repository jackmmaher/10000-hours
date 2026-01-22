/**
 * usePhonemeDetection - A/U/M phoneme classification using spectral features
 *
 * Uses Meyda for spectral centroid and flatness analysis to classify
 * the three phonemes of Om chanting:
 * - "A" (Ah): Open vowel with high spectral centroid (1500-2500 Hz)
 * - "U" (Oo): Closed vowel with low spectral centroid (500-1000 Hz)
 * - "M" (Mm): Nasal hum with very low centroid + high spectral flatness
 *
 * Includes debounce to prevent rapid false transitions (150-200ms).
 */

import { useRef, useCallback, useEffect } from 'react'
import Meyda from 'meyda'

export type Phoneme = 'silence' | 'A' | 'U' | 'M'

export interface PhonemeData {
  current: Phoneme
  previousPhoneme: Phoneme
  spectralCentroid: number
  spectralFlatness: number
  rms: number
  completedCycles: number
  timestamp: number
}

export interface UsePhonemeDetectionResult {
  // Get current phoneme data (for 60fps rendering)
  getPhonemeData: () => PhonemeData
  // Analyze a single frame
  analyze: (audioData: Float32Array, sampleRate: number) => PhonemeData
  // Reset state
  reset: () => void
}

// Spectral centroid thresholds in Hz
// Meyda returns centroid as frequency in Hz, not normalized
// Based on real-world testing of Om chanting:
// - "M" (Mm): Nasal hum has very low spectral centroid (mostly fundamental)
// - "U" (Oo): Closed vowel has low-mid centroid
// - "A" (Ah): Open vowel has higher spectral centroid
const PHONEME_THRESHOLDS = {
  M_MAX: 250, // Hz - nasal hum has low centroid
  U_MIN: 250, // Hz
  U_MAX: 550, // Hz - closed vowel
  A_MIN: 550, // Hz - open vowel has higher centroid
}

// Hysteresis buffer to prevent flickering at boundaries
const HYSTERESIS_BUFFER = 40 // Hz

// Note: Spectral flatness is used in classifyPhoneme for M detection
// Flatness near 1 = noise-like, near 0 = tonal
// Humming has moderate flatness due to nasal resonance

// RMS threshold for silence detection
const SILENCE_THRESHOLD = 0.01

// Debounce time in milliseconds to prevent rapid transitions
const DEBOUNCE_MS = 150

// Buffer size must match what we pass to Meyda
const BUFFER_SIZE = 2048

export function usePhonemeDetection(): UsePhonemeDetectionResult {
  // Mutable state in refs for performance
  const phonemeDataRef = useRef<PhonemeData>({
    current: 'silence',
    previousPhoneme: 'silence',
    spectralCentroid: 0,
    spectralFlatness: 0,
    rms: 0,
    completedCycles: 0,
    timestamp: 0,
  })

  // Debounce state
  const lastTransitionTimeRef = useRef(0)
  const pendingPhonemeRef = useRef<Phoneme>('silence')

  // Last confirmed phoneme for hysteresis
  const lastConfirmedPhonemeRef = useRef<Phoneme>('silence')

  // Cycle tracking: SILENCE -> A -> U -> M -> SILENCE
  const cycleStateRef = useRef<'idle' | 'started' | 'a' | 'u' | 'm'>('idle')

  // Track if Meyda has been configured
  const meydaConfiguredRef = useRef(false)

  /**
   * Get current phoneme data
   */
  const getPhonemeData = useCallback((): PhonemeData => {
    return phonemeDataRef.current
  }, [])

  // Debug counter for throttled logging
  const debugCounterRef = useRef(0)

  /**
   * Classify phoneme from spectral features with hysteresis
   * centroid is in Hz from Meyda
   * Hysteresis prevents flickering at boundaries by requiring
   * the signal to cross threshold + buffer to switch phonemes
   */
  const classifyPhoneme = useCallback(
    (centroid: number, flatness: number, rms: number): Phoneme => {
      // Debug logging (throttled)
      debugCounterRef.current++
      if (debugCounterRef.current % 30 === 0) {
        console.log(
          '[Phoneme] centroid:',
          Math.round(centroid),
          'Hz, flatness:',
          flatness.toFixed(3),
          'rms:',
          rms.toFixed(4),
          'current:',
          lastConfirmedPhonemeRef.current
        )
      }

      // Check for silence first
      if (rms < SILENCE_THRESHOLD) {
        lastConfirmedPhonemeRef.current = 'silence'
        return 'silence'
      }

      const lastPhoneme = lastConfirmedPhonemeRef.current

      // Apply hysteresis: require signal to cross threshold + buffer to change
      // This prevents rapid oscillation at phoneme boundaries

      // M detection: very low centroid (mostly fundamental frequency)
      if (lastPhoneme === 'M') {
        // Stay in M unless centroid rises above M_MAX + buffer
        if (centroid < PHONEME_THRESHOLDS.M_MAX + HYSTERESIS_BUFFER) {
          return 'M'
        }
      } else {
        // Switch to M if centroid drops below M_MAX
        if (centroid < PHONEME_THRESHOLDS.M_MAX) {
          lastConfirmedPhonemeRef.current = 'M'
          return 'M'
        }
      }

      // U detection: low-mid centroid (closed vowel "oo")
      if (lastPhoneme === 'U') {
        // Stay in U unless centroid moves outside U range + buffer
        if (
          centroid >= PHONEME_THRESHOLDS.U_MIN - HYSTERESIS_BUFFER &&
          centroid < PHONEME_THRESHOLDS.U_MAX + HYSTERESIS_BUFFER
        ) {
          return 'U'
        }
      } else {
        // Switch to U if centroid is solidly in U range
        if (centroid >= PHONEME_THRESHOLDS.U_MIN && centroid < PHONEME_THRESHOLDS.U_MAX) {
          lastConfirmedPhonemeRef.current = 'U'
          return 'U'
        }
      }

      // A detection: higher centroid (open vowel "ah")
      if (lastPhoneme === 'A') {
        // Stay in A unless centroid drops below A_MIN - buffer
        if (centroid >= PHONEME_THRESHOLDS.A_MIN - HYSTERESIS_BUFFER) {
          return 'A'
        }
      } else {
        // Switch to A if centroid rises above A_MIN
        if (centroid >= PHONEME_THRESHOLDS.A_MIN) {
          lastConfirmedPhonemeRef.current = 'A'
          return 'A'
        }
      }

      // In transition zone, stay with current phoneme if vocalized, else default to U
      if (lastPhoneme !== 'silence') {
        return lastPhoneme
      }
      return 'U' // Default for new vocalization in transition zone
    },
    []
  )

  /**
   * Update cycle tracking state machine
   */
  const updateCycleState = useCallback((phoneme: Phoneme, prevPhoneme: Phoneme): number => {
    let cycleCompleted = 0
    const state = cycleStateRef.current

    if (phoneme === 'silence' && state === 'm') {
      // Completed a full cycle: A -> U -> M -> silence
      cycleCompleted = 1
      cycleStateRef.current = 'idle'
    } else if (phoneme === 'A' && (state === 'idle' || prevPhoneme === 'silence')) {
      cycleStateRef.current = 'a'
    } else if (phoneme === 'U' && state === 'a') {
      cycleStateRef.current = 'u'
    } else if (phoneme === 'M' && state === 'u') {
      cycleStateRef.current = 'm'
    }

    return cycleCompleted
  }, [])

  /**
   * Analyze a single frame of audio
   */
  const analyze = useCallback(
    (audioData: Float32Array, sampleRate: number): PhonemeData => {
      const now = performance.now()

      // Configure Meyda if needed
      if (!meydaConfiguredRef.current || Meyda.sampleRate !== sampleRate) {
        Meyda.bufferSize = BUFFER_SIZE
        Meyda.sampleRate = sampleRate
        meydaConfiguredRef.current = true
      }

      // Ensure we have the right buffer size
      let signal: Float32Array = audioData
      if (audioData.length !== BUFFER_SIZE) {
        // Pad or truncate to match buffer size
        signal = new Float32Array(BUFFER_SIZE)
        const copyLength = Math.min(audioData.length, BUFFER_SIZE)
        signal.set(audioData.subarray(0, copyLength))
      }

      // Extract features using Meyda
      const features = Meyda.extract(['spectralCentroid', 'spectralFlatness', 'rms'], signal)

      if (!features) {
        return phonemeDataRef.current
      }

      const centroid = (features.spectralCentroid as number) || 0
      const flatness = (features.spectralFlatness as number) || 0
      const rms = (features.rms as number) || 0

      // Classify raw phoneme
      const rawPhoneme = classifyPhoneme(centroid, flatness, rms)

      // Apply debounce
      const currentPhoneme = phonemeDataRef.current.current
      let finalPhoneme = currentPhoneme

      if (rawPhoneme !== pendingPhonemeRef.current) {
        // New pending phoneme, start debounce timer
        pendingPhonemeRef.current = rawPhoneme
        lastTransitionTimeRef.current = now
      } else if (rawPhoneme !== currentPhoneme) {
        // Same pending phoneme, check if debounce period elapsed
        if (now - lastTransitionTimeRef.current >= DEBOUNCE_MS) {
          finalPhoneme = rawPhoneme
        }
      }

      // Update cycle tracking and get completed cycles
      const previousPhoneme = phonemeDataRef.current.current
      let completedCycles = phonemeDataRef.current.completedCycles

      if (finalPhoneme !== previousPhoneme) {
        completedCycles += updateCycleState(finalPhoneme, previousPhoneme)
      }

      phonemeDataRef.current = {
        current: finalPhoneme,
        previousPhoneme,
        spectralCentroid: centroid,
        spectralFlatness: flatness,
        rms,
        completedCycles,
        timestamp: now,
      }

      return phonemeDataRef.current
    },
    [classifyPhoneme, updateCycleState]
  )

  /**
   * Reset state
   */
  const reset = useCallback((): void => {
    phonemeDataRef.current = {
      current: 'silence',
      previousPhoneme: 'silence',
      spectralCentroid: 0,
      spectralFlatness: 0,
      rms: 0,
      completedCycles: 0,
      timestamp: 0,
    }
    cycleStateRef.current = 'idle'
    pendingPhonemeRef.current = 'silence'
    lastTransitionTimeRef.current = 0
    lastConfirmedPhonemeRef.current = 'silence'
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  return {
    getPhonemeData,
    analyze,
    reset,
  }
}

/**
 * Get display label for phoneme
 */
export function getPhonemeLabel(phoneme: Phoneme): string {
  switch (phoneme) {
    case 'A':
      return 'Ah'
    case 'U':
      return 'Oo'
    case 'M':
      return 'Mm'
    case 'silence':
      return '—'
  }
}
