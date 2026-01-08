/**
 * Theme Engine - Living Theme System
 *
 * A comprehensive theming system that creates distinct visual identities
 * for each time of day and season combination.
 *
 * Architecture:
 * - 4 Seasons: Spring, Summer, Autumn, Winter
 * - 4 Times of Day: Morning (5-11), Daytime (11-17), Evening (17-21), Night (21-5)
 * - 16 total theme combinations
 *
 * Design Philosophy:
 * - Colors based on real-world light observation
 * - Each time period instantly recognizable
 * - Systematic intentionality over arbitrary values
 * - Restraint: limited palettes, meaningful contrasts
 */

export type TimeOfDay = 'morning' | 'daytime' | 'evening' | 'night'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

/**
 * Comprehensive theme tokens covering every visual element
 */
export interface ThemeTokens {
  // === BACKGROUNDS ===
  bgBase: string           // Main app background
  bgElevated: string       // Cards, elevated surfaces
  bgDeep: string           // Inset areas, wells
  bgOverlay: string        // Modal overlays

  // === TEXT ===
  textPrimary: string      // Main content
  textSecondary: string    // Supporting text
  textMuted: string        // Hints, timestamps
  textOnAccent: string     // Text on accent-colored backgrounds

  // === ACCENT COLORS ===
  accent: string           // Primary interactive color
  accentHover: string      // Hover state
  accentMuted: string      // Subtle accent backgrounds
  accentGlow: string       // Glow/shadow color for accent

  // === ORB (Meditation Timer) ===
  orbCore: string          // Center of the orb
  orbMid: string           // Middle layer
  orbEdge: string          // Outer edge
  orbGlow: string          // Outer glow color
  orbAtmosphere: string    // Ambient atmosphere layer

  // === STONES (Week indicators) ===
  stoneCompleted: string   // Session done
  stoneCompletedInner: string
  stonePlanned: string     // Future plan exists
  stonePlannedBorder: string
  stoneEmpty: string       // No session/plan
  stoneToday: string       // Current day highlight

  // === CARDS ===
  cardBg: string           // Card background
  cardBorder: string       // Card border (if any)
  cardShadow: string       // Card shadow color

  // === CALENDAR ===
  calendarDayBg: string    // Day cell background
  calendarDayText: string  // Day number
  calendarIntensity1: string  // Light activity
  calendarIntensity2: string  // Medium activity
  calendarIntensity3: string  // High activity
  calendarIntensity4: string  // Very high activity

  // === PROGRESS ELEMENTS ===
  progressTrack: string    // Progress bar track
  progressFill: string     // Progress bar fill
  progressGlow: string     // Progress glow effect

  // === INTERACTIVE ===
  buttonPrimaryBg: string
  buttonPrimaryText: string
  buttonSecondaryBg: string
  buttonSecondaryText: string
  toggleOn: string
  toggleOff: string
  toggleThumb: string

  // === BORDERS & DIVIDERS ===
  border: string
  borderSubtle: string
  divider: string

  // === SHADOWS ===
  shadowColor: string      // Base shadow color
  shadowElevation1: string // Subtle shadow
  shadowElevation2: string // Medium shadow
  shadowElevation3: string // Strong shadow

  // === PEARLS (Wisdom cards) ===
  pearlBg: string
  pearlShimmer: string
  pearlOrb: string
  pearlOrbInner: string

  // === SPECIAL ELEMENTS ===
  navBg: string            // Navigation background
  navActive: string        // Active nav item
  navInactive: string      // Inactive nav item
  pullIndicator: string    // Pull-to-refresh color

  // === META ===
  isDark: boolean
  seasonalAccent: string   // The season's signature color
}

/**
 * Time of day boundaries - SEASON-AWARE
 * Based on real-world daylight patterns
 *
 * Summer: Longest days - dawn ~4:30am, dusk ~9:30pm
 * Winter: Shortest days - dawn ~7am, dusk ~4:30pm
 * Spring/Autumn: Moderate transitions
 */
export const SEASONAL_TIME_BOUNDARIES: Record<Season, {
  morning: { start: number; end: number }
  daytime: { start: number; end: number }
  evening: { start: number; end: number }
  night: { start: number; end: number }
}> = {
  summer: {
    morning: { start: 4.5, end: 11 },    // 4:30 AM - 10:59 AM (early dawn)
    daytime: { start: 11, end: 18 },     // 11:00 AM - 5:59 PM
    evening: { start: 18, end: 21.5 },   // 6:00 PM - 9:29 PM (long golden hour)
    night: { start: 21.5, end: 4.5 }     // 9:30 PM - 4:29 AM (short nights)
  },
  winter: {
    morning: { start: 7, end: 11 },      // 7:00 AM - 10:59 AM (late dawn)
    daytime: { start: 11, end: 16 },     // 11:00 AM - 3:59 PM (short days)
    evening: { start: 16, end: 18 },     // 4:00 PM - 5:59 PM (brief twilight)
    night: { start: 18, end: 7 }         // 6:00 PM - 6:59 AM (long nights)
  },
  spring: {
    morning: { start: 5.5, end: 11 },    // 5:30 AM - 10:59 AM
    daytime: { start: 11, end: 17 },     // 11:00 AM - 4:59 PM
    evening: { start: 17, end: 20 },     // 5:00 PM - 7:59 PM
    night: { start: 20, end: 5.5 }       // 8:00 PM - 5:29 AM
  },
  autumn: {
    morning: { start: 6, end: 11 },      // 6:00 AM - 10:59 AM
    daytime: { start: 11, end: 16.5 },   // 11:00 AM - 4:29 PM
    evening: { start: 16.5, end: 19 },   // 4:30 PM - 6:59 PM
    night: { start: 19, end: 6 }         // 7:00 PM - 5:59 AM
  }
}

// Legacy export for backward compatibility
export const TIME_BOUNDARIES = SEASONAL_TIME_BOUNDARIES.spring

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
      winter: 'summer'
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

// ============================================================================
// WINTER THEME DEFINITIONS
// ============================================================================

/**
 * Winter Morning (5am - 11am)
 * Mood: Frost light through a window. Cold but awakening.
 * Light quality: Cool, clear, blue-tinted from low sun angle
 */
const WINTER_MORNING: ThemeTokens = {
  // Backgrounds - Cool blue-gray tones
  bgBase: '#F0F4F8',
  bgElevated: '#F7F9FB',
  bgDeep: '#E2E8F0',
  bgOverlay: 'rgba(15, 23, 42, 0.4)',

  // Text - Cool charcoal
  textPrimary: '#334155',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnAccent: '#FFFFFF',

  // Accent - Ice blue
  accent: '#38BDF8',
  accentHover: '#0EA5E9',
  accentMuted: 'rgba(56, 189, 248, 0.15)',
  accentGlow: 'rgba(56, 189, 248, 0.4)',

  // Orb - Sunrise through frost
  orbCore: '#FFFFFF',
  orbMid: '#E0F2FE',
  orbEdge: '#7DD3FC',
  orbGlow: 'rgba(56, 189, 248, 0.3)',
  orbAtmosphere: 'rgba(56, 189, 248, 0.1)',

  // Stones
  stoneCompleted: '#64748B',
  stoneCompletedInner: '#94A3B8',
  stonePlanned: 'rgba(56, 189, 248, 0.2)',
  stonePlannedBorder: 'rgba(56, 189, 248, 0.5)',
  stoneEmpty: '#E2E8F0',
  stoneToday: '#CBD5E1',

  // Cards
  cardBg: '#F7F9FB',
  cardBorder: 'rgba(100, 116, 139, 0.1)',
  cardShadow: 'rgba(51, 65, 85, 0.08)',

  // Calendar
  calendarDayBg: '#F7F9FB',
  calendarDayText: '#64748B',
  calendarIntensity1: 'rgba(56, 189, 248, 0.2)',
  calendarIntensity2: 'rgba(56, 189, 248, 0.4)',
  calendarIntensity3: 'rgba(56, 189, 248, 0.6)',
  calendarIntensity4: 'rgba(56, 189, 248, 0.8)',

  // Progress
  progressTrack: '#E2E8F0',
  progressFill: '#38BDF8',
  progressGlow: 'rgba(56, 189, 248, 0.3)',

  // Interactive
  buttonPrimaryBg: '#38BDF8',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#E2E8F0',
  buttonSecondaryText: '#334155',
  toggleOn: '#38BDF8',
  toggleOff: '#CBD5E1',
  toggleThumb: '#FFFFFF',

  // Borders
  border: 'rgba(100, 116, 139, 0.2)',
  borderSubtle: 'rgba(100, 116, 139, 0.1)',
  divider: 'rgba(100, 116, 139, 0.1)',

  // Shadows - Cool blue-tinted
  shadowColor: 'rgba(51, 65, 85, 0.1)',
  shadowElevation1: '0 1px 3px rgba(51, 65, 85, 0.08)',
  shadowElevation2: '0 4px 12px rgba(51, 65, 85, 0.1)',
  shadowElevation3: '0 8px 24px rgba(51, 65, 85, 0.12)',

  // Pearls
  pearlBg: '#F7F9FB',
  pearlShimmer: 'rgba(255, 255, 255, 0.6)',
  pearlOrb: '#E2E8F0',
  pearlOrbInner: '#CBD5E1',

  // Navigation
  navBg: 'rgba(240, 244, 248, 0.95)',
  navActive: '#334155',
  navInactive: '#94A3B8',
  pullIndicator: '#38BDF8',

  // Meta
  isDark: false,
  seasonalAccent: '#38BDF8'
}

/**
 * Winter Daytime (11am - 5pm)
 * Mood: Bright winter sun on snow. Crisp, high contrast, energizing.
 * Light quality: Brightest, neutral, highest contrast
 */
const WINTER_DAYTIME: ThemeTokens = {
  // Backgrounds - Clean white, slight cool undertone
  bgBase: '#FAFBFC',
  bgElevated: '#FFFFFF',
  bgDeep: '#F1F5F9',
  bgOverlay: 'rgba(15, 23, 42, 0.5)',

  // Text - Maximum contrast
  textPrimary: '#1E293B',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textOnAccent: '#FFFFFF',

  // Accent - Sky blue
  accent: '#0EA5E9',
  accentHover: '#0284C7',
  accentMuted: 'rgba(14, 165, 233, 0.12)',
  accentGlow: 'rgba(14, 165, 233, 0.35)',

  // Orb - Sun on snow
  orbCore: '#FFFFFF',
  orbMid: '#F0F9FF',
  orbEdge: '#38BDF8',
  orbGlow: 'rgba(14, 165, 233, 0.25)',
  orbAtmosphere: 'rgba(14, 165, 233, 0.08)',

  // Stones
  stoneCompleted: '#475569',
  stoneCompletedInner: '#64748B',
  stonePlanned: 'rgba(14, 165, 233, 0.15)',
  stonePlannedBorder: 'rgba(14, 165, 233, 0.5)',
  stoneEmpty: '#E2E8F0',
  stoneToday: '#CBD5E1',

  // Cards
  cardBg: '#FFFFFF',
  cardBorder: 'rgba(71, 85, 105, 0.08)',
  cardShadow: 'rgba(0, 0, 0, 0.06)',

  // Calendar
  calendarDayBg: '#FFFFFF',
  calendarDayText: '#475569',
  calendarIntensity1: 'rgba(14, 165, 233, 0.15)',
  calendarIntensity2: 'rgba(14, 165, 233, 0.35)',
  calendarIntensity3: 'rgba(14, 165, 233, 0.55)',
  calendarIntensity4: 'rgba(14, 165, 233, 0.75)',

  // Progress
  progressTrack: '#E2E8F0',
  progressFill: '#0EA5E9',
  progressGlow: 'rgba(14, 165, 233, 0.25)',

  // Interactive
  buttonPrimaryBg: '#0EA5E9',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#F1F5F9',
  buttonSecondaryText: '#1E293B',
  toggleOn: '#0EA5E9',
  toggleOff: '#CBD5E1',
  toggleThumb: '#FFFFFF',

  // Borders
  border: 'rgba(71, 85, 105, 0.15)',
  borderSubtle: 'rgba(71, 85, 105, 0.08)',
  divider: 'rgba(71, 85, 105, 0.08)',

  // Shadows - Neutral, crisp
  shadowColor: 'rgba(0, 0, 0, 0.08)',
  shadowElevation1: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
  shadowElevation2: '0 4px 12px rgba(0, 0, 0, 0.08)',
  shadowElevation3: '0 8px 24px rgba(0, 0, 0, 0.1)',

  // Pearls
  pearlBg: '#FFFFFF',
  pearlShimmer: 'rgba(255, 255, 255, 0.8)',
  pearlOrb: '#E2E8F0',
  pearlOrbInner: '#F1F5F9',

  // Navigation
  navBg: 'rgba(250, 251, 252, 0.95)',
  navActive: '#1E293B',
  navInactive: '#94A3B8',
  pullIndicator: '#0EA5E9',

  // Meta
  isDark: false,
  seasonalAccent: '#0EA5E9'
}

/**
 * Winter Evening (5pm - 9pm)
 * Mood: Indoor warmth against the cold outside. Candlelight, hygge.
 * Light quality: Golden hour, warm amber, soft contrasts
 */
const WINTER_EVENING: ThemeTokens = {
  // Backgrounds - Warm cream
  bgBase: '#FDF8F3',
  bgElevated: '#FFFBF7',
  bgDeep: '#F5EBE0',
  bgOverlay: 'rgba(68, 64, 60, 0.4)',

  // Text - Warm brown
  textPrimary: '#44403C',
  textSecondary: '#78716C',
  textMuted: '#A8A29E',
  textOnAccent: '#FFFFFF',

  // Accent - Amber (candlelight)
  accent: '#F59E0B',
  accentHover: '#D97706',
  accentMuted: 'rgba(245, 158, 11, 0.15)',
  accentGlow: 'rgba(245, 158, 11, 0.4)',

  // Orb - Candlelight glow
  orbCore: '#FFFBEB',
  orbMid: '#FEF3C7',
  orbEdge: '#FCD34D',
  orbGlow: 'rgba(245, 158, 11, 0.35)',
  orbAtmosphere: 'rgba(245, 158, 11, 0.12)',

  // Stones
  stoneCompleted: '#78716C',
  stoneCompletedInner: '#A8A29E',
  stonePlanned: 'rgba(245, 158, 11, 0.2)',
  stonePlannedBorder: 'rgba(245, 158, 11, 0.5)',
  stoneEmpty: '#E7E5E4',
  stoneToday: '#D6D3D1',

  // Cards
  cardBg: '#FFFBF7',
  cardBorder: 'rgba(120, 113, 108, 0.1)',
  cardShadow: 'rgba(68, 64, 60, 0.06)',

  // Calendar
  calendarDayBg: '#FFFBF7',
  calendarDayText: '#78716C',
  calendarIntensity1: 'rgba(245, 158, 11, 0.15)',
  calendarIntensity2: 'rgba(245, 158, 11, 0.3)',
  calendarIntensity3: 'rgba(245, 158, 11, 0.5)',
  calendarIntensity4: 'rgba(245, 158, 11, 0.7)',

  // Progress
  progressTrack: '#E7E5E4',
  progressFill: '#F59E0B',
  progressGlow: 'rgba(245, 158, 11, 0.3)',

  // Interactive
  buttonPrimaryBg: '#F59E0B',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#F5EBE0',
  buttonSecondaryText: '#44403C',
  toggleOn: '#F59E0B',
  toggleOff: '#D6D3D1',
  toggleThumb: '#FFFFFF',

  // Borders
  border: 'rgba(120, 113, 108, 0.15)',
  borderSubtle: 'rgba(120, 113, 108, 0.08)',
  divider: 'rgba(120, 113, 108, 0.08)',

  // Shadows - Warm-tinted
  shadowColor: 'rgba(68, 64, 60, 0.08)',
  shadowElevation1: '0 1px 3px rgba(68, 64, 60, 0.06)',
  shadowElevation2: '0 4px 12px rgba(68, 64, 60, 0.08)',
  shadowElevation3: '0 8px 24px rgba(68, 64, 60, 0.1)',

  // Pearls
  pearlBg: '#FFFBF7',
  pearlShimmer: 'rgba(255, 251, 235, 0.7)',
  pearlOrb: '#F5EBE0',
  pearlOrbInner: '#E7E5E4',

  // Navigation
  navBg: 'rgba(253, 248, 243, 0.95)',
  navActive: '#44403C',
  navInactive: '#A8A29E',
  pullIndicator: '#F59E0B',

  // Meta
  isDark: false,
  seasonalAccent: '#F59E0B'
}

/**
 * Winter Night (9pm - 5am)
 * Mood: Clear winter night sky. Moonlight on snow. Deep stillness.
 * Light quality: Deep blue-black, silver moonlight accents
 */
const WINTER_NIGHT: ThemeTokens = {
  // Backgrounds - Deep blue-black
  bgBase: '#0F172A',
  bgElevated: '#1E293B',
  bgDeep: '#0D1321',
  bgOverlay: 'rgba(0, 0, 0, 0.6)',

  // Text - Silver, not pure white
  textPrimary: '#E2E8F0',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textOnAccent: '#0F172A',

  // Accent - Moonlight cyan
  accent: '#22D3EE',
  accentHover: '#06B6D4',
  accentMuted: 'rgba(34, 211, 238, 0.15)',
  accentGlow: 'rgba(34, 211, 238, 0.3)',

  // Orb - Moonlight on frost
  orbCore: '#E0F2FE',
  orbMid: '#7DD3FC',
  orbEdge: '#0EA5E9',
  orbGlow: 'rgba(34, 211, 238, 0.4)',
  orbAtmosphere: 'rgba(34, 211, 238, 0.15)',

  // Stones
  stoneCompleted: '#94A3B8',
  stoneCompletedInner: '#64748B',
  stonePlanned: 'rgba(34, 211, 238, 0.2)',
  stonePlannedBorder: 'rgba(34, 211, 238, 0.5)',
  stoneEmpty: '#334155',
  stoneToday: '#475569',

  // Cards
  cardBg: '#1E293B',
  cardBorder: 'rgba(148, 163, 184, 0.1)',
  cardShadow: 'rgba(0, 0, 0, 0.3)',

  // Calendar
  calendarDayBg: '#1E293B',
  calendarDayText: '#94A3B8',
  calendarIntensity1: 'rgba(34, 211, 238, 0.2)',
  calendarIntensity2: 'rgba(34, 211, 238, 0.35)',
  calendarIntensity3: 'rgba(34, 211, 238, 0.5)',
  calendarIntensity4: 'rgba(34, 211, 238, 0.7)',

  // Progress
  progressTrack: '#334155',
  progressFill: '#22D3EE',
  progressGlow: 'rgba(34, 211, 238, 0.3)',

  // Interactive
  buttonPrimaryBg: '#22D3EE',
  buttonPrimaryText: '#0F172A',
  buttonSecondaryBg: '#334155',
  buttonSecondaryText: '#E2E8F0',
  toggleOn: '#22D3EE',
  toggleOff: '#475569',
  toggleThumb: '#E2E8F0',

  // Borders
  border: 'rgba(148, 163, 184, 0.15)',
  borderSubtle: 'rgba(148, 163, 184, 0.08)',
  divider: 'rgba(148, 163, 184, 0.08)',

  // Shadows - Minimal, cool
  shadowColor: 'rgba(0, 0, 0, 0.4)',
  shadowElevation1: '0 1px 3px rgba(0, 0, 0, 0.3)',
  shadowElevation2: '0 4px 12px rgba(0, 0, 0, 0.4)',
  shadowElevation3: '0 8px 24px rgba(0, 0, 0, 0.5)',

  // Pearls
  pearlBg: '#1E293B',
  pearlShimmer: 'rgba(148, 163, 184, 0.2)',
  pearlOrb: '#334155',
  pearlOrbInner: '#475569',

  // Navigation
  navBg: 'rgba(15, 23, 42, 0.95)',
  navActive: '#E2E8F0',
  navInactive: '#64748B',
  pullIndicator: '#22D3EE',

  // Meta
  isDark: true,
  seasonalAccent: '#22D3EE'
}

// ============================================================================
// SPRING THEME DEFINITIONS
// Mood: Renewal, awakening, fresh starts, gentle growth
// Signature: Sage greens, morning mist, new growth, soft earth
// Gen 2: Natural observation palettes - no pink, verdant awakening
// ============================================================================

/**
 * Spring Morning (5am - 11am)
 * Mood: Morning mist lifting. Dew on grass. Earth awakening.
 * Light quality: Soft, diffused, gentle - like looking through gauze
 */
const SPRING_MORNING: ThemeTokens = {
  // Backgrounds - Oyster white, morning mist
  bgBase: '#F5F5F0',
  bgElevated: '#FAFAF7',
  bgDeep: '#ECEEE8',
  bgOverlay: 'rgba(74, 74, 64, 0.35)',

  // Text - Charcoal earth
  textPrimary: '#4A4A40',
  textSecondary: '#6B6B60',
  textMuted: '#8A8A80',
  textOnAccent: '#FFFFFF',

  // Accent - Sage green (new growth)
  accent: '#7C9A6E',
  accentHover: '#6B8B5E',
  accentMuted: 'rgba(124, 154, 110, 0.15)',
  accentGlow: 'rgba(124, 154, 110, 0.35)',

  // Orb - Parchment dawn
  orbCore: '#FAFAF7',
  orbMid: '#E8E4D9',
  orbEdge: '#D0CCC0',
  orbGlow: 'rgba(124, 154, 110, 0.3)',
  orbAtmosphere: 'rgba(124, 154, 110, 0.1)',

  // Stones - Earth tones
  stoneCompleted: '#6B6B60',
  stoneCompletedInner: '#8A8A80',
  stonePlanned: 'rgba(124, 154, 110, 0.2)',
  stonePlannedBorder: 'rgba(124, 154, 110, 0.5)',
  stoneEmpty: '#E8E8E0',
  stoneToday: '#D8D8D0',

  // Cards
  cardBg: '#FAFAF7',
  cardBorder: 'rgba(107, 107, 96, 0.1)',
  cardShadow: 'rgba(74, 74, 64, 0.06)',

  // Calendar
  calendarDayBg: '#FAFAF7',
  calendarDayText: '#6B6B60',
  calendarIntensity1: 'rgba(124, 154, 110, 0.15)',
  calendarIntensity2: 'rgba(124, 154, 110, 0.3)',
  calendarIntensity3: 'rgba(124, 154, 110, 0.5)',
  calendarIntensity4: 'rgba(124, 154, 110, 0.7)',

  // Progress
  progressTrack: '#ECEEE8',
  progressFill: '#7C9A6E',
  progressGlow: 'rgba(124, 154, 110, 0.3)',

  // Interactive
  buttonPrimaryBg: '#7C9A6E',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#ECEEE8',
  buttonSecondaryText: '#4A4A40',
  toggleOn: '#7C9A6E',
  toggleOff: '#D8D8D0',
  toggleThumb: '#FFFFFF',

  // Borders
  border: 'rgba(107, 107, 96, 0.15)',
  borderSubtle: 'rgba(107, 107, 96, 0.08)',
  divider: 'rgba(107, 107, 96, 0.08)',

  // Shadows - Neutral earth
  shadowColor: 'rgba(74, 74, 64, 0.08)',
  shadowElevation1: '0 1px 3px rgba(74, 74, 64, 0.06)',
  shadowElevation2: '0 4px 12px rgba(74, 74, 64, 0.08)',
  shadowElevation3: '0 8px 24px rgba(74, 74, 64, 0.1)',

  // Pearls
  pearlBg: '#FAFAF7',
  pearlShimmer: 'rgba(245, 245, 240, 0.8)',
  pearlOrb: '#ECEEE8',
  pearlOrbInner: '#E0E2DC',

  // Navigation
  navBg: 'rgba(245, 245, 240, 0.95)',
  navActive: '#4A4A40',
  navInactive: '#8A8A80',
  pullIndicator: '#7C9A6E',

  // Meta
  isDark: false,
  seasonalAccent: '#7C9A6E'
}

/**
 * Spring Daytime (11am - 5pm)
 * Mood: Bright spring day. Clear air. Fresh growth visible.
 * Light quality: Bright natural white, clean and alive
 */
const SPRING_DAYTIME: ThemeTokens = {
  // Backgrounds - Bright natural white
  bgBase: '#F8F9F4',
  bgElevated: '#FDFDF9',
  bgDeep: '#F0F2EB',
  bgOverlay: 'rgba(61, 74, 53, 0.35)',

  // Text - Forest floor
  textPrimary: '#3D4A35',
  textSecondary: '#5A6650',
  textMuted: '#7A8570',
  textOnAccent: '#FFFFFF',

  // Accent - Leaf green
  accent: '#6B8F5E',
  accentHover: '#5A7E4E',
  accentMuted: 'rgba(107, 143, 94, 0.15)',
  accentGlow: 'rgba(107, 143, 94, 0.35)',

  // Orb - Pale spring green
  orbCore: '#FDFDF9',
  orbMid: '#D4E7C5',
  orbEdge: '#B8D4A8',
  orbGlow: 'rgba(107, 143, 94, 0.3)',
  orbAtmosphere: 'rgba(107, 143, 94, 0.1)',

  // Stones
  stoneCompleted: '#5A6650',
  stoneCompletedInner: '#7A8570',
  stonePlanned: 'rgba(107, 143, 94, 0.2)',
  stonePlannedBorder: 'rgba(107, 143, 94, 0.5)',
  stoneEmpty: '#E8EBE0',
  stoneToday: '#D8DCD0',

  // Cards
  cardBg: '#FDFDF9',
  cardBorder: 'rgba(90, 102, 80, 0.1)',
  cardShadow: 'rgba(61, 74, 53, 0.06)',

  // Calendar
  calendarDayBg: '#FDFDF9',
  calendarDayText: '#5A6650',
  calendarIntensity1: 'rgba(107, 143, 94, 0.15)',
  calendarIntensity2: 'rgba(107, 143, 94, 0.35)',
  calendarIntensity3: 'rgba(107, 143, 94, 0.55)',
  calendarIntensity4: 'rgba(107, 143, 94, 0.75)',

  // Progress
  progressTrack: '#F0F2EB',
  progressFill: '#6B8F5E',
  progressGlow: 'rgba(107, 143, 94, 0.3)',

  // Interactive
  buttonPrimaryBg: '#6B8F5E',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#F0F2EB',
  buttonSecondaryText: '#3D4A35',
  toggleOn: '#6B8F5E',
  toggleOff: '#D8DCD0',
  toggleThumb: '#FFFFFF',

  // Borders
  border: 'rgba(90, 102, 80, 0.15)',
  borderSubtle: 'rgba(90, 102, 80, 0.08)',
  divider: 'rgba(90, 102, 80, 0.08)',

  // Shadows - Natural earth
  shadowColor: 'rgba(61, 74, 53, 0.08)',
  shadowElevation1: '0 1px 3px rgba(61, 74, 53, 0.06)',
  shadowElevation2: '0 4px 12px rgba(61, 74, 53, 0.08)',
  shadowElevation3: '0 8px 24px rgba(61, 74, 53, 0.1)',

  // Pearls
  pearlBg: '#FDFDF9',
  pearlShimmer: 'rgba(248, 249, 244, 0.8)',
  pearlOrb: '#F0F2EB',
  pearlOrbInner: '#E4E8DC',

  // Navigation
  navBg: 'rgba(248, 249, 244, 0.95)',
  navActive: '#3D4A35',
  navInactive: '#7A8570',
  pullIndicator: '#6B8F5E',

  // Meta
  isDark: false,
  seasonalAccent: '#6B8F5E'
}

/**
 * Spring Evening (5pm - 9pm)
 * Mood: Soft evening light. Day settling. Gentle warmth fading.
 * Light quality: Soft stone, driftwood, weathered tones
 */
const SPRING_EVENING: ThemeTokens = {
  // Backgrounds - Soft stone
  bgBase: '#EDE8E0',
  bgElevated: '#F5F2EC',
  bgDeep: '#E0DAD0',
  bgOverlay: 'rgba(77, 72, 64, 0.4)',

  // Text - Evening earth
  textPrimary: '#4D4840',
  textSecondary: '#6B6560',
  textMuted: '#8A8580',
  textOnAccent: '#FFFFFF',

  // Accent - Driftwood
  accent: '#8B7B6B',
  accentHover: '#7A6A5A',
  accentMuted: 'rgba(139, 123, 107, 0.15)',
  accentGlow: 'rgba(139, 123, 107, 0.35)',

  // Orb - Weathered wood
  orbCore: '#F5F2EC',
  orbMid: '#C9C4B8',
  orbEdge: '#B0A898',
  orbGlow: 'rgba(139, 123, 107, 0.3)',
  orbAtmosphere: 'rgba(139, 123, 107, 0.12)',

  // Stones
  stoneCompleted: '#6B6560',
  stoneCompletedInner: '#8A8580',
  stonePlanned: 'rgba(139, 123, 107, 0.2)',
  stonePlannedBorder: 'rgba(139, 123, 107, 0.5)',
  stoneEmpty: '#D8D4C8',
  stoneToday: '#C8C4B8',

  // Cards
  cardBg: '#F5F2EC',
  cardBorder: 'rgba(107, 101, 96, 0.12)',
  cardShadow: 'rgba(77, 72, 64, 0.06)',

  // Calendar
  calendarDayBg: '#F5F2EC',
  calendarDayText: '#6B6560',
  calendarIntensity1: 'rgba(139, 123, 107, 0.15)',
  calendarIntensity2: 'rgba(139, 123, 107, 0.3)',
  calendarIntensity3: 'rgba(139, 123, 107, 0.5)',
  calendarIntensity4: 'rgba(139, 123, 107, 0.7)',

  // Progress
  progressTrack: '#E0DAD0',
  progressFill: '#8B7B6B',
  progressGlow: 'rgba(139, 123, 107, 0.3)',

  // Interactive
  buttonPrimaryBg: '#8B7B6B',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#E0DAD0',
  buttonSecondaryText: '#4D4840',
  toggleOn: '#8B7B6B',
  toggleOff: '#C8C4B8',
  toggleThumb: '#FFFFFF',

  // Borders
  border: 'rgba(107, 101, 96, 0.15)',
  borderSubtle: 'rgba(107, 101, 96, 0.08)',
  divider: 'rgba(107, 101, 96, 0.08)',

  // Shadows - Warm earth
  shadowColor: 'rgba(77, 72, 64, 0.1)',
  shadowElevation1: '0 1px 3px rgba(77, 72, 64, 0.06)',
  shadowElevation2: '0 4px 12px rgba(77, 72, 64, 0.08)',
  shadowElevation3: '0 8px 24px rgba(77, 72, 64, 0.1)',

  // Pearls
  pearlBg: '#F5F2EC',
  pearlShimmer: 'rgba(237, 232, 224, 0.8)',
  pearlOrb: '#E0DAD0',
  pearlOrbInner: '#D0CAC0',

  // Navigation
  navBg: 'rgba(237, 232, 224, 0.95)',
  navActive: '#4D4840',
  navInactive: '#8A8580',
  pullIndicator: '#8B7B6B',

  // Meta
  isDark: false,
  seasonalAccent: '#8B7B6B'
}

/**
 * Spring Night (9pm - 5am)
 * Mood: Forest at night. Gentle darkness. Rain on leaves.
 * Light quality: Deep forest green-black, calm and grounding
 */
const SPRING_NIGHT: ThemeTokens = {
  // Backgrounds - Forest dark
  bgBase: '#1C1E1A',
  bgElevated: '#282B25',
  bgDeep: '#141612',
  bgOverlay: 'rgba(0, 0, 0, 0.6)',

  // Text - Pale lichen
  textPrimary: '#C5C9C0',
  textSecondary: '#9AA095',
  textMuted: '#707568',
  textOnAccent: '#1C1E1A',

  // Accent - Moonlit moss
  accent: '#6B7C5F',
  accentHover: '#5A6B4F',
  accentMuted: 'rgba(107, 124, 95, 0.2)',
  accentGlow: 'rgba(107, 124, 95, 0.35)',

  // Orb - Night leaves
  orbCore: '#D0D4C8',
  orbMid: '#6B7C5F',
  orbEdge: '#4A5240',
  orbGlow: 'rgba(107, 124, 95, 0.4)',
  orbAtmosphere: 'rgba(107, 124, 95, 0.15)',

  // Stones
  stoneCompleted: '#9AA095',
  stoneCompletedInner: '#707568',
  stonePlanned: 'rgba(107, 124, 95, 0.25)',
  stonePlannedBorder: 'rgba(107, 124, 95, 0.5)',
  stoneEmpty: '#353830',
  stoneToday: '#424540',

  // Cards
  cardBg: '#282B25',
  cardBorder: 'rgba(154, 160, 149, 0.1)',
  cardShadow: 'rgba(0, 0, 0, 0.3)',

  // Calendar
  calendarDayBg: '#282B25',
  calendarDayText: '#9AA095',
  calendarIntensity1: 'rgba(107, 124, 95, 0.2)',
  calendarIntensity2: 'rgba(107, 124, 95, 0.35)',
  calendarIntensity3: 'rgba(107, 124, 95, 0.5)',
  calendarIntensity4: 'rgba(107, 124, 95, 0.7)',

  // Progress
  progressTrack: '#353830',
  progressFill: '#6B7C5F',
  progressGlow: 'rgba(107, 124, 95, 0.3)',

  // Interactive
  buttonPrimaryBg: '#6B7C5F',
  buttonPrimaryText: '#F0F2EC',
  buttonSecondaryBg: '#353830',
  buttonSecondaryText: '#C5C9C0',
  toggleOn: '#6B7C5F',
  toggleOff: '#424540',
  toggleThumb: '#C5C9C0',

  // Borders
  border: 'rgba(154, 160, 149, 0.12)',
  borderSubtle: 'rgba(154, 160, 149, 0.06)',
  divider: 'rgba(154, 160, 149, 0.06)',

  // Shadows
  shadowColor: 'rgba(0, 0, 0, 0.4)',
  shadowElevation1: '0 1px 3px rgba(0, 0, 0, 0.3)',
  shadowElevation2: '0 4px 12px rgba(0, 0, 0, 0.4)',
  shadowElevation3: '0 8px 24px rgba(0, 0, 0, 0.5)',

  // Pearls
  pearlBg: '#282B25',
  pearlShimmer: 'rgba(154, 160, 149, 0.15)',
  pearlOrb: '#353830',
  pearlOrbInner: '#424540',

  // Navigation
  navBg: 'rgba(28, 30, 26, 0.95)',
  navActive: '#C5C9C0',
  navInactive: '#707568',
  pullIndicator: '#6B7C5F',

  // Meta
  isDark: true,
  seasonalAccent: '#6B7C5F'
}

// ============================================================================
// SUMMER THEME DEFINITIONS
// Mood: Abundance, vitality, peak energy, golden warmth
// Signature: Golden amber, warm orange, long golden hours
// ============================================================================

/**
 * Summer Morning (5am - 11am)
 * Mood: Golden sunrise. Warm and promising. Energy rising.
 * Light quality: Warm gold, soft orange, full of potential
 */
const SUMMER_MORNING: ThemeTokens = {
  // Backgrounds - Warm cream with golden tint
  bgBase: '#FFFBEB',
  bgElevated: '#FEFDF5',
  bgDeep: '#FEF3C7',
  bgOverlay: 'rgba(146, 64, 14, 0.35)',

  // Text - Warm brown
  textPrimary: '#451A03',
  textSecondary: '#78350F',
  textMuted: '#B45309',
  textOnAccent: '#FFFFFF',

  // Accent - Golden amber
  accent: '#F59E0B',
  accentHover: '#D97706',
  accentMuted: 'rgba(245, 158, 11, 0.15)',
  accentGlow: 'rgba(245, 158, 11, 0.4)',

  // Orb - Rising sun
  orbCore: '#FFFFFF',
  orbMid: '#FDE68A',
  orbEdge: '#FBBF24',
  orbGlow: 'rgba(251, 191, 36, 0.4)',
  orbAtmosphere: 'rgba(251, 191, 36, 0.15)',

  // Stones
  stoneCompleted: '#B45309',
  stoneCompletedInner: '#D97706',
  stonePlanned: 'rgba(245, 158, 11, 0.2)',
  stonePlannedBorder: 'rgba(245, 158, 11, 0.5)',
  stoneEmpty: '#FDE68A',
  stoneToday: '#FCD34D',

  // Cards
  cardBg: '#FEFDF5',
  cardBorder: 'rgba(120, 53, 15, 0.1)',
  cardShadow: 'rgba(146, 64, 14, 0.06)',

  // Calendar
  calendarDayBg: '#FEFDF5',
  calendarDayText: '#78350F',
  calendarIntensity1: 'rgba(245, 158, 11, 0.15)',
  calendarIntensity2: 'rgba(245, 158, 11, 0.35)',
  calendarIntensity3: 'rgba(245, 158, 11, 0.55)',
  calendarIntensity4: 'rgba(245, 158, 11, 0.75)',

  // Progress
  progressTrack: '#FEF3C7',
  progressFill: '#F59E0B',
  progressGlow: 'rgba(245, 158, 11, 0.3)',

  // Interactive
  buttonPrimaryBg: '#F59E0B',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#FEF3C7',
  buttonSecondaryText: '#451A03',
  toggleOn: '#F59E0B',
  toggleOff: '#FCD34D',
  toggleThumb: '#FFFFFF',

  // Borders
  border: 'rgba(120, 53, 15, 0.15)',
  borderSubtle: 'rgba(120, 53, 15, 0.08)',
  divider: 'rgba(120, 53, 15, 0.08)',

  // Shadows - Warm-tinted
  shadowColor: 'rgba(146, 64, 14, 0.08)',
  shadowElevation1: '0 1px 3px rgba(146, 64, 14, 0.06)',
  shadowElevation2: '0 4px 12px rgba(146, 64, 14, 0.08)',
  shadowElevation3: '0 8px 24px rgba(146, 64, 14, 0.1)',

  // Pearls
  pearlBg: '#FEFDF5',
  pearlShimmer: 'rgba(255, 251, 235, 0.8)',
  pearlOrb: '#FEF3C7',
  pearlOrbInner: '#FDE68A',

  // Navigation
  navBg: 'rgba(255, 251, 235, 0.95)',
  navActive: '#451A03',
  navInactive: '#B45309',
  pullIndicator: '#F59E0B',

  // Meta
  isDark: false,
  seasonalAccent: '#F59E0B'
}

/**
 * Summer Daytime (11am - 5pm)
 * Mood: Peak sun. Vibrant. High energy. Bright and alive.
 * Light quality: Bright, warm white, high contrast, energizing
 */
const SUMMER_DAYTIME: ThemeTokens = {
  // Backgrounds - Bright, warm white
  bgBase: '#FFFDF7',
  bgElevated: '#FFFFFF',
  bgDeep: '#FFF7ED',
  bgOverlay: 'rgba(154, 52, 18, 0.4)',

  // Text - Rich warm tones
  textPrimary: '#431407',
  textSecondary: '#7C2D12',
  textMuted: '#C2410C',
  textOnAccent: '#FFFFFF',

  // Accent - Vibrant orange
  accent: '#EA580C',
  accentHover: '#C2410C',
  accentMuted: 'rgba(234, 88, 12, 0.12)',
  accentGlow: 'rgba(234, 88, 12, 0.35)',

  // Orb - Midday sun
  orbCore: '#FFFFFF',
  orbMid: '#FFEDD5',
  orbEdge: '#FDBA74',
  orbGlow: 'rgba(251, 146, 60, 0.35)',
  orbAtmosphere: 'rgba(251, 146, 60, 0.1)',

  // Stones
  stoneCompleted: '#9A3412',
  stoneCompletedInner: '#C2410C',
  stonePlanned: 'rgba(234, 88, 12, 0.2)',
  stonePlannedBorder: 'rgba(234, 88, 12, 0.5)',
  stoneEmpty: '#FFEDD5',
  stoneToday: '#FED7AA',

  // Cards
  cardBg: '#FFFFFF',
  cardBorder: 'rgba(124, 45, 18, 0.08)',
  cardShadow: 'rgba(154, 52, 18, 0.06)',

  // Calendar
  calendarDayBg: '#FFFFFF',
  calendarDayText: '#7C2D12',
  calendarIntensity1: 'rgba(234, 88, 12, 0.15)',
  calendarIntensity2: 'rgba(234, 88, 12, 0.35)',
  calendarIntensity3: 'rgba(234, 88, 12, 0.55)',
  calendarIntensity4: 'rgba(234, 88, 12, 0.75)',

  // Progress
  progressTrack: '#FFEDD5',
  progressFill: '#EA580C',
  progressGlow: 'rgba(234, 88, 12, 0.3)',

  // Interactive
  buttonPrimaryBg: '#EA580C',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#FFF7ED',
  buttonSecondaryText: '#431407',
  toggleOn: '#EA580C',
  toggleOff: '#FED7AA',
  toggleThumb: '#FFFFFF',

  // Borders
  border: 'rgba(124, 45, 18, 0.15)',
  borderSubtle: 'rgba(124, 45, 18, 0.08)',
  divider: 'rgba(124, 45, 18, 0.08)',

  // Shadows - Warm orange-tinted
  shadowColor: 'rgba(154, 52, 18, 0.08)',
  shadowElevation1: '0 1px 3px rgba(154, 52, 18, 0.06)',
  shadowElevation2: '0 4px 12px rgba(154, 52, 18, 0.08)',
  shadowElevation3: '0 8px 24px rgba(154, 52, 18, 0.1)',

  // Pearls
  pearlBg: '#FFFFFF',
  pearlShimmer: 'rgba(255, 247, 237, 0.8)',
  pearlOrb: '#FFEDD5',
  pearlOrbInner: '#FED7AA',

  // Navigation
  navBg: 'rgba(255, 253, 247, 0.95)',
  navActive: '#431407',
  navInactive: '#C2410C',
  pullIndicator: '#EA580C',

  // Meta
  isDark: false,
  seasonalAccent: '#EA580C'
}

/**
 * Summer Evening (5pm - 9pm)
 * Mood: Long golden hour. Everything bathed in amber. Magic hour.
 * Light quality: Deep golden, rich amber, dramatic and beautiful
 */
const SUMMER_EVENING: ThemeTokens = {
  // Backgrounds - Rich amber cream
  bgBase: '#FEF7E8',
  bgElevated: '#FFFAF0',
  bgDeep: '#FEECC8',
  bgOverlay: 'rgba(120, 53, 15, 0.4)',

  // Text - Deep warm brown
  textPrimary: '#3D1C0A',
  textSecondary: '#6B3410',
  textMuted: '#A36220',
  textOnAccent: '#FFFFFF',

  // Accent - Deep amber/gold
  accent: '#D97706',
  accentHover: '#B45309',
  accentMuted: 'rgba(217, 119, 6, 0.15)',
  accentGlow: 'rgba(217, 119, 6, 0.45)',

  // Orb - Setting sun
  orbCore: '#FFF8E7',
  orbMid: '#FBBF24',
  orbEdge: '#F59E0B',
  orbGlow: 'rgba(245, 158, 11, 0.5)',
  orbAtmosphere: 'rgba(245, 158, 11, 0.18)',

  // Stones
  stoneCompleted: '#92400E',
  stoneCompletedInner: '#B45309',
  stonePlanned: 'rgba(217, 119, 6, 0.2)',
  stonePlannedBorder: 'rgba(217, 119, 6, 0.5)',
  stoneEmpty: '#FDE68A',
  stoneToday: '#FCD34D',

  // Cards
  cardBg: '#FFFAF0',
  cardBorder: 'rgba(107, 52, 16, 0.12)',
  cardShadow: 'rgba(120, 53, 15, 0.08)',

  // Calendar
  calendarDayBg: '#FFFAF0',
  calendarDayText: '#6B3410',
  calendarIntensity1: 'rgba(217, 119, 6, 0.15)',
  calendarIntensity2: 'rgba(217, 119, 6, 0.35)',
  calendarIntensity3: 'rgba(217, 119, 6, 0.55)',
  calendarIntensity4: 'rgba(217, 119, 6, 0.75)',

  // Progress
  progressTrack: '#FEECC8',
  progressFill: '#D97706',
  progressGlow: 'rgba(217, 119, 6, 0.35)',

  // Interactive
  buttonPrimaryBg: '#D97706',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#FEECC8',
  buttonSecondaryText: '#3D1C0A',
  toggleOn: '#D97706',
  toggleOff: '#FCD34D',
  toggleThumb: '#FFFFFF',

  // Borders
  border: 'rgba(107, 52, 16, 0.18)',
  borderSubtle: 'rgba(107, 52, 16, 0.1)',
  divider: 'rgba(107, 52, 16, 0.1)',

  // Shadows - Deep amber-tinted
  shadowColor: 'rgba(120, 53, 15, 0.1)',
  shadowElevation1: '0 1px 3px rgba(120, 53, 15, 0.08)',
  shadowElevation2: '0 4px 12px rgba(120, 53, 15, 0.1)',
  shadowElevation3: '0 8px 24px rgba(120, 53, 15, 0.12)',

  // Pearls
  pearlBg: '#FFFAF0',
  pearlShimmer: 'rgba(254, 243, 199, 0.8)',
  pearlOrb: '#FEECC8',
  pearlOrbInner: '#FDE68A',

  // Navigation
  navBg: 'rgba(254, 247, 232, 0.95)',
  navActive: '#3D1C0A',
  navInactive: '#A36220',
  pullIndicator: '#D97706',

  // Meta
  isDark: false,
  seasonalAccent: '#D97706'
}

/**
 * Summer Night (9pm - 5am)
 * Mood: Warm summer night. Fireflies. Stars through warm air.
 * Light quality: Deep warm indigo, amber accents, magical
 */
const SUMMER_NIGHT: ThemeTokens = {
  // Backgrounds - Warm indigo-brown
  bgBase: '#1C1917',
  bgElevated: '#292524',
  bgDeep: '#0F0D0C',
  bgOverlay: 'rgba(0, 0, 0, 0.6)',

  // Text - Warm cream
  textPrimary: '#F5F5F4',
  textSecondary: '#D6D3D1',
  textMuted: '#A8A29E',
  textOnAccent: '#1C1917',

  // Accent - Firefly amber
  accent: '#FBBF24',
  accentHover: '#F59E0B',
  accentMuted: 'rgba(251, 191, 36, 0.15)',
  accentGlow: 'rgba(251, 191, 36, 0.35)',

  // Orb - Lantern glow
  orbCore: '#FFFBEB',
  orbMid: '#FDE68A',
  orbEdge: '#FBBF24',
  orbGlow: 'rgba(251, 191, 36, 0.45)',
  orbAtmosphere: 'rgba(251, 191, 36, 0.18)',

  // Stones
  stoneCompleted: '#D6D3D1',
  stoneCompletedInner: '#A8A29E',
  stonePlanned: 'rgba(251, 191, 36, 0.2)',
  stonePlannedBorder: 'rgba(251, 191, 36, 0.5)',
  stoneEmpty: '#44403C',
  stoneToday: '#57534E',

  // Cards
  cardBg: '#292524',
  cardBorder: 'rgba(214, 211, 209, 0.1)',
  cardShadow: 'rgba(0, 0, 0, 0.3)',

  // Calendar
  calendarDayBg: '#292524',
  calendarDayText: '#D6D3D1',
  calendarIntensity1: 'rgba(251, 191, 36, 0.2)',
  calendarIntensity2: 'rgba(251, 191, 36, 0.35)',
  calendarIntensity3: 'rgba(251, 191, 36, 0.5)',
  calendarIntensity4: 'rgba(251, 191, 36, 0.7)',

  // Progress
  progressTrack: '#44403C',
  progressFill: '#FBBF24',
  progressGlow: 'rgba(251, 191, 36, 0.3)',

  // Interactive
  buttonPrimaryBg: '#FBBF24',
  buttonPrimaryText: '#1C1917',
  buttonSecondaryBg: '#44403C',
  buttonSecondaryText: '#F5F5F4',
  toggleOn: '#FBBF24',
  toggleOff: '#57534E',
  toggleThumb: '#F5F5F4',

  // Borders
  border: 'rgba(214, 211, 209, 0.15)',
  borderSubtle: 'rgba(214, 211, 209, 0.08)',
  divider: 'rgba(214, 211, 209, 0.08)',

  // Shadows
  shadowColor: 'rgba(0, 0, 0, 0.4)',
  shadowElevation1: '0 1px 3px rgba(0, 0, 0, 0.3)',
  shadowElevation2: '0 4px 12px rgba(0, 0, 0, 0.4)',
  shadowElevation3: '0 8px 24px rgba(0, 0, 0, 0.5)',

  // Pearls
  pearlBg: '#292524',
  pearlShimmer: 'rgba(214, 211, 209, 0.2)',
  pearlOrb: '#44403C',
  pearlOrbInner: '#57534E',

  // Navigation
  navBg: 'rgba(28, 25, 23, 0.95)',
  navActive: '#F5F5F4',
  navInactive: '#A8A29E',
  pullIndicator: '#FBBF24',

  // Meta
  isDark: true,
  seasonalAccent: '#FBBF24'
}

// ============================================================================
// AUTUMN THEME DEFINITIONS
// Mood: Harvest, letting go, gratitude, gentle release
// Signature: Burnt orange, copper, burgundy, harvest gold
// ============================================================================

/**
 * Autumn Morning (5am - 11am)
 * Mood: Misty morning. Golden fog. Crisp air. Peaceful.
 * Light quality: Soft amber through mist, gentle and contemplative
 */
const AUTUMN_MORNING: ThemeTokens = {
  // Backgrounds - Soft misty cream
  bgBase: '#FAF7F2',
  bgElevated: '#FDFBF7',
  bgDeep: '#F5EDE0',
  bgOverlay: 'rgba(120, 53, 15, 0.35)',

  // Text - Warm earth tones
  textPrimary: '#422006',
  textSecondary: '#713F12',
  textMuted: '#A16207',
  textOnAccent: '#FFFFFF',

  // Accent - Soft copper
  accent: '#CA8A04',
  accentHover: '#A16207',
  accentMuted: 'rgba(202, 138, 4, 0.15)',
  accentGlow: 'rgba(202, 138, 4, 0.4)',

  // Orb - Sun through fog
  orbCore: '#FFFEF5',
  orbMid: '#FEF9C3',
  orbEdge: '#EAB308',
  orbGlow: 'rgba(234, 179, 8, 0.35)',
  orbAtmosphere: 'rgba(234, 179, 8, 0.12)',

  // Stones
  stoneCompleted: '#854D0E',
  stoneCompletedInner: '#A16207',
  stonePlanned: 'rgba(202, 138, 4, 0.2)',
  stonePlannedBorder: 'rgba(202, 138, 4, 0.5)',
  stoneEmpty: '#F5EDE0',
  stoneToday: '#EDE4D3',

  // Cards
  cardBg: '#FDFBF7',
  cardBorder: 'rgba(113, 63, 18, 0.1)',
  cardShadow: 'rgba(120, 53, 15, 0.06)',

  // Calendar
  calendarDayBg: '#FDFBF7',
  calendarDayText: '#713F12',
  calendarIntensity1: 'rgba(202, 138, 4, 0.15)',
  calendarIntensity2: 'rgba(202, 138, 4, 0.35)',
  calendarIntensity3: 'rgba(202, 138, 4, 0.55)',
  calendarIntensity4: 'rgba(202, 138, 4, 0.75)',

  // Progress
  progressTrack: '#F5EDE0',
  progressFill: '#CA8A04',
  progressGlow: 'rgba(202, 138, 4, 0.3)',

  // Interactive
  buttonPrimaryBg: '#CA8A04',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#F5EDE0',
  buttonSecondaryText: '#422006',
  toggleOn: '#CA8A04',
  toggleOff: '#EDE4D3',
  toggleThumb: '#FFFFFF',

  // Borders
  border: 'rgba(113, 63, 18, 0.15)',
  borderSubtle: 'rgba(113, 63, 18, 0.08)',
  divider: 'rgba(113, 63, 18, 0.08)',

  // Shadows - Warm earth-tinted
  shadowColor: 'rgba(120, 53, 15, 0.08)',
  shadowElevation1: '0 1px 3px rgba(120, 53, 15, 0.06)',
  shadowElevation2: '0 4px 12px rgba(120, 53, 15, 0.08)',
  shadowElevation3: '0 8px 24px rgba(120, 53, 15, 0.1)',

  // Pearls
  pearlBg: '#FDFBF7',
  pearlShimmer: 'rgba(250, 247, 242, 0.8)',
  pearlOrb: '#F5EDE0',
  pearlOrbInner: '#EDE4D3',

  // Navigation
  navBg: 'rgba(250, 247, 242, 0.95)',
  navActive: '#422006',
  navInactive: '#A16207',
  pullIndicator: '#CA8A04',

  // Meta
  isDark: false,
  seasonalAccent: '#CA8A04'
}

/**
 * Autumn Daytime (11am - 5pm)
 * Mood: Crisp autumn day. Clear blue sky. Leaves turning. Invigorating.
 * Light quality: Clear, high contrast, amber-tinted
 */
const AUTUMN_DAYTIME: ThemeTokens = {
  // Backgrounds - Crisp cream
  bgBase: '#FBF8F3',
  bgElevated: '#FFFFFF',
  bgDeep: '#F3EDE3',
  bgOverlay: 'rgba(124, 45, 18, 0.4)',

  // Text - Rich earth
  textPrimary: '#431407',
  textSecondary: '#7C2D12',
  textMuted: '#B45309',
  textOnAccent: '#FFFFFF',

  // Accent - Burnt orange
  accent: '#C2410C',
  accentHover: '#9A3412',
  accentMuted: 'rgba(194, 65, 12, 0.12)',
  accentGlow: 'rgba(194, 65, 12, 0.35)',

  // Orb - Autumn sun
  orbCore: '#FFFFFF',
  orbMid: '#FED7AA',
  orbEdge: '#FB923C',
  orbGlow: 'rgba(251, 146, 60, 0.3)',
  orbAtmosphere: 'rgba(251, 146, 60, 0.1)',

  // Stones
  stoneCompleted: '#9A3412',
  stoneCompletedInner: '#C2410C',
  stonePlanned: 'rgba(194, 65, 12, 0.2)',
  stonePlannedBorder: 'rgba(194, 65, 12, 0.5)',
  stoneEmpty: '#F3EDE3',
  stoneToday: '#E8DFD0',

  // Cards
  cardBg: '#FFFFFF',
  cardBorder: 'rgba(124, 45, 18, 0.08)',
  cardShadow: 'rgba(124, 45, 18, 0.06)',

  // Calendar
  calendarDayBg: '#FFFFFF',
  calendarDayText: '#7C2D12',
  calendarIntensity1: 'rgba(194, 65, 12, 0.15)',
  calendarIntensity2: 'rgba(194, 65, 12, 0.35)',
  calendarIntensity3: 'rgba(194, 65, 12, 0.55)',
  calendarIntensity4: 'rgba(194, 65, 12, 0.75)',

  // Progress
  progressTrack: '#F3EDE3',
  progressFill: '#C2410C',
  progressGlow: 'rgba(194, 65, 12, 0.3)',

  // Interactive
  buttonPrimaryBg: '#C2410C',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#F3EDE3',
  buttonSecondaryText: '#431407',
  toggleOn: '#C2410C',
  toggleOff: '#E8DFD0',
  toggleThumb: '#FFFFFF',

  // Borders
  border: 'rgba(124, 45, 18, 0.15)',
  borderSubtle: 'rgba(124, 45, 18, 0.08)',
  divider: 'rgba(124, 45, 18, 0.08)',

  // Shadows
  shadowColor: 'rgba(124, 45, 18, 0.08)',
  shadowElevation1: '0 1px 3px rgba(124, 45, 18, 0.06)',
  shadowElevation2: '0 4px 12px rgba(124, 45, 18, 0.08)',
  shadowElevation3: '0 8px 24px rgba(124, 45, 18, 0.1)',

  // Pearls
  pearlBg: '#FFFFFF',
  pearlShimmer: 'rgba(251, 248, 243, 0.8)',
  pearlOrb: '#F3EDE3',
  pearlOrbInner: '#E8DFD0',

  // Navigation
  navBg: 'rgba(251, 248, 243, 0.95)',
  navActive: '#431407',
  navInactive: '#B45309',
  pullIndicator: '#C2410C',

  // Meta
  isDark: false,
  seasonalAccent: '#C2410C'
}

/**
 * Autumn Evening (5pm - 9pm)
 * Mood: Golden hour. Harvest moon rising. Deep gratitude. Letting go.
 * Light quality: Deep copper, rich amber, dramatic and warm
 */
const AUTUMN_EVENING: ThemeTokens = {
  // Backgrounds - Rich warm cream
  bgBase: '#FDF4E8',
  bgElevated: '#FFF8F0',
  bgDeep: '#F5E6D3',
  bgOverlay: 'rgba(113, 63, 18, 0.4)',

  // Text - Deep earth
  textPrimary: '#3C1A05',
  textSecondary: '#5C2A0E',
  textMuted: '#92400E',
  textOnAccent: '#FFFFFF',

  // Accent - Deep copper
  accent: '#B45309',
  accentHover: '#92400E',
  accentMuted: 'rgba(180, 83, 9, 0.15)',
  accentGlow: 'rgba(180, 83, 9, 0.45)',

  // Orb - Harvest moon
  orbCore: '#FFF8E7',
  orbMid: '#FCD34D',
  orbEdge: '#F59E0B',
  orbGlow: 'rgba(245, 158, 11, 0.5)',
  orbAtmosphere: 'rgba(245, 158, 11, 0.18)',

  // Stones
  stoneCompleted: '#78350F',
  stoneCompletedInner: '#92400E',
  stonePlanned: 'rgba(180, 83, 9, 0.2)',
  stonePlannedBorder: 'rgba(180, 83, 9, 0.5)',
  stoneEmpty: '#F5E6D3',
  stoneToday: '#EDD9C0',

  // Cards
  cardBg: '#FFF8F0',
  cardBorder: 'rgba(92, 42, 14, 0.12)',
  cardShadow: 'rgba(113, 63, 18, 0.08)',

  // Calendar
  calendarDayBg: '#FFF8F0',
  calendarDayText: '#5C2A0E',
  calendarIntensity1: 'rgba(180, 83, 9, 0.15)',
  calendarIntensity2: 'rgba(180, 83, 9, 0.35)',
  calendarIntensity3: 'rgba(180, 83, 9, 0.55)',
  calendarIntensity4: 'rgba(180, 83, 9, 0.75)',

  // Progress
  progressTrack: '#F5E6D3',
  progressFill: '#B45309',
  progressGlow: 'rgba(180, 83, 9, 0.35)',

  // Interactive
  buttonPrimaryBg: '#B45309',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#F5E6D3',
  buttonSecondaryText: '#3C1A05',
  toggleOn: '#B45309',
  toggleOff: '#EDD9C0',
  toggleThumb: '#FFFFFF',

  // Borders
  border: 'rgba(92, 42, 14, 0.18)',
  borderSubtle: 'rgba(92, 42, 14, 0.1)',
  divider: 'rgba(92, 42, 14, 0.1)',

  // Shadows - Deep warm
  shadowColor: 'rgba(113, 63, 18, 0.1)',
  shadowElevation1: '0 1px 3px rgba(113, 63, 18, 0.08)',
  shadowElevation2: '0 4px 12px rgba(113, 63, 18, 0.1)',
  shadowElevation3: '0 8px 24px rgba(113, 63, 18, 0.12)',

  // Pearls
  pearlBg: '#FFF8F0',
  pearlShimmer: 'rgba(253, 244, 232, 0.8)',
  pearlOrb: '#F5E6D3',
  pearlOrbInner: '#EDD9C0',

  // Navigation
  navBg: 'rgba(253, 244, 232, 0.95)',
  navActive: '#3C1A05',
  navInactive: '#92400E',
  pullIndicator: '#B45309',

  // Meta
  isDark: false,
  seasonalAccent: '#B45309'
}

/**
 * Autumn Night (9pm - 5am)
 * Mood: Deep rest. Harvest complete. Warm blankets. Woodsmoke.
 * Light quality: Rich burgundy-brown, warm and cozy darkness
 */
const AUTUMN_NIGHT: ThemeTokens = {
  // Backgrounds - Deep warm brown
  bgBase: '#1A1412',
  bgElevated: '#261E1A',
  bgDeep: '#0F0B09',
  bgOverlay: 'rgba(0, 0, 0, 0.6)',

  // Text - Warm cream
  textPrimary: '#F5E6D8',
  textSecondary: '#D4BEA8',
  textMuted: '#A68B70',
  textOnAccent: '#1A1412',

  // Accent - Warm amber
  accent: '#F59E0B',
  accentHover: '#D97706',
  accentMuted: 'rgba(245, 158, 11, 0.15)',
  accentGlow: 'rgba(245, 158, 11, 0.35)',

  // Orb - Ember glow
  orbCore: '#FEF3C7',
  orbMid: '#FBBF24',
  orbEdge: '#D97706',
  orbGlow: 'rgba(217, 119, 6, 0.45)',
  orbAtmosphere: 'rgba(217, 119, 6, 0.18)',

  // Stones
  stoneCompleted: '#D4BEA8',
  stoneCompletedInner: '#A68B70',
  stonePlanned: 'rgba(245, 158, 11, 0.2)',
  stonePlannedBorder: 'rgba(245, 158, 11, 0.5)',
  stoneEmpty: '#3D3230',
  stoneToday: '#524540',

  // Cards
  cardBg: '#261E1A',
  cardBorder: 'rgba(212, 190, 168, 0.1)',
  cardShadow: 'rgba(0, 0, 0, 0.3)',

  // Calendar
  calendarDayBg: '#261E1A',
  calendarDayText: '#D4BEA8',
  calendarIntensity1: 'rgba(245, 158, 11, 0.2)',
  calendarIntensity2: 'rgba(245, 158, 11, 0.35)',
  calendarIntensity3: 'rgba(245, 158, 11, 0.5)',
  calendarIntensity4: 'rgba(245, 158, 11, 0.7)',

  // Progress
  progressTrack: '#3D3230',
  progressFill: '#F59E0B',
  progressGlow: 'rgba(245, 158, 11, 0.3)',

  // Interactive
  buttonPrimaryBg: '#F59E0B',
  buttonPrimaryText: '#1A1412',
  buttonSecondaryBg: '#3D3230',
  buttonSecondaryText: '#F5E6D8',
  toggleOn: '#F59E0B',
  toggleOff: '#524540',
  toggleThumb: '#F5E6D8',

  // Borders
  border: 'rgba(212, 190, 168, 0.15)',
  borderSubtle: 'rgba(212, 190, 168, 0.08)',
  divider: 'rgba(212, 190, 168, 0.08)',

  // Shadows
  shadowColor: 'rgba(0, 0, 0, 0.4)',
  shadowElevation1: '0 1px 3px rgba(0, 0, 0, 0.3)',
  shadowElevation2: '0 4px 12px rgba(0, 0, 0, 0.4)',
  shadowElevation3: '0 8px 24px rgba(0, 0, 0, 0.5)',

  // Pearls
  pearlBg: '#261E1A',
  pearlShimmer: 'rgba(212, 190, 168, 0.2)',
  pearlOrb: '#3D3230',
  pearlOrbInner: '#524540',

  // Navigation
  navBg: 'rgba(26, 20, 18, 0.95)',
  navActive: '#F5E6D8',
  navInactive: '#A68B70',
  pullIndicator: '#F59E0B',

  // Meta
  isDark: true,
  seasonalAccent: '#F59E0B'
}

// ============================================================================
// THEME TABLES
// ============================================================================

/**
 * Winter theme lookup table
 */
const WINTER_THEMES: Record<TimeOfDay, ThemeTokens> = {
  morning: WINTER_MORNING,
  daytime: WINTER_DAYTIME,
  evening: WINTER_EVENING,
  night: WINTER_NIGHT
}

/**
 * Spring theme lookup table
 */
const SPRING_THEMES: Record<TimeOfDay, ThemeTokens> = {
  morning: SPRING_MORNING,
  daytime: SPRING_DAYTIME,
  evening: SPRING_EVENING,
  night: SPRING_NIGHT
}

/**
 * Summer theme lookup table
 */
const SUMMER_THEMES: Record<TimeOfDay, ThemeTokens> = {
  morning: SUMMER_MORNING,
  daytime: SUMMER_DAYTIME,
  evening: SUMMER_EVENING,
  night: SUMMER_NIGHT
}

/**
 * Autumn theme lookup table
 */
const AUTUMN_THEMES: Record<TimeOfDay, ThemeTokens> = {
  morning: AUTUMN_MORNING,
  daytime: AUTUMN_DAYTIME,
  evening: AUTUMN_EVENING,
  night: AUTUMN_NIGHT
}

/**
 * All seasons theme table - FULLY DEFINED
 */
const SEASON_THEMES: Record<Season, Record<TimeOfDay, ThemeTokens>> = {
  winter: WINTER_THEMES,
  spring: SPRING_THEMES,
  summer: SUMMER_THEMES,
  autumn: AUTUMN_THEMES
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get theme tokens for a specific time and season
 */
export function getThemeTokens(
  timeOfDay: TimeOfDay = getTimeOfDay(),
  season: Season = getSeason()
): ThemeTokens {
  return SEASON_THEMES[season][timeOfDay]
}

/**
 * Calculate current theme based on time and location
 */
export function calculateTheme(
  timeOfDay: TimeOfDay = getTimeOfDay(),
  season: Season = getSeason()
): ThemeTokens {
  return getThemeTokens(timeOfDay, season)
}

/**
 * Convert theme tokens to CSS custom properties
 */
export function themeToCSSProperties(tokens: ThemeTokens): Record<string, string> {
  return {
    // Backgrounds
    '--bg-base': tokens.bgBase,
    '--bg-elevated': tokens.bgElevated,
    '--bg-deep': tokens.bgDeep,
    '--bg-overlay': tokens.bgOverlay,

    // Legacy aliases for backward compatibility
    '--bg-warm': tokens.bgElevated,

    // Text
    '--text-primary': tokens.textPrimary,
    '--text-secondary': tokens.textSecondary,
    '--text-muted': tokens.textMuted,
    '--text-on-accent': tokens.textOnAccent,

    // Accent
    '--accent': tokens.accent,
    '--accent-hover': tokens.accentHover,
    '--accent-muted': tokens.accentMuted,
    '--accent-glow': tokens.accentGlow,

    // Legacy alias
    '--accent-warm': tokens.accentHover,

    // Orb
    '--orb-core': tokens.orbCore,
    '--orb-mid': tokens.orbMid,
    '--orb-edge': tokens.orbEdge,
    '--orb-glow': tokens.orbGlow,
    '--orb-atmosphere': tokens.orbAtmosphere,

    // Legacy orb aliases
    '--orb-primary': tokens.orbEdge,
    '--orb-secondary': tokens.orbGlow,

    // Stones
    '--stone-completed': tokens.stoneCompleted,
    '--stone-completed-inner': tokens.stoneCompletedInner,
    '--stone-planned': tokens.stonePlanned,
    '--stone-planned-border': tokens.stonePlannedBorder,
    '--stone-empty': tokens.stoneEmpty,
    '--stone-today': tokens.stoneToday,

    // Cards
    '--card-bg': tokens.cardBg,
    '--card-border': tokens.cardBorder,
    '--card-shadow': tokens.cardShadow,

    // Calendar
    '--calendar-day-bg': tokens.calendarDayBg,
    '--calendar-day-text': tokens.calendarDayText,
    '--calendar-intensity-1': tokens.calendarIntensity1,
    '--calendar-intensity-2': tokens.calendarIntensity2,
    '--calendar-intensity-3': tokens.calendarIntensity3,
    '--calendar-intensity-4': tokens.calendarIntensity4,

    // Progress
    '--progress-track': tokens.progressTrack,
    '--progress-fill': tokens.progressFill,
    '--progress-glow': tokens.progressGlow,

    // Interactive
    '--button-primary-bg': tokens.buttonPrimaryBg,
    '--button-primary-text': tokens.buttonPrimaryText,
    '--button-secondary-bg': tokens.buttonSecondaryBg,
    '--button-secondary-text': tokens.buttonSecondaryText,
    '--toggle-on': tokens.toggleOn,
    '--toggle-off': tokens.toggleOff,
    '--toggle-thumb': tokens.toggleThumb,

    // Borders
    '--border': tokens.border,
    '--border-subtle': tokens.borderSubtle,
    '--divider': tokens.divider,

    // Shadows
    '--shadow-color': tokens.shadowColor,
    '--shadow-elevation-1': tokens.shadowElevation1,
    '--shadow-elevation-2': tokens.shadowElevation2,
    '--shadow-elevation-3': tokens.shadowElevation3,

    // Pearls
    '--pearl-bg': tokens.pearlBg,
    '--pearl-shimmer': tokens.pearlShimmer,
    '--pearl-orb': tokens.pearlOrb,
    '--pearl-orb-inner': tokens.pearlOrbInner,

    // Navigation
    '--nav-bg': tokens.navBg,
    '--nav-active': tokens.navActive,
    '--nav-inactive': tokens.navInactive,
    '--pull-indicator': tokens.pullIndicator,

    // Seasonal accent
    '--seasonal-accent': tokens.seasonalAccent
  }
}

/**
 * Get theme name for display
 */
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
  return `${seasonNames[season]} ${timeNames[timeOfDay]}`
}

/**
 * Check if currently in a transition period - SEASON-AWARE
 * Returns true within 30 minutes of any boundary
 */
export function isTransitionPeriod(date: Date = new Date(), season?: Season): boolean {
  const hour = date.getHours()
  const minute = date.getMinutes()
  const totalMinutes = hour * 60 + minute

  const currentSeason = season ?? getSeason(date)
  const bounds = SEASONAL_TIME_BOUNDARIES[currentSeason]

  // Convert boundaries to minutes (handling decimal hours)
  const boundaries = [
    bounds.morning.start * 60,
    bounds.daytime.start * 60,
    bounds.evening.start * 60,
    bounds.night.start * 60
  ]

  // Check if within 30 minutes of any boundary
  return boundaries.some(b => {
    const diff = Math.abs(totalMinutes - b)
    // Handle midnight wraparound
    const wrappedDiff = Math.min(diff, 24 * 60 - diff)
    return wrappedDiff <= 30
  })
}

// ============================================================================
// COLOR INTERPOLATION FOR SMOOTH TRANSITIONS
// ============================================================================

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * Parse rgba string to components
 */
function parseRgba(rgba: string): { r: number; g: number; b: number; a: number } | null {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] ? parseFloat(match[4]) : 1
    }
  }
  return null
}

/**
 * Interpolate between two colors (hex or rgba)
 */
function interpolateColor(color1: string, color2: string, t: number): string {
  // Handle hex colors
  const hex1 = hexToRgb(color1)
  const hex2 = hexToRgb(color2)
  if (hex1 && hex2) {
    const r = hex1.r + (hex2.r - hex1.r) * t
    const g = hex1.g + (hex2.g - hex1.g) * t
    const b = hex1.b + (hex2.b - hex1.b) * t
    return rgbToHex(r, g, b)
  }

  // Handle rgba colors
  const rgba1 = parseRgba(color1)
  const rgba2 = parseRgba(color2)
  if (rgba1 && rgba2) {
    const r = rgba1.r + (rgba2.r - rgba1.r) * t
    const g = rgba1.g + (rgba2.g - rgba1.g) * t
    const b = rgba1.b + (rgba2.b - rgba1.b) * t
    const a = rgba1.a + (rgba2.a - rgba1.a) * t
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(2)})`
  }

  // Fallback: return second color if parsing fails
  return t < 0.5 ? color1 : color2
}

/**
 * Get the next time of day in sequence
 */
function getNextTimeOfDay(current: TimeOfDay): TimeOfDay {
  const order: TimeOfDay[] = ['morning', 'daytime', 'evening', 'night']
  const idx = order.indexOf(current)
  return order[(idx + 1) % order.length]
}

/**
 * Get the previous time of day in sequence
 */
function getPrevTimeOfDay(current: TimeOfDay): TimeOfDay {
  const order: TimeOfDay[] = ['morning', 'daytime', 'evening', 'night']
  const idx = order.indexOf(current)
  return order[(idx - 1 + order.length) % order.length]
}

/**
 * Calculate transition progress (0-1) towards the next time period
 * Returns null if not in a transition period
 */
export function getTransitionProgress(date: Date = new Date(), season?: Season): {
  progress: number
  fromTime: TimeOfDay
  toTime: TimeOfDay
} | null {
  const currentSeason = season ?? getSeason(date)
  const bounds = SEASONAL_TIME_BOUNDARIES[currentSeason]
  const hour = date.getHours() + date.getMinutes() / 60

  const transitionDuration = 0.5 // 30 minutes in hours

  // Check each boundary
  const boundaries: { time: TimeOfDay; startHour: number }[] = [
    { time: 'morning', startHour: bounds.morning.start },
    { time: 'daytime', startHour: bounds.daytime.start },
    { time: 'evening', startHour: bounds.evening.start },
    { time: 'night', startHour: bounds.night.start }
  ]

  for (const boundary of boundaries) {
    const boundaryHour = boundary.startHour
    let diff = hour - boundaryHour

    // Handle midnight wraparound
    if (diff > 12) diff -= 24
    if (diff < -12) diff += 24

    // Check if we're in the transition window (30 min before to 30 min after)
    if (Math.abs(diff) <= transitionDuration) {
      const fromTime = getPrevTimeOfDay(boundary.time)
      const toTime = boundary.time

      // Progress: -0.5 to +0.5 hours maps to 0 to 1
      const progress = (diff + transitionDuration) / (2 * transitionDuration)
      return {
        progress: Math.max(0, Math.min(1, progress)),
        fromTime,
        toTime
      }
    }
  }

  return null
}

/**
 * Interpolate between two theme token sets
 */
export function interpolateThemes(from: ThemeTokens, to: ThemeTokens, t: number): ThemeTokens {
  // Helper to interpolate a color property
  const lerp = (a: string, b: string) => interpolateColor(a, b, t)

  return {
    // Backgrounds
    bgBase: lerp(from.bgBase, to.bgBase),
    bgElevated: lerp(from.bgElevated, to.bgElevated),
    bgDeep: lerp(from.bgDeep, to.bgDeep),
    bgOverlay: lerp(from.bgOverlay, to.bgOverlay),

    // Text
    textPrimary: lerp(from.textPrimary, to.textPrimary),
    textSecondary: lerp(from.textSecondary, to.textSecondary),
    textMuted: lerp(from.textMuted, to.textMuted),
    textOnAccent: lerp(from.textOnAccent, to.textOnAccent),

    // Accent
    accent: lerp(from.accent, to.accent),
    accentHover: lerp(from.accentHover, to.accentHover),
    accentMuted: lerp(from.accentMuted, to.accentMuted),
    accentGlow: lerp(from.accentGlow, to.accentGlow),

    // Orb
    orbCore: lerp(from.orbCore, to.orbCore),
    orbMid: lerp(from.orbMid, to.orbMid),
    orbEdge: lerp(from.orbEdge, to.orbEdge),
    orbGlow: lerp(from.orbGlow, to.orbGlow),
    orbAtmosphere: lerp(from.orbAtmosphere, to.orbAtmosphere),

    // Stones
    stoneCompleted: lerp(from.stoneCompleted, to.stoneCompleted),
    stoneCompletedInner: lerp(from.stoneCompletedInner, to.stoneCompletedInner),
    stonePlanned: lerp(from.stonePlanned, to.stonePlanned),
    stonePlannedBorder: lerp(from.stonePlannedBorder, to.stonePlannedBorder),
    stoneEmpty: lerp(from.stoneEmpty, to.stoneEmpty),
    stoneToday: lerp(from.stoneToday, to.stoneToday),

    // Cards
    cardBg: lerp(from.cardBg, to.cardBg),
    cardBorder: lerp(from.cardBorder, to.cardBorder),
    cardShadow: lerp(from.cardShadow, to.cardShadow),

    // Calendar
    calendarDayBg: lerp(from.calendarDayBg, to.calendarDayBg),
    calendarDayText: lerp(from.calendarDayText, to.calendarDayText),
    calendarIntensity1: lerp(from.calendarIntensity1, to.calendarIntensity1),
    calendarIntensity2: lerp(from.calendarIntensity2, to.calendarIntensity2),
    calendarIntensity3: lerp(from.calendarIntensity3, to.calendarIntensity3),
    calendarIntensity4: lerp(from.calendarIntensity4, to.calendarIntensity4),

    // Progress
    progressTrack: lerp(from.progressTrack, to.progressTrack),
    progressFill: lerp(from.progressFill, to.progressFill),
    progressGlow: lerp(from.progressGlow, to.progressGlow),

    // Interactive
    buttonPrimaryBg: lerp(from.buttonPrimaryBg, to.buttonPrimaryBg),
    buttonPrimaryText: lerp(from.buttonPrimaryText, to.buttonPrimaryText),
    buttonSecondaryBg: lerp(from.buttonSecondaryBg, to.buttonSecondaryBg),
    buttonSecondaryText: lerp(from.buttonSecondaryText, to.buttonSecondaryText),
    toggleOn: lerp(from.toggleOn, to.toggleOn),
    toggleOff: lerp(from.toggleOff, to.toggleOff),
    toggleThumb: lerp(from.toggleThumb, to.toggleThumb),

    // Borders
    border: lerp(from.border, to.border),
    borderSubtle: lerp(from.borderSubtle, to.borderSubtle),
    divider: lerp(from.divider, to.divider),

    // Shadows - interpolate the color part
    shadowColor: lerp(from.shadowColor, to.shadowColor),
    shadowElevation1: t < 0.5 ? from.shadowElevation1 : to.shadowElevation1,
    shadowElevation2: t < 0.5 ? from.shadowElevation2 : to.shadowElevation2,
    shadowElevation3: t < 0.5 ? from.shadowElevation3 : to.shadowElevation3,

    // Pearls
    pearlBg: lerp(from.pearlBg, to.pearlBg),
    pearlShimmer: lerp(from.pearlShimmer, to.pearlShimmer),
    pearlOrb: lerp(from.pearlOrb, to.pearlOrb),
    pearlOrbInner: lerp(from.pearlOrbInner, to.pearlOrbInner),

    // Navigation
    navBg: lerp(from.navBg, to.navBg),
    navActive: lerp(from.navActive, to.navActive),
    navInactive: lerp(from.navInactive, to.navInactive),
    pullIndicator: lerp(from.pullIndicator, to.pullIndicator),

    // Meta - use destination values past 50%
    isDark: t < 0.5 ? from.isDark : to.isDark,
    seasonalAccent: lerp(from.seasonalAccent, to.seasonalAccent)
  }
}

/**
 * Calculate theme with optional interpolation during transitions
 */
export function calculateThemeWithTransition(
  date: Date = new Date(),
  season?: Season
): { tokens: ThemeTokens; isTransitioning: boolean; progress: number } {
  const currentSeason = season ?? getSeason(date)
  const transition = getTransitionProgress(date, currentSeason)

  if (transition) {
    const fromTokens = getThemeTokens(transition.fromTime, currentSeason)
    const toTokens = getThemeTokens(transition.toTime, currentSeason)
    const interpolatedTokens = interpolateThemes(fromTokens, toTokens, transition.progress)

    return {
      tokens: interpolatedTokens,
      isTransitioning: true,
      progress: transition.progress
    }
  }

  const timeOfDay = getTimeOfDay(date, currentSeason)
  return {
    tokens: getThemeTokens(timeOfDay, currentSeason),
    isTransitioning: false,
    progress: 0
  }
}

// Legacy exports for backward compatibility
export type ThemeValues = ThemeTokens
export type ThemeState = {
  timeOfDay: TimeOfDay
  season: Season
  values: ThemeTokens
  isTransitioning: boolean
}
