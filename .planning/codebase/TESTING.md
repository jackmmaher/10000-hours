# Testing Patterns

**Analysis Date:** 2026-01-14

## Test Framework

**Runner:**

- Vitest 4.0.16 (`package.json`)
- Config: `vitest.config.ts` (implied, or inline in `vite.config.ts`)

**Assertion Library:**

- Vitest built-in `expect`
- `@testing-library/jest-dom` for DOM matchers

**Run Commands:**

```bash
npm test                    # Run all tests (watch mode)
npm run test:run           # Run once without watch
```

## Test File Organization

**Location:**

- Tests in `__tests__/` directories alongside source
- Not co-located (separate test folders)

**Naming:**

- `*.test.ts` for all test files
- Named after module being tested

**Structure:**

```
src/
  lib/
    __tests__/
      solarPosition.test.ts
      tierLogic.test.ts
      milestones.test.ts
      format.test.ts
      attribution.test.ts
      voiceNotifications.test.ts
      visualStressTest.test.ts
      intentFiltering.test.ts
      db.insights.test.ts
  components/
    __tests__/
      LivingCanvas.invariants.test.ts
  hooks/
    __tests__/
      useVoice.test.ts
  stores/
    __tests__/
      useNavigationStore.test.ts
      useSessionStore.test.ts
```

## Test Structure

**Suite Organization:**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('ModuleName', () => {
  describe('functionName', () => {
    it('should handle expected case', () => {
      // arrange
      const input = createTestInput()

      // act
      const result = functionName(input)

      // assert
      expect(result).toBe(expected)
    })
  })
})
```

**Patterns:**

- `describe` blocks for grouping by function/feature
- `it` or `test` for individual cases
- Arrange/Act/Assert structure
- `beforeEach` for test setup

## Mocking

**Framework:**

- Vitest built-in mocking (`vi`)
- `fake-indexeddb` for IndexedDB simulation

**Database Mocking:**

```typescript
import 'fake-indexeddb/auto'

// IndexedDB available in tests
```

**Function Mocking:**

```typescript
import { vi } from 'vitest'

vi.mock('./module', () => ({
  functionName: vi.fn(),
}))
```

**What to Mock:**

- IndexedDB (via fake-indexeddb)
- Date/time (`vi.useFakeTimers()`)
- External APIs

**What NOT to Mock:**

- Pure calculation functions
- Theme token data
- Solar position algorithms (tested directly)

## Test Types

**Unit Tests:**

- Solar position calculations (`solarPosition.test.ts`)
- Business logic (`tierLogic.test.ts`, `milestones.test.ts`)
- Store behavior (`useNavigationStore.test.ts`)
- Most tests are unit tests

**Integration Tests:**

- Database operations (`db.insights.test.ts`)
- Store with database (`useSessionStore.test.ts`)

**Visual/Invariant Tests:**

- Canvas invariants (`LivingCanvas.invariants.test.ts`)
- Visual stress testing (`visualStressTest.test.ts`)

**E2E Tests:**

- Not present (no Playwright/Cypress)

## Coverage

**Requirements:**

- No enforced coverage target
- Coverage not configured in package.json scripts

**Focus Areas:**

- Core calculations (solar position, milestones)
- Business logic (tier logic, filtering)
- State management (stores)

## Common Patterns

**Testing Calculations:**

```typescript
it('should calculate sun position for known location', () => {
  const result = calculateSunPosition(51.5, -0.1, new Date('2024-06-21T12:00:00'))
  expect(result.altitude).toBeCloseTo(62, 0)
})
```

**Testing Stores:**

```typescript
import { renderHook, act } from '@testing-library/react'

it('should update state', () => {
  const { result } = renderHook(() => useStore())

  act(() => {
    result.current.action()
  })

  expect(result.current.state).toBe(expected)
})
```

**Testing with Fake IndexedDB:**

```typescript
import 'fake-indexeddb/auto'

beforeEach(async () => {
  // Clear database before each test
  await db.delete()
})
```

## Theme System Testing

**Solar Position Tests** (`solarPosition.test.ts`):

- Tests for various locations and times
- Sunrise/sunset calculations
- Moon phase calculations

**Visual Invariants** (`LivingCanvas.invariants.test.ts`):

- Tests that canvas renders without errors
- Effect intensity bounds checking

**Stress Tests** (`visualStressTest.test.ts`):

- Performance under various conditions
- Edge cases for theme calculations

## Test Setup

**Global Setup** (`src/test/setup.ts`):

- Jest-DOM matchers
- Fake IndexedDB auto-import
- Any global test utilities

---

_Testing analysis: 2026-01-14_
_Update when test patterns change_
