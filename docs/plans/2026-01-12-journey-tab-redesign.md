# Journey Tab Redesign

## Overview

Redesign the Journey tab to create a unified meditation planning and reflection ecosystem. The core change: **Calendar becomes the single planning hub**, while other components become display-only views that reinforce the value of consistent practice.

## Design Principles

1. **One place to plan** - Calendar is the sole entry point for creating/editing planned sessions
2. **Visual reinforcement** - Streaks, gaps, and symmetry naturally encourage consistency without penalty
3. **Circular flow** - Content saved/created flows back into planning, which flows into practice

---

## Component Hierarchy

### Before

```
Journey Tab
├── Plan Your Next Meditation (planning + display)
├── Meditations This Week (planning + display)
└── Calendar (planning + display)
```

### After

```
Journey Tab
├── Next Session Spotlight (display only, 2/3 viewport)
├── Calendar (single planning hub)
├── Week Summary (display only, streak visualization)
└── Content Sections
    ├── Insights & Pearls (your wisdom + saved community)
    └── Saved Guided Meditations (templates from Explore)
```

---

## Component Specifications

### 1. Next Session Spotlight

**Purpose:** Hero display of the next upcoming planned session. Educates users on the connection between Journey and meditation planning.

**Size:** ~2/3 of viewport height. The upcoming meditation deserves presence.

#### State A: Session Planned

```
┌─────────────────────────────────────────┐
│                                         │
│     ○ (breathing orb, subtle)           │
│                                         │
│     Thursday, January 16th              │
│     8:00 AM                             │
│                                         │
│     Breath Awareness                    │
│     20 minutes · Seated                 │
│                                         │
│     "Morning clarity practice"          │
│                                         │
│         [ Begin Now ]  (if today)       │
│                                         │
└─────────────────────────────────────────┘
  ─── Calendar ───────────────────────────
```

**Behavior:**

- Displays next incomplete planned session from `plannedSessions` table
- "Begin Now" appears only if session is scheduled for today
- Tapping the card scrolls to Calendar, highlighting that day

#### State B: No Session Planned

```
┌─────────────────────────────────────────┐
│                                         │
│     ○ (gentle pulse, inviting)          │
│                                         │
│     Your next meditation                │
│     awaits                              │
│                                         │
│                                         │
│         [ Plan a Session ]              │
│                                         │
│                                         │
└─────────────────────────────────────────┘
  ─── Calendar ───────────────────────────
```

**CTA Behavior:**

- Scrolls to Calendar section
- Auto-opens planning modal for today (or tomorrow if late evening)
- Teaches users where planning happens

---

### 2. Calendar (Planning Hub)

**Purpose:** Single source of truth for all session planning. Shows past sessions and future plans with full CRUD capabilities.

#### Day Modal - Dual View

Handles multiple items on the same day (past sessions + future plans) via horizontal swipe.

```
┌─────────────────────────────────────────┐
│  Thursday, January 16th            ✕    │
├─────────────────────────────────────────┤
│                                         │
│   ● ○    (dot indicators: 2 items)      │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  COMPLETED · 7:00 AM            │    │
│  │                                 │    │
│  │  Breath Awareness               │    │
│  │  18 min 42 sec                  │    │
│  │  Seated · Full lotus            │    │
│  │                                 │    │
│  │  "Felt grounded today..."       │    │
│  │                                 │    │
│  │  [ View Insight ]               │    │
│  └─────────────────────────────────┘    │
│                                         │
│              swipe →                    │
│                                         │
│  [ + Add Another Session ]              │
│                                         │
└─────────────────────────────────────────┘
```

**After swiping to planned session:**

```
│   ○ ●    (now on second item)           │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  PLANNED · 5:00 PM              │    │
│  │                                 │    │
│  │  Evening Wind-down              │    │
│  │  15 minutes                     │    │
│  │  Seated · Chair                 │    │
│  │                                 │    │
│  │  💎 "Start where you are..."    │    │
│  │     (attached pearl)            │    │
│  │                                 │    │
│  │  [ Edit ]  [ Delete ]           │    │
│  └─────────────────────────────────┘    │
```

**"+ Add Another Session"** always visible - allows stacking multiple plans on one day.

---

### 3. Planning Modal

Opened from Calendar day tap or "Plan a Session" CTA.

```
┌─────────────────────────────────────────┐
│  Plan Meditation               ✕        │
├─────────────────────────────────────────┤
│                                         │
│  Date           [ Thu, Jan 16    ▼ ]    │
│  Time           [ 8:00 AM        ▼ ]    │
│                                         │
│  Duration       [ 20 minutes     ▼ ]    │
│  Technique      [ Breath Awareness ▼ ]  │
│  Position       [ Seated         ▼ ]    │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Intention / Guidance                   │
│  ┌─────────────────────────────────┐    │
│  │ (empty or pre-filled)           │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [ 💎 Attach a Pearl ]                  │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Repeat         [ Never          ▼ ]    │
│                                         │
│           [ Save Session ]              │
│                                         │
└─────────────────────────────────────────┘
```

#### Repeat Options

```
┌─────────────────────────────────────────┐
│  Repeat                            ▼    │
├─────────────────────────────────────────┤
│  ○ Never (one-time)                     │
│  ● Weekly on Thursday                   │
│  ○ Daily                                │
│  ○ Weekdays (Mon-Fri)                   │
│  ○ Custom...                            │
└─────────────────────────────────────────┘
```

**Custom:** Pick specific days (M T W T F S S toggles), with optional end date or "ongoing."

**Storage approach:** Generate concrete planned sessions (e.g., next 4 weeks). Simpler, works offline, user can edit individual instances.

#### Pearl Attachment

"Attach a Pearl" opens picker showing:

- Saved pearls from community
- User's own insights

Selected pearl text populates Intention field with attribution.

---

### 4. Week Summary (Display Only)

**Purpose:** Visual streak/momentum reinforcement. Moved below Calendar.

**Change from current:** No longer a planning entry point. Tapping a day scrolls to Calendar and opens that day's modal (planning happens there).

**Visual states remain:**

- `completed`: Session done (filled orb)
- `fulfilled`: Planned + completed (ideal state indicator)
- `planned`: Future day with pending plan (outlined)
- `today`: Current day
- `future`: Empty future day (faded)
- `missed`: Past day without session (faded)

---

### 5. Insights & Pearls Section

**Purpose:** Surface user's captured wisdom and saved community pearls. Enable attaching to future plans.

```
─── Your Wisdom ───────────────────────────

┌─────────────────────────────────────────┐
│ ✦ INSIGHT · Jan 12, 7:15 AM             │
│                                         │
│ "The breath isn't something I do,       │
│  it's something that happens through    │
│  me when I stop interfering..."         │
│                                         │
│ Linked to: Morning session (18 min)     │
│                                         │
│ [ Extract Pearl ]  [ Attach to Plan ]   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ◆ PEARL · Saved Jan 10                  │
│   from @stillness_seeker                │
│                                         │
│ "Start where you are. Use what you      │
│  have. Do what you can."                │
│                                         │
│ [ Attach to Plan ]  [ Remove ]          │
└─────────────────────────────────────────┘
```

**"Attach to Plan" flow:**

1. Opens picker: "Which planned session?"
2. Lists upcoming planned sessions
3. OR "Plan new session with this" → opens planning modal with pearl pre-attached

---

### 6. Saved Guided Meditations Section

**Purpose:** Show templates saved from Explore. Enable planning sessions from templates.

```
─── Guided Meditations ────────────────────

┌─────────────────────────────────────────┐
│ 🎧 Breath Awareness for Beginners       │
│    by @meditation_guide · 15 min        │
│                                         │
│    Saved Jan 8 · Used 3 times           │
│                                         │
│ [ Begin Now ]  [ Plan This Meditation ] │
└─────────────────────────────────────────┘
```

**"Plan This Meditation" flow:**

1. Opens planning modal
2. Pre-fills: title, duration, discipline
3. Links `sourceTemplateId` to planned session
4. User picks date/time
5. Flows to Calendar → Spotlight

---

## The Circular Flow

```
        ┌─────────────────────────────────────┐
        │            TIMER TAB                │
        │         (execute session)           │
        └──────────────┬──────────────────────┘
                       │
                       ▼
        ┌─────────────────────────────────────┐
        │       POST-SESSION MODAL            │
        │    (capture insight via voice)      │
        └──────────────┬──────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                    JOURNEY TAB                       │
│                                                      │
│  Next Session Spotlight ◄────────────────────┐      │
│         │                                    │      │
│         ▼                                    │      │
│  Calendar (plan sessions) ◄──────────────────┤      │
│         │                                    │      │
│         ▼                                    │      │
│  Week Summary (view streaks)                 │      │
│         │                                    │      │
│         ▼                                    │      │
│  Insights & Pearls ─────► Attach to Plan ────┘      │
│         │                                           │
│  Saved Guided Meditations ─► Plan This ─────────────┘
│                                                      │
└──────────────────────────────────────────────────────┘
        │
        │ "Begin Now" or scheduled time arrives
        ▼
        Back to Timer Tab
```

---

## Data Model Changes

### PlannedSession (extend existing)

```typescript
export interface PlannedSession {
  // Existing fields
  id?: number
  date: number
  plannedTime?: string
  duration?: number
  title?: string
  pose?: string
  discipline?: string
  notes?: string
  createdAt: number
  completed?: boolean
  linkedSessionUuid?: string
  sourceTemplateId?: string
  courseId?: string
  coursePosition?: number

  // New fields
  attachedPearlId?: string // Link to saved pearl used as intention
  attachedInsightId?: number // Link to user's insight used as intention
  repeatRuleId?: number // Link to repeat rule that generated this
}
```

### New: RepeatRule

```typescript
export interface RepeatRule {
  id?: number
  createdAt: number

  // Schedule
  frequency: 'daily' | 'weekly' | 'weekdays' | 'custom'
  customDays?: number[] // 0-6 for Sun-Sat if custom
  endDate?: number // Optional end date

  // Session template
  plannedTime: string
  duration?: number
  title?: string
  pose?: string
  discipline?: string
  notes?: string
  attachedPearlId?: string
  sourceTemplateId?: string
}
```

### New: SavedPearl

```typescript
export interface SavedPearl {
  id?: number
  pearlId: string // Supabase pearl ID
  content: string // Pearl text (cached)
  authorHandle?: string // @username
  savedAt: number
}
```

### IndexedDB Schema Updates

Add to schema (next version):

```typescript
repeatRules: '++id, createdAt'
savedPearls: '++id, pearlId, savedAt'
```

Add index to plannedSessions:

```typescript
plannedSessions: '++id, date, createdAt, linkedSessionUuid, courseId, repeatRuleId'
```

---

## Implementation Phases

### Phase 1: Core Restructure

- Convert Next Session Spotlight to display-only
- Add "no session" CTA that scrolls to Calendar + opens modal
- Make Week Summary display-only (taps scroll to Calendar)
- Reorder components: Spotlight → Calendar → Week Summary

### Phase 2: Calendar Modal Enhancement

- Implement dual-view (swipeable past/future sessions)
- Add "+ Add Another Session" to modal
- Ensure same-day future plans appear in modal

### Phase 3: Recurring Sessions

- Add RepeatRule table and CRUD
- Add repeat picker to planning modal
- Generate concrete sessions from rules
- Handle editing/deleting individual vs series

### Phase 4: Pearl Integration

- Add SavedPearl table
- Implement "Save Pearl" from Explore tab
- Add "Attach a Pearl" picker to planning modal
- Show attached pearl in planned session cards

### Phase 5: Content Section Polish

- Unify Insights & Pearls display
- Add "Attach to Plan" actions
- "Plan This Meditation" flow from saved templates
- Visual polish and animations

---

## Success Metrics

1. **Planning adoption** - % of sessions that were pre-planned vs spontaneous
2. **Streak formation** - Average consecutive days with sessions
3. **Pearl engagement** - Pearls saved → attached to plans → completed sessions
4. **Template reuse** - Saved templates → planned → completed
