# Spacing System

Per Human-Crafted Design skill principles. Constrained scale eliminates arbitrary values that signal "not designed by a human."

## The Scale

**Only use these pixel values for ALL spacing (margin, padding, gap):**

| Token | Pixels | CSS Variable | Tailwind Class |
|-------|--------|--------------|----------------|
| 1 | 4px | `--space-1` | `p-ds-1`, `m-ds-1`, `gap-ds-1` |
| 2 | 8px | `--space-2` | `p-ds-2`, `m-ds-2`, `gap-ds-2` |
| 3 | 12px | `--space-3` | `p-ds-3`, `m-ds-3`, `gap-ds-3` |
| 4 | 16px | `--space-4` | `p-ds-4`, `m-ds-4`, `gap-ds-4` |
| 6 | 24px | `--space-6` | `p-ds-6`, `m-ds-6`, `gap-ds-6` |
| 8 | 32px | `--space-8` | `p-ds-8`, `m-ds-8`, `gap-ds-8` |
| 12 | 48px | `--space-12` | `p-ds-12`, `m-ds-12`, `gap-ds-12` |
| 16 | 64px | `--space-16` | `p-ds-16`, `m-ds-16`, `gap-ds-16` |
| 24 | 96px | `--space-24` | `p-ds-24`, `m-ds-24`, `gap-ds-24` |
| 32 | 128px | `--space-32` | `p-ds-32`, `m-ds-32`, `gap-ds-32` |

**Why this scale?** Adjacent values differ by at least 25%. Linear scales (4, 8, 12, 16, 20...) fail because percentage differences shrink at larger sizes.

## Semantic Spacing Rules

| Context | Spacing | Tokens |
|---------|---------|--------|
| **Related elements** | 8-16px | `ds-2` to `ds-4` |
| **Distinct groups** | 24-48px | `ds-6` to `ds-12` |
| **Major sections** | 64-128px | `ds-16` to `ds-32` |
| **Within components** | 8, 12, 16px only | `ds-2`, `ds-3`, `ds-4` |
| **Between components** | 24, 32, 48px | `ds-6`, `ds-8`, `ds-12` |

**Principle:** Elements placed close together are perceived as related. Distance creates semantic meaning.

## Migration from Tailwind Defaults

| Old Tailwind | Pixels | New ds-* | Notes |
|--------------|--------|----------|-------|
| `p-1` | 4px | `p-ds-1` | Direct mapping |
| `p-2` | 8px | `p-ds-2` | Direct mapping |
| `p-3` | 12px | `p-ds-3` | Direct mapping |
| `p-4` | 16px | `p-ds-4` | Direct mapping |
| `p-5` | 20px | `p-ds-6` | **Round up to 24px** |
| `p-6` | 24px | `p-ds-6` | Direct mapping |
| `p-8` | 32px | `p-ds-8` | Direct mapping |
| `p-10` | 40px | `p-ds-12` | **Round up to 48px** |
| `p-12` | 48px | `p-ds-12` | Direct mapping |
| `p-16` | 64px | `p-ds-16` | Direct mapping |

**Key migrations:**
- `px-5` (20px) → `px-ds-6` (24px) - "If you think you need 20px, you're wrong—use 16 or 24"
- `mb-10` (40px) → `mb-ds-12` (48px) - Round to nearest scale value
- `p-10` (40px) → `p-ds-12` (48px) - Round up for distinct groups

## Usage Examples

### Card Component (Within Component)
```tsx
// Header: related label and sublabel
<div className="px-ds-6 pt-ds-4 pb-ds-2">  // 24px horizontal, 16px top, 8px bottom

// Body: main content
<div className="px-ds-6 py-ds-3">  // 24px horizontal, 12px vertical

// Footer: engagement metrics
<div className="px-ds-6 pt-ds-2 pb-ds-4">  // 24px horizontal, 8px top, 16px bottom
```

### Page Layout (Between Sections)
```tsx
// Section spacing
<section className="mb-ds-16">  // 64px between major sections

// Group spacing within section
<div className="space-y-ds-6">  // 24px between groups

// Item spacing within group
<div className="space-y-ds-3">  // 12px between related items
```

### Navigation (Compact)
```tsx
<nav className="h-ds-16 px-ds-2">  // 64px height, 8px horizontal padding
  <button className="py-ds-2">  // 8px vertical padding for touch targets
```

## Anti-Patterns

**DO NOT:**
- Use `p-5` (20px) - not in scale
- Use `m-10` (40px) - not in scale
- Use arbitrary values like `p-[18px]` - never
- Mix ds-* and default Tailwind spacing in same component

**DO:**
- Use ds-* classes for all new code
- Round existing values to nearest scale value
- Apply semantic rules (related=close, distinct=far)

## Files

- **CSS Variables:** `src/index.css` (`:root` section)
- **Tailwind Config:** `tailwind.config.js` (`spacing` extension)

---

*Spacing system formalized: 2026-01-10*
*Based on Human-Crafted Design skill*
