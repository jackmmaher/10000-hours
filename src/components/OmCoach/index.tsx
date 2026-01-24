/**
 * OmCoach - Guided Aum practice with real-time vocal biofeedback
 *
 * Main orchestrator component that coordinates:
 * - Audio capture (microphone)
 * - Pitch detection (pitchy)
 * - Formant-based phoneme detection (calibrated)
 * - Guided cycle timing with multiple modes
 * - Session recording with vocal coherence scoring
 *
 * Scientific foundation:
 * - Sustained humming increases nasal NO 15-20x
 * - Aum chanting shows fMRI patterns matching vagus nerve stimulation
 * - Extended exhalation improves HRV (target: 16-20s cycles)
 * - Vowel shapes matter: Ah (chest), Oo (vagus), Mm (nitric oxide)
 * - Optimal frequency emerges naturally through correct technique
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigationStore } from '../../stores/useNavigationStore'
import { useHourBankStore } from '../../stores/useHourBankStore'
import { useOmAudioCapture, isAboveNoiseGate } from '../../hooks/useOmAudioCapture'
import { usePitchDetection } from '../../hooks/usePitchDetection'
import { useFormantDetection } from '../../hooks/useFormantDetection'
import { usePhonemeCalibration } from '../../hooks/usePhonemeCalibration'
import { useVocalCoherence } from '../../hooks/useVocalCoherence'
import { useAdaptiveBaseline } from '../../hooks/useAdaptiveBaseline'
import { useOmSession, type OmSessionResult } from '../../hooks/useOmSession'
import {
  useGuidedOmCycle,
  type TimingMode,
  type CycleCount,
  type CycleQuality,
  getSessionTimeMs,
} from '../../hooks/useGuidedOmCycle'
import type { CoherenceMetrics } from './OmCoachResults'
import { OmCoachSetup } from './OmCoachSetup'
import { OmCoachPractice } from './OmCoachPractice'
import { OmCoachResults } from './OmCoachResults'
import { OmCoachErrorBoundary } from './OmCoachErrorBoundary'
import { PhonemeCalibration } from './PhonemeCalibration'
import { Paywall } from '../Paywall'
import { LowHoursWarning } from '../LowHoursWarning'

type OmCoachPhase = 'setup' | 'calibration' | 'practice' | 'results'

interface OmCoachProps {
  onClose: () => void
}

interface CelebrationState {
  show: boolean
  quality: CycleQuality
  cycleNumber: number
}

export function OmCoach({ onClose }: OmCoachProps) {
  const setFullscreen = useNavigationStore((s) => s.setFullscreen)
  const setView = useNavigationStore((s) => s.setView)
  const { canMeditate, isCriticallyLow, available } = useHourBankStore()

  const [phase, setPhase] = useState<OmCoachPhase>('setup')
  const [error, setError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [sessionResult, setSessionResult] = useState<OmSessionResult | null>(null)
  const [isAudioActive, setIsAudioActive] = useState(false)
  const [celebration, setCelebration] = useState<CelebrationState | null>(null)
  const [coherenceMetrics, setCoherenceMetrics] = useState<CoherenceMetrics | null>(null)

  // Note: Formant data is accessed via getFormantData() getter passed to OmCoachPractice
  // No need for state here as the getter provides real-time data from refs

  // Paywall modal states
  const [showPaywall, setShowPaywall] = useState(false)
  const [showLowHoursWarning, setShowLowHoursWarning] = useState(false)
  const [pendingSession, setPendingSession] = useState<{
    cycleCount: CycleCount
    mode: TimingMode
  } | null>(null)

  // Track locked cycles for results
  const lockedCyclesRef = useRef(0)
  const totalCyclesRef = useRef(0)

  // Cumulative coherence tracking during session
  const coherenceSamplesRef = useRef<number[]>([])
  const pitchStabilitySamplesRef = useRef<number[]>([])
  const amplitudeSmoothnessSamplesRef = useRef<number[]>([])
  const voicingContinuitySamplesRef = useRef<number[]>([])
  const pitchVarianceSamplesRef = useRef<number[]>([])
  const amplitudeCVSamplesRef = useRef<number[]>([])

  // Audio hooks
  const audioCapture = useOmAudioCapture()
  const pitchDetection = usePitchDetection()

  // Formant-based phoneme detection with calibration
  const formantDetection = useFormantDetection()
  const phonemeCalibration = usePhonemeCalibration()

  // Store calibration profile in state so we can pass it to coherence
  const [calibrationProfile, setCalibrationProfile] = useState(phonemeCalibration.profile)

  // Load adaptive baseline from session history
  const { baseline: adaptiveBaseline, stats: historicalStats } = useAdaptiveBaseline()

  // Vocal coherence tracking - now calibration and history aware
  const vocalCoherence = useVocalCoherence({
    calibration: calibrationProfile,
    adaptiveBaseline: adaptiveBaseline,
  })
  const omSession = useOmSession()

  // Track previous phase for detecting transitions (initialized after guidedCycle hook)
  const prevPhaseRef = useRef<string>('breathe')

  // Load calibration on mount and apply to formant detection
  // Using refs to store stable function references to avoid unnecessary effect runs
  const loadCalibrationRef = useRef(phonemeCalibration.loadCalibration)
  const setCalibrationRef = useRef(formantDetection.setCalibration)

  useEffect(() => {
    loadCalibrationRef.current = phonemeCalibration.loadCalibration
    setCalibrationRef.current = formantDetection.setCalibration
  }, [phonemeCalibration.loadCalibration, formantDetection.setCalibration])

  useEffect(() => {
    const profile = loadCalibrationRef.current()
    if (profile) {
      setCalibrationRef.current(profile)
      setCalibrationProfile(profile)
    }
  }, [])

  // Guided cycle hook
  const handleCycleComplete = useCallback((quality: CycleQuality, cycleNumber: number) => {
    if (quality.isLocked) {
      lockedCyclesRef.current++
      setCelebration({ show: true, quality, cycleNumber })
    }
  }, [])

  // Ref to hold handleEndSession for use in callbacks without stale closure
  // Initialized to a no-op, updated after handleEndSession is defined
  const handleEndSessionRef = useRef<() => void>(() => {})

  const handleSessionComplete = useCallback(() => {
    // Session ended naturally - trigger end session
    // Uses ref to always get latest handleEndSession without dependency
    handleEndSessionRef.current()
  }, [])

  const guidedCycle = useGuidedOmCycle({
    onCycleComplete: handleCycleComplete,
    onSessionComplete: handleSessionComplete,
  })

  // Detect phase transitions and notify coherence hook
  // This enables smooth transitions without penalizing the user
  useEffect(() => {
    const currentPhase = guidedCycle.state.currentPhase
    if (currentPhase !== prevPhaseRef.current) {
      vocalCoherence.notifyPhaseTransition(currentPhase)
      prevPhaseRef.current = currentPhase
    }
  }, [guidedCycle.state.currentPhase, vocalCoherence])

  // Animation frame ref for audio processing loop
  const animationFrameRef = useRef<number | null>(null)
  const isProcessingRef = useRef(false)

  // Throttle formant detection to every 3rd frame (~20fps) to reduce CPU load
  // Pitch detection still runs at 60fps for smooth frequency bar
  const frameCountRef = useRef(0)

  /**
   * Audio processing loop - runs at ~60fps
   * CRITICAL: Reads from refs, not React state
   *
   * Uses formant-based phoneme detection and vocal coherence scoring.
   */
  const processAudio = useCallback(() => {
    try {
      // Check ref to avoid stale closure issues with state
      if (!isProcessingRef.current) {
        return
      }

      frameCountRef.current++
      const shouldAnalyzeFormant = frameCountRef.current % 3 === 0 // ~20fps for formant

      const frequencyData = audioCapture.getFrequencyData()
      const timeDomainData = audioCapture.getTimeDomainData()
      const sampleRate = audioCapture.getSampleRate()

      if (frequencyData && timeDomainData && isAboveNoiseGate(timeDomainData)) {
        // Analyze pitch EVERY frame for smooth coherence display
        const pitchData = pitchDetection.analyze(frequencyData, sampleRate)

        // Analyze phoneme less frequently (every 3rd frame) - it's CPU heavy
        if (shouldAnalyzeFormant) {
          const formantData = formantDetection.analyze(frequencyData, sampleRate)

          // Record sample for vocal coherence
          vocalCoherence.recordSample(pitchData.frequency, formantData.rms)

          // Record sample for guided cycle quality (still uses coherence for lock detection)
          guidedCycle.recordSample(
            formantData.detectedPhoneme,
            pitchData,
            vocalCoherence.getCoherenceData()
          )

          // Track coherence samples for session average and adaptive algorithm
          const coherenceData = vocalCoherence.getCoherenceData()
          if (coherenceData.score > 0) {
            coherenceSamplesRef.current.push(coherenceData.score)
            pitchStabilitySamplesRef.current.push(coherenceData.pitchStabilityScore)
            amplitudeSmoothnessSamplesRef.current.push(coherenceData.amplitudeSmoothnessScore)
            voicingContinuitySamplesRef.current.push(coherenceData.voicingContinuityScore)
            // Only track raw values when they're meaningful (non-zero)
            if (coherenceData.rawPitchVarianceCents > 0) {
              pitchVarianceSamplesRef.current.push(coherenceData.rawPitchVarianceCents)
            }
            if (coherenceData.rawAmplitudeCV > 0) {
              amplitudeCVSamplesRef.current.push(coherenceData.rawAmplitudeCV)
            }
          }
        }
      } else {
        // Still analyze with silence data for phoneme state machine
        if (frequencyData && shouldAnalyzeFormant) {
          const pitchData = pitchDetection.analyze(frequencyData, sampleRate)
          const formantData = formantDetection.analyze(frequencyData, sampleRate)

          // Record silence/low signal for coherence tracking
          vocalCoherence.recordSample(pitchData.frequency, formantData.rms)
          guidedCycle.recordSample(
            formantData.detectedPhoneme,
            pitchData,
            vocalCoherence.getCoherenceData()
          )
        }
      }

      // Continue loop if still processing
      if (isProcessingRef.current) {
        animationFrameRef.current = requestAnimationFrame(processAudio)
      }
    } catch (err) {
      console.error('[processAudio] ERROR:', err)
    }
  }, [audioCapture, pitchDetection, formantDetection, vocalCoherence, guidedCycle])

  /**
   * Internal function to start the Aum Coach session
   * Called after hour bank checks pass
   */
  const startSessionInternal = useCallback(
    async (cycleCount: CycleCount, mode: TimingMode) => {
      setIsStarting(true)
      setError(null)

      try {
        // Start audio capture (requests microphone permission)
        await audioCapture.startCapture()
        setIsAudioActive(true)

        // Start session timing and deduct hours at START
        // Calculate total time from cycle count
        const totalTimeMs = getSessionTimeMs(cycleCount, mode)
        const durationSeconds = Math.round(totalTimeMs / 1000)
        await omSession.startSession(durationSeconds)

        // Initialize tracking
        coherenceSamplesRef.current = []
        pitchStabilitySamplesRef.current = []
        amplitudeSmoothnessSamplesRef.current = []
        voicingContinuitySamplesRef.current = []
        pitchVarianceSamplesRef.current = []
        amplitudeCVSamplesRef.current = []
        lockedCyclesRef.current = 0
        totalCyclesRef.current = 0
        setCoherenceMetrics(null)

        // Reset detection states
        pitchDetection.reset()
        formantDetection.reset()
        vocalCoherence.reset()

        // Start guided cycle session with cycle count
        guidedCycle.startSession({ cycleCount, mode })

        // Start audio processing loop
        isProcessingRef.current = true
        animationFrameRef.current = requestAnimationFrame(processAudio)

        setPhase('practice')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to access microphone'
        setError(message)
      } finally {
        setIsStarting(false)
      }
    },
    [
      audioCapture,
      omSession,
      pitchDetection,
      formantDetection,
      vocalCoherence,
      guidedCycle,
      processAudio,
    ]
  )

  /**
   * Handle begin button - checks hour bank before starting
   */
  const handleBegin = useCallback(
    (cycleCount: CycleCount, mode: TimingMode) => {
      // Check if user has hours available
      if (!canMeditate) {
        setShowPaywall(true)
        return
      }

      // Check if critically low (< 30 min) - show warning before proceeding
      if (isCriticallyLow) {
        setPendingSession({ cycleCount, mode })
        setShowLowHoursWarning(true)
        return
      }

      // Proceed with session
      startSessionInternal(cycleCount, mode)
    },
    [canMeditate, isCriticallyLow, startSessionInternal]
  )

  /**
   * End the session
   */
  const handleEndSession = useCallback(async () => {
    // Capture state BEFORE stopping (to avoid race conditions with state updates)
    const guidedState = guidedCycle.state
    const finalCoherence = vocalCoherence.getCoherenceData()

    // Store totalCycles immediately (before any state changes)
    totalCyclesRef.current = guidedState.totalCycles

    // Stop guided cycle
    guidedCycle.stopSession()

    // Stop audio processing
    isProcessingRef.current = false
    setIsAudioActive(false)
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Stop audio capture
    audioCapture.stopCapture()

    // Helper to calculate average
    const calcAvg = (arr: number[]) =>
      arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
    const calcMedian = (arr: number[]) => {
      if (arr.length === 0) return 0
      const sorted = [...arr].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
    }

    // Calculate average scores from tracked samples
    const averageCoherence = calcAvg(coherenceSamplesRef.current)
    const avgPitchStability = calcAvg(pitchStabilitySamplesRef.current)
    const avgAmplitudeSmoothness = calcAvg(amplitudeSmoothnessSamplesRef.current)
    const avgVoicingContinuity = calcAvg(voicingContinuitySamplesRef.current)
    // Use median for raw values to reduce outlier impact
    const medianPitchVariance = calcMedian(pitchVarianceSamplesRef.current)
    const medianAmplitudeCV = calcMedian(amplitudeCVSamplesRef.current)

    // Store coherence metrics for results display
    setCoherenceMetrics({
      averageCoherenceScore: averageCoherence,
      pitchStabilityScore: avgPitchStability,
      amplitudeSmoothnessScore: avgAmplitudeSmoothness,
      voicingContinuityScore: avgVoicingContinuity,
      sessionMedianFrequency: finalCoherence.sessionMedianFrequency,
    })

    // Use guided cycle completions for metrics
    const completedCycles = guidedState.currentCycle - 1 // Subtract 1 since current cycle wasn't completed

    // Estimate vocalization ratio from voicing continuity
    const vocalizationRatio = avgVoicingContinuity / 100

    // End session and save to database with enhanced metrics
    const result = await omSession.endSession({
      completedCycles: Math.max(completedCycles, 0),
      averageAlignmentScore: averageCoherence, // Legacy compatibility
      vocalizationRatio: vocalizationRatio,
      // Enhanced metrics for adaptive algorithm
      sessionMedianFrequency: finalCoherence.sessionMedianFrequency ?? undefined,
      avgPitchStabilityScore: avgPitchStability,
      avgAmplitudeSmoothnessScore: avgAmplitudeSmoothness,
      avgVoicingContinuityScore: avgVoicingContinuity,
      rawPitchVarianceCents: medianPitchVariance,
      rawAmplitudeCV: medianAmplitudeCV,
    })

    if (result) {
      setSessionResult(result)
      setPhase('results')
    } else {
      // If session save failed, still show results with estimated data
      setSessionResult({
        uuid: '',
        durationSeconds: omSession.getElapsedSeconds(),
        metrics: {
          completedCycles: Math.max(completedCycles, 0),
          averageAlignmentScore: averageCoherence,
          vocalizationSeconds: Math.round(omSession.getElapsedSeconds() * vocalizationRatio),
        },
      })
      setPhase('results')
    }
  }, [audioCapture, omSession, vocalCoherence, guidedCycle])

  // Keep handleEndSession ref in sync for use in handleSessionComplete callback
  useEffect(() => {
    handleEndSessionRef.current = handleEndSession
  }, [handleEndSession])

  /**
   * Cancel session without saving
   */
  const handleCancel = useCallback(() => {
    // Stop guided cycle
    guidedCycle.stopSession()

    // Stop audio processing
    isProcessingRef.current = false
    setIsAudioActive(false)
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Stop audio capture
    audioCapture.stopCapture()

    // Cancel session
    omSession.cancelSession()

    // Return to setup
    setPhase('setup')
    setError(null)
    setCelebration(null)
  }, [audioCapture, omSession, guidedCycle])

  /**
   * Practice again from results
   */
  const handlePracticeAgain = useCallback(() => {
    setSessionResult(null)
    setCelebration(null)
    lockedCyclesRef.current = 0
    totalCyclesRef.current = 0
    setPhase('setup')
  }, [])

  /**
   * Navigate to Timer tab for silent meditation
   */
  const handleMeditateNow = useCallback(() => {
    setView('timer')
    onClose()
  }, [setView, onClose])

  /**
   * Start calibration flow
   */
  const handleStartCalibration = useCallback(async () => {
    try {
      // Start audio capture if not already capturing
      if (!audioCapture.isCapturing) {
        await audioCapture.startCapture()
      }
      setIsAudioActive(true)
      setPhase('calibration')

      // Start calibration process
      phonemeCalibration.startCalibration(audioCapture.getFrequencyData, audioCapture.getSampleRate)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access microphone'
      setError(message)
    }
  }, [audioCapture, phonemeCalibration])

  /**
   * Handle calibration completion
   */
  const handleCalibrationComplete = useCallback(() => {
    // Apply the new calibration profile to formant detection and coherence
    const profile = phonemeCalibration.profile
    if (profile) {
      formantDetection.setCalibration(profile)
      setCalibrationProfile(profile) // Also update coherence
    }

    // Stop audio capture (will restart when session begins)
    audioCapture.stopCapture()
    setIsAudioActive(false)

    // Return to setup
    setPhase('setup')
  }, [audioCapture, phonemeCalibration.profile, formantDetection])

  /**
   * Cancel calibration
   */
  const handleCancelCalibration = useCallback(() => {
    phonemeCalibration.cancelCalibration()
    audioCapture.stopCapture()
    setIsAudioActive(false)
    setPhase('setup')
  }, [audioCapture, phonemeCalibration])

  /**
   * Clear calibration and recalibrate
   */
  const handleRecalibrate = useCallback(() => {
    phonemeCalibration.clearCalibration()
    formantDetection.setCalibration(null)
    handleStartCalibration()
  }, [phonemeCalibration, formantDetection, handleStartCalibration])

  /**
   * Dismiss celebration overlay
   */
  const handleCelebrationDismiss = useCallback(() => {
    setCelebration(null)
  }, [])

  // Store stopCapture in a ref so cleanup doesn't depend on audioCapture
  const stopCaptureRef = useRef(audioCapture.stopCapture)

  // Keep stopCapture ref in sync (moved to useEffect to avoid side effect during render)
  useEffect(() => {
    stopCaptureRef.current = audioCapture.stopCapture
  }, [audioCapture.stopCapture])

  // Cleanup on unmount only (empty deps)
  useEffect(() => {
    return () => {
      isProcessingRef.current = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      stopCaptureRef.current()
    }
  }, [])

  // Handle tab visibility changes - pause audio processing when tab is hidden
  // This prevents inaccurate session timing when RAF is throttled in background
  useEffect(() => {
    if (phase !== 'practice') return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab went to background - pause audio processing loop
        // (guided cycle timer continues but audio analysis stops)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
      } else {
        // Tab came back - resume audio processing if still in practice
        if (isProcessingRef.current && !animationFrameRef.current) {
          animationFrameRef.current = requestAnimationFrame(processAudio)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [phase, processAudio])

  // Fullscreen mode during practice - hides app header/navigation
  useEffect(() => {
    setFullscreen(phase === 'practice')
    return () => setFullscreen(false)
  }, [phase, setFullscreen])

  // Error handler for error boundary - cleanup audio resources
  const handleBoundaryError = useCallback(() => {
    isProcessingRef.current = false
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    audioCapture.stopCapture()
    setPhase('setup')
  }, [audioCapture])

  return (
    <OmCoachErrorBoundary onError={handleBoundaryError}>
      <div className="flex flex-col h-full bg-base pb-20">
        {/* Header - hidden during calibration (calibration has its own header) */}
        {phase !== 'calibration' && (
          <div className="flex-none flex items-center justify-between px-4 py-3 border-b border-border-subtle">
            <button
              onClick={phase === 'practice' ? handleCancel : onClose}
              className="text-sm text-ink/70 hover:text-ink"
            >
              {phase === 'practice' ? 'Cancel' : 'Close'}
            </button>

            <h2 className="text-sm font-medium text-ink">Aum Coach</h2>

            {phase === 'practice' ? (
              <button
                onClick={handleEndSession}
                className="text-sm font-medium text-accent hover:text-accent-hover"
              >
                End
              </button>
            ) : (
              <div className="w-12" /> // Spacer for alignment
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-h-0 flex flex-col">
          {phase === 'setup' && (
            <OmCoachSetup
              onBegin={handleBegin}
              isLoading={isStarting}
              error={error}
              hasCalibration={phonemeCalibration.hasCalibration}
              onRecalibrate={handleRecalibrate}
              onStartCalibration={handleStartCalibration}
            />
          )}

          {phase === 'calibration' && (
            <PhonemeCalibration
              state={phonemeCalibration.state}
              onCancel={handleCancelCalibration}
              onComplete={handleCalibrationComplete}
            />
          )}

          {phase === 'practice' && (
            <OmCoachPractice
              guidedState={guidedCycle.state}
              getCoherenceData={vocalCoherence.getCoherenceData}
              isActive={isAudioActive}
              celebration={celebration}
              onCelebrationDismiss={handleCelebrationDismiss}
            />
          )}

          {phase === 'results' && sessionResult && (
            <OmCoachResults
              durationSeconds={sessionResult.durationSeconds}
              metrics={sessionResult.metrics}
              lockedCycles={lockedCyclesRef.current}
              totalCycles={totalCyclesRef.current}
              coherenceMetrics={coherenceMetrics}
              historicalStats={
                historicalStats
                  ? {
                      sessionCount: historicalStats.sessionCount,
                      avgCoherence: historicalStats.avgCoherence,
                      improvementPercent: historicalStats.improvementPercent,
                    }
                  : null
              }
              onClose={onClose}
              onPracticeAgain={handlePracticeAgain}
              onMeditateNow={handleMeditateNow}
            />
          )}
        </div>

        {/* Paywall modal */}
        <Paywall isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

        {/* Low hours warning modal */}
        <LowHoursWarning
          isOpen={showLowHoursWarning}
          onClose={() => setShowLowHoursWarning(false)}
          onContinue={() => {
            setShowLowHoursWarning(false)
            if (pendingSession) {
              startSessionInternal(pendingSession.cycleCount, pendingSession.mode)
              setPendingSession(null)
            }
          }}
          onTopUp={() => {
            setShowLowHoursWarning(false)
            setPendingSession(null)
            setShowPaywall(true)
          }}
          availableHours={available}
        />
      </div>
    </OmCoachErrorBoundary>
  )
}
