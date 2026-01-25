/**
 * SharePearl - Create pearls from insights
 *
 * Modal for extracting wisdom from an insight and either:
 * - Saving as a draft (local, private, can resume later)
 * - Posting as a pearl (public, shared with community)
 *
 * Requires sign-in to post.
 */

import { useState, useCallback, useEffect } from 'react'
import { useAuthStore } from '../stores/useAuthStore'
import { createPearl } from '../lib/pearls'
import { getPearlDraft, savePearlDraft, deletePearlDraft } from '../lib/db'
import { AuthModal } from './AuthModal'

interface SharePearlProps {
  insightId: string
  insightText: string
  isAlreadyShared?: boolean
  onClose: () => void
  onSuccess: (pearlId: string) => void
}

const MAX_PEARL_LENGTH = 280

export function SharePearl({
  insightId,
  insightText,
  isAlreadyShared,
  onClose,
  onSuccess,
}: SharePearlProps) {
  const { user, isAuthenticated } = useAuthStore()
  const [text, setText] = useState('') // Start empty - user extracts the pearl
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)

  // Load existing draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getPearlDraft(insightId)
      if (draft) {
        setText(draft.text)
        setHasDraft(true)
      }
    }
    loadDraft()
  }, [insightId])

  const charCount = text.length
  const isOverLimit = charCount > MAX_PEARL_LENGTH
  const isEmpty = text.trim().length === 0

  // Save draft locally
  const handleSaveDraft = useCallback(async () => {
    if (isEmpty || isOverLimit) return

    setIsSavingDraft(true)
    setError(null)

    try {
      await savePearlDraft(insightId, text.trim())
      setHasDraft(true)
      setDraftSaved(true)
      // Brief visual feedback then close
      setTimeout(() => {
        onClose()
      }, 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft')
    } finally {
      setIsSavingDraft(false)
    }
  }, [insightId, text, isEmpty, isOverLimit, onClose])

  // Post pearl to community
  const handleSubmit = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setShowAuthModal(true)
      return
    }

    if (isEmpty || isOverLimit) return

    setIsSubmitting(true)
    setError(null)

    try {
      const pearl = await createPearl(text.trim(), user.id)
      // Delete draft after successful post
      await deletePearlDraft(insightId)
      onSuccess(pearl.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post pearl')
    } finally {
      setIsSubmitting(false)
    }
  }, [isAuthenticated, user, text, isEmpty, isOverLimit, insightId, onSuccess])

  // Block swipe navigation when modal is open
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-cream"
      onTouchStart={handleTouchEvent}
      onTouchEnd={handleTouchEvent}
      onTouchMove={handleTouchEvent}
    >
      {/* Header */}
      <div
        className="flex-none flex items-center justify-between px-6 pb-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
      >
        <button
          onClick={onClose}
          className="text-sm text-ink/40 hover:text-ink/60 transition-colors"
        >
          Back
        </button>
        <h1 className="text-sm font-medium text-ink">Create Pearl</h1>
        <div className="w-8" /> {/* Spacer for alignment */}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-32">
        {/* Original insight - read only */}
        <div className="mb-6">
          <p className="text-xs text-ink/40 mb-3">Your original insight:</p>
          <div className="p-4 bg-cream-dark/30 rounded-xl">
            <p className="text-ink/80 leading-relaxed">{insightText}</p>
          </div>
        </div>

        {/* Already shared notice */}
        {isAlreadyShared && (
          <div className="mb-6 p-4 bg-indigo-deep/5 rounded-xl">
            <p className="text-sm text-indigo-deep/70">
              You've already created a pearl from this insight. View it in Explore.
            </p>
          </div>
        )}

        {/* Pearl editor - only show if not already shared */}
        {!isAlreadyShared && (
          <>
            {/* Draft indicator */}
            {hasDraft && !draftSaved && (
              <div className="mb-4 p-3 bg-amber-50 rounded-xl flex items-center gap-2">
                <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Draft
                </span>
                <p className="text-sm text-amber-800">Continuing from your saved draft</p>
              </div>
            )}

            {/* Draft saved feedback */}
            {draftSaved && (
              <div className="mb-4 p-3 bg-moss/10 rounded-xl flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-moss"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-sm text-moss">Draft saved</p>
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-ink/40">Write your pearl (shared in Explore):</p>
                {text && (
                  <button
                    onClick={() => setText('')}
                    className="text-xs text-ink/30 hover:text-ink/50 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  setDraftSaved(false) // Reset saved indicator on edit
                }}
                placeholder="Condense your insight into a pearl to share with others..."
                className={`
                  w-full h-32 p-4 bg-cream-dark/50 rounded-xl resize-none
                  text-ink placeholder:text-ink/30
                  focus:outline-none focus:ring-2 focus:ring-indigo-deep/20
                  ${isOverLimit ? 'ring-2 ring-rose-400' : ''}
                `}
              />

              {/* Character count */}
              <div className="flex justify-end mt-2">
                <span
                  className={`text-xs tabular-nums ${isOverLimit ? 'text-rose-500' : 'text-ink/40'}`}
                >
                  {charCount}/{MAX_PEARL_LENGTH}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 rounded-lg">
            <p className="text-sm text-rose-600">{error}</p>
          </div>
        )}
      </div>

      {/* Fixed bottom action - only show if not already shared */}
      {!isAlreadyShared && (
        <div className="flex-none px-6 pb-4 pt-4 bg-cream border-t border-ink/5 safe-area-bottom">
          {/* Two-button layout: Save Draft + Post Pearl */}
          <div className="flex gap-3 mb-3">
            {/* Save Draft - always available */}
            <button
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isEmpty || isOverLimit || draftSaved}
              className={`
                flex-1 py-3.5 rounded-xl font-medium transition-all
                ${
                  isSavingDraft || isEmpty || isOverLimit || draftSaved
                    ? 'bg-cream-dark/50 text-ink/30'
                    : 'bg-cream-dark text-ink/70 hover:bg-cream-dark/80 active:scale-[0.98]'
                }
              `}
            >
              {isSavingDraft ? 'Saving...' : draftSaved ? 'Saved' : 'Save Draft'}
            </button>

            {/* Post Pearl - requires sign-in */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isEmpty || isOverLimit}
              className={`
                flex-1 py-3.5 rounded-xl font-medium transition-all
                ${
                  isSubmitting || isEmpty || isOverLimit
                    ? 'bg-ink/20 text-ink/40'
                    : 'bg-ink text-cream active:scale-[0.98]'
                }
              `}
            >
              {isSubmitting ? 'Posting...' : 'Post Pearl'}
            </button>
          </div>

          <p className="text-xs text-ink/30 text-center">
            Drafts are private. Posted pearls appear in Explore anonymously.
          </p>
        </div>
      )}

      {/* Auth modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign in to share"
        subtitle="Create an account to share pearls"
      />
    </div>
  )
}
