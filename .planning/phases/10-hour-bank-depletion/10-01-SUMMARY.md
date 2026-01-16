---
phase: 10-hour-bank-depletion
plan: 01
status: complete
---

# Phase 10-01 Summary: Hour Bank Depletion Logic

## What Was Built

### 1. Fixed Deficit Accounting (`src/lib/hourBank.ts`)

- **Bug fixed**: `addPurchasedHours()` was ignoring deficit by simply adding hours to available
- **Solution**: Calculate `newAvailable = Math.max(0, newTotalPurchased - totalConsumedHours)`
- Added `deficit` field to `getHourBalance()` return type
- Deficit = `Math.max(0, totalConsumedHours - totalPurchasedHours)`

### 2. Store State Updates (`src/stores/useHourBankStore.ts`)

Added new state fields:

- `deficit: number` - Hours owed (0 if none)
- `isLowHours: boolean` - true if available < 1 hour
- `isCriticallyLow: boolean` - true if available < 30 minutes and > 0

Updated `hydrate()` and `refreshBalance()` to compute these flags.

Added dev function:

- `devSetHourBank(purchased, consumed)` - directly set hour bank state for testing

### 3. Timer Low Hours Hint (`src/components/Timer.tsx`)

- When `isLowHours && available > 0`: hint shows "47m remaining · tap to meditate"
- When `isCriticallyLow`: shows warning modal before session starts
- Extracted `startSession()` to allow calling from warning modal

### 4. LowHoursWarning Modal (`src/components/LowHoursWarning.tsx`) - NEW

Modal appears when tapping to start with < 30 minutes remaining:

- Title: "Running Low"
- Message: "You have Xm remaining. Top up now to avoid losing meditation time to deficit."
- Buttons: "Continue" (proceeds) | "Top Up" (opens paywall)

### 5. Paywall Deficit Message (`src/components/Paywall.tsx`)

When deficit > 0:

- Shows: "Xm will be applied to your next purchase."

### 6. Store Deficit Display (`src/components/Store.tsx`)

When deficit > 0:

- Info box: "Previous session overage: Xm"
- Subtitle: "This will be deducted from your purchase."

### 7. Dev Tools (`src/components/Settings.tsx`)

Added Hour Bank Testing section in Dev Tools:

- Current state display (purchased/consumed/available/deficit)
- Manual input fields for custom values
- Quick presets:
  - **Low (48m left)** - triggers low hours hint
  - **Critical (24m left)** - triggers warning modal
  - **Deficit (30m owed)** - shows deficit messages
  - **Full (10h)** - normal state
  - **Empty (paywall)** - triggers paywall

Added Review Prompt Testing:

- Goal Reached button
- 10 Hour Milestone button
- 25 Hour Milestone button

## Files Modified

| File                                 | Changes                                                            |
| ------------------------------------ | ------------------------------------------------------------------ |
| `src/lib/hourBank.ts`                | Fixed `addPurchasedHours()`, added deficit to `getHourBalance()`   |
| `src/stores/useHourBankStore.ts`     | Added deficit/isLowHours/isCriticallyLow state, `devSetHourBank()` |
| `src/components/Timer.tsx`           | Low hours hint, warning modal integration                          |
| `src/components/LowHoursWarning.tsx` | **New** - warning modal                                            |
| `src/components/Paywall.tsx`         | Deficit message                                                    |
| `src/components/Store.tsx`           | Deficit info box                                                   |
| `src/components/Settings.tsx`        | Hour bank dev tools, review prompt testing                         |

## Verification

- [x] `npm run build` - passes
- [x] `npm run lint` - passes (warnings only, no errors)
- [x] TypeScript compiles without errors

## User Flow

```
[User has 47m remaining, taps to meditate]
                    ↓
        ┌───────────────────────┐
        │ Available < 30m?      │
        └───────────────────────┘
               ↓ YES
    [LowHoursWarning Modal]
    "You have 47m remaining.
     Top up now to avoid deficit."
    [Top Up]  [Continue]
               ↓ Continue
        [Session Starts]
        (meditates 1 hour)
               ↓
        [Session Ends]
        Cumulative: +1 hour ✓
        Consumed: +1 hour
        Available: 0 (clamped)
        Deficit: 13m (tracked)
               ↓
    [Next session attempt]
        [Paywall appears]
        "13m will be applied to
         your next purchase."
               ↓
        [User purchases 10h]
        Gets: 9h 47m (10h - 13m deficit)
```

## Testing Instructions

1. Go to Settings > Dev Tools
2. Use Hour Bank Testing presets to test each state
3. Use Review Prompt Testing to trigger review modals

---

_Completed: 2026-01-16_
