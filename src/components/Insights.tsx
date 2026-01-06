/**
 * Insights - Browse saved meditation insights
 *
 * Displays a chronological list of insights captured after sessions.
 * Design: Minimal, scrollable list with timestamps.
 */

import { useEffect, useState } from 'react'
import { useSessionStore } from '../stores/useSessionStore'
import { useSwipe } from '../hooks/useSwipe'
import { getInsights, deleteInsight, Insight } from '../lib/db'

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

export function Insights() {
  const { setView } = useSessionStore()
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Load insights on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await getInsights()
        // Sort by most recent first
        setInsights(data.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ))
      } catch (err) {
        console.error('Failed to load insights:', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Handle delete
  const handleDelete = async (id: string) => {
    if (deletingId) return
    setDeletingId(id)
    try {
      await deleteInsight(id)
      setInsights(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      console.error('Failed to delete insight:', err)
    } finally {
      setDeletingId(null)
    }
  }

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
            Insights
          </p>
          <p className="text-sm text-ink/40 mt-1">
            {insights.length} captured thought{insights.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-1 h-1 bg-indigo-deep/30 rounded-full animate-pulse" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && insights.length === 0 && (
          <div className="text-center py-16">
            <p className="font-serif text-lg text-ink/50 mb-2">
              No insights yet
            </p>
            <p className="text-sm text-ink/30">
              After meditation, you can capture your thoughts
            </p>
          </div>
        )}

        {/* Insights list */}
        {!isLoading && insights.length > 0 && (
          <div className="space-y-6">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="group relative bg-cream-dark/30 rounded-xl p-4"
              >
                {/* Timestamp */}
                <p className="text-xs text-ink/30 mb-2">
                  {formatInsightDate(new Date(insight.createdAt))}
                </p>

                {/* Content */}
                <p className="text-ink/80 leading-relaxed">
                  {insight.formattedText || insight.rawText}
                </p>

                {/* Delete button - appears on hover */}
                <button
                  onClick={() => handleDelete(insight.id)}
                  disabled={deletingId === insight.id}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-2 text-ink/30 hover:text-ink/60 transition-all"
                  aria-label="Delete insight"
                >
                  {deletingId === insight.id ? (
                    <div className="w-4 h-4 border border-ink/30 border-t-ink rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-8 pt-8 mt-8 border-t border-ink/5">
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
