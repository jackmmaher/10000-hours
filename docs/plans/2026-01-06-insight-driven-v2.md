# Insight-Driven Meditation Tracker v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the 10,000 Hours app from a loss-aversion timer into an insight-driven meditation companion with voice capture, AI exploration, and community wisdom sharing.

**Architecture:** Local-first PWA with Supabase backend for auth, sync, and community features. Voice-to-text via Web Speech API (free tier) or Whisper API (premium). AI insight exploration via Claude/OpenAI. Pearls community with anonymous sharing and voting.

**Tech Stack:** React 18 + TypeScript, Vite, Tailwind CSS, Zustand, Dexie (IndexedDB), Supabase (Postgres + Auth + Edge Functions), OpenAI Whisper API, Claude/GPT API, Web Speech API.

---

## Table of Contents

1. [Phase 0: Foundation & Cleanup](#phase-0-foundation--cleanup)
2. [Phase 1: Insight Capture](#phase-1-insight-capture)
3. [Phase 2: AI Enhancement](#phase-2-ai-enhancement)
4. [Phase 3: Pearls Community](#phase-3-pearls-community)
5. [Phase 4: Premium Stats & Sync](#phase-4-premium-stats--sync)
6. [Phase 5: Paywall & Monetization](#phase-5-paywall--monetization)
7. [Phase 6: Polish & PWA](#phase-6-polish--pwa)
8. [Database Schema](#database-schema)
9. [API Routes](#api-routes)
10. [Edge Cases & Error Handling](#edge-cases--error-handling)
11. [Testing Strategy](#testing-strategy)

---

## Pre-Implementation Checklist

Before starting, ensure:
- [ ] Node.js 18+ installed
- [ ] Supabase account created (free tier)
- [ ] OpenAI API key available (for Whisper + GPT)
- [ ] Anthropic API key available (for Claude - optional)
- [ ] Current tests pass: `npm run test:run`
- [ ] Current build succeeds: `npm run build`

---

## Phase 0: Foundation & Cleanup

**Goal:** Remove loss-aversion logic, set up Supabase, prepare for new features.

**Estimated Time:** 4-6 hours

### Task 0.1: Create Feature Branch

**Files:**
- None (git operation)

**Step 1: Create and checkout feature branch**

```bash
git checkout -b feature/insight-driven-v2
```

**Step 2: Verify clean working directory**

```bash
git status
```

Expected: Clean working tree or only untracked files.

**Step 3: Commit checkpoint**

```bash
git commit --allow-empty -m "chore: start insight-driven v2 implementation"
```

---

### Task 0.2: Install New Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Supabase client**

```bash
npm install @supabase/supabase-js
```

**Step 2: Install UUID generator**

```bash
npm install uuid
npm install -D @types/uuid
```

**Step 3: Verify installation**

```bash
npm run build
```

Expected: Build succeeds with no errors.

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add supabase and uuid dependencies"
```

---

### Task 0.3: Create Supabase Configuration

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `.env.local` (do not commit)
- Modify: `vite.config.ts`

**Step 1: Create environment file (local only)**

Create `.env.local` in project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

**Step 2: Add .env.local to .gitignore**

Verify `.gitignore` contains:
```
.env.local
.env*.local
```

**Step 3: Create Supabase client**

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Cloud features disabled.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};
```

**Step 4: Create placeholder database types**

Create `src/lib/database.types.ts`:

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          tier: 'free' | 'premium';
          premium_expires_at: string | null;
          total_karma: number;
          total_saves: number;
        };
        Insert: {
          id: string;
          tier?: 'free' | 'premium';
        };
        Update: {
          tier?: 'free' | 'premium';
          premium_expires_at?: string | null;
          total_karma?: number;
          total_saves?: number;
        };
      };
      insights: {
        Row: {
          id: string;
          user_id: string;
          session_id: string | null;
          raw_text: string;
          formatted_text: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id?: string | null;
          raw_text: string;
          formatted_text?: string | null;
        };
        Update: {
          raw_text?: string;
          formatted_text?: string | null;
          updated_at?: string;
        };
      };
      pearls: {
        Row: {
          id: string;
          user_id: string;
          insight_id: string;
          text: string;
          upvotes: number;
          saves: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          insight_id: string;
          text: string;
        };
        Update: {
          upvotes?: number;
          saves?: number;
        };
      };
      pearl_votes: {
        Row: {
          pearl_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          pearl_id: string;
          user_id: string;
        };
        Update: never;
      };
      pearl_saves: {
        Row: {
          pearl_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          pearl_id: string;
          user_id: string;
        };
        Update: never;
      };
    };
  };
}
```

**Step 5: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

**Step 6: Commit**

```bash
git add src/lib/supabase.ts src/lib/database.types.ts .gitignore
git commit -m "feat: add supabase client configuration"
```

---

### Task 0.4: Update Dexie Schema for Insights

**Files:**
- Modify: `src/lib/db.ts`
- Create: `src/lib/__tests__/db.insights.test.ts`

**Step 1: Write failing test for insights table**

Create `src/lib/__tests__/db.insights.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { db, addInsight, getInsights, updateInsight, deleteInsight } from '../db';

describe('Insights Database Operations', () => {
  beforeEach(async () => {
    await db.insights.clear();
  });

  it('should add an insight', async () => {
    const insight = await addInsight({
      sessionId: 'session-123',
      rawText: 'I noticed my breath was shallow.',
      formattedText: 'I noticed my breath was shallow.',
    });

    expect(insight.id).toBeDefined();
    expect(insight.rawText).toBe('I noticed my breath was shallow.');
  });

  it('should get all insights sorted by date descending', async () => {
    await addInsight({ rawText: 'First insight' });
    await addInsight({ rawText: 'Second insight' });

    const insights = await getInsights();

    expect(insights).toHaveLength(2);
    expect(insights[0].rawText).toBe('Second insight');
  });

  it('should update an insight', async () => {
    const insight = await addInsight({ rawText: 'Original text' });

    await updateInsight(insight.id, { formattedText: 'Formatted text' });

    const updated = await db.insights.get(insight.id);
    expect(updated?.formattedText).toBe('Formatted text');
  });

  it('should delete an insight', async () => {
    const insight = await addInsight({ rawText: 'To be deleted' });

    await deleteInsight(insight.id);

    const deleted = await db.insights.get(insight.id);
    expect(deleted).toBeUndefined();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm run test:run -- src/lib/__tests__/db.insights.test.ts
```

Expected: FAIL - `addInsight` is not defined.

**Step 3: Update db.ts with insights table and functions**

Modify `src/lib/db.ts`, add to schema (increment version to 3):

```typescript
import Dexie, { type EntityTable } from 'dexie';
import { v4 as uuidv4 } from 'uuid';

// Add to existing interfaces
export interface Insight {
  id: string;
  sessionId: string | null;
  rawText: string;
  formattedText: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

// Update db class - add insights table
class MeditationDB extends Dexie {
  sessions!: EntityTable<Session, 'id'>;
  appState!: EntityTable<AppState, 'id'>;
  profile!: EntityTable<Profile, 'id'>;
  settings!: EntityTable<Settings, 'id'>;
  insights!: EntityTable<Insight, 'id'>;

  constructor() {
    super('meditation-tracker');

    this.version(3).stores({
      sessions: '++id, uuid, startTime, endTime, durationSeconds',
      appState: 'id',
      profile: 'id',
      settings: 'id',
      insights: 'id, sessionId, createdAt',
    });
  }
}

export const db = new MeditationDB();

// Add insight functions
export async function addInsight(data: {
  sessionId?: string | null;
  rawText: string;
  formattedText?: string | null;
}): Promise<Insight> {
  const insight: Insight = {
    id: uuidv4(),
    sessionId: data.sessionId ?? null,
    rawText: data.rawText,
    formattedText: data.formattedText ?? null,
    createdAt: new Date(),
    updatedAt: null,
  };

  await db.insights.add(insight);
  return insight;
}

export async function getInsights(): Promise<Insight[]> {
  return db.insights.orderBy('createdAt').reverse().toArray();
}

export async function getInsightById(id: string): Promise<Insight | undefined> {
  return db.insights.get(id);
}

export async function updateInsight(
  id: string,
  updates: Partial<Pick<Insight, 'rawText' | 'formattedText'>>
): Promise<void> {
  await db.insights.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
}

export async function deleteInsight(id: string): Promise<void> {
  await db.insights.delete(id);
}

export async function getInsightsBySessionId(sessionId: string): Promise<Insight[]> {
  return db.insights.where('sessionId').equals(sessionId).toArray();
}
```

**Step 4: Run tests to verify they pass**

```bash
npm run test:run -- src/lib/__tests__/db.insights.test.ts
```

Expected: All 4 tests PASS.

**Step 5: Run all existing tests to verify no regressions**

```bash
npm run test:run
```

Expected: All tests pass (38 + 4 = 42 tests).

**Step 6: Commit**

```bash
git add src/lib/db.ts src/lib/__tests__/db.insights.test.ts
git commit -m "feat: add insights table to local database"
```

---

### Task 0.5: Remove Loss-Aversion Logic

**Files:**
- Modify: `src/lib/tierLogic.ts`
- Modify: `src/lib/__tests__/tierLogic.test.ts`
- Modify: `src/components/Calendar.tsx`
- Modify: `src/components/Stats.tsx`

**Step 1: Update tierLogic.ts to remove restrictions**

The new model: FREE gets full history, calendar, basic stats. Premium adds AI features, sharing, advanced stats.

Modify `src/lib/tierLogic.ts`:

```typescript
// NEW: Free tier gets full access to basic features
// Premium adds: AI transcription, AI chat, pearl sharing, advanced stats, cloud sync

import { TIME_WINDOWS, MILESTONES } from './constants';

// REMOVED: shouldTriggerPaywall (no more Day 31 wall)
// REMOVED: getCalendarFadeOpacity (no more fading)
// REMOVED: getCalendarVisibility (no more restrictions)
// REMOVED: isSessionVisible (all sessions visible)

export function isInTrialOrPremium(tier: string): boolean {
  return tier === 'premium';
}

export function isPremium(tier: string): boolean {
  return tier === 'premium';
}

// Stats windows: FREE gets week/month/total, PREMIUM gets year/all-time/trends
export function getAvailableStatWindows(tier: string): typeof TIME_WINDOWS {
  const freeWindows = TIME_WINDOWS.filter(w =>
    w.value <= 30 || w.label === 'Total'
  );

  if (isPremium(tier)) {
    return TIME_WINDOWS;
  }

  return freeWindows;
}

// Premium features check
export function canUseFeature(tier: string, feature:
  | 'ai_transcription'
  | 'ai_formatting'
  | 'ai_chat'
  | 'insight_search'
  | 'share_pearls'
  | 'impact_stats'
  | 'cloud_sync'
  | 'advanced_stats'
  | 'hide_time_display'
): boolean {
  if (tier === 'premium') return true;

  // Free tier features
  const freeFeatures = [
    // Basic transcription via Web Speech API is free
    // Basic stats are free
    // Reading pearls is free
    // Upvoting is free (to grow community)
  ];

  return false; // All listed features are premium
}

// Achievement visibility: All visible for everyone now
export function getAchievementVisibility(tier: string): {
  showDates: boolean;
  opacity: number;
  blur: boolean;
} {
  return {
    showDates: true,
    opacity: 1,
    blur: false,
  };
}

// Keep milestone logic
export function getLastAchievedMilestone(totalHours: number): number | null {
  const achieved = MILESTONES.filter(m => totalHours >= m);
  return achieved.length > 0 ? achieved[achieved.length - 1] : null;
}

export function getNextMilestone(totalHours: number): number | null {
  return MILESTONES.find(m => m > totalHours) ?? null;
}

export function getMilestoneProgress(totalHours: number): number {
  const current = getLastAchievedMilestone(totalHours) ?? 0;
  const next = getNextMilestone(totalHours);

  if (!next) return 100;

  return ((totalHours - current) / (next - current)) * 100;
}
```

**Step 2: Update tests to match new logic**

Modify `src/lib/__tests__/tierLogic.test.ts` - replace with new tests:

```typescript
import { describe, it, expect } from 'vitest';
import {
  isPremium,
  canUseFeature,
  getAvailableStatWindows,
  getAchievementVisibility,
  getLastAchievedMilestone,
  getNextMilestone,
  getMilestoneProgress,
} from '../tierLogic';

describe('Tier Logic v2', () => {
  describe('isPremium', () => {
    it('returns true for premium tier', () => {
      expect(isPremium('premium')).toBe(true);
    });

    it('returns false for free tier', () => {
      expect(isPremium('free')).toBe(false);
    });
  });

  describe('canUseFeature', () => {
    it('premium users can use all features', () => {
      expect(canUseFeature('premium', 'ai_transcription')).toBe(true);
      expect(canUseFeature('premium', 'ai_chat')).toBe(true);
      expect(canUseFeature('premium', 'share_pearls')).toBe(true);
      expect(canUseFeature('premium', 'cloud_sync')).toBe(true);
    });

    it('free users cannot use premium features', () => {
      expect(canUseFeature('free', 'ai_transcription')).toBe(false);
      expect(canUseFeature('free', 'ai_chat')).toBe(false);
      expect(canUseFeature('free', 'share_pearls')).toBe(false);
      expect(canUseFeature('free', 'cloud_sync')).toBe(false);
    });
  });

  describe('getAvailableStatWindows', () => {
    it('free tier gets week, month, and total', () => {
      const windows = getAvailableStatWindows('free');
      const labels = windows.map(w => w.label);

      expect(labels).toContain('7 Days');
      expect(labels).toContain('30 Days');
      expect(labels).toContain('Total');
      expect(labels).not.toContain('Year');
      expect(labels).not.toContain('90 Days');
    });

    it('premium tier gets all windows', () => {
      const windows = getAvailableStatWindows('premium');
      const labels = windows.map(w => w.label);

      expect(labels).toContain('7 Days');
      expect(labels).toContain('30 Days');
      expect(labels).toContain('90 Days');
      expect(labels).toContain('Year');
      expect(labels).toContain('All Time');
    });
  });

  describe('getAchievementVisibility', () => {
    it('all users see full achievements', () => {
      const free = getAchievementVisibility('free');
      const premium = getAchievementVisibility('premium');

      expect(free.showDates).toBe(true);
      expect(free.opacity).toBe(1);
      expect(free.blur).toBe(false);

      expect(premium.showDates).toBe(true);
      expect(premium.opacity).toBe(1);
      expect(premium.blur).toBe(false);
    });
  });

  describe('Milestone calculations', () => {
    it('getLastAchievedMilestone returns correct milestone', () => {
      expect(getLastAchievedMilestone(0)).toBeNull();
      expect(getLastAchievedMilestone(2)).toBe(2);
      expect(getLastAchievedMilestone(7)).toBe(5);
      expect(getLastAchievedMilestone(100)).toBe(100);
      expect(getLastAchievedMilestone(10000)).toBe(10000);
    });

    it('getNextMilestone returns correct next target', () => {
      expect(getNextMilestone(0)).toBe(2);
      expect(getNextMilestone(2)).toBe(5);
      expect(getNextMilestone(99)).toBe(100);
      expect(getNextMilestone(10000)).toBeNull();
    });

    it('getMilestoneProgress calculates correctly', () => {
      expect(getMilestoneProgress(0)).toBeCloseTo(0);
      expect(getMilestoneProgress(1)).toBeCloseTo(50); // 1/2 to first milestone
      expect(getMilestoneProgress(10000)).toBe(100);
    });
  });
});
```

**Step 3: Run tests**

```bash
npm run test:run -- src/lib/__tests__/tierLogic.test.ts
```

Expected: All tests PASS.

**Step 4: Update Calendar.tsx to remove fade logic**

Modify `src/components/Calendar.tsx`:

Remove all references to:
- `getCalendarFadeOpacity`
- `getCalendarVisibility`
- Opacity styling based on tier
- "Faded" messaging

The calendar should now show all sessions at full opacity for everyone.

**Step 5: Update Stats.tsx to use new tier logic**

Modify `src/components/Stats.tsx`:

Update to use `getAvailableStatWindows(tier)` with the new signature (no trialExpired param).

**Step 6: Run build to verify no type errors**

```bash
npm run build
```

Expected: Build succeeds.

**Step 7: Commit**

```bash
git add -A
git commit -m "refactor: remove loss-aversion logic, implement value-add premium model"
```

---

### Task 0.6: Update Premium Store

**Files:**
- Modify: `src/stores/usePremiumStore.ts`

**Step 1: Simplify premium store**

The store no longer needs trial logic, Day 31 tracking, etc.

```typescript
import { create } from 'zustand';
import { getProfile, updateProfile } from '../lib/db';

interface PremiumState {
  tier: 'free' | 'premium';
  premiumExpiryDate: Date | null;
  isHydrated: boolean;

  // Computed
  isPremium: boolean;

  // Actions
  hydrate: () => Promise<void>;
  setTier: (tier: 'free' | 'premium') => Promise<void>;
  setPremiumExpiry: (date: Date) => Promise<void>;
}

export const usePremiumStore = create<PremiumState>((set, get) => ({
  tier: 'free',
  premiumExpiryDate: null,
  isHydrated: false,

  isPremium: false,

  hydrate: async () => {
    const profile = await getProfile();

    const tier = profile?.tier ?? 'free';
    const premiumExpiryDate = profile?.premiumExpiryDate
      ? new Date(profile.premiumExpiryDate)
      : null;

    // Check if premium has expired
    const isPremium = tier === 'premium' &&
      (!premiumExpiryDate || premiumExpiryDate > new Date());

    set({
      tier: isPremium ? 'premium' : 'free',
      premiumExpiryDate,
      isPremium,
      isHydrated: true,
    });
  },

  setTier: async (tier) => {
    await updateProfile({ tier });
    set({ tier, isPremium: tier === 'premium' });
  },

  setPremiumExpiry: async (date) => {
    await updateProfile({ premiumExpiryDate: date.toISOString() });
    set({ premiumExpiryDate: date });
  },
}));
```

**Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds (may need to update components using old store properties).

**Step 3: Commit**

```bash
git add src/stores/usePremiumStore.ts
git commit -m "refactor: simplify premium store for value-add model"
```

---

### Task 0.7: Add Navigation for New Screens

**Files:**
- Modify: `src/stores/useSessionStore.ts`
- Modify: `src/App.tsx`

**Step 1: Add new view types**

Modify `src/stores/useSessionStore.ts`:

```typescript
// Update view type
type View = 'timer' | 'insights' | 'pearls' | 'stats' | 'calendar' | 'settings';
```

**Step 2: Update App.tsx navigation**

Add placeholder components for new views and update the view switching logic.

**Step 3: Run dev server and verify navigation works**

```bash
npm run dev
```

Navigate between views manually.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add navigation structure for insights and pearls views"
```

---

### Task 0.8: Phase 0 Checkpoint

**Step 1: Run all tests**

```bash
npm run test:run
```

Expected: All tests pass.

**Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds.

**Step 3: Manual smoke test**

```bash
npm run dev
```

Verify:
- [ ] Timer works
- [ ] Stats display (basic windows for free)
- [ ] Calendar shows all history (no fade)
- [ ] Settings accessible
- [ ] No console errors

**Step 4: Update BUILD_LOG.md**

Add Phase 0 completion entry.

**Step 5: Commit and tag**

```bash
git add -A
git commit -m "chore: complete Phase 0 - foundation and cleanup"
git tag v2.0.0-phase0
```

---

## Phase 1: Insight Capture

**Goal:** Voice recording → text transcription → saved insights (local-first).

**Estimated Time:** 6-8 hours

### Task 1.1: Create Voice Recording Hook

**Files:**
- Create: `src/hooks/useVoiceRecording.ts`
- Create: `src/hooks/__tests__/useVoiceRecording.test.ts`

**Step 1: Write the hook test**

Create `src/hooks/__tests__/useVoiceRecording.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceRecording } from '../useVoiceRecording';

// Mock MediaRecorder
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: null as ((e: { data: Blob }) => void) | null,
  onstop: null as (() => void) | null,
  state: 'inactive',
};

const mockMediaStream = {
  getTracks: () => [{ stop: vi.fn() }],
};

beforeEach(() => {
  vi.clearAllMocks();

  // Mock navigator.mediaDevices
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: vi.fn().mockResolvedValue(mockMediaStream),
    },
    writable: true,
  });

  // Mock MediaRecorder constructor
  global.MediaRecorder = vi.fn().mockImplementation(() => mockMediaRecorder) as any;
});

describe('useVoiceRecording', () => {
  it('should start in idle state', () => {
    const { result } = renderHook(() => useVoiceRecording());

    expect(result.current.status).toBe('idle');
    expect(result.current.audioBlob).toBeNull();
  });

  it('should request microphone permission on start', async () => {
    const { result } = renderHook(() => useVoiceRecording());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: true,
    });
  });

  it('should update status to recording after start', async () => {
    const { result } = renderHook(() => useVoiceRecording());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.status).toBe('recording');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm run test:run -- src/hooks/__tests__/useVoiceRecording.test.ts
```

Expected: FAIL - module not found.

**Step 3: Implement the hook**

Create `src/hooks/useVoiceRecording.ts`:

```typescript
import { useState, useCallback, useRef } from 'react';

type RecordingStatus = 'idle' | 'recording' | 'stopped' | 'error';

interface UseVoiceRecordingResult {
  status: RecordingStatus;
  audioBlob: Blob | null;
  error: string | null;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  reset: () => void;
}

export function useVoiceRecording(): UseVoiceRecordingResult {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setAudioBlob(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setStatus('stopped');

        // Stop all tracks
        streamRef.current?.getTracks().forEach(track => track.stop());

        // Clear duration interval
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      startTimeRef.current = Date.now();
      setStatus('recording');

      // Update duration every second
      durationIntervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setStatus('error');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setAudioBlob(null);
    setError(null);
    setDuration(0);
    chunksRef.current = [];
  }, []);

  return {
    status,
    audioBlob,
    error,
    duration,
    startRecording,
    stopRecording,
    reset,
  };
}
```

**Step 4: Run tests**

```bash
npm run test:run -- src/hooks/__tests__/useVoiceRecording.test.ts
```

Expected: All tests PASS.

**Step 5: Commit**

```bash
git add src/hooks/useVoiceRecording.ts src/hooks/__tests__/useVoiceRecording.test.ts
git commit -m "feat: add voice recording hook with MediaRecorder API"
```

---

### Task 1.2: Create Web Speech API Transcription

**Files:**
- Create: `src/lib/transcription.ts`
- Create: `src/lib/__tests__/transcription.test.ts`

**Step 1: Write failing test**

Create `src/lib/__tests__/transcription.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { transcribeWithWebSpeech, isWebSpeechSupported } from '../transcription';

describe('Transcription', () => {
  describe('isWebSpeechSupported', () => {
    it('returns true when SpeechRecognition is available', () => {
      // Mock window.SpeechRecognition
      (window as any).SpeechRecognition = vi.fn();

      expect(isWebSpeechSupported()).toBe(true);
    });

    it('returns true when webkitSpeechRecognition is available', () => {
      delete (window as any).SpeechRecognition;
      (window as any).webkitSpeechRecognition = vi.fn();

      expect(isWebSpeechSupported()).toBe(true);
    });

    it('returns false when neither is available', () => {
      delete (window as any).SpeechRecognition;
      delete (window as any).webkitSpeechRecognition;

      expect(isWebSpeechSupported()).toBe(false);
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm run test:run -- src/lib/__tests__/transcription.test.ts
```

Expected: FAIL - module not found.

**Step 3: Implement transcription module**

Create `src/lib/transcription.ts`:

```typescript
export function isWebSpeechSupported(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function getSpeechRecognition(): typeof SpeechRecognition | null {
  if ('SpeechRecognition' in window) {
    return (window as any).SpeechRecognition;
  }
  if ('webkitSpeechRecognition' in window) {
    return (window as any).webkitSpeechRecognition;
  }
  return null;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

export function createSpeechRecognizer(options?: {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onResult?: (result: TranscriptionResult) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}): {
  start: () => void;
  stop: () => void;
  abort: () => void;
} | null {
  const SpeechRecognitionClass = getSpeechRecognition();

  if (!SpeechRecognitionClass) {
    return null;
  }

  const recognition = new SpeechRecognitionClass();

  recognition.continuous = options?.continuous ?? true;
  recognition.interimResults = options?.interimResults ?? true;
  recognition.lang = options?.language ?? 'en-US';

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const result = event.results[event.results.length - 1];
    const transcript = result[0];

    options?.onResult?.({
      text: transcript.transcript,
      confidence: transcript.confidence,
      isFinal: result.isFinal,
    });
  };

  recognition.onend = () => {
    options?.onEnd?.();
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    options?.onError?.(event.error);
  };

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    abort: () => recognition.abort(),
  };
}

// Real-time transcription hook helper
export function transcribeWithWebSpeech(): Promise<string> {
  return new Promise((resolve, reject) => {
    const recognizer = createSpeechRecognizer({
      continuous: false,
      interimResults: false,
      onResult: (result) => {
        if (result.isFinal) {
          resolve(result.text);
        }
      },
      onError: (error) => {
        reject(new Error(error));
      },
      onEnd: () => {
        // If ended without result, resolve empty
        resolve('');
      },
    });

    if (!recognizer) {
      reject(new Error('Speech recognition not supported'));
      return;
    }

    recognizer.start();

    // Auto-stop after 60 seconds
    setTimeout(() => {
      recognizer.stop();
    }, 60000);
  });
}
```

**Step 4: Run tests**

```bash
npm run test:run -- src/lib/__tests__/transcription.test.ts
```

Expected: All tests PASS.

**Step 5: Commit**

```bash
git add src/lib/transcription.ts src/lib/__tests__/transcription.test.ts
git commit -m "feat: add Web Speech API transcription support"
```

---

### Task 1.3: Create Insight Capture Component

**Files:**
- Create: `src/components/InsightCapture.tsx`

**Step 1: Create the component**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { createSpeechRecognizer, isWebSpeechSupported } from '../lib/transcription';
import { addInsight } from '../lib/db';

interface InsightCaptureProps {
  sessionId?: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function InsightCapture({ sessionId, onComplete, onSkip }: InsightCaptureProps) {
  const [transcribedText, setTranscribedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recognizer, setRecognizer] = useState<ReturnType<typeof createSpeechRecognizer>>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { status, duration, startRecording, stopRecording } = useVoiceRecording();

  // Start transcription when recording starts
  const handleStartCapture = useCallback(async () => {
    if (!isWebSpeechSupported()) {
      // Fallback: just record, transcribe later
      await startRecording();
      return;
    }

    setTranscribedText('');
    setIsTranscribing(true);

    const rec = createSpeechRecognizer({
      continuous: true,
      interimResults: true,
      onResult: (result) => {
        setTranscribedText(prev => {
          if (result.isFinal) {
            return prev + result.text + ' ';
          }
          // For interim results, show them but don't commit
          return prev;
        });
      },
      onEnd: () => {
        setIsTranscribing(false);
      },
      onError: (error) => {
        console.error('Speech recognition error:', error);
        setIsTranscribing(false);
      },
    });

    setRecognizer(rec);
    rec?.start();
  }, [startRecording]);

  const handleStopCapture = useCallback(() => {
    recognizer?.stop();
    stopRecording();
    setIsTranscribing(false);
  }, [recognizer, stopRecording]);

  const handleSave = async () => {
    if (!transcribedText.trim()) return;

    setIsSaving(true);
    try {
      await addInsight({
        sessionId: sessionId ?? null,
        rawText: transcribedText.trim(),
        formattedText: null, // Will be formatted by AI for premium users
      });
      onComplete();
    } catch (error) {
      console.error('Failed to save insight:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      {status === 'idle' && (
        <>
          <h2 className="font-serif text-2xl text-ink mb-4">Capture an Insight?</h2>
          <p className="text-ink-soft text-center mb-8 max-w-xs">
            Speak freely. Your words become text, then the audio is discarded.
          </p>
          <button
            onClick={handleStartCapture}
            className="w-20 h-20 rounded-full bg-moss/20 flex items-center justify-center
                       hover:bg-moss/30 transition-colors active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-moss" />
          </button>
          <p className="text-ink-soft/60 text-sm mt-4">Tap to record</p>
          <button
            onClick={onSkip}
            className="mt-8 text-ink-soft/60 text-sm hover:text-ink-soft transition-colors"
          >
            Skip for now
          </button>
        </>
      )}

      {(status === 'recording' || isTranscribing) && (
        <>
          <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center
                          animate-pulse">
            <div className="w-10 h-10 rounded-full bg-red-500" />
          </div>
          <p className="text-ink mt-4 font-mono">{formatDuration(duration)}</p>
          <p className="text-ink-soft text-sm mt-2">Recording...</p>

          {transcribedText && (
            <div className="mt-6 max-w-sm text-center">
              <p className="text-ink-soft/80 text-sm italic">"{transcribedText}"</p>
            </div>
          )}

          <button
            onClick={handleStopCapture}
            className="mt-8 px-6 py-3 bg-ink text-cream rounded-lg
                       hover:bg-ink/90 transition-colors active:scale-95"
          >
            Done
          </button>
        </>
      )}

      {status === 'stopped' && transcribedText && (
        <>
          <h2 className="font-serif text-xl text-ink mb-4">Your Insight</h2>
          <textarea
            value={transcribedText}
            onChange={(e) => setTranscribedText(e.target.value)}
            className="w-full max-w-sm h-40 p-4 bg-cream-warm rounded-lg border border-cream-deep
                       text-ink resize-none focus:outline-none focus:ring-2 focus:ring-moss/30"
            placeholder="Edit your insight..."
          />
          <div className="flex gap-3 mt-6">
            <button
              onClick={onSkip}
              className="px-4 py-2 text-ink-soft hover:text-ink transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !transcribedText.trim()}
              className="px-6 py-2 bg-moss text-cream rounded-lg
                         hover:bg-moss/90 transition-colors active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

**Step 2: Run build to verify**

```bash
npm run build
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/InsightCapture.tsx
git commit -m "feat: add insight capture component with voice-to-text"
```

---

### Task 1.4: Integrate Insight Capture into Timer Flow

**Files:**
- Modify: `src/components/Timer.tsx`
- Modify: `src/stores/useSessionStore.ts`

**Step 1: Add session completion phase for insight capture**

Update the timer to show InsightCapture prompt after session completion.

**Step 2: Test the flow manually**

```bash
npm run dev
```

1. Start a meditation session
2. Complete the session
3. Verify InsightCapture prompt appears
4. Record an insight
5. Verify it saves to IndexedDB

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: integrate insight capture into post-meditation flow"
```

---

### Task 1.5: Create Insights List Screen

**Files:**
- Create: `src/components/InsightsList.tsx`

**Step 1: Create the component**

```typescript
import { useState, useEffect } from 'react';
import { getInsights, deleteInsight, type Insight } from '../lib/db';
import { formatFullDate } from '../lib/format';

export function InsightsList() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const data = await getInsights();
      setInsights(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this insight?')) return;

    await deleteInsight(id);
    await loadInsights();
    setSelectedInsight(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-ink-soft">Loading insights...</p>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-6">
        <p className="text-ink-soft text-center">
          No insights yet. Complete a meditation session and capture your thoughts.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <h1 className="font-serif text-2xl text-ink px-6 pt-6 pb-4">Your Insights</h1>

      <div className="space-y-3 px-4">
        {insights.map((insight) => (
          <button
            key={insight.id}
            onClick={() => setSelectedInsight(insight)}
            className="w-full text-left p-4 bg-cream-warm rounded-xl
                       hover:bg-cream-deep transition-colors"
          >
            <p className="text-ink line-clamp-2">
              {insight.formattedText || insight.rawText}
            </p>
            <p className="text-ink-soft/60 text-xs mt-2">
              {formatFullDate(insight.createdAt)}
            </p>
          </button>
        ))}
      </div>

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center p-4 z-50">
          <div className="bg-cream rounded-2xl max-w-md w-full max-h-[80vh] overflow-auto p-6">
            <p className="text-ink whitespace-pre-wrap">
              {selectedInsight.formattedText || selectedInsight.rawText}
            </p>
            <p className="text-ink-soft/60 text-xs mt-4">
              {formatFullDate(selectedInsight.createdAt)}
            </p>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => handleDelete(selectedInsight.id)}
                className="text-red-500 text-sm hover:text-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedInsight(null)}
                className="px-4 py-2 bg-ink text-cream rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Wire up to navigation**

**Step 3: Test**

```bash
npm run dev
```

Navigate to Insights view and verify list displays correctly.

**Step 4: Commit**

```bash
git add src/components/InsightsList.tsx
git commit -m "feat: add insights list screen"
```

---

### Task 1.6: Phase 1 Checkpoint

**Step 1: Run all tests**

```bash
npm run test:run
```

Expected: All tests pass.

**Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds.

**Step 3: Manual end-to-end test**

1. Start meditation → complete → capture insight → save
2. Navigate to Insights → verify insight appears
3. Tap insight → view detail → delete
4. Verify deletion

**Step 4: Update BUILD_LOG.md**

**Step 5: Commit and tag**

```bash
git add -A
git commit -m "chore: complete Phase 1 - insight capture"
git tag v2.0.0-phase1
```

---

## Phase 2: AI Enhancement

**Goal:** Premium users get Whisper transcription, AI formatting, and AI insight exploration.

**Estimated Time:** 8-10 hours

### Task 2.1: Create AI Service Module

**Files:**
- Create: `src/lib/ai.ts`
- Create: `src/lib/__tests__/ai.test.ts`

**Step 1: Create AI service**

```typescript
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export interface TranscriptionOptions {
  audioBlob: Blob;
  language?: string;
}

export async function transcribeWithWhisper(options: TranscriptionOptions): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const formData = new FormData();
  formData.append('file', options.audioBlob, 'recording.webm');
  formData.append('model', 'whisper-1');
  if (options.language) {
    formData.append('language', options.language);
  }

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Whisper API error: ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}

export async function formatInsightText(rawText: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a text formatter. Your job is to take raw voice transcription and format it properly:
- Add punctuation (periods, commas, question marks)
- Add paragraph breaks where appropriate
- Fix obvious transcription errors
- Keep the speaker's voice and meaning intact
- Do not add, remove, or change the content
- Do not add commentary or analysis
- Return only the formatted text, nothing else`,
        },
        {
          role: 'user',
          content: rawText,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatAboutInsight(
  insight: string,
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `You are a wise, non-judgmental meditation companion. The user has shared an insight from their meditation practice:

"${insight}"

Your role is to:
- Help them explore and understand their insight
- Draw connections to meditation traditions (Buddhism, Zen, Stoicism, etc.) when relevant
- Ask Socratic questions to deepen understanding
- Suggest practices or techniques they might explore
- Be warm, curious, and supportive
- Keep responses concise (2-3 paragraphs max)
- Never be preachy or prescriptive`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
```

**Step 2: Commit**

```bash
git add src/lib/ai.ts
git commit -m "feat: add AI service for Whisper, formatting, and chat"
```

---

### Task 2.2: Create AI Chat Component

**Files:**
- Create: `src/components/InsightChat.tsx`

**Step 1: Create the chat component**

```typescript
import { useState, useRef, useEffect } from 'react';
import { chatAboutInsight, type ChatMessage } from '../lib/ai';
import { usePremiumStore } from '../stores/usePremiumStore';

interface InsightChatProps {
  insight: string;
  onClose: () => void;
}

export function InsightChat({ insight, onClose }: InsightChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isPremium } = usePremiumStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatAboutInsight(insight, messages, userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedPrompts = [
    "What tradition does this align with?",
    "How can I explore this deeper?",
    "What practice might help?",
  ];

  if (!isPremium) {
    return (
      <div className="fixed inset-0 bg-ink/50 flex items-center justify-center p-4 z-50">
        <div className="bg-cream rounded-2xl max-w-sm w-full p-6 text-center">
          <h3 className="font-serif text-xl text-ink mb-3">Explore with AI</h3>
          <p className="text-ink-soft mb-6">
            Premium members can discuss insights with an AI meditation companion.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-ink text-cream rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-cream flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cream-deep">
        <h3 className="font-serif text-lg text-ink">Explore Insight</h3>
        <button onClick={onClose} className="text-ink-soft hover:text-ink">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Insight Context */}
      <div className="p-4 bg-cream-warm border-b border-cream-deep">
        <p className="text-ink-soft text-sm italic line-clamp-2">"{insight}"</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-ink-soft mb-4">What would you like to explore?</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="px-3 py-1.5 bg-cream-warm rounded-full text-sm text-ink-soft
                             hover:bg-cream-deep transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, i) => (
          <div
            key={i}
            className={`max-w-[85%] ${
              message.role === 'user' ? 'ml-auto' : 'mr-auto'
            }`}
          >
            <div
              className={`p-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-moss text-cream rounded-br-md'
                  : 'bg-cream-warm text-ink rounded-bl-md'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="max-w-[85%] mr-auto">
            <div className="p-3 bg-cream-warm rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-ink-soft/40 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-ink-soft/40 rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 bg-ink-soft/40 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-cream-deep">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your insight..."
            className="flex-1 px-4 py-2 bg-cream-warm rounded-full
                       focus:outline-none focus:ring-2 focus:ring-moss/30"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 bg-moss text-cream rounded-full
                       flex items-center justify-center
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/InsightChat.tsx
git commit -m "feat: add AI chat component for insight exploration"
```

---

### Task 2.3: Integrate AI into Insight Capture

**Files:**
- Modify: `src/components/InsightCapture.tsx`

**Step 1: Add premium transcription and formatting**

Update InsightCapture to:
1. Use Whisper API for premium users
2. Auto-format with AI for premium users
3. Show "Explore with AI" button after saving

**Step 2: Commit**

```bash
git add src/components/InsightCapture.tsx
git commit -m "feat: integrate Whisper and AI formatting for premium insight capture"
```

---

### Task 2.4: Add "Explore" Button to Insights List

**Files:**
- Modify: `src/components/InsightsList.tsx`

**Step 1: Add Explore button to insight detail modal**

```typescript
// Add to insight detail modal
<button
  onClick={() => setShowChat(true)}
  className="px-4 py-2 bg-moss text-cream rounded-lg"
>
  Explore with AI
</button>

{showChat && selectedInsight && (
  <InsightChat
    insight={selectedInsight.formattedText || selectedInsight.rawText}
    onClose={() => setShowChat(false)}
  />
)}
```

**Step 2: Commit**

```bash
git add src/components/InsightsList.tsx
git commit -m "feat: add AI exploration button to insights"
```

---

### Task 2.5: Phase 2 Checkpoint

**Step 1: Run all tests**

```bash
npm run test:run
```

**Step 2: Run build**

```bash
npm run build
```

**Step 3: Manual test with API keys**

1. Set up `.env.local` with OpenAI key
2. Record an insight as premium user
3. Verify Whisper transcription works
4. Verify AI formatting works
5. Test AI chat functionality

**Step 4: Update BUILD_LOG.md**

**Step 5: Commit and tag**

```bash
git add -A
git commit -m "chore: complete Phase 2 - AI enhancement"
git tag v2.0.0-phase2
```

---

## Phase 3: Pearls Community

**Goal:** Create, share, vote, and discover wisdom pearls.

**Estimated Time:** 10-12 hours

### Task 3.1: Create Supabase Auth Integration

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/components/AuthModal.tsx`
- Create: `src/stores/useAuthStore.ts`

**Step 1: Create auth store**

Create `src/stores/useAuthStore.ts`:

```typescript
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  initialize: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    if (!supabase) {
      set({ isLoading: false });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();

    set({
      user: session?.user ?? null,
      session,
      isAuthenticated: !!session,
      isLoading: false,
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? null,
        session,
        isAuthenticated: !!session,
      });
    });
  },

  signInWithApple: async () => {
    if (!supabase) return;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) throw error;
  },

  signInWithGoogle: async () => {
    if (!supabase) return;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) throw error;
  },

  signOut: async () => {
    if (!supabase) return;

    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },
}));
```

**Step 2: Create auth modal component**

Create `src/components/AuthModal.tsx`:

```typescript
import { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

interface AuthModalProps {
  onClose: () => void;
  message?: string;
}

export function AuthModal({ onClose, message }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithApple, signInWithGoogle } = useAuthStore();

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithApple();
    } catch (err) {
      setError('Failed to sign in with Apple');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center p-4 z-50">
      <div className="bg-cream rounded-2xl max-w-sm w-full p-6">
        <h2 className="font-serif text-xl text-ink text-center mb-2">
          Sign in to continue
        </h2>
        <p className="text-ink-soft text-center text-sm mb-6">
          {message || 'Create an account to share your wisdom with the community.'}
        </p>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <div className="space-y-3">
          <button
            onClick={handleAppleSignIn}
            disabled={isLoading}
            className="w-full py-3 bg-ink text-cream rounded-lg flex items-center
                       justify-center gap-2 hover:bg-ink/90 transition-colors
                       disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 bg-cream-warm text-ink rounded-lg flex items-center
                       justify-center gap-2 border border-cream-deep
                       hover:bg-cream-deep transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-ink-soft hover:text-ink transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
```

**Step 3: Run build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Supabase auth integration with Apple and Google sign-in"
```

---

### Task 3.2: Create Pearls API Service

**Files:**
- Create: `src/lib/pearls.ts`
- Create: `src/lib/__tests__/pearls.test.ts`

**Step 1: Write failing tests**

Create `src/lib/__tests__/pearls.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPearl, getPearls, votePearl, savePearl } from '../pearls';

// Mock Supabase
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn() }) }),
      select: vi.fn().mockReturnValue({ order: vi.fn() }),
    })),
  },
}));

describe('Pearls Service', () => {
  it('createPearl requires text', async () => {
    await expect(createPearl({ text: '', insightId: '123' }))
      .rejects.toThrow('Pearl text is required');
  });

  it('createPearl requires minimum length', async () => {
    await expect(createPearl({ text: 'Hi', insightId: '123' }))
      .rejects.toThrow('Pearl must be at least 10 characters');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm run test:run -- src/lib/__tests__/pearls.test.ts
```

**Step 3: Implement pearls service**

Create `src/lib/pearls.ts`:

```typescript
import { supabase } from './supabase';

export interface Pearl {
  id: string;
  userId: string;
  insightId: string;
  text: string;
  upvotes: number;
  saves: number;
  createdAt: string;
  hasVoted?: boolean;
  hasSaved?: boolean;
}

export interface CreatePearlInput {
  text: string;
  insightId: string;
}

export async function createPearl(input: CreatePearlInput): Promise<Pearl> {
  if (!input.text.trim()) {
    throw new Error('Pearl text is required');
  }

  if (input.text.trim().length < 10) {
    throw new Error('Pearl must be at least 10 characters');
  }

  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Must be signed in to create pearls');
  }

  const { data, error } = await supabase
    .from('pearls')
    .insert({
      user_id: user.id,
      insight_id: input.insightId,
      text: input.text.trim(),
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    insightId: data.insight_id,
    text: data.text,
    upvotes: data.upvotes,
    saves: data.saves,
    createdAt: data.created_at,
  };
}

export type PearlsFilter = 'rising' | 'new' | 'top';
export type TimeFilter = 'day' | 'week' | 'month' | 'year' | 'all';

export async function getPearls(options?: {
  filter?: PearlsFilter;
  timeFilter?: TimeFilter;
  limit?: number;
  offset?: number;
}): Promise<Pearl[]> {
  if (!supabase) {
    return [];
  }

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  let query = supabase.from('pearls').select('*');

  // Apply time filter
  if (options?.timeFilter && options.timeFilter !== 'all') {
    const now = new Date();
    let since: Date;

    switch (options.timeFilter) {
      case 'day':
        since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        since = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    query = query.gte('created_at', since.toISOString());
  }

  // Apply sorting
  switch (options?.filter) {
    case 'new':
      query = query.order('created_at', { ascending: false });
      break;
    case 'top':
      query = query.order('upvotes', { ascending: false });
      break;
    case 'rising':
    default:
      // Rising: recent + high velocity
      query = query.order('created_at', { ascending: false });
      break;
  }

  // Apply pagination
  query = query.range(
    options?.offset ?? 0,
    (options?.offset ?? 0) + (options?.limit ?? 20) - 1
  );

  const { data, error } = await query;

  if (error) throw error;

  // Get user's votes and saves if authenticated
  let userVotes: Set<string> = new Set();
  let userSaves: Set<string> = new Set();

  if (userId && data.length > 0) {
    const pearlIds = data.map(p => p.id);

    const [votesResult, savesResult] = await Promise.all([
      supabase.from('pearl_votes').select('pearl_id').eq('user_id', userId).in('pearl_id', pearlIds),
      supabase.from('pearl_saves').select('pearl_id').eq('user_id', userId).in('pearl_id', pearlIds),
    ]);

    userVotes = new Set(votesResult.data?.map(v => v.pearl_id) ?? []);
    userSaves = new Set(savesResult.data?.map(s => s.pearl_id) ?? []);
  }

  return data.map(p => ({
    id: p.id,
    userId: p.user_id,
    insightId: p.insight_id,
    text: p.text,
    upvotes: p.upvotes,
    saves: p.saves,
    createdAt: p.created_at,
    hasVoted: userVotes.has(p.id),
    hasSaved: userSaves.has(p.id),
  }));
}

export async function votePearl(pearlId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be signed in to vote');

  const { error } = await supabase
    .from('pearl_votes')
    .insert({ pearl_id: pearlId, user_id: user.id });

  if (error) {
    if (error.code === '23505') {
      throw new Error('Already voted');
    }
    throw error;
  }
}

export async function unvotePearl(pearlId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be signed in');

  await supabase
    .from('pearl_votes')
    .delete()
    .eq('pearl_id', pearlId)
    .eq('user_id', user.id);
}

export async function savePearl(pearlId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be signed in to save');

  const { error } = await supabase
    .from('pearl_saves')
    .insert({ pearl_id: pearlId, user_id: user.id });

  if (error) {
    if (error.code === '23505') {
      throw new Error('Already saved');
    }
    throw error;
  }
}

export async function unsavePearl(pearlId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be signed in');

  await supabase
    .from('pearl_saves')
    .delete()
    .eq('pearl_id', pearlId)
    .eq('user_id', user.id);
}

export async function getUserPearls(): Promise<Pearl[]> {
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('pearls')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(p => ({
    id: p.id,
    userId: p.user_id,
    insightId: p.insight_id,
    text: p.text,
    upvotes: p.upvotes,
    saves: p.saves,
    createdAt: p.created_at,
  }));
}

export async function getUserStats(): Promise<{
  pearlsShared: number;
  totalKarma: number;
  totalSaves: number;
}> {
  if (!supabase) return { pearlsShared: 0, totalKarma: 0, totalSaves: 0 };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { pearlsShared: 0, totalKarma: 0, totalSaves: 0 };

  const { data, error } = await supabase
    .from('profiles')
    .select('total_karma, total_saves')
    .eq('id', user.id)
    .single();

  if (error) return { pearlsShared: 0, totalKarma: 0, totalSaves: 0 };

  const { count } = await supabase
    .from('pearls')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return {
    pearlsShared: count ?? 0,
    totalKarma: data.total_karma,
    totalSaves: data.total_saves,
  };
}
```

**Step 4: Run tests**

```bash
npm run test:run -- src/lib/__tests__/pearls.test.ts
```

**Step 5: Commit**

```bash
git add src/lib/pearls.ts src/lib/__tests__/pearls.test.ts
git commit -m "feat: add pearls API service"
```

---

### Task 3.3: Create Pearls Feed Component

**Files:**
- Create: `src/components/PearlsFeed.tsx`

**Step 1: Create the component**

```typescript
import { useState, useEffect } from 'react';
import { getPearls, votePearl, unvotePearl, savePearl, unsavePearl, type Pearl, type PearlsFilter, type TimeFilter } from '../lib/pearls';
import { useAuthStore } from '../stores/useAuthStore';
import { AuthModal } from './AuthModal';
import { formatDistanceToNow } from 'date-fns';

export function PearlsFeed() {
  const [pearls, setPearls] = useState<Pearl[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PearlsFilter>('rising');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [showAuth, setShowAuth] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadPearls();
  }, [filter, timeFilter]);

  const loadPearls = async () => {
    setLoading(true);
    try {
      const data = await getPearls({ filter, timeFilter });
      setPearls(data);
    } catch (error) {
      console.error('Failed to load pearls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pearl: Pearl) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    try {
      if (pearl.hasVoted) {
        await unvotePearl(pearl.id);
        setPearls(prev => prev.map(p =>
          p.id === pearl.id ? { ...p, upvotes: p.upvotes - 1, hasVoted: false } : p
        ));
      } else {
        await votePearl(pearl.id);
        setPearls(prev => prev.map(p =>
          p.id === pearl.id ? { ...p, upvotes: p.upvotes + 1, hasVoted: true } : p
        ));
      }
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const handleSave = async (pearl: Pearl) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    try {
      if (pearl.hasSaved) {
        await unsavePearl(pearl.id);
        setPearls(prev => prev.map(p =>
          p.id === pearl.id ? { ...p, saves: p.saves - 1, hasSaved: false } : p
        ));
      } else {
        await savePearl(pearl.id);
        setPearls(prev => prev.map(p =>
          p.id === pearl.id ? { ...p, saves: p.saves + 1, hasSaved: true } : p
        ));
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="font-serif text-2xl text-ink">Wisdom Pearls</h1>
        <p className="text-ink-soft text-sm mt-1">Insights from the community</p>
      </div>

      {/* Filters */}
      <div className="px-4 pb-4 flex gap-2 overflow-x-auto">
        {(['rising', 'new', 'top'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors
                       ${filter === f
                         ? 'bg-ink text-cream'
                         : 'bg-cream-warm text-ink-soft hover:bg-cream-deep'}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}

        {filter === 'top' && (
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="px-3 py-1.5 rounded-full text-sm bg-cream-warm text-ink-soft
                       border-none focus:outline-none focus:ring-2 focus:ring-moss/30"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        )}
      </div>

      {/* Pearls List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-ink-soft">Loading pearls...</p>
        </div>
      ) : pearls.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 px-6">
          <p className="text-ink-soft text-center">
            No pearls yet. Be the first to share your wisdom.
          </p>
        </div>
      ) : (
        <div className="space-y-3 px-4">
          {pearls.map((pearl) => (
            <div
              key={pearl.id}
              className="p-4 bg-cream-warm rounded-xl"
            >
              <p className="text-ink leading-relaxed">"{pearl.text}"</p>

              <div className="flex items-center justify-between mt-3">
                <span className="text-ink-soft/60 text-xs">
                  {formatDistanceToNow(new Date(pearl.createdAt), { addSuffix: true })}
                </span>

                <div className="flex items-center gap-4">
                  {/* Upvote */}
                  <button
                    onClick={() => handleVote(pearl)}
                    className={`flex items-center gap-1 text-sm transition-colors
                               ${pearl.hasVoted ? 'text-moss' : 'text-ink-soft hover:text-ink'}`}
                  >
                    <svg className="w-4 h-4" fill={pearl.hasVoted ? 'currentColor' : 'none'}
                         stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M5 15l7-7 7 7" />
                    </svg>
                    {pearl.upvotes}
                  </button>

                  {/* Save */}
                  <button
                    onClick={() => handleSave(pearl)}
                    className={`flex items-center gap-1 text-sm transition-colors
                               ${pearl.hasSaved ? 'text-moss' : 'text-ink-soft hover:text-ink'}`}
                  >
                    <svg className="w-4 h-4" fill={pearl.hasSaved ? 'currentColor' : 'none'}
                         stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {pearl.saves}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          message="Sign in to vote and save pearls"
        />
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/PearlsFeed.tsx
git commit -m "feat: add pearls feed component with voting and saving"
```

---

### Task 3.4: Create Pearl Creation Flow

**Files:**
- Create: `src/components/CreatePearl.tsx`
- Modify: `src/components/InsightsList.tsx`

**Step 1: Create the component**

```typescript
import { useState } from 'react';
import { createPearl } from '../lib/pearls';
import { usePremiumStore } from '../stores/usePremiumStore';
import { useAuthStore } from '../stores/useAuthStore';
import { AuthModal } from './AuthModal';

interface CreatePearlProps {
  insightId: string;
  insightText: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePearl({ insightId, insightText, onClose, onSuccess }: CreatePearlProps) {
  const [selectedText, setSelectedText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  const { isPremium } = usePremiumStore();
  const { isAuthenticated } = useAuthStore();

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    if (!isPremium) {
      setError('Premium membership required to share pearls');
      return;
    }

    const textToShare = selectedText || insightText;
    if (textToShare.length < 10) {
      setError('Pearl must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createPearl({ text: textToShare, insightId });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pearl');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center p-4 z-50">
      <div className="bg-cream rounded-2xl max-w-md w-full p-6">
        <h2 className="font-serif text-xl text-ink mb-4">Share a Pearl</h2>

        <p className="text-ink-soft text-sm mb-4">
          {selectedText
            ? 'Selected text will be shared:'
            : 'Select a portion of your insight to share, or share the whole thing:'}
        </p>

        <div
          onMouseUp={handleTextSelection}
          className="p-4 bg-cream-warm rounded-lg mb-4 cursor-text select-text"
        >
          <p className="text-ink whitespace-pre-wrap">{insightText}</p>
        </div>

        {selectedText && (
          <div className="p-3 bg-moss/10 rounded-lg mb-4 border border-moss/30">
            <p className="text-ink text-sm">"{selectedText}"</p>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-ink-soft hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-moss text-cream rounded-lg
                       hover:bg-moss/90 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sharing...' : 'Share Pearl'}
          </button>
        </div>
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          message="Sign in to share your wisdom"
        />
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/CreatePearl.tsx
git commit -m "feat: add pearl creation component with text selection"
```

---

### Task 3.5: Phase 3 Checkpoint

**Step 1: Run all tests**

```bash
npm run test:run
```

**Step 2: Run build**

```bash
npm run build
```

**Step 3: Manual test with Supabase**

1. Set up Supabase project with schema
2. Configure `.env.local`
3. Test sign-in flow
4. Test pearl creation (premium user)
5. Test voting and saving
6. Test feed filtering

**Step 4: Commit and tag**

```bash
git add -A
git commit -m "chore: complete Phase 3 - pearls community"
git tag v2.0.0-phase3
```

---

## Phase 4: Premium Stats & Sync

**Goal:** Advanced analytics, pattern detection, cloud backup.

**Estimated Time:** 6-8 hours

### Task 4.1: Add Advanced Stats Components

**Files:**
- Create: `src/components/AdvancedStats.tsx`
- Modify: `src/components/Stats.tsx`

**Step 1: Create advanced stats with trends**

```typescript
import { useMemo } from 'react';
import { useSessionStore } from '../stores/useSessionStore';
import { usePremiumStore } from '../stores/usePremiumStore';
import { formatTotalHours } from '../lib/format';

export function AdvancedStats() {
  const { sessions, totalSeconds } = useSessionStore();
  const { isPremium } = usePremiumStore();

  const stats = useMemo(() => {
    if (!isPremium || sessions.length === 0) return null;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const last30Days = sessions.filter(s => new Date(s.startTime) >= thirtyDaysAgo);
    const prev30Days = sessions.filter(s => {
      const date = new Date(s.startTime);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });

    const last30Total = last30Days.reduce((sum, s) => sum + s.durationSeconds, 0);
    const prev30Total = prev30Days.reduce((sum, s) => sum + s.durationSeconds, 0);

    const trend = prev30Total > 0
      ? ((last30Total - prev30Total) / prev30Total) * 100
      : last30Total > 0 ? 100 : 0;

    // Average session duration
    const avgDuration = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / sessions.length
      : 0;

    // Longest session
    const longestSession = Math.max(...sessions.map(s => s.durationSeconds), 0);

    // Sessions per week
    const weeksActive = Math.ceil(
      (now.getTime() - new Date(sessions[sessions.length - 1]?.startTime ?? now).getTime())
      / (7 * 24 * 60 * 60 * 1000)
    );
    const sessionsPerWeek = sessions.length / Math.max(weeksActive, 1);

    // Projection to 10,000 hours
    const hoursPerWeek = (last30Total / 30) * 7 / 3600;
    const remainingHours = 10000 - (totalSeconds / 3600);
    const weeksToGoal = hoursPerWeek > 0 ? remainingHours / hoursPerWeek : Infinity;
    const projectedDate = weeksToGoal < Infinity
      ? new Date(now.getTime() + weeksToGoal * 7 * 24 * 60 * 60 * 1000)
      : null;

    return {
      trend,
      avgDuration,
      longestSession,
      sessionsPerWeek,
      projectedDate,
      hoursPerWeek,
    };
  }, [sessions, totalSeconds, isPremium]);

  if (!isPremium) {
    return (
      <div className="p-4 bg-cream-warm rounded-xl text-center">
        <p className="text-ink-soft">
          Upgrade to premium for advanced statistics and trends
        </p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-lg text-ink">Advanced Insights</h3>

      <div className="grid grid-cols-2 gap-3">
        {/* 30-Day Trend */}
        <div className="p-4 bg-cream-warm rounded-xl">
          <p className="text-ink-soft text-xs uppercase tracking-wide">30-Day Trend</p>
          <p className={`text-2xl font-semibold mt-1
                        ${stats.trend > 0 ? 'text-moss' : stats.trend < 0 ? 'text-red-500' : 'text-ink'}`}>
            {stats.trend > 0 ? '+' : ''}{stats.trend.toFixed(0)}%
          </p>
        </div>

        {/* Sessions/Week */}
        <div className="p-4 bg-cream-warm rounded-xl">
          <p className="text-ink-soft text-xs uppercase tracking-wide">Sessions/Week</p>
          <p className="text-2xl font-semibold text-ink mt-1">
            {stats.sessionsPerWeek.toFixed(1)}
          </p>
        </div>

        {/* Avg Duration */}
        <div className="p-4 bg-cream-warm rounded-xl">
          <p className="text-ink-soft text-xs uppercase tracking-wide">Avg Session</p>
          <p className="text-2xl font-semibold text-ink mt-1">
            {Math.round(stats.avgDuration / 60)}m
          </p>
        </div>

        {/* Longest Session */}
        <div className="p-4 bg-cream-warm rounded-xl">
          <p className="text-ink-soft text-xs uppercase tracking-wide">Longest</p>
          <p className="text-2xl font-semibold text-ink mt-1">
            {formatTotalHours(stats.longestSession)}
          </p>
        </div>
      </div>

      {/* Projection */}
      {stats.projectedDate && (
        <div className="p-4 bg-moss/10 rounded-xl border border-moss/20">
          <p className="text-ink-soft text-xs uppercase tracking-wide">
            At {stats.hoursPerWeek.toFixed(1)}h/week
          </p>
          <p className="text-ink mt-1">
            You'll reach 10,000 hours by{' '}
            <span className="font-semibold">
              {stats.projectedDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/AdvancedStats.tsx
git commit -m "feat: add advanced stats with trends and projections"
```

---

### Task 4.2: Add Cloud Sync

**Files:**
- Create: `src/lib/sync.ts`
- Modify: `src/stores/useSessionStore.ts`

**Step 1: Create sync service**

```typescript
import { supabase } from './supabase';
import { db, type Session, type Insight } from './db';

export async function syncToCloud(): Promise<{ synced: number; errors: number }> {
  if (!supabase) {
    return { synced: 0, errors: 0 };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { synced: 0, errors: 0 };
  }

  let synced = 0;
  let errors = 0;

  // Sync sessions
  const localSessions = await db.sessions.toArray();

  for (const session of localSessions) {
    try {
      await supabase.from('sessions').upsert({
        id: session.uuid,
        user_id: user.id,
        started_at: new Date(session.startTime).toISOString(),
        ended_at: session.endTime ? new Date(session.endTime).toISOString() : null,
        duration_seconds: session.durationSeconds,
      });
      synced++;
    } catch (err) {
      errors++;
    }
  }

  // Sync insights
  const localInsights = await db.insights.toArray();

  for (const insight of localInsights) {
    try {
      await supabase.from('insights').upsert({
        id: insight.id,
        user_id: user.id,
        session_id: insight.sessionId,
        raw_text: insight.rawText,
        formatted_text: insight.formattedText,
        created_at: insight.createdAt.toISOString(),
        updated_at: insight.updatedAt?.toISOString(),
      });
      synced++;
    } catch (err) {
      errors++;
    }
  }

  return { synced, errors };
}

export async function syncFromCloud(): Promise<{ imported: number }> {
  if (!supabase) {
    return { imported: 0 };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { imported: 0 };
  }

  let imported = 0;

  // Get cloud sessions
  const { data: cloudSessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id);

  if (cloudSessions) {
    for (const cs of cloudSessions) {
      const exists = await db.sessions.where('uuid').equals(cs.id).first();
      if (!exists) {
        await db.sessions.add({
          uuid: cs.id,
          startTime: new Date(cs.started_at),
          endTime: cs.ended_at ? new Date(cs.ended_at) : undefined,
          durationSeconds: cs.duration_seconds,
        });
        imported++;
      }
    }
  }

  // Get cloud insights
  const { data: cloudInsights } = await supabase
    .from('insights')
    .select('*')
    .eq('user_id', user.id);

  if (cloudInsights) {
    for (const ci of cloudInsights) {
      const exists = await db.insights.get(ci.id);
      if (!exists) {
        await db.insights.add({
          id: ci.id,
          sessionId: ci.session_id,
          rawText: ci.raw_text,
          formattedText: ci.formatted_text,
          createdAt: new Date(ci.created_at),
          updatedAt: ci.updated_at ? new Date(ci.updated_at) : null,
        });
        imported++;
      }
    }
  }

  return { imported };
}
```

**Step 2: Commit**

```bash
git add src/lib/sync.ts
git commit -m "feat: add cloud sync for sessions and insights"
```

---

### Task 4.3: Add Impact Stats for Premium

**Files:**
- Create: `src/components/ImpactStats.tsx`

**Step 1: Create impact stats component**

```typescript
import { useState, useEffect } from 'react';
import { getUserStats, getUserPearls, type Pearl } from '../lib/pearls';
import { usePremiumStore } from '../stores/usePremiumStore';

export function ImpactStats() {
  const [stats, setStats] = useState({ pearlsShared: 0, totalKarma: 0, totalSaves: 0 });
  const [topPearl, setTopPearl] = useState<Pearl | null>(null);
  const [loading, setLoading] = useState(true);
  const { isPremium } = usePremiumStore();

  useEffect(() => {
    if (!isPremium) {
      setLoading(false);
      return;
    }

    loadStats();
  }, [isPremium]);

  const loadStats = async () => {
    try {
      const [userStats, pearls] = await Promise.all([
        getUserStats(),
        getUserPearls(),
      ]);

      setStats(userStats);

      if (pearls.length > 0) {
        const sorted = [...pearls].sort((a, b) => b.upvotes - a.upvotes);
        setTopPearl(sorted[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isPremium) {
    return (
      <div className="p-4 bg-cream-warm rounded-xl text-center">
        <p className="text-ink-soft">
          Upgrade to premium to see your impact on the community
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-cream-warm rounded-xl text-center">
        <p className="text-ink-soft">Loading impact stats...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-lg text-ink">Your Impact</h3>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-cream-warm rounded-xl text-center">
          <p className="text-2xl font-semibold text-ink">{stats.pearlsShared}</p>
          <p className="text-ink-soft text-xs mt-1">Pearls</p>
        </div>

        <div className="p-4 bg-cream-warm rounded-xl text-center">
          <p className="text-2xl font-semibold text-moss">{stats.totalKarma}</p>
          <p className="text-ink-soft text-xs mt-1">Karma</p>
        </div>

        <div className="p-4 bg-cream-warm rounded-xl text-center">
          <p className="text-2xl font-semibold text-ink">{stats.totalSaves}</p>
          <p className="text-ink-soft text-xs mt-1">Saves</p>
        </div>
      </div>

      {topPearl && (
        <div className="p-4 bg-moss/10 rounded-xl border border-moss/20">
          <p className="text-ink-soft text-xs uppercase tracking-wide mb-2">
            Most Loved Pearl
          </p>
          <p className="text-ink italic">"{topPearl.text}"</p>
          <p className="text-moss text-sm mt-2">
            {topPearl.upvotes} upvotes · {topPearl.saves} saves
          </p>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/ImpactStats.tsx
git commit -m "feat: add impact stats component for premium users"
```

---

### Task 4.4: Phase 4 Checkpoint

```bash
npm run test:run
npm run build
git add -A
git commit -m "chore: complete Phase 4 - premium stats and sync"
git tag v2.0.0-phase4
```

---

## Phase 5: Paywall & Monetization

**Goal:** Contextual upgrade prompts, purchase integration.

**Estimated Time:** 4-6 hours

### Task 5.1: Create Upgrade Prompts

**Files:**
- Create: `src/components/UpgradePrompt.tsx`

```typescript
import { usePremiumStore } from '../stores/usePremiumStore';

interface UpgradePromptProps {
  feature: string;
  description: string;
  onUpgrade: () => void;
  onDismiss: () => void;
}

export function UpgradePrompt({ feature, description, onUpgrade, onDismiss }: UpgradePromptProps) {
  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center p-4 z-50">
      <div className="bg-cream rounded-2xl max-w-sm w-full p-6 text-center">
        <div className="w-12 h-12 bg-moss/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>

        <h3 className="font-serif text-xl text-ink mb-2">{feature}</h3>
        <p className="text-ink-soft text-sm mb-6">{description}</p>

        <div className="space-y-3">
          <button
            onClick={onUpgrade}
            className="w-full py-3 bg-moss text-cream rounded-lg font-medium
                       hover:bg-moss/90 transition-colors"
          >
            Upgrade — $4.99/year
          </button>

          <button
            onClick={onDismiss}
            className="w-full py-2 text-ink-soft hover:text-ink transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 5.2: Update Purchase Flow

**Files:**
- Modify: `src/lib/purchases.ts`
- Create: `src/components/SettingsPremium.tsx`

---

### Task 5.3: Phase 5 Checkpoint

```bash
npm run test:run
npm run build
git add -A
git commit -m "chore: complete Phase 5 - paywall and monetization"
git tag v2.0.0-phase5
```

---

## Phase 6: Polish & PWA

**Goal:** Production-ready, performant, installable PWA.

**Estimated Time:** 4-6 hours

### Task 6.1: PWA Optimization

**Files:**
- Modify: `vite.config.ts`
- Modify: `public/manifest.json` (if separate)

### Task 6.2: Performance Audit

Run Lighthouse and address issues:
- Bundle size optimization
- Code splitting for routes
- Image optimization
- Caching strategy

### Task 6.3: Accessibility Audit

- Screen reader testing
- Color contrast verification
- Keyboard navigation
- Focus management

### Task 6.4: Security Audit

- API key handling
- XSS prevention
- Auth token storage
- Input sanitization

### Task 6.5: Final Testing

- Full E2E flow on mobile Safari
- Full E2E flow on Chrome
- Offline behavior
- Install prompt

### Task 6.6: Phase 6 Checkpoint

```bash
npm run test:run
npm run build
npm run preview # Test production build

git add -A
git commit -m "chore: complete Phase 6 - polish and PWA optimization"
git tag v2.0.0-rc1
```

---

## Final Release

```bash
git checkout main
git merge feature/insight-driven-v2
git tag v2.0.0
git push origin main --tags
```

---

## Database Schema

### Supabase Tables

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamptz default now(),
  tier text default 'free' check (tier in ('free', 'premium')),
  premium_expires_at timestamptz,
  total_karma int default 0,
  total_saves int default 0
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Insights (synced from local)
create table public.insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  session_id uuid,
  raw_text text not null,
  formatted_text text,
  created_at timestamptz default now(),
  updated_at timestamptz
);

alter table public.insights enable row level security;

create policy "Users can manage own insights"
  on public.insights for all
  using (auth.uid() = user_id);

-- Pearls
create table public.pearls (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  insight_id uuid references public.insights(id) on delete cascade,
  text text not null,
  upvotes int default 0,
  saves int default 0,
  created_at timestamptz default now()
);

alter table public.pearls enable row level security;

create policy "Anyone can view pearls"
  on public.pearls for select
  to authenticated
  using (true);

create policy "Users can create own pearls"
  on public.pearls for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own pearls"
  on public.pearls for delete
  using (auth.uid() = user_id);

-- Pearl votes
create table public.pearl_votes (
  pearl_id uuid references public.pearls(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (pearl_id, user_id)
);

alter table public.pearl_votes enable row level security;

create policy "Users can manage own votes"
  on public.pearl_votes for all
  using (auth.uid() = user_id);

-- Pearl saves
create table public.pearl_saves (
  pearl_id uuid references public.pearls(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (pearl_id, user_id)
);

alter table public.pearl_saves enable row level security;

create policy "Users can manage own saves"
  on public.pearl_saves for all
  using (auth.uid() = user_id);

-- Function to increment karma
create or replace function increment_karma()
returns trigger as $$
begin
  update public.profiles
  set total_karma = total_karma + 1
  where id = (select user_id from public.pearls where id = NEW.pearl_id);

  update public.pearls
  set upvotes = upvotes + 1
  where id = NEW.pearl_id;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_pearl_vote
  after insert on public.pearl_votes
  for each row execute function increment_karma();

-- Function to increment saves
create or replace function increment_saves()
returns trigger as $$
begin
  update public.profiles
  set total_saves = total_saves + 1
  where id = (select user_id from public.pearls where id = NEW.pearl_id);

  update public.pearls
  set saves = saves + 1
  where id = NEW.pearl_id;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_pearl_save
  after insert on public.pearl_saves
  for each row execute function increment_saves();
```

---

## Edge Cases & Error Handling

### Voice Recording
- **Microphone permission denied:** Show clear error with instructions
- **Browser doesn't support MediaRecorder:** Fallback to Web Speech API only
- **Recording fails mid-session:** Save partial transcription if available

### Transcription
- **Web Speech API not supported:** Disable voice capture, allow text-only insights
- **Whisper API fails:** Fallback to Web Speech result, retry with exponential backoff
- **Empty transcription:** Prompt user to try again or type manually

### AI Chat
- **API rate limit:** Queue messages, show "please wait"
- **API error:** Show error message, allow retry
- **Context too long:** Summarize older messages

### Cloud Sync
- **Offline:** Queue changes, sync when online
- **Conflict:** Local changes win, merge strategy for non-destructive updates
- **Auth expired:** Prompt re-login, preserve local data

### Pearls
- **Duplicate submission:** Check before insert, show existing pearl
- **Content moderation:** Basic profanity filter, report mechanism
- **Vote manipulation:** Rate limit votes per user per hour

---

## Testing Strategy

### Unit Tests
- All business logic in `src/lib/`
- Store actions and computed values
- Utility functions

### Integration Tests
- Database operations (Dexie + Supabase)
- API calls (mocked)
- Component interactions

### E2E Tests (Manual for MVP)
- Full meditation → insight → explore flow
- Pearl creation and voting
- Premium upgrade flow
- Offline behavior

### Performance Testing
- Lighthouse audit (target: 90+ all categories)
- Bundle size monitoring
- API response times

---

## Success Criteria

### MVP (Phases 0-2)
- [ ] Timer works as before
- [ ] Can capture insight via voice
- [ ] AI formats text (premium)
- [ ] AI chat works (premium)
- [ ] No regressions in existing features
- [ ] PWA installable on phone

### Full Release (Phases 0-6)
- [ ] Pearls feed functional
- [ ] Voting and saving work
- [ ] Cloud sync operational
- [ ] Premium purchase works
- [ ] Lighthouse scores 90+
- [ ] All tests pass
- [ ] Zero critical bugs

---

*Plan created: 2026-01-06*
*Last updated: 2026-01-06*
