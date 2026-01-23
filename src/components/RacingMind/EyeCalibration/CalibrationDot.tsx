/**
 * CalibrationDot - Individual calibration point component
 *
 * States:
 * - Pending: Small, muted circle
 * - Active: Large, pulsing, tappable
 * - Completed: Checkmark
 */

import { motion } from 'framer-motion'

export type DotStatus = 'pending' | 'active' | 'completed'

interface CalibrationDotProps {
  x: number // Percentage of screen width
  y: number // Percentage of screen height
  status: DotStatus
  onTap: () => void
}

export function CalibrationDot({ x, y, status, onTap }: CalibrationDotProps) {
  return (
    <motion.button
      className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      onClick={status === 'active' ? onTap : undefined}
      disabled={status !== 'active'}
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
  return <div className="w-3 h-3 rounded-full border-2 border-ink/30 bg-transparent" />
}

function ActiveDot() {
  return (
    <div className="relative">
      {/* Outer pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-accent/20"
        style={{ width: 64, height: 64, marginLeft: -32, marginTop: -32 }}
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

      {/* Inner dot */}
      <motion.div
        className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-lg"
        style={{
          boxShadow: '0 0 20px rgba(var(--accent-rgb), 0.4)',
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
