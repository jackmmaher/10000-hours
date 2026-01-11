/**
 * Snow Renderer
 */

import type { SnowParticle } from '../types'

export function renderSnow(
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
  if (p.y > h + 20) {
    p.y = -20
    p.x = Math.random() * w
  }
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
