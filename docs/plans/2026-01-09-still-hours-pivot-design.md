# Still Hours Pivot — Design Document (v2)

**Date:** 2026-01-09
**Status:** Ready for implementation (after Supabase backend work completes)
**Scope:** Brand rename + variable goal system + adaptive milestones
**Complexity:** Medium

---

## Executive Summary

Transform "10,000 Hours" into "Still Hours" — a meditation practice tracker that supports all practitioners regardless of their goal. Remove the fixed 10,000-hour ceiling. Let users optionally set their own destination. Keep the "fog of war" approach where only the current milestone is visible.

### Core Principles

1. **Subtraction over addition** — Remove anxiety-inducing elements, don't replace them
2. **Fog of war** — Users only see current milestone + past achievements, never the full journey
3. **Optional destination** — Default is infinite practice; goal-setting is opt-in personalization
4. **Logarithmic milestones** — Quick wins early, then spacing increases toward goal
5. **Seamless extension** — When goals are reached, past achievements persist, new milestones stitch on

---

## Part 1: Brand Rename

### Files to Update

| File | Change |
|------|--------|
| `src/components/Settings.tsx:521` | Footer text `"10,000 Hours"` → `"Still Hours"` |
| `package.json` | `name` field |
| `index.html` | `<title>` tag |
| PWA manifest | App name |

### Database Name Decision

**Keep `'10000hours'` as IndexedDB name** — it's an internal implementation detail, not user-facing. Renaming risks data loss with no benefit.

---

## Part 2: Remove Fixed Goal Reference

### Timer Screen

**File:** `src/components/Timer.tsx`

**Lines 327-330 — DELETE entirely:**
```tsx
<p className="text-sm text-indigo-deep/40 mt-2">
  toward 10,000 hours
</p>
```

### Constants File

**File:** `src/lib/constants.ts`

```typescript
// BEFORE
export const GOAL_HOURS = 10000
export const GOAL_SECONDS = GOAL_HOURS * 3600

// AFTER
// Default for projection calculations when no user goal set
// NOT shown to users — internal fallback only
export const DEFAULT_GOAL_HOURS = 10000
export const DEFAULT_GOAL_SECONDS = DEFAULT_GOAL_HOURS * 3600
```

---

## Part 3: User-Defined Practice Goal

### Database Schema

**File:** `src/lib/db.ts`

**Add to `UserPreferences` interface:**
```typescript
interface UserPreferences {
  // ... existing fields ...

  /**
   * User's practice goal in hours.
   * - undefined/null = infinite mode (no ceiling, milestones continue forever)
   * - number = specific goal (25, 50, 100, etc.)
   */
  practiceGoalHours?: number
}
```

### Goal Presets

```typescript
export const GOAL_PRESETS = [25, 50, 100, 250, 500, 1000, 2500, 5000, 10000] as const
```

---

## Part 4: Adaptive Milestone Algorithm

### Current State (To Remove)

**TWO places define milestones — BOTH need updating:**

1. `src/lib/tierLogic.ts:79`:
```typescript
export const MILESTONES = [
  2, 5, 10, 25, 50, 100, 250, 500, 750,
  1000, 1500, 2000, 2500, 3500, 5000, 6500, 7500, 8500, 10000
]
```

2. `src/lib/calculations.ts:104`:
```typescript
const MILESTONE_HOURS = [
  2, 5, 10, 25, 50, 100,
  250, 500, 750, 1000,
  // ...
]
```

### New Implementation

**File:** `src/lib/milestones.ts` (NEW FILE)

```typescript
/**
 * Milestone generation for Still Hours
 *
 * Principles:
 * - Round numbers only (no 17h or 33h)
 * - Prefer even numbers where possible
 * - Logarithmic: dense at start, sparse toward end
 * - Universal early wins: 2h, 5h, 10h always exist
 */

export const GOAL_PRESETS = [25, 50, 100, 250, 500, 1000, 2500, 5000, 10000] as const

/**
 * Infinite mode milestone sequence.
 * Used when user has no explicit goal.
 */
const INFINITE_MILESTONES = [
  2, 5, 10, 25, 50, 100,
  150, 200, 250, 300, 400, 500,
  750, 1000, 1500, 2000, 2500,
  3000, 4000, 5000, 6000, 7500,
  10000, 15000, 20000, 25000, 50000, 100000
]

/**
 * Generate milestones based on user's practice goal.
 *
 * @param goalHours - User's goal, or undefined for infinite mode
 * @returns Array of milestone hours
 */
export function generateMilestones(goalHours?: number): number[] {
  if (!goalHours) {
    return INFINITE_MILESTONES
  }

  const earlyWins = [2, 5, 10]
  const milestones: number[] = []

  // Add early wins below goal
  for (const m of earlyWins) {
    if (m < goalHours) {
      milestones.push(m)
    }
  }

  // Generate percentage-based milestones (~20%, ~40%, ~60%, ~80%)
  const percentages = [0.2, 0.4, 0.6, 0.8]

  for (const pct of percentages) {
    const raw = goalHours * pct
    const rounded = roundToNiceNumber(raw)
    const last = milestones[milestones.length - 1] || 0

    if (rounded > last && rounded < goalHours) {
      milestones.push(rounded)
    }
  }

  // Always end with goal
  milestones.push(goalHours)

  return milestones
}

/**
 * Generate milestones for goal extension.
 * Returns only NEW milestones between previous goal and new goal.
 *
 * @param previousGoal - The goal user just completed
 * @param newGoal - The extended goal
 * @returns Array of new milestone hours (excludes already-achieved)
 */
export function generateExtensionMilestones(
  previousGoal: number,
  newGoal: number
): number[] {
  const fullMilestones = generateMilestones(newGoal)
  return fullMilestones.filter(m => m > previousGoal)
}

/**
 * Round to "nice" numbers for milestones.
 */
function roundToNiceNumber(n: number): number {
  if (n <= 10) return Math.round(n / 5) * 5 || 5
  if (n <= 50) return Math.round(n / 5) * 5
  if (n <= 100) return Math.round(n / 25) * 25
  if (n <= 500) return Math.round(n / 50) * 50
  if (n <= 1000) return Math.round(n / 100) * 100
  return Math.round(n / 250) * 250
}

/**
 * Get the next milestone for given hours and goal.
 */
export function getNextMilestone(
  currentHours: number,
  goalHours?: number
): number | null {
  const milestones = generateMilestones(goalHours)
  return milestones.find(m => m > currentHours) ?? null
}

/**
 * Get the previous milestone (most recently achieved).
 */
export function getPreviousMilestone(
  currentHours: number,
  goalHours?: number
): number {
  const milestones = generateMilestones(goalHours)
  const achieved = milestones.filter(m => m <= currentHours)
  return achieved[achieved.length - 1] || 0
}
```

### Expected Outputs

| Goal | Generated Milestones |
|------|---------------------|
| 25h | 2, 5, 10, 15, 20, **25** |
| 50h | 2, 5, 10, 20, 30, 40, **50** |
| 100h | 2, 5, 10, 25, 50, 75, **100** |
| 250h | 2, 5, 10, 50, 100, 150, 200, **250** |
| 500h | 2, 5, 10, 100, 200, 300, 400, **500** |
| 1000h | 2, 5, 10, 200, 400, 600, 800, **1000** |
| No goal | 2, 5, 10, 25, 50, 100, 150, 200... (infinite) |

---

## Part 5: Update tierLogic.ts

**File:** `src/lib/tierLogic.ts`

```typescript
// REMOVE the hardcoded MILESTONES array (lines 79-82)

// IMPORT from new milestones module
import { generateMilestones, getNextMilestone, getPreviousMilestone } from './milestones'

// UPDATE getLastAchievedMilestone to accept goal parameter
export function getLastAchievedMilestone(
  totalHours: number,
  goalHours?: number
): { achieved: number; name: string } | null {
  const milestones = generateMilestones(goalHours)
  const achieved = milestones.filter(m => totalHours >= m).pop()

  if (!achieved) return null

  const name = achieved >= 1000
    ? `${achieved / 1000}k hours`
    : `${achieved} hours`

  return { achieved, name }
}

// DEPRECATION: Export generateMilestones for backward compatibility
export { generateMilestones, GOAL_PRESETS } from './milestones'
```

---

## Part 6: Update calculations.ts

**File:** `src/lib/calculations.ts`

### Remove Internal MILESTONE_HOURS

Delete lines 104-111 (the internal `MILESTONE_HOURS` array).

### Update getAdaptiveMilestone

```typescript
import { generateMilestones, getNextMilestone, getPreviousMilestone } from './milestones'

export function getAdaptiveMilestone(
  sessions: Session[],
  goalHours?: number  // NEW PARAMETER
): AdaptiveMilestone {
  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0)
  const currentHours = totalSeconds / 3600

  const targetHours = getNextMilestone(currentHours, goalHours)
  const prevMilestone = getPreviousMilestone(currentHours, goalHours)

  // Handle completion (no next milestone)
  if (!targetHours) {
    return {
      currentHours: Math.round(currentHours * 10) / 10,
      targetHours: goalHours || currentHours,
      progressPercent: 100,
      milestoneName: 'Complete',
      currentFormatted: formatHoursCompact(currentHours),
      targetFormatted: goalHours ? `${goalHours}h` : '∞'
    }
  }

  // Calculate progress within milestone band
  const progressInBand = currentHours - prevMilestone
  const bandSize = targetHours - prevMilestone
  const progressPercent = bandSize > 0 ? (progressInBand / bandSize) * 100 : 100

  const milestoneName = targetHours >= 1000
    ? `${(targetHours / 1000).toFixed(targetHours % 1000 === 0 ? 0 : 1)}k hours`
    : `${targetHours} hours`

  return {
    currentHours: Math.round(currentHours * 10) / 10,
    targetHours,
    progressPercent: Math.min(100, Math.round(progressPercent * 10) / 10),
    milestoneName,
    currentFormatted: formatHoursCompact(currentHours),
    targetFormatted: `${targetHours}h`
  }
}
```

### Update getProjection

```typescript
export function getProjection(
  sessions: Session[],
  goalHours?: number  // NEW PARAMETER
): ProjectionInsight {
  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0)

  // Use user goal or default for calculations
  const effectiveGoalSeconds = goalHours
    ? goalHours * 3600
    : DEFAULT_GOAL_SECONDS

  const remainingSeconds = Math.max(0, effectiveGoalSeconds - totalSeconds)
  const remainingHours = remainingSeconds / 3600
  const percentComplete = goalHours
    ? (totalSeconds / effectiveGoalSeconds) * 100
    : null  // No percent in infinite mode

  // ... rest of function with goalHours awareness
}
```

---

## Part 7: Update useSessionStore.ts

**File:** `src/stores/useSessionStore.ts`

### Critical Changes to stopTimer()

```typescript
import { generateMilestones } from '../lib/milestones'
import { getUserPreferences } from '../lib/db'

// In stopTimer():
stopTimer: async () => {
  const { startedAt, sessionStartTime, totalSeconds, sessions, hasReachedEnlightenment } = get()

  if (!startedAt || !sessionStartTime) return

  const elapsed = performance.now() - startedAt
  const durationSeconds = Math.floor(elapsed / 1000)

  if (durationSeconds < 1) {
    set({ timerPhase: 'idle', startedAt: null, sessionStartTime: null })
    return
  }

  // ... session creation code ...

  const newTotalSeconds = totalSeconds + durationSeconds
  const newTotalHours = newTotalSeconds / 3600

  // GET USER'S GOAL (NEW)
  const userPrefs = await getUserPreferences()
  const userGoalHours = userPrefs?.practiceGoalHours

  // GENERATE DYNAMIC MILESTONES (CHANGED)
  const milestones = generateMilestones(userGoalHours)
  const achievedMilestone = await recordMilestoneIfNew(newTotalHours, milestones)

  // CHECK GOAL COMPLETION (CHANGED)
  // Only trigger enlightenment if user has a goal AND reached it
  const userGoalSeconds = userGoalHours ? userGoalHours * 3600 : null
  const crossedThreshold = userGoalSeconds
    && !hasReachedEnlightenment
    && newTotalSeconds >= userGoalSeconds

  if (crossedThreshold) {
    await markEnlightenmentReached()
    set({
      timerPhase: 'enlightenment',
      // ... rest unchanged
    })
  } else {
    set({
      timerPhase: 'complete',
      // ... rest unchanged
    })
  }
}
```

---

## Part 8: Update AchievementGallery.tsx

**File:** `src/components/AchievementGallery.tsx`

```typescript
import { generateMilestones } from '../lib/milestones'
import { getUserPreferences } from '../lib/db'

export function AchievementGallery() {
  const { sessions, totalSeconds } = useSessionStore()
  const [userGoalHours, setUserGoalHours] = useState<number | undefined>()

  // Load user's goal
  useEffect(() => {
    getUserPreferences().then(prefs => {
      setUserGoalHours(prefs?.practiceGoalHours)
    })
  }, [])

  // Get milestone progress with user's goal
  const milestone = useMemo(
    () => getAdaptiveMilestone(sessions, userGoalHours),
    [sessions, userGoalHours]
  )

  // Get milestones for display
  const displayMilestones = useMemo(() => {
    const milestones = generateMilestones(userGoalHours)
    const currentHours = totalSeconds / 3600
    const nextIndex = milestones.findIndex(m => m > currentHours)
    const nextMilestone = nextIndex >= 0 ? milestones[nextIndex] : null
    // ... rest of logic
  }, [achievements, totalSeconds, userGoalHours])

  // ... rest of component
}
```

---

## Part 9: Goal-Setting UI in Profile

**File:** `src/components/Profile.tsx`

### Add State and Handlers

```typescript
const [showGoalSettings, setShowGoalSettings] = useState(false)
const [currentHours, setCurrentHours] = useState(0)

// Calculate current hours
useEffect(() => {
  const hours = sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 3600
  setCurrentHours(hours)
}, [sessions])

// Handle goal change
const handleGoalChange = async (goal: number | undefined) => {
  haptic.light()
  await updateUserPreferences({ practiceGoalHours: goal })
  setPreferences(prev => prev ? { ...prev, practiceGoalHours: goal } : null)
}
```

### UI Component (Theme-Aware)

```tsx
{/* Practice Goal - between Meditation Preferences and Wellbeing */}
<div className="mb-6">
  <button
    onClick={() => {
      haptic.light()
      setShowGoalSettings(!showGoalSettings)
    }}
    className="w-full flex items-center justify-between p-4 bg-card/90 backdrop-blur-md border border-ink/5 shadow-sm
      rounded-xl hover:bg-card/95 hover:shadow-md transition-all touch-manipulation cursor-pointer"
  >
    <div className="text-left">
      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        Practice Goal
      </p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
        {preferences?.practiceGoalHours
          ? `${preferences.practiceGoalHours} hours`
          : 'No limit — milestones continue forever'}
      </p>
    </div>
    <svg
      className={`w-5 h-5 transition-transform ${showGoalSettings ? 'rotate-180' : ''}`}
      style={{ color: 'var(--text-muted)' }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {showGoalSettings && (
    <div className="mt-3 p-4 rounded-xl space-y-4" style={{ background: 'var(--surface-secondary)' }}>
      {/* Current progress indicator */}
      <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
        Your practice: {Math.floor(currentHours)} hours
      </p>

      {/* No limit option */}
      <button
        onClick={() => handleGoalChange(undefined)}
        className="w-full p-3 rounded-lg text-left transition-colors touch-manipulation cursor-pointer"
        style={{
          background: !preferences?.practiceGoalHours ? 'var(--accent-primary)' : 'var(--surface-primary)',
          color: !preferences?.practiceGoalHours ? 'var(--text-on-accent)' : 'var(--text-secondary)'
        }}
      >
        <p className="text-sm font-medium">No limit</p>
        <p className="text-xs mt-0.5 opacity-70">
          Milestones appear as you progress, forever
        </p>
      </button>

      {/* Goal presets */}
      <div>
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
          Set a destination
        </p>
        <div className="flex flex-wrap gap-2">
          {GOAL_PRESETS.map(goal => {
            const isSelected = preferences?.practiceGoalHours === goal
            const isAchieved = goal <= currentHours
            const isDisabled = isAchieved && !isSelected

            return (
              <button
                key={goal}
                onClick={() => !isDisabled && handleGoalChange(goal)}
                disabled={isDisabled}
                aria-label={`Set goal to ${goal} hours${isAchieved ? ' (already achieved)' : ''}`}
                className="px-3 py-1.5 text-xs rounded-lg transition-colors touch-manipulation"
                style={{
                  background: isSelected
                    ? 'var(--accent-primary)'
                    : isDisabled
                      ? 'var(--surface-disabled)'
                      : 'var(--surface-primary)',
                  color: isSelected
                    ? 'var(--text-on-accent)'
                    : isDisabled
                      ? 'var(--text-disabled)'
                      : 'var(--text-secondary)',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.5 : 1
                }}
              >
                {goal >= 1000 ? `${goal/1000}k` : goal}h
                {isAchieved && !isSelected && ' ✓'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Explainer text */}
      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        Setting a destination helps celebrate your progress. When you arrive, you can extend further.
      </p>
    </div>
  )}
</div>
```

---

## Part 10: Goal Reached Experience

### When User Completes Their Goal

**Trigger:** `totalHours >= practiceGoalHours` (only if goal is set)

**UX Flow:**

1. **Zen Message** — Same as current enlightenment, using `ZEN_MESSAGE_AFTER`
2. **Post-celebration state** — Timer returns to idle
3. **Next session** — User can continue practicing, but no more "enlightenment" triggers
4. **Extension option** — User can increase goal in Profile settings

### Goal-Aware Celebration Messages (Future Enhancement)

For now, use existing zen messages. Future consideration:
- Small goals (≤100h): Simpler acknowledgment
- Large goals (≥1000h): Full zen experience

---

## Part 11: Historical Achievement Integrity

### Goal Extension Behavior

When user extends from 50h to 100h:

1. **Existing achievements preserved:** 2, 5, 10, 20, 30, 40, 50 remain in database
2. **New milestones generated:** Full 100h milestone set
3. **Progress shows:** Next unachieved milestone from new set
4. **Gap handling:** If 100h set has 25h milestone but user never achieved it, that's okay — achievements reflect the goal at time of achievement

### Design Decision

Achievements are a historical record. They reflect what milestones existed when achieved. Changing goals doesn't retroactively add/remove achievements.

---

## Part 12: Test Updates

**File:** `src/lib/__tests__/milestones.test.ts` (NEW)

```typescript
import {
  generateMilestones,
  generateExtensionMilestones,
  getNextMilestone,
  getPreviousMilestone
} from '../milestones'

describe('generateMilestones', () => {
  it('returns infinite sequence when no goal', () => {
    const milestones = generateMilestones()
    expect(milestones).toContain(2)
    expect(milestones).toContain(100)
    expect(milestones).toContain(10000)
    expect(milestones.length).toBeGreaterThan(20)
  })

  it('includes early wins for small goals', () => {
    const milestones = generateMilestones(50)
    expect(milestones).toContain(2)
    expect(milestones).toContain(5)
    expect(milestones).toContain(10)
  })

  it('ends with the goal', () => {
    expect(generateMilestones(50).pop()).toBe(50)
    expect(generateMilestones(100).pop()).toBe(100)
    expect(generateMilestones(1000).pop()).toBe(1000)
  })

  it('uses round numbers only', () => {
    const milestones = generateMilestones(500)
    for (const m of milestones) {
      expect(m % 5).toBe(0) // All divisible by 5
    }
  })

  it('handles edge case: goal smaller than early wins', () => {
    const milestones = generateMilestones(5)
    expect(milestones).toEqual([2, 5])
  })
})

describe('generateExtensionMilestones', () => {
  it('returns only new milestones', () => {
    const extension = generateExtensionMilestones(50, 100)
    expect(extension.every(m => m > 50)).toBe(true)
    expect(extension).toContain(100)
  })
})

describe('getNextMilestone', () => {
  it('returns next milestone for given hours', () => {
    expect(getNextMilestone(0)).toBe(2)
    expect(getNextMilestone(3)).toBe(5)
    expect(getNextMilestone(10)).toBe(25)
  })

  it('respects user goal', () => {
    expect(getNextMilestone(40, 50)).toBe(50)
    expect(getNextMilestone(50, 50)).toBe(null) // At goal
  })
})
```

**File:** `src/lib/__tests__/tierLogic.test.ts` (UPDATE)

```typescript
// Remove tests for fixed MILESTONES array
// Add tests for getLastAchievedMilestone with goal parameter

describe('getLastAchievedMilestone', () => {
  it('returns null for zero hours', () => {
    expect(getLastAchievedMilestone(0)).toBeNull()
  })

  it('returns correct milestone with goal', () => {
    const result = getLastAchievedMilestone(35, 50)
    expect(result?.achieved).toBe(30) // Based on 50h milestone set
  })

  it('works in infinite mode', () => {
    const result = getLastAchievedMilestone(150)
    expect(result?.achieved).toBe(100)
  })
})
```

---

## Part 13: Files Changed Summary (Complete)

| File | Changes | Effort |
|------|---------|--------|
| `src/lib/milestones.ts` | **NEW FILE** — milestone generation logic | Small |
| `src/lib/constants.ts` | Rename `GOAL_HOURS` → `DEFAULT_GOAL_HOURS` | Trivial |
| `src/lib/calculations.ts` | Remove `MILESTONE_HOURS`, update `getAdaptiveMilestone()`, update `getProjection()` | Medium |
| `src/lib/tierLogic.ts` | Remove `MILESTONES`, update `getLastAchievedMilestone()`, add re-exports | Small |
| `src/lib/db.ts` | Add `practiceGoalHours?: number` to `UserPreferences` | Trivial |
| `src/stores/useSessionStore.ts` | Update `stopTimer()` with dynamic milestones and goal-aware enlightenment | Medium |
| `src/components/Timer.tsx` | Delete "toward 10,000 hours" text (lines 327-330) | Trivial |
| `src/components/Profile.tsx` | Add "Practice Goal" section with theme-aware UI | Medium |
| `src/components/Settings.tsx` | Update footer to "Still Hours" | Trivial |
| `src/components/AchievementGallery.tsx` | Load user goal, pass to milestone functions | Small |
| `src/lib/__tests__/milestones.test.ts` | **NEW FILE** — tests for milestone generation | Small |
| `src/lib/__tests__/tierLogic.test.ts` | Update tests for new function signatures | Small |
| `index.html` | Update `<title>` | Trivial |
| PWA manifest | Update app name | Trivial |

**Files NOT changed:**
- `src/lib/db.ts` database name (kept as `'10000hours'`)
- `src/components/MilestoneCelebration.tsx` (works as-is)
- `src/components/ZenMessage.tsx` (works as-is)
- Supabase schema (goal is local-only)

---

## Part 14: Migration & Upgrade Path

### For Existing Users (v2.x → v3.0)

1. **No data loss** — All sessions, achievements, insights preserved
2. **Default to infinite mode** — `practiceGoalHours` undefined = infinite
3. **Existing achievements persist** — No recalculation
4. **No user action required** — App works identically until they set a goal

### Version

- Current: v2.1.0
- New: v3.0.0 (major version for brand + feature change)

---

## Part 15: Testing Checklist

### Unit Tests
- [ ] `generateMilestones()` with various goals
- [ ] `generateMilestones()` with no goal (infinite)
- [ ] `generateExtensionMilestones()` for goal increases
- [ ] `getNextMilestone()` and `getPreviousMilestone()`
- [ ] `getAdaptiveMilestone()` with goal parameter
- [ ] `getLastAchievedMilestone()` with goal parameter

### Integration Tests
- [ ] New user: infinite mode, milestones appear naturally
- [ ] New user: sets 50h goal, sees appropriate milestones
- [ ] Existing user: upgrade preserves all data
- [ ] Existing user: sets goal, milestones recalculate display
- [ ] Goal reached: enlightenment triggers correctly
- [ ] Goal extended: past achievements persist, new appear
- [ ] Infinite mode user: never sees enlightenment

### UI Tests
- [ ] Timer: no "toward X" text visible
- [ ] Profile: goal section expands/collapses
- [ ] Profile: disabled states for achieved goals
- [ ] Profile: theme contrast in all 20+ themes
- [ ] Settings footer: shows "Still Hours"
- [ ] PWA: app name updated
- [ ] Accessibility: screen reader can navigate goal selection

---

## Part 16: Known Edge Cases

| Scenario | Behavior |
|----------|----------|
| User has 75h, wants 50h goal | 50h shown as achieved/disabled |
| User sets goal = current hours | Immediate completion state, can extend |
| User in infinite mode passes 100k hours | Shows next milestone from infinite array |
| User extends 50→100h | New milestones (60, 75, 100) appear, 50h achievement stays |
| User removes goal (was 100h, now infinite) | Achievements stay, infinite milestones resume |

---

## Appendix: Theme Token Reference

Use these CSS variables for theme compatibility:

```css
/* Text */
--text-primary      /* Main text */
--text-secondary    /* Secondary text */
--text-muted        /* Subtle text */
--text-disabled     /* Disabled state */
--text-on-accent    /* Text on accent backgrounds */

/* Surfaces */
--surface-primary   /* Main surface (cards) */
--surface-secondary /* Secondary surface */
--surface-disabled  /* Disabled surface */

/* Accents */
--accent-primary    /* Selected/active state (replaces bg-moss) */
```

---

**End of Design Document v2**

**Status:** Ready for implementation after Supabase backend work completes.
