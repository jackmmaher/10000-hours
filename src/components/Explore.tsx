/**
 * Explore - Community discovery feed
 *
 * Mixed content stream: pearls + session templates + courses
 * Randomized pattern for organic feel: 3-5 pearls → 1-2 sessions → 2-3 pearls → 1 course
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useSwipe } from '../hooks/useSwipe'
import {
  getPearls,
  votePearl,
  unvotePearl,
  savePearl,
  unsavePearl,
  Pearl,
  PearlFilter
} from '../lib/pearls'
import { AuthModal } from './AuthModal'
import { SessionCard } from './SessionCard'
import { SessionDetailModal, SessionTemplate } from './SessionDetailModal'
import { SESSION_HERO_GRADIENTS, INTENTION_TO_GRADIENT } from '../lib/animations'
import { getPublishedTemplates } from '../lib/templates'

// Import extracted data
import extractedSessions from '../data/sessions.json'

// Types for explore feed
type FeedItemType = 'pearl' | 'session'

interface FeedItem {
  type: FeedItemType
  id: string
  data: Pearl | SessionTemplate
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

// Transform extracted sessions to SessionTemplate format
function transformSession(raw: ExtractedSession): SessionTemplate {
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

// Load and transform sessions
const SEEDED_SESSIONS: SessionTemplate[] = (extractedSessions as ExtractedSession[]).map(transformSession)

type FilterType = 'all' | 'pearls' | 'sessions'
type SortType = 'rising' | 'new' | 'top' | 'saved'

export function Explore() {
  const { setView } = useSessionStore()
  const { user, isAuthenticated, refreshProfile } = useAuthStore()
  const [pearls, setPearls] = useState<Pearl[]>([])
  const [communityTemplates, setCommunityTemplates] = useState<SessionTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortType, setSortType] = useState<SortType>('rising')
  const [selectedSession, setSelectedSession] = useState<SessionTemplate | null>(null)

  // Combine seeded sessions with community templates
  const allSessions = useMemo(() => {
    // Community templates first (newest), then seeded
    return [...communityTemplates, ...SEEDED_SESSIONS]
  }, [communityTemplates])

  // Load pearls and community templates from Supabase
  const loadContent = useCallback(async () => {
    setIsLoading(true)
    try {
      // Map sort type to pearl filter
      const pearlFilter: PearlFilter = sortType === 'new' ? 'new' : sortType === 'top' ? 'top' : 'rising'
      const [pearlData, templateData] = await Promise.all([
        getPearls(pearlFilter, user?.id),
        getPublishedTemplates(20) // Limit to 20 community templates
      ])
      setPearls(pearlData)
      setCommunityTemplates(templateData)
    } catch (err) {
      console.error('Failed to load content:', err)
    } finally {
      setIsLoading(false)
    }
  }, [sortType, user?.id])

  useEffect(() => {
    loadContent()
  }, [loadContent])

  // Build mixed feed with organic randomization
  const feedItems = useMemo((): FeedItem[] => {
    const items: FeedItem[] = []

    // If filtering to specific type, show only that type
    if (filterType === 'pearls') {
      return pearls.map(p => ({ type: 'pearl' as FeedItemType, id: p.id, data: p }))
    }
    if (filterType === 'sessions') {
      return allSessions.map(s => ({ type: 'session' as FeedItemType, id: s.id, data: s }))
    }

    // Mixed feed pattern: pearls → session → pearls → session
    let pearlIndex = 0
    let sessionIndex = 0

    // Add initial pearls (3-5)
    const initialPearls = 3 + Math.floor(Math.random() * 3)
    for (let i = 0; i < initialPearls && pearlIndex < pearls.length; i++) {
      items.push({ type: 'pearl', id: pearls[pearlIndex].id, data: pearls[pearlIndex] })
      pearlIndex++
    }

    // Add session
    if (sessionIndex < allSessions.length) {
      items.push({ type: 'session', id: allSessions[sessionIndex].id, data: allSessions[sessionIndex] })
      sessionIndex++
    }

    // Add more pearls (2-3)
    const morePearls = 2 + Math.floor(Math.random() * 2)
    for (let i = 0; i < morePearls && pearlIndex < pearls.length; i++) {
      items.push({ type: 'pearl', id: pearls[pearlIndex].id, data: pearls[pearlIndex] })
      pearlIndex++
    }

    // Add another session
    if (sessionIndex < allSessions.length) {
      items.push({ type: 'session', id: allSessions[sessionIndex].id, data: allSessions[sessionIndex] })
      sessionIndex++
    }

    // Add remaining pearls with sessions interspersed
    while (pearlIndex < pearls.length) {
      items.push({ type: 'pearl', id: pearls[pearlIndex].id, data: pearls[pearlIndex] })
      pearlIndex++

      // Insert remaining sessions periodically
      if (pearlIndex % 4 === 0 && sessionIndex < allSessions.length) {
        items.push({ type: 'session', id: allSessions[sessionIndex].id, data: allSessions[sessionIndex] })
        sessionIndex++
      }
    }

    return items
  }, [pearls, filterType, allSessions])

  // Handle vote
  const handleVote = async (pearlId: string, shouldVote: boolean) => {
    if (!user) return
    if (shouldVote) {
      await votePearl(pearlId, user.id)
    } else {
      await unvotePearl(pearlId, user.id)
    }
    refreshProfile()
  }

  // Handle save
  const handleSave = async (pearlId: string, shouldSave: boolean) => {
    if (!user) return
    if (shouldSave) {
      await savePearl(pearlId, user.id)
    } else {
      await unsavePearl(pearlId, user.id)
    }
    refreshProfile()
  }

  // Swipe navigation
  const swipeHandlers = useSwipe({
    onSwipeDown: () => setView('timer'),
    onSwipeRight: () => setView('journey'),
    onSwipeLeft: () => setView('progress')
  })

  return (
    <div
      className="h-full bg-cream overflow-y-auto pb-24"
      {...swipeHandlers}
    >
      <div className="px-6 py-8 max-w-lg mx-auto">
        {/* Back to timer */}
        <button
          onClick={() => setView('timer')}
          className="flex items-center text-sm text-ink/40 mb-8 hover:text-ink/60 transition-colors active:scale-[0.98]"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
          Timer
        </button>

        {/* Header */}
        <div className="mb-6">
          <p className="font-serif text-2xl text-indigo-deep">
            Explore
          </p>
          <p className="text-sm text-ink/40 mt-1">
            Wisdom and meditations from the community
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(['all', 'pearls', 'sessions'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`
                px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-all
                ${filterType === f
                  ? 'bg-ink text-cream'
                  : 'bg-cream-deep text-ink/50 hover:text-ink/70'
                }
              `}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex gap-1 mb-6 bg-cream-deep rounded-lg p-1">
          {(['rising', 'new', 'top'] as SortType[]).map((s) => (
            <button
              key={s}
              onClick={() => setSortType(s)}
              className={`
                flex-1 py-2 px-3 text-sm rounded-md transition-all capitalize
                ${sortType === s
                  ? 'bg-cream text-ink shadow-sm'
                  : 'text-ink/50 hover:text-ink/70'
                }
              `}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-ink/10 border-t-ink/40 rounded-full animate-spin" />
          </div>
        )}

        {/* Feed */}
        {!isLoading && (
          <div className="space-y-4">
            {feedItems.map((item) => {
              if (item.type === 'pearl') {
                const pearl = item.data as Pearl
                return (
                  <PearlCardExplore
                    key={item.id}
                    pearl={pearl}
                    onVote={handleVote}
                    onSave={handleSave}
                    onRequireAuth={() => setShowAuthModal(true)}
                    isAuthenticated={isAuthenticated}
                  />
                )
              }

              if (item.type === 'session') {
                const session = item.data as SessionTemplate
                return (
                  <SessionCard
                    key={item.id}
                    session={session}
                    gradient={INTENTION_TO_GRADIENT[session.intention] || SESSION_HERO_GRADIENTS[0]}
                    onClick={() => setSelectedSession(session)}
                  />
                )
              }

              return null
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && feedItems.length === 0 && (
          <div className="text-center py-16">
            <p className="font-serif text-lg text-ink/50 mb-2">
              Nothing to explore yet
            </p>
            <p className="text-sm text-ink/30">
              Be the first to share wisdom
            </p>
          </div>
        )}
      </div>

      {/* Session detail modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onAdopt={() => {
            // TODO: Add to plans
            setSelectedSession(null)
            setView('journey')
          }}
        />
      )}

      {/* Auth modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Join the community"
        subtitle="Sign in to interact with content"
      />
    </div>
  )
}

// Pearl card variant for explore feed
function PearlCardExplore({
  pearl,
  onVote,
  onSave,
  onRequireAuth,
  isAuthenticated
}: {
  pearl: Pearl
  onVote: (id: string, hasVoted: boolean) => void
  onSave: (id: string, hasSaved: boolean) => void
  onRequireAuth: () => void
  isAuthenticated: boolean
}) {
  const [isVoting, setIsVoting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [localVoted, setLocalVoted] = useState(pearl.hasVoted || false)
  const [localSaved, setLocalSaved] = useState(pearl.hasSaved || false)
  const [localUpvotes, setLocalUpvotes] = useState(pearl.upvotes)

  const handleVote = async () => {
    if (!isAuthenticated) {
      onRequireAuth()
      return
    }
    if (isVoting) return

    setIsVoting(true)
    const newVoted = !localVoted
    setLocalVoted(newVoted)
    setLocalUpvotes(prev => newVoted ? prev + 1 : prev - 1)

    try {
      await onVote(pearl.id, newVoted)
    } catch {
      setLocalVoted(!newVoted)
      setLocalUpvotes(prev => newVoted ? prev - 1 : prev + 1)
    } finally {
      setIsVoting(false)
    }
  }

  const handleSave = async () => {
    if (!isAuthenticated) {
      onRequireAuth()
      return
    }
    if (isSaving) return

    setIsSaving(true)
    const newSaved = !localSaved
    setLocalSaved(newSaved)

    try {
      await onSave(pearl.id, newSaved)
    } catch {
      setLocalSaved(!newSaved)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-cream-deep rounded-xl p-5">
      {/* Type indicator */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-moss font-medium">✦ Pearl</span>
      </div>

      {/* Pearl text */}
      <p className="font-serif text-ink leading-relaxed mb-4">
        "{pearl.text}"
      </p>

      {/* Actions row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Vote button */}
          <button
            onClick={handleVote}
            disabled={isVoting}
            className={`
              flex items-center gap-1.5 text-sm transition-colors
              ${localVoted ? 'text-moss' : 'text-ink/40 hover:text-ink/60'}
            `}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
            </svg>
            <span className="tabular-nums">{localUpvotes}</span>
          </button>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`
              flex items-center gap-1.5 text-sm transition-colors
              ${localSaved ? 'text-indigo-deep' : 'text-ink/40 hover:text-ink/60'}
            `}
          >
            <svg
              className="w-4 h-4"
              fill={localSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* Creator hours (credibility) - randomized until backend supports it */}
        <span className="text-xs text-ink/30">
          {Math.floor(Math.random() * 200) + 50} hrs
        </span>
      </div>
    </div>
  )
}
