/**
 * Aurora Renderer
 */

import type { SimplexNoise } from '../../../lib/noise/SimplexNoise'

export function renderAurora(
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
