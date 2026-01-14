# 09-02 Summary: Visual Indicators

**Status:** Complete
**Date:** 2026-01-14

## What Was Built

### Calendar Visual Indicators

- Today always has accent glow ring (`boxShadow: 0 0 0 2px var(--accent)`)
- Today with future plan shows dot indicator in corner
- Future planned dates use **outline style** (transparent bg + accent border)
- Clear distinction from filled past session dates

### WeekStones Visual Indicators

- Removed confusing "next" (tomorrow) highlight
- Today always has glow ring to draw the eye
- New states: `today-with-session`, `today-with-plan`, `today-dual`
- Future planned orbs use outline style (transparent + accent border)
- All indicator dots have white border (`var(--bg-base)`) for contrast
- Dots enlarged to w-2.5 for visibility

### Visual Hierarchy

- **Outline** = planned/upcoming (not yet done)
- **Filled** = completed (done)
- **Glow ring** = today (always prominent)
- **Dot with border** = plan indicator (visible on any background)

## Files Modified

- `src/components/Calendar.tsx` - Today glow, future plan outline style
- `src/components/WeekStones.tsx` - New states, removed 'next', dot contrast
- `src/components/Journey/index.tsx` - Removed isNextPlannable logic

## Verification

- Today is always visually prominent
- Future planned vs past completed clearly distinguishable
- Theme-aware - no hardcoded colors
