/**
 * Leaf Renderer
 */

import type { LeafParticle } from '../types'

export function renderLeaf(
  ctx: CanvasRenderingContext2D,
  p: LeafParticle,
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
  p.rotation += p.rotationSpeed + noiseY * 0.02 + wind * 0.01

  // Wrap
  if (p.y > h + 30) {
    p.y = -30
    p.x = Math.random() * w
  }
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
