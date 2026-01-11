/**
 * App State Helpers
 *
 * Functions for managing application state (enlightenment tracking).
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
  await db.appState.put({
    id: 'main',
    hasReachedEnlightenment: true,
    enlightenmentReachedAt: Date.now(),
  })
}
