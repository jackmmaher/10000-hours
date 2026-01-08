/**
 * useTheme - React hook for dynamic theming
 *
 * Provides current theme values and applies CSS custom properties.
 * Updates automatically based on time of day and season.
 * Respects user's theme mode preference (auto/light/warm/dark).
 */

import { useEffect, useState, useCallback } from 'react'
import {
  ThemeState,
  ThemeValues,
  TimeOfDay,
  getTimeOfDay,
  getSeason,
  calculateTheme,
  isTransitionPeriod,
  themeToCSSProperties,
  detectSouthernHemisphere
} from '../lib/themeEngine'
import { useSettingsStore } from '../stores/useSettingsStore'
import { ThemeMode } from '../lib/db'

// Update interval (check every minute)
const UPDATE_INTERVAL = 60 * 1000

// Map theme mode to time of day
const MODE_TO_TIME: Record<Exclude<ThemeMode, 'auto'>, TimeOfDay> = {
  light: 'daytime',
  warm: 'evening',
  dark: 'night'
}

export function useTheme() {
  const { themeMode } = useSettingsStore()

  const [themeState, setThemeState] = useState<ThemeState>(() => {
    const timeOfDay = themeMode === 'auto' ? getTimeOfDay() : MODE_TO_TIME[themeMode]
    const season = getSeason(new Date(), detectSouthernHemisphere())
    return {
      timeOfDay,
      season,
      values: calculateTheme(timeOfDay, season),
      isTransitioning: themeMode === 'auto' && isTransitionPeriod()
    }
  })

  // Apply theme to document
  const applyTheme = useCallback((values: ThemeValues, transitioning: boolean) => {
    const properties = themeToCSSProperties(values)
    const root = document.documentElement

    // Set transition for smooth changes
    if (transitioning) {
      root.style.setProperty('--theme-transition', '30s ease-in-out')
    } else {
      root.style.setProperty('--theme-transition', '0.5s ease')
    }

    // Apply all CSS custom properties
    Object.entries(properties).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Toggle dark mode class for components that need it
    if (values.isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  // Update theme based on current time and mode
  const updateTheme = useCallback(() => {
    const now = new Date()
    const timeOfDay = themeMode === 'auto' ? getTimeOfDay(now) : MODE_TO_TIME[themeMode]
    const season = getSeason(now, detectSouthernHemisphere())
    const transitioning = themeMode === 'auto' && isTransitionPeriod(now)
    const values = calculateTheme(timeOfDay, season)

    setThemeState(prev => {
      // Only update if something changed
      if (prev.timeOfDay === timeOfDay && prev.season === season) {
        return prev
      }

      return {
        timeOfDay,
        season,
        values,
        isTransitioning: transitioning
      }
    })

    applyTheme(values, transitioning)
  }, [applyTheme, themeMode])

  // Re-apply theme when mode changes
  useEffect(() => {
    updateTheme()
  }, [updateTheme])

  // Initial application and periodic updates
  useEffect(() => {
    // Apply initial theme
    applyTheme(themeState.values, themeState.isTransitioning)

    // Set up interval for updates (only needed for auto mode, but harmless otherwise)
    const interval = setInterval(updateTheme, UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [applyTheme, updateTheme, themeState.values, themeState.isTransitioning])

  return themeState
}

// Simpler hook that just returns current theme info without applying
export function useThemeInfo() {
  const [info, setInfo] = useState(() => ({
    timeOfDay: getTimeOfDay(),
    season: getSeason(new Date(), detectSouthernHemisphere())
  }))

  useEffect(() => {
    const interval = setInterval(() => {
      setInfo({
        timeOfDay: getTimeOfDay(),
        season: getSeason(new Date(), detectSouthernHemisphere())
      })
    }, UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  return info
}
