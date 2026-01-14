# Unified Timer Experience Design

**Date:** 2026-01-14
**Status:** Approved for implementation
**Author:** Collaborative design session

---

## Executive Summary

Replace the current dual-layer timer architecture (cumulative layer + active layer with opacity crossfade) with a **unified display component** that extends and contracts. Synchronize all transitions to the app's 4-4-4-4 box breathing cycle for a cohesive, meditative experience.

---

## Problem Statement

The current timer experience suffers from:

1. **Abrupt state transitions** - Two separate layers cross-fading causes visual gaps
2. **"All hell breaks loose" on session end** - Timer drops, vanishes, 0 flashes, then cumulative reappears with updated value
3. **Async race conditions** - Store phase (`idle/preparing/running/complete`) doesn't sync with animation phase (`resting/departing/arriving/active/completing/resolving`)
4. **Value jump at session end** - Cumulative updates only after session completes, causing visible jump

---

## Solution: Live Accumulation Model

### Core Concept

The cumulative time is **alive during the session**. The seconds counter is a tributary feeding into a river - not a separate entity that swaps places with the cumulative.

```
RESTING:           16  8                     (breathing, centered)

TAP TO START:      16  8  0                  (seconds segment fades in with inhale)

DURING SESSION:    16  8  47                 (cumulative live, seconds flowing)

AT MINUTE BOUNDARY: 16  9  0                 (cumulative ticks, seconds reset)

TAP TO END:        16  53                    (seconds dissolve with exhale)
```

**Key insight:** No swap, no replacement, no "two things" - just one time display that grows a seconds segment when active and shrinks back when done.

---

## Design Specifications

### 1. Unified Display Model

**Architecture change:**

```
CURRENT (to be replaced):
Timer.tsx
├── Cumulative Layer (motion.div, opacity controlled)
│   └── HemingwayTime mode="cumulative"
└── Active Layer (motion.div, opacity controlled)
    └── HemingwayTime mode="active"

NEW:
Timer.tsx
└── UnifiedTime (single component)
    ├── Hours segment   (always visible when > 0)
    ├── Minutes segment (always visible)
    └── Seconds segment (visible when active, animated in/out)
```

**Data flow during active phase:**

```typescript
// Every second tick:
sessionElapsed++ // Local counter for the session
liveTotal = savedTotalSeconds + sessionElapsed // Live cumulative

// Display renders from liveTotal:
hours = floor(liveTotal / 3600)
minutes = floor((liveTotal % 3600) / 60)
seconds = liveTotal % 60 // Only shown when active
```

**On session end:**

The value is already visually correct - no recalculation, no flash, no jump. Just fade out the seconds segment.

---

### 2. Typography Hierarchy (UNCHANGED)

All existing typography must be preserved exactly:

| Element              | Class          | Size | Weight          | Opacity |
| -------------------- | -------------- | ---- | --------------- | ------- |
| Hours                | `text-display` | 100% | `font-semibold` | 100%    |
| Minutes (with hours) | -              | 85%  | `font-light`    | 60%     |
| Minutes (no hours)   | `text-display` | 100% | `font-semibold` | 100%    |
| Seconds              | -              | 72%  | `font-light`    | 25%     |

Additional constraints:

- `tabular-nums font-serif` on container
- `gap-[0.5em]` between segments
- No colons, no labels (h, m, s)
- No zero-padding (show `8` not `08`)
- Show `0` at minute boundaries (smooth rollover)

---

### 3. Breath-Synchronized Transitions

**Breathing cycle (existing CSS, 16-second loop):**

```
0-4s:   Inhaling   (scale 1 → 1.03)
4-8s:   Hold-in    (scale 1.03)
8-12s:  Exhaling   (scale 1.03 → 1)
12-16s: Hold-out   (scale 1)
```

**Transition anchoring:**

| Transition             | Anchors to      | Rationale                              |
| ---------------------- | --------------- | -------------------------------------- |
| Start (seconds appear) | Next **inhale** | Breathing in = receiving = beginning   |
| End (seconds dissolve) | Next **exhale** | Breathing out = releasing = letting go |

**User experience:**

1. User taps to start
2. Haptic fires immediately (acknowledgment)
3. System waits for next inhale (max 4 seconds)
4. Seconds segment fades in over 4 seconds (with the inhale)
5. Counting begins

Same pattern for end, anchored to exhale.

---

### 4. State Machine (Simplified)

**Current (6 phases):**

```
resting → departing → arriving → active → completing → resolving → resting
```

**New (4 phases):**

```
resting → pending → active → settling → resting
```

| Phase      | Display              | Breathing | Seconds                    | User Can Tap   |
| ---------- | -------------------- | --------- | -------------------------- | -------------- |
| `resting`  | cumulative only      | animated  | hidden                     | Yes (to start) |
| `pending`  | cumulative only      | continues | hidden, waiting for inhale | No             |
| `active`   | cumulative + seconds | paused    | visible, counting          | Yes (to end)   |
| `settling` | cumulative + seconds | paused    | frozen, fading on exhale   | No             |

---

### 5. Breath Clock Hook

New hook to track position in the breathing cycle:

```typescript
// useBreathClock.ts

const CYCLE_DURATION = 16000 // 16 seconds
const PHASE_DURATION = 4000 // 4 seconds per phase

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out'

interface BreathClock {
  getPhase: () => BreathPhase
  waitForPhase: (target: BreathPhase) => Promise<void>
  cycleStart: number
}

function useBreathClock(): BreathClock {
  const [cycleStart] = useState(() => Date.now())

  const getPhase = useCallback((): BreathPhase => {
    const elapsed = (Date.now() - cycleStart) % CYCLE_DURATION
    if (elapsed < 4000) return 'inhale'
    if (elapsed < 8000) return 'hold-in'
    if (elapsed < 12000) return 'exhale'
    return 'hold-out'
  }, [cycleStart])

  const waitForPhase = useCallback(
    (target: BreathPhase): Promise<void> => {
      return new Promise((resolve) => {
        const check = () => {
          const phase = getPhase()
          const elapsed = (Date.now() - cycleStart) % CYCLE_DURATION
          const phaseProgress = elapsed % PHASE_DURATION

          // At START of target phase? (within 100ms tolerance)
          if (phase === target && phaseProgress < 100) {
            resolve()
          } else {
            requestAnimationFrame(check)
          }
        }
        check()
      })
    },
    [cycleStart, getPhase]
  )

  return { getPhase, waitForPhase, cycleStart }
}
```

---

### 6. UnifiedTime Component

New component replacing the dual HemingwayTime setup:

```typescript
// UnifiedTime.tsx

interface UnifiedTimeProps {
  totalSeconds: number        // Live cumulative (updates every second when active)
  showSeconds: boolean        // Whether seconds segment is visible
  secondsOpacity: number      // 0-1, controlled by breath-synced animation
  breathing: boolean          // Whether to animate the breathing pulse
}

function UnifiedTime({
  totalSeconds,
  showSeconds,
  secondsOpacity,
  breathing
}: UnifiedTimeProps) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return (
    <div className={`
      flex items-baseline justify-center gap-[0.5em]
      tabular-nums font-serif
      ${breathing ? 'animate-box-breathe' : ''}
    `}>

      {/* Hours - only if > 0 */}
      {hours > 0 && (
        <span className="text-display font-semibold opacity-100">
          {hours}
        </span>
      )}

      {/* Minutes - styling depends on hours presence */}
      <span
        className={hours > 0
          ? "font-light opacity-60"
          : "text-display font-semibold opacity-100"
        }
        style={hours > 0
          ? { fontSize: 'calc(var(--text-display-size) * 0.85)' }
          : undefined
        }
      >
        {minutes}
      </span>

      {/* Seconds - only when active, opacity animated */}
      {showSeconds && (
        <motion.span
          className="font-light"
          style={{
            fontSize: 'calc(var(--text-display-size) * 0.72)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: secondsOpacity * 0.25 }}
          transition={{ duration: 4, ease: 'linear' }}
        >
          {seconds}
        </motion.span>
      )}
    </div>
  )
}
```

---

### 7. Timer.tsx Orchestration

Complete rewrite of the Timer component:

```typescript
// Timer.tsx

function Timer() {
  // Stores
  const {
    totalSeconds: savedTotal,
    startTimer,
    stopTimer,
    completeSession,
    lastSessionUuid,
    lastSessionDuration,
    justAchievedMilestone,
  } = useSessionStore()
  const { setView, triggerPostSessionFlow } = useNavigationStore()
  const { hideTimeDisplay } = useSettingsStore()

  // Breath synchronization
  const { waitForPhase } = useBreathClock()

  // Local state
  const [phase, setPhase] = useState<'resting' | 'pending' | 'active' | 'settling'>('resting')
  const [sessionStart, setSessionStart] = useState<number | null>(null)
  const [sessionElapsed, setSessionElapsed] = useState(0)
  const [secondsOpacity, setSecondsOpacity] = useState(0)

  // Haptics & Audio
  const haptic = useTapFeedback()
  const audio = useAudioFeedback()

  // Live total: saved + current session progress
  const liveTotal = phase === 'active' || phase === 'settling'
    ? savedTotal + sessionElapsed
    : savedTotal

  // Derived display state
  const showSeconds = phase === 'active' || phase === 'settling'
  const breathing = phase === 'resting'
  const isRunning = phase === 'active'

  // Keep screen awake during session
  useWakeLock(isRunning)

  // Start session
  const handleStart = useCallback(async () => {
    if (phase !== 'resting') return

    haptic.medium()                           // Immediate acknowledgment
    setPhase('pending')

    await waitForPhase('inhale')              // Wait for breath alignment

    // Fade in seconds over 4s (with inhale)
    setSecondsOpacity(1)

    // Start counting after fade begins (slight delay for visual smoothness)
    setTimeout(() => {
      setSessionStart(performance.now())
      setPhase('active')
      startTimer()                            // Persist to DB for crash recovery
    }, 500)
  }, [phase, haptic, waitForPhase, startTimer])

  // End session
  const handleEnd = useCallback(async () => {
    if (phase !== 'active') return

    haptic.success()                          // Immediate acknowledgment
    audio.complete()
    setPhase('settling')

    await waitForPhase('exhale')              // Wait for breath alignment

    // Fade out seconds over 4s (with exhale)
    setSecondsOpacity(0)

    // Complete after fade
    setTimeout(async () => {
      await stopTimer()                       // Persist session to DB
      setPhase('resting')
      setSessionStart(null)
      setSessionElapsed(0)
    }, 4000)
  }, [phase, haptic, audio, waitForPhase, stopTimer])

  // Post-session flow (after store updates)
  useEffect(() => {
    const storePhase = useSessionStore.getState().timerPhase
    if (storePhase === 'complete' && lastSessionUuid && lastSessionDuration) {
      let milestoneMessage: string | undefined
      if (justAchievedMilestone) {
        if ('type' in justAchievedMilestone) {
          milestoneMessage = justAchievedMilestone.label
        } else {
          milestoneMessage = `You just reached ${justAchievedMilestone.hours} hours`
        }
      }

      const timer = setTimeout(() => {
        triggerPostSessionFlow(lastSessionUuid, lastSessionDuration, milestoneMessage)
        completeSession()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [lastSessionUuid, lastSessionDuration, justAchievedMilestone, triggerPostSessionFlow, completeSession])

  // Tick elapsed time during active phase
  useEffect(() => {
    if (phase !== 'active' || !sessionStart) return

    const tick = () => {
      const elapsed = Math.floor((performance.now() - sessionStart) / 1000)
      setSessionElapsed(elapsed)
    }

    tick() // Initial tick
    const interval = setInterval(tick, 100)  // Update frequently for smooth display
    return () => clearInterval(interval)
  }, [phase, sessionStart])

  // Tap handler
  const handleTap = useCallback(() => {
    if (phase === 'resting') handleStart()
    else if (phase === 'active') handleEnd()
    // Ignore taps during 'pending' and 'settling'
  }, [phase, handleStart, handleEnd])

  // Swipe handlers (disabled during active session)
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (phase === 'resting') {
        setView('journey')
      }
    },
  })

  return (
    <div
      className={`
        flex flex-col items-center justify-center h-full px-8 pb-[10vh]
        transition-colors duration-400 select-none
        ${isRunning ? 'bg-cream-dark' : 'bg-cream'}
      `}
      onClick={handleTap}
      {...swipeHandlers}
    >
      {hideTimeDisplay ? (
        <GooeyOrb phase={phase} />
      ) : (
        <UnifiedTime
          totalSeconds={liveTotal}
          showSeconds={showSeconds}
          secondsOpacity={secondsOpacity}
          breathing={breathing}
        />
      )}

      {/* Contextual hints */}
      {phase === 'resting' && (
        <motion.p
          className="text-xs text-indigo-deep/30 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          tap to begin
        </motion.p>
      )}
      {phase === 'active' && (
        <motion.p
          className="absolute bottom-24 text-xs text-ink/25"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          tap to end
        </motion.p>
      )}
    </div>
  )
}
```

---

## What Gets Removed

| Removed                                                   | Reason                            |
| --------------------------------------------------------- | --------------------------------- |
| `HemingwayTime` component                                 | Replaced by `UnifiedTime`         |
| `useTimerOrchestration` hook                              | Logic moved inline to `Timer.tsx` |
| 6-phase state machine                                     | Simplified to 4 phases            |
| `getLayerOpacity()`                                       | No layers                         |
| `getLayerTransition()`                                    | No layer transitions              |
| `stageVariants` for phases                                | Simplified animation approach     |
| Dual `<motion.div>` layers                                | Single component                  |
| `departing`, `arriving`, `completing`, `resolving` phases | Replaced by `pending`, `settling` |

---

## What Gets Preserved

| Preserved                            | Location             |
| ------------------------------------ | -------------------- |
| All typography hierarchy             | `UnifiedTime.tsx`    |
| Font weights, sizes, opacities       | `UnifiedTime.tsx`    |
| Haptic feedback patterns             | `Timer.tsx`          |
| Wake lock during session             | `Timer.tsx`          |
| Post-session flow navigation         | `Timer.tsx`          |
| GooeyOrb for hide-time mode          | `Timer.tsx`          |
| Box breathing CSS animation          | `index.css`          |
| Session persistence & crash recovery | `useSessionStore.ts` |

---

## Files to Modify

1. **CREATE** `src/hooks/useBreathClock.ts` - New breath synchronization hook
2. **CREATE** `src/components/UnifiedTime.tsx` - New unified display component
3. **MODIFY** `src/components/Timer.tsx` - Complete rewrite with new orchestration
4. **MODIFY** `src/lib/format.ts` - Remove zero-padding from cumulative format
5. **DELETE** `src/hooks/useTimerOrchestration.ts` - No longer needed
6. **MODIFY** `src/lib/motion.ts` - Remove unused layer opacity functions
7. **DELETE** `src/components/HemingwayTime.tsx` - Replaced by UnifiedTime

---

## Testing Checklist

### Visual Tests

- [ ] Resting state shows cumulative (hours + minutes, no seconds)
- [ ] No zero-padding on any digits (8 not 08)
- [ ] Typography hierarchy matches current exactly
- [ ] Breathing animation pulses correctly when resting

### Start Transition

- [ ] Haptic fires immediately on tap
- [ ] Seconds segment fades in (not instant)
- [ ] Fade duration is ~4 seconds
- [ ] Transition anchors to breath cycle (waits for inhale)
- [ ] Counting begins smoothly after fade

### During Session

- [ ] Seconds count smoothly (0, 1, 2... 59, 0, 1...)
- [ ] Minutes increment when seconds hit 0
- [ ] Cumulative updates live (no end-of-session jump)
- [ ] Typography hierarchy maintained (hours > minutes > seconds)

### End Transition

- [ ] Haptic fires immediately on tap
- [ ] Audio completion sound plays
- [ ] Seconds freeze, then fade out
- [ ] Fade duration is ~4 seconds
- [ ] Transition anchors to breath cycle (waits for exhale)
- [ ] Final cumulative value is correct (no jump)
- [ ] Breathing animation resumes

### Edge Cases

- [ ] Rapid tap-tap doesn't break anything
- [ ] Session recovery after app kill works
- [ ] Hide-time mode (GooeyOrb) still works
- [ ] Post-session flow triggers correctly
- [ ] Milestone celebrations work
- [ ] Swipe navigation disabled during session

---

## Implementation Order

1. Create `useBreathClock.ts` hook
2. Create `UnifiedTime.tsx` component (test in isolation)
3. Update `format.ts` to remove zero-padding
4. Rewrite `Timer.tsx` with new orchestration
5. Test complete flow
6. Remove deprecated files (`HemingwayTime.tsx`, `useTimerOrchestration.ts`)
7. Clean up `motion.ts` unused exports
