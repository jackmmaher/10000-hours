/**
 * CompactPearlCard - Smaller pearl card for horizontal carousels
 *
 * Fixed 260px width, condensed layout for carousel scrolling.
 * Uses Card variant="subtle" for lighter visual weight.
 */

import { useState } from 'react'
import { Card, CardHeader, CardBody, CardEngagement, PearlOrb } from '../Card'
import { useTapFeedback } from '../../hooks/useTapFeedback'
import { useToast } from '../../stores/useErrorStore'
import type { Pearl } from '../../lib/pearls'
import type { ExploreInteractionProps } from './types'

interface CompactPearlCardProps extends ExploreInteractionProps {
  pearl: Pearl
  onVote: (id: string, hasVoted: boolean) => Promise<void>
  onSave: (id: string, hasSaved: boolean) => Promise<void>
}

/**
 * Fallback Voice score when creatorVoiceScore unavailable
 */
function calculateFallbackVoice(karma: number, saves: number): number {
  const karmaScore = Math.min(Math.sqrt(karma) * 3, 30)
  const savesScore = Math.min(Math.sqrt(saves) * 4, 30)
  return Math.round(karmaScore + savesScore)
}

export function CompactPearlCard({
  pearl,
  onVote,
  onSave,
  onRequireAuth,
  isAuthenticated,
  currentUserId,
}: CompactPearlCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [localVoted, setLocalVoted] = useState(pearl.hasVoted || false)
  const [localSaved, setLocalSaved] = useState(pearl.hasSaved || false)
  const [localUpvotes, setLocalUpvotes] = useState(pearl.upvotes)
  const [localSaves, setLocalSaves] = useState(pearl.saves || 0)
  const haptic = useTapFeedback()
  const toast = useToast()

  // Check if this is the user's own content
  const isOwnContent = !!(currentUserId && pearl.userId === currentUserId)

  // Voice score: use stored or calculate fallback
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
    <Card variant="subtle" className="w-[260px] flex-shrink-0 snap-start">
      {/* Compact header */}
      <CardHeader
        indicator={<PearlOrb variant={isOwnContent ? 'personal' : 'community'} />}
        label={isOwnContent ? 'Your wisdom' : 'Community'}
        voiceScore={voiceScore}
        compact
      />

      {/* Pearl text - truncated for compact display */}
      <CardBody compact>
        <p className="font-serif text-ink leading-relaxed text-[14px] line-clamp-3">
          "{pearl.text}"
        </p>
      </CardBody>

      {/* Engagement - compact mode */}
      <CardEngagement
        upvotes={localUpvotes}
        hasVoted={isOwnContent ? true : localVoted}
        onVote={isOwnContent ? undefined : handleVote}
        saves={localSaves}
        hasSaved={isOwnContent ? true : localSaved}
        onSave={isOwnContent ? undefined : handleSave}
        compact
      />
    </Card>
  )
}
