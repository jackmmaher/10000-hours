/**
 * Sun Renderer
 */

export function renderSun(ctx: CanvasRenderingContext2D, w: number, h: number, altitude: number) {
  // Don't render sun at night (below civil twilight)
  if (altitude < -6) return

  // Fixed ambient position - top-right corner
  const sunX = w * 0.82
  const sunY = h * 0.14

  // Subtle, fixed sizes for ambient presence
  const baseSize = 18
  const glowSize = 55

  // Color warmth based on altitude (golden hour = warmer)
  // Clamp altitude for warmth calculation
  const clampedAlt = Math.max(0, altitude)
  const warmth = Math.max(0, 1 - clampedAlt / 15) // 1 at horizon, 0 at 15°+

  // Fade opacity based on altitude (dimmer near horizon, brighter when high)
  const fadeIn = Math.min(1, Math.max(0, (altitude + 6) / 12)) // Fade in from -6° to 6°
  const opacity = altitude > 0 ? 0.85 : fadeIn * 0.6

  if (opacity < 0.05) return

  ctx.save()
  ctx.globalAlpha = opacity

  // Outer glow - soft ambient light
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, glowSize)

  // Sun colors - warmer near horizon (golden hour)
  const coreG = Math.round(255 - warmth * 55) // 255 → 200
  const coreB = Math.round(240 - warmth * 140) // 240 → 100
  const midG = Math.round(220 - warmth * 80) // 220 → 140
  const midB = Math.round(180 - warmth * 130) // 180 → 50

  sunGlow.addColorStop(0, `rgba(255, 255, 255, 0.95)`)
  sunGlow.addColorStop(0.15, `rgba(255, ${coreG}, ${coreB}, 0.8)`)
  sunGlow.addColorStop(0.4, `rgba(255, ${midG}, ${midB}, 0.35)`)
  sunGlow.addColorStop(0.7, `rgba(255, ${150 - warmth * 50}, 80, 0.1)`)
  sunGlow.addColorStop(1, 'rgba(255, 200, 100, 0)')

  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = sunGlow
  ctx.beginPath()
  ctx.arc(sunX, sunY, glowSize, 0, Math.PI * 2)
  ctx.fill()

  // Sun core - bright center
  ctx.globalCompositeOperation = 'lighter'
  const coreGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, baseSize)
  coreGradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  coreGradient.addColorStop(0.5, `rgba(255, ${255 - warmth * 30}, ${220 - warmth * 100}, 0.85)`)
  coreGradient.addColorStop(1, `rgba(255, ${200 - warmth * 50}, ${100 - warmth * 50}, 0)`)

  ctx.fillStyle = coreGradient
  ctx.beginPath()
  ctx.arc(sunX, sunY, baseSize, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}
