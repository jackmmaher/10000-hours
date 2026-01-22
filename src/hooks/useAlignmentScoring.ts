/**
 * useAlignmentScoring - Rolling window alignment score for Aum chanting
 *
 * Calculates a forgiving, responsive alignment score based on:
 * - Pitch stability (variance within window)
 * - Time spent within tolerance band
 * - Phoneme transition smoothness
 *
 * Uses rolling window (3-5 seconds) instead of cumulative totals
 * to be forgiving and responsive to improvement.
 */

import { useRef, useCallback, useEffect } from 'react'
import type { PitchData } from './usePitchDetection'
import type { Phoneme } from './useFormantDetection'

// Minimal interface for phoneme data - only what alignment scoring needs
interface PhonemeDataMinimal {
  current: Phoneme
}

// Rolling window configuration
const WINDOW_DURATION_MS = 4000 // 4 seconds
const SAMPLE_INTERVAL_MS = 50 // Store sample every 50ms

// Scoring weights (sum to 1.0)
const WEIGHTS = {
  pitchStability: 0.5, // Highest priority - staying on pitch
  toleranceBand: 0.3, // Being within acceptable range
  phonemeFlow: 0.2, // Smooth transitions A -> U -> M
}

// Score thresholds for feedback
export const ALIGNMENT_THRESHOLDS = {
  excellent: 85,
  good: 65,
  fair: 45,
  poor: 0,
}

interface SamplePoint {
  timestamp: number
  frequency: number | null
  isWithinTolerance: boolean
  phoneme: Phoneme
  centsDeviation: number | null
}

export interface AlignmentData {
  score: number // 0-100 percentage
  pitchStabilityScore: number // 0-100
  toleranceScore: number // 0-100
  phonemeFlowScore: number // 0-100
  vocalizationRatio: number // 0-1 ratio of time vocalizing
  averageFrequency: number | null // Average pitch when vocalizing
  timestamp: number
}

export interface UseAlignmentScoringResult {
  // Get current alignment data
  getAlignmentData: () => AlignmentData
  // Record a sample (call regularly, e.g., in rAF loop)
  recordSample: (pitchData: PitchData, phonemeData: PhonemeDataMinimal) => void
  // Reset scoring
  reset: () => void
}

export function useAlignmentScoring(): UseAlignmentScoringResult {
  // Rolling window of samples
  const samplesRef = useRef<SamplePoint[]>([])
  const lastSampleTimeRef = useRef(0)

  // Alignment data (for 60fps rendering)
  const alignmentDataRef = useRef<AlignmentData>({
    score: 0,
    pitchStabilityScore: 0,
    toleranceScore: 0,
    phonemeFlowScore: 0,
    vocalizationRatio: 0,
    averageFrequency: null,
    timestamp: 0,
  })

  /**
   * Calculate pitch stability score (lower variance = better)
   */
  const calculatePitchStability = useCallback((samples: SamplePoint[]): number => {
    const pitchedSamples = samples.filter((s) => s.frequency !== null)
    if (pitchedSamples.length < 2) return 0

    // Calculate cents deviations (more stable representation than Hz)
    const deviations = pitchedSamples.map((s) => s.centsDeviation ?? 0)

    // Calculate variance in cents
    const mean = deviations.reduce((a, b) => a + b, 0) / deviations.length
    const variance =
      deviations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / deviations.length
    const stdDev = Math.sqrt(variance)

    // Map standard deviation to score
    // 0 cents stddev = 100%, 50 cents stddev = 50%, 100+ cents stddev = 0%
    const normalizedStdDev = Math.min(stdDev / 100, 1)
    return Math.round((1 - normalizedStdDev) * 100)
  }, [])

  /**
   * Calculate tolerance band score (time within tolerance)
   */
  const calculateToleranceScore = useCallback((samples: SamplePoint[]): number => {
    const pitchedSamples = samples.filter((s) => s.frequency !== null)
    if (pitchedSamples.length === 0) return 0

    const withinTolerance = pitchedSamples.filter((s) => s.isWithinTolerance).length
    return Math.round((withinTolerance / pitchedSamples.length) * 100)
  }, [])

  /**
   * Calculate phoneme flow score (smooth A -> U -> M progression)
   */
  const calculatePhonemeFlow = useCallback((samples: SamplePoint[]): number => {
    if (samples.length < 2) return 0

    // Count valid transitions and invalid transitions
    let validTransitions = 0
    let totalTransitions = 0

    // Valid transitions: silence->A, A->U, U->M, M->silence, same->same
    const validPairs: Record<Phoneme, Phoneme[]> = {
      silence: ['silence', 'A'],
      A: ['A', 'U'],
      U: ['U', 'M'],
      M: ['M', 'silence'],
    }

    for (let i = 1; i < samples.length; i++) {
      const prev = samples[i - 1].phoneme
      const curr = samples[i].phoneme

      if (prev !== curr) {
        totalTransitions++
        if (validPairs[prev]?.includes(curr)) {
          validTransitions++
        }
      }
    }

    if (totalTransitions === 0) return 100 // No transitions = holding steady = good
    return Math.round((validTransitions / totalTransitions) * 100)
  }, [])

  /**
   * Get current alignment data
   */
  const getAlignmentData = useCallback((): AlignmentData => {
    return alignmentDataRef.current
  }, [])

  /**
   * Record a sample and update alignment score
   */
  const recordSample = useCallback(
    (pitchData: PitchData, phonemeData: PhonemeDataMinimal): void => {
      const now = performance.now()

      // Rate limit sampling
      if (now - lastSampleTimeRef.current < SAMPLE_INTERVAL_MS) {
        return
      }
      lastSampleTimeRef.current = now

      // Create sample point
      const sample: SamplePoint = {
        timestamp: now,
        frequency: pitchData.frequency,
        isWithinTolerance: pitchData.isWithinTolerance,
        phoneme: phonemeData.current,
        centsDeviation: pitchData.cents,
      }

      // Add to rolling window
      samplesRef.current.push(sample)

      // Remove samples outside window
      const cutoff = now - WINDOW_DURATION_MS
      samplesRef.current = samplesRef.current.filter((s) => s.timestamp >= cutoff)

      const samples = samplesRef.current

      // Calculate component scores
      const pitchStabilityScore = calculatePitchStability(samples)
      const toleranceScore = calculateToleranceScore(samples)
      const phonemeFlowScore = calculatePhonemeFlow(samples)

      // Calculate weighted total
      const score = Math.round(
        pitchStabilityScore * WEIGHTS.pitchStability +
          toleranceScore * WEIGHTS.toleranceBand +
          phonemeFlowScore * WEIGHTS.phonemeFlow
      )

      // Calculate vocalization ratio
      const vocalizedSamples = samples.filter((s) => s.frequency !== null)
      const vocalizationRatio = samples.length > 0 ? vocalizedSamples.length / samples.length : 0

      // Calculate average frequency
      let averageFrequency: number | null = null
      if (vocalizedSamples.length > 0) {
        const sum = vocalizedSamples.reduce((acc, s) => acc + (s.frequency ?? 0), 0)
        averageFrequency = sum / vocalizedSamples.length
      }

      alignmentDataRef.current = {
        score,
        pitchStabilityScore,
        toleranceScore,
        phonemeFlowScore,
        vocalizationRatio,
        averageFrequency,
        timestamp: now,
      }
    },
    [calculatePitchStability, calculateToleranceScore, calculatePhonemeFlow]
  )

  /**
   * Reset scoring
   */
  const reset = useCallback((): void => {
    samplesRef.current = []
    lastSampleTimeRef.current = 0
    alignmentDataRef.current = {
      score: 0,
      pitchStabilityScore: 0,
      toleranceScore: 0,
      phonemeFlowScore: 0,
      vocalizationRatio: 0,
      averageFrequency: null,
      timestamp: 0,
    }
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  return {
    getAlignmentData,
    recordSample,
    reset,
  }
}

/**
 * Get feedback text based on alignment score
 */
export function getAlignmentFeedback(score: number): {
  label: string
  color: 'success' | 'warning' | 'muted'
} {
  if (score >= ALIGNMENT_THRESHOLDS.excellent) {
    return { label: 'Excellent', color: 'success' }
  }
  if (score >= ALIGNMENT_THRESHOLDS.good) {
    return { label: 'Good', color: 'success' }
  }
  if (score >= ALIGNMENT_THRESHOLDS.fair) {
    return { label: 'Building', color: 'warning' }
  }
  return { label: 'Finding pitch...', color: 'muted' }
}
