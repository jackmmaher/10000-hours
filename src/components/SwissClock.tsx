import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

/**
 * SwissClock - Analog cumulative meditation timer
 *
 * Swiss railway-inspired analog clock face that displays cumulative
 * meditation time. Hour numbers cascade when crossing 12-hour boundaries.
 * All colors come from CSS custom properties (--clock-*) for theme integration.
 *
 * Props:
 * - totalSeconds: cumulative seconds to display
 * - phase: timer phase for breathing/opacity sync
 *
 * Ported from cumulative-clock-v11.jsx, stripped of all dev tools,
 * audio, and manual controls. Pure display component.
 */

type ClockPhase = 'resting' | 'pending' | 'active' | 'settling'

interface SwissClockProps {
  totalSeconds: number
  phase: ClockPhase
  breathing: boolean
  className?: string
}

// ============================================
// PROPORTIONAL CONSTANTS
// ============================================
const DIAL_SIZE = 400
const CENTER = DIAL_SIZE / 2
const DIAL_RADIUS = 190

const PHI = 1.618

const MINUTE_HAND_LENGTH = DIAL_RADIUS * 0.7
const HOUR_HAND_LENGTH = MINUTE_HAND_LENGTH / PHI
const SECOND_HAND_LENGTH = DIAL_RADIUS * 0.72
const SECOND_HAND_TAIL = 35

const HOUR_HAND_WIDTH = DIAL_SIZE * 0.025
const MINUTE_HAND_WIDTH = DIAL_SIZE * 0.015
const SECOND_HAND_WIDTH = DIAL_SIZE * 0.005

const HOUR_NUMBER_RADIUS = DIAL_RADIUS * 0.725
const MINUTE_MARKER_OUTER = DIAL_RADIUS * 0.98
const MINUTE_MARKER_INNER_QUARTER = DIAL_RADIUS * 0.85
const MINUTE_MARKER_INNER_FIVE = DIAL_RADIUS * 0.88
const MINUTE_MARKER_INNER_SINGLE = DIAL_RADIUS * 0.92

const HOUR_FONT_SIZE = DIAL_SIZE * 0.05

// Pre-compute minute marker geometry (static — never changes)
const MINUTE_MARKERS = Array.from({ length: 60 }, (_, i) => {
  const rotation = (i / 60) * 360
  const isQuarter = i % 15 === 0
  const isFive = i % 5 === 0
  const innerRadius = isQuarter
    ? MINUTE_MARKER_INNER_QUARTER
    : isFive
      ? MINUTE_MARKER_INNER_FIVE
      : MINUTE_MARKER_INNER_SINGLE
  const strokeWidth = isQuarter ? 3 : isFive ? 2 : 1
  return { rotation, innerRadius, strokeWidth }
})

// Pre-compute hour number positions (static — never changes)
const HOUR_POSITIONS = Array.from({ length: 12 }, (_, i) => {
  const position = i + 1
  const angle = ((position / 12) * 360 - 90) * (Math.PI / 180)
  const x = CENTER + HOUR_NUMBER_RADIUS * Math.cos(angle)
  const y = CENTER + HOUR_NUMBER_RADIUS * Math.sin(angle)
  return { position, x, y }
})

export function SwissClock({ totalSeconds, phase, breathing, className = '' }: SwissClockProps) {
  // Decompose total seconds into H:M:S
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  // Hand rotations
  const secondRotation = (seconds / 60) * 360
  const minuteRotation = ((minutes + seconds / 60) / 60) * 360
  const hourHandPosition = (((hours % 12) + minutes / 60) / 12) * 360

  // Second hand visibility — matches UnifiedTime behavior
  const showSecondHand = phase === 'active' || phase === 'settling'

  // ============================================
  // HOUR NUMBER CASCADE ANIMATION
  // ============================================
  // Each position tracks its own displayed number and opacity
  const [hourDisplayState, setHourDisplayState] = useState(
    Array.from({ length: 12 }, (_, i) => ({
      displayedValue: i + 1,
      opacity: 1,
    }))
  )
  const [previousHourBase, setPreviousHourBase] = useState(0)
  const cascadeTimeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const currentHourBase = Math.floor(hours / 12) * 12

    if (currentHourBase !== previousHourBase) {
      // Clear any existing cascade timeouts
      cascadeTimeoutRefs.current.forEach((timeout) => clearTimeout(timeout))
      cascadeTimeoutRefs.current = []

      if (previousHourBase !== null && (currentHourBase > 0 || previousHourBase > 0)) {
        // Cascade: position 1 first, then 2, 3... through 12
        const delayPerNumber = 1250
        const fadeOutDuration = 400

        for (let posIndex = 0; posIndex < 12; posIndex++) {
          const newValue = currentHourBase + posIndex + 1

          const fadeOutTimeout = setTimeout(() => {
            setHourDisplayState((prev) => {
              const newState = [...prev]
              newState[posIndex] = { ...newState[posIndex], opacity: 0 }
              return newState
            })
          }, posIndex * delayPerNumber)

          const fadeInTimeout = setTimeout(
            () => {
              setHourDisplayState((prev) => {
                const newState = [...prev]
                newState[posIndex] = { displayedValue: newValue, opacity: 1 }
                return newState
              })
            },
            posIndex * delayPerNumber + fadeOutDuration
          )

          cascadeTimeoutRefs.current.push(fadeOutTimeout, fadeInTimeout)
        }
      } else {
        // Initial render or reset
        setHourDisplayState(
          Array.from({ length: 12 }, (_, i) => ({
            displayedValue: currentHourBase + i + 1,
            opacity: 1,
          }))
        )
      }
    }

    setPreviousHourBase(currentHourBase)

    return () => {
      cascadeTimeoutRefs.current.forEach((timeout) => clearTimeout(timeout))
    }
  }, [hours]) // eslint-disable-line react-hooks/exhaustive-deps

  // Subtle opacity during transitions (matches GooeyOrb pattern)
  const isTransitioning = phase === 'pending' || phase === 'settling'
  const clockOpacity = isTransitioning ? 0.85 : 1

  return (
    <motion.div
      className={`flex items-center justify-center ${breathing ? 'animate-box-breathe' : ''} ${className}`}
      animate={{ opacity: clockOpacity }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div
        style={{
          borderRadius: '50%',
          padding: '8px',
          maxWidth: '70vw',
          maxHeight: '70vw',
          width: '280px',
          height: '280px',
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`}
          style={{ display: 'block' }}
        >
          {/* Dial background */}
          <circle cx={CENTER} cy={CENTER} r={DIAL_RADIUS} fill="var(--clock-face-bg)" />

          {/* Minute markers */}
          {MINUTE_MARKERS.map((marker, i) => (
            <line
              key={`m-${i}`}
              x1={CENTER}
              y1={CENTER - MINUTE_MARKER_OUTER}
              x2={CENTER}
              y2={CENTER - marker.innerRadius}
              stroke="var(--clock-marker)"
              strokeWidth={marker.strokeWidth}
              transform={`rotate(${marker.rotation} ${CENTER} ${CENTER})`}
              strokeLinecap="round"
            />
          ))}

          {/* Hour numbers with cascade animation */}
          {HOUR_POSITIONS.map(({ position, x, y }) => {
            const posIndex = position - 1
            const { displayedValue, opacity } = hourDisplayState[posIndex]
            const fontSize =
              displayedValue >= 100
                ? HOUR_FONT_SIZE * 0.8
                : displayedValue >= 10
                  ? HOUR_FONT_SIZE * 0.9
                  : HOUR_FONT_SIZE

            return (
              <text
                key={`h-${position}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--clock-number)"
                style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontSize: `${fontSize}px`,
                  fontWeight: '500',
                  letterSpacing: '-0.02em',
                  opacity,
                  transition: 'opacity 0.4s ease-in-out',
                }}
              >
                {displayedValue}
              </text>
            )
          })}

          {/* Hour hand */}
          <g transform={`rotate(${hourHandPosition} ${CENTER} ${CENTER})`}>
            <rect
              x={CENTER - HOUR_HAND_WIDTH / 2}
              y={CENTER - HOUR_HAND_LENGTH}
              width={HOUR_HAND_WIDTH}
              height={HOUR_HAND_LENGTH + 15}
              fill="var(--clock-hand)"
              rx={HOUR_HAND_WIDTH / 4}
            />
          </g>

          {/* Minute hand */}
          <g transform={`rotate(${minuteRotation} ${CENTER} ${CENTER})`}>
            <rect
              x={CENTER - MINUTE_HAND_WIDTH / 2}
              y={CENTER - MINUTE_HAND_LENGTH}
              width={MINUTE_HAND_WIDTH}
              height={MINUTE_HAND_LENGTH + 20}
              fill="var(--clock-hand)"
              rx={MINUTE_HAND_WIDTH / 3}
            />
          </g>

          {/* Second hand — only visible during active/settling phases */}
          <g
            transform={`rotate(${secondRotation} ${CENTER} ${CENTER})`}
            style={{
              opacity: showSecondHand ? 1 : 0,
              transition: 'opacity 4s ease-in-out',
            }}
          >
            {/* Tail */}
            <line
              x1={CENTER}
              y1={CENTER}
              x2={CENTER}
              y2={CENTER + SECOND_HAND_TAIL}
              stroke="var(--clock-accent)"
              strokeWidth={SECOND_HAND_WIDTH}
              strokeLinecap="round"
            />
            {/* Main shaft */}
            <line
              x1={CENTER}
              y1={CENTER}
              x2={CENTER}
              y2={CENTER - SECOND_HAND_LENGTH + 15}
              stroke="var(--clock-accent)"
              strokeWidth={SECOND_HAND_WIDTH}
              strokeLinecap="round"
            />
            {/* Circle cap */}
            <circle
              cx={CENTER}
              cy={CENTER - SECOND_HAND_LENGTH + 15}
              r={12}
              fill="var(--clock-accent)"
            />
          </g>

          {/* Center pivot */}
          <circle cx={CENTER} cy={CENTER} r={7} fill="var(--clock-hand)" />
        </svg>
      </div>
    </motion.div>
  )
}
