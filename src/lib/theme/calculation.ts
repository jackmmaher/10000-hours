/**
 * Theme Calculation Functions
 *
 * Functions for calculating theme tokens based on time, season, or sun position.
 */

import type { ThemeTokens, TimeOfDay, Season } from './types'
import { getTimeOfDay, getSeason } from './detection'
import { SEASON_THEMES } from './tokens'
import { interpolateThemes } from './interpolation'

/**
 * Get theme tokens for a specific time of day and season
 */
export function getThemeTokens(
  timeOfDay: TimeOfDay = getTimeOfDay(),
  season: Season = getSeason()
): ThemeTokens {
  return SEASON_THEMES[season][timeOfDay]
}

/**
 * Calculate theme for current or specified time/season
 */
export function calculateTheme(
  timeOfDay: TimeOfDay = getTimeOfDay(),
  season: Season = getSeason()
): ThemeTokens {
  return getThemeTokens(timeOfDay, season)
}

const SOLAR_THRESHOLDS = {
  HIGH_SUN: 15, // Above this: pure daytime (fallback for equatorial/summer)
  HORIZON: 0, // Sunrise/sunset moment
  CIVIL_TWILIGHT: -6, // Below this: full night
}

const RELATIVE_DAYTIME_THRESHOLD = 0.85

/**
 * Calculate theme tokens based on sun altitude
 * Provides smooth blending during golden/blue hours
 */
export function calculateThemeBySunPosition(
  altitude: number,
  isRising: boolean,
  season: Season,
  maxSolarAltitude?: number
): ThemeTokens {
  const themes = SEASON_THEMES[season]

  // Calculate effective "high sun" threshold
  // If maxSolarAltitude is provided, use relative positioning
  // Otherwise fall back to fixed threshold (backward compatible)
  const effectiveHighSun =
    maxSolarAltitude !== undefined
      ? Math.max(maxSolarAltitude * RELATIVE_DAYTIME_THRESHOLD, 6) // At least 6° to avoid edge cases
      : SOLAR_THRESHOLDS.HIGH_SUN

  // Full daytime - sun is high (relative to this location's maximum)
  if (altitude > effectiveHighSun) {
    return themes.daytime
  }

  // Full night - sun well below horizon
  if (altitude < SOLAR_THRESHOLDS.CIVIL_TWILIGHT) {
    return themes.night
  }

  // Golden hour / Blue hour - sun between horizon and high point
  // This is where the magic happens - smooth blending
  if (altitude >= SOLAR_THRESHOLDS.HORIZON && altitude <= effectiveHighSun) {
    // Progress: 0 at effectiveHighSun, 1 at HORIZON (0°)
    const progress = 1 - altitude / effectiveHighSun

    if (isRising) {
      // Morning: blend from morning toward daytime as sun rises
      return interpolateThemes(themes.morning, themes.daytime, 1 - progress)
    } else {
      // Evening: blend from daytime toward evening as sun lowers
      return interpolateThemes(themes.daytime, themes.evening, progress)
    }
  }

  // Twilight - sun below horizon but still some light
  if (altitude >= SOLAR_THRESHOLDS.CIVIL_TWILIGHT && altitude < SOLAR_THRESHOLDS.HORIZON) {
    // Progress: 0 at HORIZON (0°), 1 at CIVIL_TWILIGHT (-6°)
    const progress = altitude / SOLAR_THRESHOLDS.CIVIL_TWILIGHT // Note: both negative, so this gives positive 0-1

    if (isRising) {
      // Dawn: blend from night toward morning
      return interpolateThemes(themes.night, themes.morning, 1 - progress)
    } else {
      // Dusk: blend from evening toward night
      return interpolateThemes(themes.evening, themes.night, progress)
    }
  }

  return themes.night
}

/**
 * Get time of day classification from sun position
 */
export function getTimeOfDayFromSunPosition(
  altitude: number,
  isRising: boolean,
  maxSolarAltitude?: number
): TimeOfDay {
  // Calculate effective threshold (same logic as calculateThemeBySunPosition)
  const effectiveHighSun =
    maxSolarAltitude !== undefined
      ? Math.max(maxSolarAltitude * RELATIVE_DAYTIME_THRESHOLD, 6)
      : SOLAR_THRESHOLDS.HIGH_SUN

  if (altitude > effectiveHighSun) return 'daytime'
  if (altitude < SOLAR_THRESHOLDS.CIVIL_TWILIGHT) return 'night'

  if (altitude >= SOLAR_THRESHOLDS.HORIZON) {
    return isRising ? 'morning' : 'evening'
  }

  return isRising ? 'morning' : 'night'
}
