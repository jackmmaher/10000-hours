# Concerns

**Analysis Date:** 2026-01-10

## Technical Debt

### Large Files

**Theme Engine:**
- `src/lib/themeEngine.ts` - 90,663 bytes (very large)
- Contains massive color/effect calculations
- Could be split into smaller modules

**Ambient Atmosphere:**
- `src/components/AmbientAtmosphere.tsx` - 57,462 bytes
- Gen 2 DOM-based particle system
- Being evaluated for Canvas upgrade (Level 2)

### Living Theme Performance

**Current State (Level 1):**
- DOM-based CSS animations
- Limited to ~25 particles before performance issues
- Each particle is a `<div>` with CSS transforms

**Planned Improvement (Level 2):**
- Canvas-based rendering with requestAnimationFrame
- Can handle 150+ particles at 60fps
- Comparison file: `theme-comparison.html`

## Known Issues

### Limited Test Coverage

**Current:**
- Only `src/lib/__tests__/` has tests (4 files)
- No component tests
- No E2E tests

**Risk:**
- Regressions in UI changes
- Theme calculations untested
- Voice scoring untested

### No TypeScript Strict Null Checks

**Impact:**
- Potential runtime errors from null/undefined
- Some implicit `any` types

## Missing Features

### No Error Tracking

**Current:**
- Errors logged to console only
- No production error monitoring
- `ErrorBoundary.tsx` catches crashes but doesn't report

### No Analytics

**Current:**
- `src/lib/analytics.ts` exists but basic
- No user behavior tracking
- No usage metrics

## Security Considerations

### Environment Variables

**Current:**
- `.env.local` stores Supabase credentials
- `.gitignore` excludes `.env.local`

**Good:**
- Secrets not committed to repo

### Auth

**Current:**
- Supabase handles auth
- No custom JWT implementation

**Good:**
- Using proven auth service

## Performance Concerns

### Initial Load

**Bundle Size:**
- Large theme engine file
- Could benefit from code splitting

### Memory

**IndexedDB:**
- No cleanup of old sessions
- Could accumulate data over time

## Documentation Gaps

### Missing Docs

**Current:**
- No README in `src/`
- No API documentation
- No component storybook

### Inline Comments

**Current:**
- Minimal comments
- Complex algorithms (voice scoring, theme) could use more explanation

---

*Concerns analysis: 2026-01-10*
*Address as priorities allow*
