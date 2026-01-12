/**
 * usePlannerState - Custom hook for MeditationPlanner state management
 *
 * Encapsulates all state logic for the planner including:
 * - Session selection and edits
 * - Plan loading and saving
 * - Duration category management
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  PlannedSession,
  Session,
  Insight,
  RepeatFrequency,
  addPlannedSession,
  getPlannedSession,
  getIncompletePlansForDate,
  updatePlannedSession,
  deletePlannedSession,
  getInsightsBySessionId,
  updateSession,
  getSessionByUuid,
  createRepeatRuleWithSessions,
} from '../../lib/db'
import { DURATION_CATEGORIES } from '../../lib/meditation-options'
import { createScheduledReminder, cancelScheduledReminder } from '../../lib/reminders'
import type { SessionEdits, DayItem } from './types'
import { getStartOfDay } from './utils'

/**
 * Convert time string "HH:MM" to minutes from midnight for sorting
 */
function timeToMinutes(time: string | undefined): number {
  if (!time) return 0
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

interface UsePlannerStateProps {
  date: Date
  sessions: Session[]
  onSave: () => void
  onClose: () => void
}

export function usePlannerState({ date, sessions, onSave, onClose }: UsePlannerStateProps) {
  // Item selection state (unified for sessions and plans)
  const [selectedItemIndex, setSelectedItemIndex] = useState(0)

  // Loading states
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

  // State for tracking if we're adding a new plan (not editing existing)
  const [isAddingNewPlan, setIsAddingNewPlan] = useState(false)

  // Repeat scheduling state
  const [repeatFrequency, setRepeatFrequency] = useState<RepeatFrequency | null>(null)
  const [repeatCustomDays, setRepeatCustomDays] = useState<number[]>([])

  // Attached pearl state
  const [attachedPearl, setAttachedPearl] = useState<{ id: string; text: string } | null>(null)

  // Build unified dayItems array combining sessions and pending plans
  const dayItems: DayItem[] = useMemo(() => {
    const dateStart = getStartOfDay(date)

    // Convert sessions to DayItems
    const sessionItems: DayItem[] = sessions.map((s) => ({
      type: 'session' as const,
      id: s.uuid,
      session: s,
      timestamp: s.startTime,
    }))

    // Convert pending plans to DayItems
    const planItems: DayItem[] = pendingPlans.map((p) => ({
      type: 'plan' as const,
      id: `plan-${p.id}`,
      plan: p,
      // Use plan date + planned time (converted to ms) for sorting
      // Plans without time sort to start of day
      timestamp: dateStart + timeToMinutes(p.plannedTime) * 60 * 1000,
    }))

    // Combine and sort chronologically
    return [...sessionItems, ...planItems].sort((a, b) => a.timestamp - b.timestamp)
  }, [sessions, pendingPlans, date])

  // Current item from dayItems array
  const currentItem = dayItems.length > 0 ? dayItems[selectedItemIndex] : null

  // Backward compatibility: derive session from currentItem
  const session = currentItem?.type === 'session' ? (currentItem.session ?? null) : null
  const hasMultipleSessions = sessions.length > 1

  // Determine if we're viewing a completed session vs planning
  // Uses currentItem.type for unified handling
  const isSessionMode = currentItem?.type === 'session'

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
        if (existing.attachedPearlId) {
          setAttachedPearl({ id: existing.attachedPearlId, text: '' }) // Text will be loaded separately
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
        // Handle recurring sessions with repeat frequency
        if (repeatFrequency) {
          // Validate custom days selection
          if (repeatFrequency === 'custom' && repeatCustomDays.length === 0) {
            // Don't save - user needs to select at least one day
            // Just return without error - the UI should show they need to select days
            return
          }

          await createRepeatRuleWithSessions({
            frequency: repeatFrequency,
            customDays: repeatFrequency === 'custom' ? repeatCustomDays : undefined,
            plannedTime: plannedTime || undefined,
            duration: duration || undefined,
            title: planTitle || undefined,
            pose: planPose || undefined,
            discipline: planDiscipline || undefined,
            notes: planNotes || undefined,
            sourceTemplateId: planSourceTemplateId,
            attachedPearlId: attachedPearl?.id,
          })
          // Reset repeat state after saving
          setRepeatFrequency(null)
          setRepeatCustomDays([])
          onSave()
          onClose()
          return
        }

        // Single session save (existing logic)
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
            attachedPearlId: attachedPearl?.id,
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
            attachedPearlId: attachedPearl?.id,
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
    repeatFrequency,
    repeatCustomDays,
    attachedPearl,
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
    setRepeatFrequency(null)
    setRepeatCustomDays([])
    setAttachedPearl(null)
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

  const handleRepeatChange = useCallback(
    (frequency: RepeatFrequency | null, customDays?: number[]) => {
      setRepeatFrequency(frequency)
      if (customDays !== undefined) {
        setRepeatCustomDays(customDays)
      }
    },
    []
  )

  // Handle pearl attachment
  const handlePearlSelect = useCallback((pearl: { id: string; text: string }) => {
    if (pearl.id) {
      setAttachedPearl({ id: pearl.id, text: pearl.text })
    } else {
      setAttachedPearl(null)
    }
  }, [])

  const handleAddNewPlan = useCallback(() => {
    // Clear form fields for new plan
    setPlannedTime('')
    setDuration(null)
    setDurationCategory(null)
    setShowCustomDuration(false)
    setPlanPose('')
    setPlanDiscipline('')
    setPlanNotes('')
    setPlanTitle('')
    setPlanSourceTemplateId(undefined)
    setExistingPlan(null)
    setIsAddingNewPlan(true)
    setRepeatFrequency(null)
    setRepeatCustomDays([])
    setAttachedPearl(null)

    // Navigate past all existing items (conceptually to a "new" slot)
    // We'll show the planning form in this state
    setSelectedItemIndex(dayItems.length) // Point past the array
  }, [dayItems.length])

  return {
    // Unified day items (sessions + plans combined)
    dayItems,
    selectedItemIndex,
    setSelectedItemIndex,
    currentItem,

    // Legacy session selection (backward compatibility)
    selectedSessionIndex: selectedItemIndex, // Alias for backward compatibility
    setSelectedSessionIndex: setSelectedItemIndex, // Alias for backward compatibility
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

    // New plan creation
    isAddingNewPlan,
    handleAddNewPlan,

    // Repeat scheduling
    repeatFrequency,
    repeatCustomDays,
    handleRepeatChange,

    // Attached pearl
    attachedPearl,
    handlePearlSelect,
  }
}
