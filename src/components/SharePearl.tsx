/**
 * SharePearl - Share an insight as a pearl
 *
 * Modal for selecting text from an insight and sharing it
 * as a pearl to the community. Premium feature.
 */

import { useState, useCallback } from 'react'
import { useAuthStore } from '../stores/useAuthStore'
import { usePremiumStore } from '../stores/usePremiumStore'
import { createPearl } from '../lib/pearls'
import { AuthModal } from './AuthModal'

interface SharePearlProps {
  insightId: string
  insightText: string
  isAlreadyShared?: boolean
  onClose: () => void
  onSuccess: (pearlId: string) => void
  onDelete: () => void
}

const MAX_PEARL_LENGTH = 280

export function SharePearl({ insightText, isAlreadyShared, onClose, onSuccess, onDelete }: SharePearlProps) {
  const { user, isAuthenticated } = useAuthStore()
  const { isPremium } = usePremiumStore()
  const [text, setText] = useState('') // Start empty - user extracts the pearl
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const charCount = text.length
  const isOverLimit = charCount > MAX_PEARL_LENGTH
  const isEmpty = text.trim().length === 0

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    setIsDeleting(true)
    setShowDeleteConfirm(false)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }, [onDelete])

  const handleSubmit = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setShowAuthModal(true)
      return
    }

    if (!isPremium) {
      setError('Premium required to share pearls')
      return
    }

    if (isEmpty || isOverLimit) return

    setIsSubmitting(true)
    setError(null)

    try {
      const pearl = await createPearl(text.trim(), user.id)
      onSuccess(pearl.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share pearl')
    } finally {
      setIsSubmitting(false)
    }
  }, [isAuthenticated, user, isPremium, text, isEmpty, isOverLimit, onSuccess])

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
      <div className="flex-none flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={onClose}
          className="text-sm text-ink/40 hover:text-ink/60 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="text-sm text-rose-500 hover:text-rose-600 transition-colors"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {/* Original insight - read only */}
        <div className="mb-6">
          <p className="text-xs text-ink/40 mb-3">Your original insight:</p>
          <div className="p-4 bg-cream-dark/30 rounded-xl">
            <p className="text-ink/80 leading-relaxed">
              {insightText}
            </p>
          </div>
        </div>

        {/* Already shared notice */}
        {isAlreadyShared && (
          <div className="mb-6 p-4 bg-indigo-deep/5 rounded-xl">
            <p className="text-sm text-indigo-deep/70">
              This insight has already been shared as a pearl.
            </p>
          </div>
        )}

        {/* Pearl editor - only show if not already shared */}
        {!isAlreadyShared && (
          <>
            {/* Premium gate */}
            {!isPremium && (
              <div className="mb-6 p-4 bg-amber-50 rounded-xl">
                <p className="text-sm text-amber-800">
                  Sharing pearls is a Premium feature.
                </p>
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-ink/40">Extract your pearl to share with the community:</p>
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
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste the wisdom you want to share..."
                className={`
                  w-full h-32 p-4 bg-cream-dark/50 rounded-xl resize-none
                  text-ink placeholder:text-ink/30
                  focus:outline-none focus:ring-2 focus:ring-indigo-deep/20
                  ${isOverLimit ? 'ring-2 ring-rose-400' : ''}
                `}
                disabled={!isPremium}
              />

              {/* Character count */}
              <div className="flex justify-end mt-2">
                <span className={`text-xs tabular-nums ${isOverLimit ? 'text-rose-500' : 'text-ink/40'}`}>
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

      {/* Fixed bottom action - only show share if not already shared */}
      {!isAlreadyShared && (
        <div className="flex-none px-6 pb-8 pt-4 bg-cream border-t border-ink/5 safe-area-bottom">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isEmpty || isOverLimit || !isPremium}
            className={`
              w-full py-4 rounded-xl font-medium transition-all
              ${isSubmitting || isEmpty || isOverLimit || !isPremium
                ? 'bg-ink/20 text-ink/40'
                : 'bg-ink text-cream active:scale-[0.98]'
              }
            `}
          >
            {isSubmitting ? 'Sharing...' : 'Share as Pearl'}
          </button>
          <p className="text-xs text-ink/30 text-center mt-3">
            Pearls are shared anonymously
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

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 backdrop-blur-sm">
          <div className="bg-cream rounded-2xl p-6 mx-6 max-w-sm w-full shadow-xl">
            <p className="font-serif text-lg text-ink mb-2">Delete this insight?</p>
            <p className="text-sm text-ink/60 mb-6">
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-medium bg-cream-dark/50 text-ink/70 hover:bg-cream-dark transition-colors active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 rounded-xl text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 transition-colors active:scale-[0.98]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
