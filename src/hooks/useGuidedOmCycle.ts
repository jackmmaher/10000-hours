/**
 * useGuidedOmCycle - Guided Aum practice session state machine
 *
 * Supports three timing modes:
 * - Traditional (1:1:2): Ah 3s, Oo 3s, Mm 6s, Breathe 4s = 16s cycle
 * - Extended: Ah 4s, Oo 4s, Mm 8s, Breathe 4s = 20s cycle
 * - Flexible: Phoneme-detection driven, user controls pace
 *
 * Tracks per-phoneme alignment for scoring.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Phoneme } from './usePhonemeDetection'
import type { PitchData } from './usePitchDetection'

// Timing modes
export type TimingMode = 'traditional' | 'extended' | 'flexible'

// Phase timing configurations in milliseconds
// Breath duration matches Mm duration for balanced cycles
export const TIMING_CONFIGS: Record<
  TimingMode,
  {
    breathe: number
    ah: number
    oo: number
    mm: number
  }
> = {
  traditional: { breathe: 6000, ah: 3000, oo: 3000, mm: 6000 }, // 18s total
  extended: { breathe: 8000, ah: 4000, oo: 4000, mm: 8000 }, // 24s total
  flexible: { breathe: 0, ah: 0, oo: 0, mm: 0 }, // Phoneme-driven
}

// Get phase durations for a timing mode
export function getPhaseDurations(mode: TimingMode) {
  return TIMING_CONFIGS[mode]
}

// Get cycle duration for a timing mode
export function getCycleDuration(mode: TimingMode): number {
  const config = TIMING_CONFIGS[mode]
  return config.breathe + config.ah + config.oo + config.mm
}

// Session duration options
export type SessionDuration = 5 | 10 | 15

// Calculate cycles for duration and timing mode
export function getSessionCycles(duration: SessionDuration, mode: TimingMode): number {
  if (mode === 'flexible') {
    // For flexible, estimate based on ~20s average cycle
    return Math.floor((duration * 60 * 1000) / 20000)
  }
  const cycleDuration = getCycleDuration(mode)
  return Math.floor((duration * 60 * 1000) / cycleDuration)
}

// Legacy export for backwards compatibility
export const SESSION_CYCLES: Record<SessionDuration, number> = {
  5: 18,
  10: 37,
  15: 56,
}

// Legacy export for backwards compatibility
export const PHASE_DURATIONS = TIMING_CONFIGS.traditional

// Phases in order (getReady is warmup before session timer starts)
export type CyclePhase = 'getReady' | 'breathe' | 'ah' | 'oo' | 'mm'

// Timed phases (excludes getReady which has its own duration logic)
type TimedPhase = 'breathe' | 'ah' | 'oo' | 'mm'
const PHASE_ORDER: TimedPhase[] = ['breathe', 'ah', 'oo', 'mm']

// Get Ready duration = one full cycle duration
export function getReadyDuration(mode: TimingMode): number {
  return getCycleDuration(mode)
}

// Map phases to expected phonemes for scoring
const PHASE_PHONEMES: Record<CyclePhase, Phoneme | null> = {
  getReady: null,
  breathe: null,
  ah: 'A',
  oo: 'U',
  mm: 'M',
}

// Lock threshold for cycle quality
export const LOCK_THRESHOLD = 70

export interface CycleQuality {
  ahScore: number
  ooScore: number
  mmScore: number
  overallScore: number
  isLocked: boolean
}

// Per-phoneme alignment data for results
export interface PhonemeAlignmentData {
  ah: { totalMs: number; inRangeMs: number }
  oo: { totalMs: number; inRangeMs: number }
  mm: { totalMs: number; inRangeMs: number }
}

export interface GuidedCycleState {
  isRunning: boolean
  timingMode: TimingMode
  currentPhase: CyclePhase
  phaseProgress: number
  cycleProgress: number
  sessionProgress: number
  currentCycle: number
  totalCycles: number
  elapsedMs: number // Count-up time (does NOT include getReady)
  totalSessionMs: number // Total session duration
  sessionDurationMin: SessionDuration
  isGetReady: boolean // True during warmup phase
  getReadyProgress: number // 0-1 progress through getReady
}

export interface UseGuidedOmCycleOptions {
  onCycleComplete?: (quality: CycleQuality, cycleNumber: number) => void
  onSessionComplete?: () => void
}

export interface UseGuidedOmCycleResult {
  state: GuidedCycleState
  startSession: (duration: SessionDuration, mode?: TimingMode) => void
  stopSession: () => void
  recordSample: (phoneme: Phoneme, pitch: PitchData) => void
  getExpectedPhoneme: () => Phoneme | null
  getCurrentCycleQuality: () => CycleQuality
  getPhonemeAlignment: () => PhonemeAlignmentData
}

export function useGuidedOmCycle(options: UseGuidedOmCycleOptions = {}): UseGuidedOmCycleResult {
  const { onCycleComplete, onSessionComplete } = options

  const [state, setState] = useState<GuidedCycleState>({
    isRunning: false,
    timingMode: 'traditional',
    currentPhase: 'breathe',
    phaseProgress: 0,
    cycleProgress: 0,
    sessionProgress: 0,
    currentCycle: 1,
    totalCycles: 0,
    elapsedMs: 0,
    totalSessionMs: 0,
    sessionDurationMin: 5,
    isGetReady: false,
    getReadyProgress: 0,
  })

  // Refs for timing
  const sessionStartRef = useRef<number | null>(null)
  const getReadyStartRef = useRef<number | null>(null)
  const getReadyDurationRef = useRef<number>(0)
  const animationFrameRef = useRef<number | null>(null)
  const timingModeRef = useRef<TimingMode>('traditional')
  const isGetReadyRef = useRef<boolean>(false)

  // Per-cycle quality tracking
  const phaseScoresRef = useRef<{
    ah: { samples: number; aligned: number }
    oo: { samples: number; aligned: number }
    mm: { samples: number; aligned: number }
  }>({
    ah: { samples: 0, aligned: 0 },
    oo: { samples: 0, aligned: 0 },
    mm: { samples: 0, aligned: 0 },
  })

  const cycleQualityRef = useRef<CycleQuality>({
    ahScore: 0,
    ooScore: 0,
    mmScore: 0,
    overallScore: 0,
    isLocked: false,
  })

  // Session-wide phoneme alignment tracking (for results)
  const phonemeAlignmentRef = useRef<PhonemeAlignmentData>({
    ah: { totalMs: 0, inRangeMs: 0 },
    oo: { totalMs: 0, inRangeMs: 0 },
    mm: { totalMs: 0, inRangeMs: 0 },
  })

  const lastSampleTimeRef = useRef<number>(0)
  const lastCycleRef = useRef(0)
  const lastPhaseRef = useRef<CyclePhase>('breathe')

  // Flexible mode tracking
  const flexiblePhaseRef = useRef<CyclePhase>('breathe')
  const flexibleCycleStateRef = useRef<'idle' | 'a' | 'u' | 'm'>('idle')

  /**
   * Calculate phase from elapsed time (for timed modes)
   */
  const calculatePhaseFromTime = useCallback(
    (
      elapsedMs: number,
      mode: TimingMode
    ): {
      phase: CyclePhase
      phaseProgress: number
      cycleProgress: number
      cycleNumber: number
    } => {
      const config = TIMING_CONFIGS[mode]
      const cycleDuration = config.breathe + config.ah + config.oo + config.mm

      const cycleNumber = Math.floor(elapsedMs / cycleDuration) + 1
      const positionInCycle = elapsedMs % cycleDuration

      let phase: CyclePhase = 'breathe'
      let phaseStart = 0
      let phaseDuration = config.breathe

      let accumulated = 0
      for (const p of PHASE_ORDER) {
        const dur = config[p]
        if (positionInCycle < accumulated + dur) {
          phase = p
          phaseStart = accumulated
          phaseDuration = dur
          break
        }
        accumulated += dur
      }

      const positionInPhase = positionInCycle - phaseStart
      const phaseProgress = phaseDuration > 0 ? Math.min(1, positionInPhase / phaseDuration) : 0
      const cycleProgress = cycleDuration > 0 ? positionInCycle / cycleDuration : 0

      return { phase, phaseProgress, cycleProgress, cycleNumber }
    },
    []
  )

  /**
   * Update loop for timed modes
   */
  const update = useCallback(() => {
    const now = performance.now()
    const mode = timingModeRef.current

    // Handle "Get Ready" phase (warmup before session timer starts)
    if (isGetReadyRef.current && getReadyStartRef.current) {
      const getReadyElapsed = now - getReadyStartRef.current
      const getReadyDuration = getReadyDurationRef.current

      if (getReadyElapsed >= getReadyDuration) {
        // Get Ready complete - start the actual session
        isGetReadyRef.current = false
        sessionStartRef.current = now

        setState((prev) => ({
          ...prev,
          isGetReady: false,
          getReadyProgress: 1,
          currentPhase: 'breathe',
          phaseProgress: 0,
          cycleProgress: 0,
          elapsedMs: 0,
        }))
      } else {
        // Still in Get Ready - update progress
        const progress = getReadyElapsed / getReadyDuration

        setState((prev) => ({
          ...prev,
          getReadyProgress: progress,
          cycleProgress: progress, // Ring fills during getReady
        }))
      }

      animationFrameRef.current = requestAnimationFrame(update)
      return
    }

    // Normal session logic (after Get Ready)
    if (!sessionStartRef.current) return

    const elapsed = now - sessionStartRef.current

    setState((prev) => {
      if (!prev.isRunning) return prev

      // Check if session is complete (time-based)
      if (elapsed >= prev.totalSessionMs) {
        onSessionComplete?.()
        return {
          ...prev,
          isRunning: false,
          sessionProgress: 1,
          elapsedMs: prev.totalSessionMs,
        }
      }

      if (mode === 'flexible') {
        // Flexible mode: phase determined by phoneme detection
        const sessionProgress = elapsed / prev.totalSessionMs
        return {
          ...prev,
          currentPhase: flexiblePhaseRef.current,
          phaseProgress: 0, // No fixed progress in flexible
          cycleProgress: 0,
          sessionProgress,
          elapsedMs: elapsed,
        }
      }

      // Timed modes
      const { phase, phaseProgress, cycleProgress, cycleNumber } = calculatePhaseFromTime(
        elapsed,
        mode
      )
      const sessionProgress = elapsed / prev.totalSessionMs

      return {
        ...prev,
        currentPhase: phase,
        phaseProgress,
        cycleProgress,
        sessionProgress,
        currentCycle: Math.min(cycleNumber, prev.totalCycles),
        elapsedMs: elapsed,
      }
    })

    animationFrameRef.current = requestAnimationFrame(update)
  }, [calculatePhaseFromTime, onSessionComplete])

  /**
   * Start a guided session
   */
  const startSession = useCallback(
    (duration: SessionDuration, mode: TimingMode = 'traditional') => {
      const totalCycles = getSessionCycles(duration, mode)
      const totalSessionMs = duration * 60 * 1000 // Always use actual duration

      // Calculate getReady duration (one full cycle)
      const readyDuration = getReadyDuration(mode)

      // Start with Get Ready phase
      const now = performance.now()
      getReadyStartRef.current = now
      getReadyDurationRef.current = readyDuration
      isGetReadyRef.current = true
      sessionStartRef.current = null // Session timer starts AFTER getReady

      lastCycleRef.current = 0
      lastPhaseRef.current = 'breathe'
      lastSampleTimeRef.current = now
      timingModeRef.current = mode
      flexiblePhaseRef.current = 'breathe'
      flexibleCycleStateRef.current = 'idle'

      // Reset tracking
      phaseScoresRef.current = {
        ah: { samples: 0, aligned: 0 },
        oo: { samples: 0, aligned: 0 },
        mm: { samples: 0, aligned: 0 },
      }

      cycleQualityRef.current = {
        ahScore: 0,
        ooScore: 0,
        mmScore: 0,
        overallScore: 0,
        isLocked: false,
      }

      phonemeAlignmentRef.current = {
        ah: { totalMs: 0, inRangeMs: 0 },
        oo: { totalMs: 0, inRangeMs: 0 },
        mm: { totalMs: 0, inRangeMs: 0 },
      }

      setState({
        isRunning: true,
        timingMode: mode,
        currentPhase: 'getReady',
        phaseProgress: 0,
        cycleProgress: 0,
        sessionProgress: 0,
        currentCycle: 1,
        totalCycles,
        elapsedMs: 0,
        totalSessionMs,
        sessionDurationMin: duration,
        isGetReady: true,
        getReadyProgress: 0,
      })

      animationFrameRef.current = requestAnimationFrame(update)
    },
    [update]
  )

  /**
   * Stop the session
   */
  const stopSession = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    sessionStartRef.current = null
    getReadyStartRef.current = null
    isGetReadyRef.current = false

    setState((prev) => ({
      ...prev,
      isRunning: false,
      isGetReady: false,
    }))
  }, [])

  /**
   * Record a sample for quality calculation
   */
  const recordSample = useCallback(
    (phoneme: Phoneme, pitch: PitchData) => {
      if (!sessionStartRef.current) return

      const now = performance.now()
      const elapsed = now - sessionStartRef.current
      const deltaMs = now - lastSampleTimeRef.current
      lastSampleTimeRef.current = now

      const mode = timingModeRef.current

      // Handle flexible mode differently
      if (mode === 'flexible') {
        // Update phase based on detected phoneme
        const cycleState = flexibleCycleStateRef.current

        // State machine for flexible mode
        if (phoneme === 'silence') {
          if (cycleState === 'm') {
            // Completed a cycle: A → U → M → silence
            const scores = phaseScoresRef.current
            const ahScore =
              scores.ah.samples > 0 ? Math.round((scores.ah.aligned / scores.ah.samples) * 100) : 0
            const ooScore =
              scores.oo.samples > 0 ? Math.round((scores.oo.aligned / scores.oo.samples) * 100) : 0
            const mmScore =
              scores.mm.samples > 0 ? Math.round((scores.mm.aligned / scores.mm.samples) * 100) : 0

            const overallScore = Math.round(ahScore * 0.25 + ooScore * 0.25 + mmScore * 0.5)

            const quality: CycleQuality = {
              ahScore,
              ooScore,
              mmScore,
              overallScore,
              isLocked: overallScore >= LOCK_THRESHOLD,
            }

            cycleQualityRef.current = quality
            lastCycleRef.current++
            onCycleComplete?.(quality, lastCycleRef.current)

            // Update state with new cycle count
            setState((prev) => ({
              ...prev,
              currentCycle: lastCycleRef.current + 1,
            }))

            // Reset for next cycle
            phaseScoresRef.current = {
              ah: { samples: 0, aligned: 0 },
              oo: { samples: 0, aligned: 0 },
              mm: { samples: 0, aligned: 0 },
            }

            flexibleCycleStateRef.current = 'idle'
          }
          flexiblePhaseRef.current = 'breathe'
        } else if (phoneme === 'A') {
          flexiblePhaseRef.current = 'ah'
          if (cycleState === 'idle') {
            flexibleCycleStateRef.current = 'a'
          }
        } else if (phoneme === 'U') {
          flexiblePhaseRef.current = 'oo'
          if (cycleState === 'a') {
            flexibleCycleStateRef.current = 'u'
          }
        } else if (phoneme === 'M') {
          flexiblePhaseRef.current = 'mm'
          if (cycleState === 'u') {
            flexibleCycleStateRef.current = 'm'
          }
        }

        // Track alignment for current phoneme (only when vocalizing with detected pitch)
        if ((phoneme === 'A' || phoneme === 'U' || phoneme === 'M') && pitch.frequency !== null) {
          const phaseKey = phoneme === 'A' ? 'ah' : phoneme === 'U' ? 'oo' : 'mm'
          const scores = phaseScoresRef.current[phaseKey]
          const alignment = phonemeAlignmentRef.current[phaseKey]

          scores.samples++
          alignment.totalMs += deltaMs

          if (pitch.isWithinTolerance) {
            scores.aligned++
            alignment.inRangeMs += deltaMs
          }
        }

        return
      }

      // Timed modes
      const { phase, cycleNumber } = calculatePhaseFromTime(elapsed, mode)

      // Check for phase transition
      if (phase !== lastPhaseRef.current) {
        lastPhaseRef.current = phase

        // If entering breathe phase from mm, cycle just completed
        if (phase === 'breathe' && cycleNumber > lastCycleRef.current) {
          const scores = phaseScoresRef.current
          const config = TIMING_CONFIGS[mode]

          const ahScore =
            scores.ah.samples > 0 ? Math.round((scores.ah.aligned / scores.ah.samples) * 100) : 0
          const ooScore =
            scores.oo.samples > 0 ? Math.round((scores.oo.aligned / scores.oo.samples) * 100) : 0
          const mmScore =
            scores.mm.samples > 0 ? Math.round((scores.mm.aligned / scores.mm.samples) * 100) : 0

          // Weight by duration
          const totalVocalDuration = config.ah + config.oo + config.mm
          const overallScore = Math.round(
            (ahScore * config.ah + ooScore * config.oo + mmScore * config.mm) / totalVocalDuration
          )

          const quality: CycleQuality = {
            ahScore,
            ooScore,
            mmScore,
            overallScore,
            isLocked: overallScore >= LOCK_THRESHOLD,
          }

          cycleQualityRef.current = quality
          onCycleComplete?.(quality, lastCycleRef.current)

          // Reset for next cycle
          phaseScoresRef.current = {
            ah: { samples: 0, aligned: 0 },
            oo: { samples: 0, aligned: 0 },
            mm: { samples: 0, aligned: 0 },
          }

          lastCycleRef.current = cycleNumber
        }
      }

      // Record sample for current phase (skip breathe phase)
      if (phase !== 'breathe') {
        const phaseKey = phase as 'ah' | 'oo' | 'mm'
        const scores = phaseScoresRef.current[phaseKey]
        const alignment = phonemeAlignmentRef.current[phaseKey]

        // Only count when user is vocalizing (not silence)
        if (phoneme !== 'silence' && pitch.frequency !== null) {
          scores.samples++
          alignment.totalMs += deltaMs

          // Aligned if within pitch tolerance (regardless of which phoneme detected)
          if (pitch.isWithinTolerance) {
            scores.aligned++
            alignment.inRangeMs += deltaMs
          }
        }
      }
    },
    [calculatePhaseFromTime, onCycleComplete]
  )

  /**
   * Get expected phoneme for current phase
   */
  const getExpectedPhoneme = useCallback((): Phoneme | null => {
    return PHASE_PHONEMES[state.currentPhase]
  }, [state.currentPhase])

  /**
   * Get current cycle quality
   */
  const getCurrentCycleQuality = useCallback((): CycleQuality => {
    return cycleQualityRef.current
  }, [])

  /**
   * Get session-wide phoneme alignment data
   */
  const getPhonemeAlignment = useCallback((): PhonemeAlignmentData => {
    return phonemeAlignmentRef.current
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
    startSession,
    stopSession,
    recordSample,
    getExpectedPhoneme,
    getCurrentCycleQuality,
    getPhonemeAlignment,
  }
}

/**
 * Get display label for a phase
 */
export function getPhaseLabel(phase: CyclePhase): string {
  switch (phase) {
    case 'getReady':
      return 'Get Ready'
    case 'breathe':
      return 'Breathe'
    case 'ah':
      return 'Ah'
    case 'oo':
      return 'Oo'
    case 'mm':
      return 'Mm'
  }
}

/**
 * Format milliseconds as M:SS (for elapsed time display)
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Legacy: Format time remaining
 */
export function formatTimeRemaining(ms: number): string {
  return formatTime(ms)
}
