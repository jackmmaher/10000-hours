/**
 * Theme Engine - Two-axis dynamic theming
 *
 * Axis 1: Time of Day (luminosity)
 * - Morning (5am-11am): Warm, soft, gentle contrast
 * - Daytime (11am-5pm): Bright, clear, full contrast
 * - Evening (5pm-9pm): Golden warmth, softening
 * - Night (9pm-5am): Deep, low contrast, cool
 *
 * Axis 2: Season (accent colors)
 * - Spring (Mar-May): Fresh green, renewal
 * - Summer (Jun-Aug): Warm gold, vibrant
 * - Autumn (Sep-Nov): Amber/rust, grounded
 * - Winter (Dec-Feb): Cool silver/blue, still
 */

export type TimeOfDay = 'morning' | 'daytime' | 'evening' | 'night'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export interface ThemeValues {
  // Background
  bgBase: string
  bgDeep: string

  // Text
  textPrimary: string
  textSecondary: string
  textMuted: string

  // Accent
  accent: string
  accentMuted: string

  // Orb/indicator colors
  orbPrimary: string
  orbSecondary: string

  // Modifiers
  luminosity: number // 0-100
  warmth: number // -10 to +10
  contrast: number // 0.8 to 1.2
}

export interface ThemeState {
  timeOfDay: TimeOfDay
  season: Season
  values: ThemeValues
  isTransitioning: boolean
}

// Get current time of day
export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours()

  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 17) return 'daytime'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

// Get current season (hemisphere-aware)
export function getSeason(date: Date = new Date(), southernHemisphere: boolean = false): Season {
  const month = date.getMonth() // 0-11

  let season: Season
  if (month >= 2 && month <= 4) season = 'spring'
  else if (month >= 5 && month <= 7) season = 'summer'
  else if (month >= 8 && month <= 10) season = 'autumn'
  else season = 'winter'

  // Flip for southern hemisphere
  if (southernHemisphere) {
    const flip: Record<Season, Season> = {
      spring: 'autumn',
      summer: 'winter',
      autumn: 'spring',
      winter: 'summer'
    }
    season = flip[season]
  }

  return season
}

// Base theme values (daytime + no season modifier)
const BASE_THEME: ThemeValues = {
  bgBase: '#FAF8F5',
  bgDeep: '#F5F0E8',
  textPrimary: '#2C3E50',
  textSecondary: '#5D6D7E',
  textMuted: 'rgba(44, 62, 80, 0.4)',
  accent: '#87A878',
  accentMuted: 'rgba(135, 168, 120, 0.4)',
  orbPrimary: '#87A878',
  orbSecondary: '#5D6D7E',
  luminosity: 95,
  warmth: 0,
  contrast: 1.0
}

// Time of day modifiers
const TIME_MODIFIERS: Record<TimeOfDay, Partial<ThemeValues>> = {
  morning: {
    bgBase: '#FBF9F6',
    luminosity: 92,
    warmth: 3,
    contrast: 0.95
  },
  daytime: {
    luminosity: 95,
    warmth: 0,
    contrast: 1.0
  },
  evening: {
    bgBase: '#FAF7F2',
    bgDeep: '#F5EFE5',
    luminosity: 88,
    warmth: 5,
    contrast: 0.92
  },
  night: {
    bgBase: '#F5F3F0',
    bgDeep: '#EDEAE5',
    textSecondary: '#6B7D8E',
    luminosity: 82,
    warmth: -2,
    contrast: 0.85
  }
}

// Seasonal accent modifiers
const SEASON_MODIFIERS: Record<Season, Partial<ThemeValues>> = {
  spring: {
    accent: '#7FB069', // Fresh green
    accentMuted: 'rgba(127, 176, 105, 0.4)',
    orbPrimary: '#7FB069'
  },
  summer: {
    accent: '#D4A574', // Warm gold
    accentMuted: 'rgba(212, 165, 116, 0.4)',
    orbPrimary: '#C9A068'
  },
  autumn: {
    accent: '#B8763E', // Amber/rust
    accentMuted: 'rgba(184, 118, 62, 0.4)',
    orbPrimary: '#A67C52'
  },
  winter: {
    accent: '#7B9CAD', // Cool silver-blue
    accentMuted: 'rgba(123, 156, 173, 0.4)',
    orbPrimary: '#7B9CAD'
  }
}

// Calculate theme for current time and season
export function calculateTheme(
  timeOfDay: TimeOfDay = getTimeOfDay(),
  season: Season = getSeason()
): ThemeValues {
  const timeModifier = TIME_MODIFIERS[timeOfDay]
  const seasonModifier = SEASON_MODIFIERS[season]

  return {
    ...BASE_THEME,
    ...timeModifier,
    ...seasonModifier
  }
}

// Check if we're in a transition period (dawn/dusk)
export function isTransitionPeriod(date: Date = new Date()): boolean {
  const hour = date.getHours()
  const minute = date.getMinutes()
  const totalMinutes = hour * 60 + minute

  // Dawn transition: 4:30-5:30 AM
  if (totalMinutes >= 270 && totalMinutes <= 330) return true

  // Morning-to-day transition: 10:30-11:30 AM
  if (totalMinutes >= 630 && totalMinutes <= 690) return true

  // Day-to-evening transition: 4:30-5:30 PM
  if (totalMinutes >= 990 && totalMinutes <= 1050) return true

  // Dusk transition: 8:30-9:30 PM
  if (totalMinutes >= 1230 && totalMinutes <= 1290) return true

  return false
}

// Get CSS custom properties from theme values
export function themeToCSSProperties(theme: ThemeValues): Record<string, string> {
  return {
    '--bg-base': theme.bgBase,
    '--bg-deep': theme.bgDeep,
    '--text-primary': theme.textPrimary,
    '--text-secondary': theme.textSecondary,
    '--text-muted': theme.textMuted,
    '--accent': theme.accent,
    '--accent-muted': theme.accentMuted,
    '--orb-primary': theme.orbPrimary,
    '--orb-secondary': theme.orbSecondary,
    '--luminosity': `${theme.luminosity}%`,
    '--warmth': `${theme.warmth}`,
    '--contrast': `${theme.contrast}`
  }
}

// Detect if user is in southern hemisphere (rough estimate from timezone)
export function detectSouthernHemisphere(): boolean {
  // Timezones that are likely southern hemisphere
  const southernTimezones = [
    'Australia', 'Auckland', 'Wellington', 'Sydney', 'Melbourne',
    'Buenos_Aires', 'Sao_Paulo', 'Johannesburg', 'Cape_Town'
  ]

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return southernTimezones.some(s => tz.includes(s))
  } catch {
    return false
  }
}
