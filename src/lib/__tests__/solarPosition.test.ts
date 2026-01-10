/**
 * Solar and Lunar Position Tests
 *
 * Critical tests for celestial body calculations.
 * These algorithms drive the visual rendering - errors here break the sky.
 */

import { describe, it, expect } from 'vitest'
import {
  calculateSunPosition,
  calculateMoonPosition,
  calculateMoonPhase,
  calculateSunriseSunset,
  calculateMaxSolarAltitude,
  estimateLocationFromTimezone,
  getSolarStateDescription
} from '../solarPosition'

// ============================================================================
// TEST LOCATIONS
// ============================================================================

const DUBLIN = { lat: 53.3, long: -6.3 }
const NEW_YORK = { lat: 40.7, long: -74.0 }
const SYDNEY = { lat: -33.9, long: 151.2 }
const EQUATOR = { lat: 0, long: 0 }
const NORTH_POLE = { lat: 89.9, long: 0 }
const SOUTH_POLE = { lat: -89.9, long: 0 }

// ============================================================================
// MOON PHASE TESTS - Critical for visual accuracy
// ============================================================================

describe('calculateMoonPhase', () => {
  it('returns valid phase names', () => {
    const validPhases = [
      'new', 'waxing-crescent', 'first-quarter', 'waxing-gibbous',
      'full', 'waning-gibbous', 'last-quarter', 'waning-crescent'
    ]

    // Test across an entire lunar cycle (30 days)
    for (let i = 0; i < 30; i++) {
      const date = new Date('2024-01-01')
      date.setDate(date.getDate() + i)
      const result = calculateMoonPhase(date)
      expect(validPhases).toContain(result.phase)
    }
  })

  it('returns illumination between 0-100', () => {
    // Test many dates to ensure bounds are respected
    for (let i = 0; i < 60; i++) {
      const date = new Date('2024-01-01')
      date.setDate(date.getDate() + i)
      const result = calculateMoonPhase(date)
      expect(result.illumination).toBeGreaterThanOrEqual(0)
      expect(result.illumination).toBeLessThanOrEqual(100)
    }
  })

  it('returns angle between 0-360', () => {
    for (let i = 0; i < 60; i++) {
      const date = new Date('2024-01-01')
      date.setDate(date.getDate() + i)
      const result = calculateMoonPhase(date)
      expect(result.angle).toBeGreaterThanOrEqual(0)
      expect(result.angle).toBeLessThan(360)
    }
  })

  // Known moon phases for verification
  // Reference: timeanddate.com
  it('calculates new moon correctly (Jan 11, 2024)', () => {
    // Jan 11, 2024 was a new moon
    const newMoon = new Date('2024-01-11T12:00:00Z')
    const result = calculateMoonPhase(newMoon)
    expect(result.phase).toBe('new')
    expect(result.illumination).toBeLessThan(5)
  })

  it('calculates full moon correctly (~14.75 days after new)', () => {
    // Full moon is ~14.75 days after new moon
    // Jan 11, 2024 new moon + 14.75 days = Jan 25-26
    const newMoon = new Date('2024-01-11T12:00:00Z')
    const fullMoon = new Date(newMoon.getTime() + 14.75 * 24 * 60 * 60 * 1000)
    const result = calculateMoonPhase(fullMoon)
    expect(result.phase).toBe('full')
    expect(result.illumination).toBeGreaterThan(95)
  })

  it('calculates first quarter correctly (~7 days after new)', () => {
    // First quarter is ~7.4 days after new moon
    const newMoon = new Date('2024-01-11T12:00:00Z')
    const firstQuarter = new Date(newMoon.getTime() + 7.4 * 24 * 60 * 60 * 1000)
    const result = calculateMoonPhase(firstQuarter)
    expect(result.phase).toBe('first-quarter')
    expect(result.illumination).toBeGreaterThan(45)
    expect(result.illumination).toBeLessThan(55)
  })

  it('calculates last quarter correctly (~22 days after new)', () => {
    // Last quarter is ~22 days after new moon
    const newMoon = new Date('2024-01-11T12:00:00Z')
    const lastQuarter = new Date(newMoon.getTime() + 22 * 24 * 60 * 60 * 1000)
    const result = calculateMoonPhase(lastQuarter)
    expect(result.phase).toBe('last-quarter')
    expect(result.illumination).toBeGreaterThan(45)
    expect(result.illumination).toBeLessThan(55)
  })

  it('illumination peaks at full moon', () => {
    // Sample across a full lunar cycle and verify full moon has max illumination
    const start = new Date('2024-01-11T12:00:00Z') // new moon
    let maxIllumination = 0
    let maxDate = start

    for (let i = 0; i < 30; i++) {
      const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000)
      const result = calculateMoonPhase(date)
      if (result.illumination > maxIllumination) {
        maxIllumination = result.illumination
        maxDate = date
      }
    }

    // Full moon should be around day 14-15
    const daysFromStart = (maxDate.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
    expect(daysFromStart).toBeGreaterThan(12)
    expect(daysFromStart).toBeLessThan(17)
    expect(maxIllumination).toBeGreaterThan(98)
  })

  it('phases cycle in correct order', () => {
    const start = new Date('2024-01-11T12:00:00Z') // new moon
    const phases: string[] = []

    for (let i = 0; i < 30; i += 4) {
      const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000)
      const result = calculateMoonPhase(date)
      if (!phases.includes(result.phase)) {
        phases.push(result.phase)
      }
    }

    // Should see phases in waxing order first, then waning
    const waxingIndex = phases.findIndex(p => p.includes('waxing'))
    const fullIndex = phases.findIndex(p => p === 'full')
    const waningIndex = phases.findIndex(p => p.includes('waning'))

    expect(waxingIndex).toBeLessThan(fullIndex)
    expect(fullIndex).toBeLessThan(waningIndex)
  })
})

// ============================================================================
// MOON POSITION TESTS
// ============================================================================

describe('calculateMoonPosition', () => {
  it('returns altitude between -90 and 90 degrees', () => {
    const locations = [DUBLIN, NEW_YORK, SYDNEY, EQUATOR]
    const dates = [
      new Date('2024-01-15T12:00:00'),
      new Date('2024-06-15T12:00:00'),
      new Date('2024-03-20T12:00:00')
    ]

    for (const loc of locations) {
      for (const date of dates) {
        const result = calculateMoonPosition(loc.lat, loc.long, date)
        expect(result.altitude).toBeGreaterThanOrEqual(-90)
        expect(result.altitude).toBeLessThanOrEqual(90)
      }
    }
  })

  it('returns azimuth between 0 and 360 degrees', () => {
    const locations = [DUBLIN, NEW_YORK, SYDNEY, EQUATOR]

    for (const loc of locations) {
      const result = calculateMoonPosition(loc.lat, loc.long)
      expect(result.azimuth).toBeGreaterThanOrEqual(0)
      expect(result.azimuth).toBeLessThan(360)
    }
  })

  it('returns isRising boolean', () => {
    const result = calculateMoonPosition(DUBLIN.lat, DUBLIN.long)
    expect(typeof result.isRising).toBe('boolean')
  })

  it('moon position changes over hours', () => {
    const date1 = new Date('2024-01-15T12:00:00')
    const date2 = new Date('2024-01-15T18:00:00')

    const pos1 = calculateMoonPosition(DUBLIN.lat, DUBLIN.long, date1)
    const pos2 = calculateMoonPosition(DUBLIN.lat, DUBLIN.long, date2)

    // Position should change measurably over 6 hours
    const altDiff = Math.abs(pos1.altitude - pos2.altitude)
    const azDiff = Math.abs(pos1.azimuth - pos2.azimuth)

    expect(altDiff + azDiff).toBeGreaterThan(1) // At least 1 degree change
  })

  it('handles edge case: polar regions', () => {
    // Should not throw or return NaN
    const northResult = calculateMoonPosition(NORTH_POLE.lat, NORTH_POLE.long)
    const southResult = calculateMoonPosition(SOUTH_POLE.lat, SOUTH_POLE.long)

    expect(isNaN(northResult.altitude)).toBe(false)
    expect(isNaN(northResult.azimuth)).toBe(false)
    expect(isNaN(southResult.altitude)).toBe(false)
    expect(isNaN(southResult.azimuth)).toBe(false)
  })

  it('handles edge case: equator', () => {
    const result = calculateMoonPosition(EQUATOR.lat, EQUATOR.long)
    expect(isNaN(result.altitude)).toBe(false)
    expect(isNaN(result.azimuth)).toBe(false)
  })
})

// ============================================================================
// SUN POSITION TESTS
// ============================================================================

describe('calculateSunPosition', () => {
  it('returns altitude between -90 and 90 degrees', () => {
    const locations = [DUBLIN, NEW_YORK, SYDNEY, EQUATOR]

    for (const loc of locations) {
      const result = calculateSunPosition(loc.lat, loc.long)
      expect(result.altitude).toBeGreaterThanOrEqual(-90)
      expect(result.altitude).toBeLessThanOrEqual(90)
    }
  })

  it('returns azimuth between 0 and 360 degrees', () => {
    const result = calculateSunPosition(DUBLIN.lat, DUBLIN.long)
    expect(result.azimuth).toBeGreaterThanOrEqual(0)
    expect(result.azimuth).toBeLessThan(360)
  })

  it('sun is high at noon, low at midnight', () => {
    // Dublin at noon vs midnight on same day
    const noon = new Date('2024-06-21T12:00:00')
    const midnight = new Date('2024-06-21T00:00:00')

    const noonPos = calculateSunPosition(DUBLIN.lat, DUBLIN.long, noon)
    const midnightPos = calculateSunPosition(DUBLIN.lat, DUBLIN.long, midnight)

    expect(noonPos.altitude).toBeGreaterThan(midnightPos.altitude)
  })

  it('sun is higher in summer than winter (northern hemisphere)', () => {
    const summerNoon = new Date('2024-06-21T12:00:00')
    const winterNoon = new Date('2024-12-21T12:00:00')

    const summer = calculateSunPosition(DUBLIN.lat, DUBLIN.long, summerNoon)
    const winter = calculateSunPosition(DUBLIN.lat, DUBLIN.long, winterNoon)

    expect(summer.altitude).toBeGreaterThan(winter.altitude)
  })

  it('isRising is true before noon, false after', () => {
    const morning = new Date('2024-06-21T08:00:00')
    const evening = new Date('2024-06-21T18:00:00')

    const morningPos = calculateSunPosition(DUBLIN.lat, DUBLIN.long, morning)
    const eveningPos = calculateSunPosition(DUBLIN.lat, DUBLIN.long, evening)

    expect(morningPos.isRising).toBe(true)
    expect(eveningPos.isRising).toBe(false)
  })

  it('handles polar regions without NaN', () => {
    const northResult = calculateSunPosition(NORTH_POLE.lat, NORTH_POLE.long)
    const southResult = calculateSunPosition(SOUTH_POLE.lat, SOUTH_POLE.long)

    expect(isNaN(northResult.altitude)).toBe(false)
    expect(isNaN(northResult.azimuth)).toBe(false)
    expect(isNaN(southResult.altitude)).toBe(false)
    expect(isNaN(southResult.azimuth)).toBe(false)
  })
})

// ============================================================================
// SUNRISE/SUNSET TESTS
// ============================================================================

describe('calculateSunriseSunset', () => {
  it('sunrise is before sunset', () => {
    const result = calculateSunriseSunset(DUBLIN.lat, DUBLIN.long)
    expect(result.sunrise).toBeLessThan(result.sunset)
  })

  it('solar noon is between sunrise and sunset', () => {
    const result = calculateSunriseSunset(DUBLIN.lat, DUBLIN.long)
    expect(result.solarNoon).toBeGreaterThan(result.sunrise)
    expect(result.solarNoon).toBeLessThan(result.sunset)
  })

  it('returns reasonable hours (0-24)', () => {
    const result = calculateSunriseSunset(DUBLIN.lat, DUBLIN.long)
    expect(result.sunrise).toBeGreaterThanOrEqual(0)
    expect(result.sunrise).toBeLessThan(24)
    expect(result.sunset).toBeGreaterThanOrEqual(0)
    expect(result.sunset).toBeLessThanOrEqual(24)
    expect(result.solarNoon).toBeGreaterThanOrEqual(0)
    expect(result.solarNoon).toBeLessThan(24)
  })

  it('days are longer in summer (northern hemisphere)', () => {
    const summer = new Date('2024-06-21')
    const winter = new Date('2024-12-21')

    const summerTimes = calculateSunriseSunset(DUBLIN.lat, DUBLIN.long, summer)
    const winterTimes = calculateSunriseSunset(DUBLIN.lat, DUBLIN.long, winter)

    const summerDayLength = summerTimes.sunset - summerTimes.sunrise
    const winterDayLength = winterTimes.sunset - winterTimes.sunrise

    expect(summerDayLength).toBeGreaterThan(winterDayLength)
  })
})

// ============================================================================
// MAX SOLAR ALTITUDE TESTS
// ============================================================================

describe('calculateMaxSolarAltitude', () => {
  it('returns value between 0 and 90', () => {
    const locations = [DUBLIN, NEW_YORK, SYDNEY, EQUATOR]

    for (const loc of locations) {
      const result = calculateMaxSolarAltitude(loc.lat)
      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThanOrEqual(90)
    }
  })

  it('equator has highest max altitude on equinox', () => {
    const equinox = new Date('2024-03-20')
    const equatorMax = calculateMaxSolarAltitude(EQUATOR.lat, equinox)

    // On equinox, sun is directly overhead at equator (~90 degrees)
    expect(equatorMax).toBeGreaterThan(85)
  })

  it('max altitude is higher in summer than winter (non-tropical)', () => {
    const summer = new Date('2024-06-21')
    const winter = new Date('2024-12-21')

    const summerMax = calculateMaxSolarAltitude(DUBLIN.lat, summer)
    const winterMax = calculateMaxSolarAltitude(DUBLIN.lat, winter)

    expect(summerMax).toBeGreaterThan(winterMax)
  })
})

// ============================================================================
// UTILITY FUNCTION TESTS
// ============================================================================

describe('getSolarStateDescription', () => {
  it('returns daytime for high sun', () => {
    expect(getSolarStateDescription(45, true)).toBe('Daytime (sun high)')
    expect(getSolarStateDescription(30, false)).toBe('Daytime (sun high)')
  })

  it('returns golden hour for low sun', () => {
    expect(getSolarStateDescription(5, false)).toBe('Golden hour (sun setting)')
    expect(getSolarStateDescription(10, true)).toBe('Morning (sun rising)')
  })

  it('returns twilight for below horizon', () => {
    expect(getSolarStateDescription(-3, true)).toBe('Dawn (civil twilight)')
    expect(getSolarStateDescription(-3, false)).toBe('Dusk (civil twilight)')
  })

  it('returns night for deep below horizon', () => {
    expect(getSolarStateDescription(-20, false)).toBe('Night (full darkness)')
    expect(getSolarStateDescription(-45, true)).toBe('Night (full darkness)')
  })
})

describe('estimateLocationFromTimezone', () => {
  it('returns valid coordinates', () => {
    const result = estimateLocationFromTimezone()
    expect(result.lat).toBeGreaterThanOrEqual(-90)
    expect(result.lat).toBeLessThanOrEqual(90)
    expect(result.long).toBeGreaterThanOrEqual(-180)
    expect(result.long).toBeLessThanOrEqual(180)
  })
})

// ============================================================================
// EDGE CASE STRESS TESTS
// ============================================================================

describe('edge cases and stress tests', () => {
  it('handles date far in past', () => {
    const oldDate = new Date('1900-01-01T12:00:00')
    const sunPos = calculateSunPosition(DUBLIN.lat, DUBLIN.long, oldDate)
    const moonPos = calculateMoonPosition(DUBLIN.lat, DUBLIN.long, oldDate)
    const moonPhase = calculateMoonPhase(oldDate)

    expect(isNaN(sunPos.altitude)).toBe(false)
    expect(isNaN(moonPos.altitude)).toBe(false)
    expect(moonPhase.illumination).toBeGreaterThanOrEqual(0)
  })

  it('handles date far in future', () => {
    const futureDate = new Date('2100-01-01T12:00:00')
    const sunPos = calculateSunPosition(DUBLIN.lat, DUBLIN.long, futureDate)
    const moonPos = calculateMoonPosition(DUBLIN.lat, DUBLIN.long, futureDate)
    const moonPhase = calculateMoonPhase(futureDate)

    expect(isNaN(sunPos.altitude)).toBe(false)
    expect(isNaN(moonPos.altitude)).toBe(false)
    expect(moonPhase.illumination).toBeGreaterThanOrEqual(0)
  })

  it('handles midnight correctly', () => {
    const midnight = new Date('2024-06-21T00:00:00')
    const sunPos = calculateSunPosition(DUBLIN.lat, DUBLIN.long, midnight)

    // Sun should be below horizon at midnight in Dublin
    expect(sunPos.altitude).toBeLessThan(0)
  })

  it('handles extreme longitudes', () => {
    const pos1 = calculateSunPosition(45, -179)
    const pos2 = calculateSunPosition(45, 179)

    expect(isNaN(pos1.altitude)).toBe(false)
    expect(isNaN(pos2.altitude)).toBe(false)
  })

  it('consistent results across rapid calls', () => {
    // Same inputs should give same outputs
    const date = new Date('2024-06-21T12:00:00')
    const results = []

    for (let i = 0; i < 10; i++) {
      results.push(calculateMoonPhase(date))
    }

    // All should be identical
    for (let i = 1; i < results.length; i++) {
      expect(results[i].phase).toBe(results[0].phase)
      expect(results[i].illumination).toBe(results[0].illumination)
      expect(results[i].angle).toBe(results[0].angle)
    }
  })
})
