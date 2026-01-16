/**
 * Journey Lazy-Loading Wrappers
 *
 * Wrapper components for lazy-loading heavy modals.
 */

import { useState, useEffect } from 'react'
import type { Session } from '../../lib/db'
import { useNavigationStore } from '../../stores/useNavigationStore'

// Loading spinner placeholder
function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50">
      <div className="w-1 h-1 bg-cream rounded-full animate-pulse" />
    </div>
  )
}

// Template prefill type for planning from saved meditations
interface PrefillTemplate {
  title?: string
  duration?: number
  discipline?: string
  id?: string
}

// Wrapper for lazy loading MeditationPlanner
export function MeditationPlannerWrapper({
  date,
  sessions,
  onClose,
  onSave,
  prefillTemplate,
}: {
  date: Date
  sessions: Session[]
  onClose: () => void
  onSave: () => Promise<void> | void
  prefillTemplate?: PrefillTemplate | null
}) {
  const [MeditationPlanner, setMeditationPlanner] = useState<React.ComponentType<{
    date: Date
    sessions: Session[]
    onClose: () => void
    onSave: () => Promise<void> | void
    prefillTemplate?: PrefillTemplate | null
  }> | null>(null)

  useEffect(() => {
    import('../MeditationPlanner').then((module) => {
      setMeditationPlanner(() => module.MeditationPlanner)
    })
  }, [])

  if (!MeditationPlanner) {
    return <LoadingOverlay />
  }

  return (
    <MeditationPlanner
      date={date}
      sessions={sessions}
      onClose={onClose}
      onSave={onSave}
      prefillTemplate={prefillTemplate}
    />
  )
}

// Wrapper for lazy loading InsightCapture
export function InsightCaptureWrapper({
  sessionId,
  onComplete,
  onSkip,
}: {
  sessionId: string
  onComplete: () => void
  onSkip: () => void
}) {
  const [InsightCapture, setInsightCapture] = useState<React.ComponentType<{
    sessionId?: string
    onComplete: () => void
    onSkip: () => void
  }> | null>(null)

  useEffect(() => {
    import('../InsightCapture').then((module) => {
      setInsightCapture(() => module.InsightCapture)
    })
  }, [])

  // Block swipe navigation when modal is open
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  if (!InsightCapture) {
    return <LoadingOverlay />
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-end justify-center"
      onTouchStart={handleTouchEvent}
      onTouchEnd={handleTouchEvent}
      onTouchMove={handleTouchEvent}
    >
      <div className="bg-cream rounded-t-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl animate-slide-up">
        <InsightCapture sessionId={sessionId} onComplete={onComplete} onSkip={onSkip} />
      </div>
    </div>
  )
}

// Wrapper for lazy loading SharePearl
export function SharePearlWrapper({
  insightId,
  insightText,
  onComplete,
  onCancel,
}: {
  insightId: string
  insightText: string
  onComplete: () => void
  onCancel: () => void
}) {
  const [SharePearl, setSharePearl] = useState<React.ComponentType<{
    insightId: string
    insightText: string
    isAlreadyShared?: boolean
    onClose: () => void
    onSuccess: (pearlId: string) => void
    onDelete: () => void
  }> | null>(null)

  useEffect(() => {
    import('../SharePearl').then((module) => {
      setSharePearl(() => module.SharePearl)
    })
  }, [])

  if (!SharePearl) {
    return <LoadingOverlay />
  }

  return (
    <SharePearl
      insightId={insightId}
      insightText={insightText}
      onClose={onCancel}
      onSuccess={async (pearlId) => {
        try {
          const { markInsightAsShared } = await import('../../lib/db')
          await markInsightAsShared(insightId, pearlId)
        } catch (err) {
          console.error('Failed to mark insight as shared:', err)
        }
        useNavigationStore.getState().incrementSavedContentVersion()
        onComplete()
      }}
      onDelete={async () => {
        try {
          const { deleteInsight } = await import('../../lib/db')
          await deleteInsight(insightId)
        } catch (err) {
          console.error('Failed to delete insight:', err)
        }
        onComplete()
      }}
    />
  )
}

// Wrapper for lazy loading TemplateEditor
export function TemplateEditorWrapper({
  onClose,
  onPublished,
  creatorHours,
}: {
  onClose: () => void
  onPublished: () => void
  creatorHours: number
}) {
  const [TemplateEditor, setTemplateEditor] = useState<React.ComponentType<{
    onClose: () => void
    onPublished: () => void
    creatorHours: number
  }> | null>(null)

  useEffect(() => {
    import('../TemplateEditor').then((module) => {
      setTemplateEditor(() => module.TemplateEditor)
    })
  }, [])

  if (!TemplateEditor) {
    return <LoadingOverlay />
  }

  return <TemplateEditor onClose={onClose} onPublished={onPublished} creatorHours={creatorHours} />
}
