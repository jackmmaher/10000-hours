/**
 * InsightStream - Stream of past insights with editing and pearl creation
 *
 * Shows only sessions that have captured insights.
 * Insights are editable. Pearl drafts can be created and saved.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Insight,
  Session,
  getInsightsWithContent,
  getSessionByUuid,
  updateInsight,
  getPearlDraft
} from '../lib/db'

interface InsightStreamProps {
  /** Called when user wants to create/edit a pearl from an insight */
  onCreatePearl?: (insight: Insight, session: Session | null) => void
  /** Key to trigger refresh */
  refreshKey?: number
}

interface InsightWithSession extends Insight {
  session: Session | null
  hasDraft: boolean
}

function formatInsightDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))

  if (days === 0) {
    return 'Today'
  } else if (days === 1) {
    return 'Yesterday'
  } else if (days < 7) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return dayNames[date.getDay()]
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
    })
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export function InsightStream({ onCreatePearl, refreshKey }: InsightStreamProps) {
  const [insights, setInsights] = useState<InsightWithSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load insights with their sessions
  useEffect(() => {
    const loadInsights = async () => {
      setIsLoading(true)
      try {
        const rawInsights = await getInsightsWithContent()

        // Load sessions and draft status for each insight
        const withDetails = await Promise.all(
          rawInsights.map(async (insight) => {
            const session = insight.sessionId
              ? await getSessionByUuid(insight.sessionId)
              : null
            const draft = await getPearlDraft(insight.id)
            return {
              ...insight,
              session: session || null,
              hasDraft: !!draft
            }
          })
        )

        setInsights(withDetails)
      } catch (err) {
        console.error('Failed to load insights:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadInsights()
  }, [refreshKey])

  // Handle insight text update
  const handleUpdateInsight = useCallback(async (insightId: string, newText: string) => {
    await updateInsight(insightId, { rawText: newText })
    // Update local state
    setInsights(prev =>
      prev.map(i =>
        i.id === insightId
          ? { ...i, rawText: newText, updatedAt: new Date() }
          : i
      )
    )
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-ink/10 border-t-ink/40 rounded-full animate-spin" />
      </div>
    )
  }

  if (insights.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cream-deep flex items-center justify-center">
          <svg className="w-6 h-6 text-ink/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p className="text-ink/50 text-sm">
          No insights captured yet.
        </p>
        <p className="text-ink/30 text-xs mt-2">
          After meditating, capture your thoughts with voice notes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <InsightCard
          key={insight.id}
          insight={insight}
          onUpdate={handleUpdateInsight}
          onCreatePearl={onCreatePearl}
        />
      ))}
    </div>
  )
}

// Individual insight card with editing
function InsightCard({
  insight,
  onUpdate,
  onCreatePearl
}: {
  insight: InsightWithSession
  onUpdate: (id: string, text: string) => Promise<void>
  onCreatePearl?: (insight: Insight, session: Session | null) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(insight.rawText)
  const [isSaving, setIsSaving] = useState(false)

  const hasSharedPearl = !!insight.sharedPearlId
  const insightDate = new Date(insight.createdAt)

  const handleSave = async () => {
    if (editText.trim() === insight.rawText) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await onUpdate(insight.id, editText.trim())
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditText(insight.rawText)
    setIsEditing(false)
  }

  return (
    <div className="bg-cream-deep rounded-xl p-4">
      {/* Header: date and time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-ink/40">
          <span>{formatInsightDate(insightDate)}</span>
          <span>·</span>
          <span>{formatTime(insightDate)}</span>
          {insight.updatedAt && (
            <>
              <span>·</span>
              <span className="italic">edited</span>
            </>
          )}
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-2">
          {insight.hasDraft && !hasSharedPearl && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Draft
            </span>
          )}
          {hasSharedPearl && (
            <span className="text-xs text-moss bg-moss/10 px-2 py-0.5 rounded-full">
              Pearl shared
            </span>
          )}
        </div>
      </div>

      {/* Insight text - editable or display */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full h-32 p-3 bg-cream rounded-lg text-ink text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-deep/20"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs text-ink/50 hover:text-ink/70 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1.5 text-xs bg-ink text-cream rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full text-left group"
        >
          <p className="text-ink/80 text-sm leading-relaxed">
            "{insight.rawText}"
          </p>
          <p className="text-xs text-ink/30 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Tap to edit
          </p>
        </button>
      )}

      {/* Actions - only show when not editing */}
      {!isEditing && (
        <div className="mt-4 pt-3 border-t border-ink/5 flex justify-end">
          {hasSharedPearl ? (
            <span className="text-xs text-ink/30">
              Pearl already shared
            </span>
          ) : (
            <button
              onClick={() => onCreatePearl?.(insight, insight.session)}
              className="text-sm text-moss hover:text-moss/80 transition-colors font-medium"
            >
              {insight.hasDraft ? 'Continue Pearl →' : 'Create Pearl →'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
