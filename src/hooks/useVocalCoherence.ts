/**
 * useVocalCoherence - Adaptive vocal stability measurement
 *
 * Enhanced with:
 * - Calibration-aware thresholds (uses YOUR voice profile)
 * - Phase-transition awareness (smooth transitions, no penalty)
 * - Historical baseline support (adapts to your skill level)
 *
 * Formula:
 * VocalCoherence = (0.50 × PitchStability) + (0.30 × AmplitudeSmoothness) + (0.20 × VoicingContinuity)
 *
 * Components:
 * - Pitch Stability (50%): Low variance in f0, adjusted to YOUR typical variance
 * - Amplitude Smoothness (30%): Even RMS loudness, adjusted to YOUR range
 * - Voicing Continuity (20%): % of frames with sound present (resets at phase transitions)
 */

import { useRef, useCallback } from 'react'
import type { CalibrationProfile } from './useFormantDetection'
import type { CyclePhase } from './useGuidedOmCycle'

// Rolling window size - 8 samples at ~20fps = ~400ms
// (Corrected from previous 24 which was actually 1.2s)
const WINDOW_SIZE = 8

// Minimum voiced samples before calculating
const MIN_VOICED_SAMPLES = 2

// Weights for coherence calculation
const PITCH_STABILITY_WEIGHT = 0.5
const AMPLITUDE_SMOOTHNESS_WEIGHT = 0.3
const VOICING_CONTINUITY_WEIGHT = 0.2

// Default thresholds (used when no calibration/history available)
const DEFAULT_NOISE_FLOOR = 0.003
const DEFAULT_PITCH_VARIANCE_CENTS = 50 // cents stddev for 50% score
const DEFAULT_AMPLITUDE_CV = 0.5 // CV for 50% score

// Phase transition grace period (ms) - don't penalize during this window
const PHASE_TRANSITION_GRACE_MS = 500

export interface CoherenceData {
  score: number // 0-100 overall
  pitchStabilityScore: number // 0-100
  amplitudeSmoothnessScore: number // 0-100
  voicingContinuityScore: number // 0-100
  sessionMedianFrequency: number | null
  // New: raw values for history storage
  rawPitchVarianceCents: number
  rawAmplitudeCV: number
}

export interface AdaptiveBaseline {
  // From calibration
  noiseFloor: number
  expectedPitchVariance: number // cents - user's typical pitch wobble
  expectedAmplitudeCV: number // user's typical volume variation
  // From session history (optional)
  historicalAvgCoherence?: number
  historicalPitchStability?: number
  historicalAmplitudeSmoothness?: number
  sessionCount?: number
}

export interface UseVocalCoherenceOptions {
  calibration?: CalibrationProfile | null
  adaptiveBaseline?: AdaptiveBaseline | null
}

export interface UseVocalCoherenceReturn {
  getCoherenceData: () => CoherenceData
  recordSample: (frequency: number | null, rms: number) => void
  notifyPhaseTransition: (newPhase: CyclePhase) => void
  reset: () => void
  // New: get current adaptive thresholds (for debugging/display)
  getThresholds: () => {
    noiseFloor: number
    pitchVarianceFor50: number
    amplitudeCVFor50: number
  }
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
 * Calculate pitch stability score - ADAPTIVE
 * Uses user's expected variance as the 50% point
 */
function calculatePitchStabilityScore(centsStdDev: number, expectedVariance: number): number {
  if (centsStdDev <= 0) return 100

  // Scale so that expectedVariance = 50% score
  // 0 = 100%, expectedVariance = 50%, 2x expectedVariance = 0%
  const maxVariance = expectedVariance * 2
  if (centsStdDev >= maxVariance) return 0

  return Math.max(0, Math.round(100 - (centsStdDev / maxVariance) * 100))
}

/**
 * Calculate amplitude smoothness score - ADAPTIVE
 * Uses user's expected CV as the 50% point
 */
function calculateAmplitudeSmoothnessScore(cv: number, expectedCV: number): number {
  if (cv <= 0) return 100

  // Scale so that expectedCV = 50% score
  // 0 = 100%, expectedCV = 50%, 2x expectedCV = 0%
  const maxCV = expectedCV * 2
  if (cv >= maxCV) return 0

  return Math.max(0, Math.round(100 - (cv / maxCV) * 100))
}

/**
 * Calculate voicing continuity score
 */
function calculateVoicingContinuityScore(voicedRatio: number): number {
  return Math.round(voicedRatio * 100)
}

export function useVocalCoherence(options: UseVocalCoherenceOptions = {}): UseVocalCoherenceReturn {
  const { calibration, adaptiveBaseline } = options

  // Calculate personalized thresholds
  const thresholdsRef = useRef({
    noiseFloor: DEFAULT_NOISE_FLOOR,
    pitchVarianceFor50: DEFAULT_PITCH_VARIANCE_CENTS,
    amplitudeCVFor50: DEFAULT_AMPLITUDE_CV,
  })

  // Update thresholds when calibration/baseline changes
  if (calibration || adaptiveBaseline) {
    // Noise floor: prefer calibration, fallback to default
    const noiseFloor = calibration?.noiseFloor
      ? calibration.noiseFloor * 2.5 // 2.5x noise floor for voice detection
      : (adaptiveBaseline?.noiseFloor ?? DEFAULT_NOISE_FLOOR)

    // Pitch variance: use historical if available, else estimate from MFCC, else default
    let pitchVarianceFor50 = DEFAULT_PITCH_VARIANCE_CENTS
    if (adaptiveBaseline?.expectedPitchVariance) {
      pitchVarianceFor50 = adaptiveBaseline.expectedPitchVariance
    } else if (calibration?.ahMfcc?.variance) {
      // Estimate from MFCC variance (rough approximation)
      const mfccVariance = calibration.ahMfcc.variance[0] ?? 1
      pitchVarianceFor50 = Math.max(30, Math.min(80, Math.sqrt(mfccVariance) * 20))
    }

    // Amplitude CV: use historical if available, else default
    const amplitudeCVFor50 = adaptiveBaseline?.expectedAmplitudeCV ?? DEFAULT_AMPLITUDE_CV

    thresholdsRef.current = {
      noiseFloor,
      pitchVarianceFor50,
      amplitudeCVFor50,
    }
  }

  // Rolling window of samples
  const frequencyWindowRef = useRef<(number | null)[]>([])
  const rmsWindowRef = useRef<number[]>([])

  // Session-wide frequency tracking for median calculation
  const sessionFrequenciesRef = useRef<number[]>([])
  const sessionMedianRef = useRef<number | null>(null)

  // Phase transition tracking
  const lastPhaseTransitionRef = useRef<number>(0)
  const currentPhaseRef = useRef<CyclePhase>('breathe')

  // Current coherence data
  const coherenceDataRef = useRef<CoherenceData>({
    score: 0,
    pitchStabilityScore: 0,
    amplitudeSmoothnessScore: 0,
    voicingContinuityScore: 0,
    sessionMedianFrequency: null,
    rawPitchVarianceCents: 0,
    rawAmplitudeCV: 0,
  })

  // Previous score for smooth transitions (but less aggressive than before)
  const previousScoreRef = useRef<number>(0)

  /**
   * Notify of phase transition - clears window for fair scoring
   */
  const notifyPhaseTransition = useCallback((newPhase: CyclePhase) => {
    const now = performance.now()
    lastPhaseTransitionRef.current = now
    currentPhaseRef.current = newPhase

    // Clear the rolling window on phase transition
    // This prevents silence from breathe phase penalizing the start of Ah
    if (newPhase !== 'breathe') {
      frequencyWindowRef.current = []
      rmsWindowRef.current = []
    }

    // Set score to neutral 50% at start of vocal phases
    if (newPhase === 'ah' || newPhase === 'oo' || newPhase === 'mm') {
      previousScoreRef.current = 50
      coherenceDataRef.current = {
        ...coherenceDataRef.current,
        score: 50,
        pitchStabilityScore: 50,
        amplitudeSmoothnessScore: 50,
        voicingContinuityScore: 50,
      }
    }
  }, [])

  /**
   * Record a sample (called from audio processing loop)
   */
  const recordSample = useCallback((frequency: number | null, rms: number) => {
    const thresholds = thresholdsRef.current
    const now = performance.now()

    // Check if we're in grace period after phase transition
    const timeSinceTransition = now - lastPhaseTransitionRef.current
    const inGracePeriod = timeSinceTransition < PHASE_TRANSITION_GRACE_MS
    const isVocalPhase = currentPhaseRef.current !== 'breathe'

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

      // Update session median periodically
      if (sessionFrequenciesRef.current.length % 30 === 0) {
        sessionMedianRef.current = median(sessionFrequenciesRef.current)
      }
    }

    // During breathe phase, just track but don't score
    if (!isVocalPhase) {
      coherenceDataRef.current = {
        ...coherenceDataRef.current,
        score: 0,
        pitchStabilityScore: 0,
        amplitudeSmoothnessScore: 0,
        voicingContinuityScore: 0,
      }
      return
    }

    // Calculate coherence scores
    const freqWindow = frequencyWindowRef.current
    const rmsWindow = rmsWindowRef.current

    // Get voiced frequencies in window (using personalized threshold)
    const voicedFrequencies = freqWindow.filter((f): f is number => f !== null && f > 0)
    const voicedCount = voicedFrequencies.length
    const totalCount = freqWindow.length

    // Voicing Continuity: ratio of voiced frames
    // During grace period, be generous
    let voicedRatio = totalCount > 0 ? voicedCount / totalCount : 0
    if (inGracePeriod && voicedRatio < 0.5) {
      voicedRatio = Math.max(voicedRatio, 0.5) // Floor at 50% during grace
    }
    const voicingContinuityScore = calculateVoicingContinuityScore(voicedRatio)

    // Use session median as reference, or window median if not yet established
    const reference =
      sessionMedianRef.current ?? (voicedFrequencies.length > 0 ? median(voicedFrequencies) : null)

    // Pitch Stability: standard deviation in cents from reference
    let pitchStabilityScore = inGracePeriod ? 50 : 0
    let rawPitchVarianceCents = 0
    if (reference !== null && voicedFrequencies.length >= MIN_VOICED_SAMPLES) {
      const centsValues = voicedFrequencies.map((f) => frequencyToCents(f, reference))
      const centsStdDev = standardDeviation(centsValues)
      rawPitchVarianceCents = centsStdDev
      pitchStabilityScore = calculatePitchStabilityScore(centsStdDev, thresholds.pitchVarianceFor50)
    }

    // Amplitude Smoothness: coefficient of variation of RMS
    let amplitudeSmoothnessScore = inGracePeriod ? 50 : 0
    let rawAmplitudeCV = 0
    const voicedRmsValues = rmsWindow.filter((r, i) => {
      const freq = freqWindow[i]
      return freq !== null && freq > 0 && r > thresholds.noiseFloor
    })

    if (voicedRmsValues.length >= MIN_VOICED_SAMPLES) {
      const mean = voicedRmsValues.reduce((a, b) => a + b, 0) / voicedRmsValues.length
      const stdDev = standardDeviation(voicedRmsValues)
      const cv = mean > 0 ? stdDev / mean : 0
      rawAmplitudeCV = cv
      amplitudeSmoothnessScore = calculateAmplitudeSmoothnessScore(cv, thresholds.amplitudeCVFor50)
    }

    // Overall coherence score (weighted average)
    let score = 0
    if (voicedCount >= MIN_VOICED_SAMPLES || inGracePeriod) {
      score = Math.round(
        pitchStabilityScore * PITCH_STABILITY_WEIGHT +
          amplitudeSmoothnessScore * AMPLITUDE_SMOOTHNESS_WEIGHT +
          voicingContinuityScore * VOICING_CONTINUITY_WEIGHT
      )
    }

    // Gentle smoothing (less aggressive than before)
    // Blend 70% new score, 30% previous to reduce jitter
    const smoothedScore = Math.round(score * 0.7 + previousScoreRef.current * 0.3)
    previousScoreRef.current = smoothedScore

    // Update coherence data ref
    coherenceDataRef.current = {
      score: smoothedScore,
      pitchStabilityScore,
      amplitudeSmoothnessScore,
      voicingContinuityScore,
      sessionMedianFrequency: sessionMedianRef.current,
      rawPitchVarianceCents,
      rawAmplitudeCV,
    }
  }, [])

  /**
   * Get current coherence data
   */
  const getCoherenceData = useCallback((): CoherenceData => {
    return coherenceDataRef.current
  }, [])

  /**
   * Get current thresholds (for debugging/display)
   */
  const getThresholds = useCallback(() => {
    return thresholdsRef.current
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
    lastPhaseTransitionRef.current = 0
    currentPhaseRef.current = 'breathe'
    coherenceDataRef.current = {
      score: 0,
      pitchStabilityScore: 0,
      amplitudeSmoothnessScore: 0,
      voicingContinuityScore: 0,
      sessionMedianFrequency: null,
      rawPitchVarianceCents: 0,
      rawAmplitudeCV: 0,
    }
  }, [])

  return {
    getCoherenceData,
    recordSample,
    notifyPhaseTransition,
    reset,
    getThresholds,
  }
}
