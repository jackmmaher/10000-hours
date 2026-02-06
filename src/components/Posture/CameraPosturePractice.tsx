/**
 * CameraPosturePractice - Active camera practice session
 *
 * Three view modes:
 * - Focus View (default): Video fades from 100% to 15% over 30s. Dots stay bright.
 * - Mirror View: Full camera feed + skeleton overlay.
 * - Zen View: No camera, just colored orb (matches PosturePractice pattern).
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import type {
  CameraPostureLandmarks,
  CameraPostureScores,
  CameraPostureStatus,
} from '../../hooks/useCameraPosture'
import type { PostureSessionStats } from '../../hooks/usePosture'
import { useWakeLock } from '../../hooks/useWakeLock'
import { SkeletonOverlay } from './SkeletonOverlay'

type ViewMode = 'focus' | 'mirror' | 'zen'

interface CameraPosturePracticeProps {
  landmarks: CameraPostureLandmarks | null
  scores: CameraPostureScores | null
  status: CameraPostureStatus
  videoRef: React.RefObject<HTMLVideoElement | null>
  getSessionStats: () => PostureSessionStats
  duration: number // minutes
  onEnd: () => void
  onCancel: () => void
}

const STATUS_CONFIG = {
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

const VIDEO_WIDTH = 640
const VIDEO_HEIGHT = 480
const FADE_DURATION_MS = 30000

export function CameraPosturePractice({
  landmarks,
  status,
  videoRef,
  getSessionStats,
  duration,
  onEnd,
  onCancel,
}: CameraPosturePracticeProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('focus')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [videoOpacity, setVideoOpacity] = useState(1)
  const [hasStarted, setHasStarted] = useState(false)
  const fadeStartRef = useRef(Date.now())

  // Wake lock
  useWakeLock(true)

  // Fade-in after mount
  useEffect(() => {
    const timer = setTimeout(() => setHasStarted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Elapsed time update
  useEffect(() => {
    const interval = setInterval(() => {
      const stats = getSessionStats()
      setElapsedSeconds(stats.totalSeconds)
    }, 1000)
    return () => clearInterval(interval)
  }, [getSessionStats])

  // Auto-end when duration expires
  useEffect(() => {
    if (duration <= 0) return
    const durationMs = duration * 60 * 1000
    const timer = setTimeout(onEnd, durationMs)
    return () => clearTimeout(timer)
  }, [duration, onEnd])

  // Focus View: fade video opacity from 100% to 15% over 30 seconds
  useEffect(() => {
    if (viewMode !== 'focus') {
      setVideoOpacity(viewMode === 'mirror' ? 1 : 0)
      return
    }

    fadeStartRef.current = Date.now()

    const updateOpacity = () => {
      const elapsed = Date.now() - fadeStartRef.current
      const t = Math.min(elapsed / FADE_DURATION_MS, 1)
      // Ease: 1.0 → 0.15
      setVideoOpacity(1 - t * 0.85)
      if (t < 1) {
        requestAnimationFrame(updateOpacity)
      }
    }

    const frame = requestAnimationFrame(updateOpacity)
    return () => cancelAnimationFrame(frame)
  }, [viewMode])

  const currentStatus = STATUS_CONFIG[status]

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return {
      minutes: String(mins),
      seconds: String(secs).padStart(2, '0'),
    }
  }, [])

  const timeParts = formatTime(elapsedSeconds)
  const stats = getSessionStats()

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#0A0A0F]"
      initial={{ opacity: 0 }}
      animate={{ opacity: hasStarted ? 1 : 0 }}
      transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Cancel button */}
      <button
        onClick={onCancel}
        className="absolute left-4 px-3 py-1.5 text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all z-20"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        Cancel
      </button>

      {/* End button */}
      <button
        onClick={onEnd}
        className="absolute right-4 px-4 py-2 text-sm font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all z-20"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        End
      </button>

      {/* Camera / Zen content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {viewMode === 'zen' ? (
          // Zen View: orb only (matches PosturePractice)
          <div className="flex flex-col items-center">
            <motion.div
              className={`w-32 h-32 rounded-full ${currentStatus.bg} ${currentStatus.glow} transition-all duration-500`}
              animate={{
                scale: status === 'good' ? 1 : status === 'warning' ? 1.05 : 1.1,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        ) : (
          // Focus / Mirror View: video + skeleton
          <>
            <video
              ref={videoRef as React.RefObject<HTMLVideoElement>}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              style={{ transform: 'scaleX(-1)', opacity: videoOpacity }}
              autoPlay
              playsInline
              muted
            />
            <div className="absolute inset-0">
              <SkeletonOverlay
                landmarks={landmarks}
                status={status}
                width={VIDEO_WIDTH}
                height={VIDEO_HEIGHT}
                opacity={viewMode === 'focus' ? 1 : 0.9}
                mirrorX={true}
              />
            </div>
          </>
        )}
      </div>

      {/* Status label */}
      <div
        className="absolute left-0 right-0 flex justify-center z-10"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 4rem)' }}
      >
        <motion.p
          className={`text-lg font-medium ${currentStatus.text} transition-colors duration-800`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {currentStatus.label}
        </motion.p>
      </div>

      {/* View mode toggle */}
      <div
        className="absolute left-0 right-0 flex justify-center z-20"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)' }}
      >
        <div className="flex bg-white/10 rounded-full p-0.5">
          {(['focus', 'mirror', 'zen'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                viewMode === mode ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {mode === 'focus' ? 'Focus' : mode === 'mirror' ? 'Mirror' : 'Zen'}
            </button>
          ))}
        </div>
      </div>

      {/* Elapsed time */}
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

      {/* Good% */}
      <div
        className="absolute left-4 text-white/30 text-xs z-10"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 2.5rem)' }}
      >
        <p>Good: {stats.goodPosturePercent}%</p>
      </div>
    </motion.div>
  )
}
