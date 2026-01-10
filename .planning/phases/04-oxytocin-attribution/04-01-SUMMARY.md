---
phase: 04-oxytocin-attribution
plan: 01
status: complete
---

## Summary

Built attribution tracking system to show users when their content helps others.

## Changes Made

### `src/lib/attribution.ts` (new file)
- `getAttributionStats(userId, timeframe)` - queries Supabase for:
  - Template completions by others
  - Pearl saves by others
  - Upvotes received
- `generateAttributionNotification(userId)` - creates warm, personal notifications:
  - "Your wisdom is spreading" - when both templates and pearls helped
  - "You helped someone meditate" - when templates completed
  - "Your pearl resonated" - when pearls saved
- `shouldCheckAttribution()` / `markAttributionChecked()` - weekly throttling

### `src/App.tsx`
- Added weekly attribution check on app load (5 second delay)
- Respects weekly throttle to avoid notification spam
- Only runs for authenticated users

## Language Principles

- Warm and personal: "You helped someone", not "3 users engaged"
- Singular vs plural: "Someone saved your pearl" vs "5 people saved your pearls"
- No corporate speak, only human connection

## Verification

- [x] `npm run build` passes
- [x] Attribution stats query implemented
- [x] Notification generated with warm language
- [x] Weekly check doesn't spam (once per week max)
