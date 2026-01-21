import { ThemeTokens } from '../types'

/**
 * Hermès-Inspired Neutral Theme - Light Mode
 *
 * Design Language:
 * - Warm cream backgrounds (paper/parchment quality)
 * - Hermès signature orange accent (#EA6512) - Figma exact
 * - Warm neutral text (stone/neutral family)
 * - Borderless elegance (color creates separation, no visible borders)
 *
 * Color source: Figma color picker from Hermès app reference
 * - Orange: #EA6512 (RGB 234, 101, 18)
 * - Cream: #F6F2EC
 */
export const NEUTRAL_LIGHT: ThemeTokens = {
  // Backgrounds - Warm cream (paper quality) - Figma exact
  bgBase: '#F6F2EC',
  bgElevated: '#FFFFFF',
  bgDeep: '#EDE9E3',
  bgOverlay: 'rgba(23, 23, 23, 0.5)',

  // Text - Warm neutrals
  textPrimary: '#171717',
  textSecondary: '#525252',
  textMuted: '#737373',
  textTertiary: '#A8A29E', // Lighter than muted for hints/metadata
  textOnAccent: '#FFFFFF',

  // Accent - Hermès Orange (Figma exact: #EA6512)
  accent: '#EA6512',
  accentHover: '#D55A0F',
  accentMuted: 'rgba(234, 101, 18, 0.12)',
  accentGlow: 'rgba(234, 101, 18, 0.25)',

  // Orb - Warm with orange glow
  orbCore: '#FFFFFF',
  orbMid: '#F6F2EC',
  orbEdge: '#E8E4DE',
  orbGlow: 'rgba(234, 101, 18, 0.25)',
  orbAtmosphere: 'rgba(234, 101, 18, 0.08)',

  // Stones - Warm neutrals with orange for planned
  stoneCompleted: '#525252',
  stoneCompletedInner: '#737373',
  stonePlanned: 'rgba(234, 101, 18, 0.15)',
  stonePlannedBorder: 'rgba(234, 101, 18, 0.5)',
  stoneEmpty: '#EDE9E3',
  stoneToday: '#E8E4DE',

  // Cards - Borderless design (color creates separation)
  // White card on cream background = visual boundary without borders
  cardBg: '#FFFFFF',
  cardBorder: 'transparent', // Borderless - color difference creates edge
  cardShadow: 'rgba(0, 0, 0, 0.04)', // Subtle shadow for depth/haptics

  // Calendar - Orange intensity gradient
  calendarDayBg: '#FFFFFF',
  calendarDayText: '#525252',
  calendarIntensity1: 'rgba(234, 101, 18, 0.15)',
  calendarIntensity2: 'rgba(234, 101, 18, 0.30)',
  calendarIntensity3: 'rgba(234, 101, 18, 0.50)',
  calendarIntensity4: 'rgba(234, 101, 18, 0.70)',

  // Progress - Orange fill
  progressTrack: '#E8E4DE',
  progressFill: '#EA6512',
  progressGlow: 'rgba(234, 101, 18, 0.25)',

  // Interactive - Orange primary
  buttonPrimaryBg: '#EA6512',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#EDE9E3',
  buttonSecondaryText: '#171717',
  toggleOn: '#EA6512',
  toggleOff: '#D6D3D1',
  toggleThumb: '#FFFFFF',

  // Borders - Effectively invisible (borderless design)
  border: 'transparent',
  borderSubtle: 'transparent',
  divider: 'rgba(0, 0, 0, 0.04)', // Very subtle divider only where needed
  pillBorder: 'rgba(23, 23, 23, 0.06)', // Warm-tinted subtle border (matches textPrimary #171717)

  // Shadows - For depth and haptic feedback
  shadowColor: 'rgba(0, 0, 0, 0.04)',
  shadowElevation1: '0 1px 3px rgba(0, 0, 0, 0.03)',
  shadowElevation2: '0 4px 12px rgba(0, 0, 0, 0.04)',
  shadowElevation3: '0 8px 24px rgba(0, 0, 0, 0.06)',

  // Pearls - Warm shimmer
  pearlBg: '#FFFFFF',
  pearlShimmer: 'rgba(255, 255, 255, 0.8)',
  pearlOrb: '#F6F2EC',
  pearlOrbInner: '#E8E4DE',

  // Navigation - Orange active
  navBg: 'rgba(246, 242, 236, 0.95)',
  navActive: '#EA6512',
  navInactive: '#737373',
  pullIndicator: '#EA6512',

  // Voice Badge - Orange intensity scale
  voiceHighBg: 'rgba(234, 101, 18, 0.15)',
  voiceHighText: '#D55A0F',
  voiceHighDot: '#EA6512',
  voiceEstablishedBg: 'rgba(234, 101, 18, 0.10)',
  voiceEstablishedText: '#525252',
  voiceEstablishedDot: '#EE8344',
  voiceGrowingBg: 'rgba(234, 101, 18, 0.06)',
  voiceGrowingText: '#737373',
  voiceGrowingDot: '#F4A876',
  voiceNewBg: '#EDE9E3',
  voiceNewText: '#737373',
  voiceNewDot: '#D6D3D1',

  // Timer theater mode (cinematic focus)
  theaterCenter: '#D8D4CE', // Dimmed cream (background)
  theaterEdge: '#A8A49E', // Warm shadow (edge vignette)
  theaterGlow: 'rgba(255, 255, 255, 0.9)', // Luminous center spot (high opacity for light bg)

  // Semantic states - warm-tinted for harmony with cream palette
  errorBg: 'rgba(220, 38, 38, 0.08)',
  errorText: '#B91C1C',
  successBg: 'rgba(5, 150, 105, 0.08)',
  successText: '#047857',
  successIcon: '#059669',

  // Meta
  isDark: false,
  seasonalAccent: '#EA6512',
}

/**
 * Hermès-Inspired Neutral Theme - Dark Mode
 *
 * Design Language:
 * - Warm charcoal backgrounds (aged leather quality)
 * - Boosted orange accent for dark visibility (#F07020)
 * - Warm stone text tones
 * - Elevated surfaces are lighter (inverted from light mode)
 * - Borderless elegance maintained
 */
export const NEUTRAL_DARK: ThemeTokens = {
  // Backgrounds - Warm charcoal (leather quality)
  bgBase: '#1C1917',
  bgElevated: '#292524',
  bgDeep: '#0C0A09',
  bgOverlay: 'rgba(0, 0, 0, 0.7)',

  // Text - Warm stone tones
  textPrimary: '#FAFAF9',
  textSecondary: '#A8A29E',
  textMuted: '#78716C',
  textTertiary: '#57534E', // Subtle stone tone for dark mode
  textOnAccent: '#FFFFFF',

  // Accent - Boosted Hermès Orange for dark visibility
  accent: '#F07020',
  accentHover: '#F8923C',
  accentMuted: 'rgba(240, 112, 32, 0.15)',
  accentGlow: 'rgba(240, 112, 32, 0.35)',

  // Orb - Warm glow in darkness
  orbCore: '#FAFAF9',
  orbMid: '#78716C',
  orbEdge: '#44403C',
  orbGlow: 'rgba(240, 112, 32, 0.35)',
  orbAtmosphere: 'rgba(240, 112, 32, 0.12)',

  // Stones - Stone tones with orange for planned
  stoneCompleted: '#A8A29E',
  stoneCompletedInner: '#D6D3D1',
  stonePlanned: 'rgba(240, 112, 32, 0.2)',
  stonePlannedBorder: 'rgba(240, 112, 32, 0.6)',
  stoneEmpty: '#292524',
  stoneToday: '#3D3836',

  // Cards - Borderless design (elevation creates separation)
  cardBg: '#292524',
  cardBorder: 'transparent', // Borderless
  cardShadow: 'rgba(0, 0, 0, 0.3)', // Deeper shadow in dark mode

  // Calendar - Orange intensity gradient
  calendarDayBg: '#292524',
  calendarDayText: '#A8A29E',
  calendarIntensity1: 'rgba(240, 112, 32, 0.15)',
  calendarIntensity2: 'rgba(240, 112, 32, 0.30)',
  calendarIntensity3: 'rgba(240, 112, 32, 0.50)',
  calendarIntensity4: 'rgba(240, 112, 32, 0.70)',

  // Progress - Orange fill
  progressTrack: '#3D3836',
  progressFill: '#F07020',
  progressGlow: 'rgba(240, 112, 32, 0.35)',

  // Interactive - Orange primary
  buttonPrimaryBg: '#F07020',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#3D3836',
  buttonSecondaryText: '#FAFAF9',
  toggleOn: '#F07020',
  toggleOff: '#3D3836',
  toggleThumb: '#FFFFFF',

  // Borders - Subtle visibility for card edges
  border: 'rgba(255, 255, 255, 0.06)',
  borderSubtle: 'rgba(255, 255, 255, 0.04)',
  divider: 'rgba(255, 255, 255, 0.04)',
  pillBorder: 'rgba(250, 250, 249, 0.06)', // Warm stone-white border (matches textPrimary #FAFAF9)

  // Shadows - Deep black for depth
  shadowColor: 'rgba(0, 0, 0, 0.3)',
  shadowElevation1: '0 1px 3px rgba(0, 0, 0, 0.15)',
  shadowElevation2: '0 4px 12px rgba(0, 0, 0, 0.2)',
  shadowElevation3: '0 8px 24px rgba(0, 0, 0, 0.3)',

  // Pearls - Warm elevated shimmer
  pearlBg: '#292524',
  pearlShimmer: 'rgba(41, 37, 36, 0.8)',
  pearlOrb: '#3D3836',
  pearlOrbInner: '#44403C',

  // Navigation - Orange active
  navBg: 'rgba(28, 25, 23, 0.95)',
  navActive: '#F07020',
  navInactive: '#78716C',
  pullIndicator: '#F07020',

  // Voice Badge - Orange intensity scale
  voiceHighBg: 'rgba(240, 112, 32, 0.18)',
  voiceHighText: '#F8923C',
  voiceHighDot: '#F07020',
  voiceEstablishedBg: 'rgba(240, 112, 32, 0.12)',
  voiceEstablishedText: '#A8A29E',
  voiceEstablishedDot: '#F8923C',
  voiceGrowingBg: 'rgba(240, 112, 32, 0.08)',
  voiceGrowingText: '#78716C',
  voiceGrowingDot: '#F8923C',
  voiceNewBg: '#292524',
  voiceNewText: '#78716C',
  voiceNewDot: '#57534E',

  // Timer theater mode (cinematic focus)
  theaterCenter: '#0C0A09', // Deep charcoal (background)
  theaterEdge: '#030201', // Near-black (edge vignette)
  theaterGlow: 'rgba(255, 248, 240, 0.15)', // Warm luminous center spot

  // Semantic states - visible on dark backgrounds
  errorBg: 'rgba(239, 68, 68, 0.15)',
  errorText: '#F87171',
  successBg: 'rgba(16, 185, 129, 0.15)',
  successText: '#34D399',
  successIcon: '#10B981',

  // Meta
  isDark: true,
  seasonalAccent: '#F07020',
}
