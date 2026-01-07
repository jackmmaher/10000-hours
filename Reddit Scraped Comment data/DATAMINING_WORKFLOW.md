# Reddit Data Mining Workflow

## Objective

Extract from r/Meditation scraped data:
- **250-500 Session Templates** - Guided meditation sessions
- **250-500 Pearls of Wisdom** - Short insights (max 280 chars)
- **30-50 Courses** - Grouped session sequences

## Source Files

- `meditation_comments.csv` - 12,503 comments
- `meditation_posts.csv` - 101 posts

## Output Files (to create in this folder)

- `extracted-sessions.json` - Session templates
- `extracted-pearls.json` - Pearls of wisdom
- `extracted-courses.json` - Course groupings
- `extraction-report.md` - Summary of what was extracted

---

## Session Template Schema

Each session must have ALL these fields:

```json
{
  "id": "uuid-string",
  "title": "Morning River",
  "tagline": "Let the first light find you still",
  "hero_gradient": "from-emerald-400 to-teal-600",
  "duration_guidance": "15-20 mins",
  "discipline": "Breath Awareness",
  "posture": "Seated",
  "best_time": "Morning",
  "environment": "Quiet indoor space",
  "guidance_notes": "2-4 paragraphs of warm instruction...",
  "intention": "Cultivating calm",
  "recommended_after_hours": 0,
  "tags": ["#calm", "#morning", "#beginners"],
  "seed_karma": 45,
  "seed_saves": 123,
  "seed_completions": 567,
  "creator_hours": 127,
  "course_id": null,
  "course_position": null,
  "source_reddit_id": "abc123"
}
```

### Field Guidelines

**title**: Evocative, 3-6 words. Examples:
- "Dawn Breath Awakening"
- "Letting Go of the Day"
- "The Still Point Within"

**tagline**: One sentence hook, poetic. Examples:
- "Start your morning by greeting the breath"
- "Release what you've carried today"

**hero_gradient**: Tailwind gradient classes. Match to intention:
- Calm: emerald, teal, sky
- Focus: indigo, violet, blue
- Energy: amber, orange, yellow
- Compassion: rose, pink, fuchsia
- Grounding: stone, slate, zinc

**discipline**: One of:
- Breath Awareness
- Vipassana
- Loving-Kindness
- Body Scan
- Zen/Zazen
- Mantra
- Open Awareness
- Walking Meditation

**posture**: One of:
- Seated (cushion)
- Seated (chair)
- Lotus
- Half-lotus
- Lying down
- Walking
- Standing

**best_time**: One of:
- Morning
- Midday
- Evening
- Before sleep
- Anytime

**recommended_after_hours**: Difficulty level
- 0 = Complete beginner
- 10 = Has established habit
- 50 = Intermediate
- 100 = Experienced
- 500 = Advanced

**guidance_notes**: 2-4 paragraphs. Warm, inviting tone. Should include:
- Brief context/intention setting
- Step-by-step guidance
- What to do when mind wanders
- How to close the session

**seed_karma/saves/completions**: Use Reddit engagement as guide:
- High-score comments (100+) → higher seed values
- Scale: karma 20-200, saves 50-500, completions 200-2000

**creator_hours**: Randomize between 50-500

---

## Pearl Schema

```json
{
  "id": "uuid-string",
  "text": "The breath doesn't need your help. It's been doing this longer than you've been watching.",
  "seed_karma": 42,
  "seed_saves": 18,
  "creator_hours": 127,
  "source_reddit_id": "xyz789"
}
```

### Pearl Guidelines

- **Max 280 characters** (like a tweet)
- Must be wisdom/insight, not questions or complaints
- Should feel profound, quotable
- Avoid first-person ("I found...") - prefer universal ("The breath...")
- Preserve the community's authentic voice
- Light editing for clarity only

**Good pearl sources:**
- High-score comments with wisdom
- Post titles that are insightful
- Comments that got awards

**Bad pearl sources:**
- Questions
- Complaints
- Personal stories (unless distillable to wisdom)
- Anything requiring context

---

## Course Schema

```json
{
  "id": "uuid-string",
  "title": "5-Day Breath Fundamentals",
  "description": "A gentle introduction to breath-based meditation, building from simple awareness to deeper concentration.",
  "session_count": 5,
  "difficulty": "beginner",
  "seed_karma": 89,
  "seed_saves": 234,
  "session_ids": ["session-1-id", "session-2-id", ...]
}
```

### Course Guidelines

Create courses by grouping related sessions:
- Beginner journeys (5-7 sessions)
- Discipline deep-dives (3-5 sessions)
- Themed weeks (7 sessions)
- Challenge courses (3-5 sessions)

Example course themes:
- "Breath Basics" (beginner, 5 sessions)
- "Loving-Kindness Journey" (intermediate, 7 sessions)
- "Morning Ritual Week" (all levels, 7 sessions)
- "Stress Release Series" (beginner, 5 sessions)
- "Vipassana Foundations" (intermediate, 5 sessions)

---

## Extraction Process

### Step 1: Load and Analyze Data
1. Parse CSV files
2. Sort comments by score (highest first)
3. Identify posts with high engagement

### Step 2: Extract Pearls (easier, do first)
1. Filter comments with score > 20
2. Select comments that read as wisdom/insight
3. Trim to 280 chars or less
4. Aim for 250-500 pearls
5. Ensure variety across topics

### Step 3: Extract Session Templates
1. Look for comments/posts describing meditation techniques
2. Look for "try this" or "my practice is" language
3. Expand incomplete descriptions with research
4. Create evocative titles and taglines
5. Fill all 20 schema fields
6. Aim for 250-500 sessions
7. Balance across:
   - Difficulty levels (40% beginner, 40% intermediate, 20% advanced)
   - Disciplines (good mix)
   - Times of day (good mix)
   - Intentions (calm, focus, compassion, energy, grounding)

### Step 4: Create Courses
1. Group related sessions thematically
2. Order sessions from simple → complex
3. Write course descriptions
4. Create 30-50 courses
5. Ensure courses span difficulty levels

### Step 5: Link Pearls to Sessions
1. Match pearls thematically to sessions
2. Each session can have 2-5 linked pearls
3. These become "What practitioners say" social proof

---

## Quality Checklist

Before finalizing:

- [ ] All session fields populated
- [ ] Guidance notes are warm, not clinical
- [ ] Titles are evocative, not generic
- [ ] Difficulty distribution is balanced
- [ ] Discipline distribution is varied
- [ ] Pearls are under 280 chars
- [ ] Pearls feel wise, not preachy
- [ ] Courses have logical progression
- [ ] No Reddit usernames or references
- [ ] Tone matches meditation community voice

---

## Validation

After extraction, validate JSON:

```bash
# Check JSON validity
node -e "JSON.parse(require('fs').readFileSync('extracted-sessions.json'))"
node -e "JSON.parse(require('fs').readFileSync('extracted-pearls.json'))"
node -e "JSON.parse(require('fs').readFileSync('extracted-courses.json'))"
```

---

## Notes

- This content will be presented as "from the 10,000 Hours community"
- No attribution to Reddit
- The goal is to make the app feel alive with 10 real users
- Quality over quantity - better to have 300 excellent sessions than 500 mediocre ones
