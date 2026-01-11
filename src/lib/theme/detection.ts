/**
 * Theme Detection Functions
 *
 * Time of day and season detection for the Living Theme System.
 */

import { TimeOfDay, Season, SEASONAL_TIME_BOUNDARIES } from './types'

/**
 * Get current time of day - SEASON-AWARE
 * Uses seasonal boundaries for realistic daylight transitions
 */
export function getTimeOfDay(date: Date = new Date(), season?: Season): TimeOfDay {
  const hour = date.getHours() + date.getMinutes() / 60
  const currentSeason = season ?? getSeason(date)
  const bounds = SEASONAL_TIME_BOUNDARIES[currentSeason]

  // Handle night which wraps around midnight
  if (bounds.night.start > bounds.night.end) {
    // Night spans midnight (e.g., 21:30 - 4:30)
    if (hour >= bounds.night.start || hour < bounds.night.end) return 'night'
  } else {
    if (hour >= bounds.night.start && hour < bounds.night.end) return 'night'
  }

  if (hour >= bounds.morning.start && hour < bounds.morning.end) return 'morning'
  if (hour >= bounds.daytime.start && hour < bounds.daytime.end) return 'daytime'
  if (hour >= bounds.evening.start && hour < bounds.evening.end) return 'evening'

  return 'night'
}

/**
 * Get current season (hemisphere-aware)
 */
export function getSeason(date: Date = new Date(), southernHemisphere: boolean = false): Season {
  const month = date.getMonth()

  let season: Season
  if (month >= 2 && month <= 4) season = 'spring'
  else if (month >= 5 && month <= 7) season = 'summer'
  else if (month >= 8 && month <= 10) season = 'autumn'
  else season = 'winter'

  if (southernHemisphere) {
    const flip: Record<Season, Season> = {
      spring: 'autumn',
      summer: 'winter',
      autumn: 'spring',
      winter: 'summer',
    }
    season = flip[season]
  }

  return season
}

/**
 * Detect southern hemisphere from timezone
 */
export function detectSouthernHemisphere(): boolean {
  const southernTimezones = [
    'Australia',
    'Auckland',
    'Wellington',
    'Sydney',
    'Melbourne',
    'Buenos_Aires',
    'Sao_Paulo',
    'Johannesburg',
    'Cape_Town',
  ]

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return southernTimezones.some((s) => tz.includes(s))
  } catch {
    return false
  }
}
