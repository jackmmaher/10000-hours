/**
 * ReportModal - Report content issues
 *
 * Modal for reporting meditation content with required explanation.
 * Content stays visible (Reddit-style) until manually reviewed.
 */

import { useState, useCallback } from 'react'

interface ReportModalProps {
  contentTitle: string
  onClose: () => void
  onSubmit: (reason: string) => Promise<void>
}

export function ReportModal({ contentTitle, onClose, onSubmit }: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = reason.trim().length >= 10 // Minimum 10 characters

  const handleSubmit = useCallback(async () => {
    if (!isValid || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit(reason.trim())
      onClose()
    } catch (err) {
      console.error('Report submission failed:', err)
      setError('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [isValid, isSubmitting, reason, onSubmit, onClose])

  // Block swipe navigation
  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm flex items-center justify-center p-6"
      onTouchStart={handleTouchEvent}
      onTouchEnd={handleTouchEvent}
      onTouchMove={handleTouchEvent}
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-ink/5">
          <div className="flex items-center justify-between">
            <p className="font-serif text-ink">Report Issue</p>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-cream-deep flex items-center justify-center text-ink/50 hover:text-ink/70 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-ink/60">
            Reporting: <span className="font-medium text-ink">{contentTitle}</span>
          </p>

          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-ink/40 mb-2">
              What's the issue? *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe the issue with this content..."
              className="w-full h-32 px-4 py-3 rounded-xl bg-cream-deep text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-moss/30 resize-none"
              maxLength={500}
              autoFocus
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-ink/30">
                {reason.trim().length < 10 && reason.length > 0
                  ? `${10 - reason.trim().length} more characters needed`
                  : ''
                }
              </p>
              <p className="text-xs text-ink/30">
                {reason.length}/500
              </p>
            </div>
          </div>

          <p className="text-xs text-ink/40 leading-relaxed">
            The content creator will be notified that their meditation is under review.
            Your report will be reviewed by our team.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-ink/5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-cream-deep text-ink/60 rounded-xl text-sm hover:bg-cream-deep/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
              isValid && !isSubmitting
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-ink/10 text-ink/30 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  )
}
