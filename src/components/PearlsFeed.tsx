/**
 * PearlsFeed - Community wisdom feed
 *
 * Displays shared pearls with voting and saving.
 * Filter by: New, Rising, Top
 */

import { useState, useEffect, useCallback } from 'react'
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

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface PearlCardProps {
  pearl: Pearl
  onVote: (id: string, hasVoted: boolean) => void
  onSave: (id: string, hasSaved: boolean) => void
  onRequireAuth: () => void
  isAuthenticated: boolean
}

function PearlCard({ pearl, onVote, onSave, onRequireAuth, isAuthenticated }: PearlCardProps) {
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
      // Revert on error
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
    <div className="bg-cream-dark/30 rounded-xl p-5">
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
              fill={localVoted ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-ink/30">
          {formatTimeAgo(pearl.createdAt)}
        </span>
      </div>
    </div>
  )
}

export function PearlsFeed() {
  const { setView } = useSessionStore()
  const { user, isAuthenticated } = useAuthStore()
  const [pearls, setPearls] = useState<Pearl[]>([])
  const [filter, setFilter] = useState<PearlFilter>('new')
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Load pearls
  const loadPearls = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getPearls(filter, user?.id)
      setPearls(data)
    } catch (err) {
      console.error('Failed to load pearls:', err)
    } finally {
      setIsLoading(false)
    }
  }, [filter, user?.id])

  useEffect(() => {
    loadPearls()
  }, [loadPearls])

  // Handle vote
  const handleVote = async (pearlId: string, shouldVote: boolean) => {
    if (!user) return

    if (shouldVote) {
      await votePearl(pearlId, user.id)
    } else {
      await unvotePearl(pearlId, user.id)
    }
  }

  // Handle save
  const handleSave = async (pearlId: string, shouldSave: boolean) => {
    if (!user) return

    if (shouldSave) {
      await savePearl(pearlId, user.id)
    } else {
      await unsavePearl(pearlId, user.id)
    }
  }

  // Swipe navigation
  const swipeHandlers = useSwipe({
    onSwipeDown: () => setView('timer'),
    onSwipeRight: () => setView('insights')
  })

  return (
    <div
      className="h-full bg-cream overflow-y-auto"
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
            Pearls of Wisdom
          </p>
          <p className="text-sm text-ink/40 mt-1">
            Insights shared by meditators
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 bg-cream-dark/50 rounded-lg p-1">
          {(['new', 'rising', 'top'] as PearlFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                flex-1 py-2 px-3 text-sm rounded-md transition-all capitalize
                ${filter === f
                  ? 'bg-cream text-ink shadow-sm'
                  : 'text-ink/50 hover:text-ink/70'
                }
              `}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-1 h-1 bg-indigo-deep/30 rounded-full animate-pulse" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && pearls.length === 0 && (
          <div className="text-center py-16">
            <p className="font-serif text-lg text-ink/50 mb-2">
              No pearls yet
            </p>
            <p className="text-sm text-ink/30">
              Be the first to share wisdom
            </p>
          </div>
        )}

        {/* Pearls list */}
        {!isLoading && pearls.length > 0 && (
          <div className="space-y-4">
            {pearls.map((pearl) => (
              <PearlCard
                key={pearl.id}
                pearl={pearl}
                onVote={handleVote}
                onSave={handleSave}
                onRequireAuth={() => setShowAuthModal(true)}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-6 pt-8 mt-8 border-t border-ink/5">
          <button
            onClick={() => setView('insights')}
            className="py-3 text-sm text-ink/40 hover:text-ink/60 transition-colors flex items-center active:scale-[0.98]"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            My Insights
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setView('saved-pearls' as 'timer')} // Type hack, will fix
              className="py-3 text-sm text-ink/40 hover:text-ink/60 transition-colors active:scale-[0.98]"
            >
              Saved
            </button>
          )}
          <button
            onClick={() => setView('settings')}
            className="py-3 text-sm text-ink/40 hover:text-ink/60 transition-colors active:scale-[0.98]"
          >
            Settings
          </button>
        </div>
      </div>

      {/* Auth modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Join the community"
        subtitle="Sign in to vote and save pearls"
      />
    </div>
  )
}
