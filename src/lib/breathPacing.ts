/**
 * Breath Pacing Patterns
 *
 * Optional guided breathing for endorphin activation.
 * Each pattern has phases with durations in seconds.
 *
 * Patterns are well-researched:
 * - Simple: Basic breath awareness for beginners
 * - Box: Used by Navy SEALs for calm focus
 * - 4-7-8: Dr. Andrew Weil's relaxation technique
 */

export type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'holdEmpty'

export interface BreathPattern {
  id: string
  name: string
  description: string
  phases: Array<{ phase: BreathPhase; duration: number }>
  totalCycleDuration: number  // Sum of all phases
}

export const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: 'simple',
    name: 'Simple',
    description: '4 seconds in, 4 seconds out',
    phases: [
      { phase: 'inhale', duration: 4 },
      { phase: 'exhale', duration: 4 }
    ],
    totalCycleDuration: 8
  },
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Equal phases: inhale, hold, exhale, hold',
    phases: [
      { phase: 'inhale', duration: 4 },
      { phase: 'hold', duration: 4 },
      { phase: 'exhale', duration: 4 },
      { phase: 'holdEmpty', duration: 4 }
    ],
    totalCycleDuration: 16
  },
  {
    id: '478',
    name: '4-7-8 Relaxation',
    description: 'Deep relaxation pattern',
    phases: [
      { phase: 'inhale', duration: 4 },
      { phase: 'hold', duration: 7 },
      { phase: 'exhale', duration: 8 }
    ],
    totalCycleDuration: 19
  }
]

/**
 * Get a breath pattern by ID
 */
export function getBreathPattern(id: string): BreathPattern | undefined {
  return BREATH_PATTERNS.find(p => p.id === id)
}

/**
 * Get all available breath patterns
 */
export function getAllBreathPatterns(): BreathPattern[] {
  return BREATH_PATTERNS
}
