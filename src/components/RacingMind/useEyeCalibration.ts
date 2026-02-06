/**
 * useEyeCalibration - Eye tracking calibration state and WebGazer integration
 *
 * Manages:
 * - 5-point calibration grid
 * - WebGazer training via click events
 * - Validation accuracy measurement
 * - Calibration profile persistence
 *
 * Based on WebGazer best practices:
 * - User looks at point, then clicks/taps
 * - WebGazer correlates eye features with screen position
 * - Multiple points improve regression model accuracy
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import webgazer from 'webgazer'
import { stopWebGazerCamera } from '../../lib/stopWebGazerCamera'

export interface CalibrationPoint {
  id: number
  x: number // Percentage of screen width (0-100)
  y: number // Percentage of screen height (0-100)
  status: 'pending' | 'active' | 'completed'
}

export interface CalibrationProfile {
  id: string
  createdAt: number
  lastUsedAt: number
  accuracy: number // Average pixel error from validation
  pointsCalibrated: number
  deviceInfo: {
    screenWidth: number
    screenHeight: number
    userAgent: string
  }
}

export interface ValidationResult {
  success: boolean
  averageError: number // Pixels
  maxError: number
  pointsTested: number
}

export type CalibrationPhase =
  | 'idle'
  | 'positioning'
  | 'calibrating'
  | 'validating'
  | 'complete'
  | 'failed'

interface UseEyeCalibrationResult {
  // State
  phase: CalibrationPhase
  calibrationPoints: CalibrationPoint[]
  currentPointIndex: number
  validationResult: ValidationResult | null
  existingProfile: CalibrationProfile | null
  isWebGazerReady: boolean
  error: string | null
  /** Current validation target position (percentage), null when not showing a target */
  currentValidationTarget: { x: number; y: number } | null

  // Actions
  startCalibration: () => Promise<boolean>
  handlePointTap: (pointId: number) => void
  runValidation: () => Promise<ValidationResult>
  completeCalibration: () => void
  resetCalibration: () => void
  skipCalibration: () => void
  setPhase: (phase: CalibrationPhase) => void
}

// Storage key for calibration profile
const STORAGE_KEY = 'racing-mind-eye-calibration'

// 5-point calibration positions (percentage of screen)
// Center first (natural gaze start), then 4 corners for Ridge regression coverage
const CALIBRATION_GRID: Array<{ x: number; y: number }> = [
  { x: 50, y: 50 }, // Center (first — establishes baseline)
  { x: 20, y: 20 }, // Top-left
  { x: 80, y: 20 }, // Top-right
  { x: 20, y: 80 }, // Bottom-left
  { x: 80, y: 80 }, // Bottom-right
]

// Validation points (different from calibration for honest testing)
const VALIDATION_POINTS: Array<{ x: number; y: number }> = [
  { x: 30, y: 30 },
  { x: 70, y: 50 },
  { x: 50, y: 70 },
]

// Accuracy threshold (pixels) - below this is considered acceptable
const ACCURACY_ACCEPTABLE = 150

/**
 * Generate unique ID
 */
function generateId(): string {
  return `cal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Load calibration profile from localStorage
 */
function loadProfile(): CalibrationProfile | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch {
    return null
  }
}

/**
 * Save calibration profile to localStorage
 */
function saveProfile(profile: CalibrationProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch (err) {
    console.error('[EyeCalibration] Failed to save profile:', err)
  }
}

/**
 * Check if profile is stale (older than 7 days)
 */
export function isProfileStale(profile: CalibrationProfile | null): boolean {
  if (!profile) return true
  // Use createdAt (not lastUsedAt) — model quality degrades from creation time,
  // not last use. 14 days balances accuracy with re-calibration friction.
  const fourteenDays = 14 * 24 * 60 * 60 * 1000
  return Date.now() - profile.createdAt > fourteenDays
}

/**
 * Check if profile matches current device
 */
function profileMatchesDevice(profile: CalibrationProfile): boolean {
  const { screenWidth, screenHeight } = profile.deviceInfo
  // Allow 10% variance for orientation/browser chrome differences
  const widthMatch = Math.abs(screenWidth - window.innerWidth) < window.innerWidth * 0.1
  const heightMatch = Math.abs(screenHeight - window.innerHeight) < window.innerHeight * 0.1
  return widthMatch && heightMatch
}

export function useEyeCalibration(): UseEyeCalibrationResult {
  const [phase, setPhase] = useState<CalibrationPhase>('idle')
  const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([])
  const [currentPointIndex, setCurrentPointIndex] = useState(0)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [existingProfile, setExistingProfile] = useState<CalibrationProfile | null>(null)
  const [isWebGazerReady, setIsWebGazerReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [currentValidationTarget, setCurrentValidationTarget] = useState<{
    x: number
    y: number
  } | null>(null)

  const webgazerInitializedRef = useRef(false)
  const webgazerBeginCalledRef = useRef(false) // Track if begin() was called (even if not complete)
  const gazeDataRef = useRef<Array<{ x: number; y: number; timestamp: number }>>([])

  // Load existing profile on mount
  useEffect(() => {
    const profile = loadProfile()
    if (profile && profileMatchesDevice(profile)) {
      setExistingProfile(profile)
    }
  }, [])

  /**
   * Initialize WebGazer for calibration
   */
  const initializeWebGazer = useCallback(async (): Promise<boolean> => {
    if (webgazerInitializedRef.current) {
      return true
    }

    try {
      console.log('[EyeCalibration] Initializing WebGazer...')

      // Configure WebGazer
      webgazer
        .setRegression('ridge')
        .showVideoPreview(false)
        .showPredictionPoints(false)
        .showFaceOverlay(false)
        .showFaceFeedbackBox(false)

      // Set up gaze listener for validation
      webgazer.setGazeListener((data, _elapsedTime) => {
        if (data) {
          gazeDataRef.current.push({
            x: data.x,
            y: data.y,
            timestamp: performance.now(),
          })
          // Keep only last 60 samples (2 seconds at 30fps)
          if (gazeDataRef.current.length > 60) {
            gazeDataRef.current.shift()
          }
        }
      })

      // Start WebGazer (requests camera permission)
      webgazerBeginCalledRef.current = true // Track that we started (for cleanup if cancelled mid-init)
      await webgazer.begin()

      // Clear any existing calibration data for fresh start
      webgazer.clearData()

      webgazerInitializedRef.current = true
      setIsWebGazerReady(true)
      console.log('[EyeCalibration] WebGazer ready')

      return true
    } catch (err) {
      console.error('[EyeCalibration] Failed to initialize WebGazer:', err)
      webgazerBeginCalledRef.current = false
      setError('Camera access required for eye tracking calibration')
      return false
    }
  }, [])

  /**
   * Start calibration process
   */
  const startCalibration = useCallback(async (): Promise<boolean> => {
    setError(null)

    // Initialize WebGazer if not ready
    const ready = await initializeWebGazer()
    if (!ready) {
      setPhase('failed')
      return false
    }

    // Clear previous calibration data
    webgazer.clearData()
    gazeDataRef.current = []

    // Initialize calibration points
    const points: CalibrationPoint[] = CALIBRATION_GRID.map((pos, index) => ({
      id: index,
      x: pos.x,
      y: pos.y,
      status: index === 0 ? 'active' : 'pending',
    }))

    setCalibrationPoints(points)
    setCurrentPointIndex(0)
    setPhase('calibrating')

    return true
  }, [initializeWebGazer])

  /**
   * Handle user tapping a calibration point
   */
  const handlePointTap = useCallback(
    (pointId: number) => {
      if (phase !== 'calibrating') return
      if (pointId !== currentPointIndex) return

      // Get the point's screen coordinates
      const point = calibrationPoints[pointId]
      const screenX = (point.x / 100) * window.innerWidth
      const screenY = (point.y / 100) * window.innerHeight

      // Record click for WebGazer training
      // WebGazer uses click events to correlate eye position with screen position
      webgazer.recordScreenPosition(screenX, screenY, 'click')

      console.log(
        `[EyeCalibration] Point ${pointId + 1}/${calibrationPoints.length} calibrated at (${screenX}, ${screenY})`
      )

      // Update point status
      setCalibrationPoints((prev) =>
        prev.map((p, idx) => {
          if (idx === pointId) return { ...p, status: 'completed' }
          if (idx === pointId + 1) return { ...p, status: 'active' }
          return p
        })
      )

      // Move to next point or finish
      if (pointId < calibrationPoints.length - 1) {
        setCurrentPointIndex(pointId + 1)
      } else {
        // All points calibrated — move to validation with visible targets
        setPhase('validating')
      }
    },
    [phase, currentPointIndex, calibrationPoints]
  )

  /**
   * Run validation to check calibration accuracy.
   * Shows each validation target on screen for 1.5s while collecting gaze data,
   * then compares predicted gaze to actual target position.
   */
  const runValidation = useCallback(async (): Promise<ValidationResult> => {
    console.log('[EyeCalibration] Running validation with visible targets...')

    const errors: number[] = []
    const DWELL_TIME_MS = 1500 // Time to show each target and collect gaze
    const SETTLE_TIME_MS = 300 // Brief pause before collecting to let gaze settle

    for (const point of VALIDATION_POINTS) {
      const targetX = (point.x / 100) * window.innerWidth
      const targetY = (point.y / 100) * window.innerHeight

      // Show the target dot on screen
      setCurrentValidationTarget({ x: point.x, y: point.y })

      // Clear recent gaze data so we only measure gaze while target is visible
      gazeDataRef.current = []

      // Wait for gaze to settle on the new target
      await new Promise((resolve) => setTimeout(resolve, SETTLE_TIME_MS))

      // Clear again after settle to only get steady-state gaze
      gazeDataRef.current = []

      // Collect gaze data for the dwell period
      await new Promise((resolve) => setTimeout(resolve, DWELL_TIME_MS - SETTLE_TIME_MS))

      // Get gaze predictions collected during dwell
      const recentGaze = gazeDataRef.current.slice(-30) // ~1s at 30fps

      if (recentGaze.length > 0) {
        const avgX = recentGaze.reduce((sum, g) => sum + g.x, 0) / recentGaze.length
        const avgY = recentGaze.reduce((sum, g) => sum + g.y, 0) / recentGaze.length

        const error = Math.sqrt(Math.pow(avgX - targetX, 2) + Math.pow(avgY - targetY, 2))
        errors.push(error)

        console.log(
          `[EyeCalibration] Validation point (${point.x}%, ${point.y}%): error = ${error.toFixed(0)}px`
        )
      }
    }

    // Clear the target after all validation points are tested
    setCurrentValidationTarget(null)

    const result: ValidationResult = {
      success: errors.length > 0 && errors.every((e) => e < ACCURACY_ACCEPTABLE),
      averageError: errors.length > 0 ? errors.reduce((a, b) => a + b, 0) / errors.length : 999,
      maxError: errors.length > 0 ? Math.max(...errors) : 999,
      pointsTested: errors.length,
    }

    console.log('[EyeCalibration] Validation result:', result)
    setValidationResult(result)

    return result
  }, [])

  /**
   * Complete calibration and save profile
   */
  const completeCalibration = useCallback(() => {
    const profile: CalibrationProfile = {
      id: generateId(),
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      accuracy: validationResult?.averageError ?? 999,
      pointsCalibrated: calibrationPoints.filter((p) => p.status === 'completed').length,
      deviceInfo: {
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        userAgent: navigator.userAgent,
      },
    }

    saveProfile(profile)
    setExistingProfile(profile)
    setPhase('complete')

    console.log('[EyeCalibration] Calibration complete, profile saved')
  }, [validationResult, calibrationPoints])

  /**
   * Reset calibration to start over
   */
  const resetCalibration = useCallback(() => {
    setPhase('positioning')
    setCalibrationPoints([])
    setCurrentPointIndex(0)
    setValidationResult(null)
    setCurrentValidationTarget(null)
    setError(null)
    gazeDataRef.current = []

    if (webgazerInitializedRef.current) {
      webgazer.clearData()
    }
  }, [])

  /**
   * Skip calibration (proceed without eye tracking)
   */
  const skipCalibration = useCallback(() => {
    setPhase('idle')

    // Stop WebGazer if it was started (check both refs for mid-init cancellation)
    if (webgazerInitializedRef.current || webgazerBeginCalledRef.current) {
      try {
        // Explicitly stop camera tracks BEFORE webgazer.end() to ensure camera indicator turns off
        stopWebGazerCamera()
        webgazer.end()
        webgazerInitializedRef.current = false
        webgazerBeginCalledRef.current = false
        setIsWebGazerReady(false)
      } catch {
        // Ignore cleanup errors
      }
    }
  }, [])

  // Cleanup on unmount - ensure camera is released in all cases
  useEffect(() => {
    return () => {
      // Check both refs to handle cancellation during initialization window
      if (webgazerInitializedRef.current || webgazerBeginCalledRef.current) {
        try {
          // Explicitly stop camera tracks BEFORE webgazer.end() to ensure camera indicator turns off
          stopWebGazerCamera()
          webgazer.end()
          webgazerInitializedRef.current = false
          webgazerBeginCalledRef.current = false
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }, [])

  return {
    phase,
    calibrationPoints,
    currentPointIndex,
    validationResult,
    existingProfile,
    isWebGazerReady,
    error,
    currentValidationTarget,
    startCalibration,
    handlePointTap,
    runValidation,
    completeCalibration,
    resetCalibration,
    skipCalibration,
    setPhase,
  }
}
