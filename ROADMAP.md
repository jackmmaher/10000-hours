# 10,000 Hours - iOS Commercialization Roadmap

**Status:** REVISED (Simplified) | **Date:** January 2026

---

## Vision

Transform the minimalist meditation timer PWA into a commercially viable iOS app while preserving its zen philosophy. The app's restraint IS the product - we enhance without bloating.

**Core focus:** Tracking progression toward 10,000 hours and expressing that progress via a beautiful, living Ghibli-style tree.

**Core additions:**
- 10-hour free trial, then $4.99 one-time purchase (hard paywall)
- The Garden: A living, growing tree that visualizes your meditation journey (PREMIUM)
- 16 visual states: Season (4) × Time of Day (4) - synced to real-world time
- Multiplicative growth algorithm: frequency + duration compound for faster tree growth
- Ghibli-inspired design language: warm colors, organic animation, generous Ma (empty space)
- Local-only storage (Dexie/IndexedDB) - no cloud sync in v1.0

**What was removed from original scope:**
- ~~Cloud sync (Supabase)~~ → Local-only for simplicity
- ~~Apple Sign-In~~ → No auth needed without cloud
- ~~Interval bells~~ → Silent meditation focus
- ~~Year Summary animation~~ → The tree itself IS the summary
- ~~Spirit companion~~ → v2 consideration
- ~~Subscription pricing~~ → Simpler one-time model

---

## Navigation Architecture

```
                    +--------------+
                    |  ONBOARDING  |  (first launch only)
                    +------+-------+
                           |
+----------------------------------------------------------+
|                                                          |
|   TIMER  ->  STATS  ->  CALENDAR  ->  GARDEN             |
|   (home)    (gear->Settings)          (the tree)         |
|                                                          |
|   Overlay: Paywall (after 10h trial expires)             |
|                                                          |
+----------------------------------------------------------+
```

### Screen Flow

| Screen | Purpose | Trial (0-10h) | Premium |
|--------|---------|---------------|---------|
| **Timer** | Meditation (home) | Full access | Full access |
| **Stats** | Analytics | Full access | Full access |
| **Calendar** | History, heatmap | Full access | Full access |
| **Garden** | Living tree | Blurred preview | Full access |
| **Settings** | Preferences | Full access | Full access |
| **Onboarding** | First-time intro | Yes | Yes |
| **Paywall** | Purchase prompt | After 10h | N/A |

---

## Trial vs Premium

### Feature Breakdown

| Feature | Trial (0-10h) | Premium ($4.99) |
|---------|---------------|-----------------|
| **Timer** | Unlimited sessions | Unlimited sessions |
| **Stats** | Full access | Full access |
| **Calendar** | Full heatmap | Full heatmap |
| **Garden** | Blurred preview | Full living tree |
| **Data** | Local storage | Local storage |

### Monetization Philosophy

**The meditation is free during trial. You pay once to continue and see your tree.**

| What's in Trial | What's in Premium |
|-----------------|-------------------|
| Full app access for 10 hours | Continued app access forever |
| Tree grows (but blurred) | Clear view of your tree |
| Build habit & attachment | Enjoy what you've grown |

**Why 10-hour trial:**
- ~2-4 weeks of regular practice builds habit formation
- User has invested enough to value continuation
- Tree has grown enough to create emotional attachment
- Blurred preview creates desire to see what they've grown

**Why hard paywall (not perpetual free tier):**
- The tree IS the product - can't give it away forever
- Simplified scope means fewer features to gate
- Clear value proposition: pay once, own forever
- No feature complexity from maintaining two tiers

**This is philosophically aligned:** You build the practice first, then pay to continue and see your garden clearly.

---

## The Garden (Core Feature)

A dedicated screen showing a living, growing tree that represents your meditation journey.

### Philosophy
- **Tamagotchi-like** - You want to check on it, feed it, watch it grow
- **Miyazaki-inspired** - Always breathing, organic movement, alive
- **Micro-growth** - Every session shows visible progress, not just milestones

### Growth System

**~1000 visual micro-states from seed to full tree**

| Hours | Growth Rate | Feeling |
|-------|-------------|---------|
| 0-100 | 1 change per 30 min | Rapid transformation |
| 100-500 | 1 change per 1.3 hours | Steady growth |
| 500-2000 | 1 change per 5 hours | Measured progress |
| 2000-10000 | 1 change per 40 hours | Refinement, majesty |

**Visual elements that grow:**
- Trunk structure (~50 states)
- Individual leaves (~300)
- Flowers, moss, details (~100)
- Environmental (grass, stones) (~50)
- Atmosphere/lighting (~50)

### 16 Visual States (Season × Time of Day)

The tree displays differently based on real-world conditions:

|           | Morning | Day | Evening | Night |
|-----------|---------|-----|---------|-------|
| **Spring** | Fresh greens, soft mist | Bright, full light | Golden warmth | Blue-silver, quiet |
| **Summer** | Warm gold light | Deep greens, dappled | Amber glow | Fireflies, warm dark |
| **Autumn** | Misty orange | Rich reds/golds | Deep amber | Cool, crisp |
| **Winter** | Pale blue dawn | Stark, clear | Purple twilight | Snow, starlight |

**Real-time sync:**
- Season: Derived from device date (Spring: Mar-May, Summer: Jun-Aug, Autumn: Sep-Nov, Winter: Dec-Feb)
- Time of day: Derived from device clock (Morning: 5-10am, Day: 10am-5pm, Evening: 5-9pm, Night: 9pm-5am)

**Implementation:** 4 seasonal base palettes + runtime color filters for time-of-day (reduces asset complexity from 16 to 4 base states with tinting).

### Multiplicative Growth Algorithm

Growth is driven by **both frequency AND duration** with compounding effects - like strike/spare scoring in bowling:

```
effectiveGrowth = baseHours × frequencyMultiplier × streakMultiplier × progressBonus
```

| Factor | Calculation | Cap |
|--------|-------------|-----|
| **Base** | Hours logged | N/A |
| **Frequency** | 1 + (sessionsThisWeek × 0.07) | 1.5× at 7+ sessions |
| **Streak** | 1 + (consecutiveDays × 0.007) | 1.2× at 30+ days |
| **Progress** | Bonus if median duration trending up | 1.1× |

**Maximum combined multiplier:** ~2× (prevents tree completing in weeks)

**Why multiplicative:**
- Rewards consistent practice over sporadic long sessions
- A user who meditates 20 min daily grows faster than 2 hours once weekly
- But the irregular user still progresses, just without the streak bonus
- Aligns with meditation philosophy: consistency matters

### Growth Stages

| Stage | Effective Hours | Tree Appearance |
|-------|-----------------|-----------------|
| **Seed** | 0-100 | Tiny sprout, 1-2 leaves, fragile |
| **Sprout** | 100-500 | Small plant, several branches |
| **Sapling** | 500-1,000 | Young tree, thin trunk, growing canopy |
| **Young** | 1,000-2,500 | Established tree, fuller form |
| **Mature** | 2,500-5,000 | Strong trunk, rich foliage |
| **Ancient** | 5,000-10,000 | Majestic, weathered, wise |

### Animation (Miyazaki Principles)

**Always alive (idle):**
- Leaves sway in breeze (noise-based, NOT sine waves)
- Light dapples through canopy
- Mature trees move less than young trees
- Rare visitors (butterfly, bird)

**Stillness budget:**
- 20-30% of idle frames have zero visible motion
- Essential for calm and presence
- Creates contrast that makes movement meaningful

**Post-session growth:**
Order of reveal (growth is revealed, not shown):
1. Environmental cue (light warms) - 1.5s
2. Leaf/branch response - 2s
3. Structural growth appears - 2.5s
4. Return to stillness - 1.5s

### Technical Approach

**Recommended: p5.js + L-Systems (Procedural Generation)**

Why this approach:
- **Continuous growth** - No discrete jumps, smooth progression
- **Organic by nature** - L-systems are designed for plant-like growth
- **Deterministic** - Same hours = same tree (via randomSeed)
- **Code-controllable** - Full parameter control
- **React-compatible** - p5.js instance mode works in React

**Libraries:**
- `p5` - Core creative coding library
- `react-p5` - React wrapper (or custom instance mode)

**Implementation:**
```typescript
// Growth level: 0.0 (seed) -> 1.0 (full tree)
const growthLevel = totalHours / 10000;

// L-system parameters scale with growth
const iterations = Math.floor(growthLevel * 6) + 1;
const branchLength = growthLevel * 100;
const leafDensity = growthLevel * 0.8;
```

**Key files:**
- `src/lib/lsystem.ts` - L-system grammar and generation
- `src/components/TreeCanvas.tsx` - p5.js React wrapper
- `src/components/Garden.tsx` - Garden screen with tree

**Animation layers:**
1. **Growth** - Tree structure based on growthLevel
2. **Idle breathing** - Subtle sway, leaf movement (always running)
3. **Post-session** - Golden light ripple, new growth animation

**References:**
- [L-System Fractal Trees P5](https://github.com/hey24sheep/LSystem_Fractal_Trees_P5)
- [p5.js React Integration](https://shivanshbakshi.dev/blog/p5-react/integrate-p5-with-react/)

### Garden Preview (Trial Users)

When trial users navigate to Garden, they see an **enticing preview**:

```
+-------------------------------------+
|                                     |
|     [BLURRED/DIMMED TREE]           |
|     Their actual tree at current    |
|     growth level, but obscured      |
|                                     |
|     +-------------------------+     |
|     |  Your garden awaits     |     |
|     |                         |     |
|     |  You've grown 5.2 hours |     |
|     |  See your tree flourish |     |
|     +-------------------------+     |
|                                     |
|     +-------------------------+     |
|     |   Unlock Your Garden    |     |
|     +-------------------------+     |
|                                     |
+-------------------------------------+
```

**Preview mechanics:**
1. Tree IS rendered at user's actual growth level
2. Gaussian blur + reduced opacity overlay
3. Subtle animation still visible through blur (enticing motion)
4. User's actual hours shown ("You've grown X hours")
5. Single tap -> Paywall slides up

**Psychology:**
- User sees THEIR tree, not a generic preview
- Motion through blur creates curiosity
- Personal data ("your 5.2 hours") creates ownership
- One tap to unlock reduces friction

### Trial Access Summary

During the 10-hour trial, users have **full access** to all features except Garden:

| Feature | Trial (0-10h) | Premium |
|---------|---------------|---------|
| Timer | Full access | Full access |
| Stats | Full access | Full access |
| Calendar | Full access | Full access |
| Garden | Blurred preview | Full living tree |

**The tree grows during trial** - users just can't see it clearly. When they purchase, they see what they've already grown.

---

## Monetization

### Pricing Model: One-Time Purchase

| Product | Price | Net (after Apple 15%*) | Type |
|---------|-------|----------------------|------|
| **Trial** | $0 | — | Full app for 10 hours |
| **Premium** | $4.99 | $4.24 | Non-consumable IAP |

*Apple Small Business Program: 15% commission for developers earning under $1M/year

### Why $4.99 One-Time?

**Philosophy:**
- Simple, honest pricing — pay once, own forever
- No subscription fatigue for a meditation app
- Aligned with minimalist app ethos
- Lower barrier to entry than $29.99/year
- No recurring billing complexity

**Why 10-hour trial:**
- ~2-4 weeks of regular practice builds habit formation
- User has invested enough to value continuation
- Tree has grown enough to create emotional attachment
- Blurred preview creates desire to see what they've grown

### Paywall Screen Design

```
+-------------------------------------+
|                                     |
|        Unlock Your Garden           |
|                                     |
|     See your tree grow              |
|     Continue your practice          |
|                                     |
|  +-----------------------------+    |
|  |                             |    |
|  |         $4.99               |    |
|  |    One payment, forever     |    |
|  |                             |    |
|  |   [  Unlock Garden  ]       |    |  <- Apple Pay enabled
|  |                             |    |
|  +-----------------------------+    |
|                                     |
|         Restore Purchases           |
|                                     |
+-------------------------------------+
```

### Purchase Flow

1. User taps "Unlock Garden"
2. **Apple Pay sheet appears** (if enabled) - Face ID -> Done
3. OR standard App Store purchase dialog
4. On success: Immediate unlock, tree revealed in full clarity
5. All data stored locally — no account needed

### Paywall Trigger

Paywall appears when:
- Trial ends (10 hours of meditation logged)
- User attempts to use app after trial expiration

**Hard paywall:** App does not function after trial expires. This is intentional — the tree IS the product.

### Revenue Projections

Assumptions:
- 5% conversion (industry standard for good freemium)
- $4.99 one-time purchase
- $4.24 net per sale (after Apple 15%)

| Downloads/Year | Paid (5%) | Revenue |
|----------------|-----------|---------|
| 10,000 | 500 | ~$2,120 |
| 50,000 | 2,500 | ~$10,600 |
| 100,000 | 5,000 | ~$21,200 |

**Realistic target:** Cover costs + modest profit
- Downloads needed: ~5,000 at 5% conversion to cover Apple Developer fee
- Achievable with: Strong ASO, word-of-mouth

### Economics

- Apple takes 15% (Small Business Program for <$1M revenue)
- $4.99 -> $4.24 net per sale
- Break-even: ~24 sales (covers $99 Apple Developer fee)
- Yearly costs: ~$110 (Apple $99 + domain $12)

---

## Technical Architecture

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| State | Zustand |
| Local DB | Dexie (IndexedDB) |
| Payments | RevenueCat |
| iOS Wrapper | Capacitor |
| Styling | Tailwind CSS |
| Crash Reporting | Sentry |
| Testing | Vitest |

### Database Schema (Dexie - Local Only)

```typescript
// src/lib/db.ts
import Dexie, { Table } from 'dexie';

interface Session {
  id?: number;
  uuid: string;           // Client-generated UUID
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
}

interface UserProfile {
  id: 1;                  // Single row
  isPremium: boolean;
  purchaseDate?: Date;
  trialHoursUsed: number; // Track trial consumption
  aestheticSeed: number;  // For tree character
}

class AppDatabase extends Dexie {
  sessions!: Table<Session>;
  profile!: Table<UserProfile>;

  constructor() {
    super('TenThousandHours');

    // Schema versioning for future migrations
    this.version(1).stores({
      sessions: '++id, uuid, startTime',
      profile: 'id'
    });
  }
}

export const db = new AppDatabase();
```

**Note:** Schema versioning is critical for post-launch migrations. Document upgrade paths even if only v1 exists at launch.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/db.ts` | Add trial tracking, premium status |
| `src/stores/useSessionStore.ts` | Add trial hour calculation |
| `src/App.tsx` | Add Garden route, premium gating, new screen routing |
| `src/components/Timer.tsx` | Post-session Garden prompt (premium users) |
| `src/components/Stats.tsx` | Settings gear icon, trial/premium UI states |
| `src/lib/constants.ts` | Growth rate constants, trial limits |
| `package.json` | New dependencies |

## New Files to Create

```
src/
  lib/
    purchases.ts          # RevenueCat integration
    growth.ts             # Tree growth calculations + multiplicative algorithm
    lsystem.ts            # L-system grammar and tree generation (with Ghibli constraints)
    aesthetic.ts          # Aesthetic Modulation Layer (breaks visual perfection)
    seasons.ts            # Season + time-of-day detection (16 visual states)

  hooks/
    useP5Canvas.ts        # p5.js lifecycle management hook (prevents memory leaks)

  stores/
    usePremiumStore.ts    # Premium status, trial tracking, feature-gating logic
    useGardenStore.ts     # Tree state, growth level, aesthetic profile

  components/
    Garden.tsx            # The garden screen (tree in p5 canvas)
    TreeCanvas.tsx        # p5.js React wrapper using useP5Canvas hook
    LockedOverlay.tsx     # Reusable blur + unlock CTA overlay
    Onboarding.tsx        # Intro flow (3 screens)
    Paywall.tsx           # Purchase screen ($4.99 one-time)
    Settings.tsx          # Settings screen

.github/
  workflows/
    ci.yml                # GitHub Actions CI/CD

capacitor.config.ts
ios/                      # Generated by Capacitor
ROADMAP.md               # This document (north star)
```

**New dependencies:**
```json
{
  "p5": "^1.9.0",
  "@types/p5": "^1.7.0",
  "@sentry/capacitor": "^0.x.x",
  "@sentry/react": "^7.x.x",
  "vitest": "^1.x.x",
  "@testing-library/react": "^14.x.x",
  "@capacitor-community/keep-awake": "^3.x.x"
}
```

**Note:** Using custom `useP5Canvas` hook instead of `react-p5` for better lifecycle control.

---

## Implementation Phases

### Phase 0: Account & Service Setup
**Do FIRST, before any code. Some steps take days to process.**

- [ ] **Apple Developer Program enrollment ($99/year)**
  - Go to developer.apple.com/programs/enroll
  - VERIFY: Can log into developer.apple.com/account
  - NOTE: Approval can take 24-48 hours for individuals

- [ ] **Create App ID in Apple Developer Portal**
  - Certificates, Identifiers & Profiles -> Identifiers -> App IDs -> (+)
  - Bundle ID: `com.yourname.tenthousandhours`
  - VERIFY: App ID appears in list

- [ ] **App Store Connect setup**
  - Go to appstoreconnect.apple.com
  - My Apps -> (+) New App
  - Platform: iOS, Name: "10,000 Hours", Bundle ID: (select your App ID)
  - VERIFY: App appears in "My Apps"

- [ ] **App Store Connect: Agreements, Tax, Banking**
  - Users and Access -> Agreements, Tax, and Banking
  - Accept Paid Apps agreement
  - Enter banking and tax information
  - VERIFY: Status shows "Active" (can take 1-3 business days)
  - NOTE: Cannot test purchases until this is complete

- [ ] **Create RevenueCat account**
  - Go to app.revenuecat.com -> Sign up
  - Create new project: "10000 Hours"
  - Platform: Apple App Store
  - Enter App Store Connect shared secret
  - VERIFY: RevenueCat shows your app with green checkmark

- [ ] **Create IAP product in App Store Connect**
  - My Apps -> Your App -> In-App Purchases
  - Non-consumable: Reference Name "Premium", Product ID `premium_unlock`, $4.99
  - Submit for review (can take 24-48 hours)
  - VERIFY: Product shows "Ready to Submit" or "Approved"

- [ ] **Configure product in RevenueCat**
  - Products -> Add Product
  - Match Product ID exactly: `premium_unlock` (case-sensitive)
  - Create Entitlement: "premium"
  - Create Offering: "default" with the product
  - VERIFY: Product shows in RevenueCat dashboard with checkmark

#### Phase 0 - TEST CHECKLIST
Before moving to Phase 1:
- [ ] Can log into Apple Developer account
- [ ] App ID exists
- [ ] App appears in App Store Connect
- [ ] Banking/tax shows "Active" status
- [ ] RevenueCat shows green checkmark for product
- [ ] IAP product approved in App Store Connect

---

### Phase 1: Infrastructure
**REQUIRES: Phase 0 complete (Apple Developer account)**

- [ ] **Install and configure Sentry (crash reporting)**
  - `npm install @sentry/capacitor @sentry/react`
  - Initialize in App.tsx before any other code
  - Test: trigger intentional crash, verify in Sentry dashboard
  - VERIFY: Crashes reported with stack traces
  - NOTE: No visibility into production crashes = flying blind. Non-negotiable.

- [ ] **Set up Vitest for unit testing**
  - `npm install -D vitest @testing-library/react`
  - Create first test: timer duration calculation
  - Add `npm run test` script to package.json
  - VERIFY: Tests pass locally

- [ ] **Add Dexie schema versioning**
  - Include `schemaVersion` field in database design
  - Document migration framework (even if only v1 exists at launch)
  - Pattern: `db.version(1).stores({ sessions: '++id, ...' })`
  - VERIFY: Schema upgrade path documented for future v1.1 changes
  - NOTE: Without this, post-launch schema changes become migration nightmares

- [ ] **Create usePremiumStore.ts**
  - Track: isPremium, trialHoursUsed
  - Actions: checkPremiumStatus, setPremiumStatus
  - Derive trialHoursUsed from useSessionStore.totalSeconds
  - VERIFY: Store compiles, isPremium defaults to false

- [ ] **Create trial hour tracking**
  - Calculate total hours from sessions
  - Check if > 10 hours (trial expired)
  - Store trial state locally
  - VERIFY: Trial tracking works correctly

#### Phase 1 - TEST CHECKLIST
Before moving to Phase 2:
- [ ] `npm run build` succeeds with no errors
- [ ] `npm run test` passes
- [ ] Timer still works (start/stop meditation)
- [ ] Existing sessions still appear in Stats
- [ ] **Sentry:** Test crash appears in Sentry dashboard
- [ ] **Schema:** Dexie versioning documented for future migrations
- [ ] usePremiumStore tracks trial hours correctly
- [ ] Trial expires after 10 hours of meditation

---

### Phase 2: Core UI + Premium
**REQUIRES: Phase 0 complete (RevenueCat configured), Phase 1 complete**

#### UI Screens

- [ ] **Create Onboarding.tsx (3 screens)**
  - Screen 1: "Your meditation companion" - app intro
  - Screen 2: "Track your journey" - what the app does
  - Screen 3: "Get started" - tap to begin
  - Store `hasSeenOnboarding` in localStorage
  - VERIFY: Onboarding appears on first launch only

- [ ] **Create Settings.tsx**
  - Premium status display
  - Links: Privacy Policy, Terms of Service
  - Restore Purchases button
  - Version number at bottom
  - VERIFY: Settings accessible from Stats screen

- [ ] **Add navigation to new screens**
  - Settings: gear icon on Stats screen -> Settings
  - Onboarding: shows before Timer on first launch
  - VERIFY: All navigation paths work

- [ ] **Add LockedOverlay.tsx component**
  - Reusable component for locked features
  - Blurred background
  - Message + "Unlock" CTA button
  - VERIFY: Component renders correctly in isolation

#### Paywall + Monetization

- [ ] **Install RevenueCat SDK**
  - `npm install @revenuecat/purchases-capacitor` (for Capacitor)
  - VERIFY: Package installed, no dependency errors

- [ ] **Create src/lib/purchases.ts**
  - Initialize RevenueCat with API key
  - Functions: getOfferings, purchasePackage, restorePurchases
  - Handle purchase success/failure callbacks
  - VERIFY: File compiles without errors

- [ ] **Create Paywall.tsx**
  - Single pricing: $4.99 one-time purchase
  - Purchase button triggers RevenueCat
  - "Restore Purchases" link at bottom
  - VERIFY: Paywall renders correctly

- [ ] **Implement trial gate**
  - Check if trialHoursUsed >= 10
  - If trial expired, show Paywall
  - Gate: Garden always blurred for trial users
  - VERIFY: Paywall appears when trial expires

- [ ] **Handle purchase completion**
  - On successful purchase: update usePremiumStore
  - Store premium status locally
  - Dismiss Paywall, reveal tree
  - VERIFY: Purchase flow completes (use sandbox account)

#### Phase 2 - TEST CHECKLIST
Before moving to Phase 3:
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Timer still works
- [ ] Onboarding shows on first launch (clear localStorage to test)
- [ ] Onboarding does NOT show on subsequent launches
- [ ] Can navigate: Timer -> Stats -> Settings
- [ ] Can navigate back from Settings
- [ ] LockedOverlay renders with blur and CTA
- [ ] Paywall appears when trial expires (>10 hours)
- [ ] "Restore Purchases" button is present
- [ ] **Sandbox testing (requires TestFlight or device):**
  - [ ] Can complete test purchase ($4.99)
  - [ ] After purchase, Garden unlocks
  - [ ] Restore Purchases works after reinstall
  - [ ] Premium status persists after app restart

**ESCAPE HATCH - If "Invalid Product ID" error:**
- Product IDs are case-sensitive: check exact match
- Products need Apple review: wait 24-48 hours after creating
- Check RevenueCat dashboard for product fetch errors
- Use RevenueCat debug logs: `Purchases.setDebugLogsEnabled(true)`

---

### Phase 3: Design System (Ghibli)
**REQUIRES: Phase 2 complete (UI screens to style)**

- [ ] **Update color palette in Tailwind config**
  ```js
  // tailwind.config.js
  cream: '#FAF8F3',        // Warmer paper tone
  'cream-warm': '#F5F1E8', // Working surfaces
  'cream-deep': '#EDE8DC', // Cards
  ink: '#2D3436',          // Softer than black
  'ink-soft': '#4A5568',   // Secondary text
  moss: '#7C9A6E',         // Growth, positive
  bark: '#8B7355',         // Earth tones
  ```
  - VERIFY: New colors applied, app builds

- [ ] **Add typography (Google Fonts)**
  - Display: Palatino Linotype (Spirited Away authentic — calligraphic warmth)
  - Body: Raleway (humanist-geometric hybrid)
  - Import in index.html or CSS
  - VERIFY: Fonts load and display correctly

- [ ] **Implement breathing animations**
  ```css
  @keyframes subtle-breathe {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.92; transform: scale(0.997); }
  }
  /* 6 second cycle */
  ```
  - Apply to key statistics
  - VERIFY: Numbers have subtle breathing effect

- [ ] **Update Stats screen (Scroll Garden style)**
  - Remove ALL borders
  - Increase vertical spacing between sections (2-3x)
  - Content floats in space
  - Add soft dashed "path" separators (optional)
  - VERIFY: Stats feels spacious, zen

- [ ] **Add organic easing to transitions**
  - `transition: all 400ms cubic-bezier(0.34, 1.56, 0.64, 1);`
  - Apply to buttons, modals, navigation
  - VERIFY: Transitions feel natural, not mechanical

- [ ] **Update weekly dots with micro-animations**
  - Completed days: gentle pulse every ~8 seconds
  - Today: breathing glow
  - Future: completely still (contrast)
  - VERIFY: Dots animate appropriately

#### Phase 3 - TEST CHECKLIST
Before moving to Phase 4:
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Timer still works
- [ ] Color palette is warm (cream backgrounds, softer text)
- [ ] Typography loads (Palatino for display, Raleway for body)
- [ ] Stats screen has generous spacing, no harsh borders
- [ ] Key numbers have subtle breathing animation
- [ ] Weekly dots animate (completed pulse, today glows)
- [ ] Transitions feel organic, not abrupt

**Ghibli Feel Verification (from addendum — these are testable criteria):**
- [ ] **Intentional Imperfection:** Nothing is perfectly symmetric or evenly spaced
- [ ] **Life-Implied Motion:** Motion suggests breath/weight/attention, not mechanical loops
- [ ] **Memory Over Metrics:** Elements feel aged and remembering, not just progressing
- [ ] **Permission for Stillness:** The design allows moments where nothing changes
- [ ] Overall app feels "Ghibli-like" — warm, alive, breathing

---

### Phase 4: Garden
**REQUIRES: Phase 1 complete (have session data to calculate from), Phase 3 complete (Ghibli styling)**

> **CRITICAL: The Garden is the premium feature driving conversion. If growth feels imperceptible, users won't feel the emotional payoff. Build and validate before integrating.**

#### 4a: Foundation (Math & Logic)

- [ ] **Create standalone Garden prototype BEFORE main integration**
  - Plain HTML + p5.js file, separate from React codebase
  - Demonstrate tree at 10, 50, 100, 250, 500, 1000, 2500, 5000, 10000 hours
  - Include 16 visual states (4 seasons × 4 times of day)
  - VERIFY: Prototype feels visually distinct at each milestone
  - VERIFY: Seasonal/time variations are visible and beautiful
  - **ESCAPE HATCH:** If prototype doesn't feel magical at 1-week mark, pivot to hybrid/milestone approach

- [ ] **Install p5 dependencies**
  - `npm install p5 @types/p5`
  - Build custom wrapper (more control than react-p5)
  - VERIFY: Packages install without errors, `npm run build` succeeds

- [ ] **Create src/lib/growth.ts**
  - `calculateGrowthLevel(totalHours: number): number` → 0.0 to 1.0
  - `calculateEffectiveGrowth(sessions: Session[]): number` → with multipliers
  - `getGrowthRate(totalHours: number): number` → changes per hour
  - Include multiplicative algorithm:
    ```typescript
    effectiveGrowth = baseHours × frequencyMultiplier × streakMultiplier × progressBonus
    // frequencyMultiplier: 1 + (sessionsThisWeek × 0.07), capped at 1.5
    // streakMultiplier: 1 + (consecutiveDays × 0.007), capped at 1.2
    // progressBonus: 1.1 if median duration trending up
    ```
  - VERIFY: Functions return expected values for test inputs

- [ ] **Create src/lib/seasons.ts (16 Visual States)**
  - `getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter'`
  - `getCurrentTimeOfDay(): 'morning' | 'day' | 'evening' | 'night'`
  - `getVisualState(): { season, timeOfDay, palette, filters }`
  - Seasonal palette definitions (Spring: fresh greens, Summer: deep greens, etc.)
  - Time-of-day color filters (Morning: warm gold, Night: blue-silver, etc.)
  - VERIFY: Correct state returned for device time

- [ ] **Create src/lib/aesthetic.ts (Aesthetic Modulation Layer)**
  - Purpose: Break visual perfection. Never affects growth math or stored state.
  - Define `AestheticProfile` interface:
    ```typescript
    export interface AestheticProfile {
      trunkLean: number;        // radians (slight persistent lean)
      branchJitter: number;     // small angle offset per branch
      leafDensityBias: number;  // -0.1 → +0.1 (clustering)
      colorWarmthShift: number; // -5 → +5 (HSL adjustment)
    }
    ```
  - Implement `createAestheticProfile(seed: number): AestheticProfile`
  - Seed once per user, store locally if needed
  - VERIFY: Different seeds produce visually distinct (but bounded) trees

- [ ] **Create src/lib/lsystem.ts (with Ghibli constraints)**
  - L-system grammar: axiom, rules, angle, iterations
  - `generateTree(growthLevel: number, aesthetic: AestheticProfile): TreeData`
  - Deterministic: use `randomSeed(totalHours)` for consistent trees
  - **Ghibli constraints:**
    - Break symmetry: asymmetric angle offsets per branch depth
    - Favor fewer, heavier branches after 50% growth
  - VERIFY: Trees feel weighted and organic, not mathematically perfect

- [ ] **Create src/stores/useGardenStore.ts**
  - Track: growthLevel, effectiveGrowth, aestheticProfile, visualState
  - Derive growthLevel from useSessionStore data
  - Load/create aestheticProfile on init
  - Update visualState on app focus (real-time season/time sync)
  - VERIFY: Store updates when session count changes

#### 4b: Rendering (Visual)

- [ ] **Create src/hooks/useP5Canvas.ts (lifecycle management hook)**
  - Wrap all p5 logic in custom hook for proper cleanup
  - Handle instance mode lifecycle explicitly:
    ```typescript
    useEffect(() => {
      const p5Instance = new p5((p) => {
        p.setup = () => { /* ... */ };
        p.draw = () => { /* ... */ };
      }, containerRef.current);

      return () => {
        p5Instance.remove(); // Critical: explicit cleanup
      };
    }, [/* minimal dependencies */]);
    ```
  - VERIFY: Navigate to Garden 10 times — memory does not grow
  - NOTE: Memory leaks from orphaned canvas instances will destroy the meditative feel.

- [ ] **Create TreeCanvas.tsx (p5.js wrapper)**
  - Use `useP5Canvas` hook for lifecycle management
  - Render tree from L-system data + aesthetic profile + visual state
  - Accept `growthLevel`, `aestheticProfile`, and `visualState` props
  - Apply seasonal palette and time-of-day filters
  - Handle resize events
  - VERIFY: Basic tree renders on screen

- [ ] **Implement 16 visual states**
  - Apply season-specific base colors (Spring greens, Autumn reds, etc.)
  - Apply time-of-day color filters (Morning warmth, Night coolness)
  - VERIFY: Tree looks different at 8am vs 8pm
  - VERIFY: Tree looks different in January vs July

- [ ] **Implement noise-based idle breathing (per Ghibli addendum)**
  - Use `p5.noise()` — NOT sine waves (sine creates mechanical loops)
  - Period: 6-12 seconds (never perfectly looping)
  - Amplitude decreases as tree matures (older trees are calmer)
  - VERIFY: Tree feels alive but not mechanical

- [ ] **Implement stillness budget**
  - At least 20-30% of idle frames should have zero visible motion
  - This is essential for calm and presence
  - VERIFY: Periods of stillness are observable

- [ ] **Add color/texture enhancements**
  - Warm-biased palette only (no pure greens)
  - Hue drifts warmer/duskier with age
  - Light grain/noise overlay via p5 (<3% opacity)
  - VERIFY: Digital flatness removed, feels hand-painted

#### 4c: Integration

- [ ] **Create Garden.tsx screen**
  - Full-screen tree
  - Display user's growth level and effective multiplier
  - Handle trial vs premium state
  - VERIFY: Garden screen renders correctly

- [ ] **Implement locked overlay for trial users**
  - Use LockedOverlay component from Phase 2
  - Tree renders but blurred
  - "Your garden awaits" + unlock CTA
  - VERIFY: Trial users see blur + unlock prompt

- [ ] **Add Garden to navigation**
  - Position: after Calendar in navigation flow
  - Swipe from Calendar → Garden
  - VERIFY: Can navigate to Garden

- [ ] **Add post-session growth animation**
  - Order of reveal (per Ghibli addendum):
    1. Environmental cue (light, warmth) — animate first
    2. Leaf/branch response — animate second
    3. Structural settle — animate third
    4. Return to stillness
  - Golden light ripple effect
  - New growth appears
  - VERIFY: Animation plays after completing a session

#### Phase 4 - TEST CHECKLIST
Before moving to Phase 5:
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Timer still works
- [ ] **Prototype:** 16 visual states visible and beautiful
- [ ] **Memory:** Stable after 10 Garden navigations (no leaks)
- [ ] TreeCanvas renders a tree on screen
- [ ] Tree visually changes at different growth levels
- [ ] **16 States:** Tree looks different at different times/seasons
- [ ] **Idle Motion:** Noise-based, not looping
- [ ] **Stillness:** 20-30% of frames have zero visible motion
- [ ] **Color:** Palette is warm-biased
- [ ] **Multiplicative Growth:** Effective growth calculated correctly
- [ ] Garden screen accessible via navigation
- [ ] **Trial user experience:**
  - [ ] Tree is blurred
  - [ ] "Your garden awaits" message shows
  - [ ] Tapping unlock shows Paywall
- [ ] **Premium user experience:**
  - [ ] Tree is clear, not blurred
- [ ] Post-session growth animation works
- [ ] Garden shows correct hours and multiplier info

**Visual Quality Tests (Ghibli criteria):**
- [ ] Adjacent growth levels feel emotionally different
- [ ] Tree looks alive even when not changing
- [ ] Older trees move less than younger ones

**ESCAPE HATCH - If p5.js won't render:**
- Check browser console for errors
- Test p5.js in standalone HTML file first (outside React)
- Ensure instance mode setup: `new p5((p) => { ... }, containerRef)`
- Reference: https://shivanshbakshi.dev/blog/p5-react/integrate-p5-with-react/

---

### Phase 5: Capacitor & iOS
**REQUIRES: Phase 4 complete (Garden feature done)**

- [ ] **Install Capacitor**
  - `npm install @capacitor/core @capacitor/ios`
  - `npx cap init "10000 Hours" com.yourname.tenthousandhours`
  - VERIFY: capacitor.config.ts created

- [ ] **Add required plugins**
  - `@capacitor/app` - lifecycle events
  - `@capacitor/haptics` - vibration feedback
  - `@capacitor/status-bar` - iOS status bar styling
  - VERIFY: Plugins install without errors

- [ ] **Install keep-awake plugin (CRITICAL)**
  - `npm install @capacitor-community/keep-awake`
  - Enable on session start: `await KeepAwake.keepAwake();`
  - Disable on session end: `await KeepAwake.allowSleep();`
  - VERIFY: Screen stays on during 35-minute test session
  - NOTE: Without this, screen locks during meditation = "my timer stopped" bugs = one-star reviews

- [ ] **Implement app lifecycle handling (CRITICAL)**
  - Save session state on background (use absolute timestamp, not elapsed)
  - ```typescript
    // On session start
    const sessionStart = Date.now();
    await saveActiveSession({ startTime: sessionStart });

    // On display (computed, never stored)
    const elapsed = Date.now() - sessionStart;
    ```
  - Recover state on foreground (recalculate elapsed from timestamp)
  - Handle termination: detect incomplete session on next launch, offer to resume or discard
  - VERIFY: Timer survives backgrounding and returns accurate
  - VERIFY: Timer survives app termination and prompts recovery
  - NOTE: This is the correct pattern for timer apps on iOS

- [ ] **Generate iOS project**
  - `npm run build && npx cap add ios`
  - VERIFY: `ios/` folder created

- [ ] **Configure iOS capabilities**
  - Open in Xcode: `npx cap open ios`
  - Configure bundle ID to match Apple Developer
  - VERIFY: App builds in Xcode

- [ ] **Create app icons and splash screens**
  - Icon: 1024x1024 (App Store) + all required sizes
  - Splash: centered logo on cream background
  - Use Capacitor splash screen plugin
  - VERIFY: Icons display correctly

- [ ] **Test on physical device**
  - Connect iPhone, trust computer
  - Build and run from Xcode
  - Test all flows on device
  - VERIFY: App runs correctly on device

- [ ] **Add haptic feedback**
  - Session start: subtle tap
  - Session end: success pattern
  - VERIFY: Haptics feel appropriate

- [ ] **Add CI/CD with GitHub Actions**
  - On PR: `npm run build`, `npm run test`
  - On merge to main: Build + upload to TestFlight via Fastlane
  - ```yaml
    # .github/workflows/ci.yml
    on: [push, pull_request]
    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v3
          - uses: actions/setup-node@v3
          - run: npm ci
          - run: npm run build
          - run: npm run test
    ```
  - VERIFY: CI runs on every PR
  - VERIFY: TestFlight upload automation works
  - NOTE: Manual builds lead to "works on my machine" bugs. Automation prevents this.

#### Phase 5 - TEST CHECKLIST
Before moving to Phase 6:
- [ ] App builds and runs on iOS simulator
- [ ] App builds and runs on physical iPhone
- [ ] App icon displays correctly
- [ ] Splash screen shows on launch
- [ ] In-App Purchase works on device (sandbox)
- [ ] Timer works correctly
- [ ] Garden renders correctly
- [ ] Haptic feedback fires appropriately
- [ ] No crashes in 30 minutes of use
- [ ] **Keep-awake:** Screen stays on during 35+ minute meditation
- [ ] **Lifecycle:** Timer survives: start session → switch to Safari → wait 5 min → return
- [ ] **Lifecycle:** Timer survives: start session → lock phone → wait 5 min → unlock
- [ ] **Lifecycle:** Incomplete session recovery works after force quit
- [ ] **CI/CD:** GitHub Actions runs on PR
- [ ] **CI/CD:** TestFlight upload automation functional

---

### Phase 6: Launch & Post-Launch
**REQUIRES: Phase 5 complete (app runs on device)**

#### Launch Preparation

- [ ] **Write Privacy Policy**
  - What data is collected (local storage only)
  - No selling of data
  - Host on simple webpage
  - VERIFY: URL accessible, content accurate

- [ ] **Write Terms of Service**
  - Usage terms
  - Purchase terms (one-time $4.99)
  - Refund policy (Apple handles this)
  - Host on simple webpage
  - VERIFY: URL accessible, content accurate

- [ ] **Create App Store listing**
  - App name: "10,000 Hours - Meditation Timer"
  - Subtitle: "Track your meditation journey"
  - Description: focus on zen philosophy, no pressure
  - Keywords for ASO
  - VERIFY: All text fields complete

- [ ] **Create screenshots**
  - 6.7" (iPhone 15 Pro Max), 6.5" (iPhone 14 Plus), 5.5" (iPhone 8 Plus)
  - Show: Timer, Stats, Calendar, Garden
  - Clean, minimal, no device frames needed
  - VERIFY: Screenshots uploaded to App Store Connect

- [ ] **Create preview video (optional)**
  - 15-30 second walkthrough
  - Show meditation flow, tree growth
  - No voiceover, just visuals + music
  - VERIFY: Video meets Apple specs

- [ ] **Performance testing on older devices**
  - Test Garden rendering on iPhone 8 or equivalent (3-year-old device)
  - Check memory usage during extended sessions
  - VERIFY: No lag or memory issues on older devices
  - NOTE: iPhone 8 should still run smoothly. Many users have older devices.

- [ ] **TestFlight beta**
  - Upload build to App Store Connect
  - Invite 5-10 beta testers
  - Collect feedback for 1-2 weeks
  - **Beta focus areas:** Timer reliability, Garden performance, purchase flow
  - VERIFY: Beta testers can install and use app

- [ ] **Submit for App Store review**
  - Complete all metadata
  - Answer review questions
  - Submit and wait (1-3 days typical)
  - VERIFY: Status changes to "In Review"

#### Launch Checklist
Before launch:
- [ ] Privacy Policy URL works
- [ ] Terms of Service URL works
- [ ] App Store listing is complete
- [ ] All screenshots uploaded
- [ ] **Performance:** Garden renders smoothly on iPhone 8 equivalent
- [ ] **Performance:** No memory issues in 30+ minute sessions
- [ ] TestFlight build works for testers
- [ ] All critical bugs from beta addressed
- [ ] App submitted for review
- [ ] App APPROVED (status: Ready for Sale)

#### Post-Launch

- [ ] **Monitor first-week metrics**
  - RevenueCat: conversion rate, revenue
  - Sentry: crash reports (should be zero)
  - App Store: downloads, ratings
  - VERIFY: Dashboard access, data flowing

- [ ] **Track actual conversion rate against projections**
  - Compare to 2%, 3.5%, 5% scenarios
  - If below 2%: paywall needs iteration
  - VERIFY: Conversion rate documented and actionable

- [ ] **Respond to reviews**
  - Thank positive reviewers
  - Address concerns constructively
  - Note feature requests
  - VERIFY: All reviews acknowledged within 48 hours

- [ ] **Plan v1.1 features (prioritized based on data)**
  - **High-priority:** Apple Health integration
  - **High-priority:** Dark mode support
  - **Medium-priority:** Data export (JSON/CSV)
  - **Medium-priority:** Widget support
  - **Medium-priority:** Cloud sync (Supabase) for multi-device
  - **Low-priority:** Tree art upgrade (Rive/Lottie)
  - VERIFY: Prioritized list created based on actual user data

---

## Settings Screen Structure

```
+-------------------------------------+
|  <-                       Settings   |
+-------------------------------------+
|                                     |
|  PREMIUM                            |
|  +-----------------------------+    |
|  | Status: Premium ✓           |    |
|  | (or: Trial - 7.2h remaining)|    |
|  +-----------------------------+    |
|                                     |
|  ABOUT                              |
|  +-----------------------------+    |
|  | Privacy Policy           -> |    |
|  | Terms of Service         -> |    |
|  | Version 1.0.0               |    |
|  +-----------------------------+    |
|                                     |
|  Restore Purchases                  |
+-------------------------------------+
```

---

## Business Management

No custom admin needed - use existing dashboards:

| Dashboard | What You Get |
|-----------|--------------|
| **RevenueCat** | Customers, revenue, tax exports |
| **App Store Connect** | Downloads, ratings, revenue |
| **Sentry** | Crash reports, error tracking |

---

## Complexity & Risk Assessment

| Component | Difficulty | Risk | Mitigation |
|-----------|------------|------|------------|
| RevenueCat | Medium | Medium | Sandbox test, check product IDs |
| Garden (p5.js) | **High** | **Medium** | Build standalone prototype first, +useP5Canvas hook, +memory profiling |
| 16 Visual States | Medium | Low | Prototype early, test all combinations |
| Multiplicative Growth | Low | Low | Unit test formulas, cap multipliers |
| iOS Platform | Medium | **Low** | Keep-awake + lifecycle handling patterns |
| Capacitor | Low-Medium | Low | Standard config, +CI/CD |

**Risk Monitoring Triggers:**
| Risk | Early Warning Sign | Response |
|------|-------------------|----------|
| Garden visual quality | Prototype doesn't feel magical at 1-week mark | Pivot to hybrid/milestone approach |
| 16 states complexity | Season/time combinations look incoherent | Reduce to 4 states (seasons only) |
| Performance issues | Lag/memory issues in Phase 4 testing | Reduce canvas complexity |
| Timeline slip | Any phase takes 2x expected time | Re-evaluate scope for v1.0 |

---

## Design Principles (Do Not Violate)

1. **Simplicity is the feature** - Resist adding "just one more thing"
2. **No dark patterns** - No manipulation, no guilt, no anxiety
3. **Meditation, not metrics** - Stats serve practice, not vice versa
4. **The horizon, not the point** - 10,000 hours is direction, not destination
5. **Earn the Garden** - It's at the end of the journey through screens
6. **Breathe** - Everything should feel slow, intentional, alive
7. **The timer is sacred** - Never limit session length or count. The meditation itself is always free.

---

## Design Language: Ghibli-Inspired

The app's visual language draws from Studio Ghibli's design philosophy—not as imitation, but as principled inspiration. Ghibli's aesthetic is built on specific foundations that align naturally with meditation.

### Core Ghibli Principles Applied

| Ghibli Principle | Application in 10,000 Hours |
|------------------|----------------------------|
| **Ma** — meaningful emptiness | Generous whitespace, content floats in space, no borders |
| **Nature as presence** | The Garden IS the app's soul, not decoration |
| **Watercolor philosophy** | Soft gradients, warm tones, no harsh contrasts |
| **Always breathing** | Subtle animation on key elements, nothing is static |
| **Earned emotion through restraint** | Quiet confidence, no exclamation points, observational language |

### Color Palette

```css
/* Warm paper tones - like aged washi */
--cream: #FAF8F3;           /* Primary background - warmer, more alive */
--cream-warm: #F5F1E8;      /* Working surfaces */
--cream-deep: #EDE8DC;      /* Cards, elevated surfaces */

/* Organic inks - like sumi ink, not printer ink */
--ink: #2D3436;             /* Primary text - softer than pure black */
--ink-soft: #4A5568;        /* Secondary text */
--ink-mist: #718096;        /* Tertiary, hints */

/* Nature accents (used sparingly) */
--moss: #7C9A6E;            /* Growth, the garden, positive states */
--bark: #8B7355;            /* Grounding, earth tones */
--sky: #87CEEB;             /* Reserved for special moments only */
```

**Key insight:** Ghibli never uses pure black. Darks are always tinged with warmth—like weathered wood, sumi ink, or shadow in afternoon light.

### Typography

| Use | Font | Reasoning |
|-----|------|-----------|
| **Display** | Palatino Linotype | Spirited Away authentic — calligraphic warmth, pen-drawn curves (Hermann Zapf) |
| **Body** | Raleway | Humanist-geometric hybrid — approachable, clean, bridges warmth and legibility |

Palatino was the actual font used in Spirited Away. Its calligraphic heritage gives it organic, handmade warmth — the font feels *written*, not *typeset*.

### Spacing Philosophy (Ma)

- **No borders** — Separate content with generous space, not lines
- **Vertical rhythm** — 2-3x typical app spacing between sections
- **Floating content** — Elements exist in space, not in containers
- **Dashed paths** — Where visual separation is needed, use soft dashed lines (like forest trails)

### Animation Principles

**Breathing animation (revised):**
```css
@keyframes subtle-breathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  40% { transform: scale(0.997); opacity: 0.92; }
  70% { transform: scale(0.995); opacity: 0.88; }
}
/* 5-6 second cycle, asymmetric timing, imperceptible scale */
```

**Organic easing:**
```css
/* Natural deceleration - things settle like water finding its level */
transition: all 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

**Principles:**
- Longer cycles (5-6s) feel more meditative than 4s
- Asymmetric timing — in-breath and out-breath have different qualities
- Subtle scale changes (0.5-1%) create life without distraction
- Nothing happens instantly — micro-moment of anticipation before response

### Stats Screen Design: The Scroll Garden

The Stats screen maintains full information density but presents it as a **vertical journey**—each stat area is a "clearing" you arrive at, with generous spacing creating the sense of walking through a path.

**Layout principles:**
- Remove ALL solid borders
- Use generous vertical spacing instead (2-3x current margins)
- Soft dashed "path" lines between major sections (optional)
- Content floats in space rather than being contained in boxes

**Living Numbers:**
Key statistics use subtle breathing animation—numbers are alive, not static text.

```css
.stat-number {
  animation: subtle-breathe 6s ease-in-out infinite;
}

.progress-fill {
  /* Slight overshoot, then settle—like water finding its level */
  transition: width 800ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

**Visual treatment:**
```
+-------------------------------+
|                               |
|        42.5 hours             |  <- Breathing animation
|                               |
|                               |
|                               |  <- Generous "walk" between sections
|                               |
|  - - - - - - - - - - - - - -  |  <- Soft dashed path (optional)
|                               |
|                               |
|    next: 50 hours             |
|    ██████████░░░░ 85%         |  <- Progress bar with organic fill
|                               |
|                               |
|                               |
|  - - - - - - - - - - - - - -  |
|                               |
|                               |
|     M  T  W  T  F  S  S       |
|     *  *  *  o  .  .  .       |  <- Weekly dots with micro-animations
|                               |
|     3 sessions - 2h 15m       |
|                               |
|                               |
|          . . .                |  <- Continuation hint
|                               |
+-------------------------------+
```

**Weekly dot animations:**
- Completed days: gentle pulse every ~8 seconds
- Today (incomplete): breathing glow
- Future days: completely still (contrast creates the sense of life)

**Ghibli alignment:**
- Scrolling feels like walking through a garden path
- Each section is a "clearing" you pause in
- The journey continues below (`. . .` hint)
- Numbers breathe because living things breathe

---

## Git Workflow & Safety

**Rollback point established:**
- Tag `v1.0.0-pwa` marks the working PWA before commercialization
- To return to safe state: `git checkout v1.0.0-pwa`

**Branch strategy:**
```
main (protected, always deployable)
  +-- feature/phase-0-setup
  +-- feature/phase-1-auth
  +-- feature/phase-2-ui
  +-- feature/phase-3-paywall
  +-- etc.
```

**Workflow per phase:**
1. Create branch: `git checkout -b feature/phase-X-name`
2. Build and test the feature
3. Run phase test checklist
4. Merge to main only when stable: `git checkout main && git merge feature/phase-X-name`
5. Tag milestones: `git tag -a v1.X.0 -m "Phase X complete"`
6. Delete branch: `git branch -d feature/phase-X-name`

**Rollback commands:**
| Situation | Command |
|-----------|---------|
| Return to working PWA | `git checkout v1.0.0-pwa` |
| Undo last commit (not pushed) | `git reset --soft HEAD~1` |
| Revert a merged feature | `git revert <commit>` |
| Abandon broken branch | `git branch -D feature/broken-thing` |

---

## When You Get Stuck

**Rule: If stuck on a phase for more than 2 days, pause and ask for help.**

**Debug checklist:**
1. Does `npm run build` succeed?
2. What does the browser console show?
3. What does the Supabase/RevenueCat dashboard show?
4. Can you isolate the problem to one file/function?

**Common issues and solutions:**

| Problem | Check |
|---------|-------|
| Apple Sign-In fails | Bundle ID exact match? Team ID correct? |
| "Invalid Product ID" | Product IDs case-sensitive match? Apple approved? |
| Sync not working | Network tab in devtools? Supabase RLS policies? |
| p5.js not rendering | Instance mode setup correct? Container ref passed? |
| Capacitor build fails | Xcode signing? Correct bundle ID? |

---

## Success Metrics

**Launch success (first 30 days):**
- [ ] 100+ downloads
- [ ] 5+ ratings (4+ star average)
- [ ] 5+ paid conversions
- [ ] Zero critical crashes
- [ ] At least one user reaches Garden

**6-month success:**
- [ ] 10,000+ total downloads
- [ ] 500+ paid subscribers
- [ ] 4.5+ star rating
- [ ] Featured in "Meditation" category (goal)
- [ ] At least one user reaches 100 hours
