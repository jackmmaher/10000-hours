/**
 * Explore - Community discovery feed
 *
 * Section-based content discovery with visual hierarchy:
 * - IntentGrid: Category navigation
 * - HeroCard: Featured content
 * - PearlCarousel: Horizontal scrolling pearls
 * - Vertical feed: Sessions and remaining pearls
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useTapFeedback } from '../../hooks/useTapFeedback'
import { useNavigationStore } from '../../stores/useNavigationStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useSwipe } from '../../hooks/useSwipe'
import { usePullToRefresh } from '../../hooks/usePullToRefresh'
import {
  getPearls,
  votePearl,
  unvotePearl,
  savePearl,
  unsavePearl,
  Pearl,
  PearlFilter,
} from '../../lib/pearls'
import { AuthModal } from '../AuthModal'
import { SessionCard } from '../SessionCard'
import { SessionDetailModal, SessionTemplate } from '../SessionDetailModal'
import { getIntentionGradient } from '../../lib/animations'
import { getTemplatesForUser, voteTemplate, unvoteTemplate } from '../../lib/templates'
import { Card, CardHeader, CardBody, CardEngagement, PearlOrb } from '../Card'
import { useToast } from '../../stores/useErrorStore'

// New section components
import { IntentGrid } from './IntentGrid'
import { HeroCard } from './HeroCard'
import { PearlCarousel } from './PearlCarousel'
import { SectionHeader } from './SectionHeader'
import {
  FilterType,
  SortType,
  IntentType,
  SessionWithStatus,
  FeedItem,
  SectionContent,
} from './types'

// Import extracted data for offline fallback
import extractedSessions from '../../data/sessions.json'

// Raw session type (snake_case from JSON)
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
    intentTags: raw.intent_tags,
    karma: raw.karma,
    saves: raw.saves,
    completions: raw.completions,
    creatorHours: raw.creator_hours,
    courseId: raw.course_id,
    coursePosition: raw.course_position,
  }
}

// Offline fallback sessions
const FALLBACK_SESSIONS: SessionTemplate[] = (extractedSessions as ExtractedSession[]).map(
  transformSession
)

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function Explore() {
  const { setView, exploreFilter, clearNavigationIntent } = useNavigationStore()
  const { user, isAuthenticated, refreshProfile } = useAuthStore()
  const haptic = useTapFeedback()

  // Content state
  const [pearls, setPearls] = useState<Pearl[]>([])
  const [sessions, setSessions] = useState<SessionWithStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // UI state
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
    return sessions.length > 0 ? sessions : FALLBACK_SESSIONS
  }, [sessions])

  // Load content from Supabase
  const loadContent = useCallback(async () => {
    setIsLoading(true)
    try {
      const pearlFilter: PearlFilter =
        sortType === 'new' ? 'new' : sortType === 'top' ? 'top' : 'rising'
      const templateFilter = sortType === 'new' ? 'new' : sortType === 'top' ? 'top' : 'rising'

      const [pearlData, templateData] = await Promise.all([
        getPearls(pearlFilter, user?.id),
        user?.id
          ? getTemplatesForUser(user.id, templateFilter, 100)
          : getTemplatesForUser('00000000-0000-0000-0000-000000000000', templateFilter, 100),
      ])
      setPearls(pearlData)
      setSessions(templateData)
    } catch (err) {
      console.error('Failed to load content:', err)
      setSessions([])
    } finally {
      setIsLoading(false)
    }
  }, [sortType, user?.id])

  useEffect(() => {
    loadContent()
  }, [loadContent])

  // ============================================================================
  // SECTION CONTENT - Split content into sections for visual hierarchy
  // ============================================================================

  const sectionContent = useMemo((): SectionContent => {
    // Apply intent filter
    const filteredPearls = intentFilter
      ? pearls.filter((p) => p.intentTags?.includes(intentFilter))
      : pearls
    const filteredSessions = intentFilter
      ? allSessions.filter((s) => s.intentTags?.includes(intentFilter))
      : allSessions

    // If filtering to specific type, adjust content
    if (filterType === 'pearls') {
      return {
        featured:
          filteredPearls.length > 0
            ? { type: 'pearl', id: filteredPearls[0].id, data: filteredPearls[0] }
            : null,
        carouselPearls: filteredPearls.slice(1, 7),
        feedSessions: [],
        feedPearls: filteredPearls.slice(7),
      }
    }

    if (filterType === 'meditations') {
      return {
        featured:
          filteredSessions.length > 0
            ? { type: 'session', id: filteredSessions[0].id, data: filteredSessions[0] }
            : null,
        carouselPearls: [],
        feedSessions: filteredSessions.slice(1),
        feedPearls: [],
      }
    }

    // Mixed mode - select featured, carousel, and feed content
    const featured: FeedItem | null =
      filteredSessions.length > 0
        ? { type: 'session', id: filteredSessions[0].id, data: filteredSessions[0] }
        : filteredPearls.length > 0
          ? { type: 'pearl', id: filteredPearls[0].id, data: filteredPearls[0] }
          : null

    // Carousel: first 6 pearls (skip first if it's the featured item)
    const pearlStartIndex = featured?.type === 'pearl' ? 1 : 0
    const carouselPearls = filteredPearls.slice(pearlStartIndex, pearlStartIndex + 6)

    // Feed: remaining sessions and pearls
    const sessionStartIndex = featured?.type === 'session' ? 1 : 0
    const feedSessions = filteredSessions.slice(sessionStartIndex)
    const feedPearls = filteredPearls.slice(pearlStartIndex + 6)

    return { featured, carouselPearls, feedSessions, feedPearls }
  }, [pearls, allSessions, intentFilter, filterType])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePearlVote = async (pearlId: string, shouldVote: boolean) => {
    if (!user) return
    if (shouldVote) {
      await votePearl(pearlId, user.id)
    } else {
      await unvotePearl(pearlId, user.id)
    }
    refreshProfile()
  }

  const handlePearlSave = async (pearlId: string, shouldSave: boolean) => {
    if (!user) return
    if (shouldSave) {
      await savePearl(pearlId, user.id)
    } else {
      await unsavePearl(pearlId, user.id)
    }
    refreshProfile()
  }

  const handleSessionVote = async (sessionId: string, shouldVote: boolean) => {
    if (!user) return
    if (shouldVote) {
      await voteTemplate(sessionId, user.id)
    } else {
      await unvoteTemplate(sessionId, user.id)
    }
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, hasVoted: shouldVote, karma: s.karma + (shouldVote ? 1 : -1) }
          : s
      )
    )
    refreshProfile()
  }

  // ============================================================================
  // SCROLL & GESTURES
  // ============================================================================

  const scrollRef = useRef<HTMLDivElement>(null)

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

  const swipeHandlers = useSwipe({
    onSwipeDown: () => {
      if (scrollRef.current && scrollRef.current.scrollTop > 50) {
        setView('timer')
      }
    },
    onSwipeRight: () => setView('journey'),
    onSwipeLeft: () => setView('progress'),
  })

  // ============================================================================
  // RENDER
  // ============================================================================

  const { featured, carouselPearls, feedSessions, feedPearls } = sectionContent
  const hasContent =
    featured || carouselPearls.length > 0 || feedSessions.length > 0 || feedPearls.length > 0

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

      {/* Header & Filters - contained section */}
      <div className="px-6 pt-8 pb-4 max-w-lg mx-auto">
        {/* Header */}
        <header className="mb-4">
          <h1 className="font-serif text-2xl text-indigo-deep">Explore</h1>
          <p className="text-sm text-ink/40 mt-1">
            {intentFilter
              ? `Content for ${intentFilter}`
              : 'Wisdom and meditations from the community'}
          </p>
        </header>

        {/* Intent Grid - Primary navigation */}
        <div className="mb-8">
          <IntentGrid selectedIntent={intentFilter} onIntentSelect={setIntentFilter} />
        </div>

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

        {/* Sort selector */}
        <div className="flex gap-1 bg-cream-deep rounded-lg p-1">
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
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-ink/10 border-t-ink/40 rounded-full animate-spin" />
        </div>
      )}

      {/* Content Sections */}
      {!isLoading && hasContent && (
        <>
          {/* Hero Card - Featured content (only in 'all' mode) */}
          {filterType === 'all' && featured && (
            <section className="px-6 mb-12 max-w-lg mx-auto">
              <HeroCard
                item={featured}
                onTap={() => {
                  if (featured.type === 'session') {
                    setSelectedSession(featured.data as SessionWithStatus)
                  }
                }}
                onVote={featured.type === 'pearl' ? handlePearlVote : handleSessionVote}
                onSave={handlePearlSave}
                isAuthenticated={isAuthenticated}
                currentUserId={user?.id}
                onRequireAuth={() => setShowAuthModal(true)}
              />
            </section>
          )}

          {/* Pearl Carousel - Horizontal scroll (only in 'all' mode) */}
          {filterType === 'all' && carouselPearls.length > 0 && (
            <PearlCarousel
              pearls={carouselPearls}
              title="Rising Pearls"
              onVote={handlePearlVote}
              onSave={handlePearlSave}
              onSeeAll={() => setFilterType('pearls')}
              isAuthenticated={isAuthenticated}
              currentUserId={user?.id}
              onRequireAuth={() => setShowAuthModal(true)}
            />
          )}

          {/* Sessions Section */}
          {feedSessions.length > 0 && (
            <section className="px-6 mb-12 max-w-lg mx-auto">
              {filterType === 'all' && (
                <SectionHeader
                  title="Guided Sessions"
                  onSeeAll={() => setFilterType('meditations')}
                />
              )}
              {filterType === 'meditations' && <SectionHeader title="All Meditations" />}
              <div className="space-y-4">
                {/* Show all when filtered, limited when 'all' */}
                {(filterType === 'meditations' ? feedSessions : feedSessions.slice(0, 4)).map(
                  (session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      gradient={getIntentionGradient(session.intention)}
                      onClick={() => setSelectedSession(session)}
                      onVote={handleSessionVote}
                      onRequireAuth={() => setShowAuthModal(true)}
                      isAuthenticated={isAuthenticated}
                      currentUserId={user?.id}
                    />
                  )
                )}
              </div>
            </section>
          )}

          {/* Pearls Section */}
          {(filterType === 'pearls' ? [...carouselPearls, ...feedPearls] : feedPearls).length >
            0 && (
            <section className="px-6 mb-12 max-w-lg mx-auto">
              {filterType === 'all' && (
                <SectionHeader title="More Wisdom" onSeeAll={() => setFilterType('pearls')} />
              )}
              {filterType === 'pearls' && <SectionHeader title="All Pearls" />}
              <div className="space-y-4">
                {/* Show all when filtered, limited when 'all' */}
                {(filterType === 'pearls'
                  ? [...carouselPearls, ...feedPearls]
                  : feedPearls.slice(0, 6)
                ).map((pearl) => (
                  <PearlCardExplore
                    key={pearl.id}
                    pearl={pearl}
                    onVote={handlePearlVote}
                    onSave={handlePearlSave}
                    onRequireAuth={() => setShowAuthModal(true)}
                    isAuthenticated={isAuthenticated}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Wellbeing tracking hint */}
          {intentFilter && (
            <section className="px-6 mb-8 max-w-lg mx-auto">
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
            </section>
          )}

          {/* End-of-scroll watermark - contemplative seal */}
          <div className="flex justify-center items-center py-16 px-6">
            <img
              src="/logo-watermark.png"
              alt=""
              aria-hidden="true"
              className="w-full max-w-xs opacity-15 select-none pointer-events-none"
            />
          </div>
        </>
      )}

      {/* Empty state */}
      {!isLoading && !hasContent && (
        <div className="text-center py-16 px-6">
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

// ============================================================================
// STANDARD PEARL CARD (for vertical feed)
// ============================================================================

function calculateFallbackFeedVoice(karma: number, saves: number): number {
  const karmaScore = Math.min(Math.sqrt(karma) * 3, 30)
  const savesScore = Math.min(Math.sqrt(saves) * 4, 30)
  return Math.round(karmaScore + savesScore)
}

function PearlCardExplore({
  pearl,
  onVote,
  onSave,
  onRequireAuth,
  isAuthenticated,
  currentUserId,
}: {
  pearl: Pearl
  onVote: (id: string, hasVoted: boolean) => Promise<void>
  onSave: (id: string, hasSaved: boolean) => Promise<void>
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
  const toast = useToast()

  const isOwnContent = !!(currentUserId && pearl.userId === currentUserId)
  const voiceScore = pearl.creatorVoiceScore || calculateFallbackFeedVoice(localUpvotes, localSaves)

  const handleVote = async () => {
    if (!isAuthenticated) {
      onRequireAuth()
      return
    }
    if (isOwnContent || isVoting) return

    haptic.light()
    setIsVoting(true)
    const newVoted = !localVoted
    setLocalVoted(newVoted)
    setLocalUpvotes((prev) => (newVoted ? prev + 1 : prev - 1))

    try {
      await onVote(pearl.id, newVoted)
    } catch (err) {
      setLocalVoted(!newVoted)
      setLocalUpvotes((prev) => (newVoted ? prev - 1 : prev + 1))
      toast.fromCatch(err, 'VOTE_FAILED')
    } finally {
      setIsVoting(false)
    }
  }

  const handleSave = async () => {
    if (!isAuthenticated) {
      onRequireAuth()
      return
    }
    if (isOwnContent || isSaving) return

    haptic.light()
    setIsSaving(true)
    const newSaved = !localSaved
    setLocalSaved(newSaved)
    setLocalSaves((prev) => (newSaved ? prev + 1 : prev - 1))

    try {
      await onSave(pearl.id, newSaved)
    } catch (err) {
      setLocalSaved(!newSaved)
      setLocalSaves((prev) => (newSaved ? prev - 1 : prev + 1))
      toast.fromCatch(err, 'SAVE_FAILED')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card variant="default">
      <CardHeader
        indicator={<PearlOrb variant={isOwnContent ? 'personal' : 'community'} />}
        label={isOwnContent ? 'Your wisdom' : 'Community wisdom'}
        voiceScore={voiceScore}
      />
      <CardBody>
        <p className="font-serif text-ink leading-relaxed text-[15px]">"{pearl.text}"</p>
      </CardBody>
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
