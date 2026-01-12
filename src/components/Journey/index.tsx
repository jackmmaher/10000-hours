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
import { useSessionStore } from '../../stores/useSessionStore'
import { useNavigationStore } from '../../stores/useNavigationStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useSwipe } from '../../hooks/useSwipe'
import { usePullToRefresh } from '../../hooks/usePullToRefresh'
import { WeekStonesRow, getDayStatusWithPlan, ExtendedDayStatus } from '../WeekStones'
import { NextSessionSpotlight } from '../NextSessionSpotlight'
import { InsightStream } from '../InsightStream'
import { Calendar } from '../Calendar'
import { JourneySavedContent } from '../JourneySavedContent'
import { JourneyMyPearls } from '../JourneyMyPearls'
import {
  getPlannedSessionsForWeek,
  getNextPlannedSession,
  relinkOrphanedPlans,
  PlannedSession,
  Session,
  Insight,
} from '../../lib/db'
import { dateHasSession, getSessionsForDate } from '../../lib/calculations'
import { getMondayOfWeek } from './utils'
import { TabButton } from './TabButton'
import {
  MeditationPlannerWrapper,
  InsightCaptureWrapper,
  SharePearlWrapper,
  TemplateEditorWrapper,
} from './wrappers'

type JourneySubTab = 'sessions' | 'saved' | 'pearls'

export function Journey() {
  const { sessions, lastPlanChange } = useSessionStore()
  const {
    setView,
    journeySubTab: navSubTab,
    openPlanningModal: navOpenPlanning,
    scrollToSubTabs: navScrollToSubTabs,
    clearNavigationIntent,
  } = useNavigationStore()
  const { user } = useAuthStore()

  const [subTab, setSubTab] = useState<JourneySubTab>('sessions')
  const [weekPlans, setWeekPlans] = useState<PlannedSession[]>([])
  const [planningDate, setPlanningDate] = useState<Date | null>(null)
  const [selectedDaySessions, setSelectedDaySessions] = useState<Session[]>([])
  const [plansRefreshKey, setPlansRefreshKey] = useState(0)
  const [insightSession, setInsightSession] = useState<Session | null>(null)
  const [pearlInsight, setPearlInsight] = useState<Insight | null>(null)
  const [insightStreamKey, setInsightStreamKey] = useState(0)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [nextPlannedSession, setNextPlannedSession] = useState<PlannedSession | null>(null)

  // Calculate total hours for creator badge
  const totalHours = useMemo(() => {
    const totalSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0)
    return Math.floor(totalSeconds / 3600)
  }, [sessions])

  // Unified refresh function
  const refreshAllPlanData = useCallback(() => {
    setPlansRefreshKey((k) => k + 1)
  }, [])

  // References for scroll container and sub-tabs section
  const scrollRef = useRef<HTMLDivElement>(null)
  const subTabsRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  // Pull-to-refresh
  const {
    isPulling,
    isRefreshing,
    pullDistance,
    handlers: pullHandlers,
  } = usePullToRefresh({
    onRefresh: async () => {
      await relinkOrphanedPlans(sessions)
      refreshAllPlanData()
      setInsightStreamKey((k) => k + 1)
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
  })

  // Swipe navigation
  const navSwipeHandlers = useSwipe({
    onSwipeDown: () => {
      if (scrollRef.current && scrollRef.current.scrollTop > 50) {
        setView('timer')
      }
    },
    onSwipeLeft: () => setView('explore'),
    onSwipeRight: () => setView('timer'),
  })

  // Load planned sessions for the current week
  useEffect(() => {
    const loadWeekPlans = async () => {
      await relinkOrphanedPlans(sessions)
      const monday = getMondayOfWeek()
      const plans = await getPlannedSessionsForWeek(monday.getTime())
      setWeekPlans(plans)
    }
    loadWeekPlans()
  }, [sessions, plansRefreshKey])

  // Compute week day statuses
  const weekDays = useMemo((): ExtendedDayStatus[] => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const dayOfWeek = todayStart.getDay()
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const monday = new Date(todayStart)
    monday.setDate(todayStart.getDate() - daysFromMonday)

    const tomorrow = new Date(todayStart)
    tomorrow.setDate(todayStart.getDate() + 1)

    return Array.from({ length: 7 }, (_, i) => {
      const dayDate = new Date(monday)
      dayDate.setDate(monday.getDate() + i)

      const hasSession = dateHasSession(sessions, dayDate)
      const hasPlan = weekPlans.some((p) => {
        const planDate = new Date(p.date)
        planDate.setHours(0, 0, 0, 0)
        return planDate.getTime() === dayDate.getTime() && !p.completed
      })

      const isToday = dayDate.getTime() === todayStart.getTime()
      const isTomorrow = dayDate.getTime() === tomorrow.getTime()
      const isFuture = dayDate.getTime() > todayStart.getTime()
      const isPast = dayDate.getTime() < todayStart.getTime()
      const isNextPlannable = isTomorrow && !hasSession

      return getDayStatusWithPlan(hasSession, hasPlan, isToday, isFuture, isNextPlannable, isPast)
    })
  }, [sessions, weekPlans])

  // Handle day click
  const handleDayClick = (_dayIndex: number, date: Date) => {
    const daySessions = getSessionsForDate(sessions, date).sort((a, b) => b.startTime - a.startTime)
    setSelectedDaySessions(daySessions)
    setPlanningDate(date)
  }

  // Scroll to calendar and optionally open planning modal
  const scrollToCalendarAndPlan = useCallback(
    (date?: Date) => {
      if (calendarRef.current) {
        calendarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      // Small delay to let scroll complete, then open modal
      setTimeout(() => {
        const targetDate = date || new Date()
        targetDate.setHours(0, 0, 0, 0)
        const daySessions = getSessionsForDate(sessions, targetDate).sort(
          (a, b) => b.startTime - a.startTime
        )
        setSelectedDaySessions(daySessions)
        setPlanningDate(targetDate)
      }, 300)
    },
    [sessions]
  )

  // Load next planned session
  useEffect(() => {
    const loadNextPlan = async () => {
      const nextPlan = await getNextPlannedSession()
      setNextPlannedSession(nextPlan || null)
    }
    loadNextPlan()
  }, [sessions, plansRefreshKey, lastPlanChange])

  // Consume navigation intents
  useEffect(() => {
    if (navSubTab) {
      setSubTab(navSubTab)
      // Scroll to sub-tabs section if requested
      if (navScrollToSubTabs && subTabsRef.current) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          subTabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
      clearNavigationIntent()
    }
  }, [navSubTab, navScrollToSubTabs, clearNavigationIntent])

  useEffect(() => {
    if (navOpenPlanning) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      setPlanningDate(today)
      clearNavigationIntent()
    }
  }, [navOpenPlanning, clearNavigationIntent])

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
          opacity: isPulling || isRefreshing ? 1 : 0,
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          )}
          <span className="text-sm text-moss">
            {isRefreshing
              ? 'Refreshing...'
              : pullDistance >= 80
                ? 'Release to refresh'
                : 'Pull to refresh'}
          </span>
        </div>
      </div>

      <div className="px-6 py-8 max-w-lg mx-auto">
        {/* Next Session Spotlight - Hero (2/3 viewport) */}
        <NextSessionSpotlight
          plannedSession={nextPlannedSession}
          onPlanClick={() => {
            if (nextPlannedSession) {
              const planDate = new Date(nextPlannedSession.date)
              planDate.setHours(0, 0, 0, 0)
              scrollToCalendarAndPlan(planDate)
            } else {
              scrollToCalendarAndPlan()
            }
          }}
        />

        {/* Calendar - Planning Hub */}
        <div ref={calendarRef} className="mb-10">
          <Calendar
            embedded
            onDateClick={(date) => handleDayClick(0, date)}
            refreshKey={plansRefreshKey}
          />
        </div>

        {/* Week Summary - Display Only */}
        <div className="mb-10">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-5">This week</p>
          <WeekStonesRow
            days={weekDays}
            onDayClick={(_dayIndex, date) => scrollToCalendarAndPlan(date)}
            showLabels={true}
            size="md"
          />
        </div>

        {/* Sub-tabs */}
        <div ref={subTabsRef} className="flex gap-1 mb-6 bg-cream-deep rounded-lg p-1">
          <TabButton active={subTab === 'sessions'} onClick={() => setSubTab('sessions')}>
            Insights
          </TabButton>
          <TabButton active={subTab === 'pearls'} onClick={() => setSubTab('pearls')}>
            Pearls
          </TabButton>
          <TabButton active={subTab === 'saved'} onClick={() => setSubTab('saved')}>
            Meditations
          </TabButton>
        </div>

        {/* Tab Content */}
        {subTab === 'sessions' && (
          <InsightStream
            key={insightStreamKey}
            onCreatePearl={(insight) => setPearlInsight(insight)}
            refreshKey={insightStreamKey}
          />
        )}
        {subTab === 'pearls' && <JourneyMyPearls />}
        {subTab === 'saved' && (
          <JourneySavedContent onCreateNew={user ? () => setShowTemplateEditor(true) : undefined} />
        )}
      </div>

      {/* Modals */}
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

      {insightSession && (
        <InsightCaptureWrapper
          sessionId={insightSession.uuid}
          onComplete={() => {
            setInsightSession(null)
            setInsightStreamKey((k) => k + 1)
          }}
          onSkip={() => setInsightSession(null)}
        />
      )}

      {pearlInsight && (
        <SharePearlWrapper
          insightId={pearlInsight.id}
          insightText={pearlInsight.formattedText || pearlInsight.rawText}
          onComplete={() => {
            setPearlInsight(null)
            setInsightStreamKey((k) => k + 1)
          }}
          onCancel={() => setPearlInsight(null)}
        />
      )}

      {showTemplateEditor && (
        <TemplateEditorWrapper
          onClose={() => setShowTemplateEditor(false)}
          onPublished={() => setShowTemplateEditor(false)}
          creatorHours={totalHours}
        />
      )}
    </div>
  )
}
