/**
 * Theme Tokens - Barrel Export
 */

import type { ThemeTokens, TimeOfDay, Season } from '../types'
import { WINTER_THEMES } from './winter'
import { SPRING_THEMES } from './spring'
import { SUMMER_THEMES } from './summer'
import { AUTUMN_THEMES } from './autumn'

// Re-export individual seasons
export {
  WINTER_THEMES,
  WINTER_MORNING,
  WINTER_DAYTIME,
  WINTER_EVENING,
  WINTER_NIGHT,
} from './winter'
export {
  SPRING_THEMES,
  SPRING_MORNING,
  SPRING_DAYTIME,
  SPRING_EVENING,
  SPRING_NIGHT,
} from './spring'
export {
  SUMMER_THEMES,
  SUMMER_MORNING,
  SUMMER_DAYTIME,
  SUMMER_EVENING,
  SUMMER_NIGHT,
} from './summer'
export {
  AUTUMN_THEMES,
  AUTUMN_MORNING,
  AUTUMN_DAYTIME,
  AUTUMN_EVENING,
  AUTUMN_NIGHT,
} from './autumn'
export { NEUTRAL_LIGHT, NEUTRAL_DARK } from './neutral'

/**
 * All season themes indexed by season
 */
export const SEASON_THEMES: Record<Season, Record<TimeOfDay, ThemeTokens>> = {
  winter: WINTER_THEMES,
  spring: SPRING_THEMES,
  summer: SUMMER_THEMES,
  autumn: AUTUMN_THEMES,
}
