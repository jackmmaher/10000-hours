/**
 * LivingCanvas - Level 2 Canvas-based particle renderer
 *
 * Replaces DOM-based particles with a performant Canvas implementation.
 * Supports 150+ particles at 60fps with per-particle physics.
 *
 * The "brain" (theme calculations) remains in LivingTheme.tsx.
 * This is just the "eyes" - a different way of rendering the same data.
 */

import { useEffect, useRef, useCallback } from 'react'
import { Season, TimeOfDay } from '../lib/livingTheme'
import type { EffectIntensities, SeasonalEffects } from '../lib/livingTheme'

interface LivingCanvasProps {
  season: Season
  timeOfDay: TimeOfDay
  effects: EffectIntensities
  expressive: boolean
  seasonalEffects: SeasonalEffects
}

// Particle types
interface BaseParticle {
  x: number
  y: number
  z: number  // 0 (far) to 1 (near) for parallax
  size: number
  speedX: number
  speedY: number
  sway: number
  swayOffset: number
  alpha: number
}

interface StarParticle extends BaseParticle {
  type: 'star'
  twinkleSpeed: number
  twinklePhase: number
}

interface SnowParticle extends BaseParticle {
  type: 'snow'
}

interface LeafParticle extends BaseParticle {
  type: 'leaf'
  rotation: number
  rotationSpeed: number
  color: string
}

interface FireflyParticle extends BaseParticle {
  type: 'firefly'
  glowPhase: number
  glowSpeed: number
}

interface MistParticle extends BaseParticle {
  type: 'mist'
}

type Particle = StarParticle | SnowParticle | LeafParticle | FireflyParticle | MistParticle

interface ShootingStar {
  x: number
  y: number
  speedX: number
  speedY: number
  life: number
}

// Leaf colors for autumn
const LEAF_COLORS = ['#D97706', '#B45309', '#DC2626', '#CA8A04']

// Star color by season
const STAR_COLORS: Record<Season, string> = {
  winter: 'rgba(186, 230, 253, 1)',
  summer: 'rgba(254, 243, 199, 1)',
  spring: 'rgba(255, 255, 255, 1)',
  autumn: 'rgba(255, 255, 255, 1)'
}

export function LivingCanvas({
  season,
  timeOfDay,
  effects,
  expressive,
  seasonalEffects
}: LivingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const shootingStarsRef = useRef<ShootingStar[]>([])
  const animationIdRef = useRef<number | null>(null)
  const windGustRef = useRef(0)
  const windDirectionRef = useRef(1)
  const lastPropsRef = useRef({ season, timeOfDay, expressive })

  // Create particles based on season/time
  const createParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = []

    // Stars for night (use effects.stars intensity)
    if (effects.stars > 0) {
      const starCount = Math.floor(40 * effects.stars)
      for (let i = 0; i < starCount; i++) {
        particles.push({
          type: 'star',
          x: Math.random() * width,
          y: Math.random() * height * 0.7,
          z: Math.random(),
          size: 1 + Math.random() * 2,
          speedX: 0,
          speedY: 0,
          sway: 0,
          swayOffset: Math.random() * Math.PI * 2,
          alpha: 0.3 + Math.random() * 0.7,
          twinkleSpeed: 0.02 + Math.random() * 0.03,
          twinklePhase: Math.random() * Math.PI * 2
        })
      }
    }

    // Seasonal particles based on particle type and intensity
    const particleType = seasonalEffects.particleType
    const intensity = effects.particles * seasonalEffects.particleMultiplier

    if (intensity < 0.1) {
      particlesRef.current = particles
      return
    }

    if (particleType === 'snow') {
      const count = Math.floor(150 * intensity)
      for (let i = 0; i < count; i++) {
        particles.push(createSnowParticle(width, height, true))
      }
    } else if (particleType === 'leaves') {
      const count = Math.floor(50 * intensity)
      for (let i = 0; i < count; i++) {
        particles.push(createLeafParticle(width, height, true))
      }
    } else if (particleType === 'fireflies') {
      const count = Math.floor(30 * intensity)
      for (let i = 0; i < count; i++) {
        particles.push(createFireflyParticle(width, height))
      }
    } else if (particleType === 'mist') {
      const count = Math.floor(40 * intensity)
      for (let i = 0; i < count; i++) {
        particles.push(createMistParticle(width, height))
      }
    }

    particlesRef.current = particles
  }, [effects.stars, effects.particles, seasonalEffects.particleType, seasonalEffects.particleMultiplier])

  // Particle factory functions
  function createSnowParticle(width: number, height: number, init = false): SnowParticle {
    return {
      type: 'snow',
      x: Math.random() * width,
      y: init ? Math.random() * height : -10,
      z: Math.random(),
      size: 1 + Math.random() * 3,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: 0.5 + Math.random() * 1.5,
      sway: Math.random() * 0.05,
      swayOffset: Math.random() * Math.PI * 2,
      alpha: 0.4 + Math.random() * 0.5
    }
  }

  function createLeafParticle(width: number, height: number, init = false): LeafParticle {
    return {
      type: 'leaf',
      x: Math.random() * width,
      y: init ? Math.random() * height : -20,
      z: Math.random(),
      size: 4 + Math.random() * 8,
      speedX: (Math.random() - 0.5) * 2,
      speedY: 1 + Math.random() * 2,
      sway: Math.random() * 0.1,
      swayOffset: Math.random() * Math.PI * 2,
      alpha: 0.6 + Math.random() * 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)]
    }
  }

  function createFireflyParticle(width: number, height: number): FireflyParticle {
    return {
      type: 'firefly',
      x: Math.random() * width,
      y: height * 0.3 + Math.random() * height * 0.5,
      z: Math.random(),
      size: 2 + Math.random() * 2,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      sway: Math.random() * 0.02,
      swayOffset: Math.random() * Math.PI * 2,
      alpha: 0.1,
      glowPhase: Math.random() * Math.PI * 2,
      glowSpeed: 0.02 + Math.random() * 0.03
    }
  }

  function createMistParticle(width: number, height: number): MistParticle {
    return {
      type: 'mist',
      x: Math.random() * width,
      y: height * 0.4 + Math.random() * height * 0.4,
      z: Math.random(),
      size: 50 + Math.random() * 100,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.1,
      sway: Math.random() * 0.01,
      swayOffset: Math.random() * Math.PI * 2,
      alpha: 0.05 + Math.random() * 0.1
    }
  }

  // Main render loop
  const render = useCallback((time: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    // Clear
    ctx.clearRect(0, 0, width, height)

    // Wind physics
    windGustRef.current *= 0.98
    if (Math.random() < 0.001) {
      windGustRef.current = 1
      windDirectionRef.current = Math.random() > 0.5 ? 1 : -1
    }
    const currentWind = windGustRef.current * 3 * windDirectionRef.current

    const starColor = STAR_COLORS[season]

    // Update and draw particles
    particlesRef.current.forEach(p => {
      if (p.type === 'star') {
        // Twinkle
        p.twinklePhase += p.twinkleSpeed
        const twinkle = 0.5 + Math.sin(p.twinklePhase) * 0.5

        ctx.globalAlpha = p.alpha * twinkle * (0.4 + p.z * 0.6) * effects.stars
        ctx.fillStyle = starColor
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (0.5 + p.z * 0.5), 0, Math.PI * 2)
        ctx.fill()

        // Glow
        ctx.globalAlpha = p.alpha * twinkle * 0.3 * effects.stars
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
        ctx.fill()
      }
      else if (p.type === 'snow') {
        // Physics
        p.y += p.speedY * (0.5 + p.z)
        p.x += p.speedX + (currentWind * p.z)
        p.x += Math.sin(time * 0.001 + p.swayOffset) * p.sway

        // Wrap
        if (p.y > height + 10) {
          p.y = -10
          p.x = Math.random() * width
        }
        if (p.x > width + 10) p.x = -10
        if (p.x < -10) p.x = width + 10

        // Draw
        ctx.globalAlpha = p.alpha * (0.4 + p.z * 0.6)
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (0.5 + p.z), 0, Math.PI * 2)
        ctx.fill()
      }
      else if (p.type === 'leaf') {
        // Physics
        p.y += p.speedY * (0.5 + p.z)
        p.x += p.speedX + (currentWind * p.z * 2)
        p.x += Math.sin(time * 0.002 + p.swayOffset) * p.sway * 20
        p.rotation += p.rotationSpeed

        // Wrap
        if (p.y > height + 20) {
          p.y = -20
          p.x = Math.random() * width
        }
        if (p.x > width + 20) p.x = -20
        if (p.x < -20) p.x = width + 20

        // Draw leaf shape
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = p.alpha * (0.5 + p.z * 0.5)
        ctx.fillStyle = p.color
        ctx.beginPath()
        const s = p.size * (0.5 + p.z * 0.5)
        ctx.ellipse(0, 0, s, s * 0.6, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      else if (p.type === 'firefly') {
        // Wander
        p.speedX += (Math.random() - 0.5) * 0.02
        p.speedY += (Math.random() - 0.5) * 0.02
        p.speedX *= 0.99
        p.speedY *= 0.99
        p.x += p.speedX
        p.y += p.speedY

        // Bounds
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < height * 0.2) p.speedY += 0.01
        if (p.y > height * 0.9) p.speedY -= 0.01

        // Glow
        p.glowPhase += p.glowSpeed
        const glow = Math.max(0, Math.sin(p.glowPhase))

        // Draw
        ctx.globalAlpha = glow * 0.9
        ctx.fillStyle = 'rgba(253, 224, 71, 1)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        // Outer glow
        ctx.globalAlpha = glow * 0.4
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
        ctx.fill()
      }
      else if (p.type === 'mist') {
        // Drift
        p.x += p.speedX + (currentWind * 0.5)
        p.y += p.speedY
        p.x += Math.sin(time * 0.0005 + p.swayOffset) * p.sway * 10

        // Wrap
        if (p.x > width + p.size) p.x = -p.size
        if (p.x < -p.size) p.x = width + p.size

        // Draw
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
        gradient.addColorStop(0, `rgba(200, 200, 200, ${p.alpha})`)
        gradient.addColorStop(1, 'rgba(200, 200, 200, 0)')
        ctx.globalAlpha = 1
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // Shooting stars (expressive night only)
    if (expressive && effects.shootingStars > 0) {
      // Spawn occasionally
      if (Math.random() < 0.002) {
        shootingStarsRef.current.push({
          x: Math.random() * width * 0.7,
          y: Math.random() * height * 0.3,
          speedX: 8 + Math.random() * 8,
          speedY: 3 + Math.random() * 4,
          life: 1
        })
      }

      // Update and draw
      shootingStarsRef.current = shootingStarsRef.current.filter(s => {
        s.x += s.speedX
        s.y += s.speedY
        s.life -= 0.02

        if (s.life <= 0) return false

        // Draw trail
        const gradient = ctx.createLinearGradient(s.x, s.y, s.x - 60, s.y - 20)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${s.life * effects.shootingStars})`)
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x - 60 * s.life, s.y - 20 * s.life)
        ctx.stroke()

        return true
      })
    }

    // Aurora (winter night expressive)
    if (seasonalEffects.aurora && effects.stars > 0.5 && expressive) {
      const auroraGradient = ctx.createLinearGradient(0, 0, 0, height * 0.4)
      const phase = time * 0.0003
      const intensity = 0.1 + Math.sin(phase) * 0.05

      auroraGradient.addColorStop(0, `rgba(34, 211, 238, ${intensity})`)
      auroraGradient.addColorStop(0.3, `rgba(52, 211, 153, ${intensity * 0.8})`)
      auroraGradient.addColorStop(0.6, `rgba(167, 139, 250, ${intensity * 0.5})`)
      auroraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.globalAlpha = 1
      ctx.fillStyle = auroraGradient
      ctx.fillRect(width * 0.1, 0, width * 0.8, height * 0.4)
    }

    animationIdRef.current = requestAnimationFrame(render)
  }, [season, effects.stars, effects.shootingStars, expressive, seasonalEffects.aurora])

  // Initialize canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // High DPI setup
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }

    // Create particles
    createParticles(rect.width, rect.height)

    // Start animation
    animationIdRef.current = requestAnimationFrame(render)

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [createParticles, render])

  // Recreate particles when props change
  useEffect(() => {
    const propsChanged =
      lastPropsRef.current.season !== season ||
      lastPropsRef.current.timeOfDay !== timeOfDay ||
      lastPropsRef.current.expressive !== expressive

    if (propsChanged) {
      lastPropsRef.current = { season, timeOfDay, expressive }
      const canvas = canvasRef.current
      if (canvas) {
        createParticles(canvas.offsetWidth, canvas.offsetHeight)
        shootingStarsRef.current = []
      }
    }
  }, [season, timeOfDay, expressive, createParticles])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }

      createParticles(rect.width, rect.height)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [createParticles])

  // Handle visibility - pause when hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current)
          animationIdRef.current = null
        }
      } else {
        if (!animationIdRef.current) {
          animationIdRef.current = requestAnimationFrame(render)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [render])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}
