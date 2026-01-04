# 10,000 Hours — Build Session Initialization Prompt

Copy everything below the line into a new Claude Code session.

---

I'm building the 10,000 Hours meditation app. Before we begin coding, please complete these setup steps in order:

---

## 1. VERIFY ENVIRONMENT

First, confirm you can access my local repository:
- Path: `C:\Users\jackm\Projects\10000-hours`
- Run `git status` to confirm you're on `main` and in sync with origin

If browser MCP is available, optionally verify the live deployment:
- URL: https://10000-hours-three.vercel.app/

---

## 2. READ THESE FILES IN ORDER

**Primary spec (read entirely — this is the north star):**

1. `ROADMAP.md` — The canonical build spec with all integrated review changes

**Supporting context (skim for reference):**

2. `ROADMAP-CHIEF-SOFTWARE-DESIGNER-REVIEW.md` — Architectural review (concerns already integrated into roadmap)

3. `addendum_ghibli_tree_rendering.md` — Ghibli tree aesthetic guidance (already integrated into roadmap)

**Current codebase:**

4. `src/App.tsx` — Current app structure and routing

5. `src/components/Timer.tsx` — Core timer component (the heart of the app)

6. `src/stores/useSessionStore.ts` — State management for sessions

7. `src/lib/db.ts` — Dexie database schema

8. `tailwind.config.js` — Current design tokens

9. `src/index.css` — Global styles

10. `package.json` — Current dependencies

**Visual reference (guidance, not canonical):**

11. `wireframes/index.html` — Overview of all wireframe screens

---

## 3. CONFIRM UNDERSTANDING

After reading, summarize:

- **Current app state**: What's already built and working
- **Phase 0 requirements**: Accounts/services to set up (Apple Developer, Supabase, RevenueCat, App Store Connect)
- **Phase 1 requirements**: First code changes, including:
  - Sentry crash reporting
  - Vitest testing framework
  - Supabase tables with explicit RLS policies
  - Database indexes
  - Dexie schema versioning
  - Apple Sign-In flow
- **Design language**: The Ghibli principles (Ma, breathing, warmth, stillness)
- **Typography**: Palatino Linotype (display) + Raleway (body) — why this pairing

---

## 4. AWAIT MY GO-AHEAD

Do not begin coding until I confirm. We'll work phase by phase, following the roadmap's test checklists before moving forward.

---

## KEY CONTEXT

- **Design language**: Ghibli-inspired (Ma, breathing animations, warmth, permission for stillness)
- **Typography**: Palatino Linotype (display) + Raleway (body) — Spirited Away authentic
- **Monetization**: Free timer forever, premium unlocks Garden/Calendar/Sync ($29.99/yr or $99.99 lifetime)
- **Tech stack**: React + TypeScript + Vite + Zustand + Dexie + Tailwind + Capacitor
- **Target**: iOS App Store via Capacitor

**Key architectural decisions (from integrated reviews):**
- Garden: Standalone p5.js prototype before integration, Aesthetic Modulation Layer for visual character
- Spirit: Renders inside p5 canvas (not CSS overlay) for visual coherence
- Sync: Tombstones for deletes, idempotent operations, transaction logging
- Year Summary: Full animation target with 5-day fallback to static version
- iOS: Keep-awake plugin, absolute timestamps for timer lifecycle
- Testing: Vitest unit tests, memory profiling for p5.js

**New files to create (beyond original plan):**
- `src/lib/aesthetic.ts` — Aesthetic Modulation Layer
- `src/lib/milestones.ts` — Milestone detection for Year Summary
- `src/hooks/useP5Canvas.ts` — p5.js lifecycle management hook
- `src/components/AnimationTimeline.tsx` — Reusable animation sequencer
- `.github/workflows/ci.yml` — GitHub Actions CI/CD

**Risk monitoring triggers:**
- Garden doesn't feel magical at 1-week mark → pivot to hybrid/milestone approach
- Sync edge cases keep appearing → simplify to explicit sync
- Year Summary animation stuck >5 days → ship static version
- Performance issues in Phase 5b → reduce canvas complexity

The wireframes in `wireframes/` are visual guidance, not canonical. **ROADMAP.md is the single source of truth.**

---
