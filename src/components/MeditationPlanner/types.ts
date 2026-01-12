/**
 * MeditationPlanner Types
 */

import type { Session, PlannedSession } from '../../lib/db'

// Types for unified session/plan handling in the carousel view
export type DayItemType = 'session' | 'plan'

export interface DayItem {
  type: DayItemType
  id: string // session.uuid or `plan-${plan.id}`
  session?: Session
  plan?: PlannedSession
  timestamp: number // For sorting: session.startTime or plan date + plannedTime
}

export interface MeditationPlannerProps {
  date: Date
  sessions: Session[] // All sessions for this date (may be empty for future dates)
  onClose: () => void
  onSave: () => void
}

// Track edits for each session independently
export interface SessionEdits {
  pose: string
  discipline: string
  notes: string
}

// Raw extracted session type (snake_case from JSON)
export interface ExtractedSession {
  id: string
  title: string
  tagline: string
  hero_gradient: string
  duration_guidance: string
  discipline: string
  posture: string
  best_time: string
  environment?: string
  guidance_notes: string
  intention: string
  recommended_after_hours: number
  tags?: string[]
  karma: number
  saves: number
  completions: number
  creator_hours: number
  course_id?: string
  course_position?: number
}
