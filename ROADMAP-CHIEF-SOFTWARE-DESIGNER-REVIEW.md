# Chief Software Designer Review
## 10,000 Hours iOS Commercialization Roadmap

**Review Date:** January 2026
**Reviewer Role:** Chief Software Architect / Senior Technical Lead
**Document Under Review:** ROADMAP.md
**Review Type:** Pre-Build Technical & Architectural Assessment

---

## Executive Summary

This review evaluates the proposed commercialization roadmap for transforming a meditation timer PWA into a commercially viable iOS application. The roadmap demonstrates strong product thinking, clear philosophical grounding, and above-average technical planning.

**UPDATED (January 2026):** Scope has been significantly simplified. Many concerns in this review have been resolved by removing features:
- ~~Cloud sync~~ → Local-only storage (Dexie) — **Sync Engine concerns ELIMINATED**
- ~~Year Summary animation~~ → Removed — **Year Summary concerns ELIMINATED**
- ~~Spirit companion~~ → Removed for v1.0 — **Spirit coherence concerns ELIMINATED**
- ~~$29.99/year + $99.99 lifetime~~ → $4.99 one-time — **Pricing simplified**
- ~~Interval bells~~ → Removed — **Background audio concerns ELIMINATED**
- **Added:** 16 visual states (Season × Time of Day), Multiplicative growth algorithm

**Overall Assessment:** Proceed
**Risk Level:** Medium (Garden is sole high-complexity component)
**Remaining Critical Items:** 4 (Garden prototype, crash reporting, screen lock, timer lifecycle)

---

## Table of Contents

1. [Garden Technical Architecture](#1-garden-technical-architecture) — **ACTIVE**
2. [Sync Engine Design](#2-sync-engine-design) — **ELIMINATED** (local-only storage)
3. [Year Summary Scope & Complexity](#3-year-summary-scope--complexity) — **ELIMINATED** (feature removed)
4. [Missing Infrastructure](#4-missing-infrastructure) — **ACTIVE** (Sentry, Vitest)
5. [iOS Platform Considerations](#5-ios-platform-considerations) — **ACTIVE** (keep-awake, lifecycle)
6. [Testing Strategy](#6-testing-strategy) — **ACTIVE**
7. [Revenue & Conversion Assumptions](#7-revenue--conversion-assumptions) — **UPDATED** ($4.99 model)
8. [Phase Dependencies & Parallelization](#8-phase-dependencies--parallelization) — **SIMPLIFIED**
9. [Database & Security](#9-database--security) — **SIMPLIFIED** (local-only)
10. [Build Execution Recommendations](#10-build-execution-recommendations) — **UPDATED**

---

## 1. Garden Technical Architecture

### Current Plan (Phases 5a, 5b, 5c)

The roadmap proposes using **p5.js with L-system procedural generation** to create a living tree with approximately 1,000 visual micro-states, evolving from seed to full tree across 10,000 hours of meditation.

### Concerns

#### 1.1 Visual Distinctiveness at Scale

**The Problem:**
L-systems produce mathematically elegant fractal structures, but visual distinctiveness between states may be imperceptible. The difference between a tree at 247 hours and 253 hours will likely be invisible to users. The claim of "~1000 visual micro-states" requires validation.

**Why This Matters:**
The Garden is the premium feature—the thing users pay for. If users don't *feel* their tree growing between sessions, the emotional payoff that drives conversion evaporates. A user completing a 20-minute session should see meaningful change.

**Alternative to Consider:**
A **hybrid approach** combining:
- **Discrete visual milestones** (50-100 hand-crafted or AI-generated tree stages)
- **Interpolation between milestones** (procedural blending, particle effects, color shifts)
- **Additive detail layers** (leaves, flowers, moss) that accumulate continuously

This gives you the "1000 states" feeling through interpolation while ensuring each milestone is visually striking.

**Best Practice Recommendation:**
Before any Garden code enters the main codebase, create a **standalone prototype** (plain HTML + p5.js, no React) that demonstrates:
- Tree at 10, 50, 100, 250, 500, 1000, 2500, 5000, 10000 hours
- Side-by-side comparison at adjacent states (e.g., 247 vs 253 hours)
- Post-session growth animation

**Mitigation if Keeping Current Plan:**
- Add explicit "growth animation" effects that fire post-session (golden light, leaf unfurl, branch extension) regardless of whether the underlying L-system changed visibly
- These animations create *perception* of growth even when the structural change is subtle
- Budget 3-5 extra days in Phase 5b purely for visual tuning

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 5a | Add prototype validation step before proceeding |
| Phase 5b | Extend timeline estimate; add visual tuning buffer |
| Phase 5c | Spirit integration depends on tree looking right |
| Phase 7 | Year Summary's "tree rewind" only works if tree states are visually distinct |

---

#### 1.2 React + p5.js Integration Complexity

**The Problem:**
p5.js was designed for creative coding sketches, not for integration with React's component lifecycle. Common failure modes:
- Memory leaks from orphaned canvas instances
- Double-rendering in React StrictMode
- Performance degradation from unnecessary re-renders
- Cleanup failures on unmount leading to zombie animation loops

**Why This Matters:**
A laggy, memory-leaking Garden will destroy the meditative feel of the app. Users will notice. Reviews will mention it.

**Alternative to Consider:**
- **react-p5-wrapper** (more React-aware than react-p5)
- **Framer Motion + SVG** for simpler tree representations
- **Rive or Lottie** for pre-animated tree states (trading flexibility for reliability)

**Best Practice Recommendation:**
If using p5.js, implement **instance mode** with explicit lifecycle management:

```typescript
// Correct pattern for React + p5.js
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

**Mitigation if Keeping Current Plan:**
- Wrap all p5 logic in a custom hook (`useP5Canvas`) that handles cleanup
- Add memory profiling to Phase 5b test checklist
- Test specifically: navigate to Garden, leave, return 10 times. Memory should not grow.
- Disable React StrictMode during p5 development to avoid double-invoke confusion

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 5a | Add p5 integration spike as first task before L-system work |
| Phase 5b | Add memory profiling test to checklist |
| Phase 9 | Capacitor webview may behave differently than Safari—test early |

---

#### 1.3 Spirit + Tree Visual Coherence

> **STATUS: ELIMINATED** — Spirit companion removed from v1.0 scope.

~~**The Problem:**~~
~~The roadmap specifies "Spirit companion: AI-generated PNG sprites at evolution stages, animated via CSS." This creates two separate rendering contexts.~~

**Resolution:** Spirit feature removed entirely for v1.0 launch. The tree alone is the premium feature. Spirit may be reconsidered for v1.1+ based on user feedback.

This significantly simplifies the Garden implementation—only one rendering concern (the tree in p5.js).

---

## 2. Sync Engine Design

> **STATUS: ELIMINATED** — Cloud sync removed from v1.0 scope. Local-only storage using Dexie (IndexedDB).

### Original Plan (Phase 6) — NO LONGER APPLICABLE

~~The roadmap describes an offline-first architecture with:~~
~~- Dexie (IndexedDB) for local storage~~
~~- Supabase PostgreSQL for cloud storage~~
~~- Background sync with "last-write-wins" conflict resolution~~
~~- UUID-based deduplication~~

~~Phase 6 is correctly marked as **High Risk / High Difficulty**.~~

**Resolution:** All sync concerns eliminated by switching to local-only storage. This removes:
- The highest-risk component from the critical path
- Supabase dependency and costs
- Apple Sign-In complexity
- All conflict resolution edge cases
- GDPR cloud data concerns

**Trade-off:** Users cannot sync across devices in v1.0. This is acceptable for MVP—users who need multi-device sync can wait for v1.1.

### Concerns — NO LONGER APPLICABLE

> The following concerns are preserved for reference but are **no longer relevant** due to local-only storage decision.

#### 2.1 Conflict Resolution Underspecified — ELIMINATED

~~**The Problem:**~~
~~"Last-write-wins" sounds simple but masks significant complexity.~~

**Resolution:** No conflicts possible with single-device local storage.

#### 2.2 Schema Migration Strategy — STILL RELEVANT

**The Problem:**
The roadmap defines a database schema but doesn't address how schema changes will be handled after launch.

**Why This Matters:**
When v1.1 adds a new field to the `sessions` table, you need:
- Dexie schema version bump and migration
- Compatibility layer for old data

**Best Practice Recommendation:**
- Design Dexie schema with `version` field from day 1
- Create migration framework even if only one migration exists at launch
- Document schema versioning strategy in technical docs
- Test: install v1.0, use for a week, upgrade to v1.1, verify data integrity

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 1 | Add schema versioning to Dexie setup |
| Phase 6 | v1.1 planning must include migration testing |

---

## 3. Year Summary Scope & Complexity

> **STATUS: ELIMINATED** — Year Summary feature removed from v1.0 scope. The tree itself IS the summary.

### Original Plan (Phase 7) — NO LONGER APPLICABLE

~~"The Tree Remembers" is a temporal journey through the user's meditation year, featuring:~~
~~- Tree rewind from current state to seed~~
~~- Growth replay with key moments highlighted~~
~~- Seasonal lighting changes~~
~~- Spirit reactions at milestones~~
~~- 60-90 second auto-advancing experience~~
~~- Blur mode for free users as FOMO mechanism~~

**Resolution:** The living tree, with its 16 visual states (Season × Time of Day) and multiplicative growth algorithm, provides the visual summary naturally. Users see their progress by looking at their tree—no separate animation feature needed.

This removes a **High Risk / High Complexity** component from the critical path.

### Concerns — NO LONGER APPLICABLE

> All Year Summary concerns are eliminated. See original document for reference if considering this feature for v1.1+.

#### 3.1 Architectural Complexity — ELIMINATED

**The Problem:**
Year Summary requires capabilities that compound complexity:

| Requirement | Technical Implication |
|-------------|----------------------|
| Historical tree rendering | Tree state must be deterministic and recomputable from any hour count |
| Smooth rewind animation | Need interpolation between states, not jumps |
| Seasonal lighting | Environmental rendering system beyond just tree |
| Spirit reactions | Scripted animation sequences tied to data milestones |
| Milestone detection | Data analysis: streaks, longest session, first sit, etc. |
| Auto-advance with swipe override | Custom animation timeline with gesture integration |

This is effectively building a **mini animation editor runtime** inside the app.

**Why This Matters:**
Phase 7 depends on Phase 5 (Garden) and Phase 6 (Sync) being complete and stable. If either slips, Phase 7 slips. If Phase 7 slips, launch slips.

Additionally, Year Summary is only valuable once per year. The development investment must be weighed against frequency of use.

**Alternative to Consider:**
**Tiered Year Summary approach:**

**V1.0 (MVP):**
- Static summary screen (no animation)
- Key stats displayed: total hours, sessions, longest streak, deepest sit
- Single tree image at year-end state
- "Share your tree" export

**V1.1:**
- Add rewind/replay animation
- Add seasonal transitions
- Add spirit reactions

This gets a Year Summary feature to market without the animation complexity.

**Best Practice Recommendation:**
If shipping full Year Summary in v1.0:

1. **Build animation timeline system early** (Phase 5): Create a reusable `AnimationTimeline` component that can sequence multiple animations with pause/play/seek
2. **Decouple milestone detection from rendering**: `calculateMilestones(sessions)` should be a pure function tested independently
3. **Test with mock data**: Create a test harness with fake session data covering edge cases (no sessions, one session, 1000 sessions, only January sessions, etc.)

**Mitigation if Keeping Current Plan:**
- Add 1-week buffer to Phase 7 timeline
- Implement milestone detection in Phase 5a (it's just data, no UI needed)
- Create animation timeline component in Phase 5b (can test with simple shapes before tree is ready)
- Have fallback: if animation system proves too complex, ship with static version and promise animated version in v1.1

**Pitfalls to Watch For:**
1. **Memory pressure during replay**: Rendering 12 months of tree evolution may strain mobile devices. Consider quality reduction during animation.
2. **Edge case: user started in December**: Year Summary for 2 weeks of data still needs to feel meaningful, not empty.
3. **Edge case: user has 0 sessions this year**: What shows? Error? Encouraging message?
4. **Performance on older devices**: iPhone 8 should still run smoothly.

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 5a | Add milestone calculation functions |
| Phase 5b | Add animation timeline component |
| Phase 5c | Ensure tree supports `renderAtHours(n)` function |
| Phase 6 | Must complete fully before Phase 7 can start (hard dependency) |
| Phase 7 | Add buffer time; add fallback plan |
| Phase 9 | Performance testing on older devices |
| Phase 10 | Beta testers specifically test Year Summary edge cases |

---

## 4. Missing Infrastructure

### Current Plan

The roadmap focuses on features but lacks critical operational infrastructure.

### Concerns

#### 4.1 Crash Reporting

**The Problem:**
No crash reporting system is specified. When the app crashes in production, you will have no visibility.

**Why This Matters:**
iOS crash reports via App Store Connect are delayed (24-48 hours) and lack context. By the time you see them, you've already collected one-star reviews.

**Best Practice Recommendation:**
Integrate crash reporting in Phase 1:
- **Sentry** (recommended): Good React/Capacitor support, free tier sufficient for launch
- **Firebase Crashlytics**: Alternative if using other Firebase services

Add to Phase 1 tasks:
```
- [ ] Install and configure Sentry
  - `npm install @sentry/capacitor @sentry/react`
  - Initialize in App.tsx before any other code
  - Test: trigger intentional crash, verify it appears in Sentry dashboard
  - VERIFY: Crashes reported with stack traces
```

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 1 | Add Sentry setup as first infrastructure task |
| All subsequent phases | Test checklists should include "check Sentry for errors" |
| Phase 10 | Beta testing can use Sentry to catch issues before launch |

---

#### 4.2 Analytics

**The Problem:**
Beyond RevenueCat revenue metrics, no product analytics are specified. You won't know:
- Where do users drop off in onboarding?
- How many users complete sessions?
- What percentage visit Garden after first session?
- What's the funnel from Garden view to paywall to purchase?

**Why This Matters:**
Without analytics, you're flying blind on product decisions. RevenueCat tells you *what* sold, not *why* or *why not*.

**Best Practice Recommendation:**
Add lightweight analytics:
- **PostHog** (open source, can self-host, good free tier)
- **Mixpanel** (industry standard, free tier available)
- **Amplitude** (strong for funnels)

Track at minimum:
1. `session_started`
2. `session_completed` (with duration)
3. `screen_viewed` (with screen name)
4. `paywall_viewed`
5. `purchase_initiated`
6. `purchase_completed`

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 2 | Add analytics initialization and screen tracking |
| Phase 3 | Add paywall funnel tracking |
| Phase 11 | Use analytics to prioritize v1.1 features |

---

#### 4.3 CI/CD Pipeline

**The Problem:**
No build automation specified. Manual builds lead to:
- "Works on my machine" bugs
- Forgotten build steps
- Inconsistent TestFlight uploads
- No automated test runs

**Best Practice Recommendation:**
Set up GitHub Actions for:
1. **On PR**: Run `npm run build`, run tests (if any)
2. **On merge to main**: Build + upload to TestFlight via Fastlane

This can be configured in Phase 1 and provides safety throughout development.

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 1 | Add basic CI (build + test on PR) |
| Phase 9 | Add Fastlane + TestFlight upload automation |
| Phase 10 | Beta builds are automated, not manual |

---

## 5. iOS Platform Considerations

### Current Plan

Phase 9 covers Capacitor integration but lacks iOS-specific behavior handling.

### Concerns

#### 5.1 Screen Lock During Meditation

**The Problem:**
iOS automatically dims and locks the screen after the configured timeout. During a 30-minute meditation session, the screen will lock, and the app will be backgrounded.

**Why This Matters:**
Timer accuracy depends on the app remaining active. Backgrounded apps have limited execution time. Users will report "my timer stopped" bugs.

**Best Practice Recommendation:**
Disable idle timer during active session:

```typescript
import { KeepAwake } from '@capacitor-community/keep-awake';

// On session start
await KeepAwake.keepAwake();

// On session end
await KeepAwake.allowSleep();
```

Add to Phase 9:
```
- [ ] Install @capacitor-community/keep-awake
- [ ] Keep screen awake during active meditation
- [ ] Restore normal behavior when session ends
- [ ] VERIFY: Screen stays on during 35-minute test session
```

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 9 | Add keep-awake plugin and implementation |
| Phase 10 | Beta testers specifically test long sessions |

---

#### 5.2 Background Audio for Interval Bells — ELIMINATED

> **STATUS: ELIMINATED** — Interval bells removed from v1.0 scope.

~~**The Problem:**~~
~~If the user locks their phone or switches apps during meditation, interval bells may not play.~~

**Resolution:** Interval bells feature removed entirely. Silent meditation is the focus for v1.0. This removes iOS background audio complexity.

---

#### 5.3 App Lifecycle (Backgrounding, Termination)

**The Problem:**
If user switches apps mid-meditation:
- App goes to background
- After ~30 seconds, app may be suspended
- After minutes to hours, app may be terminated
- When user returns, timer state may be inconsistent

**Why This Matters:**
The timer is the core feature. It must be bulletproof.

**Best Practice Recommendation:**
1. **Save session state on background**: When app goes to background, save current timer state to localStorage/Dexie
2. **Use absolute timestamps**: Store session start time, not elapsed time. Calculate elapsed on display.
3. **Recover on foreground**: When app returns, recalculate elapsed time from stored start time
4. **Handle termination**: If app was terminated, next launch should detect incomplete session and offer to resume or discard

```typescript
// On session start
const sessionStart = Date.now();
await Dexie.saveActiveSession({ startTime: sessionStart });

// On timer display (computed)
const elapsed = Date.now() - sessionStart;

// On app foreground
const activeSession = await Dexie.getActiveSession();
if (activeSession) {
  // Resume timer from activeSession.startTime
}
```

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 9 | Add app lifecycle handling |
| Phase 10 | Test: start session, switch to Safari, wait 5 minutes, return |

---

## 6. Testing Strategy

### Current Plan

Each phase includes a "TEST CHECKLIST" with manual verification steps. No automated testing is specified.

### Concerns

#### 6.1 No Automated Tests

**The Problem:**
Manual testing doesn't scale. As the codebase grows, manually verifying "timer still works" after every change becomes impractical.

**Why This Matters:**
Regression bugs will slip through. You'll break something in Phase 8 that worked in Phase 5 and won't notice until Phase 10.

**Best Practice Recommendation:**
Add targeted automated tests for critical paths:

**Unit Tests (Vitest):**
- `growth.ts`: calculateGrowthLevel, getSpiritStage
- `lsystem.ts`: tree generation determinism
- Milestone detection functions
- Sync conflict resolution logic

**Integration Tests:**
- Dexie: save session, read session, query sessions
- Timer: start, pause, complete flow

**E2E Tests (Playwright or Cypress):**
- Complete a meditation session
- View Garden (premium)
- Paywall appears for free user on Garden tap

Add to Phase 1:
```
- [ ] Set up Vitest for unit tests
- [ ] Create first test: timer duration calculation
- [ ] Add test run to npm scripts: `npm run test`
- [ ] VERIFY: Tests pass in CI
```

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 1 | Set up test framework |
| Phase 5a | Unit tests for growth calculations |
| Phase 6 | Unit tests for sync logic (critical) |
| All phases | Add "npm run test passes" to test checklists |

---

## 7. Revenue & Conversion Assumptions

> **STATUS: UPDATED** — Pricing model simplified to $4.99 one-time purchase.

### Updated Plan

- $4.99 one-time purchase (non-consumable IAP)
- 10-hour free trial, then hard paywall
- No subscription complexity
- Lower revenue per user, but simpler model

### Updated Revenue Projections

| Scenario | Conversion | Year 1 Revenue (50K downloads) |
|----------|------------|-------------------------------|
| Pessimistic | 2% | ~$4,240 |
| Realistic | 3.5% | ~$7,420 |
| Optimistic | 5% | ~$10,600 |

**Note:** Lower revenue expectations, but also lower complexity, no subscription churn, and simpler business model.

### Concerns

#### 7.1 Conversion Rate — STILL RELEVANT

**The Problem:**
5% is at the high end of freemium conversion rates. Cold App Store traffic often converts at 1-3%.

**Why This Matters:**
With $4.99 pricing, you need higher volume to generate meaningful revenue.

**Best Practice Recommendation:**
- Track actual conversion rate from day 1
- Focus on ASO and word-of-mouth for volume
- Consider price increase to $9.99 if conversion holds

#### 7.2 A/B Testing — SIMPLIFIED

**Recommendation:** RevenueCat supports A/B testing. May test $4.99 vs $9.99 post-launch if volume is good but revenue is low.

---

## 8. Phase Dependencies & Parallelization

> **STATUS: SIMPLIFIED** — Reduced from 11 phases to 6 phases.

### Updated Plan

Phases are now:
- Phase 0: Account & Service Setup
- Phase 1: Infrastructure
- Phase 2: Core UI + Premium
- Phase 3: Design System (Ghibli)
- Phase 4: Garden
- Phase 5: Capacitor & iOS
- Phase 6: Launch & Post-Launch

### Parallelization Opportunities

| Phase | Could Start | After |
|-------|-------------|-------|
| Phase 3 (Design) | During Phase 1 | Phase 0 (CSS/Tailwind changes are independent) |
| Phase 4 (Garden prototype) | During Phase 2 | Phase 1 (just needs session data concept) |
| Privacy Policy / ToS writing | During Phase 4 | None (legal docs are independent) |

**Best Practice Recommendation:**
Create a visual dependency graph. Identify the critical path. Parallelize non-critical work.

```
Phase 0 ─────────────────────────────────────────────────────────>
         │
         └─> Phase 1 ──> Phase 2 ──> Phase 3 ──> Phase 6 ──> Phase 7 ──> Phase 9 ──> Phase 10
                │          │
                │          └─> Phase 4 (parallel)
                │
                └─> Phase 5a ──> Phase 5b ──> Phase 5c

Phase 8 can start after Phase 3

Spirit assets: anytime
Legal docs: anytime
```

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| All | Add visual dependency diagram to roadmap |
| Phase 4 | Can start immediately after Phase 0 |
| Phase 5a | Can start during Phase 1 |

---

## 9. Database & Security

> **STATUS: SIMPLIFIED** — Local-only storage using Dexie (IndexedDB). No cloud database.

### Updated Plan

- Dexie (IndexedDB) for all local storage
- No Supabase, no cloud database
- No RLS concerns (single-user local storage)
- No multi-user security concerns

### Concerns — MOSTLY ELIMINATED

#### 9.1 RLS Policy Details — ELIMINATED

~~**The Problem:**~~
~~RLS policies are a common source of security vulnerabilities.~~

**Resolution:** No cloud database = no RLS = no cross-user data leakage risk.

#### 9.2 Schema Migration — STILL RELEVANT

**The Problem:**
Dexie schema changes after launch need careful handling.

**Best Practice Recommendation:**
- Design Dexie schema with versioning from day 1
- Document migration framework
- Test: install v1.0, use for a week, upgrade to v1.1, verify data integrity

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 1 | Add Dexie schema versioning |

---

## 10. Build Execution Recommendations

> **STATUS: UPDATED** — Simplified based on reduced scope.

### Summary of Required Changes

#### Critical (Must Address Before Build)

| # | Issue | Resolution | Phase Impact |
|---|-------|------------|--------------|
| 1 | Garden prototype validation | Build standalone p5.js prototype with 16 visual states | Phase 4 |
| 2 | Crash reporting | Add Sentry in Phase 1 | Phase 1 |
| 3 | Screen lock handling | Add keep-awake plugin | Phase 5 |
| 4 | Timer lifecycle | Save state on background, recover on foreground | Phase 5 |

~~| 5 | RLS policies | Document and test explicitly | Phase 1 |~~ — ELIMINATED (local-only)
~~| 6 | Sync tombstones | Add deleted_at column, never hard delete | Phase 6a |~~ — ELIMINATED
~~| 7 | Year Summary fallback | Have static version ready | Phase 7 |~~ — ELIMINATED

#### Advisory (Strongly Recommended)

| # | Issue | Resolution | Phase Impact |
|---|-------|------------|--------------|
| 8 | Analytics | Add PostHog or similar | Phase 2 |
| 9 | CI/CD | Add GitHub Actions | Phase 1 |
| 10 | Automated tests | Add Vitest, test critical paths | Phase 1, 5a, 6 |
| 11 | Accessibility | Add VoiceOver testing | All phases |

---

### Day 1 Coding Session Guidelines

When beginning the build, follow these practices:

1. **Start with infrastructure, not features**
   - Phase 1 should include: Supabase tables, RLS policies, Sentry, CI/CD, test framework
   - This foundation prevents debugging nightmares later

2. **Create Garden prototype before any Garden code enters main repo**
   - Separate folder or repo
   - Prove the concept works before integrating

3. **Document as you go**
   - Every non-obvious decision should have a code comment explaining why
   - Future you (and Claude) will thank you

4. **Commit frequently with meaningful messages**
   - Each task in a phase = one commit
   - Makes rollback surgical if needed

5. **Test checklist items immediately, not at phase end**
   - Finding bugs early is cheaper than finding them late

6. **If stuck for 2+ hours, pause and document**
   - Write down: what you tried, what failed, what error messages you saw
   - This context helps when asking for help

---

### Risk Monitoring During Build

| Risk | Early Warning Sign | Response |
|------|-------------------|----------|
| Garden visual quality | Prototype doesn't feel magical at 1-week mark | Pivot to hybrid/milestone approach |
| Sync bugs | Edge cases keep appearing through Phase 6c | Simplify to explicit sync for v1.0 |
| Year Summary complexity | Still debugging animation at 2 weeks in Phase 7 | Ship static version, animate in v1.1 |
| Performance issues | Lag/memory issues in Phase 5b testing | Reduce canvas complexity, consider Rive |
| Timeline slip | Any phase takes 2x expected time | Re-evaluate scope for v1.0 |

---

### Communication Template

When reviewing progress or seeking guidance, provide context in this format:

```
## Current Phase
Phase X: [Name]

## What's Working
- [List of completed tasks]

## What's Blocking
- [Specific issue with error messages/behavior]

## What I've Tried
- [List of attempted solutions]

## Questions
- [Specific questions requiring decisions]
```

This structure enables efficient assistance without requiring full context reconstruction.

---

## Conclusion

> **STATUS: UPDATED** — Scope simplification has significantly reduced risk.

This roadmap represents strong product and technical thinking. The philosophical grounding is sound, the phased approach is sensible, and the escape hatches show wisdom.

**Updated risk assessment after scope simplification:**

The primary risks ~~are~~ **were**:
1. ~~**Two high-complexity items (Garden, Sync) in the critical path**~~ → **Now only Garden** (Sync eliminated)
2. ~~**Missing operational infrastructure (crash reporting, analytics, testing)**~~ → **Addressed** (Sentry, Vitest added)
3. ~~**Year Summary scope potentially exceeding timeline**~~ → **Eliminated** (feature removed)

**Remaining risks:**
1. **Garden visual quality** — Prototype must feel magical before full integration
2. **16 visual states complexity** — Season × Time combinations must look coherent
3. **iOS platform edge cases** — Keep-awake and timer lifecycle must be bulletproof

**Recommendation:** Proceed with build. The simplified scope has removed the highest-risk components. Focus on Garden prototype validation early, and the remaining work is manageable.

---

*Review prepared for technical handoff. Document may be referenced during development for architecture decisions and risk assessment.*

*Updated January 2026 to reflect simplified scope: local-only storage, $4.99 one-time purchase, no Year Summary, no Spirit companion, no interval bells.*
