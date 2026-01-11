/**
 * Autumn Theme Tokens
 */

import type { ThemeTokens, TimeOfDay } from '../types'

export const AUTUMN_MORNING: ThemeTokens = {
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

  // Voice Badge - Misty autumn morning
  voiceHighBg: 'rgba(251, 191, 36, 0.18)',
  voiceHighText: '#92400E',
  voiceHighDot: '#EAB308',
  voiceEstablishedBg: 'rgba(16, 185, 129, 0.12)',
  voiceEstablishedText: '#047857',
  voiceEstablishedDot: '#10B981',
  voiceGrowingBg: 'rgba(202, 138, 4, 0.15)',
  voiceGrowingText: '#713F12',
  voiceGrowingDot: '#CA8A04',
  voiceNewBg: '#F5EDE0',
  voiceNewText: '#A16207',
  voiceNewDot: '#A16207',

  // Meta
  isDark: false,
  seasonalAccent: '#CA8A04',
}

export const AUTUMN_DAYTIME: ThemeTokens = {
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

  // Voice Badge - Crisp autumn day
  voiceHighBg: 'rgba(251, 191, 36, 0.18)',
  voiceHighText: '#92400E',
  voiceHighDot: '#F59E0B',
  voiceEstablishedBg: 'rgba(16, 185, 129, 0.12)',
  voiceEstablishedText: '#047857',
  voiceEstablishedDot: '#10B981',
  voiceGrowingBg: 'rgba(194, 65, 12, 0.12)',
  voiceGrowingText: '#7C2D12',
  voiceGrowingDot: '#C2410C',
  voiceNewBg: '#F3EDE3',
  voiceNewText: '#B45309',
  voiceNewDot: '#B45309',

  // Meta
  isDark: false,
  seasonalAccent: '#C2410C',
}

export const AUTUMN_EVENING: ThemeTokens = {
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

  // Voice Badge - Harvest golden hour
  voiceHighBg: 'rgba(251, 191, 36, 0.2)',
  voiceHighText: '#92400E',
  voiceHighDot: '#FBBF24',
  voiceEstablishedBg: 'rgba(16, 185, 129, 0.12)',
  voiceEstablishedText: '#047857',
  voiceEstablishedDot: '#10B981',
  voiceGrowingBg: 'rgba(180, 83, 9, 0.15)',
  voiceGrowingText: '#5C2A0E',
  voiceGrowingDot: '#B45309',
  voiceNewBg: '#F5E6D3',
  voiceNewText: '#92400E',
  voiceNewDot: '#92400E',

  // Meta
  isDark: false,
  seasonalAccent: '#B45309',
}

export const AUTUMN_NIGHT: ThemeTokens = {
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

  // Voice Badge - Warm autumn night
  voiceHighBg: 'rgba(251, 191, 36, 0.25)',
  voiceHighText: '#FDE68A',
  voiceHighDot: '#FBBF24',
  voiceEstablishedBg: 'rgba(52, 211, 153, 0.15)',
  voiceEstablishedText: '#6EE7B7',
  voiceEstablishedDot: '#34D399',
  voiceGrowingBg: 'rgba(245, 158, 11, 0.15)',
  voiceGrowingText: '#D4BEA8',
  voiceGrowingDot: '#F59E0B',
  voiceNewBg: '#3D3230',
  voiceNewText: '#A68B70',
  voiceNewDot: '#6D5D50',

  // Meta
  isDark: true,
  seasonalAccent: '#F59E0B',
}

export const AUTUMN_THEMES: Record<TimeOfDay, ThemeTokens> = {
  morning: AUTUMN_MORNING,
  daytime: AUTUMN_DAYTIME,
  evening: AUTUMN_EVENING,
  night: AUTUMN_NIGHT,
}
