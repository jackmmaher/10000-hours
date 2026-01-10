# Architecture

**Analysis Date:** 2026-01-10

## Pattern Overview

**Overall:** Offline-First PWA with Feature-Based Components

**Key Characteristics:**
- Mobile-first meditation app
- Offline-first with IndexedDB as primary data store
- Optional cloud sync to Supabase
- Component-based UI with Zustand for global state
- Tab-based navigation (Timer, Journey, Explore, Profile)

## Layers

**UI Layer (Components):**
- Purpose: React components for user interface
- Contains: Feature components, shared UI elements
- Location: `src/components/*.tsx`
- Depends on: Stores (state), Lib (utilities/db)
- Used by: `src/App.tsx` (main router)

**State Layer (Stores):**
- Purpose: Global state management with Zustand
- Contains: Session state, auth state, navigation, settings, premium status
- Location: `src/stores/*.ts`
- Depends on: Lib (db, calculations)
- Used by: Components

**Data Layer (Lib):**
- Purpose: Database operations, business logic, utilities
- Contains: Dexie database, calculations, formatting, types
- Location: `src/lib/*.ts`
- Depends on: Dexie, Supabase client
- Used by: Stores, Components

**Services Layer:**
- Purpose: External service integrations
- Contains: Voice recording, transcription
- Location: `src/services/*.ts`
- Depends on: Browser APIs
- Used by: Components (Timer, InsightCapture)

## Data Flow

**Meditation Session Flow:**

1. User starts timer on Timer tab (`src/components/Timer.tsx`)
2. Timer runs via `useTimer` hook (`src/hooks/useTimer.ts`)
3. User stops timer → `completeSession()` called on session store (`src/stores/useSessionStore.ts`)
4. Session saved to IndexedDB (`src/lib/db.ts` → `addSession()`)
5. Auto-linking: `linkSessionToPlan()` finds any planned session for today and marks it completed
6. UI refreshes via Zustand reactivity

**Planned Session Flow:**

1. User opens Journey tab → `JourneyNextSession` component shows next planned session (`src/components/JourneyNextSession.tsx`)
2. Data fetched via `getNextPlannedSession()` in `src/lib/db.ts`
3. User clicks "Plan" → `MeditationPlanner` modal opens (`src/components/MeditationPlanner.tsx`)
4. User saves plan → `addPlannedSession()` or `updatePlannedSession()` in db
5. Journey tab refreshes via `plansRefreshKey` state

**State Management:**
- Zustand stores for: sessions, auth, navigation, settings, premium
- IndexedDB (Dexie) for: persistent data (sessions, insights, plans, achievements)
- Local component state for: UI interactions, form state

## Key Abstractions

**Session:**
- Purpose: Completed meditation record
- Examples: `src/lib/db.ts` → `Session` interface
- Pattern: IndexedDB table with UUID primary key

**PlannedSession:**
- Purpose: Future meditation plan
- Examples: `src/lib/db.ts` → `PlannedSession` interface
- Pattern: Links to Session when completed via `linkedSessionUuid`

**Insight:**
- Purpose: Voice-captured post-meditation reflection
- Examples: `src/lib/db.ts` → `Insight` interface
- Pattern: Linked to session, can be shared as Pearl

**Store:**
- Purpose: Global state container
- Examples: `useSessionStore`, `useAuthStore`, `useNavigationStore`, `useSettingsStore`
- Pattern: Zustand with async actions for DB operations

## Entry Points

**App Entry:**
- Location: `src/main.tsx`
- Triggers: Browser loads the PWA
- Responsibilities: Mount React app, register service worker

**App Router:**
- Location: `src/App.tsx`
- Triggers: Navigation between tabs
- Responsibilities: Render current view based on navigation state

## Error Handling

**Strategy:** Try/catch at async boundaries, console logging

**Patterns:**
- Async operations wrapped in try/catch
- Errors logged to console
- UI shows loading states during operations
- Graceful degradation for optional features (auth, sync)

## Cross-Cutting Concerns

**Logging:**
- Console.log for development
- Console.error for errors
- No structured logging library

**Validation:**
- TypeScript interfaces for type safety
- Runtime validation minimal (trusts own data)

**Offline Support:**
- IndexedDB as source of truth
- Supabase sync optional and additive
- PWA service worker for asset caching

---

*Architecture analysis: 2026-01-10*
*Update when major patterns change*
