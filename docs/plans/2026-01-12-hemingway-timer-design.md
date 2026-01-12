# Hemingway Timer Redesign

> "Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water."

## Overview

A complete redesign of the timer tab experience, moving from utility (measuring a task) to experience (holding a space). The UI becomes a meditation object itself—direct, unadorned, breathing.

## Design Philosophy

**Hemingway Aesthetic:** No labels, no colons, no units. The format speaks through spacing, weight, and opacity. Time is presented as significant without being clinical.

**The Timer Tab as Home:** Users arrive here, practice here, return here, rest here. Navigation away is their choice, never forced.

**Time as Continuity:** Session time doesn't "end"—it returns to the whole. The visual language reinforces that each session is a drop rejoining water.

---

## Flow Architecture

### App Launch Sequence

```
App Opens → Zen Message Cutscene → Dissolves → Cumulative Timer (breathing)
```

1. Screen opens to solid background (`--bg-base`)
2. 300ms pause
3. Zen message fades in word-by-word (existing `ZenMessage` animation)
4. Words hold for 1.5s after last word lands
5. Message exhales: scale 0.95, opacity → 0
6. Cumulative timer inhales through dissolving words: scale 0.9 → 1.0, opacity 0 → 1
7. Timer enters idle breathing state (4-4-4-4 box breathing)

### Zen Message Logic

| State                           | Message                                        |
| ------------------------------- | ---------------------------------------------- |
| No goal defined                 | "Before enlightenment, chop wood, carry water" |
| Goal in progress                | "Before enlightenment, chop wood, carry water" |
| Goal achieved (no new goal set) | "After enlightenment, chop wood, carry water"  |
| New goal set after completion   | Reverts to "Before..."                         |

The "After enlightenment" state is a **resting place**—acknowledgment of arrival. Setting a new goal returns you to the path.

---

## Typography System

### Cumulative Display (Idle State)

**Format:** `12 34` — hours and minutes separated by whitespace

| Element | Size                  | Weight | Opacity | Notes            |
| ------- | --------------------- | ------ | ------- | ---------------- |
| Hours   | `text-display` (72px) | 600    | 100%    | The anchor       |
| Spacer  | 0.5em                 | —      | —       | Wide kerning gap |
| Minutes | 0.85em of hours       | 300    | 60%     | Secondary        |

**Sub-hour edge case:** If total < 1 hour, display only minutes: `34` (centered, styled as hours would be)

**Technical requirements:**

- `font-variant-numeric: tabular-nums` (prevents jitter)
- Existing font stack (Palatino for numbers)
- Centered vertically and horizontally

### Active Timer (Running State)

**The Stream:** Time expands as it accumulates. Display grows from seconds → minutes → hours.

| Duration | Display   | Layout                    |
| -------- | --------- | ------------------------- |
| 0-59 sec | `27`      | Seconds only, centered    |
| 1-59 min | `1 27`    | Minutes + seconds         |
| 1+ hour  | `1 34 27` | Hours + minutes + seconds |

**Opacity Hierarchy (The Fading Tail):**

| Unit                                     | Opacity | Rationale                        |
| ---------------------------------------- | ------- | -------------------------------- |
| Largest (hours if present, else minutes) | 100%    | The anchor, where the eye lands  |
| Middle (minutes when hours exist)        | 50%     | Context without competition      |
| Seconds                                  | 25%     | Whisper of motion, proof of life |

**Sizing Hierarchy:**

- Largest unit: Full size (`text-display`)
- Each smaller unit: 0.85em of the previous

**Spacing:** Same 0.5em gap between all units (consistent with cumulative view)

**Why ghosted seconds work:** User opens eyes, sees `1 34 27`. Eye goes to `1` and `34`. The `27` is barely there—motion without anxiety.

---

## Transitions

### Start Transition (Tap Cumulative → Timer Begins)

**Duration:** ~600ms total

1. **Exhale** (400ms): Cumulative scales to 0.95, opacity → 0
2. **Pause** (200ms): Stillness—the threshold
3. **Inhale** (400ms): First second (`1`) fades in, scale 0.9 → 1.0
4. Timer is now running, stream expands naturally

**Easing:** `--ease-organic: cubic-bezier(0.34, 1.56, 0.64, 1)`

### Stop Transition (Tap Active → Session Merges)

**Duration:** ~2-3 seconds (synced to chime if enabled)

1. **Freeze**: Timer stops, holds final value (e.g., `34 27`)
2. **Rise** (800ms): Session value drifts upward, shrinks
   - Scale: 1.0 → 0.6
   - Translate Y: 0 → -30px
   - Opacity: 1 → 0
3. **Merge** (simultaneous): New cumulative total fades in beneath
   - Scale: 0.95 → 1.0
   - Opacity: 0 → 1
4. **Settle** (400ms): Cumulative breathes once (scale 1.0 → 1.02 → 1.0)
5. **Chime**: Plays during settle (if enabled)
6. **Modal** (300ms): Insight capture slides up, overlaying timer tab

**The feeling:** Session doesn't end—it returns. Time rejoins all time. One drop, back into water.

---

## Idle Breathing Animation

**When:** Cumulative display at rest (post-session, or waiting to begin)

**Pattern:** 4-4-4-4 box breathing (16-second cycle)

| Phase  | Duration | Transform                             |
| ------ | -------- | ------------------------------------- |
| Inhale | 4s       | Scale 1.0 → 1.03, subtle opacity lift |
| Hold   | 4s       | Rest at expanded                      |
| Exhale | 4s       | Scale 1.03 → 1.0                      |
| Hold   | 4s       | Rest at neutral                       |

**Purpose:** The numbers become a meditation object. Users can sit with them, match breath to them, or simply watch. The timer tab is alive even at rest.

---

## Post-Session Flow

**Critical principle:** User stays on timer tab. No forced navigation.

1. Merge completes → cumulative visible
2. Modal slides up _on timer tab_ (cumulative dimmed behind)
3. User chooses:
   - **Capture**: Voice-to-text opens, they speak, saves, modal closes
   - **Skip**: Modal closes immediately
   - **Maybe Later**: Modal closes, subtle indicator for uncaptured insight
4. User remains on timer tab, cumulative breathing
5. Navigate away at their own pace

**Chime synchronization:** Total transition (freeze → merge → settle → modal rise) should align with chime duration (~2-3 seconds).

---

## State Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         APP LAUNCH                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ZEN MESSAGE CUTSCENE                        │
│         "Before/After enlightenment, chop wood..."              │
│                   (word-by-word fade in)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                        (dissolves)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CUMULATIVE (IDLE)                          │
│                          12 34                                  │
│                   (4-4-4-4 breathing)                           │
│                                                                 │
│                        [tap to start]                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                      (exhale → pause → inhale)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ACTIVE (RUNNING)                           │
│                        1 34 27                                  │
│              (100%) (50%) (25%) opacity                         │
│                                                                 │
│                        [tap to stop]                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                    (freeze → rise → merge)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CUMULATIVE (MERGED)                          │
│                          12 45                                  │
│                    (settle + breathe)                           │
│                        + chime                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                       (modal rises)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      INSIGHT CAPTURE                            │
│                  (modal over timer tab)                         │
│                                                                 │
│            [Capture]    [Skip]    [Maybe Later]                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                       (modal closes)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CUMULATIVE (REST)                          │
│                          12 45                                  │
│                   (4-4-4-4 breathing)                           │
│                                                                 │
│              [tap to start another session]                     │
│              [navigate away when ready]                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation Notes

### Files to Modify

| File                                          | Changes                                                      |
| --------------------------------------------- | ------------------------------------------------------------ |
| `src/components/Timer.tsx`                    | New typography, transition choreography, breathing animation |
| `src/components/ZenMessage.tsx`               | Add `onComplete` callback, conditional message logic         |
| `src/lib/format.ts`                           | New `formatHemingway()` function for spacer-based display    |
| `src/index.css`                               | New keyframes for merge transition, 4-4-4-4 breathing        |
| `src/stores/useSessionStore.ts`               | Track goal completion state for zen message                  |
| New: `src/components/InsightCaptureModal.tsx` | Post-session modal component                                 |

### Animation Constants

```typescript
// Transition timings
const TRANSITION_EXHALE = 400 // ms
const TRANSITION_PAUSE = 200 // ms
const TRANSITION_INHALE = 400 // ms
const MERGE_RISE = 800 // ms
const MERGE_SETTLE = 400 // ms
const MODAL_SLIDE = 300 // ms

// Breathing (box breathing 4-4-4-4)
const BREATH_INHALE = 4000 // ms
const BREATH_HOLD_IN = 4000 // ms
const BREATH_EXHALE = 4000 // ms
const BREATH_HOLD_OUT = 4000 // ms
const BREATH_CYCLE = 16000 // ms total

// Easing
const EASE_ORGANIC = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
```

### Accessibility

- Respect `prefers-reduced-motion`: disable breathing, use instant transitions
- Maintain sufficient contrast in opacity hierarchy (25% seconds still readable)
- Chime has visual indicator for users with audio disabled

---

## Open Questions

1. **Chime duration:** What is the current chime length? Transitions should sync.
2. **Maybe Later indicator:** What visual treatment for uncaptured insights?
3. **Goal state persistence:** Where is goal completion state stored currently?

---

## Success Criteria

- [ ] Opening cutscene plays on every app launch
- [ ] Zen message changes based on goal state
- [ ] Cumulative display uses Hemingway typography (no labels/colons)
- [ ] Active timer expands progressively with opacity hierarchy
- [ ] Start transition: exhale → pause → inhale sequence
- [ ] Stop transition: freeze → rise → merge → settle
- [ ] Chime syncs with merge transition
- [ ] Insight modal appears on timer tab (no navigation)
- [ ] Idle state breathes with 4-4-4-4 box breathing
- [ ] User remains on timer tab after session
