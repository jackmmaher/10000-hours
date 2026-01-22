/**
 * Audio Processing Utilities for Mobile-Optimized Audio Pipeline
 *
 * Provides signal processing utilities for stable audio detection on mobile devices:
 * - MedianFilterBuffer: Removes spurious outliers (better than low-pass filtering)
 * - calculateAutoGain: Computes gain multiplier from RMS history
 * - calculateAdaptiveClarityThreshold: Lowers threshold based on signal quality
 * - VOICE_COMPRESSOR_SETTINGS: DynamicsCompressor config for voice normalization
 */

/**
 * DynamicsCompressor settings optimized for voice
 * - threshold: -24 dB (start compressing at -24 dBFS)
 * - knee: 10 dB (soft knee for natural sound)
 * - ratio: 4:1 (moderate compression)
 * - attack: 3ms (fast for transients)
 * - release: 250ms (smooth for sustained notes)
 */
export const VOICE_COMPRESSOR_SETTINGS = {
  threshold: -24,
  knee: 10,
  ratio: 4,
  attack: 0.003,
  release: 0.25,
} as const

/**
 * Auto-gain configuration
 */
export const AUTO_GAIN_CONFIG = {
  historySize: 100, // Track last 100 RMS values
  percentile: 90, // Use 90th percentile to avoid clipping
  targetRms: 0.15, // Typical voiced speech level
  minGain: 0.5, // Never reduce below 0.5x
  maxGain: 8.0, // Never amplify beyond 8x
} as const

/**
 * Adaptive clarity threshold configuration
 */
export const ADAPTIVE_CLARITY_CONFIG = {
  historySize: 60, // Track last 60 clarity values (~1 second at 60fps)
  percentile: 75, // Use 75th percentile
  multiplier: 0.9, // Use 90% of percentile as threshold
  minThreshold: 0.6, // Never go below 0.6
  maxThreshold: 0.9, // Cap at original threshold
  defaultThreshold: 0.75, // Lower base threshold from 0.9 to 0.75
} as const

/**
 * MedianFilterBuffer - Removes spurious outliers using median filtering
 *
 * For numbers: Returns mathematical median
 * For strings (phonemes): Returns mode (most frequent value)
 *
 * Window size of 5 samples at 60fps = ~83ms latency (imperceptible)
 */
export class MedianFilterBuffer<T extends number | string> {
  private buffer: T[] = []
  private readonly windowSize: number

  constructor(windowSize: number = 5) {
    this.windowSize = windowSize
  }

  /**
   * Add a value to the buffer and return the filtered result
   */
  push(value: T): T {
    this.buffer.push(value)

    // Keep buffer at window size
    if (this.buffer.length > this.windowSize) {
      this.buffer.shift()
    }

    // Return filtered value
    return this.getFiltered()
  }

  /**
   * Get the current filtered value without adding new data
   */
  getFiltered(): T {
    if (this.buffer.length === 0) {
      // Return a sensible default based on type
      return (typeof this.buffer[0] === 'string' ? '' : 0) as T
    }

    if (this.buffer.length === 1) {
      return this.buffer[0]
    }

    // Check if we're dealing with numbers or strings
    if (typeof this.buffer[0] === 'number') {
      return this.getMedian() as T
    } else {
      return this.getMode() as T
    }
  }

  /**
   * Calculate median for numeric values
   */
  private getMedian(): number {
    const sorted = [...(this.buffer as number[])].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2
    }
    return sorted[mid]
  }

  /**
   * Calculate mode for string values (most frequent)
   */
  private getMode(): string {
    const counts = new Map<string, number>()
    let maxCount = 0
    let mode = this.buffer[0] as string

    for (const value of this.buffer as string[]) {
      const count = (counts.get(value) || 0) + 1
      counts.set(value, count)

      if (count > maxCount) {
        maxCount = count
        mode = value
      }
    }

    return mode
  }

  /**
   * Clear the buffer
   */
  reset(): void {
    this.buffer = []
  }

  /**
   * Get the current buffer size
   */
  get size(): number {
    return this.buffer.length
  }

  /**
   * Check if buffer is full
   */
  get isFull(): boolean {
    return this.buffer.length >= this.windowSize
  }
}

/**
 * RMS History tracker for auto-gain calculation
 */
export class RmsHistoryTracker {
  private history: number[] = []
  private readonly maxSize: number

  constructor(maxSize: number = AUTO_GAIN_CONFIG.historySize) {
    this.maxSize = maxSize
  }

  /**
   * Add an RMS value to history
   */
  push(rms: number): void {
    this.history.push(rms)
    if (this.history.length > this.maxSize) {
      this.history.shift()
    }
  }

  /**
   * Calculate recommended gain based on RMS history
   * Returns gain multiplier between minGain and maxGain
   */
  calculateAutoGain(): number {
    if (this.history.length < 10) {
      // Not enough data yet, return neutral gain
      return 1.0
    }

    // Get the specified percentile value
    const sorted = [...this.history].sort((a, b) => a - b)
    const percentileIndex = Math.floor((AUTO_GAIN_CONFIG.percentile / 100) * sorted.length)
    const percentileRms = sorted[Math.min(percentileIndex, sorted.length - 1)]

    // Avoid division by very small numbers
    if (percentileRms < 0.001) {
      return AUTO_GAIN_CONFIG.maxGain
    }

    // Calculate gain to reach target RMS
    const gain = AUTO_GAIN_CONFIG.targetRms / percentileRms

    // Clamp to safe range
    return Math.max(AUTO_GAIN_CONFIG.minGain, Math.min(AUTO_GAIN_CONFIG.maxGain, gain))
  }

  /**
   * Get current average RMS
   */
  getAverageRms(): number {
    if (this.history.length === 0) return 0
    return this.history.reduce((sum, val) => sum + val, 0) / this.history.length
  }

  /**
   * Clear history
   */
  reset(): void {
    this.history = []
  }

  /**
   * Get history size
   */
  get size(): number {
    return this.history.length
  }
}

/**
 * Adaptive clarity threshold tracker
 * Adjusts pitch detection threshold based on signal quality
 */
export class AdaptiveClarityTracker {
  private history: number[] = []
  private readonly maxSize: number

  constructor(maxSize: number = ADAPTIVE_CLARITY_CONFIG.historySize) {
    this.maxSize = maxSize
  }

  /**
   * Add a clarity value to history
   */
  push(clarity: number): void {
    this.history.push(clarity)
    if (this.history.length > this.maxSize) {
      this.history.shift()
    }
  }

  /**
   * Calculate adaptive threshold based on clarity history
   * Returns threshold between minThreshold and maxThreshold
   */
  calculateThreshold(): number {
    if (this.history.length < 20) {
      // Not enough data, use default
      return ADAPTIVE_CLARITY_CONFIG.defaultThreshold
    }

    // Get the specified percentile value
    const sorted = [...this.history].sort((a, b) => a - b)
    const percentileIndex = Math.floor((ADAPTIVE_CLARITY_CONFIG.percentile / 100) * sorted.length)
    const percentileClarity = sorted[Math.min(percentileIndex, sorted.length - 1)]

    // Calculate adaptive threshold
    const threshold = percentileClarity * ADAPTIVE_CLARITY_CONFIG.multiplier

    // Clamp to safe range
    return Math.max(
      ADAPTIVE_CLARITY_CONFIG.minThreshold,
      Math.min(ADAPTIVE_CLARITY_CONFIG.maxThreshold, threshold)
    )
  }

  /**
   * Clear history
   */
  reset(): void {
    this.history = []
  }

  /**
   * Get history size
   */
  get size(): number {
    return this.history.length
  }
}

/**
 * Calculate RMS from Float32Array audio data
 * Returns normalized 0-1 value
 */
export function calculateRmsFromFloat32(data: Float32Array): number {
  let sumSquares = 0
  for (let i = 0; i < data.length; i++) {
    sumSquares += data[i] * data[i]
  }
  return Math.sqrt(sumSquares / data.length)
}

/**
 * Apply noise gate to signal
 * Returns true if signal is above noise threshold
 */
export function isAboveNoiseGate(rms: number, noiseFloor: number = 0.01): boolean {
  return rms > noiseFloor
}

/**
 * Configure a DynamicsCompressorNode with voice-optimized settings
 */
export function configureVoiceCompressor(compressor: DynamicsCompressorNode): void {
  compressor.threshold.value = VOICE_COMPRESSOR_SETTINGS.threshold
  compressor.knee.value = VOICE_COMPRESSOR_SETTINGS.knee
  compressor.ratio.value = VOICE_COMPRESSOR_SETTINGS.ratio
  compressor.attack.value = VOICE_COMPRESSOR_SETTINGS.attack
  compressor.release.value = VOICE_COMPRESSOR_SETTINGS.release
}
