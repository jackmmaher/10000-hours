/**
 * HeroCard - Featured content with visual prominence
 *
 * Full-width card with larger typography for above-the-fold focus.
 * Handles both pearl and session content types.
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, CardEngagement, PearlOrb, AccentBar } from '../Card'
import { VoiceBadgeWithHours } from '../VoiceBadge'
import { useTapFeedback } from '../../hooks/useTapFeedback'
import { useToast } from '../../stores/useErrorStore'
import { getIntentionGradient } from '../../lib/animations'
import type { Pearl } from '../../lib/pearls'
import type { FeedItem, SessionWithStatus, ExploreInteractionProps } from './types'

interface HeroCardProps extends ExploreInteractionProps {
  item: FeedItem
  onTap: () => void
  onVote: (id: string, hasVoted: boolean) => Promise<void>
  onSave: (id: string, hasSaved: boolean) => Promise<void>
}

/**
 * Fallback Voice score calculation
 */
function calculateFallbackVoice(karma: number, saves: number): number {
  const karmaScore = Math.min(Math.sqrt(karma) * 3, 30)
  const savesScore = Math.min(Math.sqrt(saves) * 4, 30)
  return Math.round(karmaScore + savesScore)
}

export function HeroCard({
  item,
  onTap,
  onVote,
  onSave,
  isAuthenticated,
  currentUserId,
  onRequireAuth,
}: HeroCardProps) {
  if (item.type === 'pearl') {
    return (
      <HeroPearlCard
        pearl={item.data as Pearl}
        onVote={onVote}
        onSave={onSave}
        isAuthenticated={isAuthenticated}
        currentUserId={currentUserId}
        onRequireAuth={onRequireAuth}
      />
    )
  }

  return (
    <HeroSessionCard
      session={item.data as SessionWithStatus}
      onTap={onTap}
      onVote={onVote}
      onSave={onSave}
      isAuthenticated={isAuthenticated}
      currentUserId={currentUserId}
      onRequireAuth={onRequireAuth}
    />
  )
}

// ============================================================================
// HERO PEARL CARD
// ============================================================================

interface HeroPearlCardProps extends ExploreInteractionProps {
  pearl: Pearl
  onVote: (id: string, hasVoted: boolean) => Promise<void>
  onSave: (id: string, hasSaved: boolean) => Promise<void>
}

function HeroPearlCard({
  pearl,
  onVote,
  onSave,
  isAuthenticated,
  currentUserId,
  onRequireAuth,
}: HeroPearlCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [localVoted, setLocalVoted] = useState(pearl.hasVoted || false)
  const [localSaved, setLocalSaved] = useState(pearl.hasSaved || false)
  const [localUpvotes, setLocalUpvotes] = useState(pearl.upvotes)
  const [localSaves, setLocalSaves] = useState(pearl.saves || 0)
  const haptic = useTapFeedback()
  const toast = useToast()

  // Sync local state when props change (e.g., on refresh)
  useEffect(() => {
    if (pearl.hasVoted !== undefined) {
      setLocalVoted(pearl.hasVoted)
    }
    if (pearl.hasSaved !== undefined) {
      setLocalSaved(pearl.hasSaved)
    }
    setLocalUpvotes(pearl.upvotes)
    setLocalSaves(pearl.saves || 0)
  }, [pearl.hasVoted, pearl.hasSaved, pearl.upvotes, pearl.saves])

  const isOwnContent = !!(currentUserId && pearl.userId === currentUserId)
  const voiceScore = pearl.creatorVoiceScore || calculateFallbackVoice(localUpvotes, localSaves)

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
    <Card variant="elevated" className="min-h-[160px]">
      {/* Header with prominence */}
      <CardHeader
        indicator={<PearlOrb variant={isOwnContent ? 'personal' : 'community'} />}
        label="Featured Wisdom"
        voiceScore={voiceScore}
      />

      {/* Larger text for hero treatment */}
      <CardBody className="py-4">
        <p className="font-serif text-ink leading-relaxed text-lg">"{pearl.text}"</p>
      </CardBody>

      {/* Engagement */}
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

// ============================================================================
// HERO SESSION CARD
// ============================================================================

interface HeroSessionCardProps extends ExploreInteractionProps {
  session: SessionWithStatus
  onTap: () => void
  onVote: (id: string, hasVoted: boolean) => Promise<void>
  onSave: (id: string, hasSaved: boolean) => Promise<void>
}

function HeroSessionCard({
  session,
  onTap,
  onVote,
  onSave,
  isAuthenticated,
  currentUserId,
  onRequireAuth,
}: HeroSessionCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [localVoted, setLocalVoted] = useState(session.hasVoted || false)
  const [localSaved, setLocalSaved] = useState(session.hasSaved || false)
  const [localKarma, setLocalKarma] = useState(session.karma)
  const [localSaves, setLocalSaves] = useState(session.saves)
  const haptic = useTapFeedback()
  const toast = useToast()

  // Sync local state when props change (e.g., on refresh)
  useEffect(() => {
    if (session.hasVoted !== undefined) {
      setLocalVoted(session.hasVoted)
    }
    if (session.hasSaved !== undefined) {
      setLocalSaved(session.hasSaved)
    }
    setLocalKarma(session.karma)
    setLocalSaves(session.saves)
  }, [session.hasVoted, session.hasSaved, session.karma, session.saves])

  const isOwnContent = !!(currentUserId && session.userId === currentUserId)
  const voiceScore = session.creatorVoiceScore || calculateFallbackVoice(localKarma, localSaves)
  const gradient = getIntentionGradient(session.intention)

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
    setLocalKarma((prev) => (newVoted ? prev + 1 : prev - 1))

    try {
      await onVote(session.id, newVoted)
    } catch (err) {
      setLocalVoted(!newVoted)
      setLocalKarma((prev) => (newVoted ? prev - 1 : prev + 1))
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
      await onSave(session.id, newSaved)
    } catch (err) {
      setLocalSaved(!newSaved)
      setLocalSaves((prev) => (newSaved ? prev - 1 : prev + 1))
      toast.fromCatch(err, 'SAVE_FAILED')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card
      variant="elevated"
      onClick={() => {
        haptic.light()
        onTap()
      }}
      className="min-h-[180px]"
    >
      <div className="flex">
        {/* Gradient accent bar - using AccentBar component for consistency */}
        <div className="py-4 pl-4">
          <AccentBar gradient={`bg-gradient-to-b ${gradient}`} />
        </div>

        {/* Content */}
        <div className="flex-1 py-4 pl-4 pr-4">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-xs text-ink-soft font-medium">
                Featured Session
                <span className="text-ink/40 mx-1.5">·</span>
                <span className="text-ink/50">{session.durationGuidance}</span>
              </span>
            </div>
            <VoiceBadgeWithHours score={voiceScore} />
          </div>

          {/* Title - larger for hero */}
          <h3 className="font-serif text-xl text-ink mb-2 leading-tight">{session.title}</h3>

          {/* Tagline */}
          <p className="text-sm text-ink-soft italic line-clamp-2 mb-4">{session.tagline}</p>

          {/* Engagement row */}
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleVote()
              }}
              className={`
                flex items-center gap-1.5 text-sm transition-colors
                ${localVoted ? 'text-accent font-medium' : 'text-ink-soft hover:text-accent'}
              `}
              disabled={isOwnContent}
            >
              <svg
                className="w-4 h-4"
                fill={localVoted ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              <span>{localKarma}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleSave()
              }}
              className={`
                flex items-center gap-1.5 text-sm transition-colors
                ${localSaved ? 'text-accent font-medium' : 'text-ink-soft hover:text-accent'}
              `}
              disabled={isOwnContent}
            >
              <svg
                className="w-4 h-4"
                fill={localSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              <span>{localSaves}</span>
            </button>

            {session.completions > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-ink-soft">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{session.completions.toLocaleString()}</span>
              </span>
            )}

            {/* Arrow indicator */}
            <div className="flex-1" />
            <svg
              className="w-5 h-5 text-ink/20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Card>
  )
}
