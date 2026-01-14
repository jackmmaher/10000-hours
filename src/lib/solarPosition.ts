/**
 * Solar Position Calculator
 *
 * Calculates sun altitude for any location and time using astronomical formulas.
 * Used by the Living Theme system for continuous, location-aware theme blending.
 *
 * No external dependencies - pure math.
 */

// ============================================================================
// LOCATION DETECTION
// ============================================================================

interface Location {
  lat: number
  long: number
}

const LOCATION_CACHE_KEY = 'solar-theme-location'

/**
 * Get user's approximate location
 * - First checks localStorage cache
 * - Falls back to IP-based geolocation (one-time API call)
 * - Final fallback: timezone inference
 */
export async function getLocation(): Promise<Location> {
  // Check cache first
  const cached = localStorage.getItem(LOCATION_CACHE_KEY)
  if (cached) {
    try {
      return JSON.parse(cached)
    } catch {
      // Invalid cache, continue to fetch
    }
  }

  // Try IP-based geolocation (HTTPS for security)
  try {
    const response = await fetch('https://ip-api.com/json/?fields=lat,lon', {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    if (response.ok) {
      const data = await response.json()
      if (data.lat && data.lon) {
        const location = { lat: data.lat, long: data.lon }
        localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location))
        return location
      }
    }
  } catch {
    // IP lookup failed, fall through to timezone inference
  }

  // Fallback: estimate from timezone
  const location = estimateLocationFromTimezone()
  localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location))
  return location
}

/**
 * Estimate latitude from timezone name
 * This is a rough approximation but works offline
 */
export function estimateLocationFromTimezone(): Location {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Map common timezones to approximate coordinates
  const timezoneCoordinates: Record<string, Location> = {
    // Europe
    'Europe/Dublin': { lat: 53.3, long: -6.3 },
    'Europe/London': { lat: 51.5, long: -0.1 },
    'Europe/Paris': { lat: 48.9, long: 2.3 },
    'Europe/Berlin': { lat: 52.5, long: 13.4 },
    'Europe/Rome': { lat: 41.9, long: 12.5 },
    'Europe/Madrid': { lat: 40.4, long: -3.7 },
    'Europe/Amsterdam': { lat: 52.4, long: 4.9 },
    'Europe/Stockholm': { lat: 59.3, long: 18.1 },
    'Europe/Oslo': { lat: 59.9, long: 10.8 },
    'Europe/Helsinki': { lat: 60.2, long: 24.9 },
    'Europe/Warsaw': { lat: 52.2, long: 21.0 },
    'Europe/Prague': { lat: 50.1, long: 14.4 },
    'Europe/Vienna': { lat: 48.2, long: 16.4 },
    'Europe/Zurich': { lat: 47.4, long: 8.5 },
    'Europe/Brussels': { lat: 50.8, long: 4.4 },
    'Europe/Lisbon': { lat: 38.7, long: -9.1 },
    'Europe/Athens': { lat: 37.98, long: 23.7 },
    'Europe/Moscow': { lat: 55.8, long: 37.6 },

    // Americas
    'America/New_York': { lat: 40.7, long: -74.0 },
    'America/Los_Angeles': { lat: 34.1, long: -118.2 },
    'America/Chicago': { lat: 41.9, long: -87.6 },
    'America/Denver': { lat: 39.7, long: -105.0 },
    'America/Phoenix': { lat: 33.4, long: -112.1 },
    'America/Toronto': { lat: 43.7, long: -79.4 },
    'America/Vancouver': { lat: 49.3, long: -123.1 },
    'America/Mexico_City': { lat: 19.4, long: -99.1 },
    'America/Sao_Paulo': { lat: -23.5, long: -46.6 },
    'America/Buenos_Aires': { lat: -34.6, long: -58.4 },
    'America/Santiago': { lat: -33.4, long: -70.6 },
    'America/Bogota': { lat: 4.6, long: -74.1 },
    'America/Lima': { lat: -12.0, long: -77.0 },

    // Asia
    'Asia/Tokyo': { lat: 35.7, long: 139.7 },
    'Asia/Shanghai': { lat: 31.2, long: 121.5 },
    'Asia/Hong_Kong': { lat: 22.3, long: 114.2 },
    'Asia/Singapore': { lat: 1.3, long: 103.8 },
    'Asia/Seoul': { lat: 37.6, long: 127.0 },
    'Asia/Bangkok': { lat: 13.8, long: 100.5 },
    'Asia/Mumbai': { lat: 19.1, long: 72.9 },
    'Asia/Delhi': { lat: 28.6, long: 77.2 },
    'Asia/Dubai': { lat: 25.2, long: 55.3 },
    'Asia/Jakarta': { lat: -6.2, long: 106.8 },
    'Asia/Manila': { lat: 14.6, long: 121.0 },
    'Asia/Taipei': { lat: 25.0, long: 121.5 },
    'Asia/Kolkata': { lat: 22.6, long: 88.4 },

    // Oceania
    'Australia/Sydney': { lat: -33.9, long: 151.2 },
    'Australia/Melbourne': { lat: -37.8, long: 145.0 },
    'Australia/Brisbane': { lat: -27.5, long: 153.0 },
    'Australia/Perth': { lat: -31.9, long: 115.9 },
    'Pacific/Auckland': { lat: -36.8, long: 174.8 },

    // Africa
    'Africa/Cairo': { lat: 30.0, long: 31.2 },
    'Africa/Johannesburg': { lat: -26.2, long: 28.0 },
    'Africa/Lagos': { lat: 6.5, long: 3.4 },
    'Africa/Nairobi': { lat: -1.3, long: 36.8 },
    'Africa/Casablanca': { lat: 33.6, long: -7.6 },
  }

  // Check for exact match
  if (timezoneCoordinates[tz]) {
    return timezoneCoordinates[tz]
  }

  // Try to find a partial match (e.g., "Europe/Dublin" matches "Europe")
  const region = tz.split('/')[0]
  const regionDefaults: Record<string, Location> = {
    Europe: { lat: 50, long: 10 }, // Central Europe
    America: { lat: 40, long: -100 }, // Central US
    Asia: { lat: 35, long: 105 }, // Central Asia
    Australia: { lat: -25, long: 135 }, // Central Australia
    Pacific: { lat: -20, long: 170 }, // Pacific islands
    Africa: { lat: 0, long: 20 }, // Central Africa
  }

  if (regionDefaults[region]) {
    return regionDefaults[region]
  }

  // Ultimate fallback: Greenwich
  return { lat: 51.5, long: 0 }
}

// ============================================================================
// SOLAR POSITION CALCULATION
// ============================================================================

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

/**
 * Calculate Julian Date from JavaScript Date
 */
function toJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5
}

/**
 * Calculate sun position for a given location and time
 * Returns altitude in degrees and whether the sun is rising or setting
 *
 * Based on NOAA solar calculator algorithms
 * https://gml.noaa.gov/grad/solcalc/calcdetails.html
 */
export function calculateSunPosition(
  lat: number,
  long: number,
  date: Date = new Date()
): { altitude: number; azimuth: number; isRising: boolean } {
  const jd = toJulianDate(date)
  const jc = (jd - 2451545) / 36525 // Julian century

  // Solar coordinates
  const geomMeanLongSun = (280.46646 + jc * (36000.76983 + 0.0003032 * jc)) % 360
  const geomMeanAnomSun = 357.52911 + jc * (35999.05029 - 0.0001537 * jc)
  const eccentEarthOrbit = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc)

  const sunEqOfCtr =
    Math.sin(toRadians(geomMeanAnomSun)) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) +
    Math.sin(toRadians(2 * geomMeanAnomSun)) * (0.019993 - 0.000101 * jc) +
    Math.sin(toRadians(3 * geomMeanAnomSun)) * 0.000289

  const sunTrueLong = geomMeanLongSun + sunEqOfCtr
  const sunAppLong = sunTrueLong - 0.00569 - 0.00478 * Math.sin(toRadians(125.04 - 1934.136 * jc))

  const meanObliqEcliptic =
    23 + (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) / 60
  const obliqCorr = meanObliqEcliptic + 0.00256 * Math.cos(toRadians(125.04 - 1934.136 * jc))

  // Sun declination
  const sunDeclin = toDegrees(
    Math.asin(Math.sin(toRadians(obliqCorr)) * Math.sin(toRadians(sunAppLong)))
  )

  // Equation of time (minutes)
  const varY = Math.tan(toRadians(obliqCorr / 2)) * Math.tan(toRadians(obliqCorr / 2))
  const eqOfTime =
    4 *
    toDegrees(
      varY * Math.sin(2 * toRadians(geomMeanLongSun)) -
        2 * eccentEarthOrbit * Math.sin(toRadians(geomMeanAnomSun)) +
        4 *
          eccentEarthOrbit *
          varY *
          Math.sin(toRadians(geomMeanAnomSun)) *
          Math.cos(2 * toRadians(geomMeanLongSun)) -
        0.5 * varY * varY * Math.sin(4 * toRadians(geomMeanLongSun)) -
        1.25 * eccentEarthOrbit * eccentEarthOrbit * Math.sin(2 * toRadians(geomMeanAnomSun))
    )

  // Time calculations
  const timeOffset = date.getTimezoneOffset()
  const hours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600
  const trueSolarTime = (hours * 60 + eqOfTime + 4 * long - timeOffset * -1) % 1440

  // Hour angle
  let hourAngle: number
  if (trueSolarTime / 4 < 0) {
    hourAngle = trueSolarTime / 4 + 180
  } else {
    hourAngle = trueSolarTime / 4 - 180
  }

  // Solar zenith and altitude
  const solarZenith = toDegrees(
    Math.acos(
      Math.sin(toRadians(lat)) * Math.sin(toRadians(sunDeclin)) +
        Math.cos(toRadians(lat)) * Math.cos(toRadians(sunDeclin)) * Math.cos(toRadians(hourAngle))
    )
  )

  const solarAltitude = 90 - solarZenith

  // Solar azimuth
  let solarAzimuth: number
  if (hourAngle > 0) {
    solarAzimuth =
      (toDegrees(
        Math.acos(
          (Math.sin(toRadians(lat)) * Math.cos(toRadians(solarZenith)) -
            Math.sin(toRadians(sunDeclin))) /
            (Math.cos(toRadians(lat)) * Math.sin(toRadians(solarZenith)))
        )
      ) +
        180) %
      360
  } else {
    solarAzimuth =
      (540 -
        toDegrees(
          Math.acos(
            (Math.sin(toRadians(lat)) * Math.cos(toRadians(solarZenith)) -
              Math.sin(toRadians(sunDeclin))) /
              (Math.cos(toRadians(lat)) * Math.sin(toRadians(solarZenith)))
          )
        )) %
      360
  }

  // Determine if sun is rising or setting based on hour angle
  // Negative hour angle = morning (sun rising), Positive = afternoon (sun setting)
  const isRising = hourAngle < 0

  return {
    altitude: solarAltitude,
    azimuth: solarAzimuth,
    isRising,
  }
}

/**
 * Get a simple description of current solar state for debugging
 */
export function getSolarStateDescription(altitude: number, isRising: boolean): string {
  if (altitude > 15) return 'Daytime (sun high)'
  if (altitude > 0) return isRising ? 'Morning (sun rising)' : 'Golden hour (sun setting)'
  if (altitude > -6) return isRising ? 'Dawn (civil twilight)' : 'Dusk (civil twilight)'
  if (altitude > -12) return 'Nautical twilight'
  if (altitude > -18) return 'Astronomical twilight'
  return 'Night (full darkness)'
}

/**
 * Calculate sunrise and sunset times for a given location and date
 * Returns times in hours (decimal, e.g., 7.5 = 7:30 AM)
 */
export function calculateSunriseSunset(
  lat: number,
  long: number,
  date: Date = new Date()
): { sunrise: number; sunset: number; solarNoon: number } {
  const jd = toJulianDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0))
  const jc = (jd - 2451545) / 36525

  const geomMeanLongSun = (280.46646 + jc * (36000.76983 + 0.0003032 * jc)) % 360
  const geomMeanAnomSun = 357.52911 + jc * (35999.05029 - 0.0001537 * jc)
  const eccentEarthOrbit = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc)

  const sunEqOfCtr =
    Math.sin(toRadians(geomMeanAnomSun)) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) +
    Math.sin(toRadians(2 * geomMeanAnomSun)) * (0.019993 - 0.000101 * jc) +
    Math.sin(toRadians(3 * geomMeanAnomSun)) * 0.000289

  const sunTrueLong = geomMeanLongSun + sunEqOfCtr
  const sunAppLong = sunTrueLong - 0.00569 - 0.00478 * Math.sin(toRadians(125.04 - 1934.136 * jc))

  const meanObliqEcliptic =
    23 + (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) / 60
  const obliqCorr = meanObliqEcliptic + 0.00256 * Math.cos(toRadians(125.04 - 1934.136 * jc))

  const sunDeclin = toDegrees(
    Math.asin(Math.sin(toRadians(obliqCorr)) * Math.sin(toRadians(sunAppLong)))
  )

  const varY = Math.tan(toRadians(obliqCorr / 2)) * Math.tan(toRadians(obliqCorr / 2))
  const eqOfTime =
    4 *
    toDegrees(
      varY * Math.sin(2 * toRadians(geomMeanLongSun)) -
        2 * eccentEarthOrbit * Math.sin(toRadians(geomMeanAnomSun)) +
        4 *
          eccentEarthOrbit *
          varY *
          Math.sin(toRadians(geomMeanAnomSun)) *
          Math.cos(2 * toRadians(geomMeanLongSun)) -
        0.5 * varY * varY * Math.sin(4 * toRadians(geomMeanLongSun)) -
        1.25 * eccentEarthOrbit * eccentEarthOrbit * Math.sin(2 * toRadians(geomMeanAnomSun))
    )

  // Hour angle at sunrise/sunset (when sun is at horizon, -0.833 degrees to account for refraction)
  const haRise = toDegrees(
    Math.acos(
      Math.cos(toRadians(90.833)) / (Math.cos(toRadians(lat)) * Math.cos(toRadians(sunDeclin))) -
        Math.tan(toRadians(lat)) * Math.tan(toRadians(sunDeclin))
    )
  )

  const timeOffset = date.getTimezoneOffset()
  const solarNoon = (720 - 4 * long - eqOfTime + timeOffset * -1) / 60
  const sunrise = solarNoon - (haRise * 4) / 60
  const sunset = solarNoon + (haRise * 4) / 60

  return { sunrise, sunset, solarNoon }
}

/**
 * Calculate maximum solar altitude for a given location and date
 * This is the highest point the sun reaches on that day (at solar noon)
 *
 * Critical for latitude-aware theme scaling:
 * - Dublin in January: max ~13-14° (never reaches fixed 15° threshold)
 * - Sydney in January: max ~80° (easily exceeds threshold)
 *
 * By using relative position (current / max), all locations experience
 * the full range of themes relative to THEIR sky.
 */
export function calculateMaxSolarAltitude(lat: number, date: Date = new Date()): number {
  // Calculate sun declination for this date
  const jd = toJulianDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0))
  const jc = (jd - 2451545) / 36525

  const geomMeanLongSun = (280.46646 + jc * (36000.76983 + 0.0003032 * jc)) % 360
  const geomMeanAnomSun = 357.52911 + jc * (35999.05029 - 0.0001537 * jc)

  const sunEqOfCtr =
    Math.sin(toRadians(geomMeanAnomSun)) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) +
    Math.sin(toRadians(2 * geomMeanAnomSun)) * (0.019993 - 0.000101 * jc) +
    Math.sin(toRadians(3 * geomMeanAnomSun)) * 0.000289

  const sunTrueLong = geomMeanLongSun + sunEqOfCtr
  const sunAppLong = sunTrueLong - 0.00569 - 0.00478 * Math.sin(toRadians(125.04 - 1934.136 * jc))

  const meanObliqEcliptic =
    23 + (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) / 60
  const obliqCorr = meanObliqEcliptic + 0.00256 * Math.cos(toRadians(125.04 - 1934.136 * jc))

  const sunDeclin = toDegrees(
    Math.asin(Math.sin(toRadians(obliqCorr)) * Math.sin(toRadians(sunAppLong)))
  )

  // Maximum altitude occurs at solar noon
  // Formula: maxAlt = 90 - |latitude - declination|
  const maxAltitude = 90 - Math.abs(lat - sunDeclin)

  return maxAltitude
}

// ============================================================================
// LUNAR POSITION CALCULATION
// ============================================================================

/**
 * Calculate moon position for a given location and time
 * Returns altitude, azimuth, and whether moon is rising
 *
 * Based on simplified lunar position algorithms
 * Accurate enough for visual purposes (within ~1°)
 */
export function calculateMoonPosition(
  lat: number,
  long: number,
  date: Date = new Date()
): { altitude: number; azimuth: number; isRising: boolean } {
  const jd = toJulianDate(date)
  const T = (jd - 2451545.0) / 36525 // Julian centuries from J2000

  // Moon's mean longitude (degrees)
  const L0 = (218.3164477 + 481267.88123421 * T - 0.0015786 * T * T) % 360

  // Moon's mean anomaly (degrees)
  const M = (134.9633964 + 477198.8675055 * T + 0.0087414 * T * T) % 360

  // Moon's mean elongation (degrees)
  const D = (297.8501921 + 445267.1114034 * T - 0.0018819 * T * T) % 360

  // Moon's argument of latitude (degrees)
  const F = (93.272095 + 483202.0175233 * T - 0.0036539 * T * T) % 360

  // Sun's mean anomaly (degrees)
  const Ms = (357.5291092 + 35999.0502909 * T - 0.0001536 * T * T) % 360

  // Longitude correction terms (simplified)
  let dL = 0
  dL += 6.289 * Math.sin(toRadians(M))
  dL += 1.274 * Math.sin(toRadians(2 * D - M))
  dL += 0.658 * Math.sin(toRadians(2 * D))
  dL += 0.214 * Math.sin(toRadians(2 * M))
  dL -= 0.186 * Math.sin(toRadians(Ms))
  dL -= 0.114 * Math.sin(toRadians(2 * F))

  // Moon's ecliptic longitude
  const moonLong = (L0 + dL) % 360

  // Latitude correction (simplified)
  let dB = 0
  dB += 5.128 * Math.sin(toRadians(F))
  dB += 0.281 * Math.sin(toRadians(M + F))
  dB += 0.278 * Math.sin(toRadians(M - F))

  // Moon's ecliptic latitude
  const moonLat = dB

  // Obliquity of the ecliptic
  const obliquity = 23.439 - 0.0000004 * (jd - 2451545.0)

  // Convert ecliptic to equatorial coordinates
  const sinLong = Math.sin(toRadians(moonLong))
  const cosLong = Math.cos(toRadians(moonLong))
  const sinLat = Math.sin(toRadians(moonLat))
  const cosLat = Math.cos(toRadians(moonLat))
  const sinObl = Math.sin(toRadians(obliquity))
  const cosObl = Math.cos(toRadians(obliquity))

  // Right Ascension
  const ra = toDegrees(
    Math.atan2(sinLong * cosObl - Math.tan(toRadians(moonLat)) * sinObl, cosLong)
  )

  // Declination
  const dec = toDegrees(Math.asin(sinLat * cosObl + cosLat * sinObl * sinLong))

  // Calculate Local Sidereal Time
  const JD0 = Math.floor(jd - 0.5) + 0.5
  const S = JD0 - 2451545.0
  const T0 = S / 36525.0
  let GST = 6.697374558 + 2400.051336 * T0 + 0.000025862 * T0 * T0
  GST = GST % 24
  if (GST < 0) GST += 24

  const UT = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  GST = (GST + UT * 1.002737909) % 24

  const LST = (GST + long / 15) % 24
  const LSTdeg = LST * 15

  // Hour Angle
  let HA = LSTdeg - ra
  if (HA < -180) HA += 360
  if (HA > 180) HA -= 360

  // Convert to horizontal coordinates
  const sinDec = Math.sin(toRadians(dec))
  const cosDec = Math.cos(toRadians(dec))
  const sinLat2 = Math.sin(toRadians(lat))
  const cosLat2 = Math.cos(toRadians(lat))
  const cosHA = Math.cos(toRadians(HA))

  // Altitude
  const altitude = toDegrees(Math.asin(sinDec * sinLat2 + cosDec * cosLat2 * cosHA))

  // Azimuth
  let azimuth = toDegrees(
    Math.atan2(Math.sin(toRadians(HA)), cosHA * sinLat2 - Math.tan(toRadians(dec)) * cosLat2)
  )
  azimuth = (azimuth + 180) % 360

  // Determine if moon is rising (hour angle approaching 0 from negative)
  const isRising = HA < 0

  return { altitude, azimuth, isRising }
}

/**
 * Calculate moon phase for a given date
 * Returns phase name and illumination percentage (0-100)
 */
export function calculateMoonPhase(date: Date = new Date()): {
  phase:
    | 'new'
    | 'waxing-crescent'
    | 'first-quarter'
    | 'waxing-gibbous'
    | 'full'
    | 'waning-gibbous'
    | 'last-quarter'
    | 'waning-crescent'
  illumination: number
  angle: number // Angle for rendering the shadow
} {
  // Calculate days since known new moon (Jan 6, 2000 18:14 UTC)
  const knownNewMoon = new Date('2000-01-06T18:14:00Z')
  const synodicMonth = 29.53058867 // Average length of lunar month in days

  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24)
  const lunarAge = daysSinceNewMoon % synodicMonth

  // Calculate illumination (0-100%)
  // Illumination follows a cosine curve through the lunar cycle
  const phaseAngle = (lunarAge / synodicMonth) * 2 * Math.PI
  const illumination = Math.round(((1 - Math.cos(phaseAngle)) / 2) * 100)

  // Angle for rendering (0 = new moon shadow on right, 180 = full, 360 = new moon shadow on left)
  const angle = (lunarAge / synodicMonth) * 360

  // Determine phase name
  let phase:
    | 'new'
    | 'waxing-crescent'
    | 'first-quarter'
    | 'waxing-gibbous'
    | 'full'
    | 'waning-gibbous'
    | 'last-quarter'
    | 'waning-crescent'

  if (lunarAge < 1.85) {
    phase = 'new'
  } else if (lunarAge < 7.38) {
    phase = 'waxing-crescent'
  } else if (lunarAge < 9.23) {
    phase = 'first-quarter'
  } else if (lunarAge < 14.77) {
    phase = 'waxing-gibbous'
  } else if (lunarAge < 16.61) {
    phase = 'full'
  } else if (lunarAge < 22.15) {
    phase = 'waning-gibbous'
  } else if (lunarAge < 23.99) {
    phase = 'last-quarter'
  } else {
    phase = 'waning-crescent'
  }

  return { phase, illumination, angle }
}
