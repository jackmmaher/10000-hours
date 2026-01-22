/**
 * usePhonemeCalibration - One-time voice calibration for phoneme detection
 *
 * Guides user through 15-second calibration (5s each for Ah, Oo, Mm).
 * Stores calibration profile in localStorage for persistence.
 *
 * Enhanced with MFCC baseline capture for hybrid classification.
 *
 * The calibration captures:
 * - Upper/lower frequency ratio for "Ah" (user's voice)
 * - Upper/lower frequency ratio for "Oo" (user's voice)
 * - Spectral flatness baseline for "Mm" (nasal resonance)
 * - MFCC mean/variance for each phoneme (personalized detection)
 * - Background noise floor
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import Meyda from 'meyda'
import type { CalibrationProfile, MfccBaseline } from './useFormantDetection'

// LocalStorage key
const STORAGE_KEY = 'aum-calibration'

// Phase durations in milliseconds
const PHASE_DURATION_MS = 5000 // 5 seconds per phoneme
const NOISE_SAMPLE_DURATION_MS = 1000 // 1 second for noise floor

// Buffer size for Meyda
const BUFFER_SIZE = 2048

// Frequency bands (matching useFormantDetection)
const BANDS = {
  low: { min: 250, max: 500 },
  mid: { min: 500, max: 900 },
  high: { min: 900, max: 1400 },
}

export type CalibrationPhase = 'idle' | 'noise' | 'ah' | 'oo' | 'mm' | 'complete'

export interface CalibrationState {
  phase: CalibrationPhase
  progress: number // 0-1 within current phase
  isCalibrating: boolean
  error: string | null
  // Real-time feedback
  currentRms: number // Current audio level (0-1)
  samplesCollected: number // Samples collected in current phase
  isVoiceDetected: boolean // Is voice currently detected?
}

export interface CalibrationSamples {
  ratios: number[] // Upper/lower ratios for current phase
  flatnesses: number[] // Spectral flatness samples
  rmsValues: number[] // RMS values for noise floor
  mfccSamples: number[][] // MFCC vectors for current phase
}

export interface UsePhonemeCalibrationResult {
  state: CalibrationState
  profile: CalibrationProfile | null
  hasCalibration: boolean
  startCalibration: (
    getFrequencyData: () => Float32Array | null,
    getSampleRate: () => number
  ) => void
  cancelCalibration: () => void
  clearCalibration: () => void
  loadCalibration: () => CalibrationProfile | null
}

/**
 * Calculate MFCC baseline (mean and variance) from samples
 */
function calculateMfccBaseline(samples: number[][]): MfccBaseline | undefined {
  if (samples.length < 5) return undefined

  const numCoeffs = samples[0]?.length || 13
  const mean = new Array(numCoeffs).fill(0)
  const variance = new Array(numCoeffs).fill(0)

  // Calculate mean
  for (const sample of samples) {
    for (let i = 0; i < numCoeffs; i++) {
      mean[i] += sample[i] || 0
    }
  }
  for (let i = 0; i < numCoeffs; i++) {
    mean[i] /= samples.length
  }

  // Calculate variance
  for (const sample of samples) {
    for (let i = 0; i < numCoeffs; i++) {
      const diff = (sample[i] || 0) - mean[i]
      variance[i] += diff * diff
    }
  }
  for (let i = 0; i < numCoeffs; i++) {
    variance[i] /= samples.length
    // Add small epsilon to prevent division by zero
    variance[i] = Math.max(variance[i], 0.001)
  }

  return { mean, variance }
}

/**
 * Type guard to validate CalibrationProfile structure
 */
function isValidCalibrationProfile(obj: unknown): obj is CalibrationProfile {
  if (!obj || typeof obj !== 'object') return false
  const profile = obj as Record<string, unknown>

  return (
    typeof profile.ahRatio === 'number' &&
    !Number.isNaN(profile.ahRatio) &&
    Number.isFinite(profile.ahRatio) &&
    profile.ahRatio > 0 &&
    typeof profile.ooRatio === 'number' &&
    !Number.isNaN(profile.ooRatio) &&
    Number.isFinite(profile.ooRatio) &&
    profile.ooRatio > 0 &&
    typeof profile.mmFlatness === 'number' &&
    !Number.isNaN(profile.mmFlatness) &&
    Number.isFinite(profile.mmFlatness) &&
    profile.mmFlatness >= 0
  )
}

/**
 * Load calibration profile from localStorage
 */
function loadFromStorage(): CalibrationProfile | null {
  // SSR safety - check if localStorage is available
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const parsed: unknown = JSON.parse(stored)

    // Use type guard for proper validation instead of unsafe cast
    if (isValidCalibrationProfile(parsed)) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

/**
 * Save calibration profile to localStorage
 */
function saveToStorage(profile: CalibrationProfile): void {
  // SSR safety
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Calibration] Failed to save:', err)
    }
  }
}

/**
 * Clear calibration from localStorage
 */
function clearFromStorage(): void {
  // SSR safety
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Calibration] Failed to clear:', err)
    }
  }
}

/**
 * Calculate band energies from power spectrum
 */
function calculateBandEnergies(
  powerSpectrum: Float32Array,
  sampleRate: number
): { low: number; mid: number; high: number } {
  const binWidth = sampleRate / (powerSpectrum.length * 2)
  let lowEnergy = 0
  let midEnergy = 0
  let highEnergy = 0

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

  // Normalize
  const lowBins = Math.ceil((BANDS.low.max - BANDS.low.min) / binWidth)
  const midBins = Math.ceil((BANDS.mid.max - BANDS.mid.min) / binWidth)
  const highBins = Math.ceil((BANDS.high.max - BANDS.high.min) / binWidth)

  return {
    low: lowBins > 0 ? Math.sqrt(lowEnergy / lowBins) : 0,
    mid: midBins > 0 ? Math.sqrt(midEnergy / midBins) : 0,
    high: highBins > 0 ? Math.sqrt(highEnergy / highBins) : 0,
  }
}

export function usePhonemeCalibration(): UsePhonemeCalibrationResult {
  const [state, setState] = useState<CalibrationState>({
    phase: 'idle',
    progress: 0,
    isCalibrating: false,
    error: null,
    currentRms: 0,
    samplesCollected: 0,
    isVoiceDetected: false,
  })

  const [profile, setProfile] = useState<CalibrationProfile | null>(() => loadFromStorage())

  // Refs for calibration process
  const phaseStartTimeRef = useRef<number>(0)
  const samplesRef = useRef<CalibrationSamples>({
    ratios: [],
    flatnesses: [],
    rmsValues: [],
    mfccSamples: [],
  })
  const animationFrameRef = useRef<number | null>(null)
  const getFrequencyDataRef = useRef<(() => Float32Array | null) | null>(null)
  const getSampleRateRef = useRef<(() => number) | null>(null)

  // Collected data across phases
  const ahRatiosRef = useRef<number[]>([])
  const ooRatiosRef = useRef<number[]>([])
  const mmFlatnessesRef = useRef<number[]>([])
  const noiseFloorRef = useRef<number>(0)

  // MFCC samples for each phase
  const ahMfccSamplesRef = useRef<number[][]>([])
  const ooMfccSamplesRef = useRef<number[][]>([])
  const mmMfccSamplesRef = useRef<number[][]>([])

  const meydaConfiguredRef = useRef(false)

  // Debug counter for logging
  const debugCounterRef = useRef(0)

  // Track current phase in ref to avoid stale closures
  const currentPhaseRef = useRef<CalibrationPhase>('idle')

  // Flag to continue loop after phase transition
  const shouldContinueLoopRef = useRef(false)

  // Voice detection threshold - lowered for sensitivity
  const VOICE_THRESHOLD = 0.003

  /**
   * Process a single audio frame during calibration
   * Returns real-time feedback data for UI
   */
  const processFrame = useCallback(
    (
      phase: CalibrationPhase,
      sampleRate: number
    ): {
      rms: number
      isVoiceDetected: boolean
      sampleCollected: boolean
    } => {
      const result = { rms: 0, isVoiceDetected: false, sampleCollected: false }

      const getFrequencyData = getFrequencyDataRef.current
      if (!getFrequencyData) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Calibration] No getFrequencyData function')
        }
        return result
      }

      const audioData = getFrequencyData()
      if (!audioData) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Calibration] No audio data')
        }
        return result
      }

      // Configure Meyda if needed
      if (!meydaConfiguredRef.current || Meyda.sampleRate !== sampleRate) {
        Meyda.bufferSize = BUFFER_SIZE
        Meyda.sampleRate = sampleRate
        meydaConfiguredRef.current = true
      }

      // Ensure correct buffer size
      let signal = audioData
      if (audioData.length !== BUFFER_SIZE) {
        signal = new Float32Array(BUFFER_SIZE)
        const copyLength = Math.min(audioData.length, BUFFER_SIZE)
        signal.set(audioData.subarray(0, copyLength))
      }

      // Extract features including MFCC
      const features = Meyda.extract(['spectralFlatness', 'rms', 'powerSpectrum', 'mfcc'], signal)

      if (!features) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Calibration] Meyda returned no features')
        }
        return result
      }

      const flatness = (features.spectralFlatness as number) || 0
      const rms = (features.rms as number) || 0
      const powerSpectrum = features.powerSpectrum as Float32Array | undefined
      const mfcc = features.mfcc as number[] | undefined

      result.rms = rms
      result.isVoiceDetected = rms > VOICE_THRESHOLD

      // Debug logging (throttled, development only)
      if (process.env.NODE_ENV === 'development') {
        debugCounterRef.current++
        if (debugCounterRef.current % 30 === 0) {
          console.log(
            '[Calibration]',
            phase,
            'rms:',
            rms.toFixed(4),
            'voice:',
            result.isVoiceDetected ? 'YES' : 'no',
            'flatness:',
            flatness.toFixed(3),
            'powerSpectrum:',
            powerSpectrum ? powerSpectrum.length : 'NONE',
            'mfcc:',
            mfcc ? mfcc.length : 'NONE',
            'samples:',
            samplesRef.current.ratios.length
          )
        }
      }

      // For noise phase, always collect
      if (phase === 'noise') {
        samplesRef.current.rmsValues.push(rms)
        result.sampleCollected = true
        return result
      }

      // Skip very quiet samples for voice phases
      if (rms < VOICE_THRESHOLD) {
        return result
      }

      // Collect sample
      if (powerSpectrum && powerSpectrum.length > 0) {
        const energies = calculateBandEnergies(powerSpectrum, sampleRate)
        const ratio = energies.low > 0.001 ? (energies.mid + energies.high) / energies.low : 1.0

        samplesRef.current.ratios.push(ratio)
        samplesRef.current.flatnesses.push(flatness)

        // Collect MFCC sample if available
        if (mfcc && mfcc.length > 0) {
          samplesRef.current.mfccSamples.push([...mfcc])
        }

        result.sampleCollected = true
      } else {
        // Fallback when powerSpectrum unavailable
        samplesRef.current.ratios.push(1.0)
        samplesRef.current.flatnesses.push(flatness)

        if (mfcc && mfcc.length > 0) {
          samplesRef.current.mfccSamples.push([...mfcc])
        }

        result.sampleCollected = true
        if (process.env.NODE_ENV === 'development') {
          console.log('[Calibration] Using fallback - no powerSpectrum')
        }
      }

      return result
    },
    []
  )

  /**
   * Calculate median of an array (more robust than mean)
   */
  const median = useCallback((arr: number[]): number => {
    if (arr.length === 0) return 0
    const sorted = [...arr].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  }, [])

  /**
   * Move to next calibration phase
   */
  const nextPhase = useCallback(
    (currentPhase: CalibrationPhase) => {
      const samples = samplesRef.current

      // Log samples collected for this phase (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Calibration] Phase ${currentPhase} complete:`,
          'ratios:',
          samples.ratios.length,
          'flatnesses:',
          samples.flatnesses.length,
          'rmsValues:',
          samples.rmsValues.length,
          'mfccSamples:',
          samples.mfccSamples.length
        )
      }

      // Store results from completed phase
      switch (currentPhase) {
        case 'noise':
          noiseFloorRef.current = median(samples.rmsValues)
          if (process.env.NODE_ENV === 'development') {
            console.log('[Calibration] Noise floor:', noiseFloorRef.current)
          }
          break
        case 'ah':
          ahRatiosRef.current = [...samples.ratios]
          ahMfccSamplesRef.current = [...samples.mfccSamples]
          if (process.env.NODE_ENV === 'development') {
            console.log(
              '[Calibration] Ah ratios collected:',
              ahRatiosRef.current.length,
              'MFCC samples:',
              ahMfccSamplesRef.current.length
            )
          }
          break
        case 'oo':
          ooRatiosRef.current = [...samples.ratios]
          ooMfccSamplesRef.current = [...samples.mfccSamples]
          if (process.env.NODE_ENV === 'development') {
            console.log(
              '[Calibration] Oo ratios collected:',
              ooRatiosRef.current.length,
              'MFCC samples:',
              ooMfccSamplesRef.current.length
            )
          }
          break
        case 'mm':
          mmFlatnessesRef.current = [...samples.flatnesses]
          mmMfccSamplesRef.current = [...samples.mfccSamples]
          if (process.env.NODE_ENV === 'development') {
            console.log(
              '[Calibration] Mm flatnesses collected:',
              mmFlatnessesRef.current.length,
              'MFCC samples:',
              mmMfccSamplesRef.current.length
            )
          }
          break
      }

      // Reset samples for next phase
      samplesRef.current = { ratios: [], flatnesses: [], rmsValues: [], mfccSamples: [] }

      // Determine next phase
      const phaseOrder: CalibrationPhase[] = ['noise', 'ah', 'oo', 'mm', 'complete']
      const currentIndex = phaseOrder.indexOf(currentPhase)
      const nextPhaseValue = phaseOrder[currentIndex + 1] || 'complete'

      if (nextPhaseValue === 'complete') {
        // Calculate final profile
        const ahRatio = median(ahRatiosRef.current)
        const ooRatio = median(ooRatiosRef.current)
        const mmFlatness = median(mmFlatnessesRef.current)

        // Calculate MFCC baselines
        const ahMfcc = calculateMfccBaseline(ahMfccSamplesRef.current)
        const ooMfcc = calculateMfccBaseline(ooMfccSamplesRef.current)
        const mmMfcc = calculateMfccBaseline(mmMfccSamplesRef.current)

        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[Calibration] Final counts - ah:',
            ahRatiosRef.current.length,
            'oo:',
            ooRatiosRef.current.length,
            'mm:',
            mmFlatnessesRef.current.length
          )
          console.log(
            '[Calibration] MFCC baselines - ah:',
            ahMfcc ? 'YES' : 'no',
            'oo:',
            ooMfcc ? 'YES' : 'no',
            'mm:',
            mmMfcc ? 'YES' : 'no'
          )
        }

        // Validate - need at least 5 samples (lowered from 10)
        if (ahRatiosRef.current.length < 5 || ooRatiosRef.current.length < 5) {
          if (process.env.NODE_ENV === 'development') {
            console.error(
              '[Calibration] Not enough samples:',
              'ah:',
              ahRatiosRef.current.length,
              'oo:',
              ooRatiosRef.current.length
            )
          }
          setState({
            phase: 'idle',
            progress: 0,
            isCalibrating: false,
            error: `Not enough audio detected (ah: ${ahRatiosRef.current.length}, oo: ${ooRatiosRef.current.length}). Please try again and vocalize louder.`,
            currentRms: 0,
            samplesCollected: 0,
            isVoiceDetected: false,
          })
          return
        }

        const newProfile: CalibrationProfile = {
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          ahRatio,
          ooRatio,
          mmFlatness,
          noiseFloor: noiseFloorRef.current,
          // Include MFCC baselines if available
          ahMfcc,
          ooMfcc,
          mmMfcc,
        }

        // Log detailed calibration results (development only)
        const separation = Math.abs(ahRatio - ooRatio)
        if (process.env.NODE_ENV === 'development') {
          console.log('[Calibration] Complete:', {
            ahRatio: ahRatio.toFixed(3),
            ooRatio: ooRatio.toFixed(3),
            mmFlatness: mmFlatness.toFixed(3),
            noiseFloor: noiseFloorRef.current.toFixed(4),
            separation: separation.toFixed(3),
            isGoodSeparation: separation >= 0.3,
            hasMfccBaselines: !!(ahMfcc && ooMfcc && mmMfcc),
          })

          // Warn if calibration values are too similar
          if (separation < 0.3) {
            console.warn(
              '[Calibration] WARNING: Ah and Oo ratios are very similar (' +
                separation.toFixed(2) +
                '). Detection may be unreliable. Try making vowel shapes more distinct during calibration.'
            )
          }
        }
        saveToStorage(newProfile)
        setProfile(newProfile)

        setState({
          phase: 'complete',
          progress: 1,
          isCalibrating: false,
          error: null,
          currentRms: 0,
          samplesCollected: 0,
          isVoiceDetected: false,
        })
      } else {
        // Update phase ref and set flag to continue loop
        currentPhaseRef.current = nextPhaseValue
        phaseStartTimeRef.current = performance.now()
        shouldContinueLoopRef.current = true
        setState({
          phase: nextPhaseValue,
          progress: 0,
          isCalibrating: true,
          error: null,
          currentRms: 0,
          samplesCollected: 0,
          isVoiceDetected: false,
        })
      }
    },
    [median]
  )

  /**
   * Calibration loop - runs at ~60fps with real-time feedback
   */
  const calibrationLoop = useCallback((): void => {
    const now = performance.now()
    const elapsed = now - phaseStartTimeRef.current
    const getSampleRate = getSampleRateRef.current
    const phase = currentPhaseRef.current

    if (!getSampleRate || phase === 'idle' || phase === 'complete') {
      return
    }

    const sampleRate = getSampleRate()
    const duration = phase === 'noise' ? NOISE_SAMPLE_DURATION_MS : PHASE_DURATION_MS
    const progress = Math.min(1, elapsed / duration)

    // Process audio frame and get real-time feedback
    const frameResult = processFrame(phase, sampleRate)

    // Get current sample count for this phase
    const samplesCollected =
      phase === 'noise' ? samplesRef.current.rmsValues.length : samplesRef.current.ratios.length

    // Check if phase is complete
    if (elapsed >= duration) {
      nextPhase(phase)
      // Check if we should continue the loop after phase transition
      if (shouldContinueLoopRef.current) {
        shouldContinueLoopRef.current = false
        animationFrameRef.current = requestAnimationFrame(calibrationLoop)
      }
      return
    }

    // Update state with real-time feedback
    setState((prev) => {
      if (!prev.isCalibrating) return prev

      return {
        ...prev,
        progress,
        currentRms: frameResult.rms,
        isVoiceDetected: frameResult.isVoiceDetected,
        samplesCollected,
      }
    })

    // Continue loop
    animationFrameRef.current = requestAnimationFrame(calibrationLoop)
  }, [processFrame, nextPhase])

  /**
   * Start calibration process
   */
  const startCalibration = useCallback(
    (getFrequencyData: () => Float32Array | null, getSampleRate: () => number) => {
      // Store refs
      getFrequencyDataRef.current = getFrequencyData
      getSampleRateRef.current = getSampleRate

      // Reset collected data
      ahRatiosRef.current = []
      ooRatiosRef.current = []
      mmFlatnessesRef.current = []
      noiseFloorRef.current = 0
      ahMfccSamplesRef.current = []
      ooMfccSamplesRef.current = []
      mmMfccSamplesRef.current = []
      samplesRef.current = { ratios: [], flatnesses: [], rmsValues: [], mfccSamples: [] }

      // Start with noise phase
      currentPhaseRef.current = 'noise'
      phaseStartTimeRef.current = performance.now()
      setState({
        phase: 'noise',
        progress: 0,
        isCalibrating: true,
        error: null,
        currentRms: 0,
        samplesCollected: 0,
        isVoiceDetected: false,
      })

      // Start the loop
      animationFrameRef.current = requestAnimationFrame(calibrationLoop)
    },
    [calibrationLoop]
  )

  /**
   * Cancel calibration
   */
  const cancelCalibration = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    currentPhaseRef.current = 'idle'
    setState({
      phase: 'idle',
      progress: 0,
      isCalibrating: false,
      error: null,
      currentRms: 0,
      samplesCollected: 0,
      isVoiceDetected: false,
    })
  }, [])

  /**
   * Clear stored calibration
   */
  const clearCalibration = useCallback(() => {
    clearFromStorage()
    setProfile(null)
    setState({
      phase: 'idle',
      progress: 0,
      isCalibrating: false,
      error: null,
      currentRms: 0,
      samplesCollected: 0,
      isVoiceDetected: false,
    })
  }, [])

  /**
   * Load calibration from storage
   */
  const loadCalibration = useCallback((): CalibrationProfile | null => {
    const loaded = loadFromStorage()
    if (loaded) {
      setProfile(loaded)
    }
    return loaded
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return {
    state,
    profile,
    hasCalibration: profile !== null,
    startCalibration,
    cancelCalibration,
    clearCalibration,
    loadCalibration,
  }
}

/**
 * Get instruction text for calibration phase
 */
export function getCalibrationInstruction(phase: CalibrationPhase): {
  title: string
  instruction: string
} {
  switch (phase) {
    case 'noise':
      return {
        title: 'Preparing...',
        instruction: 'Stay quiet for a moment',
      }
    case 'ah':
      return {
        title: 'Say "Ahhh"',
        instruction: 'Open vowel at your comfortable pitch',
      }
    case 'oo':
      return {
        title: 'Say "Oooo"',
        instruction: 'Round your lips',
      }
    case 'mm':
      return {
        title: 'Hum "Mmmm"',
        instruction: 'Close your lips',
      }
    case 'complete':
      return {
        title: 'Calibration Complete',
        instruction: 'Your voice profile is saved',
      }
    default:
      return {
        title: 'Voice Calibration',
        instruction: 'Quick setup for personalized detection',
      }
  }
}
