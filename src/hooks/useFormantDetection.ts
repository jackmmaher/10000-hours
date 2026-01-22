/**
 * useFormantDetection - Formant-based A/U/M phoneme classification
 *
 * Mobile-optimized with hybrid classification approach:
 * 1. Primary: Band energy ratios (fast, speaker-independent)
 * 2. Confirmation: MFCC features (more accurate, personalized)
 * 3. Stability: MedianFilterBuffer for phoneme smoothing
 *
 * | Vowel | F1 Range    | F2 Range      | Detection Strategy              |
 * |-------|-------------|---------------|--------------------------------|
 * | Ah    | 700-800 Hz  | 1100-1200 Hz  | High energy in upper bands      |
 * | Oo    | 300-450 Hz  | 800-900 Hz    | Energy concentrated in lower    |
 * | Mm    | ~250 Hz     | Very low      | High spectral flatness (nasal)  |
 *
 * Scientific foundation:
 * - "Ah" opens chest/solar plexus, triggers relaxation
 * - "Oo" stimulates vagus nerve (runs next to vocal cords)
 * - "Mm" produces 15x nitric oxide, amygdala deactivation
 */

import { useRef, useCallback, useEffect } from 'react'
import Meyda from 'meyda'
import { MedianFilterBuffer } from '../utils/audioProcessing'

export type Phoneme = 'silence' | 'A' | 'U' | 'M'

export interface MfccBaseline {
  mean: number[]
  variance: number[]
}

export interface CalibrationProfile {
  id: string
  createdAt: number
  ahRatio: number // Upper/lower energy ratio for Ah
  ooRatio: number // Upper/lower energy ratio for Oo
  mmFlatness: number // Baseline flatness for Mm
  noiseFloor: number // Background noise level
  // MFCC baselines (optional - for enhanced detection)
  ahMfcc?: MfccBaseline
  ooMfcc?: MfccBaseline
  mmMfcc?: MfccBaseline
}

export interface FormantData {
  lowBandEnergy: number // 250-500 Hz (F1 for Oo/Mm)
  midBandEnergy: number // 500-900 Hz (F1 for Ah, F2 for Oo)
  highBandEnergy: number // 900-1400 Hz (F2 for Ah)
  spectralFlatness: number // From Meyda
  upperLowerRatio: number // Formant ratio for classification
  detectedPhoneme: Phoneme
  confidence: number // 0-1
  rms: number
  timestamp: number
  // MFCC data (for debugging/calibration)
  mfcc?: number[]
}

export interface UseFormantDetectionOptions {
  useMedianFilter?: boolean // Enable phoneme smoothing (default: true)
  useMfcc?: boolean // Enable MFCC hybrid classification (default: true)
}

export interface UseFormantDetectionResult {
  getFormantData: () => FormantData
  analyze: (audioData: Float32Array, sampleRate: number) => FormantData
  setCalibration: (profile: CalibrationProfile | null) => void
  getCalibration: () => CalibrationProfile | null
  reset: () => void
}

// Frequency band definitions (Hz)
const BANDS = {
  low: { min: 250, max: 500 }, // F1 for Oo/Mm
  mid: { min: 500, max: 900 }, // F1 for Ah, F2 for Oo
  high: { min: 900, max: 1400 }, // F2 for Ah
}

// Default thresholds (population average, used when no calibration)
const DEFAULT_THRESHOLDS = {
  mmFlatnessMin: 0.25, // M has high flatness (nasal resonance)
  ahRatioMin: 1.3, // Ah has more energy in upper bands
  ooRatioMax: 1.2, // Oo has energy in lower bands
}

// RMS threshold for silence detection
const SILENCE_THRESHOLD = 0.005

// Buffer size for Meyda
const BUFFER_SIZE = 2048

// Confidence threshold for phoneme acceptance
const CONFIDENCE_THRESHOLD = 0.3

/**
 * Calculate Euclidean distance between two MFCC vectors
 */
function mfccDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i]
    sum += diff * diff
  }
  return Math.sqrt(sum)
}

/**
 * Calculate MFCC confidence based on distance from baseline
 * Returns 0-1 confidence score
 */
function mfccConfidence(mfcc: number[], baseline: MfccBaseline): number {
  const distance = mfccDistance(mfcc, baseline.mean)
  // Normalize by expected variance
  const avgVariance = baseline.variance.reduce((a, b) => a + b, 0) / baseline.variance.length
  const normalizedDistance = distance / Math.sqrt(avgVariance * mfcc.length + 0.001)
  // Convert to confidence (closer = higher confidence)
  return Math.max(0, 1 - normalizedDistance / 10)
}

/**
 * Classify phoneme using frequency band energy ratios
 * With optional MFCC confirmation for hybrid classification
 */
function classifyPhoneme(
  lowEnergy: number,
  midEnergy: number,
  highEnergy: number,
  flatness: number,
  calibration: CalibrationProfile | null,
  mfcc: number[] | null,
  classifyDebugCounter: number
): { phoneme: Phoneme; confidence: number } {
  // Calculate upper/lower ratio early for logging
  const upperEnergy = midEnergy + highEnergy
  const lowerEnergy = lowEnergy + 0.001 // Avoid division by zero
  const upperLowerRatio = upperEnergy / lowerEnergy

  // Mm detection: high flatness (nasal resonance creates broader spectrum)
  const mmFlatnessThreshold = calibration?.mmFlatness
    ? calibration.mmFlatness * 0.8 // Use 80% of calibrated value for easier M detection
    : DEFAULT_THRESHOLDS.mmFlatnessMin * 0.8

  if (flatness > mmFlatnessThreshold) {
    let confidence = Math.min(1, flatness / (mmFlatnessThreshold * 1.5))

    // MFCC confirmation if available
    if (mfcc && calibration?.mmMfcc) {
      const mfccConf = mfccConfidence(mfcc, calibration.mmMfcc)
      confidence = confidence * 0.6 + mfccConf * 0.4 // Weighted combination
    }

    return { phoneme: 'M', confidence }
  }

  if (calibration) {
    // Determine which phoneme has the higher ratio (don't assume ahRatio > ooRatio)
    const ahIsHigher = calibration.ahRatio > calibration.ooRatio
    const highRatio = ahIsHigher ? calibration.ahRatio : calibration.ooRatio
    const lowRatio = ahIsHigher ? calibration.ooRatio : calibration.ahRatio
    const highPhoneme: Phoneme = ahIsHigher ? 'A' : 'U'
    const lowPhoneme: Phoneme = ahIsHigher ? 'U' : 'A'

    // Log calibration values periodically (only in development)
    if (process.env.NODE_ENV === 'development' && classifyDebugCounter % 60 === 0) {
      console.log(
        '[Formant Classify] Calibration:',
        'ahRatio:',
        calibration.ahRatio.toFixed(2),
        'ooRatio:',
        calibration.ooRatio.toFixed(2),
        'mmFlatness:',
        calibration.mmFlatness.toFixed(3),
        '| Current ratio:',
        upperLowerRatio.toFixed(2),
        'flatness:',
        flatness.toFixed(3),
        '| Order:',
        ahIsHigher ? 'Ah>Oo' : 'Oo>Ah'
      )
    }

    // Calculate midpoint between calibrated A and U ratios
    const midpoint = (calibration.ahRatio + calibration.ooRatio) / 2
    const separation = Math.abs(calibration.ahRatio - calibration.ooRatio)

    // If calibration values are too close (< 0.3 apart), use default thresholds
    if (separation < 0.3) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[Formant] Calibration values too similar, using defaults. Separation:',
          separation.toFixed(2)
        )
      }
      // Fall through to default logic below
    } else {
      // Use calibrated thresholds with dead zone
      const deadZone = separation * 0.15 // 15% dead zone around midpoint

      if (upperLowerRatio > midpoint + deadZone) {
        // Clearly closer to the higher-ratio phoneme
        const distance = Math.abs(upperLowerRatio - highRatio)
        let confidence = Math.min(1, 1 - distance / separation)
        confidence = Math.max(0.5, confidence)

        // MFCC confirmation
        const mfccBaseline = highPhoneme === 'A' ? calibration.ahMfcc : calibration.ooMfcc
        if (mfcc && mfccBaseline) {
          const mfccConf = mfccConfidence(mfcc, mfccBaseline)
          confidence = confidence * 0.6 + mfccConf * 0.4
        }

        return { phoneme: highPhoneme, confidence }
      } else if (upperLowerRatio < midpoint - deadZone) {
        // Clearly closer to the lower-ratio phoneme
        const distance = Math.abs(upperLowerRatio - lowRatio)
        let confidence = Math.min(1, 1 - distance / separation)
        confidence = Math.max(0.5, confidence)

        // MFCC confirmation
        const mfccBaseline = lowPhoneme === 'A' ? calibration.ahMfcc : calibration.ooMfcc
        if (mfcc && mfccBaseline) {
          const mfccConf = mfccConfidence(mfcc, mfccBaseline)
          confidence = confidence * 0.6 + mfccConf * 0.4
        }

        return { phoneme: lowPhoneme, confidence }
      } else {
        // In dead zone - return LOW confidence
        if (upperLowerRatio >= midpoint) {
          return { phoneme: highPhoneme, confidence: 0.25 }
        } else {
          return { phoneme: lowPhoneme, confidence: 0.25 }
        }
      }
    }
  }

  // Default thresholds (population average)
  if (upperLowerRatio > DEFAULT_THRESHOLDS.ahRatioMin) {
    const confidence = Math.min(1, (upperLowerRatio - 1) / 1.5)
    return { phoneme: 'A', confidence: Math.max(0.5, confidence) }
  } else if (upperLowerRatio < DEFAULT_THRESHOLDS.ooRatioMax) {
    const confidence = Math.min(1, (DEFAULT_THRESHOLDS.ooRatioMax - upperLowerRatio) / 0.5)
    return { phoneme: 'U', confidence: Math.max(0.5, confidence) }
  }

  // Ambiguous - default to Ah with lower confidence
  return { phoneme: 'A', confidence: 0.4 }
}

export function useFormantDetection(
  options: UseFormantDetectionOptions = {}
): UseFormantDetectionResult {
  const { useMedianFilter = true, useMfcc = true } = options

  // Calibration profile
  const calibrationRef = useRef<CalibrationProfile | null>(null)

  // Formant data ref for 60fps rendering
  const formantDataRef = useRef<FormantData>({
    lowBandEnergy: 0,
    midBandEnergy: 0,
    highBandEnergy: 0,
    spectralFlatness: 0,
    upperLowerRatio: 0,
    detectedPhoneme: 'silence',
    confidence: 0,
    rms: 0,
    timestamp: 0,
  })

  // Median filter for phoneme stability (mode-based for strings)
  const phonemeFilterRef = useRef<MedianFilterBuffer<string>>(new MedianFilterBuffer<string>(5))

  // Track last confirmed phoneme for debounce fallback
  const lastConfirmedPhonemeRef = useRef<Phoneme>('silence')

  // Track if Meyda has been configured
  const meydaConfiguredRef = useRef(false)

  // Debug counter for throttled logging
  const debugCounterRef = useRef(0)

  // Debug counter for classify function
  const classifyDebugCounterRef = useRef(0)

  /**
   * Get current formant data
   */
  const getFormantData = useCallback((): FormantData => {
    return formantDataRef.current
  }, [])

  /**
   * Set calibration profile
   */
  const setCalibration = useCallback((profile: CalibrationProfile | null): void => {
    calibrationRef.current = profile
  }, [])

  /**
   * Get current calibration profile
   */
  const getCalibration = useCallback((): CalibrationProfile | null => {
    return calibrationRef.current
  }, [])

  /**
   * Analyze a single frame of audio
   */
  const analyze = useCallback(
    (audioData: Float32Array, sampleRate: number): FormantData => {
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
        signal = new Float32Array(BUFFER_SIZE)
        const copyLength = Math.min(audioData.length, BUFFER_SIZE)
        signal.set(audioData.subarray(0, copyLength))
      }

      // Extract features using Meyda (including MFCC if enabled)
      const features = useMfcc
        ? Meyda.extract(
            ['spectralFlatness', 'rms', 'amplitudeSpectrum', 'powerSpectrum', 'mfcc'],
            signal
          )
        : Meyda.extract(['spectralFlatness', 'rms', 'amplitudeSpectrum', 'powerSpectrum'], signal)

      if (!features) {
        return formantDataRef.current
      }

      const flatness = (features.spectralFlatness as number) || 0
      const rms = (features.rms as number) || 0
      const powerSpectrum = features.powerSpectrum as Float32Array | undefined
      const mfcc = useMfcc ? (features.mfcc as number[] | undefined) : undefined

      // Check for silence
      if (rms < SILENCE_THRESHOLD) {
        lastConfirmedPhonemeRef.current = 'silence'
        phonemeFilterRef.current.reset() // Clear filter on silence

        formantDataRef.current = {
          lowBandEnergy: 0,
          midBandEnergy: 0,
          highBandEnergy: 0,
          spectralFlatness: flatness,
          upperLowerRatio: 0,
          detectedPhoneme: 'silence',
          confidence: 1,
          rms,
          timestamp: now,
          mfcc,
        }
        return formantDataRef.current
      }

      // Calculate band energies from power spectrum
      let lowEnergy = 0
      let midEnergy = 0
      let highEnergy = 0

      if (powerSpectrum && powerSpectrum.length > 0) {
        const binWidth = sampleRate / (powerSpectrum.length * 2)

        // Calculate energy in each band
        for (let i = 0; i < powerSpectrum.length; i++) {
          const freq = i * binWidth
          const power = powerSpectrum[i] || 0

          if (freq >= BANDS.low.min && freq <= BANDS.low.max) {
            lowEnergy += power
          } else if (freq >= BANDS.mid.min && freq <= BANDS.mid.max) {
            midEnergy += power
          } else if (freq >= BANDS.high.min && freq <= BANDS.high.max) {
            highEnergy += power
          }
        }

        // Normalize by number of bins in each band
        const lowBins = Math.ceil((BANDS.low.max - BANDS.low.min) / binWidth)
        const midBins = Math.ceil((BANDS.mid.max - BANDS.mid.min) / binWidth)
        const highBins = Math.ceil((BANDS.high.max - BANDS.high.min) / binWidth)

        lowEnergy = lowBins > 0 ? Math.sqrt(lowEnergy / lowBins) : 0
        midEnergy = midBins > 0 ? Math.sqrt(midEnergy / midBins) : 0
        highEnergy = highBins > 0 ? Math.sqrt(highEnergy / highBins) : 0
      }

      // Calculate upper/lower ratio
      const upperLowerRatio = lowEnergy > 0.001 ? (midEnergy + highEnergy) / lowEnergy : 0

      // Classify raw phoneme with hybrid approach
      classifyDebugCounterRef.current++
      const { phoneme: rawPhoneme, confidence: rawConfidence } = classifyPhoneme(
        lowEnergy,
        midEnergy,
        highEnergy,
        flatness,
        calibrationRef.current,
        mfcc || null,
        classifyDebugCounterRef.current
      )

      // Apply median filter for stable phoneme output
      let finalPhoneme: Phoneme = rawPhoneme
      let finalConfidence = rawConfidence

      if (useMedianFilter && rawConfidence >= CONFIDENCE_THRESHOLD) {
        // Push to filter and get stable result
        const filteredPhoneme = phonemeFilterRef.current.push(rawPhoneme) as Phoneme
        finalPhoneme = filteredPhoneme
        lastConfirmedPhonemeRef.current = filteredPhoneme
      } else if (rawConfidence < CONFIDENCE_THRESHOLD) {
        // Low confidence - stick with last confirmed
        finalPhoneme = lastConfirmedPhonemeRef.current
        finalConfidence = rawConfidence * 0.7
      }

      // Debug logging (throttled, development only)
      if (process.env.NODE_ENV === 'development') {
        debugCounterRef.current++
        if (debugCounterRef.current % 30 === 0) {
          console.log(
            '[Formant] low:',
            lowEnergy.toFixed(3),
            'mid:',
            midEnergy.toFixed(3),
            'high:',
            highEnergy.toFixed(3),
            'ratio:',
            upperLowerRatio.toFixed(2),
            'flat:',
            flatness.toFixed(3),
            'detected:',
            finalPhoneme,
            'conf:',
            finalConfidence.toFixed(2),
            useMfcc && mfcc ? `mfcc[0-2]: ${mfcc.slice(0, 3).map((v) => v.toFixed(1))}` : ''
          )
        }
      }

      formantDataRef.current = {
        lowBandEnergy: lowEnergy,
        midBandEnergy: midEnergy,
        highBandEnergy: highEnergy,
        spectralFlatness: flatness,
        upperLowerRatio,
        detectedPhoneme: finalPhoneme,
        confidence: finalConfidence,
        rms,
        timestamp: now,
        mfcc,
      }

      return formantDataRef.current
    },
    [useMedianFilter, useMfcc]
  )

  /**
   * Reset state
   */
  const reset = useCallback((): void => {
    formantDataRef.current = {
      lowBandEnergy: 0,
      midBandEnergy: 0,
      highBandEnergy: 0,
      spectralFlatness: 0,
      upperLowerRatio: 0,
      detectedPhoneme: 'silence',
      confidence: 0,
      rms: 0,
      timestamp: 0,
    }
    phonemeFilterRef.current.reset()
    lastConfirmedPhonemeRef.current = 'silence'
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  return {
    getFormantData,
    analyze,
    setCalibration,
    getCalibration,
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
