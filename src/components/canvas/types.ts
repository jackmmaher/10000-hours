/**
 * Canvas Types - Particle and effect interfaces
 */

import type { Season, TimeOfDay, EffectIntensities, SeasonalEffects } from '../../lib/livingTheme'

export interface LivingCanvasProps {
  season: Season
  timeOfDay: TimeOfDay
  effects: EffectIntensities
  expressive: boolean
  seasonalEffects: SeasonalEffects
  sunAltitude: number
  moonIllumination: number
  moonPhaseAngle: number
  hideCelestialBodies?: boolean
}

export interface BaseParticle {
  x: number
  y: number
  z: number
  size: number
  speedX: number
  speedY: number
  noiseOffsetX: number
  noiseOffsetY: number
  alpha: number
  birthTime: number
}

export interface StarParticle extends BaseParticle {
  type: 'star'
  twinklePhase: number
  twinkleSpeed: number
  colorTemp: number // 0 = cool blue, 1 = warm yellow
}

export interface SnowParticle extends BaseParticle {
  type: 'snow'
  sparkle: number
  tumble: number
}

export interface LeafParticle extends BaseParticle {
  type: 'leaf'
  rotation: number
  rotationSpeed: number
  color: string
  flutter: number
}

export interface FireflyParticle extends BaseParticle {
  type: 'firefly'
  glowPhase: number
  glowSpeed: number
  pulseOffset: number
}

export interface MistParticle extends BaseParticle {
  type: 'mist'
  opacity: number
  driftPhase: number
}

export type Particle = StarParticle | SnowParticle | LeafParticle | FireflyParticle | MistParticle

export interface ShootingStar {
  x: number
  y: number
  speedX: number
  speedY: number
  life: number
  length: number
  brightness: number
}
