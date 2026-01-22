# Aum Coach Redesign: Guided Practice with Gradient Feedback

**Date:** 2026-01-21
**Status:** Approved for implementation

## Overview

Transform the current Om Coach into a more intuitive guided practice experience with:

- Three timing modes (Traditional, Extended, Flexible)
- Count-up timer (not countdown)
- Gradient-based frequency feedback showing proximity to 130 Hz
- Per-phoneme alignment scoring
- Prominent cycle progress tracking
- Rename to "Aum Coach" throughout UI

## Problem Statement

Current issues identified during testing:

1. **Binary feedback** - 129 Hz looks identical to 50 Hz (both "not in range")
2. **Countdown timer** - Should count UP like the Timer tab
3. **Cycle visibility** - Hard to know how many cycles done/remaining
4. **Timing feels rushed** - 2.5s for Ah and Oo is too quick
5. **Terminology** - Should be "Aum" not "Om"

## Design Specification

### 1. Three Timing Modes

| Mode                      | Ah          | Oo          | Mm          | Breathe          | Total   | How it ends                       |
| ------------------------- | ----------- | ----------- | ----------- | ---------------- | ------- | --------------------------------- |
| **Traditional (1:1:2)**   | 3s          | 3s          | 6s          | 4s               | 16s     | Timer-driven                      |
| **Extended**              | 4s          | 4s          | 8s          | 4s               | 20s     | Timer-driven                      |
| **Flexible (Self-Paced)** | User-driven | User-driven | User-driven | Detected silence | ~15-30s | Phoneme detection (A→U→M→silence) |

**Flexible mode uses existing phoneme detection** (`usePhonemeDetection.ts`) which already tracks:

- Spectral centroid to classify A (>550 Hz), U (250-550 Hz), M (<250 Hz)
- Cycle state machine: `idle → a → u → m → silence = cycle complete`

### 2. Session Structure

Duration sessions still apply:

- 5 min = target ~18 cycles (Traditional) / ~15 cycles (Extended) / variable (Flexible)
- 10 min = target ~37 cycles (Traditional) / ~30 cycles (Extended) / variable (Flexible)
- 15 min = target ~56 cycles (Traditional) / ~45 cycles (Extended) / variable (Flexible)

**For Flexible mode:** No fixed cycle count target. Session ends by timer, cycles are counted as completed.

### 3. UI Layout During Practice

```
┌─────────────────────────────────────────┐
│  [Cancel]      Aum Coach        [End]   │
├─────────────────────────────────────────┤
│                                         │
│            ⏱ 2:34 / 5:00               │  ← Count-up / total
│                                         │
│         ┌─────────────────────┐         │
│        │    CIRCULAR RING     │         │  ← Cycle progress
│        │                      │         │
│        │      127 Hz          │         │  ← Frequency (color = proximity)
│        │      (97%)           │         │  ← Accuracy percentage
│        │       Oo             │         │  ← Current phoneme
│        │                      │         │
│         └─────────────────────┘         │
│                                         │
│    ════════════●════════════════════    │  ← Gradient frequency scale
│    100    115   127  130   145    160   │
│                                         │
│         Cycle 3 of 18                   │  ← Prominent counter
│         ████████░░░░░░░░░░░░           │  ← Visual progress bar
│                                         │
└─────────────────────────────────────────┘
```

### 4. Gradient Frequency Scale

**Color mapping based on distance from 130 Hz:**

| Distance  | Color         | Label          |
| --------- | ------------- | -------------- |
| 0 Hz      | Bright green  | Perfect        |
| ±1-5 Hz   | Green         | Excellent      |
| ±6-10 Hz  | Yellow-green  | Good           |
| ±11-20 Hz | Yellow/Orange | Close          |
| ±21-30 Hz | Orange/Muted  | Keep adjusting |
| ±31+ Hz   | Gray/Muted    | Find it        |

**Visual elements:**

1. **Scale track** has subtle gradient showing "hot zone" around 130 Hz
2. **Indicator dot** changes color based on proximity
3. **Accuracy percentage** displayed: "127 Hz (97%)"
4. **Glow intensity** increases as user approaches 130 Hz

**Accuracy calculation:**

```typescript
const accuracy = Math.max(0, 100 - (Math.abs(frequency - 130) / 30) * 100)
// 130 Hz = 100%
// 127 Hz = 90%
// 120 Hz = 67%
// 100 Hz = 0%
```

### 5. Per-Phoneme Alignment Scoring

Track time spent within ±10 Hz of 130 Hz for each phoneme separately:

```typescript
interface PhonemeAlignment {
  ah: { totalMs: number; inRangeMs: number }
  oo: { totalMs: number; inRangeMs: number }
  mm: { totalMs: number; inRangeMs: number }
}

// Calculate percentage
const ahAlignment = (ah.inRangeMs / ah.totalMs) * 100
```

**Weighting for overall score:**

- Mm weighted higher (longer duration, more important for NO production)
- Formula: `overall = (ah * 0.25) + (oo * 0.25) + (mm * 0.50)`

### 6. Results Screen

```
┌─────────────────────────────────────┐
│         Session Complete            │
│                                     │
│    Duration: 5:12                   │
│    Cycles: 14 of 18 (78%)          │
│                                     │
│    ─────────────────────────        │
│    Alignment Breakdown              │
│                                     │
│    Ah   ████████░░  78%            │
│    Oo   █████████░  85%            │
│    Mm   ██████████  94%            │
│                                     │
│    Overall Score: 87%              │
│    ─────────────────────────        │
│                                     │
│    [Practice Again]  [Done]         │
└─────────────────────────────────────┘
```

### 7. Terminology Changes

| Current            | New                     |
| ------------------ | ----------------------- |
| Om Coach           | Aum Coach               |
| "Om chanting"      | "Aum chanting"          |
| Header title       | "Aum Coach"             |
| Setup instructions | "Guided A-U-M practice" |

Internal folder name (`OmCoach/`) remains unchanged for simplicity.

## Technical Implementation

### Files to Modify

1. **`src/hooks/useGuidedOmCycle.ts`**
   - Add timing mode support (traditional/extended/flexible)
   - Integrate phoneme detection for flexible mode cycle completion
   - Track per-phoneme alignment data

2. **`src/components/OmCoach/FrequencyScale.tsx`**
   - Implement gradient color system
   - Add accuracy percentage display
   - Add glow effect based on proximity

3. **`src/components/OmCoach/OmCoachSetup.tsx`**
   - Add timing mode selector
   - Update copy to "Aum"
   - Show different cycle estimates per mode

4. **`src/components/OmCoach/OmCoachPractice.tsx`**
   - Change countdown to count-up timer
   - Add cycle progress bar
   - Display accuracy percentage in center
   - Update header to "Aum Coach"

5. **`src/components/OmCoach/CircularProgress.tsx`**
   - Integrate gradient color for frequency display

6. **`src/components/OmCoach/OmCoachResults.tsx`**
   - Add per-phoneme alignment breakdown
   - Show alignment bars for Ah/Oo/Mm
   - Calculate and display overall weighted score

7. **`src/components/OmCoach/index.tsx`**
   - Update header title to "Aum Coach"
   - Wire up new timing mode state

### New Types

```typescript
type TimingMode = 'traditional' | 'extended' | 'flexible'

interface TimingConfig {
  breathe: number // ms
  ah: number // ms
  oo: number // ms
  mm: number // ms
}

const TIMING_CONFIGS: Record<TimingMode, TimingConfig> = {
  traditional: { breathe: 4000, ah: 3000, oo: 3000, mm: 6000 },
  extended: { breathe: 4000, ah: 4000, oo: 4000, mm: 8000 },
  flexible: { breathe: 0, ah: 0, oo: 0, mm: 0 }, // Phoneme-driven
}

interface PhonemeAlignmentData {
  ah: { totalMs: number; inRangeMs: number }
  oo: { totalMs: number; inRangeMs: number }
  mm: { totalMs: number; inRangeMs: number }
}
```

## Verification Checklist

- [ ] Three timing modes selectable on setup screen
- [ ] Timer counts UP (0:00 → 5:00), not down
- [ ] Cycle counter shows "Cycle X of Y" with progress bar
- [ ] Frequency scale shows gradient colors based on proximity
- [ ] Accuracy percentage displayed (e.g., "127 Hz (97%)")
- [ ] Flexible mode advances phases based on detected phonemes
- [ ] Results show per-phoneme alignment breakdown
- [ ] All "Om" references changed to "Aum"
- [ ] Session time still tracked and deducted from hour bank

## Open Questions (Resolved)

- **Flexible mode cycle target?** → No target, just count completed cycles
- **What if user can't hit 130 Hz?** → Still beneficial at ±20 Hz, show encouraging feedback
- **Glow effect performance?** → CSS only, no canvas needed
