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

// Visual Constants - reads from CSS variables (defined in index.css)
// Falls back to hardcoded values for SSR/testing
function getCSSVariable(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

// Lazy-loaded colors that read from CSS variables at runtime
// This ensures theme system is the single source of truth
export const RACING_MIND_COLORS = {
  // Primary orb color - blue ~471nm for 3x faster relaxation
  get orb() {
    return getCSSVariable('--racing-mind-orb', '#2C5AA0')
  },
  // Glow color - slightly lighter for bloom effect
  get glow() {
    return getCSSVariable('--racing-mind-glow', '#4A7FD4')
  },
  // Background - dark, low contrast
  get background() {
    return getCSSVariable('--racing-mind-bg', '#0A0A12')
  },
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
  targetFps: 60,
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
 * Calculate oscillation amplitude based on viewport width and orientation
 *
 * @param viewportWidth - Width of the viewport in pixels
 * @param isLandscape - Whether device is in landscape orientation
 * @returns Amplitude in pixels (orb moves this far from center)
 */
export function getOscillationAmplitude(viewportWidth: number, isLandscape = false): number {
  // Landscape mode: wider travel for more eye movement
  // Portrait mode: standard travel for better tracking accuracy
  const amplitudeFraction = isLandscape ? 0.4 : 0.35
  return viewportWidth * amplitudeFraction
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
 * Smoothed sine function to avoid velocity approaching zero at extremes
 * Near peaks (|sine| > 0.95), blends to maintain some velocity
 */
function smoothSine(t: number): number {
  const sine = Math.sin(t)
  const absSine = Math.abs(sine)
  // Near extremes (|sine| > 0.95), blend to avoid complete velocity stop
  if (absSine > 0.95) {
    const blend = (absSine - 0.95) / 0.05
    return sine * (1 - blend * 0.15)
  }
  return sine
}

/**
 * Calculate complete orb position for a given time
 *
 * @param timeMs - Current time in milliseconds (from session start)
 * @param progress - Session progress from 0 to 1
 * @param viewportWidth - Viewport width in pixels
 * @param viewportHeight - Viewport height in pixels
 * @param noise - SimplexNoise instance for organic drift
 * @param isLandscape - Whether device is in landscape orientation
 * @returns { x, y } position in pixels
 */
export function calculateOrbPosition(
  timeMs: number,
  progress: number,
  viewportWidth: number,
  viewportHeight: number,
  noise: { noise2D: (x: number, y: number) => number },
  isLandscape = false
): { x: number; y: number } {
  const centerX = viewportWidth / 2
  const centerY = viewportHeight / 2

  // Get current speed and derived oscillation params
  const speed = getOrbSpeed(progress)
  const frequency = getOscillationFrequency(speed)
  const amplitude = getOscillationAmplitude(viewportWidth, isLandscape)

  // Primary horizontal oscillation (using smoothSine for smoother direction changes)
  const oscillationX = smoothSine(timeMs * frequency) * amplitude

  // Organic noise drift
  const { noiseScale, noiseAmplitudeX, noiseAmplitudeY, orbRadius } = ANIMATION_PARAMS
  const noiseX = noise.noise2D(timeMs * noiseScale, 0) * noiseAmplitudeX
  const noiseY = noise.noise2D(0, timeMs * noiseScale) * noiseAmplitudeY

  // Calculate raw position
  const rawX = centerX + oscillationX + noiseX
  const rawY = centerY + noiseY

  // Clamp to safe bounds - keep orb fully visible on screen
  const safeMargin = orbRadius + 20 // Orb radius + padding
  const minX = safeMargin
  const maxX = viewportWidth - safeMargin
  const minY = safeMargin
  const maxY = viewportHeight - safeMargin

  return {
    x: Math.max(minX, Math.min(maxX, rawX)),
    y: Math.max(minY, Math.min(maxY, rawY)),
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
