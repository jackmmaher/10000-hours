# Meditation Planner Modal Redesign

## Overview
Comprehensive UX improvements to the MeditationPlanner component while preserving all existing functionality.

## Constraints (Non-Negotiable)
- All 9 positions preserved
- All 9 techniques preserved
- All 8 duration options + custom preserved
- Two-mode architecture (Plan/Session) unchanged
- Multi-session selector unchanged
- Source template linking unchanged
- All database operations unchanged
- All data models unchanged

---

## Task 1: Extend Tailwind Config with Theme Color Mappings

**File:** `tailwind.config.js`

**Changes:**
Add these color mappings inside `theme.extend.colors`:

```js
// Direct theme token mappings
'accent': 'var(--accent)',
'accent-hover': 'var(--accent-hover)',
'accent-muted': 'var(--accent-muted)',

// Text on colored backgrounds
'on-accent': 'var(--text-on-accent)',

// Semantic backgrounds
'elevated': 'var(--bg-elevated)',
'deep': 'var(--bg-deep)',

// Borders
'border-theme': 'var(--border)',
'border-subtle': 'var(--border-subtle)',
```

**Verification:**
- Run `npm run build` - should succeed with no errors

---

## Task 2: Add Scrollbar Hide Utility to CSS

**File:** `src/index.css`

**Changes:**
Add at end of file:

```css
/* Utility: Hide scrollbar while maintaining scroll functionality */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

**Verification:**
- CSS syntax valid (build succeeds)

---

## Task 3: Add Pose and Discipline Groupings

**File:** `src/lib/meditation-options.ts`

**Changes:**
Add after existing exports:

```typescript
// Pose groupings for UX presentation
export const POSE_GROUPS = [
  {
    label: 'seated',
    poses: ['Seated (cushion)', 'Seated (chair)', 'Lotus', 'Half-lotus', 'Kneeling (seiza)']
  },
  {
    label: 'movement',
    poses: ['Standing', 'Walking', 'Lying down']
  }
]

// Discipline groupings for UX presentation
export const DISCIPLINE_GROUPS = [
  {
    label: 'awareness',
    disciplines: ['Breath Awareness', 'Body Scan', 'Open Awareness']
  },
  {
    label: 'heart',
    disciplines: ['Loving-Kindness', 'Contemplative']
  },
  {
    label: 'traditional',
    disciplines: ['Vipassana', 'Zen/Zazen', 'Mantra']
  },
  {
    label: 'movement',
    disciplines: ['Walking Meditation']
  }
]

// Duration categories for progressive disclosure
export const DURATION_CATEGORIES = [
  { label: 'Quick', range: '5-15', durations: [5, 10, 15] },
  { label: 'Standard', range: '20-30', durations: [20, 25, 30] },
  { label: 'Deep', range: '45+', durations: [45, 60] },
]
```

**Verification:**
- TypeScript compiles without errors
- All original POSES and DISCIPLINES values are represented in groups

---

## Task 4: Update MeditationPlanner - Theme Classes

**File:** `src/components/MeditationPlanner.tsx`

**Changes:**

4a. Update imports to include new groupings:
```typescript
import { DISCIPLINES, POSES, DURATIONS_MINUTES, POSE_GROUPS, DISCIPLINE_GROUPS, DURATION_CATEGORIES } from '../lib/meditation-options'
```

4b. Replace chip button classes throughout:

**Selected chip state:**
- Before: `bg-indigo-deep text-cream`
- After: `bg-accent text-on-accent`

**Unselected chip state:**
- Before: `bg-cream-dark/50 text-ink/70 hover:bg-cream-dark`
- After: `bg-deep/50 text-ink-soft hover:bg-deep`

4c. Update input field backgrounds:
- Before: `bg-cream-dark`
- After: `bg-elevated`

4d. Update primary CTA button:
- Before: `bg-indigo-deep text-cream hover:bg-indigo-deep/90`
- After: `bg-accent text-on-accent hover:opacity-90`

4e. Update delete button to have proper destructive styling:
- Before: `text-rose-500 hover:bg-rose-50`
- After: `border border-rose-500/30 text-rose-500 hover:bg-rose-500/10`

**Verification:**
- TypeScript compiles
- Visual check: chips use theme accent color

---

## Task 5: Update MeditationPlanner - Horizontal Scroll Chips

**File:** `src/components/MeditationPlanner.tsx`

**Changes:**

5a. Replace Position chip section (around line 605-624) with horizontal scroll grouped layout:

```tsx
{/* Position - horizontal scroll with groups */}
<div>
  <label className="text-xs text-ink-soft block mb-2">
    Position
  </label>
  <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
    {POSE_GROUPS.map((group, groupIndex) => (
      <div key={group.label} className="flex gap-2 items-center">
        {group.poses.map((p) => (
          <button
            key={p}
            onClick={() => setPose(pose === p ? '' : p)}
            className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors min-h-[44px] ${
              pose === p
                ? 'bg-accent text-on-accent'
                : 'bg-deep/50 text-ink-soft hover:bg-deep'
            }`}
          >
            {p}
          </button>
        ))}
        {groupIndex < POSE_GROUPS.length - 1 && (
          <div className="w-px h-6 bg-ink/10 mx-1 flex-shrink-0" />
        )}
      </div>
    ))}
  </div>
</div>
```

5b. Replace Technique chip section (around line 626-646) with same pattern:

```tsx
{/* Technique - horizontal scroll with groups */}
<div>
  <label className="text-xs text-ink-soft block mb-2">
    Technique
  </label>
  <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
    {DISCIPLINE_GROUPS.map((group, groupIndex) => (
      <div key={group.label} className="flex gap-2 items-center">
        {group.disciplines.map((d) => (
          <button
            key={d}
            onClick={() => setDiscipline(discipline === d ? '' : d)}
            className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors min-h-[44px] ${
              discipline === d
                ? 'bg-accent text-on-accent'
                : 'bg-deep/50 text-ink-soft hover:bg-deep'
            }`}
          >
            {d}
          </button>
        ))}
        {groupIndex < DISCIPLINE_GROUPS.length - 1 && (
          <div className="w-px h-6 bg-ink/10 mx-1 flex-shrink-0" />
        )}
      </div>
    ))}
  </div>
</div>
```

**Verification:**
- Chips scroll horizontally
- All 9 positions visible via scroll
- All 9 techniques visible via scroll
- Groups separated by subtle divider

---

## Task 6: Update MeditationPlanner - Duration Progressive Disclosure

**File:** `src/components/MeditationPlanner.tsx`

**Changes:**

6a. Add state for duration category:
```typescript
const [durationCategory, setDurationCategory] = useState<string | null>(null)
```

6b. Initialize durationCategory based on existing duration value in useEffect:
```typescript
// In the useEffect that loads existing plan data, after setting duration:
if (existing.duration) {
  const cat = DURATION_CATEGORIES.find(c => c.durations.includes(existing.duration!))
  if (cat) setDurationCategory(cat.label)
  else setDurationCategory('custom')
}
```

6c. Replace duration section with two-tier UI:

```tsx
{/* Duration - Progressive disclosure */}
<div>
  <label className="text-xs text-ink-soft block mb-2">
    Duration
  </label>

  {/* Tier 1: Categories */}
  <div className="flex gap-2">
    {DURATION_CATEGORIES.map((cat) => (
      <button
        key={cat.label}
        onClick={() => {
          setDurationCategory(durationCategory === cat.label ? null : cat.label)
          setShowCustomDuration(false)
          if (durationCategory !== cat.label) {
            setDuration(null) // Reset when switching categories
          }
        }}
        className={`flex-1 py-2 px-3 rounded-xl text-sm transition-colors min-h-[44px] ${
          durationCategory === cat.label
            ? 'bg-accent text-on-accent'
            : 'bg-deep/50 text-ink-soft hover:bg-deep'
        }`}
      >
        <span className="font-medium">{cat.label}</span>
        <span className="text-xs opacity-70 ml-1">{cat.range}</span>
      </button>
    ))}
    <button
      onClick={() => {
        setDurationCategory('custom')
        setShowCustomDuration(true)
        setDuration(null)
      }}
      className={`flex-1 py-2 px-3 rounded-xl text-sm transition-colors min-h-[44px] ${
        durationCategory === 'custom'
          ? 'bg-accent text-on-accent'
          : 'bg-deep/50 text-ink-soft hover:bg-deep'
      }`}
    >
      Custom
    </button>
  </div>

  {/* Tier 2: Specific durations */}
  {durationCategory && durationCategory !== 'custom' && (
    <div className="flex gap-2 mt-3 animate-fade-in">
      {DURATION_CATEGORIES.find(c => c.label === durationCategory)?.durations.map((d) => (
        <button
          key={d}
          onClick={() => setDuration(duration === d ? null : d)}
          className={`px-4 py-2 rounded-full text-sm min-h-[44px] transition-colors ${
            duration === d
              ? 'bg-accent text-on-accent'
              : 'bg-deep/30 text-ink-soft hover:bg-deep/50'
          }`}
        >
          {d} min
        </button>
      ))}
    </div>
  )}

  {/* Custom duration input */}
  {showCustomDuration && (
    <div className="mt-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          max="480"
          placeholder="Enter minutes"
          value={customDurationInput}
          onChange={(e) => {
            setCustomDurationInput(e.target.value)
            setDuration(e.target.value ? parseInt(e.target.value) : null)
          }}
          className="flex-1 px-4 py-3 rounded-xl bg-elevated text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
          autoFocus
        />
        <span className="text-sm text-ink-soft">min</span>
      </div>
    </div>
  )}
</div>
```

**Verification:**
- Category selection works
- Tier 2 appears when category selected
- All 8 duration values accessible
- Custom input still works

---

## Task 7: Update Labels and Add Input Affordances

**File:** `src/components/MeditationPlanner.tsx`

**Changes:**

7a. Update labels to be cleaner:
- "What day?" → "Date"
- "What time?" → "Time"
- "How long?" → "Duration" (already done in Task 6)

7b. Add chevron icon to date input:
```tsx
<div className="relative">
  <input
    type="date"
    value={formatDateForInput(selectedDate)}
    onChange={(e) => { ... }}
    className="w-full px-4 py-4 pr-10 rounded-xl bg-elevated text-ink text-lg font-medium focus:outline-none focus:ring-2 focus:ring-accent/30"
  />
  <svg
    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft pointer-events-none"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
</div>
```

7c. Add clock icon to time input:
```tsx
<div className="relative">
  <input
    type="time"
    value={plannedTime}
    onChange={(e) => setPlannedTime(e.target.value)}
    className="w-full px-4 py-4 pr-10 rounded-xl bg-elevated text-ink text-lg font-medium focus:outline-none focus:ring-2 focus:ring-accent/30"
  />
  <svg
    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft pointer-events-none"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  {!plannedTime && (
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft font-medium pointer-events-none">
      Tap to set time
    </span>
  )}
</div>
```

**Verification:**
- Labels are cleaner
- Icons visible on date/time inputs
- Inputs still functional

---

## Task 8: Final Verification

**Steps:**
1. Run `npm run build` - must succeed
2. Run `npm run dev` - start dev server
3. Visual verification across theme states:
   - Open the app
   - Navigate to Journey or Calendar
   - Tap a date to open MeditationPlanner
   - Verify:
     - [ ] Chips use theme accent color when selected
     - [ ] Horizontal scroll works on Position/Technique
     - [ ] Groups are visually separated
     - [ ] Duration categories work
     - [ ] All 9 positions accessible
     - [ ] All 9 techniques accessible
     - [ ] All duration options accessible
     - [ ] Delete button has proper styling
     - [ ] CTA button uses theme color

**Verification:**
- Build succeeds
- No console errors
- Visual appearance matches design intent
