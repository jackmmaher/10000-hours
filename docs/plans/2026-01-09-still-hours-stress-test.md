# Still Hours Pivot — Stress Test Report

**Date:** 2026-01-09
**Purpose:** Identify gaps, edge cases, and issues in the design document

---

## CRITICAL ISSUES (Must Fix)

### 1. MILESTONES Defined in TWO Places

**Problem:** The design document only mentions `calculations.ts`, but `MILESTONES` is actually defined in `tierLogic.ts` and used by critical components.

**Files affected:**
- `src/lib/tierLogic.ts:79` — `export const MILESTONES = [...]` (THE ACTUAL SOURCE)
- `src/lib/calculations.ts:104` — `const MILESTONE_HOURS = [...]` (internal duplicate)

**Used by:**
- `AchievementGallery.tsx:12,56,57` — imports from tierLogic
- `useSessionStore.ts:4,139` — imports from tierLogic
- `tierLogic.test.ts` — tests the tierLogic export

**Fix:** Design must specify:
1. Remove `MILESTONE_HOURS` from `calculations.ts` entirely
2. Export `generateMilestones(goalHours?)` from `calculations.ts`
3. Update `tierLogic.ts` to import/re-export from calculations, OR deprecate the export
4. Update all consumers to use the new function

---

### 2. Enlightenment Check Uses Fixed GOAL_SECONDS

**Problem:** `useSessionStore.ts:142` hardcodes the enlightenment threshold:
```typescript
const crossedThreshold = !hasReachedEnlightenment && newTotalSeconds >= GOAL_SECONDS
```

**Required changes:**
- `useSessionStore` needs access to user's `practiceGoalHours`
- If no goal set (infinite mode), enlightenment should never trigger
- If goal set, enlightenment triggers at `goalHours * 3600` seconds

**Fix:** Add to design:
```typescript
// In stopTimer():
const userGoal = await getUserPreferences().then(p => p?.practiceGoalHours)
const goalSeconds = userGoal ? userGoal * 3600 : null
const crossedThreshold = goalSeconds && !hasReachedEnlightenment && newTotalSeconds >= goalSeconds
```

---

### 3. recordMilestoneIfNew Caller Passes Fixed Array

**Problem:** `useSessionStore.ts:139`:
```typescript
const achievedMilestone = await recordMilestoneIfNew(newTotalHours, MILESTONES)
```

The `recordMilestoneIfNew` function correctly accepts milestones as a parameter, but the caller passes the fixed `MILESTONES` constant.

**Fix:** Caller must generate milestones dynamically:
```typescript
const userGoal = await getUserPreferences().then(p => p?.practiceGoalHours)
const milestones = generateMilestones(userGoal)
const achievedMilestone = await recordMilestoneIfNew(newTotalHours, milestones)
```

---

### 4. getAdaptiveMilestone() Has No Goal Parameter

**Problem:** `calculations.ts:129`:
```typescript
export function getAdaptiveMilestone(sessions: Session[]): AdaptiveMilestone
```

This function is used by `AchievementGallery.tsx:46-48` and doesn't accept a goal parameter.

**Fix:** Update signature:
```typescript
export function getAdaptiveMilestone(sessions: Session[], goalHours?: number): AdaptiveMilestone
```

---

### 5. getProjection() Uses Fixed GOAL_SECONDS

**Problem:** `calculations.ts:225-227`:
```typescript
const remainingSeconds = Math.max(0, GOAL_SECONDS - totalSeconds)
const remainingHours = remainingSeconds / 3600
const percentComplete = (totalSeconds / GOAL_SECONDS) * 100
```

**Fix:** Function needs goal parameter:
```typescript
export function getProjection(sessions: Session[], goalHours?: number): ProjectionInsight
```

If no goal, projection should show pace without destination.

---

### 6. Test Coverage Will Break

**Problem:** `tierLogic.test.ts:127-137` tests the fixed MILESTONES array:
```typescript
describe('MILESTONES', () => {
  expect(MILESTONES).toContain(2)
  expect(MILESTONES).toContain(10000)
  // ...
})
```

**Fix:** Add new tests for `generateMilestones()`:
- Test with no goal (infinite mode)
- Test with various goals (25, 50, 100, 500, 1000)
- Test milestone boundaries (edge cases)
- Test goal extension scenario

---

## EDGE CASE ISSUES (User Journey Gaps)

### 7. What Happens When User Has More Hours Than New Goal?

**Scenario:** User has 75 hours. Opens Profile. Wants to set a goal. Sees 50h option.

**Current design:** "Can't set goal below current progress"

**Problem:** User might want to set 100h as their first goal, even though they already passed 50h. The UI should:
1. Show 50h as disabled (already passed)
2. Or show a different message: "You've already achieved this"

**Recommendation:** Update design to show already-passed milestones as "achieved" not just disabled.

---

### 8. Goal Extension: What Milestones Appear?

**Scenario:** User completes 50h goal. Extends to 100h.

**Question:** Do they get milestones at 60, 75, 100? Or recalculated from 0-100?

**Current design says:** "New milestones stitch on seamlessly"

**But:** The `generateMilestones(100)` function would return `[2, 5, 10, 25, 50, 75, 100]` — the 50h milestone already achieved, but 60h isn't in this list.

**Fix:** Need an "extension milestones" function:
```typescript
function generateExtensionMilestones(
  previousGoal: number,
  newGoal: number
): number[] {
  // Returns only milestones between previousGoal and newGoal
  // E.g., 50→100 returns [60, 75, 100] or similar
}
```

---

### 9. Achievement Gallery: What If User Lowers Goal?

**Scenario:** User had 100h goal, achieved 50h milestone. Changes goal to 50h.

**Question:** They now have 100% progress immediately. What happens?

**Recommendation:**
1. Don't allow lowering goal below current progress (design already says this)
2. But what if they're AT the goal? (50h completed, sets 50h goal)
3. Trigger celebration immediately? Or just show "completed" state?

---

### 10. Infinite Mode: When Does Progress Bar "Complete"?

**Scenario:** User in infinite mode (no goal). Progress bar shows progress to next milestone.

**Question:** What happens when they hit the highest predefined milestone in the infinite array?

**Design says:** `[...10000, 15000, 20000, 25000, 50000, 100000]`

**But:** After 100,000 hours (impossible, but edge case), what's next?

**Fix:** Either:
1. Generate milestones algorithmically forever
2. Show "The path is infinite" after 100k
3. Most users will never hit this — document as intentionally unbounded

---

## THEME & ACCESSIBILITY ISSUES

### 11. Goal Preset Buttons: Theme Contrast Check

**Proposed UI:**
```tsx
className={`px-3 py-1.5 text-xs rounded-lg ${
  preferences?.practiceGoalHours === goal
    ? 'bg-moss text-cream'
    : goal <= currentHours
      ? 'bg-cream-deep/50 text-ink/30 cursor-not-allowed'
      : 'bg-cream text-ink/60 hover:bg-cream-deep'
}`}
```

**Issues:**
1. `text-ink/30` on `bg-cream-deep/50` may not meet 4.5:1 contrast in all themes
2. Need to verify across all 20+ theme variants (spring/summer/autumn/winter × morning/day/evening/night)

**Fix:** Use semantic color tokens:
```tsx
style={{
  color: 'var(--text-muted)',
  background: 'var(--surface-disabled)'
}}
```

Or verify contrast for disabled state matches theme engine's accessible text colors.

---

### 12. Living Theme: Goal Section Must Use Theme Tokens

**Problem:** Design proposes hardcoded Tailwind classes: `bg-cream-warm`, `bg-moss`, `text-cream`

**But:** The app uses a living theme system with CSS variables:
- `--text-primary`, `--text-secondary`, `--text-muted`
- `--surface-card`, `--surface-elevated`
- Seasonal variations change colors significantly

**Fix:** Goal UI must use:
```tsx
style={{
  background: 'var(--surface-card)',
  color: 'var(--text-primary)'
}}
```

Audit existing Profile components for consistency (they already use `bg-card/90`, `text-ink`, etc.).

---

### 13. Reduced Motion: Goal Selection Animation

**Scenario:** User has `prefers-reduced-motion: reduce` enabled.

**Question:** Does the goal selection have any animations that need respecting?

**Current design:** Doesn't specify animations for goal selection.

**Recommendation:** Add note to use `transition-colors` only (already accessible), avoid scale transforms.

---

## ARCHITECTURE ISSUES

### 14. State Management: Where Does Goal Live?

**Design says:** `UserPreferences.practiceGoalHours` in IndexedDB

**But:** `useSessionStore` needs the goal to:
1. Calculate milestones when session ends
2. Check enlightenment threshold

**Options:**
A. Read from DB in `stopTimer()` (async, adds latency)
B. Add goal to a preferences store that syncs with DB
C. Pass goal to store actions from components

**Recommendation:** Option A is cleanest (already reading achievements from DB). The latency is negligible for end-of-session operations.

---

### 15. Milestone Recording: Historical Integrity

**Scenario:**
1. User achieves 20h, 30h, 40h, 50h milestones with 50h goal
2. User extends to 100h goal
3. New milestones: 60, 75, 100

**Question:** What about milestones at 25h? The 50h-goal didn't have a 25h milestone, but 100h-goal does.

**Problem:** User now has gap in achievements: 2, 5, 10, 20, 30, 40, 50, [no 25], then 60, 75, 100

**Options:**
A. Retroactively add missed milestones (25h) when goal changes — confusing UX
B. Accept gaps — achievements reflect the goal at the time
C. Never change milestones for achieved range — only add new ones

**Recommendation:** Option C — achievements are historical record of the goal that existed when achieved. Document this behavior.

---

### 16. Database Migration: Existing Achievements

**Scenario:** User upgrades app from v2.1 to v3.0. They have achievements at [2, 5, 10, 25, 50, 100].

**Question:** They never set a goal (v2 didn't have this feature). What happens?

**Answer:** They're in infinite mode by default. Achievements persist. New milestones appear as they progress. No migration needed.

**Document:** This graceful upgrade path in design.

---

## USER EXPERIENCE GAPS

### 17. First-Time Goal Setter: No Onboarding

**Scenario:** User discovers goal-setting in Profile after 30 hours of use.

**Problem:** No explanation of what goals do, how milestones adapt, or that they can extend later.

**Current design:** Has reassurance text "You can always extend your goal later"

**Missing:**
- What happens when I reach my goal?
- Why would I set a goal vs infinite mode?
- Can I remove my goal later?

**Recommendation:** Add brief explainer in expandable section:
> "Setting a destination helps celebrate your progress. You'll see milestones tailored to your goal. When you arrive, you can extend or stay."

---

### 18. Goal Reached: What's the UX?

**Design says:** "Celebration screen (similar to current enlightenment)"

**But:** Current enlightenment shows:
- "After enlightenment, chop wood, carry water."
- Zen message, word by word animation

**Question:** Is this appropriate for someone who set a 25h goal?

**Recommendation:** Different messages based on goal size:
- Small goals (≤100h): "You've arrived. Continue?" (simpler)
- Large goals (>1000h): Full zen enlightenment experience

---

### 19. Goal Selection: Visual Feedback for Current Progress

**Scenario:** User has 73 hours, opens goal selection.

**Problem:** They see presets: 25, 50, 100, 250, 500...

**Missing:** Where am I relative to these options?

**Recommendation:** Show current progress indicator:
```
Your practice: 73 hours

Set a destination:
[25 ✓] [50 ✓] [100 ○ ← next] [250] [500]...
```

---

### 20. Accessibility: Goal Presets Need Labels

**Problem:** Design shows buttons with just numbers: "25h", "50h", etc.

**Missing:** Screen reader context.

**Fix:** Add aria-labels:
```tsx
<button aria-label="Set goal to 25 hours">25h</button>
```

Or use aria-describedby with a visually hidden explanation.

---

## DESIGN DOCUMENT OMISSIONS

### 21. Not Listed: `tierLogic.ts` as File to Update

**Must add to "Files Changed Summary":**
- `src/lib/tierLogic.ts` — Deprecate or update `MILESTONES` export, update `getLastAchievedMilestone()`

### 22. Not Listed: `useSessionStore.ts` Full Changes

**Design says:** "Add goal-reached detection"

**Actually needs:**
- Import `generateMilestones` and `getUserPreferences`
- Update `stopTimer()` to use dynamic milestones
- Update enlightenment check to use user goal

### 23. Not Listed: Test Updates

**Must add:**
- `src/lib/__tests__/tierLogic.test.ts` — Update MILESTONES tests
- Add new tests for `generateMilestones()`
- Add tests for edge cases (goal extension, etc.)

### 24. Missing: Version Migration Notes

**Should document:**
- v2.x → v3.0 upgrade path
- Existing achievements preserved
- Default to infinite mode
- No user action required

---

## SUMMARY: FILES ACTUALLY IMPACTED

| File | Design Said | Actually Needed |
|------|-------------|-----------------|
| `constants.ts` | Rename GOAL_HOURS | ✓ Correct |
| `calculations.ts` | Replace MILESTONE_HOURS | ✓ + export `generateMilestones()` + update `getAdaptiveMilestone()` + update `getProjection()` |
| `tierLogic.ts` | Not mentioned | Update/deprecate MILESTONES, update `getLastAchievedMilestone()` |
| `db.ts` | Add practiceGoalHours | ✓ Correct |
| `Timer.tsx` | Delete text | ✓ Correct |
| `Profile.tsx` | Add goal section | ✓ + use theme tokens |
| `Settings.tsx` | Update footer | ✓ Correct |
| `AchievementGallery.tsx` | Pass goal | ✓ + get goal from preferences |
| `useSessionStore.ts` | "Small" | **Medium** — significant stopTimer changes |
| `MilestoneCelebration.tsx` | Not mentioned | May need goal-aware messaging |
| `ZenMessage.tsx` | Not mentioned | May need goal-aware messaging |
| `tierLogic.test.ts` | Not mentioned | Must update tests |

---

## VERDICT

**Design document is 70% complete.** Core concept is sound, but:

1. **Underestimated scope** — More files impacted than listed
2. **Critical path missing** — `useSessionStore` changes are the lynchpin
3. **Edge cases unaddressed** — Goal extension milestone gaps, theme contrast
4. **Test coverage ignored** — Tests will break without updates

**Recommendation:** Update design document with:
1. Full file impact list (above)
2. `useSessionStore` detailed changes
3. `generateMilestones()` full algorithm with extension support
4. Theme token requirements
5. Test cases to write

---

**End of Stress Test Report**
