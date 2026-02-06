/**
 * Voice utility functions - shared helpers for Voice score display
 *
 * These functions are extracted from multiple components to eliminate
 * duplication and ensure consistent behavior across the app.
 */

import type { VoiceLevel } from './voice'

/**
 * Calculate a fallback Voice score from karma and saves when the
 * creator's real Voice score (from Supabase profiles) is unavailable.
 *
 * Uses sqrt scaling with caps to approximate engagement credibility.
 * Karma contributes up to 30 points; saves contribute up to 30 points.
 *
 * @param karma - Total upvotes (karma) received by the user
 * @param saves - Total saves received by the user
 * @returns An estimated Voice score (0-60 range)
 */
export function calculateFallbackVoice(karma: number, saves: number): number {
  const karmaScore = Math.min(Math.sqrt(karma) * 3, 30)
  const savesScore = Math.min(Math.sqrt(saves) * 4, 30)
  return Math.round(karmaScore + savesScore)
}

/**
 * Get a CSS color value appropriate for displaying text alongside a
 * Voice badge at the given level. Uses theme CSS variables with
 * fallback hex values.
 *
 * - high / established: primary text color (strong contrast)
 * - growing / new: secondary text color (subdued)
 *
 * @param level - The Voice level derived from the score
 * @returns A CSS color string (var() with fallback)
 */
export function getVoiceTextStyle(level: VoiceLevel): string {
  switch (level) {
    case 'high':
    case 'established':
      return 'var(--text-primary, #1a1a1a)'
    case 'growing':
    case 'new':
    default:
      return 'var(--text-secondary, #6B7280)'
  }
}
