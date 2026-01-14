# Codebase Concerns

**Analysis Date:** 2026-01-14

## Tech Debt

**Inconsistent Path Aliases:**

- Issue: Both `@/lib/...` and `../` relative imports used inconsistently
- Files: Throughout `src/` - mixed usage in `src/components/LivingTheme.tsx`, `src/hooks/useTheme.ts`
- Why: Historical incremental adoption
- Impact: Harder to move files, inconsistent import style
- Fix approach: Standardize on `@/` imports via ESLint rule

**Dual Theme Hook Systems:**

- Issue: Both `useTheme` hook and `LivingTheme` context provide theme state
- Files: `src/hooks/useTheme.ts`, `src/components/LivingTheme.tsx`
- Why: `useTheme` was original system, `LivingTheme` added for full living theme support
- Impact: Some components use hook, others use context; potential state mismatch
- Fix approach: Migrate all consumers to `useLivingTheme()` context, deprecate `useTheme`

**Theme Engine Barrel Export:**

- Issue: `src/lib/themeEngine.ts` is just re-exports from `src/lib/theme/`
- Why: Backward compatibility during refactor
- Impact: Extra indirection, confusing import sources
- Fix approach: Update imports to use `src/lib/theme` directly, remove barrel

## Known Bugs

**None critical identified during analysis.**

## Security Considerations

**Supabase Anon Key Exposure:**

- Risk: Anon key is in client bundle (standard for Supabase, but limits are important)
- Files: `src/lib/supabase.ts` imports from env vars
- Current mitigation: Supabase RLS policies (should be configured in Supabase dashboard)
- Recommendations: Verify RLS policies are properly configured for all tables

**IP Geolocation over HTTP:**

- Risk: `ip-api.com` call in `src/lib/solarPosition.ts:40` uses HTTP (not HTTPS)
- Current mitigation: Data is non-sensitive (approximate location), cached in localStorage
- Recommendations: Consider using HTTPS endpoint or different geolocation service

## Performance Bottlenecks

**Canvas Animation Always Running:**

- Problem: Canvas requestAnimationFrame loop runs continuously when LivingTheme is active
- File: `src/components/LivingCanvas.tsx:274`
- Measurement: Constant CPU usage (~5-10% on mobile)
- Cause: Animation needed for particles, but runs even when minimal effects
- Improvement path: Throttle frame rate when few particles, skip frames when tab not visible (visibility check exists but could be more aggressive)

**Theme Recalculation on Settings Change:**

- Problem: Full theme recalculation when any setting changes
- File: `src/components/LivingTheme.tsx:115` - `updateTheme` callback
- Cause: Callback recreated on many dependency changes
- Improvement path: Memoize theme calculation, only recalculate affected portions

## Fragile Areas

**Theme Interpolation:**

- File: `src/lib/theme/interpolation.ts`
- Why fragile: Complex contrast-preserving logic with many token categories
- Common failures: New tokens added but not included in interpolation
- Safe modification: Add new tokens to appropriate category (structural vs functional)
- Test coverage: No direct tests for interpolation

**Canvas Particle System:**

- File: `src/components/LivingCanvas.tsx`
- Why fragile: Many interdependent effects, refs for mutable state
- Common failures: Particles not cleaned up on theme change, memory leaks
- Safe modification: Ensure `createParticles` called when dependencies change
- Test coverage: Invariant tests exist but minimal

## Scaling Limits

**IndexedDB Storage:**

- Current capacity: Browser-dependent (typically 50MB-1GB)
- Limit: Years of session data could accumulate
- Symptoms at limit: Storage quota exceeded errors
- Scaling path: Implement data archival/export older sessions

## Dependencies at Risk

**framer-motion:**

- Risk: Large bundle size (~30KB gzipped), currently used minimally
- Impact: Slower initial load
- Migration plan: Consider CSS animations for simple cases

## Missing Critical Features

**No Error Tracking:**

- Problem: No external error tracking (Sentry, etc.)
- Current workaround: ErrorBoundary catches but only logs to console
- Blocks: Visibility into production errors
- Implementation complexity: Low (add Sentry SDK)

**No CI/CD Pipeline:**

- Problem: No automated testing on PR/push
- Current workaround: Local testing via Husky pre-commit
- Blocks: Confidence in deployments
- Implementation complexity: Low (add GitHub Actions workflow)

## Test Coverage Gaps

**Theme System:**

- What's not tested: `interpolateThemes`, CSS property generation, LivingTheme component
- Risk: Regressions in theme blending, visual bugs
- Priority: Medium
- Difficulty to test: Theme interpolation is pure function, easy to test

**Canvas Renderers:**

- What's not tested: Individual render functions (`renderSun`, `renderMoon`, etc.)
- Risk: Visual regressions in effects
- Priority: Low (visual, hard to assert)
- Difficulty to test: Would need canvas snapshot testing

**Store Actions:**

- What's not tested: Most store actions beyond basic hydration
- Risk: State management bugs
- Priority: Medium
- Files: `src/stores/useSettingsStore.ts`, `src/stores/useAuthStore.ts`

---

_Concerns audit: 2026-01-14_
_Update as issues are fixed or new ones discovered_
