/**
 * SkeletonOverlay - Canvas renderer for pose skeleton
 *
 * Draws 5 keypoint dots (nose, ears, shoulders) and 3 alignment lines
 * (ear-to-ear, shoulder-to-shoulder, vertical plumb) on a canvas
 * positioned over the video feed.
 */

import { useEffect, useRef } from 'react'
import type { CameraPostureLandmarks, CameraPostureStatus } from '../../hooks/useCameraPosture'

interface SkeletonOverlayProps {
  landmarks: CameraPostureLandmarks | null
  status: CameraPostureStatus
  width: number
  height: number
  opacity?: number
  mirrorX?: boolean
}

const STATUS_COLORS: Record<CameraPostureStatus, string> = {
  good: '#22C55E',
  warning: '#F59E0B',
  poor: '#EF4444',
}

export function SkeletonOverlay({
  landmarks,
  status,
  width,
  height,
  opacity = 1,
  mirrorX = true,
}: SkeletonOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const landmarksRef = useRef(landmarks)
  const statusRef = useRef(status)

  // Keep refs current for animation loop
  landmarksRef.current = landmarks
  statusRef.current = status

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const lm = landmarksRef.current
      const st = statusRef.current

      ctx.clearRect(0, 0, width, height)
      if (!lm) {
        animFrameRef.current = requestAnimationFrame(draw)
        return
      }

      const tx = (x: number) => (mirrorX ? width - x * width : x * width)
      const ty = (y: number) => y * height

      ctx.globalAlpha = opacity

      // --- Lines ---

      // Ear-to-ear
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = 1
      ctx.moveTo(tx(lm.leftEar.x), ty(lm.leftEar.y))
      ctx.lineTo(tx(lm.rightEar.x), ty(lm.rightEar.y))
      ctx.stroke()

      // Shoulder-to-shoulder
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = 1
      ctx.moveTo(tx(lm.leftShoulder.x), ty(lm.leftShoulder.y))
      ctx.lineTo(tx(lm.rightShoulder.x), ty(lm.rightShoulder.y))
      ctx.stroke()

      // Vertical plumb line (shoulder midpoint to nose)
      const shoulderMidX = (lm.leftShoulder.x + lm.rightShoulder.x) / 2
      const shoulderMidY = (lm.leftShoulder.y + lm.rightShoulder.y) / 2
      ctx.beginPath()
      ctx.strokeStyle = STATUS_COLORS[st]
      ctx.lineWidth = 2
      ctx.moveTo(tx(shoulderMidX), ty(shoulderMidY))
      ctx.lineTo(tx(lm.nose.x), ty(lm.nose.y))
      ctx.stroke()

      // --- Dots ---

      const drawDot = (x: number, y: number, radius: number, alpha: number) => {
        ctx.beginPath()
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.arc(tx(x), ty(y), radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Ears (8px, 80% white)
      drawDot(lm.leftEar.x, lm.leftEar.y, 4, 0.8)
      drawDot(lm.rightEar.x, lm.rightEar.y, 4, 0.8)

      // Shoulders (8px, 80% white)
      drawDot(lm.leftShoulder.x, lm.leftShoulder.y, 4, 0.8)
      drawDot(lm.rightShoulder.x, lm.rightShoulder.y, 4, 0.8)

      // Nose (6px, 30% white)
      drawDot(lm.nose.x, lm.nose.y, 3, 0.3)

      ctx.globalAlpha = 1

      animFrameRef.current = requestAnimationFrame(draw)
    }

    animFrameRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [width, height, opacity, mirrorX])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ width, height }}
    />
  )
}
