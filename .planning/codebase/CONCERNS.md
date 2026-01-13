# Concerns

**Analysis Date:** 2026-01-10 (updated 2026-01-13)

## Journey Tab Critical Issues

### Modal Cards Don't Handle Multi-Daypart States

**Files:**

- `src/components/MeditationPlanner/usePlannerState.ts` (lines 92-116)
- `src/components/MeditationPlanner/DayItemsCarousel.tsx`

**Issue:** The `dayItems` array combines past sessions + future plans, but the UI doesn't properly distinguish or handle the transition between "reviewing past session" mode and "planning future session" mode.

**Root Cause:**

```typescript
// usePlannerState.ts line 127
const isSessionMode = currentItem?.type === 'session'
```

This boolean is used to toggle between editing session metadata vs planning, but:

1. A day can have BOTH past sessions AND upcoming plans
2. Swiping between them doesn't reset the form state appropriately
3. The form fields (pose, discipline, notes) use conditional routing that can leak state

**Impact:**

- User confusion when switching between past/future items
- Form data from past session may bleed into plan creation
- "Add New Plan" button behavior unclear when sessions exist

**Fix Approach:**

- Add explicit "viewing" vs "editing" state separate from `isSessionMode`
- Clear form state when switching between items of different types
- Visual differentiation between session review cards and plan cards

### Planning Events Don't Propagate to CTA

**Files:**

- `src/components/Journey/index.tsx` - state owner
- `src/components/NextSessionSpotlight.tsx` - CTA consumer
- `src/components/MeditationPlanner/index.tsx` - plan creation

**Issue:** When user creates a plan in MeditationPlanner, the NextSessionSpotlight CTA doesn't update until manual refresh or remount.

**Root Cause:**

```
MeditationPlanner.handleSave()
  └── calls onSave() callback
      └── Journey.refreshAllPlanData()
          └── Should update nextPlannedSession state
              └── BUT: async timing or key-based refresh may not trigger re-render
```

**Impact:**

- User plans a session but CTA still shows "No session planned"
- Confusing UX - seems like plan wasn't saved

**Fix Approach:**

- Verify `refreshAllPlanData()` in `Journey/index.tsx` properly re-fetches `getNextPlannedSession()`
- Ensure `nextPlannedSession` state triggers NextSessionSpotlight re-render
- Consider optimistic update in CTA before async refresh completes

### Planning Doesn't Propagate to Meditations Tab

**Files:**

- `src/components/Journey/index.tsx` - manages sub-tabs
- `src/components/JourneySavedContent.tsx` - meditations tab

**Issue:** Creating a plan doesn't update the "Meditations this week" or "Upcoming meditations" sections in the sub-tabs.

**Root Cause:**

- JourneySavedContent fetches its own data independently
- No shared state refresh mechanism between planner and sub-tab content
- `plansRefreshKey` prop may not trigger reload in all child components

**Impact:**

- User creates plan, switches to "Meditations" tab, doesn't see new plan
- Data inconsistency across Journey tab sections

**Fix Approach:**

- Lift state refresh to Journey/index.tsx level
- Pass `plansRefreshKey` or refresh callback to JourneySavedContent
- Or use a shared hook that all components subscribe to

### Pearl Saving Not Persisted to Database

**Files:**

- `src/components/JourneyMyPearls.tsx` - pearl display
- `src/components/MeditationPlanner/PearlPicker.tsx` - pearl selection
- `src/lib/pearls.ts` - Supabase operations

**Issue:** The "Save a Pearl" feature (attaching pearls to planned sessions) doesn't persist to the database properly.

**Root Cause Analysis:**

1. `PearlPicker.onSelect()` calls `usePlannerState.handlePearlSelect()`
2. `handlePearlSelect()` sets `attachedPearl` state (line 476-481)
3. `handleSave()` passes `attachedPearlId: attachedPearl?.id` to `addPlannedSession()` or `updatePlannedSession()`
4. **POTENTIAL ISSUE:** The pearl attachment is saved to IndexedDB (`PlannedSession.attachedPearlId`), but:
   - No verification the pearl ID is valid
   - No Supabase sync of the attachment relationship
   - `attachedPearlId` field may not be indexed or queried

**Additional Issue in JourneyMyPearls.tsx:**

```typescript
// Line 31-47: loadPearls() fetches from Supabase
const { getMyPearls, getSavedPearls } = await import('../lib/pearls')
```

This only loads pearls from Supabase - doesn't show pearls created locally without sync.

**Impact:**

- User attaches pearl to plan, but relationship not visible elsewhere
- Pearl-plan associations lost on app reinstall (no cloud sync)
- "My Pearls" section may miss locally-created pearls

**Fix Approach:**

- Verify `attachedPearlId` is properly saved in IndexedDB PlannedSession
- Add Supabase sync for pearl-plan relationships
- Consider storing pearl text inline in plan for offline resilience

### Above-the-Fold UI Component Mess

**Files:**

- `src/components/Journey/index.tsx` (lines 1-200 approx)
- `src/components/NextSessionSpotlight.tsx`
- `src/components/WeekStones.tsx`

**Issues Identified:**

1. **Inconsistent State Sources:**
   - `NextSessionSpotlight` receives `plannedSession` from parent
   - `WeekStonesRow` computes `weekDays` from `weekPlans + sessions`
   - `Calendar` has its own internal fetch via `refreshKey`
   - No single source of truth

2. **Refresh Mechanism Fragility:**
   - Uses `plansRefreshKey` counter to force re-renders
   - Some components don't respond to key changes
   - Race conditions between fetches

3. **Layout Coupling:**
   - `NextSessionSpotlight` takes 60vh fixed height
   - Doesn't adapt to content or screen size
   - Scroll position management hardcoded

**Impact:**

- Data inconsistencies between visible sections
- Stale data after mutations
- Layout issues on different devices

**Fix Approach:**

- Centralize plan/session state in Journey/index.tsx with single fetch
- Pass computed values down (no child fetching)
- Replace `refreshKey` pattern with proper state management
- Make spotlight height responsive to content

## Technical Debt

### Large Files

**Theme Engine:**

- `src/lib/themeEngine.ts` - 90,663 bytes (very large)
- Contains massive color/effect calculations
- Could be split into smaller modules

**Ambient Atmosphere:**

- `src/components/AmbientAtmosphere.tsx` - 57,462 bytes
- Gen 2 DOM-based particle system
- Being evaluated for Canvas upgrade (Level 2)

### Living Theme Performance

**Current State (Level 1):**

- DOM-based CSS animations
- Limited to ~25 particles before performance issues
- Each particle is a `<div>` with CSS transforms

**Planned Improvement (Level 2):**

- Canvas-based rendering with requestAnimationFrame
- Can handle 150+ particles at 60fps
- Comparison file: `theme-comparison.html`

## Known Issues

### Limited Test Coverage

**Current:**

- Only `src/lib/__tests__/` has tests (4 files)
- No component tests
- No E2E tests

**Risk:**

- Regressions in UI changes
- Theme calculations untested
- Voice scoring untested

### No TypeScript Strict Null Checks

**Impact:**

- Potential runtime errors from null/undefined
- Some implicit `any` types

## Missing Features

### No Error Tracking

**Current:**

- Errors logged to console only
- No production error monitoring
- `ErrorBoundary.tsx` catches crashes but doesn't report

### No Analytics

**Current:**

- `src/lib/analytics.ts` exists but basic
- No user behavior tracking
- No usage metrics

## Security Considerations

### Environment Variables

**Current:**

- `.env.local` stores Supabase credentials
- `.gitignore` excludes `.env.local`

**Good:**

- Secrets not committed to repo

### Auth

**Current:**

- Supabase handles auth
- No custom JWT implementation

**Good:**

- Using proven auth service

## Performance Concerns

### Initial Load

**Bundle Size:**

- Large theme engine file
- Could benefit from code splitting

### Memory

**IndexedDB:**

- No cleanup of old sessions
- Could accumulate data over time

## Documentation Gaps

### Missing Docs

**Current:**

- No README in `src/`
- No API documentation
- No component storybook

### Inline Comments

**Current:**

- Minimal comments
- Complex algorithms (voice scoring, theme) could use more explanation

---

_Concerns analysis: 2026-01-10_
_Address as priorities allow_
