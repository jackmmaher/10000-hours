# Conventions

**Analysis Date:** 2026-01-10

## Code Style

**Formatting:**
- 2-space indentation
- Single quotes for strings
- Semicolons used
- Tailwind CSS for styling

**TypeScript:**
- Strict mode enabled
- Interfaces preferred over types for objects
- Explicit return types on public functions

## Naming Conventions

**Files:**
- `PascalCase.tsx` - React components
- `camelCase.ts` - Utilities, services, stores
- `kebab-case.json` - Data files

**Directories:**
- All lowercase
- Singular names (`lib`, `data`, not `libs`, `datas`)

**Variables:**
- `camelCase` for variables and functions
- `SCREAMING_SNAKE_CASE` for constants
- `PascalCase` for React components and types

**React Patterns:**
- `use` prefix for hooks
- `is/has/should` prefix for booleans
- Handler functions: `handle<Action>` (e.g., `handleClick`, `handleSave`)

## Component Patterns

**Structure:**
```tsx
// 1. Imports
import React from 'react'
import { useTheme } from '../hooks/useTheme'

// 2. Types/Interfaces
interface Props {
  title: string
  onSave: () => void
}

// 3. Component
export function MyComponent({ title, onSave }: Props) {
  // 4. Hooks first
  const { colors } = useTheme()

  // 5. State
  const [isOpen, setIsOpen] = useState(false)

  // 6. Handlers
  const handleClick = () => setIsOpen(true)

  // 7. Render
  return <div>{title}</div>
}
```

**State Management:**
- Zustand for global state (`src/stores/`)
- React context for theme/cross-cutting concerns
- Local state for component-specific UI state
- IndexedDB (Dexie) for persistent data

**Styling:**
- Tailwind CSS classes inline
- CSS-in-JS for dynamic styles (theme-based)
- `style` prop for computed values from theme

## Common Patterns

**Data Loading:**
```tsx
const [data, setData] = useState<T | null>(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  loadData().then(setData).finally(() => setLoading(false))
}, [])
```

**Theme-Based Styling:**
```tsx
const { colors, effects } = useTheme()
<div style={{
  background: colors.cardBackground,
  opacity: effects.ambient
}} />
```

**Modal Pattern:**
```tsx
{showModal && (
  <SomeModal
    isOpen={showModal}
    onClose={() => setShowModal(false)}
  />
)}
```

## Documentation Style

**Comments:**
- Minimal - code should be self-documenting
- JSDoc for complex public functions
- Inline comments for non-obvious logic only

**File Headers:**
- None required
- Brief comment if file purpose non-obvious

---

*Conventions analysis: 2026-01-10*
*Update when patterns change*
