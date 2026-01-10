# Intent-Based Content Discovery

## The Insight

From analyzing 2,400 competitor reviews, most people begin meditation to solve a problem - anxiety (114 requests), sleep (65), stress (47), focus (38). Your content addresses these needs, but the discovery mechanism is technique-focused rather than intent-focused.

## Current State

**110 sessions** tagged by technique:
- `#intermediate` (44), `#beginners` (42), `#morning` (25)
- `#breath` (16), `#openawareness` (13)

**Intent tags are sparse:**
- `#anxiety`: 2 sessions
- `#stress`: 1 session
- `#sleep`: 7 sessions
- `#focus`: 1 session
- `#grief`, `#depression`: 0 sessions

**250 pearls** - rich content but entirely untagged by intent

---

## Proposed Solution

### 1. Add `intent_tags` Field

Separate from technique tags. These describe what the practice helps with:

```typescript
// sessions.json schema addition
{
  "id": "session-xxx",
  "tags": ["#beginners", "#breath", "#morning"],  // technique (existing)
  "intent_tags": ["anxiety", "stress", "racing-mind"]  // NEW: what it helps with
}

// pearls.json schema addition
{
  "id": "pearl-xxx",
  "text": "...",
  "intent_tags": ["anxiety", "acceptance", "thoughts"]  // NEW
}
```

### 2. Intent Tag Vocabulary

Understated, lowercase, no decoration:

**Mental states:**
- `anxiety` - worry, panic, fear, nervousness
- `stress` - pressure, tension, overwhelm
- `low-mood` - sadness, heaviness, depression
- `grief` - loss, letting go, mourning
- `anger` - frustration, irritation

**Cognitive:**
- `focus` - concentration, attention, scattered mind
- `racing-mind` - overthinking, rumination
- `clarity` - confusion, decisions

**Physical:**
- `sleep` - insomnia, rest, bedtime
- `pain` - discomfort, chronic conditions
- `tension` - body tightness, release

**Relational:**
- `self-compassion` - self-criticism, worthiness
- `relationships` - conflict, connection

### 3. Explore Tab Integration

Add a subtle intent filter row beneath the existing content-type filter:

```
┌────────────────────────────────────────────┐
│ Explore                                    │
│ Wisdom and meditations from the community  │
│                                            │
│ [All] [Pearls] [Meditations]               │  ← existing
│                                            │
│ Working with:                              │  ← NEW
│ [anxiety] [sleep] [focus] [stress] ...     │
│                                            │
│ [Rising] [New] [Top]                       │  ← existing
└────────────────────────────────────────────┘
```

Visual style matches existing filters:
- Inactive: `bg-cream-deep text-ink/50 hover:text-ink/70`
- Active: `bg-ink text-cream`
- Rounded pills: `px-3 py-1.5 text-sm rounded-full`

### 4. Tag Display in Cards

Show intent tags alongside technique tags in SessionDetailModal:

```tsx
{/* Tags */}
{session.tags && session.tags.length > 0 && (
  <div className="flex flex-wrap gap-2">
    {session.tags.map(tag => (
      <span key={tag} className="text-sm text-moss">
        #{tag}
      </span>
    ))}
    {session.intent_tags?.map(tag => (
      <span key={tag} className="text-sm text-ink/40">
        {tag}
      </span>
    ))}
  </div>
)}
```

Note: Intent tags without `#` prefix, in `text-ink/40` - more subtle than technique tags.

---

## Auto-Tagging Existing Content

Create a script to analyze text and suggest intent tags:

```typescript
// scripts/autoTagContent.ts

const INTENT_KEYWORDS: Record<string, string[]> = {
  'anxiety': ['anxiety', 'anxious', 'worry', 'panic', 'fear', 'nervous', 'racing'],
  'stress': ['stress', 'tension', 'pressure', 'overwhelm', 'burnout', 'exhaust'],
  'sleep': ['sleep', 'insomnia', 'rest', 'bedtime', 'tired', 'night', 'evening'],
  'focus': ['focus', 'concentration', 'distract', 'attention', 'wander', 'scattered'],
  'racing-mind': ['thoughts', 'thinking', 'rumination', 'mental chatter', 'busy mind'],
  'self-compassion': ['self', 'compassion', 'kind', 'accept', 'worthy', 'enough'],
  'grief': ['grief', 'loss', 'death', 'letting go', 'mourning', 'sorrow'],
  'low-mood': ['depress', 'sad', 'dark', 'heavy', 'hopeless', 'despair'],
  'anger': ['anger', 'angry', 'frustrat', 'irritat', 'rage'],
  'pain': ['pain', 'chronic', 'discomfort', 'ache', 'body'],
};

function suggestIntentTags(text: string): string[] {
  const textLower = text.toLowerCase();
  const tags: string[] = [];

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(kw => textLower.includes(kw))) {
      tags.push(intent);
    }
  }

  return tags;
}

// For sessions: analyze title + tagline + guidanceNotes + intention
// For pearls: analyze text field
```

---

## Content Gaps to Address

Based on competitor demand, create or tag more content for:

| Intent | Current | Target | Priority |
|--------|---------|--------|----------|
| `anxiety` | 2 | 8-10 | HIGH |
| `focus` | 1 | 5-8 | HIGH |
| `stress` | 1 | 5-8 | HIGH |
| `sleep` | 7 | 12-15 | MEDIUM |
| `grief` | 0 | 3-5 | MEDIUM |
| `low-mood` | 0 | 3-5 | MEDIUM |

Many existing sessions likely address these - they just need tagging.

---

## Wellbeing Tracker Connection

You already track wellbeing dimensions in Settings. Connect this:

1. When user tracks "anxiety", surface anxiety-tagged content in Explore
2. After a session tagged `anxiety`, prompt wellbeing check-in
3. Over time: "Your anxiety score: 7→4 over 30 days of practice"

---

## Implementation Steps

1. **Add `intent_tags` field** to sessions.json and pearls.json schemas
2. **Run auto-tagger** to suggest tags for existing content
3. **Manual review** - verify/adjust auto-suggested tags
4. **Update Explore.tsx** - add intent filter row
5. **Update SessionDetailModal** - display intent tags
6. **Update search/filter logic** - filter by intent_tags array

---

## Design Principles Maintained

- No emojis or decorative elements
- Understated color palette (moss, ink/40)
- Simple text labels
- Consistent with existing filter UI patterns
- Lowercase, without `#` prefix for intent tags (distinguishes from technique tags)
