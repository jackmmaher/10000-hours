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

  // Theme state
  const [themeState, setThemeState] = useState<LivingThemeState>(() => {
    // Initial state using timezone fallback
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
  const seasonalEffects = isManualMode
    ? getManualSeasonalEffects(manualSeason as SeasonOption, themeState.timeOfDay, expressive)
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
  seasonalEffects
}: LivingThemeEffectsProps) {
  const [mounted, setMounted] = useState(false)
  const [windActive, setWindActive] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Wind breath events
  useEffect(() => {
    const triggerWind = () => {
      setWindActive(true)
      setTimeout(() => setWindActive(false), 3000)
    }

    const initialDelay = 20000 + Math.random() * 20000
    const initialTimeout = setTimeout(triggerWind, initialDelay)

    const interval = setInterval(() => {
      if (Math.random() > 0.3) triggerWind()
    }, 45000 + Math.random() * 45000)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [])

  if (!mounted) return null

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden ${windActive ? 'wind-active' : ''}`}
      style={{ zIndex: 0 }}
    >
      {/* Global styles for effects */}
      <style>{`
        @keyframes windShiver {
          0% { transform: translateX(0) rotate(0deg); }
          30% { transform: translateX(15px) rotate(0.3deg); }
          60% { transform: translateX(8px) rotate(0.1deg); }
          100% { transform: translateX(0) rotate(0deg); }
        }
        .wind-active .wind-affected { animation: windShiver 3s ease-out; }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shootingStar {
          0% { transform: translateX(0) translateY(0); opacity: 1; }
          100% { transform: translateX(300px) translateY(300px); opacity: 0; }
        }
      `}</style>

      {/* Grain overlay - always present, intensity varies */}
      <GrainOverlay intensity={effects.grain} />

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

      {/* Stars - fade in based on effect intensity */}
      {effects.stars > 0 && (
        <Stars intensity={effects.stars} season={season} />
      )}

      {/* Moon - fade in based on effect intensity */}
      {effects.moon > 0 && (
        <Moon intensity={effects.moon} season={season} harvestMoon={seasonalEffects.harvestMoon} />
      )}

      {/* Shooting stars - expressive only, night only */}
      {effects.shootingStars > 0 && expressive && (
        <ShootingStars intensity={effects.shootingStars} />
      )}

      {/* Seasonal particles */}
      <SeasonalParticles
        type={seasonalEffects.particleType}
        intensity={effects.particles * seasonalEffects.particleMultiplier}
        windActive={windActive}
      />

      {/* Aurora - winter night expressive */}
      {seasonalEffects.aurora && effects.stars > 0.5 && (
        <Aurora intensity={effects.stars} />
      )}
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
  const coolColor = 'rgba(255, 255, 255, 0.12)'
  const warmColor = 'rgba(251, 191, 36, 0.2)'

  // Interpolate color based on warmth
  const color = warmth > 0.5 ? warmColor : coolColor
  const finalOpacity = intensity * (warmth > 0.3 ? 0.9 : 0.6)

  // Direction based on warmth (evening/sunset has high warmth)
  const isEvening = warmth > 0.3
  const angle = isEvening ? 'to top right' : 'to bottom left'

  return (
    <div
      className="absolute inset-0 transition-all duration-[2000ms]"
      style={{
        background: `linear-gradient(${angle}, ${color} 0%, transparent 60%)`,
        opacity: finalOpacity
      }}
    />
  )
}

// Stable star positions
const STARS = [...Array(25)].map((_, i) => ({
  x: ((i * 17) % 100),
  y: ((i * 23) % 80),
  size: 1 + (i % 3),
  delay: (i * 0.4) % 10,
  twinkle: i % 4 === 0
}))

function Stars({ intensity, season }: { intensity: number; season: Season }) {
  // Season-tinted star colors for subtle variation
  const starColors: Record<Season, string> = {
    winter: 'rgba(186, 230, 253, 0.9)',
    summer: 'rgba(254, 243, 199, 0.9)',
    spring: 'rgba(255, 255, 255, 0.9)',
    autumn: 'rgba(255, 255, 255, 0.9)'
  }
  const starColor = starColors[season]

  return (
    <div
      className="absolute inset-0 transition-opacity duration-[3000ms]"
      style={{ opacity: intensity }}
    >
      {STARS.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: starColor,
            boxShadow: `0 0 ${star.size * 2}px ${starColor}`,
            animation: star.twinkle ? `twinkle ${3 + star.delay}s ease-in-out infinite` : undefined,
            animationDelay: `${star.delay}s`
          }}
        />
      ))}
    </div>
  )
}

function Moon({
  intensity,
  season,
  harvestMoon
}: {
  intensity: number
  season: Season
  harvestMoon: boolean
}) {
  // Moon color varies slightly by season
  const baseColor = harvestMoon ? '#FCD34D' :
                    season === 'winter' ? '#E0F2FE' : '#FEF3C7'
  const glowColor = harvestMoon ? 'rgba(251, 191, 36, 0.4)' :
                    season === 'winter' ? 'rgba(186, 230, 253, 0.3)' : 'rgba(254, 243, 199, 0.3)'
  const size = harvestMoon ? 80 : 60

  return (
    <div
      className="absolute transition-opacity duration-[3000ms]"
      style={{
        top: '8%',
        right: '15%',
        width: `${size}px`,
        height: `${size}px`,
        opacity: intensity
      }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          transform: 'scale(2)'
        }}
      />
      {/* Moon body */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 35%, #FFFFFF 0%, ${baseColor} 50%, ${harvestMoon ? '#D97706' : '#FDE68A'} 100%)`,
          boxShadow: `0 0 40px ${glowColor}`
        }}
      />
    </div>
  )
}

function ShootingStars({ intensity }: { intensity: number }) {
  const [shooting, setShooting] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 10 })

  useEffect(() => {
    const trigger = () => {
      setPosition({
        x: 10 + Math.random() * 50,
        y: 5 + Math.random() * 30
      })
      setShooting(true)
      setTimeout(() => setShooting(false), 1000)
    }

    // Random shooting stars every 15-45 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.5) trigger()
    }, 15000 + Math.random() * 30000)

    // Initial one after 5-10 seconds
    const initial = setTimeout(trigger, 5000 + Math.random() * 5000)

    return () => {
      clearInterval(interval)
      clearTimeout(initial)
    }
  }, [])

  if (!shooting) return null

  return (
    <div
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: '2px',
        height: '2px',
        background: 'white',
        borderRadius: '50%',
        boxShadow: '0 0 6px white, -20px -20px 10px rgba(255,255,255,0.5)',
        animation: 'shootingStar 1s ease-out forwards',
        opacity: intensity
      }}
    />
  )
}

function SeasonalParticles({
  type,
  intensity,
  windActive
}: {
  type: 'mist' | 'fireflies' | 'leaves' | 'snow' | 'none'
  intensity: number
  windActive: boolean
}) {
  if (type === 'none' || intensity < 0.1) return null

  const count = Math.floor(6 * intensity)

  switch (type) {
    case 'mist':
      return <MistParticles count={count} windActive={windActive} />
    case 'fireflies':
      return <FireflyParticles count={count} />
    case 'leaves':
      return <LeafParticles count={count} windActive={windActive} />
    case 'snow':
      return <SnowParticles count={count} />
    default:
      return null
  }
}

function MistParticles({ count, windActive }: { count: number; windActive: boolean }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${windActive ? 'wind-affected' : ''}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${(i * 20) % 100}%`,
            top: `${40 + (i * 10) % 40}%`,
            width: '120px',
            height: '60px',
            background: 'radial-gradient(ellipse at center, rgba(200, 200, 200, 0.1) 0%, transparent 70%)',
            filter: 'blur(20px)',
            animation: `float ${20 + i * 3}s ease-in-out infinite`,
            animationDelay: `${i * 2}s`
          }}
        />
      ))}
    </div>
  )
}

function FireflyParticles({ count }: { count: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${(i * 17) % 90}%`,
            top: `${30 + (i * 13) % 50}%`,
            width: '4px',
            height: '4px',
            background: 'rgba(253, 224, 71, 0.9)',
            boxShadow: '0 0 8px rgba(253, 224, 71, 0.8), 0 0 16px rgba(253, 224, 71, 0.4)',
            animation: `twinkle ${3 + (i % 3)}s ease-in-out infinite, float ${8 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`
          }}
        />
      ))}
    </div>
  )
}

function LeafParticles({ count, windActive }: { count: number; windActive: boolean }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${windActive ? 'wind-affected' : ''}`}>
      <style>{`
        @keyframes leafFall {
          0% { transform: translateY(-10%) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.6; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${(i * 18) % 100}%`,
            top: '-5%',
            width: '8px',
            height: '8px',
            background: i % 2 === 0 ? '#D97706' : '#B45309',
            borderRadius: '0 50% 50% 50%',
            animation: `leafFall ${15 + i * 3}s linear infinite`,
            animationDelay: `${i * 3}s`
          }}
        />
      ))}
    </div>
  )
}

function SnowParticles({ count }: { count: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes snowFall {
          0% { transform: translateY(-5%) translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.6; }
          100% { transform: translateY(105vh) translateX(20px); opacity: 0; }
        }
      `}</style>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${(i * 13) % 100}%`,
            top: '-3%',
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.5)',
            animation: `snowFall ${12 + i * 2}s linear infinite`,
            animationDelay: `${i * 2}s`
          }}
        />
      ))}
    </div>
  )
}

function Aurora({ intensity }: { intensity: number }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden transition-opacity duration-[3000ms]"
      style={{ opacity: intensity * 0.4 }}
    >
      <style>{`
        @keyframes aurora {
          0%, 100% { transform: translateX(-5%) scaleY(1); opacity: 0.3; }
          50% { transform: translateX(5%) scaleY(1.2); opacity: 0.5; }
        }
      `}</style>
      <div
        className="absolute"
        style={{
          top: '0',
          left: '10%',
          right: '10%',
          height: '40%',
          background: `linear-gradient(180deg,
            rgba(34, 211, 238, 0.2) 0%,
            rgba(52, 211, 153, 0.15) 30%,
            rgba(167, 139, 250, 0.1) 60%,
            transparent 100%)`,
          filter: 'blur(30px)',
          animation: 'aurora 20s ease-in-out infinite'
        }}
      />
    </div>
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
