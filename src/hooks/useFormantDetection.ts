/**
 * useFormantDetection - Formant-based A/U/M phoneme classification
 *
 * Replaces spectral centroid approach with frequency band energy ratios.
 * The key insight: vowel sounds differ in their formant frequencies (F1, F2),
 * and using RATIOS makes detection speaker-independent.
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

export type Phoneme = 'silence' | 'A' | 'U' | 'M'

export interface CalibrationProfile {
  id: string
  createdAt: number
  ahRatio: number // Upper/lower energy ratio for Ah
  ooRatio: number // Upper/lower energy ratio for Oo
  mmFlatness: number // Baseline flatness for Mm
  noiseFloor: number // Background noise level
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

// Debounce settings for stability
const DEBOUNCE_MS = 80
const CONFIDENCE_THRESHOLD = 0.4

/**
 * Classify phoneme using frequency band energy ratios
 */
function classifyPhoneme(
  lowEnergy: number,
  midEnergy: number,
  highEnergy: number,
  flatness: number,
  calibration: CalibrationProfile | null
): { phoneme: Phoneme; confidence: number } {
  // Mm detection: high flatness (nasal resonance creates broader spectrum)
  const mmFlatnessThreshold = calibration?.mmFlatness ?? DEFAULT_THRESHOLDS.mmFlatnessMin

  if (flatness > mmFlatnessThreshold) {
    const confidence = Math.min(1, flatness / (mmFlatnessThreshold * 1.5))
    return { phoneme: 'M', confidence }
  }

  // Calculate upper/lower ratio for A vs U distinction
  const upperEnergy = midEnergy + highEnergy
  const lowerEnergy = lowEnergy + 0.001 // Avoid division by zero
  const upperLowerRatio = upperEnergy / lowerEnergy

  if (calibration) {
    // Use calibrated thresholds
    const ahDistance = Math.abs(upperLowerRatio - calibration.ahRatio)
    const ooDistance = Math.abs(upperLowerRatio - calibration.ooRatio)
    const totalDistance = ahDistance + ooDistance

    if (ahDistance < ooDistance) {
      const confidence = totalDistance > 0 ? 1 - ahDistance / totalDistance : 0.5
      return { phoneme: 'A', confidence: Math.min(1, confidence) }
    } else {
      const confidence = totalDistance > 0 ? 1 - ooDistance / totalDistance : 0.5
      return { phoneme: 'U', confidence: Math.min(1, confidence) }
    }
  }

  // Default thresholds (population average)
  if (upperLowerRatio > DEFAULT_THRESHOLDS.ahRatioMin) {
    // Higher ratio = more energy in upper bands = Ah
    const confidence = Math.min(1, (upperLowerRatio - 1) / 1.5)
    return { phoneme: 'A', confidence: Math.max(0.5, confidence) }
  } else if (upperLowerRatio < DEFAULT_THRESHOLDS.ooRatioMax) {
    // Lower ratio = more energy in lower bands = Oo
    const confidence = Math.min(1, (DEFAULT_THRESHOLDS.ooRatioMax - upperLowerRatio) / 0.5)
    return { phoneme: 'U', confidence: Math.max(0.5, confidence) }
  }

  // Ambiguous - default to Ah with lower confidence
  return { phoneme: 'A', confidence: 0.4 }
}

export function useFormantDetection(): UseFormantDetectionResult {
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

  // Debounce state
  const lastTransitionTimeRef = useRef(0)
  const pendingPhonemeRef = useRef<Phoneme>('silence')
  const lastConfirmedPhonemeRef = useRef<Phoneme>('silence')

  // Track if Meyda has been configured
  const meydaConfiguredRef = useRef(false)

  // Debug counter for throttled logging
  const debugCounterRef = useRef(0)

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
  const analyze = useCallback((audioData: Float32Array, sampleRate: number): FormantData => {
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

    // Extract features using Meyda
    const features = Meyda.extract(
      ['spectralFlatness', 'rms', 'amplitudeSpectrum', 'powerSpectrum'],
      signal
    )

    if (!features) {
      return formantDataRef.current
    }

    const flatness = (features.spectralFlatness as number) || 0
    const rms = (features.rms as number) || 0
    const powerSpectrum = features.powerSpectrum as Float32Array | undefined

    // Check for silence
    if (rms < SILENCE_THRESHOLD) {
      lastConfirmedPhonemeRef.current = 'silence'
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

    // Classify raw phoneme
    const { phoneme: rawPhoneme, confidence: rawConfidence } = classifyPhoneme(
      lowEnergy,
      midEnergy,
      highEnergy,
      flatness,
      calibrationRef.current
    )

    // Apply debounce with hysteresis
    const currentPhoneme = lastConfirmedPhonemeRef.current
    let finalPhoneme = currentPhoneme
    let finalConfidence = rawConfidence

    if (rawPhoneme !== pendingPhonemeRef.current) {
      // New pending phoneme, start debounce timer
      pendingPhonemeRef.current = rawPhoneme
      lastTransitionTimeRef.current = now
    } else if (rawPhoneme !== currentPhoneme) {
      // Same pending phoneme, check if debounce period elapsed
      if (
        now - lastTransitionTimeRef.current >= DEBOUNCE_MS &&
        rawConfidence >= CONFIDENCE_THRESHOLD
      ) {
        finalPhoneme = rawPhoneme
        lastConfirmedPhonemeRef.current = rawPhoneme
      }
    }

    // If staying with current phoneme, use averaged confidence
    if (finalPhoneme === currentPhoneme && finalPhoneme !== rawPhoneme) {
      finalConfidence = rawConfidence * 0.5 // Lower confidence when raw differs
    }

    // Debug logging (throttled)
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
        finalConfidence.toFixed(2)
      )
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
    }

    return formantDataRef.current
  }, [])

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
