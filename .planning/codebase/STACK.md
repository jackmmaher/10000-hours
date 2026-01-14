# Technology Stack

**Analysis Date:** 2026-01-14

## Languages

**Primary:**

- TypeScript 5.5 - All application code (`package.json`)

**Secondary:**

- JavaScript - Config files (`vite.config.ts` transpiles, but configs like `eslint.config.js`)

## Runtime

**Environment:**

- Browser runtime (React SPA)
- No Node.js server component
- PWA with Service Worker (`vite-plugin-pwa`)

**Package Manager:**

- npm 10.x
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**

- React 18.3 - UI framework (`package.json`)
- Vite 5.3 - Build tool and dev server (`vite.config.ts`)

**Testing:**

- Vitest 4.0 - Unit testing (`package.json`)
- Testing Library React 16.3 - Component testing
- jsdom 27.4 - DOM simulation for tests

**Build/Dev:**

- TypeScript 5.5 - Type checking (`tsconfig.json`)
- Vite 5.3 - Bundling and HMR
- vite-plugin-pwa 0.20 - PWA generation with Workbox

## Key Dependencies

**Critical (Theme System):**

- framer-motion 12.26 - Animation library for UI transitions
- No external color manipulation library - custom utilities in `src/lib/theme/colorUtils.ts`
- SimplexNoise (custom) - Perlin noise for particle effects in `src/lib/noise/SimplexNoise.ts`

**State Management:**

- zustand 4.5 - Lightweight state stores (`src/stores/*.ts`)

**Data & Persistence:**

- Dexie 4.0 - IndexedDB wrapper for local storage (`src/lib/db/schema.ts`)
- dexie-react-hooks 1.1 - React bindings for Dexie

**Backend Integration:**

- @supabase/supabase-js 2.89 - Backend-as-a-service client (`src/lib/supabase.ts`)

**Utilities:**

- date-fns 3.6 - Date manipulation
- uuid 13.0 - UUID generation
- jszip 3.10 - Export functionality

## Configuration

**Environment:**

- Vite environment variables (VITE\_\* prefix)
- No `.env.example` present (variables defined in deployment)
- Key configs: Supabase URL/anon key for backend

**Build:**

- `vite.config.ts` - Build configuration, PWA manifest
- `tsconfig.json` - TypeScript with `@/*` path alias to `src/*`
- `tailwind.config.js` - Tailwind CSS configuration

**Code Quality:**

- ESLint 9.39 with `typescript-eslint` - Linting
- Prettier 3.7 - Code formatting
- Husky 9.1 - Git hooks
- lint-staged 16.2 - Pre-commit checks

## Platform Requirements

**Development:**

- Any platform with Node.js 20+
- No external dependencies beyond npm packages

**Production:**

- Deployed as static SPA to Vercel
- PWA installable on mobile devices
- Service Worker for offline capability

---

_Stack analysis: 2026-01-14_
_Update after major dependency changes_
