/**
 * ResonanceAnchorPractice - Full-screen practice view
 *
 * Session phases:
 * 1. Intro (3s): Fade in with instruction text
 * 2. Active: Core practice with breath engine, voice detection, haptics
 * 3. Anchor (30s): Ghost anchor phase — haptics and orb taper to near-zero
 * 4. Complete: "Practice Complete" overlay with CTA
 *
 * Follows RacingMindPractice pattern for phase state machine.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ResonanceOrb } from './ResonanceOrb'
import { createBreathEngine, type BreathPhase, type BreathEngine } from '../../lib/breathEngine'
import { useVoiceDetection } from '../../hooks/useVoiceDetection'
import { useResonanceHaptics } from '../../hooks/useResonanceHaptics'
import { RESONANCE_COLORS } from '../../lib/resonanceAnimation'

export type PracticePhase = 'intro' | 'active' | 'anchor' | 'complete'

export interface ResonancePracticeMetrics {
  totalHummingMs: number
  averageStability: number
  cyclesCompleted: number
}

interface ResonanceAnchorPracticeProps {
  durationSeconds: number
  getElapsedSeconds: () => number
  onEnd: (metrics: ResonancePracticeMetrics) => void
  onCancel: () => void
}

export function ResonanceAnchorPractice({
  durationSeconds,
  getElapsedSeconds,
  onEnd,
  onCancel,
}: ResonanceAnchorPracticeProps) {
  const [phase, setPhase] = useState<PracticePhase>('intro')
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale')
  const [targetAmplitude, setTargetAmplitude] = useState(0)
  const [sessionProgress, setSessionProgress] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  const breathEngineRef = useRef<BreathEngine | null>(null)
  const hasEndedRef = useRef(false)

  // Metrics tracking
  const metricsRef = useRef<ResonancePracticeMetrics>({
    totalHummingMs: 0,
    averageStability: 0,
    cyclesCompleted: 0,
  })
  const stabilityHistoryRef = useRef<number[]>([])
  const lastHummingTimeRef = useRef<number | null>(null)
  const cycleCountRef = useRef(0)

  // Hooks
  const voice = useVoiceDetection()
  const haptics = useResonanceHaptics()

  // Trigger fade-in after mount
  useEffect(() => {
    const timer = setTimeout(() => setHasStarted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Manage resonance-anchor-mode class for iOS safe area colors
  useEffect(() => {
    const html = document.documentElement
    html.classList.add('racing-mind-mode') // Reuse Racing Mind's dark safe area styling
    return () => {
      html.classList.remove('racing-mind-mode')
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      voice.stopListening()
      haptics.stopResonance()
      haptics.stopGhostAnchor()
      breathEngineRef.current?.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Initialize breath engine (once)
  useEffect(() => {
    breathEngineRef.current = createBreathEngine({
      initialBpm: 8,
      targetBpm: 5.5,
      inhaleRatio: 0.4,
      exhaleRatio: 0.6,
      sessionDurationMs: durationSeconds * 1000,

      onPhaseChange: (newPhase: BreathPhase) => {
        setBreathPhase(newPhase)

        if (newPhase === 'inhale') {
          // Inhale phase — stop haptics
          haptics.stopResonance()
        }
      },

      onProgress: (progress: number) => {
        setSessionProgress(progress)
      },
    })

    return () => {
      breathEngineRef.current?.stop()
    }
  }, [durationSeconds, haptics])

  // Start session after intro delay
  useEffect(() => {
    if (phase !== 'intro') return

    const timer = setTimeout(async () => {
      const started = await voice.startListening()
      if (started) {
        breathEngineRef.current?.start()
        setPhase('active')
      } else {
        // Mic failed — still start (visual-only mode)
        breathEngineRef.current?.start()
        setPhase('active')
      }
    }, 3000) // 3s intro

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Update amplitude from breath engine during active phase
  useEffect(() => {
    if (phase !== 'active' && phase !== 'anchor') return

    let running = true

    const updateAmplitude = () => {
      if (!running) return
      if (breathEngineRef.current) {
        setTargetAmplitude(breathEngineRef.current.getTargetAmplitude())
      }
      requestAnimationFrame(updateAmplitude)
    }

    const id = requestAnimationFrame(updateAmplitude)
    return () => {
      running = false
      cancelAnimationFrame(id)
    }
  }, [phase])

  // Monitor session completion during active phase
  useEffect(() => {
    if (phase !== 'active') return

    const checkSession = () => {
      const elapsed = getElapsedSeconds()
      if (elapsed >= durationSeconds && !hasEndedRef.current) {
        hasEndedRef.current = true
        transitionToAnchor()
      }
    }

    checkSession()
    const interval = setInterval(checkSession, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, durationSeconds, getElapsedSeconds])

  // Link voice detection to haptics during active phase
  useEffect(() => {
    if (phase !== 'active') return

    if (voice.isHumming && breathPhase === 'exhale') {
      // User is humming during exhale — activate haptics
      haptics.startResonance()

      // Track humming time
      if (lastHummingTimeRef.current === null) {
        lastHummingTimeRef.current = performance.now()
      }

      // Track stability
      stabilityHistoryRef.current.push(voice.stability)
    } else {
      // Not humming or wrong phase — stop haptics
      haptics.stopResonance()

      // Finalize humming duration segment
      if (lastHummingTimeRef.current !== null) {
        metricsRef.current.totalHummingMs += performance.now() - lastHummingTimeRef.current
        lastHummingTimeRef.current = null
      }
    }
  }, [voice.isHumming, voice.stability, breathPhase, phase, haptics])

  // Count breath cycles
  useEffect(() => {
    if (phase === 'active' && breathPhase === 'inhale') {
      cycleCountRef.current++
      metricsRef.current.cyclesCompleted = cycleCountRef.current
    }
  }, [breathPhase, phase])

  /**
   * Transition to ghost anchor phase
   */
  const transitionToAnchor = useCallback(() => {
    // Finalize humming time
    if (lastHummingTimeRef.current !== null) {
      metricsRef.current.totalHummingMs += performance.now() - lastHummingTimeRef.current
      lastHummingTimeRef.current = null
    }

    // Calculate average stability
    if (stabilityHistoryRef.current.length > 0) {
      const sum = stabilityHistoryRef.current.reduce((a, b) => a + b, 0)
      metricsRef.current.averageStability = sum / stabilityHistoryRef.current.length
    }

    breathEngineRef.current?.stop()
    voice.stopListening()
    haptics.stopResonance()

    // Start ghost anchor decay
    haptics.startGhostAnchor()
    setPhase('anchor')

    // Ghost anchor lasts 30 seconds
    setTimeout(() => {
      haptics.stopGhostAnchor()
      setPhase('complete')
    }, 30000)
  }, [voice, haptics])

  /**
   * Handle cancel (during intro/active phase)
   */
  const handleCancel = useCallback(() => {
    if (hasEndedRef.current) return
    hasEndedRef.current = true

    breathEngineRef.current?.stop()
    voice.stopListening()
    haptics.stopResonance()
    haptics.stopGhostAnchor()
    onCancel()
  }, [voice, haptics, onCancel])

  /**
   * Handle "See Results" from complete overlay
   */
  const handleSeeResults = useCallback(() => {
    onEnd(metricsRef.current)
  }, [onEnd])

  // Format elapsed time
  function formatElapsedParts(seconds: number): { minutes: string; seconds: string } {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return { minutes: String(mins), seconds: String(secs).padStart(2, '0') }
  }

  const timeParts = formatElapsedParts(getElapsedSeconds())

  return (
    <motion.div
      className="fixed inset-0 z-50"
      style={{ backgroundColor: RESONANCE_COLORS.background }}
      initial={{ opacity: 0 }}
      animate={{ opacity: hasStarted ? 1 : 0 }}
      transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* PixiJS Canvas */}
      <ResonanceOrb
        targetAmplitude={targetAmplitude}
        isHumming={voice.isHumming}
        stability={voice.stability}
        isActive={phase === 'intro' || phase === 'active' || phase === 'anchor'}
      />

      {/* Cancel button — during intro and active */}
      {(phase === 'intro' || phase === 'active') && (
        <button
          onClick={handleCancel}
          className="absolute left-4 px-3 py-1.5 text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all duration-150 ease-out z-10"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
        >
          Cancel
        </button>
      )}

      {/* Intro instructional text */}
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="absolute left-0 right-0 flex justify-center z-10"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <p className="text-lg font-serif text-white/70 text-center px-8">
              Hold your phone to your chest...
            </p>
          </motion.div>
        )}

        {phase === 'anchor' && (
          <motion.div
            key="anchor"
            className="absolute left-0 right-0 flex justify-center z-10"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <p className="text-lg font-serif text-white/70 text-center px-8">
              Let the resonance settle...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Elapsed time — only during active phase */}
      {phase === 'active' && (
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

      {/* Progress bar — active phase only */}
      {phase === 'active' && (
        <div
          className="absolute left-8 right-8 z-10"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)' }}
        >
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/30 transition-all duration-1000 ease-linear"
              style={{ width: `${sessionProgress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Practice Complete overlay */}
      <AnimatePresence>
        {phase === 'complete' && (
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
