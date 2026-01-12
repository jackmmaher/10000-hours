import { useEffect, useRef, useCallback } from 'react'
import { Season } from '../lib/livingTheme'
import { SimplexNoise } from '../lib/noise/SimplexNoise'
import type { LivingCanvasProps, Particle, ShootingStar } from './canvas/types'
import { STAR_TEMPS } from './canvas/constants'
import {
  createSnowParticle,
  createLeafParticle,
  createFireflyParticle,
  createMistParticle,
} from './canvas/particles'
import {
  renderSnow,
  renderLeaf,
  renderFirefly,
  renderMist,
  renderShootingStars,
  renderAurora,
  renderSun,
  renderMoon,
} from './canvas/renderers'

export function LivingCanvas({
  season,
  timeOfDay,
  effects,
  expressive,
  seasonalEffects,
  sunAltitude,
  moonIllumination,
  moonPhaseAngle,
  hideCelestialBodies = false,
}: LivingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const shootingStarsRef = useRef<ShootingStar[]>([])
  const animationIdRef = useRef<number | null>(null)
  const noiseRef = useRef(new SimplexNoise())
  const windRef = useRef({ gust: 0, direction: 1, target: 0 })
  const lastPropsRef = useRef({
    season,
    timeOfDay,
    expressive,
    starsVisible: effects.stars > 0,
    particleType: seasonalEffects.particleType,
  })
  const hasInitializedRef = useRef(false)

  // Keep effects in a ref so render functions always use current values
  const effectsRef = useRef(effects)
  const seasonalEffectsRef = useRef(seasonalEffects)
  effectsRef.current = effects
  seasonalEffectsRef.current = seasonalEffects

  const createParticles = useCallback(
    (width: number, height: number) => {
      const particles: Particle[] = []
      const now = Date.now()

      // Stars appear as soon as sky begins darkening (effects.stars > 0)
      if (effects.stars > 0) {
        const count = Math.floor(60 * effects.stars)
        for (let i = 0; i < count; i++) {
          const z = Math.random()
          particles.push({
            type: 'star',
            x: Math.random() * width,
            y: Math.random() * height * 0.75,
            z,
            size: 0.5 + Math.random() * 2.5,
            speedX: 0,
            speedY: 0,
            noiseOffsetX: Math.random() * 1000,
            noiseOffsetY: Math.random() * 1000,
            alpha: 0.2 + Math.random() * 0.8,
            birthTime: now,
            twinklePhase: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.01 + Math.random() * 0.04,
            colorTemp: Math.random(),
          })
        }
      }

      // Seasonal particles
      const particleType = seasonalEffects.particleType
      const intensity = effects.particles * seasonalEffects.particleMultiplier

      if (intensity >= 0.1) {
        const particleConfig: Record<string, { count: number; create: () => Particle }> = {
          snow: {
            count: 200,
            create: () => createSnowParticle(width, height, true, now),
          },
          leaves: {
            count: 60,
            create: () => createLeafParticle(width, height, true, now),
          },
          fireflies: {
            count: 40,
            create: () => createFireflyParticle(width, height, now),
          },
          mist: {
            count: 50,
            create: () => createMistParticle(width, height, now),
          },
        }

        const config = particleConfig[particleType]
        if (config) {
          const count = Math.floor(config.count * intensity)
          for (let i = 0; i < count; i++) {
            particles.push(config.create())
          }
        }
      }

      particlesRef.current = particles
    },
    [
      effects.stars,
      effects.particles,
      seasonalEffects.particleType,
      seasonalEffects.particleMultiplier,
    ]
  )

  // Inline star renderer (needs access to effectsRef)
  function renderStar(
    ctx: CanvasRenderingContext2D,
    p: Particle & { type: 'star' },
    season: Season
  ) {
    p.twinklePhase += p.twinkleSpeed

    // Multi-phase twinkle for more organic feel
    const twinkle1 = Math.sin(p.twinklePhase) * 0.5 + 0.5
    const twinkle2 = Math.sin(p.twinklePhase * 1.7 + 1) * 0.3 + 0.7
    const twinkle = twinkle1 * twinkle2

    const temps = STAR_TEMPS[season]
    const color = p.colorTemp > 0.5 ? temps.warm : temps.cool
    const depthAlpha = 0.3 + p.z * 0.7
    const finalAlpha = p.alpha * twinkle * depthAlpha * effectsRef.current.stars

    // Outer glow
    ctx.save()
    ctx.globalAlpha = finalAlpha * 0.4
    ctx.shadowColor = color
    ctx.shadowBlur = p.size * 4 * (0.5 + p.z)
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * (0.8 + p.z * 0.5), 0, Math.PI * 2)
    ctx.fill()

    // Core
    ctx.shadowBlur = 0
    ctx.globalAlpha = finalAlpha
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * 0.5 * (0.5 + p.z), 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // Main render loop
  const render = useCallback(
    (time: number) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const width = window.innerWidth
      const height = window.innerHeight
      const noise = noiseRef.current
      const t = time * 0.001

      // Wind physics - smooth organic gusts
      const wind = windRef.current
      if (Math.random() < 0.005) {
        wind.target = (Math.random() - 0.5) * 6
      }
      wind.gust += (wind.target - wind.gust) * 0.02
      wind.gust *= 0.995

      // Clear canvas to transparent - DOM gradients render behind
      ctx.clearRect(0, 0, width, height)

      // Render sun and moon (behind particles) - hidden for neutral themes
      if (!hideCelestialBodies) {
        renderSun(ctx, width, height, sunAltitude)

        if (effectsRef.current.moon > 0) {
          renderMoon(
            ctx,
            width,
            height,
            moonIllumination,
            moonPhaseAngle,
            effectsRef.current.moon,
            seasonalEffectsRef.current.harvestMoon,
            sunAltitude
          )
        }
      }

      // Sort particles by z-depth (far to near)
      const sorted = [...particlesRef.current].sort((a, b) => a.z - b.z)

      // Render particles
      sorted.forEach((p) => {
        const noiseX = noise.noise2D(p.noiseOffsetX + t * 0.5, p.y * 0.01) * 2
        const noiseY = noise.noise2D(p.noiseOffsetY + t * 0.3, p.x * 0.01) * 0.5

        switch (p.type) {
          case 'star':
            renderStar(ctx, p, season)
            break
          case 'snow':
            renderSnow(ctx, p, t, width, height, wind.gust, noiseX, noiseY)
            break
          case 'leaf':
            renderLeaf(ctx, p, width, height, wind.gust, noiseX, noiseY)
            break
          case 'firefly':
            renderFirefly(ctx, p, width, height, noiseX, noiseY)
            break
          case 'mist':
            renderMist(ctx, p, t, width, wind.gust)
            break
        }
      })

      // Shooting stars
      if (expressive && effectsRef.current.shootingStars > 0) {
        renderShootingStars(ctx, shootingStarsRef, width, height, effectsRef.current.shootingStars)
      }

      // Aurora - requires deeper night (stars > 0.5) for dramatic effect
      if (seasonalEffectsRef.current.aurora && effectsRef.current.stars > 0.5 && expressive) {
        renderAurora(ctx, t, width, height, noise)
      }

      animationIdRef.current = requestAnimationFrame(render)
    },
    [
      season,
      effects.stars,
      effects.shootingStars,
      effects.moon,
      expressive,
      seasonalEffects.aurora,
      seasonalEffects.harvestMoon,
      sunAltitude,
      moonIllumination,
      moonPhaseAngle,
      hideCelestialBodies,
    ]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const width = window.innerWidth
    const height = window.innerHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(dpr, dpr)

    // Start animation loop
    animationIdRef.current = requestAnimationFrame(render)

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
    }
  }, [render])

  useEffect(() => {
    const currentStarsVisible = effects.stars > 0
    const currentParticleType = seasonalEffects.particleType

    // On first run, always create particles (initial setup)
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      lastPropsRef.current = {
        season,
        timeOfDay,
        expressive,
        starsVisible: currentStarsVisible,
        particleType: currentParticleType,
      }
      createParticles(window.innerWidth, window.innerHeight)
      return
    }

    // Check for changes that require particle recreation
    const themeChanged =
      lastPropsRef.current.season !== season ||
      lastPropsRef.current.timeOfDay !== timeOfDay ||
      lastPropsRef.current.expressive !== expressive

    // Particle existence changed
    const particleExistenceChanged =
      lastPropsRef.current.starsVisible !== currentStarsVisible ||
      lastPropsRef.current.particleType !== currentParticleType

    if (themeChanged || particleExistenceChanged) {
      lastPropsRef.current = {
        season,
        timeOfDay,
        expressive,
        starsVisible: currentStarsVisible,
        particleType: currentParticleType,
      }
      createParticles(window.innerWidth, window.innerHeight)
      shootingStarsRef.current = []
    }
  }, [season, timeOfDay, expressive, effects.stars, seasonalEffects.particleType, createParticles])

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const dpr = window.devicePixelRatio || 1
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)

      createParticles(width, height)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [createParticles])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current)
          animationIdRef.current = null
        }
      } else if (!animationIdRef.current) {
        animationIdRef.current = requestAnimationFrame(render)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [render])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
      }}
    />
  )
}
