/**
 * PearlCardExplore - Standard pearl card for the vertical Explore feed
 *
 * Full-width card with community engagement (vote/save).
 * Extracted from Explore/index.tsx for maintainability.
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, CardEngagement, PearlOrb } from '../Card'
import { useTapFeedback } from '../../hooks/useTapFeedback'
import { useToast } from '../../stores/useErrorStore'
import type { Pearl } from '../../lib/pearls'
import type { ExploreInteractionProps } from './types'

import { calculateFallbackVoice } from '../../lib/voiceUtils'

export interface PearlCardExploreProps extends ExploreInteractionProps {
  pearl: Pearl
  onVote: (id: string, hasVoted: boolean) => Promise<void>
  onSave: (id: string, hasSaved: boolean) => Promise<void>
}

export function PearlCardExplore({
  pearl,
  onVote,
  onSave,
  onRequireAuth,
  isAuthenticated,
  currentUserId,
}: PearlCardExploreProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [localVoted, setLocalVoted] = useState(pearl.hasVoted || false)
  const [localSaved, setLocalSaved] = useState(pearl.hasSaved || false)
  const [localUpvotes, setLocalUpvotes] = useState(pearl.upvotes)
  const [localSaves, setLocalSaves] = useState(pearl.saves || 0)
  const haptic = useTapFeedback()
  const toast = useToast()

  // Sync local state when props change (e.g., optimistic parent update or refresh)
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
