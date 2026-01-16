/**
 * AuthModal - Sign-in modal with Apple and Google options
 *
 * Simple, minimal design matching the app's aesthetic.
 * Shows when user needs to authenticate for community features.
 */

import { useAuthStore } from '../stores/useAuthStore'
import { isSupabaseConfigured } from '../lib/supabase'
import { Button } from './Button'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
}

export function AuthModal({
  isOpen,
  onClose,
  title = 'Sign in to continue',
  subtitle = 'Join the community to share and save wisdom',
}: AuthModalProps) {
  const { signInWithGoogle, signInWithApple, isLoading, error, clearError } = useAuthStore()

  if (!isOpen) return null

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm">
        <div className="bg-cream rounded-t-3xl w-full max-w-lg max-h-[calc(90vh-env(safe-area-inset-top,0px))] flex flex-col shadow-xl animate-slide-up">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-ink/20" />
          </div>
          {/* Content */}
          <div className="px-6 pb-8 safe-area-bottom">
            <p className="font-serif text-xl text-ink mb-2">{title}</p>
            <p className="text-sm text-ink/50 mb-6">Sign-in is not available yet. Coming soon!</p>
            <Button variant="ghost" fullWidth onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleGoogleSignIn = async () => {
    clearError()
    await signInWithGoogle()
  }

  const handleAppleSignIn = async () => {
    clearError()
    await signInWithApple()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm"
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

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6">
          {/* Header */}
          <p className="font-serif text-xl text-ink mb-2">{title}</p>
          <p className="text-sm text-ink/50 mb-8">{subtitle}</p>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-rose-50 rounded-lg">
              <p className="text-sm text-rose-600">{error}</p>
            </div>
          )}

          {/* Sign-in buttons */}
          <div className="space-y-3">
            {/* Apple Sign-in */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              onClick={handleAppleSignIn}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              {isLoading ? 'Signing in...' : 'Continue with Apple'}
            </Button>

            {/* Google Sign-in */}
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              loading={isLoading}
              onClick={handleGoogleSignIn}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </Button>
          </div>

          {/* Privacy note */}
          <p className="text-xs text-ink/30 text-center mt-6">
            Your meditation data stays on your device.
            <br />
            Sign-in is only for community features.
          </p>
        </div>

        {/* Footer with safe-area-bottom */}
        <div className="px-6 pb-8 pt-4 safe-area-bottom">
          <Button variant="ghost" fullWidth onClick={onClose}>
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  )
}
