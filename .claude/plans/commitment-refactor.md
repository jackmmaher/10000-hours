# Commitment Mode Refactor: Casino → Contemplative

## Philosophy

Replace extrinsic punishment/reward mechanics with intrinsic motivation cultivation.
The system should feel like a wise teacher, not a casino floor manager.

**Guiding principle**: A person who stops using commitment mode should be
_more_ likely to keep meditating, not less.

---

## Phase 1: Remove Casino Mechanics (Surgical Removal)

**Goal**: Strip out every variable-reward, random-penalty, and slot-machine
mechanic. Leave the scaffolding intact.

### 1.1 Delete `src/lib/commitment/rng.ts`

- Remove Mulberry32 PRNG, `generateCommitmentSeed()`, `createCommitmentRNG()`
- No replacement needed — deterministic randomness served only the casino layer

### 1.2 Gut `src/lib/commitment/outcomes.ts`

- **Remove**: `BONUS_PROBABILITY`, `MYSTERY_PROBABILITY`, `NEAR_MISS_PROBABILITY`
- **Remove**: `calculateSessionCompletion()` (the slot-machine roll)
- **Remove**: `calculateMissedPenalty()` (random penalty calculator)
- **Remove**: `calculateExpectedValue()`, `calculateBreakEvenRate()`
- **Replace with**: Simple `recordSessionCompletion()` that returns:
  ```typescript
  type SessionCompletionResult = {
    dayNumber: number // e.g., "Day 14 of 30"
    consistencyScore: number // 0-100%, gracefully handles misses
    streakDays: number // current streak (soft — see 2.2)
    milestone: Milestone | null // if this session hits one
    isNewPersonalBest: boolean // longest streak, most consistent week, etc.
  }
  ```

### 1.3 Rewrite `src/lib/commitment/midnightCheck.ts`

- **Remove**: Random penalty calculation per missed day
- **Remove**: Hour bank deduction (`consumeCommitmentPenalty()`)
- **Keep**: Detection of missed days (still need to know)
- **Replace with**: Gentle return notification:
  ```typescript
  type MissedDayNotice = {
    daysMissed: number
    consistencyScore: number // updated score including misses
    encouragement: string // contextual message (see 3.2)
    nextRequiredDay: Date
  }
  ```

### 1.4 Rewrite `src/lib/commitment/middleware.ts`

- **Remove**: RNG rolling, bonus/penalty application, hour bank mutations
- **Keep**: `processCommitmentSession()` structure but simplify to:
  1. Validate day required + within window + meets minimum
  2. Log day as completed
  3. Update consistency score + streak
  4. Check for milestone
  5. Return `SessionCompletionResult`
- **Keep**: `getTodayCommitmentStatus()`, `consumeGracePeriod()`

### 1.5 Simplify `src/lib/commitment/milestones.ts`

- **Change milestone days**: 7, 21, 30, 66, 90
  - 66 days = average habit formation (Lally et al., 2009)
  - Drop 3-day and 14-day (too frequent, cheapens the concept)
- **Change milestone messages** to be about meaning, not performance:
  - 7: "One week. The rhythm is forming."
  - 21: "Three weeks. Your body knows the way now."
  - 30: "One month. This practice is part of your life."
  - 66: "Research says this is when habits become automatic."
  - 90: "Ninety days. You don't need this system anymore."

---

## Phase 2: New Behavioral Model

### 2.1 Consistency Score (replaces streak-or-nothing)

**New concept**: A rolling percentage that gracefully handles misses instead of
resetting to zero.

```typescript
// Calculate over the commitment period so far
consistencyScore = completedDays / requiredDays // 0.0 to 1.0

// Display as percentage: "87% consistent"
// One missed day out of 14 = 93%, not 0
```

**Why this works**:

- Eliminates the "what-the-hell effect" (miss one day → "streak broken → give up")
- A single miss drops you from 100% to ~96%, not from 21 to 0
- Recovery is visible: next session brings you back up
- Still motivating: people don't want to see 87% drop to 84%

**Keep streak as secondary metric** — display it but don't make it the primary
feedback. Streak resets are noted softly ("New streak started") not punitively.

### 2.2 Soft Streak (replaces hard reset)

Current: Miss one day → streak resets to 0.
New: Miss one day → streak pauses. Show both:

- "Current run: 3 days" (since last miss)
- "Best run: 21 days"
- "Consistency: 93%" (the primary metric)

The streak still _resets_ on a miss, but it's a secondary stat beneath the
consistency score. The emotional weight is on consistency, not streak.

### 2.3 Practice Quality Tracking (new)

After each session, optional single-question reflection:

```typescript
type PostSessionReflection = {
  presenceRating?: 1 | 2 | 3 | 4 | 5 // "How present were you?"
  note?: string // Brief reflection (optional)
}
```

This creates:

- Feedback tied to _quality_, not random chance
- Data for showing users they're improving at meditation itself
- Intrinsic motivation loop: "My average presence this week was 3.8, last week was 3.2"

**UI**: Simple 5-dot rating below the completion message. Tapping is optional.
No penalty for skipping. Data feeds into Progress tab insights.

### 2.4 Decouple Hour Bank Entirely

- **Remove all `addBonusHours()` calls** from commitment middleware
- **Remove all `consumeCommitmentPenalty()` calls** from midnight check
- **Remove `rngSeed` and `rngSequenceIndex`** from CommitmentSettings
- **Remove `totalBonusMinutesEarned` and `totalPenaltyMinutesDeducted`** from analytics

Hours in the bank represent _time you actually sat_. Period.
They should never be inflated by random bonuses or deflated by punishments.

---

## Phase 3: UI Rewrites

### 3.1 Replace `CommitmentOutcomeModal.tsx` → `SessionCompletionCard.tsx`

**Remove**: Slot-machine spinner, confetti randomness, "so close!" near-miss

**Replace with** warm, simple completion acknowledgment:

```
┌─────────────────────────────┐
│                             │
│        Day 14 of 30         │
│                             │
│     ○ ○ ○ ○ ○  (presence)   │
│   How present were you?     │
│                             │
│      93% consistent         │
│       streak: 14 days       │
│                             │
│   "Your seat was waiting.   │
│    You showed up."          │
│                             │
│         [ Done ]            │
└─────────────────────────────┘
```

For **milestones**, expand the card:

```
┌─────────────────────────────┐
│                             │
│        Day 66 of 90         │
│                             │
│   Research says this is     │
│   when habits become        │
│   automatic.                │
│                             │
│      97% consistent         │
│                             │
│   (celebration ritual)      │
│                             │
└─────────────────────────────┘
```

Milestones get a subtle glow/pulse animation — not confetti explosions.
Haptic: single gentle tap, not the success burst.

### 3.2 Replace `CommitmentMissedAlert.tsx` → `GentleReturnNotice.tsx`

**Remove**: Penalty amount, penalty breakdown, punitive framing

**Replace with** contextual encouragement:

```
┌─────────────────────────────┐
│  You missed yesterday.      │
│  That's okay — the seat     │
│  is always here.            │
│                             │
│  Consistency: 87%           │
│  (was 93%)                  │
│                             │
│  [ Begin today's session ]  │
└─────────────────────────────┘
```

**Encouragement messages** are contextual, not random:

- First miss: "Missing one day doesn't undo your progress. 87% is still strong."
- Multiple misses: "It's been 3 days. No judgement. Start with your 2-minute minimum?"
- After long streak broken: "21 days of consistency. One miss doesn't erase that."
- Near end of commitment: "12 days left. You've already built something real."

### 3.3 Simplify `CommitmentShield.tsx`

**Keep**: The full-screen prompt during commitment windows — this is a good
implementation intention trigger.

**Change**:

- Remove any reference to penalties or "what you'll lose"
- Frame as: "This is your time. [Anchor routine] → [Minimum] minutes."
- Keep the fallback minimum ("Hard day? 2 minutes still counts.")
- Keep obstacle/coping display

### 3.4 Rewrite `CommitmentSkipModal.tsx`

**Remove**: Typing "I choose to skip" (friction theater)

**Replace with**: Simple confirmation with a reflective question:

- "Skip today's session?"
- "What's making today hard?" (optional, stores as reflection data)
- Grace periods remaining: 2 of 3
- [ Skip Today ] / [ I'll do 2 minutes instead ]

The "I'll do 2 minutes instead" CTA is the real behavioral nudge here —
lower the bar rather than punish avoidance.

### 3.5 Rewrite `CommitmentEmergencyExit.tsx`

**Remove**: Pro-rated hour cost. Entirely. Charging someone to stop meditating
is indefensible.

**Replace with**: Reflective exit flow:

- "You've completed 18 of 30 days (60%). That's real progress."
- "What would help you continue?" (optional reflection)
- Options: [ Pause for a week ] / [ End commitment ] / [ Adjust my schedule ]
- **Pause** = new feature: freezes commitment for 7 days, resumes where you left off
- **Adjust** = opens schedule settings (maybe daily was too ambitious → weekdays)
- **End** = clean exit, no cost, commitment archived with stats

### 3.6 Rewrite Setup Flow Screens

**Keep as-is** (these are all good behavioral science):

- Screen 1: IdentityScreen ✓
- Screen 2: AnchorActivityScreen ✓
- Screen 3: ScheduleTypeScreen ✓
- Screen 4: WindowScreen ✓
- Screen 5: MinSessionScreen ✓
- Screen 6: CommitmentDurationScreen ✓ (but remove exit cost display)
- Screen 7: ObstacleScreen ✓
- Screen 8: AccountabilityScreen ✓ (but change messaging — see 3.7)
- Screen 11: CelebrationScreen ✓
- Screen 12: ReviewScreen ✓ (but remove stakes summary)

**Remove entirely**:

- Screen 9: GracePeriodScreen — grace periods still exist but don't need a
  dedicated "scarcity" screen. Mention them briefly on the duration screen.
- Screen 10: StakesScreen — the entire concept of "stakes" is removed.
  No acknowledgment checkbox, no break-even analysis, no penalty preview.

**New screen** (replaces Stakes):

- **"What to Expect" screen**:
  - "Show up → your consistency grows"
  - "Miss a day → your consistency dips, but one miss doesn't erase your progress"
  - "Grace periods → X days where missing won't affect your score"
  - "You can pause, adjust, or stop at any time — no penalties"
  - Tone: honest, warm, respectful of autonomy

### 3.7 Fix Accountability Messaging

**Remove**: Skip/miss notifications entirely. Telling someone's accountability
partner they "failed" is shame-based.

**Keep**: Completion notifications, reframed:

```
"{name} just finished a 20-minute meditation. Day 14 of their commitment."
```

**Add optional**: Mutual practice visibility

- If accountability partner also uses the app → show mutual status
- "You both meditated today" (when applicable)

### 3.8 Simplify `CommitmentStatus.tsx`

**Remove**: Net minutes display, bonus/penalty tallies

**Replace with**:

- Day X of Y (progress bar)
- Consistency: X%
- Current run: X days
- Grace periods: X remaining
- Average presence: X.X / 5 (if quality tracking data exists)

---

## Phase 4: Database Schema Changes

### 4.1 Simplify `CommitmentSettings` type

**Remove fields**:

```typescript
// Casino mechanics
rngSeed: number
rngSequenceIndex: number
totalBonusMinutesEarned: number
totalPenaltyMinutesDeducted: number

// Shame-based accountability
notifyOnSkip: boolean
```

**Add fields**:

```typescript
// Practice quality
averagePresenceRating: number | null // rolling average of 1-5 ratings
totalPresenceRatings: number // count for calculating average

// Pause feature
isPaused: boolean
pauseStartDate: number | null
pauseEndDate: number | null
totalPauseDays: number // extends effective end date

// Graceful exit
endReason: 'completed' | 'ended-early' | 'paused-indefinitely' | null
```

**Keep all other fields** — identity, anchor, schedule, window, obstacles,
accountability (minus notifyOnSkip), celebration, grace periods, streaks,
sessions completed/missed, day-of-week stats, fallback sessions count.

### 4.2 Simplify `CommitmentDayLog` type

**Remove fields**:

```typescript
minutesAdjustment: number
adjustmentType: 'bonus' | 'penalty' | 'mystery' | 'near-miss' | 'none'
wasNearMiss: boolean
```

**Add fields**:

```typescript
presenceRating: number | null // 1-5, optional
reflection: string | null // brief note, optional
```

**Keep**: `date`, `outcome` ('completed' | 'missed' | 'grace' | 'not-required' | 'paused'), `sessionUuid`

### 4.3 Migration Strategy

- DB version bump (v18 or next available)
- Migrate existing `CommitmentSettings`: zero out removed fields, add new
  fields with defaults
- Migrate existing `CommitmentDayLog` entries: drop casino fields, add null
  for new fields
- Existing `CommitmentHistory` entries: keep as-is (historical record)
- Active commitments: recalculate `consistencyScore` from existing day logs

---

## Phase 5: Delete Dead Code

After all rewrites are complete, delete:

### Files to delete entirely:

- `src/lib/commitment/rng.ts`

### Files to heavily gut:

- `src/lib/commitment/outcomes.ts` — rewrite as simple completion recorder

### Setup screens to remove:

- `src/components/CommitmentSetupFlow/screens/GracePeriodScreen.tsx`
  (fold brief mention into DurationScreen)
- `src/components/CommitmentSetupFlow/screens/StakesScreen.tsx`
  (replace with WhatToExpectScreen)

### Components to rename/rewrite:

- `CommitmentOutcomeModal.tsx` → `SessionCompletionCard.tsx`
- `CommitmentMissedAlert.tsx` → `GentleReturnNotice.tsx`

---

## Phase 6: New Features (Small Additions)

### 6.1 Commitment Pause

- New action in emergency exit flow: "Pause for 1 week"
- Freezes all requirement checks
- Day logs marked as 'paused' during freeze
- Commitment end date extends by pause duration
- Max 2 pauses per commitment (prevent indefinite deferral)

### 6.2 Schedule Adjustment Mid-Commitment

- Allow changing schedule type (daily → weekday) without restarting
- Allow changing time window
- Cannot reduce duration (30 → 60 is fine, 60 → 30 is not)
- Preserves all existing stats

### 6.3 Presence Trend in Progress Tab

- Line chart: average presence rating over time
- "Your awareness is deepening" when trend is upward
- Feeds into existing `CommitmentCard.tsx` insights

### 6.4 Graduation Message (Day 90 / Commitment End)

Replace auto-renew push with reflective completion:

- "90 days. You built this practice."
- Show full stats: consistency, days completed, average presence
- "What comes next?"
  - [ Start a new commitment ] — fresh start, adjusted parameters
  - [ Continue without commitment ] — "The habit is yours now"
  - [ Take a break ] — respectful exit

The "Continue without commitment" option is the _success state_.
The system's job is to make itself unnecessary.

---

## Execution Order

| Step | Phase   | What                                                         | Files Touched                                             | Risk                    |
| ---- | ------- | ------------------------------------------------------------ | --------------------------------------------------------- | ----------------------- |
| 1    | 4       | DB schema migration                                          | `types.ts`, `schema.ts`, `commitmentSettings.ts`          | Low — additive first    |
| 2    | 1.1-1.2 | Remove RNG + rewrite outcomes                                | `rng.ts`, `outcomes.ts`                                   | Med — core logic change |
| 3    | 1.3-1.4 | Rewrite midnight check + middleware                          | `midnightCheck.ts`, `middleware.ts`                       | Med — core logic change |
| 4    | 2.1-2.4 | Implement consistency score, soft streak, decouple hour bank | `middleware.ts`, `outcomes.ts`                            | Med — behavioral model  |
| 5    | 3.1-3.2 | Rewrite outcome modal + missed alert                         | `CommitmentOutcomeModal.tsx`, `CommitmentMissedAlert.tsx` | Low — UI only           |
| 6    | 3.3-3.5 | Rewrite shield, skip modal, emergency exit                   | 3 component files                                         | Low — UI only           |
| 7    | 3.6     | Rewrite setup flow screens                                   | Remove 2, add 1, edit 2                                   | Low — UI only           |
| 8    | 3.7-3.8 | Fix accountability + status display                          | `accountability.ts`, `CommitmentStatus.tsx`               | Low                     |
| 9    | 2.3     | Add presence rating to completion flow                       | `SessionCompletionCard.tsx`, types                        | Low — additive          |
| 10   | 6.1-6.2 | Add pause + schedule adjustment                              | middleware, UI components                                 | Med — new feature       |
| 11   | 6.3-6.4 | Presence trend + graduation                                  | Progress tab, new component                               | Low — additive          |
| 12   | 5       | Delete dead code, final cleanup                              | Multiple files                                            | Low — cleanup           |

---

## What This Preserves

Everything from the current system that's backed by real behavioral science:

- Identity-based commitment (Oyserman, 2015)
- Implementation intentions with obstacle/coping pairs (Gollwitzer, 1999)
- Habit stacking / anchor routines (Wood & Neal, 2007)
- Minimum + fallback durations (Lally et al., 2010)
- Celebration rituals (Fogg, 2019)
- Time windows reducing decision fatigue
- Flexible scheduling respecting autonomy
- Accountability partnerships (reframed positively)
- The shield as an implementation intention trigger
- All the excellent engineering architecture

## What This Removes

Everything borrowed from casino/gambling psychology:

- Variable ratio reinforcement (12% bonus probability)
- Mystery/rare rewards (3% dopamine spike)
- Near-miss display (25% "so close!" manipulation)
- Slot machine spinner animation
- Random penalties (-25 to -50 min)
- Hard streak reset (21 → 0)
- Emergency exit financial penalty
- Hour bank coupling (bonuses and deductions)
- Shame-based skip notifications
- Stakes acknowledgment ceremony
- Break-even analysis framing
- "The house always wins" design philosophy

## What This Adds

Evidence-based alternatives that cultivate intrinsic motivation:

- Consistency score (graceful degradation vs. binary streak)
- Practice quality self-assessment (intrinsic feedback loop)
- Soft streak (secondary to consistency)
- Contextual encouragement (not random rewards)
- Commitment pause (respects life circumstances)
- Mid-commitment schedule adjustment (respects autonomy)
- Free exit with reflection (not financial punishment)
- Graduation framing (system's goal is to become unnecessary)
- Presence trend tracking (mastery feedback)
