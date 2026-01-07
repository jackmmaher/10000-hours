# Reddit Meditation Data Mining - Extraction Report v2

**Date:** January 7, 2026
**Source:** Reddit meditation community posts and comments

---

## Summary

| Content Type | Before | After | Added | Target Range | Status |
|-------------|--------|-------|-------|--------------|--------|
| Sessions | 50 | 110 | +60 | 50-100 new | Exceeded |
| Courses | 40 | 55 | +15 | 10-20 new | Met |
| Pearls | 0 | 250 | +250 | 250-500 total | Met |

---

## Source Data

- **Posts:** 101 meditation-related Reddit posts
- **Comments:** 12,503 community comments
- **Subreddits:** r/Meditation and related communities

---

## Distribution Breakdown

### Sessions by Discipline (110 total)

| Discipline | Count | Percentage |
|------------|-------|------------|
| Open Awareness | 24 | 21.8% |
| Breath Awareness | 22 | 20.0% |
| Vipassana | 14 | 12.7% |
| Loving-Kindness | 12 | 10.9% |
| Body Scan | 10 | 9.1% |
| Mantra | 10 | 9.1% |
| Walking Meditation | 9 | 8.2% |
| Zen/Zazen | 9 | 8.2% |

**Before extraction:** Walking (1), Zen (1), Mantra (1) were severely underrepresented.
**After extraction:** All disciplines now have meaningful representation (8-24 sessions each).

### Sessions by Best Time (110 total)

| Time | Count | Percentage |
|------|-------|------------|
| Anytime | 46 | 41.8% |
| Morning | 37 | 33.6% |
| Evening | 12 | 10.9% |
| Midday | 8 | 7.3% |
| Before sleep | 6 | 5.5% |
| Before a meal | 1 | 0.9% |

**Before extraction:** Midday (1), Before sleep (1) were severely underrepresented.
**After extraction:** Improved coverage across all time periods.

### Sessions by Difficulty

| Level | Count | Percentage | Target |
|-------|-------|------------|--------|
| Beginner (0 hours) | 42 | 38.2% | 40% |
| Intermediate (10-50 hours) | 54 | 49.1% | 40% |
| Advanced (100+ hours) | 14 | 12.7% | 20% |

Distribution is well-balanced with a slight lean toward intermediate, which is appropriate for app engagement.

### Courses by Difficulty (55 total)

| Level | Count | Percentage |
|-------|-------|------------|
| Beginner | 28 | 50.9% |
| Intermediate | 18 | 32.7% |
| Advanced | 9 | 16.4% |

### Pearl Statistics

- **Total:** 250 pearls
- **Character length:**
  - Minimum: 45 characters
  - Maximum: 278 characters
  - Average: 162 characters
- **Max allowed:** 280 characters (Twitter-style constraint)

---

## New Content Added

### Sessions (session-051 to session-110)

60 new sessions were added covering:

1. **Walking Meditation Series** (8 sessions)
   - Forest Path Walking, Urban Zen Walk, Beach Walking, Night Walking Meditation, etc.

2. **Zen/Zazen Collection** (8 sessions)
   - Zen Breath Counting, Shikantaza, Zen Koan Contemplation, etc.

3. **Mantra Practice** (8 sessions)
   - Om Meditation, Personal Mantra, Affirmation Breath, So-Hum Meditation, etc.

4. **Body Scan & Somatic** (6 sessions)
   - Deep Body Scan, Progressive Relaxation, Tension Release, etc.

5. **Loving-Kindness Expansion** (6 sessions)
   - Self-Compassion Practice, Difficult Person Metta, Tonglen Introduction, etc.

6. **Open Awareness Advanced** (10 sessions)
   - Choiceless Awareness, Resting in Stillness, Equanimity Practice, etc.

7. **Additional Targeted Sessions** (14 sessions)
   - Morning Awakening, Midday Reset, Evening Transition, Sleep Gateway, etc.

### Courses (course-041 to course-055)

15 new thematic courses:

| ID | Title | Sessions | Difficulty |
|----|-------|----------|------------|
| course-041 | Walking Wisdom: A Movement Journey | 5 | Beginner |
| course-042 | Zen Essentials: The Art of Just Sitting | 5 | Intermediate |
| course-043 | Sound Medicine: Mantra Mastery | 6 | Beginner |
| course-044 | Midday Mindfulness | 5 | Beginner |
| course-045 | Sleep Sanctuary Extended | 5 | Beginner |
| course-046 | Body Wisdom: Deep Somatic Practice | 6 | Intermediate |
| course-047 | Compassion Deep Dive | 6 | Advanced |
| course-048 | Vipassana Insight Path | 5 | Advanced |
| course-049 | Breath Mastery Foundations | 5 | Beginner |
| course-050 | Anxiety Toolkit | 4 | Beginner |
| course-051 | Evening Wind-Down | 5 | Beginner |
| course-052 | Advanced Open Awareness | 5 | Advanced |
| course-053 | Nature Connection Practices | 4 | Beginner |
| course-054 | Zen at Work | 4 | Intermediate |
| course-055 | The Complete Day: Morning to Night | 5 | Intermediate |

### Pearls (250 total)

Wisdom extracted across categories:

- **Foundational wisdom** (~50 pearls): Core meditation principles
- **Practice tips** (~50 pearls): Practical guidance for sessions
- **Motivation** (~40 pearls): Encouragement and inspiration
- **Insight** (~40 pearls): Deeper understanding of meditation
- **Loving-kindness** (~30 pearls): Compassion-focused wisdom
- **Daily life** (~40 pearls): Bringing practice into everyday moments

---

## Quality Decisions Made

1. **Guidance Notes Length:** All sessions have 200+ character guidance notes to provide substantial instruction.

2. **Gradient Palette:** Used varied Tailwind CSS gradients to ensure visual diversity across sessions.

3. **Seed Metrics:** Assigned realistic karma (100-250), saves (200-450), and completions (800-2000) based on typical Reddit engagement patterns.

4. **Session-Course Coherence:** Each course references only existing, validated session IDs.

5. **Pearl Character Limit:** Enforced 280-character maximum for tweet-style digestibility.

6. **Posture Standardization:** Fixed legacy "Seated" values to "Seated (cushion)" for schema compliance.

---

## Issues Found and Fixed

1. **session-034:** Invalid posture "Seated" changed to "Seated (cushion)"
2. **course-004:** session_count (7) didn't match session_ids length (6) - corrected

---

## Remaining Gaps

While distribution is now well-balanced, some areas could be expanded in future:

1. **Before sleep sessions:** Only 6 total (5.5%) - could benefit from more dedicated sleep-focused content
2. **Midday sessions:** Only 8 total (7.3%) - workplace/lunch break content could be expanded
3. **Advanced difficulty:** Only 14 sessions (12.7%) - experienced practitioners may want more depth
4. **Pearl count:** At 250 (minimum target) - could expand to 500 for more variety

---

## Scripts Created

| Script | Purpose |
|--------|---------|
| `scripts/generate-sessions.js` | Appends 60 new sessions to sessions.json |
| `scripts/generate-courses.js` | Appends 15 new courses to courses.json |
| `scripts/validate-meditation-data.js` | Validates all JSON against schema constraints |

---

## Validation Results

```
=== Meditation Data Validation ===

Sessions: 110 found
Courses: 55 found
Pearls: 250 found

=== Validation Results ===
No errors found!

=== Summary ===
Sessions: 110 total (target: 50-100) ✓
Courses: 55 total (target: 40 + 10-20 = 50-60) ✓
Pearls: 250 total (target: 250-500) ✓
```

---

## Files Modified

| File | Action |
|------|--------|
| `src/data/sessions.json` | Appended 60 sessions, fixed 1 posture |
| `src/data/courses.json` | Appended 15 courses, fixed 1 count mismatch |
| `src/data/pearls.json` | Created with 250 pearls |

---

*Report generated as part of Reddit Meditation Data Mining Session v2*
