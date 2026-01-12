/**
 * Data Export Utilities
 *
 * Exports user's meditation data in a clean, usable format.
 * Focus: Practice history + reflections, wellbeing tracking.
 *
 * This is their data - they should be able to take it with them.
 */

import JSZip from 'jszip'
import {
  getAllSessions,
  getInsights,
  getAllWellbeingDimensions,
  getAllCheckIns,
  type Insight,
} from './db'

// ============================================================================
// Formatting Helpers
// ============================================================================

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function escapeCSV(value: string | undefined | null): string {
  if (!value) return ''
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  const escaped = value.replace(/"/g, '""')
  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
    return `"${escaped}"`
  }
  return escaped
}

function formatPosture(pose: string | undefined): string {
  if (!pose) return ''
  // Convert kebab-case to readable format
  const postureMap: Record<string, string> = {
    'seated-cushion': 'Seated (Cushion)',
    'seated-chair': 'Seated (Chair)',
    lying: 'Lying Down',
    walking: 'Walking',
    varies: 'Varies',
  }
  return postureMap[pose] || pose
}

function formatTechnique(discipline: string | undefined): string {
  if (!discipline) return ''
  // Convert to readable format
  const techniqueMap: Record<string, string> = {
    open: 'Open Awareness',
    breath: 'Breath Awareness',
    vipassana: 'Vipassana',
    zen: 'Zen',
    'loving-kindness': 'Loving-Kindness',
    'body-scan': 'Body Scan',
    varies: 'Varies',
  }
  return techniqueMap[discipline] || discipline
}

// ============================================================================
// Meditation Journal Export
// ============================================================================

interface JournalEntry {
  date: string
  time: string
  duration: string
  posture: string
  technique: string
  notes: string
  reflection: string
}

async function buildMeditationJournal(): Promise<JournalEntry[]> {
  const sessions = await getAllSessions()
  const insights = await getInsights()

  // Create a map of session UUID to insights
  const insightsBySession = new Map<string, Insight[]>()
  for (const insight of insights) {
    if (insight.sessionId) {
      const existing = insightsBySession.get(insight.sessionId) || []
      existing.push(insight)
      insightsBySession.set(insight.sessionId, existing)
    }
  }

  // Sort sessions by date (newest first for export)
  const sortedSessions = [...sessions].sort((a, b) => b.startTime - a.startTime)

  return sortedSessions.map((session) => {
    // Get linked insights for this session
    const linkedInsights = insightsBySession.get(session.uuid) || []
    const reflectionText = linkedInsights
      .map((i) => i.rawText)
      .filter(Boolean)
      .join(' | ')

    return {
      date: formatDate(session.startTime),
      time: formatTime(session.startTime),
      duration: formatDuration(session.durationSeconds),
      posture: formatPosture(session.pose),
      technique: formatTechnique(session.discipline),
      notes: session.notes || '',
      reflection: reflectionText,
    }
  })
}

function journalToCSV(entries: JournalEntry[]): string {
  const headers = ['Date', 'Time', 'Duration', 'Posture', 'Technique', 'Notes', 'Reflection']

  const rows = entries.map((entry) =>
    [
      escapeCSV(entry.date),
      escapeCSV(entry.time),
      escapeCSV(entry.duration),
      escapeCSV(entry.posture),
      escapeCSV(entry.technique),
      escapeCSV(entry.notes),
      escapeCSV(entry.reflection),
    ].join(',')
  )

  return [headers.join(','), ...rows].join('\n')
}

// ============================================================================
// Wellbeing Tracking Export
// ============================================================================

interface WellbeingEntry {
  date: string
  tracking: string
  score: number
  note: string
}

async function buildWellbeingData(): Promise<WellbeingEntry[]> {
  const dimensions = await getAllWellbeingDimensions()
  const checkIns = await getAllCheckIns()

  if (checkIns.length === 0) {
    return []
  }

  // Create a map of dimension ID to label
  const dimensionLabels = new Map<string, string>()
  for (const dim of dimensions) {
    dimensionLabels.set(dim.id, dim.label)
  }

  // Sort by date (newest first)
  const sortedCheckIns = [...checkIns].sort((a, b) => b.createdAt - a.createdAt)

  return sortedCheckIns.map((checkIn) => ({
    date: formatDate(checkIn.createdAt),
    tracking: dimensionLabels.get(checkIn.dimensionId) || 'Unknown',
    score: checkIn.score,
    note: checkIn.note || '',
  }))
}

function wellbeingToCSV(entries: WellbeingEntry[]): string {
  const headers = ['Date', 'Tracking', 'Score (1-10)', 'Note']

  const rows = entries.map((entry) =>
    [
      escapeCSV(entry.date),
      escapeCSV(entry.tracking),
      entry.score.toString(),
      escapeCSV(entry.note),
    ].join(',')
  )

  return [headers.join(','), ...rows].join('\n')
}

// ============================================================================
// Export Functions
// ============================================================================

export async function exportData(): Promise<{ hasWellbeing: boolean }> {
  const journal = await buildMeditationJournal()
  const wellbeing = await buildWellbeingData()

  const journalCSV = journalToCSV(journal)
  const hasWellbeing = wellbeing.length > 0

  const zip = new JSZip()

  // Always include meditation journal
  zip.file('meditation-journal.csv', journalCSV)

  // Only include wellbeing if user has data
  if (hasWellbeing) {
    const wellbeingCSV = wellbeingToCSV(wellbeing)
    zip.file('wellbeing-tracking.csv', wellbeingCSV)
  }

  // Generate and download ZIP
  const blob = await zip.generateAsync({ type: 'blob' })
  const date = new Date().toISOString().split('T')[0]
  downloadBlob(blob, `meditation-data-${date}.zip`)

  return { hasWellbeing }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ============================================================================
// Summary for UI
// ============================================================================

export interface ExportSummary {
  sessionCount: number
  insightCount: number
  wellbeingCheckInCount: number
  dateRange: { first: string; last: string } | null
}

export async function getExportSummary(): Promise<ExportSummary> {
  const sessions = await getAllSessions()
  const insights = await getInsights()
  const checkIns = await getAllCheckIns()

  let dateRange: { first: string; last: string } | null = null

  if (sessions.length > 0) {
    const sorted = [...sessions].sort((a, b) => a.startTime - b.startTime)
    dateRange = {
      first: formatDate(sorted[0].startTime),
      last: formatDate(sorted[sorted.length - 1].startTime),
    }
  }

  return {
    sessionCount: sessions.length,
    insightCount: insights.length,
    wellbeingCheckInCount: checkIns.length,
    dateRange,
  }
}
