/**
 * Commitment Mode CRUD Operations
 *
 * Handles persistence for commitment mode configuration and tracking.
 * Uses a singleton pattern (id: 1) for the settings table.
 */

import { db } from './schema'
import type { CommitmentSettings, CommitmentDayLog, CommitmentHistory } from './types'

// ============================================================================
// Default Settings
// ============================================================================

/**
 * Get default commitment settings
 * Used when initializing for the first time
 */
export function getDefaultCommitmentSettings(): CommitmentSettings {
  return {
    id: 1,
    isActive: false,
    commitmentStartDate: 0,
    commitmentEndDate: 0,
    commitmentDuration: 30,

    // Schedule
    scheduleType: 'daily',
    customDays: undefined,
    flexibleTarget: undefined,
    windowType: 'anytime',
    windowStartHour: undefined,
    windowStartMinute: undefined,
    windowEndHour: undefined,
    windowEndMinute: undefined,
    minimumSessionMinutes: 10,

    // Forgiveness (3 per 30 days)
    gracePeriodCount: 3,
    gracePeriodUsed: 0,

    // End behavior
    endBehavior: 'auto-renew',

    // RNG (for deterministic rewards)
    rngSeed: 0,
    rngSequenceIndex: 0,

    // Analytics
    totalSessionsCompleted: 0,
    totalSessionsMissed: 0,
    totalBonusMinutesEarned: 0,
    totalPenaltyMinutesDeducted: 0,
    lastSessionDate: null,
  }
}

// ============================================================================
// Settings CRUD (Singleton)
// ============================================================================

/**
 * Get commitment settings
 * Returns existing settings or creates defaults if none exist
 */
export async function getCommitmentSettings(): Promise<CommitmentSettings> {
  const existing = await db.commitmentSettings.get(1)

  if (existing) {
    return existing
  }

  // Initialize with defaults
  const defaults = getDefaultCommitmentSettings()
  await db.commitmentSettings.put(defaults)
  return defaults
}

/**
 * Update commitment settings
 * Merges partial updates with existing settings
 */
export async function updateCommitmentSettings(
  updates: Partial<Omit<CommitmentSettings, 'id'>>
): Promise<CommitmentSettings> {
  // Ensure settings exist
  const current = await getCommitmentSettings()

  // Merge updates
  const updated: CommitmentSettings = {
    ...current,
    ...updates,
    id: 1, // Always keep singleton id
  }

  await db.commitmentSettings.put(updated)
  return updated
}

// ============================================================================
// Day Log CRUD
// ============================================================================

/**
 * Get day log for a specific date
 * @param date - Start of day timestamp
 */
export async function getCommitmentDayLog(date: number): Promise<CommitmentDayLog | undefined> {
  return db.commitmentDayLogs.where('date').equals(date).first()
}

/**
 * Get all day logs for the current commitment period
 */
export async function getCommitmentDayLogs(
  startDate: number,
  endDate: number
): Promise<CommitmentDayLog[]> {
  return db.commitmentDayLogs.where('date').between(startDate, endDate, true, true).toArray()
}

/**
 * Add or update a day log entry
 */
export async function addCommitmentDayLog(log: Omit<CommitmentDayLog, 'id'>): Promise<number> {
  // Check if log already exists for this date
  const existing = await getCommitmentDayLog(log.date)

  if (existing?.id) {
    // Update existing log
    await db.commitmentDayLogs.update(existing.id, log)
    return existing.id
  }

  // Add new log
  return db.commitmentDayLogs.add(log as CommitmentDayLog)
}

/**
 * Get count of completed sessions in date range
 */
export async function getCompletedSessionCount(
  startDate: number,
  endDate: number
): Promise<number> {
  return db.commitmentDayLogs
    .where('date')
    .between(startDate, endDate, true, true)
    .filter((log) => log.outcome === 'completed')
    .count()
}

// ============================================================================
// History CRUD
// ============================================================================

/**
 * Get all commitment history (past commitments)
 */
export async function getCommitmentHistory(): Promise<CommitmentHistory[]> {
  return db.commitmentHistory.orderBy('startDate').reverse().toArray()
}

/**
 * Archive a completed or exited commitment
 */
export async function archiveCommitment(history: Omit<CommitmentHistory, 'id'>): Promise<number> {
  return db.commitmentHistory.add(history as CommitmentHistory)
}

/**
 * Get the most recent archived commitment
 */
export async function getLastCommitment(): Promise<CommitmentHistory | undefined> {
  return db.commitmentHistory.orderBy('startDate').reverse().first()
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Reset commitment settings to defaults (for emergency exit or completion)
 * Does NOT delete history or day logs
 */
export async function resetCommitmentSettings(): Promise<CommitmentSettings> {
  const defaults = getDefaultCommitmentSettings()
  await db.commitmentSettings.put(defaults)
  return defaults
}

/**
 * Clear all commitment day logs for the current period
 * Called when archiving a commitment
 */
export async function clearCommitmentDayLogs(): Promise<void> {
  await db.commitmentDayLogs.clear()
}
