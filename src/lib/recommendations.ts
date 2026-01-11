/**
 * Recommendations - Contextual content discovery engine
 *
 * A lightweight recommendation system that uses the existing taxonomy
 * to surface relevant content at the right place and time.
 *
 * Two signals:
 * 1. User's own patterns - "we think you'll like this"
 * 2. Similar users' behavior - collaborative filtering (future)
 *
 * Design principles:
 * - Works with existing data (sessions, saved templates, Voice)
 * - No overwhelming filters - smart, contextual surfacing
 * - Respects experience level (recommendedAfterHours)
 * - Refreshes weekly, not constantly
 */

import { getAllSessions, getSavedTemplates, Session } from './db'
import type { SessionTemplate } from './types'
import type { Pearl } from './pearls'

// Import session data for matching
import extractedSessions from '../data/sessions.json'

// Raw session type from JSON
interface ExtractedSession {
  id: string
  title: string
  tagline: string
  duration_guidance: string
  discipline: string
  posture: string
  best_time: string
  guidance_notes: string
  intention: string
  recommended_after_hours: number
  tags?: string[]
  intent_tags?: string[]
  karma: number
  saves: number
  completions: number
  creator_hours: number
}

// Transform to SessionTemplate format
function transformSession(raw: ExtractedSession): SessionTemplate {
  return {
    id: raw.id,
    title: raw.title,
    tagline: raw.tagline,
    durationGuidance: raw.duration_guidance,
    discipline: raw.discipline,
    posture: raw.posture,
    bestTime: raw.best_time,
    guidanceNotes: raw.guidance_notes,
    intention: raw.intention,
    recommendedAfterHours: raw.recommended_after_hours,
    intentTags: raw.intent_tags,
    karma: raw.karma,
    saves: raw.saves,
    completions: raw.completions,
    creatorHours: raw.creator_hours,
  }
}

// All available sessions as SessionTemplate
const ALL_SESSIONS: SessionTemplate[] = (extractedSessions as ExtractedSession[]).map(
  transformSession
)

export interface RecommendationInputs {
  // From local session history
  disciplineFrequency: Map<string, number>
  avgDurationMinutes: number
  timeOfDayPattern: 'morning' | 'midday' | 'evening' | 'night' | 'mixed'

  // From Voice / profile
  totalHours: number

  // From saved content
  savedTemplateIds: Set<string>
  savedIntentTags: string[]
}

export interface WeeklyRecommendation {
  meditation: SessionTemplate | null
  pearl: Pearl | null
  reason: string
}

export interface SessionRecommendation {
  session: SessionTemplate
  score: number
  reason: string
}

/**
 * Analyze user's session history to extract patterns
 */
export async function analyzeUserPatterns(): Promise<RecommendationInputs> {
  const sessions = await getAllSessions()
  const savedTemplates = await getSavedTemplates()

  // Calculate discipline frequency
  const disciplineFrequency = new Map<string, number>()
  sessions.forEach((s) => {
    if (s.discipline) {
      disciplineFrequency.set(s.discipline, (disciplineFrequency.get(s.discipline) || 0) + 1)
    }
  })

  // Calculate average duration
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationSeconds / 60, 0)
  const avgDurationMinutes = sessions.length > 0 ? totalMinutes / sessions.length : 15

  // Analyze time-of-day patterns
  const timeOfDayPattern = analyzeTimeOfDay(sessions)

  // Calculate total hours
  const totalHours = totalMinutes / 60

  // Get saved template IDs
  const savedTemplateIds = new Set(savedTemplates.map((t) => t.templateId))

  // Aggregate intent tags from saved templates
  const savedIntentTags = aggregateSavedIntentTags(savedTemplateIds)

  return {
    disciplineFrequency,
    avgDurationMinutes,
    timeOfDayPattern,
    totalHours,
    savedTemplateIds,
    savedIntentTags,
  }
}

/**
 * Analyze what time of day the user typically practices
 */
function analyzeTimeOfDay(
  sessions: Session[]
): 'morning' | 'midday' | 'evening' | 'night' | 'mixed' {
  if (sessions.length === 0) return 'mixed'

  const counts = { morning: 0, midday: 0, evening: 0, night: 0 }

  sessions.forEach((s) => {
    const hour = new Date(s.startTime).getHours()
    if (hour >= 5 && hour < 12) counts.morning++
    else if (hour >= 12 && hour < 17) counts.midday++
    else if (hour >= 17 && hour < 21) counts.evening++
    else counts.night++
  })

  const total = sessions.length
  const threshold = 0.5 // 50% majority

  if (counts.morning / total >= threshold) return 'morning'
  if (counts.midday / total >= threshold) return 'midday'
  if (counts.evening / total >= threshold) return 'evening'
  if (counts.night / total >= threshold) return 'night'

  return 'mixed'
}

/**
 * Get intent tags from saved templates
 */
function aggregateSavedIntentTags(savedIds: Set<string>): string[] {
  const tagCounts = new Map<string, number>()

  ALL_SESSIONS.forEach((session) => {
    if (savedIds.has(session.id) && session.intentTags) {
      session.intentTags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    }
  })

  // Return tags sorted by frequency
  return Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)
}

/**
 * Score a session template based on user patterns
 */
function scoreSession(
  session: SessionTemplate,
  inputs: RecommendationInputs
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // 1. Experience level filter (hard requirement)
  if (session.recommendedAfterHours > inputs.totalHours) {
    return { score: -1, reasons: ['Experience level too high'] }
  }

  // 2. Already saved? Exclude
  if (inputs.savedTemplateIds.has(session.id)) {
    return { score: -1, reasons: ['Already saved'] }
  }

  // 3. Discipline match (0-30 points)
  if (session.discipline && inputs.disciplineFrequency.has(session.discipline)) {
    const frequency = inputs.disciplineFrequency.get(session.discipline)!
    const disciplineScore = Math.min(frequency * 5, 30)
    score += disciplineScore
    if (disciplineScore > 15) {
      reasons.push(`Matches your ${session.discipline} practice`)
    }
  }

  // 4. Intent tag overlap (0-25 points)
  if (session.intentTags && inputs.savedIntentTags.length > 0) {
    const overlap = session.intentTags.filter((t) => inputs.savedIntentTags.includes(t)).length
    const intentScore = Math.min(overlap * 8, 25)
    score += intentScore
    if (overlap > 0) {
      reasons.push(`Aligns with your interests`)
    }
  }

  // 5. Time of day match (0-15 points)
  const timeMatch = matchTimeOfDay(session.bestTime, inputs.timeOfDayPattern)
  if (timeMatch) {
    score += 15
    reasons.push(`Great for ${inputs.timeOfDayPattern} practice`)
  }

  // 6. Community validation boost (0-20 points)
  // Higher karma + saves = more validated content
  const validationScore = Math.min(Math.sqrt(session.karma) + Math.sqrt(session.saves), 20)
  score += validationScore

  // 7. Slight randomness for variety (0-10 points)
  score += Math.random() * 10

  return { score, reasons }
}

/**
 * Check if session's best time matches user's pattern
 */
function matchTimeOfDay(bestTime: string, pattern: string): boolean {
  const lower = bestTime.toLowerCase()

  if (pattern === 'morning' && lower.includes('morning')) return true
  if (pattern === 'midday' && (lower.includes('midday') || lower.includes('afternoon'))) return true
  if (pattern === 'evening' && lower.includes('evening')) return true
  if (pattern === 'night' && (lower.includes('night') || lower.includes('sleep'))) return true
  if (lower.includes('anytime')) return true

  return false
}

/**
 * Get the top recommended meditation for a user
 */
export async function getRecommendedMeditation(): Promise<SessionRecommendation | null> {
  const inputs = await analyzeUserPatterns()

  // Score all sessions
  const scored = ALL_SESSIONS.map((session) => {
    const { score, reasons } = scoreSession(session, inputs)
    return { session, score, reasons }
  })
    .filter((s) => s.score >= 0) // Remove excluded sessions
    .sort((a, b) => b.score - a.score)

  if (scored.length === 0) return null

  const top = scored[0]
  return {
    session: top.session,
    score: top.score,
    reason: top.reasons[0] || 'Recommended for you',
  }
}

/**
 * Get a meditation recommendation based on just-completed session
 * Used for post-session suggestions
 */
export function getRelatedMeditation(
  completedDiscipline: string,
  totalHours: number,
  savedIds: Set<string>
): SessionTemplate | null {
  // Find sessions with same discipline or related intent tags
  const candidates = ALL_SESSIONS.filter((s) => {
    if (s.recommendedAfterHours > totalHours) return false
    if (savedIds.has(s.id)) return false
    return s.discipline === completedDiscipline
  })

  if (candidates.length === 0) return null

  // Return random from candidates for variety
  return candidates[Math.floor(Math.random() * candidates.length)]
}

/**
 * Get a time-appropriate meditation suggestion
 * Used for Timer tab when no plan exists
 */
export function getTimeBasedSuggestion(
  currentHour: number,
  totalHours: number,
  savedIds: Set<string>
): SessionTemplate | null {
  // Determine time period
  let timeKeyword: string
  if (currentHour >= 5 && currentHour < 12) timeKeyword = 'morning'
  else if (currentHour >= 12 && currentHour < 17) timeKeyword = 'midday'
  else if (currentHour >= 17 && currentHour < 21) timeKeyword = 'evening'
  else timeKeyword = 'sleep'

  // Find matching sessions
  const candidates = ALL_SESSIONS.filter((s) => {
    if (s.recommendedAfterHours > totalHours) return false
    if (savedIds.has(s.id)) return false
    const lower = s.bestTime.toLowerCase()
    return lower.includes(timeKeyword) || lower.includes('anytime')
  })

  if (candidates.length === 0) return null

  // Return highest karma for quality
  candidates.sort((a, b) => b.karma - a.karma)
  return candidates[0]
}

/**
 * Check if a recommendation should refresh
 * Returns true if more than 7 days since last recommendation
 */
export function shouldRefreshRecommendation(lastRecommendedAt: number | null): boolean {
  if (!lastRecommendedAt) return true
  const weekMs = 7 * 24 * 60 * 60 * 1000
  return Date.now() - lastRecommendedAt > weekMs
}
