/**
 * Error Store - Global error/toast state management
 *
 * Provides a simple API for showing user-facing error notifications.
 */

import { create } from 'zustand'
import type { AppError, ErrorMessageKey } from '../lib/errors'
import { createError, createErrorFromUnknown } from '../lib/errors'

interface ErrorState {
  // Current errors/toasts to display (newest first)
  errors: AppError[]

  // Actions
  showError: (
    key: ErrorMessageKey,
    options?: Partial<Pick<AppError, 'severity' | 'action' | 'autoDismiss'>>
  ) => void
  showErrorFromUnknown: (error: unknown, fallbackKey?: ErrorMessageKey) => void
  showCustomError: (error: AppError) => void
  dismissError: (id: string) => void
  clearAllErrors: () => void
}

export const useErrorStore = create<ErrorState>((set, get) => ({
  errors: [],

  showError: (key, options) => {
    const error = createError(key, options)
    set((state) => ({
      errors: [error, ...state.errors],
    }))

    // Auto-dismiss if configured
    if (error.autoDismiss) {
      setTimeout(() => {
        get().dismissError(error.id)
      }, error.autoDismiss)
    }
  },

  showErrorFromUnknown: (error, fallbackKey = 'UNKNOWN') => {
    const appError = createErrorFromUnknown(error, fallbackKey)
    set((state) => ({
      errors: [appError, ...state.errors],
    }))

    if (appError.autoDismiss) {
      setTimeout(() => {
        get().dismissError(appError.id)
      }, appError.autoDismiss)
    }
  },

  showCustomError: (error) => {
    set((state) => ({
      errors: [error, ...state.errors],
    }))

    if (error.autoDismiss) {
      setTimeout(() => {
        get().dismissError(error.id)
      }, error.autoDismiss)
    }
  },

  dismissError: (id) => {
    set((state) => ({
      errors: state.errors.filter((e) => e.id !== id),
    }))
  },

  clearAllErrors: () => {
    set({ errors: [] })
  },
}))

// Convenience hook for common operations
export function useToast() {
  const { showError, showErrorFromUnknown, dismissError } = useErrorStore()

  return {
    error: (key: ErrorMessageKey) => showError(key, { severity: 'error' }),
    warning: (key: ErrorMessageKey) => showError(key, { severity: 'warning' }),
    info: (key: ErrorMessageKey) => showError(key, { severity: 'info' }),
    fromCatch: showErrorFromUnknown,
    dismiss: dismissError,
  }
}
