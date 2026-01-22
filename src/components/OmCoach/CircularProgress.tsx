/**
 * CircularProgress - Phase progress ring for Aum Coach
 *
 * Features:
 * - Phase segment markers showing Breathe/Ah/Oo/Mm boundaries
 * - Smooth crossfade transitions between phase labels
 * - Ring fills continuously through entire cycle
 * - "Get Ready" shows ring structure preview
 */

import { useState, useEffect, useRef } from 'react'
import type { CyclePhase, TimingMode } from '../../hooks/useGuidedOmCycle'
import { getPhaseLabel, TIMING_CONFIGS } from '../../hooks/useGuidedOmCycle'

interface CircularProgressProps {
  currentPhase: CyclePhase
  phaseProgress: number // 0-1 (for phase countdown display)
  cycleProgress: number // 0-1 (for ring - continuous through cycle)
  phaseTimeRemainingMs: number | null // null for flexible mode
  timingMode: TimingMode
  size?: number
}

/**
 * Calculate phase boundary positions as percentages of the cycle
 * Returns positions for: [breatheEnd, ahEnd, ooEnd] (mm goes to 100%)
 * Returns null for flexible mode (no fixed timing)
 */
function getPhasePositions(mode: TimingMode): number[] | null {
  if (mode === 'flexible') {
    // Flexible mode has no fixed timing - phases driven by user's voice
    return null
  }

  const config = TIMING_CONFIGS[mode]
  const total = config.breathe + config.ah + config.oo + config.mm

  const breatheEnd = config.breathe / total
  const ahEnd = (config.breathe + config.ah) / total
  const ooEnd = (config.breathe + config.ah + config.oo) / total

  return [breatheEnd, ahEnd, ooEnd]
}

export function CircularProgress({
  currentPhase,
  phaseProgress: _phaseProgress,
  cycleProgress,
  phaseTimeRemainingMs,
  timingMode,
  size = 220,
}: CircularProgressProps) {
  const center = size / 2
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2 - 4
  const markerRadius = radius + 16 // Position markers outside the ring

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

  // Calculate SVG arc path
  const circumference = 2 * Math.PI * radius
  const cycleOffset = circumference * (1 - cycleProgress)

  // Get phase boundary positions (null for flexible mode)
  const phasePositions = getPhasePositions(timingMode)
  const isFlexible = timingMode === 'flexible'

  // Format countdown
  const countdownSeconds =
    phaseTimeRemainingMs !== null ? Math.ceil(phaseTimeRemainingMs / 1000) : null

  // Get phase display label
  // During getReady, show "Breathe" so transition is seamless
  const phaseLabel = displayPhase === 'getReady' ? 'Breathe' : getPhaseLabel(displayPhase)

  // Determine special phases
  const isGetReady = currentPhase === 'getReady'
  const isBreathing = currentPhase === 'breathe'
  const isRestPhase = isGetReady || isBreathing

  // Calculate marker positions
  // For timed modes: positions based on actual phase durations
  // For flexible mode: evenly spaced as orientation guide (user drives pace)
  const markers = isFlexible
    ? [
        // Flexible: equal spacing, just for orientation
        { pos: 0, label: '~', phase: 'breathe' as const },
        { pos: 0.25, label: 'Ah', phase: 'ah' as const },
        { pos: 0.5, label: 'Oo', phase: 'oo' as const },
        { pos: 0.75, label: 'Mm', phase: 'mm' as const },
      ]
    : [
        // Timed: positions based on actual durations
        { pos: 0, label: '~', phase: 'breathe' as const },
        { pos: phasePositions![0], label: 'Ah', phase: 'ah' as const },
        { pos: phasePositions![1], label: 'Oo', phase: 'oo' as const },
        { pos: phasePositions![2], label: 'Mm', phase: 'mm' as const },
      ]

  return (
    <div className="relative" style={{ width: size + 40, height: size + 40 }}>
      {/* Phase markers around the outside */}
      {markers.map(({ pos, label, phase }) => {
        // Convert position (0-1) to angle (radians), starting from top
        const angle = pos * 2 * Math.PI - Math.PI / 2
        const x = (size + 40) / 2 + Math.cos(angle) * markerRadius
        const y = (size + 40) / 2 + Math.sin(angle) * markerRadius

        // Highlight current phase marker (getReady highlights breathe)
        const effectivePhase = currentPhase === 'getReady' ? 'breathe' : currentPhase
        const isCurrentPhase = phase === effectivePhase
        const isPastPhase = !isFlexible && cycleProgress > pos

        // Flexible mode: markers are orientation only (always subtle except current)
        // Timed mode: markers show progress (past = faded, current = highlighted)
        const markerClass = isCurrentPhase
          ? 'text-accent scale-110'
          : isFlexible
            ? 'text-ink/30' // Flexible: all non-current are subtle
            : isPastPhase
              ? 'text-ink/40'
              : 'text-ink/20'

        return (
          <div
            key={phase}
            className={`absolute flex items-center justify-center transition-all duration-300 ${markerClass}`}
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              fontSize: label === '~' ? '1rem' : '0.7rem',
              fontWeight: isCurrentPhase ? 600 : 400,
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
          left: 20,
          top: 20,
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
          {/* Background ring with phase segments */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            className="stroke-ink/10"
            strokeWidth={strokeWidth}
          />

          {/* Phase segment tick marks on background ring (timed modes only) */}
          {phasePositions &&
            phasePositions.map((pos, i) => {
              const angle = pos * 2 * Math.PI
              const innerR = radius - strokeWidth / 2 - 2
              const outerR = radius + strokeWidth / 2 + 2
              const x1 = center + Math.cos(angle) * innerR
              const y1 = center + Math.sin(angle) * innerR
              const x2 = center + Math.cos(angle) * outerR
              const y2 = center + Math.sin(angle) * outerR

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className="stroke-ink/20"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              )
            })}

          {/* Cycle progress ring - continuous through entire cycle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            className="stroke-accent"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={cycleOffset}
            style={{
              transition: isFlexible ? 'none' : 'stroke-dashoffset 0.1s linear',
            }}
          />
        </svg>

        {/* Center content with crossfade */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Phase label with crossfade transition */}
          <div
            className={`font-serif font-semibold text-ink ${isRestPhase ? 'animate-pulse' : ''}`}
            style={{
              fontSize: isRestPhase ? '2rem' : '3.5rem',
              lineHeight: 1,
              opacity: isTransitioning ? 0 : 1,
              transition: 'opacity 150ms ease-in-out',
            }}
          >
            {phaseLabel}
          </div>

          {/* Countdown seconds */}
          {countdownSeconds !== null && !isFlexible && (
            <div
              className="font-serif text-ink/50 mt-2"
              style={{
                fontSize: '1.5rem',
                opacity: isTransitioning ? 0 : 1,
                transition: 'opacity 150ms ease-in-out',
              }}
            >
              {countdownSeconds}s
            </div>
          )}

          {/* Flexible mode indicator */}
          {isFlexible && !isRestPhase && <div className="text-sm text-ink/40 mt-2">hold...</div>}
        </div>
      </div>
    </div>
  )
}
