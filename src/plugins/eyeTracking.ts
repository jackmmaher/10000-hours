/**
 * Eye Tracking Capacitor Plugin Interface
 *
 * Provides ARKit-based eye tracking for measuring how well users
 * follow the orb during Racing Mind practice.
 */

import { registerPlugin } from '@capacitor/core'
import type { PluginListenerHandle } from '@capacitor/core'

/**
 * Gaze point data emitted at ~30fps during tracking
 */
export interface GazePoint {
  /** Screen X coordinate (0 to screenWidth) */
  x: number
  /** Screen Y coordinate (0 to screenHeight) */
  y: number
  /** Timestamp in milliseconds */
  timestamp: number
  /** Tracking quality (0-1, decreases when eyes closed) */
  quality: number
  /** Raw (unsmoothed) X coordinate */
  rawX: number
  /** Raw (unsmoothed) Y coordinate */
  rawY: number
}

/**
 * Error event data
 */
export interface TrackingError {
  error: string
}

/**
 * Calibration status
 */
export interface CalibrationStatus {
  isCalibrated: boolean
  accuracy: 'low' | 'standard' | 'high'
}

/**
 * Eye Tracking Plugin Interface
 */
export interface EyeTrackingPlugin {
  /**
   * Check if eye tracking is supported on this device
   * Requires iPhone X or later with TrueDepth camera
   */
  isSupported(): Promise<{ supported: boolean }>

  /**
   * Start eye tracking session
   * Begins ARKit face tracking and emits gazeUpdate events
   */
  startTracking(): Promise<{ success: boolean }>

  /**
   * Stop eye tracking session
   * Pauses ARKit session and stops events
   */
  stopTracking(): Promise<{ success: boolean }>

  /**
   * Get calibration status
   */
  getCalibrationStatus(): Promise<CalibrationStatus>

  /**
   * Listen for gaze updates (~30fps when tracking)
   */
  addListener(
    event: 'gazeUpdate',
    callback: (data: GazePoint) => void
  ): Promise<PluginListenerHandle>

  /**
   * Listen for tracking errors
   */
  addListener(
    event: 'trackingError',
    callback: (data: TrackingError) => void
  ): Promise<PluginListenerHandle>

  /**
   * Listen for tracking interruptions (e.g., phone call)
   */
  addListener(event: 'trackingInterrupted', callback: () => void): Promise<PluginListenerHandle>

  /**
   * Listen for tracking resumption after interruption
   */
  addListener(event: 'trackingResumed', callback: () => void): Promise<PluginListenerHandle>

  /**
   * Remove all listeners for this plugin
   */
  removeAllListeners(): Promise<void>
}

/**
 * Register the Eye Tracking plugin
 *
 * On non-iOS platforms or devices without Face ID, isSupported() returns false
 */
export const EyeTracking = registerPlugin<EyeTrackingPlugin>('EyeTracking', {
  web: {
    // Web fallback - always returns not supported
    async isSupported() {
      return { supported: false }
    },
    async startTracking() {
      console.warn('[EyeTracking] Not supported on web')
      return { success: false }
    },
    async stopTracking() {
      return { success: true }
    },
    async getCalibrationStatus() {
      return { isCalibrated: false, accuracy: 'low' as const }
    },
    async addListener() {
      return { remove: async () => {} }
    },
    async removeAllListeners() {},
  },
})
