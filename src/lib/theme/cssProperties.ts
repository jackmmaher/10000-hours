/**
 * CSS Properties Conversion
 *
 * Functions for converting theme tokens to CSS custom properties.
 */

import type { ThemeTokens } from './types'

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

    '--accent-warm': tokens.accentHover,

    // Orb
    '--orb-core': tokens.orbCore,
    '--orb-mid': tokens.orbMid,
    '--orb-edge': tokens.orbEdge,
    '--orb-glow': tokens.orbGlow,
    '--orb-atmosphere': tokens.orbAtmosphere,

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

    // Voice Badge
    '--voice-high-bg': tokens.voiceHighBg,
    '--voice-high-text': tokens.voiceHighText,
    '--voice-high-dot': tokens.voiceHighDot,
    '--voice-established-bg': tokens.voiceEstablishedBg,
    '--voice-established-text': tokens.voiceEstablishedText,
    '--voice-established-dot': tokens.voiceEstablishedDot,
    '--voice-growing-bg': tokens.voiceGrowingBg,
    '--voice-growing-text': tokens.voiceGrowingText,
    '--voice-growing-dot': tokens.voiceGrowingDot,
    '--voice-new-bg': tokens.voiceNewBg,
    '--voice-new-text': tokens.voiceNewText,
    '--voice-new-dot': tokens.voiceNewDot,

    '--seasonal-accent': tokens.seasonalAccent,

    // Timer theater mode
    '--theater-center': tokens.theaterCenter,
    '--theater-edge': tokens.theaterEdge,
    '--theater-glow': tokens.theaterGlow,

    // Semantic states
    '--error-bg': tokens.errorBg,
    '--error-text': tokens.errorText,
    '--success-bg': tokens.successBg,
    '--success-text': tokens.successText,
    '--success-icon': tokens.successIcon,
  }
}
