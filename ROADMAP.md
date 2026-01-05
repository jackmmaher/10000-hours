# 10,000 Hours - iOS Commercialization Roadmap

**Status:** v2 SCOPE (Rolling Window + Premium Gating) | **Date:** January 2026

---

## Vision

Transform the minimalist meditation timer PWA into a commercially viable iOS app while preserving its zen philosophy. The app's restraint IS the product — we enhance without bloating.

**Core focus:** Tracking progression toward 10,000 hours with a monetization model that lets users experience full value before asking them to pay.

**Pricing Model:** 30-Day Trial → $4.99/year Premium

The app is **free forever** with degraded features after Day 31. Premium ($4.99/year) unlocks your full journey. This model is proven by Slack (30-40% conversion) and leverages loss aversion psychology (users experience premium, then lose it).

**v2 Core Features:**
- 30-day implicit trial (full Premium experience)
- Day 31 downgrade trigger (revert to rolling window)
- Rolling 7-day stats for FREE tier
- Calendar with 90-day lookback + logarithmic fade
- Frozen milestone achievements (cumulative hidden)
- $4.99/year Premium to restore full experience
- Hide Time Display (Premium only)
- Ghibli-inspired design language

**Deferred to v3:**
- Insight Journal (voice recording, transcription, archive)
- Wisdom Stream (community features, Supabase)
- Word Cloud visualization
- See [v3 Addendum](#v3-addendum-deferred-features) at end of document

---

## The Trial → Downgrade Model

This is the core monetization strategy. Users experience FULL value, then LOSE it.

### Days 1-30: Implicit Premium Trial

New users get the complete premium experience without knowing it's a trial:

| Feature | Days 1-30 Experience |
|---------|---------------------|
| **Timer** | Full cumulative hours: "42.5 toward 10,000 hours" |
| **Stats** | All time windows (7d, 30d, 90d, Year, All) |
| **Milestones** | Full adaptive progression: "Next: 50 hours (85%)" |
| **Projections** | "At current pace: ~2035" |
| **Calendar** | Full history, all months |

**The user thinks: "This is the app."**

### Day 31: The Trigger Moment

When the user starts their first session on Day 31:

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

**Trigger:** First session where `daysSinceFirstSession >= 31`

**If user dismisses:** App immediately reverts to downgraded FREE tier.

### Day 31+: Downgraded FREE Experience

The app continues to work, but the experience is fundamentally inferior:

| Feature | Downgraded FREE Experience |
|---------|---------------------------|
| **Timer** | Rolling weekly hours: "2.3 hours this week" |
| **Stats** | 7d and 30d windows only, others grayed |
| **Milestones** | Frozen: "✓ 10 hours achieved" (can't see next) |
| **Goals** | Weekly goal: "2.3 of 3.5 hours" (adaptive, based on trial average) |
| **Projections** | Hidden: "Unlock to see your path..." |
| **Calendar** | 90-day lookback with logarithmic fade |

### The Psychological Engine

| Psychology | Effect |
|------------|--------|
| **Loss aversion** | They HAD cumulative tracking, now it's gone |
| **Sunk cost** | "I have 42.5 hours tracked, I want to see it again" |
| **Fluctuation anxiety** | Rolling window goes UP and DOWN (unlike cumulative) |
| **Frozen progress** | Milestone achieved but can't see journey forward |

**Key insight:** The downgrade isn't just "less data" — it's a fundamentally different emotional relationship with the app.

### Cumulative vs Rolling: The Core Difference

**Premium (Cumulative):**
```
Session complete: +32 minutes
"42.5 hours → 43.0 hours toward 10,000"

Bar grows. Number grows. Dopamine.
Every session = permanent progress.
```

**FREE Downgrade (Rolling 7-day):**
```
Session complete: +32 minutes
But yesterday's 45-minute session just rolled off...
"2.3 hours → 2.1 hours (last 7 days)"

Bar SHRINKS. Number went DOWN.
"Wait, I meditated and my number decreased?"
```

**That moment is the conversion trigger.**

---

## Navigation Architecture

```
                    +--------------+
                    |  ONBOARDING  |  (first launch only)
                    +------+-------+
                           |
+------------------------------------------------------------------+
|                                                                  |
|   TIMER  ←→  STATS  ←→  CALENDAR                                |
|   (home)    (analytics)  (history)                              |
|                ↓                                                  |
|            SETTINGS                                              |
|                                                                  |
|   Overlay: Paywall (Day 31 trigger or limit hit)                |
|                                                                  |
+------------------------------------------------------------------+
```

### Screen Flow

| Screen | Purpose | Days 1-30 (Trial) | Day 31+ FREE | PREMIUM |
|--------|---------|-------------------|--------------|---------|
| **Timer** | Meditation | Full cumulative | Rolling weekly | Full cumulative |
| **Stats** | Analytics | All windows | 7d/30d only | All windows |
| **Calendar** | History | Full history | 90-day + fade | Full history |
| **Settings** | Preferences | Full access | "Unlock" banner | Full access |
| **Paywall** | Purchase | Not shown | Available | N/A |

---

## Feature Breakdown: Trial vs FREE vs PREMIUM

### The Rolling Window Model

**Critical design:** All data is ALWAYS stored locally. The UI visibility changes, not the data.

| Feature | Days 1-30 (Trial) | Day 31+ FREE | PREMIUM |
|---------|-------------------|--------------|---------|
| **Timer (active)** | Unlimited | Unlimited | Unlimited |
| **Timer display** | Cumulative total | Rolling weekly | Cumulative total |
| **Total Hours** | Visible | Hidden | Visible |
| **Session History** | Full | Rolling 90 days | Full |
| **Calendar** | All months | 90-day + fade | All months |
| **Stats Windows** | All (7d→All) | 7d, 30d only | All |
| **Milestones** | Full progression | Frozen + weekly goal | Full progression |
| **Projections** | Visible | Hidden (teaser) | Visible |
| **Hide Time Display** | Available | Locked | Available |
| **Data Export** | Available | Locked | Available |

### Calendar Logarithmic Fade (Day 31+ FREE)

Past data fades progressively, creating FOMO:

| Age | Opacity | Effect |
|-----|---------|--------|
| 0-30 days | 100% | Full visibility |
| 31-60 days | 60% | Noticeably faded |
| 61-90 days | 30% | Hard to read |
| 90+ days | 10% + blur | Shapes visible, detail hidden |

**Key:** At 90+ days, we still SHOW the numbers ("52 sessions • 23.4 hours") but BLUR the detail. User knows WHAT they're losing.

### Milestone Handling (Day 31+ FREE)

**During Trial (Days 1-30):**
```
MILESTONES
┌─────────────────────────────────────┐
│ Next: 50 hours                      │
│ ████████████████░░░ 85%             │
│ 42.5 hours tracked                  │
└─────────────────────────────────────┘
```

**After Downgrade (Day 31+ FREE):**
```
THIS WEEK (Rolling 7-day)
┌─────────────────────────────────────┐
│ ████████░░░░░░░░░░░ 66%             │
│ 2.3 of 3.5 hours                    │  ← Adaptive goal (80% of trial avg)
│ (based on your first 30 days)       │
└─────────────────────────────────────┘

MILESTONES
┌─────────────────────────────────────┐
│ ✓ 10 hours achieved        (faded) │  ← Frozen
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄     │
│ Your journey continues...           │
└─────────────────────────────────────┘
```

**Why weekly goal fluctuates:** It's a rolling 7-day window. Each day, the oldest day's sessions roll off. New sessions add. The number goes UP and DOWN — unlike cumulative which only grows. This is inherently less satisfying.

**Adaptive goal formula:** `weeklyGoal = avg(dailyMinutes during trial) * 7 * 0.8`
- Calculates 80% of user's trial-period average, making it achievable
- Minimum 1 hour, maximum 35 hours (capped at 5h/day equivalent)
- Fallback to 5 hours if no trial data available

---

## Hide Time Display (Premium Feature)

Optional setting for practitioners who prefer number-free meditation.

### Research Validation
> *"One feature that would make it simply perfect — an option to NOT show the numbers while it's running."* (App Store review)

### User Flow (Hide Time Enabled)

```
IDLE STATE:
┌─────────────────────────────────────┐
│                                     │
│       Just start meditating         │
│                                     │
│            [ Begin ]                │
└─────────────────────────────────────┘

RUNNING STATE:
┌─────────────────────────────────────┐
│                                     │
│          ◯                          │  ← Breathing circle
│       (pulsing)                     │     NO time displayed
│                                     │
│         Tap to end                  │
└─────────────────────────────────────┘

COMPLETE STATE:
┌─────────────────────────────────────┐
│                                     │
│      Meditation complete            │
│                                     │
│        [ View Stats ]               │
└─────────────────────────────────────┘
```

---

## Monetization

### Pricing Model: $4.99/year Premium Subscription

| Product | Price | Net (after Apple 15%) | What's Unlocked |
|---------|-------|----------------------|-----------------|
| **Days 1-30** | $0 | - | Full Premium experience (implicit trial) |
| **Day 31+ FREE** | $0 | - | Degraded: rolling weekly, 90-day calendar, frozen milestones |
| **PREMIUM** | $4.99/year | $4.24/year | Restore full experience + Hide Time |

### Why This Pricing?

**$4.99/year Premium:**
- **Trivial amount** - $0.41/month, impulse purchase
- **High retention** - Cheap annual plans retain 36% of users
- **Proven model** - Slack achieved 30-40% conversion with rolling history gate
- **Loss aversion** - They've EXPERIENCED premium, now losing it

### Paywall Triggers

| Trigger | When | Message |
|---------|------|---------|
| **Day 31** | First session on Day 31+ | "Your first 30 days are complete..." |
| **Stats tap** | Tap grayed 90d/Year/All tabs | "Unlock full history" |
| **Calendar nav** | Navigate beyond 90 days | "Your [month] is fading..." |
| **Milestone tap** | Tap frozen milestone | "Continue your journey..." |
| **Hide Time tap** | Tap locked toggle | "Premium feature" |

### Post-Downgrade Soft Reminders

No nagging popups. The degraded experience IS the reminder.

**Settings screen (Day 31+ FREE):**
```
┌─────────────────────────────────────┐
│  YOUR JOURNEY                       │
│  ┌─────────────────────────────┐    │
│  │ 47 days meditating          │    │
│  │ 30-day window active        │    │
│  │                             │    │
│  │ [Unlock full journey $4.99] │    │  ← Persistent, not nagging
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Revenue Projections

**Conservative: 8% conversion (loss aversion boost), 80% retention**

| Year | Downloads | Conversions | Retained | Total Paid | Revenue |
|------|-----------|-------------|----------|------------|---------|
| 1 | 200,000 | 16,000 | — | 16,000 | $67,840 |
| 2 | 200,000 | 16,000 | 12,800 | 28,800 | $122,112 |
| 3 | 200,000 | 16,000 | 23,040 | 39,040 | $165,530 |

**3-year total: $355,482**

---

## Technical Architecture

### Stack (v2 - Simplified)

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| State | Zustand |
| Local DB | Dexie (IndexedDB) |
| Payments | RevenueCat |
| Analytics | RevenueCat Custom Events |
| iOS Wrapper | Capacitor |
| Styling | Tailwind CSS |
| Crash Reporting | Sentry |
| Testing | Vitest |

**Not needed for v2:**
- ~~Supabase~~ (deferred to v3 Wisdom Stream)
- ~~Speech Recognition~~ (deferred to v3 Voice Notes)
- ~~Audio Recording~~ (deferred to v3)

### Database Schema (v2)

```typescript
// src/lib/db.ts
import Dexie, { Table } from 'dexie';

interface Session {
  id?: number;
  uuid: string;
  startTime: number;        // timestamp ms
  endTime: number;          // timestamp ms
  durationSeconds: number;
}

interface AppState {
  id: 'main';
  hasReachedEnlightenment: boolean;
  enlightenmentReachedAt?: number;
}

interface UserProfile {
  id: 1;
  tier: 'free' | 'premium';
  premiumExpiryDate?: number;
  originalPurchaseDate?: number;
  firstSessionDate?: number;    // For Day 31 trigger
  trialExpired: boolean;        // Has seen Day 31 banner
  trialEndDate?: number;        // When trial ended (for adaptive goal calculation)
}

interface UserSettings {
  id: 1;
  hideTimeDisplay: boolean;
}

class AppDatabase extends Dexie {
  sessions!: Table<Session>;
  appState!: Table<AppState>;
  profile!: Table<UserProfile>;
  settings!: Table<UserSettings>;

  constructor() {
    super('TenThousandHours');

    this.version(2).stores({
      sessions: '++id, uuid, startTime',
      appState: 'id',
      profile: 'id',
      settings: 'id'
    });
  }
}

export const db = new AppDatabase();
```

**Migration note:** v2 schema adds `profile` and `settings` tables. Existing v1 users need `firstSessionDate` backfilled from `MIN(sessions.startTime)`.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/db.ts` | Add profile, settings tables; migration for existing users |
| `src/lib/calculations.ts` | Add `getWeeklyRollingStats()`, `getSessionVisibility()` |
| `src/stores/useSessionStore.ts` | Add tier checking, Day 31 trigger logic |
| `src/App.tsx` | Add Settings route, tier-based rendering |
| `src/components/Timer.tsx` | Conditional display (cumulative vs weekly), hide time mode |
| `src/components/Stats.tsx` | Tier-based windows, frozen milestones, weekly goal |
| `src/components/Calendar.tsx` | 90-day limit, logarithmic fade, locked overlay |
| `src/index.css` | Fade classes, blur utilities |

## New Files to Create

```
src/
  lib/
    purchases.ts          # RevenueCat integration
    tierLogic.ts          # Day 31 trigger, visibility rules, fade calculations, adaptive goal
    analytics.ts          # RevenueCat custom events wrapper
    __tests__/
      tierLogic.test.ts   # Tier logic unit tests (12+ test cases)

  stores/
    usePremiumStore.ts    # Subscription status (free/premium + expiry)
    useSettingsStore.ts   # User settings (hide time)

  components/
    Onboarding.tsx        # Intro flow (3 screens)
    Settings.tsx          # Settings screen with upgrade banner
    PaywallPremium.tsx    # Day 31 paywall + upgrade prompts
    LockedOverlay.tsx     # Reusable blur + unlock CTA
    WeeklyGoal.tsx        # Rolling 7-day goal display (adaptive target)
    FrozenMilestone.tsx   # Achieved milestone (frozen state)
```

**Dependencies to add:**
```json
{
  "@revenuecat/purchases-capacitor": "^7.x.x",
  "@sentry/capacitor": "^0.x.x",
  "@sentry/react": "^7.x.x",
  "vitest": "^1.x.x",
  "@testing-library/react": "^14.x.x",
  "@capacitor-community/keep-awake": "^3.x.x"
}
```

---

## Implementation Phases

### Phase 0: Account & Service Setup
**Do FIRST, before any code. Some steps take days to process.**

- [ ] **Apple Developer Program enrollment ($99/year)**
  - developer.apple.com/programs/enroll
  - VERIFY: Can log into developer.apple.com/account
  - NOTE: Approval can take 24-48 hours

- [ ] **Create App ID in Apple Developer Portal**
  - Bundle ID: `com.yourname.tenthousandhours`
  - VERIFY: App ID appears in list

- [ ] **App Store Connect setup**
  - My Apps → (+) New App
  - VERIFY: App appears in "My Apps"

- [ ] **Agreements, Tax, Banking**
  - Accept Paid Apps agreement
  - Enter banking and tax information
  - VERIFY: Status shows "Active" (1-3 business days)

- [ ] **Create RevenueCat account**
  - app.revenuecat.com
  - Create project: "10000 Hours"
  - VERIFY: Green checkmark for your app

- [ ] **Create IAP product in App Store Connect**
  - Subscription Group: "Premium"
  - Product: `premium_annual`, $4.99/year
  - VERIFY: Product shows "Ready to Submit"

- [ ] **Configure RevenueCat**
  - Products → Add `premium_annual`
  - Entitlement: "premium"
  - Offering: "default"
  - VERIFY: Green checkmark

#### Phase 0 - TEST CHECKLIST
- [ ] Can log into Apple Developer account
- [ ] App ID exists
- [ ] App in App Store Connect
- [ ] Banking/tax "Active"
- [ ] RevenueCat shows green checkmark
- [ ] Subscription approved

---

### Phase 1: Infrastructure
**REQUIRES: Phase 0 complete**

- [ ] **Install Sentry**
  - `npm install @sentry/capacitor @sentry/react`
  - Initialize before any other code
  - VERIFY: Test crash appears in dashboard

- [ ] **Set up Vitest**
  - `npm install -D vitest @testing-library/react`
  - First test: tier logic calculations
  - VERIFY: `npm run test` passes

- [ ] **Update Dexie schema**
  - Add `profile`, `settings` tables
  - Add `trialEndDate` field to UserProfile (for adaptive goal calculation)
  - Migration: backfill `firstSessionDate` from existing sessions
  - VERIFY: Schema upgrade works for existing users

- [ ] **Create usePremiumStore.ts**
  - Track: tier, premiumExpiryDate, trialExpired, trialEndDate
  - Helper: `isPremium()`, `isTrialActive()`, `getDaysSinceFirstSession()`
  - VERIFY: Store compiles, defaults correctly

- [ ] **Create tierLogic.ts**
  - `getSessionVisibility(session, tier, daysSinceFirst)`
  - `shouldTriggerPaywall(daysSinceFirst, trialExpired)`
  - `getCalendarFadeOpacity(dayAge)`
  - `getWeeklyRollingHours(sessions)`
  - `calculateAdaptiveWeeklyGoal(sessions, trialEndDate)` - 80% of trial average
  - VERIFY: Logic matches spec

- [ ] **Create tier logic unit tests**
  - Test file: `src/lib/__tests__/tierLogic.test.ts`
  - Required test cases:
    ```typescript
    // Paywall trigger tests
    shouldTriggerPaywall(daysSinceFirst=30) → false
    shouldTriggerPaywall(daysSinceFirst=31) → true
    shouldTriggerPaywall(daysSinceFirst=31, trialExpired=true) → false

    // Calendar fade tests
    getCalendarFadeOpacity(dayAge=29) → 1.0
    getCalendarFadeOpacity(dayAge=45) → 0.6
    getCalendarFadeOpacity(dayAge=60) → 0.3
    getCalendarFadeOpacity(dayAge=90) → 0.1

    // Rolling window tests
    getWeeklyRollingHours([]) → 0
    getWeeklyRollingHours(sessions) → correct calculation

    // Session visibility tests
    isSessionVisible(session, 'premium') → true (always)
    isSessionVisible(session, 'free', dayAge=29) → true
    isSessionVisible(session, 'free', dayAge=91) → false

    // Adaptive goal tests
    calculateAdaptiveWeeklyGoal([], trialEndDate) → 5 (fallback)
    calculateAdaptiveWeeklyGoal(sessions, trialEndDate) → correct value
    ```
  - VERIFY: All 12+ tests pass with `npm run test`

- [ ] **Set up analytics tracking**
  - Create `src/lib/analytics.ts` using RevenueCat custom events
  - Events to track:
    - `Day31TriggerShown` - paywall shown on Day 31
    - `PaywallDismissed` - user dismisses paywall
    - `PaywallConverted` - user completes purchase
    - `StatsTapWhenLocked` - user taps locked stats window
    - `CalendarFadeTapped` - user taps faded calendar area
    - `HideTimeToggled` - user toggles hide time setting
  - VERIFY: Events fire correctly in RevenueCat dashboard

#### Phase 1 - TEST CHECKLIST
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Sentry receives test crash
- [ ] Schema migration works
- [ ] Tier logic calculations correct
- [ ] **Tier logic tests:** All 12+ test cases pass
- [ ] **Analytics:** Test events appear in RevenueCat dashboard

---

### Phase 2a: Trial/Downgrade Logic
**REQUIRES: Phase 1 complete**

#### Tier Logic Implementation

- [ ] **Create src/lib/tierLogic.ts** (if not done in Phase 1)
  - `shouldTriggerPaywall(daysSinceFirst: number, trialExpired: boolean): boolean`
  - `getSessionVisibility(session: Session, tier: TierType, daysSinceFirst: number): VisibilityResult`
  - `getCalendarFadeOpacity(dayAge: number): number`
  - `getWeeklyRollingHours(sessions: Session[]): number`
  - `calculateAdaptiveWeeklyGoal(sessions: Session[], trialEndDate: number): number`
  - VERIFY: All functions have corresponding unit tests

- [ ] **Update Timer.tsx**
  - Trial/Premium: Show cumulative "42.5 toward 10,000 hours"
  - Day 31+ FREE: Show rolling "2.3 hours this week"
  - Link to paywall from weekly display
  - VERIFY: Display changes based on tier

- [ ] **Update Stats.tsx**
  - Trial/Premium: All time windows available
  - Day 31+ FREE: 7d/30d only, others grayed (not locked icon)
  - Add WeeklyGoal component (rolling 7-day, adaptive target)
  - Add FrozenMilestone component
  - VERIFY: Gating works correctly

- [ ] **Create WeeklyGoal.tsx component**
  - Display rolling 7-day hours toward adaptive weekly goal
  - Calculate goal from trial period average: `weeklyGoal = avg(dailyMinutes during trial) * 7 * 0.8`
  - Show progress bar and fluctuating total
  - Display "(based on your first 30 days)" subtitle
  - VERIFY: Goal adapts to user's practice pattern

- [ ] **Update Calendar.tsx**
  - Trial/Premium: Full history
  - Day 31+ FREE: 90-day lookback
  - Implement logarithmic fade (100% → 60% → 30% → 10%+blur)
  - Show session counts on blurred months
  - VERIFY: Fade renders correctly

- [ ] **Create LockedOverlay.tsx**
  - Reusable blur + CTA component
  - Soft messaging, no lock icons
  - VERIFY: Component renders in isolation

- [ ] **Create FrozenMilestone.tsx**
  - Display achieved milestone in frozen state
  - "Your journey continues..." message
  - VERIFY: Component renders correctly

#### Phase 2a - TEST CHECKLIST
Before moving to Phase 2b:
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] **Days 1-30 (Trial):**
  - [ ] Timer shows cumulative hours
  - [ ] All stats windows available
  - [ ] Full calendar history
  - [ ] Full milestones visible
- [ ] **Day 31+ FREE:**
  - [ ] Timer shows "X hours this week" (rolling)
  - [ ] Stats: 7d/30d only, others grayed
  - [ ] Weekly goal displays with adaptive target
  - [ ] Weekly goal fluctuates correctly (rolling window)
  - [ ] Milestone frozen, shows achievement
  - [ ] Calendar: 90-day limit with fade
  - [ ] Blurred months show session counts
  - [ ] Fade opacity matches spec (100%/60%/30%/10%)

---

### Phase 2b: Settings, Onboarding, Paywall, Hide Time
**REQUIRES: Phase 2a complete**

#### Onboarding

- [ ] **Create Onboarding.tsx (3 screens)**
  - Screen 1: "Your meditation companion" - app intro
  - Screen 2: "Track your journey" - what the app does
  - Screen 3: "30 days of full access" - trial preview
  - Store `hasSeenOnboarding` in localStorage
  - VERIFY: Onboarding appears on first launch only

#### Settings

- [ ] **Create Settings.tsx**
  - Tier status display (FREE / PREMIUM)
  - "Unlock full journey" banner (Day 31+ FREE)
  - Hide Time Display toggle (Premium only)
  - Privacy Policy, Terms, Restore Purchase links
  - Version number at bottom
  - VERIFY: Settings accessible from Stats screen

- [ ] **Create useSettingsStore.ts**
  - Track hideTimeDisplay setting
  - Persist to Dexie UserSettings table
  - VERIFY: Settings persist across app restarts

#### Paywall + Purchase

- [ ] **Install RevenueCat SDK**
  - `npm install @revenuecat/purchases-capacitor`
  - VERIFY: Package installed, no dependency errors

- [ ] **Create src/lib/purchases.ts**
  - Initialize RevenueCat with API key
  - Functions: getOfferings, purchasePackage, restorePurchases
  - Handle Premium subscription (auto-renewing)
  - Check entitlement: isPremium
  - VERIFY: Compiles without errors

- [ ] **Create PaywallPremium.tsx**
  - Day 31 trigger message: "Your first 30 days are complete..."
  - Price: $4.99/year
  - "Keep practicing" (dismiss) + "See full journey" (purchase)
  - "Restore Purchase" link
  - Fire `Day31TriggerShown` analytics event
  - VERIFY: Paywall renders correctly

- [ ] **Handle Day 31 trigger**
  - Check on session start
  - Show paywall once, set `trialExpired: true`, set `trialEndDate`
  - Fire analytics events on dismiss/convert
  - Immediate UI reversion on dismiss
  - VERIFY: Trigger fires correctly

- [ ] **Handle subscription completion**
  - On purchase: setTier('premium'), set premiumExpiryDate
  - Store in Dexie UserProfile
  - Dismiss paywall and restore full UI
  - VERIFY: Purchase flow completes (sandbox)

#### Hide Time Display

- [ ] **Implement Hide Time Display**
  - Timer idle: "Just start meditating"
  - Timer running: Breathing circle, no numbers
  - Timer complete: "Meditation complete"
  - Setting persists in useSettingsStore
  - Fire `HideTimeToggled` analytics event
  - VERIFY: Works in all states, Premium only

#### Phase 2b - TEST CHECKLIST
Before moving to Phase 3:
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Onboarding shows on first launch only
- [ ] Can navigate to Settings from Stats
- [ ] **Day 31 trigger:**
  - [ ] Paywall appears on first Day 31 session
  - [ ] "Keep practicing" dismisses and reverts UI
  - [ ] `trialEndDate` is recorded for adaptive goal
- [ ] **Paywall:**
  - [ ] PaywallPremium shows $4.99/year
  - [ ] Shows personalized "X days meditating" message
  - [ ] "Maybe Later" option available (non-guilt)
  - [ ] "Restore Purchase" button present
- [ ] **Sandbox testing:**
  - [ ] Can complete Premium subscription ($4.99/year)
  - [ ] After subscription: full history unlocks
  - [ ] Restore Purchase works after reinstall
- [ ] **Hide Time Display (Premium only):**
  - [ ] Setting toggle disabled for FREE tier
  - [ ] Setting toggle works for PREMIUM tier
  - [ ] Timer shows "Just start meditating" when hidden
  - [ ] Timer shows breathing circle during session when hidden
  - [ ] Timer shows "Meditation complete" at end when hidden
  - [ ] Setting persists after app restart
- [ ] **Analytics:**
  - [ ] `Day31TriggerShown` fires on paywall display
  - [ ] `PaywallDismissed` fires on dismiss
  - [ ] `PaywallConverted` fires on purchase
  - [ ] `HideTimeToggled` fires on setting change

---

### Phase 3: Design System (Ghibli)
**REQUIRES: Phase 2b complete**

- [ ] **Update color palette**
  ```js
  cream: '#FAF8F3',
  'cream-warm': '#F5F1E8',
  'cream-deep': '#EDE8DC',
  ink: '#2D3436',
  'ink-soft': '#4A5568',
  moss: '#7C9A6E',
  bark: '#8B7355',
  ```

- [ ] **Add typography**
  - Display: Cormorant Garamond
  - Body: Nunito
  - VERIFY: Fonts load correctly

- [ ] **Implement breathing animations**
  - 6-second cycle on key numbers
  - VERIFY: Subtle, not distracting

- [ ] **Update Stats screen styling**
  - Remove all borders
  - Increase vertical spacing
  - Content floats in space
  - VERIFY: Feels spacious, zen

- [ ] **Organic easing**
  - `cubic-bezier(0.34, 1.56, 0.64, 1)`
  - Apply to all transitions
  - VERIFY: Natural, not mechanical

#### Phase 3 - TEST CHECKLIST
- [ ] Warm color palette applied
- [ ] Typography loads correctly
- [ ] Stats screen feels spacious
- [ ] Animations are subtle, alive
- [ ] Overall app feels "Ghibli-like"

---

### Phase 4: Capacitor & iOS
**REQUIRES: Phase 3 complete**

- [ ] **Install Capacitor**
  - `npm install @capacitor/core @capacitor/ios`
  - `npx cap init`
  - VERIFY: capacitor.config.ts created

- [ ] **Add plugins**
  - `@capacitor/app`, `@capacitor/haptics`, `@capacitor/status-bar`
  - `@capacitor-community/keep-awake`
  - VERIFY: Plugins install

- [ ] **Implement keep-awake (CRITICAL)**
  - Enable on session start
  - Disable on session end
  - VERIFY: Screen stays on during meditation

- [ ] **Implement lifecycle handling (CRITICAL)**
  - Save state on background (absolute timestamp)
  - Recover on foreground
  - Handle termination gracefully
  - VERIFY: Timer survives backgrounding

- [ ] **Generate iOS project**
  - `npm run build && npx cap add ios`
  - VERIFY: `ios/` folder created

- [ ] **Configure Xcode**
  - Bundle ID matches Apple Developer
  - Signing configured
  - VERIFY: App builds in Xcode

- [ ] **Create app assets**
  - Icon: 1024x1024 + all sizes
  - Splash: centered logo on cream
  - VERIFY: Assets display correctly

- [ ] **Test on physical device**
  - Build and run from Xcode
  - Test all flows
  - VERIFY: App runs correctly

- [ ] **Add haptic feedback**
  - Session start: subtle tap
  - Session end: success pattern
  - VERIFY: Haptics appropriate

#### Phase 4 - TEST CHECKLIST
- [ ] App builds on simulator
- [ ] App builds on physical device
- [ ] Icons and splash correct
- [ ] IAP works in sandbox
- [ ] Keep-awake works
- [ ] Timer survives backgrounding
- [ ] No crashes in 30 minutes of use

---

### Phase 5: Launch
**REQUIRES: Phase 4 complete**

#### Preparation

- [ ] **Privacy Policy** - Local storage only, no data selling
- [ ] **Terms of Service** - Subscription terms, auto-renewal
- [ ] **App Store listing** - Name, description, keywords
- [ ] **Screenshots** - Timer, Stats, Calendar, Settings

- [ ] **TestFlight beta**
  - 5-10 testers for 1-2 weeks
  - Focus: Timer reliability, purchase flow
  - VERIFY: Beta testers can use app

- [ ] **Submit for review**
  - Complete metadata
  - Answer review questions
  - VERIFY: Status "In Review"

#### Launch Checklist
- [ ] Privacy Policy URL works
- [ ] Terms URL works
- [ ] All screenshots uploaded
- [ ] TestFlight tested
- [ ] Critical bugs fixed
- [ ] App APPROVED

#### Post-Launch

- [ ] **Monitor metrics**
  - RevenueCat: conversion, MRR
  - Sentry: crashes
  - App Store: ratings

- [ ] **Plan v2.1**
  - Apple Health integration
  - Dark mode
  - Data export
  - Widgets

---

## Design Principles (Do Not Violate)

1. **Simplicity is the feature** - Resist adding "just one more thing"
2. **No dark patterns** - No manipulation, no guilt, no anxiety
3. **Meditation, not metrics** - Stats serve practice, not vice versa
4. **The horizon, not the point** - 10,000 hours is direction, not destination
5. **Breathe** - Everything should feel slow, intentional, alive
6. **The timer is sacred** - Never limit session length or count. The meditation is always free.
7. **Experience before paywall** - Let users feel the value, then ask them to keep it

---

## Design Language: Ghibli-Inspired

### Color Palette

```css
--cream: #FAF8F3;
--cream-warm: #F5F1E8;
--cream-deep: #EDE8DC;
--ink: #2D3436;
--ink-soft: #4A5568;
--moss: #7C9A6E;
--bark: #8B7355;
```

### Typography

| Use | Font |
|-----|------|
| Display | Cormorant Garamond |
| Body | Nunito |

### Core Principles

| Principle | Application |
|-----------|-------------|
| **Ma** | Generous whitespace, content floats |
| **Breathing** | Subtle animation on key elements |
| **Warmth** | Cream tones, no harsh contrasts |
| **Restraint** | Earned emotion through simplicity |

---

## Success Metrics (v2)

**Launch (first 30 days):**
- [ ] 100+ downloads
- [ ] 5+ ratings (4+ average)
- [ ] 8%+ Day 31 conversion rate
- [ ] Zero critical crashes

**6-month:**
- [ ] 10,000+ downloads
- [ ] 800+ Premium subscribers
- [ ] 4.5+ star rating
- [ ] 80%+ annual retention

---

## v3 Addendum: Deferred Features

The following features are scoped for v3 (post-launch, user-validated):

### Insight Journal

**Voice recording + on-device transcription + searchable archive**

- Post-session prompt: "Capture an insight?"
- iOS Speech Recognition for transcription
- Archive with date/milestone filtering
- Full-text search across transcripts

**Why deferred:**
- iOS Speech Recognition requires native plugin + device testing
- Audio blob storage has IndexedDB limits
- Complex permissions flow
- Validate v2 monetization model first

### Wisdom Stream

**Anonymous community insights with Supabase backend**

- Read-only for FREE, share with 50+ hours
- Like + Save interactions
- Hour-gate prevents trolling
- AI moderation filter

**Why deferred:**
- Requires Supabase infrastructure
- Community moderation is ongoing ops burden
- Pearl extraction UX is complex
- Focus v2 on single-player experience

### Word Cloud

**Vocabulary visualization from transcripts**

- Word frequency analysis
- Interactive filtering
- Tap word → see related insights

**Why deferred:**
- Depends on Insight Journal
- Pure polish feature
- Low conversion impact

---

## When You Get Stuck

**Debug checklist:**
1. Does `npm run build` succeed?
2. What does browser console show?
3. What does RevenueCat dashboard show?
4. Can you isolate to one file/function?

**Common issues:**

| Problem | Check |
|---------|-------|
| "Invalid Product ID" | Case-sensitive match? Apple approved? |
| Capacitor build fails | Xcode signing? Correct bundle ID? |
| Timer inaccurate | Using absolute timestamps? Handling background? |
| Fade not rendering | CSS opacity classes applied? |

---

*This roadmap is the north star for v2. Refer to it constantly. When in doubt, ship simpler.*
