/**
 * Toast - Non-intrusive notification component
 *
 * Displays error/warning/info messages to users.
 * Positioned at bottom of screen, above navigation.
 */

import { useErrorStore } from '../stores/useErrorStore'
import type { AppError } from '../lib/errors'

// Severity-based styling
const severityStyles: Record<AppError['severity'], string> = {
  error: 'bg-[#D4524D] text-white', // Warm red, readable
  warning: 'bg-bark text-cream',
  info: 'bg-ink/90 text-cream',
}

function ToastItem({ error, onDismiss }: { error: AppError; onDismiss: () => void }) {
  return (
    <div
      className={`
        ${severityStyles[error.severity]}
        rounded-xl px-4 py-3 shadow-lg
        flex items-center gap-3
        animate-fade-in
        max-w-sm w-full
      `}
      role="alert"
    >
      {/* Message */}
      <p className="text-sm flex-1">{error.message}</p>

      {/* Action button (if provided) */}
      {error.action && (
        <button
          onClick={() => {
            error.action?.handler()
            onDismiss()
          }}
          className="text-sm font-medium underline underline-offset-2 opacity-90 hover:opacity-100 transition-opacity"
        >
          {error.action.label}
        </button>
      )}

      {/* Dismiss button (only for errors that don't auto-dismiss) */}
      {!error.autoDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 -mr-1 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

/**
 * ToastContainer - Renders all active toasts
 *
 * Place this once at the app root level (in App.tsx).
 */
export function ToastContainer() {
  const { errors, dismissError } = useErrorStore()

  if (errors.length === 0) return null

  return (
    <div
      className="fixed bottom-20 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none"
      aria-live="polite"
    >
      {errors.map((error) => (
        <div key={error.id} className="pointer-events-auto">
          <ToastItem error={error} onDismiss={() => dismissError(error.id)} />
        </div>
      ))}
    </div>
  )
}
