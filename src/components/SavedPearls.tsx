/**
 * SavedPearls - User's saved pearls collection
 *
 * Shows pearls the user has saved. Requires authentication.
 */

import { useState, useEffect, useCallback } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useSwipe } from '../hooks/useSwipe'
import { getSavedPearls, unsavePearl, Pearl } from '../lib/pearls'

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

export function SavedPearls() {
  const { setView } = useSessionStore()
  const { user, isAuthenticated } = useAuthStore()
  const [pearls, setPearls] = useState<Pearl[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  // Load saved pearls
  const loadPearls = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const data = await getSavedPearls(user.id)
      setPearls(data)
    } catch (err) {
      console.error('Failed to load saved pearls:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (isAuthenticated) {
      loadPearls()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, loadPearls])

  // Handle unsave
  const handleUnsave = async (pearlId: string) => {
    if (!user || removingId) return

    setRemovingId(pearlId)
    try {
      await unsavePearl(pearlId, user.id)
      setPearls(prev => prev.filter(p => p.id !== pearlId))
    } catch (err) {
      console.error('Failed to unsave pearl:', err)
    } finally {
      setRemovingId(null)
    }
  }

  // Swipe navigation
  const swipeHandlers = useSwipe({
    onSwipeDown: () => setView('timer'),
    onSwipeRight: () => setView('pearls')
  })

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="h-full bg-cream flex flex-col items-center justify-center px-8">
        <p className="font-serif text-xl text-ink mb-4">Sign in to see saved pearls</p>
        <button
          onClick={() => setView('settings')}
          className="text-sm text-ink/60 hover:text-ink transition-colors"
        >
          Go to Settings
        </button>
      </div>
    )
  }

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
        <div className="mb-8">
          <p className="font-serif text-2xl text-indigo-deep">
            Saved Pearls
          </p>
          <p className="text-sm text-ink/40 mt-1">
            {pearls.length} saved
          </p>
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
              No saved pearls
            </p>
            <p className="text-sm text-ink/30 mb-6">
              Save pearls from the community feed
            </p>
            <button
              onClick={() => setView('pearls')}
              className="text-sm text-indigo-deep hover:text-indigo-deep/80 transition-colors"
            >
              Browse Pearls
            </button>
          </div>
        )}

        {/* Saved pearls list */}
        {!isLoading && pearls.length > 0 && (
          <div className="space-y-4">
            {pearls.map((pearl) => (
              <div
                key={pearl.id}
                className="group relative bg-cream-dark/30 rounded-xl p-5"
              >
                {/* Preserved indicator */}
                {pearl.isPreserved && (
                  <div className="mb-2 text-xs text-ink/40 italic">
                    Saved copy — original was removed
                  </div>
                )}

                {/* Pearl text */}
                <p className="font-serif text-ink leading-relaxed mb-3">
                  "{pearl.text}"
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-ink/40">
                  {pearl.isPreserved ? (
                    <span>Preserved</span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {pearl.upvotes}
                      </span>
                    </span>
                  )}
                  <span>{formatTimeAgo(pearl.createdAt)}</span>
                </div>

                {/* Unsave button */}
                <button
                  onClick={() => handleUnsave(pearl.id)}
                  disabled={removingId === pearl.id}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-2 text-ink/30 hover:text-ink/60 transition-all"
                  aria-label="Remove from saved"
                >
                  {removingId === pearl.id ? (
                    <div className="w-4 h-4 border border-ink/30 border-t-ink rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-6 pt-8 mt-8 border-t border-ink/5">
          <button
            onClick={() => setView('pearls')}
            className="py-3 text-sm text-ink/40 hover:text-ink/60 transition-colors flex items-center active:scale-[0.98]"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Browse Pearls
          </button>
          <button
            onClick={() => setView('settings')}
            className="py-3 text-sm text-ink/40 hover:text-ink/60 transition-colors active:scale-[0.98]"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}
