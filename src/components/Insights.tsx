/**
 * Insights - Browse saved meditation insights and shared pearls
 *
 * Bifurcated view with tabs:
 * - Notes: Personal insights (tap to view/share/delete)
 * - Pearls: Your shared wisdom with karma/saves stats
 */

import { useEffect, useState, useCallback } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useSwipe } from '../hooks/useSwipe'
import { getInsights, deleteInsight, markInsightAsShared, Insight } from '../lib/db'
import { getMyPearls, deletePearl, Pearl } from '../lib/pearls'
import { SharePearl } from './SharePearl'

type Tab = 'notes' | 'pearls'

function formatInsightDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))

  if (days === 0) {
    return 'Today'
  } else if (days === 1) {
    return 'Yesterday'
  } else if (days < 7) {
    return `${days} days ago`
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

function formatPearlDate(dateStr: string): string {
  return formatInsightDate(new Date(dateStr))
}

export function Insights() {
  const { setView } = useSessionStore()
  const { user, isAuthenticated, refreshProfile } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('notes')
  const [insights, setInsights] = useState<Insight[]>([])
  const [myPearls, setMyPearls] = useState<Pearl[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null)
  const [sharingInsight, setSharingInsight] = useState<Insight | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Load data on mount and tab change
  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        if (activeTab === 'notes') {
          const data = await getInsights()
          setInsights(data.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ))
        } else if (activeTab === 'pearls' && isAuthenticated && user) {
          const pearls = await getMyPearls(user.id)
          setMyPearls(pearls)
        }
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [activeTab, isAuthenticated, user])

  // Handle insight delete
  const handleDeleteInsight = useCallback(async (id: string) => {
    if (deletingId) return
    setDeletingId(id)
    try {
      await deleteInsight(id)
      setInsights(prev => prev.filter(i => i.id !== id))
      setSelectedInsight(null)
    } catch (err) {
      console.error('Failed to delete insight:', err)
    } finally {
      setDeletingId(null)
    }
  }, [deletingId])

  // Handle pearl delete
  const handleDeletePearl = useCallback(async (pearlId: string) => {
    if (!user || deletingId) return
    setDeletingId(pearlId)
    try {
      await deletePearl(pearlId, user.id)
      setMyPearls(prev => prev.filter(p => p.id !== pearlId))
    } catch (err) {
      console.error('Failed to delete pearl:', err)
    } finally {
      setDeletingId(null)
    }
  }, [user, deletingId])

  // Handle successful share
  const handleShareSuccess = useCallback(async (pearlId: string) => {
    if (sharingInsight) {
      // Mark insight as shared
      await markInsightAsShared(sharingInsight.id, pearlId)
      // Update local state
      setInsights(prev => prev.map(i =>
        i.id === sharingInsight.id ? { ...i, sharedPearlId: pearlId } : i
      ))
    }
    setSharingInsight(null)
    setSelectedInsight(null)
    // Switch to pearls tab to show the new pearl
    setActiveTab('pearls')
    // Reload pearls and refresh profile stats
    if (user) {
      const pearls = await getMyPearls(user.id)
      setMyPearls(pearls)
      refreshProfile()
    }
  }, [sharingInsight, user, refreshProfile])

  // Swipe navigation
  const swipeHandlers = useSwipe({
    onSwipeDown: () => setView('timer'),
    onSwipeRight: () => setView('stats')
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
          className="flex items-center text-sm text-ink/40 mb-6 hover:text-ink/60 transition-colors active:scale-[0.98]"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
          Timer
        </button>

        {/* Header */}
        <p className="font-serif text-2xl text-indigo-deep mb-6">
          Insights
        </p>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-cream-dark/40 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'notes'
                ? 'bg-cream text-ink shadow-sm'
                : 'text-ink/50 hover:text-ink/70'
            }`}
          >
            Notes
            <span className="ml-1.5 text-xs text-ink/40">
              {insights.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('pearls')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'pearls'
                ? 'bg-cream text-ink shadow-sm'
                : 'text-ink/50 hover:text-ink/70'
            }`}
          >
            My Pearls
            <span className="ml-1.5 text-xs text-ink/40">
              {myPearls.length}
            </span>
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-indigo-deep/20 border-t-indigo-deep rounded-full animate-spin" />
          </div>
        )}

        {/* Notes Tab */}
        {!isLoading && activeTab === 'notes' && (
          <>
            {insights.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-serif text-lg text-ink/50 mb-2">
                  No insights yet
                </p>
                <p className="text-sm text-ink/30">
                  After meditation, capture your thoughts
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {insights.map((insight) => (
                  <button
                    key={insight.id}
                    onClick={() => setSelectedInsight(insight)}
                    className="w-full text-left bg-cream-dark/30 rounded-xl p-4 hover:bg-cream-dark/50 transition-colors active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-ink/30 mb-1">
                          {formatInsightDate(new Date(insight.createdAt))}
                        </p>
                        <p className="text-ink/80 leading-relaxed line-clamp-2">
                          {insight.formattedText || insight.rawText}
                        </p>
                      </div>
                      {insight.sharedPearlId && (
                        <span className="flex-none text-xs text-indigo-deep/60 bg-indigo-deep/10 px-2 py-0.5 rounded-full">
                          shared
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pearls Tab */}
        {!isLoading && activeTab === 'pearls' && (
          <>
            {!isAuthenticated ? (
              <div className="text-center py-16">
                <p className="font-serif text-lg text-ink/50 mb-2">
                  Sign in to view your pearls
                </p>
                <p className="text-sm text-ink/30">
                  Share wisdom with the community
                </p>
              </div>
            ) : myPearls.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-serif text-lg text-ink/50 mb-2">
                  No pearls shared yet
                </p>
                <p className="text-sm text-ink/30">
                  Tap a note to share your wisdom
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myPearls.map((pearl) => (
                  <div
                    key={pearl.id}
                    className="bg-cream-dark/30 rounded-xl p-4"
                  >
                    <p className="text-xs text-ink/30 mb-2">
                      {formatPearlDate(pearl.createdAt)}
                    </p>
                    <p className="text-ink/80 leading-relaxed mb-3">
                      {pearl.text}
                    </p>
                    {/* Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-ink/50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
                          </svg>
                          <span className="tabular-nums">{pearl.upvotes}</span>
                          <span className="text-ink/30">karma</span>
                        </span>
                        <span className="flex items-center gap-1 text-ink/50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          <span className="tabular-nums">{pearl.saves}</span>
                          <span className="text-ink/30">saves</span>
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeletePearl(pearl.id)}
                        disabled={deletingId === pearl.id}
                        className="text-xs text-ink/30 hover:text-rose-500 transition-colors"
                      >
                        {deletingId === pearl.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-6 pt-8 mt-8 border-t border-ink/5">
          <button
            onClick={() => setView('stats')}
            className="py-3 text-sm text-ink/40 hover:text-ink/60 transition-colors flex items-center active:scale-[0.98]"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Stats
          </button>
          <button
            onClick={() => setView('pearls')}
            className="py-3 text-sm text-ink/60 hover:text-ink transition-colors flex items-center active:scale-[0.98]"
          >
            Community
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => setView('settings')}
            className="py-3 text-sm text-ink/40 hover:text-ink/60 transition-colors active:scale-[0.98]"
          >
            Settings
          </button>
        </div>
      </div>

      {/* Insight Detail Modal */}
      {selectedInsight && !sharingInsight && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm"
          onClick={() => setSelectedInsight(null)}
        >
          <div
            className="bg-cream rounded-t-2xl p-6 w-full max-w-lg shadow-xl animate-slide-up max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-ink/40">
                {formatInsightDate(new Date(selectedInsight.createdAt))}
              </p>
              <button
                onClick={() => setSelectedInsight(null)}
                className="p-2 text-ink/40 hover:text-ink/60 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Full insight text */}
            <p className="text-ink/80 leading-relaxed mb-6 text-lg">
              {selectedInsight.formattedText || selectedInsight.rawText}
            </p>

            {/* Shared status */}
            {selectedInsight.sharedPearlId && (
              <div className="mb-6 p-3 bg-indigo-deep/5 rounded-lg">
                <p className="text-sm text-indigo-deep/70">
                  This insight has been shared as a pearl
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteInsight(selectedInsight.id)}
                disabled={deletingId === selectedInsight.id}
                className="flex-1 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
              >
                {deletingId === selectedInsight.id ? 'Deleting...' : 'Delete'}
              </button>
              {!selectedInsight.sharedPearlId && (
                <button
                  onClick={() => setSharingInsight(selectedInsight)}
                  className="flex-1 py-3 bg-ink text-cream rounded-xl font-medium active:scale-[0.98] transition-transform"
                >
                  Share as Pearl
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Pearl modal */}
      {sharingInsight && (
        <SharePearl
          insightId={sharingInsight.id}
          insightText={sharingInsight.formattedText || sharingInsight.rawText}
          onClose={() => setSharingInsight(null)}
          onSuccess={handleShareSuccess}
        />
      )}
    </div>
  )
}
