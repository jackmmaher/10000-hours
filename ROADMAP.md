# 10,000 Hours - iOS Commercialization Roadmap

**Status:** FINALIZED | **Date:** January 2026

---

## Vision

Transform the minimalist meditation timer PWA into a commercially viable iOS app while preserving its zen philosophy. The app's restraint IS the product - we enhance without bloating.

**Core additions:**
- Feature-gated freemium (unlimited free timer, paid premium features)
- $2.99/year OR $9.99 lifetime pricing
- Cloud sync via Supabase
- The Garden: A living, growing tree that visualizes your meditation journey (PREMIUM)
- Year-end summary (Spotify Wrapped style) (PREMIUM)

---

## Navigation Architecture

```
                    ┌──────────────┐
                    │  ONBOARDING  │  (first launch only)
                    └──────┬───────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   TIMER  →  STATS  →  CALENDAR  →  GARDEN               │
│   (home)    (⚙️→Settings)          (the tree)            │
│                                                          │
│   Overlays: Paywall, Auth Modal, Year Summary            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Screen Flow

| Screen | Purpose | Free | Premium |
|--------|---------|------|---------|
| **Timer** | Meditation (home) | Full access | Full access |
| **Stats** | Analytics | Basic only | Full milestones, projections |
| **Calendar** | History, heatmap | Preview (locked) | Full access |
| **Garden** | Living tree | Preview (locked) | Full access |
| **Settings** | Account, sync | Basic | Full (sync, bells, export) |
| **Onboarding** | First-time intro | Yes | Yes |
| **Paywall** | Purchase prompt | Trigger on locked feature | N/A |
| **Auth Modal** | Sign in/up | After purchase | Anytime |
| **Year Summary** | Annual review | Preview (locked) | Full access |

---

## Free vs Premium Tiers

### Feature Breakdown

| Feature | Free | Premium |
|---------|------|---------|
| **Timer** | Unlimited sessions | Unlimited sessions |
| **Basic Stats** | Total hours, this week | Full stats |
| **Milestones** | See next milestone only | Full milestone history |
| **Projections** | Hidden | Full projections |
| **Calendar** | 🔒 Preview (blurred) | Full heatmap |
| **Garden** | 🔒 Preview (teaser) | Full living tree |
| **Spirit** | 🔒 Preview (glimpse) | Full companion |
| **Cloud Sync** | No | Yes |
| **Year Summary** | 🔒 Preview | Full + shareable |
| **Interval Bells** | No | Yes |
| **Apple Health** | No | Yes |
| **Export Data** | No | Yes |

### Monetization Philosophy

**The meditation is ALWAYS free. You pay for the beautiful garden around it.**

| What's Free | What's Premium |
|-------------|----------------|
| The practice itself | The visualization of progress |
| Unlimited session length | Seeing your tree grow |
| Unlimited session count | Full analytics & history |
| Basic progress tracking | Cloud sync & export |

**Why no session limits:**
- Free users can meditate for hours - we WANT them to build investment
- More hours = bigger tree waiting behind the blur = stronger FOMO
- Cutting off meditation would create anxiety, not desire
- The hook is "look what you've grown" not "you've run out of time"
- Conversion comes from wanting to SEE results, not from artificial friction

**This is philosophically aligned:** Like a meditation center that's free to sit in, but you pay for the beautiful garden view and your progress journal.

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
- Spirit companion (~100 states)
- Atmosphere/lighting (~50)

### Spirit Evolution

| Hours | Spirit State |
|-------|--------------|
| 0-50 | Tiny orb, curious |
| 50-250 | Small figure, playful |
| 250-1000 | Mature, serene |
| 1000-5000 | Luminous, wise |
| 5000-10000 | Merging with tree |

### Animation (Miyazaki Principles)

**Always alive (idle):**
- Leaves sway in breeze
- Spirit blinks, shifts weight
- Light dapples through canopy
- Rare visitors (butterfly, bird)

**Post-session growth:**
1. Golden light ripples upward
2. New element appears (leaf unfurls, branch extends)
3. Spirit notices, reacts with joy
4. Settles back to gentle idle

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
// Growth level: 0.0 (seed) → 1.0 (full tree)
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

**Spirit companion:** AI-generated PNG sprites at evolution stages, animated via CSS

**References:**
- [L-System Fractal Trees P5](https://github.com/hey24sheep/LSystem_Fractal_Trees_P5)
- [p5.js React Integration](https://shivanshbakshi.dev/blog/p5-react/integrate-p5-with-react/)

### Garden Preview (Free Users)

When free users navigate to Garden, they see an **enticing preview**:

```
┌─────────────────────────────────────┐
│                                     │
│     [BLURRED/DIMMED TREE]           │
│     Their actual tree at current    │
│     growth level, but obscured      │
│                                     │
│     ┌─────────────────────────┐     │
│     │  🌱 Your garden awaits  │     │
│     │                         │     │
│     │  You've grown 5.2 hours │     │
│     │  See your tree flourish │     │
│     └─────────────────────────┘     │
│                                     │
│     ┌─────────────────────────┐     │
│     │   Unlock Your Garden    │     │
│     │        ↓                │     │
│     └─────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

**Preview mechanics:**
1. Tree IS rendered at user's actual growth level
2. Gaussian blur + reduced opacity overlay
3. Subtle animation still visible through blur (enticing motion)
4. Spirit companion as silhouette/shadow
5. User's actual hours shown ("You've grown X hours")
6. Single tap → Paywall slides up

**Psychology:**
- User sees THEIR tree, not a generic preview
- Motion through blur creates curiosity
- Personal data ("your 5.2 hours") creates ownership
- One tap to unlock reduces friction

### Stats Preview (Free Users)

Free users see **partial stats** with premium features teased:

```
┌─────────────────────────────────────┐
│  ←                         Stats    │
├─────────────────────────────────────┤
│                                     │
│       42.5 hours                    │  ← Always visible
│       toward 10,000                 │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  This week: 2.3 hours       │    │  ← Always visible
│  │  Sessions: 12               │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Next milestone: 50 hours   │    │  ← Free: next only
│  │  ████████░░░░░ 85%          │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🔒 Full milestone history  │    │  ← Locked
│  │  🔒 Projections & pace      │    │
│  │  🔒 Detailed analytics      │    │
│  │                             │    │
│  │     [Unlock Premium]        │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### Calendar Preview (Free Users)

Free users see a **blurred heatmap** with their actual data:

```
┌─────────────────────────────────────┐
│  ←                      Calendar    │
├─────────────────────────────────────┤
│                                     │
│     [BLURRED HEATMAP]               │
│     Real data, but obscured         │
│     Colors/patterns visible         │
│                                     │
│     ┌─────────────────────────┐     │
│     │  📅 Your meditation     │     │
│     │     history awaits      │     │
│     │                         │     │
│     │  147 sessions tracked   │     │  ← Real count
│     │  See your patterns      │     │
│     └─────────────────────────┘     │
│                                     │
│     ┌─────────────────────────┐     │
│     │   Unlock Calendar       │     │
│     │        ↓                │     │
│     └─────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

### Year Summary Preview (Free Users)

In January, free users get a **teaser card**:

```
┌─────────────────────────────────────┐
│                                     │
│         2025                        │
│    The year you sat.                │
│                                     │
│         ✨ 42.5 hours ✨            │  ← Real number
│                                     │
│     ┌─────────────────────────┐     │
│     │  See your full journey  │     │
│     │                         │     │
│     │  • Your deepest sit     │     │
│     │  • Your longest streak  │     │
│     │  • Your meditation      │     │
│     │    rhythm               │     │
│     │  • Your tree's growth   │     │
│     │                         │     │
│     │    [Unlock Summary]     │     │
│     └─────────────────────────┘     │
│                                     │
│         Maybe later                 │
│                                     │
└─────────────────────────────────────┘
```

**Preview strategy across all screens:**
- Always show user's REAL data (hours, sessions, dates)
- Blur or partially hide the rich visualizations
- Single tap → Paywall
- Personal data creates emotional investment

---

## Year-End Summary (Wrapped Style)

### Data Captured

| Metric | Emotional Framing |
|--------|-------------------|
| Total hours | "You sat with yourself for X hours" |
| Total sessions | "X moments of stillness" |
| Longest session | "Your deepest sit" |
| Longest streak | "X days unbroken" |
| Favorite time | "You're a morning/evening meditator" |
| Milestones hit | "You crossed X thresholds" |

### Card Sequence (8-10 swipeable screens)

1. **Opening** - "2025. The year you sat."
2. **The Number** - Total hours (counts up)
3. **Sessions** - "X times you chose stillness"
4. **The Deep Sit** - Longest session with date
5. **Consistency** - Longest streak
6. **Rhythm** - Time of day pattern
7. **The Tree** - Animated growth visualization
8. **The Horizon** - Hours toward 10,000
9. **Share** - Shareable summary card

### Animation Style
- Slow fades (meditative pace)
- Count-up numbers (satisfying, not gamified)
- Tree growth sequence as centerpiece

---

## Monetization

### Pricing Model: Choice Architecture

| Product | Price | Net (after Apple 30%) | Type |
|---------|-------|----------------------|------|
| **Annual Premium** | $2.99/year | $2.09/year | Auto-renewing subscription |
| **Lifetime Premium** | $9.99 | $6.99 | Non-consumable IAP |
| Small Tip | $2.99 | $2.09 | Consumable |
| Medium Tip | $5.99 | $4.19 | Consumable |
| Large Tip | $9.99 | $6.99 | Consumable |

### Why Two Options?

- **$2.99/year** - Lower barrier, captures casual users who may churn
- **$9.99 lifetime** - Better value after 4 years, captures committed users
- Most will choose lifetime (it's obviously better for long-term)
- Annual provides recurring revenue from uncertain users

### Paywall Screen Design

```
┌─────────────────────────────────────┐
│                                     │
│        Unlock Your Garden           │
│                                     │
│   Full stats • Calendar • Sync      │
│   The living tree • Year summary    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │      $2.99 / year           │    │
│  │      Billed annually        │    │
│  │                             │    │
│  │      [Subscribe]            │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │   $9.99 lifetime ⭐ BEST    │    │
│  │   One payment, yours forever│    │
│  │   Saves after ~4 years      │    │
│  │                             │    │
│  │   [     Buy Once     ]      │    │  ← Apple Pay enabled
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│         Restore Purchases           │
│                                     │
│              Maybe later            │
│                                     │
└─────────────────────────────────────┘
```

### One-Click Checkout Flow

1. User taps "Buy Once" or "Subscribe"
2. **Apple Pay sheet appears** (if enabled) - Face ID → Done
3. OR standard App Store purchase dialog
4. On success: Immediate unlock + prompt for account (for sync)
5. **No account required to purchase** - Can use locally forever
6. Account only needed for cloud sync

### Paywall Triggers

Paywall appears when free user tries to:
- View full Calendar (not just preview)
- Enter Garden (not just preview)
- Access Year Summary
- Enable cloud sync
- Use interval bells
- Export data

**NOT** when:
- Using timer (always free)
- Viewing basic stats (always free)

### Revenue Projections (Feature-Gated Model)

Assumptions:
- 5% conversion (industry standard for good freemium)
- 60% choose lifetime, 40% choose annual
- 40% annual retention year 2, declining

| Downloads/Year | Paid (5%) | Year 1 Revenue | 5-Year Revenue |
|----------------|-----------|----------------|----------------|
| 10,000 | 500 | ~$2,500 | ~$2,850 |
| 50,000 | 2,500 | ~$12,500 | ~$14,250 |
| 100,000 | 5,000 | ~$25,000 | ~$28,500 |

### Economics

- Apple takes 30% on all transactions
- $9.99 lifetime → $6.99 net
- $2.99/year → $2.09 net
- Break-even: ~16 lifetime sales OR ~53 annual subscriptions
- Yearly costs: ~$111 (Apple $99 + domain $12)

---

## Technical Architecture

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| State | Zustand |
| Local DB | Dexie (IndexedDB) |
| Cloud DB | Supabase PostgreSQL |
| Auth | Supabase Auth (Apple Sign-In) |
| Payments | RevenueCat |
| iOS Wrapper | Capacitor |
| Styling | Tailwind CSS |

### Database Schema (Supabase)

```sql
-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  is_premium BOOLEAN DEFAULT FALSE,
  premium_type TEXT,                    -- 'lifetime' | 'annual' | NULL
  purchase_date TIMESTAMPTZ,
  subscription_expires_at TIMESTAMPTZ,  -- For annual subscribers
  has_reached_enlightenment BOOLEAN DEFAULT FALSE,
  last_sync_at TIMESTAMPTZ
);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  client_uuid TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER NOT NULL,
  UNIQUE(user_id, client_uuid)
);
```

### Sync Strategy

**Offline-first with last-write-wins:**
- Local writes instant (Dexie)
- Background sync to Supabase when online
- UUID deduplication prevents duplicates
- Conflict resolution: server timestamp wins

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/db.ts` | Add sync fields, SyncQueue table |
| `src/stores/useSessionStore.ts` | Add sync triggers |
| `src/App.tsx` | Add Garden route, auth provider, new screen routing |
| `src/components/Timer.tsx` | Post-session Garden prompt (premium users) |
| `src/components/Stats.tsx` | Settings gear icon, free/premium UI states |
| `src/components/Calendar.tsx` | Add locked preview state for free users |
| `src/lib/constants.ts` | Growth rate constants, premium feature flags |
| `package.json` | New dependencies |

## New Files to Create

```
src/
  lib/
    supabase.ts           # Supabase client init
    sync.ts               # Sync engine
    purchases.ts          # RevenueCat integration
    growth.ts             # Tree growth calculations (growthLevel, spirit stage)
    lsystem.ts            # L-system grammar and tree generation

  stores/
    useAuthStore.ts       # Auth state
    usePremiumStore.ts    # Premium status, feature-gating logic
    useGardenStore.ts     # Tree/spirit state, growth level

  components/
    Garden.tsx            # The garden screen (tree + spirit + UI) - handles both locked/unlocked
    TreeCanvas.tsx        # p5.js React wrapper for L-system tree
    Spirit.tsx            # Spirit companion with CSS animations
    LockedOverlay.tsx     # Reusable blur + unlock CTA overlay
    Onboarding.tsx        # Intro flow (3 screens)
    Paywall.tsx           # Purchase screen (dual pricing)
    Settings.tsx          # Settings screen
    AuthModal.tsx         # Sign in/up
    YearSummary.tsx       # Wrapped-style summary - handles both locked/unlocked
    IntervalBells.tsx     # Sound settings

  assets/
    spirit/               # AI-generated spirit PNG sprites (5-10 stages)
    sounds/               # Bell/om sounds

capacitor.config.ts
ios/                      # Generated by Capacitor
ROADMAP.md               # This document (north star)
```

**New dependencies:**
```json
{
  "p5": "^1.9.0",
  "react-p5": "^1.3.35"
}
```

---

## Implementation Phases

### Phase 1: Infrastructure
- [ ] Create Supabase project
- [ ] Create tables with RLS policies
- [ ] Add `src/lib/supabase.ts`
- [ ] Implement Apple Sign-In
- [ ] Create `useAuthStore.ts`
- [ ] Extend Dexie schema with sync fields

### Phase 2: Sync Engine
- [ ] Create `src/lib/sync.ts`
- [ ] Implement sync queue
- [ ] Push/pull sync logic
- [ ] Local → cloud migration on first sign-in
- [ ] Conflict resolution
- [ ] Test offline scenarios

### Phase 3: Feature-Gating & Paywall
- [ ] Add `usePremiumStore.ts` for premium status tracking
- [ ] Create `Paywall.tsx` with dual pricing ($2.99/year, $9.99 lifetime)
- [ ] Implement feature-gate checks (Calendar, Garden, Sync, etc.)
- [ ] Set up RevenueCat account
- [ ] Integrate RevenueCat SDK (subscription + non-consumable)
- [ ] Configure IAPs in App Store Connect (annual sub + lifetime)

### Phase 4: Core UI Screens
- [ ] Create `Onboarding.tsx` (3 screens)
- [ ] Create `Settings.tsx`
- [ ] Create `AuthModal.tsx`
- [ ] Add navigation to Garden position
- [ ] Wire up all screen transitions

### Phase 5: The Garden
- [ ] Install p5 and react-p5 dependencies
- [ ] Create L-system grammar (`src/lib/lsystem.ts`)
- [ ] Create growth calculation system (`src/lib/growth.ts`)
- [ ] Implement `TreeCanvas.tsx` (p5.js React wrapper)
- [ ] Add idle breathing animation (sway, leaf movement)
- [ ] Generate spirit PNG sprites (AI-assisted)
- [ ] Implement `Spirit.tsx` with CSS animations
- [ ] Add post-session growth animation (golden light ripple)
- [ ] Create `Garden.tsx` screen
- [ ] Add "View garden" prompt after sessions
- [ ] Test growth progression (0h → 100h → 1000h → 10000h)

### Phase 6: Enhancements
- [ ] Apple Health integration
- [ ] Interval bells (sounds + settings)
- [ ] Dark mode
- [ ] iOS widgets (small: hours only)
- [ ] Year Summary foundation

### Phase 7: Capacitor & iOS
- [ ] Install Capacitor + plugins
- [ ] Generate iOS project
- [ ] Configure capabilities
- [ ] App icons + splash screens
- [ ] Test on physical device
- [ ] Haptic feedback on session end

### Phase 8: Launch
- [ ] Privacy policy + Terms of Service
- [ ] App Store listing copy
- [ ] Screenshots + preview video
- [ ] TestFlight beta
- [ ] Submit for review

### Phase 9: Post-Launch (December)
- [ ] Year Summary feature (for January release)
- [ ] Milestone shareable cards
- [ ] Tree art upgrade (Rive/Lottie)

---

## Settings Screen Structure

```
┌─────────────────────────────────────┐
│  ←                       Settings   │
├─────────────────────────────────────┤
│                                     │
│  ACCOUNT                            │
│  ┌─────────────────────────────┐    │
│  │ jack@email.com              │    │
│  │ Sign Out                    │    │
│  └─────────────────────────────┘    │
│                                     │
│  SYNC                               │
│  ┌─────────────────────────────┐    │
│  │ ● Synced (2 min ago)        │    │
│  └─────────────────────────────┘    │
│                                     │
│  MEDITATION                         │
│  ┌─────────────────────────────┐    │
│  │ Interval bells        [off] │    │
│  │ Sound              [bell ▾] │    │
│  │ Intervals     [15,30,60 ▾]  │    │
│  └─────────────────────────────┘    │
│                                     │
│  SUPPORT THE JOURNEY                │
│  ┌─────────────────────────────┐    │
│  │ Leave a tip              →  │    │
│  └─────────────────────────────┘    │
│                                     │
│  DATA                               │
│  ┌─────────────────────────────┐    │
│  │ Apple Health sync     [on]  │    │
│  │ Export sessions          →  │    │
│  │ View 2025 Summary        →  │    │
│  └─────────────────────────────┘    │
│                                     │
│  ABOUT                              │
│  ┌─────────────────────────────┐    │
│  │ Privacy Policy           →  │    │
│  │ Terms of Service         →  │    │
│  │ Version 1.0.0               │    │
│  └─────────────────────────────┘    │
│                                     │
│  Restore Purchases                  │
└─────────────────────────────────────┘
```

---

## Business Management

No custom admin needed - use existing dashboards:

| Dashboard | What You Get |
|-----------|--------------|
| **RevenueCat** | Customers, revenue, tax exports |
| **Supabase** | Users, database metrics |
| **App Store Connect** | Downloads, ratings, revenue |

---

## Complexity & Timeline

| Component | Difficulty | Notes |
|-----------|------------|-------|
| Supabase setup | Low | Standard config |
| Apple Sign-In | Medium | Tedious portal work |
| Sync engine | **High** | Hardest part |
| RevenueCat | Medium | Fiddly IAP setup |
| Garden (MVP) | Medium | p5.js + L-systems |
| Garden (V2) | High | Full Rive animation |
| Capacitor | Low-Medium | Config + signing |

**Timeline:**
- Part-time: 6-8 weeks (with Garden)
- Full-time: 3-4 weeks

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

## Build Execution Notes

**First step after planning:**
1. Sync this plan to `ROADMAP.md` in the GitHub repository
2. Commit the updated roadmap

**When implementing:**
- Follow phases in order (Infrastructure → Sync → Paywall → UI → Garden → etc.)
- Test each phase before moving to next
- Commit at logical checkpoints (end of each phase)
- Use feature branches for each phase

**Key implementation order:**
```
Phase 1: Supabase + Auth foundation
Phase 2: Sync engine (hardest part)
Phase 3: RevenueCat + Paywall
Phase 4: UI screens (Onboarding, Settings, Auth)
Phase 5: The Garden (the fun part)
Phase 6-9: Polish, Capacitor, Launch
```
