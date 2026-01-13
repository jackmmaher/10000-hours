# QA Test Plan: Journey Tab Session Planning Feature

## Executive Summary

The Journey tab's MeditationPlanner modal has critical bugs affecting multi-session handling on the same date. This document maps the intended user flows, data flows, and defines specific test cases with pre-identified failure criteria.

---

## Architecture Overview

### Key Components

| Component         | File                                                    | Responsibility                    |
| ----------------- | ------------------------------------------------------- | --------------------------------- |
| MeditationPlanner | `src/components/MeditationPlanner/index.tsx`            | Modal UI, form rendering          |
| usePlannerState   | `src/components/MeditationPlanner/usePlannerState.ts`   | State management, data flow       |
| DayItemsCarousel  | `src/components/MeditationPlanner/DayItemsCarousel.tsx` | Swipeable pagination              |
| Calendar          | `src/components/Calendar.tsx`                           | Month view with visual indicators |
| PearlPicker       | `src/components/MeditationPlanner/PearlPicker.tsx`      | Pearl attachment modal            |

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA SOURCES                                 │
├─────────────────────────────────────────────────────────────────────┤
│  sessions (prop)              │  plannedSessions (async fetch)      │
│  ↓ from useSessionStore       │  ↓ from getIncompletePlansForDate() │
│  Zustand global state         │  IndexedDB query                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    usePlannerState.dayItems                         │
├─────────────────────────────────────────────────────────────────────┤
│  Merges sessions + pendingPlans into unified DayItem[] array        │
│  Sorted chronologically by timestamp                                │
│                                                                     │
│  DayItem = { type: 'session'|'plan', id, timestamp, session?, plan?}│
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    DayItemsCarousel                                  │
├─────────────────────────────────────────────────────────────────────┤
│  - Receives itemCount from dayItems.length                          │
│  - Shows pagination dots when itemCount > 1                         │
│  - Handles touch swipe (50px threshold)                             │
│  - Calls onIndexChange to switch between items                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Identified Bugs from Screenshots

### Bug 1: Single Pagination Dot When Multiple Items Exist

**Screenshot Evidence:** Modal header shows "2 items · Today" but only one dot visible

**Root Cause Analysis:**

- `pendingPlans` is loaded asynchronously in useEffect (line 267-274 of usePlannerState.ts)
- Initial render may occur before `pendingPlans` resolves
- Race condition: `dayItems.length` = 1 initially (only sessions), becomes 2 after async load
- DayItemsCarousel renders `{children}` directly when `itemCount <= 1` (line 50-52)

**Expected Behavior:** 2 dots should be visible when 2 items exist for the date

### Bug 2: Cannot Swipe Between Past Sessions and Future Plans

**Root Cause Analysis:**

- Same async timing issue as Bug 1
- Even after `pendingPlans` loads, the carousel may not properly re-render
- `currentIndex` state may be stale or out of sync with updated `dayItems`

**Expected Behavior:** User should be able to swipe or tap dots to navigate between items

### Bug 3: Calendar Not Updating After Adding Second Session

**Root Cause Analysis:**

- Calendar receives `plannedSessions` via props from parent (Journey component)
- `refreshKey` pattern used to trigger re-fetch (see CONCERNS.md)
- Possible async timing: modal closes before refresh completes
- Calendar's `plannedDates` Set may not include newly added plan

**Expected Behavior:** Calendar should show accent color for dates with planned sessions

### Bug 4: "Add Another Session" Button Closes Modal

**Root Cause Analysis:**

- Modal backdrop has `onClick={onClose}` at line 57
- Touch events are stopped but click may propagate
- `handleAddNewPlan()` runs correctly but modal may be closing from backdrop click
- Event bubbling issue between button click and backdrop handler

**Expected Behavior:** Button should clear form and show new plan UI, NOT close modal

### Bug 5: Pearl Attachment Closes Modal

**Root Cause Analysis:**

- Pearl picker button at line 640 sets `showPearlPicker(true)`
- PearlPicker modal opens on top of MeditationPlanner
- When PearlPicker closes or user clicks its backdrop, event may bubble to parent
- Double-modal event handling conflict

**Expected Behavior:** Selecting a pearl should attach it and keep MeditationPlanner open

---

## Test Cases

### Test Suite 1: Multi-Item Display

#### TC-1.1: Display Multiple Sessions on Same Date

**Preconditions:**

- User has logged 1 past session today (e.g., 6:34 AM, 1hr 26min)
- User has 1 planned future session today (e.g., 11:20 AM)

**Steps:**

1. Open Journey tab
2. Tap on Today in calendar

**Expected Result:**

- Modal opens with header "2 items · Today"
- 2 pagination dots visible at top
- Both dots are tappable
- First dot shows active state (filled)

**Failure Criteria:**

- [ ] Header says "2 items" but only 1 dot visible
- [ ] No pagination dots visible at all
- [ ] Dots visible but not tappable

---

#### TC-1.2: Swipe Navigation Between Items

**Preconditions:** Same as TC-1.1

**Steps:**

1. Open modal showing 2 items
2. Swipe left on the card content area

**Expected Result:**

- View transitions to second item
- Second dot becomes active
- Content updates to show second item's details
- First dot becomes inactive

**Failure Criteria:**

- [ ] Swipe gesture not detected
- [ ] Content doesn't change
- [ ] Dots don't update to reflect new position
- [ ] Swipe scrolls the page instead of navigating

---

#### TC-1.3: Dot Tap Navigation

**Preconditions:** Same as TC-1.1, viewing first item

**Steps:**

1. Tap on second (inactive) pagination dot

**Expected Result:**

- View jumps to second item
- Second dot becomes active
- Content updates immediately

**Failure Criteria:**

- [ ] Dot tap not registered
- [ ] Wrong item displayed after tap
- [ ] Dots don't visually update

---

### Test Suite 2: Adding Sessions to Dates with Existing Data

#### TC-2.1: Add Second Session via "+ Add Another Session"

**Preconditions:**

- Date has 1 existing session (past or planned)
- Modal is open showing that session

**Steps:**

1. Tap "+ Add Another Session" button
2. Observe modal behavior

**Expected Result:**

- Modal stays open
- Form clears to empty state
- Header changes to "Add Session"
- Date picker shows current date
- All fields editable

**Failure Criteria:**

- [ ] Modal closes unexpectedly
- [ ] Form retains previous session's data
- [ ] Header doesn't update
- [ ] Form fields locked/read-only

---

#### TC-2.2: Save New Session on Date with Existing Data

**Preconditions:**

- From TC-2.1, user has filled out new session details

**Steps:**

1. Set time (e.g., 14:00)
2. Select duration (e.g., Short - 10 min)
3. Select position (e.g., Seated cushion)
4. Tap "Save Plan"

**Expected Result:**

- Save completes successfully
- Modal closes
- Calendar shows visual indicator for this date
- Re-opening modal shows 2 items (original + new)

**Failure Criteria:**

- [ ] Save fails silently
- [ ] Modal closes but no data saved
- [ ] Calendar doesn't update
- [ ] Re-opened modal still shows 1 item

---

#### TC-2.3: Calendar Visual Update After Adding Plan

**Preconditions:**

- Future date has no sessions or plans initially

**Steps:**

1. Tap on future date in calendar
2. Add a planned session with time
3. Save and close modal
4. Observe calendar

**Expected Result:**

- Calendar date shows accent color text (planned indicator)
- Date is visually distinct from dates without plans

**Failure Criteria:**

- [ ] Date appearance doesn't change
- [ ] Date shows wrong visual state
- [ ] Need to navigate away and back for update

---

### Test Suite 3: Pearl Attachment

#### TC-3.1: Open Pearl Picker Without Closing Modal

**Preconditions:**

- Modal is open in plan mode
- User has pearls available

**Steps:**

1. Tap "Attach a Pearl" button
2. Observe what happens

**Expected Result:**

- Pearl picker modal opens on top
- MeditationPlanner modal stays visible underneath
- No flashing/re-rendering

**Failure Criteria:**

- [ ] MeditationPlanner closes when pearl picker opens
- [ ] Both modals close
- [ ] App crashes/freezes

---

#### TC-3.2: Select Pearl and Return to Form

**Preconditions:** Pearl picker is open from TC-3.1

**Steps:**

1. Tap on a pearl to select it
2. Observe return to form

**Expected Result:**

- Pearl picker closes
- MeditationPlanner stays open
- Selected pearl shows in "Guidance" section
- Pearl text visible

**Failure Criteria:**

- [ ] Both modals close
- [ ] Pearl not attached
- [ ] Form data lost
- [ ] Modal resets to initial state

---

### Test Suite 4: Session vs Plan Mode Distinction

#### TC-4.1: Past Session Shows Read-Only Time/Duration

**Preconditions:**

- Date has a completed past session

**Steps:**

1. Open modal for that date
2. Observe time and duration fields

**Expected Result:**

- Time shows as read-only text (e.g., "6:34 AM")
- Duration shows as read-only text (e.g., "1 hr 26 min")
- Green/moss background card styling
- No edit controls for time/duration

**Failure Criteria:**

- [ ] Time/duration fields are editable inputs
- [ ] Values can be changed
- [ ] Styling doesn't distinguish read-only

---

#### TC-4.2: Plan Shows Editable Time/Duration

**Preconditions:**

- Date has a planned (not completed) session

**Steps:**

1. Open modal for that date
2. Navigate to the plan item if multiple items exist

**Expected Result:**

- Time field is editable (input type="time")
- Duration shows category buttons (Short/Medium/Long/Custom)
- User can modify values

**Failure Criteria:**

- [ ] Fields appear read-only
- [ ] Can't change time
- [ ] Duration buttons don't respond

---

### Test Suite 5: State Persistence Across Navigation

#### TC-5.1: Form State Preserved When Swiping

**Preconditions:**

- Date has 2 items (1 session, 1 plan)
- Modal open, viewing plan

**Steps:**

1. Make edits to plan (change time, add notes)
2. Swipe to session item
3. Swipe back to plan item

**Expected Result:**

- Edits are preserved
- Time, notes, etc. retain modified values
- No data loss

**Failure Criteria:**

- [ ] Edits lost on swipe
- [ ] Form resets to original values
- [ ] Partial data preserved

---

#### TC-5.2: Correct Data Loads for Each Item

**Preconditions:**

- Date has session at 6:34 AM and plan at 11:20 AM

**Steps:**

1. Open modal (should show first item chronologically)
2. Note the displayed time
3. Swipe to second item
4. Note the displayed time

**Expected Result:**

- Item 1: Shows 6:34 AM time (session)
- Item 2: Shows 11:20 AM time (plan)
- Each item shows its own correct data

**Failure Criteria:**

- [ ] Both items show same data
- [ ] Data from one item bleeds into another
- [ ] Times don't match actual records

---

## Regression Test Checklist

After any fix, verify these don't regress:

- [ ] Single session on date still works correctly
- [ ] Single plan on date still works correctly
- [ ] Calendar heat map for past sessions unchanged
- [ ] WeekStones indicators still work
- [ ] Insight capture still links to sessions
- [ ] Repeat scheduling still creates multiple plans
- [ ] Reminders still scheduled for planned sessions

---

## Technical Debugging Points

### For Bug Investigation

1. **Console log dayItems.length** at render time vs after useEffect
2. **Check pendingPlans state** - is it populated when expected?
3. **Verify refreshKey** is incrementing after save
4. **Event listener** on modal backdrop - check stopPropagation
5. **PearlPicker onClose** - ensure it doesn't bubble to parent

### Key Files to Instrument

```javascript
// usePlannerState.ts line ~116
console.log('dayItems computed:', dayItems.length, dayItems)

// usePlannerState.ts line ~271
console.log('pendingPlans loaded:', plans)

// MeditationPlanner/index.tsx line ~57
console.log('backdrop clicked')

// DayItemsCarousel.tsx line ~50
console.log('itemCount:', itemCount)
```

---

## Priority Matrix

| Bug                      | User Impact                  | Frequency             | Fix Complexity          | Priority |
| ------------------------ | ---------------------------- | --------------------- | ----------------------- | -------- |
| #1 Pagination dots       | HIGH - Can't see items exist | Every multi-item date | LOW - Async timing      | P0       |
| #4 Modal closes on add   | HIGH - Workflow blocked      | Every add attempt     | MEDIUM - Event handling | P0       |
| #5 Pearl closes modal    | MEDIUM - Feature unusable    | Every pearl attach    | MEDIUM - Event bubbling | P1       |
| #2 Swipe not working     | HIGH - Navigation broken     | Every multi-item date | LOW - Related to #1     | P0       |
| #3 Calendar not updating | LOW - Visual only            | After every save      | MEDIUM - State refresh  | P2       |

---

## Acceptance Criteria for Fix

A fix is complete when:

1. All TC-\* tests pass
2. No regression in checklist items
3. Console shows no timing-related warnings
4. Manual QA confirms smooth multi-item navigation
5. Pearl attachment workflow completes without modal issues
