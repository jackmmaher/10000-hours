/**
 * Shooting Stars Renderer
 */

import type { ShootingStar } from '../types'

export function renderShootingStars(
  ctx: CanvasRenderingContext2D,
  shootingStarsRef: { current: ShootingStar[] },
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
      brightness: 0.7 + Math.random() * 0.3,
    })
  }

  // Update and render
  shootingStarsRef.current = stars.filter((s) => {
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
