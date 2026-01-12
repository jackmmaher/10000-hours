# Journey Tab Redesign - Phase 2: Calendar Modal Enhancement

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance the MeditationPlanner modal to show both past sessions AND future plans for the same day in a swipeable interface, with ability to add multiple plans.

**Architecture:** Unify sessions and plans into a single "day items" list. Add horizontal swipe navigation with dot indicators. Each item renders either a session view or a plan form. Add "+ Add Another Session" button.

**Tech Stack:** React, TypeScript, Tailwind CSS, touch-swipe gesture handling

---

## Current Behavior

- Modal receives `sessions: Session[]` (completed sessions for the day)
- If sessions exist → "Session mode" shows session details
- If no sessions → "Plan mode" shows planning form
- Pending plans show in secondary "Also planned for today" section (not editable inline)

## Desired Behavior

- Modal shows ALL items for the day (sessions + plans) in a swipeable carousel
- Dot indicators show position (● ○ ○)
- Swipe left/right to navigate between items
- Each item: session shows details (read-only time/duration), plan shows editable form
- "+ Add Another Session" button always visible at bottom

---

## Task 1: Update usePlannerState to Support Multiple Items

**Files:**

- Modify: `src/components/MeditationPlanner/usePlannerState.ts`
- Modify: `src/components/MeditationPlanner/types.ts`

**Step 1: Add DayItem type to types.ts**

```typescript
// Add to types.ts
export type DayItemType = 'session' | 'plan'

export interface DayItem {
  type: DayItemType
  id: string // session.uuid or `plan-${plan.id}`
  session?: Session
  plan?: PlannedSession
  timestamp: number // For sorting: session.startTime or plan date + time
}
```

**Step 2: Update usePlannerState to build dayItems array**

Add to usePlannerState:

- Combine sessions and pendingPlans into sorted `dayItems` array
- Track `selectedItemIndex` instead of `selectedSessionIndex`
- Current item determines if we show session view or plan form
- Add `handleAddNewPlan` function to append a blank plan item

**Step 3: Commit**

```bash
git add src/components/MeditationPlanner/types.ts src/components/MeditationPlanner/usePlannerState.ts
git commit -m "feat(planner): add DayItem type for unified session/plan handling"
```

---

## Task 2: Add Swipe Navigation Component

**Files:**

- Create: `src/components/MeditationPlanner/DayItemsCarousel.tsx`

**Step 1: Create carousel component**

A simple horizontal swipe component that:

- Shows dot indicators at top
- Renders children with swipe gestures
- Tracks current index
- Calls onIndexChange when swiped

```typescript
interface DayItemsCarouselProps {
  itemCount: number
  currentIndex: number
  onIndexChange: (index: number) => void
  children: React.ReactNode
}
```

**Step 2: Commit**

```bash
git add src/components/MeditationPlanner/DayItemsCarousel.tsx
git commit -m "feat(planner): add DayItemsCarousel for swipe navigation"
```

---

## Task 3: Refactor MeditationPlanner to Use Carousel

**Files:**

- Modify: `src/components/MeditationPlanner/index.tsx`

**Step 1: Update to use dayItems and carousel**

- Import DayItemsCarousel
- Map over dayItems to render appropriate content per item type
- Show session details for type='session'
- Show editable form for type='plan'
- Add "+ Add Another Session" button at bottom

**Step 2: Update header to show item count**

```typescript
<p className="text-sm text-ink-soft">
  {dayItems.length} item{dayItems.length !== 1 ? 's' : ''} · {formatDateForDisplay(date)}
</p>
```

**Step 3: Commit**

```bash
git add src/components/MeditationPlanner/index.tsx
git commit -m "feat(planner): implement swipeable day items carousel

- Sessions and plans shown as swipeable cards
- Dot indicators for navigation
- Add Another Session button"
```

---

## Task 4: Handle New Plan Creation

**Files:**

- Modify: `src/components/MeditationPlanner/usePlannerState.ts`

**Step 1: Add handleAddNewPlan function**

When user taps "+ Add Another Session":

1. Create a temporary "new plan" item
2. Append to dayItems
3. Navigate to that item
4. Show blank planning form

**Step 2: Handle saving new plan**

- If current item is a new (unsaved) plan, use addPlannedSession
- If current item is existing plan, use updatePlannedSession

**Step 3: Commit**

```bash
git add src/components/MeditationPlanner/usePlannerState.ts
git commit -m "feat(planner): support creating multiple plans per day"
```

---

## Task 5: Visual Polish and Testing

**Files:**

- Modify: `src/components/MeditationPlanner/index.tsx`

**Step 1: Polish carousel transitions**

- Smooth swipe animations
- Haptic feedback on swipe
- Visual feedback for current item

**Step 2: Polish item cards**

- Clear distinction between session (completed) and plan (editable)
- Session cards show "COMPLETED" badge
- Plan cards show "PLANNED" badge

**Step 3: Build and verify**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add -A
git commit -m "fix(planner): polish carousel transitions and item cards"
```

---

## Summary of Changes

| File                                                    | Change                                      |
| ------------------------------------------------------- | ------------------------------------------- |
| `src/components/MeditationPlanner/types.ts`             | ADD - DayItem type                          |
| `src/components/MeditationPlanner/usePlannerState.ts`   | MODIFY - dayItems array, multi-plan support |
| `src/components/MeditationPlanner/DayItemsCarousel.tsx` | NEW - Swipe carousel component              |
| `src/components/MeditationPlanner/index.tsx`            | MODIFY - Use carousel, add button           |

## What's Next (Phase 3)

Phase 3 will add recurring session support:

- RepeatRule table and CRUD
- Repeat picker in planning modal
- Generate concrete sessions from rules
