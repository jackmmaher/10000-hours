# Unified Data Architecture Plan

## Problem Statement

The app has two parallel systems that don't communicate:
- **Seeded content** in JSON files with static fake stats
- **Community content** in Supabase with live tracked stats

This causes:
1. KPIs (karma, saves, completions) don't sync between card and modal views
2. Modal KPIs are not interactive
3. Seeded content interactions are never tracked
4. "Social proof" numbers are lies that never change

## Solution

Migrate all seeded content into Supabase. One unified system. UUIDs everywhere.

## Architecture

### Core Principle
Every piece of content and every interaction is a row in a table. No exceptions.

### Content Tables
- `session_templates` - All meditations (seeded + user-created)
- `courses` - All courses (seeded + user-created)
- `pearls` - User wisdom (already working)

### Interaction Tables
- `session_template_votes` - Karma tracking
- `session_template_saves` - Bookmark tracking
- `session_template_completions` - Practice tracking
- `course_votes`, `course_saves` - Course interactions
- `pearl_votes`, `pearl_saves` - Pearl interactions

### Rules
1. `user_id = NULL` means system/seeded content (immutable)
2. `user_id = UUID` means user content (owner can edit/delete)
3. All IDs are UUIDs (deterministic for seeded content)
4. Denormalized counts updated by triggers

---

## Tasks

### Task 1: Generate Migration Script for Sessions
**Goal:** Create script to migrate sessions.json into session_templates table

**Steps:**
1. Read current sessions.json to understand all fields
2. Create migration script at `scripts/migrate-seeded-sessions.ts`
3. Use uuid v5 to generate deterministic UUIDs from seed IDs
4. Map all JSON fields to Supabase columns
5. Set karma/saves/completions from seed values
6. Set user_id = NULL for all seeded content

**Verification:** Script compiles without errors

---

### Task 2: Generate Migration Script for Courses
**Goal:** Create script to migrate courses.json into courses table

**Steps:**
1. Read current courses.json to understand all fields
2. Create migration script at `scripts/migrate-seeded-courses.ts`
3. Use same UUID generation approach
4. Map fields and set initial stats from seed values
5. Update session template course_id references to use new UUIDs

**Verification:** Script compiles without errors

---

### Task 3: Run Migrations Against Supabase
**Goal:** Execute migration scripts to populate tables

**Steps:**
1. Run sessions migration script
2. Run courses migration script
3. Verify data in Supabase dashboard
4. Confirm row counts match JSON file counts

**Verification:**
- Query session_templates shows seeded rows with user_id = NULL
- Query courses shows seeded rows
- karma/saves/completions values match seed values

---

### Task 4: Update JSON Files with New UUIDs
**Goal:** Replace string IDs with generated UUIDs for offline reference

**Steps:**
1. Update sessions.json with UUID IDs
2. Update courses.json with UUID IDs
3. Update course_id references in sessions to use new UUIDs
4. Remove seed_karma, seed_saves, seed_completions fields (now in DB)

**Verification:** JSON files parse correctly, IDs are valid UUIDs

---

### Task 5: Remove isUUID Checks in Code
**Goal:** Remove all conditional logic that bypasses tracking for non-UUID IDs

**Steps:**
1. Find all usages of `isUUID()` in codebase
2. In `templates.ts`: Remove checks in `recordTemplateCompletion`
3. In `templates.ts`: Remove checks in `getTemplateStats`
4. In components: Remove any isUUID conditionals
5. Delete or deprecate the `isUUID()` function

**Verification:**
- Grep for isUUID shows no remaining usages in active code paths
- TypeScript compiles without errors

---

### Task 6: Update Explore.tsx to Fetch All Templates from Supabase
**Goal:** Remove JSON import, fetch templates from Supabase

**Steps:**
1. Remove `import SEEDED_SESSIONS from '../data/sessions.json'`
2. Update `getPublishedTemplates()` to fetch all templates (seeded + user)
3. Remove any code that merges seeded + community templates
4. Ensure filtering by intent_tags still works

**Verification:**
- Explore tab loads and shows meditations
- All seeded sessions appear with their karma/saves/completions

---

### Task 7: Fix SessionCard State Management
**Goal:** Enable state sync between exterior card and modal

**Steps:**
1. In Explore.tsx: Lift interaction state (voted, saved) to parent
2. Create callback props: `onVote`, `onSave` for SessionCard
3. Pass interaction state and callbacks to SessionCard
4. When user votes/saves on card, update parent state
5. Pass same state to SessionDetailModal when opened

**Verification:**
- Vote on card, open modal, see vote reflected
- Save on card, open modal, see save reflected

---

### Task 8: Make Modal KPIs Interactive
**Goal:** Replace static stat display with interactive buttons

**Steps:**
1. In SessionDetailModal.tsx: Replace static karma span with vote button
2. Add vote handler that calls `voteTemplate()` / `unvoteTemplate()`
3. Update local state and call parent callback on vote
4. Ensure save button updates the displayed save count
5. Completions remain display-only (can't manually complete)

**Verification:**
- Click karma in modal, count increments, button shows voted state
- Click save in modal, count increments, button shows saved state
- Close modal, card reflects the changes

---

### Task 9: Add Template Vote/Unvote Functions
**Goal:** Implement voting API if not already present

**Steps:**
1. Check if `voteTemplate()` exists in templates.ts
2. If not, create it following pearl_votes pattern
3. Create `unvoteTemplate()` for removing votes
4. Ensure proper error handling and idempotency

**Verification:**
- Function exists and compiles
- Calling voteTemplate twice doesn't create duplicate rows

---

### Task 10: End-to-End Testing
**Goal:** Verify complete flow works

**Steps:**
1. Open Explore tab
2. Find a seeded meditation
3. Vote on it from the card
4. Open the modal, verify vote is reflected
5. Unvote from modal, verify card updates
6. Save from modal, verify card updates
7. Plan and complete meditation, verify completions increment

**Verification:**
- All interactions persist across page refresh
- Counts update in real-time
- No console errors

---

## Success Criteria

1. All seeded content in Supabase with live stats
2. Card and modal states synchronized
3. Modal KPIs are interactive (karma, saves)
4. All interactions tracked for all content types
5. No `isUUID()` checks in codebase
6. TypeScript compiles without errors
7. App functions correctly in browser
