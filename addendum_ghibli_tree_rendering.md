# Addendum: Ghibli-Grade Tree Rendering & Coding Guidance

**Document Role:** Second Technical–Aesthetic Addendum
**Applies To:** `ROADMAP.md` and `ROADMAP-CHIEF-SOFTWARE-DESIGNER-REVIEW.md`
**Purpose:** Ensure the Garden tree achieves a *genuine Ghibli feel* while remaining fully compatible with the approved roadmap, tooling, and deployment targets (GitHub + Vercel).

**Updated January 2026:** Scope simplified — Spirit companion removed, Year Summary removed. Added 16 visual states (Season × Time of Day) and multiplicative growth algorithm.

---

## 1. Scope & Non‑Goals

### In Scope
- Visual and animation guidance for the **Tree** (Garden core feature)
- Coding recommendations that *extend* the existing p5.js + React plan
- Techniques deployable in:
  - GitHub (versioned, testable, reviewable)
  - Vercel (client‑side rendering, no exotic build steps)

### Explicit Non‑Goals
- No replacement of p5.js
- No new rendering engines (no Unity, no Three.js, no WebGPU)
- No graph databases or backend changes
- No aesthetic drift away from the Miyazaki / Ghibli reference

This addendum **works with the roadmap, not against it**.

---

## 2. What “Ghibli Feel” Means (Operational Definition)

For implementation purposes, *Ghibli feel* is defined as the simultaneous presence of:

1. **Intentional Imperfection**  
   Nothing is perfectly symmetric, evenly spaced, or mathematically optimal.

2. **Life-Implied Motion**  
   Motion suggests breath, wind, weight, or attention — not animation loops.

3. **Memory Over Metrics**  
   The tree feels *aged* and *remembering*, not merely progressing.

4. **Permission for Stillness**  
   The system must allow moments where nothing changes.

These qualities must be *engineered*, not hoped for.

---

## 3. Architectural Principle (Critical)

> **The tree renderer must be deterministic in structure, but non-deterministic in expression.**

- **Deterministic:**
  - Same `totalHours` → same *structural tree*
  - Same aesthetic seed → same visual character
  - Required for consistent user experience across sessions

- **Non-deterministic (within bounds):**
  - Micro‑motion
  - Timing offsets
  - Small asymmetries

This preserves roadmap guarantees *and* visual warmth.

---

## 4. Recommended Rendering Stack (No Changes to Tooling)

### Keep (as per roadmap)
- `p5.js` (instance mode)
- React wrapper (`TreeCanvas.tsx`)
- Deterministic L‑system grammar

### Add (lightweight, internal only)
- **Aesthetic Modulation Layer** (pure functions)
- **Motion Noise Utilities** (Perlin / Simplex via p5)

No new dependencies required.

---

## 5. The Aesthetic Modulation Layer (Key Addition)

### Concept
Introduce a *single, explicit layer* whose sole job is to **break visual perfection**.

This layer:
- Never affects growth math
- Never affects stored state
- Never affects determinism of structure

It only affects *how* things are drawn.

### File Recommendation
```
src/lib/aesthetic.ts
```

### Example Responsibilities
- Slight branch angle bias
- Persistent trunk lean
- Uneven leaf clustering
- Minor color temperature drift

### Example Interface
```ts
export interface AestheticProfile {
  trunkLean: number;        // radians
  branchJitter: number;     // small angle offset
  leafDensityBias: number; // -0.1 → +0.1
  colorWarmthShift: number;// -5 → +5 (HSL)
}

export function createAestheticProfile(seed: number): AestheticProfile;
```

- Seeded once per user
- Stored locally if needed
- Never recalculated per frame

This creates *character*.

---

## 6. L‑System Usage: Required Constraints

L‑systems are retained, **but must be constrained**.

### Required Rules

1. **Break Symmetry Explicitly**
   - Apply asymmetric angle offsets per branch depth
   - Never mirror branches perfectly

2. **Limit Iteration Visibility**
   - Do not expose iteration jumps directly
   - Hide structural changes behind post‑session animation

3. **Favor Fewer, Heavier Branches**
   - Especially after ~50% growth
   - Ghibli trees feel weighted, not fractal

This aligns with review concerns about imperceptible micro‑states.

---

## 7. Motion Design Rules (Non‑Negotiable)

### Idle Motion
- Driven by **noise**, not sine waves
- Period: 6–12 seconds (never perfectly looping)
- Amplitude decreases as tree matures

```ts
const sway = noise(frameCount * 0.001) * maturityFactor;
```

### Post‑Session Growth
Growth is **revealed**, not shown.

Order:
1. Environmental cue (light, warmth)
2. Leaf / branch response
3. Structural settle
4. Return to stillness

Never animate geometry first.

---

## 8. Stillness Budget (Explicitly Required)

The renderer **must allow frames where nothing changes**.

Implementation rule:
- At least **20–30% of idle frames** should have zero visible motion

This is essential for calm and presence.

---

## 9. Color & Texture Guidance

### Color
- Use **warm-biased palettes** only
- Avoid pure greens
- Drift hue subtly with age (older = warmer, duskier)

### Texture (Cheap but Effective)
- Add light grain/noise overlay via p5
- Opacity < 3%
- Applied uniformly to canvas

This removes digital flatness without cost.

---

## 10. 16 Visual States (Season × Time of Day)

> **NEW for v1.0:** The tree displays differently based on real-world season and time.

### Visual State Matrix

|           | Morning | Day | Evening | Night |
|-----------|---------|-----|---------|-------|
| **Spring** | Fresh greens, soft mist | Bright, full light | Golden warmth | Blue-silver, quiet |
| **Summer** | Warm gold light | Deep greens, dappled | Amber glow | Fireflies, warm dark |
| **Autumn** | Misty orange | Rich reds/golds | Deep amber | Cool, crisp |
| **Winter** | Pale blue dawn | Stark, clear | Purple twilight | Snow, starlight |

### Implementation Notes

- **Season detection:** Derived from device date
  - Spring: March–May
  - Summer: June–August
  - Autumn: September–November
  - Winter: December–February

- **Time of day detection:** Derived from device clock
  - Morning: 5am–10am
  - Day: 10am–5pm
  - Evening: 5pm–9pm
  - Night: 9pm–5am

- **Palette application:** Apply as color filters/adjustments to base tree, not separate assets
- **Transition:** When time changes during viewing, transition smoothly (2-3 seconds)

### Ghibli Alignment

This feature embodies the Ghibli principle of **environmental awareness**. The tree exists in a world with weather and light, not a static void.

---

## 11. Multiplicative Growth Expression

> **NEW for v1.0:** Growth rewards frequency and consistency, not just duration.

### The Algorithm

```typescript
effectiveGrowth = baseHours × frequencyMultiplier × streakMultiplier × progressBonus
```

| Factor | Calculation | Cap |
|--------|-------------|-----|
| **Base** | Hours logged | N/A |
| **Frequency** | 1 + (sessionsThisWeek × 0.07) | 1.5× at 7+ sessions |
| **Streak** | 1 + (consecutiveDays × 0.007) | 1.2× at 30+ days |
| **Progress** | Bonus if median duration trending up | 1.1× |

### Visual Expression of Multipliers

The multiplicative bonuses should be *felt*, not just calculated:

- **High frequency (daily practice):**
  - Leaves appear fuller, denser
  - Subtle golden shimmer in light

- **Long streak:**
  - Trunk appears stronger, more textured
  - Deeper color saturation

- **Progress bonus (growing sessions):**
  - New growth appears more vibrant
  - Fresh leaves at branch tips

These visual cues reward consistent practice without explicit gamification.

---

## 12. Determinism & Consistency

This addendum preserves all requirements for consistent rendering:
- Structure = deterministic (same hours → same tree)
- Aesthetic modulation = bounded + seed‑based (same seed → same character)
- Visual state = derived from real time (reproducible from timestamp)

Users always see "their" tree.

---

## 13. Testing Checklist (Add to Phase 4)

### Visual Tests
- Adjacent growth levels feel different *emotionally*, not just structurally
- Tree looks alive even when not changing
- Older trees move less than younger ones
- **16 Visual States:** Tree looks different at morning vs night
- **16 Visual States:** Tree looks different in winter vs summer
- **Multiplier Expression:** Daily practice produces visually richer tree
- **Multiplier Expression:** Long streaks produce stronger-looking trunk

### Anti‑Patterns to Reject
- Perfect symmetry
- Continuous motion everywhere
- Noticeable animation loops
- Instant visual feedback to numeric change
- Jarring transitions between visual states

---

## 14. Final Verdict

With this addendum applied:
- The existing roadmap remains intact
- The chief designer's concerns are directly addressed
- The tree can achieve a **genuine Ghibli feel**, not a procedural imitation

**v1.0 scope changes (January 2026):**
- ~~Spirit companion~~ → Removed for v1.0
- ~~Year Summary compatibility~~ → Removed for v1.0
- **Added:** 16 visual states (Season × Time of Day)
- **Added:** Multiplicative growth expression

> The math grows the tree.
> The aesthetic layer gives it a soul.
> **The seasons and time give it presence in the world.**

This document should be treated as **binding guidance** for Garden implementation.