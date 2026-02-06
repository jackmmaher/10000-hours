/**
 * CameraPositioningGuide - Guides user to get in frame before calibration
 *
 * Shows mirrored camera feed with skeleton overlay and dynamic instructions.
 * Auto-advances when person is detected and in frame for 2 continuous seconds.
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CameraPostureLandmarks } from '../../hooks/useCameraPosture'
import { SkeletonOverlay } from './SkeletonOverlay'

interface CameraPositioningGuideProps {
  landmarks: CameraPostureLandmarks | null
  isPersonDetected: boolean
  isInFrame: boolean
  videoRef: React.RefObject<HTMLVideoElement | null>
  onReady: () => void
  onCancel: () => void
}

const VIDEO_WIDTH = 640
const VIDEO_HEIGHT = 480

function getInstruction(
  isPersonDetected: boolean,
  isInFrame: boolean,
  landmarks: CameraPostureLandmarks | null
): string {
  if (!isPersonDetected) return 'Step into frame'
  if (!landmarks) return 'Step into frame'

  // Check if too close (shoulders near edges)
  const shoulderSpan = Math.abs(landmarks.leftShoulder.x - landmarks.rightShoulder.x)
  if (shoulderSpan > 0.7) return 'Move back a bit'

  if (!isInFrame) return 'Shift to center'

  return 'Looking good'
}

export function CameraPositioningGuide({
  landmarks,
  isPersonDetected,
  isInFrame,
  videoRef,
  onReady,
  onCancel,
}: CameraPositioningGuideProps) {
  const [showHelp, setShowHelp] = useState(false)
  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const helpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const instruction = getInstruction(isPersonDetected, isInFrame, landmarks)
  const isReady = instruction === 'Looking good'

  // Auto-advance after 2s of continuous "ready" state
  useEffect(() => {
    if (isReady) {
      readyTimerRef.current = setTimeout(() => {
        onReady()
      }, 2000)
    } else {
      if (readyTimerRef.current) {
        clearTimeout(readyTimerRef.current)
        readyTimerRef.current = null
      }
    }

    return () => {
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current)
    }
  }, [isReady, onReady])

  // Show help after 15s
  useEffect(() => {
    helpTimerRef.current = setTimeout(() => setShowHelp(true), 15000)
    return () => {
      if (helpTimerRef.current) clearTimeout(helpTimerRef.current)
    }
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#0A0A0F] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Cancel button */}
      <button
        onClick={onCancel}
        className="absolute left-4 px-3 py-1.5 text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all z-20"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        Cancel
      </button>

      {/* Camera feed area */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Video (mirrored) */}
        <video
          ref={videoRef as React.RefObject<HTMLVideoElement>}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
          autoPlay
          playsInline
          muted
        />

        {/* Skeleton overlay */}
        <div className="absolute inset-0">
          <SkeletonOverlay
            landmarks={landmarks}
            status="good"
            width={VIDEO_WIDTH}
            height={VIDEO_HEIGHT}
            mirrorX={true}
          />
        </div>

        {/* Target rectangle guide */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          <rect
            x="15%"
            y="10%"
            width="70%"
            height="80%"
            rx="16"
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="2"
            strokeDasharray="12 8"
          />
        </svg>
      </div>

      {/* Bottom area with instructions */}
      <div
        className="flex-none px-6 pb-6 pt-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={instruction}
            className="text-center mb-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Status dot */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  isReady ? 'bg-[#22C55E]' : 'bg-white/40'
                }`}
              />
              <p className="text-lg font-medium text-white">{instruction}</p>
            </div>

            {isReady && <p className="text-sm text-white/50">Hold still...</p>}
          </motion.div>
        </AnimatePresence>

        {/* Help text */}
        <AnimatePresence>
          {showHelp && !isReady && (
            <motion.p
              className="text-xs text-white/40 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Tip: Prop your phone 3-4 feet away at eye level
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
