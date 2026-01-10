# Testing Patterns

**Analysis Date:** 2026-01-10

## Test Framework

**Runner:**
- Vitest 4.0.16 (`package.json`)
- Config: `vitest.config.ts` in project root

**Assertion Library:**
- Vitest built-in expect
- Matchers: toBe, toEqual, toContain, toBeGreaterThan, etc.

**Run Commands:**
```bash
npm test                              # Run all tests in watch mode
npm run test:run                      # Run all tests once
npm test -- path/to/file.test.ts     # Single file
```

## Test File Organization

**Location:**
- `src/lib/__tests__/*.test.ts` - Separate `__tests__/` directory within lib
- Tests are NOT co-located with source files

**Naming:**
- `moduleName.test.ts` for unit tests
- No integration or e2e test distinction

**Structure:**
```
src/
  lib/
    milestones.ts
    tierLogic.ts
    __tests__/
      milestones.test.ts
      tierLogic.test.ts
      db.insights.test.ts
      intentFiltering.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect } from 'vitest'

describe('ModuleName', () => {
  it('should handle specific case', () => {
    // arrange
    const input = createInput()

    // act
    const result = functionUnderTest(input)

    // assert
    expect(result).toBe(expected)
  })
})
```

**Patterns:**
- describe blocks group related tests
- it blocks test single behavior
- Arrange/Act/Assert pattern (implicit, not commented)
- Multiple assertions per test acceptable

## Mocking

**Framework:**
- Vitest built-in mocking (vi)
- fake-indexeddb for Dexie tests (`package.json`)

**Patterns:**
```typescript
import { vi } from 'vitest'

// Mock module (not commonly used in current tests)
vi.mock('../lib/external')

// Use fake-indexeddb for database tests
import 'fake-indexeddb/auto'
```

**What to Mock:**
- IndexedDB (via fake-indexeddb)
- External APIs if needed

**What NOT to Mock:**
- Internal pure functions
- Business logic (test directly)

## Fixtures and Factories

**Test Data:**
- Inline test data in test files
- No separate fixtures directory
- No factory pattern observed

**Example:**
```typescript
it('handles edge case: goal smaller than early wins', () => {
  const milestones = generateMilestones(5)
  expect(milestones).toEqual([2, 5])
})
```

## Coverage

**Requirements:**
- No enforced coverage target
- Coverage not configured in vitest.config.ts

**Configuration:**
- Not set up

## Test Types

**Unit Tests:**
- Scope: Test individual lib functions
- Location: `src/lib/__tests__/`
- Examples: `milestones.test.ts`, `tierLogic.test.ts`

**Integration Tests:**
- Scope: Database operations with fake-indexeddb
- Examples: `db.insights.test.ts`

**E2E Tests:**
- Not present
- No Playwright/Cypress setup

## Common Patterns

**Pure Function Testing:**
```typescript
describe('generateMilestones', () => {
  it('returns infinite sequence when no goal', () => {
    const milestones = generateMilestones()
    expect(milestones).toContain(2)
    expect(milestones).toContain(100)
    expect(milestones.length).toBeGreaterThan(20)
  })

  it('ends with the goal', () => {
    expect(generateMilestones(50).pop()).toBe(50)
    expect(generateMilestones(100).pop()).toBe(100)
  })
})
```

**Edge Case Testing:**
```typescript
it('handles very small goal', () => {
  const milestones = generateMilestones(2)
  expect(milestones).toEqual([2])
})
```

**Database Testing:**
```typescript
// Uses fake-indexeddb for IndexedDB simulation
import 'fake-indexeddb/auto'

describe('Insight operations', () => {
  it('saves and retrieves insights', async () => {
    await addInsight(testInsight)
    const insights = await getAllInsights()
    expect(insights).toContainEqual(expect.objectContaining({
      rawText: testInsight.rawText
    }))
  })
})
```

## Test Environment

**Setup:**
- `src/test/setup.ts` - Vitest setup file
- jsdom environment for DOM simulation
- React testing library available but not widely used

**Globals:**
- Vitest globals enabled (`globals: true` in config)
- describe, it, expect available without imports

---

*Testing analysis: 2026-01-10*
*Update when test patterns change*
