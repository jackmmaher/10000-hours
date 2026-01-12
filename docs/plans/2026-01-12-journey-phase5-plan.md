# Journey Tab Redesign - Phase 5: Content Section Polish

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add "Attach to Plan" actions to pearls and "Plan This Meditation" flow from saved templates, completing the circular planning ecosystem.

**Architecture:** Add action buttons to JourneyMyPearls and JourneySavedContent. Create a PlanSelector modal for choosing which session to attach a pearl to. Wire up flows to MeditationPlanner with pre-filled data.

**Tech Stack:** React, TypeScript, existing component patterns

---

## Task 1: Create PlanSelector Modal

**Files:**

- Create: `src/components/PlanSelector.tsx`

**Step 1: Create the plan selector modal**

This modal shows upcoming planned sessions and lets the user pick one to attach a pearl to, or create a new plan.

```typescript
/**
 * PlanSelector - Modal for selecting a planned session to attach content to
 *
 * Used when user wants to attach a pearl or insight to a planned session.
 * Shows upcoming plans and option to create new.
 */

import { useState, useEffect } from 'react'
import { PlannedSession, getUpcomingPlans } from '../lib/db'

interface PlanSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectPlan: (plan: PlannedSession) => void
  onCreateNew: () => void
  title?: string
}

export function PlanSelector({
  isOpen,
  onClose,
  onSelectPlan,
  onCreateNew,
  title = 'Attach to Plan'
}: PlanSelectorProps) {
  const [plans, setPlans] = useState<PlannedSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      getUpcomingPlans(14) // Next 2 weeks
        .then(setPlans)
        .finally(() => setIsLoading(false))
    }
  }, [isOpen])

  if (!isOpen) return null

  const formatPlanDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const planDate = new Date(timestamp)
    planDate.setHours(0, 0, 0, 0)

    if (planDate.getTime() === today.getTime()) return 'Today'
    if (planDate.getTime() === tomorrow.getTime()) return 'Tomorrow'
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-cream rounded-t-2xl max-h-[70vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-ink/10">
          <h3 className="font-serif text-lg text-ink">{title}</h3>
          <button onClick={onClose} className="p-2 text-ink/50 hover:text-ink touch-manipulation">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-moss/30 border-t-moss rounded-full animate-spin" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 text-ink/50">
              <p className="mb-4">No upcoming plans</p>
              <button
                onClick={() => {
                  onCreateNew()
                  onClose()
                }}
                className="px-6 py-3 bg-moss text-cream rounded-xl font-medium touch-manipulation"
              >
                Plan a New Session
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => {
                    onSelectPlan(plan)
                    onClose()
                  }}
                  className="w-full text-left p-4 rounded-xl bg-white/50 border border-ink/10 hover:border-moss/50 transition-colors touch-manipulation"
                >
                  <p className="text-xs text-ink/50 mb-1">
                    {formatPlanDate(plan.date)}
                    {plan.plannedTime && ` at ${plan.plannedTime}`}
                  </p>
                  <p className="text-ink font-medium">
                    {plan.title || plan.discipline || 'Meditation'}
                  </p>
                  {plan.duration && (
                    <p className="text-sm text-ink/50">{plan.duration} minutes</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {plans.length > 0 && (
          <div className="p-4 border-t border-ink/10">
            <button
              onClick={() => {
                onCreateNew()
                onClose()
              }}
              className="w-full py-3 text-moss hover:text-moss/80 transition-colors touch-manipulation font-medium"
            >
              + Plan a New Session
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Add getUpcomingPlans function to db**

In `src/lib/db/plannedSessions.ts`, add:

```typescript
export async function getUpcomingPlans(daysAhead: number = 14): Promise<PlannedSession[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + daysAhead)

  return db.plannedSessions
    .where('date')
    .between(today.getTime(), endDate.getTime())
    .and((p) => !p.completed)
    .sortBy('date')
}
```

Export from `src/lib/db/index.ts` and `src/lib/db.ts`.

**Step 3: Commit**

```bash
git commit -m "feat: add PlanSelector modal and getUpcomingPlans"
```

---

## Task 2: Add "Attach to Plan" to JourneyMyPearls

**Files:**

- Modify: `src/components/JourneyMyPearls.tsx`

**Step 1: Import PlanSelector and add state**

```typescript
import { PlanSelector } from './PlanSelector'
import { updatePlannedSession, PlannedSession } from '../lib/db'

// Add state
const [attachTarget, setAttachTarget] = useState<Pearl | null>(null)
const [showPlanSelector, setShowPlanSelector] = useState(false)
```

**Step 2: Add handleAttachToPlan function**

```typescript
const handleAttachToPlan = async (plan: PlannedSession) => {
  if (!attachTarget || !plan.id) return
  try {
    await updatePlannedSession(plan.id, { attachedPearlId: attachTarget.id })
    setAttachTarget(null)
    // Optionally show success feedback
  } catch (err) {
    console.error('Failed to attach pearl:', err)
  }
}
```

**Step 3: Add "Attach" button to each pearl card**

In the pearl card footer (after the upvotes), add:

```typescript
<button
  onClick={() => {
    haptic.light()
    setAttachTarget(pearl)
    setShowPlanSelector(true)
  }}
  className="text-xs text-moss hover:text-moss/80 transition-colors px-2 py-1 touch-manipulation"
>
  Attach to Plan
</button>
```

**Step 4: Add PlanSelector modal at bottom of component**

```typescript
<PlanSelector
  isOpen={showPlanSelector}
  onClose={() => {
    setShowPlanSelector(false)
    setAttachTarget(null)
  }}
  onSelectPlan={handleAttachToPlan}
  onCreateNew={() => {
    // Navigate to journey with planning intent
    // This will need to pass the pearl to attach
  }}
  title="Attach Pearl to Plan"
/>
```

**Step 5: Commit**

```bash
git commit -m "feat(pearls): add attach to plan action"
```

---

## Task 3: Add "Plan This" to JourneySavedContent

**Files:**

- Modify: `src/components/JourneySavedContent.tsx`

**Step 1: Add onPlanTemplate prop and handler**

```typescript
interface SavedContentProps {
  onCreateNew?: () => void
  onPlanTemplate?: (template: SessionTemplate) => void
}
```

**Step 2: Add "Plan This" button to template cards**

In the template card (either My Meditations or Collected Meditations), add a button:

```typescript
<button
  onClick={() => {
    haptic.light()
    onPlanTemplate?.(template)
  }}
  className="flex items-center gap-1.5 text-xs text-moss hover:text-moss/80 transition-colors px-3 py-1.5 rounded-lg bg-moss/10 touch-manipulation"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
  Plan This
</button>
```

**Step 3: Commit**

```bash
git commit -m "feat(templates): add plan this meditation action"
```

---

## Task 4: Wire Up Planning Flow in Journey

**Files:**

- Modify: `src/components/Journey/index.tsx`

**Step 1: Add template planning state**

```typescript
const [templateToPlan, setTemplateToPlan] = useState<SessionTemplate | null>(null)
```

**Step 2: Handle template planning**

When `templateToPlan` is set, open the planning modal with pre-filled data:

```typescript
// In the MeditationPlannerWrapper, pass template data
{planningDate && (
  <MeditationPlannerWrapper
    date={planningDate}
    sessions={selectedDaySessions}
    onClose={() => {
      setPlanningDate(null)
      setSelectedDaySessions([])
      setTemplateToPlan(null)
    }}
    onSave={() => {
      refreshAllPlanData()
      setTemplateToPlan(null)
    }}
    prefillTemplate={templateToPlan}
  />
)}
```

**Step 3: Pass handler to JourneySavedContent**

```typescript
<JourneySavedContent
  onCreateNew={() => setShowTemplateEditor(true)}
  onPlanTemplate={(template) => {
    setTemplateToPlan(template)
    // Open planning modal for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    setPlanningDate(today)
    setSelectedDaySessions(getSessionsForDate(sessions, today))
  }}
/>
```

**Step 4: Update MeditationPlanner to accept prefill data**

In MeditationPlanner, accept `prefillTemplate` prop and use it to pre-fill:

- `planTitle` from template.title
- `duration` from template duration
- `planDiscipline` from template.discipline
- `planSourceTemplateId` from template.id

**Step 5: Commit**

```bash
git commit -m "feat(journey): wire up plan this meditation flow"
```

---

## Task 5: Build and Test

**Step 1: Run build**

```bash
npm run build
```

**Step 2: Fix any TypeScript errors**

**Step 3: Push to GitHub**

```bash
git push origin main
```

---

## Summary

| File                                     | Change                             |
| ---------------------------------------- | ---------------------------------- |
| `src/components/PlanSelector.tsx`        | NEW - Modal for selecting plans    |
| `src/lib/db/plannedSessions.ts`          | MODIFY - Add getUpcomingPlans      |
| `src/components/JourneyMyPearls.tsx`     | MODIFY - Add attach to plan action |
| `src/components/JourneySavedContent.tsx` | MODIFY - Add plan this action      |
| `src/components/Journey/index.tsx`       | MODIFY - Wire up flows             |
| `src/components/MeditationPlanner/*`     | MODIFY - Accept prefill template   |

## Testing Checklist

1. Go to Journey → My Pearls tab
2. Tap "Attach to Plan" on any pearl
3. Select an existing plan or create new
4. Verify pearl is attached to the plan

5. Go to Journey → Guided Meditations tab
6. Tap "Plan This" on a saved template
7. Verify planning modal opens with pre-filled data
8. Save and verify plan appears in calendar
