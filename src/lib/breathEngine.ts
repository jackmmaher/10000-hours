/**
 * Breath Engine - Core timing engine for disguised breath training
 *
 * Manages inhale/exhale phases with progressive BPM slowing.
 * Starts at 8 breaths/minute, gradually slows to target BPM over session.
 * Inhale ratio: 0.4 of cycle, exhale ratio: 0.6 (parasympathetic bias).
 *
 * Scientific basis:
 * - Exhale-dominant breathing activates parasympathetic response (Hayashi 2018)
 * - Slow breathing (4.5-6.5 bpm) maximizes HRV through RSA resonance (Lehrer & Gevirtz 2014)
 *
 * This module is UI-agnostic — it can drive any visual metaphor (orb, feather, etc.)
 */

import BezierEasing from 'bezier-easing'

export type BreathPhase = 'inhale' | 'exhale'

export interface BreathEngineConfig {
  initialBpm: number
  targetBpm: number
  inhaleRatio: number
  exhaleRatio: number
  sessionDurationMs: number
  onPhaseChange: (phase: BreathPhase, durationMs: number) => void
  onProgress: (progress: number) => void
}

export interface BreathEngine {
  start: () => void
  stop: () => void
  getCurrentPhase: () => BreathPhase
  getPhaseProgress: () => number // 0-1 within current phase
  getCycleProgress: () => number // 0-1 within current cycle
  getTargetAmplitude: () => number // 0-1 for visual scaling
}

// Smooth easeOut deceleration for BPM progression
const easeOutCubic = BezierEasing(0.22, 0.61, 0.36, 1)

export function createBreathEngine(config: BreathEngineConfig): BreathEngine {
  let isRunning = false
  let startTime = 0
  let animationId: number | null = null

  let currentPhase: BreathPhase = 'inhale'
  let cycleStartTime = 0

  /**
   * Calculate current BPM based on session progress (easeOut curve)
   */
  function getCurrentBpm(sessionProgress: number): number {
    const clamped = Math.max(0, Math.min(1, sessionProgress))
    const eased = easeOutCubic(clamped)
    return config.initialBpm - (config.initialBpm - config.targetBpm) * eased
  }

  /**
   * Get cycle duration in ms for a given BPM
   */
  function getCycleDurationMs(bpm: number): number {
    return (60 / bpm) * 1000
  }

  /**
   * Main animation loop
   */
  function tick() {
    if (!isRunning) return

    const now = performance.now()
    const elapsedMs = now - startTime
    const sessionProgress = Math.min(1, elapsedMs / config.sessionDurationMs)

    // Report session progress
    config.onProgress(sessionProgress)

    // Check if session complete
    if (sessionProgress >= 1) {
      stop()
      return
    }

    // Calculate current timing
    const bpm = getCurrentBpm(sessionProgress)
    const cycleDurationMs = getCycleDurationMs(bpm)
    const inhaleDurationMs = cycleDurationMs * config.inhaleRatio
    const exhaleDurationMs = cycleDurationMs * config.exhaleRatio

    // Time within current cycle
    const cycleElapsedMs = now - cycleStartTime

    // Determine phase
    let newPhase: BreathPhase

    if (cycleElapsedMs < inhaleDurationMs) {
      newPhase = 'inhale'
    } else if (cycleElapsedMs < inhaleDurationMs + exhaleDurationMs) {
      newPhase = 'exhale'
    } else {
      // Cycle complete, start new cycle
      cycleStartTime = now
      newPhase = 'inhale'
    }

    // Emit phase change if changed
    if (newPhase !== currentPhase) {
      currentPhase = newPhase
      const phaseDuration = newPhase === 'inhale' ? inhaleDurationMs : exhaleDurationMs
      config.onPhaseChange(newPhase, phaseDuration)
    }

    animationId = requestAnimationFrame(tick)
  }

  function start() {
    if (isRunning) return
    isRunning = true
    startTime = performance.now()
    cycleStartTime = startTime
    currentPhase = 'inhale'

    const initialCycleMs = getCycleDurationMs(config.initialBpm)
    config.onPhaseChange('inhale', initialCycleMs * config.inhaleRatio)
    animationId = requestAnimationFrame(tick)
  }

  function stop() {
    isRunning = false
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  function getCurrentPhase(): BreathPhase {
    return currentPhase
  }

  function getPhaseProgress(): number {
    if (!isRunning) return 0
    const now = performance.now()
    const elapsedMs = now - startTime
    const sessionProgress = Math.min(1, elapsedMs / config.sessionDurationMs)
    const bpm = getCurrentBpm(sessionProgress)
    const cycleDurationMs = getCycleDurationMs(bpm)
    const cycleElapsedMs = now - cycleStartTime

    if (currentPhase === 'inhale') {
      return Math.min(1, cycleElapsedMs / (cycleDurationMs * config.inhaleRatio))
    } else {
      const exhaleElapsed = cycleElapsedMs - cycleDurationMs * config.inhaleRatio
      return Math.min(1, exhaleElapsed / (cycleDurationMs * config.exhaleRatio))
    }
  }

  function getCycleProgress(): number {
    if (!isRunning) return 0
    const now = performance.now()
    const elapsedMs = now - startTime
    const sessionProgress = Math.min(1, elapsedMs / config.sessionDurationMs)
    const bpm = getCurrentBpm(sessionProgress)
    const cycleDurationMs = getCycleDurationMs(bpm)
    return Math.min(1, (now - cycleStartTime) / cycleDurationMs)
  }

  function getTargetAmplitude(): number {
    const progress = getPhaseProgress()

    if (currentPhase === 'inhale') {
      // Contracting: 1 -> 0
      return 1 - progress
    } else {
      // Expanding: 0 -> 1
      return progress
    }
  }

  return {
    start,
    stop,
    getCurrentPhase,
    getPhaseProgress,
    getCycleProgress,
    getTargetAmplitude,
  }
}
