/**
 * useCameraPosture - Camera-based posture tracking using MediaPipe BlazePose
 *
 * Mirrors usePosture.ts in shape (same PostureSessionStats return type)
 * but replaces AirPods with front-camera pose estimation.
 *
 * Key design decisions:
 * - 2 FPS inference (posture changes slowly, saves battery)
 * - EMA smoothing (factor 0.3) for stable readings
 * - Landmark ratios for calibration (not absolute pixels)
 * - 2-second hold before status transitions
 * - Haptic via navigator.vibrate with 30s cooldown
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { PoseLandmarker, FilesetResolver, type PoseLandmarkerResult } from '@mediapipe/tasks-vision'
import type { PostureSessionStats } from './usePosture'

// --- Types ---

export interface CameraPostureLandmark {
  x: number
  y: number
  visibility: number
}

export interface CameraPostureLandmarks {
  nose: CameraPostureLandmark
  leftEar: CameraPostureLandmark
  rightEar: CameraPostureLandmark
  leftShoulder: CameraPostureLandmark
  rightShoulder: CameraPostureLandmark
  leftHip: CameraPostureLandmark
  rightHip: CameraPostureLandmark
}

export interface CameraPostureScores {
  spinalAlignment: number // 0-100
  headTilt: number // 0-100
  shoulderSymmetry: number // 0-100
  overall: number // 0-100 weighted composite
}

export type CameraPostureStatus = 'good' | 'warning' | 'poor'

export interface CameraCalibrationBaseline {
  earShoulderRatio: number
  shoulderHipRatio: number
  headTiltAngle: number
  shoulderSlope: number
  spinalAngle: number
}

export interface PostureTimelineEntry {
  timestamp: number
  status: CameraPostureStatus
}

export interface UseCameraPostureResult {
  isSupported: boolean | null
  isTracking: boolean
  isCalibrated: boolean
  isPersonDetected: boolean
  isInFrame: boolean
  landmarks: CameraPostureLandmarks | null
  scores: CameraPostureScores | null
  status: CameraPostureStatus
  videoRef: React.RefObject<HTMLVideoElement | null>
  startCamera: () => Promise<boolean>
  stopCamera: () => void
  startTracking: () => void
  stopTracking: () => void
  calibrate: () => boolean
  getSessionStats: () => PostureSessionStats
  resetSessionStats: () => void
  getTimeline: () => PostureTimelineEntry[]
}

// --- Constants ---

const INFERENCE_INTERVAL_MS = 500 // 2 FPS
const EMA_FACTOR = 0.3
const STATUS_HOLD_MS = 2000
const HAPTIC_COOLDOWN_MS = 30000
const GOOD_THRESHOLD = 85
const WARNING_THRESHOLD = 60

// MediaPipe landmark indices
const NOSE = 0
const LEFT_EAR = 7
const RIGHT_EAR = 8
const LEFT_SHOULDER = 11
const RIGHT_SHOULDER = 12
const LEFT_HIP = 23
const RIGHT_HIP = 24

const CALIBRATION_KEY = 'cameraPostureCalibration'

// --- Helpers ---

function extractLandmarks(result: PoseLandmarkerResult): CameraPostureLandmarks | null {
  if (!result.landmarks || result.landmarks.length === 0) return null
  const lm = result.landmarks[0]
  if (!lm || lm.length < 25) return null

  return {
    nose: { x: lm[NOSE].x, y: lm[NOSE].y, visibility: lm[NOSE].visibility ?? 0 },
    leftEar: { x: lm[LEFT_EAR].x, y: lm[LEFT_EAR].y, visibility: lm[LEFT_EAR].visibility ?? 0 },
    rightEar: { x: lm[RIGHT_EAR].x, y: lm[RIGHT_EAR].y, visibility: lm[RIGHT_EAR].visibility ?? 0 },
    leftShoulder: {
      x: lm[LEFT_SHOULDER].x,
      y: lm[LEFT_SHOULDER].y,
      visibility: lm[LEFT_SHOULDER].visibility ?? 0,
    },
    rightShoulder: {
      x: lm[RIGHT_SHOULDER].x,
      y: lm[RIGHT_SHOULDER].y,
      visibility: lm[RIGHT_SHOULDER].visibility ?? 0,
    },
    leftHip: { x: lm[LEFT_HIP].x, y: lm[LEFT_HIP].y, visibility: lm[LEFT_HIP].visibility ?? 0 },
    rightHip: { x: lm[RIGHT_HIP].x, y: lm[RIGHT_HIP].y, visibility: lm[RIGHT_HIP].visibility ?? 0 },
  }
}

function midpoint(a: CameraPostureLandmark, b: CameraPostureLandmark) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function angleDeg(ax: number, ay: number, bx: number, by: number): number {
  return Math.atan2(by - ay, bx - ax) * (180 / Math.PI)
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function computeScores(
  lm: CameraPostureLandmarks,
  baseline: CameraCalibrationBaseline | null
): CameraPostureScores {
  const shoulderMid = midpoint(lm.leftShoulder, lm.rightShoulder)
  const hipMid = midpoint(lm.leftHip, lm.rightHip)

  // Spinal alignment: angle of shoulder-mid to hip-mid from vertical
  const spinalAngle = Math.abs(angleDeg(shoulderMid.x, shoulderMid.y, hipMid.x, hipMid.y) + 90)
  let spinalScore = clamp(100 - spinalAngle * 5, 0, 100)

  // Head tilt: nose-to-shoulder-mid vertical alignment
  const headTiltAngle = Math.abs(angleDeg(shoulderMid.x, shoulderMid.y, lm.nose.x, lm.nose.y) + 90)
  let headTiltScore = clamp(100 - headTiltAngle * 4, 0, 100)

  // Shoulder symmetry: difference in Y between shoulders
  const shoulderSlope = Math.abs(lm.leftShoulder.y - lm.rightShoulder.y)
  let shoulderScore = clamp(100 - shoulderSlope * 500, 0, 100)

  // Adjust relative to baseline if calibrated
  if (baseline) {
    const currentSpinal = spinalAngle
    const spinalDev = Math.abs(currentSpinal - baseline.spinalAngle)
    spinalScore = clamp(100 - spinalDev * 8, 0, 100)

    const currentHeadTilt = headTiltAngle
    const headDev = Math.abs(currentHeadTilt - baseline.headTiltAngle)
    headTiltScore = clamp(100 - headDev * 6, 0, 100)

    const currentSlope = shoulderSlope
    const slopeDev = Math.abs(currentSlope - baseline.shoulderSlope)
    shoulderScore = clamp(100 - slopeDev * 800, 0, 100)
  }

  const overall = spinalScore * 0.5 + headTiltScore * 0.3 + shoulderScore * 0.2

  return {
    spinalAlignment: Math.round(spinalScore),
    headTilt: Math.round(headTiltScore),
    shoulderSymmetry: Math.round(shoulderScore),
    overall: Math.round(overall),
  }
}

function emaSmooth(prev: CameraPostureScores, next: CameraPostureScores): CameraPostureScores {
  const f = EMA_FACTOR
  return {
    spinalAlignment: Math.round(prev.spinalAlignment * (1 - f) + next.spinalAlignment * f),
    headTilt: Math.round(prev.headTilt * (1 - f) + next.headTilt * f),
    shoulderSymmetry: Math.round(prev.shoulderSymmetry * (1 - f) + next.shoulderSymmetry * f),
    overall: Math.round(prev.overall * (1 - f) + next.overall * f),
  }
}

function loadCalibration(): CameraCalibrationBaseline | null {
  try {
    const stored = localStorage.getItem(CALIBRATION_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveCalibration(baseline: CameraCalibrationBaseline) {
  localStorage.setItem(CALIBRATION_KEY, JSON.stringify(baseline))
}

// --- Hook ---

export function useCameraPosture(): UseCameraPostureResult {
  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [isCalibrated, setIsCalibrated] = useState(false)
  const [isPersonDetected, setIsPersonDetected] = useState(false)
  const [isInFrame, setIsInFrame] = useState(false)
  const [landmarks, setLandmarks] = useState<CameraPostureLandmarks | null>(null)
  const [scores, setScores] = useState<CameraPostureScores | null>(null)
  const [status, setStatus] = useState<CameraPostureStatus>('good')

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null)
  const inferenceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Calibration
  const baselineRef = useRef<CameraCalibrationBaseline | null>(null)

  // Status hold
  const pendingStatusRef = useRef<CameraPostureStatus>('good')
  const statusHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Session tracking
  const sessionStartTimeRef = useRef(0)
  const goodPostureSecondsRef = useRef(0)
  const lastUpdateTimeRef = useRef(0)
  const correctionCountRef = useRef(0)
  const lastHapticTimeRef = useRef(0)

  // Smoothed scores ref
  const smoothedScoresRef = useRef<CameraPostureScores | null>(null)

  // Timeline
  const timelineRef = useRef<PostureTimelineEntry[]>([])

  // Check support on mount
  useEffect(() => {
    const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    setIsSupported(hasCamera)

    const cal = loadCalibration()
    if (cal) {
      baselineRef.current = cal
      setIsCalibrated(true)
    }
  }, [])

  // Initialize MediaPipe PoseLandmarker
  const initPoseLandmarker = useCallback(async (): Promise<boolean> => {
    if (poseLandmarkerRef.current) return true

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      )

      let landmarker: PoseLandmarker
      try {
        // Try GPU first
        landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        })
      } catch {
        // CPU fallback
        console.debug('[useCameraPosture] GPU unavailable, falling back to CPU')
        landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        })
      }

      poseLandmarkerRef.current = landmarker
      return true
    } catch (err) {
      console.error('[useCameraPosture] Failed to init PoseLandmarker:', err)
      return false
    }
  }, [])

  // Start camera
  const startCamera = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      const modelReady = await initPoseLandmarker()
      if (!modelReady) {
        // Clean up stream if model fails
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        return false
      }

      return true
    } catch (err) {
      console.error('[useCameraPosture] Camera start failed:', err)
      return false
    }
  }, [isSupported, initPoseLandmarker])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (inferenceIntervalRef.current) {
      clearInterval(inferenceIntervalRef.current)
      inferenceIntervalRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsTracking(false)
    setLandmarks(null)
    setScores(null)
    setIsPersonDetected(false)
    setIsInFrame(false)
  }, [])

  // Run single inference frame
  const runInference = useCallback(() => {
    const video = videoRef.current
    const landmarker = poseLandmarkerRef.current
    if (!video || !landmarker || video.readyState < 2) return

    const result = landmarker.detectForVideo(video, performance.now())
    const lm = extractLandmarks(result)

    if (!lm) {
      setIsPersonDetected(false)
      setIsInFrame(false)
      setLandmarks(null)
      return
    }

    // Person detection: 4+ landmarks visible
    const visibleCount = Object.values(lm).filter((l) => l.visibility > 0.5).length
    const detected = visibleCount >= 4
    setIsPersonDetected(detected)

    // In frame: shoulders within 10-90% of frame width
    const inFrame =
      detected &&
      lm.leftShoulder.x > 0.1 &&
      lm.leftShoulder.x < 0.9 &&
      lm.rightShoulder.x > 0.1 &&
      lm.rightShoulder.x < 0.9
    setIsInFrame(inFrame)

    setLandmarks(lm)

    if (!detected) return

    // Compute scores
    const rawScores = computeScores(lm, baselineRef.current)
    const smoothed = smoothedScoresRef.current
      ? emaSmooth(smoothedScoresRef.current, rawScores)
      : rawScores
    smoothedScoresRef.current = smoothed
    setScores(smoothed)

    // Determine candidate status
    let candidateStatus: CameraPostureStatus = 'poor'
    if (smoothed.overall >= GOOD_THRESHOLD) candidateStatus = 'good'
    else if (smoothed.overall >= WARNING_THRESHOLD) candidateStatus = 'warning'

    // Status hold: only change after 2s of consistent new status
    if (candidateStatus !== pendingStatusRef.current) {
      pendingStatusRef.current = candidateStatus
      if (statusHoldTimerRef.current) clearTimeout(statusHoldTimerRef.current)
      statusHoldTimerRef.current = setTimeout(() => {
        setStatus(candidateStatus)

        // Record timeline entry
        timelineRef.current.push({ timestamp: Date.now(), status: candidateStatus })
      }, STATUS_HOLD_MS)
    }

    // Session time tracking
    const now = Date.now()
    if (lastUpdateTimeRef.current > 0) {
      const delta = (now - lastUpdateTimeRef.current) / 1000
      if (smoothed.overall >= GOOD_THRESHOLD) {
        goodPostureSecondsRef.current += delta
      }
    }
    lastUpdateTimeRef.current = now

    // Haptic on poor status
    if (candidateStatus === 'poor' && now - lastHapticTimeRef.current > HAPTIC_COOLDOWN_MS) {
      if (navigator.vibrate) {
        navigator.vibrate([25])
      }
      lastHapticTimeRef.current = now
      correctionCountRef.current += 1
    }
  }, [])

  // Start tracking (inference loop)
  const startTracking = useCallback(() => {
    if (inferenceIntervalRef.current) return

    sessionStartTimeRef.current = Date.now()
    lastUpdateTimeRef.current = Date.now()
    goodPostureSecondsRef.current = 0
    correctionCountRef.current = 0
    lastHapticTimeRef.current = 0
    timelineRef.current = []
    smoothedScoresRef.current = null

    inferenceIntervalRef.current = setInterval(runInference, INFERENCE_INTERVAL_MS)
    setIsTracking(true)
  }, [runInference])

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (inferenceIntervalRef.current) {
      clearInterval(inferenceIntervalRef.current)
      inferenceIntervalRef.current = null
    }
    if (statusHoldTimerRef.current) {
      clearTimeout(statusHoldTimerRef.current)
      statusHoldTimerRef.current = null
    }
    setIsTracking(false)
  }, [])

  // Calibrate
  const calibrate = useCallback((): boolean => {
    const lm = landmarks
    if (!lm) return false

    const shoulderMid = midpoint(lm.leftShoulder, lm.rightShoulder)
    const hipMid = midpoint(lm.leftHip, lm.rightHip)
    const earMid = midpoint(lm.leftEar, lm.rightEar)

    const earShoulderDist = Math.hypot(earMid.x - shoulderMid.x, earMid.y - shoulderMid.y)
    const shoulderHipDist = Math.hypot(shoulderMid.x - hipMid.x, shoulderMid.y - hipMid.y)

    const baseline: CameraCalibrationBaseline = {
      earShoulderRatio: shoulderHipDist > 0 ? earShoulderDist / shoulderHipDist : 0,
      shoulderHipRatio: shoulderHipDist,
      headTiltAngle: Math.abs(angleDeg(shoulderMid.x, shoulderMid.y, lm.nose.x, lm.nose.y) + 90),
      shoulderSlope: Math.abs(lm.leftShoulder.y - lm.rightShoulder.y),
      spinalAngle: Math.abs(angleDeg(shoulderMid.x, shoulderMid.y, hipMid.x, hipMid.y) + 90),
    }

    baselineRef.current = baseline
    saveCalibration(baseline)
    setIsCalibrated(true)
    smoothedScoresRef.current = null // Reset smoothing after recalibration
    return true
  }, [landmarks])

  // Session stats
  const getSessionStats = useCallback((): PostureSessionStats => {
    const totalSeconds = sessionStartTimeRef.current
      ? (Date.now() - sessionStartTimeRef.current) / 1000
      : 0
    const goodSeconds = goodPostureSecondsRef.current
    const percent = totalSeconds > 0 ? (goodSeconds / totalSeconds) * 100 : 0

    return {
      totalSeconds: Math.round(totalSeconds),
      goodPostureSeconds: Math.round(goodSeconds),
      goodPosturePercent: Math.round(percent),
      correctionCount: correctionCountRef.current,
    }
  }, [])

  const resetSessionStats = useCallback(() => {
    sessionStartTimeRef.current = Date.now()
    goodPostureSecondsRef.current = 0
    lastUpdateTimeRef.current = Date.now()
    correctionCountRef.current = 0
    lastHapticTimeRef.current = 0
    timelineRef.current = []
  }, [])

  const getTimeline = useCallback((): PostureTimelineEntry[] => {
    return [...timelineRef.current]
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inferenceIntervalRef.current) clearInterval(inferenceIntervalRef.current)
      if (statusHoldTimerRef.current) clearTimeout(statusHoldTimerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      poseLandmarkerRef.current?.close()
    }
  }, [])

  return {
    isSupported,
    isTracking,
    isCalibrated,
    isPersonDetected,
    isInFrame,
    landmarks,
    scores,
    status,
    videoRef,
    startCamera,
    stopCamera,
    startTracking,
    stopTracking,
    calibrate,
    getSessionStats,
    resetSessionStats,
    getTimeline,
  }
}
