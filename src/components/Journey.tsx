/**
 * Journey - Personal meditation space
 *
 * The Journey tab is the user's personal space for:
 * - Planning upcoming sessions
 * - Viewing session history with insights
 * - Managing saved templates and pearls
 *
 * Layout:
 * - Top: "Your Next Moment" card (next planned session or invite to plan)
 * - Center: Week stones (M-S with status indicators)
 * - Bottom: Session stream with insights
 * - Sub-tabs: My Sessions | Saved | My Pearls
 */

import { useState, useMemo, useEffect } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useSwipe } from '../hooks/useSwipe'
import { WeekStonesRow, getDayStatusWithPlan, ExtendedDayStatus } from './WeekStones'
import { JourneyNextSession } from './JourneyNextSession'
import { SessionStream } from './SessionStream'
import { Calendar } from './Calendar'
import {
  getPlannedSessionsForWeek,
  PlannedSession
} from '../lib/db'
import { dateHasSession } from '../lib/calculations'

type JourneySubTab = 'sessions' | 'saved' | 'pearls'

export function Journey() {
  const { sessions, setView } = useSessionStore()
  const [subTab, setSubTab] = useState<JourneySubTab>('sessions')
  const [weekPlans, setWeekPlans] = useState<PlannedSession[]>([])
  const [planningDate, setPlanningDate] = useState<Date | null>(null)

  // Swipe navigation
  const navSwipeHandlers = useSwipe({
    onSwipeDown: () => setView('timer'),
    onSwipeLeft: () => setView('explore'),
    onSwipeRight: () => setView('timer')
  })

  // Load planned sessions for the current week
  useEffect(() => {
    const loadWeekPlans = async () => {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const monday = new Date(today)
      monday.setDate(today.getDate() + mondayOffset)
      monday.setHours(0, 0, 0, 0)

      const plans = await getPlannedSessionsForWeek(monday.getTime())
      setWeekPlans(plans)
    }
    loadWeekPlans()
  }, [sessions]) // Reload when sessions change (may have linked a plan)

  // Compute week day statuses with plan data
  const weekDays = useMemo((): ExtendedDayStatus[] => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    monday.setHours(0, 0, 0, 0)

    // Check if today has a session (for determining 'next' glow)
    const todayHasSessionFlag = dateHasSession(sessions, today)
    const tomorrowIndex = todayIndex < 6 ? todayIndex + 1 : null

    return Array.from({ length: 7 }, (_, i) => {
      const dayDate = new Date(monday)
      dayDate.setDate(monday.getDate() + i)
      dayDate.setHours(0, 0, 0, 0)

      const hasSession = dateHasSession(sessions, dayDate)
      const plan = weekPlans.find(p => {
        const planDate = new Date(p.date)
        planDate.setHours(0, 0, 0, 0)
        return planDate.getTime() === dayDate.getTime()
      })
      const hasPlan = !!plan
      const isToday = i === todayIndex
      const isFuture = i > todayIndex
      const isPast = i < todayIndex
      const isNextPlannable = todayHasSessionFlag && tomorrowIndex !== null && i === tomorrowIndex

      return getDayStatusWithPlan(hasSession, hasPlan, isToday, isFuture, isNextPlannable, isPast)
    })
  }, [sessions, weekPlans])

  // Handle day click - open planner for that day
  const handleDayClick = (_dayIndex: number, date: Date) => {
    setPlanningDate(date)
  }

  // Get next planned session
  const nextPlannedSession = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const nowTime = now.getTime()

    // Find the next upcoming plan that isn't completed
    return weekPlans
      .filter(p => p.date >= nowTime && !p.completed)
      .sort((a, b) => a.date - b.date)[0] || null
  }, [weekPlans])

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

        {/* Your Next Moment */}
        <JourneyNextSession
          plannedSession={nextPlannedSession}
          onPlanClick={() => {
            // Open planner for today or next plannable day
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            setPlanningDate(today)
          }}
        />

        {/* Week Stones */}
        <div className="mb-10">
          <p className="font-serif text-sm text-ink/50 tracking-wide mb-5">
            This Week
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
          <Calendar />
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 mb-6 bg-cream-deep rounded-lg p-1">
          <TabButton
            active={subTab === 'sessions'}
            onClick={() => setSubTab('sessions')}
          >
            My Sessions
          </TabButton>
          <TabButton
            active={subTab === 'saved'}
            onClick={() => setSubTab('saved')}
          >
            Saved
          </TabButton>
          <TabButton
            active={subTab === 'pearls'}
            onClick={() => setSubTab('pearls')}
          >
            My Pearls
          </TabButton>
        </div>

        {/* Tab Content */}
        {subTab === 'sessions' && (
          <SessionStream sessions={sessions} />
        )}
        {subTab === 'saved' && (
          <SavedContent />
        )}
        {subTab === 'pearls' && (
          <MyPearlsContent />
        )}
      </div>

      {/* Meditation planner modal - import lazily when needed */}
      {planningDate && (
        <MeditationPlannerWrapper
          date={planningDate}
          onClose={() => setPlanningDate(null)}
          onSave={() => {
            // Reload week plans after save
            const loadWeekPlans = async () => {
              const today = new Date()
              const dayOfWeek = today.getDay()
              const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
              const monday = new Date(today)
              monday.setDate(today.getDate() + mondayOffset)
              monday.setHours(0, 0, 0, 0)
              const plans = await getPlannedSessionsForWeek(monday.getTime())
              setWeekPlans(plans)
            }
            loadWeekPlans()
          }}
        />
      )}
    </div>
  )
}

// Tab button component
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
      className={`
        flex-1 py-2 px-3 text-sm rounded-md transition-all
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
  onClose,
  onSave
}: {
  date: Date
  onClose: () => void
  onSave: () => void
}) {
  // Import the existing MeditationPlanner
  const [MeditationPlanner, setMeditationPlanner] = useState<React.ComponentType<{
    date: Date
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

  return <MeditationPlanner date={date} onClose={onClose} onSave={onSave} />
}

// Placeholder for Saved content
function SavedContent() {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cream-deep flex items-center justify-center">
        <svg className="w-6 h-6 text-ink/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </div>
      <p className="text-ink/50 text-sm">
        Sessions you save from Explore will appear here.
      </p>
      <button
        onClick={() => useSessionStore.getState().setView('explore')}
        className="mt-4 text-sm text-moss hover:text-moss/80 transition-colors"
      >
        Browse sessions →
      </button>
    </div>
  )
}

// Placeholder for My Pearls content
function MyPearlsContent() {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cream-deep flex items-center justify-center">
        <span className="text-2xl">✦</span>
      </div>
      <p className="text-ink/50 text-sm">
        Pearls you've shared with the community will appear here.
      </p>
      <button
        onClick={() => useSessionStore.getState().setView('timer')}
        className="mt-4 text-sm text-moss hover:text-moss/80 transition-colors"
      >
        Start a session →
      </button>
    </div>
  )
}
