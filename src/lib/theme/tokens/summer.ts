/**
 * Summer Theme Tokens
 */

import type { ThemeTokens, TimeOfDay } from '../types'

export const SUMMER_MORNING: ThemeTokens = {
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

  // Voice Badge - Golden summer morning
  voiceHighBg: 'rgba(251, 191, 36, 0.2)',
  voiceHighText: '#92400E',
  voiceHighDot: '#F59E0B',
  voiceEstablishedBg: 'rgba(16, 185, 129, 0.12)',
  voiceEstablishedText: '#047857',
  voiceEstablishedDot: '#10B981',
  voiceGrowingBg: 'rgba(245, 158, 11, 0.15)',
  voiceGrowingText: '#78350F',
  voiceGrowingDot: '#F59E0B',
  voiceNewBg: '#FEF3C7',
  voiceNewText: '#B45309',
  voiceNewDot: '#B45309',

  // Meta
  isDark: false,
  seasonalAccent: '#F59E0B',
}

export const SUMMER_DAYTIME: ThemeTokens = {
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

  // Voice Badge - Vibrant summer day
  voiceHighBg: 'rgba(251, 191, 36, 0.18)',
  voiceHighText: '#92400E',
  voiceHighDot: '#F59E0B',
  voiceEstablishedBg: 'rgba(16, 185, 129, 0.12)',
  voiceEstablishedText: '#047857',
  voiceEstablishedDot: '#10B981',
  voiceGrowingBg: 'rgba(234, 88, 12, 0.12)',
  voiceGrowingText: '#7C2D12',
  voiceGrowingDot: '#EA580C',
  voiceNewBg: '#FFF7ED',
  voiceNewText: '#C2410C',
  voiceNewDot: '#C2410C',

  // Meta
  isDark: false,
  seasonalAccent: '#EA580C',
}

export const SUMMER_EVENING: ThemeTokens = {
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

  // Voice Badge - Golden hour amber
  voiceHighBg: 'rgba(251, 191, 36, 0.2)',
  voiceHighText: '#92400E',
  voiceHighDot: '#FBBF24',
  voiceEstablishedBg: 'rgba(16, 185, 129, 0.12)',
  voiceEstablishedText: '#047857',
  voiceEstablishedDot: '#10B981',
  voiceGrowingBg: 'rgba(217, 119, 6, 0.15)',
  voiceGrowingText: '#6B3410',
  voiceGrowingDot: '#D97706',
  voiceNewBg: '#FEECC8',
  voiceNewText: '#A36220',
  voiceNewDot: '#A36220',

  // Meta
  isDark: false,
  seasonalAccent: '#D97706',
}

export const SUMMER_NIGHT: ThemeTokens = {
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

  // Voice Badge - Warm summer night
  voiceHighBg: 'rgba(251, 191, 36, 0.25)',
  voiceHighText: '#FDE68A',
  voiceHighDot: '#FBBF24',
  voiceEstablishedBg: 'rgba(52, 211, 153, 0.15)',
  voiceEstablishedText: '#6EE7B7',
  voiceEstablishedDot: '#34D399',
  voiceGrowingBg: 'rgba(251, 191, 36, 0.15)',
  voiceGrowingText: '#D6D3D1',
  voiceGrowingDot: '#FBBF24',
  voiceNewBg: '#44403C',
  voiceNewText: '#A8A29E',
  voiceNewDot: '#78716C',

  // Meta
  isDark: true,
  seasonalAccent: '#FBBF24',
}

export const SUMMER_THEMES: Record<TimeOfDay, ThemeTokens> = {
  morning: SUMMER_MORNING,
  daytime: SUMMER_DAYTIME,
  evening: SUMMER_EVENING,
  night: SUMMER_NIGHT,
}
