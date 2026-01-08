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
import { Card, CardBody, AccentBar } from './Card'

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
        {/* Voice wave visualization hint */}
        <div className="flex items-center justify-center gap-1 mb-5">
          {[0.3, 0.6, 1, 0.8, 0.5, 0.9, 0.4, 0.7, 0.5].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-ink/10 rounded-full"
              style={{ height: `${h * 24}px` }}
            />
          ))}
        </div>
        <p className="text-ink/50 text-sm mb-1">
          No insights captured yet
        </p>
        <p className="text-ink/30 text-xs">
          After meditating, speak your thoughts aloud
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
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

// Individual insight card with editing - notebook margin style
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
    <Card variant="default" className="flex">
      {/* Left accent bar */}
      <div className="py-4 pl-4">
        <AccentBar gradient="bg-gradient-to-b from-accent/60 via-accent/40 to-accent/20" />
      </div>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <span className="font-medium">{formatInsightDate(insightDate)}</span>
            <span className="text-ink/30">·</span>
            <span>{formatTime(insightDate)}</span>
            {insight.updatedAt && (
              <span className="italic text-ink/40">· edited</span>
            )}
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-2">
            {insight.hasDraft && !hasSharedPearl && (
              <span className="text-[10px] text-amber-700/80 bg-amber-500/15 px-2 py-0.5 rounded-full font-medium">
                Draft
              </span>
            )}
            {hasSharedPearl && (
              <span className="text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded-full font-medium">
                Shared
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <CardBody compact>
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full h-28 p-3 bg-deep/30 rounded-lg text-ink text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 font-serif"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-xs text-ink-soft hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3 py-1.5 text-xs bg-accent text-on-accent rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
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
              <p className="text-ink text-[15px] leading-relaxed font-serif">
                "{insight.rawText}"
              </p>
              {/* Edit hint */}
              <div className="flex items-center gap-1 mt-2 text-ink/30 group-hover:text-ink-soft transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span className="text-xs">Edit</span>
              </div>
            </button>
          )}
        </CardBody>

        {/* Footer - Distill action */}
        {!isEditing && (
          <div className="px-4 pt-2 pb-4 border-t border-ink/5 flex items-center justify-between">
            {hasSharedPearl ? (
              <span className="text-xs text-ink/40 italic">
                Wisdom shared
              </span>
            ) : (
              <>
                <span className="text-xs text-ink-soft">
                  {insight.hasDraft ? 'Pearl in progress' : 'Capture'}
                </span>
                <button
                  onClick={() => onCreatePearl?.(insight, insight.session)}
                  className="text-sm text-accent hover:text-accent-hover transition-colors font-medium"
                >
                  {insight.hasDraft ? 'Continue' : 'Distill'} →
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
