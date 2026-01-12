# Timer Animation Redesign: The Persistent Stage Architecture

## Problem Statement

The current timer animation is broken. When transitioning between states, the display flickers, shows overlapping values, and feels jarring. The root cause: `AnimatePresence` with a key that changes on every `transitionState` change causes 4-6 full component mount/unmount cycles per transition.

**Current flow (broken):**

```
User taps → key changes → component unmounts (fade out) →
new component mounts (fade in) → key changes again →
unmount/mount again → repeat 4x
```

**Target flow (Disney):**

```
User taps → container exhales → crossfade to active display →
container inhales → timer counts smoothly
```

One continuous motion. No destruction. No recreation. Just choreographed movement.

---

## Architecture: The Persistent Stage

### Core Principle

**The container never unmounts.** Both display layers (cumulative and active) exist simultaneously. Visibility is controlled by opacity animation, not by existence.

```
┌─────────────────────────────────────────────────────────┐
│  TimerStage (persistent motion.div)                     │
│  ├── scale, y controlled by animation phase            │
│  │                                                      │
│  │  ┌─────────────────────────────────────────────┐    │
│  │  │  Cumulative Layer (absolute positioned)      │    │
│  │  │  opacity: 1 when resting/resolving          │    │
│  │  │  opacity: 0 when active                      │    │
│  │  │  → HemingwayTime(totalSeconds, cumulative)  │    │
│  │  │  → or GooeyOrb(cumulative)                  │    │
│  │  └─────────────────────────────────────────────┘    │
│  │                                                      │
│  │  ┌─────────────────────────────────────────────┐    │
│  │  │  Active Layer (absolute positioned)          │    │
│  │  │  opacity: 0 when resting                     │    │
│  │  │  opacity: 1 when active                      │    │
│  │  │  → HemingwayTime(elapsed, active)           │    │
│  │  │  → or GooeyOrb(active)                      │    │
│  │  └─────────────────────────────────────────────┘    │
│  │                                                      │
│  └── Hint layer (tap to begin, tap to end)             │
└─────────────────────────────────────────────────────────┘
```

---

## Animation Phases

Six phases, but now they're **keyframes on a continuous timeline**, not discrete states that destroy and recreate:

| Phase        | Container                            | Cumulative Opacity | Active Opacity | Duration |
| ------------ | ------------------------------------ | ------------------ | -------------- | -------- |
| `resting`    | scale: 1, y: 0, breathing            | 1                  | 0              | —        |
| `departing`  | scale: 0.96                          | 1 → 0              | 0              | 400ms    |
| `arriving`   | scale: 0.96 → 1 (spring)             | 0                  | 0 → 1          | 400ms    |
| `active`     | scale: 1                             | 0                  | 1              | —        |
| `completing` | scale: 0.92, y: -12                  | 0                  | 1 → 0          | 500ms    |
| `resolving`  | scale: 0.92 → 1, y: -12 → 0 (spring) | 0 → 1              | 0              | 600ms    |

---

## Animation Timelines

### START Sequence (tap to begin session)

```
t=0ms     User taps
          ├─ Haptic: medium
          ├─ Phase: resting → departing
          ├─ Container: scale 1 → 0.96 (400ms, ease-out)
          └─ Cumulative: opacity 1 → 0 (400ms, ease-out)

t=350ms   Crossfade midpoint
          └─ Active layer begins fade: opacity 0 → 1

t=400ms   Phase: departing → arriving
          ├─ Container: scale 0.96 → 1 (spring settle, ~300ms)
          ├─ startTimer() called
          └─ Active shows "0", opacity rising to 1

t=700ms   Spring settles
          └─ Phase: arriving → active

t=700ms+  Timer counting: 1, 2, 3...
          └─ Active layer shows elapsed, container at rest
```

### STOP Sequence (tap to end session)

```
t=0ms     User taps
          ├─ Haptic: success
          ├─ Audio: completion chime
          ├─ stopTimer() called (saves session, updates totalSeconds)
          ├─ lastSessionDuration captured
          ├─ Phase: active → completing
          ├─ Container: scale 1 → 0.92, y: 0 → -12 (500ms, ease-out)
          └─ Active: opacity 1 → 0 (500ms)

t=400ms   Crossfade midpoint
          └─ Cumulative begins fade: opacity 0 → 1 (shows NEW total)

t=500ms   Phase: completing → resolving
          ├─ Container: scale 0.92 → 1, y: -12 → 0 (spring, ~500ms)
          └─ Cumulative: opacity rising to 1

t=1000ms  Spring settles with micro-overshoot

t=1100ms  Phase: resolving → resting
          ├─ Breathing animation resumes
          └─ Ready for insight modal (after 300ms delay)
```

---

## Spring Physics

Use the existing springs from `motion.ts`, refined:

```typescript
const springs = {
  // For inhale/resolve settle - gentle with slight overshoot
  settle: {
    type: 'spring',
    stiffness: 200,
    damping: 22, // slightly underdamped for micro-overshoot
    mass: 0.8,
  },

  // For breathing idle state
  breathe: {
    type: 'spring',
    stiffness: 100,
    damping: 20,
    mass: 1.2,
  },

  // For quick responses
  quick: {
    type: 'spring',
    stiffness: 400,
    damping: 35,
  },
}
```

**The settle spring is critical.** It should have a barely perceptible overshoot (scale goes to 1.008 before settling to 1.0). This creates the "arrive and settle" feeling of a precision instrument.

---

## Container Variants

```typescript
const stageVariants: Variants = {
  resting: {
    scale: 1,
    y: 0,
  },
  departing: {
    scale: 0.96,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
  arriving: {
    scale: 1,
    transition: springs.settle,
  },
  active: {
    scale: 1,
    transition: springs.quick,
  },
  completing: {
    scale: 0.92,
    y: -12,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
  resolving: {
    scale: 1,
    y: 0,
    transition: springs.settle,
  },
}
```

---

## Layer Opacity Logic

```typescript
function getLayerOpacity(phase: Phase): { cumulative: number; active: number } {
  switch (phase) {
    case 'resting':
      return { cumulative: 1, active: 0 }
    case 'departing':
      return { cumulative: 0, active: 0 } // cumulative fading out
    case 'arriving':
      return { cumulative: 0, active: 1 } // active fading in
    case 'active':
      return { cumulative: 0, active: 1 }
    case 'completing':
      return { cumulative: 0, active: 0 } // active fading out
    case 'resolving':
      return { cumulative: 1, active: 0 } // cumulative fading in
  }
}
```

The crossfade timing is handled by staggering when each layer starts its opacity animation. During `departing`, cumulative fades to 0. At t=350ms (before phase changes), active begins fading in. This creates an overlap where both are partially visible, which reads as a smooth morph.

---

## Display Values

Each layer always shows the correct value for its mode:

| Layer      | Value Source                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Cumulative | `totalSeconds` (from store, always current)                                                    |
| Active     | `elapsed` when phase is `active`, `0` when `arriving`, `lastSessionDuration` when `completing` |

```typescript
const activeDisplaySeconds = useMemo(() => {
  switch (phase) {
    case 'arriving':
      return 0
    case 'active':
      return elapsed
    case 'completing':
      return lastSessionDuration ?? 0
    default:
      return 0
  }
}, [phase, elapsed, lastSessionDuration])
```

---

## The Orchestration Hook

Central control for all animation timing:

```typescript
type Phase = 'resting' | 'departing' | 'arriving' | 'active' | 'completing' | 'resolving'

function useTimerOrchestration() {
  const [phase, setPhase] = useState<Phase>('resting')
  const { startTimer, stopTimer, elapsed, totalSeconds, lastSessionDuration } = useSessionStore()

  const beginSession = useCallback(() => {
    setPhase('departing')

    setTimeout(() => {
      setPhase('arriving')
      startTimer()

      setTimeout(() => {
        setPhase('active')
      }, 350)
    }, 400)
  }, [startTimer])

  const endSession = useCallback(() => {
    setPhase('completing')
    stopTimer()

    setTimeout(() => {
      setPhase('resolving')

      setTimeout(() => {
        setPhase('resting')
      }, 600)
    }, 500)
  }, [stopTimer])

  return {
    phase,
    beginSession,
    endSession,
    elapsed,
    totalSeconds,
    lastSessionDuration,
  }
}
```

---

## Breathing Animation

During `resting` phase, a subtle 16-second breathing cycle:

```css
@keyframes timerBreathe {
  0%,
  100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.015);
  }
  50% {
    transform: scale(1.015);
  }
  75% {
    transform: scale(1);
  }
}

.timer-breathing {
  animation: timerBreathe 16s ease-in-out infinite;
}
```

Apply via className when `phase === 'resting'`. When phase changes, the CSS animation is removed and Framer Motion takes over with spring physics.

**Important:** The breathing animation transforms from the current scale value, not from 1. This means if the user taps mid-breath at scale 1.01, the departing animation starts from 1.01 → 0.96, not from 1 → 0.96. This prevents a jarring snap.

---

## GooeyOrb Integration

GooeyOrb receives the same phase and adapts its blob animations:

| Phase        | Blob Behavior                                         |
| ------------ | ----------------------------------------------------- |
| `resting`    | Slow, gentle morphing (16s cycle synced to breathing) |
| `departing`  | Blobs contract toward center                          |
| `arriving`   | Blobs expand outward                                  |
| `active`     | Faster, more energetic morphing                       |
| `completing` | Blobs rise and disperse upward                        |
| `resolving`  | Blobs coalesce from above, settle into rest           |

The same orchestration hook drives both displays. The visual language differs, but the timing is identical.

---

## Implementation Checklist

### Phase 1: Core Architecture

- [ ] Create `useTimerOrchestration` hook with phase state machine
- [ ] Update `Timer.tsx` to use persistent container (remove AnimatePresence key thrashing)
- [ ] Implement dual-layer structure (cumulative + active, both always present)
- [ ] Add `stageVariants` to `motion.ts`

### Phase 2: Crossfade Polish

- [ ] Implement staggered opacity animations for smooth crossfade
- [ ] Fine-tune spring physics for settle overshoot
- [ ] Test crossfade at various cumulative values (edge cases: 0 hours, 99 hours)

### Phase 3: Breathing & Hints

- [ ] Implement breathing CSS animation for resting phase
- [ ] Ensure breathing → departing transition is seamless (no snap)
- [ ] Animate hint text ("tap to begin", "tap to end") appropriately

### Phase 4: GooeyOrb Parity

- [ ] Update GooeyOrb to accept phase prop
- [ ] Map phase to blob animation states
- [ ] Test hide-time mode has identical choreography

### Phase 5: Edge Cases & Polish

- [ ] Reduced motion support (instant transitions)
- [ ] Handle rapid tap (debounce or ignore during transition)
- [ ] Test with enlightenment reveal (10,000 hours reached)
- [ ] Verify insight modal timing works with new architecture

---

## Files to Modify

| File                               | Changes                                                              |
| ---------------------------------- | -------------------------------------------------------------------- |
| `src/components/Timer.tsx`         | Major rewrite: persistent container, dual layers, orchestration hook |
| `src/lib/motion.ts`                | Add stageVariants, refine spring values                              |
| `src/components/HemingwayTime.tsx` | Minor: accept optional phase prop for future enhancements            |
| `src/components/GooeyOrb.tsx`      | Moderate: accept phase prop, map to blob states                      |
| `src/index.css`                    | Add timerBreathe keyframes if not using existing box-breathe         |

---

## Success Criteria

1. **Zero flicker** - No visible unmount/remount. Numbers never appear stacked or overlapping incorrectly.

2. **Continuous motion** - Transitions feel like one choreographed movement, not discrete state jumps.

3. **Spring settle** - Every arrival has a micro-overshoot and settle. The numbers "land" like a precision instrument.

4. **Crossfade clarity** - At the midpoint of any crossfade, both values are visible but the intent is clear. Never confusing.

5. **Breathing continuity** - Idle breathing is seamless. Tapping mid-breath feels natural, not interrupted.

6. **Identical choreography** - HemingwayTime and GooeyOrb have the exact same timing. Only the visuals differ.

---

## The Standard

This animation should feel inevitable. Like watching a master calligrapher's brush - every stroke has intention, weight, and flow. The viewer shouldn't think "that's a nice animation." They should feel calm, focused, and present.

A Swiss chronograph doesn't just tell time. It embodies precision. This timer should embody presence.
