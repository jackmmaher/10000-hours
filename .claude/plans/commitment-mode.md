# Commitment Mode Implementation Plan

## Overview

Replace the existing Focus Mode (which requires Apple Screen Time API approval) with **Commitment Mode** - a habit formation feature using casino-style psychology and financial stakes via the existing hour bank.

**Core Concept**: Users commit to meditation schedules for 30/60/90 day locked periods. Missing sessions costs wallet time; completing sessions has a chance of bonus rewards. Net effect is always negative over a commitment period (the house always wins), but users gain the habit.

---

## Build Strategy: Standalone First

**Phase A: Build & Test (This Plan)**

- Build Commitment Mode as a completely standalone feature
- Add a temporary entry point in Exercises tab (separate card, dev-only if preferred)
- Keep Focus Mode completely untouched
- Full testing of all commitment mechanics

**Phase B: Replace (Future)**

- Once Commitment Mode is tested and working
- Remove Focus Mode feature and its dependencies
- Rename "Commitment" card to take Focus Mode's place
- Clean up LockSetupFlow references

This approach allows:

- Safe testing without breaking existing functionality
- Easy rollback if issues are found
- Side-by-side comparison during development

---

## Phase 1: Database Layer

### 1.1 Add Type Definitions

**File**: `src/lib/db/types.ts`

Add new interfaces:

```typescript
// Schedule types
export type CommitmentScheduleType = 'daily' | 'weekday' | 'custom' | 'flexible'
export type CommitmentWindowType = 'anytime' | 'morning' | 'specific'
export type CommitmentEndBehavior = 'auto-renew' | 'extend-adjust' | 'cool-off'

// Main settings (singleton, id: 1)
export interface CommitmentSettings {
  id: 1
  isActive: boolean
  commitmentStartDate: number
  commitmentEndDate: number
  commitmentDuration: 30 | 60 | 90

  // Schedule
  scheduleType: CommitmentScheduleType
  customDays?: boolean[] // [Sun..Sat]
  flexibleTarget?: number // sessions/week
  windowType: CommitmentWindowType
  windowStartHour?: number
  windowStartMinute?: number
  windowEndHour?: number
  windowEndMinute?: number
  minimumSessionMinutes: number // Required duration

  // Forgiveness
  gracePeriodCount: number // Total (3 per 30 days)
  gracePeriodUsed: number

  // End behavior
  endBehavior: CommitmentEndBehavior

  // RNG (for deterministic rewards)
  rngSeed: number
  rngSequenceIndex: number

  // Analytics (internal, not shown as "streak")
  totalSessionsCompleted: number
  totalSessionsMissed: number
  totalBonusMinutesEarned: number
  totalPenaltyMinutesDeducted: number
  lastSessionDate: number | null
}

// Day-by-day log
export interface CommitmentDayLog {
  id?: number
  date: number // Start of day
  outcome: 'completed' | 'missed' | 'grace' | 'not-required'
  sessionUuid?: string
  minutesAdjustment: number
  adjustmentType: 'bonus' | 'penalty' | 'mystery' | 'near-miss' | 'none'
  wasNearMiss: boolean
}

// History of past commitments
export interface CommitmentHistory {
  id?: number
  startDate: number
  endDate: number
  duration: 30 | 60 | 90
  completionRate: number
  netMinutesChange: number
  endReason: 'completed' | 'emergency-exit'
}
```

### 1.2 Add Database Schema

**File**: `src/lib/db/schema.ts`

Add v17 migration:

```typescript
this.version(17).stores({
  // ... existing tables
  commitmentSettings: 'id',
  commitmentDayLogs: '++id, date',
  commitmentHistory: '++id, startDate',
})
```

### 1.3 Create CRUD Module

**File**: `src/lib/db/commitmentSettings.ts` (NEW)

Standard singleton pattern:

- `getCommitmentSettings()` - returns settings or creates defaults
- `updateCommitmentSettings(updates)` - partial update
- `getCommitmentDayLog(date)` - get specific day
- `addCommitmentDayLog(log)` - log a day's outcome
- `getCommitmentHistory()` - all past commitments
- `archiveCommitment(history)` - save completed commitment

---

## Phase 2: Core Algorithm

### 2.1 Seeded RNG

**File**: `src/lib/commitment/rng.ts` (NEW)

Mulberry32 PRNG for deterministic "random" rewards:

- `generateCommitmentSeed(startDate)` - create seed
- `createCommitmentRNG(seed, sequenceIndex)` - get RNG at position
- Returns `{ random: () => number, newIndex: number }`

### 2.2 Outcome Calculator

**File**: `src/lib/commitment/outcomes.ts` (NEW)

**Probabilities** (based on clinical psychology):
| Event | Probability | Amount |
|-------|-------------|--------|
| Completion bonus | 12% | 15-45 min |
| Mystery bonus | 3% | 20-40 min |
| Near miss | 25% | 0 (shown) |
| Miss penalty | 100% | 25-50 min |

**Break-even**: ~90% completion rate

Functions:

- `calculateSessionCompletion(rng, config)` - returns `SessionOutcome`
- `calculateMissedPenalty(rng, config)` - returns penalty amount

### 2.3 Schedule Checker

**File**: `src/lib/commitment/schedule.ts` (NEW)

- `isDayRequired(date, settings)` - is meditation required today?
- `isWithinWindow(timestamp, settings)` - is current time in window?
- `getNextRequiredDate(settings)` - when is next required session?

---

## Phase 3: Hour Bank Integration

### 3.1 Add Bonus/Penalty Functions

**File**: `src/lib/hourBank.ts`

Add two new functions:

```typescript
// Add bonus hours (from commitment rewards)
export async function addBonusHours(
  hours: number,
  source: 'commitment-bonus' | 'commitment-mystery',
  referenceId: string
): Promise<void>

// Consume penalty hours (from missed sessions)
export async function consumeCommitmentPenalty(hours: number): Promise<void>
```

Both modify `totalPurchasedHours` / `totalConsumedHours` and `availableHours`.

---

## Phase 4: Session Completion Integration

### 4.1 Commitment Middleware

**File**: `src/lib/commitment/middleware.ts` (NEW)

Main function called after session completion:

```typescript
export async function processCommitmentSession(
  sessionUuid: string,
  durationSeconds: number,
  sessionStartTime: number
): Promise<SessionOutcome | null>
```

This function:

1. Checks if commitment is active
2. Validates session meets minimum duration
3. Validates session is within window (if required)
4. Rolls RNG for bonus/near-miss/mystery
5. Logs the day outcome
6. Returns outcome for UI display

### 4.2 Integration Point

**File**: `src/stores/useSessionStore.ts`

In `stopTimer()` after line 216 (after `consumeHours`), add:

```typescript
// Process commitment mode (if active)
const commitmentOutcome = await processCommitmentSession(
  sessionUuid,
  durationSeconds,
  sessionStartTime
)

if (commitmentOutcome?.minutesChange !== 0) {
  if (commitmentOutcome.minutesChange > 0) {
    await addBonusHours(commitmentOutcome.minutesChange / 60, 'commitment-bonus', sessionUuid)
  }
  // Penalties are handled separately by midnight check
}
```

Store the outcome in state for UI display.

### 4.3 Midnight Check (Missed Sessions)

**File**: `src/lib/commitment/midnightCheck.ts` (NEW)

Run on app launch and periodically:

- Check each day from `lastSessionDate` to yesterday
- For each required day without a logged session:
  - Apply penalty via `consumeCommitmentPenalty()`
  - Log day as 'missed'

---

## Phase 5: Setup Flow UI

### 5.1 Preserve Psychologically-Grounded Screens

**File**: `src/components/CommitmentSetupFlow/` (NEW directory)

The existing LockSetupFlow has 11 screens built on solid habit formation psychology. We preserve most of them:

| #   | Existing Screen      | Psychology Principle                       | Action                           |
| --- | -------------------- | ------------------------------------------ | -------------------------------- |
| 1   | IdentityScreen       | Identity-based habits ("I am becoming...") | **KEEP AS-IS**                   |
| 2   | AnchorActivityScreen | Habit stacking + Location context          | **KEEP AS-IS**                   |
| 3   | AnchorTimeScreen     | Temporal anchoring                         | **ADAPT** → WindowScreen         |
| 4   | CommitmentScreen     | Commitment duration                        | **ADAPT** → MinSessionScreen     |
| 5   | CelebrationScreen    | Tiny Habits dopamine reward                | **KEEP AS-IS**                   |
| 6   | ObstacleScreen       | If-then planning (2-3x follow-through)     | **KEEP AS-IS**                   |
| 7   | AccountabilityScreen | Social accountability (65%→95%)            | **KEEP AS-IS**                   |
| 8   | AppSelectionScreen   | (Screen Time specific)                     | **REPLACE** → ScheduleTypeScreen |
| 9   | ScheduleConfigScreen | Scheduling intentions                      | **ADAPT** → CustomDaysScreen     |
| 10  | SafetySettingsScreen | Forgiveness / Safety valve                 | **ADAPT** → GracePeriodScreen    |
| 11  | SummaryScreen        | Commitment ceremony                        | **ADAPT** → ReviewScreen         |

**Result: 7 screens kept/adapted, 4 new screens needed**

### 5.2 Final Screen Order (12 screens)

```
Phase 1: WHO (1 screen) - Identity framing
  1. IdentityScreen (KEEP) - "I am becoming someone who..."

Phase 2: WHEN (3 screens) - Schedule & timing
  2. AnchorActivityScreen (KEEP) - "I will meditate after I..."
  3. ScheduleTypeScreen (NEW) - Daily/Weekday/Custom/Flexible
  4. WindowScreen (ADAPT from AnchorTimeScreen) - Anytime/Morning/Specific

Phase 3: WHAT (2 screens) - Commitment parameters
  5. MinSessionScreen (ADAPT from CommitmentScreen) - Minimum session duration
  6. CommitmentDurationScreen (NEW) - 30/60/90 day commitment

Phase 4: HOW (2 screens) - Obstacles & support
  7. ObstacleScreen (KEEP) - "What might get in the way?"
  8. AccountabilityScreen (KEEP) - "Want someone in your corner?"

Phase 5: SAFETY (2 screens) - Forgiveness & stakes
  9. GracePeriodScreen (ADAPT) - 3 grace periods per 30 days
  10. StakesScreen (NEW) - Show penalty/bonus math, emergency exit cost

Phase 6: RITUAL (1 screen) - Celebration
  11. CelebrationScreen (KEEP) - "After meditating, I will..."

Phase 7: LAUNCH (1 screen) - Summary & activation
  12. ReviewScreen (ADAPT) - Full summary, start date, activate
```

### 5.3 New/Modified Screens Detail

**ScheduleTypeScreen (NEW)**

- Options: Daily / Weekday Warrior / Custom Weekly / Flexible Target
- If Custom: shows day picker inline
- If Flexible: shows "sessions per week" slider

**WindowScreen (ADAPT)**

- Repurpose AnchorTimeScreen
- Change from "anchor time" to "practice window"
- Options: Anytime / Morning (5am-12pm) / Specific window

**CommitmentDurationScreen (NEW)**

- Big visual choice: 30 / 60 / 90 days
- Shows what's at stake for each duration
- Shows grace periods scale (3 / 6 / 9)

**StakesScreen (NEW)**

- Visual showing penalty range (25-50 min per miss)
- Visual showing bonus chance (12%, 15-45 min)
- Emergency exit cost preview
- "I understand" confirmation

**GracePeriodScreen (ADAPT)**

- Repurpose SafetySettingsScreen
- Explain 3 grace periods per 30 days
- Remove auto-unlock (not relevant)
- Add emergency exit explanation

### 5.4 Form State (Preserves Existing Fields)

**File**: `src/components/CommitmentSetupFlow/types.ts`

```typescript
interface CommitmentSetupFormState {
  // Phase 1: Identity (from IdentityScreen - KEPT)
  identityStatement: string
  whyItMatters: string

  // Phase 2: Anchor (from AnchorActivityScreen - KEPT)
  anchorRoutine: string
  anchorLocation: string

  // Phase 2: Schedule (NEW)
  scheduleType: CommitmentScheduleType
  customDays?: boolean[] // [Sun..Sat]
  flexibleTarget?: number // sessions/week

  // Phase 2: Window (ADAPTED from AnchorTimeScreen)
  windowType: CommitmentWindowType
  windowStartHour?: number
  windowStartMinute?: number
  windowEndHour?: number
  windowEndMinute?: number

  // Phase 3: Session (ADAPTED from CommitmentScreen)
  minimumSessionMinutes: number
  minimumFallbackMinutes: number // "hard day" minimum

  // Phase 3: Duration (NEW)
  commitmentDuration: 30 | 60 | 90

  // Phase 4: Obstacles (from ObstacleScreen - KEPT)
  selectedObstacles: string[]
  obstacles: Array<{ obstacle: string; copingResponse: string }>

  // Phase 4: Accountability (from AccountabilityScreen - KEPT)
  accountabilityEnabled: boolean
  accountabilityPhone: string
  accountabilityMethod: 'sms' | 'whatsapp' | 'choose'
  notifyOnCompletion: boolean
  notifyOnSkip: boolean

  // Phase 5: Safety (ADAPTED)
  gracePeriodCount: number // 3 per 30 days

  // Phase 5: Stakes confirmation (NEW)
  stakesAcknowledged: boolean

  // Phase 6: Celebration (from CelebrationScreen - KEPT)
  celebrationRitual: string

  // Phase 6: End behavior (NEW)
  endBehavior: CommitmentEndBehavior

  // Phase 7: Activation
  activationDate: number
}
```

---

## Phase 6: Outcome UI

### 6.1 Commitment Outcome Modal

**File**: `src/components/CommitmentOutcomeModal.tsx` (NEW)

Casino-style reveal after session completion:

- Suspenseful delay (500-1000ms)
- Slot machine settling animation
- Confetti for bonus/mystery
- "So close!" for near-miss
- NO streak display

### 6.2 Commitment Status Widget

**File**: `src/components/CommitmentStatus.tsx` (NEW)

For Journey/Settings:

- "Day 23 of 30" (progress, NOT streak)
- Grace periods remaining
- Net minutes earned/lost
- "Commitment ends [date]"

### 6.3 End of Commitment Flow

**File**: `src/components/CommitmentEndFlow.tsx` (NEW)

Shows when commitment period ends:

- Summary stats
- Three options: Auto-renew, Extend & Adjust, Cool-off

---

## Phase 7: Exercises Tab Integration (Standalone)

### 7.1 Add New Feature Entry (Keep Focus Mode)

**File**: `src/components/Journey/practiceFeatureConfig.ts`

Add a NEW entry for Commitment Mode (don't modify Focus Mode):

```typescript
{
  id: 'commitment',
  title: 'Commitment',
  subtitle: 'Stake your hours',
  description: 'Lock into 30-90 day meditation commitments with financial stakes',
  icon: '🎯', // or appropriate icon
  status: 'active',
  action: 'open-commitment-modal',
}
```

### 7.2 Add to Exercises Component

**File**: `src/components/Exercises.tsx`

- Import `CommitmentSetupFlow`
- Add state: `const [showCommitmentFlow, setShowCommitmentFlow] = useState(false)`
- Add case in `handleFeaturePress`:
  ```typescript
  case 'open-commitment-modal':
    setShowCommitmentFlow(true)
    break
  ```
- Render `CommitmentSetupFlow` modal alongside existing `LockSetupFlow`

**Result**: Both Focus Mode and Commitment Mode appear in Exercises tab during testing.

### 7.3 Future Cleanup (Phase B - Not This Plan)

After testing is complete:

- Remove Focus Mode entry from feature config
- Remove LockSetupFlow import and state
- Remove LockComingSoonModal
- Optionally rename Commitment to take Focus Mode's position

---

## Phase 8: Emergency Exit

### 8.1 Exit Flow

**File**: `src/components/CommitmentEmergencyExit.tsx` (NEW)

- Show cost calculation: `(days_remaining / total_days) * base_fee`
- Base fees: 30-day=1h, 60-day=2h, 90-day=3h
- Confirm 3x before executing
- Deduct cost, archive commitment, mark inactive

---

## File Summary

### New Files (11)

```
src/lib/db/commitmentSettings.ts
src/lib/commitment/rng.ts
src/lib/commitment/outcomes.ts
src/lib/commitment/schedule.ts
src/lib/commitment/middleware.ts
src/lib/commitment/midnightCheck.ts
src/lib/commitment/index.ts
src/components/CommitmentSetupFlow/index.tsx
src/components/CommitmentSetupFlow/types.ts
src/components/CommitmentOutcomeModal.tsx
src/components/CommitmentStatus.tsx
src/components/CommitmentEndFlow.tsx
src/components/CommitmentEmergencyExit.tsx
```

### Screens (in `src/components/CommitmentSetupFlow/screens/`)

```
COPIED FROM LockSetupFlow (7 screens - minimal changes):
  IdentityScreen.tsx        - Keep as-is
  AnchorActivityScreen.tsx  - Keep as-is
  CelebrationScreen.tsx     - Keep as-is
  ObstacleScreen.tsx        - Keep as-is (uses minimumFallbackMinutes)
  AccountabilityScreen.tsx  - Keep as-is

ADAPTED FROM LockSetupFlow (3 screens):
  WindowScreen.tsx          - Adapt from AnchorTimeScreen
  MinSessionScreen.tsx      - Adapt from CommitmentScreen
  GracePeriodScreen.tsx     - Adapt from SafetySettingsScreen

NEW SCREENS (4 screens):
  ScheduleTypeScreen.tsx    - Daily/Weekday/Custom/Flexible
  CommitmentDurationScreen.tsx - 30/60/90 days
  StakesScreen.tsx          - Penalty/bonus visualization
  ReviewScreen.tsx          - Summary and activation
```

### Modified Files (6)

```
src/lib/db/types.ts              - Add commitment interfaces
src/lib/db/schema.ts             - Add v17 migration
src/lib/hourBank.ts              - Add bonus/penalty functions
src/stores/useSessionStore.ts    - Integration in stopTimer()
src/components/Exercises.tsx     - Add CommitmentSetupFlow (keep LockSetupFlow for now)
src/components/Journey/practiceFeatureConfig.ts - Add new Commitment entry (keep Focus Mode)
```

---

## Verification Plan

### Unit Tests

1. RNG produces deterministic sequence for same seed
2. Outcome probabilities match spec (12% bonus, 3% mystery, etc.)
3. Schedule checker correctly identifies required days
4. Hour bank bonus/penalty functions update balances correctly
5. Break-even occurs at ~90% completion rate

### Integration Tests

1. Session completion triggers commitment processing
2. Day logs are created correctly
3. Midnight check detects and penalizes missed sessions
4. Emergency exit deducts correct amount

### Manual Testing (Standalone Mode)

1. **Exercises tab**: Verify both Focus Mode AND Commitment cards appear
2. **Setup flow**: Complete all 12 screens, verify settings saved to `commitmentSettings` table
3. **Session completion**: Complete session within window, verify outcome modal shows
4. **Bonus mechanics**: Complete multiple sessions, verify ~12% get bonuses
5. **Near-miss display**: Verify "So close!" messages appear ~25% of non-bonus completions
6. **Penalty mechanics**: Miss a session, verify penalty applied on next app launch
7. **Grace period**: Use grace period, verify no penalty
8. **End of commitment**: Complete 30-day period, verify end flow with 3 options
9. **Emergency exit**: Test early exit, verify cost calculation and deduction
10. **Focus Mode unchanged**: Verify Focus Mode still works independently

---

## Implementation Order

1. **Database layer** (Phase 1) - Foundation
2. **Core algorithm** (Phase 2) - RNG, outcomes, schedule
3. **Hour bank integration** (Phase 3) - Bonus/penalty functions
4. **Setup flow UI** (Phase 5) - Copy & adapt screens from LockSetupFlow
5. **Session integration** (Phase 4) - Processing logic
6. **Outcome UI** (Phase 6) - User sees results
7. **Exercises integration** (Phase 7) - Feature accessible
8. **Emergency exit** (Phase 8) - Safety valve

**Key Principle**: The existing LockSetupFlow screens are psychologically sound, built on established habit formation research (BJ Fogg's Tiny Habits, implementation intentions, identity-based habits). We preserve 7 of 11 screens with minimal changes, ensuring consistency and leveraging proven UX patterns.

Estimated scope: ~1500 lines of new code, ~200 lines adapted from existing screens.
