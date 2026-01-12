# Hemingway Timer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the timer tab into a contemplative, typographically refined experience where cumulative and active time flow seamlessly, the zen message becomes a persistent welcome, and the user stays home on the timer tab.

**Architecture:**

- New `formatHemingway()` functions for label-free time display
- Refactored `Timer.tsx` with phased animations and breathing states
- `ZenMessage` becomes app opening cutscene with goal-aware message logic
- Post-session flow keeps user on timer tab with insight modal overlay
- 4-4-4-4 box breathing CSS animation for idle state

**Tech Stack:** React, Zustand, Tailwind CSS, CSS Keyframes

---

## Task 1: Add Hemingway Format Functions

**Files:**

- Modify: `src/lib/format.ts`
- Create: `src/lib/__tests__/format.test.ts` (if not exists, add tests)

**Step 1: Write failing tests for formatHemingwayCumulative**

```typescript
// Add to format.test.ts or create it
import { formatHemingwayCumulative, formatHemingwayActive } from '../format'

describe('formatHemingwayCumulative', () => {
  it('formats hours and minutes as separate parts', () => {
    const result = formatHemingwayCumulative(12 * 3600 + 34 * 60)
    expect(result).toEqual({ hours: '12', minutes: '34' })
  })

  it('returns only minutes when under 1 hour', () => {
    const result = formatHemingwayCumulative(34 * 60)
    expect(result).toEqual({ hours: null, minutes: '34' })
  })

  it('returns zero minutes when exactly on the hour', () => {
    const result = formatHemingwayCumulative(2 * 3600)
    expect(result).toEqual({ hours: '2', minutes: '00' })
  })

  it('handles zero total', () => {
    const result = formatHemingwayCumulative(0)
    expect(result).toEqual({ hours: null, minutes: '0' })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --testPathPattern=format.test --watch=false`
Expected: FAIL - formatHemingwayCumulative is not defined

**Step 3: Implement formatHemingwayCumulative**

Add to `src/lib/format.ts`:

```typescript
// Format cumulative time for Hemingway display
// Returns { hours: string | null, minutes: string } for separate rendering
export function formatHemingwayCumulative(seconds: number): {
  hours: string | null
  minutes: string
} {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours === 0) {
    return { hours: null, minutes: String(minutes) }
  }

  return {
    hours: String(hours),
    minutes: String(minutes).padStart(2, '0'),
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --testPathPattern=format.test --watch=false`
Expected: PASS

**Step 5: Write failing tests for formatHemingwayActive**

```typescript
describe('formatHemingwayActive', () => {
  it('returns only seconds when under 1 minute', () => {
    const result = formatHemingwayActive(27)
    expect(result).toEqual({ hours: null, minutes: null, seconds: '27' })
  })

  it('returns minutes and seconds when under 1 hour', () => {
    const result = formatHemingwayActive(1 * 60 + 27)
    expect(result).toEqual({ hours: null, minutes: '1', seconds: '27' })
  })

  it('returns all three when over 1 hour', () => {
    const result = formatHemingwayActive(1 * 3600 + 34 * 60 + 27)
    expect(result).toEqual({ hours: '1', minutes: '34', seconds: '27' })
  })

  it('pads seconds to 2 digits when minutes exist', () => {
    const result = formatHemingwayActive(1 * 60 + 5)
    expect(result).toEqual({ hours: null, minutes: '1', seconds: '05' })
  })

  it('pads minutes to 2 digits when hours exist', () => {
    const result = formatHemingwayActive(1 * 3600 + 5 * 60 + 27)
    expect(result).toEqual({ hours: '1', minutes: '05', seconds: '27' })
  })
})
```

**Step 6: Run test to verify it fails**

Run: `npm test -- --testPathPattern=format.test --watch=false`
Expected: FAIL - formatHemingwayActive is not defined

**Step 7: Implement formatHemingwayActive**

Add to `src/lib/format.ts`:

```typescript
// Format active timer for Hemingway display (expanding stream)
// Returns { hours, minutes, seconds } with appropriate padding
export function formatHemingwayActive(totalSeconds: number): {
  hours: string | null
  minutes: string | null
  seconds: string
} {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  // Under 1 minute: just seconds
  if (hours === 0 && minutes === 0) {
    return { hours: null, minutes: null, seconds: String(seconds) }
  }

  // Under 1 hour: minutes + padded seconds
  if (hours === 0) {
    return {
      hours: null,
      minutes: String(minutes),
      seconds: String(seconds).padStart(2, '0'),
    }
  }

  // Over 1 hour: hours + padded minutes + padded seconds
  return {
    hours: String(hours),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  }
}
```

**Step 8: Run tests to verify all pass**

Run: `npm test -- --testPathPattern=format.test --watch=false`
Expected: PASS

**Step 9: Commit**

```bash
git add src/lib/format.ts src/lib/__tests__/format.test.ts
git commit -m "feat(format): add Hemingway time formatting functions

- formatHemingwayCumulative: hours/minutes as separate parts
- formatHemingwayActive: expanding stream (seconds → min:sec → hr:min:sec)
- No labels, no colons - spacing as delimiter"
```

---

## Task 2: Add Box Breathing CSS Animation

**Files:**

- Modify: `src/index.css`
- Modify: `tailwind.config.js`

**Step 1: Add box breathing keyframes to index.css**

Add after the existing orb animations (around line 336):

```css
/* ========================================
 * BOX BREATHING ANIMATION (4-4-4-4)
 * Timer idle state - numbers as meditation object
 * ======================================== */

@keyframes boxBreathe {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  25% {
    /* Inhale complete - expanded */
    transform: scale(1.03);
    opacity: 1;
  }
  50% {
    /* Hold at expanded */
    transform: scale(1.03);
    opacity: 1;
  }
  75% {
    /* Exhale complete - return to neutral */
    transform: scale(1);
    opacity: 1;
  }
  100% {
    /* Hold at neutral */
    transform: scale(1);
    opacity: 1;
  }
}

/* Transition animations for timer states */
@keyframes timerExhale {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.95);
    opacity: 0;
  }
}

@keyframes timerInhale {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Session merge - rising and dissolving */
@keyframes sessionMergeRise {
  from {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateY(-30px) scale(0.6);
    opacity: 0;
  }
}

/* Cumulative merge - appearing from below */
@keyframes cumulativeMergeIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

**Step 2: Add animation utilities to tailwind.config.js**

In the `animation` section of `theme.extend`:

```javascript
// Add to animation object (around line 107)
'box-breathe': 'boxBreathe 16s ease-in-out infinite',
'timer-exhale': 'timerExhale 400ms var(--ease-organic) forwards',
'timer-inhale': 'timerInhale 400ms var(--ease-organic) forwards',
'session-merge-rise': 'sessionMergeRise 800ms ease-out forwards',
'cumulative-merge-in': 'cumulativeMergeIn 600ms ease-out forwards',
```

Also add the keyframes in the `keyframes` section:

```javascript
// Add to keyframes object
boxBreathe: {
  '0%, 100%': { transform: 'scale(1)', opacity: '1' },
  '25%, 50%': { transform: 'scale(1.03)', opacity: '1' },
  '75%': { transform: 'scale(1)', opacity: '1' },
},
timerExhale: {
  from: { transform: 'scale(1)', opacity: '1' },
  to: { transform: 'scale(0.95)', opacity: '0' },
},
timerInhale: {
  from: { transform: 'scale(0.9)', opacity: '0' },
  to: { transform: 'scale(1)', opacity: '1' },
},
sessionMergeRise: {
  from: { transform: 'translateY(0) scale(1)', opacity: '1' },
  to: { transform: 'translateY(-30px) scale(0.6)', opacity: '0' },
},
cumulativeMergeIn: {
  from: { transform: 'scale(0.95)', opacity: '0' },
  to: { transform: 'scale(1)', opacity: '1' },
},
```

**Step 3: Verify animations compile**

Run: `npm run build`
Expected: Build succeeds without CSS errors

**Step 4: Commit**

```bash
git add src/index.css tailwind.config.js
git commit -m "feat(css): add box breathing and timer transition animations

- boxBreathe: 16s 4-4-4-4 cycle for idle state
- timerExhale/Inhale: start transition choreography
- sessionMergeRise/cumulativeMergeIn: stop transition choreography"
```

---

## Task 3: Create HemingwayTime Display Component

**Files:**

- Create: `src/components/HemingwayTime.tsx`

**Step 1: Create the component**

```typescript
/**
 * HemingwayTime - Typographic time display
 *
 * No labels, no colons. Spacing and opacity as hierarchy.
 * Two modes: cumulative (hours + minutes) and active (expanding stream)
 */

import { formatHemingwayCumulative, formatHemingwayActive } from '../lib/format'

interface HemingwayTimeProps {
  seconds: number
  mode: 'cumulative' | 'active'
  breathing?: boolean
  className?: string
}

export function HemingwayTime({ seconds, mode, breathing = false, className = '' }: HemingwayTimeProps) {
  if (mode === 'cumulative') {
    const { hours, minutes } = formatHemingwayCumulative(seconds)

    return (
      <div
        className={`
          flex items-baseline justify-center gap-[0.5em] tabular-nums
          ${breathing ? 'animate-box-breathe' : ''}
          ${className}
        `}
      >
        {hours !== null ? (
          <>
            {/* Hours - anchor, full opacity, bold */}
            <span className="font-serif text-display font-semibold opacity-100">
              {hours}
            </span>
            {/* Minutes - secondary, lighter, reduced opacity */}
            <span className="font-serif text-display font-light opacity-60" style={{ fontSize: '0.85em' }}>
              {minutes}
            </span>
          </>
        ) : (
          // Sub-hour: just minutes, styled as primary
          <span className="font-serif text-display font-semibold opacity-100">
            {minutes}
          </span>
        )}
      </div>
    )
  }

  // Active mode - expanding stream with fading tail
  const { hours, minutes, seconds: secs } = formatHemingwayActive(seconds)

  // Determine opacity based on position in hierarchy
  // Largest unit = 100%, middle = 50%, smallest (seconds) = 25%
  const getOpacity = (position: 'primary' | 'secondary' | 'tertiary') => {
    switch (position) {
      case 'primary': return 'opacity-100'
      case 'secondary': return 'opacity-50'
      case 'tertiary': return 'opacity-25'
    }
  }

  // Determine sizing based on position
  const getSize = (position: 'primary' | 'secondary' | 'tertiary') => {
    switch (position) {
      case 'primary': return 'text-display'
      case 'secondary': return 'text-display' // Will use inline style for 0.85em
      case 'tertiary': return 'text-display'  // Will use inline style for 0.72em (0.85^2)
    }
  }

  return (
    <div className={`flex items-baseline justify-center gap-[0.5em] tabular-nums ${className}`}>
      {hours !== null && (
        <>
          {/* Hours - primary */}
          <span className={`font-serif ${getSize('primary')} font-semibold ${getOpacity('primary')}`}>
            {hours}
          </span>
          {/* Minutes - secondary */}
          <span
            className={`font-serif font-light ${getOpacity('secondary')}`}
            style={{ fontSize: 'calc(var(--text-display-size) * 0.85)' }}
          >
            {minutes}
          </span>
          {/* Seconds - tertiary */}
          <span
            className={`font-serif font-light ${getOpacity('tertiary')}`}
            style={{ fontSize: 'calc(var(--text-display-size) * 0.72)' }}
          >
            {secs}
          </span>
        </>
      )}

      {hours === null && minutes !== null && (
        <>
          {/* Minutes - primary when no hours */}
          <span className={`font-serif ${getSize('primary')} font-semibold ${getOpacity('primary')}`}>
            {minutes}
          </span>
          {/* Seconds - secondary */}
          <span
            className={`font-serif font-light ${getOpacity('secondary')}`}
            style={{ fontSize: 'calc(var(--text-display-size) * 0.85)' }}
          >
            {secs}
          </span>
        </>
      )}

      {hours === null && minutes === null && (
        // Just seconds - primary
        <span className={`font-serif ${getSize('primary')} font-semibold ${getOpacity('primary')}`}>
          {secs}
        </span>
      )}
    </div>
  )
}
```

**Step 2: Verify component compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/HemingwayTime.tsx
git commit -m "feat(components): add HemingwayTime display component

- Cumulative mode: hours bold, minutes light/smaller
- Active mode: expanding stream with opacity hierarchy
- No labels, spacing as only delimiter
- Box breathing animation support for idle state"
```

---

## Task 4: Add Goal Completion State to Session Store

**Files:**

- Modify: `src/stores/useSessionStore.ts`
- Modify: `src/lib/db/settings.ts` (check for goal tracking)

**Step 1: Add goal state to session store interface**

In `useSessionStore.ts`, add to the interface:

```typescript
// Add to SessionState interface
goalCompleted: boolean // True when user reached their goal and hasn't set a new one
```

**Step 2: Add to initial state and hydrate**

```typescript
// Add to initial state
goalCompleted: false,

// In hydrate function, after loading appState:
// Check if goal is completed (totalHours >= goalHours and enlightenment reached)
const userPrefs = await getUserPreferences()
const goalCompleted = appState.hasReachedEnlightenment &&
  userPrefs?.practiceGoalHours &&
  (totalSeconds / 3600) >= userPrefs.practiceGoalHours

set({
  sessions,
  totalSeconds,
  hasReachedEnlightenment: appState.hasReachedEnlightenment,
  goalCompleted,
  isLoading: false
})
```

**Step 3: Add action to reset goal state when new goal is set**

```typescript
// Add action to interface
resetGoalCompleted: () => void

// Add implementation
resetGoalCompleted: () => {
  set({ goalCompleted: false })
}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/stores/useSessionStore.ts
git commit -m "feat(store): add goalCompleted state for zen message logic

- Tracks when user has reached goal and not set a new one
- Used to switch between 'before' and 'after' enlightenment message"
```

---

## Task 5: Add App Welcome State to Navigation Store

**Files:**

- Modify: `src/stores/useNavigationStore.ts`

**Step 1: Add welcome cutscene state**

```typescript
// Add to NavigationState interface
showWelcomeCutscene: boolean
welcomeCutsceneShown: boolean  // Tracks if shown this session

// Add actions
triggerWelcomeCutscene: () => void
dismissWelcomeCutscene: () => void
```

**Step 2: Add implementations**

```typescript
// Add to initial state
showWelcomeCutscene: false,
welcomeCutsceneShown: false,

// Add action implementations
triggerWelcomeCutscene: () => set({ showWelcomeCutscene: true }),
dismissWelcomeCutscene: () => set({
  showWelcomeCutscene: false,
  welcomeCutsceneShown: true
}),
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/stores/useNavigationStore.ts
git commit -m "feat(store): add welcome cutscene state to navigation

- showWelcomeCutscene: triggers zen message overlay
- welcomeCutsceneShown: prevents re-showing in same session"
```

---

## Task 6: Refactor ZenMessage for Goal-Aware Welcome

**Files:**

- Modify: `src/components/ZenMessage.tsx`

**Step 1: Update ZenMessage to accept goalCompleted prop**

```typescript
interface ZenMessageProps {
  isEnlightened: boolean
  goalCompleted?: boolean // New: true when goal achieved and no new goal set
  onComplete: () => void
  variant: 'before' | 'after' | 'welcome' // Add 'welcome' variant
}

export function ZenMessage({
  isEnlightened,
  goalCompleted = false,
  onComplete,
  variant,
}: ZenMessageProps) {
  const [visibleWords, setVisibleWords] = useState(0)
  const [fading, setFading] = useState(false)

  // Welcome variant: show 'after' only if goal completed, otherwise 'before'
  const message =
    variant === 'welcome'
      ? goalCompleted
        ? ZEN_MESSAGE_AFTER
        : ZEN_MESSAGE_BEFORE
      : variant === 'after' || isEnlightened
        ? ZEN_MESSAGE_AFTER
        : ZEN_MESSAGE_BEFORE

  // ... rest unchanged
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/ZenMessage.tsx
git commit -m "feat(ZenMessage): add welcome variant with goal-aware message

- 'welcome' variant for app opening cutscene
- Shows 'after enlightenment' when goalCompleted is true
- Falls back to 'before enlightenment' otherwise"
```

---

## Task 7: Update Timer Component - Hemingway Display

**Files:**

- Modify: `src/components/Timer.tsx`

**Step 1: Import new components and functions**

```typescript
import { HemingwayTime } from './HemingwayTime'
import { formatHemingwayCumulative, formatHemingwayActive } from '../lib/format'
```

**Step 2: Replace cumulative time display (idle state)**

Find the idle display section (around line 362-377) and replace:

```typescript
// OLD:
<p className="font-serif text-display text-indigo-deep tabular-nums">
  {formatTotalHours(totalSeconds)}
</p>

// NEW:
<HemingwayTime
  seconds={totalSeconds}
  mode="cumulative"
  breathing={true}
  className="text-indigo-deep"
/>
```

**Step 3: Replace running timer display**

Find the running timer display (around line 307-310) and replace:

```typescript
// OLD:
<p className="font-serif text-display text-indigo-deep tabular-nums animate-breathe">
  {formatTimer(elapsed)}
</p>

// NEW:
<HemingwayTime
  seconds={elapsed}
  mode="active"
  className="text-indigo-deep"
/>
```

**Step 4: Verify build and visual**

Run: `npm run dev`
Expected: Timer displays with Hemingway typography (no colons, spacing hierarchy)

**Step 5: Commit**

```bash
git add src/components/Timer.tsx
git commit -m "feat(Timer): integrate HemingwayTime display

- Cumulative: '12 34' format with breathing animation
- Active: expanding stream with opacity hierarchy
- No labels, no colons - pure typographic clarity"
```

---

## Task 8: Implement Timer State Transitions

**Files:**

- Modify: `src/components/Timer.tsx`

**Step 1: Add transition state management**

```typescript
// Add state for managing transitions
const [transitionState, setTransitionState] = useState<
  'idle' | 'exhaling' | 'inhaling' | 'running' | 'merging' | 'settling'
>('idle')

// Track previous total for merge animation
const [previousTotal, setPreviousTotal] = useState(totalSeconds)
const [sessionJustEnded, setSessionJustEnded] = useState(false)
```

**Step 2: Handle start transition (tap to start)**

Update `handleTap` for start transition:

```typescript
const handleTap = useCallback(() => {
  if (timerPhase === 'idle' && transitionState === 'idle') {
    haptic.medium()
    setTransitionState('exhaling')

    // After exhale, pause, then start
    setTimeout(() => {
      setTransitionState('inhaling')
      startTimer() // This now starts immediately (no preparing phase)

      setTimeout(() => {
        setTransitionState('running')
      }, 400)
    }, 600) // 400ms exhale + 200ms pause
  } else if (timerPhase === 'running') {
    haptic.success()
    audio.complete()
    setPreviousTotal(totalSeconds)
    setSessionJustEnded(true)
    stopTimer()
  }
}, [timerPhase, transitionState, startTimer, stopTimer, haptic, audio, totalSeconds])
```

**Step 3: Handle stop transition (merge animation)**

```typescript
// Effect to handle merge animation after session ends
useEffect(() => {
  if (timerPhase === 'complete' && sessionJustEnded && lastSessionDuration) {
    setTransitionState('merging')

    // Merge animation duration
    setTimeout(() => {
      setTransitionState('settling')
      setSessionJustEnded(false)

      // After settle, show insight modal
      setTimeout(() => {
        setTransitionState('idle')
        // Trigger insight modal (we'll add this)
      }, 400)
    }, 800)
  }
}, [timerPhase, sessionJustEnded, lastSessionDuration])
```

**Step 4: Render based on transition state**

Update the render to handle transition states:

```typescript
{/* Transition: Exhaling (cumulative fading out) */}
{transitionState === 'exhaling' && (
  <div className="animate-timer-exhale">
    <HemingwayTime seconds={totalSeconds} mode="cumulative" className="text-indigo-deep" />
  </div>
)}

{/* Transition: Inhaling (first second appearing) */}
{transitionState === 'inhaling' && (
  <div className="animate-timer-inhale">
    <HemingwayTime seconds={0} mode="active" className="text-indigo-deep" />
  </div>
)}

{/* Running state */}
{transitionState === 'running' && isRunning && (
  <HemingwayTime seconds={elapsed} mode="active" className="text-indigo-deep" />
)}

{/* Merging: session rising, cumulative appearing */}
{transitionState === 'merging' && (
  <div className="relative">
    {/* Session value rising away */}
    <div className="animate-session-merge-rise absolute inset-0 flex items-center justify-center">
      <HemingwayTime seconds={lastSessionDuration || 0} mode="active" className="text-indigo-deep" />
    </div>
    {/* New cumulative appearing */}
    <div className="animate-cumulative-merge-in">
      <HemingwayTime seconds={totalSeconds} mode="cumulative" className="text-indigo-deep" />
    </div>
  </div>
)}

{/* Settling: cumulative with single breath */}
{transitionState === 'settling' && (
  <div className="animate-pulse-soft">
    <HemingwayTime seconds={totalSeconds} mode="cumulative" className="text-indigo-deep" />
  </div>
)}

{/* Idle: cumulative breathing */}
{transitionState === 'idle' && timerPhase === 'idle' && (
  <HemingwayTime seconds={totalSeconds} mode="cumulative" breathing={true} className="text-indigo-deep" />
)}
```

**Step 5: Verify build and test transitions**

Run: `npm run dev`
Expected: Smooth transitions between states

**Step 6: Commit**

```bash
git add src/components/Timer.tsx
git commit -m "feat(Timer): implement state transition choreography

- Start: exhale (cumulative) → pause → inhale (active)
- Stop: freeze → merge rise → cumulative appear → settle
- Idle: box breathing on cumulative display"
```

---

## Task 9: Add Welcome Cutscene to App.tsx

**Files:**

- Modify: `src/App.tsx`

**Step 1: Import welcome state and ZenMessage**

```typescript
import { useNavigationStore } from './stores/useNavigationStore'
import { useSessionStore } from './stores/useSessionStore'
import { ZenMessage } from './components/ZenMessage'
```

**Step 2: Add welcome cutscene trigger on mount**

```typescript
// In AppContent, after hasInitialized
const {
  showWelcomeCutscene,
  welcomeCutsceneShown,
  triggerWelcomeCutscene,
  dismissWelcomeCutscene,
} = useNavigationStore()
const { goalCompleted } = useSessionStore()

// Trigger welcome cutscene on first load (after hydration)
useEffect(() => {
  if (!isLoading && !settingsStore.isLoading && !showOnboarding && !welcomeCutsceneShown) {
    triggerWelcomeCutscene()
  }
}, [
  isLoading,
  settingsStore.isLoading,
  showOnboarding,
  welcomeCutsceneShown,
  triggerWelcomeCutscene,
])
```

**Step 3: Render welcome cutscene before main content**

```typescript
// Before the main view rendering
{showWelcomeCutscene && (
  <ZenMessage
    isEnlightened={false}
    goalCompleted={goalCompleted}
    onComplete={dismissWelcomeCutscene}
    variant="welcome"
  />
)}
```

**Step 4: Verify build and test**

Run: `npm run dev`
Expected: Zen message appears on app launch, then fades to timer

**Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat(App): add welcome cutscene on app launch

- Zen message as persistent greeting ritual
- Goal-aware: 'after enlightenment' when goal completed
- Fades into timer tab after animation completes"
```

---

## Task 10: Move Insight Modal to Timer Tab

**Files:**

- Modify: `src/components/Timer.tsx`
- Modify: `src/stores/useNavigationStore.ts`

**Step 1: Update navigation store for timer-based modal**

In `useNavigationStore.ts`, modify `triggerPostSessionFlow`:

```typescript
// Change from navigating to journey to staying on timer
triggerPostSessionFlow: (sessionId, duration, milestone) =>
  set({
    // Remove: view: 'journey',
    pendingInsightSessionId: sessionId,
    pendingInsightSessionDuration: duration,
    pendingMilestone: milestone || null,
    showInsightModal: false, // Will be shown after merge animation
  }),
```

**Step 2: Add insight modal to Timer.tsx**

```typescript
import { InsightModal } from './InsightModal'

// In Timer component, add modal state handling
const {
  pendingInsightSessionId,
  pendingInsightSessionDuration,
  pendingMilestone,
  showInsightModal,
  showInsightCaptureModal,
  hideInsightCaptureModal,
  clearPostSessionState,
} = useNavigationStore()

// Show modal after settle completes
useEffect(() => {
  if (transitionState === 'idle' && pendingInsightSessionId && !showInsightModal) {
    // Delay modal slightly after settle
    const timer = setTimeout(() => {
      showInsightCaptureModal()
    }, 300)
    return () => clearTimeout(timer)
  }
}, [transitionState, pendingInsightSessionId, showInsightModal, showInsightCaptureModal])

// Handler for modal completion
const handleInsightComplete = useCallback(() => {
  hideInsightCaptureModal()
  clearPostSessionState()
  completeSession()
}, [hideInsightCaptureModal, clearPostSessionState, completeSession])

const handleInsightSkip = useCallback(() => {
  hideInsightCaptureModal()
  clearPostSessionState()
  completeSession()
}, [hideInsightCaptureModal, clearPostSessionState, completeSession])

const handleInsightRemindLater = useCallback(() => {
  if (pendingInsightSessionId) {
    createInsightReminder(pendingInsightSessionId)
  }
  hideInsightCaptureModal()
  clearPostSessionState()
  completeSession()
}, [
  pendingInsightSessionId,
  createInsightReminder,
  hideInsightCaptureModal,
  clearPostSessionState,
  completeSession,
])
```

**Step 3: Render insight modal on timer tab**

```typescript
{/* Insight capture modal - stays on timer tab */}
{showInsightModal && pendingInsightSessionId && (
  <InsightModal
    sessionId={pendingInsightSessionId}
    sessionDuration={pendingInsightSessionDuration}
    milestoneMessage={pendingMilestone}
    onComplete={handleInsightComplete}
    onSkip={handleInsightSkip}
    onRemindLater={handleInsightRemindLater}
  />
)}
```

**Step 4: Verify build and test flow**

Run: `npm run dev`
Expected: After meditation, modal appears on timer tab, user stays on timer

**Step 5: Commit**

```bash
git add src/components/Timer.tsx src/stores/useNavigationStore.ts
git commit -m "feat(Timer): insight modal stays on timer tab

- Modal appears after merge animation settles
- User remains on timer tab (home) throughout
- Skip/Capture/Remind all return to breathing timer"
```

---

## Task 11: Remove Preparing Phase (Direct Start)

**Files:**

- Modify: `src/components/Timer.tsx`
- Modify: `src/stores/useSessionStore.ts`

**Step 1: Update Timer to skip preparing phase**

The zen message is now the app welcome, not the pre-session ritual. Remove the preparing phase handling:

```typescript
// Remove this from Timer.tsx render:
{timerPhase === 'preparing' && (
  <ZenMessage
    isEnlightened={hasReachedEnlightenment}
    onComplete={handleZenComplete}
    variant="before"
  />
)}
```

**Step 2: Update handleTap to start directly**

```typescript
const handleTap = useCallback(
  () => {
    if (timerPhase === 'idle' && transitionState === 'idle') {
      haptic.medium()
      setTransitionState('exhaling')

      setTimeout(() => {
        setTransitionState('inhaling')
        startTimer() // Direct start, no preparing phase

        setTimeout(() => {
          setTransitionState('running')
        }, 400)
      }, 600)
    }
    // ... rest unchanged
  },
  [
    /* deps */
  ]
)
```

**Step 3: Remove startPreparing usage**

Remove `startPreparing` from the destructured store values since we no longer use it.

**Step 4: Verify build and test**

Run: `npm run dev`
Expected: Tapping cumulative goes directly to timer (with transition), no zen message in between

**Step 5: Commit**

```bash
git add src/components/Timer.tsx
git commit -m "feat(Timer): remove preparing phase, direct timer start

- Zen message is now app welcome, not pre-session
- Tap cumulative → exhale → inhale → running
- More direct, uninterrupted meditation flow"
```

---

## Task 12: Integration Testing & Polish

**Files:**

- All modified files

**Step 1: Full flow test**

1. Cold start app → Welcome zen message → Fades to cumulative (breathing)
2. Tap cumulative → Exhale transition → Timer starts
3. Wait, then tap → Timer stops → Merge animation → Settle → Modal appears
4. Complete/Skip modal → Back to breathing cumulative
5. Tap again → Repeat cycle

**Step 2: Edge case testing**

- Sub-1-hour cumulative display
- Sub-1-minute active display
- Very long session (hours)
- Rapid tap (prevent double-start)

**Step 3: Reduced motion testing**

Verify `prefers-reduced-motion` disables breathing animations gracefully.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(timer): complete Hemingway timer redesign

- Opening cutscene: zen message as app welcome
- Hemingway typography: no labels, spacing as delimiter
- Active timer: expanding stream with opacity hierarchy
- Transitions: exhale/inhale start, merge/settle stop
- Post-session: insight modal stays on timer tab
- Idle state: 4-4-4-4 box breathing animation"
```

---

## Summary of Files Modified

| File                               | Changes                                                    |
| ---------------------------------- | ---------------------------------------------------------- |
| `src/lib/format.ts`                | Added `formatHemingwayCumulative`, `formatHemingwayActive` |
| `src/lib/__tests__/format.test.ts` | Tests for new format functions                             |
| `src/index.css`                    | Box breathing, timer transition keyframes                  |
| `tailwind.config.js`               | Animation utility classes                                  |
| `src/components/HemingwayTime.tsx` | New component for typographic time display                 |
| `src/components/Timer.tsx`         | Complete refactor with transitions and modal               |
| `src/components/ZenMessage.tsx`    | Added `welcome` variant, `goalCompleted` prop              |
| `src/stores/useSessionStore.ts`    | Added `goalCompleted` state                                |
| `src/stores/useNavigationStore.ts` | Welcome cutscene state, timer-based modal                  |
| `src/App.tsx`                      | Welcome cutscene trigger on launch                         |

---

## Chime Sync Note

The merge transition (800ms rise + 400ms settle = 1.2s) plus modal slide (300ms) = ~1.5s total.

If your chime is longer, extend the `merging` state duration to match. The chime should:

- Start: when session freezes (tap to stop)
- Peak: during merge rise
- Fade: as cumulative settles
