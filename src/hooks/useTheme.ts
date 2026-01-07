/**
 * useTheme - React hook for dynamic theming
 *
 * Provides current theme values and applies CSS custom properties.
 * Updates automatically based on time of day and season.
 */

import { useEffect, useState, useCallback } from 'react'
import {
  ThemeState,
  ThemeValues,
  getTimeOfDay,
  getSeason,
  calculateTheme,
  isTransitionPeriod,
  themeToCSSProperties,
  detectSouthernHemisphere
} from '../lib/themeEngine'

// Update interval (check every minute)
const UPDATE_INTERVAL = 60 * 1000

export function useTheme() {
  const [themeState, setThemeState] = useState<ThemeState>(() => {
    const timeOfDay = getTimeOfDay()
    const season = getSeason(new Date(), detectSouthernHemisphere())
    return {
      timeOfDay,
      season,
      values: calculateTheme(timeOfDay, season),
      isTransitioning: isTransitionPeriod()
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
      root.style.setProperty('--theme-transition', '0.3s ease')
    }

    // Apply all CSS custom properties
    Object.entries(properties).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }, [])

  // Update theme based on current time
  const updateTheme = useCallback(() => {
    const now = new Date()
    const timeOfDay = getTimeOfDay(now)
    const season = getSeason(now, detectSouthernHemisphere())
    const transitioning = isTransitionPeriod(now)
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
  }, [applyTheme])

  // Initial application and periodic updates
  useEffect(() => {
    // Apply initial theme
    applyTheme(themeState.values, themeState.isTransitioning)

    // Set up interval for updates
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
