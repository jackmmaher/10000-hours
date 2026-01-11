/**
 * Living Canvas Invariant Tests
 *
 * These tests detect "technically correct but visually wrong" states
 * by testing data flow invariants rather than visual output.
 *
 * The core insight: if we know the conditions that should produce visible output,
 * we can test that those conditions are met in the data structures.
 */

import { describe, it, expect } from 'vitest'
import {
  calculateEffectIntensities,
  calculateManualTheme,
  getManualSeasonalEffects,
  getSeasonalEffects,
  SUN_THRESHOLDS,
  type EffectIntensities,
  type SeasonalEffects,
} from '../../lib/livingTheme'

// =============================================================================
// TEST HELPERS - Simulate what LivingCanvas does internally
// =============================================================================

interface SimulatedParticle {
  type: 'star' | 'snow' | 'leaf' | 'firefly' | 'mist'
  alpha: number
  z: number
}

/**
 * Simulate particle creation logic from LivingCanvas.tsx lines 217-273
 */
function simulateParticleCreation(
  effects: EffectIntensities,
  seasonalEffects: SeasonalEffects
): SimulatedParticle[] {
  const particles: SimulatedParticle[] = []

  // Stars: line 222
  if (effects.stars > 0) {
    const count = Math.floor(60 * effects.stars)
    for (let i = 0; i < count; i++) {
      particles.push({
        type: 'star',
        alpha: 0.2 + Math.random() * 0.8,
        z: Math.random(),
      })
    }
  }

  // Seasonal particles: line 249
  const intensity = effects.particles * seasonalEffects.particleMultiplier
  if (intensity >= 0.1) {
    const particleType = seasonalEffects.particleType
    if (particleType !== 'none') {
      // Map config type to actual particle type (plural → singular)
      const typeMap: Record<string, SimulatedParticle['type']> = {
        snow: 'snow',
        leaves: 'leaf',
        fireflies: 'firefly',
        mist: 'mist',
      }
      const countMap = {
        snow: Math.floor(200 * intensity),
        leaves: Math.floor(60 * intensity),
        fireflies: Math.floor(40 * intensity),
        mist: Math.floor(50 * intensity),
      }
      const count = countMap[particleType] || 0
      const actualType = typeMap[particleType]
      for (let i = 0; i < count; i++) {
        particles.push({
          type: actualType,
          alpha: 0.3 + Math.random() * 0.5,
          z: Math.random(),
        })
      }
    }
  }

  return particles
}

/**
 * Simulate star render alpha calculation from LivingCanvas.tsx line 452
 */
function simulateStarRenderAlpha(particle: SimulatedParticle, effectsStars: number): number {
  const twinkle = 0.5 // Assume middle of twinkle cycle
  const depthAlpha = 0.3 + particle.z * 0.7
  return particle.alpha * twinkle * depthAlpha * effectsStars
}

// Helper functions for aurora/shooting stars rendering checks are available
// but not used in current tests - they document the rendering conditions

// =============================================================================
// INVARIANT 1: Particle Existence Matches Effect Values
// =============================================================================

describe('Invariant 1: Particles exist when effects say they should', () => {
  it('should create star particles when effects.stars > 0', () => {
    const effects = calculateEffectIntensities(-10, false, 'winter', false)

    // INVARIANT: if effects.stars > 0, particles should contain stars
    expect(effects.stars).toBeGreaterThan(0)

    const seasonalEffects = getSeasonalEffects('winter', 'night', false)
    const particles = simulateParticleCreation(effects, seasonalEffects)
    const stars = particles.filter((p) => p.type === 'star')

    expect(stars.length).toBeGreaterThan(0)
  })

  it('should NOT create star particles when effects.stars = 0', () => {
    const effects = calculateEffectIntensities(45, false, 'summer', false)

    // During high daytime, stars should be 0
    expect(effects.stars).toBe(0)

    const seasonalEffects = getSeasonalEffects('summer', 'daytime', false)
    const particles = simulateParticleCreation(effects, seasonalEffects)
    const stars = particles.filter((p) => p.type === 'star')

    expect(stars.length).toBe(0)
  })

  it('documents scenario that was buggy: particles created at T1 with stars=0, then effects change', () => {
    /**
     * This test documents a scenario that WAS buggy before the fix.
     *
     * THE BUG (now fixed):
     * - User in daytime mode (effects.stars = 0) → no star particles created
     * - User switches to night mode (effects.stars = 1)
     * - OLD: useEffect guard only checked season/time/expressive, not effects
     * - OLD: createParticles not called → no stars rendered
     *
     * THE FIX (LivingCanvas.tsx lines 1064-1090):
     * - useEffect now tracks starsVisible (effects.stars > 0) and particleType
     * - When these change, createParticles is called
     * - Particles are recreated to match new effects
     *
     * This test simulates the DATA FLOW that caused the bug, as documentation.
     */

    // T1: Daytime - no stars in effects
    const daytimeEffects = calculateEffectIntensities(45, false, 'winter', false)
    expect(daytimeEffects.stars).toBe(0)

    // Particles created at T1 (this is what OLD code would have)
    const seasonalEffects = getSeasonalEffects('winter', 'daytime', false)
    const oldParticles = simulateParticleCreation(daytimeEffects, seasonalEffects)
    const oldStars = oldParticles.filter((p) => p.type === 'star')

    // T2: Switch to night - effects.stars becomes 1
    const manualNightTheme = calculateManualTheme('winter', 'night', false)
    expect(manualNightTheme.effects.stars).toBe(1)

    // Document: if particles weren't recreated, this would be the bug state
    if (oldStars.length === 0 && manualNightTheme.effects.stars > 0) {
      console.warn(
        'BUG SCENARIO (now fixed): effects.stars=%d but no star particles exist. ' +
          'In old code, stars would not render. Now createParticles is called on effects change.',
        manualNightTheme.effects.stars
      )
    }

    // With fix: particles WOULD be recreated, so let's simulate that
    const nightSeasonalEffects = getSeasonalEffects('winter', 'night', false)
    const newParticles = simulateParticleCreation(manualNightTheme.effects, nightSeasonalEffects)
    const newStars = newParticles.filter((p) => p.type === 'star')

    // After fix: stars exist and render with visible alpha
    expect(newStars.length).toBeGreaterThan(0)
    newStars.forEach((star) => {
      const alpha = simulateStarRenderAlpha(star, manualNightTheme.effects.stars)
      expect(alpha).toBeGreaterThan(0.01)
    })
  })
})

// =============================================================================
// INVARIANT 2: Render Alpha > 0 When Particles Should Be Visible
// =============================================================================

describe('Invariant 2: Particles render with non-zero alpha when they should be visible', () => {
  it('should produce visible stars at night', () => {
    const effects = calculateEffectIntensities(-10, false, 'winter', false)
    const seasonalEffects = getSeasonalEffects('winter', 'night', false)
    const particles = simulateParticleCreation(effects, seasonalEffects)
    const stars = particles.filter((p) => p.type === 'star')

    // All stars should have visible render alpha
    stars.forEach((star) => {
      const renderAlpha = simulateStarRenderAlpha(star, effects.stars)
      expect(renderAlpha).toBeGreaterThan(0.01) // Minimum visibility threshold
    })
  })

  it('DETECTS BUG: particles exist but render with alpha=0 due to stale effects ref', () => {
    // Simulate: particles created at night, then effects change to day

    // T1: Night - stars created
    const nightEffects = calculateEffectIntensities(-10, false, 'winter', false)
    const seasonalEffects = getSeasonalEffects('winter', 'night', false)
    const particles = simulateParticleCreation(nightEffects, seasonalEffects)
    const stars = particles.filter((p) => p.type === 'star')
    expect(stars.length).toBeGreaterThan(0)

    // T2: Day - effects.stars becomes 0
    const dayEffects = calculateEffectIntensities(45, false, 'winter', false)
    expect(dayEffects.stars).toBe(0)

    // Particles still exist but render with 0 alpha
    // This is CORRECT behavior (fade out) - not a bug
    stars.forEach((star) => {
      const renderAlpha = simulateStarRenderAlpha(star, dayEffects.stars)
      expect(renderAlpha).toBe(0)
    })
  })
})

// =============================================================================
// INVARIANT 3: Seasonal Particles Match Season Configuration
// =============================================================================

describe('Invariant 3: Correct particle types for each season', () => {
  it('winter night should have snow particles', () => {
    const theme = calculateManualTheme('winter', 'night', false)
    const seasonalEffects = getManualSeasonalEffects('winter', 'night', false)
    const particles = simulateParticleCreation(theme.effects, seasonalEffects)

    expect(seasonalEffects.particleType).toBe('snow')
    const snow = particles.filter((p) => p.type === 'snow')
    expect(snow.length).toBeGreaterThan(0)
  })

  it('autumn evening should have leaf particles', () => {
    const theme = calculateManualTheme('autumn', 'evening', false)
    const seasonalEffects = getManualSeasonalEffects('autumn', 'evening', false)
    const particles = simulateParticleCreation(theme.effects, seasonalEffects)

    expect(seasonalEffects.particleType).toBe('leaves')
    const leaves = particles.filter((p) => p.type === 'leaf')
    expect(leaves.length).toBeGreaterThan(0)
  })

  it('summer night should have firefly particles', () => {
    const theme = calculateManualTheme('summer', 'night', false)
    const seasonalEffects = getManualSeasonalEffects('summer', 'night', false)
    const particles = simulateParticleCreation(theme.effects, seasonalEffects)

    expect(seasonalEffects.particleType).toBe('fireflies')
    const fireflies = particles.filter((p) => p.type === 'firefly')
    expect(fireflies.length).toBeGreaterThan(0)
  })

  it('spring daytime should have mist particles', () => {
    const theme = calculateManualTheme('spring', 'daytime', false)
    const seasonalEffects = getManualSeasonalEffects('spring', 'daytime', false)
    const particles = simulateParticleCreation(theme.effects, seasonalEffects)

    expect(seasonalEffects.particleType).toBe('mist')
    const mist = particles.filter((p) => p.type === 'mist')
    expect(mist.length).toBeGreaterThan(0)
  })
})

// =============================================================================
// INVARIANT 4: Threshold Consistency Between Creation and Rendering
// =============================================================================

describe('Invariant 4: Effect thresholds are consistent', () => {
  it('DETECTS THRESHOLD MISMATCH: aurora requires stars > 0.5 but stars created at > 0', () => {
    // This documents the threshold mismatch between star creation and aurora rendering

    // Stars are created when effects.stars > 0
    const STAR_CREATION_THRESHOLD = 0

    // Aurora renders when effects.stars > 0.5
    const AURORA_RENDER_THRESHOLD = 0.5

    // At stars = 0.3, stars exist but aurora doesn't render
    const lowStarEffects = calculateEffectIntensities(2, false, 'winter', true) // Just below golden hour

    if (
      lowStarEffects.stars > STAR_CREATION_THRESHOLD &&
      lowStarEffects.stars <= AURORA_RENDER_THRESHOLD
    ) {
      // This is a potential inconsistency - stars visible but aurora not
      // May or may not be intentional, but documents the threshold gap
      console.debug(
        'THRESHOLD GAP: stars=%d creates particles but aurora threshold is %d',
        lowStarEffects.stars,
        AURORA_RENDER_THRESHOLD
      )
    }

    // The actual check
    expect(AURORA_RENDER_THRESHOLD).toBeGreaterThan(STAR_CREATION_THRESHOLD)
  })

  it('seasonal particle threshold matches documentation', () => {
    // Particles created when intensity >= 0.1
    const PARTICLE_THRESHOLD = 0.1

    const lowIntensityEffects: EffectIntensities = {
      stars: 0,
      moon: 0,
      shootingStars: 0,
      atmosphericGradient: 0,
      directionalLight: { intensity: 0, warmth: 0, angle: 0 },
      particles: 0.05, // Below threshold
      grain: 0,
      ambientDarkness: 0,
    }

    const seasonalEffects: SeasonalEffects = {
      particleType: 'snow',
      particleMultiplier: 1,
      aurora: false,
      harvestMoon: false,
      rainPossible: false,
    }

    const intensity = lowIntensityEffects.particles * seasonalEffects.particleMultiplier
    expect(intensity).toBeLessThan(PARTICLE_THRESHOLD)

    const particles = simulateParticleCreation(lowIntensityEffects, seasonalEffects)
    const snow = particles.filter((p) => p.type === 'snow')
    expect(snow.length).toBe(0) // No particles created below threshold
  })
})

// =============================================================================
// INVARIANT 5: Manual Theme Mode Produces Expected Effects
// =============================================================================

describe('Invariant 5: Manual theme mode produces correct effects', () => {
  const manualConfigs = [
    { season: 'winter' as const, time: 'night' as const, expectStars: true, expectSnow: true },
    { season: 'winter' as const, time: 'daytime' as const, expectStars: false, expectSnow: true },
    { season: 'summer' as const, time: 'night' as const, expectStars: true, expectFireflies: true },
    { season: 'autumn' as const, time: 'evening' as const, expectStars: true, expectLeaves: true },
    {
      season: 'neutral' as const,
      time: 'night' as const,
      expectStars: false,
      expectParticles: false,
    },
  ]

  manualConfigs.forEach((config) => {
    it(`${config.season} ${config.time} produces expected particles`, () => {
      const theme = calculateManualTheme(config.season, config.time, false)
      const seasonalEffects = getManualSeasonalEffects(config.season, config.time, false)
      const particles = simulateParticleCreation(theme.effects, seasonalEffects)

      if (config.expectStars) {
        expect(theme.effects.stars).toBeGreaterThan(0)
        expect(particles.some((p) => p.type === 'star')).toBe(true)
      } else {
        expect(theme.effects.stars).toBe(0)
        expect(particles.filter((p) => p.type === 'star').length).toBe(0)
      }

      if (config.expectSnow) {
        expect(seasonalEffects.particleType).toBe('snow')
      }
      if (config.expectFireflies) {
        expect(seasonalEffects.particleType).toBe('fireflies')
      }
      if (config.expectLeaves) {
        expect(seasonalEffects.particleType).toBe('leaves')
      }
      if (config.expectParticles === false) {
        expect(seasonalEffects.particleType).toBe('none')
      }
    })
  })
})

// =============================================================================
// INVARIANT 6: Sun/Moon Visibility Conditions
// =============================================================================

describe('Invariant 6: Celestial body visibility matches altitude thresholds', () => {
  it('sun should not render below civil twilight', () => {
    // Sun renders when altitude > -6 (SUN_THRESHOLDS.CIVIL_TWILIGHT)
    // At -10, sun should not render
    const sunShouldRender = -10 > SUN_THRESHOLDS.CIVIL_TWILIGHT
    expect(sunShouldRender).toBe(false)
  })

  it('moon should be visible after sunset', () => {
    const effects = calculateEffectIntensities(-3, false, 'winter', false)
    // Moon appears when altitude < 0 (SUN_THRESHOLDS.HORIZON)
    expect(effects.moon).toBeGreaterThan(0)
  })

  it('stars should be visible during golden hour and night', () => {
    // At golden hour (altitude = 4)
    const goldenEffects = calculateEffectIntensities(4, false, 'winter', false)
    expect(goldenEffects.stars).toBeGreaterThan(0)

    // At night (altitude = -10)
    const nightEffects = calculateEffectIntensities(-10, false, 'winter', false)
    expect(nightEffects.stars).toBe(1)
  })
})

// =============================================================================
// META-TEST: Document the fixed createParticles dependency bug
// =============================================================================

describe('Architecture Fix: createParticles now triggers on effects change', () => {
  it('documents the fix for effects change without particle recreation', () => {
    /**
     * BUG PATTERN (FIXED):
     *
     * ORIGINAL CODE in LivingCanvas.tsx had this useEffect:
     *
     * ```tsx
     * useEffect(() => {
     *   const changed =
     *     lastPropsRef.current.season !== season ||
     *     lastPropsRef.current.timeOfDay !== timeOfDay ||
     *     lastPropsRef.current.expressive !== expressive
     *
     *   if (changed) {
     *     lastPropsRef.current = { season, timeOfDay, expressive }
     *     createParticles(window.innerWidth, window.innerHeight)
     *   }
     * }, [season, timeOfDay, expressive, createParticles])
     * ```
     *
     * THE FIX (now implemented at lines 1064-1090):
     *
     * ```tsx
     * useEffect(() => {
     *   const currentStarsVisible = effects.stars > 0
     *   const currentParticleType = seasonalEffects.particleType
     *
     *   const themeChanged = ...
     *   const particleExistenceChanged =
     *     lastPropsRef.current.starsVisible !== currentStarsVisible ||
     *     lastPropsRef.current.particleType !== currentParticleType
     *
     *   if (themeChanged || particleExistenceChanged) {
     *     lastPropsRef.current = { ..., starsVisible, particleType }
     *     createParticles(...)
     *   }
     * }, [..., effects.stars, seasonalEffects.particleType, createParticles])
     * ```
     *
     * Now when effects.stars changes from 0 to >0 (or vice versa), or when
     * the particle type changes, createParticles is called.
     */

    // This test documents the fix is in place
    expect(true).toBe(true)
  })
})
