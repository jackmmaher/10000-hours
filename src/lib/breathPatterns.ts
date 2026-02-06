/**
 * Breath Patterns - Pure data + geometry for the Breath Pacer
 *
 * Contains:
 * - Pattern definitions (5 patterns with 4 phases each)
 * - Theme definitions (4 visual themes)
 * - Ball position calculation along terrain path
 * - SVG terrain path generation
 */

// ============================================================================
// Types
// ============================================================================

export interface BreathPhase {
  name: 'inhale' | 'holdIn' | 'exhale' | 'holdOut'
  label: string
  seconds: number
}

export interface BreathPattern {
  id: string
  name: string
  subtitle: string
  description: string
  category: string
  phases: BreathPhase[]
  /** Total cycle duration in seconds */
  cycleDuration: number
}

export interface BreathTheme {
  id: string
  name: string
  /** CSS gradient for background */
  gradient: string
  /** Ball fill color */
  ballColor: string
  /** Glow color (used in radialGradient stop) */
  glowColor: string
  /** Terrain path stroke color */
  pathColor: string
  /** Terrain fill color (below line) */
  fillColor: string
}

export interface BallPosition {
  x: number
  y: number
  /** 0 = bottom (exhale), 1 = top (inhale peak) */
  breathLevel: number
  /** Current phase index in pattern.phases */
  phaseIndex: number
}

// ============================================================================
// Easing
// ============================================================================

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

// ============================================================================
// Patterns
// ============================================================================

function makePattern(
  id: string,
  name: string,
  subtitle: string,
  description: string,
  category: string,
  phases: BreathPhase[]
): BreathPattern {
  const cycleDuration = phases.reduce((sum, p) => sum + p.seconds, 0)
  return { id, name, subtitle, description, category, phases, cycleDuration }
}

export const BREATH_PATTERNS: BreathPattern[] = [
  makePattern(
    'box-4',
    'Box Breathing',
    '4 – 4 – 4 – 4',
    'Equal phases. Used by Navy SEALs and first responders for acute stress.',
    'Balance',
    [
      { name: 'inhale', label: 'Breathe In', seconds: 4 },
      { name: 'holdIn', label: 'Hold', seconds: 4 },
      { name: 'exhale', label: 'Breathe Out', seconds: 4 },
      { name: 'holdOut', label: 'Hold', seconds: 4 },
    ]
  ),
  makePattern(
    '4-7-8',
    '4-7-8 Relaxing',
    '4 – 7 – 8',
    "Dr. Andrew Weil's pattern. Extended exhale activates the parasympathetic nervous system.",
    'Calm',
    [
      { name: 'inhale', label: 'Breathe In', seconds: 4 },
      { name: 'holdIn', label: 'Hold', seconds: 7 },
      { name: 'exhale', label: 'Breathe Out', seconds: 8 },
      { name: 'holdOut', label: 'Hold', seconds: 0 },
    ]
  ),
  makePattern(
    'calming-4-6',
    'Calming Breath',
    '4 – 6',
    'Simple extended exhale. Great for beginners — no breath holds required.',
    'Calm',
    [
      { name: 'inhale', label: 'Breathe In', seconds: 4 },
      { name: 'holdIn', label: 'Hold', seconds: 0 },
      { name: 'exhale', label: 'Breathe Out', seconds: 6 },
      { name: 'holdOut', label: 'Hold', seconds: 0 },
    ]
  ),
  makePattern(
    'coherence',
    'Coherence',
    '5.5 – 5.5',
    'Equal inhale/exhale at ~5.5 breaths/min. Maximizes heart rate variability.',
    'Balance',
    [
      { name: 'inhale', label: 'Breathe In', seconds: 5.5 },
      { name: 'holdIn', label: 'Hold', seconds: 0 },
      { name: 'exhale', label: 'Breathe Out', seconds: 5.5 },
      { name: 'holdOut', label: 'Hold', seconds: 0 },
    ]
  ),
  makePattern(
    'quick-reset',
    'Quick Reset',
    '2 – 2 – 4',
    'Fast-acting calm. Short inhale, brief hold, double exhale.',
    'Quick',
    [
      { name: 'inhale', label: 'Breathe In', seconds: 2 },
      { name: 'holdIn', label: 'Hold', seconds: 2 },
      { name: 'exhale', label: 'Breathe Out', seconds: 4 },
      { name: 'holdOut', label: 'Hold', seconds: 0 },
    ]
  ),
]

// ============================================================================
// Themes
// ============================================================================

export const BREATH_THEMES: BreathTheme[] = [
  {
    id: 'ocean',
    name: 'Ocean',
    gradient: 'linear-gradient(180deg, #0A1628 0%, #0D2137 40%, #134E6F 100%)',
    ballColor: '#5BB8F5',
    glowColor: '#5BB8F5',
    pathColor: 'rgba(91, 184, 245, 0.25)',
    fillColor: 'rgba(91, 184, 245, 0.06)',
  },
  {
    id: 'forest',
    name: 'Forest',
    gradient: 'linear-gradient(180deg, #0A1A0F 0%, #132A1A 40%, #1E4D2B 100%)',
    ballColor: '#6ECB8B',
    glowColor: '#6ECB8B',
    pathColor: 'rgba(110, 203, 139, 0.25)',
    fillColor: 'rgba(110, 203, 139, 0.06)',
  },
  {
    id: 'dusk',
    name: 'Dusk',
    gradient: 'linear-gradient(180deg, #1A0F2E 0%, #2D1B4E 40%, #5B2D8E 100%)',
    ballColor: '#C084FC',
    glowColor: '#C084FC',
    pathColor: 'rgba(192, 132, 252, 0.25)',
    fillColor: 'rgba(192, 132, 252, 0.06)',
  },
  {
    id: 'night',
    name: 'Night',
    gradient: 'linear-gradient(180deg, #09090B 0%, #111114 40%, #1C1C22 100%)',
    ballColor: '#E2E2E8',
    glowColor: '#E2E2E8',
    pathColor: 'rgba(226, 226, 232, 0.18)',
    fillColor: 'rgba(226, 226, 232, 0.04)',
  },
]

// ============================================================================
// Ball Position Calculation
// ============================================================================

/**
 * Calculate ball position along terrain for a given cycle progress.
 *
 * The ball moves left-to-right over the full cycle.
 * Y position encodes the breath level:
 *   - inhale: rises (0→1)
 *   - holdIn: stays at 1
 *   - exhale: falls (1→0)
 *   - holdOut: stays at 0
 *
 * @param pattern - The breath pattern
 * @param cycleProgress - 0 to 1 through one full cycle
 * @param width - SVG coordinate width
 * @param topY - Y coordinate for breath peak (top of terrain)
 * @param bottomY - Y coordinate for breath trough (bottom of terrain)
 * @param padding - Horizontal padding from edges
 */
export function getBallPosition(
  pattern: BreathPattern,
  cycleProgress: number,
  width: number,
  topY: number,
  bottomY: number,
  padding: number
): BallPosition {
  const usableWidth = width - padding * 2
  const x = padding + cycleProgress * usableWidth

  // Walk through phases to find current phase and local progress
  let elapsed = 0
  const totalTime = pattern.cycleDuration
  const currentTime = cycleProgress * totalTime

  let breathLevel = 0
  let phaseIndex = 0

  for (let i = 0; i < pattern.phases.length; i++) {
    const phase = pattern.phases[i]
    if (phase.seconds === 0) {
      elapsed += 0
      continue
    }

    if (currentTime < elapsed + phase.seconds) {
      phaseIndex = i
      const localProgress = (currentTime - elapsed) / phase.seconds

      switch (phase.name) {
        case 'inhale':
          breathLevel = easeInOutSine(localProgress)
          break
        case 'holdIn':
          breathLevel = 1
          break
        case 'exhale':
          breathLevel = 1 - easeInOutSine(localProgress)
          break
        case 'holdOut':
          breathLevel = 0
          break
      }
      break
    }
    elapsed += phase.seconds

    // If we've gone past all phases (shouldn't happen, but safety)
    if (i === pattern.phases.length - 1) {
      phaseIndex = i
      breathLevel = 0
    }
  }

  const y = bottomY - breathLevel * (bottomY - topY)

  return { x, y, breathLevel, phaseIndex }
}

// ============================================================================
// Terrain Path Generation
// ============================================================================

const TERRAIN_SAMPLES = 200

/**
 * Generate SVG path string for the terrain line.
 * Samples 200 points along one cycle and connects with line segments.
 */
export function generateTerrainPath(
  pattern: BreathPattern,
  width: number,
  topY: number,
  bottomY: number,
  padding: number
): string {
  const points: string[] = []

  for (let i = 0; i <= TERRAIN_SAMPLES; i++) {
    const progress = i / TERRAIN_SAMPLES
    const { x, y } = getBallPosition(pattern, progress, width, topY, bottomY, padding)
    points.push(i === 0 ? `M${x},${y}` : `L${x},${y}`)
  }

  return points.join(' ')
}

/**
 * Generate SVG path string for the filled area below the terrain line.
 * Same as terrain path but closes downward to form a fill region.
 */
export function generateTerrainFillPath(
  pattern: BreathPattern,
  width: number,
  topY: number,
  bottomY: number,
  padding: number
): string {
  const terrainPath = generateTerrainPath(pattern, width, topY, bottomY, padding)
  const rightX = padding + (width - padding * 2)
  const leftX = padding
  // Close the path: go to bottom-right, then bottom-left, then back to start
  return `${terrainPath} L${rightX},${bottomY + 10} L${leftX},${bottomY + 10} Z`
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get the current phase index and phase for a given cycle progress.
 * Returns index into pattern.phases (skipping zero-duration phases).
 */
export function getCurrentPhaseInfo(
  pattern: BreathPattern,
  cycleProgress: number
): { phase: BreathPhase; index: number; localProgress: number } {
  let elapsed = 0
  const currentTime = cycleProgress * pattern.cycleDuration

  for (let i = 0; i < pattern.phases.length; i++) {
    const phase = pattern.phases[i]
    if (phase.seconds === 0) continue
    if (currentTime < elapsed + phase.seconds) {
      const localProgress = (currentTime - elapsed) / phase.seconds
      return { phase, index: i, localProgress }
    }
    elapsed += phase.seconds
  }

  // Fallback: return last non-zero phase
  for (let i = pattern.phases.length - 1; i >= 0; i--) {
    if (pattern.phases[i].seconds > 0) {
      return { phase: pattern.phases[i], index: i, localProgress: 1 }
    }
  }
  return { phase: pattern.phases[0], index: 0, localProgress: 0 }
}

/**
 * Format seconds as m:ss display
 */
export function formatTimeDisplay(totalSeconds: number): string {
  const rounded = Math.floor(totalSeconds)
  const mins = Math.floor(rounded / 60)
  const secs = rounded % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
