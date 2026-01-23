/**
 * CalibrationDot - Individual calibration point component
 *
 * States:
 * - Pending: Small, muted circle
 * - Active: Large, pulsing, tappable
 * - Completed: Checkmark
 *
 * Uses Racing Mind visual style (blue orb) to match session experience.
 */

import { motion } from 'framer-motion'
import { RACING_MIND_COLORS } from '../../../lib/racingMindAnimation'

export type DotStatus = 'pending' | 'active' | 'completed'

interface CalibrationDotProps {
  x: number // Percentage of screen width
  y: number // Percentage of screen height
  status: DotStatus
  onTap: () => void
  className?: string
}

export function CalibrationDot({ x, y, status, onTap, className }: CalibrationDotProps) {
  // Determine button size based on status for proper touch target
  const size = status === 'active' ? 64 : status === 'completed' ? 32 : 16

  return (
    <motion.button
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center ${className || ''}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        pointerEvents: status === 'active' ? 'auto' : 'none',
      }}
      onTap={onTap}
      initial={false}
      animate={status}
      variants={{
        pending: {
          scale: 1,
          opacity: 0.4,
        },
        active: {
          scale: 1,
          opacity: 1,
        },
        completed: {
          scale: 1,
          opacity: 1,
        },
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {status === 'pending' && <PendingDot />}
      {status === 'active' && <ActiveDot />}
      {status === 'completed' && <CompletedDot />}
    </motion.button>
  )
}

function PendingDot() {
  return (
    <div
      className="w-3 h-3 rounded-full border-2 bg-transparent"
      style={{ borderColor: `${RACING_MIND_COLORS.orb}50` }}
    />
  )
}

function ActiveDot() {
  const orbColor = RACING_MIND_COLORS.orb
  const glowColor = RACING_MIND_COLORS.glow

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Outer pulse ring - centered in the 64x64 container */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 64,
          height: 64,
          backgroundColor: `${glowColor}33`,
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Inner dot - matches Racing Mind orb style */}
      <motion.div
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg relative"
        style={{
          backgroundColor: orbColor,
          boxShadow: `0 0 20px ${glowColor}66`,
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 0.7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <span className="text-white text-xs font-medium">TAP</span>
      </motion.div>
    </div>
  )
}

function CompletedDot() {
  return (
    <motion.div
      className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
    >
      <svg
        className="w-3.5 h-3.5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </motion.div>
  )
}
