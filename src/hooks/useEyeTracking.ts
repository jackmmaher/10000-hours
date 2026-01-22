/**
 * useEyeTracking - React hook for eye tracking integration
 *
 * Manages the eye tracking plugin lifecycle and provides
 * gaze position data for the Racing Mind practice.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { EyeTracking, type GazePoint } from '../plugins/eyeTracking'
import type { PluginListenerHandle } from '@capacitor/core'

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

  const listenerRef = useRef<PluginListenerHandle | null>(null)
  const gazeHistoryRef = useRef<GazePoint[]>([])

  // Check support on mount
  useEffect(() => {
    EyeTracking.isSupported()
      .then(({ supported }) => {
        setIsSupported(supported)
      })
      .catch(() => {
        setIsSupported(false)
      })
  }, [])

  // Handle gaze updates
  const handleGazeUpdate = useCallback(
    (data: GazePoint) => {
      setGazePoint(data)
      setTrackingQuality(data.quality)

      // Add to history (use ref for performance)
      gazeHistoryRef.current.push(data)
      if (gazeHistoryRef.current.length > maxHistorySize) {
        gazeHistoryRef.current.shift()
      }

      // Update state less frequently to avoid re-renders
      // Only update every 30th point (once per second)
      if (gazeHistoryRef.current.length % 30 === 0) {
        setGazeHistory([...gazeHistoryRef.current])
      }
    },
    [maxHistorySize]
  )

  // Start tracking
  const startTracking = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('[useEyeTracking] Eye tracking not supported')
      return false
    }

    try {
      // Set up listener first
      listenerRef.current = await EyeTracking.addListener('gazeUpdate', handleGazeUpdate)

      // Start tracking
      const { success } = await EyeTracking.startTracking()

      if (success) {
        setIsTracking(true)
        gazeHistoryRef.current = []
        setGazeHistory([])
        return true
      }

      // Clean up listener if start failed
      await listenerRef.current?.remove()
      listenerRef.current = null
      return false
    } catch (error) {
      console.error('[useEyeTracking] Failed to start:', error)
      return false
    }
  }, [isSupported, handleGazeUpdate])

  // Stop tracking
  const stopTracking = useCallback(async () => {
    try {
      await EyeTracking.stopTracking()
      await listenerRef.current?.remove()
      listenerRef.current = null
      setIsTracking(false)
      setGazePoint(null)

      // Final history update
      setGazeHistory([...gazeHistoryRef.current])
    } catch (error) {
      console.error('[useEyeTracking] Failed to stop:', error)
    }
  }, [])

  // Clear history
  const clearHistory = useCallback(() => {
    gazeHistoryRef.current = []
    setGazeHistory([])
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        EyeTracking.stopTracking().catch(() => {})
        listenerRef.current.remove().catch(() => {})
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
