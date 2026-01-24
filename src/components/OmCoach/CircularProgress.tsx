/**
 * CircularProgress - Phase progress ring for Aum Coach
 *
 * Features:
 * - Clean, minimal ring design following Human-Crafted Design principles
 * - Phase labels positioned around the outside for orientation
 * - Smooth crossfade transitions between phase labels
 * - Ring fills continuously clockwise through entire cycle
 * - Breathe marker at 12 o'clock position
 */

import { useState, useEffect, useRef } from 'react'
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
  // Note: phaseProgress and cycleProgress kept in props for API compatibility but unused
  void _phaseProgress
  void _cycleProgress
  const center = size / 2
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2 - 8
  const markerRadius = radius + 28 // Position markers well outside the ring

  // Use totalProgress % 1 for display - this NEVER reverses because totalProgress
  // continuously increases (0 → 1 → 2 → 3...). The modulo gives us 0-1 range
  // that wraps seamlessly without any backward animation.
  const isBreathing = currentPhase === 'breathe'
  const displayProgress = totalProgress % 1

  // Track previous phase for crossfade
  const [displayPhase, setDisplayPhase] = useState(currentPhase)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const prevPhaseRef = useRef(currentPhase)

  // Track previous totalProgress to detect cycle boundaries (for transition handling)
  const prevTotalProgressRef = useRef(totalProgress)
  const [isCycleBoundary, setIsCycleBoundary] = useState(false)

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

  // Detect cycle boundary crossings (when totalProgress crosses integer boundaries)
  // We use this to briefly disable transitions for perfectly smooth wrapping
  useEffect(() => {
    const prevProgress = prevTotalProgressRef.current
    const currProgress = totalProgress

    // Check if we crossed an integer boundary (e.g., 0.95 → 1.05 means crossing 1.0)
    const prevFloor = Math.floor(prevProgress)
    const currFloor = Math.floor(currProgress)

    if (currFloor > prevFloor && currProgress > 0) {
      setIsCycleBoundary(true)
      // Re-enable transition after the wrap completes
      const timer = setTimeout(() => {
        setIsCycleBoundary(false)
      }, 50)
      prevTotalProgressRef.current = currProgress
      return () => clearTimeout(timer)
    }

    prevTotalProgressRef.current = currProgress
  }, [totalProgress])

  // Calculate SVG arc path
  const circumference = 2 * Math.PI * radius
  const cycleOffset = circumference * (1 - displayProgress)

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
    { pos: phasePositions[1], label: 'Oo', phase: 'oo' as const },
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

          {/* Cycle progress ring - the hero element */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--accent, #f97316)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={cycleOffset}
            style={{
              transition: isCycleBoundary ? 'none' : 'stroke-dashoffset 0.1s linear',
            }}
          />
        </svg>

        {/* Center content with crossfade */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Phase label with crossfade transition */}
          <div
            className={`font-serif font-semibold ${isBreathing ? 'animate-pulse' : ''}`}
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
