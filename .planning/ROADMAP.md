# DOSE Enhancement Roadmap

**Milestone:** v2.0 - Neurochemical Wellbeing Enhancement
**Phases:** 8
**Depth:** Comprehensive

## Overview

Sequential implementation of happiness chemical optimizations, ordered by:
1. **Foundation first** - Haptics and notifications infrastructure
2. **Quick wins** - Low-effort, high-impact enhancements
3. **Feature builds** - New capabilities requiring more work

---

## Phase 01: Haptic Vocabulary Expansion

**Goal:** Expand haptic patterns from 3 (light/medium/success) to 6+ with semantic meaning

**Deliverables:**
- Add `error` and `warning` haptic patterns
- Add `heavy` pattern for significant actions (delete, publish)
- Create contextual haptic variations (session start = inhale, session complete = exhale settling)
- Document haptic vocabulary for consistency

**Tasks:** ~4 tasks
**Research:** No (extends existing `useTapFeedback.ts`)

---

## Phase 02: Audio Feedback Channel

**Goal:** Add optional sound effects for key moments (completion chimes, milestone sounds)

**Deliverables:**
- Audio asset integration (small, royalty-free sounds)
- Settings toggle for audio feedback (default: off)
- Completion chime on session end
- Subtle milestone achievement sound
- Respect device silent mode

**Tasks:** ~5 tasks
**Research:** Likely (Web Audio API, iOS audio policies)

---

## Phase 03: Dopamine - Variable Rewards & Near-Miss

**Goal:** Add surprise micro-rewards and progress anticipation without addiction patterns

**Deliverables:**
- Session count milestones (50th session, 100th, etc.)
- "First morning meditation this week" type surprises
- Near-miss visibility ("0.3 hours to next milestone")
- Progress anticipation states in UI

**Tasks:** ~5 tasks
**Research:** No (extends existing milestone system)

---

## Phase 04: Oxytocin - Attribution & Reciprocity

**Goal:** Surface how users' contributions help others and balance of give/receive

**Deliverables:**
- "Your meditation helped X people this week" notification/card
- Reciprocity dashboard showing give/receive balance
- Optional gratitude prompts after practicing someone's meditation
- "Someone is meditating with you" presence indicator (if multiple users active)

**Tasks:** ~6 tasks
**Research:** Likely (real-time presence, notification timing)

---

## Phase 05: Serotonin - Mastery Language & Unlocks

**Goal:** Add narrative to Voice tiers and expertise-based feature access

**Deliverables:**
- Voice tier labels (Newcomer → Practitioner → Established → Respected → Mentor)
- Tier transition celebrations
- High-voice feature unlocks (longer sessions, course creation)
- Comparative mastery ("You've meditated more than 90% of users")

**Tasks:** ~4 tasks
**Research:** No (extends existing voice.ts)

---

## Phase 06: Endorphin - Breath Pacing & Body Awareness

**Goal:** Deepen physical release through guided breathing and body prompts

**Deliverables:**
- Optional breath pacing guide (4-7-8, box breathing) with visual + haptic
- Post-session body awareness prompt ("Notice how your body feels")
- Post-long-session stretch suggestions (30+ min)
- Breath pace options in session settings

**Tasks:** ~5 tasks
**Research:** Likely (breath timing patterns, haptic synchronization)

---

## Phase 07: Gentle Reminders Foundation

**Goal:** Build notification infrastructure for attribution alerts and gentle practice reminders

**Deliverables:**
- In-app notification center (not push - local)
- Notification types: attribution, milestone, gentle reminder
- Reminder scheduling (user sets preferred times)
- Notification preferences in Settings
- "Snooze" and "dismiss" actions

**Tasks:** ~6 tasks
**Research:** Likely (notification timing, local notification storage)

---

## Phase 08: Design System Refinement

**Goal:** Formalize design tokens and extract reusable components per Human-Crafted Design skill

**Deliverables:**
- Spacing CSS variables with constrained scale (4, 8, 12, 16, 24, 32, 48, 64, 96, 128)
- Typography consolidated to 5 semantic styles (display, heading, subheading, body, caption)
- Button component with complete interactive states (hover, active, focus-visible, disabled)
- Transition timing tokens (fast: 150ms, base: 200ms, slow: 300ms)
- Design system documentation (SPACING.md, ANIMATION.md)

**Tasks:** ~10 tasks (4 plans)
**Research:** No (applies existing Human-Crafted Design skill)

**Context:** Based on SWOT analysis of codebase against Human-Crafted Design skill. Addresses:
- Spacing values outside constrained scale (px-5=20px, mb-10=40px)
- Typography variations exceeding 5 styles (text-[10px] arbitrary)
- Inconsistent button states across components
- Non-standard transition timing (400ms, 600ms)

---

## Domain Expertise

Load these skills when planning phases:
- `~/.claude/skills/design-ui-skills` - Human-crafted design principles

---

## Execution Order

```
Phase 01 (Haptics)     ──┐
                         ├─→ Foundation
Phase 02 (Audio)       ──┘

Phase 03 (Dopamine)    ──┬─→ Quick chemical wins
Phase 05 (Serotonin)   ──┘

Phase 04 (Oxytocin)    ──┬─→ Requires Phase 07
Phase 06 (Endorphin)   ──┤
Phase 07 (Notifications)─┘   ← Build this before/alongside 04, 06
```

**Recommended execution:** 01 → 02 → 07 → 03 → 04 → 05 → 06

This order:
1. Builds haptic/audio infrastructure first
2. Gets notifications ready for attribution features
3. Tackles simpler chemical enhancements (Dopamine, Serotonin) before complex ones
4. Leaves Endorphin (breath pacing) for last as it's most experimental

---

## Dependencies

| Phase | Depends On |
|-------|------------|
| 01 | None |
| 02 | None |
| 03 | None (nice-to-have: 02 for sounds) |
| 04 | 07 (notifications for attribution alerts) |
| 05 | None |
| 06 | 01 (haptics for breath sync) |
| 07 | None |
| 08 | None (independent design refinement) |

---

*Roadmap created: 2026-01-10*
*Estimated total tasks: ~45 across 8 phases*
