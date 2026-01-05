import { useMemo, useState } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { usePremiumStore } from '../stores/usePremiumStore'
import { useSwipe } from '../hooks/useSwipe'
import {
  getStatsForWindow,
  getProjection,
  getAdaptiveMilestone,
  getWeeklyConsistency,
  DayStatus
} from '../lib/calculations'
import { getAvailableStatWindows, getWeeklyRollingHours } from '../lib/tierLogic'
import { TIME_WINDOWS } from '../lib/constants'
import {
  formatTotalHours,
  formatDuration,
  formatShortMonthYear
} from '../lib/format'
import { WeeklyGoal } from './WeeklyGoal'
import { FrozenMilestone } from './FrozenMilestone'
import { LockedOverlay } from './LockedOverlay'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function WeekDot({ status }: { status: DayStatus }) {
  if (status === 'completed') {
    return <div className="w-3 h-3 rounded-full bg-indigo-deep" />
  }
  if (status === 'today' || status === 'next') {
    // Glowing, breathing dot for today (incomplete) or tomorrow (after today is done)
    return (
      <div
        className="w-3 h-3 rounded-full bg-indigo-deep/30 animate-breathe"
        style={{ boxShadow: '0 0 8px rgba(26, 26, 46, 0.2)' }}
      />
    )
  }
  if (status === 'missed') {
    // Past day without session - subtle empty, no judgment
    return <div className="w-3 h-3 rounded-full bg-indigo-deep/10" />
  }
  // Future
  return <div className="w-3 h-3 rounded-full bg-indigo-deep/10" />
}

export function Stats() {
  const { sessions, totalSeconds, setView } = useSessionStore()
  const { isPremiumOrTrial, tier, trialExpired } = usePremiumStore()
  const [windowIndex, setWindowIndex] = useState(1) // Default to 30 days
  // Paywall state - will be used when PaywallPremium component is created
  const [_showPaywall, setShowPaywall] = useState(false)

  const currentWindow = TIME_WINDOWS[windowIndex]

  // Get available stat windows based on tier
  const availableWindows = useMemo(
    () => getAvailableStatWindows(tier, trialExpired),
    [tier, trialExpired]
  )

  // Check if current window is available
  const isCurrentWindowAvailable = useMemo(() => {
    const windowKey = windowIndex === 0 ? '7d' :
                      windowIndex === 1 ? '30d' :
                      windowIndex === 2 ? '90d' :
                      windowIndex === 3 || windowIndex === 4 ? 'year' : 'all'
    return availableWindows.find(w => w.window === windowKey)?.available ?? true
  }, [windowIndex, availableWindows])

  // Weekly rolling hours for FREE tier
  const weeklyHours = useMemo(
    () => getWeeklyRollingHours(sessions),
    [sessions]
  )

  // Handler for tapping locked features
  const handleLockedTap = () => {
    setShowPaywall(true)
    // TODO: Track analytics event
  }

  // Compute adaptive milestone
  const milestone = useMemo(
    () => getAdaptiveMilestone(sessions),
    [sessions]
  )

  // Compute weekly consistency
  const weekly = useMemo(
    () => getWeeklyConsistency(sessions),
    [sessions]
  )

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

        {/* Total hours - shows cumulative OR weekly based on tier */}
        <div className="mb-8">
          <p className="font-serif text-display-sm text-indigo-deep tabular-nums">
            {isPremiumOrTrial ? formatTotalHours(totalSeconds) : `${weeklyHours}h`}
          </p>
          {!isPremiumOrTrial && (
            <p className="text-sm text-indigo-deep/40 mt-1">this week</p>
          )}
        </div>

        {/* Tier-based milestone/goal section */}
        {isPremiumOrTrial ? (
          // Premium/Trial: Show adaptive milestone progress
          <div className="mb-8 pb-8 border-b border-indigo-deep/10">
            <p className="text-xs text-indigo-deep/50 uppercase tracking-wider mb-2">
              Next milestone: {milestone.milestoneName}
            </p>
            <div className="h-2 bg-indigo-deep/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-deep transition-all duration-500 rounded-full"
                style={{ width: `${milestone.progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-indigo-deep/40 mt-2">
              {milestone.currentFormatted} / {milestone.targetFormatted}
            </p>
          </div>
        ) : (
          // FREE after trial: Show weekly goal + frozen milestone
          <>
            <WeeklyGoal />
            <FrozenMilestone onTap={handleLockedTap} />
          </>
        )}

        {/* Weekly consistency */}
        <div className="mb-8 pb-8 border-b border-indigo-deep/10">
          <p className="text-xs text-indigo-deep/50 uppercase tracking-wider mb-4">
            This week
          </p>

          {/* Day dots */}
          <div className="flex justify-between mb-2">
            {weekly.days.map((status, i) => (
              <div key={i} className="flex flex-col items-center">
                <WeekDot status={status} />
                <span className="text-[10px] text-indigo-deep/30 mt-1">
                  {DAY_LABELS[i]}
                </span>
              </div>
            ))}
          </div>

          <p className="text-sm text-indigo-deep/60 mt-3">
            {weekly.sessionsThisWeek} session{weekly.sessionsThisWeek !== 1 ? 's' : ''}
            {weekly.hoursThisWeek > 0 && (
              <span> · {formatDuration(weekly.hoursThisWeek * 3600)}</span>
            )}
          </p>
        </div>

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

            <button
              onClick={() => !isCurrentWindowAvailable && handleLockedTap()}
              className={`text-sm font-medium ${isCurrentWindowAvailable ? 'text-indigo-deep' : 'text-indigo-deep/30'}`}
            >
              {currentWindow.label}
              {!isCurrentWindowAvailable && (
                <span className="ml-1 text-xs text-indigo-deep/20">(locked)</span>
              )}
            </button>

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

          {/* Window stats - shown normally if available, blurred if locked */}
          {isCurrentWindowAvailable ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-indigo-deep/60">Total</span>
                <span className="text-sm text-indigo-deep tabular-nums">
                  {formatDuration(windowStats.totalSeconds)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-indigo-deep/60">Sessions</span>
                <span className="text-sm text-indigo-deep tabular-nums">
                  {windowStats.sessionCount}
                </span>
              </div>
              {windowStats.sessionCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-indigo-deep/60">Avg session</span>
                  <span className="text-sm text-indigo-deep tabular-nums">
                    {formatDuration(windowStats.avgSessionMinutes * 60)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <LockedOverlay
              message="Unlock to see full history"
              onTap={handleLockedTap}
            >
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-indigo-deep/60">Total</span>
                  <span className="text-sm text-indigo-deep tabular-nums">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-indigo-deep/60">Sessions</span>
                  <span className="text-sm text-indigo-deep tabular-nums">--</span>
                </div>
              </div>
            </LockedOverlay>
          )}
        </div>

        {/* The long view - projection (Premium/Trial only) */}
        {isPremiumOrTrial ? (
          <div className="mb-8 pb-8 border-b border-indigo-deep/10">
            <p className="text-xs text-indigo-deep/50 uppercase tracking-wider mb-2">
              The long view
            </p>
            <p className="font-serif text-xl text-indigo-deep">
              {projection.projectionMessage}
            </p>
            {projection.maturityLevel === 'established' && projection.currentPace.dailyMinutes > 0 && (
              <p className="text-sm text-indigo-deep/50 mt-2">
                Averaging {projection.currentPace.description}
              </p>
            )}
            <p className="text-xs text-indigo-deep/30 mt-3 italic">
              10,000 hours is the horizon, not the point.
            </p>
          </div>
        ) : (
          <div className="mb-8 pb-8 border-b border-indigo-deep/10">
            <p className="text-xs text-indigo-deep/50 uppercase tracking-wider mb-2">
              The long view
            </p>
            <button
              onClick={handleLockedTap}
              className="w-full text-left"
            >
              <p className="font-serif text-xl text-indigo-deep/30 italic">
                Unlock to see your path...
              </p>
              <p className="text-xs text-indigo-deep/20 mt-2">
                $4.99/year
              </p>
            </button>
          </div>
        )}

        {/* All time summary */}
        <div className="mb-8">
          <p className="text-xs text-indigo-deep/50 uppercase tracking-wider mb-4">
            All time
          </p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-indigo-deep/60">Sessions</span>
              <span className="text-sm text-indigo-deep tabular-nums">
                {allTimeStats.sessionCount}
              </span>
            </div>
            {allTimeStats.sessionCount > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-indigo-deep/60">Avg session</span>
                  <span className="text-sm text-indigo-deep tabular-nums">
                    {formatDuration(allTimeStats.avgSessionMinutes * 60)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-indigo-deep/60">Longest</span>
                  <span className="text-sm text-indigo-deep tabular-nums">
                    {formatDuration(allTimeStats.longestSessionMinutes * 60)}
                  </span>
                </div>
              </>
            )}
            {firstSessionDate && (
              <div className="flex justify-between">
                <span className="text-sm text-indigo-deep/60">Since</span>
                <span className="text-sm text-indigo-deep">
                  {formatShortMonthYear(firstSessionDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex justify-center gap-6">
          <button
            onClick={() => setView('calendar')}
            className="py-3 text-sm text-indigo-deep/70 hover:text-indigo-deep transition-colors flex items-center"
          >
            Calendar
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => setView('settings')}
            className="py-3 text-sm text-indigo-deep/50 hover:text-indigo-deep/70 transition-colors"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}
