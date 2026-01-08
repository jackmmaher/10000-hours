/**
 * JourneySavedContent - Displays saved meditation templates
 *
 * Shows user's saved meditation sessions with gradient accents,
 * and provides option to create new templates.
 */

import { useState, useEffect } from 'react'
import { useNavigationStore } from '../stores/useNavigationStore'
import { Card } from './Card'
import type { SessionTemplate } from './SessionDetailModal'

// Lazy-load SessionDetailModal wrapper
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
    mode: 'view' | 'plan' | 'log'
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

  return <SessionDetailModal session={session} mode="view" onClose={onClose} onAdopt={onAdopt} />
}

interface SavedContentProps {
  onCreateNew?: () => void
}

export function JourneySavedContent({ onCreateNew }: SavedContentProps) {
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
        {/* Create invitation card - uses unified Card system */}
        {onCreateNew && (
          <Card variant="subtle" onClick={onCreateNew} className="group">
            <div className="p-6 flex flex-col items-center justify-center min-h-[140px]">
              <div className="w-10 h-10 rounded-full bg-deep/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="font-serif text-ink mb-1">Create your own</p>
              <p className="text-xs text-ink-soft">Share your practice with others</p>
            </div>
          </Card>
        )}

        {/* Browse prompt */}
        <div className="text-center py-8">
          <p className="text-ink/40 text-sm mb-2">
            No saved meditations yet
          </p>
          <button
            onClick={() => useNavigationStore.getState().setView('explore')}
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
        {/* Create invitation card - first in list, uses unified Card system */}
        {onCreateNew && (
          <Card variant="subtle" onClick={onCreateNew} className="group">
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-deep/50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-serif text-ink">Create your own meditation</p>
                <p className="text-xs text-ink-soft mt-0.5">Share your practice with the community</p>
              </div>
            </div>
          </Card>
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
