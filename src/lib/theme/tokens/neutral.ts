import { ThemeTokens } from '../types'

/**
 * Hermès-Inspired Neutral Theme - Light Mode
 *
 * Design Language:
 * - Warm cream backgrounds (paper/parchment quality)
 * - Hermès signature orange accent (#E35205)
 * - Warm neutral text (stone/neutral family)
 * - Borderless elegance (color creates separation)
 */
export const NEUTRAL_LIGHT: ThemeTokens = {
  // Backgrounds - Warm cream (paper quality)
  bgBase: '#F5F5F0',
  bgElevated: '#FFFFFF',
  bgDeep: '#EDEBE5',
  bgOverlay: 'rgba(23, 23, 23, 0.5)',

  // Text - Warm neutrals
  textPrimary: '#171717',
  textSecondary: '#525252',
  textMuted: '#737373',
  textOnAccent: '#FFFFFF',

  // Accent - Hermès Orange
  accent: '#E35205',
  accentHover: '#C2410C',
  accentMuted: 'rgba(227, 82, 5, 0.12)',
  accentGlow: 'rgba(227, 82, 5, 0.25)',

  // Orb - Warm with orange glow
  orbCore: '#FFFFFF',
  orbMid: '#F5F5F0',
  orbEdge: '#E7E5DF',
  orbGlow: 'rgba(227, 82, 5, 0.25)',
  orbAtmosphere: 'rgba(227, 82, 5, 0.08)',

  // Stones - Warm neutrals with orange for planned
  stoneCompleted: '#525252',
  stoneCompletedInner: '#737373',
  stonePlanned: 'rgba(227, 82, 5, 0.15)',
  stonePlannedBorder: 'rgba(227, 82, 5, 0.5)',
  stoneEmpty: '#EDEBE5',
  stoneToday: '#E7E5DF',

  // Cards - Clean white on cream
  cardBg: '#FFFFFF',
  cardBorder: 'rgba(0, 0, 0, 0.06)',
  cardShadow: 'rgba(0, 0, 0, 0.06)',

  // Calendar - Orange intensity gradient
  calendarDayBg: '#FFFFFF',
  calendarDayText: '#525252',
  calendarIntensity1: 'rgba(227, 82, 5, 0.15)',
  calendarIntensity2: 'rgba(227, 82, 5, 0.30)',
  calendarIntensity3: 'rgba(227, 82, 5, 0.50)',
  calendarIntensity4: 'rgba(227, 82, 5, 0.70)',

  // Progress - Orange fill
  progressTrack: '#E7E5DF',
  progressFill: '#E35205',
  progressGlow: 'rgba(227, 82, 5, 0.25)',

  // Interactive - Orange primary
  buttonPrimaryBg: '#E35205',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#EDEBE5',
  buttonSecondaryText: '#171717',
  toggleOn: '#E35205',
  toggleOff: '#D6D3D1',
  toggleThumb: '#FFFFFF',

  // Borders - Subtle, near-invisible
  border: 'rgba(0, 0, 0, 0.08)',
  borderSubtle: 'rgba(0, 0, 0, 0.04)',
  divider: 'rgba(0, 0, 0, 0.06)',

  // Shadows - Neutral black
  shadowColor: 'rgba(0, 0, 0, 0.06)',
  shadowElevation1: '0 1px 3px rgba(0, 0, 0, 0.04)',
  shadowElevation2: '0 4px 12px rgba(0, 0, 0, 0.06)',
  shadowElevation3: '0 8px 24px rgba(0, 0, 0, 0.08)',

  // Pearls - Warm shimmer
  pearlBg: '#FFFFFF',
  pearlShimmer: 'rgba(255, 255, 255, 0.8)',
  pearlOrb: '#F5F5F0',
  pearlOrbInner: '#E7E5DF',

  // Navigation - Orange active
  navBg: 'rgba(245, 245, 240, 0.95)',
  navActive: '#E35205',
  navInactive: '#737373',
  pullIndicator: '#E35205',

  // Voice Badge - Orange intensity scale
  voiceHighBg: 'rgba(227, 82, 5, 0.15)',
  voiceHighText: '#C2410C',
  voiceHighDot: '#E35205',
  voiceEstablishedBg: 'rgba(227, 82, 5, 0.10)',
  voiceEstablishedText: '#525252',
  voiceEstablishedDot: '#E9762B',
  voiceGrowingBg: 'rgba(227, 82, 5, 0.06)',
  voiceGrowingText: '#737373',
  voiceGrowingDot: '#EFA06A',
  voiceNewBg: '#EDEBE5',
  voiceNewText: '#737373',
  voiceNewDot: '#D6D3D1',

  // Meta
  isDark: false,
  seasonalAccent: '#E35205',
}

/**
 * Hermès-Inspired Neutral Theme - Dark Mode
 *
 * Design Language:
 * - Warm charcoal backgrounds (aged leather quality)
 * - Boosted orange accent for dark visibility (#EA580C)
 * - Warm stone text tones
 * - Elevated surfaces are lighter (inverted from light mode)
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
  textOnAccent: '#FFFFFF',

  // Accent - Boosted Hermès Orange for dark
  accent: '#EA580C',
  accentHover: '#F97316',
  accentMuted: 'rgba(234, 88, 12, 0.15)',
  accentGlow: 'rgba(234, 88, 12, 0.35)',

  // Orb - Warm glow in darkness
  orbCore: '#FAFAF9',
  orbMid: '#78716C',
  orbEdge: '#44403C',
  orbGlow: 'rgba(234, 88, 12, 0.35)',
  orbAtmosphere: 'rgba(234, 88, 12, 0.12)',

  // Stones - Stone tones with orange for planned
  stoneCompleted: '#A8A29E',
  stoneCompletedInner: '#D6D3D1',
  stonePlanned: 'rgba(234, 88, 12, 0.2)',
  stonePlannedBorder: 'rgba(234, 88, 12, 0.6)',
  stoneEmpty: '#292524',
  stoneToday: '#3D3836',

  // Cards - Elevated charcoal
  cardBg: '#292524',
  cardBorder: 'rgba(255, 255, 255, 0.06)',
  cardShadow: 'rgba(0, 0, 0, 0.4)',

  // Calendar - Orange intensity gradient
  calendarDayBg: '#292524',
  calendarDayText: '#A8A29E',
  calendarIntensity1: 'rgba(234, 88, 12, 0.15)',
  calendarIntensity2: 'rgba(234, 88, 12, 0.30)',
  calendarIntensity3: 'rgba(234, 88, 12, 0.50)',
  calendarIntensity4: 'rgba(234, 88, 12, 0.70)',

  // Progress - Orange fill
  progressTrack: '#3D3836',
  progressFill: '#EA580C',
  progressGlow: 'rgba(234, 88, 12, 0.35)',

  // Interactive - Orange primary
  buttonPrimaryBg: '#EA580C',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#3D3836',
  buttonSecondaryText: '#FAFAF9',
  toggleOn: '#EA580C',
  toggleOff: '#3D3836',
  toggleThumb: '#FFFFFF',

  // Borders - Subtle light on dark
  border: 'rgba(255, 255, 255, 0.08)',
  borderSubtle: 'rgba(255, 255, 255, 0.04)',
  divider: 'rgba(255, 255, 255, 0.06)',

  // Shadows - Deep black
  shadowColor: 'rgba(0, 0, 0, 0.4)',
  shadowElevation1: '0 1px 3px rgba(0, 0, 0, 0.2)',
  shadowElevation2: '0 4px 12px rgba(0, 0, 0, 0.3)',
  shadowElevation3: '0 8px 24px rgba(0, 0, 0, 0.4)',

  // Pearls - Warm elevated shimmer
  pearlBg: '#292524',
  pearlShimmer: 'rgba(41, 37, 36, 0.8)',
  pearlOrb: '#3D3836',
  pearlOrbInner: '#44403C',

  // Navigation - Orange active
  navBg: 'rgba(28, 25, 23, 0.95)',
  navActive: '#EA580C',
  navInactive: '#78716C',
  pullIndicator: '#EA580C',

  // Voice Badge - Orange intensity scale
  voiceHighBg: 'rgba(234, 88, 12, 0.18)',
  voiceHighText: '#FB923C',
  voiceHighDot: '#EA580C',
  voiceEstablishedBg: 'rgba(234, 88, 12, 0.12)',
  voiceEstablishedText: '#A8A29E',
  voiceEstablishedDot: '#F97316',
  voiceGrowingBg: 'rgba(234, 88, 12, 0.08)',
  voiceGrowingText: '#78716C',
  voiceGrowingDot: '#FB923C',
  voiceNewBg: '#292524',
  voiceNewText: '#78716C',
  voiceNewDot: '#57534E',

  // Meta
  isDark: true,
  seasonalAccent: '#EA580C',
}
