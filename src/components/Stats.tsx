import { useMemo, useState } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { usePremiumStore } from '../stores/usePremiumStore'
import { useSwipe } from '../hooks/useSwipe'
import {
  getStatsForWindow,
  getProjection,
  getWeeklyConsistency,
  DayStatus
} from '../lib/calculations'
import { getWeeklyRollingSeconds } from '../lib/tierLogic'
import {
  formatTotalHours,
  formatDuration,
  formatShortMonthYear
} from '../lib/format'
import { WeeklyGoal } from './WeeklyGoal'
import { AchievementGallery } from './AchievementGallery'
import { TimeRangeSlider } from './TimeRangeSlider'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Lock icon component
function LockIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
  )
}

// Week Stone - like smooth river stones, days with sessions have warmth
function WeekStone({ status }: { status: DayStatus }) {
  if (status === 'completed') {
    // Held stone - has warmth and depth
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
    // Today's stone - glowing, waiting
    return (
      <div
        className="w-3.5 h-3.5 rounded-full animate-breathe ring-2 ring-ink/15 ring-offset-2 ring-offset-cream"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #87A878, #5D6D7E)'
        }}
      />
    )
  }
  // Missed or future - empty river bed
  return <div className="w-3 h-3 rounded-full bg-cream-deep" />
}

export function Stats() {
  const { sessions, totalSeconds, setView } = useSessionStore()
  const { isPremiumOrTrial } = usePremiumStore()
  const [selectedDays, setSelectedDays] = useState<number | null>(30) // Default to 30 days
  // Paywall state - will be used when PaywallPremium component is created
  const [_showPaywall, setShowPaywall] = useState(false)

  // Calculate max days based on first session
  const maxDays = useMemo(() => {
    if (sessions.length === 0) return 365
    const firstSession = Math.min(...sessions.map(s => s.startTime))
    const daysSince = Math.ceil((Date.now() - firstSession) / (24 * 60 * 60 * 1000))
    return Math.max(7, daysSince)
  }, [sessions])

  // Weekly rolling seconds for FREE tier
  const weeklySeconds = useMemo(
    () => getWeeklyRollingSeconds(sessions),
    [sessions]
  )

  // Handler for tapping locked features
  const handleLockedTap = () => {
    setShowPaywall(true)
    // TODO: Track analytics event
  }

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

        {/* FREE tier upgrade nudge */}
        {!isPremiumOrTrial && (
          <button
            onClick={handleLockedTap}
            className="w-full mb-6 p-3 bg-cream-warm rounded-lg border border-dashed border-indigo-deep/20 flex items-center justify-between hover:bg-cream-deep transition-colors"
          >
            <span className="text-xs text-indigo-deep/50">
              You have <span className="font-medium text-indigo-deep">{formatTotalHours(totalSeconds)}</span> tracked
            </span>
            <span className="text-xs text-indigo-deep/70 flex items-center gap-1">
              See full journey
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        )}

        {/* Total hours - shows cumulative OR weekly based on tier */}
        <div className="mb-8">
          <p className="font-serif text-display-sm text-indigo-deep tabular-nums">
            {isPremiumOrTrial ? formatTotalHours(totalSeconds) : formatTotalHours(weeklySeconds)}
          </p>
          {!isPremiumOrTrial && (
            <p className="text-sm text-indigo-deep/40 mt-1">this week</p>
          )}
        </div>

        {/* Achievement gallery - shows for all users with tier-based visibility */}
        <AchievementGallery onLockedTap={handleLockedTap} />

        {/* FREE tier: Also show weekly goal */}
        {!isPremiumOrTrial && <WeeklyGoal />}

        {/* Weekly consistency - stones on the path */}
        <div className="mb-12">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-5">
            This Week
          </p>

          {/* Week stones - like river stones */}
          <div className="flex justify-between items-end mb-3 px-1">
            {weekly.days.map((status, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <WeekStone status={status} />
                <span className="text-[10px] text-ink/30">
                  {DAY_LABELS[i]}
                </span>
              </div>
            ))}
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
            onLockedTap={handleLockedTap}
          />

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
        {isPremiumOrTrial ? (
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
        ) : (
          <button
            onClick={handleLockedTap}
            className="w-full mb-8 p-5 bg-gradient-to-br from-cream-warm to-cream-deep rounded-xl border border-indigo-deep/10 text-left hover:border-indigo-deep/20 transition-all"
          >
            <p className="text-xs text-indigo-deep/50 uppercase tracking-wider mb-3 flex items-center gap-2">
              The long view
              <LockIcon className="w-3 h-3" />
            </p>
            <p className="font-serif text-lg text-indigo-deep/70 mb-2">
              Your {formatTotalHours(totalSeconds)} could become...
            </p>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-serif text-3xl text-indigo-deep/20">10,000</span>
              <span className="text-sm text-indigo-deep/30">hours</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-indigo-deep/10">
              <span className="text-xs text-indigo-deep/40 italic">
                See your projected journey
              </span>
              <span className="text-xs font-medium text-indigo-deep/60 bg-cream px-2 py-1 rounded">
                $4.99/year
              </span>
            </div>
          </button>
        )}

        {/* All time summary */}
        <div className="mb-12">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-5 flex items-center gap-2">
            All Time
            {!isPremiumOrTrial && <LockIcon className="w-3 h-3 text-ink/25" />}
          </p>

          {isPremiumOrTrial ? (
            // Premium: Full stats
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
          ) : (
            // FREE: Limited view with locked overlay
            <button onClick={handleLockedTap} className="w-full text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-ink/50">Sessions</span>
                  <span className="text-sm text-ink tabular-nums">
                    {allTimeStats.sessionCount}
                  </span>
                </div>
                {firstSessionDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-ink/50">Since</span>
                    <span className="text-sm text-ink">
                      {formatShortMonthYear(firstSessionDate)}
                    </span>
                  </div>
                )}
                {/* Locked stats teaser */}
                <div className="pt-3 mt-3 border-t border-dashed border-ink/8">
                  <div className="flex justify-between opacity-40">
                    <span className="text-sm text-ink/50">Total hours</span>
                    <span className="text-sm text-ink tabular-nums flex items-center gap-1">
                      <LockIcon className="w-3 h-3" />
                      {formatTotalHours(totalSeconds)}
                    </span>
                  </div>
                  <div className="flex justify-between opacity-40 mt-2">
                    <span className="text-sm text-ink/50">Avg session</span>
                    <span className="text-sm text-ink tabular-nums flex items-center gap-1">
                      <LockIcon className="w-3 h-3" />
                      --
                    </span>
                  </div>
                </div>
                <p className="text-xs text-ink/30 mt-3 italic">
                  Tap to see your complete history
                </p>
              </div>
            </button>
          )}
        </div>

        {/* Navigation links */}
        <div className="flex justify-center gap-8 pt-4">
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
            onClick={() => setView('settings')}
            className="py-3 text-sm text-ink/40 hover:text-ink/60 transition-colors active:scale-[0.98]"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}
