# Technology Stack

**Analysis Date:** 2026-01-10

## Languages

**Primary:**
- TypeScript 5.5 - All application code (`package.json`, `tsconfig.json`)

**Secondary:**
- JavaScript - Build scripts, config files

## Runtime

**Environment:**
- Browser (PWA) - Mobile-first meditation app
- Vite dev server for development

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 18.3 - UI framework (`package.json`)
- Zustand 4.5 - State management (`src/stores/*.ts`)
- Dexie 4.0 - IndexedDB wrapper for local storage (`src/lib/db.ts`)

**Testing:**
- Vitest 4.0 - Unit tests (`vitest.config.ts`)
- @testing-library/react 16.3 - Component testing

**Build/Dev:**
- Vite 5.3 - Build tool and dev server (`vite.config.ts`)
- TypeScript 5.5 - Compilation
- vite-plugin-pwa 0.20 - PWA generation with Workbox

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.89 - Backend services, auth, cloud sync (`src/lib/supabase.ts`)
- date-fns 3.6 - Date manipulation for meditation planning
- uuid 13.0 - Session and entity ID generation
- dexie-react-hooks 1.1 - React hooks for Dexie live queries

**Infrastructure:**
- Tailwind CSS 3.4 - Styling (`tailwind.config.js`, `postcss.config.js`)
- autoprefixer 10.4 - CSS vendor prefixes

## Configuration

**Environment:**
- `.env` files for Supabase configuration (gitignored)
- VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY required

**Build:**
- `vite.config.ts` - Vite and PWA configuration
- `tsconfig.json` - TypeScript with ES2020 target, strict mode
- `tailwind.config.js` - Custom theme configuration
- `vitest.config.ts` - Test runner with jsdom environment

## Platform Requirements

**Development:**
- Any platform with Node.js
- No external dependencies (IndexedDB for local storage)

**Production:**
- PWA deployed to static hosting
- Works offline-first with Workbox service worker
- Syncs to Supabase when online

---

*Stack analysis: 2026-01-10*
*Update after major dependency changes*
