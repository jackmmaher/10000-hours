/**
 * PWAInstallPrompt - Install banner for iOS Safari
 *
 * iOS Safari doesn't support the beforeinstallprompt event,
 * so we show a custom banner explaining how to add to home screen.
 * Only shows on iOS Safari when not already installed as PWA.
 */

import { useState, useEffect } from 'react'

// Detect iOS Safari
function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false

  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua)

  return isIOS && isSafari
}

// Check if running as installed PWA
function isStandalone(): boolean {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  )
}

const DISMISS_KEY = 'pwa-install-dismissed'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export function PWAInstallPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only show on iOS Safari when not installed
    if (!isIOSSafari() || isStandalone()) {
      return
    }

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10)
      if (elapsed < DISMISS_DURATION) {
        return
      }
    }

    // Delay showing to not interrupt initial experience
    const timer = setTimeout(() => setShow(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div
        className="rounded-2xl p-4 shadow-lg border"
        style={{
          background: 'var(--card-bg)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="flex items-start gap-3">
          {/* App icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--bg-deep)' }}
          >
            <svg className="w-7 h-7" viewBox="0 0 512 512" fill="none">
              <circle
                cx="256"
                cy="256"
                r="180"
                stroke="currentColor"
                strokeWidth="24"
                style={{ color: 'var(--text-primary)' }}
              />
              <circle
                cx="256"
                cy="76"
                r="18"
                fill="currentColor"
                style={{ color: 'var(--text-primary)' }}
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-ink text-sm">
              Add to Home Screen
            </p>
            <p className="text-xs text-ink/60 mt-0.5">
              Tap{' '}
              <span className="inline-flex items-center align-middle">
                <svg className="w-4 h-4 mx-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </span>
              {' '}then "Add to Home Screen"
            </p>
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="p-1.5 -mr-1 text-ink/40 hover:text-ink/60 transition-colors"
            aria-label="Dismiss install prompt"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
