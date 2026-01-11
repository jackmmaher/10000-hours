/**
 * Theme Interpolation
 *
 * Contrast-preserving interpolation between theme token sets.
 */

import type { ThemeTokens } from './types'
import { interpolateColor, pickBetterContrastText, pickMoreSaturatedColor } from './colorUtils'

/**
 * Interpolate between two theme token sets
 *
 * CONTRAST-PRESERVING INTERPOLATION:
 * Instead of linearly blending all tokens (which creates "visual mud"),
 * we categorize tokens:
 *
 * - Structural tokens (backgrounds, borders, shadows): blend smoothly
 *   These create the atmospheric feel and should fade cinematically
 *
 * - Functional tokens (text, accents): preserve legibility/vibrancy
 *   Text: pick whichever has better contrast against blended background
 *   Accents: pick the more saturated value (preserves punch)
 *
 * This ensures backgrounds fade like weather while text stays readable
 * and accents stay punchy - no more muddy in-between states.
 */
export function interpolateThemes(from: ThemeTokens, to: ThemeTokens, t: number): ThemeTokens {
  // Helper to interpolate a color property (structural tokens)
  const lerp = (a: string, b: string) => interpolateColor(a, b, t)

  // === STEP 1: Calculate blended backgrounds first (needed for contrast checks) ===
  const blendedBgBase = lerp(from.bgBase, to.bgBase)
  const blendedBgElevated = lerp(from.bgElevated, to.bgElevated)
  const blendedCardBg = lerp(from.cardBg, to.cardBg)

  // === STEP 2: Pick text colors with better contrast against blended backgrounds ===
  // For text on main background
  const textPrimary = pickBetterContrastText(from.textPrimary, to.textPrimary, blendedBgBase)
  const textSecondary = pickBetterContrastText(from.textSecondary, to.textSecondary, blendedBgBase)
  const textMuted = pickBetterContrastText(from.textMuted, to.textMuted, blendedBgBase)

  // Navigation text needs good contrast against nav background
  const blendedNavBg = lerp(from.navBg, to.navBg)
  const navActive = pickBetterContrastText(from.navActive, to.navActive, blendedNavBg)
  const navInactive = pickBetterContrastText(from.navInactive, to.navInactive, blendedNavBg)

  // Calendar text on calendar background
  const blendedCalendarDayBg = lerp(from.calendarDayBg, to.calendarDayBg)
  const calendarDayText = pickBetterContrastText(
    from.calendarDayText,
    to.calendarDayText,
    blendedCalendarDayBg
  )

  // === STEP 3: Pick more saturated accent colors (preserves vibrancy) ===
  const accent = pickMoreSaturatedColor(from.accent, to.accent)
  const accentHover = pickMoreSaturatedColor(from.accentHover, to.accentHover)
  const seasonalAccent = pickMoreSaturatedColor(from.seasonalAccent, to.seasonalAccent)

  // Progress and toggles should stay vibrant
  const progressFill = pickMoreSaturatedColor(from.progressFill, to.progressFill)
  const toggleOn = pickMoreSaturatedColor(from.toggleOn, to.toggleOn)
  const pullIndicator = pickMoreSaturatedColor(from.pullIndicator, to.pullIndicator)

  // Orb edge and glow should stay vibrant
  const orbEdge = pickMoreSaturatedColor(from.orbEdge, to.orbEdge)

  return {
    // === STRUCTURAL TOKENS (blend smoothly) ===

    // Backgrounds - these create the atmosphere, blend cinematically
    bgBase: blendedBgBase,
    bgElevated: blendedBgElevated,
    bgDeep: lerp(from.bgDeep, to.bgDeep),
    bgOverlay: lerp(from.bgOverlay, to.bgOverlay),

    // === FUNCTIONAL TOKENS (preserve contrast/saturation) ===

    // Text - picked for better contrast
    textPrimary,
    textSecondary,
    textMuted,
    textOnAccent: lerp(from.textOnAccent, to.textOnAccent), // Usually white, fine to lerp

    // Accent - picked for better saturation
    accent,
    accentHover,
    accentMuted: lerp(from.accentMuted, to.accentMuted), // Muted can blend
    accentGlow: lerp(from.accentGlow, to.accentGlow),

    // === VISUAL ELEMENTS (mix of structural and accent) ===

    // Orb - core/mid blend, edge stays vibrant
    orbCore: lerp(from.orbCore, to.orbCore),
    orbMid: lerp(from.orbMid, to.orbMid),
    orbEdge,
    orbGlow: lerp(from.orbGlow, to.orbGlow),
    orbAtmosphere: lerp(from.orbAtmosphere, to.orbAtmosphere),

    // Stones - blend smoothly (they're small, less critical)
    stoneCompleted: lerp(from.stoneCompleted, to.stoneCompleted),
    stoneCompletedInner: lerp(from.stoneCompletedInner, to.stoneCompletedInner),
    stonePlanned: lerp(from.stonePlanned, to.stonePlanned),
    stonePlannedBorder: lerp(from.stonePlannedBorder, to.stonePlannedBorder),
    stoneEmpty: lerp(from.stoneEmpty, to.stoneEmpty),
    stoneToday: lerp(from.stoneToday, to.stoneToday),

    // Cards - blend smoothly
    cardBg: blendedCardBg,
    cardBorder: lerp(from.cardBorder, to.cardBorder),
    cardShadow: lerp(from.cardShadow, to.cardShadow),

    // Calendar
    calendarDayBg: blendedCalendarDayBg,
    calendarDayText,
    calendarIntensity1: lerp(from.calendarIntensity1, to.calendarIntensity1),
    calendarIntensity2: lerp(from.calendarIntensity2, to.calendarIntensity2),
    calendarIntensity3: lerp(from.calendarIntensity3, to.calendarIntensity3),
    calendarIntensity4: lerp(from.calendarIntensity4, to.calendarIntensity4),

    // Progress - track blends, fill stays vibrant
    progressTrack: lerp(from.progressTrack, to.progressTrack),
    progressFill,
    progressGlow: lerp(from.progressGlow, to.progressGlow),

    // Interactive - primary stays vibrant, secondary blends
    buttonPrimaryBg: pickMoreSaturatedColor(from.buttonPrimaryBg, to.buttonPrimaryBg),
    buttonPrimaryText: lerp(from.buttonPrimaryText, to.buttonPrimaryText),
    buttonSecondaryBg: lerp(from.buttonSecondaryBg, to.buttonSecondaryBg),
    buttonSecondaryText: pickBetterContrastText(
      from.buttonSecondaryText,
      to.buttonSecondaryText,
      lerp(from.buttonSecondaryBg, to.buttonSecondaryBg)
    ),
    toggleOn,
    toggleOff: lerp(from.toggleOff, to.toggleOff),
    toggleThumb: lerp(from.toggleThumb, to.toggleThumb),

    // Borders - blend smoothly
    border: lerp(from.border, to.border),
    borderSubtle: lerp(from.borderSubtle, to.borderSubtle),
    divider: lerp(from.divider, to.divider),

    // Shadows - structural, blend or snap
    shadowColor: lerp(from.shadowColor, to.shadowColor),
    shadowElevation1: t < 0.5 ? from.shadowElevation1 : to.shadowElevation1,
    shadowElevation2: t < 0.5 ? from.shadowElevation2 : to.shadowElevation2,
    shadowElevation3: t < 0.5 ? from.shadowElevation3 : to.shadowElevation3,

    // Pearls - blend smoothly
    pearlBg: lerp(from.pearlBg, to.pearlBg),
    pearlShimmer: lerp(from.pearlShimmer, to.pearlShimmer),
    pearlOrb: lerp(from.pearlOrb, to.pearlOrb),
    pearlOrbInner: lerp(from.pearlOrbInner, to.pearlOrbInner),

    // Navigation - bg blends, text picked for contrast
    navBg: blendedNavBg,
    navActive,
    navInactive,
    pullIndicator,

    // Voice Badge - blend smoothly (these are badge backgrounds, less critical)
    voiceHighBg: lerp(from.voiceHighBg, to.voiceHighBg),
    voiceHighText: lerp(from.voiceHighText, to.voiceHighText),
    voiceHighDot: lerp(from.voiceHighDot, to.voiceHighDot),
    voiceEstablishedBg: lerp(from.voiceEstablishedBg, to.voiceEstablishedBg),
    voiceEstablishedText: lerp(from.voiceEstablishedText, to.voiceEstablishedText),
    voiceEstablishedDot: lerp(from.voiceEstablishedDot, to.voiceEstablishedDot),
    voiceGrowingBg: lerp(from.voiceGrowingBg, to.voiceGrowingBg),
    voiceGrowingText: lerp(from.voiceGrowingText, to.voiceGrowingText),
    voiceGrowingDot: lerp(from.voiceGrowingDot, to.voiceGrowingDot),
    voiceNewBg: lerp(from.voiceNewBg, to.voiceNewBg),
    voiceNewText: lerp(from.voiceNewText, to.voiceNewText),
    voiceNewDot: lerp(from.voiceNewDot, to.voiceNewDot),

    // Meta - use destination values past 50%
    isDark: t < 0.5 ? from.isDark : to.isDark,
    seasonalAccent,
  }
}
