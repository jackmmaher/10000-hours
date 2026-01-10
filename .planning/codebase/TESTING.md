# Testing

**Analysis Date:** 2026-01-10

## Framework

**Test Runner:**
- Vitest 4.0.16
- Configuration: `vitest.config.ts`
- Environment: jsdom

**Libraries:**
- Testing Library React 16.3.1 - Component testing
- jest-dom 6.9.1 - DOM matchers
- fake-indexeddb 6.2.5 - IndexedDB mocking

## Test Structure

**Location:**
- `src/lib/__tests__/*.test.ts` - Unit tests for lib functions
- `src/test/setup.ts` - Global test setup

**Current Tests:**
```
src/lib/__tests__/
├── db.insights.test.ts      # IndexedDB insight operations
├── intentFiltering.test.ts  # Intent tag filtering logic
├── milestones.test.ts       # Milestone calculations
└── tierLogic.test.ts        # User tier calculations
```

## Running Tests

**Commands:**
```bash
npm test          # Watch mode
npm run test:run  # Single run
```

**Configuration (`vitest.config.ts`):**
```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

## Test Patterns

**Unit Test Example:**
```typescript
import { describe, it, expect } from 'vitest'
import { calculateMilestone } from '../milestones'

describe('calculateMilestone', () => {
  it('returns beginner milestone for <10 hours', () => {
    expect(calculateMilestone(5)).toBe('beginner')
  })
})
```

**IndexedDB Mocking:**
```typescript
import 'fake-indexeddb/auto'
// Tests automatically use fake IndexedDB
```

## Coverage

**Current State:**
- Unit tests for critical lib functions
- No component tests currently
- No E2E tests

**Areas with Tests:**
- `src/lib/calculations.ts` - Milestone/tier logic
- `src/lib/db.ts` - Database operations
- `src/lib/recommendations.ts` - Intent filtering

**Areas without Tests:**
- React components
- Theme calculations
- Voice scoring
- Services (transcription, voice recording)

## Adding New Tests

**For lib functions:**
1. Create `src/lib/__tests__/<module>.test.ts`
2. Import from `vitest`
3. Use `describe`/`it`/`expect` pattern

**For IndexedDB operations:**
1. Import `fake-indexeddb/auto` at top
2. Tests will use mock IndexedDB

---

*Testing analysis: 2026-01-10*
*Update when test coverage changes*
