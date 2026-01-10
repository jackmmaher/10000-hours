---
phase: 04-oxytocin-attribution
plan: 02
status: complete
---

## Summary

Built reciprocity dashboard showing community give/receive balance.

## Changes Made

### `src/lib/reciprocity.ts` (new file)
- `getReciprocityData(userId)` - fetches give/receive stats:
  - Received: karma, saves, completions on your content
  - Given: karma, saves, completions of others' content
- Reuses Supabase queries efficiently

### `src/components/ReciprocityCard.tsx` (new file)
- Visual card showing give/receive balance
- Balance ratio calculation with positive messaging:
  - "You give more than you receive" (generous)
  - "Beautiful balance of give and take" (balanced)
  - "The community is supporting you" (receiver)
- All states are positive - no judgment language
- Hidden when no community interactions

### `src/components/Profile.tsx`
- Integrated ReciprocityCard after WellbeingCard
- Loads reciprocity data for authenticated users
- Card only appears when user has community interactions

## Deferred

- **Gratitude prompt after community meditations**: Requires passing template context through session flow. Can be added later by:
  1. Passing linkedPlan info to InsightCapture
  2. Showing appreciation button if sourceTemplateId exists
  3. Incrementing appreciation_count on template

## Verification

- [x] `npm run build` passes
- [x] ReciprocityCard renders with data
- [x] Balance messaging is always positive
- [x] Card hidden when no community interactions

## Phase 04 Complete

Oxytocin attribution system implemented:
- Attribution tracking and notifications (Plan 01)
- Reciprocity dashboard (Plan 02)
- Warm, personal language throughout
