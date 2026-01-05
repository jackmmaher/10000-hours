# 10,000 Hours - Build Log

**Started:** January 5, 2026
**Status:** Phase 3 - Complete

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

### Current Codebase (as of Jan 5, 2026 - Phase 2b Complete)

```
src/
  lib/
    db.ts           # Dexie v2 (sessions, appState, profile, settings)
    calculations.ts # Stats, milestones, projections
    constants.ts    # GOAL_SECONDS, TIME_WINDOWS
    format.ts       # Formatting utilities
    tierLogic.ts    # Trial/downgrade logic, paywall triggers
    analytics.ts    # Event tracking (mock mode)
    purchases.ts    # RevenueCat integration (mock mode)
    __tests__/
      tierLogic.test.ts  # 38 unit tests
  stores/
    useSessionStore.ts  # Timer + session state
    usePremiumStore.ts  # Subscription/tier state
    useSettingsStore.ts # User preferences
  hooks/
    useSwipe.ts
    useTimer.ts
  components/
    Timer.tsx           # Hide Time Display mode
    Stats.tsx           # Tier-gated windows
    Calendar.tsx        # 90-day limit, fade
    ZenMessage.tsx
    WeeklyGoal.tsx      # Rolling 7-day goal
    FrozenMilestone.tsx # FREE tier frozen state
    LockedOverlay.tsx   # Blur overlay
    Onboarding.tsx      # 3-screen intro
    Settings.tsx        # User preferences
    PaywallPremium.tsx  # Day 31 paywall
  App.tsx               # Full flow wiring
  main.tsx
  index.css
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
