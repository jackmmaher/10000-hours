# Transition & Animation System

Per Human-Crafted Design skill principles. Constrained timing creates consistent, polished interactions that feel human-designed.

## Transition Timing Scale

**Only use these durations for ALL transitions:**

| Token | Duration | CSS Variable | Tailwind Class | Use For |
|-------|----------|--------------|----------------|---------|
| fast | 150ms | `--transition-fast` | `duration-fast` | Hover states, micro-interactions |
| base | 200ms | `--transition-base` | `duration-base` | Standard transitions |
| slow | 300ms | `--transition-slow` | `duration-slow` | Emphasis, complex motion |

**Why this scale?** Based on human perception thresholds:
- **<100ms** feels instant (no transition needed)
- **150ms** acknowledges interaction without delay
- **200ms** comfortable default for most UI
- **300ms** draws attention, creates emphasis
- **>400ms** feels sluggish (avoid for UI interactions)

## Easing Functions

| Token | CSS Variable | Tailwind Class | Use For |
|-------|--------------|----------------|---------|
| out | `--ease-out` | `ease-out` | Default for most transitions (fast start, smooth end) |
| in-out | `--ease-in-out` | `ease-in-out` | Reversible actions, toggles |
| organic | `--ease-organic` | `ease-organic` | Playful/delightful micro-interactions |

**Easing values:**
```css
--ease-out: cubic-bezier(0.33, 1, 0.68, 1);      /* Smooth deceleration */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);  /* Symmetric ease */
--ease-organic: cubic-bezier(0.34, 1.56, 0.64, 1); /* Slight overshoot - playful */
```

## Semantic Usage Rules

| Interaction Type | Duration | Easing | Example |
|------------------|----------|--------|---------|
| **Hover states** | fast (150ms) | out | Button hover, link underline |
| **Active/pressed** | fast (150ms) | out | Button press, scale down |
| **Focus rings** | fast (150ms) | out | Focus-visible outline |
| **Toggles** | base (200ms) | in-out | Switch, checkbox |
| **Reveals** | slow (300ms) | out | Dropdown, accordion |
| **Page transitions** | slow (300ms) | in-out | Route changes, modals |
| **Emphasis** | slow (300ms) | organic | Success feedback, celebration |

## CSS Variable Usage

For inline styles or custom CSS:

```css
/* Standard transition */
.element {
  transition: var(--transition-base);  /* 200ms ease-out */
}

/* Specific property */
.element {
  transition: transform var(--transition-fast);  /* 150ms for transform */
}

/* Multiple properties */
.element {
  transition:
    opacity var(--transition-fast),
    transform var(--transition-base);
}
```

## Tailwind Class Usage

```tsx
// Hover state (fast)
<button className="transition-colors duration-fast ease-out hover:bg-accent">

// Toggle animation (base)
<div className="transition-all duration-base ease-in-out">

// Modal entrance (slow)
<div className="transition-opacity duration-slow ease-out">

// Playful interaction
<div className="transition-transform duration-base ease-organic hover:scale-105">
```

## Existing Animations

Complex keyframe animations defined in Tailwind config:

| Animation | Duration | Use For |
|-----------|----------|---------|
| `animate-fade-in` | 400ms | Element entrance |
| `animate-fade-out` | 400ms | Element exit |
| `animate-breathe` | 6s | Timer breathing pulse |
| `animate-breathe-slow` | 8s | Slower ambient pulse |
| `animate-word-fade` | 400ms | Wisdom text entrance |
| `animate-pulse-soft` | 3s | Subtle ambient glow |
| `animate-orb-breathe` | 4s | Luminous orb core |
| `animate-orb-glow` | 4s | Orb outer glow |

**Note:** These use 400ms for animations that should feel contemplative/meditative. The app's aesthetic intentionally uses slower timing for ambient effects while keeping UI interactions snappy (150-300ms).

## Migration from Legacy Timing

| Old Value | Replace With | Notes |
|-----------|--------------|-------|
| `duration-400` | Keep (ambient) or `duration-slow` (UI) | Context-dependent |
| `duration-600` | Keep (ambient) or `duration-slow` (UI) | Context-dependent |
| `transition-all duration-150` | `transition-all duration-fast` | Semantic naming |
| `transition-all duration-200` | `transition-all duration-base` | Semantic naming |
| `transition-all duration-300` | `transition-all duration-slow` | Semantic naming |

## Anti-Patterns

**DO NOT:**
- Use durations >400ms for UI interactions (feels sluggish)
- Use linear easing for UI (feels robotic)
- Mix transition timing inconsistently within same component
- Animate layout properties (width, height) - use transform instead

**DO:**
- Use `duration-fast` for hover/active states consistently
- Use `duration-base` as your default
- Use `duration-slow` only for emphasis/reveals
- Prefer `opacity` and `transform` for smooth 60fps animations

## Files

- **CSS Variables:** `src/index.css` (`:root` section)
- **Tailwind Config:** `tailwind.config.js` (`transitionDuration`, `transitionTimingFunction`)

---

*Animation system formalized: 2026-01-10*
*Based on Human-Crafted Design skill*
