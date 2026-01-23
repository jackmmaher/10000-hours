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
import { motion } from 'framer-motion'
import { RacingMindOrb } from './RacingMindOrb'
import { RACING_MIND_COLORS } from '../../lib/racingMindAnimation'
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
  const [isActive, setIsActive] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)
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

  // Trigger fade-in after mount
  useEffect(() => {
    const timer = setTimeout(() => setHasStarted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Manage racing-mind-mode classes on html/body for iOS safe area colors
  useEffect(() => {
    const html = document.documentElement
    html.classList.add('racing-mind-transitioning')
    html.classList.add('racing-mind-mode')

    const timeout = setTimeout(() => {
      html.classList.remove('racing-mind-transitioning')
    }, 4000)

    return () => {
      clearTimeout(timeout)
      html.classList.add('racing-mind-transitioning')
      html.classList.remove('racing-mind-mode')
      setTimeout(() => html.classList.remove('racing-mind-transitioning'), 4000)
    }
  }, [])

  // Check for session end and orientation transition every second
  useEffect(() => {
    if (!isActive) return

    const updateDisplay = () => {
      const elapsed = getElapsedSeconds()

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
    console.log(
      '[RacingMind] Eye tracking effect - isActive:',
      isActive,
      'supported:',
      eyeTrackingSupported
    )

    if (isActive && eyeTrackingSupported === true) {
      console.log('[RacingMind] Starting eye tracking...')
      startEyeTracking().then((success) => {
        if (success) {
          console.log('[RacingMind] Eye tracking started successfully')
          clearOrbHistory()
        } else {
          console.log('[RacingMind] Eye tracking failed to start')
        }
      })
    } else if (isActive && eyeTrackingSupported === false) {
      console.log('[RacingMind] Eye tracking not supported, proceeding without it')
    }

    return () => {
      if (isTracking) {
        console.log('[RacingMind] Stopping eye tracking on cleanup')
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

  // Helper function for split time display
  function formatElapsedParts(seconds: number): { minutes: string; seconds: string } {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return { minutes: String(mins), seconds: String(secs).padStart(2, '0') }
  }

  const timeParts = formatElapsedParts(getElapsedSeconds())

  return (
    <motion.div
      className="fixed inset-0 z-50"
      style={{ backgroundColor: RACING_MIND_COLORS.background }}
      initial={{ opacity: 0 }}
      animate={{ opacity: hasStarted ? 1 : 0 }}
      transition={{ duration: 4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* PixiJS Canvas */}
      <RacingMindOrb
        getProgress={getProgress}
        isActive={isActive}
        orientationPhase={orientationPhase}
        trackingAccuracy={isTracking ? trackingAccuracy : undefined}
        onPositionUpdate={isTracking ? recordOrbPosition : undefined}
      />

      {/* Cancel button - ghost style for dark background, respects safe area */}
      <button
        onClick={handleCancel}
        className="absolute left-4 px-3 py-1.5 text-caption font-medium text-white/50 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all duration-150 ease-out z-10"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        Cancel
      </button>

      {/* End button - secondary style for dark background, respects safe area */}
      <button
        onClick={handleEnd}
        className="absolute right-4 px-4 py-2 text-body font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-150 ease-out z-10"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        End
      </button>

      {/* Elapsed time - styled to match OmCoach, respects safe area */}
      <div
        className="absolute left-0 right-0 flex justify-center z-10"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)' }}
      >
        <div
          className="flex items-baseline justify-center gap-2 font-serif"
          style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
        >
          <span
            className="font-semibold"
            style={{ fontSize: '2rem', lineHeight: 1, color: 'rgba(255, 255, 255, 0.7)' }}
          >
            {timeParts.minutes}
          </span>
          <span
            className="font-light"
            style={{ fontSize: '1.5rem', lineHeight: 1, color: 'rgba(255, 255, 255, 0.4)' }}
          >
            {timeParts.seconds}
          </span>
        </div>
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
    </motion.div>
  )
}
