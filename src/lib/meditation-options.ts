/**
 * Shared meditation options constants
 *
 * Single source of truth for disciplines, poses, durations, and times.
 * Used by MeditationPlanner, TemplateEditor, and data mapping.
 */

// Meditation disciplines/techniques - Title Case to match sessions.json
export const DISCIPLINES: string[] = [
  'Breath Awareness',
  'Body Scan',
  'Loving-Kindness',
  'Vipassana',
  'Zen/Zazen',
  'Mantra',
  'Open Awareness',
  'Walking Meditation',
  'Contemplative'
]

// Seating positions/poses
export const POSES: string[] = [
  'Seated (cushion)',
  'Seated (chair)',
  'Kneeling (seiza)',
  'Lotus',
  'Half-lotus',
  'Lying down',
  'Walking',
  'Standing'
]

// Best time of day
export const BEST_TIMES: string[] = [
  'Morning',
  'Midday',
  'Afternoon',
  'Evening',
  'Before sleep',
  'Anytime'
]

// Duration options for template creation (display format)
export const DURATION_OPTIONS: string[] = [
  '5-10 mins',
  '10-15 mins',
  '15-20 mins',
  '20-30 mins',
  '30-45 mins',
  '45-60 mins'
]

// Duration options in minutes for planning
export const DURATIONS_MINUTES: number[] = [5, 10, 15, 20, 25, 30, 45, 60]

// Parse duration string to get max minutes (e.g., "15-20 mins" → 20)
export function parseDurationMax(guidance: string): number {
  const match = guidance.match(/(\d+)(?:-(\d+))?\s*min/)
  if (match) {
    return parseInt(match[2] || match[1], 10)
  }
  return 15 // default
}

// Parse duration string to get min minutes (e.g., "15-20 mins" → 15)
export function parseDurationMin(guidance: string): number {
  const match = guidance.match(/(\d+)/)
  if (match) {
    return parseInt(match[1], 10)
  }
  return 10 // default
}
