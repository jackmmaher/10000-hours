# Project: DOSE Enhancement System

**Created:** 2026-01-10
**Status:** Planning

## Vision

Transform the 10,000 Hours meditation app from a practice tracker into a **neurochemically-optimized wellbeing companion** by deliberately designing features that trigger the four happiness chemicals (Dopamine, Oxytocin, Serotonin, Endorphin) through thoughtful, ethical mechanics.

## Background

### Current State Analysis (Pre-Enhancement)

| Chemical | Current Score | Strength | Gap |
|----------|---------------|----------|-----|
| **Dopamine** | 7/10 | Milestones, progress ring, Voice score | Variable rewards, audio feedback, near-miss visibility |
| **Oxytocin** | 8/10 | Upvotes, pearl sharing, "others practiced" | Attribution visibility, reciprocity cues, anonymous encouragement |
| **Serotonin** | 9/10 | Voice system, tenure, practice patterns | Mastery language (tier labels), expertise unlocks |
| **Endorphin** | 6/10 | Breathing orb, meditation itself | Breath pacing guides, body awareness prompts |

### Design Philosophy

The app is **Serotonin-dominant** by design—building long-term identity and mastery rather than addiction. All enhancements must:

1. **Respect zen philosophy** - No dark patterns, no urgency, no guilt
2. **Be opt-in** - Features that change the experience are toggleable
3. **Reinforce practice** - Every chemical trigger should encourage actual meditation
4. **Maintain restraint** - Brief celebrations (2.5s cap), no gamification pressure

## Goals

### Primary
- Increase **Endorphin** score from 6/10 to 8/10 (biggest gap)
- Add **variable reward** mechanisms for Dopamine without addiction patterns
- Surface **attribution/reciprocity** for Oxytocin
- Add **mastery language** for Serotonin

### Secondary
- Establish notification/reminder infrastructure (required for several features)
- Expand haptic vocabulary (error, warning, contextual patterns)
- Add optional audio feedback channel

## Constraints

- **No streaks** - Zen philosophy prohibits guilt mechanics
- **No urgency messaging** - "Last chance!" / "Don't miss out!" forbidden
- **Brief celebrations** - 2.5s maximum, auto-dismiss
- **WCAG AA compliance** - All new UI must maintain accessibility
- **Living Theme integration** - New features must respect 16 theme variants
- **Offline-first** - All features must work without connectivity

## Success Metrics

1. **Haptic coverage**: Error/warning patterns added, contextual haptics for breathing
2. **Attribution system**: Users see when their content helps others
3. **Reciprocity dashboard**: Give/receive balance visible
4. **Breath pacing**: Optional haptic/visual breath guides available
5. **Notification foundation**: Gentle reminder system operational
6. **Audio feedback**: Optional completion chimes

## Domain Expertise

- `~/.claude/skills/design-ui-skills` - Human-crafted design principles
- Existing codebase: `src/hooks/useTapFeedback.ts`, `src/lib/voice.ts`, `src/lib/milestones.ts`

## Out of Scope

- Push notification infrastructure (requires native app work)
- Premium/paid features (app is free)
- Social features beyond existing (no chat, no profiles browsing)
- Gamification leaderboards

---

*Project scope: DOSE neurochemical enhancement through ethical UX design*
