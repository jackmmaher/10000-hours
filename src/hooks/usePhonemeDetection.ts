/**
 * @deprecated Use useFormantDetection.ts instead
 *
 * This hook uses spectral centroid which doesn't accurately distinguish vowels.
 * The new useFormantDetection uses frequency band energy ratios with optional
 * calibration for much better A/U/M classification.
 *
 * usePhonemeDetection - A/U/M phoneme classification using spectral features
 *
 * Uses Meyda for spectral centroid and flatness analysis to classify
 * the three phonemes of Aum chanting:
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
// Based on real-world testing of Aum chanting at ~130 Hz fundamental:
// - User's actual centroid values when chanting: 30-80 Hz
// - Energy is concentrated around the fundamental frequency
// - Formant frequencies (which distinguish vowels) are subtle compared to fundamental
// UPDATED: Lowered thresholds dramatically to match real-world data
const PHONEME_THRESHOLDS = {
  M_MAX: 50, // Hz - nasal hum, very concentrated energy
  U_MIN: 50, // Hz
  U_MAX: 70, // Hz - closed vowel "oo"
  A_MIN: 70, // Hz - open vowel "ah" has slightly more harmonics
}

// Spectral flatness thresholds for secondary validation
// Flatness near 1 = noise-like, near 0 = tonal
// These help distinguish phonemes when centroid alone is ambiguous
const FLATNESS_THRESHOLDS = {
  M_MIN: 0.3, // M (hum) has higher flatness due to nasal resonance
  A_MAX: 0.2, // A (ah) is more tonal, lower flatness
}

// Hysteresis buffer to prevent flickering at boundaries
const HYSTERESIS_BUFFER = 10 // Hz - reduced for smaller threshold ranges

// RMS threshold for silence detection (much more sensitive)
const SILENCE_THRESHOLD = 0.001

// Debounce time in milliseconds to prevent rapid transitions
const DEBOUNCE_MS = 100

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
   * Classify phoneme from spectral features using centroid + flatness
   *
   * Detection strategy:
   * - M (hum): Low centroid + higher flatness (nasal resonance creates broader spectrum)
   * - A (ah): Higher centroid + lower flatness (open vowel, more tonal)
   * - U (oo): Mid-range (between A and M characteristics)
   *
   * Hysteresis prevents flickering at boundaries.
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

      // === PRIMARY CLASSIFICATION using centroid + flatness ===

      // M detection: Low centroid AND higher flatness (nasal hum)
      // Flatness validation helps distinguish M from low-pitched A/U
      const isMBySpectrum =
        centroid < PHONEME_THRESHOLDS.M_MAX && flatness >= FLATNESS_THRESHOLDS.M_MIN
      const isMByCentroidOnly = centroid < PHONEME_THRESHOLDS.M_MAX - HYSTERESIS_BUFFER

      // A detection: Higher centroid AND lower flatness (open vowel, tonal)
      const isABySpectrum =
        centroid >= PHONEME_THRESHOLDS.A_MIN && flatness < FLATNESS_THRESHOLDS.A_MAX
      const isAByCentroidOnly = centroid >= PHONEME_THRESHOLDS.A_MIN + HYSTERESIS_BUFFER

      // === APPLY HYSTERESIS for stability ===

      // Stay in current phoneme if at boundary (prevents flickering)
      if (lastPhoneme === 'M') {
        // Stay in M unless clearly A or U
        if (isABySpectrum || isAByCentroidOnly) {
          lastConfirmedPhonemeRef.current = 'A'
          return 'A'
        }
        if (
          centroid >= PHONEME_THRESHOLDS.U_MIN + HYSTERESIS_BUFFER &&
          centroid < PHONEME_THRESHOLDS.A_MIN
        ) {
          lastConfirmedPhonemeRef.current = 'U'
          return 'U'
        }
        return 'M'
      }

      if (lastPhoneme === 'A') {
        // Stay in A unless clearly M or U
        if (isMBySpectrum || isMByCentroidOnly) {
          lastConfirmedPhonemeRef.current = 'M'
          return 'M'
        }
        if (
          centroid >= PHONEME_THRESHOLDS.U_MIN &&
          centroid < PHONEME_THRESHOLDS.A_MIN - HYSTERESIS_BUFFER
        ) {
          lastConfirmedPhonemeRef.current = 'U'
          return 'U'
        }
        return 'A'
      }

      if (lastPhoneme === 'U') {
        // Stay in U unless clearly A or M
        if (isABySpectrum || isAByCentroidOnly) {
          lastConfirmedPhonemeRef.current = 'A'
          return 'A'
        }
        if (isMBySpectrum || isMByCentroidOnly) {
          lastConfirmedPhonemeRef.current = 'M'
          return 'M'
        }
        return 'U'
      }

      // === NEW VOCALIZATION (coming from silence) - classify fresh ===

      // Check A first (using combined detection)
      if (isABySpectrum || isAByCentroidOnly) {
        lastConfirmedPhonemeRef.current = 'A'
        return 'A'
      }

      // Check M (using combined detection)
      if (isMBySpectrum || isMByCentroidOnly) {
        lastConfirmedPhonemeRef.current = 'M'
        return 'M'
      }

      // Check U (mid-range)
      if (centroid >= PHONEME_THRESHOLDS.U_MIN && centroid < PHONEME_THRESHOLDS.U_MAX) {
        lastConfirmedPhonemeRef.current = 'U'
        return 'U'
      }

      // Default based on centroid for edge cases
      if (centroid >= PHONEME_THRESHOLDS.A_MIN) {
        lastConfirmedPhonemeRef.current = 'A'
        return 'A'
      }
      if (centroid >= PHONEME_THRESHOLDS.U_MIN) {
        lastConfirmedPhonemeRef.current = 'U'
        return 'U'
      }

      // Very low centroid defaults to M
      lastConfirmedPhonemeRef.current = 'M'
      return 'M'
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
