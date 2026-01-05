# 10,000 Hours - iOS Commercialization Roadmap

**Status:** REVISED (Insight Journal + Wisdom Stream + Hide Time) | **Date:** January 2026

---

## Vision

Transform the minimalist meditation timer PWA into a commercially viable iOS app while preserving its zen philosophy. The app's restraint IS the product - we enhance without bloating.

**Core focus:** Tracking progression toward 10,000 hours and capturing meditation insights for long-term reflection.

**Pricing Model:** 30-Day Rolling Window + $4.99/year Premium

The app is **free forever** with a 30-day rolling window of history. Premium ($4.99/year) unlocks your full journey. This model is proven by Slack (30-40% conversion) and aligns with habit formation psychology (paywall triggers at peak emotional investment).

**Core additions:**
- 30-day rolling window (FREE) → Full history (Premium $4.99/year)
- Insight Journal: Voice notes, on-device transcription, searchable archive (Premium)
- Wisdom Stream: Anonymous crowd-sourced insights from the community (read FREE, share Premium)
- Word cloud visualization: See your vocabulary of understanding evolve (Premium)
- Hide Time Display: Optional setting for number-free meditation experience (Premium)
- Full history & calendar: Unlimited session history and heatmap (Premium)
- Ghibli-inspired design language: warm colors, organic animation, generous Ma (empty space)
- Supabase backend for Wisdom Stream (anonymous, no auth required)
- Local storage (Dexie/IndexedDB) for personal data - **data is never deleted, just hidden in UI for free users**

**What was removed from original scope:**
- ~~Apple Sign-In~~ -> Anonymous device hash for Wisdom Stream
- ~~Interval bells~~ -> Silent meditation focus
- ~~Year Summary animation~~ -> Insight archive IS the summary
- ~~Spirit companion~~ -> v2 consideration
- ~~Garden visualization~~ -> Replaced by Insight Journal (more authentic value)
- ~~Full social features~~ -> Wisdom Stream is read-only, Like + Save only

---

## The Problem We're Solving

Meditators have insights during practice -> Want to capture them immediately -> Currently scattered across notes apps, AI chats -> Insights get lost over time -> Valuable realizations forgotten.

**The Solution:** A meditation timer + hour tracker + insight journal that:
- Captures voice notes immediately post-session
- Transcribes for searchability (on-device, private)
- Archives with timestamps tied to practice milestones
- Visualizes themes via word cloud over time

---

## Navigation Architecture

```
                    +--------------+
                    |  ONBOARDING  |  (first launch only)
                    +------+-------+
                           |
+------------------------------------------------------------------+
|                                                                  |
|   TIMER  ->  STATS  ->  WISDOM  ->  CALENDAR  ->  INSIGHTS       |
|   (home)    (gear->Settings)  (community)         (voice journal)|
|                                                                  |
|   Overlay: Paywall (when accessing premium features)             |
|                                                                  |
+------------------------------------------------------------------+
```

### Screen Flow

| Screen | Purpose | FREE (30-day window) | PREMIUM ($4.99/year) |
|--------|---------|----------------------|----------------------|
| **Timer** | Meditation (home) | Full access | Full access |
| **Stats** | Analytics | This week + month only | Full trends (all time) |
| **Wisdom** | Community insights stream | Read only | Read + Share (50+ hrs) |
| **Calendar** | History, heatmap | Current month only | Full history (all years) |
| **Insights** | Voice journal, archive, word cloud | Locked preview | Full access |
| **Settings** | Preferences | Basic | Full (hide time, export) |
| **Onboarding** | First-time intro | Yes | Yes |
| **Paywall** | Purchase prompt | Day 31 (or limit hit) | N/A |

---

## Feature Breakdown: FREE vs PREMIUM

### 30-Day Rolling Window Model

**Critical design:** All data is ALWAYS stored locally. FREE tier gates the UI visibility, not the data itself.

| Feature | FREE (30-day window) | PREMIUM ($4.99/year) |
|---------|----------------------|----------------------|
| **Timer** | Unlimited sessions | Unlimited sessions |
| **Total Hours Counter** | Hidden (Premium unlocks) | ✓ Full visibility |
| **Session History** | Rolling 30 days only | Full history (all time) |
| **Calendar Heatmap** | Current month only | All months (all years) |
| **Stats & Trends** | This week + this month | Detailed trends (all time) |
| **Hide Time Display** | ✗ | ✓ |
| **Milestone Badges** | Visible but grayed after 30 days | ✓ Fully visible |
| **Data Export (JSON/CSV)** | ✗ | ✓ |
| **Wisdom Stream (read)** | ✓ | ✓ |
| **Wisdom Stream (share)** | ✗ | ✓ (50+ hours) |
| **Voice Recording** | ✗ | ✓ |
| **On-device Transcription** | ✗ | ✓ |
| **Insight Archive** | ✗ | ✓ |
| **Word Cloud** | ✗ | ✓ |
| **Full-text Search** | ✗ | ✓ |

### Tier Philosophy

**The meditation is always free. Your full journey costs less than a coffee per year.**

| Tier | Who It's For | Value Proposition |
|------|--------------|-------------------|
| **FREE** | Everyone starting meditation | Full timer forever, 30 days of progress visible |
| **PREMIUM** | Anyone who wants to see their full journey | $0.41/month - trivial to unlock everything |

### Why $4.99/year Annual Subscription

**Research validation (Slack model):**
- Slack uses 90-day rolling history for free → achieved **30-40% conversion** (vs 2-5% industry average)
- **$27.7B acquisition** proves the model works at scale

**Why annual, not one-time:**
- **Recurring revenue compounds** - Year 5 revenue is 3x Year 1 with same downloads
- **Low price = high retention** - Cheap annual plans retain 36% vs 6.7% for expensive monthly
- **Natural upgrade trigger** - Day 31 is psychologically optimal (mid-habit formation)
- **Trivial amount** - $4.99/year = $0.41/month, impulse purchase

**Why not subscription fatigue?**
- $4.99/year is NOT the same as $9.99/month subscription
- Annual renewal is forgettable (auto-renews)
- Price is so low users don't think about it

**Habit formation psychology:**
- At Day 31, user has invested enough to feel loss
- But habit isn't fully automatic yet (takes ~66 days average)
- They NEED the app to continue → paywall hits at maximum emotional investment

---

## The Insight Journal (Core Premium Feature)

A dedicated screen for capturing, transcribing, and reviewing meditation insights.

### Philosophy
- **Capture immediately** - Voice notes right after session, before insights fade
- **Searchable memory** - Find that insight from 6 months ago
- **See patterns** - Word cloud reveals your evolving understanding
- **Private reflection** - On-device transcription, nothing leaves your phone

### Voice Recording

**Post-session flow:**
1. Session ends -> "Capture an insight?" prompt appears
2. Tap to record voice note (30 seconds to 5 minutes)
3. On-device transcription runs automatically
4. Insight saved with timestamp and hour milestone

**Why voice, not text:**
- Immediate capture without typing friction
- Preserves emotional tone and nuance
- Can listen back to original recording
- More authentic than composed written notes

### On-Device Transcription

**Technology:** iOS Speech Recognition Framework
- Free (no API costs)
- Private (audio never leaves device)
- Works offline
- Quality sufficient for personal reflection

**Why not Whisper API:**
- Ongoing cost (~$0.006/min) makes lifetime pricing unsustainable
- Privacy concerns with cloud transcription
- Requires internet connection
- Complexity of API key management

### Insight Archive

**List view showing:**
- Transcript preview (first 2 lines)
- Date and time recorded
- Hour milestone ("After 42.5 hours")
- Duration of recording
- Play button for audio

**Filtering options:**
- By date range
- By hour milestone ("First 100 hours", "500-1000 hours")
- Full-text search across all transcripts

### Word Cloud Visualization

**How it works:**
- Extracts words from all transcripts
- Filters stopwords (the, and, is, etc.)
- Weights by frequency
- Interactive: tap word to see insights containing it

**What it reveals:**
- Your vocabulary of understanding evolving over time
- Recurring themes in your practice
- Shifts in what you notice/articulate

### Insights Preview (Free Users)

When free users navigate to Insights, they see an **enticing preview**:

```
+-------------------------------------+
|                                     |
|     [BLURRED WORD CLOUD]            |
|     Showing what theirs could       |
|     look like at their hour count   |
|                                     |
|     +-------------------------+     |
|     |  Your insights await    |     |
|     |                         |     |
|     |  Capture voice notes    |     |
|     |  See your journey       |     |
|     +-------------------------+     |
|                                     |
|     +-------------------------+     |
|     |   Unlock Insights       |     |
|     +-------------------------+     |
|                                     |
+-------------------------------------+
```

---

## The Wisdom Stream (Community Feature)

Anonymous, crowd-sourced meditation insights - like Kindle's "most highlighted passages" but for meditation wisdom.

### Philosophy
- **Collective wisdom** - See what resonates across the community
- **Anonymous by design** - No profiles, no followers, just insights
- **Trust through practice** - 50+ hours required to share (filters trolls)
- **Read freely, share premium** - Everyone benefits from community wisdom

### How It Works

**For Readers (FREE):**
1. Navigate to Wisdom screen (between Stats and Calendar)
2. Browse anonymous pearls of wisdom
3. See hour milestone of each contributor
4. Like pearls that resonate
5. Save favorites to personal collection

**For Contributors (INSIGHT tier, 50+ hours):**
1. Record voice note after meditation
2. After saving insight, see "Share this wisdom?" prompt
3. AI or manual extraction creates 1-2 sentence pearl
4. Review and edit before sharing
5. Pearl appears in community stream (anonymous)

### Wisdom Stream Screen

```
+-------------------------------------+
|        Pearls of Wisdom             |
+-------------------------------------+
|                                     |
|  "The space between thoughts is     |
|   where I live now."                |
|   ─── 847 hours · 23 likes          |
|                          [♡] [⊕]    |
|                                     |
|  ───────────────────────────────    |
|                                     |
|  "Resistance is just another        |
|   sensation to observe."            |
|   ─── 2,341 hours · 89 likes        |
|                          [♡] [⊕]    |
|                                     |
+-------------------------------------+
|     [Saved] [All] [New]             |
+-------------------------------------+
```

- `[♡]` = Like (influences ranking)
- `[⊕]` = Save to personal collection
- Hour milestone shown (establishes credibility)
- Tabs: Saved | All | New

### Ranking Algorithm

```
score = (likes × 1.0) + (saves × 2.0) + recency_decay

recency_decay = 1.0 / (1 + days_since_posted × 0.1)
```

Saves weighted higher than likes (indicates deeper resonance).

### Moderation

1. **Hour-gate**: 50+ hours required to share (no drive-by trolling)
2. **AI filter**: Basic profanity/harassment detection
3. **Report button**: Community can flag inappropriate content
4. **No pre-review**: Trust earned through practice, community self-polices

### Why This Matters

From Reddit research (12,503 comments):
- Highest engagement posts are people sharing insights
- Users value seeing others' journeys
- No existing tool captures and shares meditation wisdom

This feature creates value for everyone:
- Free users get community wisdom
- Premium users get recognition for sharing
- App gets differentiation and retention

---

## Hide Time Display (User Setting)

Optional setting for practitioners who prefer number-free meditation.

### Research Validation
> *"One feature that would make it simply perfect — an option to NOT show the numbers while it's running."* (App Store review, echoed in Reddit research)

### Philosophy
- **Presence over measurement** - Some practitioners find numbers distracting
- **Advanced feature** - For those who've moved beyond tracking
- **Reveal in Stats** - Still track hours, just don't show during meditation

### User Flow (Hide Time Enabled)

```
IDLE STATE:
+-------------------------------------+
|                                     |
|                                     |
|       Just start meditating         |
|                                     |
|            [ Begin ]                |
|                                     |
+-------------------------------------+

RUNNING STATE:
+-------------------------------------+
|                                     |
|                                     |
|          ◯                          |  <- Breathing/pulsing animation
|       (pulsing)                     |     Acknowledges timer is running
|                                     |     NO time displayed
|                                     |
|         Tap to end                  |
|                                     |
+-------------------------------------+

COMPLETE STATE:
+-------------------------------------+
|                                     |
|                                     |
|      Meditation complete            |
|                                     |
|        [ View Stats ]               |  <- See time in Stats
|                                     |
+-------------------------------------+
```

### Implementation

- Setting toggle in Settings screen
- Persists in Dexie database
- Timer.tsx conditionally renders based on setting
- Default: OFF (show time normally)

### Design Considerations

- Breathing animation is crucial - user needs acknowledgment timer is running
- "Tap to end" instruction prevents confusion
- Stats screen becomes the reveal moment
- Aligns with zen philosophy: presence over measurement

---

## Monetization

### Pricing Model: $4.99/year Premium Subscription

| Product | Price | Net (after Apple 15%*) | Type | What's Unlocked |
|---------|-------|------------------------|------|-----------------|
| **FREE** | $0 | - | - | Timer + 30-day rolling window |
| **PREMIUM** | $4.99/year | $4.24/year | Auto-renewing subscription | Full history + voice + everything |

*Apple Small Business Program: 15% commission for developers earning under $1M/year (30% Year 1, 15% after)

### Why This Pricing?

**$4.99/year Premium:**
- **Trivial amount** - $0.41/month, less than a coffee
- **High retention** - Cheap annual plans retain 36% of users (vs 6.7% for expensive monthly)
- **Proven model** - Slack achieved 30-40% conversion with rolling history gate
- **Recurring compounds** - Revenue grows even with same download rate

**Why annual subscription (not one-time):**
- **5-year math**: At 200K downloads/year, one-time = $84K total. Annual = $489K over 5 years.
- **Retention incentive** - You're motivated to keep users engaged
- **Price flexibility** - Can raise price later for new users (grandfather existing)
- **No perceived "subscription fatigue"** - $4.99/YEAR doesn't feel like a subscription

### Single Paywall: Premium Unlock

```
┌─────────────────────────────────────────┐
│                                         │
│  🧘 Your Journey Continues              │
│                                         │
│  You've been meditating for 31 days.    │
│                                         │
│  Your earlier sessions are still here,  │
│  just hidden. Unlock your full journey  │
│  for $4.99/year.                        │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │   See My Full Journey - $4.99   │    │
│  └─────────────────────────────────┘    │
│                                         │
│           Maybe Later                   │
│                                         │
│  Restore Purchase                       │
│                                         │
└─────────────────────────────────────────┘
```

**Triggered when:**
- Day 31 (first session 31+ days after first ever session)
- User tries to view history beyond 30-day window
- User tries to view calendar beyond current month
- User taps on grayed-out milestone badges
- User taps "Capture insight" post-session
- User navigates to Insights tab

### If User Chooses "Maybe Later"

- App continues to work normally
- Rolling 30-day window visible
- Calendar shows current month only
- Stats show "This Week" and "This Month" only
- Subtle reminder in UI: "30 days visible • Unlock full history"
- **NO nagging popups** - Soft touch, zen philosophy

### Purchase Flow

1. User hits 30-day limit or Day 31 trigger
2. Paywall slides up with personalized message
3. Apple Pay → immediate unlock
4. Full history, voice, insights all enabled
5. Subscription auto-renews annually

### Revenue Projections (Recurring)

**Conservative: 5% conversion, 80% annual retention**

| Year | Downloads | New Paid | Retained | Total Paid | Revenue |
|------|-----------|----------|----------|------------|---------|
| 1 | 200,000 | 10,000 | — | 10,000 | $42,400 |
| 2 | 200,000 | 10,000 | 8,000 | 18,000 | $76,320 |
| 3 | 200,000 | 10,000 | 14,400 | 24,400 | $103,456 |
| 4 | 200,000 | 10,000 | 19,520 | 29,520 | $125,165 |
| 5 | 200,000 | 10,000 | 23,616 | 33,616 | $142,532 |

**5-year total: $489,873** (vs $84,800 one-time)

**Optimistic: 8% conversion, 85% retention**

| Year | Downloads | New Paid | Retained | Total Paid | Revenue |
|------|-----------|----------|----------|------------|---------|
| 1 | 500,000 | 40,000 | — | 40,000 | $169,600 |
| 2 | 500,000 | 40,000 | 34,000 | 74,000 | $313,760 |
| 3 | 500,000 | 40,000 | 62,900 | 102,900 | $436,296 |

**3-year total: $919,656**

**Break-even:** ~24 sales (covers $99 Apple Developer fee)

---

## Technical Architecture

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| State | Zustand |
| Local DB | Dexie (IndexedDB) |
| Payments | RevenueCat |
| iOS Wrapper | Capacitor |
| Styling | Tailwind CSS |
| Crash Reporting | Sentry |
| Testing | Vitest |
| Speech Recognition | iOS SFSpeechRecognizer (via Capacitor plugin) |
| Audio Recording | Web MediaRecorder API / Capacitor plugin |

### Database Schema

#### Dexie (Local Storage)

```typescript
// src/lib/db.ts
import Dexie, { Table } from 'dexie';

interface Session {
  id?: number;
  uuid: string;           // Client-generated UUID
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
}

interface Insight {
  id?: number;
  uuid: string;           // Client-generated UUID
  sessionUuid?: string;   // Optional link to session
  recordedAt: Date;
  audioBlob: Blob;        // Original audio recording
  transcript: string;     // Transcribed text
  durationSeconds: number;
  totalHoursAtRecording: number; // Hour milestone when recorded
  sharedAt?: Date;        // When shared to Wisdom Stream
  sharedPearlUuid?: string; // Link to Supabase pearl
}

interface SavedPearl {
  id?: number;
  pearlUuid: string;      // Supabase pearl ID
  savedAt: Date;
  content: string;        // Cached locally
  hoursAtCreation: number;
}

interface UserProfile {
  id: 1;                  // Single row
  tier: 'free' | 'premium';           // Current tier
  premiumExpiryDate?: Date;           // When subscription expires
  originalPurchaseDate?: Date;        // First subscription date (for tenure tracking)
  firstSessionDate?: Date;            // When user started meditating (for Day 31 trigger)
}

interface UserSettings {
  id: 1;                  // Single row
  hideTimeDisplay: boolean; // Hide time during meditation
}

class AppDatabase extends Dexie {
  sessions!: Table<Session>;
  insights!: Table<Insight>;
  savedPearls!: Table<SavedPearl>;
  profile!: Table<UserProfile>;
  settings!: Table<UserSettings>;

  constructor() {
    super('TenThousandHours');

    // Schema versioning for future migrations
    this.version(1).stores({
      sessions: '++id, uuid, startTime',
      insights: '++id, uuid, sessionUuid, recordedAt, transcript',
      savedPearls: '++id, pearlUuid, savedAt',
      profile: 'id',
      settings: 'id'
    });
  }
}

export const db = new AppDatabase();
```

**Note:** Full-text search on transcripts via Dexie's `where('transcript').startsWithIgnoreCase()` or simple `.filter()` for contains queries.

#### Supabase (Cloud - Wisdom Stream)

```sql
-- Wisdom pearls table
CREATE TABLE wisdoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  hours_at_creation INTEGER NOT NULL,
  device_hash TEXT NOT NULL,  -- Anonymous device identifier (hashed)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  reported BOOLEAN DEFAULT FALSE,
  hidden BOOLEAN DEFAULT FALSE
);

-- Interactions (likes/saves per device)
CREATE TABLE wisdom_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wisdom_id UUID REFERENCES wisdoms(id) ON DELETE CASCADE,
  device_hash TEXT NOT NULL,
  interaction_type TEXT NOT NULL, -- 'like' or 'save'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wisdom_id, device_hash, interaction_type)
);

-- Reports for moderation
CREATE TABLE wisdom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wisdom_id UUID REFERENCES wisdoms(id) ON DELETE CASCADE,
  device_hash TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wisdom_id, device_hash)
);

-- Indexes for performance
CREATE INDEX idx_wisdoms_created_at ON wisdoms(created_at DESC);
CREATE INDEX idx_wisdoms_likes ON wisdoms(likes_count DESC);
CREATE INDEX idx_wisdom_interactions_wisdom ON wisdom_interactions(wisdom_id);

-- Row Level Security (RLS)
ALTER TABLE wisdoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE wisdom_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wisdom_reports ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can read non-hidden wisdoms
CREATE POLICY "Public can read wisdoms" ON wisdoms
  FOR SELECT USING (hidden = FALSE);

-- Only device owner can insert their own wisdoms
CREATE POLICY "Devices can insert wisdoms" ON wisdoms
  FOR INSERT WITH CHECK (TRUE);

-- Interactions: Anyone can insert one per wisdom per type
CREATE POLICY "Devices can interact" ON wisdom_interactions
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Public can read interactions" ON wisdom_interactions
  FOR SELECT USING (TRUE);

-- Reports: Anyone can report once per wisdom
CREATE POLICY "Devices can report" ON wisdom_reports
  FOR INSERT WITH CHECK (TRUE);
```

**Anonymous Identity:** Uses device hash (generated once, stored locally) instead of user accounts. No authentication required.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/db.ts` | Add insights, savedPearls, settings tables |
| `src/stores/useSessionStore.ts` | Add post-session insight prompt, wisdom view |
| `src/App.tsx` | Add Insights + Wisdom routes, premium gating |
| `src/components/Timer.tsx` | Post-session prompt, hide time display mode |
| `src/components/Stats.tsx` | Settings gear icon, swipe to Wisdom |
| `src/components/Calendar.tsx` | Swipe targets for Wisdom screen |
| `src/hooks/useSwipe.ts` | Update for 5-screen navigation |
| `src/lib/constants.ts` | Word cloud stopwords |
| `package.json` | New dependencies (Supabase, RevenueCat, etc.) |

## New Files to Create

```
src/
  lib/
    supabase.ts           # Supabase client initialization
    purchases.ts          # RevenueCat integration
    transcription.ts      # iOS Speech Recognition wrapper
    wordcloud.ts          # Word extraction and frequency analysis
    contentFilter.ts      # Basic profanity/harassment filter
    deviceHash.ts         # Anonymous device identifier generation

  stores/
    usePremiumStore.ts    # Subscription status tracking (free/premium + expiry)
    useInsightsStore.ts   # Personal insights state, recording
    useWisdomStore.ts     # Community wisdoms, likes, saves
    useSettingsStore.ts   # User settings (hide time, etc.)

  components/
    Insights.tsx          # Personal insights archive screen
    InsightRecorder.tsx   # Voice recording modal
    InsightCard.tsx       # Individual insight in list
    Wisdom.tsx            # Community wisdom stream screen
    PearlCard.tsx         # Individual pearl in wisdom stream
    ShareFlow.tsx         # Pearl extraction + approval flow
    WordCloud.tsx         # Word cloud visualization
    LockedOverlay.tsx     # Reusable blur + unlock CTA overlay
    Onboarding.tsx        # Intro flow (3 screens)
    PaywallPremium.tsx    # Premium subscription screen ($4.99/year)
    Settings.tsx          # Settings screen (subscription status, hide time)

.github/
  workflows/
    ci.yml                # GitHub Actions CI/CD

.env.local                # Supabase credentials (gitignored)
capacitor.config.ts
ios/                      # Generated by Capacitor
ROADMAP.md               # This document (north star)
```

**New dependencies:**
```json
{
  "@supabase/supabase-js": "^2.x.x",
  "@sentry/capacitor": "^0.x.x",
  "@sentry/react": "^7.x.x",
  "@revenuecat/purchases-capacitor": "^7.x.x",
  "vitest": "^1.x.x",
  "@testing-library/react": "^14.x.x",
  "@capacitor-community/keep-awake": "^3.x.x",
  "@capacitor-community/speech-recognition": "^5.x.x"
}
```

---

## Implementation Phases

### Phase 0: Account & Service Setup
**Do FIRST, before any code. Some steps take days to process.**

- [ ] **Apple Developer Program enrollment ($99/year)**
  - Go to developer.apple.com/programs/enroll
  - VERIFY: Can log into developer.apple.com/account
  - NOTE: Approval can take 24-48 hours for individuals

- [ ] **Create App ID in Apple Developer Portal**
  - Certificates, Identifiers & Profiles -> Identifiers -> App IDs -> (+)
  - Bundle ID: `com.yourname.tenthousandhours`
  - VERIFY: App ID appears in list

- [ ] **App Store Connect setup**
  - Go to appstoreconnect.apple.com
  - My Apps -> (+) New App
  - Platform: iOS, Name: "10,000 Hours", Bundle ID: (select your App ID)
  - VERIFY: App appears in "My Apps"

- [ ] **App Store Connect: Agreements, Tax, Banking**
  - Users and Access -> Agreements, Tax, and Banking
  - Accept Paid Apps agreement
  - Enter banking and tax information
  - VERIFY: Status shows "Active" (can take 1-3 business days)
  - NOTE: Cannot test purchases until this is complete

- [ ] **Create RevenueCat account**
  - Go to app.revenuecat.com -> Sign up
  - Create new project: "10000 Hours"
  - Platform: Apple App Store
  - Enter App Store Connect shared secret
  - VERIFY: RevenueCat shows your app with green checkmark

- [ ] **Create IAP products in App Store Connect**
  - My Apps -> Your App -> Subscriptions
  - Create Subscription Group: "Premium"
  - Auto-renewing subscription: "Premium Annual", Product ID `premium_annual`, $4.99/year
  - Submit for review (can take 24-48 hours)
  - VERIFY: Product shows "Ready to Submit" or "Approved"

- [ ] **Configure products in RevenueCat**
  - Products -> Add Products
  - Match Product ID exactly: `premium_annual`
  - Create Entitlement: "premium" (grants all premium features)
  - Create Offering: "default" with premium_annual product
  - VERIFY: Product shows in RevenueCat dashboard with green checkmark

- [ ] **Create Supabase project (for Wisdom Stream)**
  - Go to supabase.com -> New project
  - Project name: "10000-hours"
  - Region: Choose closest to target users
  - VERIFY: Project dashboard accessible

- [ ] **Create Supabase database schema**
  - Create `wisdoms` table (see Database Schema section)
  - Create `wisdom_interactions` table
  - Configure Row Level Security (RLS)
  - VERIFY: Tables created, RLS policies active

- [ ] **Get Supabase credentials**
  - Settings -> API -> Project URL + anon key
  - Store securely for environment variables
  - VERIFY: Credentials copied to secure location

#### Phase 0 - TEST CHECKLIST
Before moving to Phase 1:
- [ ] Can log into Apple Developer account
- [ ] App ID exists
- [ ] App appears in App Store Connect
- [ ] Banking/tax shows "Active" status
- [ ] RevenueCat shows green checkmark for `premium_annual` product
- [ ] Subscription approved in App Store Connect
- [ ] Supabase project created and accessible
- [ ] Supabase tables created with RLS configured

---

### Phase 1: Infrastructure
**REQUIRES: Phase 0 complete (Apple Developer account)**

- [ ] **Install and configure Sentry (crash reporting)**
  - `npm install @sentry/capacitor @sentry/react`
  - Initialize in App.tsx before any other code
  - Test: trigger intentional crash, verify in Sentry dashboard
  - VERIFY: Crashes reported with stack traces
  - NOTE: No visibility into production crashes = flying blind. Non-negotiable.

- [ ] **Set up Vitest for unit testing**
  - `npm install -D vitest @testing-library/react`
  - Create first test: timer duration calculation
  - Add `npm run test` script to package.json
  - VERIFY: Tests pass locally

- [ ] **Add Dexie schema with insights table**
  - Add `insights` table per schema above
  - Include `schemaVersion` field in database design
  - Document migration framework
  - VERIFY: Schema upgrade path documented

- [ ] **Create usePremiumStore.ts**
  - Track: tier ('free' | 'premium'), premiumExpiryDate
  - Helper function: isPremium() - checks tier AND expiry date
  - Actions: checkSubscriptionStatus, setTier, checkDaysSinceFirstSession
  - Handle subscription expiry gracefully (reverts to free tier)
  - Track firstSessionDate for Day 31 trigger logic
  - VERIFY: Store compiles, tier defaults to 'free'

- [ ] **Install Supabase client**
  - `npm install @supabase/supabase-js`
  - VERIFY: Package installed without errors

- [ ] **Create src/lib/supabase.ts**
  - Initialize Supabase client with env vars
  - Export typed client for wisdoms table
  - VERIFY: File compiles, client initializes

- [ ] **Add environment variables**
  - Create `.env.local` with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
  - Add `.env.local` to `.gitignore`
  - VERIFY: Env vars load correctly in dev

- [ ] **Test Supabase connection**
  - Create simple test query to wisdoms table
  - VERIFY: Connection works, can read from database

#### Phase 1 - TEST CHECKLIST
Before moving to Phase 2:
- [ ] `npm run build` succeeds with no errors
- [ ] `npm run test` passes
- [ ] Timer still works (start/stop meditation)
- [ ] Existing sessions still appear in Stats
- [ ] **Sentry:** Test crash appears in Sentry dashboard
- [ ] **Schema:** Dexie versioning documented for future migrations
- [ ] usePremiumStore tracks premium status correctly
- [ ] **Supabase:** Connection test succeeds
- [ ] **Supabase:** Can read wisdoms table (empty is fine)

---

### Phase 2: Core UI + Premium
**REQUIRES: Phase 0 complete (RevenueCat configured), Phase 1 complete**

#### UI Screens

- [ ] **Create Onboarding.tsx (3 screens)**
  - Screen 1: "Your meditation companion" - app intro
  - Screen 2: "Track your journey" - what the app does
  - Screen 3: "Capture your insights" - premium feature preview
  - Store `hasSeenOnboarding` in localStorage
  - VERIFY: Onboarding appears on first launch only

- [ ] **Create Settings.tsx**
  - Tier status display (FREE / PLUS / INSIGHT)
  - **Hide Time Display toggle** (requires PLUS, see Hide Time Display section)
  - Links: Privacy Policy, Terms of Service
  - Restore Purchases button
  - Version number at bottom
  - VERIFY: Settings accessible from Stats screen

- [ ] **Implement Hide Time Display setting**
  - Add `hideTimeDisplay` to user settings in Dexie
  - Create useSettingsStore.ts for settings state
  - VERIFY: Setting persists across app restarts

- [ ] **Update Timer.tsx for hidden mode**
  - Idle: Show "Just start meditating" instead of hours
  - Running: Show breathing circle + "Tap to end" instead of HH:MM:SS
  - Complete: Show "Meditation complete" instead of "+32m"
  - VERIFY: Timer works correctly in both modes

- [ ] **Add navigation to new screens**
  - Settings: gear icon on Stats screen -> Settings
  - Wisdom: third position after Stats (before Calendar)
  - Insights: fifth position after Calendar
  - Onboarding: shows before Timer on first launch
  - VERIFY: All navigation paths work (Timer -> Stats -> Wisdom -> Calendar -> Insights)

- [ ] **Add LockedOverlay.tsx component**
  - Reusable component for locked features
  - Blurred background
  - Message + "Unlock" CTA button
  - VERIFY: Component renders correctly in isolation

#### Paywall + Monetization

- [ ] **Install RevenueCat SDK**
  - `npm install @revenuecat/purchases-capacitor`
  - VERIFY: Package installed, no dependency errors

- [ ] **Create src/lib/purchases.ts**
  - Initialize RevenueCat with API key
  - Functions: getOfferings, purchasePackage, restorePurchases
  - Handle Premium subscription (auto-renewing)
  - Check entitlement: isPremium
  - Handle subscription status changes (expiry, renewal)
  - VERIFY: File compiles without errors

- [ ] **Create PaywallPremium.tsx**
  - Triggered when:
    - Day 31 (first session 31+ days after first ever session)
    - User hits 30-day history limit
    - User tries to view calendar beyond current month
    - User taps on grayed-out milestone badges
    - User taps "Capture insight" or navigates to Insights tab
  - Personalized headline: "Your Journey Continues"
  - Subhead: "You've been meditating for X days"
  - Lists: Full history, voice notes, transcription, word cloud
  - Price: "$4.99/year"
  - CTA: "See My Full Journey"
  - Skip: "Maybe Later" (small, non-guilt)
  - "Restore Purchase" link at bottom
  - VERIFY: Paywall renders correctly

- [ ] **Handle subscription completion**
  - On Premium purchase: setTier('premium'), set premiumExpiryDate, dismiss paywall
  - Store tier + expiry in Dexie UserProfile
  - Handle subscription expiry gracefully (RevenueCat handles this)
  - VERIFY: Purchase flow completes (use sandbox account)

#### Phase 2 - TEST CHECKLIST
Before moving to Phase 3:
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Timer still works
- [ ] Onboarding shows on first launch
- [ ] Can navigate: Timer -> Stats -> Wisdom -> Calendar -> Insights
- [ ] Can navigate to Settings
- [ ] LockedOverlay renders with blur and CTA
- [ ] **30-Day Rolling Window gating works:**
  - [ ] FREE: Only rolling 30 days of history visible
  - [ ] FREE: Only current month calendar visible
  - [ ] FREE: Stats show "This Week" and "This Month" only
  - [ ] FREE: Total hours counter hidden
  - [ ] PaywallPremium appears on Day 31 or when hitting limits
- [ ] **Paywall:**
  - [ ] PaywallPremium shows $4.99/year
  - [ ] Shows personalized "X days meditating" message
  - [ ] "Maybe Later" option available (non-guilt)
  - [ ] "Restore Purchase" button present
- [ ] **Hide Time Display (requires PREMIUM):**
  - [ ] Setting toggle disabled for FREE tier
  - [ ] Setting toggle works for PREMIUM tier
  - [ ] Timer shows "Just start meditating" when hidden
  - [ ] Timer shows breathing circle during session when hidden
  - [ ] Timer shows "Meditation complete" at end when hidden
  - [ ] Setting persists after app restart
- [ ] **Sandbox testing:**
  - [ ] Can complete Premium subscription ($4.99/year)
  - [ ] After subscription: full history unlocks, voice enabled
  - [ ] Restore Purchase works after reinstall
  - [ ] Subscription status reflects correctly in Settings

---

### Phase 3: Design System (Ghibli)
**REQUIRES: Phase 2 complete (UI screens to style)**

- [ ] **Update color palette in Tailwind config**
  ```js
  // tailwind.config.js
  cream: '#FAF8F3',        // Warmer paper tone
  'cream-warm': '#F5F1E8', // Working surfaces
  'cream-deep': '#EDE8DC', // Cards
  ink: '#2D3436',          // Softer than black
  'ink-soft': '#4A5568',   // Secondary text
  moss: '#7C9A6E',         // Growth, positive
  bark: '#8B7355',         // Earth tones
  ```
  - VERIFY: New colors applied, app builds

- [ ] **Add typography (Google Fonts)**
  - Display: Palatino Linotype (Spirited Away authentic)
  - Body: Raleway (humanist-geometric hybrid)
  - Import in index.html or CSS
  - VERIFY: Fonts load and display correctly

- [ ] **Implement breathing animations**
  ```css
  @keyframes subtle-breathe {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.92; transform: scale(0.997); }
  }
  /* 6 second cycle */
  ```
  - Apply to key statistics
  - VERIFY: Numbers have subtle breathing effect

- [ ] **Update Stats screen (Scroll Garden style)**
  - Remove ALL borders
  - Increase vertical spacing between sections (2-3x)
  - Content floats in space
  - VERIFY: Stats feels spacious, zen

- [ ] **Add organic easing to transitions**
  - `transition: all 400ms cubic-bezier(0.34, 1.56, 0.64, 1);`
  - Apply to buttons, modals, navigation
  - VERIFY: Transitions feel natural, not mechanical

#### Phase 3 - TEST CHECKLIST
Before moving to Phase 4:
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Timer still works
- [ ] Color palette is warm (cream backgrounds, softer text)
- [ ] Typography loads (Palatino for display, Raleway for body)
- [ ] Stats screen has generous spacing, no harsh borders
- [ ] Key numbers have subtle breathing animation
- [ ] Transitions feel organic, not abrupt
- [ ] Overall app feels "Ghibli-like" - warm, alive, breathing

---

### Phase 4: Insight Journal (Premium Feature)
**REQUIRES: Phase 2 complete (tier gating), Phase 3 complete (Ghibli styling)**

> **CRITICAL: The Insight Journal is a key premium feature. If recording/playback feels broken, users won't pay. Build and validate before polishing.**

> **TIER NOTE:** All Phase 4 features require Premium subscription. Users on FREE tier see the locked Insights tab and PaywallPremium when they try to access.

#### 4a: Voice Recording (Premium)

- [ ] **Install speech recognition plugin**
  - `npm install @capacitor-community/speech-recognition`
  - Configure iOS permissions in Info.plist
  - VERIFY: Plugin installs without errors

- [ ] **Create src/lib/transcription.ts**
  - Initialize speech recognition
  - `startRecording(): Promise<void>`
  - `stopRecording(): Promise<{ audioBlob: Blob, transcript: string }>`
  - Handle permissions gracefully
  - VERIFY: File compiles, permissions prompt appears

- [ ] **Create InsightRecorder.tsx component**
  - Record button (large, prominent)
  - Recording indicator (pulsing circle)
  - Stop button
  - Preview transcript before saving
  - Save/discard options
  - VERIFY: Can record and see transcript

- [ ] **Add post-session prompt to Timer.tsx**
  - After session ends: "Capture an insight?" appears
  - Tap opens InsightRecorder modal
  - Skip option (small, unobtrusive)
  - VERIFY: Prompt appears after ending session

#### 4b: Insight Archive (Premium)

- [ ] **Create useInsightsStore.ts**
  - Load insights from Dexie on init
  - Actions: addInsight, deleteInsight, searchInsights
  - Computed: insightsByDate, wordFrequencies
  - VERIFY: Store loads/saves correctly

- [ ] **Create InsightCard.tsx component**
  - Transcript preview (2 lines, truncated)
  - Date and hour milestone
  - Duration badge
  - Play button for audio
  - VERIFY: Card renders correctly

- [ ] **Create Insights.tsx screen**
  - List of InsightCards
  - Search bar at top
  - Filter buttons (date range, hour milestone)
  - Empty state for no insights
  - VERIFY: Screen displays insights list

- [ ] **Implement audio playback**
  - Play/pause button on each insight
  - Progress indicator
  - Handle audio focus/interruptions
  - VERIFY: Can play back recorded audio

- [ ] **Implement search/filter**
  - Full-text search across transcripts
  - Date range picker
  - Hour milestone filter ("0-100h", "100-500h", etc.)
  - VERIFY: Search returns relevant results

#### 4c: Wisdom Stream (FREE read, PREMIUM share)

> **REQUIRES: Supabase configured in Phase 0/1**
> **TIER NOTE:** Reading is FREE for all. Sharing requires PREMIUM + 50 hours.

- [ ] **Create useWisdomStore.ts**
  - Load community wisdoms from Supabase
  - Track liked/saved pearls locally
  - Actions: fetchWisdoms, likePearl, savePearl, reportPearl
  - VERIFY: Store fetches and displays wisdoms

- [ ] **Create Wisdom.tsx screen**
  - Scrollable list of PearlCards
  - Tabs: Saved | All | New
  - Pull-to-refresh
  - Empty state for no wisdoms
  - VERIFY: Screen displays community wisdoms

- [ ] **Create PearlCard.tsx component**
  - Pearl content (1-2 sentences)
  - Hour milestone badge
  - Like count + Like button
  - Save button
  - VERIFY: Card renders correctly with interactions

- [ ] **Implement pearl extraction flow**
  - After saving insight, prompt: "Share this wisdom?"
  - AI or manual extraction to 1-2 sentence pearl
  - User approves/edits before sharing
  - Only show for users with 50+ hours
  - VERIFY: Extraction flow works for eligible users

- [ ] **Create ShareFlow.tsx component**
  - Preview extracted pearl
  - Edit capability
  - Confirm/Cancel buttons
  - Upload to Supabase on confirm
  - VERIFY: Pearl appears in Wisdom Stream after sharing

- [ ] **Implement ranking algorithm**
  - `score = (likes × 1.0) + (saves × 2.0) + recency_decay`
  - Supabase function or client-side sorting
  - VERIFY: Higher-ranked pearls appear first

- [ ] **Add content moderation**
  - Basic profanity/harassment filter
  - Report button on each pearl
  - Hour-gate: 50+ hours required to share
  - VERIFY: Inappropriate content filtered, reports logged

- [ ] **Gate sharing behind PREMIUM tier**
  - Reading Wisdom Stream: FREE for all users
  - Sharing to Wisdom Stream: PREMIUM + 50 hours
  - Show milestone progress: "15 more hours until you can share wisdom"
  - VERIFY: FREE users can read, PREMIUM users (50+ hours) can share

#### 4d: Word Cloud (Premium)

- [ ] **Create src/lib/wordcloud.ts**
  - `extractWords(transcripts: string[]): Map<string, number>`
  - Filter stopwords (configurable list)
  - Calculate frequency weights
  - VERIFY: Word extraction works correctly

- [ ] **Create WordCloud.tsx component**
  - Render words sized by frequency
  - Interactive: tap word to filter insights
  - Smooth animation when data changes
  - VERIFY: Word cloud renders and is interactive

- [ ] **Add word cloud to Insights screen**
  - Collapsible section at top
  - Tap to expand/collapse
  - Tapping word filters list below
  - VERIFY: Word cloud integrated with filtering

#### 4e: Tier Gating

- [ ] **Implement locked overlay for Insights tab**
  - Use LockedOverlay component
  - Show blurred preview of what their insights could look like
  - "Unlock Insights" CTA → triggers PaywallPremium
  - VERIFY: FREE users see blur + unlock prompt

- [ ] **Gate recording behind PREMIUM tier**
  - Post-session prompt only for PREMIUM users
  - FREE users see "Upgrade to capture insights"
  - Tapping shows PaywallPremium
  - VERIFY: Only PREMIUM users can record

- [ ] **Gate Wisdom sharing behind PREMIUM tier**
  - Share flow only appears for PREMIUM users with 50+ hours
  - FREE users can read all wisdoms, like, save
  - VERIFY: PREMIUM users (50+ hours) can share, others cannot

#### Phase 4 - TEST CHECKLIST
Before moving to Phase 5:
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Timer still works
- [ ] **Recording (PREMIUM only):**
  - [ ] Permission prompt appears on first use
  - [ ] Can record voice note
  - [ ] Transcription appears after recording
  - [ ] Can preview and save/discard
- [ ] **Archive (PREMIUM only):**
  - [ ] Insights appear in list
  - [ ] Can play back audio
  - [ ] Search finds relevant insights
  - [ ] Filters work correctly
- [ ] **Wisdom Stream:**
  - [ ] Wisdoms load from Supabase
  - [ ] All tiers can like and save pearls
  - [ ] Saved pearls appear in Saved tab
  - [ ] PREMIUM users can share (with 50+ hours)
  - [ ] FREE users can read but not share
  - [ ] Report button works
- [ ] **Word Cloud (PREMIUM only):**
  - [ ] Words sized by frequency
  - [ ] Tapping word filters list
- [ ] **Tier gating:**
  - [ ] FREE users see blurred preview on Insights tab
  - [ ] FREE users cannot record (see PaywallPremium)
  - [ ] All tiers can read Wisdom Stream
  - [ ] PREMIUM users have full access to all features

---

### Phase 5: Capacitor & iOS
**REQUIRES: Phase 4 complete (Insight Journal done)**

- [ ] **Install Capacitor**
  - `npm install @capacitor/core @capacitor/ios`
  - `npx cap init "10000 Hours" com.yourname.tenthousandhours`
  - VERIFY: capacitor.config.ts created

- [ ] **Add required plugins**
  - `@capacitor/app` - lifecycle events
  - `@capacitor/haptics` - vibration feedback
  - `@capacitor/status-bar` - iOS status bar styling
  - VERIFY: Plugins install without errors

- [ ] **Install keep-awake plugin (CRITICAL)**
  - `npm install @capacitor-community/keep-awake`
  - Enable on session start
  - Disable on session end
  - VERIFY: Screen stays on during meditation

- [ ] **Implement app lifecycle handling (CRITICAL)**
  - Save session state on background (use absolute timestamp)
  - Recover state on foreground
  - Handle termination: detect incomplete session on next launch
  - VERIFY: Timer survives backgrounding and returns accurate

- [ ] **Generate iOS project**
  - `npm run build && npx cap add ios`
  - VERIFY: `ios/` folder created

- [ ] **Configure iOS capabilities**
  - Open in Xcode: `npx cap open ios`
  - Configure bundle ID to match Apple Developer
  - Add microphone usage description (for voice recording)
  - Add speech recognition usage description
  - VERIFY: App builds in Xcode

- [ ] **Create app icons and splash screens**
  - Icon: 1024x1024 (App Store) + all required sizes
  - Splash: centered logo on cream background
  - VERIFY: Icons display correctly

- [ ] **Test on physical device**
  - Connect iPhone, trust computer
  - Build and run from Xcode
  - Test all flows on device
  - VERIFY: App runs correctly on device

- [ ] **Add haptic feedback**
  - Session start: subtle tap
  - Session end: success pattern
  - Recording start/stop: feedback
  - VERIFY: Haptics feel appropriate

- [ ] **Add CI/CD with GitHub Actions**
  - On PR: `npm run build`, `npm run test`
  - On merge to main: Build + upload to TestFlight
  - VERIFY: CI runs on every PR

#### Phase 5 - TEST CHECKLIST
Before moving to Phase 6:
- [ ] App builds and runs on iOS simulator
- [ ] App builds and runs on physical iPhone
- [ ] App icon displays correctly
- [ ] Splash screen shows on launch
- [ ] In-App Purchase works on device (sandbox)
- [ ] Timer works correctly
- [ ] **Voice recording works on device**
- [ ] **Transcription works on device**
- [ ] Haptic feedback fires appropriately
- [ ] No crashes in 30 minutes of use
- [ ] **Keep-awake:** Screen stays on during meditation
- [ ] **Lifecycle:** Timer survives backgrounding

---

### Phase 6: Launch & Post-Launch
**REQUIRES: Phase 5 complete (app runs on device)**

#### Launch Preparation

- [ ] **Write Privacy Policy**
  - What data is collected (local storage only)
  - Voice data stays on device
  - No selling of data
  - VERIFY: URL accessible, content accurate

- [ ] **Write Terms of Service**
  - Usage terms
  - Subscription terms ($4.99/year auto-renewing)
  - Cancellation and refund policies (Apple handles)
  - Auto-renewal disclosure (required by Apple)
  - VERIFY: URL accessible, content accurate

- [ ] **Create App Store listing**
  - App name: "10,000 Hours - Meditation Timer"
  - Subtitle: "Track hours, capture insights"
  - Description: focus on zen philosophy + insight capture
  - Keywords for ASO
  - VERIFY: All text fields complete

- [ ] **Create screenshots**
  - Show: Timer, Stats, Calendar, Insights, Word Cloud
  - Clean, minimal design
  - VERIFY: Screenshots uploaded to App Store Connect

- [ ] **TestFlight beta**
  - Upload build to App Store Connect
  - Invite 5-10 beta testers
  - Collect feedback for 1-2 weeks
  - **Beta focus:** Timer reliability, recording quality, transcription accuracy
  - VERIFY: Beta testers can install and use app

- [ ] **Submit for App Store review**
  - Complete all metadata
  - Answer review questions
  - Submit and wait
  - VERIFY: Status changes to "In Review"

#### Launch Checklist
Before launch:
- [ ] Privacy Policy URL works
- [ ] Terms of Service URL works
- [ ] App Store listing complete
- [ ] All screenshots uploaded
- [ ] TestFlight build works
- [ ] All critical bugs addressed
- [ ] App APPROVED

#### Post-Launch

- [ ] **Monitor first-week metrics**
  - RevenueCat: conversion rate, MRR, churn
  - Sentry: crash reports
  - App Store: downloads, ratings
  - VERIFY: Dashboard access, data flowing

- [ ] **Plan v1.1 features**
  - **High-priority:** Apple Health integration
  - **High-priority:** Dark mode support
  - **Medium-priority:** Data export (JSON/CSV)
  - **Medium-priority:** Widget support
  - **Low-priority:** Cloud sync for multi-device
  - VERIFY: Prioritized list based on user feedback

---

## Settings Screen Structure

```
+-------------------------------------+
|  <-                       Settings  |
+-------------------------------------+
|                                     |
|  YOUR SUBSCRIPTION                  |
|  +-----------------------------+    |
|  | Status: PREMIUM             |    |
|  | Renews: Jan 15, 2027        |    |  <- Shows next renewal date
|  | (or: FREE)                  |    |
|  +-----------------------------+    |
|                                     |
|  YOUR JOURNEY                       |
|  +-----------------------------+    |
|  | Days meditating: 47         |    |
|  | 30 days visible (unlock all)|    |  <- Only for FREE tier
|  +-----------------------------+    |
|                                     |
|  MEDITATION                         |
|  +-----------------------------+    |
|  | Hide Time Display      [ON] |    |  <- Requires PREMIUM
|  +-----------------------------+    |
|                                     |
|  ABOUT                              |
|  +-----------------------------+    |
|  | Privacy Policy           -> |    |
|  | Terms of Service         -> |    |
|  | Manage Subscription      -> |    |  <- Links to Apple subscriptions
|  | Version 1.0.0               |    |
|  +-----------------------------+    |
|                                     |
|  Restore Purchase                   |
+-------------------------------------+
```

---

## Business Management

No custom admin needed - use existing dashboards:

| Dashboard | What You Get |
|-----------|--------------|
| **RevenueCat** | Subscribers, MRR, churn, LTV, tax exports |
| **App Store Connect** | Downloads, ratings, revenue |
| **Sentry** | Crash reports, error tracking |

---

## Complexity & Risk Assessment

| Component | Difficulty | Risk | Mitigation |
|-----------|------------|------|------------|
| RevenueCat | Medium | Medium | Sandbox test, check product IDs |
| Voice Recording | Medium | Low | Use native plugin, test on device early |
| On-Device Transcription | Medium | Medium | Test accuracy, handle failures gracefully |
| Word Cloud | Low | Low | Simple canvas/SVG, existing libraries available |
| iOS Platform | Medium | Low | Keep-awake + lifecycle handling patterns |
| Capacitor | Low-Medium | Low | Standard config, +CI/CD |

---

## Design Principles (Do Not Violate)

1. **Simplicity is the feature** - Resist adding "just one more thing"
2. **No dark patterns** - No manipulation, no guilt, no anxiety
3. **Meditation, not metrics** - Stats serve practice, not vice versa
4. **The horizon, not the point** - 10,000 hours is direction, not destination
5. **Capture without friction** - Voice is faster than typing
6. **Breathe** - Everything should feel slow, intentional, alive
7. **The timer is sacred** - Never limit session length or count. The meditation itself is always free.

---

## Design Language: Ghibli-Inspired

The app's visual language draws from Studio Ghibli's design philosophy—not as imitation, but as principled inspiration.

### Core Ghibli Principles Applied

| Ghibli Principle | Application in 10,000 Hours |
|------------------|----------------------------|
| **Ma** — meaningful emptiness | Generous whitespace, content floats in space |
| **Nature as presence** | Organic typography, warm natural colors |
| **Watercolor philosophy** | Soft gradients, warm tones, no harsh contrasts |
| **Always breathing** | Subtle animation on key elements |
| **Earned emotion through restraint** | Quiet confidence, observational language |

### Color Palette

```css
/* Warm paper tones */
--cream: #FAF8F3;
--cream-warm: #F5F1E8;
--cream-deep: #EDE8DC;

/* Organic inks */
--ink: #2D3436;
--ink-soft: #4A5568;
--ink-mist: #718096;

/* Nature accents (used sparingly) */
--moss: #7C9A6E;
--bark: #8B7355;
```

### Typography

| Use | Font | Reasoning |
|-----|------|-----------|
| **Display** | Palatino Linotype | Spirited Away authentic |
| **Body** | Raleway | Humanist, clean, readable |

---

## Git Workflow & Safety

**Branch strategy:**
```
main (protected, always deployable)
  +-- feature/phase-0-setup
  +-- feature/phase-1-infrastructure
  +-- feature/phase-2-ui
  +-- feature/phase-3-design
  +-- feature/phase-4-insights
  +-- feature/phase-5-ios
  +-- feature/phase-6-launch
```

**Workflow per phase:**
1. Create branch: `git checkout -b feature/phase-X-name`
2. Build and test the feature
3. Run phase test checklist
4. Merge to main only when stable
5. Tag milestones: `git tag -a v1.X.0 -m "Phase X complete"`

---

## When You Get Stuck

**Debug checklist:**
1. Does `npm run build` succeed?
2. What does the browser console show?
3. What does the RevenueCat dashboard show?
4. Can you isolate the problem to one file/function?

**Common issues:**

| Problem | Check |
|---------|-------|
| "Invalid Product ID" | Product IDs case-sensitive match? Apple approved? |
| Transcription not working | iOS permissions granted? Microphone access? |
| Audio won't play | Audio session interruption? Correct blob format? |
| Capacitor build fails | Xcode signing? Correct bundle ID? |

---

## Success Metrics

**Launch success (first 30 days):**
- [ ] 100+ downloads
- [ ] 5+ ratings (4+ star average)
- [ ] 5+ Premium subscriptions
- [ ] Zero critical crashes
- [ ] At least one user records 10+ insights

**6-month success:**
- [ ] 10,000+ total downloads
- [ ] 500+ active Premium subscribers
- [ ] 4.5+ star rating
- [ ] At least one user reaches 100 hours with 50+ insights

**1-year success:**
- [ ] 50,000+ total downloads
- [ ] 2,500+ active Premium subscribers (~$10K ARR)
- [ ] 80%+ Year 1 renewal rate
- [ ] 4.5+ star rating maintained
