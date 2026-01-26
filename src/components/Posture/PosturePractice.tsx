/**
 * PosturePractice - Active posture tracking view
 *
 * Features:
 * - Minimal, non-distracting UI
 * - Visual posture indicator (green/yellow/red)
 * - Elapsed time display
 * - End session button
 *
 * The actual haptic alerts are handled by usePosture hook.
 */

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { OrientationUpdate } from '../../plugins/posture'
import type { PostureSessionStats } from '../../hooks/usePosture'

/** Deviation thresholds for visual feedback */
const GOOD_THRESHOLD = 10 // degrees
const WARNING_THRESHOLD = 15 // degrees (matches haptic threshold)

type PostureStatus = 'good' | 'warning' | 'poor'

interface PosturePracticeProps {
  deviationDegrees: number
  currentOrientation: OrientationUpdate | null
  getSessionStats: () => PostureSessionStats
  onEnd: () => void
  onCancel: () => void
}

export function PosturePractice({
  deviationDegrees,
  currentOrientation,
  getSessionStats,
  onEnd,
  onCancel,
}: PosturePracticeProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Trigger fade-in after mount
  useEffect(() => {
    const timer = setTimeout(() => setHasStarted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const stats = getSessionStats()
      setElapsedSeconds(stats.totalSeconds)
    }, 1000)

    return () => clearInterval(interval)
  }, [getSessionStats])

  // Determine posture status for visual feedback
  const getPostureStatus = useCallback((): PostureStatus => {
    if (deviationDegrees <= GOOD_THRESHOLD) return 'good'
    if (deviationDegrees <= WARNING_THRESHOLD) return 'warning'
    return 'poor'
  }, [deviationDegrees])

  const status = getPostureStatus()

  // Status colors
  const statusColors = {
    good: {
      bg: 'bg-[#22C55E]',
      glow: 'shadow-[0_0_60px_20px_rgba(34,197,94,0.3)]',
      text: 'text-[#22C55E]',
      label: 'Good Posture',
    },
    warning: {
      bg: 'bg-[#F59E0B]',
      glow: 'shadow-[0_0_60px_20px_rgba(245,158,11,0.3)]',
      text: 'text-[#F59E0B]',
      label: 'Adjust Posture',
    },
    poor: {
      bg: 'bg-[#EF4444]',
      glow: 'shadow-[0_0_60px_20px_rgba(239,68,68,0.3)]',
      text: 'text-[#EF4444]',
      label: 'Sit Up Straight',
    },
  }

  const currentStatus = statusColors[status]

  // Format elapsed time
  const formatTime = (seconds: number): { minutes: string; seconds: string } => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return {
      minutes: String(mins),
      seconds: String(secs).padStart(2, '0'),
    }
  }

  const timeParts = formatTime(elapsedSeconds)

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#0A0A0F]"
      initial={{ opacity: 0 }}
      animate={{ opacity: hasStarted ? 1 : 0 }}
      transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Cancel button - top left */}
      <button
        onClick={onCancel}
        className="absolute left-4 px-3 py-1.5 text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all z-10"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        Cancel
      </button>

      {/* End button - top right */}
      <button
        onClick={onEnd}
        className="absolute right-4 px-4 py-2 text-sm font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all z-10"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        End
      </button>

      {/* Main content - centered posture indicator */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Posture indicator orb */}
        <motion.div
          className={`w-32 h-32 rounded-full ${currentStatus.bg} ${currentStatus.glow} transition-all duration-500`}
          animate={{
            scale: status === 'good' ? 1 : status === 'warning' ? 1.05 : 1.1,
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Status label */}
        <motion.p
          className={`mt-8 text-lg font-medium ${currentStatus.text} transition-colors duration-500`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {currentStatus.label}
        </motion.p>

        {/* Deviation display (subtle) */}
        {currentOrientation && (
          <p className="mt-2 text-sm text-white/30">
            {Math.round(deviationDegrees)}° from baseline
          </p>
        )}
      </div>

      {/* Elapsed time - bottom center */}
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

      {/* Session stats - bottom left (subtle) */}
      <div
        className="absolute left-4 text-white/30 text-xs"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 2.5rem)' }}
      >
        <p>Good: {getSessionStats().goodPosturePercent}%</p>
      </div>
    </motion.div>
  )
}
