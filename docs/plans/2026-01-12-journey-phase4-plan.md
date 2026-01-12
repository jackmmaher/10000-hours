# Journey Tab Redesign - Phase 4: Pearl Integration

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add ability to attach saved pearls (community wisdom) to planned meditation sessions as intention/guidance.

**Architecture:** Use existing Supabase `pearl_saves` infrastructure. Add `attachedPearlId` to PlannedSession. Create PearlPicker modal to select from user's saved pearls. Display attached pearl in planning modal and session cards.

**Tech Stack:** React, TypeScript, existing `lib/pearls.ts` functions, Supabase

---

## Task 1: Add attachedPearlId to PlannedSession Type

**Files:**

- Modify: `src/lib/db/types.ts`

**Step 1: Add attachedPearlId field to PlannedSession interface**

In `src/lib/db/types.ts`, add to the PlannedSession interface (around line 94, after repeatRuleId):

```typescript
  attachedPearlId?: string // Supabase pearl ID attached as intention/guidance
```

**Step 2: Commit**

```bash
git commit -m "feat(db): add attachedPearlId to PlannedSession type"
```

---

## Task 2: Create PearlPicker Component

**Files:**

- Create: `src/components/MeditationPlanner/PearlPicker.tsx`

**Step 1: Create the pearl picker modal component**

```typescript
/**
 * PearlPicker - Modal for selecting a saved pearl to attach to a planned session
 *
 * Shows user's saved pearls from Supabase. Selecting one attaches it
 * as the intention/guidance for the meditation session.
 */

import { useState, useEffect } from 'react'
import { Pearl, getSavedPearls } from '../../lib/pearls'
import { useAuthStore } from '../../stores/useAuthStore'

interface PearlPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (pearl: Pearl) => void
  selectedPearlId?: string
}

export function PearlPicker({ isOpen, onClose, onSelect, selectedPearlId }: PearlPickerProps) {
  const { user } = useAuthStore()
  const [pearls, setPearls] = useState<Pearl[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen && user?.id) {
      setIsLoading(true)
      getSavedPearls(user.id)
        .then(setPearls)
        .finally(() => setIsLoading(false))
    }
  }, [isOpen, user?.id])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-cream rounded-t-2xl max-h-[70vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ink/10">
          <h3 className="font-serif text-lg text-ink">Attach a Pearl</h3>
          <button
            onClick={onClose}
            className="p-2 text-ink/50 hover:text-ink"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-moss/30 border-t-moss rounded-full animate-spin" />
            </div>
          ) : pearls.length === 0 ? (
            <div className="text-center py-8 text-ink/50">
              <p className="mb-2">No saved pearls yet</p>
              <p className="text-sm">Save pearls from the Explore tab to use as meditation guidance</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pearls.map((pearl) => (
                <button
                  key={pearl.id}
                  onClick={() => {
                    onSelect(pearl)
                    onClose()
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-colors ${
                    selectedPearlId === pearl.id
                      ? 'bg-moss/20 border-2 border-moss'
                      : 'bg-white/50 border border-ink/10 hover:border-moss/50'
                  }`}
                >
                  <p className="text-ink leading-relaxed">"{pearl.text}"</p>
                  {pearl.isPreserved && (
                    <p className="text-xs text-ink/40 mt-2">Saved copy</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear selection option */}
        {selectedPearlId && (
          <div className="p-4 border-t border-ink/10">
            <button
              onClick={() => {
                onSelect({ id: '', text: '', userId: '', upvotes: 0, saves: 0, createdAt: '' } as Pearl)
                onClose()
              }}
              className="w-full py-3 text-ink/50 hover:text-ink transition-colors"
            >
              Remove attached pearl
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git commit -m "feat(planner): add PearlPicker component for selecting saved pearls"
```

---

## Task 3: Add Pearl State to usePlannerState

**Files:**

- Modify: `src/components/MeditationPlanner/usePlannerState.ts`

**Step 1: Add pearl state variables**

After the repeat state variables (around line 80), add:

```typescript
// Attached pearl state
const [attachedPearl, setAttachedPearl] = useState<{ id: string; text: string } | null>(null)
```

**Step 2: Add handler for pearl selection**

After `handleRepeatChange` function, add:

```typescript
// Handle pearl attachment
const handlePearlSelect = useCallback((pearl: { id: string; text: string }) => {
  if (pearl.id) {
    setAttachedPearl({ id: pearl.id, text: pearl.text })
  } else {
    setAttachedPearl(null)
  }
}, [])
```

**Step 3: Update handleSave to include attachedPearlId**

In the `handleSave` function, when saving a plan (both single and repeat), include `attachedPearlId`:

For repeat rules (around line 273):

```typescript
await createRepeatRuleWithSessions({
  // ... existing fields
  attachedPearlId: attachedPearl?.id,
})
```

For single plans (in the else branch), add to the session object:

```typescript
attachedPearlId: attachedPearl?.id,
```

**Step 4: Load attached pearl when editing existing plan**

In the effect that loads existing plans, after setting other plan fields, add:

```typescript
if (plan.attachedPearlId) {
  setAttachedPearl({ id: plan.attachedPearlId, text: '' }) // Text will be loaded separately if needed
}
```

**Step 5: Reset pearl state in resetForm**

Add to the resetForm logic:

```typescript
setAttachedPearl(null)
```

**Step 6: Return pearl state and handler**

Add to the return object:

```typescript
attachedPearl,
handlePearlSelect,
```

**Step 7: Commit**

```bash
git commit -m "feat(planner): add attached pearl state to usePlannerState"
```

---

## Task 4: Integrate PearlPicker into MeditationPlanner UI

**Files:**

- Modify: `src/components/MeditationPlanner/index.tsx`

**Step 1: Import PearlPicker**

```typescript
import { PearlPicker } from './PearlPicker'
```

**Step 2: Add pearl picker state**

Add state for the picker modal:

```typescript
const [showPearlPicker, setShowPearlPicker] = useState(false)
```

**Step 3: Add "Attach a Pearl" button to the plan form**

After the notes/intention textarea and before the Repeat picker, add:

```typescript
{/* Pearl Attachment */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-ink/70">
    Guidance
  </label>
  {attachedPearl ? (
    <button
      type="button"
      onClick={() => setShowPearlPicker(true)}
      className="w-full text-left p-3 rounded-xl bg-moss/10 border border-moss/30"
    >
      <p className="text-sm text-ink/50 mb-1">Attached pearl</p>
      <p className="text-ink leading-relaxed">"{attachedPearl.text}"</p>
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setShowPearlPicker(true)}
      className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-ink/20 text-ink/50 hover:border-moss/50 hover:text-moss transition-colors"
    >
      <span className="text-lg">💎</span>
      <span>Attach a Pearl</span>
    </button>
  )}
</div>
```

**Step 4: Add PearlPicker modal**

At the end of the component (before the closing fragment or main div):

```typescript
<PearlPicker
  isOpen={showPearlPicker}
  onClose={() => setShowPearlPicker(false)}
  onSelect={handlePearlSelect}
  selectedPearlId={attachedPearl?.id}
/>
```

**Step 5: Commit**

```bash
git commit -m "feat(planner): integrate pearl picker into planning modal"
```

---

## Task 5: Update RepeatRule Type for Pearl Support

**Files:**

- Modify: `src/lib/db/types.ts`
- Modify: `src/lib/db/repeatRules.ts`

**Step 1: Add attachedPearlId to RepeatRule interface**

In types.ts, add to RepeatRule (after sourceTemplateId):

```typescript
  attachedPearlId?: string // Pearl to attach to generated sessions
```

**Step 2: Update generateSessionsFromRule to include attachedPearlId**

In repeatRules.ts, in the `generateSessionsFromRule` function, add `attachedPearlId` to the generated sessions:

```typescript
sessions.push({
  // ... existing fields
  attachedPearlId: rule.attachedPearlId,
})
```

**Step 3: Commit**

```bash
git commit -m "feat(db): add pearl support to RepeatRule"
```

---

## Task 6: Display Attached Pearl in Session Cards

**Files:**

- Modify: `src/components/MeditationPlanner/index.tsx`

**Step 1: Show attached pearl in planned session view**

In the plan view section (where PLANNED badge is shown), after the notes display, add:

```typescript
{/* Attached Pearl */}
{currentPlan?.attachedPearlId && (
  <div className="mt-3 p-3 rounded-lg bg-moss/5 border border-moss/20">
    <p className="text-xs text-moss mb-1 flex items-center gap-1">
      <span>💎</span> Pearl
    </p>
    <p className="text-sm text-ink/70 italic">
      {attachedPearl?.text || 'Loading...'}
    </p>
  </div>
)}
```

**Step 2: Commit**

```bash
git commit -m "feat(planner): display attached pearl in session cards"
```

---

## Task 7: Build and Test

**Step 1: Run build**

```bash
npm run build
```

**Step 2: Commit any fixes**

**Step 3: Push to GitHub**

```bash
git push origin main
```

---

## Summary

| File                                                  | Change                                                 |
| ----------------------------------------------------- | ------------------------------------------------------ |
| `src/lib/db/types.ts`                                 | ADD - attachedPearlId to PlannedSession and RepeatRule |
| `src/lib/db/repeatRules.ts`                           | MODIFY - Include pearl in generated sessions           |
| `src/components/MeditationPlanner/PearlPicker.tsx`    | NEW - Pearl selection modal                            |
| `src/components/MeditationPlanner/usePlannerState.ts` | MODIFY - Pearl state and handlers                      |
| `src/components/MeditationPlanner/index.tsx`          | MODIFY - Pearl picker integration and display          |

## Testing Checklist

1. Open planning modal for a day
2. Tap "Attach a Pearl" - should show saved pearls from Explore
3. Select a pearl - should show in the form
4. Save the plan - pearl should persist
5. Edit the plan - pearl should load
6. Create recurring session with pearl - all generated sessions should have pearl
7. View planned session card - attached pearl should display
