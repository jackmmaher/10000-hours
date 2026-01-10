# Architecture

**Analysis Date:** 2026-01-10

## Pattern Overview

**Overall:** React SPA with PWA Capabilities + Supabase Backend

**Key Characteristics:**
- Single-page React application with tab-based navigation
- Offline-first with IndexedDB local storage
- Supabase for authentication and cloud sync
- Community content with local fallbacks

## Core Feature: Explore Tab & Meditation Cards

### Explore Tab (`src/components/Explore.tsx`)

**Purpose:** Community discovery feed for meditation templates and wisdom pearls

**Content Types:**
- **SessionCards** - Guided meditation templates (from `src/data/sessions.json` or Supabase)
- **PearlCards** - Wisdom snippets from community members

**Feed Algorithm:**
- Mixed organic randomization: 3-5 pearls → 1-2 sessions → 2-3 pearls → 1 course
- Intent-based filtering: anxiety, stress, sleep, focus, beginners, body-awareness, self-compassion, letting-go
- Sorting: rising, new, top

### Meditation Card System

**Card Components:**
- `src/components/SessionCard.tsx` - Renders meditation template
- `src/components/Card.tsx` - Base card with glassmorphism styling
- `src/components/SessionDetailModal.tsx` - Full details + adopt flow

**Card Data (`src/data/sessions.json`):**
```json
{
  "id": "uuid",
  "title": "First Breath Awakening",
  "discipline": "Breath Awareness",
  "recommended_after_hours": 0,  // Experience prerequisite
  "intent_tags": ["focus", "beginners"],
  "karma": 156,
  "saves": 234,
  "completions": 1567
}
```

### Experience-Based Recommendations

**The `recommendedAfterHours` System:**

Distribution in seed data:
- **0 hours (42 sessions)** - Beginner-friendly, no prerequisite
- **10+ hours (29 sessions)** - Some foundation needed
- **50+ hours (25 sessions)** - Intermediate practices
- **100+ hours (13 sessions)** - Advanced techniques
- **500+ hours (1 session)** - Master-level

**Filtering Logic (`src/lib/recommendations.ts`):**
```typescript
// Hard filter - users can't see sessions above their experience level
if (session.recommendedAfterHours > inputs.totalHours) {
  return { score: -1, reasons: ['Experience level too high'] }
}
```

**Display Logic (`src/components/SessionDetailModal.tsx`):**
```typescript
// Only shows badge if prerequisite > 0
{session.recommendedAfterHours > 0 && (
  <div>Recommended after {session.recommendedAfterHours}+ hours of practice</div>
)}
```

## Layers

**UI Layer:**
- Purpose: React components with tab-based navigation
- Contains: Tab components (Home, Explore, Journey, Timer, Me)
- Location: `src/components/*.tsx`
- Depends on: State hooks, service layer

**Service Layer:**
- Purpose: Business logic and data operations
- Contains: Database operations, recommendations, voice scoring
- Location: `src/lib/*.ts`
- Depends on: IndexedDB, Supabase client

**Data Layer:**
- Purpose: Persistent storage
- Contains: IndexedDB schemas, Supabase tables, JSON seeds
- Location: `src/lib/db.ts`, `src/data/*.json`

## Data Flow

### Meditation Discovery → Practice Flow

1. **Explore Tab** loads sessions from Supabase (fallback to JSON)
2. **Filter** by intent tags and experience level
3. **User browses** SessionCards with vote/save/view actions
4. **SessionDetailModal** shows full details + "Adopt" button
5. **Adopt** creates PlannedSession in IndexedDB
6. **Journey Tab** shows saved meditations and planned sessions
7. **Timer Tab** executes the meditation

### State Management

**Local Storage (IndexedDB via `src/lib/db.ts`):**
- Sessions, SessionInsights, PlannedSessions
- SavedPearls, SavedTemplates, TemplateDrafts

**Remote Storage (Supabase):**
- session_templates, session_template_votes
- pearls, pearl_votes
- User profiles

## Key Abstractions

**SessionTemplate:**
- Purpose: Community meditation blueprint
- Examples: "First Breath Awakening", "Loving-Kindness for Self"
- Contains: guidance, duration, discipline, recommendedAfterHours

**Pearl:**
- Purpose: Wisdom nugget shared by practitioners
- Contains: text, upvotes, saves, intentTags, creatorVoiceScore

**Voice Score (`src/lib/voice.ts`):**
- Purpose: Credibility metric for content creators
- Formula: Weighs hours, karma, saves, completions
- Used on: Card badges to show creator credibility

## Entry Points

**App Entry:**
- Location: `src/App.tsx`
- Triggers: User loads app
- Responsibilities: Auth check, route to tabs, PWA setup

**Tab Navigation:**
- Location: `src/components/TabBar.tsx`
- Tabs: Home, Explore, Journey, Timer, Me

## Living Theme System

**Purpose:** Dynamic visual atmosphere that changes with time of day, season, and weather

**Core Files:**
- `src/components/LivingTheme.tsx` - React context provider + DOM effects renderer
- `src/lib/livingTheme.ts` - Theme state calculations
- `src/lib/themeEngine.ts` - Core theme calculations (90k+ lines of logic)
- `src/lib/solarPosition.ts` - Real-time sun altitude calculations
- `src/components/AmbientAtmosphere.tsx` - Gen 2 particle system

**Architecture:**
```
LivingTheme.tsx (brain)
    ├─→ Calculates sun altitude via solarPosition.ts
    ├─→ Determines season, time of day, effects
    ├─→ Provides LivingThemeContext to all components
    └─→ Renders visual effects:
        ├─→ Stars (parallax depth layers)
        ├─→ Snow/leaves (per-particle drift)
        ├─→ Directional light (blend modes)
        └─→ Grain overlay
```

**Effect Levels:**
- **Level 1 (Current)**: DOM-based CSS animations (~25 particles)
- **Level 2 (Planned)**: Canvas-based physics engine (~150 particles)

**Standalone Testing:**
- `theme-comparison.html` - Side-by-side Level 1 vs Level 2 comparison

## Cross-Cutting Concerns

**Offline Support:**
- IndexedDB for local storage
- Fallback JSON when Supabase unavailable
- Sync on reconnect

**Recommendations:**
- `src/lib/recommendations.ts` - Personalized suggestions
- Based on: discipline, intent, time of day, experience level

**Theming:**
- LivingTheme context provides colors/effects globally
- CSS variables for dynamic theming
- Tailwind for component styling

---

*Architecture analysis: 2026-01-10*
*Includes: Explore tab, meditation cards, Living Theme atmosphere*
