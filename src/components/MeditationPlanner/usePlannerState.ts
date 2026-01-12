/**
 * usePlannerState - Custom hook for MeditationPlanner state management
 *
 * Encapsulates all state logic for the planner including:
 * - Session selection and edits
 * - Plan loading and saving
 * - Duration category management
 */

import { useState, useEffect, useCallback } from 'react'
import {
  PlannedSession,
  Session,
  Insight,
  addPlannedSession,
  getPlannedSession,
  getIncompletePlansForDate,
  updatePlannedSession,
  deletePlannedSession,
  getInsightsBySessionId,
  updateSession,
  getSessionByUuid,
} from '../../lib/db'
import { DURATION_CATEGORIES } from '../../lib/meditation-options'
import { createScheduledReminder, cancelScheduledReminder } from '../../lib/reminders'
import type { SessionEdits } from './types'
import { getStartOfDay } from './utils'

interface UsePlannerStateProps {
  date: Date
  sessions: Session[]
  onSave: () => void
  onClose: () => void
}

export function usePlannerState({ date, sessions, onSave, onClose }: UsePlannerStateProps) {
  // Multiple sessions support
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0)
  const session = sessions.length > 0 ? sessions[selectedSessionIndex] : null
  const hasMultipleSessions = sessions.length > 1

  // Determine if we're viewing a completed session vs planning
  const isSessionMode = !!session
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [existingPlan, setExistingPlan] = useState<PlannedSession | null>(null)
  const [pendingPlans, setPendingPlans] = useState<PlannedSession[]>([])
  const [insight, setInsight] = useState<Insight | null>(null)

  // Form state - selectedDate can be changed by user
  const [selectedDate, setSelectedDate] = useState<Date>(date)
  const [plannedTime, setPlannedTime] = useState('')
  const [duration, setDuration] = useState<number | null>(null)
  const [durationCategory, setDurationCategory] = useState<string | null>(null)
  const [showCustomDuration, setShowCustomDuration] = useState(false)

  // Multi-session edit tracking: Map<sessionUuid, edits>
  const [sessionEdits, setSessionEdits] = useState<Map<string, SessionEdits>>(new Map())

  // Plan mode state (separate from session mode)
  const [planPose, setPlanPose] = useState('')
  const [planDiscipline, setPlanDiscipline] = useState('')
  const [planNotes, setPlanNotes] = useState('')
  const [planTitle, setPlanTitle] = useState('')
  const [planSourceTemplateId, setPlanSourceTemplateId] = useState<string | undefined>(undefined)

  // Get current session's edits (from map or defaults)
  const currentEdits = session ? sessionEdits.get(session.uuid) : null

  // Use session edits in session mode, plan state in plan mode
  const pose = isSessionMode ? (currentEdits?.pose ?? '') : planPose
  const discipline = isSessionMode ? (currentEdits?.discipline ?? '') : planDiscipline
  const notes = isSessionMode ? (currentEdits?.notes ?? '') : planNotes

  // Update edits - routes to correct state based on mode
  const setPose = useCallback(
    (value: string) => {
      if (isSessionMode && session) {
        setSessionEdits((prev) => {
          const newMap = new Map(prev)
          const existing = newMap.get(session.uuid) || { pose: '', discipline: '', notes: '' }
          newMap.set(session.uuid, { ...existing, pose: value })
          return newMap
        })
      } else {
        setPlanPose(value)
      }
    },
    [isSessionMode, session]
  )

  const setDiscipline = useCallback(
    (value: string) => {
      if (isSessionMode && session) {
        setSessionEdits((prev) => {
          const newMap = new Map(prev)
          const existing = newMap.get(session.uuid) || { pose: '', discipline: '', notes: '' }
          newMap.set(session.uuid, { ...existing, discipline: value })
          return newMap
        })
      } else {
        setPlanDiscipline(value)
      }
    },
    [isSessionMode, session]
  )

  const setNotes = useCallback(
    (value: string) => {
      if (isSessionMode && session) {
        setSessionEdits((prev) => {
          const newMap = new Map(prev)
          const existing = newMap.get(session.uuid) || { pose: '', discipline: '', notes: '' }
          newMap.set(session.uuid, { ...existing, notes: value })
          return newMap
        })
      } else {
        setPlanNotes(value)
      }
    },
    [isSessionMode, session]
  )

  // Fetch insight and session metadata when session changes
  useEffect(() => {
    async function loadSessionData() {
      if (session) {
        const insights = await getInsightsBySessionId(session.uuid)
        setInsight(insights.length > 0 ? insights[0] : null)

        if (!sessionEdits.has(session.uuid)) {
          const freshSession = await getSessionByUuid(session.uuid)
          setSessionEdits((prev) => {
            const newMap = new Map(prev)
            newMap.set(session.uuid, {
              pose: freshSession?.pose || '',
              discipline: freshSession?.discipline || '',
              notes: freshSession?.notes || '',
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

  // Load existing plan for selected date
  useEffect(() => {
    async function load() {
      setIsLoading(true)

      const dateStart = getStartOfDay(selectedDate)
      const existing = await getPlannedSession(dateStart)

      if (existing) {
        setExistingPlan(existing)
        setPlannedTime(existing.plannedTime || '')
        setDuration(existing.duration || null)
        if (existing.duration) {
          const cat = DURATION_CATEGORIES.find((c) => c.durations.includes(existing.duration!))
          if (cat) {
            setDurationCategory(cat.label)
            setShowCustomDuration(false)
          } else {
            setDurationCategory('custom')
            setShowCustomDuration(true)
          }
        }
        if (!isSessionMode) {
          setPlanPose(existing.pose || '')
          setPlanDiscipline(existing.discipline || '')
          setPlanNotes(existing.notes || '')
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, isSessionMode])

  // Load pending plans for this date
  useEffect(() => {
    async function loadPendingPlans() {
      const dateStart = getStartOfDay(date)
      const plans = await getIncompletePlansForDate(dateStart)
      setPendingPlans(plans)
    }
    loadPendingPlans()
  }, [date])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    const dateStart = getStartOfDay(selectedDate)

    try {
      if (isSessionMode) {
        const savePromises: Promise<void>[] = []
        sessionEdits.forEach((edits, uuid) => {
          savePromises.push(
            updateSession(uuid, {
              pose: edits.pose || undefined,
              discipline: edits.discipline || undefined,
              notes: edits.notes || undefined,
            })
          )
        })
        await Promise.all(savePromises)
      } else {
        if (existingPlan?.id) {
          // Cancel existing reminder before updating (time may have changed)
          await cancelScheduledReminder(existingPlan.id)

          await updatePlannedSession(existingPlan.id, {
            date: dateStart,
            plannedTime: plannedTime || undefined,
            duration: duration || undefined,
            title: planTitle || undefined,
            pose: planPose || undefined,
            discipline: planDiscipline || undefined,
            notes: planNotes || undefined,
            sourceTemplateId: planSourceTemplateId,
          })

          // Create new scheduled reminder if time is set
          if (plannedTime) {
            await createScheduledReminder(
              existingPlan.id,
              dateStart,
              plannedTime,
              planTitle || 'Meditation'
            )
          }
        } else {
          const newPlan = await addPlannedSession({
            date: dateStart,
            plannedTime: plannedTime || undefined,
            duration: duration || undefined,
            title: planTitle || undefined,
            pose: planPose || undefined,
            discipline: planDiscipline || undefined,
            notes: planNotes || undefined,
            sourceTemplateId: planSourceTemplateId,
          })

          // Create scheduled reminder if time is set
          if (plannedTime && newPlan.id) {
            await createScheduledReminder(
              newPlan.id,
              dateStart,
              plannedTime,
              planTitle || 'Meditation'
            )
          }
        }
      }
      onSave()
      onClose()
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setIsSaving(false)
    }
  }, [
    selectedDate,
    existingPlan,
    plannedTime,
    duration,
    planTitle,
    planPose,
    planDiscipline,
    planNotes,
    planSourceTemplateId,
    onSave,
    onClose,
    isSessionMode,
    sessionEdits,
  ])

  const handleDelete = useCallback(async () => {
    if (!existingPlan?.id) return
    try {
      // Cancel any scheduled reminder for this plan
      await cancelScheduledReminder(existingPlan.id)
      await deletePlannedSession(existingPlan.id)
      onSave()
      onClose()
    } catch (err) {
      console.error('Failed to delete plan:', err)
    }
  }, [existingPlan, onSave, onClose])

  const handleDateChange = useCallback((newDate: Date) => {
    setSelectedDate(newDate)
    setExistingPlan(null)
    setPlannedTime('')
    setDuration(null)
    setDurationCategory(null)
    setShowCustomDuration(false)
    setPlanPose('')
    setPlanDiscipline('')
    setPlanNotes('')
  }, [])

  const handleDurationCategoryChange = useCallback(
    (category: string | null) => {
      if (durationCategory === category) {
        setDurationCategory(null)
        setDuration(null)
      } else if (category === 'custom') {
        setDurationCategory('custom')
        setShowCustomDuration(true)
        setDuration(null)
      } else {
        setDurationCategory(category)
        setShowCustomDuration(false)
        setDuration(null)
      }
    },
    [durationCategory]
  )

  const handleDurationChange = useCallback(
    (newDuration: number) => {
      setDuration(duration === newDuration ? null : newDuration)
    },
    [duration]
  )

  return {
    // Session selection
    selectedSessionIndex,
    setSelectedSessionIndex,
    session,
    hasMultipleSessions,
    isSessionMode,

    // Loading states
    isLoading,
    isSaving,

    // Plan data
    existingPlan,
    pendingPlans,
    insight,

    // Form values
    selectedDate,
    plannedTime,
    setPlannedTime,
    duration,
    durationCategory,
    showCustomDuration,
    planTitle,
    planSourceTemplateId,

    // Editable fields
    pose,
    discipline,
    notes,
    setPose,
    setDiscipline,
    setNotes,

    // Handlers
    handleSave,
    handleDelete,
    handleDateChange,
    handleDurationCategoryChange,
    handleDurationChange,
  }
}
