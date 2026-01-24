/**
 * Database Types
 *
 * All interface and type definitions for the meditation database.
 */

import type { NotificationPreferences } from '../notifications'

// Session type distinguishes meditation from practice tools
export type SessionType = 'meditation' | 'practice'

// Practice tool identifiers
export type PracticeToolId = 'om-coach' | 'racing-mind' | 'posture-training'

// Aum Coach specific metrics
export interface OmCoachMetrics {
  completedCycles: number
  averageAlignmentScore: number // Legacy: now stores coherence score
  vocalizationSeconds: number
  // Enhanced metrics (v2) - for adaptive algorithm
  sessionMedianFrequency?: number // User's natural pitch this session
  avgPitchStabilityScore?: number // 0-100
  avgAmplitudeSmoothnessScore?: number // 0-100
  avgVoicingContinuityScore?: number // 0-100
  rawPitchVarianceCents?: number // Raw variance for threshold adaptation
  rawAmplitudeCV?: number // Raw CV for threshold adaptation
}

// Racing Mind specific metrics (self-assessment + eye tracking)
export interface RacingMindMetrics {
  // Self-assessment scores (1-10 scale)
  preSessionMindScore?: number
  postSessionMindScore?: number
  // Eye tracking metrics (if supported on device)
  eyeTrackingEnabled?: boolean
  trackingAccuracy?: number // 0-100
  saccadeCount?: number
  improvementPercent?: number // First half vs second half smoothness
}

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
  // Session type for practice vs meditation (added in v16)
  sessionType?: SessionType
  // Practice tool identifier (when sessionType === 'practice')
  practiceToolId?: PracticeToolId
  // Aum Coach specific metrics (when practiceToolId === 'om-coach')
  omCoachMetrics?: OmCoachMetrics
  // Racing Mind specific metrics (when practiceToolId === 'racing-mind')
  racingMindMetrics?: RacingMindMetrics
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

// Theme modes - simple light/dark/auto
export type ThemeMode = 'auto' | 'light' | 'dark'

// Legacy types kept for migration - will be removed after all users migrate
type LegacyThemeMode =
  | 'neutral-auto'
  | 'neutral-light'
  | 'neutral-dark'
  | 'living-auto'
  | 'living-manual'
  | 'manual'
export type ThemeModeWithLegacy = ThemeMode | LegacyThemeMode

// These types will be removed in Phase 4 cleanup
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type SeasonOverride = Season | 'neutral'
export type TimeOverride = 'morning' | 'daytime' | 'evening' | 'night'

export interface UserSettings {
  id: 1
  hideTimeDisplay: boolean
  skipInsightCapture: boolean // Skip post-session insight recording prompt
  themeMode: ThemeModeWithLegacy // Uses legacy type for migration compatibility
  audioFeedbackEnabled: boolean // Play subtle sounds on complete/milestone
  notificationPreferences: NotificationPreferences // In-app notification settings
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
  // v7 additions for goal timer
  enforceGoal?: boolean // Auto-complete timer at duration
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

/**
 * User affinities for adaptive recommendations
 *
 * Weights drift from 1.0 (neutral) based on implicit feedback.
 * Range: 0.5 (strong negative) to 1.5 (strong positive)
 * Used to modulate recommendation scores.
 */
export interface UserAffinities {
  id: 1 // Singleton

  // Tag affinities - all intent_tags from sessions.json
  tags: {
    focus?: number
    sleep?: number
    'body-awareness'?: number
    'self-compassion'?: number
    emotions?: number
    'letting-go'?: number
    morning?: number
    beginners?: number
    'racing-mind'?: number
    stress?: number
    'low-mood'?: number
    grief?: number
    evening?: number
    anger?: number
    pain?: number
    clarity?: number
    energy?: number
    calm?: number
    [key: string]: number | undefined // Allow additional tags
  }

  // Discipline affinities
  disciplines: {
    'Breath Awareness'?: number
    'Open Awareness'?: number
    'Body Scan'?: number
    'Loving-Kindness'?: number
    Vipassana?: number
    'Walking Meditation'?: number
    Zen?: number
    [key: string]: number | undefined // Allow additional disciplines
  }

  // Time-of-day affinities
  timeSlots: {
    morning?: number
    midday?: number
    evening?: number
    night?: number
  }

  // Duration bucket affinities
  durationBuckets: {
    short?: number // 5-10 min
    medium?: number // 15-20 min
    long?: number // 30+ min
  }

  // Tracking metadata
  lastDecayAt: number // For weekly decay
  totalFeedbackEvents: number
}

// Purchase record for hour bank
export interface PurchaseRecord {
  productId: string
  transactionId: string
  hours: number
  purchasedAt: number
}

// Hour bank for consumption-based pricing
export interface HourBank {
  id: 1 // Singleton
  totalPurchasedHours: number // Total hours ever purchased
  totalConsumedHours: number // Total hours consumed by sessions
  availableHours: number // Hours remaining (purchased - consumed)
  isLifetime: boolean // True if user has lifetime access
  lastPurchaseAt: number | null // Timestamp of most recent purchase
  purchases: PurchaseRecord[] // Purchase history
}

// Authorization status from FamilyControls
export type MeditationLockAuthorizationStatus = 'authorized' | 'denied' | 'notDetermined'

// Accountability method options
export type AccountabilityMethod = 'sms' | 'whatsapp' | 'choose'

// Reminder style options
export type ReminderStyle = 'motivational' | 'simple' | 'custom'

// Obstacle with coping response
export interface MeditationLockObstacle {
  obstacle: string
  copingResponse: string
}

// Schedule window for blocking
export interface MeditationLockScheduleWindow {
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
}

// Meditation Lock settings (singleton table)
export interface MeditationLockSettings {
  id: 1 // Singleton
  enabled: boolean
  authorizationStatus: MeditationLockAuthorizationStatus
  activationDate: number // Fresh start timestamp

  // Identity Framing
  identityStatement: string
  whyItMatters: string | null

  // Implementation Intentions (Anchor)
  anchorRoutine: string
  anchorLocation: string
  anchorTimeHour: number
  anchorTimeMinute: number
  backupAnchor: string | null
  backupAnchorTimeHour: number | null
  backupAnchorTimeMinute: number | null

  // Commitment & Tiny Habits
  unlockDurationMinutes: number // 5, 10, 12, 15, 20, 30, 45, 60
  minimumFallbackMinutes: number // 2, 3, 5
  celebrationRitual: string | null

  // Obstacle Anticipation
  obstacles: MeditationLockObstacle[]

  // Accountability
  accountabilityEnabled: boolean
  accountabilityPhone: string | null
  accountabilityMethod: AccountabilityMethod
  notifyOnCompletion: boolean
  notifyOnSkip: boolean

  // Apps & Schedule
  blockedAppTokens: string[]
  scheduleWindows: MeditationLockScheduleWindow[]
  activeDays: boolean[] // [Sun...Sat]

  // Forgiveness & Safety
  streakFreezesPerMonth: number
  streakFreezesRemaining: number
  gracePeriodMinutes: number | null
  safetyAutoUnlockHours: number | null
  lastFreezeResetAt: number | null // Timestamp of last monthly freeze reset

  // Reminders
  reminderEnabled: boolean
  reminderMinutesBefore: number
  reminderStyle: ReminderStyle
  customReminderMessage: string | null

  // Analytics
  totalUnlocks: number
  totalSkipsUsed: number
  totalHardDayFallbacks: number
  lastUnlockAt: number | null
  streakDays: number
  completionsByDayOfWeek: number[] // [Sun...Sat] — which days are hardest
}
