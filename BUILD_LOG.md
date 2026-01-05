# 10,000 Hours - Build Log

**Started:** January 5, 2026
**Status:** Phase 1 - Infrastructure

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
**Status:** NOT STARTED

- [ ] Update Timer.tsx (cumulative vs rolling display)
- [ ] Update Stats.tsx (tier-based windows, frozen milestones)
- [ ] Create WeeklyGoal.tsx component
- [ ] Update Calendar.tsx (90-day limit, logarithmic fade)
- [ ] Create LockedOverlay.tsx
- [ ] Create FrozenMilestone.tsx

---

## Phase 2b: Settings, Onboarding, Paywall
**Status:** NOT STARTED

- [ ] Create Onboarding.tsx (3 screens)
- [ ] Create Settings.tsx
- [ ] Create PaywallPremium.tsx
- [ ] Implement Hide Time Display feature
- [ ] Create `src/lib/purchases.ts` (mock mode)

---

## Phase 3: Design System (Ghibli)
**Status:** NOT STARTED

- [ ] Update color palette
- [ ] Add typography (Cormorant Garamond, Nunito)
- [ ] Implement breathing animations
- [ ] Update Stats screen styling
- [ ] Apply organic easing

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

### Existing Codebase (as of Jan 5, 2026)

```
src/
  lib/
    db.ts           # Dexie v1 (sessions, appState)
    calculations.ts # Stats, milestones, projections
    constants.ts    # GOAL_SECONDS
    format.ts       # Formatting utilities
  stores/
    useSessionStore.ts  # Timer + session state
  hooks/
    useSwipe.ts
    useTimer.ts
  components/
    Timer.tsx
    Stats.tsx
    Calendar.tsx
    ZenMessage.tsx
  App.tsx
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
