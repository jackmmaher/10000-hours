/**
 * Explore - Community discovery feed
 *
 * Mixed content stream: pearls + session templates + courses
 * Randomized pattern for organic feel: 3-5 pearls → 1-2 sessions → 2-3 pearls → 1 course
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useSwipe } from '../hooks/useSwipe'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import {
  getPearls,
  votePearl,
  unvotePearl,
  savePearl,
  unsavePearl,
  Pearl,
  PearlFilter,
} from '../lib/pearls'
import { AuthModal } from './AuthModal'
import { SessionCard } from './SessionCard'
import { SessionDetailModal, SessionTemplate } from './SessionDetailModal'
import { getIntentionGradient } from '../lib/animations'
import { getTemplatesForUser, voteTemplate, unvoteTemplate } from '../lib/templates'
import { Card, CardHeader, CardBody, CardEngagement, PearlOrb } from './Card'

// Import extracted data
import extractedSessions from '../data/sessions.json'

// Types for explore feed
type FeedItemType = 'pearl' | 'session'

interface FeedItem {
  type: FeedItemType
  id: string
  data: Pearl | SessionTemplate
}

// Raw session type (snake_case from JSON - used as offline fallback)
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
  intent_tags?: string[]
  karma: number
  saves: number
  completions: number
  creator_hours: number
  course_id?: string
  course_position?: number
}

// Transform extracted sessions to SessionTemplate format (for offline fallback)
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
    intentTags: raw.intent_tags,
    karma: raw.karma,
    saves: raw.saves,
    completions: raw.completions,
    creatorHours: raw.creator_hours,
    courseId: raw.course_id,
    coursePosition: raw.course_position,
  }
}

// Offline fallback sessions (from JSON - used when Supabase unavailable)
const FALLBACK_SESSIONS: SessionTemplate[] = (extractedSessions as ExtractedSession[]).map(
  transformSession
)

type FilterType = 'all' | 'pearls' | 'meditations'
type SortType = 'rising' | 'new' | 'top' | 'saved'

// Intent filter options - Pareto-aligned: 8 filters covering ~80% of user intent
const INTENT_OPTIONS = [
  'anxiety',
  'stress',
  'sleep',
  'focus',
  'beginners',
  'body-awareness',
  'self-compassion',
  'letting-go',
] as const

type IntentType = (typeof INTENT_OPTIONS)[number] | null

// Extended session template with user interaction flags
interface SessionWithStatus extends SessionTemplate {
  hasVoted?: boolean
  hasSaved?: boolean
  hasCompleted?: boolean
}

export function Explore() {
  const { setView, exploreFilter, clearNavigationIntent } = useNavigationStore()
  const { user, isAuthenticated, refreshProfile } = useAuthStore()
  const haptic = useTapFeedback()
  const [pearls, setPearls] = useState<Pearl[]>([])
  const [sessions, setSessions] = useState<SessionWithStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortType, setSortType] = useState<SortType>('rising')
  const [intentFilter, setIntentFilter] = useState<IntentType>(null)
  const [selectedSession, setSelectedSession] = useState<SessionWithStatus | null>(null)

  // Consume navigation intent (from Progress tab CTAs)
  useEffect(() => {
    if (exploreFilter) {
      setFilterType(exploreFilter)
      clearNavigationIntent()
    }
  }, [exploreFilter, clearNavigationIntent])

  // All sessions - from Supabase with fallback to JSON
  const allSessions = useMemo(() => {
    // Use Supabase data if available, otherwise fallback to JSON
    return sessions.length > 0 ? sessions : FALLBACK_SESSIONS
  }, [sessions])

  // Load pearls and sessions from Supabase
  const loadContent = useCallback(async () => {
    setIsLoading(true)
    try {
      // Map sort type to filters
      const pearlFilter: PearlFilter =
        sortType === 'new' ? 'new' : sortType === 'top' ? 'top' : 'rising'
      const templateFilter = sortType === 'new' ? 'new' : sortType === 'top' ? 'top' : 'rising'

      const [pearlData, templateData] = await Promise.all([
        getPearls(pearlFilter, user?.id),
        // Fetch all templates with user's vote/save status if authenticated
        user?.id
          ? getTemplatesForUser(user.id, templateFilter, 100)
          : getTemplatesForUser('00000000-0000-0000-0000-000000000000', templateFilter, 100),
      ])
      setPearls(pearlData)
      setSessions(templateData)
    } catch (err) {
      console.error('Failed to load content:', err)
      // Use fallback sessions on error
      setSessions([])
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

    // Apply intent filter to content
    let filteredPearls = pearls
    let filteredSessions = allSessions

    if (intentFilter) {
      filteredPearls = pearls.filter((p) => p.intentTags?.includes(intentFilter))
      filteredSessions = allSessions.filter((s) => s.intentTags?.includes(intentFilter))
    }

    // If filtering to specific type, show only that type
    if (filterType === 'pearls') {
      return filteredPearls.map((p) => ({ type: 'pearl' as FeedItemType, id: p.id, data: p }))
    }
    if (filterType === 'meditations') {
      return filteredSessions.map((s) => ({ type: 'session' as FeedItemType, id: s.id, data: s }))
    }

    // Mixed feed pattern: pearls → session → pearls → session
    let pearlIndex = 0
    let sessionIndex = 0

    // Add initial pearls (3-5)
    const initialPearls = 3 + Math.floor(Math.random() * 3)
    for (let i = 0; i < initialPearls && pearlIndex < filteredPearls.length; i++) {
      items.push({
        type: 'pearl',
        id: filteredPearls[pearlIndex].id,
        data: filteredPearls[pearlIndex],
      })
      pearlIndex++
    }

    // Add session
    if (sessionIndex < filteredSessions.length) {
      items.push({
        type: 'session',
        id: filteredSessions[sessionIndex].id,
        data: filteredSessions[sessionIndex],
      })
      sessionIndex++
    }

    // Add more pearls (2-3)
    const morePearls = 2 + Math.floor(Math.random() * 2)
    for (let i = 0; i < morePearls && pearlIndex < filteredPearls.length; i++) {
      items.push({
        type: 'pearl',
        id: filteredPearls[pearlIndex].id,
        data: filteredPearls[pearlIndex],
      })
      pearlIndex++
    }

    // Add another session
    if (sessionIndex < filteredSessions.length) {
      items.push({
        type: 'session',
        id: filteredSessions[sessionIndex].id,
        data: filteredSessions[sessionIndex],
      })
      sessionIndex++
    }

    // Add remaining pearls with sessions interspersed
    while (pearlIndex < filteredPearls.length) {
      items.push({
        type: 'pearl',
        id: filteredPearls[pearlIndex].id,
        data: filteredPearls[pearlIndex],
      })
      pearlIndex++

      // Insert remaining sessions periodically
      if (pearlIndex % 4 === 0 && sessionIndex < filteredSessions.length) {
        items.push({
          type: 'session',
          id: filteredSessions[sessionIndex].id,
          data: filteredSessions[sessionIndex],
        })
        sessionIndex++
      }
    }

    return items
  }, [pearls, filterType, allSessions, intentFilter])

  // Handle pearl vote
  const handleVote = async (pearlId: string, shouldVote: boolean) => {
    if (!user) return
    if (shouldVote) {
      await votePearl(pearlId, user.id)
    } else {
      await unvotePearl(pearlId, user.id)
    }
    refreshProfile()
  }

  // Handle pearl save
  const handleSave = async (pearlId: string, shouldSave: boolean) => {
    if (!user) return
    if (shouldSave) {
      await savePearl(pearlId, user.id)
    } else {
      await unsavePearl(pearlId, user.id)
    }
    refreshProfile()
  }

  // Handle session vote
  const handleSessionVote = async (sessionId: string, shouldVote: boolean) => {
    if (!user) return
    if (shouldVote) {
      await voteTemplate(sessionId, user.id)
    } else {
      await unvoteTemplate(sessionId, user.id)
    }
    // Update local state optimistically
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, hasVoted: shouldVote, karma: s.karma + (shouldVote ? 1 : -1) }
          : s
      )
    )
    refreshProfile()
  }

  // Reference to scroll container
  const scrollRef = useRef<HTMLDivElement>(null)

  // Pull-to-refresh
  const {
    isPulling,
    isRefreshing,
    pullDistance,
    handlers: pullHandlers,
  } = usePullToRefresh({
    onRefresh: async () => {
      await loadContent()
    },
  })

  // Swipe navigation
  const swipeHandlers = useSwipe({
    onSwipeDown: () => {
      // Only navigate if not at top
      if (scrollRef.current && scrollRef.current.scrollTop > 50) {
        setView('timer')
      }
    },
    onSwipeRight: () => setView('journey'),
    onSwipeLeft: () => setView('progress'),
  })

  return (
    <div
      ref={scrollRef}
      className="h-full bg-cream overflow-y-auto pb-24"
      {...swipeHandlers}
      onTouchStart={(e) => {
        pullHandlers.onTouchStart(e)
        swipeHandlers.onTouchStart?.(e)
      }}
      onTouchMove={pullHandlers.onTouchMove}
      onTouchEnd={(e) => {
        pullHandlers.onTouchEnd()
        swipeHandlers.onTouchEnd?.(e)
      }}
    >
      {/* Pull-to-refresh indicator */}
      <div
        className="flex justify-center overflow-hidden transition-all duration-200"
        style={{
          height: isPulling || isRefreshing ? Math.min(pullDistance, 80) : 0,
          opacity: isPulling || isRefreshing ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-2 py-2">
          {isRefreshing ? (
            <div className="w-5 h-5 border-2 border-indigo-deep/30 border-t-indigo-deep rounded-full animate-spin" />
          ) : (
            <svg
              className="w-5 h-5 text-indigo-deep transition-transform duration-200"
              style={{ transform: pullDistance >= 80 ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          )}
          <span className="text-sm text-indigo-deep">
            {isRefreshing
              ? 'Refreshing...'
              : pullDistance >= 80
                ? 'Release to refresh'
                : 'Pull to refresh'}
          </span>
        </div>
      </div>
      <div className="px-6 py-8 max-w-lg mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="font-serif text-2xl text-indigo-deep">Explore</h1>
          <p className="text-sm text-ink/40 mt-1">
            {intentFilter
              ? `Content for ${intentFilter}`
              : 'Wisdom and meditations from the community'}
          </p>
        </header>

        {/* Filter bar */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(['all', 'pearls', 'meditations'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => {
                haptic.light()
                setFilterType(f)
              }}
              className={`
                px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-all
                ${
                  filterType === f
                    ? 'bg-ink text-cream'
                    : 'bg-cream-deep text-ink/50 hover:text-ink/70'
                }
              `}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Intent filter - collapsible to reduce cognitive load */}
        <div className="mb-4">
          <button
            onClick={() => {
              haptic.light()
              if (intentFilter) {
                setIntentFilter(null)
              }
            }}
            className="flex items-center gap-2 text-xs text-ink/40 mb-2"
          >
            <span>Feeling:</span>
            {intentFilter && (
              <span className="flex items-center gap-1 bg-ink text-cream px-2 py-0.5 rounded-full">
                {intentFilter}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </span>
            )}
          </button>
          <div className="flex flex-wrap gap-1.5">
            {INTENT_OPTIONS.map((intent) => (
              <button
                key={intent}
                onClick={() => {
                  haptic.light()
                  setIntentFilter(intentFilter === intent ? null : intent)
                }}
                className={`
                  px-2.5 py-1 text-xs rounded-full transition-all
                  ${
                    intentFilter === intent
                      ? 'bg-ink text-cream'
                      : 'bg-cream-deep text-ink/50 hover:text-ink/70'
                  }
                `}
              >
                {intent}
              </button>
            ))}
          </div>
        </div>

        {/* Sort selector */}
        <div className="flex gap-1 mb-6 bg-cream-deep rounded-lg p-1">
          {(['rising', 'new', 'top'] as SortType[]).map((s) => (
            <button
              key={s}
              onClick={() => {
                haptic.light()
                setSortType(s)
              }}
              className={`
                flex-1 py-2 px-3 text-sm rounded-md transition-all capitalize
                ${sortType === s ? 'bg-cream text-ink shadow-sm' : 'text-ink/50 hover:text-ink/70'}
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
                    currentUserId={user?.id}
                  />
                )
              }

              if (item.type === 'session') {
                const session = item.data as SessionWithStatus
                return (
                  <SessionCard
                    key={item.id}
                    session={session}
                    gradient={getIntentionGradient(session.intention)}
                    onClick={() => setSelectedSession(session)}
                    onVote={handleSessionVote}
                    onRequireAuth={() => setShowAuthModal(true)}
                    isAuthenticated={isAuthenticated}
                    currentUserId={user?.id}
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
              {intentFilter ? `No content for "${intentFilter}"` : 'Nothing to explore yet'}
            </p>
            <p className="text-sm text-ink/30">
              {intentFilter ? (
                <button
                  onClick={() => {
                    haptic.light()
                    setIntentFilter(null)
                  }}
                  className="underline hover:text-ink/50"
                >
                  Clear filter
                </button>
              ) : (
                'Be the first to share wisdom'
              )}
            </p>
          </div>
        )}

        {/* Wellbeing tracking hint - shown when filter active and has results */}
        {!isLoading && intentFilter && feedItems.length > 0 && (
          <div className="mt-8 pt-6 border-t border-ink/5">
            <button
              onClick={() => {
                haptic.light()
                setView('settings')
              }}
              className="w-full text-left bg-cream-deep/50 rounded-xl p-4 hover:bg-cream-deep transition-colors"
            >
              <p className="text-xs text-ink/40 mb-1">Track your journey</p>
              <p className="text-sm text-ink/70">
                Monitor your {intentFilter} over time in Settings
              </p>
            </button>
          </div>
        )}
      </div>

      {/* Session detail modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onAdopt={() => {
            setSelectedSession(null)
            setView('journey')
          }}
          onVote={handleSessionVote}
          onSaveChange={(sessionId, shouldSave) => {
            // Update local state when modal saves
            setSessions((prev) =>
              prev.map((s) =>
                s.id === sessionId
                  ? { ...s, hasSaved: shouldSave, saves: s.saves + (shouldSave ? 1 : -1) }
                  : s
              )
            )
          }}
          isAuthenticated={isAuthenticated}
          onRequireAuth={() => setShowAuthModal(true)}
          currentUserId={user?.id}
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

/**
 * Fallback feed Voice score calculation when creatorVoiceScore is unavailable
 * Uses karma and saves as a content-specific estimate
 */
function calculateFallbackFeedVoice(karma: number, saves: number): number {
  // Karma: sqrt(karma) * 3, cap at 30
  const karmaScore = Math.min(Math.sqrt(karma) * 3, 30)

  // Saves: sqrt(saves) * 4, cap at 30
  const savesScore = Math.min(Math.sqrt(saves) * 4, 30)

  return Math.round(karmaScore + savesScore)
}

// Pearl card variant for explore feed - uses unified Card system
function PearlCardExplore({
  pearl,
  onVote,
  onSave,
  onRequireAuth,
  isAuthenticated,
  currentUserId,
}: {
  pearl: Pearl
  onVote: (id: string, hasVoted: boolean) => void
  onSave: (id: string, hasSaved: boolean) => void
  onRequireAuth: () => void
  isAuthenticated: boolean
  currentUserId?: string
}) {
  const [isVoting, setIsVoting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [localVoted, setLocalVoted] = useState(pearl.hasVoted || false)
  const [localSaved, setLocalSaved] = useState(pearl.hasSaved || false)
  const [localUpvotes, setLocalUpvotes] = useState(pearl.upvotes)
  const [localSaves, setLocalSaves] = useState(pearl.saves || 0)
  const haptic = useTapFeedback()

  // Check if this is the user's own content (can't vote/save own content)
  const isOwnContent = !!(currentUserId && pearl.userId === currentUserId)

  // Use creator's stored Voice score if available, otherwise fallback to content-based calculation
  const voiceScore = pearl.creatorVoiceScore || calculateFallbackFeedVoice(localUpvotes, localSaves)

  const handleVote = async () => {
    if (!isAuthenticated) {
      onRequireAuth()
      return
    }
    // Prevent self-voting
    if (isOwnContent || isVoting) return

    haptic.light()
    setIsVoting(true)
    const newVoted = !localVoted
    setLocalVoted(newVoted)
    setLocalUpvotes((prev) => (newVoted ? prev + 1 : prev - 1))

    try {
      await onVote(pearl.id, newVoted)
    } catch {
      setLocalVoted(!newVoted)
      setLocalUpvotes((prev) => (newVoted ? prev - 1 : prev + 1))
    } finally {
      setIsVoting(false)
    }
  }

  const handleSave = async () => {
    if (!isAuthenticated) {
      onRequireAuth()
      return
    }
    // Prevent self-saving (own content is already in "My Pearls")
    if (isOwnContent || isSaving) return

    haptic.light()
    setIsSaving(true)
    const newSaved = !localSaved
    setLocalSaved(newSaved)
    setLocalSaves((prev) => (newSaved ? prev + 1 : prev - 1))

    try {
      await onSave(pearl.id, newSaved)
    } catch {
      setLocalSaved(!newSaved)
      setLocalSaves((prev) => (newSaved ? prev - 1 : prev + 1))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card variant="default">
      {/* Header with pearl orb and Voice badge */}
      <CardHeader
        indicator={<PearlOrb variant={isOwnContent ? 'personal' : 'community'} />}
        label={isOwnContent ? 'Your wisdom' : 'Community wisdom'}
        voiceScore={voiceScore}
      />

      {/* Pearl text */}
      <CardBody>
        <p className="font-serif text-ink leading-relaxed text-[15px]">"{pearl.text}"</p>
      </CardBody>

      {/* Actions row - disable for own content */}
      <CardEngagement
        upvotes={localUpvotes}
        hasVoted={isOwnContent ? true : localVoted}
        onVote={isOwnContent ? undefined : handleVote}
        saves={localSaves}
        hasSaved={isOwnContent ? true : localSaved}
        onSave={isOwnContent ? undefined : handleSave}
      />
    </Card>
  )
}
