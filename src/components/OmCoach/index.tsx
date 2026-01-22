/**
 * OmCoach - Guided Aum practice with real-time vocal biofeedback
 *
 * Main orchestrator component that coordinates:
 * - Audio capture (microphone)
 * - Pitch detection (pitchy)
 * - Phoneme detection (meyda)
 * - Guided cycle timing with multiple modes
 * - Session recording with per-phoneme alignment
 *
 * Scientific foundation:
 * - Humming at ~130 Hz increases nasal NO 15-20x
 * - Aum chanting shows fMRI patterns matching vagus nerve stimulation
 * - Extended exhalation improves HRV (target: 16-20s cycles)
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigationStore } from '../../stores/useNavigationStore'
import { useOmAudioCapture, isAboveNoiseGate } from '../../hooks/useOmAudioCapture'
import {
  usePitchDetection,
  OPTIMAL_NO_FREQUENCY,
  DEFAULT_TOLERANCE_CENTS,
} from '../../hooks/usePitchDetection'
import { usePhonemeDetection } from '../../hooks/usePhonemeDetection'
import { useAlignmentScoring } from '../../hooks/useAlignmentScoring'
import { useOmSession, type OmSessionResult } from '../../hooks/useOmSession'
import {
  useGuidedOmCycle,
  type SessionDuration,
  type TimingMode,
  type CycleQuality,
  type PhonemeAlignmentData,
} from '../../hooks/useGuidedOmCycle'
import { OmCoachSetup } from './OmCoachSetup'
import { OmCoachPractice } from './OmCoachPractice'
import { OmCoachResults } from './OmCoachResults'

type OmCoachPhase = 'setup' | 'practice' | 'results'

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
  const [phase, setPhase] = useState<OmCoachPhase>('setup')
  const [error, setError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [sessionResult, setSessionResult] = useState<OmSessionResult | null>(null)
  const [isAudioActive, setIsAudioActive] = useState(false)
  const [celebration, setCelebration] = useState<CelebrationState | null>(null)
  const [phonemeAlignment, setPhonemeAlignment] = useState<PhonemeAlignmentData | null>(null)

  // Track locked cycles for results
  const lockedCyclesRef = useRef(0)
  const totalCyclesRef = useRef(0)

  // Cumulative metrics tracked during session
  const alignmentSamplesRef = useRef<number[]>([])

  // Audio hooks
  const audioCapture = useOmAudioCapture()
  const pitchDetection = usePitchDetection({
    targetFrequency: OPTIMAL_NO_FREQUENCY,
    toleranceCents: DEFAULT_TOLERANCE_CENTS,
  })
  const phonemeDetection = usePhonemeDetection()
  const alignmentScoring = useAlignmentScoring()
  const omSession = useOmSession()

  // Guided cycle hook
  const handleCycleComplete = useCallback((quality: CycleQuality, cycleNumber: number) => {
    if (quality.isLocked) {
      lockedCyclesRef.current++
      setCelebration({ show: true, quality, cycleNumber })
    }
  }, [])

  const handleSessionComplete = useCallback(() => {
    // Session ended naturally - trigger end session
    handleEndSession()
  }, [])

  const guidedCycle = useGuidedOmCycle({
    onCycleComplete: handleCycleComplete,
    onSessionComplete: handleSessionComplete,
  })

  // Animation frame ref for audio processing loop
  const animationFrameRef = useRef<number | null>(null)
  const isProcessingRef = useRef(false)

  /**
   * Audio processing loop - runs at ~60fps
   * CRITICAL: Reads from refs, not React state
   */
  const processAudio = useCallback(() => {
    try {
      // Check ref to avoid stale closure issues with state
      if (!isProcessingRef.current) {
        return
      }

      const frequencyData = audioCapture.getFrequencyData()
      const timeDomainData = audioCapture.getTimeDomainData()
      const sampleRate = audioCapture.getSampleRate()

      if (frequencyData && timeDomainData && isAboveNoiseGate(timeDomainData)) {
        // Analyze pitch
        const pitchData = pitchDetection.analyze(frequencyData, sampleRate)

        // Analyze phoneme
        const phonemeData = phonemeDetection.analyze(frequencyData, sampleRate)

        // Update alignment scoring
        alignmentScoring.recordSample(pitchData, phonemeData)

        // Record sample for guided cycle quality
        guidedCycle.recordSample(phonemeData.current, pitchData)

        // Track alignment samples for session average
        const alignment = alignmentScoring.getAlignmentData()
        if (alignment.score > 0) {
          alignmentSamplesRef.current.push(alignment.score)
        }
      } else {
        // Still analyze with silence data for phoneme state machine
        if (frequencyData) {
          const pitchData = pitchDetection.analyze(frequencyData, sampleRate)
          const phonemeData = phonemeDetection.analyze(frequencyData, sampleRate)
          alignmentScoring.recordSample(pitchData, phonemeData)
          guidedCycle.recordSample(phonemeData.current, pitchData)
        }
      }

      // Continue loop if still processing
      if (isProcessingRef.current) {
        animationFrameRef.current = requestAnimationFrame(processAudio)
      }
    } catch (err) {
      console.error('[processAudio] ERROR:', err)
    }
  }, [audioCapture, pitchDetection, phonemeDetection, alignmentScoring, guidedCycle])

  /**
   * Start the Aum Coach session with selected duration and timing mode
   */
  const handleBegin = useCallback(
    async (duration: SessionDuration, mode: TimingMode) => {
      setIsStarting(true)
      setError(null)

      try {
        // Start audio capture (requests microphone permission)
        await audioCapture.startCapture()
        setIsAudioActive(true)

        // Start session timing and deduct hours at START
        // Convert duration (minutes) to seconds for hour bank deduction
        const durationSeconds = duration * 60
        await omSession.startSession(durationSeconds)

        // Initialize tracking
        alignmentSamplesRef.current = []
        lockedCyclesRef.current = 0
        totalCyclesRef.current = 0
        setPhonemeAlignment(null)

        // Reset detection states
        pitchDetection.reset()
        phonemeDetection.reset()
        alignmentScoring.reset()

        // Start guided cycle session with timing mode
        guidedCycle.startSession(duration, mode)

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
      phonemeDetection,
      alignmentScoring,
      guidedCycle,
      processAudio,
    ]
  )

  /**
   * End the session
   */
  const handleEndSession = useCallback(async () => {
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

    // Calculate final metrics
    const phonemeData = phonemeDetection.getPhonemeData()
    const alignmentData = alignmentScoring.getAlignmentData()
    const guidedState = guidedCycle.state

    // Get per-phoneme alignment data from guided cycle
    const phonemeAlignmentData = guidedCycle.getPhonemeAlignment()
    setPhonemeAlignment(phonemeAlignmentData)

    // Calculate average alignment score
    const samples = alignmentSamplesRef.current
    const averageAlignment =
      samples.length > 0 ? Math.round(samples.reduce((a, b) => a + b, 0) / samples.length) : 0

    // Use guided cycle completions for metrics
    const completedCycles = guidedState.currentCycle - 1 // Subtract 1 since current cycle wasn't completed

    // End session and save to database
    const result = await omSession.endSession({
      completedCycles: Math.max(completedCycles, phonemeData.completedCycles),
      averageAlignmentScore: averageAlignment,
      vocalizationRatio: alignmentData.vocalizationRatio,
    })

    // Store additional stats for results
    totalCyclesRef.current = guidedState.totalCycles

    if (result) {
      setSessionResult(result)
      setPhase('results')
    } else {
      // If session save failed, still show results with estimated data
      setSessionResult({
        uuid: '',
        durationSeconds: omSession.getElapsedSeconds(),
        metrics: {
          completedCycles: Math.max(completedCycles, phonemeData.completedCycles),
          averageAlignmentScore: averageAlignment,
          vocalizationSeconds: Math.round(
            omSession.getElapsedSeconds() * alignmentData.vocalizationRatio
          ),
        },
      })
      setPhase('results')
    }
  }, [audioCapture, omSession, phonemeDetection, alignmentScoring, guidedCycle])

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
   * Dismiss celebration overlay
   */
  const handleCelebrationDismiss = useCallback(() => {
    setCelebration(null)
  }, [])

  // Store stopCapture in a ref so cleanup doesn't depend on audioCapture
  const stopCaptureRef = useRef(audioCapture.stopCapture)
  stopCaptureRef.current = audioCapture.stopCapture

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

  // Fullscreen mode during practice - hides app header/navigation
  useEffect(() => {
    setFullscreen(phase === 'practice')
    return () => setFullscreen(false)
  }, [phase, setFullscreen])

  return (
    <div className="flex flex-col h-full bg-base">
      {/* Header */}
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

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {phase === 'setup' && (
          <OmCoachSetup onBegin={handleBegin} isLoading={isStarting} error={error} />
        )}

        {phase === 'practice' && (
          <OmCoachPractice
            guidedState={guidedCycle.state}
            getPitchData={pitchDetection.getPitchData}
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
            phonemeAlignment={phonemeAlignment}
            onClose={onClose}
            onPracticeAgain={handlePracticeAgain}
          />
        )}
      </div>
    </div>
  )
}
