/**
 * Error Types and Utilities
 *
 * Standardized error handling for user-facing feedback.
 */

// Error severity determines toast styling and auto-dismiss behavior
export type ErrorSeverity = 'error' | 'warning' | 'info'

// Structured error for user feedback
export interface AppError {
  id: string
  message: string
  severity: ErrorSeverity
  // Optional action the user can take
  action?: {
    label: string
    handler: () => void
  }
  // Auto-dismiss after ms (null = manual dismiss only)
  autoDismiss?: number | null
}

// Default auto-dismiss times by severity
export const AUTO_DISMISS_MS: Record<ErrorSeverity, number | null> = {
  error: null, // Errors require manual dismissal
  warning: 5000,
  info: 3000,
}

// User-friendly error messages for common scenarios
export const ERROR_MESSAGES = {
  // Network/connectivity
  NETWORK_ERROR: 'Connection lost. Please check your internet.',
  TIMEOUT: 'Request timed out. Please try again.',

  // Auth
  AUTH_REQUIRED: 'Please sign in to continue.',
  AUTH_FAILED: 'Sign in failed. Please try again.',

  // Data operations
  SAVE_FAILED: "Couldn't save. Please try again.",
  LOAD_FAILED: "Couldn't load data. Please try again.",
  DELETE_FAILED: "Couldn't delete. Please try again.",

  // Specific features
  INSIGHT_SAVE_FAILED: "Couldn't save your insight. Please try again.",
  VOTE_FAILED: 'Vote failed. Please try again.',
  TEMPLATE_PUBLISH_FAILED: "Couldn't publish. Please try again.",

  // Generic fallback
  UNKNOWN: 'Something went wrong. Please try again.',
} as const

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES

/**
 * Create an AppError from a known error type
 */
export function createError(
  key: ErrorMessageKey,
  options?: Partial<Pick<AppError, 'severity' | 'action' | 'autoDismiss'>>
): AppError {
  const severity = options?.severity ?? 'error'
  return {
    id: crypto.randomUUID(),
    message: ERROR_MESSAGES[key],
    severity,
    action: options?.action,
    autoDismiss: options?.autoDismiss ?? AUTO_DISMISS_MS[severity],
  }
}

/**
 * Create an AppError from an unknown error (catch blocks)
 */
export function createErrorFromUnknown(
  error: unknown,
  fallbackKey: ErrorMessageKey = 'UNKNOWN'
): AppError {
  // Check for network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return createError('NETWORK_ERROR')
  }

  // Check for timeout errors
  if (error instanceof Error && error.message.includes('timeout')) {
    return createError('TIMEOUT')
  }

  // Use fallback
  return createError(fallbackKey)
}
