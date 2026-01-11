import { ThemeTokens } from '../types'

export const NEUTRAL_LIGHT: ThemeTokens = {
  // Backgrounds - Clean slate
  bgBase: '#F8FAFC',
  bgElevated: '#FFFFFF',
  bgDeep: '#F1F5F9',
  bgOverlay: 'rgba(15, 23, 42, 0.4)',

  // Text - Slate scale
  textPrimary: '#1E293B',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textOnAccent: '#FFFFFF',

  // Accent - Slate blue (functional, not decorative)
  accent: '#475569',
  accentHover: '#334155',
  accentMuted: 'rgba(71, 85, 105, 0.12)',
  accentGlow: 'rgba(71, 85, 105, 0.25)',

  // Orb - Soft neutral gradient
  orbCore: '#FFFFFF',
  orbMid: '#E2E8F0',
  orbEdge: '#CBD5E1',
  orbGlow: 'rgba(148, 163, 184, 0.3)',
  orbAtmosphere: 'rgba(148, 163, 184, 0.1)',

  // Stones - Slate scale
  stoneCompleted: '#334155',
  stoneCompletedInner: '#475569',
  stonePlanned: 'rgba(71, 85, 105, 0.2)',
  stonePlannedBorder: 'rgba(71, 85, 105, 0.4)',
  stoneEmpty: '#F1F5F9',
  stoneToday: '#E2E8F0',

  // Cards - Clean white
  cardBg: '#FFFFFF',
  cardBorder: 'rgba(71, 85, 105, 0.1)',
  cardShadow: 'rgba(15, 23, 42, 0.05)',

  // Calendar
  calendarDayBg: '#FFFFFF',
  calendarDayText: '#475569',
  calendarIntensity1: 'rgba(71, 85, 105, 0.15)',
  calendarIntensity2: 'rgba(71, 85, 105, 0.30)',
  calendarIntensity3: 'rgba(71, 85, 105, 0.50)',
  calendarIntensity4: 'rgba(71, 85, 105, 0.70)',

  // Progress
  progressTrack: '#E2E8F0',
  progressFill: '#475569',
  progressGlow: 'rgba(71, 85, 105, 0.25)',

  // Interactive
  buttonPrimaryBg: '#334155',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#F1F5F9',
  buttonSecondaryText: '#1E293B',
  toggleOn: '#475569',
  toggleOff: '#CBD5E1',
  toggleThumb: '#FFFFFF',

  // Borders
  border: 'rgba(71, 85, 105, 0.15)',
  borderSubtle: 'rgba(71, 85, 105, 0.08)',
  divider: 'rgba(71, 85, 105, 0.08)',

  // Shadows
  shadowColor: 'rgba(15, 23, 42, 0.06)',
  shadowElevation1: '0 1px 3px rgba(15, 23, 42, 0.04)',
  shadowElevation2: '0 4px 12px rgba(15, 23, 42, 0.06)',
  shadowElevation3: '0 8px 24px rgba(15, 23, 42, 0.08)',

  // Pearls - Subtle shimmer
  pearlBg: '#FFFFFF',
  pearlShimmer: 'rgba(248, 250, 252, 0.8)',
  pearlOrb: '#F1F5F9',
  pearlOrbInner: '#E2E8F0',

  // Navigation
  navBg: 'rgba(248, 250, 252, 0.95)',
  navActive: '#1E293B',
  navInactive: '#64748B',
  pullIndicator: '#475569',

  // Voice Badge - Neutral slate scale
  voiceHighBg: 'rgba(34, 197, 94, 0.12)',
  voiceHighText: '#166534',
  voiceHighDot: '#22C55E',
  voiceEstablishedBg: 'rgba(59, 130, 246, 0.12)',
  voiceEstablishedText: '#1D4ED8',
  voiceEstablishedDot: '#3B82F6',
  voiceGrowingBg: 'rgba(71, 85, 105, 0.12)',
  voiceGrowingText: '#334155',
  voiceGrowingDot: '#64748B',
  voiceNewBg: '#F1F5F9',
  voiceNewText: '#64748B',
  voiceNewDot: '#94A3B8',

  // Meta
  isDark: false,
  seasonalAccent: '#475569',
}

export const NEUTRAL_DARK: ThemeTokens = {
  // Backgrounds - Deep slate
  bgBase: '#0F172A',
  bgElevated: '#1E293B',
  bgDeep: '#0B1120',
  bgOverlay: 'rgba(0, 0, 0, 0.6)',

  // Text - Light slate
  textPrimary: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  textOnAccent: '#FFFFFF',

  // Accent - Brighter slate for visibility
  accent: '#94A3B8',
  accentHover: '#CBD5E1',
  accentMuted: 'rgba(148, 163, 184, 0.15)',
  accentGlow: 'rgba(148, 163, 184, 0.3)',

  // Orb - Soft glow in darkness
  orbCore: '#F1F5F9',
  orbMid: '#94A3B8',
  orbEdge: '#64748B',
  orbGlow: 'rgba(148, 163, 184, 0.35)',
  orbAtmosphere: 'rgba(148, 163, 184, 0.12)',

  // Stones - Slate variations
  stoneCompleted: '#94A3B8',
  stoneCompletedInner: '#CBD5E1',
  stonePlanned: 'rgba(148, 163, 184, 0.25)',
  stonePlannedBorder: 'rgba(148, 163, 184, 0.5)',
  stoneEmpty: '#1E293B',
  stoneToday: '#334155',

  // Cards - Elevated slate
  cardBg: '#1E293B',
  cardBorder: 'rgba(148, 163, 184, 0.1)',
  cardShadow: 'rgba(0, 0, 0, 0.3)',

  // Calendar
  calendarDayBg: '#1E293B',
  calendarDayText: '#CBD5E1',
  calendarIntensity1: 'rgba(148, 163, 184, 0.15)',
  calendarIntensity2: 'rgba(148, 163, 184, 0.30)',
  calendarIntensity3: 'rgba(148, 163, 184, 0.50)',
  calendarIntensity4: 'rgba(148, 163, 184, 0.70)',

  // Progress
  progressTrack: '#334155',
  progressFill: '#94A3B8',
  progressGlow: 'rgba(148, 163, 184, 0.3)',

  // Interactive
  buttonPrimaryBg: '#94A3B8',
  buttonPrimaryText: '#0F172A',
  buttonSecondaryBg: '#334155',
  buttonSecondaryText: '#F1F5F9',
  toggleOn: '#94A3B8',
  toggleOff: '#334155',
  toggleThumb: '#FFFFFF',

  // Borders
  border: 'rgba(148, 163, 184, 0.15)',
  borderSubtle: 'rgba(148, 163, 184, 0.08)',
  divider: 'rgba(148, 163, 184, 0.08)',

  // Shadows
  shadowColor: 'rgba(0, 0, 0, 0.4)',
  shadowElevation1: '0 1px 3px rgba(0, 0, 0, 0.2)',
  shadowElevation2: '0 4px 12px rgba(0, 0, 0, 0.3)',
  shadowElevation3: '0 8px 24px rgba(0, 0, 0, 0.4)',

  // Pearls - Subtle shimmer
  pearlBg: '#1E293B',
  pearlShimmer: 'rgba(30, 41, 59, 0.8)',
  pearlOrb: '#334155',
  pearlOrbInner: '#475569',

  // Navigation
  navBg: 'rgba(15, 23, 42, 0.95)',
  navActive: '#F1F5F9',
  navInactive: '#94A3B8',
  pullIndicator: '#94A3B8',

  // Voice Badge - Neutral but visible
  voiceHighBg: 'rgba(34, 197, 94, 0.15)',
  voiceHighText: '#86EFAC',
  voiceHighDot: '#22C55E',
  voiceEstablishedBg: 'rgba(59, 130, 246, 0.15)',
  voiceEstablishedText: '#93C5FD',
  voiceEstablishedDot: '#3B82F6',
  voiceGrowingBg: 'rgba(148, 163, 184, 0.15)',
  voiceGrowingText: '#CBD5E1',
  voiceGrowingDot: '#94A3B8',
  voiceNewBg: '#334155',
  voiceNewText: '#94A3B8',
  voiceNewDot: '#64748B',

  // Meta
  isDark: true,
  seasonalAccent: '#94A3B8',
}
