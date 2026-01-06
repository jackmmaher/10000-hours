# Stage 1: Insights + Pearls Community

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add voice-to-text insight capture and a community wisdom-sharing feature (Pearls) to the meditation timer. No AI chat.

**Architecture:** Local-first PWA with Supabase backend for auth and community features. Voice-to-text via Web Speech API (free) or Whisper API (premium). Pearls stored in Supabase with anonymous sharing.

**Tech Stack:** React 18 + TypeScript, Vite, Tailwind CSS, Zustand, Dexie (IndexedDB), Supabase (Postgres + Auth), OpenAI Whisper API (premium only).

---

## Phases Overview

| Phase | Description | Estimated Time |
|-------|-------------|----------------|
| 0 | Foundation & Cleanup | 3-4 hours |
| 1 | Insight Capture | 4-5 hours |
| 2 | Pearls Community | 6-8 hours |
| 3 | Polish & Deploy | 3-4 hours |

**Total: ~16-21 hours**

---

## Phase 0: Foundation & Cleanup

**Goal:** Remove loss-aversion paywall logic, set up Supabase, simplify premium model.

### Task 0.1: Create Feature Branch

```bash
git checkout -b feature/stage1-insights-pearls
git commit --allow-empty -m "chore: start Stage 1 - insights and pearls"
```

---

### Task 0.2: Install Dependencies

```bash
npm install @supabase/supabase-js uuid
npm install -D @types/uuid
```

Verify:
```bash
npm run build
```

Commit:
```bash
git add package.json package-lock.json
git commit -m "chore: add supabase and uuid dependencies"
```

---

### Task 0.3: Create Supabase Client

**Create `.env.local`** (don't commit):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

**Create `src/lib/supabase.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => supabase !== null;
```

Commit:
```bash
git add src/lib/supabase.ts .gitignore
git commit -m "feat: add supabase client configuration"
```

---

### Task 0.4: Update Dexie Schema for Insights

**Modify `src/lib/db.ts`** - Add insights table (version 3):

```typescript
// Add interface
export interface Insight {
  id: string;
  sessionId: string | null;
  rawText: string;
  formattedText: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

// Add to schema version 3
this.version(3).stores({
  sessions: '++id, uuid, startTime, endTime, durationSeconds',
  appState: 'id',
  profile: 'id',
  settings: 'id',
  insights: 'id, sessionId, createdAt',
});

// Add CRUD functions
export async function addInsight(data: {
  sessionId?: string | null;
  rawText: string;
  formattedText?: string | null;
}): Promise<Insight> { /* ... */ }

export async function getInsights(): Promise<Insight[]> { /* ... */ }
export async function getInsightById(id: string): Promise<Insight | undefined> { /* ... */ }
export async function updateInsight(id: string, updates: Partial<Insight>): Promise<void> { /* ... */ }
export async function deleteInsight(id: string): Promise<void> { /* ... */ }
```

**Create `src/lib/__tests__/db.insights.test.ts`** with tests for CRUD operations.

Run tests:
```bash
npm run test:run
```

Commit:
```bash
git add src/lib/db.ts src/lib/__tests__/db.insights.test.ts
git commit -m "feat: add insights table to local database"
```

---

### Task 0.5: Simplify Tier Logic

**Replace loss-aversion model with value-add model.**

New tier logic (`src/lib/tierLogic.ts`):
- FREE: Full history, basic stats, Web Speech transcription, read pearls, vote/save
- PREMIUM: Whisper transcription, AI formatting, share pearls, impact stats, cloud sync

Remove:
- `shouldTriggerPaywall()` (Day 31 logic)
- `getCalendarFadeOpacity()` (fading history)
- `getCalendarVisibility()` (restricted access)

Update tests accordingly.

Commit:
```bash
git add src/lib/tierLogic.ts src/lib/__tests__/tierLogic.test.ts
git commit -m "refactor: simplify tier logic to value-add model"
```

---

### Task 0.6: Simplify Premium Store

**Update `src/stores/usePremiumStore.ts`:**

Remove trial logic, Day 31 tracking. Keep only:
- `tier: 'free' | 'premium'`
- `isPremium` computed
- `setTier()` action

Commit:
```bash
git add src/stores/usePremiumStore.ts
git commit -m "refactor: simplify premium store"
```

---

### Task 0.7: Add Navigation for New Views

**Update `src/stores/useSessionStore.ts`:**
```typescript
type View = 'timer' | 'insights' | 'pearls' | 'stats' | 'calendar' | 'settings';
```

Update App.tsx to handle new views with placeholder components.

Commit:
```bash
git add src/stores/useSessionStore.ts src/App.tsx
git commit -m "feat: add navigation for insights and pearls views"
```

---

### Task 0.8: Phase 0 Checkpoint

```bash
npm run test:run  # All tests pass
npm run build     # Build succeeds
npm run dev       # Manual smoke test
```

Commit and tag:
```bash
git add -A
git commit -m "chore: complete Phase 0 - foundation"
git tag stage1-phase0
```

---

## Phase 1: Insight Capture

**Goal:** Voice recording → text → saved insight. No AI chat.

### Task 1.1: Create Voice Recording Hook

**Create `src/hooks/useVoiceRecording.ts`:**

```typescript
import { useState, useCallback, useRef } from 'react';

type RecordingStatus = 'idle' | 'recording' | 'stopped' | 'error';

export function useVoiceRecording() {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const startRecording = useCallback(async () => {
    // Request mic permission
    // Create MediaRecorder
    // Start recording
    // Update duration every second
  }, []);

  const stopRecording = useCallback(() => {
    // Stop MediaRecorder
    // Create blob from chunks
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setAudioBlob(null);
    setDuration(0);
  }, []);

  return { status, audioBlob, error, duration, startRecording, stopRecording, reset };
}
```

Commit:
```bash
git add src/hooks/useVoiceRecording.ts
git commit -m "feat: add voice recording hook"
```

---

### Task 1.2: Create Web Speech Transcription

**Create `src/lib/transcription.ts`:**

```typescript
export function isWebSpeechSupported(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function createSpeechRecognizer(options: {
  onResult: (text: string, isFinal: boolean) => void;
  onEnd: () => void;
  onError: (error: string) => void;
}) {
  // Create SpeechRecognition instance
  // Set up event handlers
  // Return { start, stop, abort }
}
```

Commit:
```bash
git add src/lib/transcription.ts
git commit -m "feat: add Web Speech API transcription"
```

---

### Task 1.3: Create Premium Transcription (Whisper)

**Create `src/lib/whisper.ts`:**

```typescript
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function transcribeWithWhisper(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: formData,
  });

  const data = await response.json();
  return data.text;
}

export async function formatInsightText(rawText: string): Promise<string> {
  // Use GPT-4o-mini to add punctuation and paragraphs
  // Return formatted text
}
```

Commit:
```bash
git add src/lib/whisper.ts
git commit -m "feat: add Whisper API transcription for premium"
```

---

### Task 1.4: Create Insight Capture Component

**Create `src/components/InsightCapture.tsx`:**

```typescript
interface InsightCaptureProps {
  sessionId?: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function InsightCapture({ sessionId, onComplete, onSkip }: InsightCaptureProps) {
  // States: idle → recording → transcribing → editing → saved

  // Idle: Show "Capture an Insight?" with record button
  // Recording: Show pulsing indicator, duration, live transcription
  // Editing: Show text area with transcribed text, Save/Discard buttons

  // On save: addInsight() to local DB
  // Premium users: use Whisper + formatting
  // Free users: use Web Speech API
}
```

Commit:
```bash
git add src/components/InsightCapture.tsx
git commit -m "feat: add insight capture component"
```

---

### Task 1.5: Integrate into Timer Flow

**Modify `src/components/Timer.tsx`:**

After session complete phase, show InsightCapture prompt (only for sessions ≥5 minutes).

```typescript
// In Timer.tsx
const showInsightCapture =
  phase === 'complete' &&
  elapsedSeconds >= 300 && // 5 minutes minimum
  !insightCaptured;

{showInsightCapture && (
  <InsightCapture
    sessionId={currentSessionId}
    onComplete={() => setInsightCaptured(true)}
    onSkip={() => setInsightCaptured(true)}
  />
)}
```

Commit:
```bash
git add src/components/Timer.tsx
git commit -m "feat: integrate insight capture into post-meditation flow"
```

---

### Task 1.6: Create Insights List View

**Create `src/components/InsightsList.tsx`:**

```typescript
export function InsightsList() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  // Load insights on mount
  // Display as cards with date and preview
  // Tap to view full insight
  // Edit/delete functionality
  // "Share as Pearl" button (premium only)
}
```

Commit:
```bash
git add src/components/InsightsList.tsx
git commit -m "feat: add insights list view"
```

---

### Task 1.7: Phase 1 Checkpoint

```bash
npm run test:run
npm run build
npm run dev  # Test full flow: meditate 5+ min → record insight → view in list
```

Commit and tag:
```bash
git add -A
git commit -m "chore: complete Phase 1 - insight capture"
git tag stage1-phase1
```

---

## Phase 2: Pearls Community

**Goal:** Share insight snippets, vote, discover community wisdom.

### Task 2.1: Set Up Supabase Schema

Run in Supabase SQL editor:

```sql
-- Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamptz default now(),
  tier text default 'free',
  total_karma int default 0,
  total_saves int default 0
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Pearls
create table public.pearls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  upvotes int default 0,
  saves int default 0,
  created_at timestamptz default now()
);

alter table public.pearls enable row level security;

create policy "Anyone can view pearls" on public.pearls
  for select using (true);

create policy "Authenticated users can create pearls" on public.pearls
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own pearls" on public.pearls
  for delete using (auth.uid() = user_id);

-- Votes
create table public.pearl_votes (
  pearl_id uuid references public.pearls(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (pearl_id, user_id)
);

alter table public.pearl_votes enable row level security;

create policy "Users can manage own votes" on public.pearl_votes
  for all using (auth.uid() = user_id);

-- Saves
create table public.pearl_saves (
  pearl_id uuid references public.pearls(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (pearl_id, user_id)
);

alter table public.pearl_saves enable row level security;

create policy "Users can manage own saves" on public.pearl_saves
  for all using (auth.uid() = user_id);

-- Triggers to update counts
create or replace function increment_pearl_upvotes()
returns trigger as $$
begin
  update public.pearls set upvotes = upvotes + 1 where id = NEW.pearl_id;
  update public.profiles set total_karma = total_karma + 1
    where id = (select user_id from public.pearls where id = NEW.pearl_id);
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_vote_added
  after insert on public.pearl_votes
  for each row execute function increment_pearl_upvotes();

create or replace function decrement_pearl_upvotes()
returns trigger as $$
begin
  update public.pearls set upvotes = upvotes - 1 where id = OLD.pearl_id;
  update public.profiles set total_karma = total_karma - 1
    where id = (select user_id from public.pearls where id = OLD.pearl_id);
  return OLD;
end;
$$ language plpgsql security definer;

create trigger on_vote_removed
  after delete on public.pearl_votes
  for each row execute function decrement_pearl_upvotes();
```

Commit schema file:
```bash
git add supabase/schema.sql
git commit -m "feat: add Supabase schema for pearls community"
```

---

### Task 2.2: Create Auth Store

**Create `src/stores/useAuthStore.ts`:**

```typescript
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  initialize: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Implementation
}));
```

Commit:
```bash
git add src/stores/useAuthStore.ts
git commit -m "feat: add auth store with Apple/Google sign-in"
```

---

### Task 2.3: Create Auth Modal

**Create `src/components/AuthModal.tsx`:**

Simple modal with Apple and Google sign-in buttons.

Commit:
```bash
git add src/components/AuthModal.tsx
git commit -m "feat: add auth modal component"
```

---

### Task 2.4: Create Pearls Service

**Create `src/lib/pearls.ts`:**

```typescript
export interface Pearl {
  id: string;
  userId: string;
  text: string;
  upvotes: number;
  saves: number;
  createdAt: string;
  hasVoted?: boolean;
  hasSaved?: boolean;
}

export async function createPearl(text: string): Promise<Pearl> { /* ... */ }
export async function getPearls(filter: 'rising' | 'new' | 'top'): Promise<Pearl[]> { /* ... */ }
export async function votePearl(pearlId: string): Promise<void> { /* ... */ }
export async function unvotePearl(pearlId: string): Promise<void> { /* ... */ }
export async function savePearl(pearlId: string): Promise<void> { /* ... */ }
export async function unsavePearl(pearlId: string): Promise<void> { /* ... */ }
export async function getUserStats(): Promise<{ karma: number; saves: number }> { /* ... */ }
```

Commit:
```bash
git add src/lib/pearls.ts
git commit -m "feat: add pearls API service"
```

---

### Task 2.5: Create Pearls Feed

**Create `src/components/PearlsFeed.tsx`:**

```typescript
export function PearlsFeed() {
  // Filter tabs: Rising | New | Top (with time filter)
  // List of pearl cards
  // Each card: quote text, upvote button, save button, timestamp
  // Tap upvote/save → requires auth
  // Pull to refresh
}
```

Commit:
```bash
git add src/components/PearlsFeed.tsx
git commit -m "feat: add pearls feed component"
```

---

### Task 2.6: Create Share Pearl Flow

**Create `src/components/CreatePearl.tsx`:**

```typescript
interface CreatePearlProps {
  insightText: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePearl({ insightText, onClose, onSuccess }: CreatePearlProps) {
  // Allow text selection from insight
  // Preview selected text as pearl
  // Require auth + premium to share
  // Submit to Supabase
}
```

Add "Share as Pearl" button to InsightsList.

Commit:
```bash
git add src/components/CreatePearl.tsx src/components/InsightsList.tsx
git commit -m "feat: add pearl creation flow"
```

---

### Task 2.7: Add Saved Pearls View

**Create `src/components/SavedPearls.tsx`:**

Show user's saved pearls (requires auth).

Commit:
```bash
git add src/components/SavedPearls.tsx
git commit -m "feat: add saved pearls view"
```

---

### Task 2.8: Phase 2 Checkpoint

```bash
npm run test:run
npm run build
npm run dev
```

Manual test:
1. Create Supabase project
2. Run schema SQL
3. Configure `.env.local`
4. Sign in with Google/Apple
5. Create insight → share as pearl
6. View in feed → vote → save
7. Check karma stats

Commit and tag:
```bash
git add -A
git commit -m "chore: complete Phase 2 - pearls community"
git tag stage1-phase2
```

---

## Phase 3: Polish & Deploy

**Goal:** Production-ready PWA.

### Task 3.1: Update Navigation UI

Add bottom nav bar with icons:
- Timer (home)
- Insights
- Pearls
- Stats
- Settings

Commit:
```bash
git add src/components/Navigation.tsx src/App.tsx
git commit -m "feat: add bottom navigation bar"
```

---

### Task 3.2: Update Settings

Add to Settings:
- Account section (sign in/out)
- Premium status
- Sync status (if premium)

Commit:
```bash
git add src/components/Settings.tsx
git commit -m "feat: update settings with account section"
```

---

### Task 3.3: Error Handling

- Wrap API calls in try/catch
- Show user-friendly error messages
- Offline detection and messaging

Commit:
```bash
git add -A
git commit -m "feat: add error handling and offline support"
```

---

### Task 3.4: Performance Audit

```bash
npm run build
npm run preview
# Open Chrome DevTools → Lighthouse
```

Address any issues:
- Bundle size
- First contentful paint
- Accessibility

Commit:
```bash
git add -A
git commit -m "perf: address Lighthouse audit findings"
```

---

### Task 3.5: PWA Update

Update `vite.config.ts` PWA manifest:
- New screenshots
- Updated description
- Correct icons

Commit:
```bash
git add vite.config.ts
git commit -m "chore: update PWA manifest"
```

---

### Task 3.6: Final Testing

On actual phone:
1. Install PWA
2. Full meditation → insight flow
3. Share pearl
4. Browse feed
5. Offline behavior

---

### Task 3.7: Phase 3 Checkpoint

```bash
npm run test:run
npm run build
```

Commit and tag:
```bash
git add -A
git commit -m "chore: complete Phase 3 - polish and deploy"
git tag stage1-complete
```

---

## Merge to Main

```bash
git checkout main
git merge feature/stage1-insights-pearls
git tag v2.0.0
git push origin main --tags
```

---

## Summary

**Stage 1 delivers:**
- ✓ Voice-to-text insight capture
- ✓ Local insight storage
- ✓ Pearls community (share, vote, save, discover)
- ✓ Premium tier with Whisper transcription
- ✓ No AI chat (intentionally excluded)

**Stage 2 (future):**
- Claude integration for insight exploration
- "Living wall" home feed
- Personalized recommendations
- Cross-conversation memory

---

*Plan created: 2026-01-06*
