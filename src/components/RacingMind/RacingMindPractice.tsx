/**
 * RacingMindPractice - Full-screen practice view
 *
 * Features:
 * - Dark background with PixiJS canvas
 * - Subtle elapsed time display (bottom center)
 * - End button (top-right)
 * - Auto-ends when duration completes
 * - Orientation switching mid-session (portrait -> landscape)
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { RacingMindOrb } from './RacingMindOrb'
import { formatElapsedTime, RACING_MIND_COLORS } from '../../lib/racingMindAnimation'
import { useEyeTracking } from '../../hooks/useEyeTracking'
import { useTrackingScore } from './useTrackingScore'
import type { TrackingMetrics } from './index'

export type OrientationPhase = 'portrait' | 'transition' | 'landscape'

interface RacingMindPracticeProps {
  durationSeconds: number
  getProgress: () => number
  getElapsedSeconds: () => number
  onEnd: (trackingMetrics?: TrackingMetrics) => void
  onCancel: () => void
}

export function RacingMindPractice({
  durationSeconds,
  getProgress,
  getElapsedSeconds,
  onEnd,
  onCancel,
}: RacingMindPracticeProps) {
  const [elapsedDisplay, setElapsedDisplay] = useState('0:00')
  const [isActive, setIsActive] = useState(true)
  const hasEndedRef = useRef(false)

  // Orientation switching state
  const [orientationPhase, setOrientationPhase] = useState<OrientationPhase>('portrait')
  const hasTriggeredTransitionRef = useRef(false)

  // Eye tracking integration
  const {
    gazePoint,
    isTracking,
    isSupported: eyeTrackingSupported,
    startTracking: startEyeTracking,
    stopTracking: stopEyeTracking,
    gazeHistory,
  } = useEyeTracking()

  const { calculateMetrics, getCurrentAccuracy, recordOrbPosition, orbHistory, clearOrbHistory } =
    useTrackingScore()

  // Current tracking accuracy for visual feedback (0-100)
  const [trackingAccuracy, setTrackingAccuracy] = useState(50)

  // Update elapsed time display every second and check for orientation transition
  useEffect(() => {
    if (!isActive) return

    const updateDisplay = () => {
      const elapsed = getElapsedSeconds()
      setElapsedDisplay(formatElapsedTime(elapsed))

      // Check if session should auto-end
      if (elapsed >= durationSeconds && !hasEndedRef.current) {
        hasEndedRef.current = true
        setIsActive(false)

        // Stop eye tracking and calculate metrics
        const endSession = async () => {
          if (isTracking) {
            await stopEyeTracking()

            // Calculate tracking metrics if we have enough data
            if (gazeHistory.length > 10 && orbHistory.length > 10) {
              const metrics = calculateMetrics(gazeHistory, orbHistory)
              onEnd(metrics)
              return
            }
          }
          onEnd()
        }
        endSession()
      }

      // Check if we should trigger orientation transition (at 50% progress)
      const progress = getProgress()
      if (
        progress >= 0.5 &&
        orientationPhase === 'portrait' &&
        !hasTriggeredTransitionRef.current
      ) {
        hasTriggeredTransitionRef.current = true
        setOrientationPhase('transition')
      }
    }

    // Initial update
    updateDisplay()

    // Update every second
    const interval = setInterval(updateDisplay, 1000)

    return () => clearInterval(interval)
  }, [
    isActive,
    durationSeconds,
    getElapsedSeconds,
    getProgress,
    onEnd,
    orientationPhase,
    isTracking,
    stopEyeTracking,
    gazeHistory,
    orbHistory,
    calculateMetrics,
  ])

  // Detect orientation changes
  useEffect(() => {
    if (orientationPhase !== 'transition') return

    const handleOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight
      if (isLandscape) {
        setOrientationPhase('landscape')
      }
    }

    // Check immediately
    handleOrientation()

    // Listen for resize events (orientation change triggers resize)
    window.addEventListener('resize', handleOrientation)
    return () => window.removeEventListener('resize', handleOrientation)
  }, [orientationPhase])

  // Dismiss rotation prompt (user can continue in portrait if they prefer)
  const dismissRotationPrompt = useCallback(() => {
    setOrientationPhase('landscape') // Move to next phase even if not rotated
  }, [])

  // Start eye tracking when session begins
  useEffect(() => {
    if (isActive && eyeTrackingSupported) {
      startEyeTracking().then((success) => {
        if (success) {
          console.log('[RacingMind] Eye tracking started')
          clearOrbHistory()
        }
      })
    }

    return () => {
      if (isTracking) {
        stopEyeTracking()
      }
    }
  }, [isActive, eyeTrackingSupported]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update tracking accuracy when gaze point changes
  useEffect(() => {
    if (gazePoint && orbHistory.length > 0) {
      const latestOrb = orbHistory[orbHistory.length - 1]
      const accuracy = getCurrentAccuracy(gazePoint, latestOrb)
      setTrackingAccuracy(accuracy)
    }
  }, [gazePoint, orbHistory, getCurrentAccuracy])

  // Handle manual end
  const handleEnd = useCallback(async () => {
    if (hasEndedRef.current) return
    hasEndedRef.current = true
    setIsActive(false)

    // Stop eye tracking and calculate metrics
    if (isTracking) {
      await stopEyeTracking()

      // Calculate tracking metrics if we have enough data
      if (gazeHistory.length > 10 && orbHistory.length > 10) {
        const metrics = calculateMetrics(gazeHistory, orbHistory)
        onEnd(metrics)
        return
      }
    }

    onEnd()
  }, [onEnd, isTracking, stopEyeTracking, gazeHistory, orbHistory, calculateMetrics])

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (hasEndedRef.current) return
    hasEndedRef.current = true
    setIsActive(false)
    onCancel()
  }, [onCancel])

  return (
    <div
      className="relative w-full h-full"
      style={{ backgroundColor: RACING_MIND_COLORS.background }}
    >
      {/* PixiJS Canvas */}
      <RacingMindOrb
        getProgress={getProgress}
        isActive={isActive}
        orientationPhase={orientationPhase}
        trackingAccuracy={isTracking ? trackingAccuracy : undefined}
        onPositionUpdate={isTracking ? recordOrbPosition : undefined}
      />

      {/* Cancel button - top left */}
      <button
        onClick={handleCancel}
        className="absolute top-4 left-4 text-sm text-white/40 hover:text-white/70 transition-colors z-10"
      >
        Cancel
      </button>

      {/* End button - top right */}
      <button
        onClick={handleEnd}
        className="absolute top-4 right-4 text-sm font-medium text-white/70 hover:text-white transition-colors z-10"
      >
        End
      </button>

      {/* Elapsed time - bottom center */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
        <span className="text-sm text-white/40 tabular-nums">{elapsedDisplay}</span>
      </div>

      {/* Rotation prompt overlay - shown at 50% progress */}
      {orientationPhase === 'transition' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-center px-8">
            {/* Rotation icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>

            <h2 className="text-xl font-serif text-white mb-2">Rotate Your Device</h2>
            <p className="text-sm text-white/60 mb-8 max-w-xs mx-auto">
              Turn to landscape for a wider field of view in the second half
            </p>

            {/* Skip button */}
            <button
              onClick={dismissRotationPrompt}
              className="text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              Continue in portrait
            </button>
          </div>
        </div>
      )}

      {/* Safe area padding for newer iPhones */}
      <div className="absolute bottom-0 left-0 right-0 h-safe-area-inset-bottom" />
    </div>
  )
}
