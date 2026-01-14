# Codebase Structure

**Analysis Date:** 2026-01-14

## Directory Layout

```
10000-hours/
├── .planning/              # Planning and codebase documentation
│   └── codebase/          # This documentation
├── public/                 # Static assets
├── src/                    # Application source
│   ├── components/        # React components
│   │   ├── canvas/       # Canvas rendering system
│   │   │   └── renderers/# Individual effect renderers
│   │   ├── Explore/      # Explore page components
│   │   ├── Journey/      # Journey page components
│   │   └── MeditationPlanner/
│   ├── hooks/             # React hooks
│   │   └── __tests__/    # Hook tests
│   ├── lib/               # Core business logic
│   │   ├── __tests__/    # Library tests
│   │   ├── db/           # Database operations
│   │   ├── insights/     # Insight calculation
│   │   ├── noise/        # Noise generation
│   │   └── theme/        # Theme token system
│   │       └── tokens/   # Season/time token files
│   ├── services/          # External service integrations
│   ├── stores/            # Zustand state stores
│   │   └── __tests__/    # Store tests
│   └── test/              # Test setup
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite build config
└── tailwind.config.js     # Tailwind CSS config
```

## Directory Purposes

**src/components/**

- Purpose: React UI components
- Contains: `.tsx` files, one component per file
- Key files: `LivingTheme.tsx`, `LivingCanvas.tsx`, `Timer.tsx`, `App.tsx`
- Subdirectories: Feature-specific components (`canvas/`, `Explore/`, `Journey/`)

**src/components/canvas/**

- Purpose: Canvas-based visual effects system
- Contains: Particle types, constants, render functions
- Key files: `types.ts`, `constants.ts`, `particles.ts`
- Subdirectories: `renderers/` (individual effect files)

**src/components/canvas/renderers/**

- Purpose: Individual canvas effect implementations
- Contains: One file per effect type
- Key files: `sun.ts`, `moon.ts`, `star.ts`, `snow.ts`, `leaf.ts`, `firefly.ts`, `mist.ts`, `aurora.ts`, `shootingStars.ts`

**src/lib/theme/**

- Purpose: Theme token system (colors, interpolation, CSS)
- Contains: Type definitions, calculation logic, token sets
- Key files: `types.ts`, `calculation.ts`, `interpolation.ts`, `cssProperties.ts`
- Subdirectories: `tokens/` (season/time specific colors)

**src/lib/theme/tokens/**

- Purpose: Theme color token definitions
- Contains: One file per season + neutral themes
- Key files: `winter.ts`, `spring.ts`, `summer.ts`, `autumn.ts`, `neutral.ts`, `index.ts`

**src/lib/**

- Purpose: Core business logic and utilities
- Contains: Non-React code, calculations, utilities
- Key files: `livingTheme.ts`, `themeEngine.ts`, `solarPosition.ts`, `db.ts`

**src/hooks/**

- Purpose: Custom React hooks
- Contains: Reusable hook logic
- Key files: `useTheme.ts`, `useTimer.ts`, `useVoice.ts`

**src/stores/**

- Purpose: Zustand state management
- Contains: Global state stores
- Key files: `useSettingsStore.ts`, `useSessionStore.ts`, `useNavigationStore.ts`, `useAuthStore.ts`

**src/lib/db/**

- Purpose: Database operations (Dexie/IndexedDB)
- Contains: CRUD operations, schema, types
- Key files: `schema.ts`, `types.ts`, `sessions.ts`, `settings.ts`

## Key File Locations

**Entry Points:**

- `src/main.tsx` - React app entry point
- `src/App.tsx` - Root component

**Theme System Core:**

- `src/lib/themeEngine.ts` - Theme barrel export
- `src/lib/livingTheme.ts` - Living theme state calculation
- `src/lib/solarPosition.ts` - Solar/lunar position math
- `src/hooks/useTheme.ts` - React theme hook

**Theme Components:**

- `src/components/LivingTheme.tsx` - Theme provider
- `src/components/LivingCanvas.tsx` - Canvas effects

**Configuration:**

- `tsconfig.json` - TypeScript, `@/*` path alias
- `vite.config.ts` - Build, PWA manifest
- `tailwind.config.js` - Tailwind CSS

**Testing:**

- `src/test/setup.ts` - Vitest setup
- `src/lib/__tests__/` - Library tests
- `src/components/__tests__/` - Component tests

## Naming Conventions

**Files:**

- `PascalCase.tsx` - React components
- `camelCase.ts` - Utilities, hooks, stores
- `*.test.ts` - Test files (co-located in `__tests__/`)

**Directories:**

- `PascalCase/` - Component feature directories
- `camelCase/` - Utility directories
- `__tests__/` - Test directories

**Special Patterns:**

- `use*.ts` - React hooks (e.g., `useTheme.ts`)
- `index.ts` - Barrel exports
- `types.ts` - Type definitions

## Where to Add New Code

**New Component:**

- Implementation: `src/components/ComponentName.tsx`
- Tests: `src/components/__tests__/ComponentName.test.tsx`
- Add to barrel: Update relevant `index.ts`

**New Theme Token Set:**

- Token file: `src/lib/theme/tokens/seasonname.ts`
- Export: Add to `src/lib/theme/tokens/index.ts`
- Register: Add to `SEASON_THEMES` in tokens index

**New Canvas Effect:**

- Renderer: `src/components/canvas/renderers/effectname.ts`
- Particle type: Add to `src/components/canvas/types.ts`
- Factory: Add to `src/components/canvas/particles.ts`
- Export: Add to `src/components/canvas/renderers/index.ts`
- Integration: Add to render loop in `LivingCanvas.tsx`

**New Hook:**

- Implementation: `src/hooks/useHookName.ts`
- Tests: `src/hooks/__tests__/useHookName.test.ts`

**New Store:**

- Implementation: `src/stores/useStoreName.ts`
- Tests: `src/stores/__tests__/useStoreName.test.ts`

**New Database Table:**

- Schema: Add to `src/lib/db/schema.ts`
- Types: Add to `src/lib/db/types.ts`
- Operations: Create `src/lib/db/tablename.ts`

## Special Directories

**src/lib/noise/**

- Purpose: SimplexNoise implementation for particle effects
- Source: Custom implementation (no external dependency)
- Committed: Yes

**.planning/**

- Purpose: Project planning and documentation
- Source: Claude-generated during development
- Committed: Yes

---

_Structure analysis: 2026-01-14_
_Update when directory structure changes_
