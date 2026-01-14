/**
 * Database Types
 *
 * All interface and type definitions for the meditation database.
 */

import type { NotificationPreferences } from '../notifications'

export interface Session {
  id?: number
  uuid: string
  startTime: number // Unix timestamp (ms)
  endTime: number // Unix timestamp (ms)
  durationSeconds: number
  // Per-session metadata (added in v7)
  pose?: string // Seating position/pose
  discipline?: string // Meditation technique
  notes?: string // Intention or notes for this session
}

export interface AppState {
  id: string
  hasReachedEnlightenment: boolean // True once 10,000 hours reached
  enlightenmentReachedAt?: number // Timestamp when crossed threshold
  // Session-in-progress recovery (survives app kill/crash)
  sessionInProgress?: boolean
  sessionStartTime?: number // Date.now() wall-clock when session started
}

export type TierType = 'free' | 'premium'

export interface Achievement {
  hours: number // Milestone value (2, 5, 10, 25, etc.)
  achievedAt: number // Timestamp when achieved
  name: string // Display name ("2 hours", "5 hours", etc.)
}

export interface UserProfile {
  id: 1
  tier: TierType
  premiumExpiryDate?: number // When premium subscription expires
  originalPurchaseDate?: number // First purchase date
  firstSessionDate?: number // For Day 31 trigger calculation
  trialExpired: boolean // Has seen Day 31 banner
  trialEndDate?: number // When trial ended (for adaptive goal)
  achievements?: Achievement[] // Recorded milestone achievements
}

// Theme modes - neutral is default, living is optional override
export type ThemeMode =
  | 'neutral-auto' // Follow system light/dark preference (NEW DEFAULT)
  | 'neutral-light' // Always light
  | 'neutral-dark' // Always dark
  | 'living-auto' // Solar-based seasonal (was 'auto')
  | 'living-manual' // Fixed season + time (was 'manual')
  // Legacy values for migration (will be converted on load)
  | 'auto'
  | 'manual'

export type VisualEffects = 'calm' | 'expressive'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter' // For living theme (no neutral)
export type SeasonOverride = Season | 'neutral' // Includes neutral for backward compat
export type TimeOverride = 'morning' | 'daytime' | 'evening' | 'night'

export interface UserSettings {
  id: 1
  hideTimeDisplay: boolean
  skipInsightCapture: boolean // Skip post-session insight recording prompt
  themeMode: ThemeMode
  visualEffects: VisualEffects
  audioFeedbackEnabled: boolean // Play subtle sounds on complete/milestone
  notificationPreferences: NotificationPreferences // In-app notification settings
  // Manual theme overrides (only used when themeMode === 'manual')
  manualSeason?: SeasonOverride
  manualTime?: TimeOverride
  // Breath pacing settings (opt-in)
  breathPacingEnabled?: boolean
  breathPatternId?: string | null
  breathHapticsEnabled?: boolean
}

export interface Insight {
  id: string
  sessionId: string | null
  rawText: string
  formattedText: string | null
  sharedPearlId: string | null // Links to Supabase pearl if shared
  createdAt: Date
  updatedAt: Date | null
}

export interface PlannedSession {
  id?: number
  date: number // Date timestamp (start of day)
  plannedTime?: string // "07:30" format
  duration?: number // Planned duration in minutes
  title?: string // Session title (e.g., "First Breath Awakening")
  pose?: string // Seating position/pose
  discipline?: string // Meditation discipline (e.g., "Vipassana", "Zen")
  notes?: string // Guidance notes
  createdAt: number
  completed?: boolean // Marked when session is done
  // v6 additions for session linking
  linkedSessionUuid?: string // Link to actual Session when completed
  sourceTemplateId?: string // If adopted from community template
  courseId?: string // If part of a course
  coursePosition?: number // Position in course (1 of 5)
  repeatRuleId?: number // Link to repeat rule that generated this session
  attachedPearlId?: string // Supabase pearl ID attached as intention/guidance
}

export interface UserCourseProgress {
  id: string // UUID
  courseId: string // References Supabase course
  sessionsCompleted: number[] // Array of completed session positions
  startedAt: number // Timestamp when course started
  lastActivityAt: number // Last activity timestamp
  status: 'active' | 'paused' | 'completed'
}

export interface SavedTemplate {
  id: string // UUID
  templateId: string // References Supabase session_template
  savedAt: number // Timestamp when saved
}

// Pearl draft - work in progress before posting to community
export interface PearlDraft {
  id: string // UUID
  insightId: string // Source insight
  text: string // Draft pearl text (≤280 chars)
  createdAt: number // When draft started
  updatedAt: number // Last edit
}

// Template draft - work in progress before publishing to community
export interface TemplateDraft {
  id: string // Always 'current' - only one draft at a time
  title: string
  tagline: string
  durationGuidance: string
  discipline: string
  posture: string
  bestTime: string
  environment: string
  guidanceNotes: string
  intention: string
  recommendedAfterHours: number
  intentTags: string[] // Intent-based tags for filtering
  createdAt: number
  updatedAt: number
}

// User profile preferences for meditation
export interface UserPreferences {
  id: 1
  displayName?: string
  avatarUrl?: string // URL or base64 data URI
  preferredPosture?: string // 'seated-cushion' | 'seated-chair' | 'lying' | 'walking' | 'varies'
  preferredDiscipline?: string // 'open' | 'breath' | 'vipassana' | 'zen' | 'loving-kindness' | 'body-scan' | 'varies'
  preferredDuration?: string // '5-10' | '15-20' | '30+' | 'varies'
  preferredTime?: string // 'morning' | 'afternoon' | 'evening' | 'varies'
  /**
   * User's practice goal in hours.
   * - undefined/null = infinite mode (no ceiling, milestones continue forever)
   * - number = specific goal (25, 50, 100, etc.)
   */
  practiceGoalHours?: number
  updatedAt: number
}

// Wellbeing dimension being tracked
export interface WellbeingDimension {
  id: string // UUID
  name: string // 'anxiety' | 'stress' | 'low-mood' | custom
  label: string // Display label (e.g., "Anxiety", "Work Stress")
  description?: string // Optional description
  isCustom: boolean // True if user-defined
  createdAt: number
  archivedAt?: number // Soft delete - when user stops tracking
}

// A single check-in entry for a dimension
export interface WellbeingCheckIn {
  id: string // UUID
  dimensionId: string // References WellbeingDimension
  score: number // 1-10 scale
  note?: string // Optional journal note
  createdAt: number
}

// Wellbeing tracking settings
export interface WellbeingSettings {
  id: 1
  checkInFrequencyDays: number // 7-30, how often to prompt
  lastCheckInPrompt?: number // Timestamp of last prompt
  nextCheckInDue?: number // When next check-in is due
  isEnabled: boolean // Master toggle for wellbeing tracking
}

// Repeat rule frequency options
export type RepeatFrequency = 'daily' | 'weekly' | 'weekdays' | 'custom'

// Repeat rule for recurring planned sessions
export interface RepeatRule {
  id?: number
  createdAt: number

  // Schedule
  frequency: RepeatFrequency
  customDays?: number[] // 0-6 for Sun-Sat if frequency is 'custom'
  endDate?: number // Optional end date timestamp

  // Session template - copied to each generated PlannedSession
  plannedTime?: string // "HH:MM"
  duration?: number
  title?: string
  pose?: string
  discipline?: string
  notes?: string
  sourceTemplateId?: string
  attachedPearlId?: string // Supabase pearl ID attached as intention/guidance
}
