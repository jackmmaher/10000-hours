/**
 * useTapFeedback - Haptic/visual feedback for touch interactions
 *
 * Provides subtle tactile feedback at key moments:
 * - Session start
 * - Session end
 * - Milestone reached
 *
 * Uses navigator.vibrate where available (iOS doesn't support,
 * but Android and some PWAs do)
 */

import { useCallback } from 'react'

type FeedbackIntensity = 'light' | 'medium' | 'success'

const VIBRATION_PATTERNS: Record<FeedbackIntensity, number[]> = {
  light: [10],           // Quick tap
  medium: [25],          // Noticeable tap
  success: [15, 50, 15]  // Celebratory pattern
}

export function useTapFeedback() {
  const trigger = useCallback((intensity: FeedbackIntensity = 'light') => {
    // Haptic feedback (where supported)
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(VIBRATION_PATTERNS[intensity])
      } catch {
        // Silently fail - vibration not critical
      }
    }
  }, [])

  return {
    light: () => trigger('light'),
    medium: () => trigger('medium'),
    success: () => trigger('success'),
    trigger
  }
}
