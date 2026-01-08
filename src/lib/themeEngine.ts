/**
 * Theme Engine - Dramatic visual theming
 *
 * 4 distinct visual modes × 4 seasonal accents = 16 variations
 *
 * Axis 1: Time of Day (DRAMATIC visual difference)
 * - Morning (5am-11am): Soft warm cream, gentle awakening
 * - Daytime (11am-5pm): Bright white, crisp and clear
 * - Evening (5pm-9pm): Golden amber warmth, cozy
 * - Night (9pm-5am): True dark mode, restful
 *
 * Axis 2: Season (accent colors)
 * - Spring: Fresh green
 * - Summer: Warm gold
 * - Autumn: Rich amber
 * - Winter: Cool silver-blue
 */

export type TimeOfDay = 'morning' | 'daytime' | 'evening' | 'night'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export interface ThemeValues {
  // Background
  bgBase: string
  bgWarm: string
  bgDeep: string

  // Text
  textPrimary: string
  textSecondary: string
  textMuted: string

  // Accent
  accent: string
  accentWarm: string
  accentMuted: string

  // Orb/indicator colors
  orbPrimary: string
  orbSecondary: string

  // Modifiers
  luminosity: number // 0-100
  warmth: number // -10 to +10
  contrast: number // 0.8 to 1.2

  // For CSS class switching
  isDark: boolean
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

// DRAMATIC time-of-day themes - visually distinct!
const TIME_THEMES: Record<TimeOfDay, Omit<ThemeValues, 'accent' | 'accentWarm' | 'accentMuted' | 'orbPrimary' | 'orbSecondary'>> = {
  morning: {
    // Soft warm cream - gentle awakening
    bgBase: '#FDF9F3',
    bgWarm: '#FAF5EC',
    bgDeep: '#F5EEE3',
    textPrimary: '#3D4852',
    textSecondary: '#6B7280',
    textMuted: 'rgba(61, 72, 82, 0.4)',
    luminosity: 94,
    warmth: 4,
    contrast: 0.95,
    isDark: false
  },
  daytime: {
    // Bright, crisp white - full energy
    bgBase: '#FFFFFF',
    bgWarm: '#F9FAFB',
    bgDeep: '#F3F4F6',
    textPrimary: '#1F2937',
    textSecondary: '#4B5563',
    textMuted: 'rgba(31, 41, 55, 0.4)',
    luminosity: 100,
    warmth: 0,
    contrast: 1.0,
    isDark: false
  },
  evening: {
    // Golden amber warmth - cozy wind-down
    bgBase: '#FBF6ED',
    bgWarm: '#F7EFE0',
    bgDeep: '#EFE4D1',
    textPrimary: '#44403C',
    textSecondary: '#78716C',
    textMuted: 'rgba(68, 64, 60, 0.4)',
    luminosity: 88,
    warmth: 8,
    contrast: 0.92,
    isDark: false
  },
  night: {
    // TRUE DARK MODE - restful, easy on eyes
    bgBase: '#0F172A',
    bgWarm: '#1E293B',
    bgDeep: '#0D1321',
    textPrimary: '#E2E8F0',
    textSecondary: '#94A3B8',
    textMuted: 'rgba(226, 232, 240, 0.4)',
    luminosity: 15,
    warmth: -2,
    contrast: 0.9,
    isDark: true
  }
}

// Seasonal accent colors - distinct palettes
const SEASON_ACCENTS: Record<Season, Pick<ThemeValues, 'accent' | 'accentWarm' | 'accentMuted' | 'orbPrimary' | 'orbSecondary'>> = {
  spring: {
    // Fresh green - renewal, growth
    accent: '#22C55E',
    accentWarm: '#4ADE80',
    accentMuted: 'rgba(34, 197, 94, 0.3)',
    orbPrimary: '#22C55E',
    orbSecondary: '#86EFAC'
  },
  summer: {
    // Warm gold - vibrant, abundant
    accent: '#F59E0B',
    accentWarm: '#FBBF24',
    accentMuted: 'rgba(245, 158, 11, 0.3)',
    orbPrimary: '#F59E0B',
    orbSecondary: '#FCD34D'
  },
  autumn: {
    // Rich amber/rust - grounding, harvest
    accent: '#EA580C',
    accentWarm: '#F97316',
    accentMuted: 'rgba(234, 88, 12, 0.3)',
    orbPrimary: '#EA580C',
    orbSecondary: '#FB923C'
  },
  winter: {
    // Cool silver-blue - stillness, reflection
    accent: '#0EA5E9',
    accentWarm: '#38BDF8',
    accentMuted: 'rgba(14, 165, 233, 0.3)',
    orbPrimary: '#0EA5E9',
    orbSecondary: '#7DD3FC'
  }
}

// Calculate theme for current time and season
export function calculateTheme(
  timeOfDay: TimeOfDay = getTimeOfDay(),
  season: Season = getSeason()
): ThemeValues {
  const timeTheme = TIME_THEMES[timeOfDay]
  const seasonAccents = SEASON_ACCENTS[season]

  return {
    ...timeTheme,
    ...seasonAccents
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
    '--bg-warm': theme.bgWarm,
    '--bg-deep': theme.bgDeep,
    '--text-primary': theme.textPrimary,
    '--text-secondary': theme.textSecondary,
    '--text-muted': theme.textMuted,
    '--accent': theme.accent,
    '--accent-warm': theme.accentWarm,
    '--accent-muted': theme.accentMuted,
    '--orb-primary': theme.orbPrimary,
    '--orb-secondary': theme.orbSecondary,
    '--luminosity': `${theme.luminosity}%`,
    '--warmth': `${theme.warmth}`,
    '--contrast': `${theme.contrast}`
  }
}

// Get theme name for display (e.g., "Morning × Spring")
export function getThemeName(timeOfDay: TimeOfDay, season: Season): string {
  const timeNames: Record<TimeOfDay, string> = {
    morning: 'Morning',
    daytime: 'Daytime',
    evening: 'Evening',
    night: 'Night'
  }
  const seasonNames: Record<Season, string> = {
    spring: 'Spring',
    summer: 'Summer',
    autumn: 'Autumn',
    winter: 'Winter'
  }
  return `${timeNames[timeOfDay]} × ${seasonNames[season]}`
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
