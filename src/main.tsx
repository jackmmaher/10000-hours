import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { db } from './lib/db'

// Dev helpers - expose testing functions in development
if (import.meta.env.DEV) {
  const devHelpers = {
    /**
     * Generate fake session data for a "Day 33 FREE user"
     * Creates ~45 hours of meditation over 33 days with realistic patterns
     */
    async simulateFreeUserDay33() {
      // Clear existing sessions
      await db.sessions.clear()

      const now = Date.now()
      const sessions = []

      // Generate sessions over 33 days (some days skipped for realism)
      for (let daysAgo = 33; daysAgo >= 0; daysAgo--) {
        // Skip some days randomly (about 20% skip rate)
        if (Math.random() < 0.2 && daysAgo > 0 && daysAgo < 30) continue

        // Random session duration: 15-60 minutes
        const durationMinutes = 15 + Math.floor(Math.random() * 45)
        const durationSeconds = durationMinutes * 60

        // Random time of day (morning bias)
        const hourOfDay = Math.random() < 0.7
          ? 6 + Math.floor(Math.random() * 4)  // 6am-10am (70%)
          : 18 + Math.floor(Math.random() * 4) // 6pm-10pm (30%)

        const sessionDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000)
        sessionDate.setHours(hourOfDay, Math.floor(Math.random() * 60), 0, 0)

        const startTime = sessionDate.getTime()
        const endTime = startTime + durationSeconds * 1000

        sessions.push({
          uuid: crypto.randomUUID(),
          startTime,
          endTime,
          durationSeconds
        })
      }

      // Add all sessions
      await db.sessions.bulkAdd(sessions)

      // Calculate total hours
      const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0)
      const totalHours = (totalSeconds / 3600).toFixed(1)

      // Set profile to FREE user (trial expired on day 31)
      const firstSessionDate = now - 33 * 24 * 60 * 60 * 1000
      const trialEndDate = now - 2 * 24 * 60 * 60 * 1000 // Trial ended 2 days ago

      await db.profile.update(1, {
        firstSessionDate,
        trialExpired: true,
        trialEndDate,
        tier: 'free',
        premiumExpiryDate: undefined
      })

      // Skip onboarding
      localStorage.setItem('10k-onboarding-seen', 'true')

      console.log(`Created ${sessions.length} sessions totaling ${totalHours} hours over 33 days`)
      console.log('User is now in FREE tier (trial expired)')
      console.log('Refreshing...')

      location.reload()
    },

    /**
     * Same data but as a PREMIUM user (to compare the difference)
     */
    async simulatePremiumUserDay33() {
      // First create the same data
      await db.sessions.clear()

      const now = Date.now()
      const sessions = []

      for (let daysAgo = 33; daysAgo >= 0; daysAgo--) {
        if (Math.random() < 0.2 && daysAgo > 0 && daysAgo < 30) continue

        const durationMinutes = 15 + Math.floor(Math.random() * 45)
        const durationSeconds = durationMinutes * 60

        const hourOfDay = Math.random() < 0.7
          ? 6 + Math.floor(Math.random() * 4)
          : 18 + Math.floor(Math.random() * 4)

        const sessionDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000)
        sessionDate.setHours(hourOfDay, Math.floor(Math.random() * 60), 0, 0)

        const startTime = sessionDate.getTime()
        const endTime = startTime + durationSeconds * 1000

        sessions.push({
          uuid: crypto.randomUUID(),
          startTime,
          endTime,
          durationSeconds
        })
      }

      await db.sessions.bulkAdd(sessions)

      const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0)
      const totalHours = (totalSeconds / 3600).toFixed(1)

      // Set as PREMIUM user
      const firstSessionDate = now - 33 * 24 * 60 * 60 * 1000
      const oneYearFromNow = now + 365 * 24 * 60 * 60 * 1000

      await db.profile.update(1, {
        firstSessionDate,
        trialExpired: false,
        tier: 'premium',
        premiumExpiryDate: oneYearFromNow
      })

      localStorage.setItem('10k-onboarding-seen', 'true')

      console.log(`Created ${sessions.length} sessions totaling ${totalHours} hours over 33 days`)
      console.log('User is PREMIUM - full experience')
      console.log('Refreshing...')

      location.reload()
    },

    // Simulate Day 31 (trigger paywall)
    async simulateDay31() {
      const thirtyTwoDaysAgo = Date.now() - (32 * 24 * 60 * 60 * 1000)
      await db.profile.update(1, { firstSessionDate: thirtyTwoDaysAgo, trialExpired: false })
      console.log('Set firstSessionDate to 32 days ago. Refresh the page!')
      location.reload()
    },

    // Reset to fresh state (new user)
    async resetToNewUser() {
      await db.sessions.clear()
      await db.profile.update(1, {
        firstSessionDate: undefined,
        trialExpired: false,
        tier: 'free',
        premiumExpiryDate: undefined
      })
      localStorage.removeItem('10k-onboarding-seen')
      console.log('Reset to new user. Refresh the page!')
      location.reload()
    },

    // Simulate premium purchase
    async simulatePremium() {
      const oneYearFromNow = Date.now() + (365 * 24 * 60 * 60 * 1000)
      await db.profile.update(1, { tier: 'premium', premiumExpiryDate: oneYearFromNow })
      console.log('Premium activated! Refresh the page!')
      location.reload()
    },

    // View current profile
    async showProfile() {
      const profile = await db.profile.get(1)
      console.table(profile)
      return profile
    },

    // View all sessions
    async showSessions() {
      const sessions = await db.sessions.toArray()
      console.table(sessions)
      return sessions
    },

    db // Expose raw db for advanced debugging
  }

  // @ts-expect-error - dev helpers
  window.dev = devHelpers
  console.log('%c🧘 Dev Helpers Available:', 'font-weight: bold; font-size: 14px;')
  console.log(`
  dev.simulateFreeUserDay33()  - See the degraded FREE experience (the ball game!)
  dev.simulatePremiumUserDay33() - Same data, but PREMIUM (compare the difference)
  dev.simulateDay31()          - Trigger the paywall moment
  dev.resetToNewUser()         - Fresh start, see onboarding
  dev.simulatePremium()        - Upgrade current user to premium
  dev.showProfile()            - View current profile data
  dev.showSessions()           - View all sessions
  `)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
