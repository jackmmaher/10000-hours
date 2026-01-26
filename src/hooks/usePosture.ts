/**
 * usePosture - React hook for AirPods-based posture tracking
 *
 * Manages the native Posture plugin lifecycle, calibration state,
 * and haptic alert logic for posture correction.
 *
 * Features:
 * - Automatic device connection monitoring
 * - Calibration management
 * - Slouch detection (15 degree pitch deviation threshold)
 * - Haptic alerts with 30-second cooldown
 * - Session statistics tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { Posture, type OrientationUpdate, type Orientation } from '../plugins/posture'

/** Deviation threshold in degrees to trigger slouch alert */
const SLOUCH_THRESHOLD_DEGREES = 15

/** Cooldown between haptic alerts in milliseconds */
const ALERT_COOLDOWN_MS = 30000 // 30 seconds

export interface PostureSessionStats {
  /** Total seconds tracked */
  totalSeconds: number
  /** Seconds in good posture */
  goodPostureSeconds: number
  /** Percentage of time in good posture */
  goodPosturePercent: number
  /** Number of posture corrections (haptic alerts triggered) */
  correctionCount: number
}

export interface UsePostureResult {
  /** Whether the device supports posture tracking (iOS 14+ with CMHeadphoneMotionManager) */
  isSupported: boolean | null
  /** Whether compatible AirPods are connected */
  isDeviceConnected: boolean
  /** Whether tracking is currently active */
  isTracking: boolean
  /** Whether user has calibrated their good posture baseline */
  isCalibrated: boolean
  /** Calibrated baseline orientation */
  baseline: Orientation | null
  /** Current head orientation (null if not tracking) */
  currentOrientation: OrientationUpdate | null
  /** Whether user is currently slouching (deviation > threshold) */
  isDeviated: boolean
  /** Current deviation from baseline in degrees */
  deviationDegrees: number
  /** Start posture tracking */
  startTracking: () => Promise<boolean>
  /** Stop posture tracking */
  stopTracking: () => Promise<void>
  /** Calibrate current position as good posture baseline */
  calibrate: () => Promise<boolean>
  /** Clear stored calibration */
  clearCalibration: () => Promise<void>
  /** Get session statistics */
  getSessionStats: () => PostureSessionStats
  /** Reset session statistics */
  resetSessionStats: () => void
}

export function usePosture(): UsePostureResult {
  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  const [isDeviceConnected, setIsDeviceConnected] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [isCalibrated, setIsCalibrated] = useState(false)
  const [baseline, setBaseline] = useState<Orientation | null>(null)
  const [currentOrientation, setCurrentOrientation] = useState<OrientationUpdate | null>(null)
  const [isDeviated, setIsDeviated] = useState(false)
  const [deviationDegrees, setDeviationDegrees] = useState(0)

  // Session tracking
  const sessionStartTimeRef = useRef<number>(0)
  const goodPostureSecondsRef = useRef<number>(0)
  const lastUpdateTimeRef = useRef<number>(0)
  const correctionCountRef = useRef<number>(0)
  const lastAlertTimeRef = useRef<number>(0)

  // Listener handles
  const orientationListenerRef = useRef<{ remove: () => Promise<void> } | null>(null)
  const connectedListenerRef = useRef<{ remove: () => Promise<void> } | null>(null)
  const disconnectedListenerRef = useRef<{ remove: () => Promise<void> } | null>(null)

  // Check support and calibration on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Check if supported
        const { supported } = await Posture.isSupported()
        setIsSupported(supported)

        if (!supported) return

        // Check device connection
        const { connected } = await Posture.isDeviceConnected()
        setIsDeviceConnected(connected)

        // Load calibration
        const calibrationData = await Posture.getCalibration()
        setIsCalibrated(calibrationData.isCalibrated)
        if (calibrationData.baseline) {
          setBaseline(calibrationData.baseline)
        }

        // Set up connection listeners
        connectedListenerRef.current = await Posture.addListener('deviceConnected', () => {
          console.debug('[usePosture] AirPods connected')
          setIsDeviceConnected(true)
        })

        disconnectedListenerRef.current = await Posture.addListener('deviceDisconnected', () => {
          console.debug('[usePosture] AirPods disconnected')
          setIsDeviceConnected(false)
        })
      } catch (err) {
        console.warn('[usePosture] Init failed:', err)
        setIsSupported(false)
      }
    }

    init()

    // Cleanup listeners on unmount
    return () => {
      connectedListenerRef.current?.remove()
      disconnectedListenerRef.current?.remove()
    }
  }, [])

  // Handle orientation updates and slouch detection
  const handleOrientationUpdate = useCallback((data: OrientationUpdate) => {
    setCurrentOrientation(data)

    const pitchDeviation = data.deviationFromBaseline.pitch
    setDeviationDegrees(Math.abs(pitchDeviation))

    // Slouch detected when head tilts forward more than threshold
    // Pitch deviation is positive when head tilts forward from baseline
    const isSlouching = pitchDeviation > SLOUCH_THRESHOLD_DEGREES

    // Track time in good/bad posture
    const now = Date.now()
    if (lastUpdateTimeRef.current > 0) {
      const deltaSeconds = (now - lastUpdateTimeRef.current) / 1000
      if (!isSlouching) {
        goodPostureSecondsRef.current += deltaSeconds
      }
    }
    lastUpdateTimeRef.current = now

    setIsDeviated(isSlouching)

    // Trigger haptic alert if slouching and cooldown has passed
    if (isSlouching && now - lastAlertTimeRef.current > ALERT_COOLDOWN_MS) {
      console.debug('[usePosture] Slouch detected, triggering haptic')
      Posture.triggerHaptic({ style: 'medium' }).catch((err) => {
        console.warn('[usePosture] Haptic failed:', err)
      })
      lastAlertTimeRef.current = now
      correctionCountRef.current += 1
    }
  }, [])

  // Start tracking
  const startTracking = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('[usePosture] Posture tracking not supported')
      return false
    }

    if (!isDeviceConnected) {
      console.warn('[usePosture] No AirPods connected')
      return false
    }

    try {
      // Set up orientation listener
      orientationListenerRef.current = await Posture.addListener(
        'orientationUpdate',
        handleOrientationUpdate
      )

      // Start tracking
      const { success } = await Posture.startTracking()

      if (success) {
        setIsTracking(true)
        sessionStartTimeRef.current = Date.now()
        lastUpdateTimeRef.current = Date.now()
        console.debug('[usePosture] Tracking started')
      }

      return success
    } catch (err) {
      console.error('[usePosture] Failed to start tracking:', err)
      return false
    }
  }, [isSupported, isDeviceConnected, handleOrientationUpdate])

  // Stop tracking
  const stopTracking = useCallback(async () => {
    try {
      // Remove orientation listener
      await orientationListenerRef.current?.remove()
      orientationListenerRef.current = null

      // Stop native tracking
      await Posture.stopTracking()

      setIsTracking(false)
      setCurrentOrientation(null)
      setIsDeviated(false)
      console.debug('[usePosture] Tracking stopped')
    } catch (err) {
      console.error('[usePosture] Failed to stop tracking:', err)
    }
  }, [])

  // Calibrate
  const calibrate = useCallback(async (): Promise<boolean> => {
    try {
      const result = await Posture.calibrate()

      if (result.success && result.baseline) {
        setIsCalibrated(true)
        setBaseline(result.baseline)
        console.debug('[usePosture] Calibration successful:', result.baseline)
        return true
      }

      return false
    } catch (err) {
      console.error('[usePosture] Calibration failed:', err)
      return false
    }
  }, [])

  // Clear calibration
  const clearCalibration = useCallback(async () => {
    try {
      await Posture.clearCalibration()
      setIsCalibrated(false)
      setBaseline(null)
      console.debug('[usePosture] Calibration cleared')
    } catch (err) {
      console.error('[usePosture] Failed to clear calibration:', err)
    }
  }, [])

  // Get session stats
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

  // Reset session stats
  const resetSessionStats = useCallback(() => {
    sessionStartTimeRef.current = Date.now()
    goodPostureSecondsRef.current = 0
    lastUpdateTimeRef.current = Date.now()
    correctionCountRef.current = 0
    lastAlertTimeRef.current = 0
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isTracking) {
        Posture.stopTracking().catch(() => {})
        orientationListenerRef.current?.remove()
      }
    }
  }, [isTracking])

  return {
    isSupported,
    isDeviceConnected,
    isTracking,
    isCalibrated,
    baseline,
    currentOrientation,
    isDeviated,
    deviationDegrees,
    startTracking,
    stopTracking,
    calibrate,
    clearCalibration,
    getSessionStats,
    resetSessionStats,
  }
}
