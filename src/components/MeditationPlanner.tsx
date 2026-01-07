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

// Common meditation poses
const POSES = [
  'Seated (cushion)',
  'Seated (chair)',
  'Kneeling (seiza)',
  'Lotus',
  'Half-lotus',
  'Lying down',
  'Walking',
  'Standing'
]

// Common meditation disciplines
const DISCIPLINES = [
  'Breath awareness',
  'Body scan',
  'Loving-kindness (metta)',
  'Vipassana',
  'Zen (zazen)',
  'Mantra',
  'Open awareness',
  'Guided',
  'Contemplative'
]

// Common session durations (minutes)
const DURATIONS = [10, 15, 20, 25, 30, 45, 60]

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
  const [showCustomDuration, setShowCustomDuration] = useState(false)
  const [customDurationInput, setCustomDurationInput] = useState('')

  // Multi-session edit tracking: Map<sessionUuid, edits>
  // This preserves edits when switching between sessions
  const [sessionEdits, setSessionEdits] = useState<Map<string, SessionEdits>>(new Map())

  // Plan mode state (separate from session mode)
  const [planPose, setPlanPose] = useState('')
  const [planDiscipline, setPlanDiscipline] = useState('')
  const [planNotes, setPlanNotes] = useState('')

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
        // If duration exists but not in presets, show custom mode
        if (existing.duration && !DURATIONS.includes(existing.duration)) {
          setShowCustomDuration(true)
          setCustomDurationInput(existing.duration.toString())
        }
        // Only load pose/discipline/notes from plan in plan mode
        // In session mode, these come from the Session object (loaded in separate effect)
        if (!isSessionMode) {
          setPlanPose(existing.pose || '')
          setPlanDiscipline(existing.discipline || '')
          setPlanNotes(existing.notes || '')
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
            pose: planPose || undefined,
            discipline: planDiscipline || undefined,
            notes: planNotes || undefined
          })
        } else {
          await addPlannedSession({
            date: dateStart,
            plannedTime: plannedTime || undefined,
            duration: duration || undefined,
            pose: planPose || undefined,
            discipline: planDiscipline || undefined,
            notes: planNotes || undefined
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
  }, [selectedDate, existingPlan, plannedTime, duration, planPose, planDiscipline, planNotes, onSave, onClose, isSessionMode, sessionEdits])

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
              <p className="font-serif text-xl text-indigo-deep">
                {isSessionMode ? 'Session Details' : 'Plan Meditation'}
              </p>
              {isSessionMode && (
                <p className="text-sm text-ink/50 mt-1">
                  {formatDateForDisplay(date)}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-ink/40 hover:text-ink/60 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-indigo-deep/20 border-t-indigo-deep rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Session selector - show when multiple sessions on same day */}
              {isSessionMode && hasMultipleSessions && (
                <div>
                  <label className="text-xs text-ink/50 block mb-2">
                    {sessions.length} sessions this day
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {sessions.map((s, index) => (
                      <button
                        key={s.uuid}
                        onClick={() => setSelectedSessionIndex(index)}
                        className={`
                          px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all
                          ${selectedSessionIndex === index
                            ? 'bg-indigo-deep text-cream'
                            : 'bg-cream-dark text-ink/60 hover:bg-cream-dark/80'
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
                    <span className="text-xs text-ink/50">Time</span>
                    <span className="text-ink font-medium">
                      {formatTimeFromTimestamp(session.startTime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-ink/50">Duration</span>
                    <span className="text-ink font-medium">
                      {formatDurationMinutes(session.durationSeconds)}
                    </span>
                  </div>
                </div>
              )}

              {/* Plan mode: Show editable date picker */}
              {!isSessionMode && (
                <div>
                  <label className="text-xs text-ink/50 block mb-2">
                    What day?
                  </label>
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
                      setShowCustomDuration(false)
                      setCustomDurationInput('')
                      setPose('')
                      setDiscipline('')
                      setNotes('')
                    }}
                    className="w-full px-4 py-4 rounded-xl bg-cream-dark text-ink text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-deep/30"
                  />
                </div>
              )}

              {/* Plan mode: Time and Duration inputs */}
              {!isSessionMode && (
                <>
                  {/* Time */}
                  <div>
                    <label className="text-xs text-ink/50 block mb-2">
                      What time?
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={plannedTime}
                        onChange={(e) => setPlannedTime(e.target.value)}
                        className="w-full px-4 py-4 rounded-xl bg-cream-dark text-ink text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-deep/30"
                      />
                      {!plannedTime && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/50 font-medium pointer-events-none">
                          Tap to set time
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-xs text-ink/50 block mb-2">
                      How long?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DURATIONS.map((d) => (
                        <button
                          key={d}
                          onClick={() => {
                            setDuration(duration === d ? null : d)
                            setShowCustomDuration(false)
                            setCustomDurationInput('')
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                            duration === d && !showCustomDuration
                              ? 'bg-indigo-deep text-cream'
                              : 'bg-cream-dark/50 text-ink/70 hover:bg-cream-dark'
                          }`}
                        >
                          {d} min
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setShowCustomDuration(!showCustomDuration)
                          if (!showCustomDuration) {
                            setDuration(null)
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                          showCustomDuration
                            ? 'bg-indigo-deep text-cream'
                            : 'bg-cream-dark/50 text-ink/70 hover:bg-cream-dark'
                        }`}
                      >
                        Other
                      </button>
                    </div>

                    {/* Custom duration input - only shown when Other is selected */}
                    {showCustomDuration && (
                      <div className="mt-3">
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
                            className="flex-1 px-4 py-3 rounded-xl bg-cream-dark text-ink focus:outline-none focus:ring-2 focus:ring-indigo-deep/30"
                            autoFocus
                          />
                          <span className="text-sm text-ink/50">min</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Pose - always editable */}
              <div>
                <label className="text-xs text-ink/50 block mb-2">
                  Position
                </label>
                <div className="flex flex-wrap gap-2">
                  {POSES.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPose(pose === p ? '' : p)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                        pose === p
                          ? 'bg-indigo-deep text-cream'
                          : 'bg-cream-dark/50 text-ink/70 hover:bg-cream-dark'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discipline */}
              <div>
                <label className="text-xs text-ink/50 block mb-2">
                  Technique
                </label>
                <div className="flex flex-wrap gap-2">
                  {DISCIPLINES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDiscipline(discipline === d ? '' : d)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                        discipline === d
                          ? 'bg-indigo-deep text-cream'
                          : 'bg-cream-dark/50 text-ink/70 hover:bg-cream-dark'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes / Intention */}
              <div>
                <label className="text-xs text-ink/50 block mb-2">
                  {isSessionMode ? 'Intention' : 'Notes'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isSessionMode ? "What was your intention for this session?" : "Set your intention for this session..."}
                  className="w-full h-24 px-4 py-3 rounded-xl bg-cream-dark/50 text-ink placeholder:text-ink/30 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-deep/20"
                />
              </div>

              {/* Insight display - show in session mode (with content or empty state) */}
              {isSessionMode && (
                <div>
                  <label className="text-xs text-ink/50 block mb-2">
                    Insight captured
                  </label>
                  {insight ? (
                    <div className="bg-indigo-deep/5 rounded-xl p-4 border border-indigo-deep/10">
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
                    <div className="bg-cream-dark/30 rounded-xl p-4">
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
        <div className="px-6 pb-8 pt-4 border-t border-ink/5 space-y-3">
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="w-full py-3 rounded-xl text-sm font-medium bg-indigo-deep text-cream hover:bg-indigo-deep/90 transition-colors active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : isSessionMode ? 'Save Details' : existingPlan ? 'Update Plan' : 'Save Plan'}
          </button>

          {existingPlan && !isSessionMode && (
            <button
              onClick={handleDelete}
              className="w-full py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors active:scale-[0.98]"
            >
              Delete Plan
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
