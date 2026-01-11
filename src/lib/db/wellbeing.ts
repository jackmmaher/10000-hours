/**
 * Wellbeing Helpers
 *
 * Functions for managing wellbeing tracking dimensions, check-ins, and settings.
 */

import { db } from './schema'
import type { WellbeingSettings, WellbeingDimension, WellbeingCheckIn } from './types'

// Wellbeing Settings helpers
export async function getWellbeingSettings(): Promise<WellbeingSettings> {
  let settings = await db.wellbeingSettings.get(1)
  if (!settings) {
    settings = {
      id: 1,
      checkInFrequencyDays: 14,
      isEnabled: false,
    }
    await db.wellbeingSettings.put(settings)
  }
  return settings
}

export async function updateWellbeingSettings(
  updates: Partial<Omit<WellbeingSettings, 'id'>>
): Promise<void> {
  await db.wellbeingSettings.update(1, updates)
}

// Wellbeing Dimension helpers
export async function addWellbeingDimension(data: {
  name: string
  label: string
  description?: string
  isCustom: boolean
}): Promise<WellbeingDimension> {
  const dimension: WellbeingDimension = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: Date.now(),
  }
  await db.wellbeingDimensions.add(dimension)
  return dimension
}

export async function getWellbeingDimensions(): Promise<WellbeingDimension[]> {
  return db.wellbeingDimensions.filter((d) => !d.archivedAt).toArray()
}

export async function getAllWellbeingDimensions(): Promise<WellbeingDimension[]> {
  return db.wellbeingDimensions.orderBy('createdAt').toArray()
}

export async function archiveWellbeingDimension(id: string): Promise<void> {
  await db.wellbeingDimensions.update(id, { archivedAt: Date.now() })
}

export async function restoreWellbeingDimension(id: string): Promise<void> {
  await db.wellbeingDimensions.update(id, { archivedAt: undefined })
}

// Wellbeing Check-in helpers
export async function addWellbeingCheckIn(data: {
  dimensionId: string
  score: number
  note?: string
}): Promise<WellbeingCheckIn> {
  const checkIn: WellbeingCheckIn = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: Date.now(),
  }
  await db.wellbeingCheckIns.add(checkIn)
  return checkIn
}

export async function getCheckInsForDimension(dimensionId: string): Promise<WellbeingCheckIn[]> {
  return db.wellbeingCheckIns.where('dimensionId').equals(dimensionId).reverse().sortBy('createdAt')
}

export async function getLatestCheckIns(): Promise<Map<string, WellbeingCheckIn>> {
  const dimensions = await getWellbeingDimensions()
  const latestMap = new Map<string, WellbeingCheckIn>()

  for (const dim of dimensions) {
    const latest = await db.wellbeingCheckIns
      .where('dimensionId')
      .equals(dim.id)
      .reverse()
      .sortBy('createdAt')
    if (latest.length > 0) {
      latestMap.set(dim.id, latest[0])
    }
  }

  return latestMap
}

export async function getAllCheckIns(): Promise<WellbeingCheckIn[]> {
  return db.wellbeingCheckIns.orderBy('createdAt').reverse().toArray()
}

export async function getCheckInHistory(
  dimensionId: string,
  limit?: number
): Promise<WellbeingCheckIn[]> {
  const query = db.wellbeingCheckIns.where('dimensionId').equals(dimensionId).reverse()

  const results = await query.sortBy('createdAt')
  return limit ? results.slice(0, limit) : results
}

// Calculate improvement percentage between first and latest check-in
export async function getImprovementForDimension(
  dimensionId: string
): Promise<{ first: number; latest: number; percentChange: number } | null> {
  const checkIns = await getCheckInsForDimension(dimensionId)
  if (checkIns.length < 2) return null

  const latest = checkIns[0]
  const first = checkIns[checkIns.length - 1]

  // Lower score is better (1-10 scale where 10 is worst)
  const percentChange = ((first.score - latest.score) / first.score) * 100

  return {
    first: first.score,
    latest: latest.score,
    percentChange: Math.round(percentChange),
  }
}
