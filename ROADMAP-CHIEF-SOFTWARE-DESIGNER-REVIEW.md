# Chief Software Designer Review
## 10,000 Hours iOS Commercialization Roadmap

**Review Date:** January 2026
**Reviewer Role:** Chief Software Architect / Senior Technical Lead
**Document Under Review:** ROADMAP.md
**Review Type:** Pre-Build Technical & Architectural Assessment

---

## Executive Summary

This review evaluates the proposed commercialization roadmap for transforming a meditation timer PWA into a commercially viable iOS application. The roadmap demonstrates strong product thinking, clear philosophical grounding, and above-average technical planning. However, several areas require deeper consideration before build commencement.

**Overall Assessment:** Proceed with conditions
**Risk Level:** Medium-High (two high-complexity components in critical path)
**Recommended Modifications:** 7 critical, 4 advisory

---

## Table of Contents

1. [Garden Technical Architecture](#1-garden-technical-architecture)
2. [Sync Engine Design](#2-sync-engine-design)
3. [Year Summary Scope & Complexity](#3-year-summary-scope--complexity)
4. [Missing Infrastructure](#4-missing-infrastructure)
5. [iOS Platform Considerations](#5-ios-platform-considerations)
6. [Testing Strategy](#6-testing-strategy)
7. [Revenue & Conversion Assumptions](#7-revenue--conversion-assumptions)
8. [Phase Dependencies & Parallelization](#8-phase-dependencies--parallelization)
9. [Database & Security](#9-database--security)
10. [Build Execution Recommendations](#10-build-execution-recommendations)

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

**The Problem:**
The roadmap specifies "Spirit companion: AI-generated PNG sprites at evolution stages, animated via CSS." This creates two separate rendering contexts:
- Tree: p5.js canvas (rasterized, procedural)
- Spirit: HTML/CSS layer (vector-ish, discrete frames)

These may feel visually disconnected—like a sticker placed on a painting.

**Why This Matters:**
The Garden should feel like one unified, breathing world. A spirit that doesn't blend with the tree's visual style breaks immersion.

**Alternative to Consider:**
Render spirit within the p5.js canvas itself. Pre-render sprite sheets, but draw them using `p5.image()` so they share the same visual context, color grading, and potential post-processing effects.

**Best Practice Recommendation:**
If using separate layers (CSS + canvas), ensure:
- Matching color palettes (same warmth, saturation)
- Synchronized animation timing (spirit breathes at same rhythm as tree)
- Consistent drop shadows / atmospheric effects
- Z-layering that makes sense (spirit in front of tree, behind certain leaves?)

**Mitigation if Keeping Current Plan:**
- Add "visual coherence check" to Phase 5c test checklist
- Generate spirit sprites in same color palette as tree renders
- Consider adding subtle CSS filter to spirit to match canvas aesthetic (blur, warm tint)

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 5c | Add visual coherence validation before marking complete |
| Phase 7 | Year Summary spirit animations must feel part of tree journey |

---

## 2. Sync Engine Design

### Current Plan (Phase 6)

The roadmap describes an offline-first architecture with:
- Dexie (IndexedDB) for local storage
- Supabase PostgreSQL for cloud storage
- Background sync with "last-write-wins" conflict resolution
- UUID-based deduplication

Phase 6 is correctly marked as **High Risk / High Difficulty**.

### Concerns

#### 2.1 Conflict Resolution Underspecified

**The Problem:**
"Last-write-wins" sounds simple but masks significant complexity:

| Scenario | What Happens? |
|----------|--------------|
| Device A edits session, goes offline. Device B deletes same session, syncs. A comes online. | Conflict: edit vs delete |
| Device A clock is 5 minutes ahead. Both devices edit same session "simultaneously." | Which timestamp wins? |
| Network fails mid-sync. 3 of 7 sessions upload. | Partial sync state—how to resume? |
| User reinstalls app. Sync pulls 500 sessions. | Performance? Progress indicator? |

**Why This Matters:**
Sync bugs cause data loss. Data loss in a meditation tracking app destroys the entire value proposition (the tree *is* the accumulated sessions). One sync bug that loses a user's data = one-star review.

**Alternative to Consider:**
For v1.0, implement **explicit, user-initiated sync**:
- "Sync Now" button in Settings
- Visual confirmation of sync status
- Manual conflict resolution (if conflict detected, show both versions, let user choose)

This is less elegant but dramatically reduces edge cases.

**Best Practice Recommendation:**
If implementing automatic sync:

1. **Tombstones for deletes**: Never hard-delete locally. Mark `deleted_at` timestamp. Sync the tombstone. Prune tombstones after 30 days.

2. **Vector clocks or hybrid logical clocks**: Instead of wall-clock timestamps, use a clock that handles device disagreement. Libraries like `hlc-timestamp` can help.

3. **Idempotent sync operations**: Every sync operation should be safe to retry. Use `UPSERT` semantics.

4. **Sync transaction log**: Record every sync operation with before/after state. Critical for debugging production issues.

**Mitigation if Keeping Current Plan:**
- Add comprehensive sync logging (console in dev, remote logging in prod)
- Create explicit test cases for every edge case in table above
- Add "last sync status" display that shows exactly what happened
- Implement sync pause/resume (if network drops mid-sync, resume where left off)
- Add data integrity check: sum of local session durations should match cloud

**Pitfalls to Watch For:**
1. **Race condition on session save**: User ends session, triggers save, triggers sync. If sync is already running, new session might not be included.
2. **Supabase RLS policies**: If misconfigured, user A could potentially read user B's sessions. Triple-check policies.
3. **IndexedDB storage limits**: iOS Safari limits IndexedDB to ~50MB per origin in some conditions. Monitor storage usage.
4. **Supabase row-level security vs column-level**: Ensure `user_id` is checked on every operation.

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 1 | RLS policies must be bulletproof from day 1 |
| Phase 6a | Add tombstone mechanism to schema changes |
| Phase 6b | Add conflict detection before merge |
| Phase 6c | Extend timeline—this is where bugs hide |
| Phase 7 | Year Summary depends on complete, accurate sync history |
| Phase 10 | Add sync reliability to beta testing checklist |

---

#### 2.2 Schema Migration Strategy

**The Problem:**
The roadmap defines a database schema but doesn't address how schema changes will be handled after launch.

**Why This Matters:**
When v1.1 adds a new field to the `sessions` table, you need:
- Supabase migration script
- Dexie schema version bump and migration
- Compatibility layer for old data

Without planning this now, v1.1 becomes a migration nightmare.

**Best Practice Recommendation:**
- Design Dexie schema with `version` field from day 1
- Create migration framework even if only one migration exists at launch
- Document schema versioning strategy in technical docs
- Test: install v1.0, use for a week, upgrade to v1.1, verify data integrity

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 1 | Add schema versioning to Dexie setup |
| Phase 6a | Document migration approach |
| Phase 11 | v1.1 planning must include migration testing |

---

## 3. Year Summary Scope & Complexity

### Current Plan (Phase 7)

"The Tree Remembers" is a temporal journey through the user's meditation year, featuring:
- Tree rewind from current state to seed
- Growth replay with key moments highlighted
- Seasonal lighting changes
- Spirit reactions at milestones
- 60-90 second auto-advancing experience
- Blur mode for free users as FOMO mechanism

### Concerns

#### 3.1 Architectural Complexity

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

#### 5.2 Background Audio for Interval Bells

**The Problem:**
If the user locks their phone or switches apps during meditation, interval bells may not play. iOS restricts background audio to specific use cases.

**Why This Matters:**
Interval bells are a premium feature. If they don't work reliably, users will complain.

**Best Practice Recommendation:**
Configure audio session for playback:

```swift
// In iOS native code (AppDelegate.swift or via plugin)
do {
    try AVAudioSession.sharedInstance().setCategory(
        .playback,
        mode: .default,
        options: [.mixWithOthers]
    )
    try AVAudioSession.sharedInstance().setActive(true)
} catch {
    print("Failed to configure audio session")
}
```

Also add `audio` to `UIBackgroundModes` in Info.plist.

**Mitigation:**
- Consider shipping interval bells as "works when app is in foreground" in v1.0
- Add background audio support in v1.1 after more testing

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 8 | Interval bells section needs iOS audio session configuration |
| Phase 9 | Info.plist must include background modes |
| Phase 10 | Test bells with screen locked |

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

### Current Plan

- 5% conversion rate assumed
- $29.99/year and $99.99/lifetime pricing
- Revenue projections based on download volume

### Concerns

#### 7.1 Conversion Rate Optimism

**The Problem:**
5% is at the high end of freemium conversion rates. Cold App Store traffic often converts at 1-3%.

**Why This Matters:**
Revenue projections may be 2-3x too optimistic, affecting financial planning.

**Best Practice Recommendation:**
Model three scenarios:

| Scenario | Conversion | Year 1 Revenue (50K downloads) |
|----------|------------|-------------------------------|
| Pessimistic | 2% | ~$35,000 |
| Realistic | 3.5% | ~$61,000 |
| Optimistic | 5% | ~$87,500 |

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 11 | Track actual conversion rate; adjust expectations |

---

#### 7.2 No Paywall A/B Testing

**The Problem:**
The roadmap shows one paywall design with no plan to test alternatives.

**Why This Matters:**
Small changes in paywall copy, layout, or pricing presentation can 2x conversion rates. Shipping without iteration capability leaves money on the table.

**Best Practice Recommendation:**
Design paywall component to support A/B testing from day 1:
- Feature flag for paywall variant
- Track which variant was shown at conversion
- Plan for at least 2 variants in first month post-launch

RevenueCat has built-in paywall experimentation features.

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 3 | Design Paywall component to support variants |
| Phase 11 | Plan A/B test for week 2 post-launch |

---

## 8. Phase Dependencies & Parallelization

### Current Plan

Phases are mostly sequential (0 -> 1 -> 2 -> ... -> 10).

### Concerns

#### 8.1 Suboptimal Parallelization

**The Problem:**
Some work could happen in parallel, reducing total timeline:

| Phase | Could Start | After |
|-------|-------------|-------|
| Phase 4 (Design) | Immediately | None (CSS/Tailwind changes don't need auth) |
| Phase 5a (Garden math) | During Phase 2 | Phase 1 (just needs session data) |
| Spirit asset generation | Immediately | None (AI art is independent) |
| Privacy Policy / ToS writing | During Phase 8 | None (legal docs are independent) |

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

### Current Plan

Supabase with Row Level Security (RLS), schema defined for profiles and sessions.

### Concerns

#### 9.1 RLS Policy Details Missing

**The Problem:**
The roadmap mentions "Add policies: users can only read/write their own data" but doesn't show the actual policies. Incorrect RLS policies are a common source of security vulnerabilities.

**Why This Matters:**
If RLS policies are misconfigured, User A could read User B's meditation history. This is a privacy violation and potential GDPR issue.

**Best Practice Recommendation:**
Document and test RLS policies explicitly:

```sql
-- profiles: users can only access their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- sessions: users can only access their own sessions
CREATE POLICY "Users can read own sessions"
ON sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
ON sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
ON sessions FOR DELETE
USING (auth.uid() = user_id);
```

Add to Phase 1:
```
- [ ] Write RLS policies explicitly (document in code)
- [ ] Test: User A cannot read User B's sessions
- [ ] Test: User A cannot insert session with User B's user_id
- [ ] VERIFY: All tests pass
```

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 1 | Add explicit RLS policy creation and testing |

---

#### 9.2 Missing Indexes

**The Problem:**
No database indexes specified. As session count grows, queries will slow.

**Best Practice Recommendation:**
Add indexes for common query patterns:

```sql
-- Sessions by user, ordered by time (most common query)
CREATE INDEX idx_sessions_user_time
ON sessions(user_id, start_time DESC);

-- For sync: find unsynced sessions
-- (if adding a synced_at column for sync status)
CREATE INDEX idx_sessions_sync_status
ON sessions(user_id, synced_at)
WHERE synced_at IS NULL;
```

**Roadmap Impact:**
| Phase | Impact |
|-------|--------|
| Phase 1 | Add index creation to Supabase setup |

---

## 10. Build Execution Recommendations

### Summary of Required Changes

#### Critical (Must Address Before Build)

| # | Issue | Resolution | Phase Impact |
|---|-------|------------|--------------|
| 1 | Garden prototype validation | Build standalone p5.js prototype before Phase 5 code | Phase 5a |
| 2 | Crash reporting | Add Sentry in Phase 1 | Phase 1 |
| 3 | Screen lock handling | Add keep-awake plugin | Phase 9 |
| 4 | Timer lifecycle | Save state on background, recover on foreground | Phase 9 |
| 5 | RLS policies | Document and test explicitly | Phase 1 |
| 6 | Sync tombstones | Add deleted_at column, never hard delete | Phase 6a |
| 7 | Year Summary fallback | Have static version ready if animation proves too complex | Phase 7 |

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

This roadmap represents strong product and technical thinking. The philosophical grounding is sound, the phased approach is sensible, and the escape hatches show wisdom.

The primary risks are:
1. **Two high-complexity items (Garden, Sync) in the critical path**
2. **Missing operational infrastructure (crash reporting, analytics, testing)**
3. **Year Summary scope potentially exceeding timeline**

With the modifications outlined in this review, the project has a clear path to successful launch. The key is disciplined execution: prototype before committing, test as you go, and have fallback plans for high-risk components.

**Recommendation:** Proceed with build after addressing the seven critical items. Maintain weekly check-ins against the risk monitoring table. Preserve the philosophical foundations—they differentiate this product—while being pragmatic about scope.

---

*Review prepared for technical handoff. Document may be referenced during development for architecture decisions and risk assessment.*
