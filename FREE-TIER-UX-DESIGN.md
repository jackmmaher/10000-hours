# FREE Tier UX Design: Trial → Downgrade Model

**Status:** FINAL | **Date:** January 2026 | **Version:** v2 Scope

---

## Design Philosophy

**The Slack Model, Enhanced with Loss Aversion:**

Slack's 90-day rolling window achieved 30-40% conversion. We take this further by:
1. Giving users the FULL premium experience for 30 days
2. Creating a clear "downgrade moment" on Day 31
3. Making the downgrade experience fundamentally inferior (not just "less data")

**Core Principle:**
> "Experience the value. Then lose it."

---

## The Trial → Downgrade Model

### Days 1-30: Implicit Premium Trial

New users get the complete premium experience. They don't know it's a trial.

| Feature | Trial Experience |
|---------|-----------------|
| **Timer** | "42.5 toward 10,000 hours" (cumulative) |
| **Stats** | All time windows (7d, 30d, 90d, Year, All) |
| **Milestones** | "Next: 50 hours (85%)" with progress bar |
| **Projections** | "At current pace: ~2035" |
| **Calendar** | Full history, all months |
| **Hide Time** | Available |

**The user thinks: "This is the app."**

### Day 31: The Trigger

When user taps to start a session on Day 31+:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  🧘 Your first 30 days are complete                │
│                                                     │
│  You've built a real practice. Your history is     │
│  still here — it's just starting to fade.          │
│                                                     │
│  Keep your full journey visible for $4.99/year.    │
│                                                     │
│  ┌───────────────────┐    ┌───────────────────┐    │
│  │ Keep practicing   │    │ See full journey  │    │
│  │                   │    │    $4.99/year     │    │
│  └───────────────────┘    └───────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Key Details:**
- Triggered on session START, not calendar view
- Shows ONCE (flag `trialExpired: true`)
- If dismissed: immediate UI reversion
- Timer session still starts after dismissal

### Day 31+: Downgraded FREE Experience

The app continues to work, but everything feels worse:

| Feature | Downgraded Experience |
|---------|----------------------|
| **Timer** | "2.3 hours this week" (rolling 7-day) |
| **Stats** | 7d/30d windows only |
| **Milestones** | Frozen: "✓ 10 hours" (can't see next) |
| **Goals** | Weekly: "2.3 of 5 hours" (fluctuates!) |
| **Projections** | Hidden: teaser text |
| **Calendar** | 90-day lookback + logarithmic fade |
| **Hide Time** | Locked |

---

## The Psychological Engine

### Why This Works

| Psychology | Effect |
|------------|--------|
| **Loss aversion** | 2x stronger than gain-seeking |
| **Sunk cost** | "My 42.5 hours are trapped" |
| **Fluctuation** | Rolling window goes DOWN — unsatisfying |
| **Frozen progress** | Can see achievement, can't see forward |
| **Fading history** | Watch your practice literally disappear |

### Cumulative vs Rolling: The Core Difference

**Premium (Cumulative) — Only Goes UP:**
```
Session complete: +32 minutes
"42.5 hours → 43.0 hours toward 10,000"

Bar grows. Number grows.
Every session = permanent progress.
Dopamine.
```

**FREE (Rolling 7-day) — Goes UP and DOWN:**
```
Session complete: +32 minutes
But yesterday's 45-minute session rolled off...
"2.3 hours → 2.1 hours (last 7 days)"

Bar SHRINKS. Number went DOWN.
"Wait, I meditated and my number decreased?"
```

**That confusion is the conversion trigger.**

---

## Screen-by-Screen Design

---

### 1. TIMER SCREEN

#### Days 1-30 (Trial) & Premium
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│              42.5                   │  ← Cumulative total
│       toward 10,000 hours           │
│                                     │
│                                     │
│              stats                  │
│               ︿                     │
└─────────────────────────────────────┘
```

#### Day 31+ FREE (Downgraded)
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│              2.3                    │  ← Rolling 7-day total
│          hours this week            │
│                                     │
│      ┌─────────────────────┐        │
│      │ See full journey →  │        │  ← Soft inline link
│      └─────────────────────┘        │
│                                     │
│              stats                  │
│               ︿                     │
└─────────────────────────────────────┘
```

**Key Changes:**
- Hero number switches from cumulative to weekly
- Subtitle changes: "toward 10,000" → "hours this week"
- Soft inline prompt to paywall (not blocking)

#### Running State (All Tiers — Identical)
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│            12:34                    │  ← Timer always works
│                                     │
│                                     │
│          tap to end                 │
│                                     │
└─────────────────────────────────────┘
```

**The timer is SACRED. Never limit it.**

---

### 2. STATS SCREEN

#### Days 1-30 (Trial) & Premium
```
┌─────────────────────────────────────┐
│  ←                            ⚙️    │
├─────────────────────────────────────┤
│              42.5                   │  ← Cumulative
│       toward 10,000 hours           │
├─────────────────────────────────────┤
│  7d  30d  90d  Year  All           │  ← All available
├─────────────────────────────────────┤
│          This week                  │
│    M  T  W  T  F  S  S              │
│    ●  ●  ○  ●  ◉  ○  ○              │
├─────────────────────────────────────┤
│  MILESTONES                         │
│  ┌─────────────────────────────┐    │
│  │ Next: 50 hours              │    │
│  │ ████████████████░░░ 85%     │    │
│  │ 42.5 hours tracked          │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  PROJECTIONS                        │
│  At current pace: ~2035             │
└─────────────────────────────────────┘
```

#### Day 31+ FREE (Downgraded)
```
┌─────────────────────────────────────┐
│  ←                            ⚙️    │
├─────────────────────────────────────┤
│              2.3                    │  ← Rolling weekly
│          hours this week            │
├─────────────────────────────────────┤
│  7d  30d  ░░░  ░░░░  ░░░           │  ← Others grayed (no 🔒)
├─────────────────────────────────────┤
│          This week                  │
│    M  T  W  T  F  S  S              │
│    ●  ●  ○  ●  ◉  ○  ○              │  ← Weekly dots same
├─────────────────────────────────────┤
│  THIS WEEK (Rolling)                │
│  ┌─────────────────────────────┐    │
│  │ ████████░░░░░░░░░ 46%       │    │  ← Fluctuates!
│  │ 2.3 of 5 hours              │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  MILESTONES                         │
│  ┌─────────────────────────────┐    │
│  │ ✓ 10 hours         (faded) │    │  ← Frozen achievement
│  │ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄   │    │
│  │ Your journey continues...   │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  PROJECTIONS                        │
│  ┌─────────────────────────────┐    │
│  │ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄   │    │  ← Placeholder
│  │ Unlock to see your path...  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Key Design Decisions:**
1. **No lock icons** — grayed tabs, not 🔒
2. **Weekly goal fluctuates** — rolling 7-day, goes up AND down
3. **Milestone frozen** — shows achievement but not next target
4. **Projections teased** — placeholder lines, not hard block

---

### 3. CALENDAR SCREEN

#### Days 1-30 (Trial) & Premium
Full history, all months navigable, no restrictions.

#### Day 31+ FREE: Current Month (Full View)
```
┌─────────────────────────────────────┐
│    ◀    January 2026    ▶          │
├─────────────────────────────────────┤
│  Mo Tu We Th Fr Sa Su               │
│      1  2  3  4  5                  │
│   6  7  8  9 10 11 12               │  ← 100% opacity
│  13 14 15 16 17 18 19               │     (full view)
│  20 21 22 23 24 25 26               │
│  27 28 29 30 31                     │
├─────────────────────────────────────┤
│  8.2 hrs │ 18 sessions │ 27 avg    │
└─────────────────────────────────────┘
```

#### Day 31+ FREE: Previous Month (31-60 days = 60% opacity)
```
┌─────────────────────────────────────┐
│    ◀   December 2025    ▶          │
├─────────────────────────────────────┤
│  Mo Tu We Th Fr Sa Su               │
│   1  2  3  4  5  6  7               │  ← 60% opacity
│   8  9 10 11 12 13 14               │     (visibly faded)
│  15 16 17 18 19 20 21               │
│  22 23 24 25 26 27 28               │
│  29 30 31                           │
├─────────────────────────────────────┤
│   ┌───────────────────────────┐     │
│   │ Your December is fading   │     │  ← Contextual message
│   │ Keep it visible → $0.41/mo│     │
│   └───────────────────────────┘     │
└─────────────────────────────────────┘
```

#### Day 31+ FREE: Old Month (61-90 days = 30% opacity)
```
┌─────────────────────────────────────┐
│    ◀   November 2025    ▶          │
├─────────────────────────────────────┤
│  Mo Tu We Th Fr Sa Su               │
│                    1  2             │  ← 30% opacity
│   3  4  5  6  7  8  9               │     (hard to read)
│  10 11 12 13 14 15 16               │
│  17 18 19 20 21 22 23               │
│  24 25 26 27 28 29 30               │
├─────────────────────────────────────┤
│   ┌───────────────────────────┐     │
│   │ 47 sessions from November │     │  ← Shows COUNT
│   │ are fading away...        │     │
│   └───────────────────────────┘     │
└─────────────────────────────────────┘
```

#### Day 31+ FREE: Very Old Month (90+ days = 10% + blur)
```
┌─────────────────────────────────────┐
│    ◀   October 2025     ▶          │
├─────────────────────────────────────┤
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │  ← 10% + blur
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │     (shapes only)
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │
├─────────────────────────────────────┤
│                                     │
│      52 sessions • 23.4 hours       │  ← SHOW the numbers!
│                                     │
│      Your October is still here.    │
│                                     │
│      ┌─────────────────────┐        │
│      │  Unlock History     │        │
│      │     $4.99/year      │        │
│      └─────────────────────┘        │
└─────────────────────────────────────┘
```

**Critical Insight:** At 90+ days, we SHOW "52 sessions • 23.4 hours" but BLUR the detail. User knows WHAT they're losing — maximum FOMO.

---

### 4. SETTINGS SCREEN

#### Days 1-30 (Trial) & Premium
```
┌─────────────────────────────────────┐
│  ←                        Settings  │
├─────────────────────────────────────┤
│                                     │
│  YOUR JOURNEY                       │
│  ┌─────────────────────────────┐    │
│  │ Status: Premium             │    │
│  │ Renews: Jan 15, 2027        │    │
│  └─────────────────────────────┘    │
│                                     │
│  MEDITATION                         │
│  ┌─────────────────────────────┐    │
│  │ Hide Time Display     [ON] │    │  ← Available
│  └─────────────────────────────┘    │
│                                     │
│  ...                                │
└─────────────────────────────────────┘
```

#### Day 31+ FREE (Downgraded)
```
┌─────────────────────────────────────┐
│  ←                        Settings  │
├─────────────────────────────────────┤
│                                     │
│  YOUR JOURNEY                       │
│  ┌─────────────────────────────┐    │
│  │ 47 days meditating          │    │
│  │ 30-day window active        │    │
│  │                             │    │
│  │ ┌─────────────────────────┐ │    │  ← Persistent banner
│  │ │ Unlock full journey     │ │    │     (not nagging)
│  │ │      $4.99/year         │ │    │
│  │ └─────────────────────────┘ │    │
│  └─────────────────────────────┘    │
│                                     │
│  MEDITATION                         │
│  ┌─────────────────────────────┐    │
│  │ Hide Time Display   [🔒]   │    │  ← Locked
│  └─────────────────────────────┘    │
│                                     │
│  ...                                │
└─────────────────────────────────────┘
```

**The Settings banner is the only persistent reminder.** No popups, no nagging. The degraded experience itself is the reminder.

---

## Rolling 7-Day Window: Implementation

The weekly goal is a **rolling window**, not calendar week:

```
Today is Friday, Jan 10

Rolling window = Jan 4 - Jan 10 (last 7 days)

Sat   Sun   Mon   Tue   Wed   Thu   Fri
Jan4  Jan5  Jan6  Jan7  Jan8  Jan9  Jan10
30m   45m   0m    20m   35m   0m    [today]

Rolling total: 2.2 hours (last 7 days)
```

**Tomorrow (Saturday, Jan 11):**
- Jan 4 (30m) rolls OFF
- Jan 11 becomes the new day
- Window shifts: Jan 5 - Jan 11

**Key behaviors:**
- Always T-7 to T-0 (today)
- Sessions "roll off" daily
- Number can go DOWN after a meditation
- No Monday reset — continuous flow

**Weekly Goal:** 5 hours (fixed target for v2)

---

## Logarithmic Fade: CSS Implementation

```css
/* Calendar cell fade by age */
.calendar-cell-current {
  opacity: 1;
}

.calendar-cell-fading {      /* 31-60 days */
  opacity: 0.6;
  transition: opacity 400ms ease;
}

.calendar-cell-old {         /* 61-90 days */
  opacity: 0.3;
  transition: opacity 400ms ease;
}

.calendar-cell-ancient {     /* 90+ days */
  opacity: 0.1;
  filter: blur(4px);
  transition: all 400ms ease;
}

/* Hover slightly reveals (teaser) */
.calendar-cell-fading:hover { opacity: 0.75; }
.calendar-cell-old:hover { opacity: 0.45; }
.calendar-cell-ancient:hover {
  opacity: 0.2;
  filter: blur(2px);
}
```

---

## Conversion Touchpoints

### Soft Prompts (Never Blocking)

| Location | Trigger | Message | CTA |
|----------|---------|---------|-----|
| Timer | Always (Day 31+ FREE) | "See full journey →" | Inline link |
| Stats tabs | Tap grayed 90d/Year/All | Tooltip: "Unlock full history" | Link |
| Stats milestones | Frozen card | "Your journey continues..." | Teaser text |
| Stats projections | Placeholder | "Unlock to see your path..." | Link |
| Calendar 31-60d | Navigate to month | "Your [Month] is fading" | Inline card |
| Calendar 61-90d | Navigate to month | "[X] sessions fading away" | Inline card |
| Calendar 90d+ | Navigate to month | Stats shown + blur | CTA button |
| Settings | Always (Day 31+ FREE) | "Unlock full journey" | Persistent banner |

### Day 31 Banner (One-Time Only)

Appears on first session start when `daysSinceFirstSession >= 31`:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  🧘 Your first 30 days are complete                │
│                                                     │
│  You've built a real practice. Your history is     │
│  still here — it's just starting to fade.          │
│                                                     │
│  Keep your full journey visible for $4.99/year.    │
│                                                     │
│  ┌───────────────────┐    ┌───────────────────┐    │
│  │ Keep practicing   │    │ See full journey  │    │
│  │                   │    │    $4.99/year     │    │
│  └───────────────────┘    └───────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**After dismissal:**
- Set `trialExpired: true`
- Banner never shows again
- UI immediately reverts to downgraded FREE
- Settings banner becomes the only persistent reminder

---

## Milestone Handling: Frozen Achievement

### During Trial (Days 1-30)

User sees cumulative progress:
```
MILESTONES
┌─────────────────────────────────────┐
│ Next: 50 hours                      │
│ ████████████████░░░ 85%             │
│ 42.5 hours tracked                  │
└─────────────────────────────────────┘
```

### After Downgrade (Day 31+ FREE)

Milestone is FROZEN at last achieved:
```
MILESTONES
┌─────────────────────────────────────┐
│ ✓ 10 hours achieved        (faded) │  ← They got this
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄     │
│ Your journey continues...           │  ← Can't see next
└─────────────────────────────────────┘
```

**Why this works:**
- They can SEE they achieved something
- They CAN'T see what's next or how close they are
- The achievement is frozen in time
- Creates desire to "unfreeze" their progress

---

## Data Architecture

### What We Store vs What We Show

```typescript
// ALL sessions stored forever (locally in Dexie)
// UI visibility determined by tier + trial status

interface SessionVisibility {
  session: Session;
  ageInDays: number;
  isTrialActive: boolean;  // daysSinceFirst < 31
  isPremium: boolean;

  // Computed for display
  opacity: number;         // 1.0, 0.6, 0.3, or 0.1
  isBlurred: boolean;      // true if 90+ days and downgraded FREE
  showInStats: boolean;    // false if beyond window and FREE
}

function getSessionVisibility(
  session: Session,
  isPremium: boolean,
  isTrialActive: boolean
): SessionVisibility {
  const ageInDays = daysSince(session.startTime);

  // Premium or Trial: full visibility
  if (isPremium || isTrialActive) {
    return { opacity: 1, isBlurred: false, showInStats: true };
  }

  // Downgraded FREE: apply fade rules
  if (ageInDays <= 30) {
    return { opacity: 1, isBlurred: false, showInStats: true };
  } else if (ageInDays <= 60) {
    return { opacity: 0.6, isBlurred: false, showInStats: true };
  } else if (ageInDays <= 90) {
    return { opacity: 0.3, isBlurred: false, showInStats: true };
  } else {
    return { opacity: 0.1, isBlurred: true, showInStats: false };
  }
}
```

---

## Summary: Trial vs FREE vs Premium

| Feature | Days 1-30 (Trial) | Day 31+ FREE | Premium |
|---------|-------------------|--------------|---------|
| **Timer display** | Cumulative total | Rolling weekly | Cumulative total |
| **Stats windows** | All | 7d, 30d only | All |
| **Milestones** | Full progression | Frozen + weekly goal | Full progression |
| **Projections** | Visible | Hidden (teaser) | Visible |
| **Calendar** | Full history | 90-day + fade | Full history |
| **Hide Time** | Available | Locked | Available |
| **Experience** | Premium | Degraded | Premium |

---

## Success Metrics

- **Day 31 conversion rate** — Target: 8-12%
- **Time to purchase** — Track median days from Day 31
- **Retention at Day 60** — % still using app
- **Fade-triggered conversions** — % who convert after viewing faded month

---

*This design creates genuine loss aversion without dark patterns. Users experience real value, then feel the absence of it. The downgrade is honest — the data is still there, just harder to see.*
