/**
 * useTapFeedback - Haptic Feedback Vocabulary
 *
 * Provides tactile feedback at key moments throughout the app.
 * Uses navigator.vibrate where available (Android, some PWAs).
 * Gracefully degrades (no-op) on iOS and unsupported platforms.
 *
 * STANDARD PATTERNS (use throughout app):
 * - light: Acknowledgment (tab change, toggle, minor action)
 * - medium: Intentional feedback (session start, significant interaction)
 * - success: Celebration (session complete, milestone, achievement)
 * - error: Failure notification (action blocked, validation failed)
 * - warning: Attention needed (destructive action confirmation)
 * - heavy: Significant action completed (delete, publish to community)
 *
 * CONTEXTUAL PATTERNS (meditation-specific):
 * - breatheIn: Optional breath sync - inhale cue (rising energy)
 * - breatheOut: Optional breath sync - exhale cue (settling energy)
 * - settle: Post-session settling, energy dissipating
 */

import { useCallback } from 'react'

type FeedbackIntensity =
  | 'light' | 'medium' | 'success'  // existing standard
  | 'error' | 'warning' | 'heavy'   // new standard
  | 'breatheIn' | 'breatheOut' | 'settle'  // contextual (meditation)

const VIBRATION_PATTERNS: Record<FeedbackIntensity, number[]> = {
  // Existing patterns (unchanged for backwards compatibility)
  light: [10],           // Quick tap - minimal acknowledgment
  medium: [25],          // Noticeable tap - intentional action
  success: [15, 50, 15], // Celebratory - gap creates anticipation

  // New standard patterns
  error: [50, 100, 50],      // Sharp double-pulse - uncomfortable = memorable
  warning: [30, 30],         // Quick double-tap - attention without alarm
  heavy: [80],               // Single strong pulse - weight of action

  // Contextual patterns (meditation-specific)
  breatheIn: [20, 80],           // Rising pattern - energy building (inhale)
  breatheOut: [80, 40, 20, 10],  // Settling cascade - energy dissipating (exhale)
  settle: [50, 20, 10]           // Quick fade - zen transition
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
    // Standard patterns
    light: () => trigger('light'),
    medium: () => trigger('medium'),
    success: () => trigger('success'),
    error: () => trigger('error'),
    warning: () => trigger('warning'),
    heavy: () => trigger('heavy'),

    // Contextual patterns (meditation)
    breatheIn: () => trigger('breatheIn'),
    breatheOut: () => trigger('breatheOut'),
    settle: () => trigger('settle'),

    // Generic trigger for dynamic usage
    trigger
  }
}
