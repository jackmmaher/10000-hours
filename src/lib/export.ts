/**
 * Data Export Utilities
 *
 * Allows users to export their meditation data in JSON or CSV format.
 * This is their data - they should be able to take it with them.
 */

import { getAllSessions, getInsights, Session, Insight } from './db'

interface ExportData {
  exportedAt: string
  version: string
  sessions: ExportSession[]
  insights: ExportInsight[]
  summary: {
    totalSessions: number
    totalMinutes: number
    totalHours: number
    firstSession: string | null
    lastSession: string | null
  }
}

interface ExportSession {
  date: string
  startTime: string
  endTime: string
  durationMinutes: number
  durationFormatted: string
  pose?: string
  discipline?: string
  notes?: string
}

interface ExportInsight {
  date: string
  text: string
  sessionDate?: string
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0]
}

function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toISOString()
}

function sessionToExport(session: Session): ExportSession {
  return {
    date: formatDate(session.startTime),
    startTime: formatDateTime(session.startTime),
    endTime: formatDateTime(session.endTime),
    durationMinutes: Math.round(session.durationSeconds / 60 * 10) / 10,
    durationFormatted: formatDuration(session.durationSeconds),
    pose: session.pose,
    discipline: session.discipline,
    notes: session.notes
  }
}

function insightToExport(insight: Insight, sessions: Session[]): ExportInsight {
  const linkedSession = insight.sessionId
    ? sessions.find(s => s.uuid === insight.sessionId)
    : null

  return {
    date: formatDateTime(insight.createdAt.getTime()),
    text: insight.rawText,
    sessionDate: linkedSession ? formatDate(linkedSession.startTime) : undefined
  }
}

export async function exportToJSON(): Promise<string> {
  const sessions = await getAllSessions()
  const insights = await getInsights()

  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0)
  const sortedSessions = [...sessions].sort((a, b) => a.startTime - b.startTime)

  const exportData: ExportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    sessions: sessions.map(sessionToExport),
    insights: insights.map(i => insightToExport(i, sessions)),
    summary: {
      totalSessions: sessions.length,
      totalMinutes: Math.round(totalSeconds / 60),
      totalHours: Math.round(totalSeconds / 3600 * 10) / 10,
      firstSession: sortedSessions[0] ? formatDate(sortedSessions[0].startTime) : null,
      lastSession: sortedSessions[sortedSessions.length - 1]
        ? formatDate(sortedSessions[sortedSessions.length - 1].startTime)
        : null
    }
  }

  return JSON.stringify(exportData, null, 2)
}

export async function exportToCSV(): Promise<string> {
  const sessions = await getAllSessions()

  // CSV Header
  const headers = ['Date', 'Start Time', 'End Time', 'Duration (minutes)', 'Duration', 'Pose', 'Discipline', 'Notes']

  // CSV Rows
  const rows = sessions.map(session => {
    const exported = sessionToExport(session)
    return [
      exported.date,
      exported.startTime,
      exported.endTime,
      exported.durationMinutes.toString(),
      exported.durationFormatted,
      exported.pose || '',
      exported.discipline || '',
      // Escape quotes and newlines in notes
      (exported.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')
    ].map(field => `"${field}"`).join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function downloadJSON(): Promise<void> {
  const json = await exportToJSON()
  const date = new Date().toISOString().split('T')[0]
  downloadFile(json, `meditation-data-${date}.json`, 'application/json')
}

export async function downloadCSV(): Promise<void> {
  const csv = await exportToCSV()
  const date = new Date().toISOString().split('T')[0]
  downloadFile(csv, `meditation-sessions-${date}.csv`, 'text/csv')
}
