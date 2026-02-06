/**
 * CircularProgress - Phase progress ring for Aum Coach
 *
 * Features:
 * - Clean, minimal ring design following Human-Crafted Design principles
 * - Phase labels positioned around the outside for orientation
 * - Smooth crossfade transitions between phase labels
 * - Ring fills continuously clockwise through entire cycle
 * - Breathe marker at 12 o'clock position
 * - Uses its own rAF loop for smooth, frame-accurate arc animation
 *   independent of React re-render timing
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import type { CyclePhase, TimingMode } from '../../hooks/useGuidedOmCycle'
import {
  getPhaseLabel,
  TIMING_CONFIGS,
  FIRST_BREATHE_MULTIPLIER,
} from '../../hooks/useGuidedOmCycle'

interface CircularProgressProps {
  currentPhase: CyclePhase
  phaseProgress: number // 0-1 (for phase countdown display)
  cycleProgress: number // 0-1 (for ring - continuous through cycle)
  totalProgress: number // Continuous progress across cycles (use % 1 for display)
  isFirstCycle: boolean // True during first cycle (extended breathe)
  phaseTimeRemainingMs: number | null
  timingMode: TimingMode
  size?: number
}

/**
 * Calculate phase boundary positions as percentages of the cycle
 * Returns positions for: [breatheEnd, ahEnd, ooEnd] (mm ends at 1.0)
 *
 * For first cycle, accounts for extended breathe duration so markers
 * are positioned correctly relative to the arc progress.
 */
function getPhasePositions(mode: TimingMode, isFirstCycle: boolean): number[] {
  const config = TIMING_CONFIGS[mode]
  const breatheDuration = isFirstCycle ? config.breathe * FIRST_BREATHE_MULTIPLIER : config.breathe

  const total = breatheDuration + config.ah + config.oo + config.mm

  const breatheEnd = breatheDuration / total
  const ahEnd = (breatheDuration + config.ah) / total
  const ooEnd = (breatheDuration + config.ah + config.oo) / total

  return [breatheEnd, ahEnd, ooEnd]
}

export function CircularProgress({
  currentPhase,
  phaseProgress: _phaseProgress,
  cycleProgress: _cycleProgress,
  totalProgress,
  isFirstCycle,
  phaseTimeRemainingMs,
  timingMode,
  size = 220,
}: CircularProgressProps) {
  // Note: cycleProgress kept in props for API compatibility but unused
  // phaseProgress is used for the breathing pacer animation
  void _cycleProgress
  const center = size / 2
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2 - 8
  const markerRadius = radius + 28 // Position markers well outside the ring

  const isBreathing = currentPhase === 'breathe'

  // SVG constants
  const circumference = 2 * Math.PI * radius

  // --- Frame-accurate arc animation via rAF ---
  // Instead of relying on React re-renders to update the arc (which can be
  // batched/delayed), we interpolate between totalProgress snapshots and
  // update the SVG element directly every frame for perfectly smooth motion.
  const circleRef = useRef<SVGCircleElement>(null)
  const lastTotalProgressRef = useRef(totalProgress)
  const lastUpdateTimeRef = useRef(performance.now())
  const progressRateRef = useRef(0) // progress units per ms
  const animFrameRef = useRef<number | null>(null)

  // Update our interpolation state whenever React delivers a new totalProgress
  useEffect(() => {
    const now = performance.now()
    const dt = now - lastUpdateTimeRef.current
    const dp = totalProgress - lastTotalProgressRef.current

    // Compute the rate of progress change (units/ms) for interpolation.
    // Only update rate when we have a meaningful time delta and forward progress.
    if (dt > 0 && dp > 0 && dp < 0.5) {
      progressRateRef.current = dp / dt
    }

    lastTotalProgressRef.current = totalProgress
    lastUpdateTimeRef.current = now
  }, [totalProgress])

  // The rAF loop: runs every frame and directly sets strokeDashoffset on the SVG
  const animateArc = useCallback(() => {
    const circle = circleRef.current
    if (!circle) {
      animFrameRef.current = requestAnimationFrame(animateArc)
      return
    }

    const now = performance.now()
    const elapsed = now - lastUpdateTimeRef.current
    const rate = progressRateRef.current

    // If we haven't received a React update in over 200ms, the session
    // is likely paused or stopped. Don't interpolate further.
    const lastProgress = lastTotalProgressRef.current
    let interpolated: number
    if (elapsed > 200 || rate <= 0) {
      interpolated = lastProgress
    } else {
      // Interpolate forward from last known totalProgress at the measured rate.
      interpolated = lastProgress + rate * elapsed

      // Clamp interpolation to prevent overshooting past the next integer
      // boundary (which would visually jump backward when modulo wraps).
      const nextBoundary = Math.floor(lastProgress) + 1
      if (interpolated >= nextBoundary && lastProgress < nextBoundary) {
        // Clamp to just before boundary -- the next React update will
        // provide the true post-boundary value
        interpolated = nextBoundary - 0.001
      }
    }

    const displayProgress = interpolated % 1
    const offset = circumference * (1 - displayProgress)
    circle.setAttribute('stroke-dashoffset', String(offset))

    animFrameRef.current = requestAnimationFrame(animateArc)
  }, [circumference])

  // Start/stop the rAF loop
  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(animateArc)
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [animateArc])

  // Track previous phase for crossfade
  const [displayPhase, setDisplayPhase] = useState(currentPhase)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const prevPhaseRef = useRef(currentPhase)

  // Handle phase transitions with crossfade
  useEffect(() => {
    if (currentPhase !== prevPhaseRef.current) {
      setIsTransitioning(true)

      // After fade out, update display and fade in
      const timer = setTimeout(() => {
        setDisplayPhase(currentPhase)
        setIsTransitioning(false)
      }, 150) // Half of the transition duration

      prevPhaseRef.current = currentPhase
      return () => clearTimeout(timer)
    }
  }, [currentPhase])

  // Get phase boundary positions (dynamic based on first cycle's extended breathe)
  const phasePositions = getPhasePositions(timingMode, isFirstCycle)

  // Format countdown
  const countdownSeconds =
    phaseTimeRemainingMs !== null ? Math.ceil(phaseTimeRemainingMs / 1000) : null

  // Get phase display label
  const phaseLabel = getPhaseLabel(displayPhase)

  // Calculate marker positions based on actual phase durations
  const markers = [
    { pos: 0, label: 'In', phase: 'breathe' as const }, // Short for "Breathe In"
    { pos: phasePositions[0], label: 'Ah', phase: 'ah' as const },
    { pos: phasePositions[1], label: 'Uu', phase: 'oo' as const },
    { pos: phasePositions[2], label: 'Mm', phase: 'mm' as const },
  ]

  return (
    <div className="relative" style={{ width: size + 56, height: size + 56 }}>
      {/* Phase markers around the outside - these ARE the demarcation */}
      {markers.map(({ pos, label, phase }) => {
        // Convert position (0-1) to angle (radians), starting from top
        const angle = pos * 2 * Math.PI - Math.PI / 2
        const x = (size + 56) / 2 + Math.cos(angle) * markerRadius
        const y = (size + 56) / 2 + Math.sin(angle) * markerRadius

        const isCurrentPhase = phase === currentPhase

        return (
          <div
            key={phase}
            className="absolute flex items-center justify-center"
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              fontSize: '0.75rem',
              fontWeight: isCurrentPhase ? 600 : 400,
              color: isCurrentPhase ? 'var(--accent)' : 'var(--text-secondary)',
              opacity: isCurrentPhase ? 1 : 0.7,
              transition: 'all 300ms var(--ease-out)',
            }}
          >
            {label}
          </div>
        )
      })}

      {/* Main ring container */}
      <div
        className="absolute"
        style={{
          left: 28,
          top: 28,
          width: size,
          height: size,
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background ring - subtle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />

          {/* Cycle progress ring - the hero element
              stroke-dashoffset is updated directly by the rAF loop (not React),
              so we set the initial value here and let the loop take over. */}
          <circle
            ref={circleRef}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--accent, #f97316)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
          />
        </svg>

        {/* Breathing pacer — expanding circle during breathe phase */}
        {isBreathing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="rounded-full"
              style={{
                width: `${20 + _phaseProgress * 70}%`,
                height: `${20 + _phaseProgress * 70}%`,
                backgroundColor: 'var(--accent)',
                opacity: 0.06 + _phaseProgress * 0.06,
                transition: 'width 200ms ease-out, height 200ms ease-out, opacity 200ms ease-out',
              }}
            />
          </div>
        )}

        {/* Center content with crossfade */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Phase label with crossfade transition */}
          <div
            className="font-serif font-semibold"
            style={{
              fontSize: isBreathing ? '1.75rem' : '3rem',
              lineHeight: 1,
              opacity: isTransitioning ? 0 : 1,
              transition: 'opacity 150ms ease-in-out',
              color: 'var(--text-primary)',
            }}
          >
            {phaseLabel}
          </div>

          {/* Countdown seconds */}
          {countdownSeconds !== null && (
            <div
              className="font-serif mt-1"
              style={{
                fontSize: '1.25rem',
                opacity: isTransitioning ? 0 : 0.6,
                transition: 'opacity 150ms ease-in-out',
                color: 'var(--text-secondary)',
              }}
            >
              {countdownSeconds}s
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
