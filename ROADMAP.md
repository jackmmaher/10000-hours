# 10,000 Hours - iOS Commercialization Roadmap

**Status:** REVISED | **Date:** January 2026

---

## Vision

Transform the minimalist meditation timer PWA into a commercially viable iOS app while preserving its zen philosophy. The app's restraint IS the product - we enhance without bloating.

**Core additions:**
- Feature-gated freemium (unlimited free timer, paid premium features)
- $29.99/year OR $99.99 lifetime pricing (3-tier model: Free / Annual / Lifetime)
- Cloud sync via Supabase
- The Garden: A living, growing tree that visualizes your meditation journey (PREMIUM)
- Year-end summary: "The Tree Remembers" — a temporal journey through your tree's growth (PREMIUM)
- Ghibli-inspired design language: warm colors, organic animation, generous Ma (empty space)

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
|   Overlays: Paywall, Auth Modal, Year Summary            |
|                                                          |
+----------------------------------------------------------+
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
| **Calendar** | Preview (blurred) | Full heatmap |
| **Garden** | Preview (teaser) | Full living tree |
| **Spirit** | Preview (glimpse) | Full companion |
| **Cloud Sync** | No | Yes |
| **Year Summary** | Preview | Full + shareable |
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

**Spirit companion:** AI-generated PNG sprites at evolution stages, animated via CSS

**References:**
- [L-System Fractal Trees P5](https://github.com/hey24sheep/LSystem_Fractal_Trees_P5)
- [p5.js React Integration](https://shivanshbakshi.dev/blog/p5-react/integrate-p5-with-react/)

### Garden Preview (Free Users)

When free users navigate to Garden, they see an **enticing preview**:

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
4. Spirit companion as silhouette/shadow
5. User's actual hours shown ("You've grown X hours")
6. Single tap -> Paywall slides up

**Psychology:**
- User sees THEIR tree, not a generic preview
- Motion through blur creates curiosity
- Personal data ("your 5.2 hours") creates ownership
- One tap to unlock reduces friction

### Stats Preview (Free Users)

Free users see **partial stats** with premium features teased:

```
+-------------------------------------+
|  <-                         Stats    |
+-------------------------------------+
|                                     |
|       42.5 hours                    |  <- Always visible
|       toward 10,000                 |
|                                     |
|  +-----------------------------+    |
|  |  This week: 2.3 hours       |    |  <- Always visible
|  |  Sessions: 12               |    |
|  +-----------------------------+    |
|                                     |
|  +-----------------------------+    |
|  |  Next milestone: 50 hours   |    |  <- Free: next only
|  |  ████████░░░░░ 85%          |    |
|  +-----------------------------+    |
|                                     |
|  +-----------------------------+    |
|  |  [locked] Full milestone    |    |  <- Locked
|  |  [locked] Projections       |    |
|  |  [locked] Detailed stats    |    |
|  |                             |    |
|  |     [Unlock Premium]        |    |
|  +-----------------------------+    |
|                                     |
+-------------------------------------+
```

### Calendar Preview (Free Users)

Free users see a **blurred heatmap** with their actual data:

```
+-------------------------------------+
|  <-                      Calendar    |
+-------------------------------------+
|                                     |
|     [BLURRED HEATMAP]               |
|     Real data, but obscured         |
|     Colors/patterns visible         |
|                                     |
|     +-------------------------+     |
|     |  Your meditation        |     |
|     |  history awaits         |     |
|     |                         |     |
|     |  147 sessions tracked   |     |  <- Real count
|     |  See your patterns      |     |
|     +-------------------------+     |
|                                     |
|     +-------------------------+     |
|     |   Unlock Calendar       |     |
|     +-------------------------+     |
|                                     |
+-------------------------------------+
```

### Year Summary Preview (Free Users)

In January, free users experience the **same tree journey**, but obscured:

```
+-------------------------------------+
|                                     |
|         2025                        |
|                                     |
|     [BLURRED TREE SILHOUETTE]       |
|     Motion visible through blur     |
|     Spirit as shadow outline        |
|                                     |
|         42.5 hours                  |  <- Real number still shown
|                                     |
|     The tree grows, rewinds,        |
|     tells its story--but you        |
|     can't quite see it clearly      |
|                                     |
|     +-------------------------+     |
|     |  See what you've grown  |     |
|     +-------------------------+     |
|                                     |
+-------------------------------------+
```

**The FOMO is visceral:** You KNOW your tree is in there. You can see it moving. The story is being told. You just can't see it clearly.

**Preview strategy across all screens:**
- Always show user's REAL data (hours, sessions, dates)
- Blur or partially hide the rich visualizations
- Single tap -> Paywall
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
- "Save your tree" -> generates image of just the tree
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
+-------------------------------------+
|                                     |
|        Unlock Your Garden           |
|                                     |
|   Full stats * Calendar * Sync      |
|   The living tree * Year summary    |
|                                     |
|  +-----------------------------+    |
|  |                             |    |
|  |  $29.99 / year  Best Value  |    |
|  |  Billed annually            |    |
|  |  Auto-renews at same price  |    |
|  |                             |    |
|  |      [Subscribe]            |    |
|  |                             |    |
|  +-----------------------------+    |
|                                     |
|  +-----------------------------+    |
|  |                             |    |
|  |   $99.99 lifetime           |    |
|  |   One payment, yours forever|    |
|  |                             |    |
|  |   [     Buy Once     ]      |    |  <- Apple Pay enabled
|  |                             |    |
|  +-----------------------------+    |
|                                     |
|         Restore Purchases           |
|                                     |
|              Maybe later            |
|                                     |
+-------------------------------------+
```

### One-Click Checkout Flow

1. User taps "Buy Once" or "Subscribe"
2. **Apple Pay sheet appears** (if enabled) - Face ID -> Done
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
- $99.99 lifetime -> $84.99 net
- $29.99/year -> $25.49 net
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
    sync.ts               # Sync engine (with tombstones, transaction log)
    purchases.ts          # RevenueCat integration
    growth.ts             # Tree growth calculations (growthLevel, spirit stage, renderAtHours)
    lsystem.ts            # L-system grammar and tree generation (with Ghibli constraints)
    aesthetic.ts          # NEW: Aesthetic Modulation Layer (breaks visual perfection)
    milestones.ts         # NEW: Milestone detection for Year Summary

  hooks/
    useP5Canvas.ts        # NEW: p5.js lifecycle management hook (prevents memory leaks)

  stores/
    useAuthStore.ts       # Auth state
    usePremiumStore.ts    # Premium status, feature-gating logic
    useGardenStore.ts     # Tree/spirit state, growth level, aesthetic profile

  components/
    Garden.tsx            # The garden screen (tree + spirit in single canvas)
    TreeCanvas.tsx        # p5.js React wrapper using useP5Canvas hook
    AnimationTimeline.tsx # NEW: Reusable animation sequencer (for Year Summary)
    LockedOverlay.tsx     # Reusable blur + unlock CTA overlay
    Onboarding.tsx        # Intro flow (3 screens)
    Paywall.tsx           # Purchase screen (dual pricing, A/B variant support)
    Settings.tsx          # Settings screen (with sync status UI)
    AuthModal.tsx         # Sign in/up
    YearSummary.tsx       # "The Tree Remembers" - temporal garden journey
    IntervalBells.tsx     # Sound settings (foreground-only v1.0)

  assets/
    spirit/               # AI-generated spirit PNG sprites (5-10 stages, warm palette)
    sounds/               # Bell/om sounds

.github/
  workflows/
    ci.yml                # NEW: GitHub Actions CI/CD

capacitor.config.ts
ios/                      # Generated by Capacitor
ROADMAP.md               # This document (north star)
```

**Note:** Spirit.tsx removed — Spirit now renders inside TreeCanvas.tsx via p5.image() for visual coherence.

**New dependencies:**
```json
{
  "p5": "^1.9.0",
  "@types/p5": "^1.7.0",
  "@sentry/capacitor": "^0.x.x",
  "@sentry/react": "^7.x.x",
  "posthog-js": "^1.x.x",
  "vitest": "^1.x.x",
  "@testing-library/react": "^14.x.x",
  "@capacitor-community/keep-awake": "^3.x.x"
}
```

**Note:** `react-p5` removed — using custom `useP5Canvas` hook instead for better lifecycle control.

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
  - Enable capability: "Sign in with Apple"
  - VERIFY: App ID appears in list with SIWA enabled

- [ ] **Create Supabase project**
  - Go to supabase.com -> New Project
  - Choose region closest to your users (EU West for Ireland)
  - SAVE THESE VALUES: Project URL, anon public key, service role key
  - VERIFY: Can access Supabase dashboard for your project

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

- [ ] **Create IAP products in App Store Connect**
  - My Apps -> Your App -> In-App Purchases
  - Subscription: Reference Name "Premium Annual", Product ID `premium_annual`, $29.99/year
  - Non-consumable: Reference Name "Premium Lifetime", Product ID `premium_lifetime`, $99.99
  - Submit for review (can take 24-48 hours)
  - VERIFY: Products show "Ready to Submit" or "Approved"

- [ ] **Configure products in RevenueCat**
  - Products -> Add Product (for each IAP)
  - Match Product IDs exactly (case-sensitive)
  - Create Entitlement: "premium"
  - Create Offering: "default" with both products
  - VERIFY: Products show in RevenueCat dashboard with checkmarks

#### Phase 0 - TEST CHECKLIST
Before moving to Phase 1:
- [ ] Can log into Apple Developer account
- [ ] App ID exists with Sign in with Apple enabled
- [ ] Supabase project accessible, credentials saved securely
- [ ] App appears in App Store Connect
- [ ] Banking/tax shows "Active" status
- [ ] RevenueCat shows green checkmarks for both products
- [ ] IAP products approved in App Store Connect

---

### Phase 1: Infrastructure + Auth
**REQUIRES: Phase 0 complete (Apple Developer, Supabase accounts)**

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

- [ ] **Create Supabase tables with RLS**
  - Create `profiles` and `sessions` tables per schema above
  - Enable Row Level Security on both tables
  - VERIFY: SQL executes without errors in Supabase SQL editor

- [ ] **Create explicit RLS policies with tests**
  - Document full SQL for all policies:
    ```sql
    -- profiles: users can only access their own profile
    CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT USING (auth.uid() = id);

    CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);

    -- sessions: users can only access their own sessions
    CREATE POLICY "Users can read own sessions"
    ON sessions FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own sessions"
    ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete own sessions"
    ON sessions FOR DELETE USING (auth.uid() = user_id);
    ```
  - Test: User A cannot read User B's sessions
  - Test: User A cannot insert session with User B's user_id
  - VERIFY: All security tests pass
  - NOTE: RLS misconfiguration = privacy violation = GDPR risk

- [ ] **Add database indexes**
  - `CREATE INDEX idx_sessions_user_time ON sessions(user_id, start_time DESC);`
  - `CREATE INDEX idx_sessions_sync_status ON sessions(user_id, synced_at) WHERE synced_at IS NULL;`
  - VERIFY: Indexes created (check Supabase dashboard)

- [ ] **Configure Supabase Auth for Apple Sign-In**
  - Authentication -> Providers -> Apple
  - Enter Services ID, Team ID, Key ID, Private Key
  - Follow: https://supabase.com/docs/guides/auth/social-login/auth-apple
  - VERIFY: Apple provider shows "Enabled"

- [ ] **Add Supabase client to project**
  - `npm install @supabase/supabase-js`
  - Create `src/lib/supabase.ts` with client initialization
  - Use environment variables for credentials
  - VERIFY: `npm run build` succeeds

- [ ] **Create useAuthStore.ts**
  - Track: user, session, isLoading, isAuthenticated
  - Actions: signInWithApple, signOut, refreshSession
  - Initialize: check existing session on app load
  - VERIFY: Store compiles without TypeScript errors

- [ ] **Implement Apple Sign-In flow**
  - Add sign-in button to Settings (or temporary test location)
  - Use `supabase.auth.signInWithOAuth({ provider: 'apple' })`
  - Handle redirect callback
  - VERIFY: Button appears and can be tapped

- [ ] **Create profile on first sign-in**
  - After successful auth, check if profile exists
  - If not, insert new profile row
  - Set `is_premium: false` initially
  - VERIFY: Profile appears in Supabase profiles table

- [ ] **Add Dexie schema versioning**
  - Include `schemaVersion` field in database design
  - Document migration framework (even if only v1 exists at launch)
  - Pattern: `db.version(1).stores({ sessions: '++id, ...' })`
  - VERIFY: Schema upgrade path documented for future v1.1 changes
  - NOTE: Without this, post-launch schema changes become migration nightmares

#### Phase 1 - TEST CHECKLIST
Before moving to Phase 2:
- [ ] `npm run build` succeeds with no errors
- [ ] `npm run test` passes
- [ ] Timer still works (start/stop meditation)
- [ ] Existing sessions still appear in Stats
- [ ] **Sentry:** Test crash appears in Sentry dashboard
- [ ] **RLS Security:** User A cannot read User B's sessions (test in Supabase)
- [ ] **RLS Security:** User A cannot insert with User B's user_id
- [ ] **Indexes:** idx_sessions_user_time and idx_sessions_sync_status created
- [ ] **Schema:** Dexie versioning documented for future migrations
- [ ] Can tap "Sign in with Apple" button
- [ ] Apple auth sheet appears (in browser/simulator)
- [ ] After signing in:
  - [ ] User appears in Supabase auth.users table
  - [ ] Profile row created in profiles table
  - [ ] is_premium is false
- [ ] Can sign out
- [ ] Can sign in again with same account
- [ ] Session persists after page refresh (if applicable)

**ESCAPE HATCH - If Apple Sign-In won't work:**
- Check bundle ID matches EXACTLY in Supabase config
- Check team ID matches your Apple Developer Team ID
- Try email auth temporarily: `supabase.auth.signUp({ email, password })`
- Consult: https://supabase.com/docs/guides/auth/social-login/auth-apple

---

### Phase 2: Core UI Screens
**REQUIRES: Phase 1 complete (can display logged-in state)**

- [ ] **Install and configure PostHog analytics**
  - `npm install posthog-js`
  - Initialize in App.tsx after Sentry
  - Track core events: `screen_viewed`, `session_started`, `session_completed`
  - VERIFY: Events appear in PostHog dashboard
  - NOTE: RevenueCat only shows what sold, not why. Need funnel visibility for iteration.

- [ ] **Create Onboarding.tsx (3 screens)**
  - Screen 1: "Your meditation companion" - app intro
  - Screen 2: "Track your journey" - what the app does
  - Screen 3: "Get started" - tap to begin
  - Store `hasSeenOnboarding` in localStorage
  - VERIFY: Onboarding appears on first launch only

- [ ] **Create Settings.tsx**
  - Account section: email/sign out (if signed in) or sign in button
  - Sync status indicator (placeholder for now)
  - Premium status display
  - Links: Privacy Policy, Terms of Service
  - Version number at bottom
  - VERIFY: Settings accessible from Stats screen

- [ ] **Create AuthModal.tsx**
  - Modal/overlay that slides up
  - "Sign in with Apple" button
  - "Why sign in?" explanation text
  - Close button
  - VERIFY: Modal appears when triggered, can close

- [ ] **Add navigation to new screens**
  - Settings: gear icon on Stats screen -> Settings
  - Onboarding: shows before Timer on first launch
  - AuthModal: triggered from Settings or after purchase
  - VERIFY: All navigation paths work

- [ ] **Add LockedOverlay.tsx component**
  - Reusable component for locked features
  - Blurred background
  - Message + "Unlock" CTA button
  - VERIFY: Component renders correctly in isolation

#### Phase 2 - TEST CHECKLIST
Before moving to Phase 3:
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Timer still works
- [ ] **PostHog:** Test events appear in dashboard
- [ ] **PostHog:** screen_viewed fires on navigation
- [ ] Onboarding shows on first launch (clear localStorage to test)
- [ ] Onboarding does NOT show on subsequent launches
- [ ] Can navigate: Timer -> Stats -> Settings
- [ ] Can navigate back from Settings
- [ ] Settings shows sign-in button when logged out
- [ ] Settings shows account info when logged in
- [ ] AuthModal opens and closes correctly
- [ ] LockedOverlay renders with blur and CTA

---

### Phase 3: Paywall + Monetization
**REQUIRES: Phase 0 complete (RevenueCat configured), Phase 2 complete (UI shell)**

- [ ] **Install RevenueCat SDK**
  - `npm install @revenuecat/purchases-capacitor` (for Capacitor)
  - OR use web SDK for initial testing: `npm install @revenuecat/purchases-js`
  - VERIFY: Package installed, no dependency errors

- [ ] **Create src/lib/purchases.ts**
  - Initialize RevenueCat with API key
  - Functions: getOfferings, purchasePackage, restorePurchases
  - Handle purchase success/failure callbacks
  - VERIFY: File compiles without errors

- [ ] **Create usePremiumStore.ts**
  - Track: isPremium, premiumType ('annual' | 'lifetime' | null)
  - Actions: checkPremiumStatus, setPremiumStatus
  - Initialize: check RevenueCat subscription status on app load
  - Sync with Supabase profile (if logged in)
  - VERIFY: Store compiles, isPremium defaults to false

- [ ] **Create Paywall.tsx (with A/B variant support)**
  - Two pricing cards: Annual ($29.99) and Lifetime ($99.99)
  - Annual marked as "Best Value"
  - Purchase buttons trigger RevenueCat
  - "Restore Purchases" link at bottom
  - "Maybe later" dismiss option
  - **A/B Support:** Component accepts `variant` prop for future testing
  - **Analytics:** Track `paywall_viewed`, `purchase_initiated`, `purchase_completed`, `purchase_failed`
  - VERIFY: Paywall renders correctly with both options
  - VERIFY: Variant prop works, analytics fire correctly
  - NOTE: Paywall design has outsized impact on conversion. Build for experimentation from day 1.

- [ ] **Implement feature-gate checks**
  - Create helper: `isPremiumFeature(feature: string): boolean`
  - Gate: Calendar (full view), Garden, Year Summary, Sync, Bells, Export
  - When non-premium user accesses gated feature -> show Paywall
  - VERIFY: Tapping locked feature shows Paywall

- [ ] **Handle purchase completion**
  - On successful purchase: update usePremiumStore
  - Update Supabase profile (if logged in)
  - Dismiss Paywall, show success feedback
  - Prompt for sign-in (for sync) if not already signed in
  - VERIFY: Purchase flow completes (use sandbox account)

#### Phase 3 - TEST CHECKLIST
Before moving to Phase 4:
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Timer still works
- [ ] Paywall appears when tapping locked feature
- [ ] Both pricing options display correctly
- [ ] Can dismiss Paywall with "Maybe later"
- [ ] "Restore Purchases" button is present
- [ ] **A/B Variants:** Paywall accepts variant prop correctly
- [ ] **Analytics Funnel:** (check in PostHog)
  - [ ] `paywall_viewed` fires when paywall opens
  - [ ] `purchase_initiated` fires when user taps buy
  - [ ] `purchase_completed` fires on success
  - [ ] `purchase_failed` fires on failure/cancel
- [ ] **Sandbox testing (requires TestFlight or device):**
  - [ ] Can complete test purchase (annual)
  - [ ] Can complete test purchase (lifetime)
  - [ ] After purchase, locked features unlock
  - [ ] Restore Purchases works after reinstall
  - [ ] Premium status persists after app restart

**ESCAPE HATCH - If "Invalid Product ID" error:**
- Product IDs are case-sensitive: check exact match
- Products need Apple review: wait 24-48 hours after creating
- Check RevenueCat dashboard for product fetch errors
- Use RevenueCat debug logs: `Purchases.setDebugLogsEnabled(true)`

---

### Phase 4: Design System (Ghibli)
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

#### Phase 4 - TEST CHECKLIST
Before moving to Phase 5:
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

### Phase 5a: Garden Foundation (Math & Logic)
**REQUIRES: Phase 1 complete (have session data to calculate from)**

> **CRITICAL: The Garden is the premium feature driving conversion. If growth feels imperceptible, users won't feel the emotional payoff. Build and validate before integrating.**

- [ ] **Create standalone Garden prototype BEFORE main integration**
  - Plain HTML + p5.js file, separate from React codebase
  - Demonstrate tree at 10, 50, 100, 250, 500, 1000, 2500, 5000, 10000 hours
  - Side-by-side comparison at adjacent states (e.g., 247 vs 253 hours)
  - Include post-session growth animation mockup
  - VERIFY: Prototype feels visually distinct at each milestone
  - VERIFY: Adjacent hour counts show emotional (not just numerical) difference
  - **ESCAPE HATCH:** If prototype doesn't feel magical at 1-week mark, pivot to hybrid/milestone approach (50-100 hand-crafted stages with interpolation)

- [ ] **Install p5 dependencies**
  - `npm install p5 @types/p5`
  - Build custom wrapper (more control than react-p5)
  - VERIFY: Packages install without errors, `npm run build` succeeds

- [ ] **Create src/lib/growth.ts**
  - `calculateGrowthLevel(totalHours: number): number` → 0.0 to 1.0
  - `getSpiritStage(totalHours: number): SpiritStage` → enum of stages
  - `getGrowthRate(totalHours: number): number` → changes per hour
  - `renderAtHours(hours: number): TreeParams` → for Year Summary rewind
  - VERIFY: Functions return expected values for test inputs

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
  - NOTE: This creates *character*. The math grows the tree; the aesthetic layer gives it a soul.

- [ ] **Create src/lib/lsystem.ts (with Ghibli constraints)**
  - L-system grammar: axiom, rules, angle, iterations
  - `generateTree(growthLevel: number, aesthetic: AestheticProfile): TreeData`
  - Deterministic: use `randomSeed(totalHours)` for consistent trees
  - **Ghibli constraints:**
    - Break symmetry: asymmetric angle offsets per branch depth
    - Limit iteration visibility: hide structural changes behind animation
    - Favor fewer, heavier branches after 50% growth (Ghibli trees feel weighted, not fractal)
  - VERIFY: Trees feel weighted and organic, not mathematically perfect

- [ ] **Create milestone calculation functions**
  - `calculateMilestones(sessions: Session[]): Milestone[]`
  - Detect: first sit of year, deepest sit, longest streak, seasonal totals
  - Pure functions, independently testable (needed for Year Summary)
  - VERIFY: Correct milestones returned for test data

- [ ] **Create src/stores/useGardenStore.ts**
  - Track: growthLevel, spiritStage, aestheticProfile, isAnimating
  - Derive growthLevel from useSessionStore.totalSeconds
  - Load/create aestheticProfile on init
  - VERIFY: Store updates when session count changes

- [ ] **Add unit tests for growth calculations**
  - Test growth.ts: `calculateGrowthLevel`, `getSpiritStage`, `renderAtHours`
  - Test lsystem.ts: determinism (same hours + same seed → same tree structure)
  - Test aesthetic.ts: seed-based consistency
  - Test milestones.ts: correct detection of streaks, deep sits, etc.
  - VERIFY: All tests pass (`npm run test`)

#### Phase 5a - TEST CHECKLIST
Before moving to Phase 5b:
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Timer still works
- [ ] **Prototype:** Standalone p5.js demo shows visually distinct trees at key milestones
- [ ] **Prototype:** Adjacent hours (e.g., 247 vs 253) feel emotionally different
- [ ] p5 imported without errors
- [ ] growth.ts: `calculateGrowthLevel(0)` returns 0
- [ ] growth.ts: `calculateGrowthLevel(10000)` returns 1
- [ ] growth.ts: `calculateGrowthLevel(50)` returns ~0.005
- [ ] growth.ts: `renderAtHours(n)` works for Year Summary needs
- [ ] aesthetic.ts: creates varied but bounded profiles from different seeds
- [ ] lsystem.ts: generates tree data without errors
- [ ] lsystem.ts: same hours + same seed produces same tree (deterministic)
- [ ] lsystem.ts: trees feel weighted and asymmetric (not fractal-perfect)
- [ ] milestones.ts: correctly detects first sit, deepest sit, longest streak
- [ ] useGardenStore reflects correct growth level from session data

---

### Phase 5b: Garden Rendering (Visual)
**REQUIRES: Phase 5a complete (growth calculations, L-system logic, aesthetic layer)**

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
  - Disable React StrictMode during p5 development to avoid double-invoke confusion
  - VERIFY: Navigate to Garden 10 times — memory does not grow
  - NOTE: Memory leaks from orphaned canvas instances will destroy the meditative feel.

- [ ] **Create TreeCanvas.tsx (p5.js wrapper)**
  - Use `useP5Canvas` hook for lifecycle management
  - Render tree from L-system data + aesthetic profile
  - Accept `growthLevel` and `aestheticProfile` props
  - Handle resize events
  - VERIFY: Basic tree renders on screen

- [ ] **Add memory profiling to development workflow**
  - Use browser DevTools Memory tab
  - Baseline → navigate to Garden → leave → return (10x) → compare
  - VERIFY: No significant memory growth
  - Add to CI if possible (performance regression prevention)

- [ ] **Implement noise-based idle breathing (per Ghibli addendum)**
  - Use `p5.noise()` — NOT sine waves (sine creates mechanical loops)
  - Period: 6-12 seconds (never perfectly looping)
  - Amplitude decreases as tree matures (older trees are calmer)
  - ```typescript
    const sway = p.noise(p.frameCount * 0.001) * maturityFactor;
    ```
  - VERIFY: Tree feels alive but not mechanical

- [ ] **Implement stillness budget**
  - At least 20-30% of idle frames should have zero visible motion
  - This is essential for calm and presence
  - VERIFY: Periods of stillness are observable (not constant movement)

- [ ] **Add color/texture enhancements**
  - Warm-biased palette only (no pure greens)
  - Hue drifts warmer/duskier with age (older = warmer)
  - Light grain/noise overlay via p5 (<3% opacity)
  - VERIFY: Digital flatness removed, feels hand-painted

- [ ] **Create AnimationTimeline component**
  - Reusable component for sequencing multiple animations
  - Supports pause/play/seek (needed for Year Summary)
  - ```typescript
    interface TimelineStep {
      duration: number;
      onEnter: () => void;
      onProgress: (t: number) => void;
      onExit: () => void;
    }
    ```
  - VERIFY: Can sequence simple test animations

- [ ] **Render tree at multiple growth levels**
  - Test: growthLevel 0.1, 0.5, 0.9
  - Tree should look emotionally different at each level (not just numerically)
  - VERIFY: Visual difference between growth stages

- [ ] **Add color variations based on growth**
  - Young tree: lighter, brighter greens, thin branches
  - Mature tree: deeper, warmer colors, thicker trunk
  - VERIFY: Color changes are visible between stages

#### Phase 5b - TEST CHECKLIST
Before moving to Phase 5c:
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Timer still works
- [ ] **Memory:** Stable after 10 Garden navigations (no leaks)
- [ ] TreeCanvas renders a tree on screen
- [ ] Tree visually changes at different growth levels
- [ ] **Idle Motion:** Noise-based, not looping (test by watching for 60+ seconds)
- [ ] **Stillness:** 20-30% of frames have zero visible motion
- [ ] **Color:** Palette is warm-biased
- [ ] **Texture:** Grain overlay subtle but present
- [ ] AnimationTimeline component can sequence test animations
- [ ] No console errors from p5.js
- [ ] Canvas resizes correctly on window resize

**Visual Quality Tests (Ghibli criteria):**
- [ ] Adjacent growth levels feel emotionally different
- [ ] Tree looks alive even when not changing
- [ ] Older trees move less than younger ones

**Anti-Pattern Check (reject if present):**
- [ ] No perfect symmetry in tree structure
- [ ] No continuous motion everywhere (stillness budget enforced)
- [ ] No noticeable animation loops (noise-based motion)
- [ ] No instant visual feedback to numeric change

**ESCAPE HATCH - If p5.js won't render:**
- Check browser console for errors
- Test p5.js in standalone HTML file first (outside React)
- Ensure instance mode setup: `new p5((p) => { ... }, containerRef)`
- Try simpler canvas drawing first, then add L-system complexity
- Reference: https://shivanshbakshi.dev/blog/p5-react/integrate-p5-with-react/

---

### Phase 5c: Garden Integration (Full Feature)
**REQUIRES: Phase 5b complete (tree renders), Phase 3 complete (premium gating)**

- [ ] **Generate Spirit PNG sprites**
  - AI-generate 5-6 evolution stages
  - Formats: idle, happy, looking up
  - **Match color temperature to tree output** (same warm palette)
  - Place in `src/assets/spirit/`
  - VERIFY: Images load correctly
  - VERIFY: Colors feel cohesive with tree

- [ ] **Render Spirit inside p5 canvas (preferred approach)**
  - Use `p.image()` for sprite rendering within TreeCanvas
  - Sync idle rhythm with tree noise clock (same timing source)
  - Match color temperature to tree output
  - Position relative to tree base
  - Animation: blinking, breathing, shifting weight (via sprite switching or subtle transforms)
  - VERIFY: Spirit feels part of tree world, not overlaid
  - NOTE: Two rendering contexts (canvas + CSS) create visual disconnect. Single context = visual coherence.

- [ ] **Create Garden.tsx screen**
  - Full-screen tree + spirit (both in same canvas)
  - Display user's growth level
  - Handle premium vs free state
  - VERIFY: Garden screen renders correctly

- [ ] **Visual coherence check**
  - Spirit and tree share:
    - Color palette/warmth
    - Animation timing (synced noise clocks)
    - Atmospheric effects
  - VERIFY: Garden feels like unified, breathing world
  - **Anti-pattern:** Spirit should NOT look like "sticker placed on painting"

- [ ] **Implement locked overlay for free users**
  - Use LockedOverlay component from Phase 2
  - Tree + Spirit render but blurred
  - "Your garden awaits" + unlock CTA
  - VERIFY: Free users see blur + unlock prompt

- [ ] **Add Garden to navigation**
  - Position: after Calendar in navigation flow
  - Swipe from Calendar → Garden
  - Or direct link from Stats
  - VERIFY: Can navigate to Garden

- [ ] **Add post-session growth animation**
  - Order of reveal (per Ghibli addendum):
    1. Environmental cue (light, warmth) — animate first
    2. Leaf/branch response — animate second
    3. Structural settle — animate third
    4. Return to stillness — never animate geometry first
  - Golden light ripple effect
  - Spirit reacts with joy
  - New growth appears
  - VERIFY: Animation plays after completing a session
  - VERIFY: Growth is *revealed*, not *shown* (environment leads)

#### Phase 5c - TEST CHECKLIST
Before moving to Phase 6:
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Timer still works
- [ ] Garden screen accessible via navigation
- [ ] Tree renders at correct growth level
- [ ] **Spirit renders inside p5 canvas** (not CSS overlay)
- [ ] **Spirit rhythm synced with tree** (same noise clock)
- [ ] **Visual coherence achieved** (no "sticker on painting" effect)
- [ ] **Free user experience:**
  - [ ] Tree is blurred
  - [ ] Spirit visible as shadow/silhouette through blur
  - [ ] "Your garden awaits" message shows
  - [ ] Tapping unlock shows Paywall
- [ ] **Premium user experience:**
  - [ ] Tree is clear, not blurred
  - [ ] Full interaction available
- [ ] Post-session growth animation works
- [ ] Post-session animation order: environment → leaf → structure → stillness
- [ ] Garden shows correct hours ("You've grown X hours")

---

### Phase 6: Sync Engine
**REQUIRES: Phase 1 complete (Supabase auth + tables), Phase 3 complete (user may be premium)**
**NOTE: This is the hardest phase. Work incrementally. Test thoroughly.**

#### Phase 6a: One-Way Sync (Local -> Cloud)

> **CRITICAL: Sync bugs cause data loss. Data loss in a meditation tracking app destroys the entire value proposition (the tree IS the accumulated sessions). Test exhaustively.**

- [ ] **Extend Dexie schema with sync fields**
  - Add to sessions: `syncedAt`, `needsSync`
  - **Add `deleted_at` column** (TIMESTAMPTZ) for tombstones
  - Create SyncQueue table for pending uploads
  - VERIFY: Database migration runs without errors

- [ ] **Implement tombstone mechanism for deletes**
  - NEVER hard-delete locally
  - Mark `deleted_at` timestamp instead
  - Sync tombstones to cloud
  - Prune tombstones after 30 days
  - VERIFY: Deleted sessions have tombstones, not hard deletes
  - NOTE: This handles edit-vs-delete conflicts gracefully

- [ ] **Ensure idempotent sync operations**
  - All sync operations must be safe to retry
  - Use UPSERT semantics (not INSERT)
  - VERIFY: Same sync operation twice doesn't create duplicates

- [ ] **Create sync queue mechanism**
  - On session save, add to SyncQueue
  - Queue persists across app restarts
  - VERIFY: New sessions appear in SyncQueue

- [ ] **Add sync transaction log**
  - Record every sync operation with before/after state
  - Essential for debugging production issues
  - VERIFY: Log captures sync activity
  - NOTE: When sync bugs happen in production, this log is how you debug them

- [ ] **Implement push sync**
  - Background job processes SyncQueue
  - Uploads sessions to Supabase
  - Marks as synced on success
  - VERIFY: Session appears in Supabase within 30 seconds

- [ ] **Handle offline gracefully**
  - If offline, queue grows
  - When online, process queue
  - Implement sync pause/resume (if network drops mid-sync, resume where left off)
  - VERIFY: Sessions sync after coming back online

#### Phase 6a - TEST CHECKLIST
- [ ] Complete meditation session while signed in
- [ ] Check Supabase: session appears in sessions table
- [ ] Complete session while offline
- [ ] Go online: session syncs automatically
- [ ] SyncQueue is empty after successful sync
- [ ] **Tombstones:** Deleted sessions have `deleted_at` set (not hard-deleted)
- [ ] **Idempotent:** Same sync operation twice doesn't create duplicates
- [ ] **Transaction log:** Sync activity captured

#### Phase 6b: Cloud Pull (Initial Sync)

- [ ] **Implement pull sync on sign-in**
  - Fetch all sessions from Supabase for user
  - Merge with local sessions
  - Deduplicate by UUID
  - VERIFY: Cloud sessions appear locally after sign-in

- [ ] **Handle first-time sign-in on new device**
  - No local sessions yet
  - Pull all from cloud
  - VERIFY: All sessions appear on new device

- [ ] **Handle sign-in with existing local data**
  - Merge cloud + local
  - Avoid duplicates
  - VERIFY: No duplicate sessions after merge

#### Phase 6b - TEST CHECKLIST
- [ ] Sign in on new browser/device
- [ ] All previous sessions appear
- [ ] Hours total matches what you had before
- [ ] No duplicate sessions in list
- [ ] Stats/Calendar show complete history

#### Phase 6c: Conflict Resolution & Verification

- [ ] **Implement conflict detection**
  - Same client_uuid, different data
  - Compare timestamps
  - VERIFY: Conflicts are detected

- [ ] **Implement last-write-wins**
  - Server timestamp takes precedence
  - Update local with server data
  - VERIFY: Conflict resolves to server version

- [ ] **Implement data integrity verification**
  - Sum of local session durations should match cloud
  - Run after every sync completes
  - Alert if mismatch detected (log + optional user notification)
  - VERIFY: Integrity check runs and catches discrepancies

- [ ] **Add explicit sync status UI**
  - Display in Settings: "Synced", "Syncing...", "Offline", "Error"
  - Last sync timestamp
  - **Manual "Sync Now" button** (fallback for user control)
  - VERIFY: Status accurately reflects sync state
  - NOTE: Users should feel in control of their data

- [ ] **Add comprehensive sync edge case tests**
  - Edit session on device A offline, edit same on device B online, both sync
  - Delete on device A, edit on device B, both sync (tombstone wins)
  - Network drops mid-sync (partial sync recovery)
  - Clock drift between devices (server timestamp wins)
  - User reinstalls app, sync pulls 500 sessions (progress indicator?)
  - VERIFY: All edge cases pass without data loss

- [ ] **Add unit tests for sync logic**
  - Test conflict resolution logic
  - Test tombstone handling
  - Test idempotent operations
  - VERIFY: All tests pass

#### Phase 6c - TEST CHECKLIST
Before moving to Phase 7:
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Timer still works
- [ ] All sessions sync to Supabase
- [ ] New device shows all sessions after sign-in
- [ ] Offline sessions sync when back online
- [ ] No duplicate sessions ever created
- [ ] **Tombstones:** Deleted sessions sync correctly
- [ ] **Idempotent:** Retry-safe operations
- [ ] **Integrity:** Data verification runs after sync
- [ ] **Sync UI:** Status accurately reflects state
- [ ] **Sync UI:** Manual "Sync Now" button works
- [ ] **Edge case:** offline edit + online edit = no data loss
- [ ] **Edge case:** delete vs edit conflict = resolved predictably (tombstone wins)
- [ ] **Edge case:** partial sync recovers when network returns
- [ ] **Edge case:** clock drift = server timestamp wins

**ESCAPE HATCH - If sync has bugs:**
- Add extensive console.log for debugging
- Check Supabase dashboard for actual data
- Check sync transaction log for what happened
- Temporarily disable two-way sync, use one-way only
- Consider: manual export/import JSON as fallback

---

### Phase 7: Year Summary (The Tree Remembers)
**REQUIRES: Phase 5c complete (Garden renders), Phase 6 complete (have sync data)**

> **APPROACH: Full animated version with explicit fallback safety net.** The animated Year Summary is the target. Components built for animation (AnimationTimeline, `renderAtHours`) already exist from Phase 5a/5b and serve the Garden anyway — effort is not wasted if we need to fallback.

**Prerequisite work already complete:**
- Phase 5a: `calculateMilestones()` functions, `renderAtHours(n)` capability
- Phase 5b: `AnimationTimeline` component, noise-based motion system
- Phase 5c: Spirit sprite rendering in p5 canvas

- [ ] **Implement tree rewind animation**
  - Use `renderAtHours(n)` from growth.ts
  - Use `AnimationTimeline` for sequencing
  - Animate from current state → seed (un-growth)
  - Smooth interpolation over ~5 seconds
  - VERIFY: Tree shrinks back organically, feels natural

- [ ] **Create YearSummary.tsx (Full Animated Version)**
  - Full-screen temporal journey through the tree
  - Sequence: Now → Rewind → January → Growth → Now → Horizon
  - Auto-advance with 8-10s per moment
  - Swipe-to-advance available but not prompted
  - Total duration: ~60-90 seconds
  - VERIFY: Full sequence plays smoothly

- [ ] **Detect and display key moments (using Phase 5a functions)**
  - First sit of the year
  - Deepest sit (date + duration)
  - Longest streak (count + dates)
  - Total hours for year
  - VERIFY: Moments detected correctly from test data

- [ ] **Add environment/lighting changes**
  - January: cool tones, bare branches
  - Spring: warmer light, new growth
  - Summer: full, bright, lush
  - Fall: golden, settling
  - VERIFY: Seasonal progression visible during replay

- [ ] **Add Spirit reactions at milestones**
  - Happy at first sit
  - Proud at streak
  - Serene at year end
  - Uses existing Spirit rendering in p5 canvas (Phase 5c)
  - VERIFY: Spirit responds at appropriate moments

- [ ] **Handle edge cases**
  - User started in December (2 weeks of data) → shorter but meaningful journey
  - User has 0 sessions this year → encouraging message, no tree shown
  - User has only 1 session → celebrate the beginning
  - VERIFY: All edge cases feel intentional, not broken

- [ ] **Implement blurred mode for free users**
  - Same animated sequence, tree blurred throughout
  - Spirit as shadow/outline
  - Data text still shows (hours, moments)
  - Ends with: "Unlock your garden to see what you've grown"
  - VERIFY: Free users see enticing blur

- [ ] **Add "Save your tree" export**
  - Button at end of sequence
  - Generates image of tree at year-end state (no stats overlay)
  - Share sheet integration
  - VERIFY: Export produces shareable image

#### FALLBACK PLAN (if animation proves too complex)
**Decision point: If stuck on animation for >5 days, pivot to static version**

Static version (fallback):
- Full-screen summary with key stats (total hours, sessions, first sit, longest streak, deepest sit)
- Tree image at year-end state (static, not animated)
- "Save your tree" export button
- Blur mode for free users

Animated version becomes v1.1 feature if fallback is triggered.

#### Phase 7 - TEST CHECKLIST
Before moving to Phase 8:
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Timer still works
- [ ] Year Summary accessible from Settings
- [ ] Full animated sequence plays (Now → Rewind → Growth → Now → Horizon)
- [ ] Key moments detected and displayed correctly
- [ ] Seasonal lighting changes visible
- [ ] Spirit reacts at milestones
- [ ] Free users see blurred version with unlock CTA
- [ ] Premium users see clear animated version
- [ ] **Edge case:** 0 sessions handled gracefully
- [ ] **Edge case:** 1 session handled gracefully
- [ ] **Edge case:** December start (2 weeks data) handled gracefully
- [ ] Export generates shareable tree image
- [ ] Total duration ~60-90 seconds
- [ ] Swipe-to-advance works
- [ ] **Performance:** Acceptable on iPhone 8 equivalent (no lag during replay)

---

### Phase 8: Enhancements
**REQUIRES: Phase 7 complete (core features done)**

- [ ] **Apple Health integration**
  - Add HealthKit capability in Xcode
  - Request mindfulness write permission
  - Sync sessions as mindfulness minutes
  - VERIFY: Sessions appear in Health app

- [ ] **Interval bells (foreground-only for v1.0)**
  - Add bell sound files to assets
  - Settings UI for intervals (15, 30, 60 min)
  - Play bell during meditation (while app is in foreground)
  - **Clear UI indication:** "Bells play when app is in foreground"
  - VERIFY: Bell sounds at configured intervals (foreground)
  - NOTE: iOS background audio is complex. Ship foreground-only v1.0, add background support v1.1 after testing.

- [ ] **Dark mode support**
  - Adapt Ghibli palette for dark
  - Respect system preference
  - Toggle in Settings
  - VERIFY: Dark mode looks good, not harsh

- [ ] **Data export**
  - Export sessions as JSON/CSV
  - Share sheet integration
  - Premium-only feature
  - VERIFY: Export produces valid file

#### Phase 8 - TEST CHECKLIST
Before moving to Phase 9:
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Timer still works
- [ ] Apple Health shows meditation data (requires device)
- [ ] **Interval bells:** Work during session (foreground)
- [ ] **Interval bells:** UI clearly indicates "foreground only" limitation
- [ ] Dark mode toggle works
- [ ] Dark mode preserves Ghibli feel
- [ ] Export creates downloadable file
- [ ] All enhancements are premium-gated correctly

---

### Phase 9: Capacitor & iOS
**REQUIRES: Phase 8 complete (feature-complete)**

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

- [ ] **Configure audio session (foreground bells)**
  - Set audio category in iOS native code (AppDelegate.swift or via plugin)
  - ```swift
    try AVAudioSession.sharedInstance().setCategory(
        .playback, mode: .default, options: [.mixWithOthers]
    )
    ```
  - VERIFY: Bells play reliably while app is in foreground

- [ ] **Generate iOS project**
  - `npm run build && npx cap add ios`
  - VERIFY: `ios/` folder created

- [ ] **Configure iOS capabilities**
  - Open in Xcode: `npx cap open ios`
  - Add capabilities: Sign in with Apple, HealthKit
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

#### Phase 9 - TEST CHECKLIST
Before moving to Phase 10:
- [ ] App builds and runs on iOS simulator
- [ ] App builds and runs on physical iPhone
- [ ] App icon displays correctly
- [ ] Splash screen shows on launch
- [ ] Sign in with Apple works on device
- [ ] In-App Purchase works on device (sandbox)
- [ ] Timer works correctly
- [ ] Garden renders correctly
- [ ] Haptic feedback fires appropriately
- [ ] No crashes in 30 minutes of use
- [ ] **Keep-awake:** Screen stays on during 35+ minute meditation
- [ ] **Lifecycle:** Timer survives: start session → switch to Safari → wait 5 min → return
- [ ] **Lifecycle:** Timer survives: start session → lock phone → wait 5 min → unlock
- [ ] **Lifecycle:** Incomplete session recovery works after force quit
- [ ] **Audio:** Interval bells play in foreground
- [ ] **CI/CD:** GitHub Actions runs on PR
- [ ] **CI/CD:** TestFlight upload automation functional

---

### Phase 10: Launch Preparation
**REQUIRES: Phase 9 complete (app runs on device)**

- [ ] **Write Privacy Policy**
  - What data is collected
  - How it's stored (Supabase, local)
  - No selling of data
  - Host on simple webpage
  - VERIFY: URL accessible, content accurate

- [ ] **Write Terms of Service**
  - Usage terms
  - Subscription terms
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
  - Test Year Summary animation performance
  - Check memory usage during extended sessions
  - VERIFY: No lag or memory issues on older devices
  - NOTE: iPhone 8 should still run smoothly. Many users have older devices.

- [ ] **TestFlight beta**
  - Upload build to App Store Connect
  - Invite 5-10 beta testers
  - Collect feedback for 1-2 weeks
  - **Beta focus areas:** Sync reliability, Year Summary edge cases, Garden performance
  - VERIFY: Beta testers can install and use app

- [ ] **Submit for App Store review**
  - Complete all metadata
  - Answer review questions
  - Submit and wait (1-3 days typical)
  - VERIFY: Status changes to "In Review"

#### Phase 10 - TEST CHECKLIST
Before launch:
- [ ] Privacy Policy URL works
- [ ] Terms of Service URL works
- [ ] App Store listing is complete
- [ ] All screenshots uploaded
- [ ] **Performance:** Garden renders smoothly on iPhone 8 equivalent
- [ ] **Performance:** Year Summary plays without lag on iPhone 8 equivalent
- [ ] **Performance:** No memory issues in 30+ minute sessions
- [ ] TestFlight build works for testers
- [ ] All critical bugs from beta addressed
- [ ] App submitted for review
- [ ] App APPROVED (status: Ready for Sale)

---

### Phase 11: Post-Launch
**After App Store approval**

- [ ] **Monitor first-week metrics**
  - RevenueCat: conversion rate, revenue
  - PostHog: funnel analysis (screen views → paywall → purchase)
  - Sentry: crash reports (should be zero)
  - App Store: downloads, ratings
  - VERIFY: Dashboard access, data flowing

- [ ] **Track actual conversion rate against projections**
  - Compare to 2%, 3.5%, 5% scenarios
  - If below 2%: paywall needs iteration
  - If above 5%: consider price optimization
  - VERIFY: Conversion rate documented and actionable

- [ ] **Respond to reviews**
  - Thank positive reviewers
  - Address concerns constructively
  - Note feature requests
  - VERIFY: All reviews acknowledged within 48 hours

- [ ] **Plan v1.1 features (prioritized based on data)**
  - **If Year Summary was fallback:** Full animation
  - **High-priority:** Background audio for interval bells
  - **High-priority:** Paywall A/B testing (RevenueCat built-in)
  - **Medium-priority:** Widget support
  - **Medium-priority:** Milestone shareable cards
  - **Low-priority:** Tree art upgrade (Rive/Lottie)
  - **Low-priority:** Seasonal environment variations
  - VERIFY: Prioritized list created based on actual user data

---

## Settings Screen Structure

```
+-------------------------------------+
|  <-                       Settings   |
+-------------------------------------+
|                                     |
|  ACCOUNT                            |
|  +-----------------------------+    |
|  | jack@email.com              |    |
|  | Sign Out                    |    |
|  +-----------------------------+    |
|                                     |
|  SYNC                               |
|  +-----------------------------+    |
|  | * Synced (2 min ago)        |    |
|  +-----------------------------+    |
|                                     |
|  MEDITATION                         |
|  +-----------------------------+    |
|  | Interval bells        [off] |    |
|  | Sound              [bell v] |    |
|  | Intervals     [15,30,60 v]  |    |
|  +-----------------------------+    |
|                                     |
|  DATA                               |
|  +-----------------------------+    |
|  | Apple Health sync     [on]  |    |
|  | Export sessions          -> |    |
|  | View 2025 Summary        -> |    |
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
| **Supabase** | Users, database metrics |
| **App Store Connect** | Downloads, ratings, revenue |

---

## Complexity & Risk Assessment

| Component | Difficulty | Risk | Mitigation | Updated Notes |
|-----------|------------|------|------------|---------------|
| Supabase setup | Low | Low | Follow docs | +RLS tests, +indexes |
| Apple Sign-In | Medium | Medium | Test early, check IDs | No change |
| Sync engine | **High** | **High** | Build incrementally, test exhaustively | +Tombstones, +idempotent ops, +transaction log, +integrity checks |
| RevenueCat | Medium | Medium | Sandbox test, check product IDs | +A/B variant support |
| Garden (p5.js) | **High** | **Medium** | Build standalone prototype first | +Aesthetic layer, +useP5Canvas hook, +memory profiling reduces risk |
| Year Summary | **High** | **Medium** | Prerequisite work in Phase 5, explicit fallback | Was High→Medium with animation foundation in Phase 5 |
| iOS Platform | Medium | **Low** | Keep-awake + lifecycle handling | Was Medium→Low with explicit handling |
| Capacitor | Low-Medium | Low | Standard config | +CI/CD |

**Risk Monitoring Triggers:**
| Risk | Early Warning Sign | Response |
|------|-------------------|----------|
| Garden visual quality | Prototype doesn't feel magical at 1-week mark | Pivot to hybrid/milestone approach |
| Sync bugs | Edge cases keep appearing through Phase 6c | Simplify to explicit sync for v1.0 |
| Year Summary complexity | Still debugging animation at >5 days in Phase 7 | Ship static version, animate in v1.1 |
| Performance issues | Lag/memory issues in Phase 5b testing | Reduce canvas complexity, consider Rive |
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
