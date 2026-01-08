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

  // Try IP-based geolocation
  try {
    const response = await fetch('http://ip-api.com/json/?fields=lat,lon', {
      signal: AbortSignal.timeout(5000) // 5 second timeout
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
    'Europe': { lat: 50, long: 10 },      // Central Europe
    'America': { lat: 40, long: -100 },   // Central US
    'Asia': { lat: 35, long: 105 },       // Central Asia
    'Australia': { lat: -25, long: 135 }, // Central Australia
    'Pacific': { lat: -20, long: 170 },   // Pacific islands
    'Africa': { lat: 0, long: 20 },       // Central Africa
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

  const sunEqOfCtr = Math.sin(toRadians(geomMeanAnomSun)) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) +
                     Math.sin(toRadians(2 * geomMeanAnomSun)) * (0.019993 - 0.000101 * jc) +
                     Math.sin(toRadians(3 * geomMeanAnomSun)) * 0.000289

  const sunTrueLong = geomMeanLongSun + sunEqOfCtr
  const sunAppLong = sunTrueLong - 0.00569 - 0.00478 * Math.sin(toRadians(125.04 - 1934.136 * jc))

  const meanObliqEcliptic = 23 + (26 + ((21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813)))) / 60) / 60
  const obliqCorr = meanObliqEcliptic + 0.00256 * Math.cos(toRadians(125.04 - 1934.136 * jc))

  // Sun declination
  const sunDeclin = toDegrees(Math.asin(Math.sin(toRadians(obliqCorr)) * Math.sin(toRadians(sunAppLong))))

  // Equation of time (minutes)
  const varY = Math.tan(toRadians(obliqCorr / 2)) * Math.tan(toRadians(obliqCorr / 2))
  const eqOfTime = 4 * toDegrees(
    varY * Math.sin(2 * toRadians(geomMeanLongSun)) -
    2 * eccentEarthOrbit * Math.sin(toRadians(geomMeanAnomSun)) +
    4 * eccentEarthOrbit * varY * Math.sin(toRadians(geomMeanAnomSun)) * Math.cos(2 * toRadians(geomMeanLongSun)) -
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
  const solarZenith = toDegrees(Math.acos(
    Math.sin(toRadians(lat)) * Math.sin(toRadians(sunDeclin)) +
    Math.cos(toRadians(lat)) * Math.cos(toRadians(sunDeclin)) * Math.cos(toRadians(hourAngle))
  ))

  const solarAltitude = 90 - solarZenith

  // Solar azimuth
  let solarAzimuth: number
  if (hourAngle > 0) {
    solarAzimuth = (toDegrees(Math.acos(
      ((Math.sin(toRadians(lat)) * Math.cos(toRadians(solarZenith))) - Math.sin(toRadians(sunDeclin))) /
      (Math.cos(toRadians(lat)) * Math.sin(toRadians(solarZenith)))
    )) + 180) % 360
  } else {
    solarAzimuth = (540 - toDegrees(Math.acos(
      ((Math.sin(toRadians(lat)) * Math.cos(toRadians(solarZenith))) - Math.sin(toRadians(sunDeclin))) /
      (Math.cos(toRadians(lat)) * Math.sin(toRadians(solarZenith)))
    ))) % 360
  }

  // Determine if sun is rising or setting based on hour angle
  // Negative hour angle = morning (sun rising), Positive = afternoon (sun setting)
  const isRising = hourAngle < 0

  return {
    altitude: solarAltitude,
    azimuth: solarAzimuth,
    isRising
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

  const sunEqOfCtr = Math.sin(toRadians(geomMeanAnomSun)) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) +
                     Math.sin(toRadians(2 * geomMeanAnomSun)) * (0.019993 - 0.000101 * jc) +
                     Math.sin(toRadians(3 * geomMeanAnomSun)) * 0.000289

  const sunTrueLong = geomMeanLongSun + sunEqOfCtr
  const sunAppLong = sunTrueLong - 0.00569 - 0.00478 * Math.sin(toRadians(125.04 - 1934.136 * jc))

  const meanObliqEcliptic = 23 + (26 + ((21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813)))) / 60) / 60
  const obliqCorr = meanObliqEcliptic + 0.00256 * Math.cos(toRadians(125.04 - 1934.136 * jc))

  const sunDeclin = toDegrees(Math.asin(Math.sin(toRadians(obliqCorr)) * Math.sin(toRadians(sunAppLong))))

  const varY = Math.tan(toRadians(obliqCorr / 2)) * Math.tan(toRadians(obliqCorr / 2))
  const eqOfTime = 4 * toDegrees(
    varY * Math.sin(2 * toRadians(geomMeanLongSun)) -
    2 * eccentEarthOrbit * Math.sin(toRadians(geomMeanAnomSun)) +
    4 * eccentEarthOrbit * varY * Math.sin(toRadians(geomMeanAnomSun)) * Math.cos(2 * toRadians(geomMeanLongSun)) -
    0.5 * varY * varY * Math.sin(4 * toRadians(geomMeanLongSun)) -
    1.25 * eccentEarthOrbit * eccentEarthOrbit * Math.sin(2 * toRadians(geomMeanAnomSun))
  )

  // Hour angle at sunrise/sunset (when sun is at horizon, -0.833 degrees to account for refraction)
  const haRise = toDegrees(Math.acos(
    Math.cos(toRadians(90.833)) / (Math.cos(toRadians(lat)) * Math.cos(toRadians(sunDeclin))) -
    Math.tan(toRadians(lat)) * Math.tan(toRadians(sunDeclin))
  ))

  const timeOffset = date.getTimezoneOffset()
  const solarNoon = (720 - 4 * long - eqOfTime + timeOffset * -1) / 60
  const sunrise = solarNoon - haRise * 4 / 60
  const sunset = solarNoon + haRise * 4 / 60

  return { sunrise, sunset, solarNoon }
}
