# Architecture

**Analysis Date:** 2026-01-14

## Pattern Overview

**Overall:** React SPA with Living Theme System

**Key Characteristics:**

- Client-side only (no server rendering)
- Local-first data (IndexedDB via Dexie)
- Solar-aware theming system
- PWA with offline capability

## Theme System Architecture

The theme system is the visual heart of the application, creating distinct experiences based on time of day and season.

### Core Data Flow

```
Solar Position → Theme Calculation → CSS Variables → UI Rendering
      ↑               ↑                    ↑              ↑
   Location      Season/Time          LivingTheme     Components
```

### Theme Calculation Pipeline

**1. Solar Position** (`src/lib/solarPosition.ts`)

- `getLocation()` - Fetches user location (IP API → localStorage cache → timezone fallback)
- `calculateSunPosition()` - NOAA algorithms for sun altitude/azimuth
- `calculateMoonPosition()` - Lunar position and phase calculations
- `calculateMaxSolarAltitude()` - Latitude-aware max sun height for relative positioning

**2. Living Theme State** (`src/lib/livingTheme.ts`)

- `calculateLivingTheme()` - Main entry point for auto mode
- `calculateManualTheme()` - Fixed theme for manual mode
- `calculateEffectIntensities()` - Derives visual effect levels from sun altitude
- `getSeasonalEffects()` - Season-specific particle types (snow, fireflies, leaves, mist)
- `applyLivingTheme()` - Writes CSS custom properties to DOM

**3. Theme Tokens** (`src/lib/theme/`)

- `types.ts` - `ThemeTokens` interface (70+ color tokens)
- `tokens/*.ts` - 16 season/time combinations + 2 neutral themes
- `calculation.ts` - `calculateThemeBySunPosition()` blends themes by sun altitude
- `interpolation.ts` - Contrast-preserving interpolation between themes
- `cssProperties.ts` - Converts tokens to CSS custom properties

### Theme Modes

```typescript
type ThemeMode =
  | 'neutral-auto' // Follow system dark/light (DEFAULT)
  | 'neutral-light' // Always light
  | 'neutral-dark' // Always dark
  | 'living-auto' // Solar-based seasonal theming
  | 'living-manual' // User-selected season + time
```

### Visual Effects Pipeline

**LivingTheme Provider** (`src/components/LivingTheme.tsx`)

```
LivingTheme
├── Context Provider (LivingThemeState)
├── Breathing Animation (CSS keyframes)
├── LivingThemeEffects
│   ├── GrainOverlay (film grain texture)
│   ├── AtmosphericGradient (day/night sky)
│   ├── DirectionalLight (golden hour glow)
│   └── LivingCanvas (particles, celestial)
└── Children (app content)
```

**LivingCanvas** (`src/components/LivingCanvas.tsx`)

- requestAnimationFrame loop for 60fps rendering
- Particle system with wind physics
- Renders based on `EffectIntensities`:
  - Stars (fade in as sun sets)
  - Moon (position, phase, illumination)
  - Sun (position-based rendering)
  - Seasonal particles (snow/leaves/fireflies/mist)
  - Aurora (expressive mode, winter nights)
  - Shooting stars (expressive mode, nights)

**Canvas Renderers** (`src/components/canvas/renderers/`)

- `sun.ts` - Sun disc with glow
- `moon.ts` - Moon with accurate phase shadow
- `star.ts` - Twinkling stars with color temperature
- `snow.ts` - Falling snowflakes with physics
- `leaf.ts` - Autumn leaves with rotation
- `firefly.ts` - Summer evening fireflies
- `mist.ts` - Spring morning mist
- `aurora.ts` - Northern lights effect
- `shootingStars.ts` - Meteor trails

## Layers

**UI Layer:**

- React components (`src/components/`)
- Receives theme via CSS custom properties and context
- No direct theme calculation

**Theme Layer:**

- `LivingTheme.tsx` - Provider component
- `livingTheme.ts` - State calculation
- `themeEngine.ts` - Token management (re-exports from `theme/`)

**Data Layer:**

- Zustand stores (`src/stores/`)
- Dexie database (`src/lib/db/`)

**Utility Layer:**

- Solar calculations (`solarPosition.ts`)
- Color utilities (`theme/colorUtils.ts`)
- Noise generation (`noise/SimplexNoise.ts`)

## Data Flow

**Theme Update Cycle:**

1. App mounts → `LivingTheme` provider initializes
2. Fetches location (cached or API)
3. Calculates sun position for current time
4. Derives theme tokens and effect intensities
5. Applies CSS custom properties to `<html>`
6. Starts canvas animation loop
7. Updates every 60 seconds (solar tracking)

**State Management:**

- `useSettingsStore` - Theme mode, visual effects preference
- `LivingThemeContext` - Current theme state for consumers

## Key Abstractions

**ThemeTokens:**

- 70+ design tokens covering all UI elements
- Semantic naming (bgBase, textPrimary, orbCore, etc.)
- Includes isDark boolean for class toggling

**EffectIntensities:**

- Normalized 0-1 values for visual effects
- Derived from sun altitude via unified thresholds
- Used by both CSS and canvas rendering

**Particle System:**

- Type-discriminated union (`Particle` type)
- Factory functions in `particles.ts`
- Render functions in `renderers/`

## Entry Points

**App Entry:**

- `src/main.tsx` - React root mounting
- `src/App.tsx` - Root component, wraps in LivingTheme

**Theme Entry:**

- `src/components/LivingTheme.tsx` - Main theme provider
- `src/hooks/useTheme.ts` - Legacy hook (still used by some components)

## Error Handling

**Strategy:** React ErrorBoundary at app root

**Theme Fallbacks:**

- Location: timezone estimation if IP lookup fails
- Theme: neutral mode if living theme errors
- Canvas: visibility change pauses/resumes animation

## Cross-Cutting Concerns

**Performance:**

- Canvas uses `requestAnimationFrame` with visibility check
- Theme updates throttled to 60-second intervals
- Particles culled when off-screen

**Accessibility:**

- `prefers-reduced-motion` disables breathing animation
- Theme respects system dark mode preference in neutral-auto

**Memory:**

- Canvas animation cancelled on unmount
- Particles recreated only on theme/mode change

---

_Architecture analysis: 2026-01-14_
_Update when major patterns change_
