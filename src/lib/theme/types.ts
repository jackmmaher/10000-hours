/**
 * Theme Engine Types
 *
 * Core type definitions for the Living Theme System.
 */

export type TimeOfDay = 'morning' | 'daytime' | 'evening' | 'night'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

/**
 * Comprehensive theme tokens covering every visual element
 */
export interface ThemeTokens {
  // === BACKGROUNDS ===
  bgBase: string // Main app background
  bgElevated: string // Cards, elevated surfaces
  bgDeep: string // Inset areas, wells
  bgOverlay: string // Modal overlays

  // === TEXT ===
  textPrimary: string // Main content
  textSecondary: string // Supporting text
  textMuted: string // Hints, timestamps
  textOnAccent: string // Text on accent-colored backgrounds

  // === ACCENT COLORS ===
  accent: string // Primary interactive color
  accentHover: string // Hover state
  accentMuted: string // Subtle accent backgrounds
  accentGlow: string // Glow/shadow color for accent

  // === ORB (Meditation Timer) ===
  orbCore: string // Center of the orb
  orbMid: string // Middle layer
  orbEdge: string // Outer edge
  orbGlow: string // Outer glow color
  orbAtmosphere: string // Ambient atmosphere layer

  // === STONES (Week indicators) ===
  stoneCompleted: string // Session done
  stoneCompletedInner: string
  stonePlanned: string // Future plan exists
  stonePlannedBorder: string
  stoneEmpty: string // No session/plan
  stoneToday: string // Current day highlight

  // === CARDS ===
  cardBg: string // Card background
  cardBorder: string // Card border (if any)
  cardShadow: string // Card shadow color

  // === CALENDAR ===
  calendarDayBg: string // Day cell background
  calendarDayText: string // Day number
  calendarIntensity1: string // Light activity
  calendarIntensity2: string // Medium activity
  calendarIntensity3: string // High activity
  calendarIntensity4: string // Very high activity

  // === PROGRESS ELEMENTS ===
  progressTrack: string // Progress bar track
  progressFill: string // Progress bar fill
  progressGlow: string // Progress glow effect

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
  shadowColor: string // Base shadow color
  shadowElevation1: string // Subtle shadow
  shadowElevation2: string // Medium shadow
  shadowElevation3: string // Strong shadow

  // === PEARLS (Wisdom cards) ===
  pearlBg: string
  pearlShimmer: string
  pearlOrb: string
  pearlOrbInner: string

  // === SPECIAL ELEMENTS ===
  navBg: string // Navigation background
  navActive: string // Active nav item
  navInactive: string // Inactive nav item
  pullIndicator: string // Pull-to-refresh color

  // === VOICE BADGE (Credibility indicator) ===
  voiceHighBg: string // High voice (70+) background
  voiceHighText: string // High voice text color
  voiceHighDot: string // High voice dot color
  voiceEstablishedBg: string // Established voice (45-69) background
  voiceEstablishedText: string
  voiceEstablishedDot: string
  voiceGrowingBg: string // Growing voice (20-44) background
  voiceGrowingText: string
  voiceGrowingDot: string
  voiceNewBg: string // New voice (0-19) background
  voiceNewText: string
  voiceNewDot: string

  // === META ===
  isDark: boolean
  seasonalAccent: string // The season's signature color
}

/**
 * Time of day boundaries - SEASON-AWARE
 * Based on real-world daylight patterns
 *
 * Summer: Longest days - dawn ~4:30am, dusk ~9:30pm
 * Winter: Shortest days - dawn ~7am, dusk ~4:30pm
 * Spring/Autumn: Moderate transitions
 */
export const SEASONAL_TIME_BOUNDARIES: Record<
  Season,
  {
    morning: { start: number; end: number }
    daytime: { start: number; end: number }
    evening: { start: number; end: number }
    night: { start: number; end: number }
  }
> = {
  summer: {
    morning: { start: 4.5, end: 11 }, // 4:30 AM - 10:59 AM (early dawn)
    daytime: { start: 11, end: 18 }, // 11:00 AM - 5:59 PM
    evening: { start: 18, end: 21.5 }, // 6:00 PM - 9:29 PM (long golden hour)
    night: { start: 21.5, end: 4.5 }, // 9:30 PM - 4:29 AM (short nights)
  },
  winter: {
    morning: { start: 7, end: 11 }, // 7:00 AM - 10:59 AM (late dawn)
    daytime: { start: 11, end: 16 }, // 11:00 AM - 3:59 PM (short days)
    evening: { start: 16, end: 18 }, // 4:00 PM - 5:59 PM (brief twilight)
    night: { start: 18, end: 7 }, // 6:00 PM - 6:59 AM (long nights)
  },
  spring: {
    morning: { start: 5.5, end: 11 }, // 5:30 AM - 10:59 AM
    daytime: { start: 11, end: 17 }, // 11:00 AM - 4:59 PM
    evening: { start: 17, end: 20 }, // 5:00 PM - 7:59 PM
    night: { start: 20, end: 5.5 }, // 8:00 PM - 5:29 AM
  },
  autumn: {
    morning: { start: 6, end: 11 }, // 6:00 AM - 10:59 AM
    daytime: { start: 11, end: 16.5 }, // 11:00 AM - 4:29 PM
    evening: { start: 16.5, end: 19 }, // 4:30 PM - 6:59 PM
    night: { start: 19, end: 6 }, // 7:00 PM - 5:59 AM
  },
}
