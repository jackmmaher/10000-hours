/**
 * Journey - Personal meditation space
 *
 * The Journey tab is the user's personal space for:
 * - Planning upcoming sessions
 * - Reviewing and editing captured insights
 * - Creating pearls from insights (private → public wisdom)
 * - Managing saved templates and pearls
 *
 * Layout:
 * - Top: "Your Next Moment" card (next planned session or invite to plan)
 * - Center: Week stones (M-S with status indicators)
 * - Sub-tabs: My Insights | Guided Meditations | My Pearls
 */

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useSwipe } from '../hooks/useSwipe'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { WeekStonesRow, getDayStatusWithPlan, ExtendedDayStatus } from './WeekStones'
import { JourneyNextSession } from './JourneyNextSession'
import { InsightStream } from './InsightStream'
import { Calendar } from './Calendar'
import { JourneySavedContent } from './JourneySavedContent'
import { JourneyMyPearls } from './JourneyMyPearls'
import {
  getPlannedSessionsForWeek,
  getNextPlannedSession,
  PlannedSession,
  Session,
  Insight
} from '../lib/db'
import { dateHasSession, getSessionsForDate } from '../lib/calculations'

/**
 * Helper to get Monday of the current week at midnight
 */
function getMondayOfWeek(): Date {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)
  return monday
}

type JourneySubTab = 'sessions' | 'saved' | 'pearls'

export function Journey() {
  const { sessions } = useSessionStore()
  const { setView } = useNavigationStore()
  const { user } = useAuthStore()
  const [subTab, setSubTab] = useState<JourneySubTab>('sessions')
  const [weekPlans, setWeekPlans] = useState<PlannedSession[]>([])
  const [planningDate, setPlanningDate] = useState<Date | null>(null)
  const [selectedDaySessions, setSelectedDaySessions] = useState<Session[]>([])
  const [plansRefreshKey, setPlansRefreshKey] = useState(0) // Unified refresh key for all plan data
  const [insightSession, setInsightSession] = useState<Session | null>(null)
  const [pearlInsight, setPearlInsight] = useState<Insight | null>(null)
  const [insightStreamKey, setInsightStreamKey] = useState(0) // For refreshing after insight/pearl added
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)

  // Calculate total hours for creator badge
  const totalHours = useMemo(() => {
    const totalSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0)
    return Math.floor(totalSeconds / 3600)
  }, [sessions])

  // Unified refresh function - call this after any plan changes
  const refreshAllPlanData = useCallback(() => {
    setPlansRefreshKey(k => k + 1)
  }, [])

  // Reference to scroll container
  const scrollRef = useRef<HTMLDivElement>(null)

  // Pull-to-refresh
  const {
    isPulling,
    isRefreshing,
    pullDistance,
    handlers: pullHandlers
  } = usePullToRefresh({
    onRefresh: async () => {
      // Refresh all data
      refreshAllPlanData()
      setInsightStreamKey(k => k + 1)
      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  })

  // Swipe navigation (only when not pulling to refresh)
  const navSwipeHandlers = useSwipe({
    onSwipeDown: () => {
      // Only navigate if not at top (pull-to-refresh handles top)
      if (scrollRef.current && scrollRef.current.scrollTop > 50) {
        setView('timer')
      }
    },
    onSwipeLeft: () => setView('explore'),
    onSwipeRight: () => setView('timer')
  })

  // Load planned sessions for the current week
  // Refreshes when: sessions change (auto-linking), plansRefreshKey changes (manual save)
  useEffect(() => {
    const loadWeekPlans = async () => {
      const monday = getMondayOfWeek()
      const plans = await getPlannedSessionsForWeek(monday.getTime())
      setWeekPlans(plans)
    }
    loadWeekPlans()
  }, [sessions, plansRefreshKey]) // Reload on sessions change OR explicit refresh

  // Compute week day statuses with plan data
  const weekDays = useMemo((): ExtendedDayStatus[] => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Calculate Monday of this week
    const dayOfWeek = todayStart.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const monday = new Date(todayStart)
    monday.setDate(todayStart.getDate() - daysFromMonday)

    // Calculate tomorrow's date
    const tomorrow = new Date(todayStart)
    tomorrow.setDate(todayStart.getDate() + 1)

    return Array.from({ length: 7 }, (_, i) => {
      const dayDate = new Date(monday)
      dayDate.setDate(monday.getDate() + i)

      const hasSession = dateHasSession(sessions, dayDate)
      const plan = weekPlans.find(p => {
        const planDate = new Date(p.date)
        planDate.setHours(0, 0, 0, 0)
        return planDate.getTime() === dayDate.getTime()
      })
      const hasPlan = !!plan && !plan.completed // Only count incomplete plans

      // Compare dates directly
      const isToday = dayDate.getTime() === todayStart.getTime()
      const isTomorrow = dayDate.getTime() === tomorrow.getTime()
      const isFuture = dayDate.getTime() > todayStart.getTime()
      const isPast = dayDate.getTime() < todayStart.getTime()

      // Tomorrow always glows to encourage planning (unless already has a session)
      const isNextPlannable = isTomorrow && !hasSession

      return getDayStatusWithPlan(hasSession, hasPlan, isToday, isFuture, isNextPlannable, isPast)
    })
  }, [sessions, weekPlans])

  // Handle day click - open planner/summary for that day
  const handleDayClick = (_dayIndex: number, date: Date) => {
    // Get all sessions for this date (sorted by time, most recent first)
    const daySessions = getSessionsForDate(sessions, date)
      .sort((a, b) => b.startTime - a.startTime)

    // Set state - insight will be fetched by MeditationPlanner
    setSelectedDaySessions(daySessions)
    setPlanningDate(date)
  }

  // Get next planned session (looks beyond current week)
  const [nextPlannedSession, setNextPlannedSession] = useState<PlannedSession | null>(null)

  useEffect(() => {
    const loadNextPlan = async () => {
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      const todayHasSession = dateHasSession(sessions, now)

      // If today has a session, skip today's plans
      const skipDate = todayHasSession ? now.getTime() : undefined
      const nextPlan = await getNextPlannedSession(skipDate)
      setNextPlannedSession(nextPlan || null)
    }
    loadNextPlan()
  }, [sessions, plansRefreshKey])

  return (
    <div
      ref={scrollRef}
      className="h-full bg-cream overflow-y-auto pb-24"
      {...navSwipeHandlers}
      onTouchStart={(e) => {
        pullHandlers.onTouchStart(e)
        navSwipeHandlers.onTouchStart?.(e)
      }}
      onTouchMove={pullHandlers.onTouchMove}
      onTouchEnd={(e) => {
        pullHandlers.onTouchEnd()
        navSwipeHandlers.onTouchEnd?.(e)
      }}
    >
      {/* Pull-to-refresh indicator */}
      <div
        className="flex justify-center overflow-hidden transition-all duration-200"
        style={{
          height: isPulling || isRefreshing ? Math.min(pullDistance, 80) : 0,
          opacity: isPulling || isRefreshing ? 1 : 0
        }}
      >
        <div className="flex items-center gap-2 py-2">
          {isRefreshing ? (
            <div className="w-5 h-5 border-2 border-moss/30 border-t-moss rounded-full animate-spin" />
          ) : (
            <svg
              className="w-5 h-5 text-moss transition-transform duration-200"
              style={{ transform: pullDistance >= 80 ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
          <span className="text-sm text-moss">
            {isRefreshing ? 'Refreshing...' : pullDistance >= 80 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      <div className="px-6 py-8 max-w-lg mx-auto">
        {/* Back to timer */}
        <button
          onClick={() => setView('timer')}
          aria-label="Return to timer"
          className="flex items-center text-sm text-ink/40 mb-8 hover:text-ink/60 transition-colors active:scale-[0.98]"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
          Timer
        </button>

        {/* Your Next Moment */}
        <JourneyNextSession
          plannedSession={nextPlannedSession}
          onPlanClick={() => {
            // If there's an existing planned session, edit that date
            // Otherwise open planner for today
            if (nextPlannedSession) {
              const planDate = new Date(nextPlannedSession.date)
              planDate.setHours(0, 0, 0, 0)
              setPlanningDate(planDate)
            } else {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              setPlanningDate(today)
            }
          }}
        />

        {/* Week Stones */}
        <div className="mb-10">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-5">
            Meditations this week
          </p>
          <WeekStonesRow
            days={weekDays}
            onDayClick={handleDayClick}
            showLabels={true}
            size="md"
          />
        </div>

        {/* Calendar */}
        <div className="mb-10">
          <Calendar
            embedded
            onDateClick={(date) => handleDayClick(0, date)}
            refreshKey={plansRefreshKey}
          />
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 mb-6 bg-cream-deep rounded-lg p-1">
          <TabButton
            active={subTab === 'sessions'}
            onClick={() => setSubTab('sessions')}
          >
            Insights
          </TabButton>
          <TabButton
            active={subTab === 'pearls'}
            onClick={() => setSubTab('pearls')}
          >
            Pearls
          </TabButton>
          <TabButton
            active={subTab === 'saved'}
            onClick={() => setSubTab('saved')}
          >
            Meditations
          </TabButton>
        </div>

        {/* Tab Content */}
        {subTab === 'sessions' && (
          <InsightStream
            key={insightStreamKey}
            onCreatePearl={(insight) => {
              setPearlInsight(insight)
            }}
            refreshKey={insightStreamKey}
          />
        )}
        {subTab === 'pearls' && (
          <JourneyMyPearls />
        )}
        {subTab === 'saved' && (
          <JourneySavedContent
            onCreateNew={user ? () => setShowTemplateEditor(true) : undefined}
          />
        )}
      </div>

      {/* Meditation planner modal - import lazily when needed */}
      {planningDate && (
        <MeditationPlannerWrapper
          date={planningDate}
          sessions={selectedDaySessions}
          onClose={() => {
            setPlanningDate(null)
            setSelectedDaySessions([])
          }}
          onSave={refreshAllPlanData}
        />
      )}

      {/* Insight capture modal for adding insights */}
      {insightSession && (
        <InsightCaptureWrapper
          sessionId={insightSession.uuid}
          onComplete={() => {
            setInsightSession(null)
            // Refresh insight stream to show new insight
            setInsightStreamKey(k => k + 1)
          }}
          onSkip={() => setInsightSession(null)}
        />
      )}

      {/* Pearl creation modal */}
      {pearlInsight && (
        <SharePearlWrapper
          insightId={pearlInsight.id}
          insightText={pearlInsight.formattedText || pearlInsight.rawText}
          onComplete={() => {
            setPearlInsight(null)
            // Refresh insight stream to show pearl status
            setInsightStreamKey(k => k + 1)
          }}
          onCancel={() => setPearlInsight(null)}
        />
      )}

      {/* Template editor modal */}
      {showTemplateEditor && (
        <TemplateEditorWrapper
          onClose={() => setShowTemplateEditor(false)}
          onPublished={() => {
            setShowTemplateEditor(false)
            // Could show a success message or navigate somewhere
          }}
          creatorHours={totalHours}
        />
      )}
    </div>
  )
}

// Tab button component - with touch handling to prevent swipe interference
function TabButton({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      onTouchEnd={(e) => {
        // Stop propagation to prevent parent swipe handlers from interfering
        e.stopPropagation()
      }}
      className={`
        flex-1 py-2 px-3 text-sm rounded-md transition-all touch-manipulation
        ${active
          ? 'bg-cream text-ink shadow-sm'
          : 'text-ink/40 hover:text-ink/60'
        }
      `}
    >
      {children}
    </button>
  )
}

// Wrapper for lazy loading MeditationPlanner
function MeditationPlannerWrapper({
  date,
  sessions,
  onClose,
  onSave
}: {
  date: Date
  sessions: Session[]
  onClose: () => void
  onSave: () => void
}) {
  // Import the existing MeditationPlanner
  const [MeditationPlanner, setMeditationPlanner] = useState<React.ComponentType<{
    date: Date
    sessions: Session[]
    onClose: () => void
    onSave: () => void
  }> | null>(null)

  useEffect(() => {
    import('./MeditationPlanner').then(module => {
      setMeditationPlanner(() => module.MeditationPlanner)
    })
  }, [])

  if (!MeditationPlanner) {
    return (
      <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50">
        <div className="w-1 h-1 bg-cream rounded-full animate-pulse" />
      </div>
    )
  }

  return <MeditationPlanner date={date} sessions={sessions} onClose={onClose} onSave={onSave} />
}

// Wrapper for lazy loading InsightCapture
function InsightCaptureWrapper({
  sessionId,
  onComplete,
  onSkip
}: {
  sessionId: string
  onComplete: () => void
  onSkip: () => void
}) {
  const [InsightCapture, setInsightCapture] = useState<React.ComponentType<{
    sessionId?: string
    onComplete: () => void
    onSkip: () => void
  }> | null>(null)

  useEffect(() => {
    import('./InsightCapture').then(module => {
      setInsightCapture(() => module.InsightCapture)
    })
  }, [])

  // Block swipe navigation when modal is open
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  if (!InsightCapture) {
    return (
      <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50">
        <div className="w-1 h-1 bg-cream rounded-full animate-pulse" />
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-end justify-center"
      onTouchStart={handleTouchEvent}
      onTouchEnd={handleTouchEvent}
      onTouchMove={handleTouchEvent}
    >
      <div className="bg-cream rounded-t-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl animate-slide-up">
        <InsightCapture sessionId={sessionId} onComplete={onComplete} onSkip={onSkip} />
      </div>
    </div>
  )
}

// Wrapper for lazy loading SharePearl
function SharePearlWrapper({
  insightId,
  insightText,
  onComplete,
  onCancel
}: {
  insightId: string
  insightText: string
  onComplete: () => void
  onCancel: () => void
}) {
  const [SharePearl, setSharePearl] = useState<React.ComponentType<{
    insightId: string
    insightText: string
    isAlreadyShared?: boolean
    onClose: () => void
    onSuccess: (pearlId: string) => void
    onDelete: () => void
  }> | null>(null)

  useEffect(() => {
    import('./SharePearl').then(module => {
      setSharePearl(() => module.SharePearl)
    })
  }, [])

  if (!SharePearl) {
    return (
      <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50">
        <div className="w-1 h-1 bg-cream rounded-full animate-pulse" />
      </div>
    )
  }

  return (
    <SharePearl
      insightId={insightId}
      insightText={insightText}
      onClose={onCancel}
      onSuccess={async (pearlId) => {
        // Mark insight as shared - wrapped in try/catch to ensure modal closes
        // even if IndexedDB fails (Safari PWA can have stale connections)
        try {
          const { markInsightAsShared } = await import('../lib/db')
          await markInsightAsShared(insightId, pearlId)
        } catch (err) {
          console.error('Failed to mark insight as shared:', err)
        }
        onComplete()
      }}
      onDelete={async () => {
        // Delete the insight - wrapped in try/catch for Safari PWA resilience
        try {
          const { deleteInsight } = await import('../lib/db')
          await deleteInsight(insightId)
        } catch (err) {
          console.error('Failed to delete insight:', err)
        }
        onComplete()
      }}
    />
  )
}

// Wrapper for lazy loading TemplateEditor
function TemplateEditorWrapper({
  onClose,
  onPublished,
  creatorHours
}: {
  onClose: () => void
  onPublished: () => void
  creatorHours: number
}) {
  const [TemplateEditor, setTemplateEditor] = useState<React.ComponentType<{
    onClose: () => void
    onPublished: () => void
    creatorHours: number
  }> | null>(null)

  useEffect(() => {
    import('./TemplateEditor').then(module => {
      setTemplateEditor(() => module.TemplateEditor)
    })
  }, [])

  if (!TemplateEditor) {
    return (
      <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50">
        <div className="w-1 h-1 bg-cream rounded-full animate-pulse" />
      </div>
    )
  }

  return <TemplateEditor onClose={onClose} onPublished={onPublished} creatorHours={creatorHours} />
}
