/**
 * SessionCard - Community session template card for explore feed
 *
 * Uses unified Card system with glassmorphism.
 * Shows session with gradient accent, title, tagline, and engagement stats.
 */

import { useState, useEffect, useCallback } from 'react'
import { SessionTemplate } from './SessionDetailModal'
import { Card, CardHeader, CardBody, AccentBar, CardEngagement } from './Card'
import { VoiceBadgeWithHours } from './VoiceBadge'
import { saveTemplate, unsaveTemplate, isTemplateSaved } from '../lib/db'
import { useTapFeedback } from '../hooks/useTapFeedback'

/**
 * Calculate simplified feed Voice score for sessions
 * Uses hours, karma, saves, and completions
 */
function calculateSessionVoice(hours: number, karma: number, saves: number, completions: number): number {
  // Hours: log10(hours + 1) * 10, cap at 40
  const hoursScore = Math.min(Math.log10(hours + 1) * 10, 40)

  // Karma: sqrt(karma) * 2, cap at 20
  const karmaScore = Math.min(Math.sqrt(karma) * 2, 20)

  // Saves: sqrt(saves) * 3, cap at 20
  const savesScore = Math.min(Math.sqrt(saves) * 3, 20)

  // Completions: sqrt(completions) * 1.5, cap at 20
  const completionsScore = Math.min(Math.sqrt(completions) * 1.5, 20)

  return Math.round(hoursScore + karmaScore + savesScore + completionsScore)
}

interface SessionCardProps {
  session: SessionTemplate & { hasVoted?: boolean; hasSaved?: boolean }
  gradient: string
  onClick: () => void
  // Optional callbacks for Supabase integration
  onVote?: (sessionId: string, shouldVote: boolean) => Promise<void>
  onRequireAuth?: () => void
  isAuthenticated?: boolean
}

export function SessionCard({
  session,
  gradient,
  onClick,
  onVote,
  onRequireAuth,
  isAuthenticated = true
}: SessionCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  // Initialize from props if provided (Supabase), otherwise local state
  const [localVoted, setLocalVoted] = useState(session.hasVoted ?? false)
  const [localSaved, setLocalSaved] = useState(session.hasSaved ?? false)
  const [localUpvotes, setLocalUpvotes] = useState(session.karma)
  const haptic = useTapFeedback()

  // Sync local state when props change (e.g., on refresh)
  useEffect(() => {
    if (session.hasVoted !== undefined) {
      setLocalVoted(session.hasVoted)
    }
    if (session.hasSaved !== undefined) {
      setLocalSaved(session.hasSaved)
    }
    setLocalUpvotes(session.karma)
  }, [session.hasVoted, session.hasSaved, session.karma])

  // Check if template is already saved on mount (fallback to IndexedDB)
  useEffect(() => {
    if (session.hasSaved === undefined) {
      isTemplateSaved(session.id).then(setLocalSaved)
    }
  }, [session.id, session.hasSaved])

  // Handle vote - uses Supabase if callback provided
  const handleVote = useCallback(async () => {
    if (!isAuthenticated && onRequireAuth) {
      onRequireAuth()
      return
    }
    if (isVoting) return
    haptic.light()
    setIsVoting(true)
    const newVoted = !localVoted

    // Optimistic update
    setLocalVoted(newVoted)
    setLocalUpvotes(prev => newVoted ? prev + 1 : prev - 1)

    try {
      // Call Supabase if callback provided
      if (onVote) {
        await onVote(session.id, newVoted)
      }
    } catch (err) {
      // Rollback on error
      setLocalVoted(!newVoted)
      setLocalUpvotes(prev => newVoted ? prev - 1 : prev + 1)
      console.error('Failed to vote:', err)
    } finally {
      setIsVoting(false)
    }
  }, [isVoting, localVoted, haptic, onVote, session.id, isAuthenticated, onRequireAuth])

  // Handle save (persists to local IndexedDB)
  const handleSave = useCallback(async () => {
    if (isSaving) return
    haptic.light()
    setIsSaving(true)
    const newSaved = !localSaved

    try {
      if (newSaved) {
        await saveTemplate(session.id)
      } else {
        await unsaveTemplate(session.id)
      }
      setLocalSaved(newSaved)
    } catch (err) {
      console.error('Failed to save/unsave template:', err)
    } finally {
      setIsSaving(false)
    }
  }, [isSaving, localSaved, session.id, haptic])

  // Calculate Voice score from available session data
  const voiceScore = calculateSessionVoice(
    session.creatorHours,
    localUpvotes,
    session.saves,
    session.completions
  )

  return (
    <Card variant="default" onClick={onClick} className="group">
      <div className="flex">
        {/* Gradient accent bar */}
        <div className="py-4 pl-4">
          <AccentBar gradient={`bg-gradient-to-b ${gradient}`} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header - without voice score, it goes in the right column */}
          <CardHeader
            label={session.discipline}
            sublabel={`${session.durationGuidance} · ${session.posture}`}
            compact
          />

          {/* Body */}
          <CardBody compact>
            <p className="font-serif text-ink text-lg leading-snug pr-6 mb-1">
              {session.title}
            </p>
            <p className="text-sm text-ink-soft italic line-clamp-1">
              "{session.tagline}"
            </p>
          </CardBody>

          {/* Stats */}
          <CardEngagement
            upvotes={localUpvotes}
            hasVoted={localVoted}
            onVote={handleVote}
            saves={session.saves}
            hasSaved={localSaved}
            onSave={handleSave}
            practiced={session.completions}
            compact
          />
        </div>

        {/* Right column: Voice badge at top, arrow at center */}
        <div className="flex flex-col items-center justify-between py-3 pr-4">
          {/* Voice badge - aligned with header */}
          {voiceScore > 0 && (
            <VoiceBadgeWithHours score={voiceScore} />
          )}
          {/* Subtle arrow indicator */}
          <div className="flex-1 flex items-center text-ink/15 group-hover:text-ink/30 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Card>
  )
}
