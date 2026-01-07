/**
 * SessionDetailModal - Full session template details
 *
 * Shows full guidance notes, personalization options, and adoption flow.
 */

import { useState, useEffect, useCallback } from 'react'
import { SESSION_HERO_GRADIENTS, INTENTION_TO_GRADIENT } from '../lib/animations'
import { saveTemplate, unsaveTemplate, isTemplateSaved, addPlannedSession } from '../lib/db'

export interface SessionTemplate {
  id: string
  title: string
  tagline: string
  heroImageUrl?: string
  durationGuidance: string
  discipline: string
  posture: string
  bestTime: string
  environment?: string
  guidanceNotes: string
  intention: string
  recommendedAfterHours: number
  tags?: string[]
  karma: number
  saves: number
  completions: number
  creatorHours: number
  courseId?: string
  coursePosition?: number
}

interface SessionDetailModalProps {
  session: SessionTemplate
  onClose: () => void
  onAdopt: () => void
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

export function SessionDetailModal({ session, onClose, onAdopt }: SessionDetailModalProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow' | null>(null)
  const [isAdopting, setIsAdopting] = useState(false)

  // Get gradient based on intention or use fallback
  const gradient = INTENTION_TO_GRADIENT[session.intention] || SESSION_HERO_GRADIENTS[0]

  // Check if already saved on mount
  useEffect(() => {
    isTemplateSaved(session.id).then(setIsSaved)
  }, [session.id])

  const handleSave = useCallback(async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      if (isSaved) {
        await unsaveTemplate(session.id)
        setIsSaved(false)
      } else {
        await saveTemplate(session.id)
        setIsSaved(true)
      }
    } catch (err) {
      console.error('Failed to save template:', err)
    } finally {
      setIsSaving(false)
    }
  }, [isSaved, isSaving, session.id])

  const handleAdopt = () => {
    setShowDatePicker(true)
    setSelectedDate(null)
  }

  const handleConfirmAdopt = async () => {
    if (!selectedDate || isAdopting) return

    setIsAdopting(true)
    try {
      const now = new Date()
      const targetDate = selectedDate === 'today'
        ? now
        : new Date(now.getTime() + 24 * 60 * 60 * 1000)

      await addPlannedSession({
        date: getStartOfDay(targetDate),
        duration: parseDuration(session.durationGuidance),
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
        {/* Hero section */}
        <div className={`relative h-48 bg-gradient-to-br ${gradient}`}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-ink/30 to-transparent">
            <p className="font-serif text-2xl text-white drop-shadow-sm">
              {session.title}
            </p>
            <p className="text-white/80 text-sm mt-1 italic">
              "{session.tagline}"
            </p>
          </div>
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

          {/* Tags */}
          {session.tags && session.tags.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {session.tags.map(tag => (
                  <span key={tag} className="text-sm text-moss">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-ink/50 mb-8">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
              </svg>
              <span className="tabular-nums">{session.karma}</span> karma
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="tabular-nums">{session.saves}</span> saved
            </span>
            <span className="tabular-nums">{session.completions.toLocaleString()} completed</span>
          </div>

          {/* Creator credibility */}
          <div className="text-xs text-ink/30 mb-8">
            Created by practitioner with {session.creatorHours} hours
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-cream pt-4 pb-safe border-t border-ink/5 -mx-6 px-6">
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
                  Add to my plans
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-ink/60 mb-3">When would you like to try this?</p>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSelectedDate('today')}
                    className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                      selectedDate === 'today'
                        ? 'bg-moss text-cream'
                        : 'bg-cream-deep text-ink/60 hover:bg-cream-deep/80'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setSelectedDate('tomorrow')}
                    className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                      selectedDate === 'tomorrow'
                        ? 'bg-moss text-cream'
                        : 'bg-cream-deep text-ink/60 hover:bg-cream-deep/80'
                    }`}
                  >
                    Tomorrow
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
                    disabled={!selectedDate || isAdopting}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors active:scale-[0.98] ${
                      selectedDate
                        ? 'bg-moss text-cream hover:bg-moss/90'
                        : 'bg-moss/50 text-cream/70 cursor-not-allowed'
                    }`}
                  >
                    {isAdopting ? 'Adding...' : 'Confirm'}
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
