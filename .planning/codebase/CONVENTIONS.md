# Coding Conventions

**Analysis Date:** 2026-01-14

## Naming Patterns

**Files:**

- PascalCase.tsx for React components (`LivingTheme.tsx`, `Timer.tsx`)
- camelCase.ts for utilities, hooks, stores (`livingTheme.ts`, `useTheme.ts`)
- kebab-case for multi-word utilities is avoided (camelCase preferred)
- `*.test.ts` for test files in `__tests__/` directories

**Functions:**

- camelCase for all functions
- `calculate*` for computation functions (`calculateSunPosition`, `calculateTheme`)
- `get*` for getters (`getLocation`, `getSeasonalEffects`)
- `render*` for canvas renderers (`renderSun`, `renderMoon`)
- `create*` for factory functions (`createSnowParticle`)
- `apply*` for DOM mutations (`applyLivingTheme`)

**Variables:**

- camelCase for variables and parameters
- UPPER_SNAKE_CASE for constants (`SUN_THRESHOLDS`, `UPDATE_INTERVAL`)
- No underscore prefix for private (TypeScript handles visibility)

**Types:**

- PascalCase for interfaces and types (`ThemeTokens`, `EffectIntensities`)
- No `I` prefix on interfaces
- Type unions use `|` with explicit string literals

## Code Style

**Formatting:**

- Prettier with project config
- 100 character line length (approximate)
- Single quotes for strings
- Semicolons omitted (Prettier default)
- 2 space indentation

**Linting:**

- ESLint 9.x with `typescript-eslint`
- React hooks plugin enabled
- Run: `npm run lint`

## Import Organization

**Order (observed pattern):**

1. React imports (`import { useState, useEffect } from 'react'`)
2. External packages (framer-motion, zustand)
3. Internal absolute imports (`@/lib/...`, `@/stores/...`)
4. Relative imports (`./`, `../`)
5. Type imports (`import type { ... }`)

**Grouping:**

- No enforced blank lines between groups
- Type imports often inline with value imports

**Path Aliases:**

- `@/*` maps to `src/*` (configured in `tsconfig.json`)
- Used inconsistently - both `@/` and `../` relative imports exist

## Error Handling

**Patterns:**

- Try/catch at async boundaries
- `.catch(() => { /* fallback */ })` for fire-and-forget promises
- Fallback values for failed operations (e.g., timezone estimation if IP lookup fails)

**Error Types:**

- No custom error classes
- String messages in thrown errors
- Console.warn for non-critical failures

## Logging

**Framework:**

- Console methods (log, warn, error)
- Custom logger at `src/lib/logger.ts`

**Patterns:**

- `console.warn` for recoverable issues
- `console.error` for failures
- No production log stripping configured

## Comments

**When to Comment:**

- Module-level JSDoc blocks explaining purpose
- Section headers with `// ===== SECTION NAME =====` pattern
- Inline comments for non-obvious calculations (solar math)

**JSDoc/TSDoc:**

- Used for public API functions in theme system
- `@param`, `@returns` tags present
- Example from `solarPosition.ts`:

```typescript
/**
 * Calculate sun position for a given location and time
 * Returns altitude in degrees and whether the sun is rising or setting
 */
```

**TODO Comments:**

- Format: `// TODO: description`
- No username or issue tracking

## Function Design

**Size:**

- Functions generally under 50 lines
- Long functions split into helpers

**Parameters:**

- Destructuring used for options objects
- Default parameters common (`date: Date = new Date()`)
- Optional parameters at end

**Return Values:**

- Explicit returns
- Object returns with clear property names
- Guard clauses at function start

## Module Design

**Exports:**

- Named exports preferred
- Default exports only for React components
- Barrel files (`index.ts`) for public API

**Theme System Exports:**

- `src/lib/themeEngine.ts` - Re-exports from `theme/`
- `src/lib/theme/index.ts` - Main theme barrel
- `src/components/canvas/renderers/index.ts` - Renderer barrel

## Type Patterns

**Theme Tokens:**

- Single comprehensive interface (`ThemeTokens`)
- All properties required (no optionals)
- String values for colors

**Union Types:**

- String literal unions for enums:

```typescript
type TimeOfDay = 'morning' | 'daytime' | 'evening' | 'night'
type Season = 'spring' | 'summer' | 'autumn' | 'winter'
```

**Discriminated Unions:**

- Used for particle types:

```typescript
interface StarParticle { type: 'star'; ... }
interface SnowParticle { type: 'snow'; ... }
type Particle = StarParticle | SnowParticle | ...
```

## React Patterns

**Hooks:**

- Custom hooks prefixed with `use`
- State initialization with lazy functions
- Memoization via `useCallback` for stable references
- Refs for mutable values that shouldn't trigger re-renders

**Components:**

- Functional components only
- Props destructured in parameter
- Context providers wrap children

**Canvas Components:**

- `useRef` for canvas element and animation ID
- `useEffect` for animation lifecycle
- Cleanup via `cancelAnimationFrame`

---

_Convention analysis: 2026-01-14_
_Update when patterns change_
