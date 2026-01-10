# Still Hours Implementation — Initiation Prompt

Copy and paste this into a new Claude Code terminal session when ready to implement.

---

```
/superpowers:executing-plans

## Task: Implement Still Hours Pivot (v3.0)

Transform "10,000 Hours" meditation app into "Still Hours" with variable user-defined goals.

### Design Document
Read the complete spec at: `docs/plans/2026-01-09-still-hours-pivot-design.md`

### Summary of Changes

**Brand Rename:**
- Settings footer: "10,000 Hours" → "Still Hours"
- index.html title, PWA manifest, package.json

**Core Logic (NEW FILE: `src/lib/milestones.ts`):**
- `generateMilestones(goalHours?)` — returns milestone array based on user goal or infinite mode
- `generateExtensionMilestones(prevGoal, newGoal)` — for goal extensions
- `getNextMilestone()`, `getPreviousMilestone()` — helper functions
- `GOAL_PRESETS = [25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]`

**Files to Update:**
1. `src/lib/constants.ts` — rename GOAL_HOURS → DEFAULT_GOAL_HOURS
2. `src/lib/calculations.ts` — remove MILESTONE_HOURS, update getAdaptiveMilestone(sessions, goalHours?), update getProjection(sessions, goalHours?)
3. `src/lib/tierLogic.ts` — remove MILESTONES array, update getLastAchievedMilestone(hours, goalHours?), re-export from milestones.ts
4. `src/lib/db.ts` — add `practiceGoalHours?: number` to UserPreferences interface
5. `src/stores/useSessionStore.ts` — update stopTimer() to use dynamic milestones and goal-aware enlightenment check
6. `src/components/Timer.tsx` — DELETE lines 327-330 ("toward 10,000 hours" text)
7. `src/components/Profile.tsx` — add "Practice Goal" expandable section with theme-aware UI
8. `src/components/Settings.tsx` — update footer text
9. `src/components/AchievementGallery.tsx` — load user goal, pass to milestone functions

**New Test File: `src/lib/__tests__/milestones.test.ts`**

### Key Constraints
- Goal setting is LOCAL ONLY (IndexedDB UserPreferences, no Supabase sync)
- Use CSS variables for theme compatibility (--text-primary, --surface-primary, --accent-primary, etc.)
- Infinite mode = default (no goal set = milestones continue forever)
- Enlightenment only triggers when user has explicit goal AND reaches it
- Achievements are historical — changing goals doesn't retroactively modify them

### Implementation Order
1. Create `src/lib/milestones.ts` with tests
2. Update `constants.ts`, `tierLogic.ts`, `calculations.ts`
3. Update `useSessionStore.ts` (critical path)
4. Update `AchievementGallery.tsx`
5. Add goal UI to `Profile.tsx`
6. Brand rename (Timer, Settings, index.html, manifest)
7. Run full test suite

### Verification
- [ ] `npm run test` passes
- [ ] `npm run build` succeeds
- [ ] Timer shows no "toward X" text
- [ ] Profile has goal section that expands
- [ ] Setting a 50h goal shows milestones: 2, 5, 10, 20, 30, 40, 50
- [ ] Infinite mode shows: 2, 5, 10, 25, 50, 100, 150...
- [ ] Goal completion triggers enlightenment
- [ ] Theme contrast works in all seasonal themes
```

---

## Alternative: Parallel Agent Approach

If you want to split work across agents:

```
/superpowers:subagent-driven-development

Implement Still Hours pivot from design doc at `docs/plans/2026-01-09-still-hours-pivot-design.md`

Split into parallel workstreams:
1. Agent 1: Core milestone logic (`milestones.ts`, `calculations.ts`, `tierLogic.ts`, tests)
2. Agent 2: Store and component updates (`useSessionStore.ts`, `AchievementGallery.tsx`)
3. Agent 3: UI and branding (`Profile.tsx` goal section, `Timer.tsx`, `Settings.tsx`, manifest)

Coordinate on: `src/lib/milestones.ts` must be created first (dependency for all).
```

---

## Pre-flight Checklist

Before starting implementation, verify:

- [ ] Supabase backend schema work is complete
- [ ] Current branch is clean (`git status`)
- [ ] Tests pass (`npm run test`)
- [ ] You've read the full design doc
