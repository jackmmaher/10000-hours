/**
 * JourneySavedContent - Displays user's created and collected meditation templates
 *
 * Shows two sections (like JourneyMyPearls):
 * - My Meditations: Templates created by the user
 * - Collected Meditations: Templates saved from the community
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { Card, CardHeader, CardBody, CardTitle, CardDescription, AccentBar } from './Card'
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
  const { user } = useAuthStore()
  const haptic = useTapFeedback()
  const [createdMeditations, setCreatedMeditations] = useState<SessionTemplate[]>([])
  const [savedMeditations, setSavedMeditations] = useState<SessionTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<SessionTemplate | null>(null)
  const [getIntentionGradient, setGetIntentionGradient] = useState<((intention: string) => string) | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SessionTemplate | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    // Load the gradient function
    import('../lib/animations').then(module => {
      setGetIntentionGradient(() => module.getIntentionGradient)
    })
  }, [])

  useEffect(() => {
    const loadMeditations = async () => {
      try {
        // Load user-created meditations if authenticated
        let userCreated: SessionTemplate[] = []
        if (user) {
          const { getMyTemplates } = await import('../lib/templates')
          userCreated = await getMyTemplates(user.id)
        }
        setCreatedMeditations(userCreated)

        // Load saved templates (from local IndexedDB)
        const { getSavedTemplates } = await import('../lib/db')
        const savedTemplates = await getSavedTemplates()

        if (savedTemplates.length === 0) {
          setSavedMeditations([])
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
          intent_tags?: string[]
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
            intentTags: s.intent_tags,
            karma: s.seed_karma,
            saves: s.seed_saves,
            completions: s.seed_completions,
            creatorHours: s.creator_hours
          }))

        setSavedMeditations(matched)
      } catch (err) {
        console.error('Failed to load meditations:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadMeditations()
  }, [user])

  // Handle delete meditation
  const handleDelete = useCallback(async () => {
    if (!deleteTarget || !user || isDeleting) return

    setIsDeleting(true)
    haptic.medium()

    try {
      const { deleteTemplate } = await import('../lib/templates')
      const success = await deleteTemplate(deleteTarget.id, user.id)

      if (success) {
        haptic.success()
        // Remove from local state
        setCreatedMeditations(prev => prev.filter(m => m.id !== deleteTarget.id))
        setDeleteTarget(null)
      } else {
        console.error('Failed to delete meditation')
      }
    } catch (err) {
      console.error('Error deleting meditation:', err)
    } finally {
      setIsDeleting(false)
    }
  }, [deleteTarget, user, isDeleting, haptic])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-ink/10 border-t-ink/40 rounded-full animate-spin" />
      </div>
    )
  }

  const hasNoMeditations = createdMeditations.length === 0 && savedMeditations.length === 0

  // Empty state with create invitation
  if (hasNoMeditations) {
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
            No meditations yet
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

  // Meditation card component using unified Card system
  const MeditationCard = ({
    session,
    variant = 'saved'
  }: {
    session: SessionTemplate
    variant?: 'created' | 'saved'
  }) => {
    const gradient = getIntentionGradient
      ? getIntentionGradient(session.intention)
      : 'from-[#9DB4A0] to-[#5C7C5E]'

    const actionIcon = variant === 'created' ? (
      // Delete button for user-created
      <button
        onClick={(e) => {
          e.stopPropagation()
          haptic.light()
          setDeleteTarget(session)
        }}
        className="p-1.5 -m-1.5 rounded-lg hover:bg-ink/5 transition-colors touch-manipulation"
        aria-label="Delete meditation"
      >
        <svg className="w-4 h-4 text-ink-soft hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    ) : (
      // Bookmark for saved
      <svg className="w-4 h-4 text-ink-soft" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    )

    return (
      <Card
        variant="default"
        onClick={() => setSelectedSession(session)}
      >
        <CardHeader
          indicator={<AccentBar gradient={`bg-gradient-to-b ${gradient}`} />}
          label={session.discipline}
          sublabel={session.durationGuidance}
          action={actionIcon}
        />
        <CardBody compact>
          <CardTitle>{session.title}</CardTitle>
          <CardDescription>"{session.tagline}"</CardDescription>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-8">
        {/* Create invitation card - first in list */}
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

        {/* User-created meditations section */}
        {createdMeditations.length > 0 && (
          <div>
            <p className="text-xs text-ink-soft font-medium tracking-wide mb-4">
              My Meditations
            </p>
            <div className="space-y-3">
              {createdMeditations.map((session) => (
                <MeditationCard key={session.id} session={session} variant="created" />
              ))}
            </div>
          </div>
        )}

        {/* Collected from community section */}
        {savedMeditations.length > 0 && (
          <div>
            <p className="text-xs text-ink-soft font-medium tracking-wide mb-4">
              Collected Meditations
            </p>
            <div className="space-y-3">
              {savedMeditations.map((session) => (
                <MeditationCard key={session.id} session={session} variant="saved" />
              ))}
            </div>
          </div>
        )}
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

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={() => setDeleteTarget(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />

          {/* Dialog */}
          <div
            className="relative bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-lg text-ink mb-2">
              Delete meditation?
            </h3>
            <p className="text-sm text-ink/60 mb-6">
              "{deleteTarget.title}" will be removed. Anyone who saved it will keep their copy.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-ink/60
                  hover:bg-ink/5 transition-colors touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-white
                  bg-red-500 hover:bg-red-600 transition-colors touch-manipulation
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
