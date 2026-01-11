/**
 * Moon Renderer
 */

export function renderMoon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  illumination: number,
  phaseAngle: number,
  intensity: number,
  harvestMoon: boolean,
  sunAltitude: number = -10
) {
  // Don't render if intensity too low (Living Theme handles visibility)
  if (intensity < 0.05) return

  // Check if sun is also visible (above -6°)
  const sunVisible = sunAltitude > -6

  // Offset moon position when sun is visible to avoid overlap
  // Moon moves to lower-left of the ambient zone during twilight
  const moonX = sunVisible ? w * 0.72 : w * 0.82
  const moonY = sunVisible ? h * 0.22 : h * 0.14

  // Subtle sizes for ambient presence
  const baseSize = harvestMoon ? 22 : 18
  const glowSize = harvestMoon ? 55 : 45

  // Moon colors - warm amber for harvest moon, cool silver-blue otherwise
  const isHarvest = harvestMoon

  ctx.save()
  ctx.globalAlpha = intensity

  // Outer glow - ethereal ambient light (similar technique to sun)
  const glowGradient = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, glowSize)

  if (isHarvest) {
    // Harvest moon - warm amber glow
    glowGradient.addColorStop(0, 'rgba(251, 191, 36, 0.5)')
    glowGradient.addColorStop(0.3, 'rgba(251, 191, 36, 0.25)')
    glowGradient.addColorStop(0.6, 'rgba(251, 191, 36, 0.08)')
    glowGradient.addColorStop(1, 'rgba(251, 191, 36, 0)')
  } else {
    // Normal moon - cool silver-blue glow
    glowGradient.addColorStop(0, 'rgba(226, 232, 240, 0.45)')
    glowGradient.addColorStop(0.3, 'rgba(186, 230, 253, 0.2)')
    glowGradient.addColorStop(0.6, 'rgba(186, 230, 253, 0.06)')
    glowGradient.addColorStop(1, 'rgba(186, 230, 253, 0)')
  }

  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = glowGradient
  ctx.beginPath()
  ctx.arc(moonX, moonY, glowSize, 0, Math.PI * 2)
  ctx.fill()

  // Moon body - gradient for depth (not flat color)
  ctx.globalCompositeOperation = 'source-over'
  const bodyGradient = ctx.createRadialGradient(
    moonX - baseSize * 0.3,
    moonY - baseSize * 0.3,
    0,
    moonX,
    moonY,
    baseSize
  )

  if (isHarvest) {
    bodyGradient.addColorStop(0, '#FEF3C7') // Warm highlight
    bodyGradient.addColorStop(0.5, '#FCD34D') // Amber body
    bodyGradient.addColorStop(1, '#D97706') // Deeper edge
  } else {
    bodyGradient.addColorStop(0, '#F8FAFC') // Bright highlight
    bodyGradient.addColorStop(0.5, '#E2E8F0') // Silver body
    bodyGradient.addColorStop(1, '#CBD5E1') // Subtle edge
  }

  ctx.fillStyle = bodyGradient
  ctx.beginPath()
  ctx.arc(moonX, moonY, baseSize, 0, Math.PI * 2)
  ctx.fill()

  // Phase shadow - clean geometric approach
  // phaseAngle: 0 = new, 90 = first quarter, 180 = full, 270 = last quarter
  if (illumination < 98) {
    ctx.save()

    // Create clipping region for moon
    ctx.beginPath()
    ctx.arc(moonX, moonY, baseSize, 0, Math.PI * 2)
    ctx.clip()

    // Shadow color - dark but not pure black for subtlety
    const shadowColor = isHarvest ? 'rgba(120, 53, 15, 0.85)' : 'rgba(30, 41, 59, 0.8)'

    const isWaxing = phaseAngle < 180
    const shadowFraction = (100 - illumination) / 100

    // Calculate shadow ellipse position
    // For waxing: shadow starts on right, moves left
    // For waning: shadow starts on left, moves right
    const shadowDirection = isWaxing ? 1 : -1
    const shadowWidth = baseSize * Math.abs(1 - shadowFraction * 2)

    ctx.fillStyle = shadowColor

    if (illumination < 50) {
      // More shadow than light - draw shadow ellipse
      const ellipseX = moonX + shadowDirection * baseSize * (shadowFraction - 0.5)
      ctx.beginPath()
      ctx.ellipse(ellipseX, moonY, shadowWidth, baseSize, 0, 0, Math.PI * 2)
      ctx.fill()

      // Fill the far side completely
      ctx.beginPath()
      ctx.rect(isWaxing ? moonX : moonX - baseSize, moonY - baseSize, baseSize, baseSize * 2)
      ctx.fill()
    } else {
      // More light than shadow - draw crescent shadow
      const crescentOffset = baseSize * (1 - shadowFraction * 2)
      ctx.beginPath()
      ctx.arc(moonX, moonY, baseSize, 0, Math.PI * 2)
      ctx.arc(moonX + shadowDirection * crescentOffset, moonY, baseSize, 0, Math.PI * 2, true)
      ctx.fill()
    }

    ctx.restore()
  }

  // Subtle inner highlight for polish (no crude craters)
  ctx.globalAlpha = intensity * 0.3
  const highlightGradient = ctx.createRadialGradient(
    moonX - baseSize * 0.4,
    moonY - baseSize * 0.4,
    0,
    moonX,
    moonY,
    baseSize * 0.8
  )
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

  ctx.fillStyle = highlightGradient
  ctx.beginPath()
  ctx.arc(moonX, moonY, baseSize, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}
