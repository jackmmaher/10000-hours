/**
 * useGuidedOmCycle - Guided Aum practice session state machine
 *
 * Flow:
 * 1. Practice Phase (3 cycles) - User learns rhythm, not scored
 *    - First breathe is 1.5x longer for gentle introduction
 *    - Cycles labeled "Practice Cycle 1/2/3 of 3"
 * 2. "Session begins now" message (dissolves)
 * 3. Scored Phase (N cycles) - Counts toward session metrics
 *    - Cycles labeled "Cycle 1 of N"
 *
 * Supports three timing modes (all use 2:1:1:2 ratio):
 * - Traditional: 18s cycle (Breathe 6s, Ah 3s, Oo 3s, Mm 6s)
 * - Extended: 24s cycle (Breathe 8s, Ah 4s, Oo 4s, Mm 8s)
 * - Long Breath: 36s cycle (Breathe 12s, Ah 6s, Oo 6s, Mm 12s)
 *
 * Circle progress is always clockwise, continuous flow.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Phoneme } from './useFormantDetection'
import type { PitchData } from './usePitchDetection'
import type { CoherenceData } from './useVocalCoherence'

// Timing modes
export type TimingMode = 'traditional' | 'extended' | 'longbreath'

// Phase timing configurations in milliseconds
// All modes use 1:1:2 ratio (breathe:ah:oo:mm = 2:1:1:2)
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
  longbreath: { breathe: 12000, ah: 6000, oo: 6000, mm: 12000 }, // 36s total
}

// First breathe multiplier - set to 1.0 (was 1.5, removed to prevent exhaling before Ah)
export const FIRST_BREATHE_MULTIPLIER = 1.0

// Number of practice cycles before scored session
export const PRACTICE_CYCLES = 3

// Get phase durations for a timing mode
export function getPhaseDurations(mode: TimingMode) {
  return TIMING_CONFIGS[mode]
}

// Get cycle duration for a timing mode (normal cycle, not first)
export function getCycleDuration(mode: TimingMode): number {
  const config = TIMING_CONFIGS[mode]
  return config.breathe + config.ah + config.oo + config.mm
}

// Get first cycle duration (with extended first breathe)
export function getFirstCycleDuration(mode: TimingMode): number {
  const config = TIMING_CONFIGS[mode]
  const firstBreathe = config.breathe * FIRST_BREATHE_MULTIPLIER
  return firstBreathe + config.ah + config.oo + config.mm
}

// Session duration options (legacy - prefer cycle count)
export type SessionDuration = 5 | 10 | 15

// Cycle count options
export type CycleCount = 8 | 12 | 16 | 20

// Calculate scored cycles for duration and timing mode (legacy)
export function getSessionCycles(duration: SessionDuration, mode: TimingMode): number {
  const cycleDuration = getCycleDuration(mode)
  return Math.floor((duration * 60 * 1000) / cycleDuration)
}

/**
 * Calculate total session time from cycle count and mode
 * Includes 3 practice cycles
 */
export function getSessionTimeMs(cycleCount: CycleCount, mode: TimingMode): number {
  const cycleDuration = getCycleDuration(mode)
  const practiceTime = cycleDuration * PRACTICE_CYCLES
  const scoredTime = cycleDuration * cycleCount
  return practiceTime + scoredTime
}

/**
 * Format session time for display (e.g., "5:42")
 */
export function formatSessionTime(cycleCount: CycleCount, mode: TimingMode): string {
  const totalMs = getSessionTimeMs(cycleCount, mode)
  const totalSeconds = Math.round(totalMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Legacy exports for backwards compatibility
export const SESSION_CYCLES: Record<SessionDuration, number> = {
  5: 18,
  10: 37,
  15: 56,
}
export const PHASE_DURATIONS = TIMING_CONFIGS.traditional

// Phases in order (no more getReady - starts directly with breathe)
export type CyclePhase = 'breathe' | 'ah' | 'oo' | 'mm'
const PHASE_ORDER: CyclePhase[] = ['breathe', 'ah', 'oo', 'mm']

// Map phases to expected phonemes for scoring
const PHASE_PHONEMES: Record<CyclePhase, Phoneme | null> = {
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
  phaseProgress: number // 0-1 within current phase
  cycleProgress: number // 0-1 within current cycle
  totalProgress: number // Continuous progress across cycles (never resets, use % 1 for display)
  isFirstCycle: boolean // True during first practice cycle (extended breathe)

  // Practice phase (3 cycles, not scored)
  isPractice: boolean
  practiceCycleNumber: number // 1, 2, or 3 during practice
  practiceTotalCycles: number // always 3

  // Transition indicator
  showSessionStart: boolean // briefly true when scored session begins

  // Scored session (what counts)
  currentCycle: number // 1 to totalCycles (scored only)
  totalCycles: number // total scored cycles

  // Timing
  elapsedMs: number // elapsed time in SCORED session only (not practice)
  totalSessionMs: number // total scored session duration
  sessionDurationMin: SessionDuration

  // Legacy compatibility (deprecated)
  isGetReady: boolean
  getReadyProgress: number
}

export interface UseGuidedOmCycleOptions {
  onCycleComplete?: (quality: CycleQuality, cycleNumber: number) => void
  onSessionComplete?: () => void
  onPracticeCycleComplete?: (cycleNumber: number) => void
  onScoredSessionStart?: () => void
}

export interface StartSessionOptions {
  mode?: TimingMode
  // Either provide duration (legacy) or cycleCount (new)
  duration?: SessionDuration
  cycleCount?: CycleCount
}

export interface UseGuidedOmCycleResult {
  state: GuidedCycleState
  startSession: (options: StartSessionOptions) => void
  // Legacy overload for backwards compatibility
  startSessionLegacy: (duration: SessionDuration, mode?: TimingMode) => void
  stopSession: () => void
  recordSample: (phoneme: Phoneme, pitch: PitchData, coherence?: CoherenceData) => void
  getExpectedPhoneme: () => Phoneme | null
  getCurrentCycleQuality: () => CycleQuality
  getPhonemeAlignment: () => PhonemeAlignmentData
}

export function useGuidedOmCycle(options: UseGuidedOmCycleOptions = {}): UseGuidedOmCycleResult {
  const { onCycleComplete, onSessionComplete, onPracticeCycleComplete, onScoredSessionStart } =
    options

  const [state, setState] = useState<GuidedCycleState>({
    isRunning: false,
    timingMode: 'traditional',
    currentPhase: 'breathe',
    phaseProgress: 0,
    cycleProgress: 0,
    totalProgress: 0,
    isFirstCycle: true,
    isPractice: true,
    practiceCycleNumber: 1,
    practiceTotalCycles: PRACTICE_CYCLES,
    showSessionStart: false,
    currentCycle: 1,
    totalCycles: 0,
    elapsedMs: 0,
    totalSessionMs: 0,
    sessionDurationMin: 5,
    // Legacy (deprecated)
    isGetReady: false,
    getReadyProgress: 0,
  })

  // Refs for timing
  const sessionStartRef = useRef<number | null>(null)
  const practiceStartRef = useRef<number | null>(null)
  const scoredStartRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const timingModeRef = useRef<TimingMode>('traditional')
  const sessionStartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track which cycle we're in (absolute, includes practice)
  const absoluteCycleRef = useRef(1)
  const isPracticeRef = useRef(true)

  // Per-cycle quality tracking using coherence scores (for scored cycles only)
  const coherenceScoresRef = useRef<number[]>([])

  // Legacy per-phase tracking (kept for PhonemeAlignmentData compatibility)
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

  // Session-wide phoneme alignment tracking (for results - scored only)
  const phonemeAlignmentRef = useRef<PhonemeAlignmentData>({
    ah: { totalMs: 0, inRangeMs: 0 },
    oo: { totalMs: 0, inRangeMs: 0 },
    mm: { totalMs: 0, inRangeMs: 0 },
  })

  const lastSampleTimeRef = useRef<number>(0)
  const lastAbsoluteCycleRef = useRef(0)
  const lastPhaseRef = useRef<CyclePhase>('breathe')

  /**
   * Get cycle duration accounting for first cycle's extended breathe
   */
  const getCycleDurationForCycle = useCallback((cycleNumber: number, mode: TimingMode): number => {
    if (cycleNumber === 1) {
      return getFirstCycleDuration(mode)
    }
    return getCycleDuration(mode)
  }, [])

  /**
   * Calculate phase from elapsed time within a cycle (for TIMED modes only)
   */
  const calculatePhaseFromCyclePosition = useCallback(
    (
      positionInCycle: number,
      isFirstCycle: boolean,
      mode: TimingMode
    ): {
      phase: CyclePhase
      phaseProgress: number
      cycleDuration: number
    } => {
      const config = TIMING_CONFIGS[mode]
      const breatheDuration = isFirstCycle
        ? config.breathe * FIRST_BREATHE_MULTIPLIER
        : config.breathe

      const cycleDuration = breatheDuration + config.ah + config.oo + config.mm

      let phase: CyclePhase = 'breathe'
      let phaseStart = 0
      let phaseDuration = breatheDuration

      const phaseDurations = [breatheDuration, config.ah, config.oo, config.mm]

      let accumulated = 0
      for (let i = 0; i < PHASE_ORDER.length; i++) {
        const dur = phaseDurations[i]
        if (positionInCycle < accumulated + dur) {
          phase = PHASE_ORDER[i]
          phaseStart = accumulated
          phaseDuration = dur
          break
        }
        accumulated += dur
      }

      const positionInPhase = positionInCycle - phaseStart
      const phaseProgress = phaseDuration > 0 ? Math.min(1, positionInPhase / phaseDuration) : 0

      return { phase, phaseProgress, cycleDuration }
    },
    []
  )

  /**
   * Calculate absolute cycle number and position from total elapsed time (for TIMED modes)
   */
  const calculateCycleFromTime = useCallback(
    (
      totalElapsed: number,
      mode: TimingMode
    ): {
      absoluteCycle: number
      positionInCycle: number
      cycleDuration: number
    } => {
      let elapsed = 0
      let cycleNum = 1

      while (true) {
        const cycleDur = getCycleDurationForCycle(cycleNum, mode)
        if (totalElapsed < elapsed + cycleDur) {
          return {
            absoluteCycle: cycleNum,
            positionInCycle: totalElapsed - elapsed,
            cycleDuration: cycleDur,
          }
        }
        elapsed += cycleDur
        cycleNum++

        // Safety limit
        if (cycleNum > 1000) break
      }

      return { absoluteCycle: cycleNum, positionInCycle: 0, cycleDuration: getCycleDuration(mode) }
    },
    [getCycleDurationForCycle]
  )

  /**
   * Handle cycle completion
   */
  const handleCycleComplete = useCallback(
    (previousCycle: number, now: number) => {
      // Was previous cycle a practice cycle?
      if (previousCycle <= PRACTICE_CYCLES) {
        onPracticeCycleComplete?.(previousCycle)

        // If transitioning FROM practice TO scored
        if (previousCycle === PRACTICE_CYCLES) {
          isPracticeRef.current = false
          scoredStartRef.current = now

          // Show "Session begins now" message
          setState((prev) => ({ ...prev, showSessionStart: true }))

          // Clear any existing timeout before setting new one
          if (sessionStartTimeoutRef.current) {
            clearTimeout(sessionStartTimeoutRef.current)
          }
          // Clear message after 2 seconds (tracked for cleanup)
          sessionStartTimeoutRef.current = setTimeout(() => {
            setState((prev) => ({ ...prev, showSessionStart: false }))
            sessionStartTimeoutRef.current = null
          }, 2000)

          onScoredSessionStart?.()
        }
      } else {
        // Previous cycle was a scored cycle - calculate quality from coherence
        const coherenceScores = coherenceScoresRef.current

        // Calculate average coherence for the cycle
        const overallScore =
          coherenceScores.length > 0
            ? Math.round(coherenceScores.reduce((a, b) => a + b, 0) / coherenceScores.length)
            : 0

        // Per-phase scores are now deprecated but kept for UI compatibility
        // Just use overall coherence for all phases
        const quality: CycleQuality = {
          ahScore: overallScore,
          ooScore: overallScore,
          mmScore: overallScore,
          overallScore,
          isLocked: overallScore >= LOCK_THRESHOLD,
        }

        cycleQualityRef.current = quality
        onCycleComplete?.(quality, previousCycle - PRACTICE_CYCLES)

        // Reset coherence scores for next cycle
        coherenceScoresRef.current = []

        // Reset legacy phase scores
        phaseScoresRef.current = {
          ah: { samples: 0, aligned: 0 },
          oo: { samples: 0, aligned: 0 },
          mm: { samples: 0, aligned: 0 },
        }
      }
    },
    [onCycleComplete, onPracticeCycleComplete, onScoredSessionStart]
  )

  /**
   * Update loop for TIMED modes (traditional, extended)
   */
  const updateTimed = useCallback(() => {
    const now = performance.now()
    const mode = timingModeRef.current

    if (!practiceStartRef.current) return

    const totalElapsed = now - practiceStartRef.current

    // Calculate current position
    const { absoluteCycle, positionInCycle, cycleDuration } = calculateCycleFromTime(
      totalElapsed,
      mode
    )
    const isFirstCycle = absoluteCycle === 1
    const { phase, phaseProgress } = calculatePhaseFromCyclePosition(
      positionInCycle,
      isFirstCycle,
      mode
    )
    const cycleProgress = cycleDuration > 0 ? positionInCycle / cycleDuration : 0

    // Update phase ref for sample recording
    lastPhaseRef.current = phase

    // Determine if still in practice phase
    const stillInPractice = absoluteCycle <= PRACTICE_CYCLES
    const practiceCycleNumber = stillInPractice ? absoluteCycle : 0
    const scoredCycleNumber = stillInPractice ? 0 : absoluteCycle - PRACTICE_CYCLES

    // Check for cycle transitions
    if (absoluteCycle !== absoluteCycleRef.current) {
      handleCycleComplete(absoluteCycleRef.current, now)
      absoluteCycleRef.current = absoluteCycle
    }

    // Calculate scored session elapsed time
    const scoredElapsed = scoredStartRef.current ? now - scoredStartRef.current : 0

    // Track if session should complete (checked before setState to avoid side effect in updater)
    let shouldCompleteSession = false

    setState((prev) => {
      if (!prev.isRunning) return prev

      // Check if scored session is complete (time-based)
      if (!stillInPractice && scoredElapsed >= prev.totalSessionMs) {
        shouldCompleteSession = true
        return {
          ...prev,
          isRunning: false,
          elapsedMs: prev.totalSessionMs,
        }
      }

      // Calculate continuous total progress (never resets, always increases)
      const totalProgress = absoluteCycle - 1 + cycleProgress

      return {
        ...prev,
        currentPhase: phase,
        phaseProgress,
        cycleProgress,
        totalProgress,
        isFirstCycle: absoluteCycle === 1,
        isPractice: stillInPractice,
        practiceCycleNumber,
        currentCycle: stillInPractice ? 1 : scoredCycleNumber,
        elapsedMs: stillInPractice ? 0 : scoredElapsed,
      }
    })

    // Call onSessionComplete outside setState to avoid side effect in updater
    if (shouldCompleteSession) {
      onSessionComplete?.()
      return // Don't schedule next frame if session complete
    }

    animationFrameRef.current = requestAnimationFrame(updateTimed)
  }, [
    calculateCycleFromTime,
    calculatePhaseFromCyclePosition,
    handleCycleComplete,
    onSessionComplete,
  ])

  /**
   * Start a guided session (new API with options)
   */
  const startSession = useCallback(
    (options: StartSessionOptions) => {
      const mode = options.mode ?? 'traditional'

      // Determine cycle count - prefer explicit cycleCount, fallback to duration-based calculation
      let totalCycles: number
      let totalSessionMs: number

      if (options.cycleCount !== undefined) {
        // New cycle-based approach
        totalCycles = options.cycleCount
        totalSessionMs = getSessionTimeMs(options.cycleCount, mode)
      } else if (options.duration !== undefined) {
        // Legacy duration-based approach
        totalCycles = getSessionCycles(options.duration, mode)
        totalSessionMs = options.duration * 60 * 1000
      } else {
        // Default to 12 cycles if nothing specified
        totalCycles = 12
        totalSessionMs = getSessionTimeMs(12, mode)
      }

      const now = performance.now()
      practiceStartRef.current = now
      scoredStartRef.current = null // Will be set when practice ends
      sessionStartRef.current = now

      absoluteCycleRef.current = 1
      isPracticeRef.current = true
      lastAbsoluteCycleRef.current = 0
      lastPhaseRef.current = 'breathe'
      lastSampleTimeRef.current = now
      timingModeRef.current = mode

      // Reset tracking
      coherenceScoresRef.current = []
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
        currentPhase: 'breathe',
        phaseProgress: 0,
        cycleProgress: 0,
        totalProgress: 0,
        isFirstCycle: true,
        isPractice: true,
        practiceCycleNumber: 1,
        practiceTotalCycles: PRACTICE_CYCLES,
        showSessionStart: false,
        currentCycle: 1,
        totalCycles,
        elapsedMs: 0,
        totalSessionMs,
        sessionDurationMin: options.duration ?? 5,
        // Legacy (deprecated)
        isGetReady: false,
        getReadyProgress: 0,
      })

      animationFrameRef.current = requestAnimationFrame(updateTimed)
    },
    [updateTimed]
  )

  /**
   * Legacy start session API for backwards compatibility
   */
  const startSessionLegacy = useCallback(
    (duration: SessionDuration, mode: TimingMode = 'traditional') => {
      startSession({ duration, mode })
    },
    [startSession]
  )

  /**
   * Stop the session
   */
  const stopSession = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    // Clear session start timeout if pending
    if (sessionStartTimeoutRef.current) {
      clearTimeout(sessionStartTimeoutRef.current)
      sessionStartTimeoutRef.current = null
    }
    practiceStartRef.current = null
    scoredStartRef.current = null
    sessionStartRef.current = null
    isPracticeRef.current = true

    setState((prev) => ({
      ...prev,
      isRunning: false,
      isPractice: false,
      showSessionStart: false,
    }))
  }, [])

  /**
   * Record a sample for quality calculation
   * Now primarily uses coherence data instead of pitch tolerance
   */
  const recordSample = useCallback(
    (phoneme: Phoneme, pitch: PitchData, coherence?: CoherenceData) => {
      if (!practiceStartRef.current) return

      const now = performance.now()
      const deltaMs = now - lastSampleTimeRef.current
      lastSampleTimeRef.current = now

      // Skip scoring during practice cycles
      if (isPracticeRef.current) return

      // Get current phase from state
      const currentPhase = lastPhaseRef.current

      // Record coherence sample for cycle quality (skip breathe phase)
      if (currentPhase !== 'breathe' && coherence && coherence.score > 0) {
        coherenceScoresRef.current.push(coherence.score)
      }

      // Legacy per-phase tracking for PhonemeAlignmentData (skip breathe phase)
      if (currentPhase !== 'breathe') {
        const phaseKey = currentPhase as 'ah' | 'oo' | 'mm'
        const alignment = phonemeAlignmentRef.current[phaseKey]

        // Only count when user is vocalizing (not silence)
        if (phoneme !== 'silence' && pitch.frequency !== null) {
          alignment.totalMs += deltaMs

          // For legacy compatibility, count as "in range" if coherence is good
          if (coherence && coherence.score >= 50) {
            alignment.inRangeMs += deltaMs
          }
        }
      }
    },
    []
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
      if (sessionStartTimeoutRef.current) {
        clearTimeout(sessionStartTimeoutRef.current)
      }
    }
  }, [])

  return {
    state,
    startSession,
    startSessionLegacy,
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
    case 'breathe':
      return 'Breathe In'
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

/**
 * Legacy: Get Ready duration (deprecated - returns 0)
 */
export function getReadyDuration(_mode: TimingMode): number {
  return 0
}
