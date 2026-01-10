# Level 2 Canvas Changeover Plan

## Overview

Upgrade the Living Theme atmosphere from DOM-based CSS animations (Level 1) to a Canvas-based physics engine (Level 2) for richer, Apple Weather-style visual effects.

**Current State (Level 1):**
- `src/components/LivingTheme.tsx` - DOM renderer with ~25 particles
- CSS animations for movement
- Limited particle count before performance issues
- Each particle is a `<div>` with transforms

**Target State (Level 2):**
- Canvas-based rendering with requestAnimationFrame
- 150+ particles at 60fps
- Per-particle physics (velocity, acceleration, drag)
- Organic wind gusts affecting particles individually
- Z-depth parallax with size/opacity scaling

---

## Phase 1: Create LivingCanvas Component

Create `src/components/LivingCanvas.tsx` - standalone Canvas-based particle system.

### 1.1 Component Interface

```tsx
interface LivingCanvasProps {
  season: Season
  timeOfDay: TimeOfDay
  effects: EffectIntensities
  expressive: boolean
}
```

### 1.2 Particle Structure

```tsx
interface Particle {
  x: number
  y: number
  z: number           // 0 (far) to 1 (near) for parallax
  size: number
  speedX: number
  speedY: number
  sway: number        // Sine wave amplitude
  swayOffset: number  // Phase offset for organic movement
  alpha: number
  color: string
  type: 'snow' | 'leaf' | 'firefly' | 'mist' | 'star'
}
```

### 1.3 Render Loop

```tsx
const render = (time: number) => {
  ctx.clearRect(0, 0, width, height)

  // Update wind with smooth decay + random gusts
  windGust *= 0.98
  if (Math.random() < 0.002) windGust = Math.random()

  particles.forEach(p => {
    // Physics update
    p.y += p.speedY * (0.5 + p.z)           // Z-depth parallax
    p.x += p.speedX + (windGust * p.z * 3)  // Wind affects near more
    p.x += Math.sin(time * 0.001 + p.swayOffset) * p.sway  // Organic sway

    // Screen wrap
    if (p.y > height + 20) resetParticle(p)
    if (p.x < -20) p.x = width + 20
    if (p.x > width + 20) p.x = -20

    // Render with depth-based alpha
    ctx.globalAlpha = p.alpha * (0.4 + p.z * 0.6)
    drawParticle(ctx, p)
  })

  animationId = requestAnimationFrame(render)
}
```

### 1.4 Particle Configuration by Season

| Season | Type | Count | Colors | Special |
|--------|------|-------|--------|---------|
| Winter | snow | 100-150 | white | Gentle drift |
| Spring | mist + fireflies | 80-100 | gray + yellow | Floating mist patches |
| Summer | fireflies | 60-80 | warm yellow | Twinkling glow |
| Autumn | leaves | 80-120 | orange/red/gold | Tumbling rotation |

### 1.5 High-DPI Support

```tsx
const dpr = window.devicePixelRatio || 1
canvas.width = containerWidth * dpr
canvas.height = containerHeight * dpr
canvas.style.width = `${containerWidth}px`
canvas.style.height = `${containerHeight}px`
ctx.scale(dpr, dpr)
```

---

## Phase 2: Integration into LivingTheme

Modify `src/components/LivingTheme.tsx` to use Canvas instead of DOM.

### 2.1 Architecture Change

```
Before:
LivingTheme.tsx → LivingThemeEffects (DOM divs)

After:
LivingTheme.tsx → LivingCanvas (single <canvas>)
                  + Static effects (gradients, moon - keep as DOM)
```

### 2.2 What Moves to Canvas

| Effect | Move to Canvas? | Reason |
|--------|-----------------|--------|
| Snow particles | Yes | Many particles, physics |
| Leaf particles | Yes | Many particles, rotation physics |
| Fireflies | Yes | Many particles, glow effect |
| Mist | Yes | Multiple patches, drift |
| Stars | Maybe | Static positions, but twinkle |
| Shooting stars | Yes | Trail effect |
| Aurora | No | CSS gradient + blur works well |
| Gradients | No | CSS is efficient |
| Moon | No | Single element, CSS works |
| Grain | No | CSS filter is efficient |

### 2.3 Hybrid Approach

Keep some effects as DOM, move particles to Canvas:

```tsx
function LivingThemeEffects({ ... }) {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Static effects - keep as DOM */}
      <GrainOverlay intensity={...} />
      <AtmosphericGradient {...} />
      <DirectionalLight {...} />
      <Moon {...} />
      <Aurora {...} />

      {/* Dynamic particles - move to Canvas */}
      <LivingCanvas
        season={season}
        timeOfDay={timeOfDay}
        effects={effects}
        expressive={expressive}
      />
    </div>
  )
}
```

---

## Phase 3: Settings Toggle

Add user option to choose effect level.

### 3.1 Settings Store Update

```tsx
// src/stores/useSettingsStore.ts
interface SettingsState {
  // existing...
  visualEffects: 'calm' | 'expressive'  // existing
  effectsRenderer: 'auto' | 'level1' | 'level2'  // new
}
```

### 3.2 Auto Detection

```tsx
const useEffectsRenderer = () => {
  const { effectsRenderer } = useSettingsStore()

  if (effectsRenderer !== 'auto') return effectsRenderer

  // Auto-detect based on device capability
  const isLowPower = navigator.hardwareConcurrency <= 2
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (isLowPower || prefersReducedMotion) return 'level1'
  return 'level2'
}
```

---

## Phase 4: Performance Optimization

### 4.1 Frame Rate Management

```tsx
// Throttle to 30fps on low-power devices
const targetFps = isLowPower ? 30 : 60
const frameInterval = 1000 / targetFps

let lastFrameTime = 0
const render = (time: number) => {
  if (time - lastFrameTime < frameInterval) {
    requestAnimationFrame(render)
    return
  }
  lastFrameTime = time
  // ... render
}
```

### 4.2 Visibility Handling

```tsx
useEffect(() => {
  const handleVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId)
    } else {
      animationId = requestAnimationFrame(render)
    }
  }
  document.addEventListener('visibilitychange', handleVisibility)
  return () => document.removeEventListener('visibilitychange', handleVisibility)
}, [])
```

### 4.3 Particle Count Scaling

```tsx
const getParticleCount = (base: number, effects: EffectIntensities) => {
  const intensityMultiplier = effects.particles
  const deviceMultiplier = isLowPower ? 0.5 : 1
  return Math.floor(base * intensityMultiplier * deviceMultiplier)
}
```

---

## Implementation Order

1. **Create `LivingCanvas.tsx`**
   - Port particle rendering from theme-comparison.html
   - Add particle types for each season
   - Implement physics loop

2. **Integrate into `LivingThemeEffects`**
   - Replace DOM particle components with LivingCanvas
   - Keep static effects as DOM

3. **Add settings toggle**
   - Update settings store
   - Add UI in Settings.tsx
   - Wire up auto-detection

4. **Performance tuning**
   - Test on various devices
   - Adjust particle counts
   - Add visibility handling

---

## Testing

### Manual Testing
1. Open app, verify Canvas renders particles
2. Cycle through all seasons - verify correct particle types
3. Cycle through all times - verify lighting/colors
4. Toggle expressive mode - verify aurora/shooting stars
5. Compare visual quality to `theme-comparison.html`

### Performance Testing
1. Open DevTools Performance tab
2. Record 10 seconds of animation
3. Verify consistent 60fps (or 30fps on throttled)
4. Check memory doesn't grow unbounded

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/LivingCanvas.tsx` | Create | Canvas-based particle renderer |
| `src/components/LivingTheme.tsx` | Modify | Integrate LivingCanvas, remove DOM particles |
| `src/stores/useSettingsStore.ts` | Modify | Add effectsRenderer setting |
| `src/components/Settings.tsx` | Modify | Add Level 1/Level 2 toggle UI |

---

## Rollback Plan

If issues arise, the existing DOM-based Level 1 code remains in `theme-comparison.html` and can be quickly restored by reverting the LivingThemeEffects changes.

---

*Plan created: 2026-01-10*
*Reference: theme-comparison.html for working Level 2 implementation*
