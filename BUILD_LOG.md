# 10,000 Hours - Build Log

**Started:** January 5, 2026
**Status:** UX Emotional Engagement Overhaul - Complete

---

## Strategic Decisions

### Decision 1: Build First, App Store Later (Jan 5, 2026)

**Context:** User does not have Mac access. iOS builds require Xcode (macOS only).

**Decision:**
- Defer Phase 0 (Apple Developer, RevenueCat, App Store Connect setup) until app is complete
- Build entire app on Windows (Phases 1-3)
- Use Codemagic (cloud CI/CD) for iOS builds when ready
- Mock RevenueCat/IAP during development
- Test via browser + PWA on iPhone until Phase 4

**Rationale:**
- No upfront $99 cost until app is validated
- All core functionality testable in browser
- RevenueCat can be mocked with feature flag
- Codemagic eliminates need for physical Mac ownership

---

## Phase 0: Account Setup
**Status:** DEFERRED (will complete after Phase 3)

- [ ] Apple Developer Program ($99/year)
- [ ] App ID in Apple Developer Portal
- [ ] App Store Connect app
- [ ] Agreements, Tax, Banking
- [ ] RevenueCat account + project
- [ ] IAP subscription product (premium_annual, $4.99/year)
- [ ] RevenueCat configuration
- [ ] Codemagic account

---

## Phase 1: Infrastructure
**Status:** COMPLETE

### Checklist

- [x] Install Vitest + testing dependencies
- [x] Update Dexie schema to v2
  - [x] Add `profile` table (tier, premiumExpiryDate, firstSessionDate, trialExpired, trialEndDate)
  - [x] Add `settings` table (hideTimeDisplay)
  - [x] Migration: backfill firstSessionDate from MIN(sessions.startTime)
- [x] Create `src/lib/tierLogic.ts`
  - [x] `shouldTriggerPaywall(daysSinceFirst, trialExpired)`
  - [x] `getCalendarFadeOpacity(dayAge)`
  - [x] `getWeeklyRollingHours(sessions)`
  - [x] `calculateAdaptiveWeeklyGoal(sessions, trialEndDate)`
  - [x] `isSessionVisible(session, tier, dayAge)`
- [x] Create `src/lib/__tests__/tierLogic.test.ts`
  - [x] Paywall trigger tests (4 cases)
  - [x] Calendar fade tests (4 cases)
  - [x] Rolling window tests (3 cases)
  - [x] Session visibility tests (4 cases)
  - [x] Adaptive goal tests (5 cases)
- [x] Create `src/stores/usePremiumStore.ts`
- [x] Create `src/stores/useSettingsStore.ts`
- [x] Create `src/lib/analytics.ts` (stub with mock mode)
- [x] Verify: `npm run build` succeeds
- [x] Verify: `npm run test` passes (38 tests!)
- [x] Commit to GitHub

### Progress Log

| Date | Task | Status | Notes |
|------|------|--------|-------|
| Jan 5, 2026 | Started Phase 1 | Complete | 38 tests passing, build successful |

---

## Phase 2a: Trial/Downgrade Logic
**Status:** COMPLETE

- [x] Update Timer.tsx (cumulative vs rolling display)
- [x] Update Stats.tsx (tier-based windows, frozen milestones)
- [x] Create WeeklyGoal.tsx component
- [x] Create FrozenMilestone.tsx component
- [x] Create LockedOverlay.tsx component
- [x] Update Calendar.tsx (90-day limit, logarithmic fade)

### Progress Log

| Date | Task | Status | Notes |
|------|------|--------|-------|
| Jan 5, 2026 | Phase 2a complete | Complete | All tier gating UI implemented |

### Files Created/Modified

| File | Changes |
|------|---------|
| `src/components/Timer.tsx` | Added tier-based display (cumulative vs weekly) |
| `src/components/Stats.tsx` | Tier-based windows, milestone/goal switching |
| `src/components/Calendar.tsx` | 90-day lookback, logarithmic fade |
| `src/components/WeeklyGoal.tsx` | NEW - Rolling 7-day goal display |
| `src/components/FrozenMilestone.tsx` | NEW - Frozen milestone for FREE tier |
| `src/components/LockedOverlay.tsx` | NEW - Reusable blur overlay |

---

## Phase 2b: Settings, Onboarding, Paywall
**Status:** COMPLETE

- [x] Create Onboarding.tsx (3 screens)
- [x] Create Settings.tsx
- [x] Create PaywallPremium.tsx
- [x] Implement Hide Time Display feature
- [x] Create `src/lib/purchases.ts` (mock mode)
- [x] Wire up Day 31 trigger in App.tsx
- [x] Update useSessionStore with 'settings' view
- [x] Add Settings navigation to Stats.tsx

### Progress Log

| Date | Task | Status | Notes |
|------|------|--------|-------|
| Jan 5, 2026 | Phase 2b complete | Complete | Onboarding, Settings, Paywall, Day 31 trigger all wired up |

### Files Created/Modified

| File | Changes |
|------|---------|
| `src/components/Onboarding.tsx` | NEW - 3-screen intro with localStorage tracking |
| `src/components/Settings.tsx` | NEW - Tier status, Hide Time toggle, Restore Purchase |
| `src/components/PaywallPremium.tsx` | NEW - Day 31 paywall with soft messaging |
| `src/lib/purchases.ts` | NEW - Mock RevenueCat integration |
| `src/components/Timer.tsx` | Added Hide Time Display feature (breathing circle mode) |
| `src/stores/useSessionStore.ts` | Added 'settings' to AppView type |
| `src/App.tsx` | Full wiring: onboarding, paywall, Day 31 trigger, purchase handlers |
| `src/components/Stats.tsx` | Added Settings navigation link |

---

## Phase 3: Design System (Ghibli)
**Status:** COMPLETE

- [x] Update color palette (cream, cream-warm, cream-deep, ink, ink-soft, moss, bark)
- [x] Add typography (Cormorant Garamond for display, Nunito for body)
- [x] Implement breathing animations (6-second cycle with scale)
- [x] Apply organic easing (cubic-bezier(0.34, 1.56, 0.64, 1))
- [x] Add legacy aliases for backward compatibility

### Progress Log

| Date | Task | Status | Notes |
|------|------|--------|-------|
| Jan 5, 2026 | Phase 3 complete | Complete | Ghibli design system applied |

### Files Modified

| File | Changes |
|------|---------|
| `tailwind.config.js` | New color palette, typography, animations, easing |
| `index.html` | Google Fonts (Cormorant Garamond + Nunito), theme-color |
| `src/index.css` | CSS custom properties for new palette |

---

## Phase 3b: Code Review Improvements
**Status:** COMPLETE

**Context:** Comprehensive code review performed January 6, 2026 identified areas for improvement in error handling, code consistency, and production readiness. Focused on PWA-relevant improvements (skipping native/commercial-only items).

### Completed

- [x] **Add React Error Boundary** (`App.tsx`)
  - Created `ErrorBoundary.tsx` component
  - Wrapped app in ErrorBoundary with graceful fallback UI
  - Shows error details in dev mode only

- [x] **Fix session timestamp calculation** (`useSessionStore.ts`)
  - Added `sessionStartTime` field to store actual wall-clock time
  - Timer now stores start time on `startTimer()` instead of calculating backwards
  - Prevents drift between `performance.now()` and `Date.now()`

- [x] **Fix ESLint disable comment** (`App.tsx`)
  - Removed `// eslint-disable-line react-hooks/exhaustive-deps`
  - Added `hasInitialized` ref to prevent double-init
  - Properly listed all dependencies

- [x] **Consolidate constants** (`tierLogic.ts` → `constants.ts`)
  - Moved `TRIAL_DAYS`, `CALENDAR_LOOKBACK_DAYS`, `MS_PER_DAY` to constants.ts
  - Moved adaptive goal constants (`MIN/MAX/DEFAULT_WEEKLY_GOAL_HOURS`, `GOAL_PERCENTAGE`)
  - Single source of truth for magic numbers

- [x] **Use UUID-based session IDs** (`useSessionStore.ts`)
  - Replaced `id: Date.now()` with UUID-derived ID
  - Prevents theoretical collision on rapid session creation

### Deferred (Native/Commercial Phase)

- [ ] **Add user-facing error feedback for purchases** - Mock mode, not needed for PWA testing
- [ ] **Add loading state for purchase flow** - Mock mode, not needed for PWA testing
- [ ] **Create dedicated paywall store** - Current implementation works fine
- [ ] **Migrate onboarding state to Dexie** - localStorage works for PWA
- [ ] **Add accessibility attributes** - Post-validation polish
- [ ] **Add offline indicator UI** - Nice-to-have, not blocking

### Verified Working

- [x] LockedOverlay.tsx - IS used in Stats.tsx (initial analysis was incorrect)
- [x] Calendar fade calculations - Already lightweight, memoization overhead not worth it

### Progress Log

| Date | Task | Status | Notes |
|------|------|--------|-------|
| Jan 6, 2026 | Code review completed | Complete | 15 improvements identified |
| Jan 6, 2026 | Phase 3b implemented | Complete | 5 core improvements, 6 deferred |
| Jan 6, 2026 | Build + tests verified | Complete | 38 tests passing |

### Files Created

| File | Purpose |
|------|---------|
| `src/components/ErrorBoundary.tsx` | Catch and display React errors gracefully |

### Files Modified

| File | Changes |
|------|---------|
| `src/App.tsx` | Error boundary wrapper, ESLint fix with ref pattern |
| `src/stores/useSessionStore.ts` | Added sessionStartTime, UUID-based IDs |
| `src/lib/constants.ts` | Added tier/trial constants |
| `src/lib/tierLogic.ts` | Import constants from constants.ts |

---

## UX Emotional Engagement Overhaul
**Status:** COMPLETE
**Date:** January 6, 2026

> **NOTE:** This work was NOT part of the original roadmap. It was a separate user request to improve emotional engagement and conversion paths before proceeding with native deployment.

### Context
User identified that the app, while functional, lacked emotional engagement:
- First milestone (10h) takes ~2 weeks - no early wins
- Time windows feel jumpy and disconnected
- No achievement memory - milestones achieved then forgotten
- FREE/Premium differentiation lacks emotional quality

### Design Principles Applied
- **Zen Neutrality**: State facts, don't celebrate. Let user supply meaning.
- **Endowed Progress Effect**: First win in ~1 week
- **Loss Aversion**: Achievements fade, never removed
- **AIDA Framework**: Attention (early win) → Interest (gallery) → Desire (fading) → Action (pay)

### Phase 1: Early Milestones ✓
- Changed first milestone from 10h to **2h** (~1 week with 4x30min sessions)
- New progression: 2, 5, 10, 25, 50, 100, 250, 500, 750, 1000, 1500, 2000, 2500, 3500, 5000, 6500, 7500, 8500, 10000

### Phase 2: Achievement Memory System ✓
- Added `Achievement` interface to DB with timestamps
- `recordMilestoneIfNew()` records achievements automatically on session end
- Created `AchievementGallery` component showing achieved milestones with progress rings
- **FREE tier after trial**: Achievements visible but dates faded/blurred ("gold star on copybook" effect)
- Message: "These moments remain."

### Phase 3: Time Range Slider ✓
- Created `TimeRangeSlider` component with quick presets (7d, 30d, 90d, Year, All)
- Log-scale slider for smooth custom range selection
- **FREE tier**: Capped at 90 days with visual marker
- Shows date range being viewed

### Phase 4: Emotional Polish ✓
- Created `MilestoneCelebration` overlay for zen-neutral acknowledgment
  - Shows briefly when milestone achieved: "5 hours. The path continues."
- Contextual paywall messaging based on user journey:
  - Shows achievement count: "3 milestones reached. Full history preserved."
  - Shows days of practice: "67 days of practice. Complete record available."

### Files Created

| File | Purpose |
|------|---------|
| `src/components/AchievementGallery.tsx` | Display achieved milestones with tier-based visibility |
| `src/components/TimeRangeSlider.tsx` | Visual time range selector with presets |
| `src/components/MilestoneCelebration.tsx` | Brief milestone acknowledgment overlay |

### Files Modified

| File | Changes |
|------|---------|
| `src/lib/db.ts` | Added Achievement interface, achievement helpers |
| `src/lib/tierLogic.ts` | Added getAchievementVisibility(), MILESTONES constant |
| `src/lib/calculations.ts` | Updated MILESTONE_HOURS to start at 2h |
| `src/lib/format.ts` | Added formatShortDate() |
| `src/stores/useSessionStore.ts` | Added justAchievedMilestone state, achievement recording |
| `src/components/Stats.tsx` | Integrated AchievementGallery, TimeRangeSlider |
| `src/components/PaywallPremium.tsx` | Contextual messaging based on achievements/days |
| `src/App.tsx` | Added MilestoneCelebration overlay |
| `src/index.css` | Added slider thumb styling |

### Progress Log

| Date | Task | Status | Notes |
|------|------|--------|-------|
| Jan 6, 2026 | Phase 1: Early milestones | Complete | First milestone now 2h |
| Jan 6, 2026 | Phase 2: Achievement memory | Complete | Gallery + tier visibility |
| Jan 6, 2026 | Phase 3: Time range slider | Complete | Presets + visual slider |
| Jan 6, 2026 | Phase 4: Emotional polish | Complete | Celebration + contextual paywall |

---

## UI/UX Design Refinement: Ive Meets Miyazaki
**Status:** COMPLETE
**Date:** January 6, 2026

> **Design Philosophy:** Jony Ive's obsessive precision meeting Hayao Miyazaki's soul. Every element earns its place through invisible craft in service of genuine feeling.

### Context
User requested comprehensive UI/UX review applying multiple design skill sets to transform "good design into unforgettable experience" while preserving the app's zen philosophy.

### Design Principles Applied
- **Ma (Japanese emptiness)**: Space as design element - removed dividers, increased breathing room
- **Materiality**: Elements feel crafted, not generated - gradients, depth, organic motion
- **Restraint**: Color only where it communicates meaning
- **Aliveness**: Subtle acknowledgment of user's presence through organic animation

### Phase 1: Soul Changes ✓

**Color Palette Refinement:**
| Token | Before | After | Rationale |
|-------|--------|-------|-----------|
| ink | #2D3436 | #2C3E50 | Slightly bluer, more elegant |
| ink-soft | #4A5568 | #5D6D7E | Softer, less harsh |
| moss | #7C9A6E | #87A878 | More vibrant green |
| bark | #8B7355 | #A08060 | Warmer, more golden |
| cream-warm | #F5F1E8 | #F7F3EA | Slightly warmer |
| cream-deep | #EDE8DC | #EBE6D9 | Deeper for contrast |

**Meditation Orb Redesign:**
- Transformed from gray 4-layer orb to luminous 6-layer spirit
- Layer 1: Ambient atmosphere (180px, breathing)
- Layer 2: Moss-tinted outer glow (blur 16px)
- Layer 3: Breathing halo ring
- Layer 4: Pearl-like core with inner light gradient
- Layer 5: Inner light bloom
- Layer 6: Slow rotating shimmer
- New animations: `atmosphereBreathe`, `glowPulse`

**Progress River:**
- Replaced mechanical progress bar with organic flowing river
- Bark-to-moss gradient (journey metaphor)
- Subtle shimmer animation for life
- Rounded-full corners

### Phase 2: Refinement ✓

**Typography:**
- Section headers: ALL CAPS → Title Case, serif font
- Consistent hierarchy: `font-serif text-sm text-ink/50`
- Labels: 500 weight for presence

**Week Stones:**
- Replaced flat dots with gradient depth
- Completed days: `radial-gradient(circle at 30% 30%, #5D6D7E, #2C3E50)`
- Today: moss-tinted with breathing ring
- Empty days: `bg-cream-deep`

**Calendar Warmth:**
- Days with sessions get subtle moss tint: `rgba(135, 168, 120, 0.08)`
- Year heat map uses moss-based palette instead of gray
- Rounded-lg day cells with active:scale feedback

**Divider Removal:**
- Removed all `border-b` dividers in Stats
- Increased spacing: `mb-12` between sections
- Let emptiness speak

### Phase 3: Craft ✓

**The Long View Treatment:**
- Added atmospheric background: moss-tinted radial gradient
- Tracking-widest header for contemplative reading
- Italic philosophy quote styling

**Settings Soul:**
- Custom organic toggle with pearl-like knob gradient
- Moss background when enabled
- Version as serif italic signature at footer
- Removed borders, breathing space throughout

**Navigation Refinement:**
- "timer" → "Timer", "stats" → "Stats" (Title Case confidence)
- Added `active:scale-[0.98]` micro-interaction to all buttons
- Reduced opacity for subtler hints

**Haptic Feedback Hook:**
- Created `useTapFeedback.ts` for future haptic integration
- Patterns: light (10ms), medium (25ms), success (15-50-15ms)

### Files Created

| File | Purpose |
|------|---------|
| `src/hooks/useTapFeedback.ts` | Haptic/visual feedback utility |

### Files Modified

| File | Changes |
|------|---------|
| `tailwind.config.js` | Refined color palette, gentler orb-breathe animation |
| `src/index.css` | New orb animations (atmosphereBreathe, glowPulse, riverShimmer), text hierarchy variables |
| `src/components/Timer.tsx` | 6-layer luminous orb, refined navigation hints |
| `src/components/Stats.tsx` | Week Stones, typography refinement, divider removal, The Long View atmosphere |
| `src/components/Calendar.tsx` | Moss warmth for session days, refined heat map palette, rounded day cells |
| `src/components/Settings.tsx` | Custom organic toggle, signature footer, breathing space |
| `src/components/AchievementGallery.tsx` | Progress River with gradient + shimmer, serif section header |

### Visual Impact Summary

| Element | Before | After |
|---------|--------|-------|
| Meditation orb | Flat gray breathing circle | Luminous pearl spirit with atmosphere |
| Progress bar | Mechanical dark rectangle | Flowing bark-to-moss river with shimmer |
| Week dots | Uniform flat circles | Gradient depth stones with today ring |
| Calendar days | Clinical grid | Warm garden with moss tint growth |
| Section headers | SHOUTY ALL CAPS | Quiet serif Title Case |
| Dividers | Visible border lines | Empty space speaking |
| Toggle | Generic iOS switch | Pearl-knob organic toggle |
| Typography | Arbitrary opacity | Systematic hierarchy (100/70/50/30/15) |

### Animation Philosophy
- 6-second breathing cycle (matches meditation rhythm)
- Organic easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- Entrance: rise from below (like plants growing)
- Exit: fade without movement (like mist dissipating)
- Loops: imperceptible restart point

### Progress Log

| Date | Task | Status | Notes |
|------|------|--------|-------|
| Jan 6, 2026 | Phase 1: Soul changes | Complete | Color, orb, progress river |
| Jan 6, 2026 | Phase 2: Refinement | Complete | Typography, stones, calendar, dividers |
| Jan 6, 2026 | Phase 3: Craft | Complete | Long View, Settings, navigation, haptics |

---

## Phase 4: Capacitor + iOS
**Status:** NOT STARTED (requires Phase 0)

- [ ] Complete Phase 0 (Apple Developer, RevenueCat)
- [ ] Set up Codemagic CI/CD
- [ ] Install Capacitor
- [ ] Implement keep-awake
- [ ] Implement lifecycle handling
- [ ] Generate iOS project
- [ ] Test on physical device via TestFlight

---

## Phase 5: Launch
**Status:** NOT STARTED

- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] App Store listing
- [ ] Screenshots
- [ ] TestFlight beta
- [ ] Submit for review

---

## Technical Notes

### Current Codebase (as of Jan 6, 2026 - UX Overhaul Complete)

```
src/
  lib/
    db.ts           # Dexie v2 (sessions, appState, profile, settings, achievements)
    calculations.ts # Stats, milestones (2h start), projections
    constants.ts    # GOAL_SECONDS, TIME_WINDOWS, trial constants
    format.ts       # Formatting utilities (incl. formatShortDate)
    tierLogic.ts    # Trial/downgrade logic, achievement visibility, MILESTONES
    analytics.ts    # Event tracking (mock mode)
    purchases.ts    # RevenueCat integration (mock mode)
    __tests__/
      tierLogic.test.ts  # 39 unit tests
  stores/
    useSessionStore.ts  # Timer + session state + achievement recording
    usePremiumStore.ts  # Subscription/tier state
    useSettingsStore.ts # User preferences
  hooks/
    useSwipe.ts
    useTimer.ts
  components/
    Timer.tsx               # Hide Time Display mode
    Stats.tsx               # AchievementGallery + TimeRangeSlider
    Calendar.tsx            # 90-day limit, fade
    ZenMessage.tsx
    WeeklyGoal.tsx          # Rolling 7-day goal
    FrozenMilestone.tsx     # FREE tier frozen state (legacy)
    LockedOverlay.tsx       # Blur overlay
    Onboarding.tsx          # 3-screen intro
    Settings.tsx            # User preferences
    PaywallPremium.tsx      # Contextual paywall with achievement counts
    AchievementGallery.tsx  # Milestone badges with tier visibility
    TimeRangeSlider.tsx     # Visual time range selector
    MilestoneCelebration.tsx # Zen-neutral milestone acknowledgment
    ErrorBoundary.tsx       # React error boundary
  App.tsx               # Full flow wiring + MilestoneCelebration
  main.tsx
  index.css             # Slider styling
```

### Dependencies (package.json)

```json
{
  "dependencies": {
    "date-fns": "^3.6.0",
    "dexie": "^4.0.4",
    "dexie-react-hooks": "^1.1.7",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^4.5.2"
  }
}
```

### Key Formulas

- **Day 31 trigger:** `daysSinceFirstSession >= 31 && !trialExpired`
- **Adaptive goal:** `weeklyGoal = avg(dailyMinutes during trial) * 7 * 0.8`
- **Calendar fade:** 100% (0-30d) → 60% (31-60d) → 30% (61-90d) → 10% (90+d)
