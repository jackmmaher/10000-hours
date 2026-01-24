/**
 * useEyeTracking - React hook for web-based eye tracking
 *
 * Uses WebGazer.js for camera-based gaze estimation.
 * Works via standard web APIs (like microphone for Aum coach).
 * No native code required.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import webgazer from 'webgazer'

export interface GazePoint {
  x: number
  y: number
  timestamp: number
  quality: number
}

export interface UseEyeTrackingResult {
  /** Current gaze position (null if not tracking) */
  gazePoint: GazePoint | null
  /** Whether tracking is currently active */
  isTracking: boolean
  /** Whether eye tracking is supported on this device */
  isSupported: boolean | null
  /** Tracking quality (0-1) */
  trackingQuality: number
  /** Start eye tracking */
  startTracking: () => Promise<boolean>
  /** Stop eye tracking */
  stopTracking: () => Promise<void>
  /** History of gaze points for analysis */
  gazeHistory: GazePoint[]
  /** Clear gaze history */
  clearHistory: () => void
}

/**
 * Hook for integrating eye tracking into components
 *
 * @param maxHistorySize - Maximum number of gaze points to keep in history (default 1800 = 1 minute at 30fps)
 */
export function useEyeTracking(maxHistorySize = 1800): UseEyeTrackingResult {
  const [gazePoint, setGazePoint] = useState<GazePoint | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  const [trackingQuality, setTrackingQuality] = useState(0)
  const [gazeHistory, setGazeHistory] = useState<GazePoint[]>([])

  const gazeHistoryRef = useRef<GazePoint[]>([])
  const isInitializedRef = useRef(false)
  const isBeginCalledRef = useRef(false) // Track if webgazer.begin() was called (even if not complete)
  const updateCountRef = useRef(0)

  // Check support on mount - WebGazer needs getUserMedia
  useEffect(() => {
    const checkSupport = async () => {
      try {
        // Check if getUserMedia is available (camera access)
        const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
        console.debug('[useEyeTracking] getUserMedia supported:', hasGetUserMedia)
        setIsSupported(hasGetUserMedia)
      } catch (err) {
        console.warn('[useEyeTracking] Support check failed:', err)
        setIsSupported(false)
      }
    }
    checkSupport()
  }, [])

  // Start tracking
  const startTracking = useCallback(async (): Promise<boolean> => {
    console.debug('[useEyeTracking] Attempting to start, isSupported:', isSupported)

    if (!isSupported) {
      console.warn('[useEyeTracking] Eye tracking not supported on this device')
      return false
    }

    if (isInitializedRef.current) {
      console.debug('[useEyeTracking] Already initialized, resuming...')
      webgazer.resume()
      setIsTracking(true)
      return true
    }

    try {
      console.debug('[useEyeTracking] Initializing WebGazer...')

      // Configure WebGazer - hide all visual elements
      webgazer
        .setRegression('ridge')
        .showVideoPreview(false)
        .showPredictionPoints(false)
        .showFaceOverlay(false)
        .showFaceFeedbackBox(false)

      // Set up gaze listener
      // IMPORTANT: Use performance.now() for timestamps to match orb position timestamps
      // WebGazer's elapsedTime is relative to when WebGazer started, which differs from
      // performance.now() used by orb position recording, causing timestamp mismatch bugs
      webgazer.setGazeListener((data, _elapsedTime) => {
        if (data === null) {
          // No face detected - quality is 0
          setTrackingQuality(0)
          return
        }

        const point: GazePoint = {
          x: data.x,
          y: data.y,
          timestamp: performance.now(), // Use same clock as orb positions
          quality: 0.8, // WebGazer doesn't provide quality, assume good if face detected
        }

        setGazePoint(point)
        setTrackingQuality(0.8)

        // Add to history (use ref for performance)
        gazeHistoryRef.current.push(point)
        if (gazeHistoryRef.current.length > maxHistorySize) {
          gazeHistoryRef.current.shift()
        }

        // Update state less frequently to avoid re-renders
        // Only update every 30th point (roughly once per second at 30fps)
        updateCountRef.current++
        if (updateCountRef.current % 30 === 0) {
          setGazeHistory([...gazeHistoryRef.current])
        }
      })

      // Start WebGazer - this will request camera permission
      console.debug('[useEyeTracking] Calling webgazer.begin()...')
      isBeginCalledRef.current = true // Track that we started (for cleanup if cancelled mid-init)
      await webgazer.begin()
      console.debug('[useEyeTracking] WebGazer started successfully')

      // Wait up to 3s for first gaze data to confirm tracking works
      const verifyTimeout = 3000
      const startVerify = performance.now()
      while (performance.now() - startVerify < verifyTimeout) {
        await new Promise((r) => setTimeout(r, 100))
        if (gazeHistoryRef.current.length > 0) break
      }
      if (gazeHistoryRef.current.length === 0) {
        console.warn('[useEyeTracking] No gaze data received - tracking may not be working')
      }

      isInitializedRef.current = true
      gazeHistoryRef.current = []
      updateCountRef.current = 0
      setGazeHistory([])
      setIsTracking(true)

      return true
    } catch (error) {
      console.error('[useEyeTracking] Failed to start:', error)
      isBeginCalledRef.current = false
      return false
    }
  }, [isSupported, maxHistorySize])

  // Stop tracking and release camera
  const stopTracking = useCallback(async () => {
    console.debug('[useEyeTracking] Stopping and releasing camera...')
    try {
      // Final history update before stopping
      setGazeHistory([...gazeHistoryRef.current])

      // Clear listener first
      webgazer.clearGazeListener()

      // End WebGazer completely to release the camera
      // This is the only way to actually stop the camera indicator
      // Check isBeginCalledRef to handle cancellation during initialization
      if (isInitializedRef.current || isBeginCalledRef.current) {
        webgazer.end()
        isInitializedRef.current = false
        isBeginCalledRef.current = false
        console.debug('[useEyeTracking] WebGazer ended, camera released')
      }

      setIsTracking(false)
      setGazePoint(null)
    } catch (error) {
      console.error('[useEyeTracking] Failed to stop:', error)
    }
  }, [])

  // Clear history
  const clearHistory = useCallback(() => {
    gazeHistoryRef.current = []
    updateCountRef.current = 0
    setGazeHistory([])
  }, [])

  // Cleanup on unmount - ensure camera is released in all cases
  useEffect(() => {
    return () => {
      // Check both refs to handle cancellation during initialization window
      if (isInitializedRef.current || isBeginCalledRef.current) {
        console.debug('[useEyeTracking] Cleanup - ending WebGazer')
        try {
          webgazer.end()
          isInitializedRef.current = false
          isBeginCalledRef.current = false
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }, [])

  return {
    gazePoint,
    isTracking,
    isSupported,
    trackingQuality,
    startTracking,
    stopTracking,
    gazeHistory,
    clearHistory,
  }
}
