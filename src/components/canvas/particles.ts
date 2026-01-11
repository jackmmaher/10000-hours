/**
 * Particle Creation Functions
 */

import type { SnowParticle, LeafParticle, FireflyParticle, MistParticle } from './types'
import { LEAF_COLORS } from './constants'

export function createSnowParticle(w: number, h: number, init: boolean, now: number): SnowParticle {
  const z = Math.random()
  return {
    type: 'snow',
    x: Math.random() * w,
    y: init ? Math.random() * h : -20 - Math.random() * 50,
    z,
    size: 1 + Math.random() * 4 + z * 2,
    speedX: (Math.random() - 0.5) * 0.3,
    speedY: 0.3 + Math.random() * 1.2 + z * 0.5,
    noiseOffsetX: Math.random() * 1000,
    noiseOffsetY: Math.random() * 1000,
    alpha: 0.3 + Math.random() * 0.5 + z * 0.2,
    birthTime: now,
    sparkle: Math.random(),
    tumble: Math.random() * Math.PI * 2,
  }
}

export function createLeafParticle(w: number, h: number, init: boolean, now: number): LeafParticle {
  const z = Math.random()
  return {
    type: 'leaf',
    x: Math.random() * w,
    y: init ? Math.random() * h : -30 - Math.random() * 50,
    z,
    size: 6 + Math.random() * 10 + z * 4,
    speedX: (Math.random() - 0.5) * 1.5,
    speedY: 0.8 + Math.random() * 1.5 + z * 0.8,
    noiseOffsetX: Math.random() * 1000,
    noiseOffsetY: Math.random() * 1000,
    alpha: 0.5 + Math.random() * 0.4 + z * 0.1,
    birthTime: now,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.08,
    color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
    flutter: Math.random() * Math.PI * 2,
  }
}

export function createFireflyParticle(w: number, h: number, now: number): FireflyParticle {
  const z = Math.random()
  return {
    type: 'firefly',
    x: Math.random() * w,
    y: h * 0.25 + Math.random() * h * 0.55,
    z,
    size: 2 + Math.random() * 3,
    speedX: (Math.random() - 0.5) * 0.2,
    speedY: (Math.random() - 0.5) * 0.2,
    noiseOffsetX: Math.random() * 1000,
    noiseOffsetY: Math.random() * 1000,
    alpha: 0.8,
    birthTime: now,
    glowPhase: Math.random() * Math.PI * 2,
    glowSpeed: 0.015 + Math.random() * 0.025,
    pulseOffset: Math.random() * 1000,
  }
}

export function createMistParticle(w: number, h: number, now: number): MistParticle {
  const z = Math.random()
  return {
    type: 'mist',
    x: Math.random() * w,
    y: h * 0.35 + Math.random() * h * 0.45,
    z,
    size: 80 + Math.random() * 160 + z * 60,
    speedX: (Math.random() - 0.5) * 0.15,
    speedY: (Math.random() - 0.5) * 0.05,
    noiseOffsetX: Math.random() * 1000,
    noiseOffsetY: Math.random() * 1000,
    alpha: 0.04 + Math.random() * 0.08,
    birthTime: now,
    opacity: 0.03 + Math.random() * 0.07,
    driftPhase: Math.random() * Math.PI * 2,
  }
}
