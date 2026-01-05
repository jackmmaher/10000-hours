# 10,000 Hours - iOS Commercialization Roadmap

**Status:** REVISED (Insight Journal) | **Date:** January 2026

---

## Vision

Transform the minimalist meditation timer PWA into a commercially viable iOS app while preserving its zen philosophy. The app's restraint IS the product - we enhance without bloating.

**Core focus:** Tracking progression toward 10,000 hours and capturing meditation insights for long-term reflection.

**Core additions:**
- Freemium model: $3.99/month or $29.99 lifetime
- Insight Journal: Voice notes, on-device transcription, searchable archive (PREMIUM)
- Word cloud visualization: See your vocabulary of understanding evolve
- Ghibli-inspired design language: warm colors, organic animation, generous Ma (empty space)
- Local-only storage (Dexie/IndexedDB) - no cloud sync in v1.0

**What was removed from original scope:**
- ~~Cloud sync (Supabase)~~ -> Local-only for simplicity
- ~~Apple Sign-In~~ -> No auth needed without cloud
- ~~Interval bells~~ -> Silent meditation focus
- ~~Year Summary animation~~ -> Insight archive IS the summary
- ~~Spirit companion~~ -> v2 consideration
- ~~Garden visualization~~ -> Replaced by Insight Journal (more authentic value)

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
+----------------------------------------------------------+
|                                                          |
|   TIMER  ->  STATS  ->  CALENDAR  ->  INSIGHTS           |
|   (home)    (gear->Settings)          (voice journal)    |
|                                                          |
|   Overlay: Paywall (when accessing premium features)     |
|                                                          |
+----------------------------------------------------------+
```

### Screen Flow

| Screen | Purpose | Free | Premium |
|--------|---------|------|---------|
| **Timer** | Meditation (home) | Full access | Full access |
| **Stats** | Analytics | Full access | Full access |
| **Calendar** | History, heatmap | Full access | Full access |
| **Insights** | Voice journal, archive, word cloud | Blurred preview | Full access |
| **Settings** | Preferences | Full access | Full access |
| **Onboarding** | First-time intro | Yes | Yes |
| **Paywall** | Purchase prompt | On premium tap | N/A |

---

## Free vs Premium

### Feature Breakdown

| Feature | Free | Premium ($3.99/mo or $29.99 lifetime) |
|---------|------|---------------------------------------|
| **Timer** | Unlimited sessions | Unlimited sessions |
| **Stats** | Full access | Full access |
| **Calendar** | Full heatmap | Full heatmap |
| **Session History** | Full access | Full access |
| **Insights** | Blurred preview | Voice recording, transcription, archive |
| **Word Cloud** | N/A | See vocabulary evolve over time |
| **Search** | N/A | Full-text search across insights |
| **Data** | Local storage | Local storage |

### Monetization Philosophy

**The meditation is always free. You pay for the insight journal.**

| What's Free | What's Premium |
|-------------|----------------|
| Complete timer with customizable bells | Voice note recording post-session |
| Hour accumulation toward any goal | On-device transcription |
| Full statistics and calendar | Searchable insight archive |
| Session history | Filter by date, milestone, keyword |
| Basic app forever | Word cloud visualization |

**Why freemium (not trial):**
- The timer functionality has no marginal cost - let everyone use it freely
- Premium is for users who want to capture and revisit insights
- No artificial time limits creating pressure
- Aligns with meditation philosophy: the practice itself is always accessible

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

## Monetization

### Pricing Model: Subscription + Lifetime

| Product | Price | Net (after Apple 15%*) | Type |
|---------|-------|------------------------|------|
| **Free** | $0 | - | Timer, stats, calendar forever |
| **Premium Monthly** | $3.99/mo | $3.39/mo | Auto-renewing subscription |
| **Premium Lifetime** | $29.99 | $25.49 | Non-consumable IAP |

*Apple Small Business Program: 15% commission for developers earning under $1M/year

### Why This Pricing?

**$3.99/month:**
- Lower barrier than $4.99, competitive with meditation apps
- ~$48/year for committed users
- Provides recurring revenue

**$29.99 lifetime:**
- Pays for itself in ~8 months vs. subscription
- Appeals to users who hate subscriptions
- Sustainable because on-device transcription has no ongoing cost
- Clear value: "one payment, insights forever"

**Why both options:**
- Users self-select based on commitment level
- Subscription: try it, cancel if not using
- Lifetime: confident meditators who know they'll use it

### Paywall Screen Design

```
+-------------------------------------+
|                                     |
|        Unlock Your Insights         |
|                                     |
|     Capture meditation insights     |
|     Search your journey             |
|     See your vocabulary grow        |
|                                     |
|  +-----------------------------+    |
|  |                             |    |
|  |    $3.99 / month            |    |
|  |    Cancel anytime           |    |
|  |                             |    |
|  |   [  Start Free Trial  ]    |    |  <- 7-day trial
|  |                             |    |
|  +-----------------------------+    |
|                                     |
|  +-----------------------------+    |
|  |                             |    |
|  |    $29.99 lifetime          |    |
|  |    One payment, forever     |    |
|  |                             |    |
|  |   [  Unlock Forever  ]      |    |
|  |                             |    |
|  +-----------------------------+    |
|                                     |
|         Restore Purchases           |
|                                     |
+-------------------------------------+
```

### Purchase Flow

1. User taps "Unlock Insights" on preview
2. Paywall slides up with both options
3. **Monthly:** 7-day free trial -> Apple Pay -> subscription
4. **Lifetime:** Apple Pay -> immediate unlock
5. On success: Insights screen unlocks, recording enabled
6. All data stored locally - no account needed

### Revenue Projections

Assumptions:
- 5% conversion to any paid tier
- 60% choose monthly, 40% choose lifetime
- Monthly churn: 10%/month (90% retention)

| Downloads/Year | Paid (5%) | Monthly | Lifetime | Year 1 Revenue |
|----------------|-----------|---------|----------|----------------|
| 10,000 | 500 | 300 | 200 | ~$8,500 |
| 50,000 | 2,500 | 1,500 | 1,000 | ~$42,500 |
| 100,000 | 5,000 | 3,000 | 2,000 | ~$85,000 |

**Break-even:** ~30 sales (covers $99 Apple Developer fee)

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

### Database Schema (Dexie - Local Only)

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
}

interface UserProfile {
  id: 1;                  // Single row
  isPremium: boolean;
  subscriptionType?: 'monthly' | 'lifetime';
  purchaseDate?: Date;
  expirationDate?: Date;  // For monthly subscriptions
}

class AppDatabase extends Dexie {
  sessions!: Table<Session>;
  insights!: Table<Insight>;
  profile!: Table<UserProfile>;

  constructor() {
    super('TenThousandHours');

    // Schema versioning for future migrations
    this.version(1).stores({
      sessions: '++id, uuid, startTime',
      insights: '++id, uuid, sessionUuid, recordedAt, transcript',
      profile: 'id'
    });
  }
}

export const db = new AppDatabase();
```

**Note:** Full-text search on transcripts via Dexie's `where('transcript').startsWithIgnoreCase()` or simple `.filter()` for contains queries.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/db.ts` | Add insights table, premium status |
| `src/stores/useSessionStore.ts` | Add post-session insight prompt |
| `src/App.tsx` | Add Insights route, premium gating |
| `src/components/Timer.tsx` | Post-session "Capture insight?" prompt |
| `src/components/Stats.tsx` | Settings gear icon |
| `src/lib/constants.ts` | Word cloud stopwords |
| `package.json` | New dependencies |

## New Files to Create

```
src/
  lib/
    purchases.ts          # RevenueCat integration
    transcription.ts      # iOS Speech Recognition wrapper
    wordcloud.ts          # Word extraction and frequency analysis

  stores/
    usePremiumStore.ts    # Premium status, subscription tracking
    useInsightsStore.ts   # Insights state, recording state

  components/
    Insights.tsx          # Insights archive screen
    InsightRecorder.tsx   # Voice recording modal
    InsightCard.tsx       # Individual insight in list
    WordCloud.tsx         # Word cloud visualization
    LockedOverlay.tsx     # Reusable blur + unlock CTA overlay
    Onboarding.tsx        # Intro flow (3 screens)
    Paywall.tsx           # Purchase screen (monthly + lifetime)
    Settings.tsx          # Settings screen

.github/
  workflows/
    ci.yml                # GitHub Actions CI/CD

capacitor.config.ts
ios/                      # Generated by Capacitor
ROADMAP.md               # This document (north star)
```

**New dependencies:**
```json
{
  "@sentry/capacitor": "^0.x.x",
  "@sentry/react": "^7.x.x",
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
  - My Apps -> Your App -> In-App Purchases
  - Auto-renewable subscription: "Premium Monthly", Product ID `premium_monthly`, $3.99/month
  - Non-consumable: "Premium Lifetime", Product ID `premium_lifetime`, $29.99
  - Submit for review (can take 24-48 hours)
  - VERIFY: Products show "Ready to Submit" or "Approved"

- [ ] **Configure products in RevenueCat**
  - Products -> Add Products
  - Match Product IDs exactly (case-sensitive)
  - Create Entitlement: "premium"
  - Create Offering: "default" with both products
  - VERIFY: Products show in RevenueCat dashboard with checkmarks

#### Phase 0 - TEST CHECKLIST
Before moving to Phase 1:
- [ ] Can log into Apple Developer account
- [ ] App ID exists
- [ ] App appears in App Store Connect
- [ ] Banking/tax shows "Active" status
- [ ] RevenueCat shows green checkmarks for both products
- [ ] IAP products approved in App Store Connect

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
  - Track: isPremium, subscriptionType, expirationDate
  - Actions: checkPremiumStatus, setPremiumStatus
  - Handle subscription expiration checks
  - VERIFY: Store compiles, isPremium defaults to false

#### Phase 1 - TEST CHECKLIST
Before moving to Phase 2:
- [ ] `npm run build` succeeds with no errors
- [ ] `npm run test` passes
- [ ] Timer still works (start/stop meditation)
- [ ] Existing sessions still appear in Stats
- [ ] **Sentry:** Test crash appears in Sentry dashboard
- [ ] **Schema:** Dexie versioning documented for future migrations
- [ ] usePremiumStore tracks premium status correctly

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
  - Premium status display
  - Links: Privacy Policy, Terms of Service
  - Restore Purchases button
  - Version number at bottom
  - VERIFY: Settings accessible from Stats screen

- [ ] **Add navigation to new screens**
  - Settings: gear icon on Stats screen -> Settings
  - Insights: fourth position after Calendar
  - Onboarding: shows before Timer on first launch
  - VERIFY: All navigation paths work

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
  - Handle both monthly and lifetime purchases
  - VERIFY: File compiles without errors

- [ ] **Create Paywall.tsx**
  - Two options: $3.99/month + $29.99 lifetime
  - 7-day free trial for monthly
  - Purchase buttons trigger RevenueCat
  - "Restore Purchases" link at bottom
  - VERIFY: Paywall renders correctly

- [ ] **Handle purchase completion**
  - On successful purchase: update usePremiumStore
  - Store premium status locally
  - Dismiss Paywall, unlock Insights
  - VERIFY: Purchase flow completes (use sandbox account)

#### Phase 2 - TEST CHECKLIST
Before moving to Phase 3:
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Timer still works
- [ ] Onboarding shows on first launch
- [ ] Can navigate: Timer -> Stats -> Calendar -> Insights
- [ ] Can navigate to Settings
- [ ] LockedOverlay renders with blur and CTA
- [ ] Paywall shows both pricing options
- [ ] "Restore Purchases" button is present
- [ ] **Sandbox testing:**
  - [ ] Can complete test subscription
  - [ ] Can complete lifetime purchase
  - [ ] After purchase, Insights unlocks
  - [ ] Restore Purchases works after reinstall

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

### Phase 4: Insight Journal
**REQUIRES: Phase 2 complete (premium gating), Phase 3 complete (Ghibli styling)**

> **CRITICAL: The Insight Journal is the premium feature driving conversion. If recording/playback feels broken, users won't pay. Build and validate before polishing.**

#### 4a: Voice Recording

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

#### 4b: Insight Archive

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

#### 4c: Word Cloud

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

#### 4d: Premium Gating

- [ ] **Implement locked overlay for free users**
  - Use LockedOverlay component
  - Show blurred preview of what their insights could look like
  - "Unlock Insights" CTA
  - VERIFY: Free users see blur + unlock prompt

- [ ] **Gate recording behind premium**
  - Post-session prompt only for premium users
  - Free users see "Upgrade to capture insights"
  - VERIFY: Free users cannot record

#### Phase 4 - TEST CHECKLIST
Before moving to Phase 5:
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] Timer still works
- [ ] **Recording:**
  - [ ] Permission prompt appears on first use
  - [ ] Can record voice note
  - [ ] Transcription appears after recording
  - [ ] Can preview and save/discard
- [ ] **Archive:**
  - [ ] Insights appear in list
  - [ ] Can play back audio
  - [ ] Search finds relevant insights
  - [ ] Filters work correctly
- [ ] **Word Cloud:**
  - [ ] Words sized by frequency
  - [ ] Tapping word filters list
- [ ] **Premium gating:**
  - [ ] Free users see blurred preview
  - [ ] Free users cannot record
  - [ ] Premium users have full access

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
  - Subscription terms ($3.99/month)
  - Lifetime purchase terms ($29.99)
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
|  PREMIUM                            |
|  +-----------------------------+    |
|  | Status: Premium (Lifetime)  |    |
|  | (or: Premium Monthly)       |    |
|  | (or: Free)                  |    |
|  +-----------------------------+    |
|                                     |
|  ABOUT                              |
|  +-----------------------------+    |
|  | Privacy Policy           -> |    |
|  | Terms of Service         -> |    |
|  | Version 1.0.0               |    |
|  +-----------------------------+    |
|                                     |
|  Restore Purchases                  |
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
- [ ] 5+ paid conversions (monthly or lifetime)
- [ ] Zero critical crashes
- [ ] At least one user records 10+ insights

**6-month success:**
- [ ] 10,000+ total downloads
- [ ] $1,000+ MRR
- [ ] 4.5+ star rating
- [ ] At least one user reaches 100 hours with 50+ insights
