/**
 * useTheme - React hook for the Solar-Aware Living Theme System
 *
 * Provides current theme tokens and applies CSS custom properties.
 * Updates automatically based on actual sun position for user's location.
 * Respects user's theme mode preference (auto/manual).
 *
 * Key features:
 * - Continuous theme blending based on sun altitude (not hard time boundaries)
 * - Location-aware via one-time IP geolocation (cached)
 * - Falls back gracefully if location unavailable
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  ThemeTokens,
  TimeOfDay,
  getSeason,
  calculateTheme,
  calculateThemeBySunPosition,
  getTimeOfDayFromSunPosition,
  themeToCSSProperties
} from '../lib/themeEngine'
import {
  getLocation,
  calculateSunPosition,
  estimateLocationFromTimezone
} from '../lib/solarPosition'
import { useSettingsStore } from '../stores/useSettingsStore'
import type { Season } from '../lib/themeEngine'

// Update interval - every minute for smooth solar tracking
const UPDATE_INTERVAL = 60 * 1000

interface Location {
  lat: number
  long: number
}

export interface ThemeState {
  timeOfDay: TimeOfDay
  season: Season
  tokens: ThemeTokens
  isTransitioning: boolean // Kept for API compatibility, always true in solar mode
  sunAltitude?: number     // For debugging/display
}

export function useTheme(): ThemeState {
  const { themeMode, manualSeason, manualTime } = useSettingsStore()

  // Location state - fetched once on mount
  const [location, setLocation] = useState<Location | null>(null)
  const locationFetched = useRef(false)

  // Theme state
  const [themeState, setThemeState] = useState<ThemeState>(() => {
    // Initial state uses timezone-based fallback until location loads
    const fallbackLocation = estimateLocationFromTimezone()
    const now = new Date()
    const { altitude, isRising } = calculateSunPosition(fallbackLocation.lat, fallbackLocation.long, now)
    const season = getSeason(now, fallbackLocation.lat < 0)

    if (themeMode === 'manual') {
      return {
        timeOfDay: manualTime,
        season: manualSeason as Season,
        tokens: calculateTheme(manualTime, manualSeason as Season),
        isTransitioning: false
      }
    }

    return {
      timeOfDay: getTimeOfDayFromSunPosition(altitude, isRising),
      season,
      tokens: calculateThemeBySunPosition(altitude, isRising, season),
      isTransitioning: true, // Solar mode is always "transitioning" (continuously blending)
      sunAltitude: altitude
    }
  })

  // Fetch location on mount (one-time)
  useEffect(() => {
    if (locationFetched.current) return
    locationFetched.current = true

    getLocation()
      .then(setLocation)
      .catch(() => {
        // Fallback to timezone estimation
        setLocation(estimateLocationFromTimezone())
      })
  }, [])

  // Apply theme to document
  const applyTheme = useCallback((tokens: ThemeTokens) => {
    const properties = themeToCSSProperties(tokens)
    const root = document.documentElement

    // Smooth transition for all theme changes
    root.style.setProperty('--theme-transition', '2s ease')

    // Apply all CSS custom properties
    Object.entries(properties).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Toggle dark mode class for components that need it
    if (tokens.isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  // Update theme based on sun position
  const updateTheme = useCallback(() => {
    const now = new Date()

    // For manual mode, use user-selected season and time (no solar calculation)
    if (themeMode === 'manual') {
      const tokens = calculateTheme(manualTime, manualSeason as Season)

      setThemeState(prev => {
        if (prev.timeOfDay === manualTime && prev.season === manualSeason) {
          return prev
        }
        return {
          timeOfDay: manualTime,
          season: manualSeason as Season,
          tokens,
          isTransitioning: false
        }
      })

      applyTheme(tokens)
      return
    }

    // Auto mode - use solar position
    const currentLocation = location ?? estimateLocationFromTimezone()
    const { altitude, isRising } = calculateSunPosition(currentLocation.lat, currentLocation.long, now)
    const season = getSeason(now, currentLocation.lat < 0)
    const timeOfDay = getTimeOfDayFromSunPosition(altitude, isRising)
    const tokens = calculateThemeBySunPosition(altitude, isRising, season)

    setThemeState({
      timeOfDay,
      season,
      tokens,
      isTransitioning: true, // Solar mode is continuously blending
      sunAltitude: altitude
    })

    applyTheme(tokens)
  }, [applyTheme, themeMode, manualSeason, manualTime, location])

  // Re-apply theme when mode or location changes
  useEffect(() => {
    updateTheme()
  }, [updateTheme])

  // Periodic updates for continuous solar tracking
  useEffect(() => {
    // Apply initial theme immediately
    applyTheme(themeState.tokens)

    // Update every minute
    const interval = setInterval(updateTheme, UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [applyTheme, updateTheme, themeState.tokens])

  useEffect(() => {
    const handleReset = () => updateTheme()
    window.addEventListener('themeReset', handleReset)
    return () => window.removeEventListener('themeReset', handleReset)
  }, [updateTheme])

  return themeState
}

// Simpler hook that just returns current theme info without applying
export function useThemeInfo() {
  const [location, setLocation] = useState<Location | null>(null)

  useEffect(() => {
    getLocation().then(setLocation).catch(() => {
      setLocation(estimateLocationFromTimezone())
    })
  }, [])

  const [info, setInfo] = useState(() => {
    const fallback = estimateLocationFromTimezone()
    const now = new Date()
    const { altitude, isRising } = calculateSunPosition(fallback.lat, fallback.long, now)
    const season = getSeason(now, fallback.lat < 0)
    return {
      timeOfDay: getTimeOfDayFromSunPosition(altitude, isRising),
      season,
      sunAltitude: altitude
    }
  })

  useEffect(() => {
    if (!location) return

    const update = () => {
      const now = new Date()
      const { altitude, isRising } = calculateSunPosition(location.lat, location.long, now)
      const season = getSeason(now, location.lat < 0)
      setInfo({
        timeOfDay: getTimeOfDayFromSunPosition(altitude, isRising),
        season,
        sunAltitude: altitude
      })
    }

    update()
    const interval = setInterval(update, UPDATE_INTERVAL)
    return () => clearInterval(interval)
  }, [location])

  return info
}

// Hook to get current theme tokens for components that need direct access
export function useThemeTokens(): ThemeTokens {
  const { themeMode, manualSeason, manualTime } = useSettingsStore()

  if (themeMode === 'manual') {
    return calculateTheme(manualTime, manualSeason as Season)
  }

  const location = estimateLocationFromTimezone() // Sync fallback for initial render
  const now = new Date()
  const { altitude, isRising } = calculateSunPosition(location.lat, location.long, now)
  const season = getSeason(now, location.lat < 0)
  return calculateThemeBySunPosition(altitude, isRising, season)
}
