/**
 * BreathPacerPractice - Full-screen breath pacing experience
 *
 * Architecture:
 * - Single RAF loop derives everything from performance.now() - startTime
 * - Phase detection fires React state updates ONLY on transitions
 * - Ball animation delegated to TerrainPath via getCycleProgress getter
 * - Timer display updates via 1-second interval (not RAF)
 *
 * Haptics: navigator.vibrate() on phase transitions (Android only, no-op on iOS)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TerrainPath } from './TerrainPath'
import {
  getCurrentPhaseInfo,
  formatTimeDisplay,
  type BreathPattern,
  type BreathTheme,
  type BreathPhase,
} from '../../lib/breathPatterns'

const LABEL_FADE_AFTER_CYCLES = 3

interface BreathPacerPracticeProps {
  pattern: BreathPattern
  theme: BreathTheme
  durationSeconds: number
  /** performance.now() when session started — owned by parent */
  startTime: number
  onComplete: (completedCycles: number) => void
  onCancel: () => void
}

function triggerHaptic(phase: BreathPhase['name']) {
  if (!navigator.vibrate) return
  switch (phase) {
    case 'inhale':
      navigator.vibrate(20)
      break
    case 'exhale':
      navigator.vibrate([12, 30, 12])
      break
    case 'holdIn':
    case 'holdOut':
      navigator.vibrate(12)
      break
  }
}

export function BreathPacerPractice({
  pattern,
  theme,
  durationSeconds,
  startTime,
  onComplete,
  onCancel,
}: BreathPacerPracticeProps) {
  const [currentPhase, setCurrentPhase] = useState<BreathPhase>(pattern.phases[0])
  const [cycleCount, setCycleCount] = useState(0)
  const [showLabels, setShowLabels] = useState(true)
  const [remainingDisplay, setRemainingDisplay] = useState(formatTimeDisplay(durationSeconds))
  const [breathLevel, setBreathLevel] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  // Refs for RAF loop state (no re-renders)
  const lastPhaseIndexRef = useRef(0)
  const lastCycleRef = useRef(0)
  const rafRef = useRef(0)
  const completedCyclesRef = useRef(0)

  // Manage racing-mind-mode class for dark safe areas
  useEffect(() => {
    const html = document.documentElement
    html.classList.add('racing-mind-mode')
    return () => {
      html.classList.remove('racing-mind-mode')
    }
  }, [])

  // Get cycle progress — called by TerrainPath at 60fps via ref
  const getCycleProgress = useCallback(() => {
    const elapsed = (performance.now() - startTime) / 1000
    const cycleTime = elapsed % pattern.cycleDuration
    return cycleTime / pattern.cycleDuration
  }, [startTime, pattern.cycleDuration])

  // Main timing loop — detects phase transitions and completion
  useEffect(() => {
    const loop = () => {
      const now = performance.now()
      const elapsed = (now - startTime) / 1000

      // Check completion
      if (elapsed >= durationSeconds) {
        setIsComplete(true)
        return
      }

      // Calculate cycle and phase
      const cycleNumber = Math.floor(elapsed / pattern.cycleDuration)
      const cycleTime = elapsed % pattern.cycleDuration
      const cycleProgress = cycleTime / pattern.cycleDuration
      const { phase, index: phaseIndex } = getCurrentPhaseInfo(pattern, cycleProgress)

      // Detect cycle change
      if (cycleNumber > lastCycleRef.current) {
        lastCycleRef.current = cycleNumber
        completedCyclesRef.current = cycleNumber
        setCycleCount(cycleNumber)
        if (cycleNumber >= LABEL_FADE_AFTER_CYCLES) {
          setShowLabels(false)
        }
      }

      // Detect phase transition
      if (phaseIndex !== lastPhaseIndexRef.current) {
        lastPhaseIndexRef.current = phaseIndex
        setCurrentPhase(phase)
        triggerHaptic(phase.name)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [startTime, durationSeconds, pattern])

  // 1-second interval for timer + breathLevel display updates
  useEffect(() => {
    if (isComplete) return

    const interval = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000
      const remaining = Math.max(0, Math.ceil(durationSeconds - elapsed))
      setRemainingDisplay(formatTimeDisplay(remaining))

      // Update breath level for background overlay (eased to match ball)
      const cycleTime = elapsed % pattern.cycleDuration
      const cycleProgress = cycleTime / pattern.cycleDuration
      const { phase: pos, localProgress } = getCurrentPhaseInfo(pattern, cycleProgress)
      const eased = (1 - Math.cos(Math.PI * localProgress)) / 2 // easeInOutSine
      let level = 0
      if (pos.name === 'inhale') level = eased
      else if (pos.name === 'holdIn') level = 1
      else if (pos.name === 'exhale') level = 1 - eased
      setBreathLevel(level)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, durationSeconds, pattern, isComplete])

  // Auto-transition after completion
  useEffect(() => {
    if (!isComplete) return
    const timer = setTimeout(() => {
      onComplete(completedCyclesRef.current)
    }, 2000)
    return () => clearTimeout(timer)
  }, [isComplete, onComplete])

  // Progress bar — animated via RAF + direct DOM
  const progressRafRef = useRef(0)
  useEffect(() => {
    if (isComplete) return
    const el = document.getElementById('breath-progress')
    if (!el) return
    const update = () => {
      const elapsed = (performance.now() - startTime) / 1000
      const pct = Math.min(100, (elapsed / durationSeconds) * 100)
      el.style.width = `${pct}%`
      if (elapsed < durationSeconds) {
        progressRafRef.current = requestAnimationFrame(update)
      }
    }
    progressRafRef.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(progressRafRef.current)
  }, [startTime, durationSeconds, isComplete])

  // Background overlay opacity tracks breath level
  const overlayOpacity = 0.05 + breathLevel * 0.2

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: theme.gradient }}>
      {/* Breathing background overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: 'black',
          opacity: overlayOpacity,
          transition: 'opacity 0.8s ease',
        }}
      />

      {/* Top bar: cancel + cycle count */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-safe-top">
        <button
          onClick={onCancel}
          className="text-white/40 text-sm py-3 hover:text-white/60 transition-colors"
        >
          End
        </button>
        <span className="text-white/30 text-xs font-mono tabular-nums">
          {cycleCount > 0 ? `Cycle ${cycleCount}` : ''}
        </span>
      </div>

      {/* Phase label */}
      <div className="relative z-10 flex-none h-16 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {showLabels && currentPhase.seconds > 0 && (
            <motion.p
              key={currentPhase.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-white/60 text-lg font-serif tracking-wide"
            >
              {currentPhase.label}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Terrain visualization */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-lg" style={{ aspectRatio: '2 / 1' }}>
          <TerrainPath
            pattern={pattern}
            theme={theme}
            getCycleProgress={getCycleProgress}
            isActive={!isComplete}
          />
        </div>
      </div>

      {/* Timer display */}
      <div className="relative z-10 flex-none flex items-center justify-center pb-2">
        <span className="text-white/40 text-lg font-serif tabular-nums tracking-wider">
          {remainingDisplay}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 w-full h-0.5 bg-white/10 mb-safe-bottom">
        <div
          id="breath-progress"
          className="h-full bg-white/25 transition-none"
          style={{ width: isComplete ? '100%' : '0%' }}
        />
      </div>

      {/* Complete overlay */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 20 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white/80 text-xl font-serif">Session Complete</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
