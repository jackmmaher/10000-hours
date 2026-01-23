/**
 * RacingMind - Hypnotic visual meditation primer
 *
 * Main orchestrator component that coordinates:
 * - Setup phase (duration picker)
 * - Calibration phase (eye tracking calibration)
 * - Practice phase (PixiJS visualization)
 * - Results phase (session summary)
 *
 * Scientific foundation:
 * - Visual tracking suppresses Default Mode Network (rumination)
 * - Horizontal eye movements deactivate amygdala (de Voogd et al. 2018)
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
import { RacingMindSummary } from './RacingMindSummary'
import { EyeCalibration } from './EyeCalibration'
import { Paywall } from '../Paywall'
import { LowHoursWarning } from '../LowHoursWarning'
import { isProfileStale, type CalibrationProfile } from './useEyeCalibration'

// Storage key for calibration profile (same as in useEyeCalibration)
const CALIBRATION_STORAGE_KEY = 'racing-mind-eye-calibration'

export type SessionDuration = 5 | 10 | 15

type RacingMindPhase = 'setup' | 'calibration' | 'practice' | 'results'

export interface TrackingMetrics {
  focusTimeSeconds: number
  engagementPercent: number
  longestStreakSeconds: number
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

  // Pre-session assessment score (post-session is captured in the unified summary)
  const [preSessionScore, setPreSessionScore] = useState<number | null>(null)

  // Eye tracking metrics (populated after session if tracking was enabled)
  const [trackingMetrics, setTrackingMetrics] = useState<TrackingMetrics | null>(null)

  // Paywall modal states
  const [showPaywall, setShowPaywall] = useState(false)
  const [showLowHoursWarning, setShowLowHoursWarning] = useState(false)
  const [pendingSession, setPendingSession] = useState<{ duration: SessionDuration } | null>(null)

  // Calibration state - track if user wants to return to setup after calibration
  const [returnToSetupAfterCalibration, setReturnToSetupAfterCalibration] = useState(false)

  // Eye tracking calibration status - tracks whether user has a valid (non-stale) calibration
  const [isCalibrated, setIsCalibrated] = useState(false)

  // Session hook
  const racingMindSession = useRacingMindSession()

  // Store session UUID for post-score update
  const [sessionUuid, setSessionUuid] = useState<string | null>(null)

  // Load calibration profile from localStorage on mount and when returning from calibration
  useEffect(() => {
    const loadCalibrationStatus = () => {
      try {
        const stored = localStorage.getItem(CALIBRATION_STORAGE_KEY)
        if (!stored) {
          setIsCalibrated(false)
          return
        }
        const profile: CalibrationProfile = JSON.parse(stored)
        // Check if profile exists and is not stale (older than 7 days)
        setIsCalibrated(!isProfileStale(profile))
      } catch {
        setIsCalibrated(false)
      }
    }

    loadCalibrationStatus()
  }, [phase]) // Re-check when phase changes (e.g., after calibration completes)

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
   * End the session (called when practice complete overlay CTA is clicked)
   * Goes directly to unified results/summary screen
   */
  const handleEndSession = useCallback(
    async (practiceTrackingMetrics?: TrackingMetrics) => {
      // Pass initial metrics to endSession (preScore and tracking metrics)
      const result = await racingMindSession.endSession({
        preSessionScore: preSessionScore ?? undefined,
        trackingMetrics: practiceTrackingMetrics,
      })

      if (result) {
        setSessionResult(result)
        setSessionUuid(result.uuid)
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

      // Go directly to unified results/summary
      setPhase('results')
    },
    [racingMindSession, preSessionScore]
  )

  /**
   * Cancel session without saving
   */
  const handleCancel = useCallback(() => {
    racingMindSession.cancelSession()
    setPhase('setup')
  }, [racingMindSession])

  /**
   * Handle post-session score update from summary
   */
  const handlePostScoreUpdate = useCallback(
    async (postScore: number) => {
      if (sessionUuid) {
        await racingMindSession.updateSessionMetrics(sessionUuid, {
          postSessionMindScore: postScore,
        })
      }
    },
    [sessionUuid, racingMindSession]
  )

  /**
   * Practice again from results
   */
  const handlePracticeAgain = useCallback(() => {
    setSessionResult(null)
    setSessionUuid(null)
    setPreSessionScore(null)
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

  /**
   * Start calibration flow from setup screen
   */
  const handleCalibrate = useCallback(() => {
    setReturnToSetupAfterCalibration(true)
    setPhase('calibration')
  }, [])

  /**
   * Handle calibration complete
   */
  const handleCalibrationComplete = useCallback(() => {
    if (returnToSetupAfterCalibration) {
      setReturnToSetupAfterCalibration(false)
      setPhase('setup')
    }
  }, [returnToSetupAfterCalibration])

  /**
   * Handle calibration skip
   */
  const handleCalibrationSkip = useCallback(() => {
    if (returnToSetupAfterCalibration) {
      setReturnToSetupAfterCalibration(false)
      setPhase('setup')
    }
  }, [returnToSetupAfterCalibration])

  // Fullscreen mode during practice and calibration - hides app header/navigation
  useEffect(() => {
    setFullscreen(phase === 'practice' || phase === 'calibration')
    return () => setFullscreen(false)
  }, [phase, setFullscreen])

  return (
    <div className={`flex flex-col h-full bg-base ${phase === 'setup' ? 'pb-20' : ''}`}>
      {/* Header - hidden during practice and calibration (fullscreen) */}
      {phase !== 'practice' && phase !== 'calibration' && (
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
        {phase === 'setup' && (
          <RacingMindSetup
            onBegin={handleBegin}
            onCalibrate={handleCalibrate}
            isLoading={isStarting}
          />
        )}

        {phase === 'calibration' && (
          <EyeCalibration onComplete={handleCalibrationComplete} onSkip={handleCalibrationSkip} />
        )}

        {phase === 'practice' && (
          <RacingMindPractice
            durationSeconds={selectedDuration * 60}
            getProgress={racingMindSession.getProgress}
            getElapsedSeconds={racingMindSession.getElapsedSeconds}
            onEnd={handleEndSession}
            onCancel={handleCancel}
            isCalibrated={isCalibrated}
          />
        )}

        {phase === 'results' && sessionResult && (
          <RacingMindSummary
            durationSeconds={sessionResult.durationSeconds}
            preSessionScore={preSessionScore}
            trackingMetrics={trackingMetrics}
            isCalibrated={isCalibrated}
            onClose={onClose}
            onPracticeAgain={handlePracticeAgain}
            onMeditateNow={handleMeditateNow}
            onPostScoreUpdate={handlePostScoreUpdate}
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
