/**
 * RacingMind - Hypnotic visual meditation primer
 *
 * Main orchestrator component that coordinates:
 * - Setup phase (duration picker)
 * - Practice phase (PixiJS visualization)
 * - Results phase (session summary)
 *
 * Scientific foundation:
 * - Visual tracking suppresses Default Mode Network (rumination)
 * - Blue light (~471nm) accelerates relaxation 3x vs white light
 * - "Soft fascination" is a validated restorative attention state
 */

import { useState, useCallback, useEffect } from 'react'
import { useNavigationStore } from '../../stores/useNavigationStore'
import { useHourBankStore } from '../../stores/useHourBankStore'
import {
  useRacingMindSession,
  type RacingMindSessionResult,
} from '../../hooks/useRacingMindSession'
import { RacingMindSetup } from './RacingMindSetup'
import { RacingMindPractice } from './RacingMindPractice'
import { RacingMindPostAssessment } from './RacingMindPostAssessment'
import { RacingMindResults } from './RacingMindResults'
import { Paywall } from '../Paywall'
import { LowHoursWarning } from '../LowHoursWarning'

export type SessionDuration = 5 | 10 | 15

type RacingMindPhase = 'setup' | 'practice' | 'postAssessment' | 'results'

export interface TrackingMetrics {
  improvementPercent: number
  accuracy?: number
  saccadeCount?: number
}

interface RacingMindProps {
  onClose: () => void
}

export function RacingMind({ onClose }: RacingMindProps) {
  const setFullscreen = useNavigationStore((s) => s.setFullscreen)
  const setView = useNavigationStore((s) => s.setView)
  const { canMeditate, isCriticallyLow, available } = useHourBankStore()

  const [phase, setPhase] = useState<RacingMindPhase>('setup')
  const [isStarting, setIsStarting] = useState(false)
  const [sessionResult, setSessionResult] = useState<RacingMindSessionResult | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<SessionDuration>(10)

  // Self-assessment scores
  const [preSessionScore, setPreSessionScore] = useState<number | null>(null)
  const [postSessionScore, setPostSessionScore] = useState<number | null>(null)

  // Eye tracking metrics (populated after session if tracking was enabled)
  const [trackingMetrics, setTrackingMetrics] = useState<TrackingMetrics | null>(null)

  // Paywall modal states
  const [showPaywall, setShowPaywall] = useState(false)
  const [showLowHoursWarning, setShowLowHoursWarning] = useState(false)
  const [pendingSession, setPendingSession] = useState<{ duration: SessionDuration } | null>(null)

  // Session hook
  const racingMindSession = useRacingMindSession()

  /**
   * Internal function to start the Racing Mind session
   * Called after hour bank checks pass
   */
  const startSessionInternal = useCallback(
    async (duration: SessionDuration) => {
      setIsStarting(true)

      try {
        // Start session timing and deduct hours at START
        const durationSeconds = duration * 60
        await racingMindSession.startSession(durationSeconds)

        setSelectedDuration(duration)
        setPhase('practice')
      } catch (err) {
        console.error('[RacingMind] Failed to start session:', err)
      } finally {
        setIsStarting(false)
      }
    },
    [racingMindSession]
  )

  /**
   * Handle begin button - checks hour bank before starting
   */
  const handleBegin = useCallback(
    (duration: SessionDuration, preScore: number) => {
      // Store pre-session assessment
      setPreSessionScore(preScore)

      // Check if user has hours available
      if (!canMeditate) {
        setShowPaywall(true)
        return
      }

      // Check if critically low (< 30 min) - show warning before proceeding
      if (isCriticallyLow) {
        setPendingSession({ duration })
        setShowLowHoursWarning(true)
        return
      }

      // Proceed with session
      startSessionInternal(duration)
    },
    [canMeditate, isCriticallyLow, startSessionInternal]
  )

  /**
   * End the session (called when timer completes or user ends early)
   * Goes to post-assessment phase before showing results
   */
  const handleEndSession = useCallback(
    async (practiceTrackingMetrics?: TrackingMetrics) => {
      const result = await racingMindSession.endSession()

      if (result) {
        setSessionResult(result)
      } else {
        // If session save failed, still continue with estimated data
        setSessionResult({
          uuid: '',
          durationSeconds: racingMindSession.getElapsedSeconds(),
        })
      }

      // Store tracking metrics from practice session
      if (practiceTrackingMetrics) {
        setTrackingMetrics(practiceTrackingMetrics)
      }

      // Go to post-assessment before showing results
      setPhase('postAssessment')
    },
    [racingMindSession]
  )

  /**
   * Handle post-assessment completion - show results
   */
  const handlePostAssessment = useCallback((postScore: number, metrics?: TrackingMetrics) => {
    setPostSessionScore(postScore)
    if (metrics) {
      setTrackingMetrics(metrics)
    }
    setPhase('results')
  }, [])

  /**
   * Cancel session without saving
   */
  const handleCancel = useCallback(() => {
    racingMindSession.cancelSession()
    setPhase('setup')
  }, [racingMindSession])

  /**
   * Practice again from results
   */
  const handlePracticeAgain = useCallback(() => {
    setSessionResult(null)
    setPreSessionScore(null)
    setPostSessionScore(null)
    setTrackingMetrics(null)
    setPhase('setup')
  }, [])

  /**
   * Navigate to Timer tab for silent meditation
   */
  const handleMeditateNow = useCallback(() => {
    setView('timer')
    onClose()
  }, [setView, onClose])

  // Fullscreen mode during practice - hides app header/navigation
  useEffect(() => {
    setFullscreen(phase === 'practice')
    return () => setFullscreen(false)
  }, [phase, setFullscreen])

  return (
    <div className="flex flex-col h-full bg-base pb-20">
      {/* Header - hidden during practice and post-assessment (fullscreen-like) */}
      {phase !== 'practice' && phase !== 'postAssessment' && (
        <div className="flex-none flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <button onClick={onClose} className="text-sm text-ink/70 hover:text-ink">
            Close
          </button>
          <h2 className="text-sm font-medium text-ink">Racing Mind</h2>
          <div className="w-12" /> {/* Spacer for alignment */}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {phase === 'setup' && <RacingMindSetup onBegin={handleBegin} isLoading={isStarting} />}

        {phase === 'practice' && (
          <RacingMindPractice
            durationSeconds={selectedDuration * 60}
            getProgress={racingMindSession.getProgress}
            getElapsedSeconds={racingMindSession.getElapsedSeconds}
            onEnd={handleEndSession}
            onCancel={handleCancel}
          />
        )}

        {phase === 'postAssessment' && (
          <RacingMindPostAssessment onComplete={handlePostAssessment} />
        )}

        {phase === 'results' && sessionResult && (
          <RacingMindResults
            durationSeconds={sessionResult.durationSeconds}
            preSessionScore={preSessionScore}
            postSessionScore={postSessionScore}
            trackingMetrics={trackingMetrics}
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
            startSessionInternal(pendingSession.duration)
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
  )
}
