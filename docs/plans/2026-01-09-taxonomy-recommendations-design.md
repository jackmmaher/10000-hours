# Taxonomy Rationalization & Contextual Recommendations

## Summary

This design addresses two interconnected concerns:
1. **Taxonomy consistency** — Ensuring input fields, filters, and presets align across all screens
2. **Contextual discovery** — Using taxonomy data intelligently across the app, not just in Explore filters

## Current State Analysis

### What's Working

| Taxonomy | Consistency | Notes |
|----------|-------------|-------|
| Disciplines (9) | Shared from `meditation-options.ts` | Used in TemplateEditor, MeditationPlanner, SessionCard |
| Postures (8) | Shared from `meditation-options.ts` | Auto-fills correctly when saving meditation to planner |
| Best Times (6) | Shared from `meditation-options.ts` | Display only, not filterable |
| Intent Tags (8) | New system, working | Filterable in Explore, selectable in TemplateEditor |

### Issues to Fix

| Issue | Location | Fix |
|-------|----------|-----|
| Duration inconsistency | TemplateEditor missing 25 min | Standardize to `[5, 10, 15, 20, 25, 30, 45, 60]` |
| Custom duration chaos | MeditationPlanner line 642 | Replace with scrollable picker (1-180 min) |
| 75 min = "3 hr" bug | MeditationPlanner display logic | Fix formatDuration to handle all cases |
| Creator hours message | TemplateEditor lines 472-475 | Remove (replaced by VoiceBadge) |

---

## Duration Fix

### Principle

Duration planning captures the delta between *planned* vs *actual* meditation time. This feeds into Progress insights for behavioral patterns.

### Implementation

**Standard presets (all screens):**
```typescript
const DURATION_PRESETS = [5, 10, 15, 20, 25, 30, 45, 60]
```

**Custom picker (MeditationPlanner):**
- Replace chaotic array with scrollable numeric picker (1-180 min)
- Smart display formatting:
  ```typescript
  function formatDuration(mins: number): string {
    if (mins < 60) return `${mins} min`
    const hrs = Math.floor(mins / 60)
    const rem = mins % 60
    if (rem === 0) return `${hrs}h`
    return `${hrs}h ${rem}m`
  }
  ```

---

## Contextual Recommendation System

### Philosophy

Don't add 100 filter pills to Explore. Instead, let taxonomy work behind the scenes and surface content at the right place and time.

### Data Sources (Already Available)

| Source | Data | Location |
|--------|------|----------|
| Local Sessions | discipline, duration, time-of-day, pose | `db.ts` Session table |
| Saved Content | templateId, savedAt | `db.ts` SavedTemplate table |
| Voice Inputs | hours, depth, consistency, karma, saves | `voice.ts` VoiceInputs |
| Content Taxonomy | intentTags, discipline, bestTime, recommendedAfterHours | `sessions.json` |

### New Module: `lib/recommendations.ts`

```typescript
interface RecommendationInputs {
  // From local session history
  disciplineFrequency: Map<string, number>
  avgDurationMinutes: number
  timeOfDayPattern: 'morning' | 'midday' | 'evening' | 'mixed'

  // From Voice
  totalHours: number

  // From saved content
  savedTemplateIds: string[]
  savedIntentTags: string[]
}

interface WeeklyRecommendation {
  meditation: SessionTemplate | null
  pearl: Pearl | null
  reason: string  // "Based on your evening practice..."
}

function getWeeklyRecommendation(inputs: RecommendationInputs): WeeklyRecommendation
```

### Algorithm

1. **Filter by experience** — `recommendedAfterHours <= user.totalHours`
2. **Weight by discipline** — Prefer user's frequently-practiced disciplines
3. **Exclude seen** — Skip already-saved content
4. **Match intent** — Boost content with intentTags matching user's saved content
5. **Collaborative (future)** — Boost content popular with similar Voice-level users

### Surfaces

| Surface | Trigger | What Shows |
|---------|---------|------------|
| **Progress Tab** | Weekly refresh | "Suggested for you" card — 1 meditation + 1 pearl |
| **Post-Session** | After InsightCapture | Related pearl based on session discipline |
| **Timer (no plan)** | Open Timer, no plan today | Subtle suggestion based on time + patterns |

### Collaborative Filtering (Future)

Server-side Supabase RPC to find content popular with similar users:

```sql
SELECT template_id, COUNT(*) as similar_user_saves
FROM saved_templates st
JOIN profiles p ON st.user_id = p.id
WHERE p.total_hours BETWEEN $user_hours * 0.7 AND $user_hours * 1.3
  AND p.id != $current_user_id
GROUP BY template_id
ORDER BY similar_user_saves DESC
LIMIT 5
```

---

## Cleanup Tasks

- [ ] Remove `tags` field display from any remaining components (legacy hashtags)
- [ ] Remove creator hours message from TemplateEditor (lines 472-475)
- [ ] Standardize duration arrays across TemplateEditor and meditation-options.ts
- [ ] Fix MeditationPlanner custom duration picker

---

## Implementation Priority

1. **Quick wins** — Duration fix, remove legacy elements
2. **Recommendations module** — `lib/recommendations.ts` with `getWeeklyRecommendation()`
3. **Progress surface** — "Suggested for you" component
4. **Post-session surface** — Related pearl after InsightCapture
5. **Collaborative filtering** — Server-side RPC (future phase)
