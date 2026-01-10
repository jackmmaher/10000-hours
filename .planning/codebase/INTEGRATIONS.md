# External Integrations

**Analysis Date:** 2026-01-10

## APIs & External Services

**Backend/Database:**
- Supabase - Primary backend for auth, cloud sync, community features
  - SDK/Client: @supabase/supabase-js v2.89 (`src/lib/supabase.ts`)
  - Auth: Supabase Auth with anonymous key
  - Tables: pearls, session_templates (community content)

**Voice/Transcription:**
- Browser Web Speech API - Voice recording and transcription (`src/services/voiceRecording.ts`, `src/services/transcription.ts`)

## Data Storage

**Local Database:**
- IndexedDB via Dexie - Primary local data store (`src/lib/db.ts`)
  - Tables: sessions, insights, plannedSessions, courseProgress, savedTemplates, pearlDrafts, userPreferences, appState, achievements
  - Version: 8 (latest schema with all features)

**Cloud Storage:**
- Supabase - Optional cloud sync for authenticated users
  - Pearls (shared insights)
  - Session templates (community meditations)
  - User course progress (synced)

**Offline Caching:**
- Workbox service worker - PWA caching for offline use (`vite.config.ts`)
  - Caches: JS, CSS, HTML, icons, fonts
  - Strategy: skipWaiting, clientsClaim for immediate updates

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Optional authentication (`src/lib/supabase.ts`, `src/stores/useAuthStore.ts`)
  - Features: Anonymous usage allowed, optional account creation
  - Token storage: Handled by Supabase client
  - Session management: Automatic refresh by Supabase SDK

**OAuth Integrations:**
- None detected (likely configured in Supabase dashboard)

## Monitoring & Observability

**Analytics:**
- Custom analytics module (`src/lib/analytics.ts`)
  - Details: Likely sends to Supabase or external analytics

**Logs:**
- Console logging only (browser console)

## CI/CD & Deployment

**Hosting:**
- Static hosting (PWA) - Likely Vercel or Netlify
  - Deployment: Build with `npm run build`

**CI Pipeline:**
- Not detected (no .github/workflows folder in src)

## Environment Configuration

**Development:**
- Required env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- Secrets location: `.env` or `.env.local` (gitignored)
- Local storage: IndexedDB (no external services required)

**Production:**
- Secrets management: Environment variables at hosting provider
- Offline-first: App works without Supabase connection

## Webhooks & Callbacks

**Incoming:**
- None detected (purely client-side PWA)

**Outgoing:**
- None detected

---

*Integration audit: 2026-01-10*
*Update when adding/removing external services*
