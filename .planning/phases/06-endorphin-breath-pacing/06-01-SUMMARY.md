---
phase: 06-endorphin-breath-pacing
plan: 01
status: complete
---

## Summary

Created breath pacing infrastructure with patterns, hook, and settings.

## Changes Made

### `src/lib/breathPacing.ts` (new file)
- Defined `BreathPhase` type: 'inhale' | 'hold' | 'exhale' | 'holdEmpty'
- Defined `BreathPattern` interface with phases and durations
- Three patterns available:
  - **Simple**: 4s in, 4s out (8s cycle)
  - **Box Breathing**: 4s inhale, 4s hold, 4s exhale, 4s hold (16s cycle)
  - **4-7-8 Relaxation**: 4s inhale, 7s hold, 8s exhale (19s cycle)
- `getBreathPattern(id)` - returns pattern by ID
- `getAllBreathPatterns()` - returns all patterns

### `src/hooks/useBreathPacing.ts` (new file)
- Manages breath pacing state during meditation
- Tracks current phase, progress (0-1), time remaining, cycle count
- 100ms tick interval for smooth visual updates
- Triggers haptic feedback (breatheIn/breatheOut) on phase transitions
- Respects `breathHapticsEnabled` setting

### `src/stores/useSettingsStore.ts`
- Added `breathPacingEnabled: boolean` (default: false, opt-in)
- Added `breathPatternId: string | null` (default: 'simple')
- Added `breathHapticsEnabled: boolean` (default: true)
- Added `setBreathPacing()` and `setBreathHapticsEnabled()` actions

### `src/lib/db.ts`
- Added breath pacing fields to `UserSettings` interface

## Verification

- [x] `npm run build` passes
- [x] 3 well-researched breath patterns defined
- [x] useBreathPacing hook tracks phase state
- [x] Settings store has breath pacing preferences
- [x] Default is OFF (open awareness is valid)
