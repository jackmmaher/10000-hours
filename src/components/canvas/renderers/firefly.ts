/**
 * Firefly Renderer
 */

import type { FireflyParticle } from '../types'

export function renderFirefly(
  ctx: CanvasRenderingContext2D,
  p: FireflyParticle,
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
