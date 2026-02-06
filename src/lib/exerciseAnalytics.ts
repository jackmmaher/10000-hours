/**
 * Exercise Analytics - Utilities for analyzing exercise session data
 *
 * Provides aggregation and progress analysis for exercise sessions
 * across all practice tools: Aum Coach, Racing Mind, Breath Pacer, Posture.
 */

import type { Session, PracticeToolId } from './db/types'
import type { AppView } from '../stores/useNavigationStore'

/** Human-readable exercise tool names */
export const EXERCISE_TOOL_NAMES: Record<PracticeToolId, string> = {
  'om-coach': 'Aum Coach',
  'racing-mind': 'Racing Mind',
  'breath-pacer': 'Breath Pacer',
  'posture-training': 'Perfect Posture',
}

/** Navigation view for each exercise tool */
export const EXERCISE_TOOL_VIEWS: Record<PracticeToolId, AppView> = {
  'om-coach': 'om-coach',
  'racing-mind': 'racing-mind',
  'breath-pacer': 'breath-pacer',
  'posture-training': 'posture',
}

/** Orb/accent colors for each exercise tool */
export const EXERCISE_TOOL_COLORS: Record<PracticeToolId, string> = {
  'om-coach': '#6B8F6B', // Moss - voice/growth
  'racing-mind': '#22D3EE', // Cyan - mental clarity
  'breath-pacer': '#00CED1', // Turquoise - rhythm/flow
  'posture-training': '#F97316', // Coral - body warmth
}

/** Per-tool aggregated stats */
export interface ExerciseToolStats {
  toolId: PracticeToolId
  toolName: string
  color: string
  sessionCount: number
  totalDurationSeconds: number
  avgDurationSeconds: number
  sessionsPerWeek: number // Rolling 4-week average
  lastSessionAt: number | null // Timestamp
  // Tool-specific metrics
  latestScore?: number // Most recent key metric (coherence, mind score, posture %)
  scoreProgression?: number[] // Last N scores for sparkline
  selfAssessmentProgress?: {
    firstAvg: number // Average of first 3 sessions
    recentAvg: number // Average of last 3 sessions
    improvement: number // Positive = improvement
    totalSessions: number
  }
}

/** Global exercise stats across all tools */
export interface ExerciseOverview {
  totalSessions: number
  totalDurationSeconds: number
  toolsUsed: number
  mostPracticedTool: PracticeToolId | null
  sessionsPerWeek: number // Rolling 4-week average
  tools: ExerciseToolStats[]
}

/**
 * Filter sessions to only exercise sessions
 */
export function getExerciseSessions(sessions: Session[]): Session[] {
  return sessions.filter((s) => s.sessionType === 'practice' && s.practiceToolId)
}

/**
 * Get exercise sessions for a specific tool
 */
export function getToolSessions(sessions: Session[], toolId: PracticeToolId): Session[] {
  return sessions.filter((s) => s.sessionType === 'practice' && s.practiceToolId === toolId)
}

/**
 * Calculate comprehensive exercise analytics
 */
export function getExerciseOverview(sessions: Session[]): ExerciseOverview {
  const exerciseSessions = getExerciseSessions(sessions)

  if (exerciseSessions.length === 0) {
    return {
      totalSessions: 0,
      totalDurationSeconds: 0,
      toolsUsed: 0,
      mostPracticedTool: null,
      sessionsPerWeek: 0,
      tools: [],
    }
  }

  const fourWeeksAgo = Date.now() - 28 * 24 * 60 * 60 * 1000
  const recentSessions = exerciseSessions.filter((s) => s.startTime >= fourWeeksAgo)

  // Group by tool
  const toolGroups = new Map<PracticeToolId, Session[]>()
  for (const session of exerciseSessions) {
    const toolId = session.practiceToolId!
    if (!toolGroups.has(toolId)) {
      toolGroups.set(toolId, [])
    }
    toolGroups.get(toolId)!.push(session)
  }

  // Build per-tool stats
  const tools: ExerciseToolStats[] = []
  let mostPracticedTool: PracticeToolId | null = null
  let maxCount = 0

  for (const [toolId, toolSessions] of toolGroups) {
    const sortedSessions = [...toolSessions].sort((a, b) => a.startTime - b.startTime)
    const totalDuration = sortedSessions.reduce((sum, s) => sum + s.durationSeconds, 0)
    const recentToolSessions = sortedSessions.filter((s) => s.startTime >= fourWeeksAgo)

    const stats: ExerciseToolStats = {
      toolId,
      toolName: EXERCISE_TOOL_NAMES[toolId] || toolId,
      color: EXERCISE_TOOL_COLORS[toolId] || '#888',
      sessionCount: sortedSessions.length,
      totalDurationSeconds: totalDuration,
      avgDurationSeconds: Math.round(totalDuration / sortedSessions.length),
      sessionsPerWeek: recentToolSessions.length / 4,
      lastSessionAt: sortedSessions[sortedSessions.length - 1]?.startTime || null,
    }

    // Tool-specific metrics extraction
    if (toolId === 'om-coach') {
      const scores = sortedSessions
        .filter((s) => s.omCoachMetrics?.averageAlignmentScore != null)
        .map((s) => s.omCoachMetrics!.averageAlignmentScore)
      if (scores.length > 0) {
        stats.latestScore = scores[scores.length - 1]
        stats.scoreProgression = scores.slice(-10)
      }
    }

    if (toolId === 'racing-mind') {
      // Self-assessment progress (pre-session mind scores, lower is better)
      const preScores = sortedSessions
        .filter((s) => s.racingMindMetrics?.preSessionMindScore != null)
        .map((s) => s.racingMindMetrics!.preSessionMindScore!)

      if (preScores.length >= 3) {
        const firstThree = preScores.slice(0, 3)
        const lastThree = preScores.slice(-3)
        const firstAvg = firstThree.reduce((a, b) => a + b, 0) / firstThree.length
        const recentAvg = lastThree.reduce((a, b) => a + b, 0) / lastThree.length

        stats.selfAssessmentProgress = {
          firstAvg: Math.round(firstAvg * 10) / 10,
          recentAvg: Math.round(recentAvg * 10) / 10,
          improvement: Math.round((firstAvg - recentAvg) * 10) / 10, // Positive = less racing
          totalSessions: preScores.length,
        }
      }

      // Post-session scores as progression
      const postScores = sortedSessions
        .filter((s) => s.racingMindMetrics?.postSessionMindScore != null)
        .map((s) => s.racingMindMetrics!.postSessionMindScore!)
      if (postScores.length > 0) {
        stats.latestScore = postScores[postScores.length - 1]
        stats.scoreProgression = postScores.slice(-10)
      }
    }

    if (toolId === 'posture-training') {
      const scores = sortedSessions
        .filter((s) => s.postureMetrics?.goodPosturePercent != null)
        .map((s) => s.postureMetrics!.goodPosturePercent)
      if (scores.length > 0) {
        stats.latestScore = scores[scores.length - 1]
        stats.scoreProgression = scores.slice(-10)
      }
    }

    tools.push(stats)

    if (sortedSessions.length > maxCount) {
      maxCount = sortedSessions.length
      mostPracticedTool = toolId
    }
  }

  // Sort tools by session count (most practiced first)
  tools.sort((a, b) => b.sessionCount - a.sessionCount)

  return {
    totalSessions: exerciseSessions.length,
    totalDurationSeconds: exerciseSessions.reduce((sum, s) => sum + s.durationSeconds, 0),
    toolsUsed: toolGroups.size,
    mostPracticedTool,
    sessionsPerWeek: recentSessions.length / 4,
    tools,
  }
}

/**
 * Get recent exercise sessions (sorted newest first, limited)
 */
export function getRecentExerciseSessions(sessions: Session[], limit = 5): Session[] {
  return getExerciseSessions(sessions)
    .sort((a, b) => b.startTime - a.startTime)
    .slice(0, limit)
}

/**
 * Format duration in human-readable form
 */
export function formatExerciseDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  const remainMins = mins % 60
  return remainMins > 0 ? `${hours}h ${remainMins}m` : `${hours}h`
}
