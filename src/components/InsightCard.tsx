/**
 * InsightCard - Generated observations about practice patterns
 *
 * Generates contextual insights based on session data:
 * - Time patterns (morning vs evening)
 * - Consistency observations
 * - Growth trends
 * - Gentle suggestions
 *
 * Design: Insight over raw data
 */

import { useMemo } from 'react'
import { Session } from '../lib/db'
import { getStatsForWindow } from '../lib/calculations'

interface InsightCardProps {
  sessions: Session[]
}

type InsightType =
  | 'time_pattern'
  | 'consistency'
  | 'growth'
  | 'first_steps'
  | 'streak'
  | 'variety'

interface Insight {
  type: InsightType
  message: string
  detail?: string
}

function generateInsights(sessions: Session[]): Insight[] {
  const insights: Insight[] = []

  if (sessions.length === 0) {
    return [{
      type: 'first_steps',
      message: 'Your journey begins with a single breath.',
      detail: 'Start your first session whenever you\'re ready.'
    }]
  }

  if (sessions.length < 3) {
    return [{
      type: 'first_steps',
      message: 'The path is forming beneath your feet.',
      detail: `${sessions.length} session${sessions.length > 1 ? 's' : ''} in. Keep going.`
    }]
  }

  // Analyze time patterns
  const morningCount = sessions.filter(s => {
    const hour = new Date(s.startTime).getHours()
    return hour >= 5 && hour < 12
  }).length

  const eveningCount = sessions.filter(s => {
    const hour = new Date(s.startTime).getHours()
    return hour >= 17 && hour < 22
  }).length

  const morningRatio = morningCount / sessions.length
  const eveningRatio = eveningCount / sessions.length

  if (morningRatio > 0.6) {
    insights.push({
      type: 'time_pattern',
      message: 'You\'re a morning practitioner.',
      detail: `${Math.round(morningRatio * 100)}% of your meditations start before noon.`
    })
  } else if (eveningRatio > 0.6) {
    insights.push({
      type: 'time_pattern',
      message: 'Evening is your time for stillness.',
      detail: `${Math.round(eveningRatio * 100)}% of your meditations are in the evening.`
    })
  }

  // Analyze recent vs older sessions (growth)
  const recentStats = getStatsForWindow(sessions, 30)
  const olderStats = getStatsForWindow(
    sessions.filter(s => s.startTime < Date.now() - 30 * 24 * 60 * 60 * 1000),
    30
  )

  if (olderStats.sessionCount > 0 && recentStats.avgSessionMinutes > olderStats.avgSessionMinutes * 1.2) {
    const increase = Math.round(((recentStats.avgSessionMinutes - olderStats.avgSessionMinutes) / olderStats.avgSessionMinutes) * 100)
    insights.push({
      type: 'growth',
      message: 'Your meditations are getting longer.',
      detail: `Average meditation up ${increase}% compared to before.`
    })
  }

  // Analyze consistency
  const last7Days = new Set<string>()
  const now = Date.now()
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000

  sessions.forEach(s => {
    if (s.startTime >= weekAgo) {
      const date = new Date(s.startTime)
      last7Days.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`)
    }
  })

  const daysThisWeek = last7Days.size

  if (daysThisWeek >= 5) {
    insights.push({
      type: 'consistency',
      message: 'Strong week.',
      detail: `${daysThisWeek} days of practice in the last week.`
    })
  } else if (daysThisWeek >= 3) {
    insights.push({
      type: 'consistency',
      message: 'Building rhythm.',
      detail: `${daysThisWeek} days this week. Consistency compounds.`
    })
  }

  // Session length variety
  const durations = sessions.map(s => s.durationSeconds)
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
  const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length
  const stdDev = Math.sqrt(variance)

  if (stdDev < avgDuration * 0.2 && sessions.length > 5) {
    insights.push({
      type: 'variety',
      message: 'Consistent session lengths.',
      detail: 'You\'ve found your rhythm. Consider occasionally varying duration.'
    })
  }

  // If no specific insights, give a general one
  if (insights.length === 0) {
    const totalHours = sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 3600
    insights.push({
      type: 'growth',
      message: 'The practice continues.',
      detail: `${Math.round(totalHours * 10) / 10} hours of stillness accumulated.`
    })
  }

  return insights
}

export function InsightCard({ sessions }: InsightCardProps) {
  const insights = useMemo(() => generateInsights(sessions), [sessions])

  // Show the first (most relevant) insight
  const insight = insights[0]

  if (!insight) return null

  return (
    <div className="mb-8 bg-card/90 backdrop-blur-md border border-ink/5 shadow-sm rounded-xl p-5 relative overflow-hidden">
      {/* Subtle decorative element - uses accent color from Living Theme */}
      <div
        className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)'
        }}
      />

      <div className="relative">
        <p className="font-serif text-lg text-ink leading-relaxed">
          {insight.message}
        </p>
        {insight.detail && (
          <p className="text-sm text-ink/50 mt-2">
            {insight.detail}
          </p>
        )}
      </div>
    </div>
  )
}
