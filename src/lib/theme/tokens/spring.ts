/**
 * Spring Theme Tokens
 */

import type { ThemeTokens, TimeOfDay } from '../types'

export const SPRING_MORNING: ThemeTokens = {
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

  // Voice Badge - Spring morning sage tones
  voiceHighBg: 'rgba(251, 191, 36, 0.15)',
  voiceHighText: '#B45309',
  voiceHighDot: '#D97706',
  voiceEstablishedBg: 'rgba(124, 154, 110, 0.15)',
  voiceEstablishedText: '#4A6840',
  voiceEstablishedDot: '#7C9A6E',
  voiceGrowingBg: 'rgba(124, 154, 110, 0.12)',
  voiceGrowingText: '#6B6B60',
  voiceGrowingDot: '#7C9A6E',
  voiceNewBg: '#ECEEE8',
  voiceNewText: '#8A8A80',
  voiceNewDot: '#8A8A80',

  // Meta
  isDark: false,
  seasonalAccent: '#7C9A6E',
}

export const SPRING_DAYTIME: ThemeTokens = {
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

  // Voice Badge - Spring daytime leaf green tones
  voiceHighBg: 'rgba(251, 191, 36, 0.15)',
  voiceHighText: '#B45309',
  voiceHighDot: '#D97706',
  voiceEstablishedBg: 'rgba(107, 143, 94, 0.15)',
  voiceEstablishedText: '#3D5A30',
  voiceEstablishedDot: '#6B8F5E',
  voiceGrowingBg: 'rgba(107, 143, 94, 0.12)',
  voiceGrowingText: '#5A6650',
  voiceGrowingDot: '#6B8F5E',
  voiceNewBg: '#F0F2EB',
  voiceNewText: '#7A8570',
  voiceNewDot: '#7A8570',

  // Meta
  isDark: false,
  seasonalAccent: '#6B8F5E',
}

export const SPRING_EVENING: ThemeTokens = {
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

  // Voice Badge - Spring evening driftwood tones
  voiceHighBg: 'rgba(251, 191, 36, 0.15)',
  voiceHighText: '#B45309',
  voiceHighDot: '#D97706',
  voiceEstablishedBg: 'rgba(16, 185, 129, 0.12)',
  voiceEstablishedText: '#047857',
  voiceEstablishedDot: '#10B981',
  voiceGrowingBg: 'rgba(139, 123, 107, 0.15)',
  voiceGrowingText: '#6B6560',
  voiceGrowingDot: '#8B7B6B',
  voiceNewBg: '#E0DAD0',
  voiceNewText: '#8A8580',
  voiceNewDot: '#8A8580',

  // Meta
  isDark: false,
  seasonalAccent: '#8B7B6B',
}

export const SPRING_NIGHT: ThemeTokens = {
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

  // Voice Badge - Dark forest night
  voiceHighBg: 'rgba(251, 191, 36, 0.2)',
  voiceHighText: '#FCD34D',
  voiceHighDot: '#FBBF24',
  voiceEstablishedBg: 'rgba(107, 124, 95, 0.2)',
  voiceEstablishedText: '#A0B090',
  voiceEstablishedDot: '#8FA880',
  voiceGrowingBg: 'rgba(107, 124, 95, 0.15)',
  voiceGrowingText: '#9AA095',
  voiceGrowingDot: '#6B7C5F',
  voiceNewBg: '#353830',
  voiceNewText: '#707568',
  voiceNewDot: '#505850',

  // Meta
  isDark: true,
  seasonalAccent: '#6B7C5F',
}

export const SPRING_THEMES: Record<TimeOfDay, ThemeTokens> = {
  morning: SPRING_MORNING,
  daytime: SPRING_DAYTIME,
  evening: SPRING_EVENING,
  night: SPRING_NIGHT,
}
