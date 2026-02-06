/**
 * Posture - Posture correction practice tool
 *
 * Main orchestrator that coordinates two modes:
 * - AirPods: CMHeadphoneMotionManager-based head tilt tracking
 * - Camera: MediaPipe BlazePose upper-body pose estimation
 *
 * Phases:
 * - setup: mode selection, instructions, calibration status
 * - calibration: AirPods "sit up straight" calibration
 * - camera-positioning: camera user positioning guide
 * - camera-calibration: camera baseline capture
 * - practice: active tracking with minimal UI
 * - summary: session results
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useNavigationStore } from '../../stores/useNavigationStore'
import { useSessionStore } from '../../stores/useSessionStore'
import { useHourBankStore } from '../../stores/useHourBankStore'
import { usePosture, type PostureSessionStats } from '../../hooks/usePosture'
import { useCameraPosture, type PostureTimelineEntry } from '../../hooks/useCameraPosture'
import { addSession } from '../../lib/db/sessions'
import { db } from '../../lib/db/schema'
import type { Session } from '../../lib/db/types'
import { PostureSetup, type PostureMode } from './PostureSetup'
import { PostureCalibration } from './PostureCalibration'
import { PosturePractice } from './PosturePractice'
import { PostureSummary } from './PostureSummary'
import { CameraPositioningGuide } from './CameraPositioningGuide'
import { CameraCalibration } from './CameraCalibration'
import { CameraPosturePractice } from './CameraPosturePractice'
import { Paywall } from '../Paywall'
import { LowHoursWarning } from '../LowHoursWarning'

const APP_STATE_KEY = 'primary'

export type PosturePhase =
  | 'setup'
  | 'calibration'
  | 'camera-positioning'
  | 'camera-calibration'
  | 'practice'
  | 'summary'

interface PostureProps {
  onClose: () => void
}

export function Posture({ onClose }: PostureProps) {
  const setFullscreen = useNavigationStore((s) => s.setFullscreen)
  const hydrateSessions = useSessionStore((s) => s.hydrate)
  const { canMeditate, isCriticallyLow, available } = useHourBankStore()
  const consumeSessionHours = useHourBankStore((s) => s.consumeSessionHours)

  const [phase, setPhase] = useState<PosturePhase>('setup')
  const [sessionStats, setSessionStats] = useState<PostureSessionStats | null>(null)
  const [mode, setMode] = useState<PostureMode>('airpods')
  const [selectedDuration, setSelectedDuration] = useState(10)

  // Session tracking refs
  const sessionUuidRef = useRef('')
  const wallClockStartRef = useRef(0)

  // Paywall
  const [showPaywall, setShowPaywall] = useState(false)
  const [showLowHoursWarning, setShowLowHoursWarning] = useState(false)

  // Camera-specific summary data
  const [shoulderSymmetryScore, setShoulderSymmetryScore] = useState<number | undefined>()
  const [postureTimeline, setPostureTimeline] = useState<PostureTimelineEntry[] | undefined>()

  // AirPods tracking hook
  const posture = usePosture()

  // Camera tracking hook
  const cameraPosture = useCameraPosture()

  // Track whether we need to return to setup after calibration
  const [returnToSetupAfterCalibration, setReturnToSetupAfterCalibration] = useState(false)

  // --- AirPods flow handlers (unchanged) ---

  const handleCalibrate = useCallback(() => {
    setReturnToSetupAfterCalibration(true)
    setPhase('calibration')
  }, [])

  const handleCalibrationComplete = useCallback(() => {
    if (returnToSetupAfterCalibration) {
      setReturnToSetupAfterCalibration(false)
      setPhase('setup')
    }
  }, [returnToSetupAfterCalibration])

  const handleCalibrationSkip = useCallback(() => {
    if (returnToSetupAfterCalibration) {
      setReturnToSetupAfterCalibration(false)
      setPhase('setup')
    }
  }, [returnToSetupAfterCalibration])

  const handleAirPodsBegin = useCallback(async () => {
    const success = await posture.startTracking()
    if (success) {
      posture.resetSessionStats()
      setPhase('practice')
    }
  }, [posture])

  // --- Camera flow handlers ---

  const handleCameraBegin = useCallback(async () => {
    const success = await cameraPosture.startCamera()
    if (success) {
      // Start inference so positioning guide can see landmarks
      cameraPosture.startTracking()
      setPhase('camera-positioning')
    }
  }, [cameraPosture])

  const handleCameraPositioningReady = useCallback(() => {
    setPhase('camera-calibration')
  }, [])

  const handleCameraCalibrationComplete = useCallback(() => {
    // Reset stats for the practice session
    cameraPosture.resetSessionStats()
    setPhase('practice')
  }, [cameraPosture])

  // --- Shared handlers ---

  /**
   * Internal: start the session after hour bank checks pass
   */
  const startSessionInternal = useCallback(async () => {
    // Initialize session tracking
    sessionUuidRef.current = uuidv4()
    wallClockStartRef.current = Date.now()

    // Consume hours upfront
    const durationSeconds = selectedDuration * 60
    try {
      await consumeSessionHours(durationSeconds)
    } catch (err) {
      console.error('[Posture] Failed to consume hours:', err)
    }

    // Mark session in progress for crash recovery
    try {
      const appState = await db.appState.get(APP_STATE_KEY)
      if (appState) {
        await db.appState.update(APP_STATE_KEY, {
          sessionInProgress: true,
          sessionStartTime: wallClockStartRef.current,
        })
      }
    } catch (err) {
      console.error('[Posture] Failed to mark session in progress:', err)
    }

    if (mode === 'airpods') {
      await handleAirPodsBegin()
    } else {
      await handleCameraBegin()
    }
  }, [mode, selectedDuration, consumeSessionHours, handleAirPodsBegin, handleCameraBegin])

  const handleBegin = useCallback(async () => {
    if (!canMeditate) {
      setShowPaywall(true)
      return
    }
    if (isCriticallyLow) {
      setShowLowHoursWarning(true)
      return
    }
    await startSessionInternal()
  }, [canMeditate, isCriticallyLow, startSessionInternal])

  const handleEndSession = useCallback(async () => {
    let stats: PostureSessionStats
    let symmetryScore: number | undefined

    if (mode === 'airpods') {
      stats = posture.getSessionStats()
      setSessionStats(stats)
      posture.stopTracking()
    } else {
      stats = cameraPosture.getSessionStats()
      setSessionStats(stats)
      symmetryScore = cameraPosture.scores?.shoulderSymmetry
      setShoulderSymmetryScore(symmetryScore)
      setPostureTimeline(cameraPosture.getTimeline())
      cameraPosture.stopTracking()
      cameraPosture.stopCamera()
    }

    // Save session to database
    const wallClockEnd = Date.now()
    const durationSeconds = Math.round(stats.totalSeconds)

    if (durationSeconds >= 1) {
      const session: Omit<Session, 'id'> = {
        uuid: sessionUuidRef.current,
        startTime: wallClockStartRef.current,
        endTime: wallClockEnd,
        durationSeconds,
        sessionType: 'practice',
        practiceToolId: 'posture-training',
        postureMetrics: {
          goodPosturePercent: Math.round(stats.goodPosturePercent),
          correctionCount: stats.correctionCount,
          source: mode === 'camera' ? 'camera' : 'airpods',
          shoulderSymmetryScore: symmetryScore != null ? Math.round(symmetryScore) : undefined,
        },
      }

      try {
        await addSession(session)

        // Clear session-in-progress flag
        const appState = await db.appState.get(APP_STATE_KEY)
        if (appState) {
          await db.appState.update(APP_STATE_KEY, {
            sessionInProgress: false,
            sessionStartTime: undefined,
          })
        }

        await hydrateSessions()
      } catch (err) {
        console.error('[Posture] Failed to save session:', err)
      }
    }

    setPhase('summary')
  }, [mode, posture, cameraPosture, hydrateSessions])

  const handleCancel = useCallback(() => {
    if (mode === 'airpods') {
      posture.stopTracking()
    } else {
      cameraPosture.stopTracking()
      cameraPosture.stopCamera()
    }

    // Clear session-in-progress flag
    db.appState.get(APP_STATE_KEY).then((appState) => {
      if (appState) {
        db.appState.update(APP_STATE_KEY, {
          sessionInProgress: false,
          sessionStartTime: undefined,
        })
      }
    })

    setPhase('setup')
  }, [mode, posture, cameraPosture])

  const handlePracticeAgain = useCallback(() => {
    setSessionStats(null)
    setShoulderSymmetryScore(undefined)
    setPostureTimeline(undefined)
    setPhase('setup')
  }, [])

  const handleStartMeditation = useCallback(() => {
    // Clean up camera if needed
    if (mode === 'camera') {
      cameraPosture.stopTracking()
      cameraPosture.stopCamera()
    }
    onClose()
    // Navigation to timer happens via the parent
  }, [mode, cameraPosture, onClose])

  // Fullscreen during practice, calibration, and camera phases
  useEffect(() => {
    const fullscreenPhases: PosturePhase[] = [
      'practice',
      'calibration',
      'camera-positioning',
      'camera-calibration',
    ]
    setFullscreen(fullscreenPhases.includes(phase))
    return () => setFullscreen(false)
  }, [phase, setFullscreen])

  return (
    <div className={`flex flex-col h-full bg-base ${phase === 'setup' ? 'pb-20' : ''}`}>
      {/* Header - hidden during fullscreen phases */}
      {phase !== 'practice' &&
        phase !== 'calibration' &&
        phase !== 'camera-positioning' &&
        phase !== 'camera-calibration' && (
          <div className="flex-none flex items-center justify-between px-4 py-3 border-b border-border-subtle">
            <button onClick={onClose} className="text-sm text-ink/70 hover:text-ink">
              Close
            </button>
            <h2 className="text-sm font-medium text-ink">Perfect Posture</h2>
            <div className="w-12" />
          </div>
        )}

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {phase === 'setup' && (
          <PostureSetup
            isSupported={posture.isSupported}
            isDeviceConnected={posture.isDeviceConnected}
            isCalibrated={posture.isCalibrated}
            isCameraSupported={cameraPosture.isSupported}
            isCameraCalibrated={cameraPosture.isCalibrated}
            mode={mode}
            onModeChange={setMode}
            selectedDuration={selectedDuration}
            onDurationChange={setSelectedDuration}
            onCalibrate={handleCalibrate}
            onBegin={handleBegin}
          />
        )}

        {phase === 'calibration' && (
          <PostureCalibration
            onCalibrate={posture.calibrate}
            onComplete={handleCalibrationComplete}
            onSkip={handleCalibrationSkip}
            isTracking={posture.isTracking}
            startTracking={posture.startTracking}
            stopTracking={posture.stopTracking}
          />
        )}

        {phase === 'camera-positioning' && (
          <CameraPositioningGuide
            landmarks={cameraPosture.landmarks}
            isPersonDetected={cameraPosture.isPersonDetected}
            isInFrame={cameraPosture.isInFrame}
            videoRef={cameraPosture.videoRef}
            onReady={handleCameraPositioningReady}
            onCancel={handleCancel}
          />
        )}

        {phase === 'camera-calibration' && (
          <CameraCalibration
            videoRef={cameraPosture.videoRef}
            landmarks={cameraPosture.landmarks}
            onCalibrate={cameraPosture.calibrate}
            onComplete={handleCameraCalibrationComplete}
            onCancel={handleCancel}
          />
        )}

        {phase === 'practice' && mode === 'airpods' && (
          <PosturePractice
            deviationDegrees={posture.deviationDegrees}
            currentOrientation={posture.currentOrientation}
            getSessionStats={posture.getSessionStats}
            onEnd={handleEndSession}
            onCancel={handleCancel}
          />
        )}

        {phase === 'practice' && mode === 'camera' && (
          <CameraPosturePractice
            landmarks={cameraPosture.landmarks}
            scores={cameraPosture.scores}
            status={cameraPosture.status}
            videoRef={cameraPosture.videoRef}
            getSessionStats={cameraPosture.getSessionStats}
            duration={selectedDuration}
            onEnd={handleEndSession}
            onCancel={handleCancel}
          />
        )}

        {phase === 'summary' && sessionStats && (
          <PostureSummary
            stats={sessionStats}
            source={mode === 'camera' ? 'camera' : 'airpods'}
            shoulderSymmetryScore={shoulderSymmetryScore}
            postureTimeline={postureTimeline}
            onClose={onClose}
            onPracticeAgain={handlePracticeAgain}
            onStartMeditation={handleStartMeditation}
          />
        )}
      </div>

      {/* Paywall */}
      <Paywall isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

      {/* Low hours warning */}
      <LowHoursWarning
        isOpen={showLowHoursWarning}
        onClose={() => setShowLowHoursWarning(false)}
        onContinue={() => {
          setShowLowHoursWarning(false)
          startSessionInternal()
        }}
        onTopUp={() => {
          setShowLowHoursWarning(false)
          setShowPaywall(true)
        }}
        availableHours={available}
      />
    </div>
  )
}
