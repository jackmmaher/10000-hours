/**
 * JourneySavedContent - Displays user's created and saved meditation templates
 *
 * Shows two sections (like JourneyMyPearls):
 * - My Meditations: Templates created by the user
 * - Saved Meditations: Templates saved from the community
 */

import { useState, useEffect } from 'react'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useAuthStore } from '../stores/useAuthStore'
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
  const [createdMeditations, setCreatedMeditations] = useState<SessionTemplate[]>([])
  const [savedMeditations, setSavedMeditations] = useState<SessionTemplate[]>([])
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

        setSavedMeditations(matched)
      } catch (err) {
        console.error('Failed to load meditations:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadMeditations()
  }, [user])

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
      // Edit pencil for user-created
      <svg className="w-4 h-4 text-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
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

        {/* Saved from community section */}
        {savedMeditations.length > 0 && (
          <div>
            <p className="text-xs text-ink-soft font-medium tracking-wide mb-4">
              Saved Meditations
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
    </>
  )
}
