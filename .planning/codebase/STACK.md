# Technology Stack

**Analysis Date:** 2026-01-10

## Languages

**Primary:**
- TypeScript 5.5.3 - All application code

**Secondary:**
- JavaScript - Build configs, PostCSS config

## Runtime

**Environment:**
- Node.js (development/build)
- Browser (production PWA)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 18.3.1 - UI framework
- Zustand 4.5.2 - State management

**Testing:**
- Vitest 4.0.16 - Unit tests
- Testing Library React 16.3.1 - Component testing
- fake-indexeddb 6.2.5 - IndexedDB mocking

**Build/Dev:**
- Vite 5.3.4 - Build tool and dev server
- TypeScript 5.5.3 - Type checking
- vite-plugin-pwa 0.20.0 - PWA generation

## Key Dependencies

**Critical:**
- Supabase 2.89.0 - Backend as a service (auth, database) - `src/lib/supabase.ts`
- Dexie 4.0.4 - IndexedDB wrapper for offline storage - `src/lib/db.ts`
- date-fns 3.6.0 - Date manipulation - used throughout app

**Infrastructure:**
- uuid 13.0.0 - ID generation
- Tailwind CSS 3.4.4 - Styling

## Configuration

**Environment:**
- `.env.local` for Supabase credentials
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` required

**Build:**
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.js` - Tailwind CSS customization
- `vitest.config.ts` - Test runner configuration

## Platform Requirements

**Development:**
- Any platform with Node.js
- No external dependencies required

**Production:**
- Progressive Web App (PWA)
- Works offline via service worker
- Deployed as static files

---

*Stack analysis: 2026-01-10*
*Update after major dependency changes*
