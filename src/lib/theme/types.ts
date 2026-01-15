/**
 * Theme Types
 *
 * Type definitions for the light/dark theme system.
 */

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
  seasonalAccent: string // Accent color
}
