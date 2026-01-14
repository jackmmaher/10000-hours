# Unified Timer Experience Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace dual-layer timer architecture with a unified display that extends/contracts, synchronized to the app's breathing cycle.

**Architecture:** Single `UnifiedTime` component with conditional seconds segment. Breath-synced transitions via new `useBreathClock` hook. Live accumulation during sessions eliminates end-of-session value jumps.

**Tech Stack:** React, TypeScript, Framer Motion, Zustand

**Design Document:** `docs/plans/2026-01-14-unified-timer-experience-design.md`

---

## Pre-Implementation Checklist

- [ ] Read and understand the design document fully
- [ ] Verify the app builds and runs: `npm run dev`
- [ ] Take note of current timer behavior for comparison

---

## Task 1: Create useBreathClock Hook

**Files:**

- Create: `src/hooks/useBreathClock.ts`

### Step 1.1: Create the hook file with type definitions

Create file `src/hooks/useBreathClock.ts`:

```typescript
import { useState, useCallback } from 'react'

/**
 * Breath Clock Hook
 *
 * Tracks position in the 16-second box breathing cycle (4-4-4-4).
 * Enables synchronizing timer transitions to breath phases.
 *
 * Cycle:
 * 0-4s:   inhale    (scale 1 → 1.03)
 * 4-8s:   hold-in   (scale 1.03)
 * 8-12s:  exhale    (scale 1.03 → 1)
 * 12-16s: hold-out  (scale 1)
 */

const CYCLE_DURATION = 16000 // 16 seconds total
const PHASE_DURATION = 4000 // 4 seconds per phase

export type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out'

export interface BreathClock {
  /** Get current breath phase */
  getPhase: () => BreathPhase
  /** Wait for a specific phase to begin (returns Promise that resolves at phase start) */
  waitForPhase: (target: BreathPhase) => Promise<void>
  /** Timestamp when the cycle started (for CSS sync) */
  cycleStart: number
}

export function useBreathClock(): BreathClock {
  // Initialize cycle start time once on mount
  const [cycleStart] = useState(() => Date.now())

  /**
   * Determine current breath phase based on elapsed time
   */
  const getPhase = useCallback((): BreathPhase => {
    const elapsed = (Date.now() - cycleStart) % CYCLE_DURATION

    if (elapsed < 4000) return 'inhale'
    if (elapsed < 8000) return 'hold-in'
    if (elapsed < 12000) return 'exhale'
    return 'hold-out'
  }, [cycleStart])

  /**
   * Wait for a specific breath phase to begin
   * Resolves when we're at the START of the target phase (within 100ms tolerance)
   */
  const waitForPhase = useCallback(
    (target: BreathPhase): Promise<void> => {
      return new Promise((resolve) => {
        const check = () => {
          const currentPhase = getPhase()
          const elapsed = (Date.now() - cycleStart) % CYCLE_DURATION
          const phaseProgress = elapsed % PHASE_DURATION

          // Are we at the START of the target phase? (within 100ms tolerance)
          if (currentPhase === target && phaseProgress < 100) {
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

  return {
    getPhase,
    waitForPhase,
    cycleStart,
  }
}
```

### Step 1.2: Verify file was created correctly

Run: `cat src/hooks/useBreathClock.ts | head -20`

Expected: File exists with correct header and imports.

### Step 1.3: Verify TypeScript compiles

Run: `npx tsc --noEmit`

Expected: No errors related to useBreathClock.ts

---

## CHECKPOINT 1

**Stop and verify before proceeding:**

- [ ] `src/hooks/useBreathClock.ts` exists
- [ ] TypeScript compiles without errors
- [ ] Hook exports `BreathPhase` type and `useBreathClock` function

**Approval required to continue to Task 2.**

---

## Task 2: Create UnifiedTime Component

**Files:**

- Create: `src/components/UnifiedTime.tsx`

### Step 2.1: Create the component file

Create file `src/components/UnifiedTime.tsx`:

```typescript
import { motion } from 'framer-motion'

/**
 * UnifiedTime - Single unified time display
 *
 * Replaces the dual-layer HemingwayTime architecture.
 * One component that extends (shows seconds) when active
 * and contracts (hides seconds) when resting.
 *
 * Typography hierarchy (preserved from original):
 * - Hours: text-display, font-semibold, opacity-100
 * - Minutes (with hours): 0.85em, font-light, opacity-60
 * - Minutes (no hours): text-display, font-semibold, opacity-100
 * - Seconds: 0.72em, font-light, opacity-25
 *
 * Constraints:
 * - No zero-padding (show 8 not 08)
 * - No colons, no labels
 * - Show 0 at minute boundaries
 */

interface UnifiedTimeProps {
  /** Total seconds to display (live cumulative during session) */
  totalSeconds: number
  /** Whether to show the seconds segment */
  showSeconds: boolean
  /** Opacity of seconds segment (0-1), animated by breath sync */
  secondsOpacity: number
  /** Whether to apply breathing animation */
  breathing: boolean
  /** Additional className for the container */
  className?: string
}

export function UnifiedTime({
  totalSeconds,
  showSeconds,
  secondsOpacity,
  breathing,
  className = '',
}: UnifiedTimeProps) {
  // Calculate display values - NO ZERO PADDING
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  // Base container classes - preserved from HemingwayTime
  const containerClasses = `
    flex items-baseline justify-center gap-[0.5em]
    tabular-nums font-serif
    ${breathing ? 'animate-box-breathe' : ''}
    ${className}
  `.trim()

  return (
    <div className={containerClasses}>
      {/* Hours segment - only visible when > 0 */}
      {hours > 0 && (
        <span className="text-display font-semibold opacity-100">
          {hours}
        </span>
      )}

      {/* Minutes segment - styling depends on whether hours are present */}
      <span
        className={
          hours > 0
            ? 'font-light opacity-60'
            : 'text-display font-semibold opacity-100'
        }
        style={
          hours > 0
            ? { fontSize: 'calc(var(--text-display-size) * 0.85)' }
            : undefined
        }
      >
        {minutes}
      </span>

      {/* Seconds segment - only when active, opacity controlled externally */}
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

### Step 2.2: Verify file was created correctly

Run: `cat src/components/UnifiedTime.tsx | head -20`

Expected: File exists with correct header and imports.

### Step 2.3: Verify TypeScript compiles

Run: `npx tsc --noEmit`

Expected: No errors related to UnifiedTime.tsx

---

## CHECKPOINT 2

**Stop and verify before proceeding:**

- [ ] `src/components/UnifiedTime.tsx` exists
- [ ] TypeScript compiles without errors
- [ ] Component exports `UnifiedTime` function
- [ ] Typography matches design spec (hours > minutes > seconds hierarchy)

**Approval required to continue to Task 3.**

---

## Task 3: Update format.ts - Remove Zero Padding

**Files:**

- Modify: `src/lib/format.ts` (lines 117-134)

### Step 3.1: Read current formatHemingwayCumulative function

Run: `cat src/lib/format.ts` and locate `formatHemingwayCumulative` function.

Current implementation pads minutes with zero when hours exist:

```typescript
return {
  hours: h.toString(),
  minutes: m.toString().padStart(2, '0'), // REMOVE THIS PADDING
}
```

### Step 3.2: Modify formatHemingwayCumulative to remove padding

Edit `src/lib/format.ts` - change the `formatHemingwayCumulative` function:

**Before:**

```typescript
// Hemingway format for cumulative display (no labels, no colons)
// Returns hours and minutes as separate parts for flexible rendering
export function formatHemingwayCumulative(seconds: number): {
  hours: string | null
  minutes: string
} {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)

  if (h === 0) {
    return { hours: null, minutes: m.toString() }
  }

  return {
    hours: h.toString(),
    minutes: m.toString().padStart(2, '0'),
  }
}
```

**After:**

```typescript
// Hemingway format for cumulative display (no labels, no colons)
// Returns hours and minutes as separate parts for flexible rendering
// NO ZERO PADDING - show 8 not 08
export function formatHemingwayCumulative(seconds: number): {
  hours: string | null
  minutes: string
} {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)

  if (h === 0) {
    return { hours: null, minutes: m.toString() }
  }

  return {
    hours: h.toString(),
    minutes: m.toString(), // No padding
  }
}
```

### Step 3.3: Modify formatHemingwayActive to remove padding

**Before:**

```typescript
// Hemingway format for active timer display (expanding stream)
// Shows only relevant units: seconds → min:sec → hr:min:sec
export function formatHemingwayActive(seconds: number): {
  hours: string | null
  minutes: string | null
  seconds: string
} {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  // Under 1 minute: just seconds (no padding)
  if (h === 0 && m === 0) {
    return { hours: null, minutes: null, seconds: s.toString() }
  }

  // Under 1 hour: minutes and padded seconds
  if (h === 0) {
    return {
      hours: null,
      minutes: m.toString(),
      seconds: s.toString().padStart(2, '0'),
    }
  }

  // 1 hour or more: hours, padded minutes, padded seconds
  return {
    hours: h.toString(),
    minutes: m.toString().padStart(2, '0'),
    seconds: s.toString().padStart(2, '0'),
  }
}
```

**After:**

```typescript
// Hemingway format for active timer display (expanding stream)
// Shows only relevant units: seconds → min:sec → hr:min:sec
// NO ZERO PADDING - show 8 not 08
export function formatHemingwayActive(seconds: number): {
  hours: string | null
  minutes: string | null
  seconds: string
} {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  // Under 1 minute: just seconds (no padding)
  if (h === 0 && m === 0) {
    return { hours: null, minutes: null, seconds: s.toString() }
  }

  // Under 1 hour: minutes and seconds (no padding)
  if (h === 0) {
    return {
      hours: null,
      minutes: m.toString(),
      seconds: s.toString(), // No padding
    }
  }

  // 1 hour or more: hours, minutes, seconds (no padding)
  return {
    hours: h.toString(),
    minutes: m.toString(), // No padding
    seconds: s.toString(), // No padding
  }
}
```

### Step 3.4: Verify TypeScript compiles

Run: `npx tsc --noEmit`

Expected: No errors.

---

## CHECKPOINT 3

**Stop and verify before proceeding:**

- [ ] `formatHemingwayCumulative` no longer pads minutes
- [ ] `formatHemingwayActive` no longer pads minutes or seconds
- [ ] TypeScript compiles without errors
- [ ] Comment added: "NO ZERO PADDING"

**Approval required to continue to Task 4.**

---

## Task 4: Rewrite Timer.tsx - Part 1 (Imports and State)

**Files:**

- Modify: `src/components/Timer.tsx`

This is a complete rewrite. We'll do it in stages to ensure nothing breaks.

### Step 4.1: Read current Timer.tsx to understand structure

Run: `cat src/components/Timer.tsx`

Note the current imports, hooks used, and overall structure.

### Step 4.2: Replace imports section

**Before (current imports):**

```typescript
import { useEffect, useCallback, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSessionStore } from '../stores/useSessionStore'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useTimerOrchestration } from '../hooks/useTimerOrchestration'
import { useWakeLock } from '../hooks/useTimer'
import { useSwipe } from '../hooks/useSwipe'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { useAudioFeedback } from '../hooks/useAudioFeedback'
import { getNearMissInfo } from '../lib/milestones'
import { getUserPreferences } from '../lib/db'
import { stageVariants, getLayerOpacity, getLayerTransition } from '../lib/motion'
import { HemingwayTime } from './HemingwayTime'
import { GooeyOrb } from './GooeyOrb'
```

**After (new imports):**

```typescript
import { useEffect, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { useSessionStore } from '../stores/useSessionStore'
import { useNavigationStore } from '../stores/useNavigationStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useBreathClock } from '../hooks/useBreathClock'
import { useWakeLock } from '../hooks/useTimer'
import { useSwipe } from '../hooks/useSwipe'
import { useTapFeedback } from '../hooks/useTapFeedback'
import { useAudioFeedback } from '../hooks/useAudioFeedback'
import { UnifiedTime } from './UnifiedTime'
import { GooeyOrb } from './GooeyOrb'
```

**Removed:**

- `useMemo` (no longer needed)
- `useTimerOrchestration` (replaced by inline logic)
- `getNearMissInfo` (removed near-miss feature for now - can add back later)
- `getUserPreferences` (was only for near-miss)
- `stageVariants, getLayerOpacity, getLayerTransition` (no longer using layer system)
- `HemingwayTime` (replaced by UnifiedTime)

**Added:**

- `useBreathClock` (new breath sync hook)
- `UnifiedTime` (new unified display)

### Step 4.3: Verify TypeScript compiles (will have errors - that's expected)

Run: `npx tsc --noEmit 2>&1 | head -20`

Expected: Errors about missing implementations (we'll fix in next steps).

---

## CHECKPOINT 4

**Stop and verify before proceeding:**

- [ ] Imports updated in Timer.tsx
- [ ] `useTimerOrchestration` import removed
- [ ] `HemingwayTime` import removed
- [ ] `useBreathClock` import added
- [ ] `UnifiedTime` import added

**Approval required to continue to Task 5.**

---

## Task 5: Rewrite Timer.tsx - Part 2 (Component Body)

**Files:**

- Modify: `src/components/Timer.tsx`

### Step 5.1: Replace the entire Timer function body

Replace everything from `export function Timer()` to the final closing brace with:

```typescript
/**
 * Timer - The Unified Experience
 *
 * Single component with extending/contracting seconds segment.
 * Transitions synchronized to the app's breathing cycle.
 * Live accumulation eliminates end-of-session value jumps.
 *
 * Phases:
 * - resting: cumulative only, breathing animation
 * - pending: waiting for inhale to start
 * - active: counting, seconds visible
 * - settling: waiting for exhale, seconds fading
 */
export function Timer() {
  // ============================================
  // STORES
  // ============================================
  const {
    totalSeconds: savedTotal,
    timerPhase: storeTimerPhase,
    startTimer,
    stopTimer,
    completeSession,
    lastSessionUuid,
    lastSessionDuration,
    justAchievedMilestone,
    justReachedEnlightenment,
    acknowledgeEnlightenment,
  } = useSessionStore()

  const { setView, triggerPostSessionFlow } = useNavigationStore()
  const { hideTimeDisplay } = useSettingsStore()

  // ============================================
  // BREATH SYNCHRONIZATION
  // ============================================
  const { waitForPhase } = useBreathClock()

  // ============================================
  // LOCAL STATE
  // ============================================
  type TimerPhase = 'resting' | 'pending' | 'active' | 'settling'
  const [phase, setPhase] = useState<TimerPhase>('resting')
  const [sessionStart, setSessionStart] = useState<number | null>(null)
  const [sessionElapsed, setSessionElapsed] = useState(0)
  const [secondsOpacity, setSecondsOpacity] = useState(0)

  // ============================================
  // HAPTICS & AUDIO
  // ============================================
  const haptic = useTapFeedback()
  const audio = useAudioFeedback()

  // ============================================
  // DERIVED STATE
  // ============================================

  // Live total: saved + current session progress
  const liveTotal =
    phase === 'active' || phase === 'settling'
      ? savedTotal + sessionElapsed
      : savedTotal

  // Display state
  const showSeconds = phase === 'active' || phase === 'settling'
  const breathing = phase === 'resting'
  const isRunning = phase === 'active'

  // ============================================
  // WAKE LOCK
  // ============================================
  useWakeLock(isRunning)

  // ============================================
  // START SESSION
  // ============================================
  const handleStart = useCallback(async () => {
    if (phase !== 'resting') return

    // Immediate haptic acknowledgment
    haptic.medium()
    setPhase('pending')

    // Wait for breath alignment (next inhale)
    await waitForPhase('inhale')

    // Show seconds segment (fade in with inhale - 4 seconds)
    setSecondsOpacity(1)

    // Start counting after slight delay for visual smoothness
    setTimeout(() => {
      setSessionStart(performance.now())
      setPhase('active')
      startTimer() // Persist to DB for crash recovery
    }, 500)
  }, [phase, haptic, waitForPhase, startTimer])

  // ============================================
  // END SESSION
  // ============================================
  const handleEnd = useCallback(async () => {
    if (phase !== 'active') return

    // Immediate haptic + audio acknowledgment
    haptic.success()
    audio.complete()
    setPhase('settling')

    // Wait for breath alignment (next exhale)
    await waitForPhase('exhale')

    // Hide seconds segment (fade out with exhale - 4 seconds)
    setSecondsOpacity(0)

    // Complete after fade finishes
    setTimeout(async () => {
      await stopTimer() // Persist session to DB
      setPhase('resting')
      setSessionStart(null)
      setSessionElapsed(0)
    }, 4000)
  }, [phase, haptic, audio, waitForPhase, stopTimer])

  // ============================================
  // POST-SESSION FLOW
  // ============================================
  useEffect(() => {
    if (storeTimerPhase === 'complete' && lastSessionUuid && lastSessionDuration) {
      let milestoneMessage: string | undefined

      if (justAchievedMilestone) {
        if ('type' in justAchievedMilestone) {
          milestoneMessage = justAchievedMilestone.label
        } else {
          milestoneMessage = `You just reached ${justAchievedMilestone.hours} hours`
        }
      }

      const timer = setTimeout(() => {
        // Silently acknowledge enlightenment if goal was just reached
        if (justReachedEnlightenment) {
          acknowledgeEnlightenment()
        }
        triggerPostSessionFlow(lastSessionUuid, lastSessionDuration, milestoneMessage)
        completeSession()
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [
    storeTimerPhase,
    lastSessionUuid,
    lastSessionDuration,
    justAchievedMilestone,
    justReachedEnlightenment,
    acknowledgeEnlightenment,
    triggerPostSessionFlow,
    completeSession,
  ])

  // ============================================
  // ELAPSED TIME TICKER
  // ============================================
  useEffect(() => {
    if (phase !== 'active' || !sessionStart) return

    const tick = () => {
      const elapsed = Math.floor((performance.now() - sessionStart) / 1000)
      setSessionElapsed(elapsed)
    }

    tick() // Initial tick
    const interval = setInterval(tick, 100) // Update frequently for smooth display

    return () => clearInterval(interval)
  }, [phase, sessionStart])

  // ============================================
  // TAP HANDLER
  // ============================================
  const handleTap = useCallback(() => {
    if (phase === 'resting') {
      handleStart()
    } else if (phase === 'active') {
      handleEnd()
    }
    // Ignore taps during 'pending' and 'settling'
  }, [phase, handleStart, handleEnd])

  // ============================================
  // SWIPE HANDLERS
  // ============================================
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (phase === 'resting') {
        setView('journey')
      }
    },
  })

  // ============================================
  // RENDER
  // ============================================
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
      {/* Timer Display */}
      {hideTimeDisplay ? (
        <GooeyOrb phase={phase} />
      ) : (
        <UnifiedTime
          totalSeconds={liveTotal}
          showSeconds={showSeconds}
          secondsOpacity={secondsOpacity}
          breathing={breathing}
          className="text-indigo-deep"
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

### Step 5.2: Verify TypeScript compiles

Run: `npx tsc --noEmit`

Expected: No errors (or minimal errors related to GooeyOrb phase prop - we'll address that).

---

## CHECKPOINT 5

**Stop and verify before proceeding:**

- [ ] Timer.tsx completely rewritten
- [ ] 4-phase state machine implemented (resting, pending, active, settling)
- [ ] Breath synchronization integrated
- [ ] Live accumulation working (liveTotal = savedTotal + sessionElapsed)
- [ ] TypeScript compiles without errors

**Approval required to continue to Task 6.**

---

## Task 6: Update GooeyOrb Phase Type (if needed)

**Files:**

- Modify: `src/components/GooeyOrb.tsx` (if phase type mismatch)

### Step 6.1: Check GooeyOrb phase prop type

Run: `grep -A5 "interface.*Props" src/components/GooeyOrb.tsx`

If it expects the old 6-phase type, update it to accept the new 4-phase type.

### Step 6.2: Update GooeyOrb if needed

If GooeyOrb expects specific phase values, map the new phases:

```typescript
// In GooeyOrb.tsx, update the phase type or add a mapping:
type OrbPhase = 'resting' | 'pending' | 'active' | 'settling'

// Or map internally:
const orbState = phase === 'pending' ? 'resting' : phase === 'settling' ? 'active' : phase
```

### Step 6.3: Verify TypeScript compiles

Run: `npx tsc --noEmit`

Expected: No errors.

---

## CHECKPOINT 6

**Stop and verify before proceeding:**

- [ ] GooeyOrb accepts new phase types (or mapping added)
- [ ] TypeScript compiles without errors
- [ ] App starts without runtime errors: `npm run dev`

**Approval required to continue to Task 7.**

---

## Task 7: Test the Complete Flow

**Files:** None (testing only)

### Step 7.1: Start the development server

Run: `npm run dev`

Expected: App starts without errors.

### Step 7.2: Visual verification - Resting state

Open the app in browser and verify:

- [ ] Cumulative time displays (e.g., "16 8" not "16 08")
- [ ] No seconds visible
- [ ] Breathing animation active
- [ ] "tap to begin" hint visible

### Step 7.3: Visual verification - Start transition

Tap to start and verify:

- [ ] Haptic fires immediately
- [ ] System waits for breath alignment (up to 4 seconds)
- [ ] Seconds segment fades in smoothly (4 seconds)
- [ ] Counting begins (0, 1, 2...)
- [ ] Breathing animation stops

### Step 7.4: Visual verification - During session

Let timer run and verify:

- [ ] Seconds count: 0, 1, 2... 58, 59, 0, 1...
- [ ] Minutes increment when seconds hit 0
- [ ] NO zero-padding on any digits
- [ ] Typography hierarchy correct (minutes smaller than hours if present)
- [ ] Background color changed to cream-dark

### Step 7.5: Visual verification - End transition

Tap to end and verify:

- [ ] Haptic fires immediately
- [ ] Audio completion sound plays
- [ ] Seconds freeze momentarily
- [ ] System waits for breath alignment
- [ ] Seconds fade out smoothly (4 seconds)
- [ ] Final cumulative value correct (no jump!)
- [ ] Breathing animation resumes
- [ ] "tap to begin" hint returns

### Step 7.6: Edge case - Rapid taps

Tap rapidly and verify:

- [ ] No crashes
- [ ] Taps during pending/settling are ignored
- [ ] State machine remains consistent

---

## CHECKPOINT 7

**Stop and verify before proceeding:**

- [ ] All visual tests pass
- [ ] Start transition smooth and breath-synced
- [ ] End transition smooth and breath-synced
- [ ] No value jumps at session end
- [ ] Edge cases handled

**Approval required to continue to Task 8.**

---

## Task 8: Remove Deprecated Files

**Files:**

- Delete: `src/components/HemingwayTime.tsx`
- Delete: `src/hooks/useTimerOrchestration.ts`

### Step 8.1: Verify no other files import HemingwayTime

Run: `grep -r "HemingwayTime" src/ --include="*.ts" --include="*.tsx" | grep -v "HemingwayTime.tsx"`

Expected: No results (or only the old Timer.tsx which we've rewritten).

### Step 8.2: Verify no other files import useTimerOrchestration

Run: `grep -r "useTimerOrchestration" src/ --include="*.ts" --include="*.tsx" | grep -v "useTimerOrchestration.ts"`

Expected: No results.

### Step 8.3: Delete HemingwayTime.tsx

Run: `rm src/components/HemingwayTime.tsx`

### Step 8.4: Delete useTimerOrchestration.ts

Run: `rm src/hooks/useTimerOrchestration.ts`

### Step 8.5: Verify TypeScript still compiles

Run: `npx tsc --noEmit`

Expected: No errors.

### Step 8.6: Verify app still runs

Run: `npm run dev`

Expected: App runs without errors.

---

## CHECKPOINT 8

**Stop and verify before proceeding:**

- [ ] `HemingwayTime.tsx` deleted
- [ ] `useTimerOrchestration.ts` deleted
- [ ] No import errors
- [ ] TypeScript compiles
- [ ] App runs

**Approval required to continue to Task 9.**

---

## Task 9: Clean Up motion.ts

**Files:**

- Modify: `src/lib/motion.ts`

### Step 9.1: Identify unused exports

The following are no longer needed:

- `getLayerOpacity` function
- `getLayerTransition` function
- `layerTransition` constant
- `stageVariants` (the 6-phase variants)
- `stateAnimations` (legacy)

### Step 9.2: Check if any other files use these exports

Run: `grep -r "getLayerOpacity\|getLayerTransition\|stageVariants\|stateAnimations\|layerTransition" src/ --include="*.ts" --include="*.tsx" | grep -v "motion.ts"`

Expected: No results (except possibly old imports we've already removed).

### Step 9.3: Remove unused exports from motion.ts

Remove these sections from `src/lib/motion.ts`:

1. Remove `stateAnimations` object (around line 126-149)
2. Remove `stageVariants` object (around line 158-200)
3. Remove `getLayerTransition` function (around line 206-219)
4. Remove `layerTransition` constant (around line 222-225)
5. Remove `getLayerOpacity` function (around line 231-246)

Keep:

- `TimerPhase` type (update to new 4-phase)
- `springs` object
- `layoutIds` object
- `transitions` object
- `breatheVariants` object
- `useMotionConfig` hook

### Step 9.4: Update TimerPhase type

**Before:**

```typescript
export type TimerPhase =
  | 'resting'
  | 'departing'
  | 'arriving'
  | 'active'
  | 'completing'
  | 'resolving'
```

**After:**

```typescript
export type TimerPhase = 'resting' | 'pending' | 'active' | 'settling'
```

### Step 9.5: Verify TypeScript compiles

Run: `npx tsc --noEmit`

Expected: No errors.

---

## CHECKPOINT 9

**Stop and verify before proceeding:**

- [ ] Unused exports removed from motion.ts
- [ ] TimerPhase type updated to 4-phase
- [ ] TypeScript compiles
- [ ] App runs

**Approval required to continue to Task 10.**

---

## Task 10: Final Verification and Commit

### Step 10.1: Run full TypeScript check

Run: `npx tsc --noEmit`

Expected: No errors.

### Step 10.2: Run the app and test complete flow

Run: `npm run dev`

Test the full flow:

1. App loads, shows cumulative (e.g., "16 8")
2. Tap to start - haptic, wait for breath, seconds fade in
3. Timer counts - minutes update live
4. Tap to end - haptic + audio, wait for breath, seconds fade out
5. Final value correct, breathing resumes

### Step 10.3: Check for console errors

Open browser DevTools, check Console tab.

Expected: No errors or warnings related to timer.

### Step 10.4: Commit all changes

Run:

```bash
git add -A
git status
```

Review the changes:

- New: `src/hooks/useBreathClock.ts`
- New: `src/components/UnifiedTime.tsx`
- Modified: `src/components/Timer.tsx`
- Modified: `src/lib/format.ts`
- Modified: `src/lib/motion.ts`
- Deleted: `src/components/HemingwayTime.tsx`
- Deleted: `src/hooks/useTimerOrchestration.ts`
- New: `docs/plans/2026-01-14-unified-timer-experience-design.md`
- New: `docs/plans/2026-01-14-unified-timer-implementation-plan.md`

### Step 10.5: Create commit

Run:

```bash
git commit -m "$(cat <<'EOF'
feat(timer): unified display with breath-synced transitions

Replace dual-layer timer architecture with single UnifiedTime component.
Synchronize all transitions to the app's 4-4-4-4 breathing cycle.

Changes:
- Add useBreathClock hook for breath cycle tracking
- Add UnifiedTime component (replaces HemingwayTime)
- Rewrite Timer.tsx with 4-phase state machine
- Remove zero-padding from time display
- Live accumulation during sessions (no end-of-session jump)
- Start transition anchors to inhale phase
- End transition anchors to exhale phase

Removed:
- HemingwayTime component
- useTimerOrchestration hook
- 6-phase layer opacity system

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## CHECKPOINT 10 - FINAL

**Implementation complete. Verify:**

- [ ] All files created/modified/deleted as planned
- [ ] TypeScript compiles without errors
- [ ] App runs without errors
- [ ] Start transition: haptic → wait → fade in (4s with inhale)
- [ ] End transition: haptic + audio → wait → fade out (4s with exhale)
- [ ] No value jumps at session end
- [ ] Typography hierarchy preserved
- [ ] No zero-padding
- [ ] Commit created

---

## Post-Implementation Notes

### Future Enhancements (not in scope)

1. **Near-miss feature** - Was removed for simplicity. Can be added back to UnifiedTime.
2. **Session recovery** - Store integration preserved, but may need testing after app kill.
3. **GooeyOrb refinement** - May need phase mapping updates for visual polish.

### Known Limitations

1. **Breath sync precision** - 100ms tolerance at phase boundaries may cause slight variation.
2. **Max wait time** - Users may wait up to 4 seconds for breath alignment (by design).

### Rollback Plan

If issues arise, revert the commit:

```bash
git revert HEAD
```

This restores all deleted files and reverts all changes.
