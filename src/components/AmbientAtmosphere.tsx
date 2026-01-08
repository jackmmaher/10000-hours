/**
 * AmbientAtmosphere - Living environmental layer (Gen 2)
 *
 * Design philosophy: Calm by default, expressive by choice.
 * Effects are felt, not seen. If you think "cool effect," it's too much.
 *
 * Gen 2 Changes:
 * - Reduced particle counts (5-8 max, not 25-40)
 * - Wind breath events (random gusts that shiver and settle)
 * - "Expressive" toggle for users who want aurora, shooting stars, etc.
 * - Spring effects updated (no pink cherry blossoms - now mist/dew)
 */

import { useEffect, useState, useMemo } from 'react'
import { TimeOfDay, Season } from '../lib/themeEngine'

interface AmbientAtmosphereProps {
  timeOfDay: TimeOfDay
  season: Season
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

export function AmbientAtmosphere({ timeOfDay, season, expressive = false }: AmbientAtmosphereProps) {
  const [mounted, setMounted] = useState(false)
  const [windActive, setWindActive] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Wind breath events - random gusts every 45-90 seconds
  useEffect(() => {
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
  }, [])

  if (!mounted) return null

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

      {/* Base layer: Grain texture */}
      <GrainOverlay intensity={0.04} />

      {/* Atmospheric gradient */}
      <AtmosphericGradient timeOfDay={timeOfDay} season={season} />

      {/* Directional light */}
      <DirectionalLight timeOfDay={timeOfDay} season={season} />

      {/* Horizon glow */}
      <HorizonGlow timeOfDay={timeOfDay} season={season} />

      {/* Season-specific effects */}
      <SeasonalEffects timeOfDay={timeOfDay} season={season} expressive={expressive} />

      {/* Environmental particles */}
      <EnvironmentalParticles timeOfDay={timeOfDay} season={season} />

      {/* Celestial objects (moon, stars) - night only */}
      {timeOfDay === 'night' && (
        <CelestialElements season={season} expressive={expressive} />
      )}

      {/* Wind gust visual - visible across ALL themes when wind triggers */}
      <WindGust active={windActive} season={season} />
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

function AtmosphericGradient({ timeOfDay, season }: { timeOfDay: TimeOfDay; season: Season }) {
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

  const intensity = 1.3

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

function DirectionalLight({ timeOfDay, season }: { timeOfDay: TimeOfDay; season: Season }) {
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
  const finalOpacity = opacity

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

function SeasonalEffects({ timeOfDay, season, expressive }: { timeOfDay: TimeOfDay; season: Season; expressive: boolean }) {
  switch (season) {
    case 'spring':
      return <SpringEffects timeOfDay={timeOfDay} expressive={expressive} />
    case 'summer':
      return <SummerEffects timeOfDay={timeOfDay} expressive={expressive} />
    case 'autumn':
      return <AutumnEffects timeOfDay={timeOfDay} expressive={expressive} />
    case 'winter':
      return <WinterEffects timeOfDay={timeOfDay} expressive={expressive} />
  }
}

// --- SPRING EFFECTS (Gen 2: Mist, dew, soft rain - no pink blossoms) ---

function SpringEffects({ timeOfDay, expressive }: { timeOfDay: TimeOfDay; expressive: boolean }) {
  return (
    <>
      {/* Light rays for morning - using sage green tint */}
      {timeOfDay === 'morning' && <SoftLightRays color="rgba(124, 154, 110, 0.08)" fromRight />}

      {/* Daytime - soft sunlight rays and floating pollen */}
      {timeOfDay === 'daytime' && <SoftLightRays color="rgba(134, 239, 172, 0.06)" fromRight={false} />}
      {timeOfDay === 'daytime' && <FloatingPollen />}

      {/* Morning mist - subtle floating particles */}
      {timeOfDay === 'morning' && <MorningMist />}

      {/* Soft rain effect - evening and night */}
      {(timeOfDay === 'evening' || timeOfDay === 'night') && <SoftRain />}

      {/* Morning dew sparkles - only in expressive mode */}
      {timeOfDay === 'morning' && expressive && <DewSparkles />}
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
  // Enhanced: Gradient streaks with varied heights and speeds
  return (
    <div className="absolute inset-0 overflow-hidden">
      {RAIN_DROPS.slice(0, 40).map((drop, i) => {
        const height = 15 + drop.size * 8
        const fallDuration = 0.5 + drop.duration * 0.03

        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${drop.x}%`,
              top: '-5%',
              width: '1px',
              height: `${height}px`,
              background: `linear-gradient(180deg,
                transparent 0%,
                rgba(148, 163, 184, 0.4) 20%,
                rgba(148, 163, 184, 0.6) 80%,
                transparent 100%
              )`,
              animation: `enhancedRainFall ${fallDuration}s linear infinite`,
              animationDelay: `${drop.delay * 0.1}s`
            }}
          />
        )
      })}
      <style>{`
        @keyframes enhancedRainFall {
          0% {
            transform: translateY(-20px);
            opacity: 0;
          }
          10% { opacity: 0.8; }
          90% { opacity: 0.6; }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
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

/** Floating pollen particles for spring daytime */
function FloatingPollen() {
  const pollenParticles = useMemo(() => generateParticles(12, 555), [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {pollenParticles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${20 + p.y * 0.6}%`,
            width: `${2 + p.size * 0.5}px`,
            height: `${2 + p.size * 0.5}px`,
            background: 'rgba(253, 224, 71, 0.6)',
            boxShadow: '0 0 4px rgba(253, 224, 71, 0.4)',
            animation: `pollenFloat ${15 + p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
      <style>{`
        @keyframes pollenFloat {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          25% { transform: translate(20px, -30px) scale(1.1); opacity: 0.7; }
          50% { transform: translate(-15px, -50px) scale(0.9); opacity: 0.5; }
          75% { transform: translate(25px, -20px) scale(1.05); opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}

// --- SUMMER EFFECTS ---

function SummerEffects({ timeOfDay, expressive }: { timeOfDay: TimeOfDay; expressive: boolean }) {
  return (
    <>
      {/* Soft golden rays for morning and evening */}
      {(timeOfDay === 'morning' || timeOfDay === 'evening') && (
        <GoldenRays timeOfDay={timeOfDay} intense={expressive} />
      )}

      {/* Daytime sun rays */}
      {timeOfDay === 'daytime' && <SoftLightRays color="rgba(253, 186, 116, 0.08)" fromRight={false} />}

      {/* Heat shimmer for daytime */}
      {timeOfDay === 'daytime' && <HeatShimmer />}

      {/* Dust motes floating in sunlight - daytime expressive */}
      {timeOfDay === 'daytime' && expressive && <SunlitDust />}

      {/* Fireflies for evening and night */}
      {(timeOfDay === 'evening' || timeOfDay === 'night') && <Fireflies />}
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
      {FIREFLIES.map((fly, i) => {
        const driftDuration = 10 + fly.duration
        const glowDuration = 2.5 + fly.size * 0.5

        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${fly.x}%`,
              top: `${25 + fly.y * 0.55}%`,
            }}
          >
            {/* Outer glow halo */}
            <div
              className="absolute rounded-full"
              style={{
                inset: '-8px',
                background: 'radial-gradient(circle, rgba(250, 204, 21, 0.4) 0%, transparent 70%)',
                animation: `fireflyGlow ${glowDuration}s ease-in-out infinite`,
                animationDelay: `${fly.delay * 0.3}s`
              }}
            />
            {/* Core firefly */}
            <div
              className="rounded-full"
              style={{
                width: '4px',
                height: '4px',
                background: '#fef08a',
                animation: `
                  fireflyDrift ${driftDuration}s ease-in-out infinite,
                  fireflyGlow ${glowDuration}s ease-in-out infinite
                `,
                animationDelay: `${fly.delay}s, ${fly.delay * 0.3}s`
              }}
            />
          </div>
        )
      })}
      <style>{`
        @keyframes fireflyDrift {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(25px, -35px); }
          40% { transform: translate(-15px, -10px); }
          60% { transform: translate(35px, 20px); }
          80% { transform: translate(-10px, -25px); }
        }
        @keyframes fireflyGlow {
          0%, 100% {
            opacity: 0.1;
            box-shadow: 0 0 4px rgba(250, 204, 21, 0.3);
          }
          15% {
            opacity: 0.9;
            box-shadow: 0 0 8px rgba(250, 204, 21, 0.8), 0 0 16px rgba(250, 204, 21, 0.4), 0 0 24px rgba(250, 204, 21, 0.2);
          }
          30% {
            opacity: 0.2;
            box-shadow: 0 0 4px rgba(250, 204, 21, 0.2);
          }
          50% {
            opacity: 0.95;
            box-shadow: 0 0 10px rgba(250, 204, 21, 0.9), 0 0 20px rgba(250, 204, 21, 0.5), 0 0 30px rgba(250, 204, 21, 0.2);
          }
          65% { opacity: 0.15; }
        }
      `}</style>
    </div>
  )
}

/** Sunlit dust motes floating in summer afternoon light */
function SunlitDust() {
  const dustMotes = useMemo(() => generateParticles(15, 888), [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {dustMotes.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${10 + d.y * 0.7}%`,
            width: `${1 + d.size * 0.3}px`,
            height: `${1 + d.size * 0.3}px`,
            background: 'rgba(255, 251, 235, 0.8)',
            boxShadow: '0 0 3px rgba(253, 224, 71, 0.5)',
            animation: `dustFloat ${20 + d.duration}s ease-in-out infinite`,
            animationDelay: `${d.delay}s`
          }}
        />
      ))}
      <style>{`
        @keyframes dustFloat {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          20% { transform: translate(15px, 10px); opacity: 0.7; }
          40% { transform: translate(-10px, -5px); opacity: 0.5; }
          60% { transform: translate(20px, 15px); opacity: 0.8; }
          80% { transform: translate(-5px, -10px); opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

// --- AUTUMN EFFECTS ---

function AutumnEffects({ timeOfDay, expressive }: { timeOfDay: TimeOfDay; expressive: boolean }) {
  return (
    <>
      {/* Copper light rays */}
      {(timeOfDay === 'morning' || timeOfDay === 'evening') && (
        <SoftLightRays
          color={timeOfDay === 'morning' ? 'rgba(139, 115, 85, 0.08)' : 'rgba(139, 90, 43, 0.1)'}
          fromRight={timeOfDay === 'morning'}
        />
      )}

      {/* Daytime golden rays */}
      {timeOfDay === 'daytime' && <SoftLightRays color="rgba(217, 119, 6, 0.06)" fromRight={false} />}

      {/* Morning fog - subtle ground mist */}
      {timeOfDay === 'morning' && <AutumnMist />}

      {/* Falling leaves */}
      <FallingLeaves />

      {/* Woodsmoke haze for evening and night */}
      {(timeOfDay === 'evening' || timeOfDay === 'night') && <WoodsmokeHaze />}

      {/* Harvest moon glow for evening - only in expressive mode */}
      {timeOfDay === 'evening' && expressive && <HarvestMoonGlow />}
    </>
  )
}

/** Autumn morning mist - low-lying ground fog */
function AutumnMist() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${i * 25}%`,
            bottom: `${5 + i * 5}%`,
            width: '100px',
            height: '60px',
            background: `radial-gradient(ellipse at center, rgba(168, 139, 112, 0.15) 0%, transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(25px)',
            animation: `autumnMistDrift ${25 + i * 5}s ease-in-out infinite`,
            animationDelay: `${i * 3}s`
          }}
        />
      ))}
      <style>{`
        @keyframes autumnMistDrift {
          0%, 100% { transform: translateX(0) scale(1); opacity: 0.5; }
          50% { transform: translateX(40px) scale(1.2); opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}

function FallingLeaves() {
  // Enhanced: 3 distinct leaf types with gradients
  const leafTypes = [
    { name: 'oak', gradient: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)' },
    { name: 'maple', gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' },
    { name: 'birch', gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' }
  ]

  return (
    <div className="absolute inset-0 overflow-hidden">
      {LEAVES.map((leaf, i) => {
        const type = leafTypes[i % 3]
        const fallDuration = 12 + leaf.duration
        const width = 10 + leaf.size * 3
        const height = 8 + leaf.size * 2

        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${leaf.x}%`,
              top: '-5%',
              width: `${width}px`,
              height: `${height}px`,
              background: type.gradient,
              borderRadius: '40% 0 40% 40%',
              boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.15)',
              transformOrigin: '30% 30%',
              animation: `enhancedLeafFall ${fallDuration}s ease-in-out infinite`,
              animationDelay: `${leaf.delay}s`
            }}
          />
        )
      })}
      <style>{`
        @keyframes enhancedLeafFall {
          0% {
            transform: translateY(-30px) translateX(0) rotate(0deg) rotateY(0deg);
            opacity: 0;
          }
          5% { opacity: 0.9; }
          25% {
            transform: translateY(25vh) translateX(40px) rotate(90deg) rotateY(180deg);
          }
          50% {
            transform: translateY(50vh) translateX(-20px) rotate(200deg) rotateY(0deg);
          }
          75% {
            transform: translateY(75vh) translateX(30px) rotate(280deg) rotateY(180deg);
          }
          95% { opacity: 0.7; }
          100% {
            transform: translateY(105vh) translateX(10px) rotate(400deg) rotateY(0deg);
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
  // Enhanced: Multi-layered atmospheric glow with subtle texture
  return (
    <div
      className="absolute"
      style={{
        top: '10%',
        right: '12%',
        width: '70px',
        height: '70px'
      }}
    >
      {/* Outermost atmospheric glow */}
      <div
        className="absolute rounded-full"
        style={{
          inset: '-80px',
          background: 'radial-gradient(circle, rgba(251, 146, 60, 0.1) 0%, transparent 60%)'
        }}
      />
      {/* Middle glow layer */}
      <div
        className="absolute rounded-full animate-pulse"
        style={{
          inset: '-40px',
          background: `radial-gradient(circle,
            rgba(251, 191, 36, 0.25) 0%,
            rgba(245, 158, 11, 0.15) 30%,
            rgba(217, 119, 6, 0.08) 50%,
            transparent 70%
          )`,
          animationDuration: '8s'
        }}
      />
      {/* Moon surface with highlight */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15) 0%, transparent 40%),
            radial-gradient(circle at 30% 30%, #fef3c7 0%, #fbbf24 30%, #f59e0b 60%, #d97706 100%)
          `,
          animation: 'harvestPulse 10s ease-in-out infinite'
        }}
      />
      <style>{`
        @keyframes harvestPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  )
}

// --- WINTER EFFECTS ---

function WinterEffects({ timeOfDay, expressive }: { timeOfDay: TimeOfDay; expressive: boolean }) {
  return (
    <>
      {/* Cool light rays for morning */}
      {timeOfDay === 'morning' && <SoftLightRays color="rgba(122, 139, 139, 0.06)" fromRight />}

      {/* Daytime pale winter sun rays */}
      {timeOfDay === 'daytime' && <SoftLightRays color="rgba(186, 230, 253, 0.05)" fromRight={false} />}

      {/* Warm rays for evening */}
      {timeOfDay === 'evening' && <SoftLightRays color="rgba(154, 123, 90, 0.08)" fromRight={false} />}

      {/* Snowfall - heavy on expressive night, light otherwise */}
      <Snowfall intensity={expressive && timeOfDay === 'night' ? 'heavy' : 'light'} />

      {/* Frost shimmer for morning - only in expressive mode */}
      {timeOfDay === 'morning' && expressive && <FrostShimmer />}

      {/* Cold breath mist for daytime and evening */}
      {(timeOfDay === 'daytime' || timeOfDay === 'evening') && <ColdBreathMist />}

      {/* Ice crystal sparkle for night expressive */}
      {timeOfDay === 'night' && expressive && <IceCrystals />}
    </>
  )
}

function Snowfall({ intensity }: { intensity: 'light' | 'heavy' }) {
  // Enhanced: varied sizes with tumble and drift
  const count = intensity === 'heavy' ? 12 : 8

  return (
    <div className="absolute inset-0 overflow-hidden">
      {SNOWFLAKES.slice(0, count).map((flake, i) => {
        const size = 2 + flake.size * 1.5
        const isLarge = size > 4
        const fallDuration = 10 + flake.duration
        const driftX = -20 + (flake.drift + 0.5) * 40

        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${flake.x}%`,
              top: '-3%',
              width: `${size}px`,
              height: `${size}px`,
              background: '#fff',
              boxShadow: isLarge
                ? '0 0 3px rgba(255, 255, 255, 0.8), 0 0 6px rgba(186, 230, 253, 0.3)'
                : '0 0 2px rgba(255, 255, 255, 0.5)',
              opacity: isLarge ? 0.95 : 0.7,
              animation: `enhancedSnowFall ${fallDuration}s linear infinite`,
              animationDelay: `${flake.delay}s`,
              // CSS custom properties for per-flake variation
              ['--drift-x' as string]: `${driftX}px`,
              ['--max-opacity' as string]: isLarge ? 0.95 : 0.7
            }}
          />
        )
      })}
      <style>{`
        @keyframes enhancedSnowFall {
          0% {
            transform: translateY(-10px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          5% { opacity: var(--max-opacity, 0.9); }
          50% {
            transform: translateY(50vh) translateX(var(--drift-x, 15px)) rotate(180deg);
          }
          95% { opacity: calc(var(--max-opacity, 0.9) * 0.6); }
          100% {
            transform: translateY(100vh) translateX(calc(var(--drift-x, 15px) * -0.5)) rotate(360deg);
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

/** Cold breath mist - subtle rising vapor effect */
function ColdBreathMist() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${20 + i * 30}%`,
            bottom: '10%',
            width: '80px',
            height: '50px',
            background: 'radial-gradient(ellipse at center, rgba(226, 232, 240, 0.12) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(20px)',
            animation: `coldBreath ${8 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 3}s`
          }}
        />
      ))}
      <style>{`
        @keyframes coldBreath {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-30px) scale(1.3); opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}

/** Ice crystals sparkling in winter night */
function IceCrystals() {
  const crystalParticles = useMemo(() => generateParticles(20, 666), [])

  return (
    <div className="absolute inset-0">
      {crystalParticles.map((c, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${c.x}%`,
            top: `${c.y * 0.8}%`,
            width: `${3 + c.size}px`,
            height: `${3 + c.size}px`,
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 0 6px rgba(186, 230, 253, 0.8), 0 0 12px rgba(255, 255, 255, 0.4)',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            animation: `iceCrystalGlitter ${2 + c.duration * 0.3}s ease-in-out infinite`,
            animationDelay: `${c.delay * 0.4}s`
          }}
        />
      ))}
      <style>{`
        @keyframes iceCrystalGlitter {
          0%, 100% { opacity: 0.2; transform: scale(0.9) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.1) rotate(30deg); }
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
  // Enhanced: 3 color temperature types for realistic star field
  const starTypes: Record<Season, Array<{ bg: string; glow: string }>> = {
    winter: [
      { bg: '#fff', glow: 'rgba(147, 197, 253, 0.5)' },      // White-blue (hot)
      { bg: '#bfdbfe', glow: 'rgba(147, 197, 253, 0.4)' },   // Cool blue
      { bg: '#e2e8f0', glow: 'rgba(226, 232, 240, 0.4)' }    // White
    ],
    spring: [
      { bg: '#fff', glow: 'rgba(216, 180, 254, 0.5)' },      // White with purple
      { bg: '#e9d5ff', glow: 'rgba(216, 180, 254, 0.4)' },   // Soft purple
      { bg: '#fef3c7', glow: 'rgba(253, 224, 71, 0.3)' }     // Warm
    ],
    summer: [
      { bg: '#fff', glow: 'rgba(253, 224, 71, 0.4)' },       // White-gold
      { bg: '#fef3c7', glow: 'rgba(253, 224, 71, 0.5)' },    // Warm yellow
      { bg: '#fde68a', glow: 'rgba(251, 191, 36, 0.4)' }     // Golden
    ],
    autumn: [
      { bg: '#fff', glow: 'rgba(251, 191, 36, 0.4)' },       // White-amber
      { bg: '#fef3c7', glow: 'rgba(253, 224, 71, 0.5)' },    // Warm
      { bg: '#fed7aa', glow: 'rgba(251, 146, 60, 0.4)' }     // Amber
    ]
  }

  const types = starTypes[season]

  return (
    <div className="absolute inset-0">
      {STARS.map((star, i) => {
        const type = types[i % 3]
        const baseOpacity = 0.4 + (star.size / 4) * 0.4
        const twinkleDuration = 3 + star.duration * 0.3
        const shouldTwinkle = i % 2 === 0

        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y * 0.6}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: type.bg,
              boxShadow: `0 0 2px ${type.bg}, 0 0 4px ${type.glow}`,
              animation: shouldTwinkle ? `enhancedTwinkle ${twinkleDuration}s ease-in-out infinite` : 'none',
              animationDelay: `${star.delay * 0.5}s`,
              opacity: shouldTwinkle ? undefined : baseOpacity
            }}
          />
        )
      })}
      <style>{`
        @keyframes enhancedTwinkle {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </div>
  )
}

function Moon({ season }: { season: Season }) {
  // Enhanced: Moon with crater detail and layered glow halos
  const moonConfig: Record<Season, { innerGlow: string; outerGlow: string; surface: string }> = {
    winter: {
      innerGlow: 'rgba(254, 249, 195, 0.6)',
      outerGlow: 'rgba(226, 232, 240, 0.2)',
      surface: '#fefce8'
    },
    spring: {
      innerGlow: 'rgba(243, 232, 255, 0.6)',
      outerGlow: 'rgba(216, 180, 254, 0.15)',
      surface: '#faf5ff'
    },
    summer: {
      innerGlow: 'rgba(254, 249, 195, 0.5)',
      outerGlow: 'rgba(254, 240, 138, 0.15)',
      surface: '#fefce8'
    },
    autumn: {
      innerGlow: 'rgba(254, 243, 199, 0.6)',
      outerGlow: 'rgba(251, 191, 36, 0.2)',
      surface: '#fef3c7'
    }
  }

  const { innerGlow, outerGlow, surface } = moonConfig[season]

  return (
    <div
      className="absolute"
      style={{
        top: '8%',
        right: '15%',
        width: '55px',
        height: '55px'
      }}
    >
      {/* Outer atmospheric glow */}
      <div
        className="absolute rounded-full"
        style={{
          inset: '-80px',
          background: `radial-gradient(circle, ${outerGlow} 0%, transparent 60%)`
        }}
      />
      {/* Inner glow halo */}
      <div
        className="absolute rounded-full animate-pulse"
        style={{
          inset: '-20px',
          background: `radial-gradient(circle, ${innerGlow} 0%, transparent 70%)`,
          animationDuration: '8s'
        }}
      />
      {/* Moon surface with crater detail */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 30%),
            radial-gradient(circle at 60% 70%, rgba(0,0,0,0.05) 0%, transparent 20%),
            radial-gradient(circle at 40% 50%, rgba(0,0,0,0.03) 0%, transparent 15%),
            radial-gradient(circle at 30% 30%, ${surface} 0%, #fef9c3 30%, #fde68a 70%, #fcd34d 100%)
          `,
          boxShadow: `
            0 0 20px ${innerGlow},
            0 0 40px ${innerGlow.replace('0.6', '0.4').replace('0.5', '0.3')},
            0 0 80px ${outerGlow},
            inset -3px -3px 10px rgba(0,0,0,0.1)
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
  // Enhanced: 3 layered bands moving independently with shimmer
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Green band - primary */}
      <div
        className="absolute"
        style={{
          top: '5%',
          left: '-10%',
          right: '-10%',
          height: '30%',
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(74, 222, 128, 0.15) 20%,
            rgba(52, 211, 153, 0.2) 50%,
            rgba(74, 222, 128, 0.12) 80%,
            transparent 100%
          )`,
          filter: 'blur(40px)',
          animation: 'auroraShift 20s ease-in-out infinite'
        }}
      />
      {/* Blue band - secondary */}
      <div
        className="absolute"
        style={{
          top: '15%',
          left: '-10%',
          right: '-10%',
          height: '25%',
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(96, 165, 250, 0.12) 30%,
            rgba(147, 197, 253, 0.18) 60%,
            transparent 100%
          )`,
          filter: 'blur(40px)',
          animation: 'auroraShift 25s ease-in-out infinite reverse',
          animationDelay: '-5s'
        }}
      />
      {/* Purple band - accent */}
      <div
        className="absolute"
        style={{
          top: '10%',
          left: '-10%',
          right: '-10%',
          height: '35%',
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(167, 139, 250, 0.08) 40%,
            rgba(192, 132, 252, 0.12) 70%,
            transparent 100%
          )`,
          filter: 'blur(40px)',
          animation: 'auroraShift 18s ease-in-out infinite',
          animationDelay: '-10s'
        }}
      />
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%)',
          animation: 'shimmerPulse 8s ease-in-out infinite'
        }}
      />
      <style>{`
        @keyframes auroraShift {
          0%, 100% {
            transform: translateX(-10%) scaleY(1) skewX(-5deg);
            opacity: 0.6;
          }
          25% {
            transform: translateX(5%) scaleY(1.3) skewX(3deg);
            opacity: 0.8;
          }
          50% {
            transform: translateX(-5%) scaleY(0.8) skewX(-2deg);
            opacity: 0.5;
          }
          75% {
            transform: translateX(10%) scaleY(1.1) skewX(5deg);
            opacity: 0.7;
          }
        }
        @keyframes shimmerPulse {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// WIND GUST (Universal wind visual - works across all themes)
// ============================================================================

/**
 * WindGust - A subtle visual sweep that shows when wind triggers
 * Works across all season/time combinations unlike the old wind-affected classes
 */
function WindGust({ active, season }: { active: boolean; season: Season }) {
  if (!active) return null

  // Season-appropriate wind color
  const windColors: Record<Season, { primary: string; secondary: string }> = {
    spring: { primary: 'rgba(192, 132, 252, 0.08)', secondary: 'rgba(134, 239, 172, 0.06)' },
    summer: { primary: 'rgba(251, 191, 36, 0.08)', secondary: 'rgba(253, 186, 116, 0.06)' },
    autumn: { primary: 'rgba(217, 119, 6, 0.1)', secondary: 'rgba(180, 83, 9, 0.06)' },
    winter: { primary: 'rgba(125, 211, 252, 0.08)', secondary: 'rgba(226, 232, 240, 0.06)' }
  }

  const { primary, secondary } = windColors[season]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary wind sweep - diagonal light band */}
      <div
        className="absolute"
        style={{
          top: '-20%',
          left: '-100%',
          width: '60%',
          height: '140%',
          background: `linear-gradient(105deg, transparent 0%, ${primary} 40%, ${secondary} 60%, transparent 100%)`,
          transform: 'skewX(-15deg)',
          animation: 'windSweep 3s ease-out forwards',
          filter: 'blur(40px)'
        }}
      />

      {/* Secondary, faster streak */}
      <div
        className="absolute"
        style={{
          top: '-10%',
          left: '-80%',
          width: '30%',
          height: '120%',
          background: `linear-gradient(105deg, transparent 0%, ${secondary} 50%, transparent 100%)`,
          transform: 'skewX(-20deg)',
          animation: 'windSweep 2.5s ease-out 0.3s forwards',
          filter: 'blur(30px)'
        }}
      />

      {/* Subtle floating particles during wind */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${10 + i * 18}%`,
            top: `${20 + (i % 3) * 25}%`,
            width: '4px',
            height: '4px',
            background: primary.replace('0.08', '0.4').replace('0.1', '0.5'),
            animation: `windParticleDrift 3s ease-out ${i * 0.15}s forwards`,
            filter: 'blur(1px)'
          }}
        />
      ))}

      <style>{`
        @keyframes windSweep {
          0% {
            transform: skewX(-15deg) translateX(0);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 0.6;
          }
          100% {
            transform: skewX(-15deg) translateX(350%);
            opacity: 0;
          }
        }

        @keyframes windParticleDrift {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0;
          }
          15% {
            opacity: 0.8;
          }
          100% {
            transform: translate(150px, -30px) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
