# Coding Conventions

**Analysis Date:** 2026-01-10

## Naming Patterns

**Files:**
- PascalCase.tsx for React components (`Timer.tsx`, `Journey.tsx`, `MeditationPlanner.tsx`)
- camelCase.ts for utilities, hooks, stores (`db.ts`, `useTimer.ts`, `calculations.ts`)
- *.test.ts for test files in `__tests__/` directories

**Functions:**
- camelCase for all functions (`addSession`, `getNextPlannedSession`, `formatDateForDisplay`)
- No special prefix for async functions
- handle* for event handlers (`handleSave`, `handleDelete`, `handleDayClick`)

**Variables:**
- camelCase for variables and state (`sessions`, `plannedTime`, `selectedDate`)
- UPPER_SNAKE_CASE for constants (`POSE_GROUPS`, `DURATION_CATEGORIES`, `ORB_COLORS`)
- No underscore prefix for private members

**Types:**
- PascalCase for interfaces, no I prefix (`Session`, `PlannedSession`, `Insight`)
- PascalCase for type aliases (`JourneySubTab`, `ExtendedDayStatus`)
- Props interfaces: ComponentNameProps (`JourneyNextSessionProps`, `MeditationPlannerProps`)

## Code Style

**Formatting:**
- 2 space indentation
- Single quotes for strings
- No semicolons (let Prettier handle)
- Max line length ~100 characters (soft limit)

**Linting:**
- TypeScript strict mode enabled (`tsconfig.json`)
- noUnusedLocals, noUnusedParameters enabled
- No explicit ESLint/Prettier config (uses defaults)

## Import Organization

**Order:**
1. React imports (`import { useState, useEffect } from 'react'`)
2. External packages (`import { useLiveQuery } from 'dexie-react-hooks'`)
3. Internal modules - stores (`from '../stores/useSessionStore'`)
4. Internal modules - lib (`from '../lib/db'`)
5. Internal modules - components (`from './WeekStones'`)
6. Internal modules - data (`from '../data/sessions.json'`)

**Grouping:**
- Blank line between groups
- Multiple imports from same module combined
- Type imports: mixed with value imports (not separate)

**Path Aliases:**
- `@/*` maps to `src/*` (defined in `tsconfig.json`)
- Relative imports used in practice (`../lib/db`)

## Error Handling

**Patterns:**
- Try/catch at async boundaries
- Errors logged to console (`console.error`, `console.warn`)
- No custom error classes

**Error Types:**
- Wrap DB operations in try/catch
- Log with context: `console.error('Failed to save:', err)`
- Allow operations to fail silently for non-critical features

## Logging

**Framework:**
- Console.log, console.error, console.warn (browser console)
- No structured logging library

**Patterns:**
- Log errors with context object
- Log state transitions for debugging
- Wrap external calls in try/catch with logging

## Comments

**When to Comment:**
- File-level JSDoc explaining component purpose (see `Journey.tsx`, `MeditationPlanner.tsx`)
- Explain complex business logic
- Document non-obvious behavior

**JSDoc/TSDoc:**
- File headers with purpose and layout notes
- Sparse inline documentation
- No @param/@returns tags in practice

**TODO Comments:**
- Not commonly used
- No standard format

## Function Design

**Size:**
- Keep functions focused
- Extract helper functions for complex logic
- Components can be large (300+ lines) but well-organized

**Parameters:**
- Use object destructuring for props
- Multiple parameters acceptable for simple functions
- TypeScript interfaces for complex parameter objects

**Return Values:**
- Explicit returns
- Return early for guard clauses
- Async functions return Promises

## Module Design

**Exports:**
- Named exports for everything
- No default exports
- Export interfaces alongside implementations

**Component Pattern:**
```typescript
interface ComponentProps {
  prop1: Type
  prop2: Type
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Implementation
}
```

**Store Pattern:**
```typescript
interface StoreState {
  data: Type
  action: () => void
}

export const useStore = create<StoreState>((set, get) => ({
  data: initialValue,
  action: async () => {
    // Implementation
    set({ data: newValue })
  }
}))
```

---

*Convention analysis: 2026-01-10*
*Update when patterns change*
