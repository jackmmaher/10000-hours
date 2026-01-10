# Free App Model — Design Document

**Date:** 2026-01-10
**Status:** Ready for implementation
**Scope:** Remove premium tier, simplify onboarding, auth-gate contributions only

---

## Executive Summary

Transform Still Hours from a freemium model to a completely free app. Remove all premium/trial language. The only distinction is **not signed in** vs **signed in** — and signing in is only required to *create* pearls and guided meditations, not to use any app features.

### Core Principles

1. **Zero friction entry** — App works fully out of the box, no sign-up required
2. **Honest messaging** — No marketing fluff, fellow-traveler tone
3. **Contribution requires identity** — Sign in only to create/share, never to consume
4. **Subtraction over addition** — Delete premium components, don't repurpose

---

## Part 1: Onboarding Redesign

### Current State (DELETE)

3 screens with trial/premium messaging:
- Screen 1: "Your meditation companion"
- Screen 2: "Track your journey" (mentions "10,000 hours")
- Screen 3: "30 days of full access" ← premium trial language

### New Design: Single Screen

**File:** `src/components/Onboarding.tsx`

```tsx
const SCREEN = {
  title: "There's no destination.",
  subtitle: "Just practice, and showing up again.",
  description: "This is a place to do that.",
  reassurance: "No account needed. Just start.",
  cta: "Begin"
}

export function Onboarding({ onComplete }: OnboardingProps) {
  return (
    <div className="h-full bg-cream flex flex-col">
      {/* Content - vertically centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <h1 className="font-serif text-2xl text-ink mb-3 leading-relaxed">
          {SCREEN.title}
        </h1>
        <p className="text-lg text-ink/60 mb-2">
          {SCREEN.subtitle}
        </p>
        <p className="text-base text-ink/50 mb-8">
          {SCREEN.description}
        </p>

        {/* Reassurance line */}
        <p className="text-sm text-ink/40">
          {SCREEN.reassurance}
        </p>
      </div>

      {/* CTA */}
      <div className="p-8">
        <button
          onClick={onComplete}
          className="w-full py-3.5 bg-ink text-cream rounded-xl font-medium
            hover:bg-ink/90 transition-colors active:scale-[0.98]"
        >
          {SCREEN.cta}
        </button>
      </div>
    </div>
  )
}
```

**Key changes:**
- Remove `SCREENS` array — single screen only
- Remove progress dots — no journey to track
- Remove Skip button — unnecessary with single screen
- Remove `currentScreen` state — no navigation needed
- Button says "Begin" not "Next" or "Start"

---

## Part 2: Settings.tsx Restructure

### Current State

```
1. Your Plan (FREE/PREMIUM banner with upgrade CTA) ← DELETE
2. Display options
3. Theme
4. Your Data
5. Account (Sign in button buried here)
6. Links (Privacy, Terms)
7. Restore Purchase ← DELETE
```

### New Structure

```
1. Account Status (sign-in CTA or signed-in state)
2. Display options
3. Theme
4. Your Data
5. Links (Privacy, Terms only)
```

### Implementation

**File:** `src/components/Settings.tsx`

#### Remove These Props

```tsx
// REMOVE from interface
interface SettingsProps {
  onBack: () => void
  // onShowPaywall: () => void  ← DELETE
  // onRestorePurchase: () => void  ← DELETE
}
```

#### Remove Premium Store Import

```tsx
// REMOVE this line
// import { usePremiumStore } from '../stores/usePremiumStore'

// REMOVE this destructure
// const { tier, isPremium } = usePremiumStore()
```

#### Delete "Your Plan" Section (lines 143-172)

Delete the entire tier status banner:
```tsx
// DELETE THIS ENTIRE BLOCK
{tier === 'free' && (
  <button onClick={onShowPaywall} ...>
    ...
  </button>
)}
{isPremium && (
  <div ...>
    ...
  </div>
)}
```

#### New Account Section (move to top, after header)

```tsx
{/* Account Status - NEW SECTION AT TOP */}
<div className="mb-8">
  <p className="font-serif text-sm text-ink/50 tracking-wide mb-4">Account</p>

  {isAuthenticated && user ? (
    <div className="p-5 bg-card/90 backdrop-blur-md border border-ink/5 shadow-sm rounded-xl">
      <p className="text-sm text-ink/60 mb-3">{user.email}</p>
      <p className="text-xs text-ink/40 mb-4">
        You can create and share pearls
      </p>
      <button
        onClick={() => {
          haptic.light()
          signOut()
        }}
        disabled={authLoading}
        className="text-sm text-ink/50 hover:text-ink/70 transition-colors touch-manipulation"
      >
        {authLoading ? 'Signing out...' : 'Sign out'}
      </button>
    </div>
  ) : (
    <button
      onClick={() => {
        haptic.light()
        setShowAuthModal(true)
      }}
      className="w-full p-5 bg-card/90 backdrop-blur-md border border-ink/5 shadow-sm
        rounded-xl text-left hover:bg-card/95 hover:shadow-md transition-all
        active:scale-[0.99] touch-manipulation"
    >
      <p className="text-sm text-ink font-medium">Sign in to create</p>
      <p className="text-xs text-ink/40 mt-1">
        Share pearls and guided meditations with the community
      </p>
      <div className="mt-4 py-2.5 px-4 bg-ink text-cream text-sm rounded-lg text-center">
        Sign in
      </div>
    </button>
  )}
</div>
```

#### Delete Old Account Section (lines 461-491)

Remove the duplicate account section that was lower in the page.

#### Delete Restore Purchase Link (lines 508-516)

```tsx
// DELETE THIS
<button
  onClick={() => {
    haptic.light()
    onRestorePurchase()
  }}
  ...
>
  Restore Purchase
</button>
```

---

## Part 3: SharePearl.tsx — Auth Gate Only

### Current State

Two gates:
1. Auth check (shows modal) ✓
2. Premium check (shows error) ← REMOVE

### Implementation

**File:** `src/components/SharePearl.tsx`

#### Remove Premium Store Import

```tsx
// REMOVE
// import { usePremiumStore } from '../stores/usePremiumStore'

// REMOVE from component
// const { isPremium } = usePremiumStore()
```

#### Update handleSubmit (lines 97-123)

```tsx
const handleSubmit = useCallback(async () => {
  if (!isAuthenticated || !user) {
    setShowAuthModal(true)
    return
  }

  // REMOVE THIS BLOCK
  // if (!isPremium) {
  //   setError('Premium required to post pearls')
  //   return
  // }

  if (isEmpty || isOverLimit) return

  // ... rest unchanged
}, [isAuthenticated, user, text, isEmpty, isOverLimit, insightId, onSuccess])
// Remove isPremium from dependencies
```

#### Update Post Button (lines 267-280)

```tsx
<button
  onClick={handleSubmit}
  disabled={isSubmitting || isEmpty || isOverLimit}  // Remove !isPremium
  className={`
    flex-1 py-3.5 rounded-xl font-medium transition-all
    ${isSubmitting || isEmpty || isOverLimit  // Remove !isPremium
      ? 'bg-ink/20 text-ink/40'
      : 'bg-ink text-cream active:scale-[0.98]'
    }
  `}
>
  {isSubmitting ? 'Posting...' : 'Post Pearl'}
</button>
```

#### Delete Premium Notice (lines 283-288)

```tsx
// DELETE THIS ENTIRE BLOCK
{!isPremium && (
  <p className="text-xs text-amber-600 text-center mb-2">
    Premium required to post pearls
  </p>
)}
```

---

## Part 4: Files to Delete

| File | Reason |
|------|--------|
| `src/components/PaywallPremium.tsx` | Premium upsell modal — no longer needed |
| `src/components/LockedOverlay.tsx` | Feature locking UI — no longer needed |
| `src/lib/purchases.ts` | RevenueCat integration — no longer needed |

### Clean Deletion

```bash
rm src/components/PaywallPremium.tsx
rm src/components/LockedOverlay.tsx
rm src/lib/purchases.ts
```

### Remove Imports

Search and remove any imports of these files:

**App.tsx:**
```tsx
// REMOVE if present
// import { PaywallPremium } from './components/PaywallPremium'
// import { LockedOverlay } from './components/LockedOverlay'
```

**main.tsx:**
```tsx
// REMOVE
// import { initializePurchases } from './lib/purchases'
// await initializePurchases()
```

---

## Part 5: Premium Store Simplification

### Option A: Delete Entirely (Recommended)

The auth store already tracks authentication state. Premium store is redundant.

```bash
rm src/stores/usePremiumStore.ts
```

Remove all imports and usages across the codebase.

### Option B: Keep for Future

If there's any chance of future monetization, keep but simplify:

```tsx
// Simplified - just tracks if user has enhanced features
// For now, this equals "is authenticated"
export const usePremiumStore = create<PremiumState>((set) => ({
  hasEnhancedFeatures: false,

  hydrate: async () => {
    // In future, could check for paid features
    // For now, just mirror auth state
    set({ hasEnhancedFeatures: false })
  }
}))
```

**Recommendation:** Delete it. YAGNI.

---

## Part 6: tierLogic.ts Cleanup

### Remove Premium Feature Checks

**File:** `src/lib/tierLogic.ts`

```tsx
// DELETE this entire block (lines 85-100)
export const PremiumFeatures = {
  whisperTranscription: (tier: TierType) => isPremium(tier),
  aiFormatting: (tier: TierType) => isPremium(tier),
  sharePearls: (tier: TierType) => isPremium(tier),
  impactStats: (tier: TierType) => isPremium(tier),
  cloudSync: (tier: TierType) => isPremium(tier),
} as const

// DELETE this function (lines 28-30)
export function isPremium(tier: TierType): boolean {
  return tier === 'premium'
}
```

### Keep These Functions

The following are still useful and unrelated to premium:
- `getDaysSinceFirstSession()`
- `getWeeklyRollingSeconds()`
- `getLastAchievedMilestone()`

---

## Part 7: Database Cleanup (Low Priority)

### Profile Schema

**File:** `src/lib/db.ts`

The `Profile` interface has:
```tsx
tier: TierType  // 'free' | 'premium'
premiumExpiryDate?: number
```

**Options:**
1. Leave as-is (harmless, no UI shows it)
2. Remove in future cleanup PR

**Recommendation:** Leave for now. Focus on UI changes first.

---

## Part 8: Guided Meditation Creation

### Verify Auth Gate Exists

Need to check if guided meditation creation flow has similar auth gating. If not, add it following the same pattern as SharePearl.

**Search for:** Components that create guided meditations
**Expected behavior:** Show AuthModal when non-authenticated user tries to create

---

## Implementation Order

1. **Onboarding.tsx** — Rewrite (standalone, no dependencies)
2. **Delete files** — PaywallPremium, LockedOverlay, purchases.ts
3. **Settings.tsx** — Restructure (after deletions, so imports don't break)
4. **SharePearl.tsx** — Remove premium gate
5. **usePremiumStore.ts** — Delete
6. **tierLogic.ts** — Remove premium functions
7. **Verify** guided meditation auth flow

---

## Testing Checklist

### Onboarding
- [ ] Single screen displays correctly
- [ ] "Begin" button navigates to timer
- [ ] No skip button present
- [ ] No progress dots present

### Settings
- [ ] Account section appears at top
- [ ] Non-authenticated: Shows sign-in CTA with benefit messaging
- [ ] Authenticated: Shows email and sign-out button
- [ ] No "Your Plan" section visible
- [ ] No "Restore Purchase" link visible
- [ ] Theme, display, data export all work unchanged

### Pearl Creation
- [ ] Non-authenticated user sees auth modal when trying to post
- [ ] Authenticated user can post without premium check
- [ ] Draft saving works for all users
- [ ] No "Premium required" message appears

### Cleanup
- [ ] No console errors about missing imports
- [ ] Build succeeds
- [ ] No references to deleted components remain

---

## Files Changed Summary

| File | Action | Lines Changed |
|------|--------|---------------|
| `src/components/Onboarding.tsx` | Rewrite | ~70 → ~40 |
| `src/components/Settings.tsx` | Restructure | Remove ~50, add ~30 |
| `src/components/SharePearl.tsx` | Simplify | Remove ~15 |
| `src/components/PaywallPremium.tsx` | **DELETE** | -169 |
| `src/components/LockedOverlay.tsx` | **DELETE** | -70 |
| `src/lib/purchases.ts` | **DELETE** | -169 |
| `src/stores/usePremiumStore.ts` | **DELETE** | -61 |
| `src/lib/tierLogic.ts` | Simplify | Remove ~20 |

**Net:** ~500 lines removed

---

**End of Design Document**

**Status:** Ready for implementation
