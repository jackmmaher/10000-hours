import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
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
  SeasonOption,
} from '../lib/livingTheme'
import { NEUTRAL_LIGHT, NEUTRAL_DARK, themeToCSSProperties } from '../lib/themeEngine'
import { useSettingsStore } from '../stores/useSettingsStore'

interface LivingThemeContextValue extends LivingThemeState {
  seasonalEffects: SeasonalEffects
  debug: {
    sunAltitude: number
    location: { lat: number; long: number } | null
    lastUpdate: Date
  }
}

const LivingThemeContext = createContext<LivingThemeContextValue | null>(null)

export function useLivingTheme(): LivingThemeContextValue {
  const context = useContext(LivingThemeContext)
  if (!context) {
    throw new Error('useLivingTheme must be used within a LivingTheme provider')
  }
  return context
}

interface LivingThemeProps {
  children: ReactNode
  breathingIntensity?: number
}

const UPDATE_INTERVAL = 60 * 1000

export function LivingTheme({ children, breathingIntensity = 0.015 }: LivingThemeProps) {
  const { visualEffects, themeMode, manualSeason, manualTime } = useSettingsStore()
  const expressive = visualEffects === 'expressive'

  // Check for new theme modes
  const isManualMode = themeMode === 'living-manual' || themeMode === 'manual' // backward compat
  const isNeutralTheme =
    themeMode === 'neutral-auto' || themeMode === 'neutral-light' || themeMode === 'neutral-dark'

  const [location, setLocation] = useState<{ lat: number; long: number } | null>(null)
  const locationFetched = useRef(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Helper to apply neutral theme CSS
  const applyNeutralTheme = useCallback((isDark: boolean) => {
    const tokens = isDark ? NEUTRAL_DARK : NEUTRAL_LIGHT
    const properties = themeToCSSProperties(tokens)
    const root = document.documentElement

    root.style.setProperty('--theme-transition', '2s ease')
    Object.entries(properties).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  const [themeState, setThemeState] = useState<LivingThemeState>(() => {
    // For neutral themes, use a minimal state (effects will be hidden)
    if (isNeutralTheme) {
      const isDark =
        themeMode === 'neutral-dark' ||
        (themeMode === 'neutral-auto' &&
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      return calculateManualTheme('neutral', isDark ? 'night' : 'daytime', false, true)
    }
    if (isManualMode) {
      return calculateManualTheme(manualSeason as SeasonOption, manualTime, expressive, true)
    }
    const fallback = estimateLocationFromTimezone()
    return calculateLivingTheme(fallback, new Date(), expressive, true)
  })

  useEffect(() => {
    if (isManualMode || isNeutralTheme) return
    if (locationFetched.current) return
    locationFetched.current = true

    getLocation()
      .then(setLocation)
      .catch(() => {
        setLocation(estimateLocationFromTimezone())
      })
  }, [isManualMode, isNeutralTheme])

  const updateTheme = useCallback(() => {
    const now = new Date()

    // Handle neutral themes - apply CSS and return early
    if (isNeutralTheme) {
      const systemPrefersDark =
        typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      const isDark =
        themeMode === 'neutral-dark' || (themeMode === 'neutral-auto' && systemPrefersDark)

      applyNeutralTheme(isDark)

      // Still update state for context consumers (minimal effects)
      const newState = calculateManualTheme('neutral', isDark ? 'night' : 'daytime', false, true)
      setThemeState(newState)
      setLastUpdate(now)
      return
    }

    let newState: LivingThemeState
    if (isManualMode) {
      newState = calculateManualTheme(manualSeason as SeasonOption, manualTime, expressive, true)
    } else {
      const currentLocation = location ?? estimateLocationFromTimezone()
      newState = calculateLivingTheme(currentLocation, now, expressive, true)
    }

    setThemeState(newState)
    applyLivingTheme(newState)
    setLastUpdate(now)
  }, [
    location,
    expressive,
    isManualMode,
    isNeutralTheme,
    themeMode,
    manualSeason,
    manualTime,
    applyNeutralTheme,
  ])

  useEffect(() => {
    updateTheme()
  }, [updateTheme])

  useEffect(() => {
    // Don't run periodic updates for manual or neutral themes
    if (isManualMode || isNeutralTheme) return

    const interval = setInterval(updateTheme, UPDATE_INTERVAL)
    return () => clearInterval(interval)
  }, [updateTheme, isManualMode, isNeutralTheme])

  // Listen for system preference changes (for neutral-auto)
  useEffect(() => {
    if (themeMode !== 'neutral-auto') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => updateTheme()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [themeMode, updateTheme])

  useEffect(() => {
    const handleReset = () => updateTheme()
    window.addEventListener('themeReset', handleReset)
    return () => window.removeEventListener('themeReset', handleReset)
  }, [updateTheme])

  const seasonalEffects = isManualMode
    ? getManualSeasonalEffects(manualSeason as SeasonOption, manualTime, expressive)
    : getSeasonalEffects(themeState.season, themeState.timeOfDay, expressive)

  // Hide sun and moon for neutral themes
  const hideCelestialBodies = isNeutralTheme || (isManualMode && manualSeason === 'neutral')

  const contextValue: LivingThemeContextValue = {
    ...themeState,
    seasonalEffects,
    debug: {
      sunAltitude: themeState.sunAltitude,
      location,
      lastUpdate,
    },
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

        {/* Only show living theme effects when not in neutral mode */}
        {!isNeutralTheme && (
          <LivingThemeEffects
            effects={themeState.effects}
            season={themeState.season}
            timeOfDay={themeState.timeOfDay}
            expressive={expressive}
            seasonalEffects={seasonalEffects}
            sunAltitude={themeState.sunAltitude}
            moonIllumination={themeState.moonIllumination}
            moonPhaseAngle={themeState.moonPhaseAngle}
            hideCelestialBodies={hideCelestialBodies}
          />
        )}

        {children}
      </div>
    </LivingThemeContext.Provider>
  )
}

interface LivingThemeEffectsProps {
  effects: EffectIntensities
  season: Season
  timeOfDay: TimeOfDay
  expressive: boolean
  seasonalEffects: SeasonalEffects
  sunAltitude: number
  moonIllumination: number
  moonPhaseAngle: number
  hideCelestialBodies: boolean
}

function LivingThemeEffects({
  effects,
  season,
  timeOfDay,
  expressive,
  seasonalEffects,
  sunAltitude,
  moonIllumination,
  moonPhaseAngle,
  hideCelestialBodies,
}: LivingThemeEffectsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <GrainOverlay intensity={effects.grain + (effects.ambientDarkness > 0.5 ? 0.02 : 0)} />

      <AtmosphericGradient season={season} darkness={effects.ambientDarkness} />

      <DirectionalLight
        intensity={effects.directionalLight.intensity}
        warmth={effects.directionalLight.warmth}
      />

      <LivingCanvas
        season={season}
        timeOfDay={timeOfDay}
        effects={effects}
        expressive={expressive}
        seasonalEffects={seasonalEffects}
        sunAltitude={sunAltitude}
        moonIllumination={moonIllumination}
        moonPhaseAngle={moonPhaseAngle}
        hideCelestialBodies={hideCelestialBodies}
      />
    </div>
  )
}

function GrainOverlay({ intensity }: { intensity: number }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        opacity: intensity,
        mixBlendMode: 'overlay',
      }}
    />
  )
}

function AtmosphericGradient({ season, darkness }: { season: Season; darkness: number }) {
  const dayGradients: Record<Season, string> = {
    winter: `radial-gradient(ellipse 100% 60% at 50% -10%, rgba(14, 165, 233, 0.08) 0%, transparent 50%)`,
    spring: `radial-gradient(ellipse 100% 60% at 50% -10%, rgba(34, 197, 94, 0.08) 0%, transparent 50%)`,
    summer: `radial-gradient(ellipse 100% 60% at 50% -10%, rgba(234, 88, 12, 0.1) 0%, transparent 50%)`,
    autumn: `radial-gradient(ellipse 100% 60% at 50% -10%, rgba(194, 65, 12, 0.08) 0%, transparent 50%)`,
  }

  const nightGradients: Record<Season, string> = {
    winter: `radial-gradient(ellipse 80% 50% at 70% 10%, rgba(34, 211, 238, 0.06) 0%, transparent 50%),
             linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.4) 100%)`,
    spring: `radial-gradient(ellipse 80% 50% at 60% 15%, rgba(192, 132, 252, 0.08) 0%, transparent 50%),
             linear-gradient(180deg, rgba(30, 27, 46, 0) 0%, rgba(30, 27, 46, 0.3) 100%)`,
    summer: `radial-gradient(ellipse 80% 50% at 50% 20%, rgba(251, 191, 36, 0.05) 0%, transparent 50%),
             linear-gradient(180deg, rgba(28, 25, 23, 0) 0%, rgba(28, 25, 23, 0.3) 100%)`,
    autumn: `radial-gradient(ellipse 80% 50% at 60% 15%, rgba(217, 119, 6, 0.06) 0%, transparent 50%),
             linear-gradient(180deg, rgba(26, 20, 18, 0) 0%, rgba(26, 20, 18, 0.3) 100%)`,
  }

  return (
    <>
      <div
        className="absolute inset-0 transition-opacity duration-[2000ms]"
        style={{
          background: dayGradients[season],
          opacity: 1 - darkness,
        }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-[2000ms]"
        style={{
          background: nightGradients[season],
          opacity: darkness,
        }}
      />
    </>
  )
}

function DirectionalLight({ intensity, warmth }: { intensity: number; warmth: number }) {
  if (intensity < 0.05) return null

  const coolColor = 'rgba(255, 255, 255, 0.15)'
  const warmColor = 'rgba(251, 191, 36, 0.25)'
  const color = warmth > 0.5 ? warmColor : coolColor
  const finalOpacity = intensity * (warmth > 0.3 ? 0.9 : 0.6)
  const isEvening = warmth > 0.3
  const angle = isEvening ? 'to top right' : 'to bottom left'
  const blendMode = warmth > 0.5 ? 'color-dodge' : 'screen'

  return (
    <div
      className="absolute inset-0 transition-all duration-[2000ms]"
      style={{
        background: `linear-gradient(${angle}, ${color} 0%, transparent 60%)`,
        opacity: finalOpacity,
        mixBlendMode: blendMode as React.CSSProperties['mixBlendMode'],
      }}
    />
  )
}

export function SoftLightRays({
  color = 'rgba(255, 255, 255, 0.08)',
  fromRight = true,
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
            opacity: 0.6 - i * 0.1,
          }}
        />
      ))}
    </div>
  )
}
