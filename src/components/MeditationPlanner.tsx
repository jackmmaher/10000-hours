/**
 * MeditationPlanner - Plan your next meditation session
 *
 * Modal for setting intentions for a specific day's meditation.
 * Fields: date, time, pose, discipline, and guidance notes.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  PlannedSession,
  addPlannedSession,
  getPlannedSession,
  updatePlannedSession,
  deletePlannedSession,
  getLatestInsight
} from '../lib/db'

interface MeditationPlannerProps {
  date: Date
  onClose: () => void
  onSave: () => void
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

export function MeditationPlanner({ date, onClose, onSave }: MeditationPlannerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [existingPlan, setExistingPlan] = useState<PlannedSession | null>(null)

  // Form state
  const [plannedTime, setPlannedTime] = useState('')
  const [duration, setDuration] = useState<number | null>(null)
  const [showCustomDuration, setShowCustomDuration] = useState(false)
  const [customDurationInput, setCustomDurationInput] = useState('')
  const [pose, setPose] = useState('')
  const [discipline, setDiscipline] = useState('')
  const [notes, setNotes] = useState('')
  const [suggestedPrompt, setSuggestedPrompt] = useState('')

  // Load existing plan and suggested prompt
  useEffect(() => {
    async function load() {
      setIsLoading(true)

      // Load existing plan for this date
      const dateStart = getStartOfDay(date)
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
        setPose(existing.pose || '')
        setDiscipline(existing.discipline || '')
        setNotes(existing.notes || '')
      }

      // Get latest insight for suggested prompt
      const latestInsight = await getLatestInsight()
      if (latestInsight) {
        const text = latestInsight.formattedText || latestInsight.rawText
        if (text.length > 50) {
          setSuggestedPrompt(`Meditate on: "${text.substring(0, 50)}..."`)
        } else {
          setSuggestedPrompt(`Meditate on: "${text}"`)
        }
      }

      setIsLoading(false)
    }
    load()
  }, [date])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    const dateStart = getStartOfDay(date)

    try {
      if (existingPlan?.id) {
        await updatePlannedSession(existingPlan.id, {
          plannedTime: plannedTime || undefined,
          duration: duration || undefined,
          pose: pose || undefined,
          discipline: discipline || undefined,
          notes: notes || undefined
        })
      } else {
        await addPlannedSession({
          date: dateStart,
          plannedTime: plannedTime || undefined,
          duration: duration || undefined,
          pose: pose || undefined,
          discipline: discipline || undefined,
          notes: notes || undefined
        })
      }
      onSave()
      onClose()
    } catch (err) {
      console.error('Failed to save plan:', err)
    } finally {
      setIsSaving(false)
    }
  }, [date, existingPlan, plannedTime, duration, pose, discipline, notes, onSave, onClose])

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

  const handleUseSuggestion = useCallback(() => {
    if (suggestedPrompt) {
      setNotes(suggestedPrompt)
    }
  }, [suggestedPrompt])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
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
                Plan Meditation
              </p>
              <p className="text-sm text-ink/50 mt-1">
                {formatDateForDisplay(date)}
              </p>
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
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 pointer-events-none">
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

              {/* Pose */}
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

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-ink/50">
                    Notes
                  </label>
                  {suggestedPrompt && !notes && (
                    <button
                      onClick={handleUseSuggestion}
                      className="text-xs text-indigo-deep/70 hover:text-indigo-deep transition-colors"
                    >
                      Use suggestion
                    </button>
                  )}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={suggestedPrompt || "Set your intention for this meditation..."}
                  className="w-full h-24 px-4 py-3 rounded-xl bg-cream-dark/50 text-ink placeholder:text-ink/30 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-deep/20"
                />
              </div>
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
            {isSaving ? 'Saving...' : existingPlan ? 'Update Plan' : 'Save Plan'}
          </button>

          {existingPlan && (
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
