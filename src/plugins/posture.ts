/**
 * Posture Capacitor Plugin Interface
 *
 * Provides AirPods-based head motion tracking for posture correction.
 * Uses CMHeadphoneMotionManager to detect head tilt and alert users
 * when they slouch during meditation or work.
 *
 * Requirements:
 * - iOS 14.0+
 * - AirPods Pro (any gen), AirPods 3rd gen, or AirPods Max
 */

import { registerPlugin } from '@capacitor/core'
import type { PluginListenerHandle } from '@capacitor/core'

/**
 * Head orientation data in degrees
 */
export interface Orientation {
  /** Forward/back tilt - primary slouch signal (negative = forward) */
  pitch: number
  /** Side-to-side tilt */
  roll: number
  /** Left/right rotation */
  yaw: number
}

/**
 * Deviation from calibrated baseline position
 */
export interface DeviationFromBaseline {
  /** Pitch deviation in degrees (positive = forward of baseline) */
  pitch: number
  /** Roll deviation in degrees */
  roll: number
  /** Combined deviation magnitude */
  total: number
}

/**
 * Orientation update event data (emitted at 10Hz during tracking)
 */
export interface OrientationUpdate {
  /** Forward/back tilt in degrees */
  pitch: number
  /** Side-to-side tilt in degrees */
  roll: number
  /** Left/right rotation in degrees */
  yaw: number
  /** Deviation from calibrated baseline */
  deviationFromBaseline: DeviationFromBaseline
  /** Timestamp in milliseconds */
  timestamp: number
}

/**
 * Calibration result containing baseline orientation
 */
export interface CalibrationResult {
  success: boolean
  baseline?: Orientation
}

/**
 * Stored calibration data
 */
export interface CalibrationData {
  isCalibrated: boolean
  baseline?: Orientation
}

/**
 * Posture Plugin Interface
 */
export interface PosturePlugin {
  /**
   * Check if headphone motion tracking is supported on this device
   * Requires iOS 14.0+ and CMHeadphoneMotionManager availability
   */
  isSupported(): Promise<{ supported: boolean }>

  /**
   * Check if compatible AirPods are currently connected
   * Compatible devices: AirPods Pro (all gens), AirPods 3rd gen, AirPods Max
   */
  isDeviceConnected(): Promise<{ connected: boolean }>

  /**
   * Start tracking head orientation
   * Begins motion updates and emits orientationUpdate events at 10Hz
   */
  startTracking(): Promise<{ success: boolean }>

  /**
   * Stop tracking head orientation
   * Stops motion updates and events
   */
  stopTracking(): Promise<{ success: boolean }>

  /**
   * Capture current orientation as calibration baseline
   * User should be sitting with good posture when this is called
   */
  calibrate(): Promise<CalibrationResult>

  /**
   * Get stored calibration baseline
   */
  getCalibration(): Promise<CalibrationData>

  /**
   * Clear stored calibration
   */
  clearCalibration(): Promise<{ success: boolean }>

  /**
   * Trigger haptic feedback on the iPhone
   * @param options.style - 'light' | 'medium' | 'heavy'
   */
  triggerHaptic(options?: { style?: 'light' | 'medium' | 'heavy' }): Promise<{ success: boolean }>

  /**
   * Listen for orientation updates (10Hz when tracking)
   */
  addListener(
    event: 'orientationUpdate',
    callback: (data: OrientationUpdate) => void
  ): Promise<PluginListenerHandle>

  /**
   * Listen for AirPods connection events
   */
  addListener(event: 'deviceConnected', callback: () => void): Promise<PluginListenerHandle>

  /**
   * Listen for AirPods disconnection events
   */
  addListener(event: 'deviceDisconnected', callback: () => void): Promise<PluginListenerHandle>

  /**
   * Remove all listeners for this plugin
   */
  removeAllListeners(): Promise<void>
}

/**
 * Register the Posture plugin
 *
 * On non-iOS platforms or devices without compatible AirPods, isSupported() returns false
 */
export const Posture = registerPlugin<PosturePlugin>('Posture', {
  web: {
    // Web fallback - always returns not supported
    async isSupported() {
      return { supported: false }
    },
    async isDeviceConnected() {
      return { connected: false }
    },
    async startTracking() {
      console.warn('[Posture] Not supported on web')
      return { success: false }
    },
    async stopTracking() {
      return { success: true }
    },
    async calibrate() {
      return { success: false }
    },
    async getCalibration() {
      return { isCalibrated: false }
    },
    async clearCalibration() {
      return { success: true }
    },
    async triggerHaptic() {
      return { success: false }
    },
    async addListener() {
      return { remove: async () => {} }
    },
    async removeAllListeners() {},
  },
})
