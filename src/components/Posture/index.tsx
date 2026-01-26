/**
 * Posture - AirPods-based posture correction practice tool
 *
 * Main orchestrator component that coordinates:
 * - Setup phase (device check, calibration status, start)
 * - Calibration phase ("sit up straight" calibration flow)
 * - Practice phase (active tracking with minimal UI)
 * - Summary phase (session results)
 *
 * Uses CMHeadphoneMotionManager via AirPods Pro/Max/3rd gen to detect
 * head tilt and alert users with gentle haptic vibration when they slouch.
 */

import { useState, useCallback, useEffect } from 'react'
import { useNavigationStore } from '../../stores/useNavigationStore'
import { usePosture, type PostureSessionStats } from '../../hooks/usePosture'
import { PostureSetup } from './PostureSetup'
import { PostureCalibration } from './PostureCalibration'
import { PosturePractice } from './PosturePractice'
import { PostureSummary } from './PostureSummary'

export type PosturePhase = 'setup' | 'calibration' | 'practice' | 'summary'

interface PostureProps {
  onClose: () => void
}

export function Posture({ onClose }: PostureProps) {
  const setFullscreen = useNavigationStore((s) => s.setFullscreen)

  const [phase, setPhase] = useState<PosturePhase>('setup')
  const [sessionStats, setSessionStats] = useState<PostureSessionStats | null>(null)

  // Posture tracking hook
  const posture = usePosture()

  // Track whether we need to return to setup after calibration
  const [returnToSetupAfterCalibration, setReturnToSetupAfterCalibration] = useState(false)

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

  /**
   * Start practice session
   */
  const handleBegin = useCallback(async () => {
    // Start tracking
    const success = await posture.startTracking()
    if (success) {
      posture.resetSessionStats()
      setPhase('practice')
    }
  }, [posture])

  /**
   * End practice session
   */
  const handleEndSession = useCallback(() => {
    // Capture stats before stopping
    const stats = posture.getSessionStats()
    setSessionStats(stats)

    // Stop tracking
    posture.stopTracking()

    // Go to summary
    setPhase('summary')
  }, [posture])

  /**
   * Cancel session without saving
   */
  const handleCancel = useCallback(() => {
    posture.stopTracking()
    setPhase('setup')
  }, [posture])

  /**
   * Practice again from results
   */
  const handlePracticeAgain = useCallback(() => {
    setSessionStats(null)
    setPhase('setup')
  }, [])

  // Fullscreen mode during practice and calibration
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
          <h2 className="text-sm font-medium text-ink">Perfect Posture</h2>
          <div className="w-12" /> {/* Spacer for alignment */}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {phase === 'setup' && (
          <PostureSetup
            isSupported={posture.isSupported}
            isDeviceConnected={posture.isDeviceConnected}
            isCalibrated={posture.isCalibrated}
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

        {phase === 'practice' && (
          <PosturePractice
            deviationDegrees={posture.deviationDegrees}
            currentOrientation={posture.currentOrientation}
            getSessionStats={posture.getSessionStats}
            onEnd={handleEndSession}
            onCancel={handleCancel}
          />
        )}

        {phase === 'summary' && sessionStats && (
          <PostureSummary
            stats={sessionStats}
            onClose={onClose}
            onPracticeAgain={handlePracticeAgain}
          />
        )}
      </div>
    </div>
  )
}
