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
import { useAuthStore } from '../stores/useAuthStore'
import { useSwipe } from '../hooks/useSwipe'
import type { Pearl } from '../lib/pearls'
import type { SessionTemplate } from './SessionDetailModal'
import { WeekStonesRow, getDayStatusWithPlan, ExtendedDayStatus } from './WeekStones'
import { JourneyNextSession } from './JourneyNextSession'
import { SessionStream, SessionWithDetails } from './SessionStream'
import { Calendar } from './Calendar'
import {
  getPlannedSessionsForWeek,
  PlannedSession,
  Session
} from '../lib/db'
import { dateHasSession } from '../lib/calculations'

type JourneySubTab = 'sessions' | 'saved' | 'pearls'

export function Journey() {
  const { sessions, setView } = useSessionStore()
  const { user } = useAuthStore()
  const [subTab, setSubTab] = useState<JourneySubTab>('sessions')
  const [weekPlans, setWeekPlans] = useState<PlannedSession[]>([])
  const [planningDate, setPlanningDate] = useState<Date | null>(null)
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0)
  const [insightSession, setInsightSession] = useState<Session | null>(null)
  const [pearlSession, setPearlSession] = useState<SessionWithDetails | null>(null)
  const [sessionStreamKey, setSessionStreamKey] = useState(0) // For refreshing after insight/pearl added
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)

  // Calculate total hours for creator badge
  const totalHours = useMemo(() => {
    const totalSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0)
    return Math.floor(totalSeconds / 3600)
  }, [sessions])

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
          <Calendar
            embedded
            onDateClick={(date) => setPlanningDate(date)}
            refreshKey={calendarRefreshKey}
          />
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 mb-4 bg-cream-deep rounded-lg p-1">
          <TabButton
            active={subTab === 'sessions'}
            onClick={() => setSubTab('sessions')}
          >
            My Meditations
          </TabButton>
          <TabButton
            active={subTab === 'saved'}
            onClick={() => setSubTab('saved')}
          >
            Guided
          </TabButton>
          <TabButton
            active={subTab === 'pearls'}
            onClick={() => setSubTab('pearls')}
          >
            My Pearls
          </TabButton>
        </div>

        {/* Create button - only show when logged in */}
        {user && (
          <button
            onClick={() => setShowTemplateEditor(true)}
            className="w-full mb-6 py-3 px-4 bg-cream-deep hover:bg-cream-deep/80 rounded-xl text-sm text-ink/60 hover:text-ink/80 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            Create Guided Meditation
          </button>
        )}

        {/* Tab Content */}
        {subTab === 'sessions' && (
          <SessionStream
            key={sessionStreamKey}
            sessions={sessions}
            onAddInsight={(session) => setInsightSession(session)}
            onCreatePearl={(session) => setPearlSession(session)}
          />
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
            // Also refresh calendar
            setCalendarRefreshKey(k => k + 1)
          }}
        />
      )}

      {/* Insight capture modal for adding insights */}
      {insightSession && (
        <InsightCaptureWrapper
          sessionId={insightSession.uuid}
          onComplete={() => {
            setInsightSession(null)
            // Refresh session stream to show new insight
            setSessionStreamKey(k => k + 1)
          }}
          onSkip={() => setInsightSession(null)}
        />
      )}

      {/* Pearl creation modal */}
      {pearlSession && pearlSession.insight && (
        <SharePearlWrapper
          insightId={pearlSession.insight.id!}
          insightText={pearlSession.insight.formattedText || pearlSession.insight.rawText}
          onComplete={() => {
            setPearlSession(null)
            // Refresh session stream to show pearl status
            setSessionStreamKey(k => k + 1)
          }}
          onCancel={() => setPearlSession(null)}
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

  if (!InsightCapture) {
    return (
      <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50">
        <div className="w-1 h-1 bg-cream rounded-full animate-pulse" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-end justify-center">
      <div className="bg-cream rounded-t-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl animate-slide-up">
        <InsightCapture sessionId={sessionId} onComplete={onComplete} onSkip={onSkip} />
      </div>
    </div>
  )
}

// Saved content - shows saved session templates from Explore
function SavedContent() {
  const [savedSessions, setSavedSessions] = useState<SessionTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<SessionTemplate | null>(null)

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

  if (savedSessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cream-deep flex items-center justify-center">
          <svg className="w-6 h-6 text-ink/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <p className="text-ink/50 text-sm">
          No saved sessions yet.
        </p>
        <p className="text-ink/30 text-xs mt-2">
          Save sessions from Explore to find them here.
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

  return (
    <>
      <div className="space-y-3">
        {savedSessions.map((session) => (
          <button
            key={session.id}
            onClick={() => setSelectedSession(session)}
            className="w-full text-left bg-cream-deep rounded-xl p-4 transition-all hover:bg-cream-deep/80 active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-indigo-deep" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-xs text-ink/40">{session.discipline}</span>
            </div>
            <p className="font-serif text-ink mb-1">{session.title}</p>
            <p className="text-sm text-ink/50 line-clamp-2">"{session.tagline}"</p>
            <div className="flex gap-2 mt-2 text-xs text-ink/40">
              <span>{session.durationGuidance}</span>
              <span>·</span>
              <span>{session.posture}</span>
            </div>
          </button>
        ))}
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
          prev.map(p => p.id === editingPearlId ? { ...p, text: editText } : p)
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
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cream-deep flex items-center justify-center">
          <span className="text-2xl">✦</span>
        </div>
        <p className="text-ink/50 text-sm">
          Sign in to see your pearls.
        </p>
      </div>
    )
  }

  const hasNoPearls = createdPearls.length === 0 && savedPearls.length === 0

  if (hasNoPearls) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cream-deep flex items-center justify-center">
          <span className="text-2xl">✦</span>
        </div>
        <p className="text-ink/50 text-sm">
          No pearls yet.
        </p>
        <p className="text-ink/30 text-xs mt-2">
          Create pearls from insights or save from Explore.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Created by me section */}
      {createdPearls.length > 0 && (
        <div>
          <p className="text-xs text-ink/40 font-medium uppercase tracking-wider mb-3">
            Created by me
          </p>
          <div className="space-y-3">
            {createdPearls.map((pearl) => (
              <div key={pearl.id} className="bg-cream-deep rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-moss font-medium">✦ Pearl</span>
                    <span className="text-xs text-ink/30">
                      {new Date(pearl.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {editingPearlId !== pearl.id && (
                    <button
                      onClick={() => handleStartEdit(pearl)}
                      className="text-xs text-ink/30 hover:text-ink/60 transition-colors"
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
                      className="w-full h-24 px-3 py-2 rounded-lg bg-cream text-ink placeholder:text-ink/30 resize-none focus:outline-none focus:ring-2 focus:ring-moss/30 font-serif"
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
                          className="text-xs text-ink/50 hover:text-ink/70 transition-colors px-3 py-1"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={isSavingEdit || editText.length === 0 || editText.length > 280}
                          className="text-xs text-moss font-medium hover:text-moss/80 transition-colors px-3 py-1 disabled:opacity-50"
                        >
                          {isSavingEdit ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="font-serif text-ink leading-relaxed mb-4">
                    "{pearl.text}"
                  </p>
                )}

                {editingPearlId !== pearl.id && (
                  <div className="flex items-center gap-4 text-sm text-ink/40">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
                      </svg>
                      <span className="tabular-nums">{pearl.upvotes}</span>
                    </span>
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
          <p className="text-xs text-ink/40 font-medium uppercase tracking-wider mb-3">
            Saved from community
          </p>
          <div className="space-y-3">
            {savedPearls.map((pearl) => (
              <div key={pearl.id} className="bg-cream-deep rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-indigo-deep font-medium">✦ Saved</span>
                    {pearl.isPreserved && (
                      <span className="text-xs text-ink/30">(original removed)</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleUnsave(pearl.id)}
                    className="text-xs text-ink/30 hover:text-rose-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <p className="font-serif text-ink leading-relaxed mb-4">
                  "{pearl.text}"
                </p>
                <div className="flex items-center gap-4 text-sm text-ink/40">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
                    </svg>
                    <span className="tabular-nums">{pearl.upvotes}</span>
                  </span>
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
        // Mark insight as shared
        const { markInsightAsShared } = await import('../lib/db')
        await markInsightAsShared(insightId, pearlId)
        onComplete()
      }}
      onDelete={async () => {
        // Delete the insight
        const { deleteInsight } = await import('../lib/db')
        await deleteInsight(insightId)
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
