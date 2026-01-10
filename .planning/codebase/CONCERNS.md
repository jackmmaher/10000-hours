# Codebase Concerns

**Analysis Date:** 2026-01-10

## Critical Bug: "Plan Your Next Meditation" Shows Stale Completed Session

**Files:**
- `src/lib/db.ts` (lines 648-667) - `getNextPlannedSession()` function
- `src/components/Journey.tsx` (lines 177-191) - `loadNextPlan()` effect
- `src/stores/useSessionStore.ts` (lines 114-129) - `linkSessionToPlan()` call

**Symptoms:**
- User planned meditation for Jan 9, completed it on Jan 9
- "Plan Your Next Meditation" element still showed the completed plan details on Jan 9
- Only reset on Jan 10 when the date changed

**Root Cause Analysis:**

The bug is in `getNextPlannedSession()` in `src/lib/db.ts`:

```typescript
// Current code (line 661)
if (p.completed || p.linkedSessionUuid) return false
```

This correctly filters out completed plans. However, the issue is in `Journey.tsx` lines 179-191:

```typescript
const loadNextPlan = async () => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const todayHasSession = dateHasSession(sessions, now)

  // If today has a session, skip today's plans
  const skipDate = todayHasSession ? now.getTime() : undefined
  const nextPlan = await getNextPlannedSession(skipDate)
  setNextPlannedSession(nextPlan || null)
}
```

**The actual bug:** When a session is completed, `linkSessionToPlan()` is called which sets `completed: true` and `linkedSessionUuid` on the plan. However:

1. **Race condition:** The `sessions` state update may not have propagated when `loadNextPlan` runs
2. **Effect dependencies:** `loadNextPlan` runs on `[sessions, plansRefreshKey]` but the issue is timing - the plan is marked completed in DB but the component may have cached the old plan in state before the effect re-runs

**Why it "fixed itself" the next day:**
- On Jan 10, `getNextPlannedSession()` queries for plans `>= today` (Jan 10)
- The Jan 9 plan is now in the past and excluded by the date filter, so it's no longer returned

**Proposed Fix:**

Option A: Force state refresh after session completion
```typescript
// In useSessionStore.ts after linkSessionToPlan()
// Trigger a refresh key that Journey.tsx listens to
```

Option B: Verify plan freshness in JourneyNextSession
```typescript
// Check if the plan's date is in the past - if so, treat as no plan
if (plannedSession && plannedSession.date < todayStart) {
  // Stale plan from a past day - shouldn't be shown
  return null
}
```

Option C: Query by both date AND completed status more strictly
```typescript
// In getNextPlannedSession() - also filter by date being today or future
.filter(p => !p.completed && !p.linkedSessionUuid && p.date >= todayStart)
```

**Impact:** User cannot plan new sessions until stale data clears naturally
**Priority:** High - affects core user flow

---

## Tech Debt

**Large Component Files:**
- Issue: Several components exceed 400+ lines
- Files: `src/components/MeditationPlanner.tsx` (810 lines), `src/components/Journey.tsx` (587 lines)
- Why: Feature-rich components with multiple sub-features
- Impact: Harder to navigate and maintain
- Fix approach: Extract sub-components (e.g., SessionSelector, PlanForm, DurationPicker)

**Lazy Import Wrappers:**
- Issue: Multiple wrapper components for lazy loading modals
- File: `src/components/Journey.tsx` (lines 405-586) - 4 wrapper components
- Why: Dynamic imports for code splitting
- Impact: Boilerplate code, verbose
- Fix approach: Create generic LazyModal wrapper

---

## Known Bugs

**See Critical Bug above for the main issue.**

---

## Security Considerations

**No Critical Issues Detected**

The app is offline-first with optional cloud sync. Security posture is good:
- Supabase handles auth securely
- No sensitive data exposed client-side
- IndexedDB data is local to device

---

## Performance Bottlenecks

**No Critical Bottlenecks Detected**

- IndexedDB queries are fast for typical data sizes
- Zustand state management is efficient
- PWA caching reduces network dependency

---

## Fragile Areas

**Session-Plan Linking Logic:**
- File: `src/lib/db.ts` lines 674-697 (`linkSessionToPlan`)
- Why fragile: Complex date matching between session timestamps and plan dates
- Common failures: Timezone issues, timestamp format mismatches
- Safe modification: Add comprehensive tests before changing
- Test coverage: No tests for `linkSessionToPlan()`

**Plan State Synchronization:**
- Files: `src/components/Journey.tsx`, `src/lib/db.ts`
- Why fragile: Multiple places update/query plan state (Journey, Timer completion, MeditationPlanner)
- Common failures: Stale state shown (as seen in the bug)
- Safe modification: Ensure all state updates trigger proper refreshes
- Test coverage: No tests

---

## Test Coverage Gaps

**Session-Plan Linking:**
- What's not tested: `linkSessionToPlan()`, `getNextPlannedSession()`, `relinkOrphanedPlans()`
- Files: `src/lib/db.ts`
- Risk: Bugs in session completion flow go unnoticed (as happened)
- Priority: High
- Difficulty: Requires fake-indexeddb setup with complex scenarios

**Journey Tab State:**
- What's not tested: `Journey.tsx` plan loading and refresh logic
- Risk: Stale state bugs
- Priority: High
- Difficulty: Requires React testing library with mocked db

**Component Integration:**
- What's not tested: Timer → Session completion → Plan linking → Journey refresh
- Risk: Integration bugs between components
- Priority: Medium
- Difficulty: Would need e2e tests (Playwright)

---

## Missing Critical Features

**None blocking** - app is functional

---

## Dependencies at Risk

**vite-plugin-pwa:**
- Risk: PWA ecosystem evolves rapidly
- Impact: Service worker updates could break caching
- Migration plan: Monitor Workbox releases

---

*Concerns audit: 2026-01-10*
*Update as issues are fixed or new ones discovered*
