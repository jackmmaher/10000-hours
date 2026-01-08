/**
 * AmbientAtmosphere - Living environmental layer (Gen 2)
 *
 * Design philosophy: Calm by default, expressive by choice.
 * Effects are felt, not seen. If you think "cool effect," it's too much.
 *
 * Gen 2 Changes:
 * - Reduced particle counts (5-8 max, not 25-40)
 * - Wind breath events (random gusts that shiver and settle)
 * - "Expressive" mode for users who want aurora, shooting stars, etc.
 * - Spring effects updated (no pink cherry blossoms - now mist/dew)
 *
 * Effects scale with mode: subtle → evocative → immersive
 */

import { useEffect, useState, useMemo } from 'react'
import { TimeOfDay, Season } from '../lib/themeEngine'

export type AtmosphereMode = 'off' | 'subtle' | 'evocative' | 'immersive'

interface AmbientAtmosphereProps {
  timeOfDay: TimeOfDay
  season: Season
  mode: AtmosphereMode
  /** Enable expressive effects (aurora, shooting stars, etc.) - user opt-in */
  expressive?: boolean
}

// ============================================================================
// STABLE RANDOM GENERATORS (for consistent particle positions)
// ============================================================================

function seededRandom(seed: number) {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
}

const generateParticles = (count: number, seed: number = 42) => {
  const random = seededRandom(seed)
  return [...Array(count)].map(() => ({
    x: random() * 100,
    y: random() * 100,
    size: 1 + random() * 3,
    delay: random() * 10,
    duration: 8 + random() * 12,
    rotation: random() * 360,
    drift: (random() - 0.5) * 30
  }))
}

// Gen 2: Reduced particle counts for calmer visuals
const STARS = generateParticles(25, 42)           // Was 60
const MIST_PARTICLES = generateParticles(6, 123)  // New: subtle mist for spring
const LEAVES = generateParticles(5, 456)          // Was 20
const FIREFLIES = generateParticles(6, 789)       // Was 30
const SNOWFLAKES = generateParticles(8, 321)      // Was 40
const RAIN_DROPS = generateParticles(12, 654)     // Was 50

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AmbientAtmosphere({ timeOfDay, season, mode, expressive = false }: AmbientAtmosphereProps) {
  const [mounted, setMounted] = useState(false)
  const [windActive, setWindActive] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Wind breath events - random gusts every 45-90 seconds
  useEffect(() => {
    if (mode === 'off') return

    const triggerWind = () => {
      setWindActive(true)
      // Wind lasts 3 seconds
      setTimeout(() => setWindActive(false), 3000)
    }

    // Initial wind after 20-40 seconds
    const initialDelay = 20000 + Math.random() * 20000
    const initialTimeout = setTimeout(triggerWind, initialDelay)

    // Recurring wind every 45-90 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance
        triggerWind()
      }
    }, 45000 + Math.random() * 45000)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [mode])

  if (mode === 'off' || !mounted) return null

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden ${windActive ? 'wind-active' : ''}`}
      style={{ zIndex: 0 }}
    >
      {/* Wind breath CSS */}
      <style>{`
        @keyframes windShiver {
          0% { transform: translateX(0) rotate(0deg); }
          30% { transform: translateX(15px) rotate(0.3deg); }
          60% { transform: translateX(8px) rotate(0.1deg); }
          100% { transform: translateX(0) rotate(0deg); }
        }

        .wind-active .wind-affected {
          animation: windShiver 3s ease-out;
        }

        /* Particles drift more during wind */
        .wind-active .wind-particle {
          animation-duration: 0.5s !important;
          transform: translateX(20px);
        }
      `}</style>

      {/* Base layer: Grain texture - ALL MODES */}
      <GrainOverlay intensity={mode === 'subtle' ? 0.03 : 0.04} />

      {/* Atmospheric gradient - ALL MODES */}
      <AtmosphericGradient timeOfDay={timeOfDay} season={season} mode={mode} />

      {/* Directional light - ALL MODES */}
      <DirectionalLight timeOfDay={timeOfDay} season={season} mode={mode} />

      {/* Horizon glow - EVOCATIVE+ */}
      {(mode === 'evocative' || mode === 'immersive') && (
        <HorizonGlow timeOfDay={timeOfDay} season={season} />
      )}

      {/* Season-specific effects - EVOCATIVE+ */}
      {(mode === 'evocative' || mode === 'immersive') && (
        <SeasonalEffects timeOfDay={timeOfDay} season={season} mode={mode} expressive={expressive} />
      )}

      {/* Environmental particles - IMMERSIVE */}
      {mode === 'immersive' && (
        <EnvironmentalParticles timeOfDay={timeOfDay} season={season} />
      )}

      {/* Celestial objects (moon, stars) - IMMERSIVE NIGHT */}
      {mode === 'immersive' && timeOfDay === 'night' && (
        <CelestialElements season={season} expressive={expressive} />
      )}
    </div>
  )
}

// ============================================================================
// GRAIN OVERLAY
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

// ============================================================================
// ATMOSPHERIC GRADIENT (Season-aware)
// ============================================================================

function AtmosphericGradient({ timeOfDay, season, mode }: { timeOfDay: TimeOfDay; season: Season; mode: AtmosphereMode }) {
  const gradients: Record<Season, Record<TimeOfDay, string>> = {
    winter: {
      morning: `
        radial-gradient(ellipse 120% 80% at 100% 30%, rgba(56, 189, 248, 0.1) 0%, transparent 50%),
        linear-gradient(180deg, rgba(224, 242, 254, 0.12) 0%, transparent 40%)
      `,
      daytime: `
        radial-gradient(ellipse 100% 60% at 50% -10%, rgba(14, 165, 233, 0.08) 0%, transparent 50%),
        linear-gradient(180deg, rgba(240, 249, 255, 0.1) 0%, transparent 30%)
      `,
      evening: `
        radial-gradient(ellipse 150% 80% at 0% 60%, rgba(245, 158, 11, 0.12) 0%, transparent 40%),
        radial-gradient(ellipse 100% 60% at 100% 80%, rgba(251, 146, 60, 0.1) 0%, transparent 40%)
      `,
      night: `
        radial-gradient(ellipse 80% 50% at 70% 10%, rgba(34, 211, 238, 0.06) 0%, transparent 50%),
        linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.4) 100%)
      `
    },
    spring: {
      morning: `
        radial-gradient(ellipse 120% 80% at 100% 40%, rgba(251, 113, 133, 0.12) 0%, transparent 50%),
        radial-gradient(ellipse 80% 60% at 20% 20%, rgba(192, 132, 252, 0.08) 0%, transparent 50%),
        linear-gradient(180deg, rgba(253, 242, 248, 0.15) 0%, transparent 40%)
      `,
      daytime: `
        radial-gradient(ellipse 100% 60% at 50% -10%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse 80% 40% at 80% 30%, rgba(134, 239, 172, 0.06) 0%, transparent 40%),
        linear-gradient(180deg, rgba(240, 253, 244, 0.1) 0%, transparent 30%)
      `,
      evening: `
        radial-gradient(ellipse 150% 80% at 0% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 40%),
        radial-gradient(ellipse 100% 60% at 100% 70%, rgba(244, 114, 182, 0.08) 0%, transparent 40%),
        linear-gradient(0deg, rgba(243, 232, 255, 0.1) 0%, transparent 40%)
      `,
      night: `
        radial-gradient(ellipse 80% 50% at 60% 15%, rgba(192, 132, 252, 0.08) 0%, transparent 50%),
        linear-gradient(180deg, rgba(30, 27, 46, 0) 0%, rgba(30, 27, 46, 0.3) 100%)
      `
    },
    summer: {
      morning: `
        radial-gradient(ellipse 120% 80% at 100% 30%, rgba(251, 191, 36, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse 80% 60% at 30% 60%, rgba(253, 224, 71, 0.08) 0%, transparent 50%),
        linear-gradient(180deg, rgba(255, 251, 235, 0.12) 0%, transparent 40%)
      `,
      daytime: `
        radial-gradient(ellipse 100% 60% at 50% -10%, rgba(234, 88, 12, 0.1) 0%, transparent 50%),
        linear-gradient(180deg, rgba(255, 247, 237, 0.12) 0%, transparent 30%)
      `,
      evening: `
        radial-gradient(ellipse 180% 100% at 0% 50%, rgba(245, 158, 11, 0.18) 0%, transparent 50%),
        radial-gradient(ellipse 120% 80% at 100% 70%, rgba(217, 119, 6, 0.12) 0%, transparent 50%),
        linear-gradient(0deg, rgba(254, 243, 199, 0.15) 0%, transparent 50%)
      `,
      night: `
        radial-gradient(ellipse 80% 50% at 50% 20%, rgba(251, 191, 36, 0.05) 0%, transparent 50%),
        linear-gradient(180deg, rgba(28, 25, 23, 0) 0%, rgba(28, 25, 23, 0.3) 100%)
      `
    },
    autumn: {
      morning: `
        radial-gradient(ellipse 120% 80% at 100% 40%, rgba(234, 179, 8, 0.12) 0%, transparent 50%),
        radial-gradient(ellipse 100% 60% at 20% 60%, rgba(194, 65, 12, 0.06) 0%, transparent 50%),
        linear-gradient(180deg, rgba(250, 247, 242, 0.1) 0%, transparent 40%)
      `,
      daytime: `
        radial-gradient(ellipse 100% 60% at 50% -10%, rgba(194, 65, 12, 0.08) 0%, transparent 50%),
        linear-gradient(180deg, rgba(251, 248, 243, 0.1) 0%, transparent 30%)
      `,
      evening: `
        radial-gradient(ellipse 180% 100% at 0% 60%, rgba(180, 83, 9, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse 100% 80% at 100% 80%, rgba(146, 64, 14, 0.1) 0%, transparent 50%),
        linear-gradient(0deg, rgba(245, 230, 211, 0.12) 0%, transparent 50%)
      `,
      night: `
        radial-gradient(ellipse 80% 50% at 60% 15%, rgba(217, 119, 6, 0.06) 0%, transparent 50%),
        linear-gradient(180deg, rgba(26, 20, 18, 0) 0%, rgba(26, 20, 18, 0.3) 100%)
      `
    }
  }

  const intensity = mode === 'subtle' ? 0.7 : mode === 'evocative' ? 1 : 1.3

  return (
    <div
      className="absolute inset-0 transition-opacity duration-1000"
      style={{
        background: gradients[season][timeOfDay],
        opacity: intensity
      }}
    />
  )
}

// ============================================================================
// DIRECTIONAL LIGHT (Season-aware)
// ============================================================================

function DirectionalLight({ timeOfDay, season, mode }: { timeOfDay: TimeOfDay; season: Season; mode: AtmosphereMode }) {
  const config: Record<Season, Record<TimeOfDay, { angle: string; color: string; opacity: number }>> = {
    winter: {
      morning: { angle: 'to bottom left', color: 'rgba(125, 211, 252, 0.18)', opacity: 0.8 },
      daytime: { angle: 'to bottom', color: 'rgba(255, 255, 255, 0.12)', opacity: 0.5 },
      evening: { angle: 'to top right', color: 'rgba(251, 191, 36, 0.15)', opacity: 0.9 },
      night: { angle: 'to bottom', color: 'rgba(34, 211, 238, 0.06)', opacity: 0.4 }
    },
    spring: {
      morning: { angle: 'to bottom left', color: 'rgba(251, 113, 133, 0.15)', opacity: 0.8 },
      daytime: { angle: 'to bottom', color: 'rgba(134, 239, 172, 0.1)', opacity: 0.5 },
      evening: { angle: 'to top right', color: 'rgba(192, 132, 252, 0.12)', opacity: 0.85 },
      night: { angle: 'to bottom', color: 'rgba(192, 132, 252, 0.06)', opacity: 0.4 }
    },
    summer: {
      morning: { angle: 'to bottom left', color: 'rgba(251, 191, 36, 0.2)', opacity: 0.9 },
      daytime: { angle: 'to bottom', color: 'rgba(253, 186, 116, 0.15)', opacity: 0.6 },
      evening: { angle: 'to top right', color: 'rgba(245, 158, 11, 0.22)', opacity: 1 },
      night: { angle: 'to bottom', color: 'rgba(251, 191, 36, 0.06)', opacity: 0.4 }
    },
    autumn: {
      morning: { angle: 'to bottom left', color: 'rgba(234, 179, 8, 0.15)', opacity: 0.75 },
      daytime: { angle: 'to bottom', color: 'rgba(251, 146, 60, 0.1)', opacity: 0.5 },
      evening: { angle: 'to top right', color: 'rgba(180, 83, 9, 0.18)', opacity: 0.95 },
      night: { angle: 'to bottom', color: 'rgba(217, 119, 6, 0.06)', opacity: 0.4 }
    }
  }

  const { angle, color, opacity } = config[season][timeOfDay]
  const finalOpacity = mode === 'subtle' ? opacity * 0.6 : opacity

  return (
    <div
      className="absolute inset-0 transition-all duration-1000"
      style={{
        background: `linear-gradient(${angle}, ${color} 0%, transparent 60%)`,
        opacity: finalOpacity
      }}
    />
  )
}

// ============================================================================
// HORIZON GLOW (Season-aware)
// ============================================================================

function HorizonGlow({ timeOfDay, season }: { timeOfDay: TimeOfDay; season: Season }) {
  const config: Record<Season, Record<TimeOfDay, { color: string; position: string; size: string }>> = {
    winter: {
      morning: { color: 'rgba(125, 211, 252, 0.2)', position: '100% 100%', size: '80% 30%' },
      daytime: { color: 'rgba(14, 165, 233, 0.08)', position: '50% 100%', size: '100% 20%' },
      evening: { color: 'rgba(245, 158, 11, 0.25)', position: '0% 100%', size: '100% 35%' },
      night: { color: 'rgba(34, 211, 238, 0.08)', position: '50% 100%', size: '100% 15%' }
    },
    spring: {
      morning: { color: 'rgba(251, 113, 133, 0.2)', position: '100% 100%', size: '80% 30%' },
      daytime: { color: 'rgba(134, 239, 172, 0.1)', position: '50% 100%', size: '100% 20%' },
      evening: { color: 'rgba(192, 132, 252, 0.2)', position: '0% 100%', size: '100% 35%' },
      night: { color: 'rgba(192, 132, 252, 0.08)', position: '50% 100%', size: '100% 15%' }
    },
    summer: {
      morning: { color: 'rgba(251, 191, 36, 0.25)', position: '100% 100%', size: '90% 35%' },
      daytime: { color: 'rgba(253, 186, 116, 0.12)', position: '50% 100%', size: '100% 25%' },
      evening: { color: 'rgba(245, 158, 11, 0.35)', position: '0% 100%', size: '100% 45%' },
      night: { color: 'rgba(251, 191, 36, 0.08)', position: '50% 100%', size: '100% 15%' }
    },
    autumn: {
      morning: { color: 'rgba(234, 179, 8, 0.2)', position: '100% 100%', size: '80% 30%' },
      daytime: { color: 'rgba(251, 146, 60, 0.1)', position: '50% 100%', size: '100% 20%' },
      evening: { color: 'rgba(180, 83, 9, 0.3)', position: '0% 100%', size: '100% 40%' },
      night: { color: 'rgba(217, 119, 6, 0.08)', position: '50% 100%', size: '100% 15%' }
    }
  }

  const { color, position, size } = config[season][timeOfDay]

  return (
    <div
      className="absolute inset-0 animate-pulse"
      style={{
        background: `radial-gradient(ellipse ${size} at ${position}, ${color} 0%, transparent 70%)`,
        animationDuration: '8s'
      }}
    />
  )
}

// ============================================================================
// SEASONAL EFFECTS (The distinctive elements)
// ============================================================================

function SeasonalEffects({ timeOfDay, season, mode, expressive }: { timeOfDay: TimeOfDay; season: Season; mode: AtmosphereMode; expressive: boolean }) {
  switch (season) {
    case 'spring':
      return <SpringEffects timeOfDay={timeOfDay} mode={mode} expressive={expressive} />
    case 'summer':
      return <SummerEffects timeOfDay={timeOfDay} mode={mode} expressive={expressive} />
    case 'autumn':
      return <AutumnEffects timeOfDay={timeOfDay} mode={mode} expressive={expressive} />
    case 'winter':
      return <WinterEffects timeOfDay={timeOfDay} mode={mode} expressive={expressive} />
  }
}

// --- SPRING EFFECTS (Gen 2: Mist, dew, soft rain - no pink blossoms) ---

function SpringEffects({ timeOfDay, mode, expressive }: { timeOfDay: TimeOfDay; mode: AtmosphereMode; expressive: boolean }) {
  return (
    <>
      {/* Light rays for morning - using sage green tint */}
      {(timeOfDay === 'morning') && <SoftLightRays color="rgba(124, 154, 110, 0.08)" fromRight />}

      {/* Morning mist - subtle floating particles */}
      {(timeOfDay === 'morning') && mode === 'immersive' && (
        <MorningMist />
      )}

      {/* Soft rain effect - evening and night */}
      {(timeOfDay === 'evening' || timeOfDay === 'night') && mode === 'immersive' && (
        <SoftRain />
      )}

      {/* Morning dew sparkles - only in expressive mode */}
      {timeOfDay === 'morning' && mode === 'immersive' && expressive && (
        <DewSparkles />
      )}
    </>
  )
}

/** Gen 2: Morning mist - subtle, ethereal fog wisps */
function MorningMist() {
  return (
    <div className="absolute inset-0 overflow-hidden wind-affected">
      {MIST_PARTICLES.map((particle, i) => (
        <div
          key={i}
          className="absolute wind-particle"
          style={{
            left: `${particle.x}%`,
            top: `${30 + particle.y * 0.5}%`,
            width: `${80 + particle.size * 40}px`,
            height: `${40 + particle.size * 20}px`,
            background: `radial-gradient(ellipse at center, rgba(197, 201, 192, 0.12) 0%, transparent 70%)`,
            borderRadius: '50%',
            animation: `mistDrift ${20 + particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            filter: 'blur(20px)'
          }}
        />
      ))}
      <style>{`
        @keyframes mistDrift {
          0%, 100% {
            transform: translateX(0) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translateX(30px) scale(1.1);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  )
}

function SoftRain() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {RAIN_DROPS.slice(0, 30).map((drop, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${drop.x}%`,
            top: '-5%',
            width: '1px',
            height: `${15 + drop.size * 5}px`,
            background: 'linear-gradient(180deg, transparent 0%, rgba(192, 132, 252, 0.3) 50%, rgba(192, 132, 252, 0.1) 100%)',
            animation: `rainFall ${0.8 + drop.duration * 0.05}s linear infinite`,
            animationDelay: `${drop.delay * 0.1}s`
          }}
        />
      ))}
      <style>{`
        @keyframes rainFall {
          0% { transform: translateY(-20px); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.4; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function DewSparkles() {
  const sparkles = useMemo(() => generateParticles(20, 999), [])

  return (
    <div className="absolute inset-0">
      {sparkles.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${60 + s.y * 0.4}%`,
            width: '3px',
            height: '3px',
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 0 6px rgba(251, 113, 133, 0.6), 0 0 12px rgba(255, 255, 255, 0.4)',
            animation: `sparkle ${2 + s.duration * 0.2}s ease-in-out infinite`,
            animationDelay: `${s.delay * 0.3}s`
          }}
        />
      ))}
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}

// --- SUMMER EFFECTS ---

function SummerEffects({ timeOfDay, mode, expressive }: { timeOfDay: TimeOfDay; mode: AtmosphereMode; expressive: boolean }) {
  return (
    <>
      {/* Soft golden rays for morning and evening - reduced intensity */}
      {(timeOfDay === 'morning' || timeOfDay === 'evening') && (
        <GoldenRays timeOfDay={timeOfDay} intense={expressive && mode === 'immersive'} />
      )}

      {/* Heat shimmer for daytime - only in expressive mode */}
      {timeOfDay === 'daytime' && mode === 'immersive' && expressive && (
        <HeatShimmer />
      )}

      {/* Fireflies for evening and night - reduced count */}
      {(timeOfDay === 'evening' || timeOfDay === 'night') && mode === 'immersive' && (
        <Fireflies />
      )}
    </>
  )
}

function GoldenRays({ timeOfDay, intense }: { timeOfDay: TimeOfDay; intense: boolean }) {
  const isMorning = timeOfDay === 'morning'
  const rayCount = intense ? 7 : 5

  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(rayCount)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: intense ? '3px' : '2px',
            height: '150%',
            background: `linear-gradient(180deg,
              rgba(251, 191, 36, ${intense ? 0.15 : 0.1}) 0%,
              rgba(245, 158, 11, ${intense ? 0.08 : 0.05}) 50%,
              transparent 100%)`,
            transformOrigin: isMorning ? 'top right' : 'top left',
            transform: `rotate(${isMorning ? 20 + i * 10 : -20 - i * 10}deg)`,
            top: '-20%',
            [isMorning ? 'right' : 'left']: `${5 + i * 12}%`,
            opacity: 0.8 - i * 0.08,
            animation: `rayPulse ${5 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            filter: intense ? 'blur(1px)' : 'none'
          }}
        />
      ))}
      <style>{`
        @keyframes rayPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}

function HeatShimmer() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: 'linear-gradient(0deg, rgba(253, 186, 116, 0.08) 0%, transparent 100%)',
          animation: 'shimmer 3s ease-in-out infinite',
          filter: 'blur(20px)'
        }}
      />
      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: scaleY(1); opacity: 0.5; }
          50% { transform: scaleY(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}

function Fireflies() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {FIREFLIES.map((fly, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${fly.x}%`,
            top: `${30 + fly.y * 0.6}%`,
            width: `${3 + fly.size}px`,
            height: `${3 + fly.size}px`,
            background: 'rgba(251, 191, 36, 0.9)',
            boxShadow: `
              0 0 ${6 + fly.size * 2}px rgba(251, 191, 36, 0.8),
              0 0 ${12 + fly.size * 4}px rgba(251, 191, 36, 0.4),
              0 0 ${20 + fly.size * 6}px rgba(251, 191, 36, 0.2)
            `,
            animation: `fireflyFloat ${8 + fly.duration}s ease-in-out infinite, fireflyGlow ${2 + fly.size}s ease-in-out infinite`,
            animationDelay: `${fly.delay}s`
          }}
        />
      ))}
      <style>{`
        @keyframes fireflyFloat {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(${10}px, -${20}px); }
          50% { transform: translate(${-5}px, ${10}px); }
          75% { transform: translate(${15}px, ${-10}px); }
        }
        @keyframes fireflyGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// --- AUTUMN EFFECTS ---

function AutumnEffects({ timeOfDay, mode, expressive }: { timeOfDay: TimeOfDay; mode: AtmosphereMode; expressive: boolean }) {
  return (
    <>
      {/* Copper light rays */}
      {(timeOfDay === 'morning' || timeOfDay === 'evening') && (
        <SoftLightRays
          color={timeOfDay === 'morning' ? 'rgba(139, 115, 85, 0.08)' : 'rgba(139, 90, 43, 0.1)'}
          fromRight={timeOfDay === 'morning'}
        />
      )}

      {/* Falling leaves - reduced count */}
      {mode === 'immersive' && (
        <FallingLeaves />
      )}

      {/* Woodsmoke haze for evening and night */}
      {(timeOfDay === 'evening' || timeOfDay === 'night') && mode === 'immersive' && (
        <WoodsmokeHaze />
      )}

      {/* Harvest moon glow for evening - only in expressive mode */}
      {timeOfDay === 'evening' && mode === 'immersive' && expressive && (
        <HarvestMoonGlow />
      )}
    </>
  )
}

function FallingLeaves() {
  const leafColors = [
    'rgba(234, 88, 12, 0.8)',   // Orange
    'rgba(194, 65, 12, 0.8)',   // Burnt orange
    'rgba(180, 83, 9, 0.75)',   // Copper
    'rgba(202, 138, 4, 0.8)',   // Gold
    'rgba(146, 64, 14, 0.7)'    // Brown
  ]

  return (
    <div className="absolute inset-0 overflow-hidden">
      {LEAVES.map((leaf, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${leaf.x}%`,
            top: '-5%',
            width: `${10 + leaf.size * 3}px`,
            height: `${8 + leaf.size * 2}px`,
            background: leafColors[i % leafColors.length],
            borderRadius: '50% 0 50% 50%',
            transform: `rotate(${leaf.rotation}deg)`,
            animation: `leafFall ${12 + leaf.duration}s ease-in-out infinite`,
            animationDelay: `${leaf.delay}s`,
            filter: 'blur(0.3px)'
          }}
        />
      ))}
      <style>{`
        @keyframes leafFall {
          0% {
            transform: translateY(-20px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 0.9; }
          50% { transform: translateY(50vh) translateX(${40}px) rotate(180deg); }
          90% { opacity: 0.7; }
          100% {
            transform: translateY(100vh) translateX(${-20}px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

function WoodsmokeHaze() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 40% at 30% 90%, rgba(168, 139, 112, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 80% 30% at 70% 85%, rgba(146, 64, 14, 0.06) 0%, transparent 50%)
          `,
          animation: 'hazeFloat 20s ease-in-out infinite'
        }}
      />
      <style>{`
        @keyframes hazeFloat {
          0%, 100% { transform: translateX(0); opacity: 0.6; }
          50% { transform: translateX(20px); opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}

function HarvestMoonGlow() {
  return (
    <div
      className="absolute"
      style={{
        top: '10%',
        right: '15%',
        width: '80px',
        height: '80px'
      }}
    >
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
          transform: 'scale(3)',
          animationDuration: '6s'
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 40% 40%, rgba(254, 243, 199, 0.95) 0%, rgba(251, 191, 36, 0.8) 100%)',
          boxShadow: `
            inset -6px -6px 15px rgba(217, 119, 6, 0.3),
            0 0 60px rgba(245, 158, 11, 0.4),
            0 0 100px rgba(245, 158, 11, 0.2)
          `
        }}
      />
    </div>
  )
}

// --- WINTER EFFECTS ---

function WinterEffects({ timeOfDay, mode, expressive }: { timeOfDay: TimeOfDay; mode: AtmosphereMode; expressive: boolean }) {
  return (
    <>
      {/* Cool light rays for morning */}
      {timeOfDay === 'morning' && (
        <SoftLightRays color="rgba(122, 139, 139, 0.06)" fromRight />
      )}

      {/* Warm rays for evening */}
      {timeOfDay === 'evening' && (
        <SoftLightRays color="rgba(154, 123, 90, 0.08)" fromRight={false} />
      )}

      {/* Gentle snowfall - always calm */}
      {mode === 'immersive' && (
        <Snowfall intensity={expressive && timeOfDay === 'night' ? 'heavy' : 'light'} />
      )}

      {/* Frost shimmer for morning - only in expressive mode */}
      {timeOfDay === 'morning' && mode === 'immersive' && expressive && (
        <FrostShimmer />
      )}
    </>
  )
}

function Snowfall({ intensity }: { intensity: 'light' | 'heavy' }) {
  // Gen 2: Reduced counts (was 40/20, now 8/5)
  const count = intensity === 'heavy' ? 8 : 5

  return (
    <div className="absolute inset-0 overflow-hidden">
      {SNOWFLAKES.slice(0, count).map((flake, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${flake.x}%`,
            top: '-3%',
            width: `${2 + flake.size}px`,
            height: `${2 + flake.size}px`,
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.5)',
            animation: `snowFall ${10 + flake.duration}s linear infinite`,
            animationDelay: `${flake.delay}s`
          }}
        />
      ))}
      <style>{`
        @keyframes snowFall {
          0% {
            transform: translateY(-10px) translateX(0);
            opacity: 0;
          }
          10% { opacity: 0.9; }
          90% { opacity: 0.7; }
          100% {
            transform: translateY(100vh) translateX(${20}px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

function FrostShimmer() {
  const crystals = useMemo(() => generateParticles(15, 777), [])

  return (
    <div className="absolute inset-0">
      {crystals.map((c, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: '4px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 0 8px rgba(125, 211, 252, 0.6), 0 0 16px rgba(255, 255, 255, 0.3)',
            animation: `frostSparkle ${3 + c.duration * 0.2}s ease-in-out infinite`,
            animationDelay: `${c.delay * 0.2}s`,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
          }}
        />
      ))}
      <style>{`
        @keyframes frostSparkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(45deg); }
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// SHARED LIGHT RAYS COMPONENT
// ============================================================================

function SoftLightRays({ color, fromRight }: { color: string; fromRight: boolean }) {
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
            transform: `rotate(${fromRight ? 25 + i * 8 : -25 - i * 8}deg)`,
            top: '-20%',
            [fromRight ? 'right' : 'left']: `${10 + i * 15}%`,
            opacity: 0.6 - i * 0.1,
            animation: `rayPulse ${6 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`
          }}
        />
      ))}
      <style>{`
        @keyframes rayPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// ENVIRONMENTAL PARTICLES (Season-aware floating elements)
// ============================================================================

function EnvironmentalParticles({ timeOfDay, season }: { timeOfDay: TimeOfDay; season: Season }) {
  const config: Record<Season, { count: number; color: string; size: number; glow: boolean }> = {
    spring: { count: 12, color: 'rgba(251, 207, 232, 0.5)', size: 2, glow: false },
    summer: { count: 10, color: 'rgba(253, 224, 71, 0.4)', size: 2, glow: true },
    autumn: { count: 8, color: 'rgba(217, 119, 6, 0.3)', size: 2, glow: false },
    winter: { count: 15, color: 'rgba(226, 232, 240, 0.5)', size: 1.5, glow: false }
  }

  const { count, color, size, glow } = config[season]
  const particles = useMemo(() => generateParticles(count, 111), [count])

  // Adjust based on time of day
  const adjustedOpacity = timeOfDay === 'night' ? 0.7 : 1

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ opacity: adjustedOpacity }}>
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${size + p.size * 0.5}px`,
            height: `${size + p.size * 0.5}px`,
            background: color,
            boxShadow: glow ? `0 0 8px ${color}` : 'none',
            animation: `floatParticle ${15 + p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-15px) translateX(8px); opacity: 0.7; }
          50% { transform: translateY(-25px) translateX(-5px); opacity: 0.5; }
          75% { transform: translateY(-10px) translateX(12px); opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// CELESTIAL ELEMENTS (Night sky features)
// ============================================================================

function CelestialElements({ season, expressive }: { season: Season; expressive: boolean }) {
  return (
    <>
      {/* Star field - always shown, but calmer */}
      <StarField season={season} />

      {/* Moon - always shown */}
      <Moon season={season} />

      {/* Shooting stars - ONLY in expressive mode (easter egg) */}
      {expressive && <ShootingStars />}

      {/* Aurora for winter - ONLY in expressive mode (easter egg) */}
      {season === 'winter' && expressive && <Aurora />}
    </>
  )
}

function StarField({ season }: { season: Season }) {
  // Adjust star color based on season
  const starColor: Record<Season, string> = {
    winter: 'rgba(226, 232, 240, 0.9)',
    spring: 'rgba(216, 180, 254, 0.85)',
    summer: 'rgba(254, 240, 138, 0.8)',
    autumn: 'rgba(253, 224, 71, 0.75)'
  }

  return (
    <div className="absolute inset-0">
      {STARS.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y * 0.6}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: starColor[season],
            boxShadow: `0 0 ${star.size * 2}px ${starColor[season].replace('0.9', '0.5').replace('0.85', '0.5').replace('0.8', '0.4').replace('0.75', '0.4')}`,
            animation: `twinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`
          }}
        />
      ))}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}

function Moon({ season }: { season: Season }) {
  // Moon color varies by season
  const moonConfig: Record<Season, { glow: string; surface: string }> = {
    winter: {
      glow: 'rgba(226, 232, 240, 0.15)',
      surface: 'radial-gradient(circle at 35% 35%, rgba(248, 250, 252, 0.95) 0%, rgba(203, 213, 225, 0.8) 100%)'
    },
    spring: {
      glow: 'rgba(216, 180, 254, 0.12)',
      surface: 'radial-gradient(circle at 35% 35%, rgba(245, 243, 255, 0.95) 0%, rgba(216, 180, 254, 0.7) 100%)'
    },
    summer: {
      glow: 'rgba(254, 240, 138, 0.1)',
      surface: 'radial-gradient(circle at 35% 35%, rgba(255, 251, 235, 0.95) 0%, rgba(254, 240, 138, 0.7) 100%)'
    },
    autumn: {
      glow: 'rgba(251, 191, 36, 0.12)',
      surface: 'radial-gradient(circle at 35% 35%, rgba(254, 252, 232, 0.95) 0%, rgba(251, 191, 36, 0.7) 100%)'
    }
  }

  const { glow, surface } = moonConfig[season]

  return (
    <div
      className="absolute"
      style={{
        top: '8%',
        right: '15%',
        width: '60px',
        height: '60px'
      }}
    >
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          transform: 'scale(3)',
          animationDuration: '6s'
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: surface,
          boxShadow: `
            inset -4px -4px 10px rgba(148, 163, 184, 0.3),
            0 0 40px ${glow.replace('0.15', '0.3').replace('0.12', '0.25').replace('0.1', '0.2')},
            0 0 80px ${glow}
          `
        }}
      />
    </div>
  )
}

function ShootingStars() {
  const [shootingStars, setShootingStars] = useState<Array<{ id: number; x: number; delay: number }>>([])

  useEffect(() => {
    // Generate a shooting star every 8-15 seconds
    const createShootingStar = () => {
      const id = Date.now()
      const x = 10 + Math.random() * 60
      setShootingStars(prev => [...prev.slice(-3), { id, x, delay: 0 }])

      // Remove after animation
      setTimeout(() => {
        setShootingStars(prev => prev.filter(s => s.id !== id))
      }, 2000)
    }

    // Initial delay before first shooting star
    const initialTimeout = setTimeout(createShootingStar, 3000)

    // Recurring shooting stars
    const interval = setInterval(() => {
      if (Math.random() > 0.4) { // 60% chance
        createShootingStar()
      }
    }, 8000 + Math.random() * 7000)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {shootingStars.map(star => (
        <div
          key={star.id}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: '5%',
            width: '2px',
            height: '2px',
            background: 'white',
            borderRadius: '50%',
            boxShadow: '0 0 6px white, 0 0 12px white',
            animation: 'shootingStar 1.5s ease-out forwards'
          }}
        />
      ))}
      <style>{`
        @keyframes shootingStar {
          0% {
            transform: translateX(0) translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(200px) translateY(150px) scale(0.3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

function Aurora() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute"
        style={{
          top: '5%',
          left: '10%',
          width: '80%',
          height: '40%',
          background: `
            linear-gradient(90deg,
              transparent 0%,
              rgba(34, 211, 238, 0.04) 20%,
              rgba(56, 189, 248, 0.06) 40%,
              rgba(34, 211, 238, 0.05) 60%,
              rgba(14, 165, 233, 0.04) 80%,
              transparent 100%
            )
          `,
          filter: 'blur(30px)',
          animation: 'aurora 20s ease-in-out infinite',
          transformOrigin: 'center'
        }}
      />
      <div
        className="absolute"
        style={{
          top: '10%',
          left: '20%',
          width: '60%',
          height: '30%',
          background: `
            linear-gradient(90deg,
              transparent 0%,
              rgba(167, 139, 250, 0.03) 30%,
              rgba(34, 211, 238, 0.05) 50%,
              rgba(167, 139, 250, 0.03) 70%,
              transparent 100%
            )
          `,
          filter: 'blur(40px)',
          animation: 'aurora 25s ease-in-out infinite reverse',
          animationDelay: '-5s'
        }}
      />
      <style>{`
        @keyframes aurora {
          0%, 100% {
            transform: translateX(-5%) scaleY(1);
            opacity: 0.5;
          }
          25% {
            transform: translateX(5%) scaleY(1.2);
            opacity: 0.8;
          }
          50% {
            transform: translateX(-3%) scaleY(0.9);
            opacity: 0.6;
          }
          75% {
            transform: translateX(3%) scaleY(1.1);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  )
}
