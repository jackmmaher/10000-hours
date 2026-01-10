# Living Theme Bug Patterns Analysis

**Status: FIXED** - All identified bugs have been resolved.

## Summary

This document identifies architectural bug patterns in the Living Theme system that caused "technically correct but visually wrong" output - where code ran without errors but particles/effects didn't render when they should.

## Test Coverage

See: `src/components/__tests__/LivingCanvas.invariants.test.ts`

The invariant tests verify data flow conditions that must be true for visual output to work correctly, without requiring visual inspection.

---

## Bug Pattern 1: Particle Creation vs Rendering Disconnection

**Location**: `LivingCanvas.tsx` lines 217-274, 1057-1068

**The Problem**:
- `createParticles()` is called when season/timeOfDay/expressive change
- Particles are created based on `effects.stars > 0` threshold
- But `effects` can change independently (e.g., manual theme switch)
- The `render()` loop reads from `effectsRef.current` but operates on stale particle array

**Example Scenario**:
```
T1: User in daytime mode
    - effects.stars = 0
    - createParticles() creates 0 star particles
    - particlesRef.current = []

T2: User switches to night (manual mode)
    - effects.stars = 1
    - season/timeOfDay DIDN'T change (still "winter" / "night" preset)
    - createParticles() NOT called (guard check fails)
    - particlesRef.current = [] (still empty!)
    - render() runs: effectsRef.current.stars = 1
    - But no particles exist → nothing renders
```

**Root Cause**: The useEffect guard at lines 1057-1068 only triggers recreation on season/timeOfDay/expressive change, not on effects value changes:

```tsx
useEffect(() => {
  const changed =
    lastPropsRef.current.season !== season ||
    lastPropsRef.current.timeOfDay !== timeOfDay ||
    lastPropsRef.current.expressive !== expressive

  if (changed) {  // <-- This guard ignores effects changes!
    lastPropsRef.current = { season, timeOfDay, expressive }
    createParticles(window.innerWidth, window.innerHeight)
  }
}, [season, timeOfDay, expressive, createParticles])
```

**Fix Options**:
1. Include effects values in the change detection
2. Separate particle existence from particle opacity (always create, modulate alpha)
3. Use effects values in particle count calculation inside render loop

---

## Bug Pattern 2: Threshold Mismatches

**Locations**: Multiple thresholds across creation and rendering

| Context | Threshold | Line |
|---------|-----------|------|
| Star creation | `effects.stars > 0` | 222 |
| Aurora rendering | `effects.stars > 0.5` | 423 |
| Seasonal particles | `intensity >= 0.1` | 249 |
| Moon rendering | `intensity < 0.05` (early return) | 889 |

**The Problem**:
When `effects.stars = 0.3`:
- Stars ARE created (passes > 0 check)
- Aurora does NOT render (fails > 0.5 check)

This may be intentional (stars appear before aurora) but creates a "gap zone" where behavior is inconsistent.

**Fix Options**:
1. Document thresholds as intentional design
2. Unify thresholds into constants
3. Create a threshold config object

---

## Bug Pattern 3: Stale Closure in Animation Loop (Previously Fixed)

**Location**: `LivingCanvas.tsx` lines 210-214

**The Problem** (was):
- `render()` callback captured `effects` and `seasonalEffects` in closure
- When props changed, closure still had old values
- Render used stale values even though React received new props

**The Fix** (implemented):
```tsx
// Keep effects in a ref so render functions always use current values
const effectsRef = useRef(effects)
const seasonalEffectsRef = useRef(seasonalEffects)
effectsRef.current = effects
seasonalEffectsRef.current = seasonalEffects
```

Render functions now use `effectsRef.current.stars` instead of `effects.stars`.

---

## Bug Pattern 4: Sun/Moon Overlap During Twilight (Previously Fixed)

**Location**: `LivingCanvas.tsx` lines 893-898

**The Problem** (was):
- Both sun and moon rendered at fixed position (82%, 14%)
- During twilight (sun altitude between -6° and 6°), both visible at same spot

**The Fix** (implemented):
```tsx
const sunVisible = sunAltitude > -6
const moonX = sunVisible ? w * 0.72 : w * 0.82
const moonY = sunVisible ? h * 0.22 : h * 0.14
```

---

## Architectural Observations

### The Core Tension

The Living Theme system has two competing models:

1. **Continuous Solar Model** (auto mode): Effects smoothly interpolate based on sun altitude
2. **Discrete Preset Model** (manual mode): Effects jump to fixed values per time-of-day

The particle system was built for continuous updates but the prop change detection assumes discrete changes.

### Data Flow Diagram

```
Props Change
    ↓
┌───────────────────┐
│ useEffect guard   │ ← Only triggers on season/time/expressive
│ (lines 1057-1068) │
└─────────┬─────────┘
          ↓ (if changed)
┌───────────────────┐
│ createParticles() │ ← Uses effects.stars at creation time
└─────────┬─────────┘
          ↓
┌───────────────────┐
│ particlesRef      │ ← Particles frozen until next createParticles()
└─────────┬─────────┘
          ↓ (every frame)
┌───────────────────┐
│ render()          │ ← Uses effectsRef.current (current effects)
│ → renderStar()    │   but iterates stale particlesRef
└───────────────────┘
```

The bug occurs when props change → createParticles NOT called → particles don't match effects.

---

## Fixes Implemented

### 1. Particle Creation Guard (FIXED)

**File:** `LivingCanvas.tsx` lines 207-214, 1064-1090

The useEffect now tracks `starsVisible` (effects.stars > 0) and `particleType` in `lastPropsRef`:

```tsx
const lastPropsRef = useRef({
  season,
  timeOfDay,
  expressive,
  starsVisible: effects.stars > 0,
  particleType: seasonalEffects.particleType
})
```

And the useEffect checks for particle existence changes:

```tsx
useEffect(() => {
  const currentStarsVisible = effects.stars > 0
  const currentParticleType = seasonalEffects.particleType

  const themeChanged = ...
  const particleExistenceChanged =
    lastPropsRef.current.starsVisible !== currentStarsVisible ||
    lastPropsRef.current.particleType !== currentParticleType

  if (themeChanged || particleExistenceChanged) {
    lastPropsRef.current = { ..., starsVisible, particleType }
    createParticles(...)
  }
}, [..., effects.stars, seasonalEffects.particleType, createParticles])
```

### 2. Threshold Design Documented (DONE)

Added comments at `LivingCanvas.tsx` lines 223-231 explaining the intentional threshold differences:
- Stars: created when effects.stars > 0 (begin appearing at golden hour)
- Seasonal particles: created when intensity >= 0.1 (prevents sparse fields)
- Aurora: renders when effects.stars > 0.5 (deeper night only, dramatic effect)

---

## Test Verification

Run:
```bash
npm test -- --run src/components/__tests__/LivingCanvas.invariants.test.ts
```

All 20 tests pass. Console output now shows:
- "BUG SCENARIO (now fixed)" - acknowledging the fix is in place
- "THRESHOLD GAP" - documenting the intentional threshold differences
