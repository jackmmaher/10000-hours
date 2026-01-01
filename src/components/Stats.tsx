import { useMemo, useState } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useSwipe } from '../hooks/useSwipe'
import {
  getStatsForWindow,
  getProjection
} from '../lib/calculations'
import { TIME_WINDOWS, GOAL_HOURS } from '../lib/constants'
import {
  formatTotalHours,
  formatDuration,
  formatProjectedDate,
  formatDaysRemaining,
  formatShortMonthYear
} from '../lib/format'

export function Stats() {
  const { sessions, totalSeconds, setView } = useSessionStore()
  const [windowIndex, setWindowIndex] = useState(1) // Default to 30 days

  const currentWindow = TIME_WINDOWS[windowIndex]

  // Compute stats for current window
  const windowStats = useMemo(
    () => getStatsForWindow(sessions, currentWindow.days),
    [sessions, currentWindow.days]
  )

  // Compute projection
  const projection = useMemo(
    () => getProjection(sessions),
    [sessions]
  )

  // All-time stats
  const allTimeStats = useMemo(
    () => getStatsForWindow(sessions, null),
    [sessions]
  )

  const firstSessionDate = sessions.length > 0
    ? new Date(Math.min(...sessions.map(s => s.startTime)))
    : null

  const percentComplete = (totalSeconds / (GOAL_HOURS * 3600)) * 100

  // Swipe to change time window
  const windowSwipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (windowIndex < TIME_WINDOWS.length - 1) {
        setWindowIndex(windowIndex + 1)
      }
    },
    onSwipeRight: () => {
      if (windowIndex > 0) {
        setWindowIndex(windowIndex - 1)
      }
    }
  })

  // Swipe navigation between views
  const navSwipeHandlers = useSwipe({
    onSwipeDown: () => setView('timer'),
    onSwipeLeft: () => setView('calendar')
  })

  return (
    <div
      className="h-full bg-cream overflow-y-auto"
      {...navSwipeHandlers}
    >
      <div className="px-6 py-8 max-w-lg mx-auto">
        {/* Back to timer */}
        <button
          onClick={() => setView('timer')}
          className="flex items-center text-sm text-indigo-deep/50 mb-8 hover:text-indigo-deep/70 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
          timer
        </button>

        {/* Progress header */}
        <div className="mb-8">
          <p className="font-serif text-display-sm text-indigo-deep tabular-nums">
            {formatTotalHours(totalSeconds)}
            <span className="text-xl text-indigo-deep/40 ml-1">
              / {GOAL_HOURS.toLocaleString()}
            </span>
          </p>

          {/* Progress bar */}
          <div className="mt-4 h-1 bg-indigo-deep/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-deep transition-all duration-500"
              style={{ width: `${Math.min(percentComplete, 100)}%` }}
            />
          </div>
          <p className="text-xs text-indigo-deep/40 mt-2">
            {percentComplete.toFixed(1)}% complete
          </p>
        </div>

        {/* Projection */}
        {projection.projectedDate && (
          <div className="mb-8 pb-8 border-b border-indigo-deep/10">
            <p className="text-xs text-indigo-deep/50 uppercase tracking-wider mb-2">
              Projected completion
            </p>
            <p className="font-serif text-2xl text-indigo-deep">
              {formatProjectedDate(projection.projectedDate)}
            </p>
            <p className="text-sm text-indigo-deep/60 mt-1">
              {formatDaysRemaining(projection.daysToCompletion!)} at current pace
            </p>

            {/* Recommendation */}
            <div className="mt-4 text-sm text-indigo-deep/70">
              <p>
                You're averaging {projection.currentPace.description}.
              </p>
              {projection.remainingHours > 0 && (
                <p className="mt-2">
                  {projection.remainingHours.toLocaleString()} hours to go.
                </p>
              )}
            </div>

            {/* Scenarios */}
            <div className="mt-4 space-y-1">
              {projection.scenarios.slice(0, 3).map((scenario, i) => (
                <p key={i} className="text-xs text-indigo-deep/50">
                  {scenario.description} → {formatProjectedDate(scenario.completionDate)}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Time window stats */}
        <div className="mb-8 pb-8 border-b border-indigo-deep/10">
          {/* Swipeable window selector */}
          <div
            className="flex items-center justify-between mb-4"
            {...windowSwipeHandlers}
          >
            <button
              onClick={() => windowIndex > 0 && setWindowIndex(windowIndex - 1)}
              className={`p-1 ${windowIndex === 0 ? 'opacity-20' : 'opacity-50 hover:opacity-70'}`}
              disabled={windowIndex === 0}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <p className="text-sm text-indigo-deep font-medium">
              {currentWindow.label}
            </p>

            <button
              onClick={() => windowIndex < TIME_WINDOWS.length - 1 && setWindowIndex(windowIndex + 1)}
              className={`p-1 ${windowIndex === TIME_WINDOWS.length - 1 ? 'opacity-20' : 'opacity-50 hover:opacity-70'}`}
              disabled={windowIndex === TIME_WINDOWS.length - 1}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Window stats */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-indigo-deep/60">Total</span>
              <span className="text-sm text-indigo-deep tabular-nums">
                {windowStats.totalHours.toFixed(1)} hrs
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-indigo-deep/60">Sessions</span>
              <span className="text-sm text-indigo-deep tabular-nums">
                {windowStats.sessionCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-indigo-deep/60">Avg session</span>
              <span className="text-sm text-indigo-deep tabular-nums">
                {formatDuration(windowStats.avgSessionMinutes * 60)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-indigo-deep/60">Daily avg</span>
              <span className="text-sm text-indigo-deep tabular-nums">
                {formatDuration(windowStats.dailyAverageMinutes * 60)}
              </span>
            </div>
          </div>
        </div>

        {/* All time */}
        <div className="mb-8">
          <p className="text-xs text-indigo-deep/50 uppercase tracking-wider mb-4">
            All time
          </p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-indigo-deep/60">Sessions logged</span>
              <span className="text-sm text-indigo-deep tabular-nums">
                {allTimeStats.sessionCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-indigo-deep/60">Avg session</span>
              <span className="text-sm text-indigo-deep tabular-nums">
                {formatDuration(allTimeStats.avgSessionMinutes * 60)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-indigo-deep/60">Longest session</span>
              <span className="text-sm text-indigo-deep tabular-nums">
                {formatDuration(allTimeStats.longestSessionMinutes * 60)}
              </span>
            </div>
            {firstSessionDate && (
              <div className="flex justify-between">
                <span className="text-sm text-indigo-deep/60">Practicing since</span>
                <span className="text-sm text-indigo-deep">
                  {formatShortMonthYear(firstSessionDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Calendar link */}
        <button
          onClick={() => setView('calendar')}
          className="w-full py-3 text-sm text-indigo-deep/70 hover:text-indigo-deep transition-colors flex items-center justify-center"
        >
          Calendar
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
