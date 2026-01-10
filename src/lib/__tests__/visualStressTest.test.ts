/**
 * Visual Stress Test for Living Theme
 *
 * Tests all 16 season/time combinations to verify:
 * 1. No NaN values in calculations
 * 2. All values within valid ranges
 * 3. Theme state changes correctly for each combination
 * 4. Effects intensities are appropriate for each state
 *
 * Run with: npm run test:run -- src/lib/__tests__/visualStressTest.test.ts
 */

import { describe, it, expect } from 'vitest'
import {
  calculateLivingTheme,
  calculateManualTheme,
  getSeasonalEffects,
  getManualSeasonalEffects,
  Season,
  TimeOfDay,
  SeasonOption
} from '../livingTheme'

// ============================================================================
// TEST DATA
// ============================================================================

const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter']
const TIMES: TimeOfDay[] = ['morning', 'daytime', 'evening', 'night']
const SEASON_OPTIONS: SeasonOption[] = ['spring', 'summer', 'autumn', 'winter', 'neutral']

const DUBLIN = { lat: 53.3, long: -6.3 }

// ============================================================================
// 16-STATE MATRIX TESTS
// ============================================================================

describe('Visual Stress Test: 16-State Matrix', () => {
  describe('Manual Mode - All 16 Combinations', () => {
    for (const season of SEASON_OPTIONS.filter(s => s !== 'neutral')) {
      for (const time of TIMES) {
        it(`renders ${season} ${time} without errors`, () => {
          const theme = calculateManualTheme(season, time, true, true)

          // Verify no NaN values
          expect(isNaN(theme.sunAltitude)).toBe(false)
          expect(isNaN(theme.sunAzimuth)).toBe(false)
          expect(isNaN(theme.moonAltitude)).toBe(false)
          expect(isNaN(theme.moonAzimuth)).toBe(false)
          expect(isNaN(theme.moonIllumination)).toBe(false)
          expect(isNaN(theme.moonPhaseAngle)).toBe(false)

          // Verify ranges
          expect(theme.sunAltitude).toBeGreaterThanOrEqual(-90)
          expect(theme.sunAltitude).toBeLessThanOrEqual(90)
          expect(theme.sunAzimuth).toBeGreaterThanOrEqual(0)
          expect(theme.sunAzimuth).toBeLessThan(360)
          expect(theme.moonAltitude).toBeGreaterThanOrEqual(-90)
          expect(theme.moonAltitude).toBeLessThanOrEqual(90)
          expect(theme.moonAzimuth).toBeGreaterThanOrEqual(0)
          expect(theme.moonAzimuth).toBeLessThan(360)
          expect(theme.moonIllumination).toBeGreaterThanOrEqual(0)
          expect(theme.moonIllumination).toBeLessThanOrEqual(100)

          // Verify season and timeOfDay are set correctly
          expect(theme.season).toBe(season)
          expect(theme.timeOfDay).toBe(time)

          // Verify effects are valid
          expect(theme.effects.stars).toBeGreaterThanOrEqual(0)
          expect(theme.effects.stars).toBeLessThanOrEqual(1)
          expect(theme.effects.particles).toBeGreaterThanOrEqual(0)
          expect(theme.effects.particles).toBeLessThanOrEqual(1)
          expect(theme.effects.moon).toBeGreaterThanOrEqual(0)
          expect(theme.effects.moon).toBeLessThanOrEqual(1)
        })
      }
    }
  })

  describe('Auto Mode - Location-Based Calculations', () => {
    // Test at different times throughout the day
    const testDates = [
      new Date('2024-01-15T06:00:00'), // Winter morning
      new Date('2024-01-15T12:00:00'), // Winter noon
      new Date('2024-01-15T18:00:00'), // Winter evening
      new Date('2024-01-15T23:00:00'), // Winter night
      new Date('2024-06-15T06:00:00'), // Summer morning
      new Date('2024-06-15T12:00:00'), // Summer noon
      new Date('2024-06-15T18:00:00'), // Summer evening
      new Date('2024-06-15T23:00:00'), // Summer night
      new Date('2024-03-20T12:00:00'), // Equinox
      new Date('2024-09-22T12:00:00'), // Equinox
    ]

    for (const date of testDates) {
      it(`renders correctly at ${date.toISOString()}`, () => {
        const theme = calculateLivingTheme(DUBLIN, date, true, true)

        // Verify no NaN values
        expect(isNaN(theme.sunAltitude)).toBe(false)
        expect(isNaN(theme.sunAzimuth)).toBe(false)
        expect(isNaN(theme.moonAltitude)).toBe(false)
        expect(isNaN(theme.moonAzimuth)).toBe(false)

        // Verify ranges
        expect(theme.sunAltitude).toBeGreaterThanOrEqual(-90)
        expect(theme.sunAltitude).toBeLessThanOrEqual(90)
        expect(theme.moonIllumination).toBeGreaterThanOrEqual(0)
        expect(theme.moonIllumination).toBeLessThanOrEqual(100)

        // Verify valid season
        expect(SEASONS).toContain(theme.season)
        expect(TIMES).toContain(theme.timeOfDay)
      })
    }
  })

  describe('Seasonal Effects - All Combinations', () => {
    for (const season of SEASONS) {
      for (const time of TIMES) {
        it(`returns valid effects for ${season} ${time}`, () => {
          const effects = getSeasonalEffects(season, time, true)

          // Verify particle type is valid
          expect(['snow', 'leaves', 'fireflies', 'mist', 'none']).toContain(effects.particleType)

          // Verify multiplier is reasonable
          expect(effects.particleMultiplier).toBeGreaterThanOrEqual(0)
          expect(effects.particleMultiplier).toBeLessThanOrEqual(3)

          // Verify booleans
          expect(typeof effects.harvestMoon).toBe('boolean')
          expect(typeof effects.aurora).toBe('boolean')

          // Aurora should only be in winter night
          if (effects.aurora) {
            expect(season).toBe('winter')
            expect(time).toBe('night')
          }

          // Harvest moon should only be in autumn
          if (effects.harvestMoon) {
            expect(season).toBe('autumn')
          }
        })

        it(`returns valid manual effects for ${season} ${time}`, () => {
          const effects = getManualSeasonalEffects(season, time, true)

          expect(['snow', 'leaves', 'fireflies', 'mist', 'none']).toContain(effects.particleType)
          expect(typeof effects.harvestMoon).toBe('boolean')
          expect(typeof effects.aurora).toBe('boolean')
        })
      }
    }
  })
})

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe('Visual Stress Test: Edge Cases', () => {
  it('handles night time correctly', () => {
    const night = calculateManualTheme('winter', 'night', true, true)

    expect(night.timeOfDay).toBe('night')
    expect(night.effects.ambientDarkness).toBeGreaterThan(0.5)
  })

  it('handles expressive mode toggle', () => {
    const expressive = calculateManualTheme('winter', 'night', true, true)
    const subtle = calculateManualTheme('winter', 'night', false, true)

    // Both should work without errors
    expect(expressive.effects).toBeDefined()
    expect(subtle.effects).toBeDefined()
  })

  it('handles extreme latitudes', () => {
    const arctic = { lat: 89, long: 0 }
    const antarctic = { lat: -89, long: 0 }
    const summerDate = new Date('2024-06-21T12:00:00')

    const arcticTheme = calculateLivingTheme(arctic, summerDate, true, true)
    const antarcticTheme = calculateLivingTheme(antarctic, summerDate, true, true)

    // Should not produce NaN
    expect(isNaN(arcticTheme.sunAltitude)).toBe(false)
    expect(isNaN(antarcticTheme.sunAltitude)).toBe(false)
    expect(isNaN(arcticTheme.moonAltitude)).toBe(false)
    expect(isNaN(antarcticTheme.moonAltitude)).toBe(false)
  })

  it('handles equatorial location', () => {
    const equator = { lat: 0, long: 0 }
    const theme = calculateLivingTheme(equator, new Date(), true, true)

    expect(isNaN(theme.sunAltitude)).toBe(false)
    expect(isNaN(theme.moonAltitude)).toBe(false)
  })

  it('handles international date line', () => {
    const east = { lat: 0, long: 179 }
    const west = { lat: 0, long: -179 }

    const eastTheme = calculateLivingTheme(east, new Date(), true, true)
    const westTheme = calculateLivingTheme(west, new Date(), true, true)

    expect(isNaN(eastTheme.sunAltitude)).toBe(false)
    expect(isNaN(westTheme.sunAltitude)).toBe(false)
  })
})

// ============================================================================
// CELESTIAL BODY CONSISTENCY TESTS
// ============================================================================

describe('Visual Stress Test: Celestial Body Consistency', () => {
  it('sun altitude matches expected pattern (high at noon)', () => {
    const morning = calculateManualTheme('summer', 'morning', true, true)
    const daytime = calculateManualTheme('summer', 'daytime', true, true)
    const evening = calculateManualTheme('summer', 'evening', true, true)

    // Daytime should have highest sun
    expect(daytime.sunAltitude).toBeGreaterThan(morning.sunAltitude)
    expect(daytime.sunAltitude).toBeGreaterThan(evening.sunAltitude)
  })

  it('moon visibility correlates with intensity', () => {
    const night = calculateManualTheme('winter', 'night', true, true)

    // At night, moon should be visible (intensity > 0 when above horizon)
    if (night.moonAltitude > 0) {
      expect(night.effects.moon).toBeGreaterThan(0)
    }
  })

  it('stars visible at night, not during day', () => {
    const day = calculateManualTheme('summer', 'daytime', true, true)
    const night = calculateManualTheme('summer', 'night', true, true)

    expect(night.effects.stars).toBeGreaterThan(day.effects.stars)
  })

  it('moon phase progresses correctly over month', () => {
    const phases: string[] = []
    const baseDate = new Date('2024-01-11T12:00:00Z') // New moon

    for (let i = 0; i < 30; i += 4) {
      const date = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000)
      const theme = calculateLivingTheme(DUBLIN, date, true, true)
      if (!phases.includes(theme.moonPhase)) {
        phases.push(theme.moonPhase)
      }
    }

    // Should see multiple phases over a month
    expect(phases.length).toBeGreaterThan(3)
  })
})

// ============================================================================
// EFFECTS INTENSITY VALIDATION
// ============================================================================

describe('Visual Stress Test: Effects Intensity Validation', () => {
  it('all effect values are between 0 and 1', () => {
    for (const season of SEASONS) {
      for (const time of TIMES) {
        const theme = calculateManualTheme(season as SeasonOption, time, true, true)

        expect(theme.effects.stars).toBeGreaterThanOrEqual(0)
        expect(theme.effects.stars).toBeLessThanOrEqual(1)
        expect(theme.effects.particles).toBeGreaterThanOrEqual(0)
        expect(theme.effects.particles).toBeLessThanOrEqual(1)
        expect(theme.effects.moon).toBeGreaterThanOrEqual(0)
        expect(theme.effects.moon).toBeLessThanOrEqual(1)
        expect(theme.effects.shootingStars).toBeGreaterThanOrEqual(0)
        expect(theme.effects.shootingStars).toBeLessThanOrEqual(1)
        expect(theme.effects.grain).toBeGreaterThanOrEqual(0)
        expect(theme.effects.grain).toBeLessThanOrEqual(1)
        expect(theme.effects.ambientDarkness).toBeGreaterThanOrEqual(0)
        expect(theme.effects.ambientDarkness).toBeLessThanOrEqual(1)
      }
    }
  })

  it('directional light intensity and warmth are valid', () => {
    for (const season of SEASONS) {
      for (const time of TIMES) {
        const theme = calculateManualTheme(season as SeasonOption, time, true, true)

        expect(theme.effects.directionalLight.intensity).toBeGreaterThanOrEqual(0)
        expect(theme.effects.directionalLight.intensity).toBeLessThanOrEqual(1)
        expect(theme.effects.directionalLight.warmth).toBeGreaterThanOrEqual(0)
        expect(theme.effects.directionalLight.warmth).toBeLessThanOrEqual(1)
      }
    }
  })
})
