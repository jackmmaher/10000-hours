# Codebase Structure

**Analysis Date:** 2026-01-10

## Directory Layout

```
10000-hours/
├── src/                    # Application source code
│   ├── components/         # React components (features + UI)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Core utilities, DB, business logic
│   │   └── __tests__/      # Unit tests for lib modules
│   ├── services/           # External service integrations
│   ├── stores/             # Zustand state stores
│   ├── data/               # Static data files (JSON)
│   ├── test/               # Test setup and utilities
│   ├── App.tsx             # Main app component (router)
│   ├── main.tsx            # React entry point
│   └── index.css           # Global styles (Tailwind)
├── .planning/              # Project planning docs
│   └── codebase/           # Codebase analysis (this folder)
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite + PWA configuration
├── vitest.config.ts        # Test runner configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind theme
└── postcss.config.js       # PostCSS configuration
```

## Directory Purposes

**src/components/**
- Purpose: All React UI components
- Contains: Feature components (Timer, Journey, Explore, Profile), modals, cards, shared UI
- Key files: `Timer.tsx`, `Journey.tsx`, `JourneyNextSession.tsx`, `MeditationPlanner.tsx`, `Calendar.tsx`, `WeekStones.tsx`
- Subdirectories: None (flat structure)

**src/hooks/**
- Purpose: Custom React hooks
- Contains: Timer logic, audio, swipe gestures, theme, voice capture
- Key files: `useTimer.ts`, `useSwipe.ts`, `useTheme.ts`, `useVoice.ts`, `useAudioLevel.ts`

**src/lib/**
- Purpose: Core business logic and utilities
- Contains: Database (Dexie), calculations, types, formatting, animations
- Key files: `db.ts` (IndexedDB), `types.ts`, `calculations.ts`, `milestones.ts`, `templates.ts`
- Subdirectories: `__tests__/` for unit tests

**src/services/**
- Purpose: External service integrations
- Contains: Voice recording, transcription services
- Key files: `voiceRecording.ts`, `transcription.ts`

**src/stores/**
- Purpose: Zustand global state stores
- Contains: Session store, auth store, navigation, settings, premium
- Key files: `useSessionStore.ts`, `useAuthStore.ts`, `useNavigationStore.ts`, `useSettingsStore.ts`, `usePremiumStore.ts`

**src/data/**
- Purpose: Static JSON data files
- Contains: Course definitions, session templates
- Key files: `courses.json`, `sessions.json`

## Key File Locations

**Entry Points:**
- `src/main.tsx` - React app entry, mounts to DOM
- `src/App.tsx` - Main app with tab navigation

**Configuration:**
- `package.json` - Dependencies, npm scripts
- `vite.config.ts` - Vite build, PWA manifest
- `tsconfig.json` - TypeScript strict mode, ES2020
- `vitest.config.ts` - Test runner with jsdom
- `tailwind.config.js` - Custom theme colors

**Core Logic:**
- `src/lib/db.ts` - IndexedDB via Dexie, all data operations
- `src/lib/types.ts` - Shared TypeScript types
- `src/lib/calculations.ts` - Session and time calculations
- `src/stores/useSessionStore.ts` - Session state and completion logic

**Journey Tab (Bug Area):**
- `src/components/Journey.tsx` - Journey tab container, orchestrates sub-components
- `src/components/JourneyNextSession.tsx` - "Your Next Moment" card
- `src/components/MeditationPlanner.tsx` - Plan/edit meditation modal
- `src/components/WeekStones.tsx` - Week view with day stones
- `src/components/Calendar.tsx` - Monthly calendar view

**Testing:**
- `src/test/setup.ts` - Vitest setup
- `src/lib/__tests__/*.test.ts` - Unit tests

## Naming Conventions

**Files:**
- PascalCase.tsx: React components (`Timer.tsx`, `Journey.tsx`)
- camelCase.ts: Utilities, hooks, stores (`db.ts`, `useTimer.ts`)
- *.test.ts: Test files alongside source in `__tests__/`

**Directories:**
- lowercase for all directories (`components`, `hooks`, `lib`)
- Plural for collections (`stores`, `services`, `hooks`)

**Special Patterns:**
- `use*.ts`: React hooks (`useTimer.ts`, `useSwipe.ts`)
- `*.test.ts`: Test files in `__tests__/` directories
- `Journey*.tsx`: Journey tab feature components

## Where to Add New Code

**New Feature Component:**
- Primary code: `src/components/FeatureName.tsx`
- Tests: `src/lib/__tests__/featureName.test.ts` (for logic)
- Types: `src/lib/types.ts`

**New Hook:**
- Implementation: `src/hooks/useHookName.ts`
- Types: Inline or `src/lib/types.ts`

**New Store:**
- Implementation: `src/stores/useStoreName.ts`
- Pattern: Follow existing Zustand patterns

**New Utility:**
- Implementation: `src/lib/utilityName.ts`
- Tests: `src/lib/__tests__/utilityName.test.ts`

**Database Changes:**
- Schema: `src/lib/db.ts` (increment version, add migration)
- Types: `src/lib/db.ts` (interfaces)

## Special Directories

**.planning/**
- Purpose: Project planning and codebase documentation
- Source: Created by codebase mapping
- Committed: Yes

**node_modules/**
- Purpose: npm dependencies
- Committed: No (gitignored)

**dist/**
- Purpose: Build output
- Committed: No (gitignored)

---

*Structure analysis: 2026-01-10*
*Update when directory structure changes*
