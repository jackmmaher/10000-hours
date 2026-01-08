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
import { useAuthStore } from '../stores/useAuthStore'
import { useSwipe } from '../hooks/useSwipe'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import type { Pearl } from '../lib/pearls'
import type { SessionTemplate } from './SessionDetailModal'
import { WeekStonesRow, getDayStatusWithPlan, ExtendedDayStatus } from './WeekStones'
import { JourneyNextSession } from './JourneyNextSession'
import { InsightStream } from './InsightStream'
import { Calendar } from './Calendar'
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
  const { sessions, setView } = useSessionStore()
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
            active={subTab === 'saved'}
            onClick={() => setSubTab('saved')}
          >
            Meditations
          </TabButton>
          <TabButton
            active={subTab === 'pearls'}
            onClick={() => setSubTab('pearls')}
          >
            Pearls
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
        {subTab === 'saved' && (
          <SavedContent
            onCreateNew={user ? () => setShowTemplateEditor(true) : undefined}
          />
        )}
        {subTab === 'pearls' && (
          <MyPearlsContent />
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

// Saved content - shows saved session templates from Explore
function SavedContent({ onCreateNew }: { onCreateNew?: () => void }) {
  const [savedSessions, setSavedSessions] = useState<SessionTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<SessionTemplate | null>(null)
  const [getIntentionGradient, setGetIntentionGradient] = useState<((intention: string) => string) | null>(null)

  useEffect(() => {
    // Load the gradient function
    import('../lib/animations').then(module => {
      setGetIntentionGradient(() => module.getIntentionGradient)
    })
  }, [])

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const { getSavedTemplates } = await import('../lib/db')
        const savedTemplates = await getSavedTemplates()

        if (savedTemplates.length === 0) {
          setSavedSessions([])
          setIsLoading(false)
          return
        }

        // Load session data to match saved template IDs
        const sessionsModule = await import('../data/sessions.json')
        const allSessions = sessionsModule.default as Array<{
          id: string
          title: string
          tagline: string
          hero_gradient: string
          duration_guidance: string
          discipline: string
          posture: string
          best_time: string
          environment?: string
          guidance_notes: string
          intention: string
          recommended_after_hours: number
          tags?: string[]
          seed_karma: number
          seed_saves: number
          seed_completions: number
          creator_hours: number
        }>

        // Map saved template IDs to full session data
        const savedIds = new Set(savedTemplates.map(t => t.templateId))
        const matched = allSessions
          .filter(s => savedIds.has(s.id))
          .map(s => ({
            id: s.id,
            title: s.title,
            tagline: s.tagline,
            durationGuidance: s.duration_guidance,
            discipline: s.discipline,
            posture: s.posture,
            bestTime: s.best_time,
            environment: s.environment,
            guidanceNotes: s.guidance_notes,
            intention: s.intention,
            recommendedAfterHours: s.recommended_after_hours,
            tags: s.tags,
            karma: s.seed_karma,
            saves: s.seed_saves,
            completions: s.seed_completions,
            creatorHours: s.creator_hours
          }))

        setSavedSessions(matched)
      } catch (err) {
        console.error('Failed to load saved sessions:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadSaved()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-ink/10 border-t-ink/40 rounded-full animate-spin" />
      </div>
    )
  }

  // Empty state with create invitation
  if (savedSessions.length === 0) {
    return (
      <div className="space-y-4">
        {/* Create invitation card - always first when available */}
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="w-full group relative overflow-hidden rounded-2xl border-2 border-dashed border-ink/10 hover:border-ink/20 transition-all"
          >
            <div className="p-6 flex flex-col items-center justify-center min-h-[140px]">
              <div className="w-10 h-10 rounded-full bg-cream-deep flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-ink/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="font-serif text-ink/70 mb-1">Create your own</p>
              <p className="text-xs text-ink/40">Share your practice with others</p>
            </div>
          </button>
        )}

        {/* Browse prompt */}
        <div className="text-center py-8">
          <p className="text-ink/40 text-sm mb-2">
            No saved meditations yet
          </p>
          <button
            onClick={() => useSessionStore.getState().setView('explore')}
            className="text-sm text-moss hover:text-moss/80 transition-colors"
          >
            Discover meditations
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {/* Create invitation card - first in list */}
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="w-full group relative overflow-hidden rounded-2xl border-2 border-dashed border-ink/10 hover:border-ink/20 transition-all"
          >
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cream-deep flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-ink/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-serif text-ink/70">Create your own meditation</p>
                <p className="text-xs text-ink/40 mt-0.5">Share your practice with the community</p>
              </div>
            </div>
          </button>
        )}

        {/* Saved meditation cards with gradient accent */}
        {savedSessions.map((session) => {
          const gradient = getIntentionGradient ? getIntentionGradient(session.intention) : 'from-[#9DB4A0] to-[#5C7C5E]'
          return (
            <button
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className="w-full text-left group relative overflow-hidden rounded-2xl bg-cream transition-all hover:shadow-md active:scale-[0.99]"
            >
              {/* Gradient accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${gradient}`} />

              <div className="p-4 pl-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-ink/40 font-medium">{session.discipline}</span>
                      <span className="text-ink/20">·</span>
                      <span className="text-xs text-ink/40">{session.durationGuidance}</span>
                    </div>
                    <p className="font-serif text-ink mb-1 leading-snug">{session.title}</p>
                    <p className="text-sm text-ink/50 line-clamp-1 italic">"{session.tagline}"</p>
                  </div>

                  {/* Bookmark indicator */}
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-ink/20 group-hover:text-ink/40 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Session detail modal */}
      {selectedSession && (
        <SessionDetailModalWrapper
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onAdopt={() => {
            setSelectedSession(null)
          }}
        />
      )}
    </>
  )
}

// My Pearls content - shows created + saved pearls with clear separation
function MyPearlsContent() {
  const { user } = useAuthStore()
  const [createdPearls, setCreatedPearls] = useState<Pearl[]>([])
  const [savedPearls, setSavedPearls] = useState<Pearl[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingPearlId, setEditingPearlId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const loadPearls = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }
    try {
      const { getMyPearls, getSavedPearls } = await import('../lib/pearls')
      const [created, saved] = await Promise.all([
        getMyPearls(user.id),
        getSavedPearls(user.id)
      ])
      setCreatedPearls(created)
      setSavedPearls(saved)
    } catch (err) {
      console.error('Failed to load pearls:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPearls()
  }, [user])

  const handleUnsave = async (pearlId: string) => {
    if (!user) return
    try {
      const { unsavePearl } = await import('../lib/pearls')
      await unsavePearl(pearlId, user.id)
      setSavedPearls(prev => prev.filter(p => p.id !== pearlId))
    } catch (err) {
      console.error('Failed to unsave pearl:', err)
    }
  }

  const handleStartEdit = (pearl: Pearl) => {
    setEditingPearlId(pearl.id)
    setEditText(pearl.text)
  }

  const handleCancelEdit = () => {
    setEditingPearlId(null)
    setEditText('')
  }

  const handleSaveEdit = async () => {
    if (!user || !editingPearlId || isSavingEdit) return
    if (editText.length > 280) return

    setIsSavingEdit(true)
    try {
      const { updatePearl } = await import('../lib/pearls')
      const success = await updatePearl(editingPearlId, editText, user.id)
      if (success) {
        setCreatedPearls(prev =>
          prev.map(p => p.id === editingPearlId
            ? { ...p, text: editText, editedAt: new Date().toISOString() }
            : p
          )
        )
        setEditingPearlId(null)
        setEditText('')
      }
    } catch (err) {
      console.error('Failed to update pearl:', err)
    } finally {
      setIsSavingEdit(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-ink/10 border-t-ink/40 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-cream-deep to-cream flex items-center justify-center shadow-inner">
          <div className="w-6 h-6 rounded-full bg-cream-deep" />
        </div>
        <p className="text-ink/50 text-sm">
          Sign in to see your pearls
        </p>
      </div>
    )
  }

  const hasNoPearls = createdPearls.length === 0 && savedPearls.length === 0

  if (hasNoPearls) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-cream-deep to-cream flex items-center justify-center shadow-inner">
          <div className="w-6 h-6 rounded-full bg-cream-deep" />
        </div>
        <p className="text-ink/50 text-sm mb-1">
          No pearls yet
        </p>
        <p className="text-ink/30 text-xs">
          Distill insights into wisdom, or save pearls from Explore
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Created by me section */}
      {createdPearls.length > 0 && (
        <div>
          <p className="text-xs text-ink/40 font-medium uppercase tracking-wider mb-4">
            My Wisdom
          </p>
          <div className="space-y-4">
            {createdPearls.map((pearl) => (
              <div
                key={pearl.id}
                className="relative bg-cream rounded-2xl p-5 shadow-sm border border-ink/5"
              >
                {/* Polished pearl indicator - subtle shimmer line */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Small pearl orb */}
                    <div className="w-5 h-5 rounded-full bg-cream-deep shadow-sm" />
                    <span className="text-xs text-ink/40">
                      {new Date(pearl.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                      {pearl.editedAt && <span className="italic ml-1">· edited</span>}
                    </span>
                  </div>
                  {editingPearlId !== pearl.id && (
                    <button
                      onClick={() => handleStartEdit(pearl)}
                      className="text-xs text-ink/30 hover:text-ink/60 transition-colors px-2 py-1 -mr-2"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {editingPearlId === pearl.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full h-24 px-3 py-2 rounded-xl bg-white/50 text-ink placeholder:text-ink/30 resize-none focus:outline-none focus:ring-2 focus:ring-moss/20 font-serif"
                      maxLength={280}
                      autoFocus
                    />
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${editText.length > 280 ? 'text-rose-500' : 'text-ink/30'}`}>
                        {editText.length}/280
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancelEdit}
                          className="text-xs text-ink/50 hover:text-ink/70 transition-colors px-3 py-1.5"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={isSavingEdit || editText.length === 0 || editText.length > 280}
                          className="text-xs bg-ink text-cream font-medium hover:bg-ink/90 transition-colors px-3 py-1.5 rounded-lg disabled:opacity-50"
                        >
                          {isSavingEdit ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="font-serif text-ink leading-relaxed text-[15px]">
                    "{pearl.text}"
                  </p>
                )}

                {editingPearlId !== pearl.id && (
                  <div className="flex items-center gap-1 mt-4 text-ink/30">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
                    </svg>
                    <span className="text-xs tabular-nums">{pearl.upvotes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved from community section */}
      {savedPearls.length > 0 && (
        <div>
          <p className="text-xs text-ink/40 font-medium uppercase tracking-wider mb-4">
            Collected Wisdom
          </p>
          <div className="space-y-4">
            {savedPearls.map((pearl) => (
              <div
                key={pearl.id}
                className="relative bg-cream-warm rounded-2xl p-5 border border-ink/5"
              >
                {/* Subtle top highlight */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Saved pearl orb - slightly different tone */}
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#D8D4CF] to-[#B8B4AF]" />
                    {pearl.isPreserved && (
                      <span className="text-xs text-ink/30 italic">preserved</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleUnsave(pearl.id)}
                    className="text-xs text-ink/30 hover:text-rose-400 transition-colors px-2 py-1 -mr-2"
                  >
                    Remove
                  </button>
                </div>

                <p className="font-serif text-ink/80 leading-relaxed text-[15px]">
                  "{pearl.text}"
                </p>

                <div className="flex items-center gap-1 mt-4 text-ink/25">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
                  </svg>
                  <span className="text-xs tabular-nums">{pearl.upvotes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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

// Wrapper for lazy loading SessionDetailModal
function SessionDetailModalWrapper({
  session,
  onClose,
  onAdopt
}: {
  session: SessionTemplate
  onClose: () => void
  onAdopt: () => void
}) {
  const [SessionDetailModal, setSessionDetailModal] = useState<React.ComponentType<{
    session: SessionTemplate
    onClose: () => void
    onAdopt: () => void
  }> | null>(null)

  useEffect(() => {
    import('./SessionDetailModal').then(module => {
      setSessionDetailModal(() => module.SessionDetailModal)
    })
  }, [])

  if (!SessionDetailModal) {
    return (
      <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50">
        <div className="w-1 h-1 bg-cream rounded-full animate-pulse" />
      </div>
    )
  }

  return <SessionDetailModal session={session} onClose={onClose} onAdopt={onAdopt} />
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
