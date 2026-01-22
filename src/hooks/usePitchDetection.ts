/**
 * usePitchDetection - Real-time pitch detection using McLeod Pitch Method
 *
 * Uses the pitchy library for accurate pitch detection.
 * All data stored in refs for 60fps Canvas rendering - NOT React state.
 *
 * Scientific note: ~130 Hz is optimal for nasal nitric oxide production
 * (peer-reviewed evidence supports 15-20x increase during humming at this frequency)
 */

import { useRef, useCallback, useEffect } from 'react'
import { PitchDetector } from 'pitchy'

// Target pitch for optimal nitric oxide production
export const OPTIMAL_NO_FREQUENCY = 130 // Hz

// Default tolerance in cents (generous for beginners)
export const DEFAULT_TOLERANCE_CENTS = 50

// Minimum clarity threshold for valid pitch detection
const MIN_CLARITY_THRESHOLD = 0.9

// Hysteresis for stable transitions (prevents flickering)
const CLARITY_HYSTERESIS = 0.05 // Once detected, allow slightly lower clarity
const HOLD_DURATION_MS = 150 // Hold last valid value briefly when signal drops

// Typical chanting range (for visualization scaling)
export const PITCH_RANGE = {
  min: 80, // Hz - low male voice
  max: 350, // Hz - higher female voice
}

export interface PitchData {
  frequency: number | null // Hz, null if below threshold or no signal
  clarity: number // 0-1 confidence
  cents: number | null // Deviation from target in cents (null if no target or no pitch)
  isWithinTolerance: boolean // True if within target tolerance
  timestamp: number // Performance.now() timestamp
}

export interface UsePitchDetectionOptions {
  targetFrequency?: number // Target pitch in Hz (default: 130)
  toleranceCents?: number // Tolerance in cents (default: 50)
  clarityThreshold?: number // Min clarity to accept (default: 0.9)
}

export interface UsePitchDetectionResult {
  // Current pitch data (read from ref for 60fps performance)
  getPitchData: () => PitchData
  // Set a new target frequency
  setTargetFrequency: (freq: number) => void
  // Analyze a single frame (call this in rAF loop)
  analyze: (audioData: Float32Array, sampleRate: number) => PitchData
  // Reset detector state
  reset: () => void
}

/**
 * Convert frequency ratio to cents
 * Cents = 1200 * log2(f2/f1)
 */
export function frequencyToCents(frequency: number, reference: number): number {
  if (frequency <= 0 || reference <= 0) return 0
  return 1200 * Math.log2(frequency / reference)
}

/**
 * Convert cents to frequency ratio
 */
export function centsToFrequencyRatio(cents: number): number {
  return Math.pow(2, cents / 1200)
}

export function usePitchDetection(options: UsePitchDetectionOptions = {}): UsePitchDetectionResult {
  const {
    targetFrequency: initialTarget = OPTIMAL_NO_FREQUENCY,
    toleranceCents = DEFAULT_TOLERANCE_CENTS,
    clarityThreshold = MIN_CLARITY_THRESHOLD,
  } = options

  // All mutable state in refs for performance
  const detectorRef = useRef<PitchDetector<Float32Array> | null>(null)
  const targetFrequencyRef = useRef(initialTarget)
  const pitchDataRef = useRef<PitchData>({
    frequency: null,
    clarity: 0,
    cents: null,
    isWithinTolerance: false,
    timestamp: 0,
  })

  // Hysteresis state for stable transitions
  const wasDetectingRef = useRef(false)
  const lastValidDataRef = useRef<PitchData | null>(null)
  const lastValidTimestampRef = useRef(0)

  /**
   * Get current pitch data (for use in render loops)
   */
  const getPitchData = useCallback((): PitchData => {
    return pitchDataRef.current
  }, [])

  /**
   * Update target frequency
   */
  const setTargetFrequency = useCallback((freq: number): void => {
    targetFrequencyRef.current = freq
  }, [])

  /**
   * Analyze a single frame of audio data
   * Call this in your requestAnimationFrame loop
   */
  const analyze = useCallback(
    (audioData: Float32Array, sampleRate: number): PitchData => {
      // Lazy-init detector with correct buffer size
      if (!detectorRef.current || detectorRef.current.inputLength !== audioData.length) {
        detectorRef.current = PitchDetector.forFloat32Array(audioData.length)
      }

      const detector = detectorRef.current
      const [frequency, clarity] = detector.findPitch(audioData, sampleRate)

      const target = targetFrequencyRef.current
      const now = performance.now()

      // Apply hysteresis: use lower threshold if we were already detecting
      const effectiveThreshold = wasDetectingRef.current
        ? clarityThreshold - CLARITY_HYSTERESIS
        : clarityThreshold

      // Check if detection is valid
      const isValid = clarity >= effectiveThreshold && frequency > 0

      if (!isValid) {
        wasDetectingRef.current = false

        // Hold the last valid value briefly to prevent flickering
        if (lastValidDataRef.current && now - lastValidTimestampRef.current < HOLD_DURATION_MS) {
          // Return the held data with updated timestamp
          pitchDataRef.current = {
            ...lastValidDataRef.current,
            timestamp: now,
          }
          return pitchDataRef.current
        }

        pitchDataRef.current = {
          frequency: null,
          clarity,
          cents: null,
          isWithinTolerance: false,
          timestamp: now,
        }
        lastValidDataRef.current = null
        return pitchDataRef.current
      }

      // Calculate cents deviation from target
      const cents = frequencyToCents(frequency, target)
      const isWithinTolerance = Math.abs(cents) <= toleranceCents

      const newData: PitchData = {
        frequency,
        clarity,
        cents,
        isWithinTolerance,
        timestamp: now,
      }

      // Update hysteresis state
      wasDetectingRef.current = true
      lastValidDataRef.current = newData
      lastValidTimestampRef.current = now
      pitchDataRef.current = newData

      return pitchDataRef.current
    },
    [clarityThreshold, toleranceCents]
  )

  /**
   * Reset detector state
   */
  const reset = useCallback((): void => {
    detectorRef.current = null
    pitchDataRef.current = {
      frequency: null,
      clarity: 0,
      cents: null,
      isWithinTolerance: false,
      timestamp: 0,
    }
    // Reset hysteresis state
    wasDetectingRef.current = false
    lastValidDataRef.current = null
    lastValidTimestampRef.current = 0
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  return {
    getPitchData,
    setTargetFrequency,
    analyze,
    reset,
  }
}

/**
 * Get a human-readable note name from frequency
 * Useful for debugging and optional UI display
 */
export function frequencyToNote(frequency: number): string {
  if (frequency <= 0) return '--'

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const a4 = 440
  const semitones = 12 * Math.log2(frequency / a4)
  const noteIndex = Math.round(semitones) + 69 // MIDI note number
  const octave = Math.floor(noteIndex / 12) - 1
  const note = noteNames[noteIndex % 12]

  return `${note}${octave}`
}
