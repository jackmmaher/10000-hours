/**
 * useTrackingScore - Calculate eye tracking metrics
 *
 * Analyzes gaze data relative to orb position to compute:
 * - Accuracy: How close gaze is to orb center
 * - Saccade count: Number of jerky catch-up movements
 * - Entrainment: How well gaze follows orb movement
 * - Improvement: First half vs second half smoothness
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

// Saccade detection threshold (pixels per second)
const SACCADE_THRESHOLD = 500

// Maximum acceptable distance from orb for "accurate" tracking (pixels)
const MAX_ACCURATE_DISTANCE = 100

/**
 * Calculate velocity between two gaze points
 */
function calculateVelocity(p1: GazePoint, p2: GazePoint): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const dt = (p2.timestamp - p1.timestamp) / 1000 // Convert to seconds

  if (dt === 0) return 0
  return Math.sqrt(dx * dx + dy * dy) / dt
}

/**
 * Count saccades (sudden velocity spikes) in gaze history
 */
function countSaccades(gazeHistory: GazePoint[]): number {
  if (gazeHistory.length < 2) return 0

  let saccadeCount = 0
  for (let i = 1; i < gazeHistory.length; i++) {
    const velocity = calculateVelocity(gazeHistory[i - 1], gazeHistory[i])
    if (velocity > SACCADE_THRESHOLD) {
      saccadeCount++
    }
  }
  return saccadeCount
}

/**
 * Calculate average distance from gaze to orb
 */
function calculateAverageDistance(gazeHistory: GazePoint[], orbHistory: OrbPosition[]): number {
  if (gazeHistory.length === 0 || orbHistory.length === 0) return MAX_ACCURATE_DISTANCE

  let totalDistance = 0
  let count = 0

  // For each gaze point, find the closest orb position by timestamp
  for (const gaze of gazeHistory) {
    const orbPos = findClosestOrb(gaze.timestamp, orbHistory)
    if (orbPos) {
      const dx = gaze.x - orbPos.x
      const dy = gaze.y - orbPos.y
      totalDistance += Math.sqrt(dx * dx + dy * dy)
      count++
    }
  }

  return count > 0 ? totalDistance / count : MAX_ACCURATE_DISTANCE
}

/**
 * Find orb position closest to a given timestamp
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

  return closest
}

/**
 * Calculate smoothness score (inverse of velocity variance)
 */
function calculateSmoothnessScore(gazeHistory: GazePoint[]): number {
  if (gazeHistory.length < 3) return 50 // Neutral score

  const velocities: number[] = []
  for (let i = 1; i < gazeHistory.length; i++) {
    velocities.push(calculateVelocity(gazeHistory[i - 1], gazeHistory[i]))
  }

  // Calculate variance
  const mean = velocities.reduce((a, b) => a + b, 0) / velocities.length
  const variance = velocities.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / velocities.length

  // Convert variance to 0-100 score (lower variance = higher score)
  // Typical variance range: 0 (perfect) to 50000+ (very jittery)
  const maxVariance = 50000
  const normalizedVariance = Math.min(variance, maxVariance) / maxVariance
  return Math.round((1 - normalizedVariance) * 100)
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

    // Keep last 5 minutes of data (at ~30fps = 9000 points)
    if (orbHistoryRef.current.length > 9000) {
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
   */
  const getCurrentAccuracy = useCallback(
    (gazePoint: GazePoint | null, orbPosition: OrbPosition | null): number => {
      if (!gazePoint || !orbPosition) return 50 // Neutral

      const dx = gazePoint.x - orbPosition.x
      const dy = gazePoint.y - orbPosition.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Convert distance to 0-100 accuracy score
      const accuracy = Math.max(0, 100 - (distance / MAX_ACCURATE_DISTANCE) * 100)
      return Math.round(accuracy)
    },
    []
  )

  /**
   * Calculate final tracking metrics from complete gaze history
   */
  const calculateMetrics = useCallback(
    (gazeHistory: GazePoint[], orbHistory: OrbPosition[]): TrackingMetrics => {
      if (gazeHistory.length < 10) {
        // Not enough data
        return {
          improvementPercent: 0,
          accuracy: 50,
          saccadeCount: 0,
        }
      }

      // Calculate accuracy (how close gaze was to orb on average)
      const avgDistance = calculateAverageDistance(gazeHistory, orbHistory)
      const accuracy = Math.max(0, Math.min(100, 100 - (avgDistance / MAX_ACCURATE_DISTANCE) * 100))

      // Count total saccades
      const saccadeCount = countSaccades(gazeHistory)

      // Calculate improvement (first half vs second half smoothness)
      const midpoint = Math.floor(gazeHistory.length / 2)
      const firstHalf = gazeHistory.slice(0, midpoint)
      const secondHalf = gazeHistory.slice(midpoint)

      const firstHalfSaccades = countSaccades(firstHalf)
      const secondHalfSaccades = countSaccades(secondHalf)

      // Calculate improvement as percentage reduction in saccades
      let improvementPercent = 0
      if (firstHalfSaccades > 0) {
        improvementPercent = ((firstHalfSaccades - secondHalfSaccades) / firstHalfSaccades) * 100
      } else if (secondHalfSaccades === 0) {
        // Perfect tracking throughout
        improvementPercent = 0
      }

      // Alternative: use smoothness score improvement
      const firstHalfSmoothness = calculateSmoothnessScore(firstHalf)
      const secondHalfSmoothness = calculateSmoothnessScore(secondHalf)
      const smoothnessImprovement = secondHalfSmoothness - firstHalfSmoothness

      // Use the better of the two improvement measures
      const finalImprovement = Math.max(improvementPercent, smoothnessImprovement)

      return {
        improvementPercent: Math.round(finalImprovement),
        accuracy: Math.round(accuracy),
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
