/**
 * Resonance Anchor Animation Config
 *
 * Color constants and pure functions for orb visual state.
 * The orb communicates breath phase and humming feedback through:
 * - Scale: 0.7 (contracted/inhale) to 1.3 (expanded/exhale)
 * - Glow intensity: dim during inhale, bright during exhale, boosted by humming
 * - Tint: indigo base shifts to cyan when stability is high ("locked in")
 */

export const RESONANCE_COLORS = {
  background: '#0A0A12',
  orbBase: '#4B0082', // Indigo
  orbLocked: '#00CED1', // Cyan - "locked in" state
  orbGlow: 'rgba(0, 206, 209, 0.35)',
} as const

/**
 * Hex color string to numeric value for PixiJS
 */
export function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

export interface OrbVisualState {
  /** Orb scale factor (0.7 to 1.3) */
  scale: number
  /** Glow outer strength (0 to 2) */
  glowIntensity: number
  /** Glow color as hex number for PixiJS */
  tint: number
}

/**
 * Pure function to calculate orb visual state from breath + voice data
 *
 * @param breathAmplitude - 0-1 from breath engine (0=inhale start, 1=exhale peak)
 * @param isHumming - Whether voice is detected
 * @param stability - 0-100 pitch/amplitude stability score
 */
export function getOrbState(
  breathAmplitude: number,
  isHumming: boolean,
  stability: number
): OrbVisualState {
  // Scale follows breath amplitude: 0.7 (contracted) to 1.3 (expanded)
  const scale = 0.7 + breathAmplitude * 0.6

  // Glow intensity: base from breath, boosted by humming
  let glowIntensity = 0.3 + breathAmplitude * 0.5 // 0.3 to 0.8 from breath
  if (isHumming) {
    glowIntensity = Math.min(2, glowIntensity + 0.6) // Boost when humming
  }

  // Tint: shift from indigo to cyan when stability is high and humming
  const lockedThreshold = 65
  const tint =
    stability > lockedThreshold && isHumming
      ? hexToNumber(RESONANCE_COLORS.orbLocked)
      : hexToNumber(RESONANCE_COLORS.orbBase)

  return { scale, glowIntensity, tint }
}
