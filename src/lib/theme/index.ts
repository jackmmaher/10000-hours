/**
 * Theme Engine - Barrel Export
 *
 * Living Theme System with season-aware, time-of-day theming.
 */

// Types
export type { TimeOfDay, Season, ThemeTokens } from './types'
export { SEASONAL_TIME_BOUNDARIES } from './types'

// Detection
export { getTimeOfDay, getSeason, detectSouthernHemisphere } from './detection'

// Color utilities
export {
  hexToRgb,
  parseRgba,
  rgbToHex,
  getRelativeLuminance,
  getContrastRatio,
  getSaturation,
  pickBetterContrastText,
  pickMoreSaturatedColor,
  interpolateColor,
} from './colorUtils'

// Theme tokens
export {
  SEASON_THEMES,
  WINTER_THEMES,
  WINTER_MORNING,
  WINTER_DAYTIME,
  WINTER_EVENING,
  WINTER_NIGHT,
  SPRING_THEMES,
  SPRING_MORNING,
  SPRING_DAYTIME,
  SPRING_EVENING,
  SPRING_NIGHT,
  SUMMER_THEMES,
  SUMMER_MORNING,
  SUMMER_DAYTIME,
  SUMMER_EVENING,
  SUMMER_NIGHT,
  AUTUMN_THEMES,
  AUTUMN_MORNING,
  AUTUMN_DAYTIME,
  AUTUMN_EVENING,
  AUTUMN_NIGHT,
  NEUTRAL_LIGHT,
  NEUTRAL_DARK,
} from './tokens'

// Calculation
export {
  getThemeTokens,
  calculateTheme,
  calculateThemeBySunPosition,
  getTimeOfDayFromSunPosition,
} from './calculation'

// Interpolation
export { interpolateThemes } from './interpolation'

// CSS Properties
export { themeToCSSProperties, getThemeName } from './cssProperties'
