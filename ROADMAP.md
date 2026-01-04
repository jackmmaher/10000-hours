# 10,000 Hours - iOS Commercialization Roadmap

## Vision

Transform the minimalist meditation timer PWA into a commercially viable iOS app while preserving its zen philosophy. The app's restraint IS the product - we enhance without bloating.

**Core additions:**
- Frictionless trial → $6.99 one-time purchase
- Cloud sync via Supabase
- The Garden: A living, growing tree that visualizes your meditation journey
- Year-end summary (Spotify Wrapped style)

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

| Screen | Purpose | Access |
|--------|---------|--------|
| **Timer** | Meditation (home) | App launch |
| **Stats** | Analytics, milestones | Swipe up from Timer |
| **Calendar** | History, heatmap | Swipe from Stats |
| **Garden** | Living tree visualization | Swipe from Calendar |
| **Settings** | Account, sync, sounds | ⚙️ icon on Stats |
| **Onboarding** | First-time intro | Auto on first launch |
| **Paywall** | Purchase prompt | Auto at trial end |
| **Auth Modal** | Sign in/up | From Paywall or Settings |
| **Year Summary** | Annual review | January auto + Settings |

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

**MVP:** Layered SVG with CSS animations, 50 growth states
**V2:** Rive/Lottie with state machines, full 1000 states

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

### Pricing

| Product | Price | Type |
|---------|-------|------|
| Lifetime Premium | $6.99 | Non-consumable IAP |
| Small Tip | $2.99 | Consumable |
| Medium Tip | $5.99 | Consumable |
| Large Tip | $9.99 | Consumable |

### Trial Flow

1. **No signup to start** - Zero friction
2. **Sessions stored locally** - Investment builds
3. **After 5 sessions OR 7 days** - Soft paywall
4. **2 grace sessions** - Reduces pressure
5. **On purchase** - Prompt for account
6. **Local data migrates** - No progress lost

### Economics

- Apple takes 30%: $6.99 → $4.89 net
- Break-even: ~23 sales/year
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
  purchase_date TIMESTAMPTZ,
  has_reached_enlightenment BOOLEAN DEFAULT FALSE,
  trial_started_at TIMESTAMPTZ,
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
| `src/lib/db.ts` | Add sync fields, SyncQueue table, trial tracking |
| `src/stores/useSessionStore.ts` | Add auth/trial state, sync triggers |
| `src/App.tsx` | Add Garden route, auth provider, new screen routing |
| `src/components/Timer.tsx` | Paywall check, post-session Garden prompt |
| `src/components/Stats.tsx` | Settings gear icon |
| `src/lib/constants.ts` | Trial thresholds, growth rate constants |
| `package.json` | New dependencies |

## New Files to Create

```
src/
  lib/
    supabase.ts           # Supabase client init
    sync.ts               # Sync engine
    purchases.ts          # RevenueCat integration
    growth.ts             # Tree growth calculations

  stores/
    useAuthStore.ts       # Auth state
    useGardenStore.ts     # Tree/spirit state

  components/
    Garden.tsx            # The tree screen
    TreeVisualization.tsx # SVG tree + animations
    Spirit.tsx            # Spirit companion
    Onboarding.tsx        # Intro flow
    Paywall.tsx           # Purchase screen
    Settings.tsx          # Settings screen
    AuthModal.tsx         # Sign in/up
    YearSummary.tsx       # Wrapped-style summary
    IntervalBells.tsx     # Sound settings

  assets/
    tree/                 # SVG tree states
    spirit/               # Spirit states
    sounds/               # Bell/om sounds

capacitor.config.ts
ios/                      # Generated
ROADMAP.md               # This document
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

### Phase 3: Trial & Paywall
- [ ] Add trial tracking (session count, start date)
- [ ] Create `Paywall.tsx`
- [ ] Implement threshold checks
- [ ] Set up RevenueCat account
- [ ] Integrate RevenueCat SDK
- [ ] Configure IAPs in App Store Connect

### Phase 4: Core UI Screens
- [ ] Create `Onboarding.tsx` (3 screens)
- [ ] Create `Settings.tsx`
- [ ] Create `AuthModal.tsx`
- [ ] Add navigation to Garden position
- [ ] Wire up all screen transitions

### Phase 5: The Garden
- [ ] Create growth calculation system (`growth.ts`)
- [ ] Design tree SVG states (MVP: 50 states)
- [ ] Implement `TreeVisualization.tsx`
- [ ] Create spirit states
- [ ] Implement `Spirit.tsx`
- [ ] Add idle animations (CSS)
- [ ] Add post-session growth animation
- [ ] Create `Garden.tsx` screen
- [ ] Add "View garden" prompt after sessions

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
| Garden (MVP) | Medium | SVG + CSS approach |
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

---

## Build Execution Notes

**When implementing this plan:**
- Use `/frontend` skill for React component development
- Enable auto-accept edits for faster iteration
- Test each phase before moving to next
- Commit at logical checkpoints (end of each phase)

**Commands to start:**
```bash
# Invoke frontend skill for component work
/frontend

# Or enable auto-accept in Claude Code settings
```
