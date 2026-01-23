/**
 * useTrackingScore - Calculate eye tracking metrics using scientific methodology
 *
 * Metrics based on smooth pursuit research (PMC6753966, Behavior Research Methods):
 * - Pursuit Gain: eye velocity / target velocity (1.0 = perfect tracking)
 * - Saccade Count: Adaptive threshold based on per-session velocity statistics
 * - Smoothness Improvement: First half vs second half comparison
 *
 * Key fixes from previous implementation:
 * - Uses pursuit gain instead of position distance (scientifically correct)
 * - Adaptive saccade detection threshold (mean + 2.5*SD)
 * - Proper timestamp matching between gaze and orb data
 */

import { useCallback, useRef } from 'react'
import type { GazePoint } from '../../hooks/useEyeTracking'
import type { TrackingMetrics } from './index'

interface OrbPosition {
  x: number
  y: number
  timestamp: number
}

interface UseTrackingScoreResult {
  /** Calculate final tracking metrics from gaze and orb history */
  calculateMetrics: (gazeHistory: GazePoint[], orbHistory: OrbPosition[]) => TrackingMetrics
  /** Calculate current accuracy for real-time feedback */
  getCurrentAccuracy: (gazePoint: GazePoint | null, orbPosition: OrbPosition | null) => number
  /** Add orb position to history */
  recordOrbPosition: (x: number, y: number) => void
  /** Get orb position history */
  orbHistory: OrbPosition[]
  /** Clear orb history */
  clearOrbHistory: () => void
}

// Minimum time difference for velocity calculation (ms)
const MIN_TIME_DELTA = 10

// Maximum time difference for matching gaze to orb (ms)
// Allow up to 100ms of timestamp difference for matching
const MAX_TIMESTAMP_DIFF = 100

// Minimum velocity to consider (filters out noise when stationary)
const MIN_VELOCITY_THRESHOLD = 5 // pixels per second

/**
 * Calculate velocity between two points
 * Returns pixels per second
 */
function calculateVelocity(
  p1: { x: number; y: number; timestamp: number },
  p2: { x: number; y: number; timestamp: number }
): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const dt = (p2.timestamp - p1.timestamp) / 1000 // Convert to seconds

  if (dt < MIN_TIME_DELTA / 1000) return 0
  return Math.sqrt(dx * dx + dy * dy) / dt
}

/**
 * Find orb position closest to a given timestamp
 * Returns null if no orb within acceptable time range
 */
function findClosestOrb(timestamp: number, orbHistory: OrbPosition[]): OrbPosition | null {
  if (orbHistory.length === 0) return null

  let closest = orbHistory[0]
  let minDiff = Math.abs(timestamp - orbHistory[0].timestamp)

  for (const orb of orbHistory) {
    const diff = Math.abs(timestamp - orb.timestamp)
    if (diff < minDiff) {
      minDiff = diff
      closest = orb
    }
  }

  // Only return if within acceptable time range
  if (minDiff > MAX_TIMESTAMP_DIFF) {
    return null
  }

  return closest
}

/**
 * Calculate orb velocity at a given point in the history
 */
function _getOrbVelocityAt(index: number, orbHistory: OrbPosition[]): number {
  if (index < 1 || index >= orbHistory.length) return 0

  return calculateVelocity(orbHistory[index - 1], orbHistory[index])
}

/**
 * Calculate pursuit gain: ratio of eye velocity to target velocity
 * Gain of 1.0 = perfect tracking
 * Gain < 1.0 = eyes lagging behind target
 * Gain > 1.0 = eyes overshooting target
 */
function calculatePursuitGain(gazeHistory: GazePoint[], orbHistory: OrbPosition[]): number {
  if (gazeHistory.length < 2 || orbHistory.length < 2) return 0

  const gains: number[] = []

  for (let i = 1; i < gazeHistory.length; i++) {
    const gazeVelocity = calculateVelocity(gazeHistory[i - 1], gazeHistory[i])

    // Find corresponding orb positions
    const orb1 = findClosestOrb(gazeHistory[i - 1].timestamp, orbHistory)
    const orb2 = findClosestOrb(gazeHistory[i].timestamp, orbHistory)

    if (!orb1 || !orb2) continue

    const orbVelocity = calculateVelocity(orb1, orb2)

    // Skip if orb is barely moving (avoid division by near-zero)
    if (orbVelocity < MIN_VELOCITY_THRESHOLD) continue

    // Calculate instantaneous gain
    const gain = gazeVelocity / orbVelocity

    // Filter out extreme outliers (likely noise or saccades)
    if (gain > 0 && gain < 3) {
      gains.push(gain)
    }
  }

  if (gains.length === 0) return 0

  // Return median gain (more robust than mean)
  gains.sort((a, b) => a - b)
  const mid = Math.floor(gains.length / 2)
  return gains.length % 2 !== 0 ? gains[mid] : (gains[mid - 1] + gains[mid]) / 2
}

/**
 * Adaptive saccade detection using per-session velocity statistics
 * Based on research: threshold = mean + (multiplier × standard deviation)
 */
function countSaccadesAdaptive(gazeHistory: GazePoint[]): {
  count: number
  threshold: number
  velocities: number[]
} {
  if (gazeHistory.length < 3) {
    return { count: 0, threshold: 0, velocities: [] }
  }

  // Calculate all velocities
  const velocities: number[] = []
  for (let i = 1; i < gazeHistory.length; i++) {
    const velocity = calculateVelocity(gazeHistory[i - 1], gazeHistory[i])
    if (velocity > 0) {
      velocities.push(velocity)
    }
  }

  if (velocities.length < 10) {
    return { count: 0, threshold: 0, velocities }
  }

  // Calculate mean and standard deviation
  const mean = velocities.reduce((a, b) => a + b, 0) / velocities.length
  const variance = velocities.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / velocities.length
  const stdDev = Math.sqrt(variance)

  // Adaptive threshold: mean + 2.5 × standard deviation
  // This is a common research standard for saccade detection
  const threshold = mean + 2.5 * stdDev

  // Count velocities exceeding threshold
  let saccadeCount = 0
  for (const velocity of velocities) {
    if (velocity > threshold) {
      saccadeCount++
    }
  }

  return { count: saccadeCount, threshold, velocities }
}

/**
 * Calculate smoothness score based on velocity consistency
 * Higher score = more consistent smooth pursuit
 */
function calculateSmoothnessScore(velocities: number[]): number {
  if (velocities.length < 3) return 50 // Neutral score

  // Calculate coefficient of variation (CV = stdDev / mean)
  // Lower CV = more consistent velocities = smoother pursuit
  const mean = velocities.reduce((a, b) => a + b, 0) / velocities.length
  if (mean < MIN_VELOCITY_THRESHOLD) return 50 // Not enough movement to judge

  const variance = velocities.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / velocities.length
  const stdDev = Math.sqrt(variance)
  const cv = stdDev / mean

  // Convert CV to 0-100 score
  // CV of 0 = perfect consistency = 100
  // CV of 2+ = very inconsistent = 0
  const maxCV = 2
  const normalizedCV = Math.min(cv, maxCV) / maxCV
  return Math.round((1 - normalizedCV) * 100)
}

/**
 * Calculate average distance from gaze to orb (for real-time feedback)
 */
function _calculateAverageDistance(gazeHistory: GazePoint[], orbHistory: OrbPosition[]): number {
  if (gazeHistory.length === 0 || orbHistory.length === 0) return 100

  let totalDistance = 0
  let count = 0

  for (const gaze of gazeHistory) {
    const orbPos = findClosestOrb(gaze.timestamp, orbHistory)
    if (orbPos) {
      const dx = gaze.x - orbPos.x
      const dy = gaze.y - orbPos.y
      totalDistance += Math.sqrt(dx * dx + dy * dy)
      count++
    }
  }

  return count > 0 ? totalDistance / count : 100
}

export function useTrackingScore(): UseTrackingScoreResult {
  const orbHistoryRef = useRef<OrbPosition[]>([])

  /**
   * Record orb position at current time
   */
  const recordOrbPosition = useCallback((x: number, y: number) => {
    orbHistoryRef.current.push({
      x,
      y,
      timestamp: performance.now(),
    })

    // Keep last 5 minutes of data (at ~60fps = 18000 points)
    if (orbHistoryRef.current.length > 18000) {
      orbHistoryRef.current.shift()
    }
  }, [])

  /**
   * Clear orb history
   */
  const clearOrbHistory = useCallback(() => {
    orbHistoryRef.current = []
  }, [])

  /**
   * Get current accuracy for real-time feedback (0-100)
   * Uses simple distance for immediate feedback during session
   */
  const getCurrentAccuracy = useCallback(
    (gazePoint: GazePoint | null, orbPosition: OrbPosition | null): number => {
      if (!gazePoint || !orbPosition) return 50 // Neutral

      const dx = gazePoint.x - orbPosition.x
      const dy = gazePoint.y - orbPosition.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Convert distance to 0-100 accuracy score
      // 0 pixels = 100%, 150 pixels = 0%
      const maxDistance = 150
      const accuracy = Math.max(0, 100 - (distance / maxDistance) * 100)
      return Math.round(accuracy)
    },
    []
  )

  /**
   * Calculate final tracking metrics from complete gaze history
   */
  const calculateMetrics = useCallback(
    (gazeHistory: GazePoint[], orbHistory: OrbPosition[]): TrackingMetrics => {
      if (gazeHistory.length < 10 || orbHistory.length < 10) {
        // Not enough data
        return {
          improvementPercent: 0,
          accuracy: 50,
          saccadeCount: 0,
        }
      }

      // Calculate pursuit gain (the scientifically correct metric)
      const pursuitGain = calculatePursuitGain(gazeHistory, orbHistory)

      // Convert gain to accuracy percentage for display
      // Gain of 1.0 = 100% accuracy
      // Gain of 0.5 = 50% accuracy
      // Gain > 1.0 is capped at 100%
      const accuracy = Math.min(100, Math.round(pursuitGain * 100))

      // Count saccades with adaptive threshold
      const { count: saccadeCount } = countSaccadesAdaptive(gazeHistory)

      // Calculate improvement (first half vs second half)
      const midpoint = Math.floor(gazeHistory.length / 2)
      const firstHalf = gazeHistory.slice(0, midpoint)
      const secondHalf = gazeHistory.slice(midpoint)

      const firstHalfResult = countSaccadesAdaptive(firstHalf)
      const secondHalfResult = countSaccadesAdaptive(secondHalf)

      // Calculate improvement as percentage reduction in saccades
      let saccadeImprovement = 0
      if (firstHalfResult.count > 0) {
        saccadeImprovement =
          ((firstHalfResult.count - secondHalfResult.count) / firstHalfResult.count) * 100
      }

      // Also calculate smoothness improvement
      const firstHalfSmoothness = calculateSmoothnessScore(firstHalfResult.velocities)
      const secondHalfSmoothness = calculateSmoothnessScore(secondHalfResult.velocities)
      const smoothnessImprovement = secondHalfSmoothness - firstHalfSmoothness

      // Use the better of the two improvement measures
      const finalImprovement = Math.max(saccadeImprovement, smoothnessImprovement)

      // Debug logging for development
      console.debug('[TrackingScore] Metrics calculated:', {
        gazePoints: gazeHistory.length,
        orbPoints: orbHistory.length,
        pursuitGain: pursuitGain.toFixed(2),
        accuracy,
        saccadeCount,
        firstHalfSaccades: firstHalfResult.count,
        secondHalfSaccades: secondHalfResult.count,
        saccadeImprovement: saccadeImprovement.toFixed(1),
        smoothnessImprovement: smoothnessImprovement.toFixed(1),
        finalImprovement: finalImprovement.toFixed(1),
      })

      return {
        improvementPercent: Math.round(finalImprovement),
        accuracy: accuracy > 0 ? accuracy : 50, // Default to 50 if calculation failed
        saccadeCount,
      }
    },
    []
  )

  return {
    calculateMetrics,
    getCurrentAccuracy,
    recordOrbPosition,
    orbHistory: orbHistoryRef.current,
    clearOrbHistory,
  }
}
