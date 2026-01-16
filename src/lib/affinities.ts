/**
 * Adaptive Recommendation Affinities
 *
 * Self-learning recommendation engine that adapts to user behavior.
 * Uses implicit feedback signals to drift affinity weights.
 * All data stays local in IndexedDB - no AI/API calls.
 *
 * Feedback loop:
 * 1. User completes session → derive implicit feedback score
 * 2. Update affinities for session's attributes (discipline, tags, time, duration)
 * 3. Recommendations use affinities to modulate base scores
 * 4. Weekly decay prevents runaway weights
 */

import { getAllSessions, getPlannedSessionByLinkedUuid, type Session } from './db'
import type { UserAffinities } from './db/types'
import { getUserAffinities, saveUserAffinities } from './db/affinities'
import type { SessionTemplate } from './types'

// Constants
const LEARNING_RATE = 0.1
const MIN_AFFINITY = 0.5
const MAX_AFFINITY = 1.5
const DECAY_RATE = 0.05 // 5% pull toward neutral per week
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Get time slot from timestamp
 */
export function getTimeSlot(timestamp: number): 'morning' | 'midday' | 'evening' | 'night' {
  const hour = new Date(timestamp).getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'midday'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

/**
 * Get duration bucket from seconds
 */
export function getDurationBucket(durationSeconds: number): 'short' | 'medium' | 'long' {
  const minutes = durationSeconds / 60
  if (minutes < 12) return 'short' // 5-10 min range
  if (minutes < 25) return 'medium' // 15-20 min range
  return 'long' // 30+ min
}

/**
 * Parse duration bucket from session template's durationGuidance string
 * e.g., "5-10 mins" → "short", "15-20 mins" → "medium", "30+ mins" → "long"
 */
export function parseDurationBucket(durationGuidance: string): 'short' | 'medium' | 'long' {
  const lower = durationGuidance.toLowerCase()

  // Extract numbers from the string
  const numbers = lower.match(/\d+/g)?.map(Number) || []
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0

  // Check for "+" which indicates long
  if (lower.includes('+')) return 'long'

  // Classify based on max duration number
  if (maxNumber >= 25) return 'long'
  if (maxNumber >= 12) return 'medium'
  if (maxNumber > 0) return 'short'

  return 'medium' // default
}

/**
 * Calculate user's average session duration
 */
async function getUserAverageDuration(): Promise<number> {
  const sessions = await getAllSessions()
  if (sessions.length === 0) return 15 * 60 // Default 15 min in seconds

  const total = sessions.reduce((sum, s) => sum + s.durationSeconds, 0)
  return total / sessions.length
}

/**
 * Derive implicit feedback from session completion
 *
 * Returns a score from -1 to +1:
 * - Positive: session went well (completed, longer than average, saved, insight captured)
 * - Negative: session was abandoned early
 */
export async function deriveImplicitFeedback(
  session: Session,
  options?: {
    plannedDurationMinutes?: number
    savedAfter?: boolean
    insightCaptured?: boolean
  }
): Promise<number> {
  let score = 0
  const userAvgDuration = await getUserAverageDuration()

  // Completion rate (if planned duration available)
  if (options?.plannedDurationMinutes) {
    const plannedSeconds = options.plannedDurationMinutes * 60
    const completionRate = session.durationSeconds / plannedSeconds

    if (completionRate >= 0.9)
      score += 0.3 // Finished
    else if (completionRate < 0.5) score -= 0.5 // Quit early
  }

  // Longer than personal average = positive signal
  if (session.durationSeconds > userAvgDuration * 1.2) {
    score += 0.3
  }

  // Saved after session = strong positive
  if (options?.savedAfter) score += 1.0

  // Insight captured = engaged
  if (options?.insightCaptured) score += 0.5

  // Clamp to [-1, 1]
  return clamp(score, -1, 1)
}

/**
 * Update affinities based on session feedback
 *
 * Applies learning rate to drift weights toward user's taste.
 * Called after each session completion.
 */
export async function updateAffinities(
  session: Session,
  template: SessionTemplate | null,
  feedbackScore: number
): Promise<void> {
  const affinities = await getUserAffinities()
  const delta = feedbackScore * LEARNING_RATE

  // Update discipline affinity
  if (session.discipline) {
    const currentValue = affinities.disciplines[session.discipline] ?? 1.0
    affinities.disciplines[session.discipline] = clamp(
      currentValue + delta,
      MIN_AFFINITY,
      MAX_AFFINITY
    )
  }

  // Update intent tag affinities (from template)
  if (template?.intentTags) {
    template.intentTags.forEach((tag) => {
      const currentValue = affinities.tags[tag] ?? 1.0
      affinities.tags[tag] = clamp(currentValue + delta, MIN_AFFINITY, MAX_AFFINITY)
    })
  }

  // Update time-of-day affinity
  const timeSlot = getTimeSlot(session.startTime)
  const currentTimeValue = affinities.timeSlots[timeSlot] ?? 1.0
  affinities.timeSlots[timeSlot] = clamp(currentTimeValue + delta, MIN_AFFINITY, MAX_AFFINITY)

  // Update duration bucket affinity
  const bucket = getDurationBucket(session.durationSeconds)
  const currentBucketValue = affinities.durationBuckets[bucket] ?? 1.0
  affinities.durationBuckets[bucket] = clamp(currentBucketValue + delta, MIN_AFFINITY, MAX_AFFINITY)

  // Track feedback events
  affinities.totalFeedbackEvents++

  await saveUserAffinities(affinities)
}

/**
 * Update affinities for recommendation dismissal
 * Strong negative signal (-0.7) for the dismissed template's attributes
 */
export async function updateAffinitiesForDismissal(template: SessionTemplate): Promise<void> {
  const affinities = await getUserAffinities()
  const delta = -0.7 * LEARNING_RATE

  // Update discipline affinity
  if (template.discipline) {
    const currentValue = affinities.disciplines[template.discipline] ?? 1.0
    affinities.disciplines[template.discipline] = clamp(
      currentValue + delta,
      MIN_AFFINITY,
      MAX_AFFINITY
    )
  }

  // Update intent tag affinities
  if (template.intentTags) {
    template.intentTags.forEach((tag) => {
      const currentValue = affinities.tags[tag] ?? 1.0
      affinities.tags[tag] = clamp(currentValue + delta, MIN_AFFINITY, MAX_AFFINITY)
    })
  }

  // Update time-of-day affinity based on bestTime
  const lower = template.bestTime.toLowerCase()
  let timeSlot: 'morning' | 'midday' | 'evening' | 'night' | null = null
  if (lower.includes('morning')) timeSlot = 'morning'
  else if (lower.includes('midday') || lower.includes('afternoon')) timeSlot = 'midday'
  else if (lower.includes('evening')) timeSlot = 'evening'
  else if (lower.includes('night') || lower.includes('sleep')) timeSlot = 'night'

  if (timeSlot) {
    const currentTimeValue = affinities.timeSlots[timeSlot] ?? 1.0
    affinities.timeSlots[timeSlot] = clamp(currentTimeValue + delta, MIN_AFFINITY, MAX_AFFINITY)
  }

  // Update duration bucket affinity
  const bucket = parseDurationBucket(template.durationGuidance)
  const currentBucketValue = affinities.durationBuckets[bucket] ?? 1.0
  affinities.durationBuckets[bucket] = clamp(currentBucketValue + delta, MIN_AFFINITY, MAX_AFFINITY)

  affinities.totalFeedbackEvents++
  await saveUserAffinities(affinities)
}

/**
 * Update affinities for recommendation followed
 * Positive signal (+0.5) when user opens a recommended session
 */
export async function updateAffinitiesForFollow(template: SessionTemplate): Promise<void> {
  const affinities = await getUserAffinities()
  const delta = 0.5 * LEARNING_RATE

  // Update discipline affinity
  if (template.discipline) {
    const currentValue = affinities.disciplines[template.discipline] ?? 1.0
    affinities.disciplines[template.discipline] = clamp(
      currentValue + delta,
      MIN_AFFINITY,
      MAX_AFFINITY
    )
  }

  // Update intent tag affinities
  if (template.intentTags) {
    template.intentTags.forEach((tag) => {
      const currentValue = affinities.tags[tag] ?? 1.0
      affinities.tags[tag] = clamp(currentValue + delta, MIN_AFFINITY, MAX_AFFINITY)
    })
  }

  affinities.totalFeedbackEvents++
  await saveUserAffinities(affinities)
}

/**
 * Weekly decay - pulls all affinities toward neutral (1.0)
 * Prevents runaway weights and encourages exploration.
 * Should be called on app initialization.
 */
export async function decayAffinities(): Promise<void> {
  const affinities = await getUserAffinities()
  const now = Date.now()

  // Only decay once per week
  if (now - affinities.lastDecayAt < WEEK_MS) return

  // Decay function: pulls value toward 1.0 by DECAY_RATE
  const decay = (value: number): number => value * (1 - DECAY_RATE) + 1.0 * DECAY_RATE

  // Decay all tag affinities
  Object.keys(affinities.tags).forEach((tag) => {
    const value = affinities.tags[tag]
    if (value !== undefined) {
      affinities.tags[tag] = decay(value)
    }
  })

  // Decay all discipline affinities
  Object.keys(affinities.disciplines).forEach((d) => {
    const value = affinities.disciplines[d]
    if (value !== undefined) {
      affinities.disciplines[d] = decay(value)
    }
  })

  // Decay time slot affinities
  const timeSlots: Array<'morning' | 'midday' | 'evening' | 'night'> = [
    'morning',
    'midday',
    'evening',
    'night',
  ]
  timeSlots.forEach((t) => {
    const value = affinities.timeSlots[t]
    if (value !== undefined) {
      affinities.timeSlots[t] = decay(value)
    }
  })

  // Decay duration bucket affinities
  const buckets: Array<'short' | 'medium' | 'long'> = ['short', 'medium', 'long']
  buckets.forEach((b) => {
    const value = affinities.durationBuckets[b]
    if (value !== undefined) {
      affinities.durationBuckets[b] = decay(value)
    }
  })

  affinities.lastDecayAt = now
  await saveUserAffinities(affinities)
}

/**
 * Calculate standard deviation of an array of numbers
 */
function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2))
  const avgSquaredDiff = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length
  return Math.sqrt(avgSquaredDiff)
}

/**
 * Struggle signal type
 */
export interface StruggleSignal {
  type: 'early_exit' | 'duration_jump' | 'shallow_practice' | 'inconsistent_timing'
  detected: boolean
  context: string
}

/**
 * Detect patterns that indicate user might be struggling
 * Returns detected struggle signals for potential UI display
 */
export async function detectStruggles(): Promise<StruggleSignal[]> {
  const sessions = await getAllSessions()
  const signals: StruggleSignal[] = []

  // Filter to last 30 days
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  const recentSessions = sessions.filter((s) => s.startTime >= thirtyDaysAgo)

  if (recentSessions.length < 3) {
    return [] // Not enough data
  }

  // 1. Early exit pattern - check sessions that had planned durations
  const sessionsWithEarlyExit: Session[] = []
  for (const session of recentSessions) {
    const plan = await getPlannedSessionByLinkedUuid(session.uuid)
    if (plan?.duration) {
      const plannedSeconds = plan.duration * 60
      if (session.durationSeconds < plannedSeconds * 0.6) {
        sessionsWithEarlyExit.push(session)
      }
    }
  }
  if (sessionsWithEarlyExit.length >= 3) {
    signals.push({
      type: 'early_exit',
      detected: true,
      context: `${sessionsWithEarlyExit.length} recent sessions ended early`,
    })
  }

  // 2. Large duration jump (might hit "the wall")
  const avgDuration =
    recentSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / recentSessions.length
  // Sessions are sorted by startTime ascending, so most recent is last
  const lastSession = recentSessions[recentSessions.length - 1]
  if (lastSession && lastSession.durationSeconds > avgDuration * 1.5) {
    signals.push({
      type: 'duration_jump',
      detected: true,
      context: `Stepped up to ${Math.round(lastSession.durationSeconds / 60)} min (avg: ${Math.round(avgDuration / 60)} min)`,
    })
  }

  // 3. Shallow practice (high frequency, always short)
  const shortSessions = recentSessions.filter((s) => s.durationSeconds < 15 * 60)
  if (recentSessions.length >= 10 && shortSessions.length / recentSessions.length > 0.8) {
    signals.push({
      type: 'shallow_practice',
      detected: true,
      context: `${Math.round((shortSessions.length / recentSessions.length) * 100)}% of sessions under 15 min`,
    })
  }

  // 4. Inconsistent timing
  const hours = recentSessions.map((s) => new Date(s.startTime).getHours())
  const stdDev = calculateStdDev(hours)
  if (stdDev > 4) {
    signals.push({
      type: 'inconsistent_timing',
      detected: true,
      context: `Practice times vary widely (stddev: ${stdDev.toFixed(1)} hours)`,
    })
  }

  return signals.filter((s) => s.detected)
}

/**
 * Get affinity value for a tag, defaulting to 1.0 if not set
 */
export function getTagAffinity(affinities: UserAffinities, tag: string): number {
  return affinities.tags[tag] ?? 1.0
}

/**
 * Get affinity value for a discipline, defaulting to 1.0 if not set
 */
export function getDisciplineAffinity(affinities: UserAffinities, discipline: string): number {
  return affinities.disciplines[discipline] ?? 1.0
}

/**
 * Get affinity value for a time slot, defaulting to 1.0 if not set
 */
export function getTimeSlotAffinity(
  affinities: UserAffinities,
  timeSlot: 'morning' | 'midday' | 'evening' | 'night'
): number {
  return affinities.timeSlots[timeSlot] ?? 1.0
}

/**
 * Get affinity value for a duration bucket, defaulting to 1.0 if not set
 */
export function getDurationBucketAffinity(
  affinities: UserAffinities,
  bucket: 'short' | 'medium' | 'long'
): number {
  return affinities.durationBuckets[bucket] ?? 1.0
}

/**
 * Calculate average affinity for a list of tags
 */
export function getAverageTagAffinity(affinities: UserAffinities, tags: string[]): number {
  if (tags.length === 0) return 1.0
  const sum = tags.reduce((total, tag) => total + getTagAffinity(affinities, tag), 0)
  return sum / tags.length
}
