/**
 * Living Theme - Unified Theme System
 *
 * Single source of truth for the entire visual experience.
 * Sun altitude drives EVERYTHING - colors AND effects - on the same curve.
 *
 * No more fragmented systems with different transition thresholds.
 * Stars fade in as colors darken. Moon rises as evening deepens.
 * One continuous, seamless experience.
 */

import {
  ThemeTokens,
  TimeOfDay,
  Season,
  getSeason,
  getThemeTokens,
  NEUTRAL_LIGHT,
  NEUTRAL_DARK
} from './themeEngine'
import {
  getLocation,
  calculateSunPosition,
  estimateLocationFromTimezone
} from './solarPosition'

// Re-export for convenience
export type { ThemeTokens, TimeOfDay, Season }
export { getSeason, getLocation, calculateSunPosition, estimateLocationFromTimezone }

// ============================================================================
// UNIFIED THRESHOLDS
// ============================================================================

/**
 * Sun altitude thresholds - SINGLE SOURCE OF TRUTH
 * Both colors AND effects use these exact same values
 */
export const SUN_THRESHOLDS = {
  HIGH_SUN: 15,        // Above: full daytime (no night effects, brightest colors)
  GOLDEN_HOUR: 6,      // Golden hour begins (warm directional light appears)
  HORIZON: 0,          // Sunrise/sunset moment
  CIVIL_TWILIGHT: -6,  // Below: full night (max night effects, darkest colors)
} as const

// ============================================================================
// EFFECT INTENSITIES
// ============================================================================

/**
 * All effect intensities derived from sun altitude
 * These values range from 0 to 1
 */
export interface EffectIntensities {
  // Celestial
  stars: number           // 0 = invisible, 1 = full brightness
  moon: number            // 0 = invisible, 1 = full brightness
  shootingStars: number   // 0 = none, 1 = active (expressive only)

  // Atmospheric
  atmosphericGradient: number  // 0 = day gradient, 1 = night gradient
  directionalLight: {
    intensity: number     // 0 = none, 1 = strong
    warmth: number        // 0 = cool, 1 = warm golden
    angle: number         // degrees from horizon
  }

  // Environmental
  particles: number       // Base particle intensity
  grain: number           // Film grain intensity

  // Ambient
  ambientDarkness: number // 0 = bright, 1 = dark (for overall dimming)
}

/**
 * Calculate all effect intensities from sun altitude
 * This is the UNIFIED calculation that keeps effects in sync with colors
 */
export function calculateEffectIntensities(
  altitude: number,
  isRising: boolean,
  _season: Season,
  expressive: boolean = false
): EffectIntensities {
  // Clamp altitude to reasonable range
  const alt = Math.max(-18, Math.min(90, altitude))

  // === NIGHT EFFECTS (stars, moon) ===
  // Fade in from HIGH_SUN (15°) to CIVIL_TWILIGHT (-6°)
  // This matches the color interpolation exactly
  let nightProgress: number
  if (alt >= SUN_THRESHOLDS.HIGH_SUN) {
    nightProgress = 0 // Full day, no night effects
  } else if (alt <= SUN_THRESHOLDS.CIVIL_TWILIGHT) {
    nightProgress = 1 // Full night effects
  } else {
    // Linear interpolation from 15° to -6°
    nightProgress = (SUN_THRESHOLDS.HIGH_SUN - alt) /
      (SUN_THRESHOLDS.HIGH_SUN - SUN_THRESHOLDS.CIVIL_TWILIGHT)
  }

  // Stars: start appearing at ~6° (golden hour), full at -6°
  let stars = 0
  if (alt < SUN_THRESHOLDS.GOLDEN_HOUR) {
    stars = Math.min(1, (SUN_THRESHOLDS.GOLDEN_HOUR - alt) /
      (SUN_THRESHOLDS.GOLDEN_HOUR - SUN_THRESHOLDS.CIVIL_TWILIGHT))
  }

  // Moon: appears after sunset, full brightness at civil twilight
  let moon = 0
  if (alt < SUN_THRESHOLDS.HORIZON) {
    moon = Math.min(1, (SUN_THRESHOLDS.HORIZON - alt) /
      (SUN_THRESHOLDS.HORIZON - SUN_THRESHOLDS.CIVIL_TWILIGHT))
  }

  // === DIRECTIONAL LIGHT (sun/golden hour) ===
  let directionalIntensity = 0
  let directionalWarmth = 0
  let directionalAngle = Math.max(0, alt) // Angle matches sun altitude when above horizon

  if (alt > SUN_THRESHOLDS.HORIZON) {
    // Sun is up
    if (alt <= SUN_THRESHOLDS.GOLDEN_HOUR) {
      // Golden hour: warm, intense directional light
      directionalIntensity = 0.8
      directionalWarmth = 1 - (alt / SUN_THRESHOLDS.GOLDEN_HOUR) // More warm as sun lowers
    } else if (alt <= SUN_THRESHOLDS.HIGH_SUN) {
      // Approaching golden hour
      directionalIntensity = 0.3 + 0.5 * ((SUN_THRESHOLDS.HIGH_SUN - alt) /
        (SUN_THRESHOLDS.HIGH_SUN - SUN_THRESHOLDS.GOLDEN_HOUR))
      directionalWarmth = (SUN_THRESHOLDS.HIGH_SUN - alt) /
        (SUN_THRESHOLDS.HIGH_SUN - SUN_THRESHOLDS.GOLDEN_HOUR) * 0.5
    } else {
      // High sun: subtle directional light
      directionalIntensity = 0.3
      directionalWarmth = 0
    }
  } else if (alt > SUN_THRESHOLDS.CIVIL_TWILIGHT) {
    // Twilight: fading warm glow on horizon
    directionalIntensity = 0.4 * (1 - moon)
    directionalWarmth = 0.8 * (1 - moon)
    directionalAngle = 0 // Horizon glow
  }

  // Morning has cooler light than evening
  if (isRising && directionalWarmth > 0) {
    directionalWarmth *= 0.6
  }

  // === ATMOSPHERIC ===
  const atmosphericGradient = nightProgress

  // Grain: slightly more visible at night
  const grain = 0.03 + (nightProgress * 0.02)

  // Particles: base level, modified by season elsewhere
  const particles = 0.5 + (nightProgress * 0.2) // Slightly more active at night (fireflies etc)

  // === AMBIENT DARKNESS ===
  const ambientDarkness = nightProgress

  // === SHOOTING STARS (expressive only, night only) ===
  const shootingStars = expressive && alt < SUN_THRESHOLDS.HORIZON ? stars : 0

  return {
    stars,
    moon,
    shootingStars,
    atmosphericGradient,
    directionalLight: {
      intensity: directionalIntensity,
      warmth: directionalWarmth,
      angle: directionalAngle
    },
    particles,
    grain,
    ambientDarkness
  }
}

// ============================================================================
// UNIFIED THEME CALCULATION
// ============================================================================

/**
 * Import theme palettes from themeEngine
 * We keep the 16 beautifully-crafted themes as anchor points
 */
import {
  calculateThemeBySunPosition,
  getTimeOfDayFromSunPosition
} from './themeEngine'

export { calculateThemeBySunPosition, getTimeOfDayFromSunPosition }

/**
 * Complete living theme state - everything needed to render the experience
 */
export interface LivingThemeState {
  // Source data
  location: { lat: number; long: number } | null
  sunAltitude: number
  isRising: boolean
  season: Season
  timeOfDay: TimeOfDay

  // User preferences
  expressive: boolean
  breathingEnabled: boolean

  // Derived values
  colors: ThemeTokens
  effects: EffectIntensities
}

/**
 * Calculate complete living theme state from current conditions
 */
export function calculateLivingTheme(
  location: { lat: number; long: number },
  date: Date = new Date(),
  expressive: boolean = false,
  breathingEnabled: boolean = true
): LivingThemeState {
  const { altitude, isRising } = calculateSunPosition(location.lat, location.long, date)
  const season = getSeason(date, location.lat < 0)
  const timeOfDay = getTimeOfDayFromSunPosition(altitude, isRising)
  const colors = calculateThemeBySunPosition(altitude, isRising, season)
  const effects = calculateEffectIntensities(altitude, isRising, season, expressive)

  return {
    location,
    sunAltitude: altitude,
    isRising,
    season,
    timeOfDay,
    expressive,
    breathingEnabled,
    colors,
    effects
  }
}

// ============================================================================
// SEASONAL EFFECT MODIFIERS
// ============================================================================

/**
 * Season-specific effect configurations
 * These modify the base intensities for seasonal character
 */
export interface SeasonalEffects {
  // What particles to show
  particleType: 'mist' | 'fireflies' | 'leaves' | 'snow' | 'none'
  particleMultiplier: number

  // Aurora (winter expressive only)
  aurora: boolean

  // Harvest moon (autumn evening)
  harvestMoon: boolean

  // Rain chance (spring)
  rainPossible: boolean
}

export function getSeasonalEffects(
  season: Season,
  timeOfDay: TimeOfDay,
  expressive: boolean
): SeasonalEffects {
  const base: SeasonalEffects = {
    particleType: 'none',
    particleMultiplier: 1,
    aurora: false,
    harvestMoon: false,
    rainPossible: false
  }

  switch (season) {
    case 'spring':
      base.particleType = 'mist'
      base.rainPossible = true
      break

    case 'summer':
      if (timeOfDay === 'night' || timeOfDay === 'evening') {
        base.particleType = 'fireflies'
        base.particleMultiplier = expressive ? 1.5 : 1
      }
      break

    case 'autumn':
      base.particleType = 'leaves'
      base.particleMultiplier = timeOfDay === 'evening' ? 1.3 : 1
      if (timeOfDay === 'evening' && expressive) {
        base.harvestMoon = true
      }
      break

    case 'winter':
      base.particleType = 'snow'
      base.particleMultiplier = timeOfDay === 'night' ? 0.7 : 1 // Gentler at night
      if (timeOfDay === 'night' && expressive) {
        base.aurora = true
      }
      break
  }

  return base
}

// ============================================================================
// CSS VARIABLE APPLICATION
// ============================================================================

import { themeToCSSProperties } from './themeEngine'

export { themeToCSSProperties }

/**
 * Apply living theme to document
 * Sets all CSS variables and dark mode class
 */
export function applyLivingTheme(state: LivingThemeState): void {
  const properties = themeToCSSProperties(state.colors)
  const root = document.documentElement

  // Smooth transitions
  root.style.setProperty('--theme-transition', '2s ease')

  // Apply all color properties
  Object.entries(properties).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  // Apply effect intensity variables (for CSS-driven effects)
  root.style.setProperty('--effect-stars', state.effects.stars.toString())
  root.style.setProperty('--effect-moon', state.effects.moon.toString())
  root.style.setProperty('--effect-darkness', state.effects.ambientDarkness.toString())
  root.style.setProperty('--effect-grain', state.effects.grain.toString())
  root.style.setProperty('--effect-directional-intensity', state.effects.directionalLight.intensity.toString())
  root.style.setProperty('--effect-directional-warmth', state.effects.directionalLight.warmth.toString())
  root.style.setProperty('--effect-directional-angle', `${state.effects.directionalLight.angle}deg`)

  // Dark mode class
  if (state.colors.isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// ============================================================================
// MANUAL THEME CALCULATION
// ============================================================================

/**
 * Extended season type that includes neutral option
 */
export type SeasonOption = Season | 'neutral'

/**
 * Calculate static effect intensities for manual themes
 * Returns appropriate effects based on time of day without live solar calculations
 */
function calculateManualEffects(
  timeOfDay: TimeOfDay,
  isNeutral: boolean,
  expressive: boolean
): EffectIntensities {
  // Neutral theme: minimal effects regardless of time
  if (isNeutral) {
    return {
      stars: 0,
      moon: 0,
      shootingStars: 0,
      atmosphericGradient: 0,
      directionalLight: {
        intensity: 0,
        warmth: 0,
        angle: 45
      },
      particles: 0,
      grain: 0.02, // Just a subtle texture
      ambientDarkness: 0
    }
  }

  // Standard manual themes: static effects based on time of day
  switch (timeOfDay) {
    case 'morning':
      return {
        stars: 0,
        moon: 0,
        shootingStars: 0,
        atmosphericGradient: 0.1,
        directionalLight: {
          intensity: 0.4,
          warmth: 0.3,
          angle: 15
        },
        particles: 0.3,
        grain: 0.03,
        ambientDarkness: 0.1
      }
    case 'daytime':
      return {
        stars: 0,
        moon: 0,
        shootingStars: 0,
        atmosphericGradient: 0,
        directionalLight: {
          intensity: 0.3,
          warmth: 0,
          angle: 60
        },
        particles: 0.2,
        grain: 0.03,
        ambientDarkness: 0
      }
    case 'evening':
      return {
        stars: 0.3,
        moon: 0.2,
        shootingStars: 0,
        atmosphericGradient: 0.5,
        directionalLight: {
          intensity: 0.6,
          warmth: 0.8,
          angle: 10
        },
        particles: 0.5,
        grain: 0.04,
        ambientDarkness: 0.4
      }
    case 'night':
      return {
        stars: 1,
        moon: 0.9,
        shootingStars: expressive ? 0.8 : 0,
        atmosphericGradient: 1,
        directionalLight: {
          intensity: 0,
          warmth: 0,
          angle: 0
        },
        particles: 0.6,
        grain: 0.05,
        ambientDarkness: 1
      }
  }
}

/**
 * Calculate complete living theme state for manual mode
 * Uses static values based on user selection instead of solar position
 */
export function calculateManualTheme(
  season: SeasonOption,
  timeOfDay: TimeOfDay,
  expressive: boolean = false,
  breathingEnabled: boolean = true
): LivingThemeState {
  const isNeutral = season === 'neutral'

  // Get color tokens
  let colors: ThemeTokens
  if (isNeutral) {
    // Neutral uses light/dark based on time of day
    colors = timeOfDay === 'night' ? NEUTRAL_DARK : NEUTRAL_LIGHT
  } else {
    colors = getThemeTokens(timeOfDay, season as Season)
  }

  // Calculate static effects
  const effects = calculateManualEffects(timeOfDay, isNeutral, expressive)

  // Simulate sun altitude based on time of day
  const altitudeMap: Record<TimeOfDay, number> = {
    morning: 10,
    daytime: 45,
    evening: 3,
    night: -15
  }

  return {
    location: null, // No location in manual mode
    sunAltitude: altitudeMap[timeOfDay],
    isRising: timeOfDay === 'morning',
    season: isNeutral ? 'winter' : (season as Season), // Default to winter for neutral
    timeOfDay,
    expressive,
    breathingEnabled,
    colors,
    effects
  }
}

/**
 * Get seasonal effects for manual mode
 * Returns minimal effects for neutral, standard effects for seasonal themes
 */
export function getManualSeasonalEffects(
  season: SeasonOption,
  timeOfDay: TimeOfDay,
  expressive: boolean
): SeasonalEffects {
  // Neutral: no seasonal effects
  if (season === 'neutral') {
    return {
      particleType: 'none',
      particleMultiplier: 0,
      aurora: false,
      harvestMoon: false,
      rainPossible: false
    }
  }

  // Use standard seasonal effects for seasonal themes
  return getSeasonalEffects(season as Season, timeOfDay, expressive)
}
