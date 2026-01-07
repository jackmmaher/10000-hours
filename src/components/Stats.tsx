import { useMemo, useState } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useSwipe } from '../hooks/useSwipe'
import {
  getStatsForWindow,
  getProjection,
  getWeeklyConsistency,
  getSessionsForDate,
  DayStatus
} from '../lib/calculations'
import {
  formatTotalHours,
  formatDuration,
  formatShortMonthYear
} from '../lib/format'
import { AchievementGallery } from './AchievementGallery'
import { TimeRangeSlider } from './TimeRangeSlider'
import { TrendChart } from './TrendChart'
import { MeditationPlanner } from './MeditationPlanner'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Week Stone - like smooth river stones, days with sessions have warmth
function WeekStone({ status }: { status: DayStatus }) {
  if (status === 'completed') {
    return (
      <div
        className="w-3 h-3 rounded-full shadow-sm"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #5D6D7E, #2C3E50)'
        }}
      />
    )
  }
  if (status === 'today' || status === 'next') {
    return (
      <div
        className="w-3.5 h-3.5 rounded-full animate-breathe ring-2 ring-ink/15 ring-offset-2 ring-offset-cream"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #87A878, #5D6D7E)'
        }}
      />
    )
  }
  return <div className="w-3 h-3 rounded-full bg-cream-deep" />
}

export function Stats() {
  const { sessions, totalSeconds, setView } = useSessionStore()
  const { isAuthenticated, profile } = useAuthStore()
  const [selectedDays, setSelectedDays] = useState<number | null>(30)
  const [planningDate, setPlanningDate] = useState<Date | null>(null)

  // Calculate max days based on first session
  const maxDays = useMemo(() => {
    if (sessions.length === 0) return 365
    const firstSession = Math.min(...sessions.map(s => s.startTime))
    const daysSince = Math.ceil((Date.now() - firstSession) / (24 * 60 * 60 * 1000))
    return Math.max(7, daysSince)
  }, [sessions])

  // Compute weekly consistency
  const weekly = useMemo(
    () => getWeeklyConsistency(sessions),
    [sessions]
  )

  // Compute stats for selected range
  const windowStats = useMemo(
    () => getStatsForWindow(sessions, selectedDays),
    [sessions, selectedDays]
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
          className="flex items-center text-sm text-ink/40 mb-10 hover:text-ink/60 transition-colors active:scale-[0.98]"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
          Timer
        </button>

        {/* Total hours */}
        <div className="mb-8">
          <p className="font-serif text-display-sm text-indigo-deep tabular-nums">
            {formatTotalHours(totalSeconds)}
          </p>
        </div>

        {/* Achievement gallery */}
        <AchievementGallery />

        {/* Weekly consistency - stones on the path */}
        <div className="mb-12">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-5">
            This Week
          </p>

          {/* Week stones - like river stones (clickable for planning) */}
          <div className="flex justify-between items-end mb-3 px-1">
            {weekly.days.map((status, i) => {
              // Calculate the date for this day (Monday-based week)
              const today = new Date()
              const dayOfWeek = today.getDay()
              const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
              const monday = new Date(today)
              monday.setDate(today.getDate() + mondayOffset)
              monday.setHours(0, 0, 0, 0)
              const dayDate = new Date(monday)
              dayDate.setDate(monday.getDate() + i)

              // Only future days and today are plannable
              const isPlannable = status === 'today' || status === 'next' || status === 'future'

              return (
                <button
                  key={i}
                  onClick={() => isPlannable && setPlanningDate(dayDate)}
                  disabled={!isPlannable}
                  className={`flex flex-col items-center gap-2 ${
                    isPlannable ? 'cursor-pointer active:scale-90 transition-transform' : 'cursor-default'
                  }`}
                >
                  <WeekStone status={status} />
                  <span className="text-[10px] text-ink/30">
                    {DAY_LABELS[i]}
                  </span>
                </button>
              )
            })}
          </div>

          <p className="text-sm text-ink/50 mt-4">
            {weekly.sessionsThisWeek} session{weekly.sessionsThisWeek !== 1 ? 's' : ''}
            {weekly.hoursThisWeek > 0 && (
              <span className="text-ink/40"> · {formatDuration(weekly.hoursThisWeek * 3600)}</span>
            )}
          </p>
        </div>

        {/* Time range stats with slider */}
        <div className="mb-12">
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

        {/* The Long View - with subtle atmospheric background */}
        <div className="relative mb-12 py-6 px-1 -mx-1">
          {/* Subtle atmosphere - like morning mist */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(135, 168, 120, 0.06) 0%, transparent 70%)'
            }}
          />

          <div className="relative">
            <p className="font-serif text-sm text-ink/40 tracking-widest mb-3">
              The Long View
            </p>
            <p className="font-serif text-xl text-ink leading-relaxed">
              {projection.projectionMessage}
            </p>
            {projection.maturityLevel === 'established' && projection.currentPace.dailyMinutes > 0 && (
              <p className="text-sm text-ink/50 mt-3">
                Averaging {projection.currentPace.description}
              </p>
            )}
            <p className="font-serif text-xs text-ink/30 mt-4 italic">
              10,000 hours is the horizon, not the point.
            </p>
          </div>
        </div>

        {/* All time summary */}
        <div className="mb-12">
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

        {/* Community - Karma & Saves */}
        {isAuthenticated && profile && (profile.totalKarma > 0 || profile.totalSaves > 0) && (
          <div className="mb-12">
            <p className="font-serif text-sm text-ink/50 tracking-wide mb-5">
              Community
            </p>

            <button
              onClick={() => setView('insights')}
              className="w-full text-left group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-ink/50 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
                    </svg>
                    Karma earned
                  </span>
                  <span className="text-sm text-ink tabular-nums group-hover:text-indigo-deep transition-colors">
                    {profile.totalKarma}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-ink/50 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Times saved
                  </span>
                  <span className="text-sm text-ink tabular-nums group-hover:text-indigo-deep transition-colors">
                    {profile.totalSaves}
                  </span>
                </div>
              </div>
              <p className="text-xs text-ink/30 mt-3 group-hover:text-ink/50 transition-colors">
                Tap to view your pearls →
              </p>
            </button>
          </div>
        )}

        {/* Navigation links */}
        <div className="flex justify-center gap-6 pt-4">
          <button
            onClick={() => setView('calendar')}
            className="py-3 text-sm text-ink/60 hover:text-ink transition-colors flex items-center active:scale-[0.98]"
          >
            Calendar
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => setView('insights')}
            className="py-3 text-sm text-ink/40 hover:text-ink/60 transition-colors active:scale-[0.98]"
          >
            Insights
          </button>
          <button
            onClick={() => setView('settings')}
            className="py-3 text-sm text-ink/40 hover:text-ink/60 transition-colors active:scale-[0.98]"
          >
            Settings
          </button>
        </div>
      </div>

      {/* Meditation planner modal */}
      {planningDate && (
        <MeditationPlanner
          date={planningDate}
          sessions={getSessionsForDate(sessions, planningDate).sort((a, b) => b.startTime - a.startTime)}
          onClose={() => setPlanningDate(null)}
          onSave={() => {
            // Could refresh weekly data here if needed
          }}
        />
      )}
    </div>
  )
}
