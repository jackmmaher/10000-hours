/**
 * useTrackingScore - Calculate eye tracking engagement metrics
 *
 * New engagement-based metrics (replacing old motor-skill metrics):
 * - Focus Time: Total seconds where gaze was within 150px of orb center
 * - Engagement Rate: Focus Time / Session Duration * 100
 * - Longest Streak: Longest continuous period without gaze breaking away
 *
 * Scientific basis: Time spent tracking the orb drives amygdala deactivation,
 * not the precision of tracking. These metrics measure therapeutic engagement.
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
  /** Calculate current accuracy for real-time feedback (0 or 100 based on threshold) */
  getCurrentAccuracy: (gazePoint: GazePoint | null, orbPosition: OrbPosition | null) => number
  /** Add orb position to history */
  recordOrbPosition: (x: number, y: number) => void
  /** Get orb position history (returns copy in chronological order) */
  getOrbHistory: () => OrbPosition[]
  /** Clear orb history */
  clearOrbHistory: () => void
}

// On-orb radius threshold in pixels
// WebGazer has ~100-200px inherent error, plus the orb moves continuously.
// 200px threshold balances accuracy with WebGazer's limitations on mobile.
const FOCUS_THRESHOLD_PX = 200

// Break duration threshold in milliseconds (brief glances don't count as breaks)
const BREAK_THRESHOLD_MS = 500

// Maximum time difference for matching gaze to orb (ms)
const MAX_TIMESTAMP_DIFF = 100

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
 * Calculate distance between gaze point and orb position
 */
function calculateDistance(gaze: GazePoint, orb: OrbPosition): number {
  const dx = gaze.x - orb.x
  const dy = gaze.y - orb.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Calculate focus time: total seconds where gaze was within threshold of orb
 */
function calculateFocusTime(
  gazeHistory: GazePoint[],
  orbHistory: OrbPosition[],
  threshold: number
): number {
  if (gazeHistory.length < 2 || orbHistory.length === 0) return 0

  let focusTimeMs = 0

  for (let i = 1; i < gazeHistory.length; i++) {
    const gaze = gazeHistory[i]
    const prevGaze = gazeHistory[i - 1]
    const orb = findClosestOrb(gaze.timestamp, orbHistory)

    if (!orb) continue

    const distance = calculateDistance(gaze, orb)

    if (distance < threshold) {
      // Gaze is within threshold - add the time delta since previous gaze point
      const timeDelta = gaze.timestamp - prevGaze.timestamp
      focusTimeMs += timeDelta
    }
  }

  return focusTimeMs / 1000 // Convert to seconds
}

/**
 * Calculate longest streak: longest continuous period where gaze stayed within threshold
 * A "break" occurs when gaze is outside threshold for breakDuration ms or more
 */
function calculateLongestStreak(
  gazeHistory: GazePoint[],
  orbHistory: OrbPosition[],
  threshold: number,
  breakDuration: number
): number {
  if (gazeHistory.length < 2 || orbHistory.length === 0) return 0

  let longestStreakMs = 0
  let currentStreakStartMs: number | null = null
  let outsideStartMs: number | null = null

  for (let i = 0; i < gazeHistory.length; i++) {
    const gaze = gazeHistory[i]
    const orb = findClosestOrb(gaze.timestamp, orbHistory)

    if (!orb) continue

    const distance = calculateDistance(gaze, orb)
    const isWithinThreshold = distance < threshold

    if (isWithinThreshold) {
      // Gaze is within threshold
      if (currentStreakStartMs === null) {
        // Start a new streak
        currentStreakStartMs = gaze.timestamp
      }
      // Reset outside timer since we're back within threshold
      outsideStartMs = null
    } else {
      // Gaze is outside threshold
      if (currentStreakStartMs !== null) {
        if (outsideStartMs === null) {
          // Start tracking how long we've been outside
          outsideStartMs = gaze.timestamp
        } else {
          // Check if we've been outside long enough to count as a break
          const outsideDuration = gaze.timestamp - outsideStartMs
          if (outsideDuration >= breakDuration) {
            // Break occurred - record the streak (up to when we first went outside)
            const streakDuration = outsideStartMs - currentStreakStartMs
            if (streakDuration > longestStreakMs) {
              longestStreakMs = streakDuration
            }
            // Reset streak tracking
            currentStreakStartMs = null
            outsideStartMs = null
          }
        }
      }
    }
  }

  // Handle case where session ended while in a streak
  if (currentStreakStartMs !== null && gazeHistory.length > 0) {
    const lastGaze = gazeHistory[gazeHistory.length - 1]
    // If we were outside but not long enough for a break, include that time
    const streakEnd = outsideStartMs ?? lastGaze.timestamp
    const streakDuration = streakEnd - currentStreakStartMs
    if (streakDuration > longestStreakMs) {
      longestStreakMs = streakDuration
    }
  }

  return longestStreakMs / 1000 // Convert to seconds
}

// Maximum history size (5 minutes at ~60fps)
const MAX_HISTORY = 18000

export function useTrackingScore(): UseTrackingScoreResult {
  const orbHistoryRef = useRef<OrbPosition[]>([])
  const orbIndexRef = useRef(0)

  /**
   * Record orb position at current time using circular buffer (O(1) vs O(n) for shift)
   */
  const recordOrbPosition = useCallback((x: number, y: number) => {
    const pos = { x, y, timestamp: performance.now() }

    if (orbHistoryRef.current.length < MAX_HISTORY) {
      // Buffer not full yet, just push
      orbHistoryRef.current.push(pos)
    } else {
      // Buffer full, overwrite oldest entry
      orbHistoryRef.current[orbIndexRef.current] = pos
      orbIndexRef.current = (orbIndexRef.current + 1) % MAX_HISTORY
    }
  }, [])

  /**
   * Get orb history in chronological order (oldest to newest)
   */
  const getOrbHistory = useCallback((): OrbPosition[] => {
    const history = orbHistoryRef.current
    if (history.length < MAX_HISTORY) {
      // Buffer not full, already in order
      return [...history]
    }
    // Circular buffer - reorder from oldest to newest
    const index = orbIndexRef.current
    return [...history.slice(index), ...history.slice(0, index)]
  }, [])

  /**
   * Clear orb history
   */
  const clearOrbHistory = useCallback(() => {
    orbHistoryRef.current = []
    orbIndexRef.current = 0
  }, [])

  /**
   * Get current accuracy for real-time feedback (0 or 100)
   * Simple binary: within threshold = 100, outside = 0
   */
  const getCurrentAccuracy = useCallback(
    (gazePoint: GazePoint | null, orbPosition: OrbPosition | null): number => {
      if (!gazePoint || !orbPosition) return 0

      const dx = gazePoint.x - orbPosition.x
      const dy = gazePoint.y - orbPosition.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Binary score: within threshold = 100, outside = 0
      return distance < FOCUS_THRESHOLD_PX ? 100 : 0
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
          focusTimeSeconds: 0,
          engagementPercent: 0,
          longestStreakSeconds: 0,
        }
      }

      // Calculate session duration from gaze history timestamps
      const sessionStartMs = gazeHistory[0].timestamp
      const sessionEndMs = gazeHistory[gazeHistory.length - 1].timestamp
      const sessionDurationSeconds = (sessionEndMs - sessionStartMs) / 1000

      // Calculate focus time (total time gaze was within threshold of orb)
      const focusTimeSeconds = calculateFocusTime(gazeHistory, orbHistory, FOCUS_THRESHOLD_PX)

      // Calculate engagement percent (focus time / session duration * 100)
      const engagementPercent =
        sessionDurationSeconds > 0
          ? Math.min(100, Math.round((focusTimeSeconds / sessionDurationSeconds) * 100))
          : 0

      // Calculate longest streak (longest continuous focus period)
      const longestStreakSeconds = calculateLongestStreak(
        gazeHistory,
        orbHistory,
        FOCUS_THRESHOLD_PX,
        BREAK_THRESHOLD_MS
      )

      // Debug logging for development
      console.debug('[TrackingScore] Metrics calculated:', {
        gazePoints: gazeHistory.length,
        orbPoints: orbHistory.length,
        sessionDurationSeconds: sessionDurationSeconds.toFixed(1),
        focusTimeSeconds: focusTimeSeconds.toFixed(1),
        engagementPercent,
        longestStreakSeconds: longestStreakSeconds.toFixed(1),
      })

      return {
        focusTimeSeconds: Math.round(focusTimeSeconds * 10) / 10, // Round to 1 decimal
        engagementPercent,
        longestStreakSeconds: Math.round(longestStreakSeconds * 10) / 10, // Round to 1 decimal
      }
    },
    []
  )

  return {
    calculateMetrics,
    getCurrentAccuracy,
    recordOrbPosition,
    getOrbHistory,
    clearOrbHistory,
  }
}
