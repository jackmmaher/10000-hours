/**
 * Racing Mind Animation Math
 *
 * Contains the mathematical functions for:
 * - Deceleration curve (speed decreases over session)
 * - Noise parameters for organic movement
 * - Glow pulse timing
 *
 * Scientific basis:
 * - Visual tracking suppresses Default Mode Network (rumination)
 * - Blue light (~471nm) accelerates relaxation 3x vs white light
 * - "Soft fascination" is a validated restorative attention state
 *
 * Visual parameters from feasibility doc:
 * - Start speed: 22°/sec (upper comfortable pursuit)
 * - End speed: 12°/sec (lower comfortable range)
 * - Glow pulse: 0.7 Hz (well below 3Hz seizure threshold)
 * - Frame rate: 30 fps (battery efficient)
 */

import BezierEasing from 'bezier-easing'

// Visual Constants
export const RACING_MIND_COLORS = {
  // Primary orb color - blue ~471nm for 3x faster relaxation
  orb: '#2C5AA0',
  // Glow color - slightly lighter for bloom effect
  glow: '#4A7FD4',
  // Background - dark, low contrast
  background: '#0A0A12',
} as const

// Animation Constants
export const ANIMATION_PARAMS = {
  // Speed in degrees per second (visual angle)
  startSpeedDegrees: 22,
  endSpeedDegrees: 12,

  // Convert degrees to viewport fraction (assuming ~60deg viewport)
  // 22°/sec ≈ 0.37 viewport widths per second
  // 12°/sec ≈ 0.20 viewport widths per second
  startSpeedFraction: 0.37,
  endSpeedFraction: 0.2,

  // Glow pulse frequency in Hz (0.7Hz = ~1.43s cycle)
  glowPulseHz: 0.7,

  // Glow strength range
  glowMinStrength: 1.0,
  glowMaxStrength: 2.0,

  // Noise parameters for organic drift
  noiseScale: 0.0003, // How fast noise changes (lower = slower drift)
  noiseAmplitudeX: 30, // Pixels of horizontal drift
  noiseAmplitudeY: 15, // Pixels of vertical drift (less than X for horizontal bias)

  // Orb radius
  orbRadius: 40,

  // Target frame rate
  targetFps: 30,
} as const

// Bezier easing for smooth deceleration (ease-out-cubic-like)
const decelerationEasing = BezierEasing(0.22, 0.61, 0.36, 1)

/**
 * Calculate orb speed based on session progress
 *
 * @param progress - Session progress from 0 (start) to 1 (end)
 * @returns Speed as fraction of viewport width per second
 */
export function getOrbSpeed(progress: number): number {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const easedProgress = decelerationEasing(clampedProgress)

  const { startSpeedFraction, endSpeedFraction } = ANIMATION_PARAMS
  return startSpeedFraction - easedProgress * (startSpeedFraction - endSpeedFraction)
}

/**
 * Calculate oscillation frequency based on speed
 * Faster movement = higher frequency oscillation
 *
 * @param speed - Current speed in viewport fraction per second
 * @returns Oscillation frequency in radians per millisecond
 */
export function getOscillationFrequency(speed: number): number {
  // Base frequency that gives smooth oscillation
  // At max speed (0.37), want ~0.003 rad/ms (one cycle every ~2s)
  // At min speed (0.20), want ~0.002 rad/ms (one cycle every ~3s)
  const normalizedSpeed =
    (speed - ANIMATION_PARAMS.endSpeedFraction) /
    (ANIMATION_PARAMS.startSpeedFraction - ANIMATION_PARAMS.endSpeedFraction)
  return 0.002 + normalizedSpeed * 0.001
}

/**
 * Calculate oscillation amplitude based on viewport width
 *
 * @param viewportWidth - Width of the viewport in pixels
 * @returns Amplitude in pixels (orb moves this far from center)
 */
export function getOscillationAmplitude(viewportWidth: number): number {
  // Use 35% of viewport width as max displacement from center
  return viewportWidth * 0.35
}

/**
 * Calculate glow strength for pulse effect
 *
 * @param timeMs - Current time in milliseconds
 * @returns Glow outer strength value
 */
export function getGlowStrength(timeMs: number): number {
  const { glowPulseHz, glowMinStrength, glowMaxStrength } = ANIMATION_PARAMS

  // Convert Hz to radians per millisecond
  const omega = (2 * Math.PI * glowPulseHz) / 1000

  // Sine wave oscillation between min and max
  const range = glowMaxStrength - glowMinStrength
  const midpoint = glowMinStrength + range / 2
  const amplitude = range / 2

  return midpoint + Math.sin(timeMs * omega) * amplitude
}

/**
 * Calculate complete orb position for a given time
 *
 * @param timeMs - Current time in milliseconds (from session start)
 * @param progress - Session progress from 0 to 1
 * @param viewportWidth - Viewport width in pixels
 * @param viewportHeight - Viewport height in pixels
 * @param noise - SimplexNoise instance for organic drift
 * @returns { x, y } position in pixels
 */
export function calculateOrbPosition(
  timeMs: number,
  progress: number,
  viewportWidth: number,
  viewportHeight: number,
  noise: { noise2D: (x: number, y: number) => number }
): { x: number; y: number } {
  const centerX = viewportWidth / 2
  const centerY = viewportHeight / 2

  // Get current speed and derived oscillation params
  const speed = getOrbSpeed(progress)
  const frequency = getOscillationFrequency(speed)
  const amplitude = getOscillationAmplitude(viewportWidth)

  // Primary horizontal oscillation
  const oscillationX = Math.sin(timeMs * frequency) * amplitude

  // Organic noise drift
  const { noiseScale, noiseAmplitudeX, noiseAmplitudeY } = ANIMATION_PARAMS
  const noiseX = noise.noise2D(timeMs * noiseScale, 0) * noiseAmplitudeX
  const noiseY = noise.noise2D(0, timeMs * noiseScale) * noiseAmplitudeY

  return {
    x: centerX + oscillationX + noiseX,
    y: centerY + noiseY,
  }
}

/**
 * Format elapsed time as MM:SS
 */
export function formatElapsedTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
