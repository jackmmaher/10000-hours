/**
 * LivingCanvas - Premium Canvas-based atmospheric renderer
 *
 * Level 2 engine with premium visuals:
 * - Simplex noise for organic movement
 * - Trail effects for motion blur
 * - Proper glow effects with shadowBlur
 * - Layered depth rendering
 * - Noise-based aurora waves
 */

import { useEffect, useRef, useCallback } from 'react'
import { Season, TimeOfDay } from '../lib/livingTheme'
import type { EffectIntensities, SeasonalEffects } from '../lib/livingTheme'

// ============================================================================
// SIMPLEX NOISE (inline implementation - no external dependency)
// Based on Stefan Gustavson's implementation
// ============================================================================

class SimplexNoise {
  private perm: number[] = []
  private gradP: { x: number; y: number }[] = []

  private grad3 = [
    { x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: -1 },
    { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
  ]

  constructor(seed = Math.random() * 256) {
    const p = []
    for (let i = 0; i < 256; i++) p[i] = i

    // Shuffle using seed
    let n = seed
    for (let i = 255; i > 0; i--) {
      n = (n * 16807) % 2147483647
      const j = n % (i + 1)
      ;[p[i], p[j]] = [p[j], p[i]]
    }

    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255]
      this.gradP[i] = this.grad3[this.perm[i] % 8]
    }
  }

  noise2D(x: number, y: number): number {
    const F2 = 0.5 * (Math.sqrt(3) - 1)
    const G2 = (3 - Math.sqrt(3)) / 6

    const s = (x + y) * F2
    const i = Math.floor(x + s)
    const j = Math.floor(y + s)
    const t = (i + j) * G2

    const X0 = i - t
    const Y0 = j - t
    const x0 = x - X0
    const y0 = y - Y0

    const i1 = x0 > y0 ? 1 : 0
    const j1 = x0 > y0 ? 0 : 1

    const x1 = x0 - i1 + G2
    const y1 = y0 - j1 + G2
    const x2 = x0 - 1 + 2 * G2
    const y2 = y0 - 1 + 2 * G2

    const ii = i & 255
    const jj = j & 255

    const g0 = this.gradP[ii + this.perm[jj]]
    const g1 = this.gradP[ii + i1 + this.perm[jj + j1]]
    const g2 = this.gradP[ii + 1 + this.perm[jj + 1]]

    let t0 = 0.5 - x0 * x0 - y0 * y0
    const n0 = t0 < 0 ? 0 : (t0 *= t0, t0 * t0 * (g0.x * x0 + g0.y * y0))

    let t1 = 0.5 - x1 * x1 - y1 * y1
    const n1 = t1 < 0 ? 0 : (t1 *= t1, t1 * t1 * (g1.x * x1 + g1.y * y1))

    let t2 = 0.5 - x2 * x2 - y2 * y2
    const n2 = t2 < 0 ? 0 : (t2 *= t2, t2 * t2 * (g2.x * x2 + g2.y * y2))

    return 70 * (n0 + n1 + n2)
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface LivingCanvasProps {
  season: Season
  timeOfDay: TimeOfDay
  effects: EffectIntensities
  expressive: boolean
  seasonalEffects: SeasonalEffects
}

interface BaseParticle {
  x: number
  y: number
  z: number
  size: number
  speedX: number
  speedY: number
  noiseOffsetX: number
  noiseOffsetY: number
  alpha: number
  birthTime: number
}

interface StarParticle extends BaseParticle {
  type: 'star'
  twinklePhase: number
  twinkleSpeed: number
  colorTemp: number // 0 = cool blue, 1 = warm yellow
}

interface SnowParticle extends BaseParticle {
  type: 'snow'
  sparkle: number
  tumble: number
}

interface LeafParticle extends BaseParticle {
  type: 'leaf'
  rotation: number
  rotationSpeed: number
  color: string
  flutter: number
}

interface FireflyParticle extends BaseParticle {
  type: 'firefly'
  glowPhase: number
  glowSpeed: number
  pulseOffset: number
}

interface MistParticle extends BaseParticle {
  type: 'mist'
  opacity: number
  driftPhase: number
}

type Particle = StarParticle | SnowParticle | LeafParticle | FireflyParticle | MistParticle

interface ShootingStar {
  x: number
  y: number
  speedX: number
  speedY: number
  life: number
  length: number
  brightness: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LEAF_COLORS = [
  '#D97706', '#B45309', '#DC2626', '#CA8A04', '#92400E', '#991B1B'
]

const STAR_TEMPS: Record<Season, { cool: string; warm: string }> = {
  winter: { cool: 'rgba(186, 230, 253, 1)', warm: 'rgba(224, 242, 254, 1)' },
  summer: { cool: 'rgba(254, 243, 199, 1)', warm: 'rgba(253, 224, 71, 1)' },
  spring: { cool: 'rgba(233, 213, 255, 1)', warm: 'rgba(255, 255, 255, 1)' },
  autumn: { cool: 'rgba(255, 237, 213, 1)', warm: 'rgba(254, 215, 170, 1)' }
}

// ============================================================================
// COMPONENT
// ============================================================================

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
  const noiseRef = useRef(new SimplexNoise())
  const windRef = useRef({ gust: 0, direction: 1, target: 0 })
  const lastPropsRef = useRef({ season, timeOfDay, expressive })
  const frameCountRef = useRef(0)

  // Create particles
  const createParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = []
    const now = Date.now()

    // Stars
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
          colorTemp: Math.random()
        })
      }
    }

    // Seasonal particles
    const particleType = seasonalEffects.particleType
    const intensity = effects.particles * seasonalEffects.particleMultiplier

    if (intensity >= 0.1) {
      if (particleType === 'snow') {
        const count = Math.floor(200 * intensity)
        for (let i = 0; i < count; i++) {
          particles.push(createSnowParticle(width, height, true, now))
        }
      } else if (particleType === 'leaves') {
        const count = Math.floor(60 * intensity)
        for (let i = 0; i < count; i++) {
          particles.push(createLeafParticle(width, height, true, now))
        }
      } else if (particleType === 'fireflies') {
        const count = Math.floor(40 * intensity)
        for (let i = 0; i < count; i++) {
          particles.push(createFireflyParticle(width, height, now))
        }
      } else if (particleType === 'mist') {
        const count = Math.floor(50 * intensity)
        for (let i = 0; i < count; i++) {
          particles.push(createMistParticle(width, height, now))
        }
      }
    }

    particlesRef.current = particles
  }, [effects.stars, effects.particles, seasonalEffects.particleType, seasonalEffects.particleMultiplier])

  function createSnowParticle(w: number, h: number, init: boolean, now: number): SnowParticle {
    const z = Math.random()
    return {
      type: 'snow',
      x: Math.random() * w,
      y: init ? Math.random() * h : -20 - Math.random() * 50,
      z,
      size: 1 + Math.random() * 4 + z * 2,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: 0.3 + Math.random() * 1.2 + z * 0.5,
      noiseOffsetX: Math.random() * 1000,
      noiseOffsetY: Math.random() * 1000,
      alpha: 0.3 + Math.random() * 0.5 + z * 0.2,
      birthTime: now,
      sparkle: Math.random(),
      tumble: Math.random() * Math.PI * 2
    }
  }

  function createLeafParticle(w: number, h: number, init: boolean, now: number): LeafParticle {
    const z = Math.random()
    return {
      type: 'leaf',
      x: Math.random() * w,
      y: init ? Math.random() * h : -30 - Math.random() * 50,
      z,
      size: 6 + Math.random() * 10 + z * 4,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: 0.8 + Math.random() * 1.5 + z * 0.8,
      noiseOffsetX: Math.random() * 1000,
      noiseOffsetY: Math.random() * 1000,
      alpha: 0.5 + Math.random() * 0.4 + z * 0.1,
      birthTime: now,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.08,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      flutter: Math.random() * Math.PI * 2
    }
  }

  function createFireflyParticle(w: number, h: number, now: number): FireflyParticle {
    const z = Math.random()
    return {
      type: 'firefly',
      x: Math.random() * w,
      y: h * 0.25 + Math.random() * h * 0.55,
      z,
      size: 2 + Math.random() * 3,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
      noiseOffsetX: Math.random() * 1000,
      noiseOffsetY: Math.random() * 1000,
      alpha: 0.8,
      birthTime: now,
      glowPhase: Math.random() * Math.PI * 2,
      glowSpeed: 0.015 + Math.random() * 0.025,
      pulseOffset: Math.random() * 1000
    }
  }

  function createMistParticle(w: number, h: number, now: number): MistParticle {
    const z = Math.random()
    return {
      type: 'mist',
      x: Math.random() * w,
      y: h * 0.35 + Math.random() * h * 0.45,
      z,
      size: 80 + Math.random() * 160 + z * 60,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: (Math.random() - 0.5) * 0.05,
      noiseOffsetX: Math.random() * 1000,
      noiseOffsetY: Math.random() * 1000,
      alpha: 0.04 + Math.random() * 0.08,
      birthTime: now,
      opacity: 0.03 + Math.random() * 0.07,
      driftPhase: Math.random() * Math.PI * 2
    }
  }

  // Main render loop
  const render = useCallback((time: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Use window dimensions for full viewport coverage
    const width = window.innerWidth
    const height = window.innerHeight
    const noise = noiseRef.current
    const t = time * 0.001

    frameCountRef.current++

    // Wind physics - smooth organic gusts
    const wind = windRef.current
    if (Math.random() < 0.005) {
      wind.target = (Math.random() - 0.5) * 6
    }
    wind.gust += (wind.target - wind.gust) * 0.02
    wind.gust *= 0.995

    // Clear with full opacity to prevent trail artifacts
    // Use theme-aware background color based on darkness level
    const darkness = effects.ambientDarkness
    const r = Math.round(15 + (250 - 15) * (1 - darkness))
    const g = Math.round(23 + (251 - 23) * (1 - darkness))
    const b = Math.round(42 + (252 - 42) * (1 - darkness))
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
    ctx.fillRect(0, 0, width, height)

    // Sort particles by z-depth (far to near)
    const sorted = [...particlesRef.current].sort((a, b) => a.z - b.z)

    // Render particles
    sorted.forEach(p => {
      const noiseX = noise.noise2D(p.noiseOffsetX + t * 0.5, p.y * 0.01) * 2
      const noiseY = noise.noise2D(p.noiseOffsetY + t * 0.3, p.x * 0.01) * 0.5

      if (p.type === 'star') {
        renderStar(ctx, p, t, width, height, season)
      } else if (p.type === 'snow') {
        renderSnow(ctx, p, t, width, height, wind.gust, noiseX, noiseY)
      } else if (p.type === 'leaf') {
        renderLeaf(ctx, p, t, width, height, wind.gust, noiseX, noiseY)
      } else if (p.type === 'firefly') {
        renderFirefly(ctx, p, t, width, height, noiseX, noiseY)
      } else if (p.type === 'mist') {
        renderMist(ctx, p, t, width, height, wind.gust)
      }
    })

    // Shooting stars
    if (expressive && effects.shootingStars > 0) {
      renderShootingStars(ctx, t, width, height, effects.shootingStars)
    }

    // Aurora
    if (seasonalEffects.aurora && effects.stars > 0.5 && expressive) {
      renderAurora(ctx, t, width, height, noise)
    }

    animationIdRef.current = requestAnimationFrame(render)
  }, [season, effects.stars, effects.shootingStars, effects.ambientDarkness, expressive, seasonalEffects.aurora])

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  function renderStar(
    ctx: CanvasRenderingContext2D,
    p: StarParticle,
    _t: number,
    _w: number,
    _h: number,
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
    const finalAlpha = p.alpha * twinkle * depthAlpha * effects.stars

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

  function renderSnow(
    ctx: CanvasRenderingContext2D,
    p: SnowParticle,
    t: number,
    w: number,
    h: number,
    wind: number,
    noiseX: number,
    noiseY: number
  ) {
    // Physics with noise-based organic movement
    p.y += p.speedY * (0.6 + p.z * 0.6)
    p.x += p.speedX + wind * p.z * 0.8 + noiseX * (0.3 + p.z * 0.3)
    p.tumble += 0.02 + noiseY * 0.01

    // Wrap
    if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w }
    if (p.x > w + 20) p.x = -20
    if (p.x < -20) p.x = w + 20

    const depthAlpha = 0.4 + p.z * 0.6
    const sparkleFlash = Math.sin(t * 3 + p.sparkle * 10) > 0.95 ? 1.5 : 1

    ctx.save()

    // Soft glow for depth
    if (p.z > 0.5) {
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'
      ctx.shadowBlur = p.size * 2
    }

    // Gradient snowflake
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * (0.6 + p.z * 0.5))
    gradient.addColorStop(0, `rgba(255, 255, 255, ${p.alpha * depthAlpha * sparkleFlash})`)
    gradient.addColorStop(0.4, `rgba(255, 255, 255, ${p.alpha * depthAlpha * 0.6})`)
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.globalAlpha = 1
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * (0.6 + p.z * 0.5), 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  function renderLeaf(
    ctx: CanvasRenderingContext2D,
    p: LeafParticle,
    _t: number,
    w: number,
    h: number,
    wind: number,
    noiseX: number,
    noiseY: number
  ) {
    // Physics with flutter
    p.flutter += 0.05 + Math.abs(noiseX) * 0.02
    const flutter = Math.sin(p.flutter) * 15 * (0.5 + p.z * 0.5)

    p.y += p.speedY * (0.5 + p.z * 0.6)
    p.x += p.speedX + wind * p.z * 1.2 + flutter * 0.1 + noiseX * 0.5
    p.rotation += p.rotationSpeed + noiseY * 0.02 + (wind * 0.01)

    // Wrap
    if (p.y > h + 30) { p.y = -30; p.x = Math.random() * w }
    if (p.x > w + 30) p.x = -30
    if (p.x < -30) p.x = w + 30

    const depthAlpha = 0.5 + p.z * 0.5
    const size = p.size * (0.5 + p.z * 0.6)

    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rotation)
    ctx.globalAlpha = p.alpha * depthAlpha

    // Shadow for depth
    if (p.z > 0.6) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetY = 2
    }

    // Leaf shape using bezier curves
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.moveTo(0, -size * 0.5)
    ctx.bezierCurveTo(size * 0.5, -size * 0.3, size * 0.5, size * 0.3, 0, size * 0.5)
    ctx.bezierCurveTo(-size * 0.5, size * 0.3, -size * 0.5, -size * 0.3, 0, -size * 0.5)
    ctx.fill()

    // Leaf vein
    ctx.strokeStyle = `rgba(0, 0, 0, 0.2)`
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(0, -size * 0.4)
    ctx.lineTo(0, size * 0.4)
    ctx.stroke()

    ctx.restore()
  }

  function renderFirefly(
    ctx: CanvasRenderingContext2D,
    p: FireflyParticle,
    _t: number,
    w: number,
    h: number,
    noiseX: number,
    noiseY: number
  ) {
    // Organic wandering with noise
    p.speedX += noiseX * 0.003
    p.speedY += noiseY * 0.003
    p.speedX *= 0.98
    p.speedY *= 0.98
    p.x += p.speedX
    p.y += p.speedY

    // Soft bounds
    if (p.x < w * 0.05) p.speedX += 0.02
    if (p.x > w * 0.95) p.speedX -= 0.02
    if (p.y < h * 0.15) p.speedY += 0.02
    if (p.y > h * 0.85) p.speedY -= 0.02

    // Multi-phase glow for organic pulsing
    p.glowPhase += p.glowSpeed
    const glow1 = Math.sin(p.glowPhase) * 0.5 + 0.5
    const glow2 = Math.sin(p.glowPhase * 0.7 + p.pulseOffset) * 0.3 + 0.7
    const glow = glow1 * glow2
    const glowPow = Math.pow(glow, 2) // Sharper on/off

    if (glowPow < 0.1) return // Don't render when dim

    ctx.save()

    // Outer atmospheric glow
    ctx.globalAlpha = glowPow * 0.3
    ctx.shadowColor = 'rgba(253, 224, 71, 1)'
    ctx.shadowBlur = p.size * 12
    ctx.fillStyle = 'rgba(253, 224, 71, 0.6)'
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
    ctx.fill()

    // Inner glow
    ctx.shadowBlur = p.size * 6
    ctx.globalAlpha = glowPow * 0.6
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2)
    ctx.fill()

    // Bright core
    ctx.shadowBlur = 0
    ctx.globalAlpha = glowPow * 0.9
    ctx.fillStyle = 'rgba(255, 255, 230, 1)'
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  function renderMist(
    ctx: CanvasRenderingContext2D,
    p: MistParticle,
    t: number,
    w: number,
    _h: number,
    wind: number
  ) {
    // Slow ethereal drift
    p.driftPhase += 0.003
    const drift = Math.sin(p.driftPhase) * 20

    p.x += p.speedX + wind * 0.3 + drift * 0.01
    p.y += p.speedY + Math.sin(t * 0.2 + p.noiseOffsetY) * 0.1

    // Wrap horizontally
    if (p.x > w + p.size) p.x = -p.size
    if (p.x < -p.size) p.x = w + p.size

    const depthAlpha = 0.5 + p.z * 0.5

    // Multi-layer gradient for volumetric feel
    const gradient = ctx.createRadialGradient(
      p.x + drift * 0.5, p.y,
      0,
      p.x, p.y,
      p.size
    )
    gradient.addColorStop(0, `rgba(180, 180, 190, ${p.opacity * depthAlpha})`)
    gradient.addColorStop(0.5, `rgba(160, 160, 170, ${p.opacity * depthAlpha * 0.5})`)
    gradient.addColorStop(1, 'rgba(150, 150, 160, 0)')

    ctx.globalAlpha = 1
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }

  function renderShootingStars(
    ctx: CanvasRenderingContext2D,
    _t: number,
    w: number,
    h: number,
    intensity: number
  ) {
    const stars = shootingStarsRef.current

    // Spawn
    if (Math.random() < 0.003 * intensity) {
      stars.push({
        x: Math.random() * w * 0.6 + w * 0.1,
        y: Math.random() * h * 0.25,
        speedX: 10 + Math.random() * 12,
        speedY: 4 + Math.random() * 6,
        life: 1,
        length: 60 + Math.random() * 40,
        brightness: 0.7 + Math.random() * 0.3
      })
    }

    // Update and render
    shootingStarsRef.current = stars.filter(s => {
      s.x += s.speedX
      s.y += s.speedY
      s.life -= 0.015

      if (s.life <= 0) return false

      ctx.save()

      // Gradient trail
      const tailX = s.x - s.length * s.life * (s.speedX / 15)
      const tailY = s.y - s.length * s.life * (s.speedY / 15)
      const gradient = ctx.createLinearGradient(s.x, s.y, tailX, tailY)
      gradient.addColorStop(0, `rgba(255, 255, 255, ${s.life * s.brightness * intensity})`)
      gradient.addColorStop(0.3, `rgba(200, 220, 255, ${s.life * s.brightness * intensity * 0.5})`)
      gradient.addColorStop(1, 'rgba(150, 180, 255, 0)')

      ctx.strokeStyle = gradient
      ctx.lineWidth = 2.5 * s.life
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.lineTo(tailX, tailY)
      ctx.stroke()

      // Bright head
      ctx.shadowColor = 'white'
      ctx.shadowBlur = 8
      ctx.fillStyle = `rgba(255, 255, 255, ${s.life * s.brightness})`
      ctx.beginPath()
      ctx.arc(s.x, s.y, 2 * s.life, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
      return true
    })
  }

  function renderAurora(
    ctx: CanvasRenderingContext2D,
    t: number,
    w: number,
    h: number,
    noise: SimplexNoise
  ) {
    const auroraHeight = h * 0.45

    ctx.save()
    ctx.globalCompositeOperation = 'screen'

    // Multiple wave bands
    for (let band = 0; band < 3; band++) {
      const bandOffset = band * 0.3
      const baseIntensity = 0.08 - band * 0.02

      ctx.beginPath()
      ctx.moveTo(0, 0)

      // Noise-based wavy top edge
      for (let x = 0; x <= w; x += 4) {
        const noiseVal = noise.noise2D(x * 0.003 + t * 0.2 + bandOffset, t * 0.1 + band)
        const waveHeight = auroraHeight * (0.3 + noiseVal * 0.4 + band * 0.15)
        ctx.lineTo(x, waveHeight)
      }

      ctx.lineTo(w, 0)
      ctx.closePath()

      // Gradient fill
      const gradient = ctx.createLinearGradient(0, 0, 0, auroraHeight)
      const phase = t * 0.3 + band * 2

      // Color cycle through cyan -> green -> purple
      const r = Math.sin(phase) * 30 + 40
      const g = Math.sin(phase + 1) * 80 + 180
      const b = Math.sin(phase + 2) * 50 + 200

      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${baseIntensity})`)
      gradient.addColorStop(0.4, `rgba(${r + 20}, ${g - 30}, ${b - 50}, ${baseIntensity * 0.7})`)
      gradient.addColorStop(0.7, `rgba(${r + 100}, ${g - 80}, ${b}, ${baseIntensity * 0.4})`)
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = gradient
      ctx.fill()
    }

    ctx.restore()
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    // Use window dimensions for full viewport coverage
    const width = window.innerWidth
    const height = window.innerHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(dpr, dpr)

    createParticles(width, height)
    animationIdRef.current = requestAnimationFrame(render)

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
    }
  }, [createParticles, render])

  useEffect(() => {
    const changed =
      lastPropsRef.current.season !== season ||
      lastPropsRef.current.timeOfDay !== timeOfDay ||
      lastPropsRef.current.expressive !== expressive

    if (changed) {
      lastPropsRef.current = { season, timeOfDay, expressive }
      createParticles(window.innerWidth, window.innerHeight)
      shootingStarsRef.current = []
    }
  }, [season, timeOfDay, expressive, createParticles])

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
        zIndex: 1
      }}
    />
  )
}
