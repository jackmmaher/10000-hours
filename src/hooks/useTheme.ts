/**
 * useTheme - React hook for the Living Theme System
 *
 * Provides current theme tokens and applies CSS custom properties.
 * Updates automatically based on time of day and season.
 * Respects user's theme mode preference (auto/light/warm/dark).
 */

import { useEffect, useState, useCallback } from 'react'
import {
  ThemeTokens,
  TimeOfDay,
  getTimeOfDay,
  getSeason,
  calculateTheme,
  calculateThemeWithTransition,
  isTransitionPeriod,
  themeToCSSProperties,
  detectSouthernHemisphere
} from '../lib/themeEngine'
import { useSettingsStore } from '../stores/useSettingsStore'
import type { Season } from '../lib/themeEngine'

// Update intervals
const UPDATE_INTERVAL = 60 * 1000          // Normal check: every minute
const TRANSITION_UPDATE_INTERVAL = 5 * 1000 // During transitions: every 5 seconds for smooth interpolation

export interface ThemeState {
  timeOfDay: TimeOfDay
  season: ReturnType<typeof getSeason>
  tokens: ThemeTokens
  isTransitioning: boolean
}

export function useTheme(): ThemeState {
  const { themeMode, manualSeason, manualTime } = useSettingsStore()

  const [themeState, setThemeState] = useState<ThemeState>(() => {
    const season = themeMode === 'manual' ? manualSeason : getSeason(new Date(), detectSouthernHemisphere())
    const timeOfDay = themeMode === 'manual' ? manualTime : getTimeOfDay(new Date(), season as Season)
    return {
      timeOfDay,
      season,
      tokens: calculateTheme(timeOfDay, season as Season),
      isTransitioning: themeMode === 'auto' && isTransitionPeriod()
    }
  })

  // Apply theme to document
  const applyTheme = useCallback((tokens: ThemeTokens, transitioning: boolean) => {
    const properties = themeToCSSProperties(tokens)
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
    if (tokens.isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  // Update theme based on current time and mode
  const updateTheme = useCallback(() => {
    const now = new Date()

    // For manual mode, use user-selected season and time
    if (themeMode === 'manual') {
      const tokens = calculateTheme(manualTime, manualSeason as Season)

      setThemeState(prev => {
        if (prev.timeOfDay === manualTime && prev.season === manualSeason) {
          return prev
        }
        return {
          timeOfDay: manualTime,
          season: manualSeason,
          tokens,
          isTransitioning: false
        }
      })

      applyTheme(tokens, false)
      return false
    }

    // For auto mode, use interpolation during transitions
    const season = getSeason(now, detectSouthernHemisphere())
    const { tokens, isTransitioning } = calculateThemeWithTransition(now, season)
    const timeOfDay = getTimeOfDay(now, season)

    setThemeState(prev => {
      // During transitions, always update (interpolated values change)
      if (isTransitioning || prev.timeOfDay !== timeOfDay || prev.season !== season) {
        return {
          timeOfDay,
          season,
          tokens,
          isTransitioning
        }
      }
      return prev
    })

    // During interpolation, no CSS transition needed - we're handling it
    applyTheme(tokens, false)
    return isTransitioning
  }, [applyTheme, themeMode, manualSeason, manualTime])

  // Re-apply theme when mode changes
  useEffect(() => {
    updateTheme()
  }, [updateTheme])

  // Initial application and periodic updates
  useEffect(() => {
    // Apply initial theme
    applyTheme(themeState.tokens, themeState.isTransitioning)

    // Use faster updates during transitions for smooth interpolation
    let interval: ReturnType<typeof setInterval>

    const setupInterval = () => {
      const isTransitioning = updateTheme()
      const nextInterval = isTransitioning ? TRANSITION_UPDATE_INTERVAL : UPDATE_INTERVAL

      // Clear existing and set new interval
      if (interval) clearInterval(interval)
      interval = setInterval(() => {
        const stillTransitioning = updateTheme()
        // If transition state changed, update interval speed
        if (stillTransitioning !== isTransitioning) {
          setupInterval()
        }
      }, nextInterval)
    }

    setupInterval()

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [applyTheme, updateTheme, themeState.tokens, themeState.isTransitioning])

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

// Hook to get current theme tokens for components that need direct access
export function useThemeTokens(): ThemeTokens {
  const { themeMode, manualSeason, manualTime } = useSettingsStore()
  const season = themeMode === 'manual' ? manualSeason : getSeason(new Date(), detectSouthernHemisphere())
  const timeOfDay = themeMode === 'manual' ? manualTime : getTimeOfDay(new Date(), season as Season)
  return calculateTheme(timeOfDay, season as Season)
}
