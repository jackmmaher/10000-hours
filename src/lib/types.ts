/**
 * Shared type definitions
 *
 * Types that are used across both lib/ and components/ live here.
 * This prevents circular dependencies where business logic imports from UI.
 */

/**
 * Session template for community-shared meditation sessions
 */
export interface SessionTemplate {
  id: string
  userId?: string  // Creator's user ID (null/undefined for seeded content)
  title: string
  tagline: string
  heroImageUrl?: string
  durationGuidance: string
  discipline: string
  posture: string
  bestTime: string
  environment?: string
  guidanceNotes: string
  intention: string
  recommendedAfterHours: number
  tags?: string[]
  intentTags?: string[]
  karma: number
  saves: number
  completions: number
  creatorHours: number
  creatorVoiceScore?: number  // Creator's global Voice score from Supabase
  courseId?: string
  coursePosition?: number
}
