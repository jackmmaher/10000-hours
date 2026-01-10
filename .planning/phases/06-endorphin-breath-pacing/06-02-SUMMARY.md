---
phase: 06-endorphin-breath-pacing
plan: 02
status: complete
---

## Summary

Integrated breath pacing into Timer orb visualization.

## Changes Made

### `src/components/Timer.tsx`
- Added imports for `useBreathPacing` and `getBreathPattern`
- Get active pattern from settings when breath pacing enabled
- `useBreathPacing` hook tracks breath state during running timer
- `getOrbScale()` function calculates orb scale based on breath phase:
  - Inhale: 1.0 → 1.12 (expanding)
  - Hold: 1.12 (expanded)
  - Exhale: 1.12 → 1.0 (contracting)
  - Hold Empty: 1.0 (contracted)
- Applied scale transform to orb container with smooth 100ms transition
- Added breath phase text indicator below orb when pacing enabled:
  - "Breathe in..." / "Breathe out..." / "Hold..." / "Empty..."
- Text is very subdued (text-indigo-deep/40) - presence, not demand

## Deferred

- **Post-session body awareness prompt**: Can be added to InsightCapture
- **Settings UI for breath pacing**: Patterns can be controlled via settings

## Design Principles

- **Subtle scale** (12% max): Enhances without distracting
- **Smooth transitions**: 100ms ease-out for natural feel
- **Optional text**: Present but not demanding attention
- **Respects orb animation**: Works with existing breathing animation

## Verification

- [x] `npm run build` passes
- [x] Orb visually responds to breath phases
- [x] Text indicator shows current phase
- [x] Works alongside existing orb animations
- [x] Respects breath pacing enabled setting

## Phase 06 Complete

Endorphin breath pacing implemented:
- 3 breath patterns with haptic sync (Plan 01)
- Orb visualization integration (Plan 02)
- Full opt-in control via settings
