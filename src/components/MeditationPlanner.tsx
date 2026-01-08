/**
 * MeditationPlanner - Plan or view meditation sessions
 *
 * Two modes:
 * 1. Plan mode (no sessions): For future dates, all fields editable
 * 2. Session mode (has sessions): For past sessions, shows read-only time/duration,
 *    allows editing metadata (pose, discipline, notes), displays insight if captured
 *
 * Supports multiple sessions per day with a session selector.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  PlannedSession,
  Session,
  Insight,
  addPlannedSession,
  getPlannedSession,
  updatePlannedSession,
  deletePlannedSession,
  getInsightsBySessionId,
  updateSession,
  getSessionByUuid
} from '../lib/db'
import { SessionDetailModal, SessionTemplate } from './SessionDetailModal'
import { POSE_GROUPS, DISCIPLINE_GROUPS, DURATION_CATEGORIES } from '../lib/meditation-options'

// Import extracted session data for template lookups
import extractedSessions from '../data/sessions.json'

interface MeditationPlannerProps {
  date: Date
  sessions: Session[]  // All sessions for this date (may be empty for future dates)
  onClose: () => void
  onSave: () => void
}

// Track edits for each session independently
interface SessionEdits {
  pose: string
  discipline: string
  notes: string
}

function formatDateForDisplay(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  if (targetDate.getTime() === today.getTime()) {
    return 'Today'
  } else if (targetDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow'
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    })
  }
}

function getStartOfDay(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

// Format date for input value (YYYY-MM-DD)
function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Format time from timestamp (HH:MM AM/PM)
function formatTimeFromTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Format duration in minutes to readable string
function formatDurationMinutes(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} hr`
  }
  return `${hours} hr ${remainingMinutes} min`
}

// Raw extracted session type (snake_case from JSON)
interface ExtractedSession {
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
  course_id?: string
  course_position?: number
}

// Look up a session template by ID and transform to SessionTemplate format
function getTemplateById(templateId: string): SessionTemplate | null {
  const raw = (extractedSessions as ExtractedSession[]).find(s => s.id === templateId)
  if (!raw) return null
  return {
    id: raw.id,
    title: raw.title,
    tagline: raw.tagline,
    durationGuidance: raw.duration_guidance,
    discipline: raw.discipline,
    posture: raw.posture,
    bestTime: raw.best_time,
    environment: raw.environment,
    guidanceNotes: raw.guidance_notes,
    intention: raw.intention,
    recommendedAfterHours: raw.recommended_after_hours,
    tags: raw.tags,
    karma: raw.seed_karma,
    saves: raw.seed_saves,
    completions: raw.seed_completions,
    creatorHours: raw.creator_hours,
    courseId: raw.course_id,
    coursePosition: raw.course_position
  }
}

export function MeditationPlanner({ date, sessions, onClose, onSave }: MeditationPlannerProps) {
  // Multiple sessions support
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0)
  const session = sessions.length > 0 ? sessions[selectedSessionIndex] : null
  const hasMultipleSessions = sessions.length > 1

  // Determine if we're viewing a completed session vs planning
  const isSessionMode = !!session
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [existingPlan, setExistingPlan] = useState<PlannedSession | null>(null)
  const [insight, setInsight] = useState<Insight | null>(null)

  // Form state - selectedDate can be changed by user
  const [selectedDate, setSelectedDate] = useState<Date>(date)
  const [plannedTime, setPlannedTime] = useState('')
  const [duration, setDuration] = useState<number | null>(null)
  const [durationCategory, setDurationCategory] = useState<string | null>(null)
  const [showCustomDuration, setShowCustomDuration] = useState(false)
  const [customDurationInput, setCustomDurationInput] = useState('')

  // Multi-session edit tracking: Map<sessionUuid, edits>
  // This preserves edits when switching between sessions
  const [sessionEdits, setSessionEdits] = useState<Map<string, SessionEdits>>(new Map())

  // Plan mode state (separate from session mode)
  const [planPose, setPlanPose] = useState('')
  const [planDiscipline, setPlanDiscipline] = useState('')
  const [planNotes, setPlanNotes] = useState('')
  // These persist across date changes to preserve guided meditation link
  const [planTitle, setPlanTitle] = useState('')
  const [planSourceTemplateId, setPlanSourceTemplateId] = useState<string | undefined>(undefined)

  // Source template modal state (for "View full guidance" link)
  const [sourceTemplate, setSourceTemplate] = useState<SessionTemplate | null>(null)

  // Get current session's edits (from map or defaults)
  const currentEdits = session ? sessionEdits.get(session.uuid) : null

  // Use session edits in session mode, plan state in plan mode
  const pose = isSessionMode ? (currentEdits?.pose ?? '') : planPose
  const discipline = isSessionMode ? (currentEdits?.discipline ?? '') : planDiscipline
  const notes = isSessionMode ? (currentEdits?.notes ?? '') : planNotes

  // Update edits - routes to correct state based on mode
  const setPose = useCallback((value: string) => {
    if (isSessionMode && session) {
      setSessionEdits(prev => {
        const newMap = new Map(prev)
        const existing = newMap.get(session.uuid) || { pose: '', discipline: '', notes: '' }
        newMap.set(session.uuid, { ...existing, pose: value })
        return newMap
      })
    } else {
      setPlanPose(value)
    }
  }, [isSessionMode, session])

  const setDiscipline = useCallback((value: string) => {
    if (isSessionMode && session) {
      setSessionEdits(prev => {
        const newMap = new Map(prev)
        const existing = newMap.get(session.uuid) || { pose: '', discipline: '', notes: '' }
        newMap.set(session.uuid, { ...existing, discipline: value })
        return newMap
      })
    } else {
      setPlanDiscipline(value)
    }
  }, [isSessionMode, session])

  const setNotes = useCallback((value: string) => {
    if (isSessionMode && session) {
      setSessionEdits(prev => {
        const newMap = new Map(prev)
        const existing = newMap.get(session.uuid) || { pose: '', discipline: '', notes: '' }
        newMap.set(session.uuid, { ...existing, notes: value })
        return newMap
      })
    } else {
      setPlanNotes(value)
    }
  }, [isSessionMode, session])

  // Fetch insight and session metadata when session changes
  // Only load from DB if we don't already have local edits for this session
  useEffect(() => {
    async function loadSessionData() {
      if (session) {
        // Load insight for this session
        const insights = await getInsightsBySessionId(session.uuid)
        setInsight(insights.length > 0 ? insights[0] : null)

        // Only load metadata from DB if we don't have local edits yet
        // This preserves user edits when switching between sessions
        if (!sessionEdits.has(session.uuid)) {
          const freshSession = await getSessionByUuid(session.uuid)
          setSessionEdits(prev => {
            const newMap = new Map(prev)
            newMap.set(session.uuid, {
              pose: freshSession?.pose || '',
              discipline: freshSession?.discipline || '',
              notes: freshSession?.notes || ''
            })
            return newMap
          })
        }
      } else {
        setInsight(null)
      }
    }
    loadSessionData()
  }, [session, sessionEdits])

  // Load existing plan for selected date (only for plan mode scheduling data)
  useEffect(() => {
    async function load() {
      setIsLoading(true)

      const dateStart = getStartOfDay(selectedDate)
      const existing = await getPlannedSession(dateStart)

      if (existing) {
        setExistingPlan(existing)
        setPlannedTime(existing.plannedTime || '')
        setDuration(existing.duration || null)
        // Set duration category based on existing duration
        if (existing.duration) {
          const cat = DURATION_CATEGORIES.find(c => c.durations.includes(existing.duration!))
          if (cat) {
            setDurationCategory(cat.label)
            setShowCustomDuration(false)
          } else {
            setDurationCategory('custom')
            setShowCustomDuration(true)
            setCustomDurationInput(existing.duration.toString())
          }
        }
        // Only load pose/discipline/notes from plan in plan mode
        // In session mode, these come from the Session object (loaded in separate effect)
        if (!isSessionMode) {
          setPlanPose(existing.pose || '')
          setPlanDiscipline(existing.discipline || '')
          setPlanNotes(existing.notes || '')
        }
        // Load title and sourceTemplateId (only on initial load, preserve across date changes)
        if (!planTitle && existing.title) {
          setPlanTitle(existing.title)
        }
        if (!planSourceTemplateId && existing.sourceTemplateId) {
          setPlanSourceTemplateId(existing.sourceTemplateId)
        }
      }

      setIsLoading(false)
    }
    load()
  }, [selectedDate, isSessionMode])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    const dateStart = getStartOfDay(selectedDate)

    try {
      if (isSessionMode) {
        // Session mode: Save ALL sessions that have edits
        const savePromises: Promise<void>[] = []
        sessionEdits.forEach((edits, uuid) => {
          savePromises.push(
            updateSession(uuid, {
              pose: edits.pose || undefined,
              discipline: edits.discipline || undefined,
              notes: edits.notes || undefined
            })
          )
        })
        await Promise.all(savePromises)
      } else {
        // Plan mode: Save to PlannedSession
        if (existingPlan?.id) {
          await updatePlannedSession(existingPlan.id, {
            date: dateStart,
            plannedTime: plannedTime || undefined,
            duration: duration || undefined,
            title: planTitle || undefined,
            pose: planPose || undefined,
            discipline: planDiscipline || undefined,
            notes: planNotes || undefined,
            sourceTemplateId: planSourceTemplateId
          })
        } else {
          await addPlannedSession({
            date: dateStart,
            plannedTime: plannedTime || undefined,
            duration: duration || undefined,
            title: planTitle || undefined,
            pose: planPose || undefined,
            discipline: planDiscipline || undefined,
            notes: planNotes || undefined,
            sourceTemplateId: planSourceTemplateId
          })
        }
      }
      onSave()
      onClose()
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setIsSaving(false)
    }
  }, [selectedDate, existingPlan, plannedTime, duration, planTitle, planPose, planDiscipline, planNotes, planSourceTemplateId, onSave, onClose, isSessionMode, sessionEdits])

  const handleDelete = useCallback(async () => {
    if (!existingPlan?.id) return
    try {
      await deletePlannedSession(existingPlan.id)
      onSave()
      onClose()
    } catch (err) {
      console.error('Failed to delete plan:', err)
    }
  }, [existingPlan, onSave, onClose])

  // Block swipe navigation when modal is open
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={handleTouchEvent}
      onTouchEnd={handleTouchEvent}
      onTouchMove={handleTouchEvent}
    >
      <div
        className="bg-cream rounded-t-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-ink/20" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b border-ink/5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-xl text-indigo-deep">
                {isSessionMode ? 'Session Details' : (planTitle || 'Plan Meditation')}
              </h2>
              {isSessionMode && (
                <p className="text-sm text-ink-soft mt-1">
                  {formatDateForDisplay(date)}
                </p>
              )}
              {!isSessionMode && planTitle && (
                <p className="text-sm text-ink-soft mt-1">
                  Guided meditation
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 -mr-2 text-ink/40 hover:text-ink/60 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-indigo-deep/20 border-t-indigo-deep rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Session selector - show when multiple sessions on same day */}
              {isSessionMode && hasMultipleSessions && (
                <div>
                  <label className="text-xs text-ink-soft block mb-2">
                    {sessions.length} sessions this day
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {sessions.map((s, index) => (
                      <button
                        key={s.uuid}
                        onClick={() => setSelectedSessionIndex(index)}
                        className={`
                          px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all min-h-[44px]
                          ${selectedSessionIndex === index
                            ? 'bg-accent text-on-accent'
                            : 'bg-elevated text-ink/60 hover:bg-deep'
                          }
                        `}
                      >
                        {formatTimeFromTimestamp(s.startTime)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Session mode: Show read-only time and duration from actual session */}
              {isSessionMode && session && (
                <div className="bg-moss/10 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-ink-soft">Time</span>
                    <span className="text-ink font-medium">
                      {formatTimeFromTimestamp(session.startTime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-ink-soft">Duration</span>
                    <span className="text-ink font-medium">
                      {formatDurationMinutes(session.durationSeconds)}
                    </span>
                  </div>
                </div>
              )}

              {/* Plan mode: Show editable date picker */}
              {!isSessionMode && (
                <div>
                  <label className="text-xs text-ink-soft block mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formatDateForInput(selectedDate)}
                      onChange={(e) => {
                        const newDate = new Date(e.target.value + 'T00:00:00')
                        setSelectedDate(newDate)
                        // Reset form when date changes (will reload any existing plan)
                        setExistingPlan(null)
                        setPlannedTime('')
                        setDuration(null)
                        setDurationCategory(null)
                        setShowCustomDuration(false)
                        setCustomDurationInput('')
                        setPose('')
                        setDiscipline('')
                        setNotes('')
                      }}
                      className="w-full px-4 py-4 pr-12 rounded-xl bg-elevated text-ink text-lg font-medium focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                    <svg
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Source template link - show when plan is from a guided meditation */}
              {!isSessionMode && planSourceTemplateId && (
                <button
                  onClick={() => {
                    const template = getTemplateById(planSourceTemplateId)
                    if (template) setSourceTemplate(template)
                  }}
                  className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>From guided meditation · View full guidance →</span>
                </button>
              )}

              {/* Plan mode: Time and Duration inputs */}
              {!isSessionMode && (
                <>
                  {/* Time */}
                  <div>
                    <label className="text-xs text-ink-soft block mb-2">
                      Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={plannedTime}
                        onChange={(e) => setPlannedTime(e.target.value)}
                        className="w-full px-4 py-4 pr-12 rounded-xl bg-elevated text-ink text-lg font-medium focus:outline-none focus:ring-2 focus:ring-accent/30"
                      />
                      <svg
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft pointer-events-none"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {!plannedTime && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft font-medium pointer-events-none">
                          Tap to set time
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Duration - Progressive disclosure */}
                  <div>
                    <label className="text-xs text-ink-soft block mb-2">
                      Duration
                    </label>

                    {/* Tier 1: Categories */}
                    <div className="flex gap-2">
                      {DURATION_CATEGORIES.map((cat) => (
                        <button
                          key={cat.label}
                          onClick={() => {
                            if (durationCategory === cat.label) {
                              setDurationCategory(null)
                              setDuration(null)
                            } else {
                              setDurationCategory(cat.label)
                              setShowCustomDuration(false)
                              setDuration(null)
                            }
                          }}
                          className={`flex-1 py-2 px-3 rounded-xl text-sm transition-colors min-h-[44px] flex flex-col items-center justify-center ${
                            durationCategory === cat.label
                              ? 'bg-accent text-on-accent'
                              : 'bg-deep/50 text-ink-soft hover:bg-deep'
                          }`}
                        >
                          <span className="font-medium">{cat.label}</span>
                          <span className="text-xs opacity-70">{cat.range}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          if (durationCategory === 'custom') {
                            setDurationCategory(null)
                            setShowCustomDuration(false)
                            setDuration(null)
                          } else {
                            setDurationCategory('custom')
                            setShowCustomDuration(true)
                            setDuration(null)
                          }
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl text-sm transition-colors min-h-[44px] flex items-center justify-center ${
                          durationCategory === 'custom'
                            ? 'bg-accent text-on-accent'
                            : 'bg-deep/50 text-ink-soft hover:bg-deep'
                        }`}
                      >
                        <span className="font-medium">Custom</span>
                      </button>
                    </div>

                    {/* Tier 2: Specific durations within category */}
                    {durationCategory && durationCategory !== 'custom' && (
                      <div className="flex gap-2 mt-3 animate-fade-in">
                        {DURATION_CATEGORIES.find(c => c.label === durationCategory)?.durations.map((d) => (
                          <button
                            key={d}
                            onClick={() => setDuration(duration === d ? null : d)}
                            className={`px-4 py-2 rounded-full text-sm min-h-[44px] transition-colors ${
                              duration === d
                                ? 'bg-accent text-on-accent'
                                : 'bg-deep/30 text-ink-soft hover:bg-deep/50'
                            }`}
                          >
                            {d} min
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Custom duration input */}
                    {showCustomDuration && (
                      <div className="mt-3 animate-fade-in">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="480"
                            placeholder="Enter minutes"
                            value={customDurationInput}
                            onChange={(e) => {
                              setCustomDurationInput(e.target.value)
                              setDuration(e.target.value ? parseInt(e.target.value) : null)
                            }}
                            className="flex-1 px-4 py-3 rounded-xl bg-elevated text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
                            autoFocus
                          />
                          <span className="text-sm text-ink-soft">min</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Position - horizontal scroll with groups */}
              <div>
                <label className="text-xs text-ink-soft block mb-2">
                  Position
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                  {POSE_GROUPS.map((group, groupIndex) => (
                    <div key={group.label} className="flex gap-2 items-center">
                      {group.poses.map((p) => (
                        <button
                          key={p}
                          onClick={() => setPose(pose === p ? '' : p)}
                          className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors min-h-[44px] ${
                            pose === p
                              ? 'bg-accent text-on-accent'
                              : 'bg-deep/50 text-ink-soft hover:bg-deep'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                      {groupIndex < POSE_GROUPS.length - 1 && (
                        <div className="w-px h-6 bg-ink/10 mx-1 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Technique - horizontal scroll with groups */}
              <div>
                <label className="text-xs text-ink-soft block mb-2">
                  Technique
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                  {DISCIPLINE_GROUPS.map((group, groupIndex) => (
                    <div key={group.label} className="flex gap-2 items-center">
                      {group.disciplines.map((d) => (
                        <button
                          key={d}
                          onClick={() => setDiscipline(discipline === d ? '' : d)}
                          className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors min-h-[44px] ${
                            discipline === d
                              ? 'bg-accent text-on-accent'
                              : 'bg-deep/50 text-ink-soft hover:bg-deep'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                      {groupIndex < DISCIPLINE_GROUPS.length - 1 && (
                        <div className="w-px h-6 bg-ink/10 mx-1 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes / Intention */}
              <div>
                <label className="text-xs text-ink-soft block mb-2">
                  {isSessionMode ? 'Intention' : 'Notes'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isSessionMode ? "What was your intention for this session?" : "Set your intention for this session..."}
                  className="w-full h-24 px-4 py-3 rounded-xl bg-deep/50 text-ink placeholder:text-ink/30 resize-none focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>

              {/* Insight display - show in session mode (with content or empty state) */}
              {isSessionMode && (
                <div>
                  <label className="text-xs text-ink-soft block mb-2">
                    Insight captured
                  </label>
                  {insight ? (
                    <div className="bg-accent/5 rounded-xl p-4 border border-accent/10">
                      <p className="text-ink text-sm whitespace-pre-wrap">
                        {insight.formattedText || insight.rawText}
                      </p>
                      <p className="text-xs text-ink/40 mt-2">
                        {new Date(insight.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-deep/30 rounded-xl p-4">
                      <p className="text-ink/40 text-sm italic">
                        No insight captured for this session
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-8 pt-4 border-t border-ink/5 space-y-3 safe-area-bottom">
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="w-full py-3 rounded-xl text-sm font-medium bg-accent text-on-accent hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : isSessionMode ? 'Save Details' : existingPlan ? 'Update Plan' : 'Save Plan'}
          </button>

          {existingPlan && !isSessionMode && (
            <button
              onClick={handleDelete}
              className="w-full py-3 rounded-xl text-sm font-medium border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors active:scale-[0.98]"
            >
              Delete Plan
            </button>
          )}
        </div>
      </div>

      {/* Source template modal - shows full guidance from the original guided meditation */}
      {sourceTemplate && (
        <SessionDetailModal
          session={sourceTemplate}
          onClose={() => setSourceTemplate(null)}
          onAdopt={() => {
            // Already adopted - just close the modal
            setSourceTemplate(null)
          }}
        />
      )}
    </div>
  )
}
