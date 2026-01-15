/**
 * NeutralThemeProvider - Simple light/dark theme provider
 *
 * A minimal replacement for LivingTheme that only handles neutral themes.
 * No seasonal calculations, no canvas effects, no geolocation.
 */

import { useState, useEffect, type ReactNode } from 'react'
import { useSettingsStore } from '../stores/useSettingsStore'
import { themeToCSSProperties } from '../lib/theme/cssProperties'
import { NEUTRAL_LIGHT, NEUTRAL_DARK } from '../lib/theme/tokens/neutral'

interface NeutralThemeProviderProps {
  children: ReactNode
}

export function NeutralThemeProvider({ children }: NeutralThemeProviderProps) {
  const { themeMode } = useSettingsStore()

  // Track system dark mode preference
  const [systemDark, setSystemDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Listen for system preference changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Apply theme whenever mode or system preference changes
  useEffect(() => {
    // Determine if dark mode should be active
    // Simple: 'dark' = always dark, 'light' = always light, 'auto' = follow system
    const isDark = themeMode === 'dark' || (themeMode === 'auto' && systemDark)

    // Select appropriate tokens
    const tokens = isDark ? NEUTRAL_DARK : NEUTRAL_LIGHT

    // Convert to CSS properties
    const properties = themeToCSSProperties(tokens)

    // Apply to document root with smooth transition
    const root = document.documentElement
    root.style.setProperty('--theme-transition', '0.3s ease')

    Object.entries(properties).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Apply dark mode class for Tailwind dark: variants
    root.classList.toggle('dark', isDark)
  }, [themeMode, systemDark])

  return <>{children}</>
}
