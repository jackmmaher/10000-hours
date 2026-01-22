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
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 backdrop-blur-sm"
      onTouchStart={handleTouchEvent}
      onTouchEnd={handleTouchEvent}
      onTouchMove={handleTouchEvent}
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-t-3xl w-full max-w-lg max-h-[calc(90vh-env(safe-area-inset-top,0px))] flex flex-col shadow-xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-ink/20" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b border-ink/5">
          <p className="font-serif text-ink">Report Issue</p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
          <p className="text-sm text-ink/60">
            Reporting: <span className="font-medium text-ink">{contentTitle}</span>
          </p>

          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <div>
            <label className="block text-xs text-ink/40 mb-2">What's the issue? *</label>
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
                  : ''}
              </p>
              <p className="text-xs text-ink/30">{reason.length}/500</p>
            </div>
          </div>

          <p className="text-xs text-ink/40 leading-relaxed">
            The content creator will be notified that their meditation is under review. Your report
            will be reviewed by our team.
          </p>
        </div>

        {/* Footer with safe-area-bottom - pb-4 since safe-area adds its own padding */}
        <div className="px-6 pb-4 pt-4 border-t border-ink/5 flex gap-3 safe-area-bottom">
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
