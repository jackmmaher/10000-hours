# 10,000 Hours - iOS Commercialization Roadmap

**Status:** FINALIZED | **Date:** January 2026

---

## Vision

Transform the minimalist meditation timer PWA into a commercially viable iOS app while preserving its zen philosophy. The app's restraint IS the product - we enhance without bloating.

**Core additions:**
- Feature-gated freemium (unlimited free timer, paid premium features)
- $29.99/year OR $99.99 lifetime pricing (3-tier model: Free / Annual / Lifetime)
- Cloud sync via Supabase
- The Garden: A living, growing tree that visualizes your meditation journey (PREMIUM)
- Year-end summary: "The Tree Remembers" — a temporal journey through your tree's growth (PREMIUM)
- Ghibli-inspired design language: warm colors, organic animation, generous Ma (空間)

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

In January, free users experience the **same tree journey**, but obscured:

```
┌─────────────────────────────────────┐
│                                     │
│         2025                        │
│                                     │
│     [BLURRED TREE SILHOUETTE]       │
│     Motion visible through blur     │
│     Spirit as shadow outline        │
│                                     │
│         42.5 hours                  │  ← Real number still shown
│                                     │
│     The tree grows, rewinds,        │
│     tells its story—but you         │
│     can't quite see it clearly      │
│                                     │
│     ┌─────────────────────────┐     │
│     │  See what you've grown  │     │
│     └─────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

**The FOMO is visceral:** You KNOW your tree is in there. You can see it moving. The story is being told. You just can't see it clearly.

**Preview strategy across all screens:**
- Always show user's REAL data (hours, sessions, dates)
- Blur or partially hide the rich visualizations
- Single tap → Paywall
- Personal data creates emotional investment

---

## Year-End Summary: The Tree Remembers

The Year Summary is not a separate feature—it's a **temporal journey through your tree itself**. You're not reading stats; you're watching your tree grow through time. The tree IS the summary.

### Philosophy

- The tree tells its own story
- Data is whispered context, not the main event
- The emotional payoff is watching what you grew
- No gamification, no comparisons, no sharing prompts
- This is a personal ritual, not a shareable trophy

### The Experience

**1. Opening: Now**
Your tree as it currently is, full screen, breathing. Spirit at current evolution. Text fades in: "2025". Wind through leaves. A moment of presence.

**2. The Rewind**
The tree begins to **un-grow**. Leaves release, branches retract, spirit shrinks and glows smaller. Time flows backward until—a seed. Or tiny sprout. "January."

A beat of stillness. Then growth begins.

**3. Growth Sequence**
Time flows forward. The tree grows organically—continuous transformation, not jumps. Key moments are marked by the **environment responding**:

| Moment | Visual | Text |
|--------|--------|------|
| **First sit** | First branches appear, spirit orb blinks into existence | "Your first sit. 12 minutes." |
| **Spring growth** | Leaves unfurl, soft spring light | "By spring, 15 hours had taken root." |
| **The deep sit** | Time pauses, a branch glows softly, spirit looks up | "March 14th. Your deepest sit. 1h 23m." |
| **The streak** | Accelerated growth, golden pulses through trunk (23 pulses for 23 days) | "23 days. Unbroken." |
| **Seasonal passage** | Light shifts warmer then cooler, environment evolves | "The summer you found your rhythm." |

**4. Arrival: Now (Again)**
The tree reaches current full form. But now you've seen the journey—it means something different. Spirit looks at you. A long moment. Settles back to idle.

**5. The Horizon**
View pulls back slightly. The tree remains, but beyond it—soft mist. The suggestion of the full 10,000-hour tree in the distance. What it could become.

"The horizon. Not the point."

Fade to your garden, live, waiting.

### Visual Sequence (Wireframe)

```
[1. NOW]                    [2. REWIND]                 [3. JANUARY]
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│   [Full tree]   │         │   [Tree        │         │                 │
│   breathing     │   →     │    un-growing] │   →     │       .         │
│      ✧          │         │      ✧→·       │         │      🌱         │
│                 │         │                 │         │                 │
│     2025        │         │                 │         │    January      │
└─────────────────┘         └─────────────────┘         └─────────────────┘

[4. FIRST SIT]              [5. DEEP SIT]               [6. STREAK]
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│      🌱         │         │      🌳         │         │      🌲         │
│     / \         │         │    (glowing    │         │   (pulsing     │
│      ·          │         │     branch)    │         │    gold)       │
│                 │         │      ✧↑        │         │      ✧✧        │
│  Your first sit │         │  March 14th    │         │   23 days      │
│   12 minutes    │         │  1h 23m        │         │   unbroken     │
└─────────────────┘         └─────────────────┘         └─────────────────┘

[7. NOW AGAIN]              [8. HORIZON]
┌─────────────────┐         ┌─────────────────┐
│                 │         │  ░░░░░░░░░░░░░  │  ← Misty future tree
│   [Full tree]   │         │  ░░░░░░░░░░░░░  │
│   Spirit looks  │         │                 │
│   at you        │         │   [Your tree]   │
│      ✧          │         │      ✧          │
│                 │         │                 │
│   42.5 hours    │         │  The horizon    │
│  still growing  │         │  not the point  │
└─────────────────┘         └─────────────────┘
```

### Interaction Model

- **Auto-advance** with slow pace (8-10s per moment)
- Swipe to advance available but not prompted
- No "skip" button—this is meant to be sat with
- Total duration: ~60-90 seconds

### Free User Experience

Same sequence, but:
- Tree is blurred/silhouetted throughout
- Spirit is a shadow/outline
- Data text still appears ("42.5 hours")
- Ends with: "Unlock your garden to see what you've grown"

The FOMO: "That blur is MY tree. I want to see it."

### Technical Requirements

- Garden rendering must support **growth level scrubbing**—given timestamp or hour-count, render tree at that historical state
- Spirit evolution stages need defined hour thresholds
- Environmental elements (seasons, lighting) tied to time/hour milestones
- Animation system needs smooth interpolation between growth states
- Tree must be deterministic: same hours = same tree appearance (via randomSeed)

### Sharing (If Any)

No stats overlay. If user wants to share:
- "Save your tree" → generates image of just the tree
- Beautiful, minimal, no numbers
- More "look at this thing I grew" than "look at my achievements"

---

## Monetization

### Pricing Model: Three Tiers (Research-Backed)

| Product | Price | Net (after Apple 15%*) | Type |
|---------|-------|----------------------|------|
| **Free** | $0 | — | Unlimited timer, basic stats |
| **Annual Premium** | $29.99/year | $25.49/year | Auto-renewing subscription |
| **Lifetime Premium** | $99.99 | $84.99 | Non-consumable IAP |

*Apple Small Business Program: 15% commission for developers earning under $1M/year

### Why This Pricing?

**Research findings (RevenueCat 2025, Adapty):**
- Annual subscriptions have 33.9% 12-month retention vs 13.8% for monthly
- Annual subscribers are 2.4x more profitable than monthly
- 3 pricing tiers optimal (17% higher conversion than 5+ tiers)
- No monthly option: aligns with commitment philosophy of meditation

**Why no introductory discounts:**
- Transparent, honest pricing ("no dark patterns" principle)
- No "gotcha" at renewal — annual auto-renews at same price
- Lifetime acts as anchor, making annual look like great value

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
│  │  $29.99 / year ⭐ Best Value│    │
│  │  Billed annually            │    │
│  │  Auto-renews at same price  │    │
│  │                             │    │
│  │      [Subscribe]            │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │   $99.99 lifetime           │    │
│  │   One payment, yours forever│    │
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
- 70% choose annual, 30% choose lifetime
- 33.9% annual retention year 2 (RevenueCat benchmark)

| Downloads/Year | Paid (5%) | Year 1 Revenue | 5-Year Revenue |
|----------------|-----------|----------------|----------------|
| 10,000 | 500 | ~$17,500 | ~$19,000 |
| 50,000 | 2,500 | ~$87,500 | ~$95,000 |
| 100,000 | 5,000 | ~$175,000 | ~$190,000 |

**Target: $100K/year revenue (~$65K net profit after Apple 15% + Irish taxes)**
- Downloads needed: ~50,000 at 5% conversion
- Achievable with: Strong ASO, word-of-mouth, 1-2 press mentions

### Economics

- Apple takes 15% (Small Business Program for <$1M revenue)
- $99.99 lifetime → $84.99 net
- $29.99/year → $25.49 net
- Break-even: ~4 lifetime sales OR ~4 annual subscriptions
- Yearly costs: ~$200 (Apple $99 + Supabase ~$25 + domain $12 + misc)

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
    YearSummary.tsx       # "The Tree Remembers" - temporal garden journey, handles locked/unlocked
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
- [ ] Create `Paywall.tsx` with 3-tier pricing (Free / $29.99 annual / $99.99 lifetime)
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

### Phase 6: Design System (Ghibli)
- [ ] Update color palette in Tailwind config (cream → warmer, indigo → softer ink)
- [ ] Add Google Fonts: Cormorant Garamond (display), Nunito (body)
- [ ] Implement breathing animation keyframes with asymmetric timing
- [ ] Add organic easing curves to transitions
- [ ] Refactor Stats screen: remove borders, increase spacing (Scroll Garden)
- [ ] Add living number animations to key statistics
- [ ] Update weekly dots with micro-animations (pulse, glow states)
- [ ] Add paper texture to backgrounds (subtle, optional)

### Phase 7: Year Summary (The Tree Remembers)
- [ ] Add growth level scrubbing to TreeCanvas (render tree at any historical hour-count)
- [ ] Implement tree "rewind" animation (un-growth sequence)
- [ ] Create YearSummary.tsx as temporal Garden journey
- [ ] Add key moment detection (first sit, deep sit, streaks)
- [ ] Implement environment/lighting changes for seasons
- [ ] Spirit reactions at milestone moments
- [ ] Auto-advance timing with swipe-to-skip
- [ ] Blurred/silhouette mode for free users
- [ ] "Save your tree" image export (no stats overlay)

### Phase 8: Enhancements
- [ ] Apple Health integration
- [ ] Interval bells (sounds + settings)
- [ ] Dark mode (respect Ghibli palette in dark variant)
- [ ] iOS widgets (small: hours only)

### Phase 9: Capacitor & iOS
- [ ] Install Capacitor + plugins
- [ ] Generate iOS project
- [ ] Configure capabilities
- [ ] App icons + splash screens
- [ ] Test on physical device
- [ ] Haptic feedback on session end

### Phase 10: Launch
- [ ] Privacy policy + Terms of Service
- [ ] App Store listing copy
- [ ] Screenshots + preview video
- [ ] TestFlight beta
- [ ] Submit for review

### Phase 11: Post-Launch
- [ ] Milestone shareable cards (tree images, no stats)
- [ ] Tree art upgrade (Rive/Lottie for smoother animation)
- [ ] Seasonal environment variations

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

## Design Language: Ghibli-Inspired

The app's visual language draws from Studio Ghibli's design philosophy—not as imitation, but as principled inspiration. Ghibli's aesthetic is built on specific foundations that align naturally with meditation.

### Core Ghibli Principles Applied

| Ghibli Principle | Application in 10,000 Hours |
|------------------|----------------------------|
| **Ma (間)** — meaningful emptiness | Generous whitespace, content floats in space, no borders |
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
| **Display** | Cormorant Garamond | Organic curves, "hand-touched" feeling, breathing letterforms |
| **Body** | Nunito or Work Sans | Rounded terminals = softer, more human, warm |

The font should feel *written*, not *typeset*.

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
- Remove ALL solid borders (`border-b border-indigo-deep/10`)
- Use generous vertical spacing instead (2-3x current `mb-8`)
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
┌─────────────────────────────────┐
│                                 │
│          42.5 hours             │  ← Breathing animation
│                                 │
│                                 │
│                                 │  ← Generous "walk" between sections
│                                 │
│    ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈     │  ← Soft dashed path (optional)
│                                 │
│                                 │
│      next: 50 hours             │
│      ██████████░░░░ 85%         │  ← Progress bar with organic fill
│                                 │
│                                 │
│                                 │
│    ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈     │
│                                 │
│                                 │
│       M  T  W  T  F  S  S       │
│       ●  ●  ●  ◐  ○  ○  ○       │  ← Weekly dots with micro-animations
│                                 │
│       3 sessions · 2h 15m       │
│                                 │
│                                 │
│            · · ·                │  ← Continuation hint
│                                 │
└─────────────────────────────────┘
```

**Weekly dot animations:**
- Completed days: gentle pulse every ~8 seconds
- Today (incomplete): breathing glow
- Future days: completely still (contrast creates the sense of life)

**Ghibli alignment:**
- Scrolling feels like walking through a garden path
- Each section is a "clearing" you pause in
- The journey continues below (` · · · ` hint)
- Numbers breathe because living things breathe

---

## Build Execution Notes

### Git Workflow & Safety

**Rollback point established:**
- Tag `v1.0.0-pwa` marks the working PWA before commercialization
- To return to safe state: `git checkout v1.0.0-pwa`

**Branch strategy:**
```
main (protected, always deployable)
  └── feature/phase-1-supabase
  └── feature/phase-2-sync
  └── feature/phase-5-garden
  └── etc.
```

**Workflow per phase:**
1. Create branch: `git checkout -b feature/phase-X-name`
2. Build and test the feature
3. Merge to main only when stable: `git checkout main && git merge feature/phase-X-name`
4. Tag milestones: `git tag -a v1.1.0 -m "Phase X complete"`
5. Delete branch: `git branch -d feature/phase-X-name`

**Rollback commands:**
| Situation | Command |
|-----------|---------|
| Return to working PWA | `git checkout v1.0.0-pwa` |
| Undo last commit (not pushed) | `git reset --soft HEAD~1` |
| Revert a merged feature | `git revert <commit>` |
| Abandon broken branch | `git branch -D feature/broken-thing` |

### Implementation Notes

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
Phase 6: Design System (Ghibli aesthetic overhaul)
Phase 7: Year Summary (The Tree Remembers)
Phase 8: Enhancements (Health, bells, widgets)
Phase 9-11: Capacitor, Launch, Post-launch polish
```
