# Codebase Structure

**Analysis Date:** 2026-01-10

## Directory Layout

```
10000-hours/
├── src/
│   ├── components/       # React components
│   │   ├── Explore.tsx          # Explore tab - main discovery feed
│   │   ├── SessionCard.tsx      # Meditation card component
│   │   ├── SessionDetailModal.tsx # Full meditation details + adopt
│   │   ├── Card.tsx             # Base card with glassmorphism
│   │   ├── Journey.tsx          # Journey tab - saved/planned
│   │   ├── JourneySavedContent.tsx # Collected meditations
│   │   ├── Timer.tsx            # Timer tab - meditation execution
│   │   └── ...                  # Other components
│   ├── data/
│   │   ├── sessions.json        # 110 seed meditation templates
│   │   └── pearls.json          # Seed wisdom pearls
│   ├── lib/
│   │   ├── db.ts                # IndexedDB schemas & operations
│   │   ├── recommendations.ts   # Recommendation engine
│   │   ├── voice.ts             # Voice score algorithm
│   │   ├── types.ts             # Shared TypeScript types
│   │   ├── pearls.ts            # Pearl API operations
│   │   └── templates.ts         # Template API operations
│   └── App.tsx
├── .planning/
│   └── codebase/                # Codebase documentation
├── supabase/                    # Database migrations
└── public/                      # Static assets
```

## Explore Tab Components

**Main Components:**

| File | Purpose |
|------|---------|
| `src/components/Explore.tsx` | Main discovery feed with mixed pearls/sessions |
| `src/components/SessionCard.tsx` | Individual meditation card with vote/save |
| `src/components/SessionDetailModal.tsx` | Full details modal with adopt flow |
| `src/components/Card.tsx` | Base card system (CardHeader, CardBody, etc.) |
| `src/components/SuggestedForYou.tsx` | Weekly personalized recommendation |

**Explore Flow:**
```
Explore.tsx
    ├─→ Loads sessions from Supabase or JSON fallback
    ├─→ Filters by intent (anxiety, stress, sleep, etc.)
    ├─→ Renders SessionCard for each session
    └─→ SessionDetailModal opens on click
        ├─→ Shows full guidance notes
        ├─→ Shows "Recommended after X+ hours" badge
        └─→ Adopt button → adds to Journey
```

## Key File Locations

**Meditation Data:**
- `src/data/sessions.json` - 110 meditation templates with `recommended_after_hours`
- `src/lib/types.ts` - SessionTemplate interface definition

**Experience Filtering:**
- `src/lib/recommendations.ts` - `scoreSession()` filters by hours
- `src/components/SessionDetailModal.tsx` - Displays hours badge

**Journey Integration:**
- `src/components/Journey.tsx` - Personal space with 3 sub-tabs
- `src/components/JourneySavedContent.tsx` - Collected meditations
- `src/lib/db.ts` - SavedTemplate, PlannedSession schemas

**Living Theme System:**
- `src/components/LivingTheme.tsx` - Main context provider + DOM effects
- `src/components/AmbientAtmosphere.tsx` - Gen 2 particle system
- `src/lib/themeEngine.ts` - Core calculations (90k bytes)
- `src/lib/solarPosition.ts` - Sun altitude calculations
- `src/lib/livingTheme.ts` - Theme state helpers
- `theme-comparison.html` - Standalone Level 1 vs Level 2 testing

**State Management:**
- `src/stores/useAuthStore.ts` - Authentication state
- `src/stores/useSessionStore.ts` - Meditation session state
- `src/stores/useSettingsStore.ts` - User preferences
- `src/stores/useNavigationStore.ts` - Tab navigation

**Hooks:**
- `src/hooks/useTheme.ts` - Theme consumption hook
- `src/hooks/useVoice.ts` - Voice profile calculations
- `src/hooks/useTimer.ts` - Meditation timer logic
- `src/hooks/useSwipe.ts` - Touch gestures

## Naming Conventions

**Files:**
- PascalCase.tsx for React components
- camelCase.ts for utilities/services
- kebab-case.json for data files

**Directories:**
- lowercase for all directories
- Singular names (lib, data, not libs, datas)

## Where to Add New Code

**New Meditation Feature:**
- Component: `src/components/`
- Business logic: `src/lib/`
- Data schema: `src/lib/db.ts`

**New Explore Filter:**
- Filter options: `src/components/Explore.tsx` (INTENT_OPTIONS array)
- Filter logic: Same file, `filteredSessions` computation

**New Card Type:**
- Create: `src/components/NewCard.tsx`
- Use base: Import from `src/components/Card.tsx`

---

*Structure analysis: 2026-01-10*
*Focus: Explore tab, meditation cards, experience-based recommendations*
