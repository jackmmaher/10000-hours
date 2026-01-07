/**
 * Progress - Milestones, stats, and insight-driven history
 *
 * Redesigned stats page focused on:
 * - Milestone badges (horizontal scroll)
 * - Cumulative achievement display
 * - Trend visualization
 * - Generated insights (not raw data)
 * - Week consistency
 *
 * Removed: "The Long View" (fog of war principle)
 * Moved: Community karma/saves to Settings
 */

import { useMemo, useState } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useSwipe } from '../hooks/useSwipe'
import { getStatsForWindow } from '../lib/calculations'
import {
  formatTotalHours,
  formatDuration,
  formatShortMonthYear
} from '../lib/format'
import { AchievementGallery } from './AchievementGallery'
import { InsightCard } from './InsightCard'
import { TimeRangeSlider } from './TimeRangeSlider'
import { TrendChart } from './TrendChart'
import { InteractiveTimeline } from './InteractiveTimeline'

export function Progress() {
  const { sessions, totalSeconds, setView } = useSessionStore()
  const [selectedDays, setSelectedDays] = useState<number | null>(30)
  // Calculate max days based on first session
  const maxDays = useMemo(() => {
    if (sessions.length === 0) return 365
    const firstSession = Math.min(...sessions.map(s => s.startTime))
    const daysSince = Math.ceil((Date.now() - firstSession) / (24 * 60 * 60 * 1000))
    return Math.max(7, daysSince)
  }, [sessions])

  // Compute stats for selected range
  const windowStats = useMemo(
    () => getStatsForWindow(sessions, selectedDays),
    [sessions, selectedDays]
  )

  // All-time stats
  const allTimeStats = useMemo(
    () => getStatsForWindow(sessions, null),
    [sessions]
  )

  const firstSessionDate = sessions.length > 0
    ? new Date(Math.min(...sessions.map(s => s.startTime)))
    : null

  // Swipe navigation
  const navSwipeHandlers = useSwipe({
    onSwipeDown: () => setView('timer'),
    onSwipeRight: () => setView('explore')
  })

  return (
    <div
      className="h-full bg-cream overflow-y-auto pb-24"
      {...navSwipeHandlers}
    >
      <div className="px-6 py-8 max-w-lg mx-auto">
        {/* Back to timer */}
        <button
          onClick={() => setView('timer')}
          className="flex items-center text-sm text-ink/40 mb-8 hover:text-ink/60 transition-colors active:scale-[0.98]"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
          Timer
        </button>

        {/* Cumulative achievement - hero display */}
        <div className="mb-8 text-center">
          <p className="font-serif text-display-sm text-indigo-deep tabular-nums">
            {formatTotalHours(totalSeconds)}
          </p>
          <p className="text-sm text-ink/40 mt-1">
            {allTimeStats.sessionCount} session{allTimeStats.sessionCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Milestone badges - horizontal scroll */}
        <AchievementGallery />

        {/* Generated insight card */}
        <InsightCard sessions={sessions} />

        {/* Interactive timeline */}
        <InteractiveTimeline sessions={sessions} />

        {/* Time range stats with slider */}
        <div className="mb-10">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-5">
            History
          </p>

          {/* Time range slider */}
          <TimeRangeSlider
            value={selectedDays}
            onChange={setSelectedDays}
            maxDays={maxDays}
          />

          {/* Trend chart */}
          <div className="mt-6 mb-4">
            <TrendChart sessions={sessions} days={selectedDays} />
          </div>

          {/* Stats for selected range */}
          <div className="mt-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-ink/50">Total</span>
              <span className="text-sm text-ink tabular-nums">
                {formatDuration(windowStats.totalSeconds)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-ink/50">Sessions</span>
              <span className="text-sm text-ink tabular-nums">
                {windowStats.sessionCount}
              </span>
            </div>
            {windowStats.sessionCount > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-ink/50">Avg session</span>
                  <span className="text-sm text-ink tabular-nums">
                    {formatDuration(windowStats.avgSessionMinutes * 60)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ink/50">Daily avg</span>
                  <span className="text-sm text-ink tabular-nums">
                    {formatDuration(windowStats.dailyAverageMinutes * 60)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* All time summary */}
        <div className="mb-10">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-5">
            All Time
          </p>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-ink/50">Sessions</span>
              <span className="text-sm text-ink tabular-nums">
                {allTimeStats.sessionCount}
              </span>
            </div>
            {allTimeStats.sessionCount > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-ink/50">Avg session</span>
                  <span className="text-sm text-ink tabular-nums">
                    {formatDuration(allTimeStats.avgSessionMinutes * 60)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ink/50">Longest</span>
                  <span className="text-sm text-ink tabular-nums">
                    {formatDuration(allTimeStats.longestSessionMinutes * 60)}
                  </span>
                </div>
              </>
            )}
            {firstSessionDate && (
              <div className="flex justify-between">
                <span className="text-sm text-ink/50">Since</span>
                <span className="text-sm text-ink">
                  {formatShortMonthYear(firstSessionDate)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
