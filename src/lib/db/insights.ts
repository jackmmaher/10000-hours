/**
 * Insight Helpers
 *
 * CRUD operations for meditation insights/reflections.
 */

import { db } from './schema'
import type { Insight } from './types'

export async function addInsight(data: {
  sessionId?: string | null
  rawText: string
  formattedText?: string | null
}): Promise<Insight> {
  const insight: Insight = {
    id: crypto.randomUUID(),
    sessionId: data.sessionId ?? null,
    rawText: data.rawText,
    formattedText: data.formattedText ?? null,
    sharedPearlId: null,
    createdAt: new Date(),
    updatedAt: null,
  }
  await db.insights.add(insight)
  return insight
}

// Update an insight's text (for editing after voice capture)
export async function updateInsight(
  id: string,
  updates: { rawText?: string; formattedText?: string | null }
): Promise<void> {
  await db.insights.update(id, {
    ...updates,
    updatedAt: new Date(),
  })
}

// Link insight to a shared pearl
export async function linkInsightToPearl(insightId: string, pearlId: string): Promise<void> {
  await db.insights.update(insightId, { sharedPearlId: pearlId })
}

export async function getInsights(): Promise<Insight[]> {
  return db.insights.orderBy('createdAt').reverse().toArray()
}

// Get only insights that have content (for My Insights view)
export async function getInsightsWithContent(): Promise<Insight[]> {
  const insights = await db.insights.orderBy('createdAt').reverse().toArray()
  return insights.filter((i) => i.rawText && i.rawText.trim().length > 0)
}

export async function getInsightById(id: string): Promise<Insight | undefined> {
  return db.insights.get(id)
}

export async function deleteInsight(id: string): Promise<void> {
  await db.insights.delete(id)
}

export async function markInsightAsShared(insightId: string, pearlId: string): Promise<void> {
  await db.insights.update(insightId, {
    sharedPearlId: pearlId,
    updatedAt: new Date(),
  })
}

export async function getUnsharedInsights(): Promise<Insight[]> {
  return db.insights
    .filter((insight) => insight.sharedPearlId === null)
    .reverse()
    .sortBy('createdAt')
}

export async function getSharedInsights(): Promise<Insight[]> {
  return db.insights
    .filter((insight) => insight.sharedPearlId !== null)
    .reverse()
    .sortBy('createdAt')
}

export async function getInsightsBySessionId(sessionId: string): Promise<Insight[]> {
  return db.insights.where('sessionId').equals(sessionId).toArray()
}

export async function getLatestInsight(): Promise<Insight | undefined> {
  return db.insights.orderBy('createdAt').reverse().first()
}
