/**
 * useAdaptiveBaseline - Load historical session data for adaptive coherence thresholds
 *
 * Queries the last N sessions and calculates personalized baselines:
 * - User's typical pitch variance (for adaptive pitch stability scoring)
 * - User's typical amplitude CV (for adaptive amplitude smoothness scoring)
 * - Historical average coherence (for progress comparison)
 *
 * This enables the coherence algorithm to adapt to each user's voice characteristics
 * and skill level over time.
 */

import { useState, useEffect } from 'react'
import { db } from '../lib/db/schema'
import type { AdaptiveBaseline } from './useVocalCoherence'

const SESSIONS_TO_ANALYZE = 10 // Last 10 sessions for baseline
const MIN_SESSIONS_FOR_BASELINE = 3 // Need at least 3 sessions for reliable baseline

export interface HistoricalStats {
  sessionCount: number
  avgCoherence: number
  avgPitchStability: number
  avgAmplitudeSmoothness: number
  avgVoicingContinuity: number
  // For adaptive thresholds
  medianPitchVariance: number
  medianAmplitudeCV: number
  // For progress tracking
  firstSessionScore: number | null
  lastSessionScore: number | null
  improvementPercent: number | null
}

export interface UseAdaptiveBaselineResult {
  baseline: AdaptiveBaseline | null
  stats: HistoricalStats | null
  isLoading: boolean
  error: string | null
}

/**
 * Calculate median of an array
 */
function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * Calculate mean of an array
 */
function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

export function useAdaptiveBaseline(): UseAdaptiveBaselineResult {
  const [baseline, setBaseline] = useState<AdaptiveBaseline | null>(null)
  const [stats, setStats] = useState<HistoricalStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadHistory() {
      try {
        setIsLoading(true)
        setError(null)

        // Query recent Om Coach sessions
        const sessions = await db.sessions
          .where('practiceToolId')
          .equals('om-coach')
          .reverse() // Most recent first
          .limit(SESSIONS_TO_ANALYZE)
          .toArray()

        if (sessions.length < MIN_SESSIONS_FOR_BASELINE) {
          // Not enough history for adaptive baseline
          setBaseline(null)
          setStats({
            sessionCount: sessions.length,
            avgCoherence: 0,
            avgPitchStability: 0,
            avgAmplitudeSmoothness: 0,
            avgVoicingContinuity: 0,
            medianPitchVariance: 0,
            medianAmplitudeCV: 0,
            firstSessionScore: null,
            lastSessionScore: null,
            improvementPercent: null,
          })
          return
        }

        // Extract metrics from sessions (filter out sessions without enhanced metrics)
        const coherenceScores: number[] = []
        const pitchStabilityScores: number[] = []
        const amplitudeSmoothnessScores: number[] = []
        const voicingContinuityScores: number[] = []
        const pitchVariances: number[] = []
        const amplitudeCVs: number[] = []

        for (const session of sessions) {
          const metrics = session.omCoachMetrics
          if (!metrics) continue

          coherenceScores.push(metrics.averageAlignmentScore)

          // Enhanced metrics (may not exist in older sessions)
          if (metrics.avgPitchStabilityScore !== undefined) {
            pitchStabilityScores.push(metrics.avgPitchStabilityScore)
          }
          if (metrics.avgAmplitudeSmoothnessScore !== undefined) {
            amplitudeSmoothnessScores.push(metrics.avgAmplitudeSmoothnessScore)
          }
          if (metrics.avgVoicingContinuityScore !== undefined) {
            voicingContinuityScores.push(metrics.avgVoicingContinuityScore)
          }
          if (metrics.rawPitchVarianceCents !== undefined && metrics.rawPitchVarianceCents > 0) {
            pitchVariances.push(metrics.rawPitchVarianceCents)
          }
          if (metrics.rawAmplitudeCV !== undefined && metrics.rawAmplitudeCV > 0) {
            amplitudeCVs.push(metrics.rawAmplitudeCV)
          }
        }

        // Calculate stats
        const avgCoherence = mean(coherenceScores)
        const avgPitchStability = mean(pitchStabilityScores)
        const avgAmplitudeSmoothness = mean(amplitudeSmoothnessScores)
        const avgVoicingContinuity = mean(voicingContinuityScores)

        // Use median for raw values (more robust to outliers)
        const medianPitchVariance = median(pitchVariances)
        const medianAmplitudeCV = median(amplitudeCVs)

        // Progress tracking (first vs most recent)
        const firstScore =
          coherenceScores.length > 0 ? coherenceScores[coherenceScores.length - 1] : null
        const lastScore = coherenceScores.length > 0 ? coherenceScores[0] : null
        const improvementPercent =
          firstScore !== null && lastScore !== null && firstScore > 0
            ? Math.round(((lastScore - firstScore) / firstScore) * 100)
            : null

        // Build stats object
        const calculatedStats: HistoricalStats = {
          sessionCount: sessions.length,
          avgCoherence: Math.round(avgCoherence),
          avgPitchStability: Math.round(avgPitchStability),
          avgAmplitudeSmoothness: Math.round(avgAmplitudeSmoothness),
          avgVoicingContinuity: Math.round(avgVoicingContinuity),
          medianPitchVariance,
          medianAmplitudeCV,
          firstSessionScore: firstScore,
          lastSessionScore: lastScore,
          improvementPercent,
        }
        setStats(calculatedStats)

        // Build adaptive baseline (only if we have enough enhanced data)
        if (pitchVariances.length >= MIN_SESSIONS_FOR_BASELINE) {
          const adaptiveBaseline: AdaptiveBaseline = {
            noiseFloor: 0.003, // Default, calibration overrides this
            expectedPitchVariance: medianPitchVariance > 0 ? medianPitchVariance : 50,
            expectedAmplitudeCV: medianAmplitudeCV > 0 ? medianAmplitudeCV : 0.5,
            historicalAvgCoherence: avgCoherence,
            historicalPitchStability: avgPitchStability,
            historicalAmplitudeSmoothness: avgAmplitudeSmoothness,
            sessionCount: sessions.length,
          }
          setBaseline(adaptiveBaseline)
        } else {
          // Not enough enhanced data yet, use defaults
          setBaseline(null)
        }
      } catch (err) {
        console.error('[useAdaptiveBaseline] Error loading history:', err)
        setError(err instanceof Error ? err.message : 'Failed to load session history')
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [])

  return {
    baseline,
    stats,
    isLoading,
    error,
  }
}
