# Still Hours - Meditation Lock Feature Plan

## Summary

An **optional power-user feature** in Settings that blocks distracting apps until the user completes their meditation. This is a commitment device grounded in behavioral science—users pre-commit during a guided setup flow, and enforcement happens automatically during vulnerable time windows.

**What this is**: A unified habit formation tool with commitment teeth.

**What this is NOT**: Converting the app into a "lock app". This is additive, voluntary, buried in Settings.

---

## Behavioral Science Foundation

This feature implements research-backed habit formation principles:

| Principle                 | Source                          | Implementation                        |
| ------------------------- | ------------------------------- | ------------------------------------- |
| Implementation intentions | Gollwitzer (d=0.65, 94 studies) | Anchor routine + location + time      |
| Routine-based cues        | Keller et al.                   | "After I pour coffee" not "at 7 AM"   |
| Tiny Habits               | Fogg (B=MAP)                    | Minimum fallback for hard days        |
| Commitment device         | Behavioral economics            | No escape except meditation           |
| Immediate reinforcement   | Fogg                            | Celebration modal on completion       |
| Obstacle anticipation     | Coping planning research        | Pre-planned if-then responses         |
| Accountability            | ASTD (65%→95% success)          | SMS/WhatsApp to partner on completion |
| Streak forgiveness        | Lally, Duolingo (-21% churn)    | Emergency skips, grace periods        |
| Fresh start effect        | Milkman (33% lift)              | Start on Monday/1st of month          |
| Identity framing          | Clear                           | "I am becoming someone who..."        |

---

## How to Build (Execution Protocol)

**Do NOT attempt to build this in a single session.** The plan has 50+ tasks. Context will truncate. Follow this protocol.

### Session Structure — One Phase Per Session

| Session | Phase                    | Focus                                                | Verification Gate (Must Pass Before Next Phase)                                       |
| ------- | ------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1       | Native Plugin Foundation | Swift plugin, authorization, app picker              | Can authorize FamilyControls, pick apps, manually block/unblock                       |
| 2       | Database & Setup Flow    | Schema v15, CRUD, 8 screens                          | All screens render, data persists to IndexedDB, all dynamic bindings work             |
| 3       | Schedule & Shield        | Extensions, App Groups, shield UI                    | Lock activates on schedule, shield shows correct dynamic content, deep link opens app |
| 4       | Unlock & Celebration     | Timer integration, celebration modal, accountability | Session completion deactivates lock, celebration shows ritual, SMS/WhatsApp sends     |
| 5       | Forgiveness & Polish     | Skips, fallbacks, safety, reminders                  | All edge cases work, analytics tracking                                               |

### Session Prompt Template

Copy this at the start of each build session:

```
Read Still-Hours-Lock-Feature-Plan.md

Execute Phase [X]: [Phase Name] only.

Requirements:
1. Use TodoWrite to track every sub-task
2. Write tests first (TDD) for each component
3. Do NOT mark a task complete until tests pass
4. Verify all dynamic bindings use actual values (no hardcoded text)
5. At session end, summarize: done, not done, blockers

Skills to invoke:
- /superpowers:test-driven-development
- /superpowers:verification-before-completion
```

### Skills to Use

| Skill                                         | When to Use                                  |
| --------------------------------------------- | -------------------------------------------- |
| `/superpowers:test-driven-development`        | Start of each component — write tests first  |
| `/superpowers:verification-before-completion` | Before marking ANY task complete             |
| `/superpowers:subagent-driven-development`    | When phase has 3+ independent parallel tasks |
| `/superpowers:systematic-debugging`           | When something doesn't work                  |

### Verification Checklist (Run at End of Each Session)

**Phase 1:**

- [ ] `MeditationLock.requestAuthorization()` returns status
- [ ] `MeditationLock.showAppPicker()` opens native picker
- [ ] `MeditationLock.blockApps(tokens)` blocks selected apps
- [ ] `MeditationLock.unblockApps()` unblocks apps

**Phase 2:**

- [ ] Schema v15 migration runs without error
- [ ] `getMeditationLockSettings()` returns defaults on first call
- [ ] `updateMeditationLockSettings()` persists changes
- [ ] All 8 setup screens render
- [ ] Screen 5 pills show `{minimumFallbackMinutes}` not "2"
- [ ] Screen 6 preview shows actual user name + duration
- [ ] Screen 7 example time calculates from anchor
- [ ] Screen 8 dates show actual dates

**Phase 3:**

- [ ] Lock activates at scheduled time
- [ ] Blocked app shows shield with correct anchor + duration
- [ ] "Need flexibility" shows correct minimum + coping response
- [ ] Deep link `stillhours://lock-session` opens Timer with plan
- [ ] App Groups sync works between app and extension

**Phase 4:**

- [ ] Session completion writes to shared container
- [ ] Session completion deactivates lock
- [ ] Celebration modal shows correct streak, duration, ritual
- [ ] "Apps unlocked until" shows actual next window
- [ ] SMS/WhatsApp sends with branded message + link

**Phase 5:**

- [ ] Emergency skip works and decrements count
- [ ] Hard day fallback (minimum duration) counts as success
- [ ] Backup anchor notification fires when morning missed
- [ ] Safety auto-unlock works
- [ ] Grace period logic works
- [ ] Month rollover resets `streakFreezesRemaining`

### Anti-Truncation Rules

1. **One phase per session** — Never try to do more
2. **TodoWrite always** — Track every sub-task visibly
3. **Verify before done** — Use `/superpowers:verification-before-completion`
4. **Session summary** — End each session with explicit "done / not done / blockers"
5. **Reference the plan** — Always start with "Read Still-Hours-Lock-Feature-Plan.md"

---

## Technical Foundation

### iOS Screen Time API

Three frameworks:

1. **FamilyControls** - Authorization + app picker (opaque tokens)
2. **ManagedSettings** - Blocks apps (shows shield)
3. **DeviceActivity** - Schedules when blocks activate

**Requirements**:

- Apple entitlement (`com.apple.developer.family-controls`)
- iOS 15.1+
- App Groups for extension ↔ app communication
- DeviceActivityMonitorExtension (separate process)

**No Capacitor plugin exists** - build native Swift plugin following `NativeReview` pattern.

---

## Setup Flow (Full Behavioral Science Integration)

A guided 8-screen flow (~3-5 minutes) that captures all habit formation inputs upfront.

**Container design:**

- Background: `var(--bg-base)`
- Header/footer: Hidden (full immersion)
- Progress: 8 dots at top (active: `var(--accent)`, completed: 50% opacity, upcoming: `var(--text-tertiary)`)
- Content max-width: 400px centered
- Horizontal padding: `var(--space-6)` [24px]
- CTA fixed to bottom with safe area

### Screen 1: Identity Framing

```
"Who are you becoming?"

Complete this sentence:
"I am becoming someone who ___________"

[meditates daily]  [trains mentally]
[handles pressure well]  [Custom: ____]

Optional: "Why does this matter to you?"
[Free text field]
```

### Screen 2: Anchor Routine (Implementation Intentions)

```
"When will you meditate?"

"I will meditate immediately after I..."
[wake up]  [pour my coffee]  [brush my teeth]
[finish my workout]  [get home from work]  [Custom: ____]

"Where will you do this?"
[bedroom]  [living room]  [office]  [car]  [Custom: ____]

"What time is that usually?"
[Time picker - e.g., 7:00 AM]

"If I miss my anchor, I will meditate after..."
[lunch]  [dinner]  [Custom: ____]  [Skip backup]
```

The time picker is framed around the anchor ("When do you usually pour your coffee?") - user thinks in routines, API gets clock time.

**Backup anchor behavior:** If primary anchor window ends without session completion, a reminder notification fires at backup time:

> "Your morning anchor passed. Time for your backup: after {backupAnchor}. {unlockDurationMinutes} minutes to keep your streak."

### Screen 3: Commitment Level (Tiny Habits)

```
"How long will you meditate?"

Regular commitment:
[5 min]  [10 min]  [12 min]  [15 min]
[20 min]  [30 min]  [45 min]  [60 min]

"On hard days, my minimum is:"
[2 min]  [3 min]  [5 min]

(Showing up matters more than duration)
```

### Screen 4: Celebration Ritual

```
"After meditating, I will..."

[smile]  [take a deep breath]  [say 'yes' to myself]  [Custom: ____]

(This small celebration wires the habit into your brain)
```

### Screen 5: Obstacle Anticipation

```
"What might get in the way?"

Select what applies:
[ ] Running late in the morning
[ ] Too tired
[ ] Interrupted by family/roommates
[ ] Just don't feel like it
[ ] Forgot
[ ] Other: ____

For each selected:
"If I'm [running late], I will..."
[do my {minimumFallbackMinutes}-min minimum]  [meditate during lunch]  [Custom: ____]
```

**Dynamic binding:** The "minimum" pill must display the actual value from Screen 3, not hardcoded "2-min".

### Screen 6: Accountability

```
"Want someone in your corner?"

○ Just me - I've got this
○ Text someone when I complete my meditation

[If selected:]
"Who should know?"
[Contact picker → stores phone number]

"Send via:"
[SMS]  [WhatsApp]  [Let me choose each time]

"Send them:"
○ Completions only
○ Completions + skips
```

**Message format (branded for virality):**

```
{userName} completed his {duration} minute Still Hours meditation today ✓

stillhours.app/share
```

**Skip message:**

```
{userName} used an emergency skip on Still Hours today ⚠️

stillhours.app/share
```

**Implementation:** SMS uses native share sheet; WhatsApp uses URL scheme `whatsapp://send?phone={phone}&text={encodedMessage}`. User still taps "Send" — no silent sending.

**Landing page required:** Create `stillhours.app/share` with Open Graph meta tags for rich previews in WhatsApp/iMessage.

### Screen 7: Apps, Schedule & Reminders

```
"What apps distract you most?"

[Select apps to block] → Opens native FamilyActivityPicker
Default: Social + Entertainment + Games

"When are you most tempted to reach for them?"

Block window 1: [7:00 AM] to [9:00 AM]
+ Add another window

Active days: [M ✓] [T ✓] [W ✓] [T ✓] [F ✓] [S] [S]

─────────────────────────────────────

"Remind me before my anchor time?"

○ No reminder
○ [15 min] before (e.g., {calculated from anchor time})
○ [30 min] before

Message style:
○ Simple ("Time to meditate")
○ Motivational ("Your {unlockDurationMinutes} minutes await")
○ Custom: ____
```

**Dynamic binding:** Reminder example time must calculate from `anchorTime - reminderMinutesBefore`. Motivational message must use actual `unlockDurationMinutes`.

### Screen 8: Forgiveness & Fresh Start

```
"Life happens. Build in some grace."

Emergency skips: [1] [2] [3] [5] per month
(Phone unlocks without meditation - use sparingly)

Grace period after anchor time:
[None]  [30 min]  [1 hour]  [2 hours]

Safety auto-unlock:
○ After 2 hours (recommended)
○ After 4 hours
○ No auto-unlock (hardcore)

─────────────────────────────────────

"When should your Meditation Lock begin?"

○ Next Monday ({actual date})
○ First of next month ({actual date})
○ Tomorrow ({actual date})
○ Custom date

[Activate Meditation Lock]
```

**Dynamic binding:** Fresh start options must show actual dates, e.g., "Next Monday (Jan 27)".

---

## Shield Modal Design

The shield is a **gate and CTA**, not a meditation experience. All meditation UX happens in the app using existing Timer functionality.

### Shield - Locked State

```
┌────────────────────────────────────────┐
│                                        │
│          [Still Hours logo]            │
│                                        │
│     "After {anchorRoutine}"            │
│     {unlockDurationMinutes} minutes    │
│     to unlock                          │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │       Open Still Hours           │  │
│  └──────────────────────────────────┘  │
│                                        │
│       Need flexibility today?          │
│                                        │
└────────────────────────────────────────┘
```

### Shield - Flexibility Mode

```
┌────────────────────────────────────────┐
│                                        │
│     "Showing up matters most"          │
│                                        │
│     Your minimum today:                │
│     {minimumFallbackMinutes} minutes   │
│                                        │
│     "If I'm {obstacles[0].obstacle},   │
│      I will {obstacles[0].copingResponse}"  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  Open Still Hours                │  │
│  │  ({minimumFallbackMinutes} min)  │  │
│  └──────────────────────────────────┘  │
│                                        │
│   Use emergency skip                   │
│   ({streakFreezesRemaining} left)      │
│                                        │
└────────────────────────────────────────┘
```

### Shield - Session In Progress

```
┌────────────────────────────────────────┐
│                                        │
│          [Still Hours logo]            │
│                                        │
│     "Session in progress"              │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │     Return to Still Hours        │  │
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

**No progress indicator.** User shouldn't be tapping apps mid-meditation.

### Deep Link Behavior

When "Open Still Hours" tapped:

1. App opens to Timer tab
2. `PlannedSession` auto-created with:
   - `duration`: lock requirement or fallback (from shield state)
   - `enforceGoal: true` (timer auto-stops - **existing functionality**)
   - `title`: `After ${anchorRoutine}`
3. User starts timer → existing UX → auto-stops at duration
4. Session saves → lock deactivates

### Obstacle Selection Logic

When showing the "Flexibility" state, which obstacle/response to display?

**v1: First-selected** — Show the obstacle they selected first during setup. Simple, predictable.

**v2: Context-aware** — If morning, show "running late". If evening, show "too tired". Requires tracking usage patterns.

### Edge Case: Pre-Window Completion

User's anchor is 7 AM. They meditate at 6:30 AM. Lock window starts at 7 AM — are they locked?

**Solution:** Check for recent session when lock window activates:

```typescript
// When lock window activates (DeviceActivityMonitor.intervalDidStart):
const recentSession = getSessionsCompletedAfter(Date.now() - (gracePeriodMinutes + 60) * 60 * 1000)
if (recentSession && recentSession.durationSeconds >= unlockDurationMinutes * 60) {
  // Skip lock activation — they already completed today's session
  return
}
```

Early birds aren't punished.

---

## Celebration Modal (In-App)

Appears after session completes and lock deactivates. Follows existing modal patterns.

### Normal Completion

```
┌────────────────────────────────────────┐
│                                        │
│          [Checkmark animation]         │
│                                        │
│     "You showed up"                    │
│     {streakDays} days straight         │
│                                        │
│     {sessionDuration} minutes          │
│                                        │
│     "{celebrationRitual}"              │
│                                        │
│     Apps unlocked until {nextWindow}   │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │           Continue               │  │
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

### Hard Day Fallback Completion

```
│     "You showed up anyway"             │
│     {streakDays} days straight         │
│                                        │
│     {sessionDuration} minutes          │
│                                        │
│     That's what builds the habit.      │
```

**Dynamic binding:** "Apps unlocked until tomorrow" must show actual next window time, e.g., "Apps unlocked until 7:00 AM tomorrow" or "Apps unlocked until Monday 7:00 AM".

---

## Data Model

### New table: `meditationLockSettings` (schema v15)

```typescript
interface MeditationLockSettings {
  id: 1 // Singleton
  enabled: boolean
  authorizationStatus: 'authorized' | 'denied' | 'notDetermined'
  activationDate: number // Fresh start timestamp

  // Identity Framing
  identityStatement: string
  whyItMatters: string | null

  // Implementation Intentions (Anchor)
  anchorRoutine: string
  anchorLocation: string
  anchorTimeHour: number
  anchorTimeMinute: number
  backupAnchor: string | null
  backupAnchorTimeHour: number | null
  backupAnchorTimeMinute: number | null

  // Commitment & Tiny Habits
  unlockDurationMinutes: number // 5, 10, 12, 15, 20, 30, 45, 60
  minimumFallbackMinutes: number // 2, 3, 5
  celebrationRitual: string | null

  // Obstacle Anticipation
  obstacles: Array<{
    obstacle: string
    copingResponse: string
  }>

  // Accountability
  accountabilityEnabled: boolean
  accountabilityPhone: string | null
  accountabilityMethod: 'sms' | 'whatsapp' | 'choose'
  notifyOnCompletion: boolean
  notifyOnSkip: boolean

  // Apps & Schedule
  blockedAppTokens: string[]
  scheduleWindows: Array<{
    startHour: number
    startMinute: number
    endHour: number
    endMinute: number
  }>
  activeDays: boolean[] // [Sun...Sat]

  // Forgiveness & Safety
  streakFreezesPerMonth: number
  streakFreezesRemaining: number
  gracePeriodMinutes: number | null
  safetyAutoUnlockHours: number | null

  // Reminders
  reminderEnabled: boolean
  reminderMinutesBefore: number
  reminderStyle: 'motivational' | 'simple' | 'custom'
  customReminderMessage: string | null

  // Analytics
  totalUnlocks: number
  totalSkipsUsed: number
  totalHardDayFallbacks: number
  lastUnlockAt: number | null
  streakDays: number
  completionsByDayOfWeek: number[] // [Sun...Sat] — which days are hardest
}
```

---

## Design Specifications

### Selection Pills

```css
/* Default */
background: var(--bg-elevated);
border: 1px solid var(--border-subtle);
border-radius: 12px; /* rounded-xl */
padding: 12px 16px;
font: var(--text-body-size), font-medium;
color: var(--text-primary);
transition: all 150ms ease-out;

/* Selected */
background: color-mix(in oklab, var(--accent) 15%, transparent);
border: 1px solid var(--accent);

/* Active (press) */
transform: scale(0.98);
/* + haptic.light() */
```

### Modal Pattern

```css
/* Backdrop */
background: color-mix(in oklab, var(--bg-deep) 60%, transparent);
/* NO backdrop-filter/blur — app doesn't use glassmorphism */

/* Card */
background: var(--bg-base); /* Solid, not transparent */
border-radius: 16px; /* rounded-2xl */
box-shadow: var(--shadow-xl);
padding: 24px;

/* Motion */
framer-motion spring: { damping: 25, stiffness: 300 }
```

### Haptic Vocabulary (use existing `useTapFeedback()` hook)

| Action               | Method             |
| -------------------- | ------------------ |
| Pill tap             | `haptic.light()`   |
| Screen advance (CTA) | `haptic.medium()`  |
| Setup complete       | `haptic.success()` |
| Validation error     | `haptic.error()`   |
| Emergency skip used  | `haptic.warning()` |
| Apps unlocked        | `haptic.success()` |

### Buttons

Use existing `<Button variant="primary" size="lg" fullWidth />` component.

---

## Dynamic Binding Requirements

**All user inputs must flow through to outputs. No hardcoded values.**

| Location              | Wrong                           | Correct                                                        |
| --------------------- | ------------------------------- | -------------------------------------------------------------- |
| Screen 5 pills        | "do my 2-min minimum"           | `do my ${minimumFallbackMinutes}-min minimum`                  |
| Screen 6 preview      | "Jack meditated for 12 minutes" | `${userName} completed his ${unlockDurationMinutes} minute...` |
| Screen 7 example      | "(e.g., 6:45 AM)"               | Calculate from `anchorTime - reminderMinutesBefore`            |
| Screen 7 motivational | "Your 12 minutes await"         | `Your ${unlockDurationMinutes} minutes await`                  |
| Screen 8 dates        | "Next Monday (recommended)"     | `Next Monday (${formatDate(nextMonday)})`                      |
| Settings subtitle     | "Active · 7:00 AM - 9:00 AM"    | Use `scheduleWindows[0]` + `activeDays`                        |
| Celebration unlock    | "Apps unlocked until tomorrow"  | Show actual next window time/day                               |
| Shield coping text    | May contain hardcoded minimum   | Must use stored response with actual minimum                   |

### Unused Fields (consider future use)

| Field               | Status                                                     |
| ------------------- | ---------------------------------------------------------- |
| `identityStatement` | Consider using in reminder notifications for reinforcement |
| `anchorLocation`    | Currently captured but not displayed anywhere              |

---

## Integration Points

### Timer.tsx

```typescript
// After session completes (handleEnd flow):
if (isLockActive && session.durationSeconds >= lockUnlockRequirement) {
  await MeditationLock.writeToSharedContainer({
    lastSessionTimestamp: Date.now(),
    lastSessionDurationSeconds: session.durationSeconds,
  })
  await MeditationLock.deactivateLockUntilNextWindow()

  if (lockSettings.accountabilityEnabled && lockSettings.notifyOnCompletion) {
    await sendAccountabilityMessage('completion', session.durationSeconds)
  }

  setShowLockCelebrationModal(true)
}
```

### Deep Link Handler

```typescript
// When app opens via shield deep link:
// stillhours://lock-session?duration=12&fallback=false
if (params.lockSession) {
  const plan: PlannedSession = {
    duration: params.duration,
    enforceGoal: true,
    title: `After ${lockSettings.anchorRoutine}`,
    // ... other fields
  }
  navigateToTimerWithPlan(plan)
}
```

### Settings.tsx

New "Focus Mode" section:

```
Title: "Meditation Lock"
Subtitle (unconfigured): "Block distracting apps until you meditate"
Subtitle (configured): "Active · {startTime} - {endTime} · {days}"
On tap: Navigate to setup flow (if unconfigured) or lock settings (if configured)
```

---

## Files to Modify

| File                                      | Change                                          |
| ----------------------------------------- | ----------------------------------------------- |
| `src/lib/db/types.ts`                     | Add `MeditationLockSettings` interface          |
| `src/lib/db/schema.ts`                    | Add v15 migration                               |
| `src/lib/db/meditationLock.ts`            | New: CRUD for lock settings                     |
| `src/lib/meditationLock.ts`               | New: Capacitor plugin wrapper                   |
| `src/components/Settings.tsx`             | Add "Focus Mode" section                        |
| `src/components/Timer.tsx`                | Hook completion → deactivate lock + celebration |
| `src/components/LockCelebrationModal.tsx` | New: post-completion reinforcement              |
| `src/components/LockSetupFlow/`           | New: 8-screen guided setup                      |
| `ios/App/App/plugins/MeditationLock/`     | New: native Swift plugin                        |

### Native Plugin Files (iOS)

```
ios/App/App/plugins/MeditationLock/
├── MeditationLockPlugin.swift
├── MeditationLockPlugin.m
├── DeviceActivityExtension/
│   ├── DeviceActivityMonitor.swift
│   └── Info.plist
├── ShieldExtension/
│   ├── ShieldConfigurationExtension.swift
│   └── Info.plist
└── ManagedSettingsManager.swift
```

---

## Phased Implementation

### Phase 1: Native Plugin Foundation

- `MeditationLockPlugin` (Swift) following `NativeReview` pattern
- FamilyControls authorization
- FamilyActivityPicker for app selection
- Basic ManagedSettings blocking
- Settings UI: enable toggle + authorization

### Phase 2: Setup Flow

- 8-screen guided setup with all behavioral science inputs
- All dynamic bindings implemented
- Store to `meditationLockSettings` table
- Schedule configuration UI

### Phase 3: Schedule & Shield

- DeviceActivitySchedule for automatic activation
- DeviceActivityMonitorExtension
- Shield modal with deep link to app (all three states)
- App Groups for state sync

### Phase 4: Unlock & Celebration

- Timer.tsx: check duration on completion → deactivate
- Deep link handling with pre-populated plan
- Celebration modal with ritual reminder
- SMS/WhatsApp accountability integration

### Phase 5: Forgiveness & Polish

- Emergency skip flow
- Hard day fallback flow
- Backup anchor notification
- Grace period logic
- Safety auto-unlock
- Reminder notifications
- Analytics tracking

---

## Key Risks

| Risk                      | Mitigation                                                              |
| ------------------------- | ----------------------------------------------------------------------- |
| Apple rejects entitlement | Apply early; "coming soon" fallback                                     |
| Extension complexity      | App Groups; minimal extension logic                                     |
| User frustration          | Fallback + skips + safety valve; never block Still Hours/Phone/Messages |
| Android parity            | iOS-only v1; Android lacks equivalent API                               |
| Scope creep               | Explicit opt-in; not promoted in onboarding                             |

---

## What This Feature Is NOT

- **Not the app's identity** - Still Hours remains a meditation timer
- **Not mandatory** - Completely opt-in, buried in Settings
- **Not promoted** - No onboarding mention
- **Not tied to monetization** - Lock is free; meditation still consumes hour bank
- **Not a separate timer** - Uses existing Timer tab with `enforceGoal`

---

## Verification Plan

### Manual Testing

1. Complete 8-screen setup flow → verify all inputs saved with correct values
2. Verify all dynamic bindings show user's actual values (not hardcoded)
3. Reach anchor time → verify lock activates
4. Tap blocked app → verify shield with correct anchor/duration
5. Tap "Open Still Hours" → verify app opens with pre-populated plan
6. Complete session → verify timer auto-stops at duration
7. Verify celebration modal appears with ritual reminder
8. Verify SMS/WhatsApp sent to accountability partner with branded message
9. Verify apps unlock
10. Test hard day fallback flow
11. Test emergency skip flow
12. Test safety auto-unlock
13. Test backup anchor notification

### Edge Cases

- App killed mid-session
- Phone restart during active window
- Time zone change
- Plan deleted while lock active
- Grace period expiry
- Pre-window completion (early bird)
- Month rollover (streak freezes reset)

---

## Research Sources

- [Gollwitzer Implementation Intentions Meta-Analysis](<https://doi.org/10.1016/S0065-2601(99)80009-8>)
- [Fogg Behavior Model](https://behaviormodel.org/)
- [Lally Habit Formation Study](https://doi.org/10.1002/ejsp.674)
- [ASTD Accountability Research](https://www.td.org/)
- [Milkman Fresh Start Effect](https://doi.org/10.1287/mnsc.2014.1901)
- [Apple Screen Time API](https://developer.apple.com/documentation/screentimeapidocumentation)
- [react-native-device-activity](https://github.com/kingstinct/react-native-device-activity)
