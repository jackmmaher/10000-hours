/**
 * Deep Link Handler
 *
 * Handles stillhours:// deep links from the MeditationLock shield extension.
 *
 * Deep link format:
 * stillhours://lock-session?duration={minutes}&fallback={bool}&anchor={routine}
 */

import { addPlannedSession } from './db'
import type { PlannedSession } from './db'

export interface LockSessionParams {
  duration: number
  fallback: boolean
  anchor?: string
}

/**
 * Parse a stillhours://lock-session URL
 *
 * @param url The deep link URL
 * @returns Parsed parameters or null if invalid
 */
export function parseLockSessionUrl(url: string): LockSessionParams | null {
  try {
    // Check if it's a stillhours:// URL
    if (!url.startsWith('stillhours://')) {
      return null
    }

    // Check if it's a lock-session path
    if (!url.includes('lock-session')) {
      return null
    }

    // Parse URL parameters
    const queryStart = url.indexOf('?')
    if (queryStart === -1) {
      return null
    }

    const queryString = url.substring(queryStart + 1)
    const params = new URLSearchParams(queryString)

    // Duration is required
    const durationStr = params.get('duration')
    if (!durationStr) {
      return null
    }

    const duration = parseInt(durationStr, 10)
    if (isNaN(duration) || duration <= 0) {
      return null
    }

    // Fallback defaults to false
    const fallbackStr = params.get('fallback')
    const fallback = fallbackStr === 'true'

    // Anchor is optional
    const anchor = params.get('anchor') || undefined

    return {
      duration,
      fallback,
      anchor,
    }
  } catch (error) {
    console.error('[DeepLinkHandler] Failed to parse URL:', error)
    return null
  }
}

/**
 * Create a PlannedSession from lock session parameters
 *
 * @param params Lock session parameters from deep link
 * @returns The created PlannedSession
 */
export async function createLockSession(params: LockSessionParams): Promise<PlannedSession | null> {
  try {
    // Get today's date at start of day
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Create title based on fallback mode
    const title = params.fallback
      ? `${params.duration}-min flexibility session`
      : `${params.duration}-min lock session`

    // Create notes with anchor if provided
    const notes = params.anchor ? `After ${params.anchor}` : undefined

    // Note: We intentionally don't set plannedTime so the session remains
    // available for getNextPlannedSession() (which filters out plans where
    // plannedTime <= currentTime)
    const session = await addPlannedSession({
      date: today.getTime(),
      duration: params.duration,
      title,
      notes,
      enforceGoal: true,
    })

    console.debug('[DeepLinkHandler] Created lock session:', session)
    return session
  } catch (error) {
    console.error('[DeepLinkHandler] Failed to create lock session:', error)
    return null
  }
}
