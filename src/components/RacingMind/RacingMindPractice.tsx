/**
 * RacingMindPractice - Full-screen practice view with ceremonial intro/outro
 *
 * Session phases:
 * 1. Intro (16s): Orb appears stationary, expands to full orbit with 4-4-4-4 breathing
 *    - Instructional text fades through sequence
 *    - Camera permission requested during this time
 * 2. Active: Core practice session (timer counts, eye tracking active)
 * 3. Outro (16s): Orb decelerates back to center, camera stops automatically
 * 4. Complete: "Practice Complete" overlay with CTA to see results
 *
 * The intro/outro are experiential transitions - not part of tracked session time.
 * Portrait-only mode for optimal eye tracking accuracy.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RacingMindOrb } from './RacingMindOrb'
import {
  RACING_MIND_COLORS,
  ANIMATION_PARAMS,
  getCeremonyAmplitudeScale,
  getIntroText,
} from '../../lib/racingMindAnimation'
import { useEyeTracking } from '../../hooks/useEyeTracking'
import { useTrackingScore } from './useTrackingScore'
import type { TrackingMetrics } from './index'

export type SessionPhase = 'intro' | 'active' | 'outro' | 'complete'

interface RacingMindPracticeProps {
  durationSeconds: number
  getProgress: () => number
  getElapsedSeconds: () => number
  onEnd: (trackingMetrics?: TrackingMetrics) => void
  onCancel: () => void
  /** Whether user has a valid (non-stale) eye tracking calibration */
  isCalibrated?: boolean
}

export function RacingMindPractice({
  durationSeconds,
  getProgress,
  getElapsedSeconds,
  onEnd,
  onCancel,
  isCalibrated = false,
}: RacingMindPracticeProps) {
  // Session phase state machine
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('intro')
  const [hasStarted, setHasStarted] = useState(false)
  const hasEndedRef = useRef(false)

  // Ceremony timing
  const introStartTimeRef = useRef<number>(performance.now())
  const outroStartTimeRef = useRef<number>(0)
  const [amplitudeScale, setAmplitudeScale] = useState(0)
  const [introText, setIntroText] = useState<string | null>(null)

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

  // Stored metrics for end of session
  const storedMetricsRef = useRef<TrackingMetrics | undefined>(undefined)

  // Store calibration status in ref for use in metrics/logging
  // If NOT calibrated and eye tracking is used, engagement scores will be less accurate
  const isCalibrationValidRef = useRef(isCalibrated)
  isCalibrationValidRef.current = isCalibrated

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

  // Start eye tracking during intro phase
  useEffect(() => {
    if (sessionPhase === 'intro' && eyeTrackingSupported === true) {
      console.log('[RacingMind] Starting eye tracking during intro...')
      startEyeTracking().then((success) => {
        if (success) {
          console.log('[RacingMind] Eye tracking started successfully')
          clearOrbHistory()
        } else {
          console.log('[RacingMind] Eye tracking failed to start')
        }
      })
    }
  }, [sessionPhase, eyeTrackingSupported, startEyeTracking, clearOrbHistory])

  // Intro ceremony animation loop
  useEffect(() => {
    if (sessionPhase !== 'intro') return

    const { introDurationMs } = ANIMATION_PARAMS
    let animationId: number

    const animate = () => {
      const elapsed = performance.now() - introStartTimeRef.current

      // Calculate amplitude scale (0 → 1 over intro duration)
      const scale = getCeremonyAmplitudeScale(elapsed, false)
      setAmplitudeScale(scale)

      // Update instructional text
      const text = getIntroText(elapsed)
      setIntroText(text)

      // Check if intro is complete
      if (elapsed >= introDurationMs) {
        setSessionPhase('active')
        setAmplitudeScale(1)
        setIntroText(null)
        return
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [sessionPhase])

  // Active session monitoring (check for completion)
  useEffect(() => {
    if (sessionPhase !== 'active') return

    const checkSession = () => {
      const elapsed = getElapsedSeconds()

      // Check if session should end (transition to outro)
      if (elapsed >= durationSeconds && !hasEndedRef.current) {
        hasEndedRef.current = true

        // Calculate and store metrics before stopping tracking
        if (isTracking && gazeHistory.length > 10 && orbHistory.length > 10) {
          storedMetricsRef.current = calculateMetrics(gazeHistory, orbHistory)
        }

        // Stop eye tracking as part of outro
        if (isTracking) {
          stopEyeTracking()
        }

        // Transition to outro
        outroStartTimeRef.current = performance.now()
        setSessionPhase('outro')
      }
    }

    checkSession()
    const interval = setInterval(checkSession, 1000)
    return () => clearInterval(interval)
  }, [
    sessionPhase,
    durationSeconds,
    getElapsedSeconds,
    isTracking,
    stopEyeTracking,
    gazeHistory,
    orbHistory,
    calculateMetrics,
  ])

  // Outro ceremony animation loop
  useEffect(() => {
    if (sessionPhase !== 'outro') return

    const { outroDurationMs } = ANIMATION_PARAMS
    let animationId: number

    const animate = () => {
      const elapsed = performance.now() - outroStartTimeRef.current

      // Calculate amplitude scale (1 → 0 over outro duration)
      const scale = getCeremonyAmplitudeScale(elapsed, true)
      setAmplitudeScale(scale)

      // Check if outro is complete
      if (elapsed >= outroDurationMs) {
        setSessionPhase('complete')
        setAmplitudeScale(0)
        return
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [sessionPhase])

  // Update tracking accuracy when gaze point changes
  useEffect(() => {
    if (gazePoint && orbHistory.length > 0) {
      const latestOrb = orbHistory[orbHistory.length - 1]
      const accuracy = getCurrentAccuracy(gazePoint, latestOrb)
      setTrackingAccuracy(accuracy)
    }
  }, [gazePoint, orbHistory, getCurrentAccuracy])

  // Handle manual end (during active phase)
  const handleEnd = useCallback(async () => {
    if (hasEndedRef.current) return
    hasEndedRef.current = true

    // Calculate and store metrics
    if (isTracking && gazeHistory.length > 10 && orbHistory.length > 10) {
      storedMetricsRef.current = calculateMetrics(gazeHistory, orbHistory)
    }

    // Stop eye tracking
    if (isTracking) {
      await stopEyeTracking()
    }

    // Transition to outro
    outroStartTimeRef.current = performance.now()
    setSessionPhase('outro')
  }, [isTracking, stopEyeTracking, gazeHistory, orbHistory, calculateMetrics])

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (hasEndedRef.current) return
    hasEndedRef.current = true

    // Stop eye tracking
    if (isTracking) {
      stopEyeTracking()
    }

    onCancel()
  }, [onCancel, isTracking, stopEyeTracking])

  // Handle "See Results" from complete overlay
  const handleSeeResults = useCallback(() => {
    onEnd(storedMetricsRef.current)
  }, [onEnd])

  // Helper function for split time display
  function formatElapsedParts(seconds: number): { minutes: string; seconds: string } {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return { minutes: String(mins), seconds: String(secs).padStart(2, '0') }
  }

  const timeParts = formatElapsedParts(getElapsedSeconds())

  // Determine if orb should be animating
  const isOrbActive =
    sessionPhase === 'intro' || sessionPhase === 'active' || sessionPhase === 'outro'

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
        isActive={isOrbActive}
        trackingAccuracy={isTracking ? trackingAccuracy : undefined}
        onPositionUpdate={isTracking ? recordOrbPosition : undefined}
        amplitudeScale={amplitudeScale}
      />

      {/* Cancel button - only during intro and active phases */}
      {(sessionPhase === 'intro' || sessionPhase === 'active') && (
        <button
          onClick={handleCancel}
          className="absolute left-4 px-3 py-1.5 text-caption font-medium text-white/50 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all duration-150 ease-out z-10"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
        >
          Cancel
        </button>
      )}

      {/* End button - only during active phase */}
      {sessionPhase === 'active' && (
        <button
          onClick={handleEnd}
          className="absolute right-4 px-4 py-2 text-body font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-150 ease-out z-10"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
        >
          End
        </button>
      )}

      {/* Intro instructional text */}
      <AnimatePresence mode="wait">
        {sessionPhase === 'intro' && introText && (
          <motion.div
            key={introText}
            className="absolute left-0 right-0 flex justify-center z-10"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <p className="text-lg font-serif text-white/70 text-center px-8">{introText}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Elapsed time - only during active phase */}
      {sessionPhase === 'active' && (
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
      )}

      {/* Practice Complete overlay - shown after outro */}
      <AnimatePresence>
        {sessionPhase === 'complete' && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Completion indicator */}
            <motion.div
              className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <svg
                className="w-8 h-8 text-white/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>

            <motion.h1
              className="font-serif text-2xl text-white mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              Practice Complete
            </motion.h1>

            {/* CTA Button */}
            <motion.button
              onClick={handleSeeResults}
              className="px-8 py-4 bg-white text-[#0A0A12] font-medium rounded-xl hover:bg-white/90 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              See Your Results
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
