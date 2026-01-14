# External Integrations

**Analysis Date:** 2026-01-14

## APIs & External Services

**Backend-as-a-Service:**

- Supabase - User authentication, database, and storage
  - SDK/Client: `@supabase/supabase-js` v2.89 (`src/lib/supabase.ts`)
  - Auth: Supabase anon key via Vite environment variables
  - Features used: Auth, Database (Pearls, community content), Storage

**Geolocation (Theme System):**

- ip-api.com - IP-based geolocation for solar position
  - Integration: Fetch API with 5s timeout (`src/lib/solarPosition.ts:40`)
  - Fallback: Timezone-based estimation if API fails
  - Caching: localStorage (`solar-theme-location` key)

## Data Storage

**Local Database:**

- IndexedDB via Dexie - All user data stored locally
  - Schema: `src/lib/db/schema.ts`
  - Tables: sessions, insights, planned sessions, settings, preferences, courses, etc.
  - Client: Dexie ORM with React hooks

**Cloud Database:**

- Supabase PostgreSQL - Community content only
  - Pearls (shared insights)
  - Session templates
  - User profiles (for community features)

**Caching:**

- localStorage - Theme location cache
- Service Worker cache - PWA assets via Workbox

## Authentication & Identity

**Auth Provider:**

- Supabase Auth (`src/stores/useAuthStore.ts`)
  - Implementation: Supabase client SDK
  - Token management: Handled by Supabase SDK
  - Session: Persisted by Supabase

**OAuth Integrations:**

- Not currently configured (email/password only via Supabase)

## Monitoring & Observability

**Error Tracking:**

- Custom ErrorBoundary (`src/components/ErrorBoundary.tsx`)
- Console logging (`src/lib/logger.ts`)
- No external error tracking service (Sentry, etc.)

**Analytics:**

- Custom analytics module (`src/lib/analytics.ts`)
- No external analytics service detected

**Logs:**

- Browser console only
- Custom logger utility

## CI/CD & Deployment

**Hosting:**

- Vercel - Static site hosting
  - Deployment: Automatic on main branch push
  - Environment vars: Configured in Vercel dashboard

**CI Pipeline:**

- Not configured (no `.github/workflows` detected)
- Local checks via Husky pre-commit hooks

## Environment Configuration

**Development:**

- Required env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Secrets location: Local `.env` file (gitignored)
- IP geolocation works with live API

**Production:**

- Secrets management: Vercel environment variables
- PWA: Service worker auto-updates (`skipWaiting: true`)

## Webhooks & Callbacks

**Incoming:**

- None detected

**Outgoing:**

- None detected

---

_Integration audit: 2026-01-14_
_Update when adding/removing external services_
