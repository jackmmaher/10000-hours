/**
 * LivingTheme - Unified Living Theme Provider
 *
 * Single source of truth for the entire visual experience.
 * Sun altitude drives everything - colors AND effects - on the same curve.
 *
 * Usage:
 * <LivingTheme>
 *   <App />
 * </LivingTheme>
 *
 * Access theme data from any component:
 * const { sunAltitude, effects, colors } = useLivingTheme()
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode
} from 'react'
import { LivingCanvas } from './LivingCanvas'
import {
  LivingThemeState,
  EffectIntensities,
  calculateLivingTheme,
  calculateManualTheme,
  applyLivingTheme,
  getLocation,
  estimateLocationFromTimezone,
  getSeasonalEffects,
  getManualSeasonalEffects,
  SeasonalEffects,
  TimeOfDay,
  Season,
  SeasonOption
} from '../lib/livingTheme'
import { useSettingsStore } from '../stores/useSettingsStore'

// ============================================================================
// CONTEXT
// ============================================================================

interface LivingThemeContextValue extends LivingThemeState {
  seasonalEffects: SeasonalEffects
  // For components that need to know the raw values
  debug: {
    sunAltitude: number
    location: { lat: number; long: number } | null
    lastUpdate: Date
  }
}

const LivingThemeContext = createContext<LivingThemeContextValue | null>(null)

/**
 * Hook to access living theme data from any component
 */
export function useLivingTheme(): LivingThemeContextValue {
  const context = useContext(LivingThemeContext)
  if (!context) {
    throw new Error('useLivingTheme must be used within a LivingTheme provider')
  }
  return context
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface LivingThemeProps {
  children: ReactNode
  /** Override breathing intensity (default 0.015) */
  breathingIntensity?: number
}

// Update interval - every 60 seconds
const UPDATE_INTERVAL = 60 * 1000

export function LivingTheme({
  children,
  breathingIntensity = 0.015
}: LivingThemeProps) {
  // User preferences from settings
  const { visualEffects, themeMode, manualSeason, manualTime } = useSettingsStore()
  const expressive = visualEffects === 'expressive'
  const isManualMode = themeMode === 'manual'

  // Location state (only used in auto mode)
  const [location, setLocation] = useState<{ lat: number; long: number } | null>(null)
  const locationFetched = useRef(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Theme state - respects manual mode from the start
  const [themeState, setThemeState] = useState<LivingThemeState>(() => {
    // BUG FIX: Initialize respecting the current mode
    // Note: On first render before hydration, themeMode defaults to 'auto'
    // After hydration, updateTheme will be called if mode changed
    if (isManualMode) {
      return calculateManualTheme(manualSeason as SeasonOption, manualTime, expressive, true)
    }
    const fallback = estimateLocationFromTimezone()
    return calculateLivingTheme(fallback, new Date(), expressive, true)
  })

  // Fetch location on mount (one-time, only in auto mode)
  useEffect(() => {
    if (isManualMode) return // Skip location fetch in manual mode
    if (locationFetched.current) return
    locationFetched.current = true

    getLocation()
      .then(setLocation)
      .catch(() => {
        setLocation(estimateLocationFromTimezone())
      })
  }, [isManualMode])

  // Update theme calculation - handles both auto and manual modes
  const updateTheme = useCallback(() => {
    const now = new Date()

    let newState: LivingThemeState
    if (isManualMode) {
      // Manual mode: use user's selected season and time
      newState = calculateManualTheme(
        manualSeason as SeasonOption,
        manualTime,
        expressive,
        true
      )
    } else {
      // Auto mode: calculate based on real sun position
      const currentLocation = location ?? estimateLocationFromTimezone()
      newState = calculateLivingTheme(currentLocation, now, expressive, true)
    }

    setThemeState(newState)
    applyLivingTheme(newState)
    setLastUpdate(now)
  }, [location, expressive, isManualMode, manualSeason, manualTime])

  // Initial theme application and updates when dependencies change
  useEffect(() => {
    updateTheme()
  }, [updateTheme])

  // Periodic updates (only in auto mode)
  useEffect(() => {
    if (isManualMode) return // No periodic updates in manual mode

    const interval = setInterval(updateTheme, UPDATE_INTERVAL)
    return () => clearInterval(interval)
  }, [updateTheme, isManualMode])

  // Listen for theme reset events (from ThemePreview)
  useEffect(() => {
    const handleReset = () => updateTheme()
    window.addEventListener('themeReset', handleReset)
    return () => window.removeEventListener('themeReset', handleReset)
  }, [updateTheme])

  // Calculate seasonal effects based on mode
  // BUG FIX: Use manualTime directly in manual mode, not themeState.timeOfDay
  // This ensures consistency before the first updateTheme() call
  const seasonalEffects = isManualMode
    ? getManualSeasonalEffects(manualSeason as SeasonOption, manualTime, expressive)
    : getSeasonalEffects(themeState.season, themeState.timeOfDay, expressive)

  // Build context value
  const contextValue: LivingThemeContextValue = {
    ...themeState,
    seasonalEffects,
    debug: {
      sunAltitude: themeState.sunAltitude,
      location,
      lastUpdate
    }
  }

  return (
    <LivingThemeContext.Provider value={contextValue}>
      <div
        className="living-theme-root h-full"
        style={{
          ['--breath-intensity' as string]: breathingIntensity,
        }}
      >
        {/* Breathing animation styles */}
        <style>{`
          @keyframes breathe {
            0%, 25% { transform: scale(1); }
            50% { transform: scale(calc(1 + var(--breath-intensity, 0.015))); }
            75% { transform: scale(calc(1 + var(--breath-intensity, 0.015))); }
            100% { transform: scale(1); }
          }

          .living-theme-root {
            animation: breathe 16s ease-in-out infinite;
            transform-origin: center center;
            will-change: transform;
            overflow: hidden;
          }

          @media (prefers-reduced-motion: reduce) {
            .living-theme-root {
              animation: none;
            }
          }
        `}</style>

        {/* Visual effects layer */}
        <LivingThemeEffects
          effects={themeState.effects}
          season={themeState.season}
          timeOfDay={themeState.timeOfDay}
          expressive={expressive}
          seasonalEffects={seasonalEffects}
          sunAltitude={themeState.sunAltitude}
          sunAzimuth={themeState.sunAzimuth}
          moonAltitude={themeState.moonAltitude}
          moonAzimuth={themeState.moonAzimuth}
          moonPhase={themeState.moonPhase}
          moonIllumination={themeState.moonIllumination}
          moonPhaseAngle={themeState.moonPhaseAngle}
        />

        {/* App content */}
        {children}
      </div>
    </LivingThemeContext.Provider>
  )
}

// ============================================================================
// EFFECTS RENDERER
// ============================================================================

interface LivingThemeEffectsProps {
  effects: EffectIntensities
  season: Season
  timeOfDay: TimeOfDay
  expressive: boolean
  seasonalEffects: SeasonalEffects
  sunAltitude: number
  sunAzimuth: number
  moonAltitude: number
  moonAzimuth: number
  moonPhase: string
  moonIllumination: number
  moonPhaseAngle: number
}

/**
 * Renders all visual effects with intensities driven by sun position
 * Effects fade in/out smoothly based on the unified intensity values
 */
function LivingThemeEffects({
  effects,
  season,
  timeOfDay,
  expressive,
  seasonalEffects,
  sunAltitude,
  sunAzimuth,
  moonAltitude,
  moonAzimuth,
  moonPhase,
  moonIllumination,
  moonPhaseAngle
}: LivingThemeEffectsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Global styles for moon glow */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Grain overlay - always present, boosted at night to reduce gradient banding */}
      <GrainOverlay intensity={effects.grain + (effects.ambientDarkness > 0.5 ? 0.02 : 0)} />

      {/* Atmospheric gradient - blends based on darkness */}
      <AtmosphericGradient
        season={season}
        timeOfDay={timeOfDay}
        darkness={effects.ambientDarkness}
      />

      {/* Directional light - fades based on sun position */}
      <DirectionalLight
        season={season}
        timeOfDay={timeOfDay}
        intensity={effects.directionalLight.intensity}
        warmth={effects.directionalLight.warmth}
      />

      {/* Level 2 Canvas Renderer - stars, particles, shooting stars, aurora, sun, moon */}
      <LivingCanvas
        season={season}
        timeOfDay={timeOfDay}
        effects={effects}
        expressive={expressive}
        seasonalEffects={seasonalEffects}
        sunAltitude={sunAltitude}
        sunAzimuth={sunAzimuth}
        moonAltitude={moonAltitude}
        moonAzimuth={moonAzimuth}
        moonPhase={moonPhase}
        moonIllumination={moonIllumination}
        moonPhaseAngle={moonPhaseAngle}
      />
    </div>
  )
}

// ============================================================================
// EFFECT COMPONENTS (with intensity-based rendering)
// ============================================================================

function GrainOverlay({ intensity }: { intensity: number }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        opacity: intensity,
        mixBlendMode: 'overlay'
      }}
    />
  )
}

function AtmosphericGradient({
  season,
  timeOfDay: _timeOfDay,
  darkness
}: {
  season: Season
  timeOfDay: TimeOfDay
  darkness: number
}) {
  // Day and night gradients for each season
  const dayGradients: Record<Season, string> = {
    winter: `radial-gradient(ellipse 100% 60% at 50% -10%, rgba(14, 165, 233, 0.08) 0%, transparent 50%)`,
    spring: `radial-gradient(ellipse 100% 60% at 50% -10%, rgba(34, 197, 94, 0.08) 0%, transparent 50%)`,
    summer: `radial-gradient(ellipse 100% 60% at 50% -10%, rgba(234, 88, 12, 0.1) 0%, transparent 50%)`,
    autumn: `radial-gradient(ellipse 100% 60% at 50% -10%, rgba(194, 65, 12, 0.08) 0%, transparent 50%)`
  }

  const nightGradients: Record<Season, string> = {
    winter: `radial-gradient(ellipse 80% 50% at 70% 10%, rgba(34, 211, 238, 0.06) 0%, transparent 50%),
             linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.4) 100%)`,
    spring: `radial-gradient(ellipse 80% 50% at 60% 15%, rgba(192, 132, 252, 0.08) 0%, transparent 50%),
             linear-gradient(180deg, rgba(30, 27, 46, 0) 0%, rgba(30, 27, 46, 0.3) 100%)`,
    summer: `radial-gradient(ellipse 80% 50% at 50% 20%, rgba(251, 191, 36, 0.05) 0%, transparent 50%),
             linear-gradient(180deg, rgba(28, 25, 23, 0) 0%, rgba(28, 25, 23, 0.3) 100%)`,
    autumn: `radial-gradient(ellipse 80% 50% at 60% 15%, rgba(217, 119, 6, 0.06) 0%, transparent 50%),
             linear-gradient(180deg, rgba(26, 20, 18, 0) 0%, rgba(26, 20, 18, 0.3) 100%)`
  }

  return (
    <>
      {/* Day gradient - fades out as darkness increases */}
      <div
        className="absolute inset-0 transition-opacity duration-[2000ms]"
        style={{
          background: dayGradients[season],
          opacity: 1 - darkness
        }}
      />
      {/* Night gradient - fades in as darkness increases */}
      <div
        className="absolute inset-0 transition-opacity duration-[2000ms]"
        style={{
          background: nightGradients[season],
          opacity: darkness
        }}
      />
    </>
  )
}

function DirectionalLight({
  intensity,
  warmth
}: {
  season: Season
  timeOfDay: TimeOfDay
  intensity: number
  warmth: number
}) {
  if (intensity < 0.05) return null

  // Warm golden color when warmth is high, cool when low
  const coolColor = 'rgba(255, 255, 255, 0.15)'
  const warmColor = 'rgba(251, 191, 36, 0.25)'

  // Interpolate color based on warmth
  const color = warmth > 0.5 ? warmColor : coolColor
  const finalOpacity = intensity * (warmth > 0.3 ? 0.9 : 0.6)

  // Direction based on warmth (evening/sunset has high warmth)
  const isEvening = warmth > 0.3
  const angle = isEvening ? 'to top right' : 'to bottom left'

  // Blend mode: screen for cool light, color-dodge for warm "hot" light
  const blendMode = warmth > 0.5 ? 'color-dodge' : 'screen'

  return (
    <div
      className="absolute inset-0 transition-all duration-[2000ms]"
      style={{
        background: `linear-gradient(${angle}, ${color} 0%, transparent 60%)`,
        opacity: finalOpacity,
        mixBlendMode: blendMode as React.CSSProperties['mixBlendMode']
      }}
    />
  )
}


// ============================================================================
// SOFT LIGHT RAYS (for daytime)
// ============================================================================

export function SoftLightRays({
  color = 'rgba(255, 255, 255, 0.08)',
  fromRight = true
}: {
  color?: string
  fromRight?: boolean
}) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: '2px',
            height: '150%',
            background: `linear-gradient(180deg, ${color} 0%, transparent 100%)`,
            transformOrigin: fromRight ? 'top right' : 'top left',
            transform: `rotate(${fromRight ? 20 + i * 8 : -20 - i * 8}deg)`,
            top: '-20%',
            [fromRight ? 'right' : 'left']: `${10 + i * 15}%`,
            opacity: 0.6 - i * 0.1
          }}
        />
      ))}
    </div>
  )
}
