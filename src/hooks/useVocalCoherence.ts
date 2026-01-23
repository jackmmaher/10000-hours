/**
 * useVocalCoherence - Measures vocal stability, smoothness, and continuity
 *
 * Replaces Hz-targeting with pitch-invariant coherence scoring.
 * Uses user's session median frequency as reference (not 130 Hz target).
 *
 * Formula:
 * VocalCoherence = (0.50 × PitchStability) + (0.30 × AmplitudeSmoothness) + (0.20 × VoicingContinuity)
 *
 * Components:
 * - Pitch Stability (50%): Low variance in f0 over 400ms window
 * - Amplitude Smoothness (30%): Even RMS loudness
 * - Voicing Continuity (20%): % of frames with sound present
 */

import { useRef, useCallback } from 'react'

// Rolling window size (~400ms at 60fps)
const WINDOW_SIZE = 24

// Minimum voiced samples before calculating (reduced from 3 for faster response)
const MIN_VOICED_SAMPLES = 2

// Weights for coherence calculation
const PITCH_STABILITY_WEIGHT = 0.5
const AMPLITUDE_SMOOTHNESS_WEIGHT = 0.3
const VOICING_CONTINUITY_WEIGHT = 0.2

// Score decay rate when transitioning (prevents jarring drops)
const SCORE_DECAY_RATE = 0.92 // Smooth decay to prevent sudden drops

export interface CoherenceData {
  score: number // 0-100 overall
  pitchStabilityScore: number // 0-100
  amplitudeSmoothnessScore: number // 0-100
  voicingContinuityScore: number // 0-100
  sessionMedianFrequency: number | null
}

export interface UseVocalCoherenceReturn {
  getCoherenceData: () => CoherenceData
  recordSample: (frequency: number | null, rms: number) => void
  reset: () => void
}

/**
 * Convert frequency to cents relative to a reference frequency
 */
function frequencyToCents(frequency: number, reference: number): number {
  if (reference <= 0 || frequency <= 0) return 0
  return 1200 * Math.log2(frequency / reference)
}

/**
 * Calculate standard deviation of an array
 */
function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2))
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length)
}

/**
 * Calculate median of an array
 */
function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * Calculate pitch stability score from cents standard deviation
 * 0 cents stddev = 100%, 50 cents = 50%, 100+ cents = 0%
 */
function calculatePitchStabilityScore(centsStdDev: number): number {
  if (centsStdDev <= 0) return 100
  if (centsStdDev >= 100) return 0
  // Linear interpolation: 0->100%, 100->0%
  return Math.max(0, Math.round(100 - centsStdDev))
}

/**
 * Calculate amplitude smoothness score from coefficient of variation
 * CV < 0.1 = 100%, CV = 0.5 = 50%, CV >= 1.0 = 0%
 */
function calculateAmplitudeSmoothnessScore(cv: number): number {
  if (cv <= 0.1) return 100
  if (cv >= 1.0) return 0
  // Linear interpolation between 0.1 (100%) and 1.0 (0%)
  return Math.max(0, Math.round(100 - ((cv - 0.1) / 0.9) * 100))
}

/**
 * Calculate voicing continuity score from voiced frame percentage
 */
function calculateVoicingContinuityScore(voicedRatio: number): number {
  return Math.round(voicedRatio * 100)
}

export function useVocalCoherence(): UseVocalCoherenceReturn {
  // Rolling window of samples
  const frequencyWindowRef = useRef<(number | null)[]>([])
  const rmsWindowRef = useRef<number[]>([])

  // Session-wide frequency tracking for median calculation
  const sessionFrequenciesRef = useRef<number[]>([])
  const sessionMedianRef = useRef<number | null>(null)

  // Current coherence data
  const coherenceDataRef = useRef<CoherenceData>({
    score: 0,
    pitchStabilityScore: 0,
    amplitudeSmoothnessScore: 0,
    voicingContinuityScore: 0,
    sessionMedianFrequency: null,
  })

  // Previous score for smooth transitions
  const previousScoreRef = useRef<number>(0)

  /**
   * Record a sample (called from audio processing loop)
   */
  const recordSample = useCallback((frequency: number | null, rms: number) => {
    // Add to rolling windows
    frequencyWindowRef.current.push(frequency)
    rmsWindowRef.current.push(rms)

    // Trim windows to size
    if (frequencyWindowRef.current.length > WINDOW_SIZE) {
      frequencyWindowRef.current.shift()
    }
    if (rmsWindowRef.current.length > WINDOW_SIZE) {
      rmsWindowRef.current.shift()
    }

    // Track session frequencies for median (only voiced frames)
    if (frequency !== null && frequency > 0) {
      sessionFrequenciesRef.current.push(frequency)

      // Update session median periodically (every 50 samples to reduce computation)
      if (sessionFrequenciesRef.current.length % 50 === 0) {
        sessionMedianRef.current = median(sessionFrequenciesRef.current)
      }
    }

    // Calculate coherence scores
    const freqWindow = frequencyWindowRef.current
    const rmsWindow = rmsWindowRef.current

    // Get voiced frequencies in window
    const voicedFrequencies = freqWindow.filter((f): f is number => f !== null && f > 0)
    const voicedCount = voicedFrequencies.length
    const totalCount = freqWindow.length

    // Voicing Continuity: ratio of voiced frames
    const voicedRatio = totalCount > 0 ? voicedCount / totalCount : 0
    const voicingContinuityScore = calculateVoicingContinuityScore(voicedRatio)

    // Use session median as reference, or window median if session median not yet established
    const reference =
      sessionMedianRef.current ?? (voicedFrequencies.length > 0 ? median(voicedFrequencies) : null)

    // Pitch Stability: standard deviation in cents from reference
    let pitchStabilityScore = 0
    if (reference !== null && voicedFrequencies.length >= MIN_VOICED_SAMPLES) {
      const centsValues = voicedFrequencies.map((f) => frequencyToCents(f, reference))
      const centsStdDev = standardDeviation(centsValues)
      pitchStabilityScore = calculatePitchStabilityScore(centsStdDev)
    }

    // Amplitude Smoothness: coefficient of variation of RMS
    let amplitudeSmoothnessScore = 0
    const voicedRmsValues = rmsWindow.filter((r, i) => {
      const freq = freqWindow[i]
      return freq !== null && freq > 0 && r > 0.01 // Only voiced frames with meaningful RMS
    })

    if (voicedRmsValues.length >= MIN_VOICED_SAMPLES) {
      const mean = voicedRmsValues.reduce((a, b) => a + b, 0) / voicedRmsValues.length
      const stdDev = standardDeviation(voicedRmsValues)
      const cv = mean > 0 ? stdDev / mean : 0
      amplitudeSmoothnessScore = calculateAmplitudeSmoothnessScore(cv)
    }

    // Overall coherence score (weighted average)
    let score = 0
    if (voicedCount >= MIN_VOICED_SAMPLES) {
      // Calculate fresh score
      score = Math.round(
        pitchStabilityScore * PITCH_STABILITY_WEIGHT +
          amplitudeSmoothnessScore * AMPLITUDE_SMOOTHNESS_WEIGHT +
          voicingContinuityScore * VOICING_CONTINUITY_WEIGHT
      )
    } else if (previousScoreRef.current > 0) {
      // Not enough samples yet - smooth decay from previous score
      // This prevents jarring drops during phase transitions
      score = Math.round(previousScoreRef.current * SCORE_DECAY_RATE)
    }

    // Update previous score for next frame
    previousScoreRef.current = score

    // Update coherence data ref
    coherenceDataRef.current = {
      score,
      pitchStabilityScore,
      amplitudeSmoothnessScore,
      voicingContinuityScore,
      sessionMedianFrequency: sessionMedianRef.current,
    }
  }, [])

  /**
   * Get current coherence data
   */
  const getCoherenceData = useCallback((): CoherenceData => {
    return coherenceDataRef.current
  }, [])

  /**
   * Reset all tracking (call when starting new session)
   */
  const reset = useCallback(() => {
    frequencyWindowRef.current = []
    rmsWindowRef.current = []
    sessionFrequenciesRef.current = []
    sessionMedianRef.current = null
    previousScoreRef.current = 0
    coherenceDataRef.current = {
      score: 0,
      pitchStabilityScore: 0,
      amplitudeSmoothnessScore: 0,
      voicingContinuityScore: 0,
      sessionMedianFrequency: null,
    }
  }, [])

  return {
    getCoherenceData,
    recordSample,
    reset,
  }
}
