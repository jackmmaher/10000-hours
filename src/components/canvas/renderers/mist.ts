/**
 * Mist Renderer
 */

import type { MistParticle } from '../types'

export function renderMist(
  ctx: CanvasRenderingContext2D,
  p: MistParticle,
  t: number,
  w: number,
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
  const gradient = ctx.createRadialGradient(p.x + drift * 0.5, p.y, 0, p.x, p.y, p.size)
  gradient.addColorStop(0, `rgba(180, 180, 190, ${p.opacity * depthAlpha})`)
  gradient.addColorStop(0.5, `rgba(160, 160, 170, ${p.opacity * depthAlpha * 0.5})`)
  gradient.addColorStop(1, 'rgba(150, 150, 160, 0)')

  ctx.globalAlpha = 1
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
  ctx.fill()
}
