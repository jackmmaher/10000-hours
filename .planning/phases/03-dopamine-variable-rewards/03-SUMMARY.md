---
phase: 03-dopamine-variable-rewards
status: complete
---

## Summary

Added variable dopamine rewards via session count milestones and weekly first detection.

## Changes Made

### `src/lib/milestones.ts`
- Added `SessionMilestone` interface for session count milestones (50th, 100th, etc.)
- Added `WeeklyFirstMilestone` interface for weekly first detection
- Added `checkSessionMilestone(count)` - triggers at 50, 100, 200, 365, 500, 1000, etc.
- Added `checkWeeklyFirst(startTime, duration, weekSessions)` - detects:
  - First morning session (5-10am) this week
  - First evening session (6-10pm) this week
  - First 30+ minute session this week
- Each milestone type has zen-neutral messaging:
  - Session: "Each moment matters."
  - Morning: "A beautiful beginning."
  - Evening: "A peaceful close."
  - Long session: "Depth found in stillness."

### `src/stores/useSessionStore.ts`
- Updated `justAchievedMilestone` type to union: `Achievement | SessionMilestone | WeeklyFirstMilestone | null`
- Updated `stopTimer` to check all three milestone types
- Priority order: hour milestone > session count > weekly first
- Week start calculation for weekly first detection

### `src/components/MilestoneCelebration.tsx`
- Added type detection via `'type' in justAchievedMilestone`
- New milestone types use their `label` and `zenMessage` properties
- Legacy hour-based milestones still work unchanged

## Verification

- [x] `npm run build` passes
- [x] TypeScript types compile correctly
- [x] Milestone priority system in place
- [x] Zen-neutral messaging for all milestone types

## Design Principles Applied

- **Variable rewards**: Session milestones at irregular intervals (50, 100, 200, 365...)
- **Surprise factor**: Weekly firsts are unpredictable based on user behavior
- **Zen neutrality**: "Each moment matters." not "Amazing streak!"
- **Non-gamified**: No streaks, no points, just quiet acknowledgment
