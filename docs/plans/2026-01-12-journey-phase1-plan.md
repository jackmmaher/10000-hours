# Journey Tab Redesign - Phase 1: Core Restructure

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Journey tab hierarchy so Calendar becomes the single planning hub, with a hero spotlight for the next session and display-only week summary.

**Architecture:** Replace `JourneyNextSession` with a new `NextSessionSpotlight` component (2/3 viewport hero). Reorder layout to Spotlight → Calendar → WeekSummary. WeekStones taps now scroll to Calendar instead of opening modal directly.

**Tech Stack:** React, TypeScript, Tailwind CSS, existing theme CSS variables

---

## Task 1: Create NextSessionSpotlight Component

**Files:**

- Create: `src/components/NextSessionSpotlight.tsx`
- Test: Manual visual testing

**Step 1: Create the new component file**

```typescript
/**
 * NextSessionSpotlight - Hero display of the next upcoming planned session
 *
 * Takes ~2/3 of viewport height. Two states:
 * 1. Session planned: Shows session details beautifully with Begin Now button
 * 2. No session: Inviting prompt with CTA that scrolls to Calendar
 */

import { useMemo } from 'react'
import { PlannedSession } from '../lib/db'
import { useNavigationStore } from '../stores/useNavigationStore'
import { ORB_COLORS, ANIMATION_BREATHE_DURATION } from '../lib/animations'

interface NextSessionSpotlightProps {
  plannedSession: PlannedSession | null
  onPlanClick: () => void
}

export function NextSessionSpotlight({
  plannedSession,
  onPlanClick
}: NextSessionSpotlightProps) {
  const { setView } = useNavigationStore()

  // Format the date for display
  const dateDisplay = useMemo(() => {
    if (!plannedSession) return null

    const planDate = new Date(plannedSession.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Full date format for hero display
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }
    const fullDate = planDate.toLocaleDateString('en-US', options)

    if (planDate.getTime() === today.getTime()) {
      return { label: 'Today', date: fullDate, isToday: true }
    }

    if (planDate.getTime() === tomorrow.getTime()) {
      return { label: 'Tomorrow', date: fullDate, isToday: false }
    }

    return { label: null, date: fullDate, isToday: false }
  }, [plannedSession])

  // Check if session is today for Begin Now button
  const isToday = useMemo(() => {
    if (!plannedSession) return false
    const planDate = new Date(plannedSession.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    planDate.setHours(0, 0, 0, 0)
    return planDate.getTime() === today.getTime()
  }, [plannedSession])

  // Hero container with 2/3 viewport height
  const heroHeight = 'min-h-[60vh]'

  // If there's a planned session, show the spotlight
  if (plannedSession) {
    return (
      <div className={`${heroHeight} flex flex-col justify-center relative mb-8`}>
        {/* Background breathing orb */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-20 animate-breathe pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${ORB_COLORS.moss}60, transparent)`,
            animationDuration: `${ANIMATION_BREATHE_DURATION}ms`
          }}
        />

        <div className="relative text-center px-6">
          {/* Date label */}
          {dateDisplay?.label && (
            <p className="text-sm font-medium text-accent mb-2">
              {dateDisplay.label}
            </p>
          )}

          {/* Full date */}
          <p className="font-serif text-lg text-ink/60 mb-2">
            {dateDisplay?.date}
          </p>

          {/* Time */}
          {plannedSession.plannedTime && (
            <p className="font-serif text-4xl text-ink mb-6">
              {plannedSession.plannedTime}
            </p>
          )}

          {/* Title / Technique */}
          <p className="font-serif text-2xl text-ink mb-2">
            {plannedSession.title || plannedSession.discipline || 'Meditation'}
          </p>

          {/* Details */}
          <div className="flex justify-center gap-4 text-sm text-ink/50 mb-8">
            {plannedSession.duration && (
              <span>{plannedSession.duration} minutes</span>
            )}
            {plannedSession.pose && (
              <span>{plannedSession.pose}</span>
            )}
          </div>

          {/* Intention / Notes preview */}
          {plannedSession.notes && (
            <p className="text-sm text-ink/40 italic mb-8 max-w-xs mx-auto line-clamp-2">
              "{plannedSession.notes}"
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col items-center gap-3">
            {isToday && (
              <button
                onClick={() => setView('timer')}
                className="px-8 py-4 bg-moss text-cream rounded-2xl text-lg font-medium
                  hover:bg-moss/90 transition-colors active:scale-[0.98] shadow-lg"
              >
                Begin Now
              </button>
            )}

            {/* Tap card to view in calendar - subtle hint */}
            <button
              onClick={onPlanClick}
              className="text-sm text-ink/40 hover:text-ink/60 transition-colors"
            >
              View in Calendar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // No planned session - inviting hero prompt
  return (
    <div className={`${heroHeight} flex flex-col justify-center relative mb-8`}>
      {/* Gentle pulsing orb */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-30 animate-breathe pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${ORB_COLORS.moss}40, ${ORB_COLORS.slate}20)`,
          animationDuration: `${ANIMATION_BREATHE_DURATION}ms`
        }}
      />

      <div className="relative text-center px-6">
        <p className="font-serif text-3xl text-ink mb-3">
          Your next meditation
        </p>
        <p className="font-serif text-3xl text-ink/40 mb-8">
          awaits
        </p>

        <button
          onClick={onPlanClick}
          className="px-8 py-4 bg-accent text-on-accent rounded-2xl text-lg font-medium
            hover:opacity-90 transition-all active:scale-[0.98] shadow-lg"
        >
          Plan a Session
        </button>

        {/* Quick start option */}
        <div className="mt-6">
          <button
            onClick={() => setView('timer')}
            className="text-sm text-ink/40 hover:text-ink/60 transition-colors"
          >
            Or just begin now
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Verify the file was created**

Run: Check file exists and has no TypeScript errors
Expected: File compiles without errors

**Step 3: Commit**

```bash
git add src/components/NextSessionSpotlight.tsx
git commit -m "feat(journey): add NextSessionSpotlight hero component"
```

---

## Task 2: Update Journey Tab Layout - Reorder Components

**Files:**

- Modify: `src/components/Journey/index.tsx`

**Step 1: Import the new component and add calendar ref**

In `src/components/Journey/index.tsx`, update imports and add ref:

```typescript
// Add to imports (around line 23-24)
import { NextSessionSpotlight } from '../NextSessionSpotlight'

// Add calendar ref after subTabsRef (around line 91)
const calendarRef = useRef<HTMLDivElement>(null)
```

**Step 2: Create scroll-to-calendar handler**

Add this function after the existing handlers (around line 170):

```typescript
// Scroll to calendar and optionally open planning modal
const scrollToCalendarAndPlan = useCallback(
  (date?: Date) => {
    if (calendarRef.current) {
      calendarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    // Small delay to let scroll complete, then open modal
    setTimeout(() => {
      const targetDate = date || new Date()
      targetDate.setHours(0, 0, 0, 0)
      const daySessions = getSessionsForDate(sessions, targetDate).sort(
        (a, b) => b.startTime - a.startTime
      )
      setSelectedDaySessions(daySessions)
      setPlanningDate(targetDate)
    }, 300)
  },
  [sessions]
)
```

**Step 3: Replace JourneyNextSession with NextSessionSpotlight**

Replace the JSX section (around lines 267-281) from:

```typescript
{/* Your Next Moment */}
<JourneyNextSession
  plannedSession={nextPlannedSession}
  onPlanClick={() => {
    if (nextPlannedSession) {
      const planDate = new Date(nextPlannedSession.date)
      planDate.setHours(0, 0, 0, 0)
      setPlanningDate(planDate)
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      setPlanningDate(today)
    }
  }}
/>
```

To:

```typescript
{/* Next Session Spotlight - Hero (2/3 viewport) */}
<NextSessionSpotlight
  plannedSession={nextPlannedSession}
  onPlanClick={() => {
    if (nextPlannedSession) {
      const planDate = new Date(nextPlannedSession.date)
      planDate.setHours(0, 0, 0, 0)
      scrollToCalendarAndPlan(planDate)
    } else {
      scrollToCalendarAndPlan()
    }
  }}
/>
```

**Step 4: Move Calendar before WeekStones and add ref**

Reorder the components. Change from:

```typescript
{/* Week Stones */}
<div className="mb-10">
  <p className="font-serif text-sm text-ink/50 tracking-wide mb-5">Meditations this week</p>
  <WeekStonesRow days={weekDays} onDayClick={handleDayClick} showLabels={true} size="md" />
</div>

{/* Calendar */}
<div className="mb-10">
  <Calendar
    embedded
    onDateClick={(date) => handleDayClick(0, date)}
    refreshKey={plansRefreshKey}
  />
</div>
```

To:

```typescript
{/* Calendar - Planning Hub */}
<div ref={calendarRef} className="mb-10">
  <Calendar
    embedded
    onDateClick={(date) => handleDayClick(0, date)}
    refreshKey={plansRefreshKey}
  />
</div>

{/* Week Summary - Display Only */}
<div className="mb-10">
  <p className="font-serif text-sm text-ink/50 tracking-wide mb-5">This week</p>
  <WeekStonesRow
    days={weekDays}
    onDayClick={(dayIndex, date) => scrollToCalendarAndPlan(date)}
    showLabels={true}
    size="md"
  />
</div>
```

**Step 5: Remove unused JourneyNextSession import**

Remove from imports:

```typescript
// Remove this line
import { JourneyNextSession } from '../JourneyNextSession'
```

**Step 6: Verify changes compile**

Run: `npm run build` or TypeScript check
Expected: No errors

**Step 7: Commit**

```bash
git add src/components/Journey/index.tsx
git commit -m "feat(journey): reorder components - Calendar before WeekStones

- Replace JourneyNextSession with NextSessionSpotlight
- Move Calendar above Week Summary
- WeekStones now scrolls to Calendar instead of opening modal directly
- Add scrollToCalendarAndPlan helper function"
```

---

## Task 3: Update WeekStonesRow Click Behavior Documentation

**Files:**

- Modify: `src/components/WeekStones.tsx` (comment update only)

**Step 1: Update the component header comment**

Change the header comment (lines 1-15) to reflect new behavior:

```typescript
/**
 * WeekStones - Shared week visualization component
 *
 * River stones representing days of the week.
 * Used in both Journey tab and Progress tab.
 * Now fully theme-aware using CSS variables.
 *
 * States:
 * - completed: Session done (any session, planned or not)
 * - fulfilled: Planned + completed (the plan was executed)
 * - planned: Upcoming plan exists (including today with a plan)
 * - today: Current day without plan (cream orb, same as future)
 * - next: Tomorrow - breathing animation to encourage planning ahead
 * - future: No plan yet
 *
 * Journey tab usage: Display-only, clicks scroll to Calendar
 * Progress tab usage: Display-only streak visualization
 */
```

**Step 2: Commit**

```bash
git add src/components/WeekStones.tsx
git commit -m "docs(weekstones): update component docs for display-only usage"
```

---

## Task 4: Clean Up - Remove Old JourneyNextSession Component

**Files:**

- Delete: `src/components/JourneyNextSession.tsx`

**Step 1: Verify no other imports exist**

Search for imports of JourneyNextSession in the codebase. Should only be in Journey/index.tsx which we already removed.

Run: Search for `JourneyNextSession` in codebase
Expected: No remaining imports

**Step 2: Delete the file**

```bash
rm src/components/JourneyNextSession.tsx
```

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor(journey): remove deprecated JourneyNextSession component

Replaced by NextSessionSpotlight which is display-only and scrolls to Calendar for planning."
```

---

## Task 5: Manual Testing Checklist

**Step 1: Test Spotlight with planned session**

1. Open app, create a planned session for today via Calendar
2. Navigate to Journey tab
3. Verify: Spotlight shows 2/3 height hero with session details
4. Verify: "Begin Now" button appears (since it's today)
5. Verify: "View in Calendar" link scrolls to calendar

**Step 2: Test Spotlight without planned session**

1. Delete all planned sessions
2. Navigate to Journey tab
3. Verify: Spotlight shows "Your next meditation awaits"
4. Verify: "Plan a Session" button scrolls to Calendar AND opens modal
5. Verify: "Or just begin now" link goes to Timer

**Step 3: Test WeekStones scroll behavior**

1. Navigate to Journey tab
2. Tap any day orb in the Week Summary section
3. Verify: Page scrolls up to Calendar
4. Verify: Planning modal opens for that day

**Step 4: Test Calendar remains functional**

1. Navigate to Calendar section
2. Tap any day
3. Verify: Planning modal opens
4. Create/edit/delete plans
5. Verify: Spotlight updates when next session changes

---

## Task 6: Final Integration Commit

**Step 1: Run full build**

```bash
npm run build
```

Expected: Build succeeds with no errors

**Step 2: Run linter**

```bash
npm run lint
```

Expected: No linting errors

**Step 3: Create integration commit if any fixes needed**

```bash
git add -A
git commit -m "fix(journey): phase 1 integration fixes"
```

---

## Summary of Changes

| File                                      | Change                                       |
| ----------------------------------------- | -------------------------------------------- |
| `src/components/NextSessionSpotlight.tsx` | NEW - Hero spotlight component               |
| `src/components/Journey/index.tsx`        | MODIFIED - New layout order, scroll behavior |
| `src/components/WeekStones.tsx`           | MODIFIED - Documentation update              |
| `src/components/JourneyNextSession.tsx`   | DELETED - Replaced by spotlight              |

## What's Next (Phase 2)

Phase 2 will enhance the Calendar modal with:

- Dual-view (swipeable past/future sessions)
- "+ Add Another Session" button
- Better handling of same-day multiple sessions/plans
