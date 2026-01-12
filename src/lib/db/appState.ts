/**
 * App State Helpers
 *
 * Functions for managing application state:
 * - Enlightenment tracking (10,000 hours goal)
 * - Session-in-progress recovery (survives app kill/crash)
 */

import { db } from './schema'
import type { AppState } from './types'

export async function initAppState(): Promise<AppState> {
  let state = await db.appState.get('main')
  if (!state) {
    state = { id: 'main', hasReachedEnlightenment: false }
    await db.appState.put(state)
  }
  return state
}

export async function markEnlightenmentReached(): Promise<void> {
  const current = await db.appState.get('main')
  await db.appState.put({
    ...current,
    id: 'main',
    hasReachedEnlightenment: true,
    enlightenmentReachedAt: Date.now(),
  })
}

/**
 * Save session-in-progress to survive app kill/crash
 * Called when timer starts
 */
export async function saveSessionInProgress(sessionStartTime: number): Promise<void> {
  const current = await db.appState.get('main')
  await db.appState.put({
    ...current,
    id: 'main',
    hasReachedEnlightenment: current?.hasReachedEnlightenment ?? false,
    sessionInProgress: true,
    sessionStartTime,
  })
}

/**
 * Clear session-in-progress when timer stops normally
 */
export async function clearSessionInProgress(): Promise<void> {
  const current = await db.appState.get('main')
  await db.appState.put({
    ...current,
    id: 'main',
    hasReachedEnlightenment: current?.hasReachedEnlightenment ?? false,
    sessionInProgress: false,
    sessionStartTime: undefined,
  })
}

/**
 * Check for and recover an in-progress session after app restart
 * Returns the session start time if recovery is needed, null otherwise
 */
export async function getSessionInProgress(): Promise<number | null> {
  const state = await db.appState.get('main')
  if (state?.sessionInProgress && state.sessionStartTime) {
    return state.sessionStartTime
  }
  return null
}
