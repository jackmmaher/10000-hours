/**
 * Theme Engine - Living Theme System
 *
 * A comprehensive theming system that creates distinct visual identities
 * for each time of day and season combination.
 *
 * Architecture:
 * - 4 Seasons: Spring, Summer, Autumn, Winter
 * - 4 Times of Day: Morning (5-11), Daytime (11-17), Evening (17-21), Night (21-5)
 * - 16 total theme combinations
 *
 * This file is a barrel re-export for backward compatibility.
 * See src/lib/theme/ for the modular implementation.
 */

// Types
export type { TimeOfDay, Season, ThemeTokens } from './theme'
export { SEASONAL_TIME_BOUNDARIES } from './theme'

// Detection functions
export { getTimeOfDay, getSeason, detectSouthernHemisphere } from './theme'

// Theme tokens - all 16 season/time combinations + neutrals
export {
  SEASON_THEMES,
  WINTER_MORNING,
  WINTER_DAYTIME,
  WINTER_EVENING,
  WINTER_NIGHT,
  SPRING_MORNING,
  SPRING_DAYTIME,
  SPRING_EVENING,
  SPRING_NIGHT,
  SUMMER_MORNING,
  SUMMER_DAYTIME,
  SUMMER_EVENING,
  SUMMER_NIGHT,
  AUTUMN_MORNING,
  AUTUMN_DAYTIME,
  AUTUMN_EVENING,
  AUTUMN_NIGHT,
  NEUTRAL_LIGHT,
  NEUTRAL_DARK,
} from './theme'

// Theme calculation functions
export {
  getThemeTokens,
  calculateTheme,
  calculateThemeBySunPosition,
  getTimeOfDayFromSunPosition,
} from './theme'

// Theme interpolation
export { interpolateThemes } from './theme'

// CSS conversion
export { themeToCSSProperties, getThemeName } from './theme'
