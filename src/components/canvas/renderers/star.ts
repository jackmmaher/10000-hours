/**
 * Star Renderer
 */

import type { Season } from '../../../lib/livingTheme'
import type { StarParticle } from '../types'
import { STAR_TEMPS } from '../constants'

export function renderStar(
  ctx: CanvasRenderingContext2D,
  p: StarParticle,
  season: Season,
  starsIntensity: number
) {
  p.twinklePhase += p.twinkleSpeed

  // Multi-phase twinkle for more organic feel
  const twinkle1 = Math.sin(p.twinklePhase) * 0.5 + 0.5
  const twinkle2 = Math.sin(p.twinklePhase * 1.7 + 1) * 0.3 + 0.7
  const twinkle = twinkle1 * twinkle2

  const temps = STAR_TEMPS[season]
  const color = p.colorTemp > 0.5 ? temps.warm : temps.cool
  const depthAlpha = 0.3 + p.z * 0.7
  const finalAlpha = p.alpha * twinkle * depthAlpha * starsIntensity

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
