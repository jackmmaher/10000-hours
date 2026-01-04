# Addendum: Ghibli-Grade Tree Rendering & Coding Guidance

**Document Role:** Second Technical–Aesthetic Addendum  
**Applies To:** `ROADMAP.md` and `ROADMAP-CHIEF-SOFTWARE-DESIGNER-REVIEW.md`  
**Purpose:** Ensure the Garden tree achieves a *genuine Ghibli feel* while remaining fully compatible with the approved roadmap, tooling, and deployment targets (GitHub + Vercel).

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
  - Required for sync, rewind, and Year Summary

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

## 10. Spirit Integration (Consistency Rule)

If Spirit remains CSS‑based (per roadmap):
- Match color temperature to tree output
- Sync idle rhythm with tree noise clock
- Apply subtle blur / warmth filter

**Preferred (optional, still compliant):**
- Render Spirit sprites *inside p5 canvas* using `p.image()`

No architectural change required.

---

## 11. Determinism & Year Summary Compatibility

This addendum preserves all requirements for:
- Tree rewind
- Growth scrubbing
- Year Summary replay

Because:
- Structure = deterministic
- Aesthetic modulation = bounded + seed‑based

Replay uses the same seeds → same feel.

---

## 12. Testing Checklist (Add to Phase 5b / 5c)

### Visual Tests
- Adjacent growth levels feel different *emotionally*, not just structurally
- Tree looks alive even when not changing
- Older trees move less than younger ones

### Anti‑Patterns to Reject
- Perfect symmetry
- Continuous motion everywhere
- Noticeable animation loops
- Instant visual feedback to numeric change

---

## 13. Final Verdict

With this addendum applied:
- The existing roadmap remains intact
- The chief designer’s concerns are directly addressed
- The tree can achieve a **genuine Ghibli feel**, not a procedural imitation

> The math grows the tree.  
> The aesthetic layer gives it a soul.

This document should be treated as **binding guidance** for Garden implementation.