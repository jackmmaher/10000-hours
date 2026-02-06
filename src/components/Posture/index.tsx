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

import { useState, useCallback, useEffect } from 'react'
import { useNavigationStore } from '../../stores/useNavigationStore'
import { usePosture, type PostureSessionStats } from '../../hooks/usePosture'
import { useCameraPosture, type PostureTimelineEntry } from '../../hooks/useCameraPosture'
import { PostureSetup, type PostureMode } from './PostureSetup'
import { PostureCalibration } from './PostureCalibration'
import { PosturePractice } from './PosturePractice'
import { PostureSummary } from './PostureSummary'
import { CameraPositioningGuide } from './CameraPositioningGuide'
import { CameraCalibration } from './CameraCalibration'
import { CameraPosturePractice } from './CameraPosturePractice'

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

  const [phase, setPhase] = useState<PosturePhase>('setup')
  const [sessionStats, setSessionStats] = useState<PostureSessionStats | null>(null)
  const [mode, setMode] = useState<PostureMode>('airpods')
  const [selectedDuration, setSelectedDuration] = useState(10)

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

  const handleBegin = useCallback(async () => {
    if (mode === 'airpods') {
      await handleAirPodsBegin()
    } else {
      await handleCameraBegin()
    }
  }, [mode, handleAirPodsBegin, handleCameraBegin])

  const handleEndSession = useCallback(() => {
    if (mode === 'airpods') {
      const stats = posture.getSessionStats()
      setSessionStats(stats)
      posture.stopTracking()
    } else {
      const stats = cameraPosture.getSessionStats()
      setSessionStats(stats)
      setShoulderSymmetryScore(cameraPosture.scores?.shoulderSymmetry)
      setPostureTimeline(cameraPosture.getTimeline())
      cameraPosture.stopTracking()
      cameraPosture.stopCamera()
    }
    setPhase('summary')
  }, [mode, posture, cameraPosture])

  const handleCancel = useCallback(() => {
    if (mode === 'airpods') {
      posture.stopTracking()
    } else {
      cameraPosture.stopTracking()
      cameraPosture.stopCamera()
    }
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
    </div>
  )
}
