/**
 * SessionDetailModal - Full session template details
 *
 * Shows full guidance notes, personalization options, and adoption flow.
 */

import { useState, useEffect, useCallback } from 'react'
import { getIntentionGradient } from '../lib/animations'
import { saveTemplate, unsaveTemplate, isTemplateSaved, addPlannedSession } from '../lib/db'
import { getTemplateStats } from '../lib/templates'
import { SessionTemplate } from '../lib/types'

// Re-export for backward compatibility with existing imports
export type { SessionTemplate } from '../lib/types'

interface SessionDetailModalProps {
  session: SessionTemplate & { hasVoted?: boolean; hasSaved?: boolean }
  onClose: () => void
  onAdopt: () => void
  // Optional callbacks for Supabase integration (state sync with parent)
  onVote?: (sessionId: string, shouldVote: boolean) => Promise<void>
  onSaveChange?: (sessionId: string, shouldSave: boolean) => void
  isAuthenticated?: boolean
  onRequireAuth?: () => void
}

// Parse duration from string like "5-10 mins" → 10 (take max)
function parseDuration(guidance: string): number {
  const match = guidance.match(/(\d+)(?:-(\d+))?\s*min/)
  if (match) {
    return parseInt(match[2] || match[1], 10)
  }
  return 10 // default
}

// Get start of day timestamp
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

// Get suggested time based on bestTime field
function getSuggestedTime(bestTime: string): string {
  const lower = bestTime.toLowerCase()
  if (lower.includes('morning')) return '07:00'
  if (lower.includes('evening')) return '19:00'
  if (lower.includes('night')) return '21:00'
  if (lower.includes('afternoon')) return '14:00'
  return '09:00' // Default for "Anytime" or unknown
}

export function SessionDetailModal({
  session,
  onClose,
  onAdopt,
  onVote,
  onSaveChange,
  isAuthenticated = true,
  onRequireAuth
}: SessionDetailModalProps) {
  // Initialize from props if available (Supabase)
  const [hasVoted, setHasVoted] = useState(session.hasVoted ?? false)
  const [isSaved, setIsSaved] = useState(session.hasSaved ?? false)
  const [isVoting, setIsVoting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Default to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  })
  const [plannedTime, setPlannedTime] = useState(() => getSuggestedTime(session.bestTime))
  const [isAdopting, setIsAdopting] = useState(false)

  // Live stats (fetched from Supabase)
  const [liveStats, setLiveStats] = useState<{ karma: number; saves: number; completions: number } | null>(null)

  // Get gradient based on intention or use fallback
  const gradient = getIntentionGradient(session.intention)

  // Sync state from props and fetch live stats
  useEffect(() => {
    // Use prop values if available, fallback to IndexedDB check
    if (session.hasSaved !== undefined) {
      setIsSaved(session.hasSaved)
    } else {
      isTemplateSaved(session.id).then(setIsSaved)
    }
    if (session.hasVoted !== undefined) {
      setHasVoted(session.hasVoted)
    }

    // Fetch live stats from Supabase
    getTemplateStats(session.id).then(stats => {
      if (stats) setLiveStats(stats)
    })
  }, [session.id, session.hasSaved, session.hasVoted])

  // Use live stats, fall back to session values
  const displayStats = liveStats ?? {
    karma: session.karma,
    saves: session.saves,
    completions: session.completions
  }

  // Handle vote with optimistic update
  const handleVote = useCallback(async () => {
    if (!isAuthenticated && onRequireAuth) {
      onRequireAuth()
      return
    }
    if (isVoting) return
    setIsVoting(true)

    const newVoted = !hasVoted
    // Optimistic update
    setHasVoted(newVoted)
    setLiveStats(prev => prev ? {
      ...prev,
      karma: prev.karma + (newVoted ? 1 : -1)
    } : null)

    try {
      if (onVote) {
        await onVote(session.id, newVoted)
      }
    } catch (err) {
      // Rollback on error
      setHasVoted(!newVoted)
      setLiveStats(prev => prev ? {
        ...prev,
        karma: prev.karma + (newVoted ? -1 : 1)
      } : null)
      console.error('Failed to vote:', err)
    } finally {
      setIsVoting(false)
    }
  }, [hasVoted, isVoting, onVote, session.id, isAuthenticated, onRequireAuth])

  // Handle save with notification to parent
  const handleSave = useCallback(async () => {
    if (isSaving) return
    setIsSaving(true)
    const newSaved = !isSaved

    try {
      if (newSaved) {
        await saveTemplate(session.id)
      } else {
        await unsaveTemplate(session.id)
      }
      setIsSaved(newSaved)
      // Notify parent of save change
      onSaveChange?.(session.id, newSaved)
    } catch (err) {
      console.error('Failed to save template:', err)
    } finally {
      setIsSaving(false)
    }
  }, [isSaved, isSaving, session.id, onSaveChange])

  const handleAdopt = () => {
    setShowDatePicker(true)
  }

  const handleConfirmAdopt = async () => {
    if (isAdopting) return

    setIsAdopting(true)
    try {
      await addPlannedSession({
        date: getStartOfDay(selectedDate),
        plannedTime: plannedTime || undefined,
        duration: parseDuration(session.durationGuidance),
        title: session.title,
        pose: session.posture,
        discipline: session.discipline,
        notes: session.intention,
        sourceTemplateId: session.id
      })

      onAdopt()
    } catch (err) {
      console.error('Failed to add planned session:', err)
    } finally {
      setIsAdopting(false)
    }
  }

  // Block swipe navigation when modal is open
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm"
      onTouchStart={handleTouchEvent}
      onTouchEnd={handleTouchEvent}
      onTouchMove={handleTouchEvent}
    >
      <div className="h-full overflow-y-auto">
        {/* Hero section - single unified header */}
        <div className={`relative bg-gradient-to-br ${gradient} px-6 pt-14 pb-6`}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Title and tagline */}
          <p className="font-serif text-2xl text-white drop-shadow-sm">
            {session.title}
          </p>
          <p className="text-white/80 text-sm mt-2 italic">
            "{session.tagline}"
          </p>
        </div>

        {/* Content */}
        <div className="bg-cream min-h-screen px-6 py-6">
          {/* Quick details */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-cream-deep text-ink/60 text-sm px-3 py-1 rounded-full">
              {session.durationGuidance}
            </span>
            <span className="bg-cream-deep text-ink/60 text-sm px-3 py-1 rounded-full">
              {session.discipline}
            </span>
            <span className="bg-cream-deep text-ink/60 text-sm px-3 py-1 rounded-full">
              {session.posture}
            </span>
            <span className="bg-cream-deep text-ink/60 text-sm px-3 py-1 rounded-full">
              {session.bestTime}
            </span>
          </div>

          {/* Guidance notes */}
          <div className="mb-8">
            <p className="font-serif text-sm text-ink/50 mb-3">Guidance</p>
            <p className="text-ink leading-relaxed whitespace-pre-line">
              {session.guidanceNotes}
            </p>
          </div>

          {/* Intention */}
          <div className="mb-8">
            <p className="font-serif text-sm text-ink/50 mb-2">Intention</p>
            <p className="text-ink">
              {session.intention}
            </p>
          </div>

          {/* Recommended experience level */}
          {session.recommendedAfterHours > 0 && (
            <div className="mb-8 bg-cream-deep rounded-xl p-4">
              <p className="text-sm text-ink/60">
                Recommended after {session.recommendedAfterHours}+ hours of practice
              </p>
            </div>
          )}

          {/* Intent tags - for filtering */}
          {session.intentTags && session.intentTags.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {session.intentTags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-cream-deep text-ink/50">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Stats */}
          <div className="flex items-center gap-4 text-sm mb-8">
            {/* Vote button */}
            <button
              onClick={handleVote}
              disabled={isVoting}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all
                ${hasVoted
                  ? 'bg-indigo-deep text-cream'
                  : 'bg-cream-deep text-ink/50 hover:text-ink/70 hover:bg-cream-deep/80'
                }
                ${isVoting ? 'opacity-50' : ''}
              `}
            >
              <svg className="w-4 h-4" fill={hasVoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
              </svg>
              <span className="tabular-nums">{displayStats.karma}</span>
            </button>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all
                ${isSaved
                  ? 'bg-indigo-deep text-cream'
                  : 'bg-cream-deep text-ink/50 hover:text-ink/70 hover:bg-cream-deep/80'
                }
                ${isSaving ? 'opacity-50' : ''}
              `}
            >
              <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="tabular-nums">{displayStats.saves}</span>
            </button>

            {/* Completions (read-only) */}
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-ink/40">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="tabular-nums">{displayStats.completions.toLocaleString()}</span>
            </span>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-cream pt-4 pb-safe border-t border-ink/5 -mx-6 px-6 overflow-hidden">
            {!showDatePicker ? (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className={`
                    flex-none w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                    ${isSaved
                      ? 'bg-indigo-deep text-cream'
                      : 'bg-cream-deep text-ink/50 hover:text-ink/70'
                    }
                  `}
                  aria-label={isSaved ? 'Unsave meditation' : 'Save meditation'}
                >
                  <svg
                    className="w-5 h-5"
                    fill={isSaved ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
                <button
                  onClick={handleAdopt}
                  className="flex-1 py-3 bg-moss text-cream rounded-xl text-sm font-medium hover:bg-moss/90 transition-colors active:scale-[0.98]"
                >
                  Plan this meditation
                </button>
              </div>
            ) : (
              <div className="overflow-hidden">
                <p className="text-sm text-ink/60 mb-4">When would you like to practice this?</p>

                {/* Date picker */}
                <div className="mb-4">
                  <label className="text-xs text-ink/50 block mb-2">Date</label>
                  <input
                    type="date"
                    value={formatDateForInput(selectedDate)}
                    min={formatDateForInput(new Date())}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value + 'T00:00:00')
                      setSelectedDate(newDate)
                    }}
                    className="w-full max-w-full px-4 py-3 rounded-xl bg-cream-deep text-ink focus:outline-none focus:ring-2 focus:ring-moss/30 box-border"
                  />
                </div>

                {/* Time picker */}
                <div className="mb-4">
                  <label className="text-xs text-ink/50 block mb-2">
                    Time
                    {session.bestTime && (
                      <span className="text-ink/30 ml-1">(suggested: {session.bestTime.toLowerCase()})</span>
                    )}
                  </label>
                  <input
                    type="time"
                    value={plannedTime}
                    onChange={(e) => setPlannedTime(e.target.value)}
                    className="w-full max-w-full px-4 py-3 rounded-xl bg-cream-deep text-ink focus:outline-none focus:ring-2 focus:ring-moss/30 box-border"
                  />
                </div>

                {/* Quick date buttons */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className={`flex-1 py-2 rounded-lg text-xs transition-colors ${
                      formatDateForInput(selectedDate) === formatDateForInput(new Date())
                        ? 'bg-moss/20 text-moss font-medium'
                        : 'bg-cream-deep text-ink/50 hover:bg-cream-deep/80'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const tomorrow = new Date()
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      setSelectedDate(tomorrow)
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs transition-colors ${
                      formatDateForInput(selectedDate) === formatDateForInput(new Date(Date.now() + 86400000))
                        ? 'bg-moss/20 text-moss font-medium'
                        : 'bg-cream-deep text-ink/50 hover:bg-cream-deep/80'
                    }`}
                  >
                    Tomorrow
                  </button>
                  <button
                    onClick={() => {
                      const nextWeek = new Date()
                      nextWeek.setDate(nextWeek.getDate() + 7)
                      setSelectedDate(nextWeek)
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs transition-colors ${
                      formatDateForInput(selectedDate) === formatDateForInput(new Date(Date.now() + 7 * 86400000))
                        ? 'bg-moss/20 text-moss font-medium'
                        : 'bg-cream-deep text-ink/50 hover:bg-cream-deep/80'
                    }`}
                  >
                    Next week
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 py-3 bg-cream-deep text-ink/60 rounded-xl text-sm hover:bg-cream-deep/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAdopt}
                    disabled={isAdopting}
                    className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors active:scale-[0.98] bg-moss text-cream hover:bg-moss/90"
                  >
                    {isAdopting ? 'Planning...' : 'Confirm'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
