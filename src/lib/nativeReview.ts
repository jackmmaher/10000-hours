/**
 * Native Review Service
 *
 * Handles App Store review prompting using native APIs.
 * Falls back to tracking only for web/PWA builds.
 *
 * Strategy:
 * - Prompt at "moments of pride" (milestone achievements, cycle completion)
 * - Respect iOS rate limiting (3x per year)
 * - Track when we've prompted to avoid over-asking
 */

import { Capacitor, registerPlugin } from '@capacitor/core'
import { db } from './db/schema'

// Native plugin interface for App Store review
interface NativeReviewPlugin {
  requestReview(): Promise<void>
}

// Register native plugin (implementation added to iOS/Android projects)
const NativeReview = registerPlugin<NativeReviewPlugin>('NativeReview')

// Review tracking storage key
const REVIEW_STORAGE_KEY = 'still_hours_review_tracking'

interface ReviewTracking {
  lastPromptedAt: number | null
  promptCount: number
  hasRated: boolean
  cyclesCompleted: number
  milestonesReached: number
}

// Minimum hours before first prompt
const MIN_HOURS_BEFORE_PROMPT = 1

// Minimum days between prompts
const MIN_DAYS_BETWEEN_PROMPTS = 30

// Prompt on specific milestones (hours)
const PROMPT_MILESTONES = [10, 100]

// Maximum lifetime prompts (cap to avoid pestering users)
const MAX_LIFETIME_PROMPTS = 3

/**
 * Check if we're on a native platform
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform()
}

/**
 * Get review tracking data
 */
async function getReviewTracking(): Promise<ReviewTracking> {
  try {
    const stored = localStorage.getItem(REVIEW_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.warn('[NativeReview] Failed to load tracking:', e)
  }

  return {
    lastPromptedAt: null,
    promptCount: 0,
    hasRated: false,
    cyclesCompleted: 0,
    milestonesReached: 0,
  }
}

/**
 * Save review tracking data
 */
async function saveReviewTracking(tracking: ReviewTracking): Promise<void> {
  try {
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(tracking))
  } catch (e) {
    console.warn('[NativeReview] Failed to save tracking:', e)
  }
}

/**
 * Get total meditation hours from database
 */
async function getTotalHours(): Promise<number> {
  const sessions = await db.sessions.toArray()
  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0)
  return totalSeconds / 3600
}

/**
 * Check if we should prompt for review based on conditions
 */
export async function shouldPromptForReview(
  justReachedMilestoneHours?: number,
  reachedPracticeGoal?: boolean
): Promise<boolean> {
  const tracking = await getReviewTracking()

  // Never prompt if user has already rated
  if (tracking.hasRated) return false

  // Cap at 3 lifetime prompts
  if (tracking.promptCount >= MAX_LIFETIME_PROMPTS) return false

  // Check time since last prompt
  if (tracking.lastPromptedAt) {
    const daysSinceLastPrompt = (Date.now() - tracking.lastPromptedAt) / (1000 * 60 * 60 * 24)
    if (daysSinceLastPrompt < MIN_DAYS_BETWEEN_PROMPTS) return false
  }

  // Get total hours
  const totalHours = await getTotalHours()

  // Must have minimum hours
  if (totalHours < MIN_HOURS_BEFORE_PROMPT) return false

  // Always prompt when user reaches their practice goal (moment of pride)
  if (reachedPracticeGoal) {
    return true
  }

  // Prompt on specific milestones (10h, 100h)
  if (justReachedMilestoneHours && PROMPT_MILESTONES.includes(justReachedMilestoneHours)) {
    return true
  }

  // Otherwise, don't interrupt
  return false
}

/**
 * Request native App Store review
 */
export async function requestNativeReview(): Promise<void> {
  const tracking = await getReviewTracking()

  // Update tracking
  tracking.lastPromptedAt = Date.now()
  tracking.promptCount++
  await saveReviewTracking(tracking)

  if (!isNativePlatform()) {
    console.log('[NativeReview] Skipping - not on native platform')
    return
  }

  try {
    await NativeReview.requestReview()
    console.log('[NativeReview] Review prompt requested')
  } catch (error) {
    console.warn('[NativeReview] Failed to request review:', error)
  }
}

/**
 * Mark that user has rated (called after successful review)
 */
export async function markAsRated(): Promise<void> {
  const tracking = await getReviewTracking()
  tracking.hasRated = true
  await saveReviewTracking(tracking)
}

/**
 * Increment cycle completion count
 */
export async function incrementCycleCompletion(): Promise<void> {
  const tracking = await getReviewTracking()
  tracking.cyclesCompleted++
  await saveReviewTracking(tracking)
}

/**
 * Increment milestone count
 */
export async function incrementMilestoneReached(): Promise<void> {
  const tracking = await getReviewTracking()
  tracking.milestonesReached++
  await saveReviewTracking(tracking)
}

/**
 * Get review tracking stats (for debugging/analytics)
 */
export async function getReviewStats(): Promise<ReviewTracking> {
  return getReviewTracking()
}
