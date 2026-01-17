/**
 * PrivacyPolicy - In-app privacy policy page
 *
 * Required for App Store compliance.
 * Strong privacy-first stance: no tracking, no analytics, no data selling.
 */

import { useTapFeedback } from '../hooks/useTapFeedback'

interface PrivacyPolicyProps {
  onBack: () => void
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  const haptic = useTapFeedback()

  return (
    <div className="h-full bg-cream overflow-y-auto">
      <div className="px-6 py-8 max-w-lg mx-auto pb-24">
        {/* Header */}
        <button
          onClick={() => {
            haptic.light()
            onBack()
          }}
          className="flex items-center text-sm text-ink/40 mb-10 hover:text-ink/60 transition-colors active:scale-[0.98] touch-manipulation"
          aria-label="Go back to settings"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Settings
        </button>

        <h1 className="font-serif text-2xl text-ink mb-2">Privacy Policy</h1>
        <p className="text-sm text-ink/40 mb-8">Last updated: January 2026</p>

        {/* Content */}
        <div className="space-y-8 text-ink/70 text-sm leading-relaxed">
          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Our Commitment to Privacy</h2>
            <p className="mb-3">
              Still Hours is built on a simple principle: your meditation practice is personal, and
              your data should remain yours.
            </p>
            <p className="mb-3 font-medium text-ink/80">
              We do not sell your data. We do not share your information with advertisers. We do not
              build marketing profiles about you.
            </p>
            <p>
              Unlike many wellness apps that collect extensive personal data, track your location,
              and share information with advertising networks, Still Hours takes a different
              approach. We use limited analytics solely to improve the App, not to monetise your
              data.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">What We Do Not Collect</h2>
            <p className="mb-3">To be explicit, we do not collect:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Your location or GPS data</li>
              <li>Your contacts or address book</li>
              <li>Your health data beyond what you explicitly enter</li>
              <li>Device identifiers for advertising purposes</li>
              <li>Demographic information from third-party databases</li>
              <li>Your political, religious, or personal beliefs</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Data Stored on Your Device</h2>
            <p className="mb-3">
              The following information is stored locally on your device and never transmitted to
              our servers:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Your meditation sessions (dates, times, durations)</li>
              <li>Personal notes and insights you record</li>
              <li>Your preferences and settings</li>
              <li>Your hour bank balance and purchase history</li>
              <li>Saved content and favourites</li>
            </ul>
            <p className="mt-3">
              This data remains on your device. You can export or delete it at any time through the
              Settings menu. If you delete the app, this data is removed with it.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Optional Account Features</h2>
            <p className="mb-3">
              If you choose to create an account to participate in community features, we collect
              only:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <span className="font-medium">Email address</span> — For authentication only. We
                will never send marketing emails.
              </li>
            </ul>
            <p className="mt-3">
              Account creation is entirely optional. You can use the full meditation timing and
              tracking features of Still Hours without ever creating an account.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Community Content</h2>
            <p className="mb-3">
              If you choose to share pearls (insights) or guided meditations with the community:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Your shared content is stored on our servers and visible to other users</li>
              <li>Content is associated with your account but not your email address publicly</li>
              <li>You can delete your shared content at any time</li>
              <li>Deleting your account removes all your shared content</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Purchases</h2>
            <p className="mb-3">
              Hour pack purchases are processed entirely through Apple's App Store. We receive
              confirmation that a purchase was made, but we do not have access to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Your payment card details</li>
              <li>Your billing address</li>
              <li>Your Apple ID</li>
              <li>Any financial information</li>
            </ul>
            <p className="mt-3">
              Purchase records (which hour packs you own) are stored locally on your device and
              synchronised through Apple's systems for restore functionality.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Analytics</h2>
            <p className="mb-3">
              We use analytics services to understand how the App is used and to improve the service
              we provide. This may include:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <span className="font-medium">Google Analytics</span> — To understand general usage
                patterns, screen views, and App performance.
              </li>
              <li>
                <span className="font-medium">Crash reporting</span> — To identify and fix technical
                issues.
              </li>
            </ul>
            <p className="mt-3">
              Analytics data is collected in aggregate form and is used solely to improve the App.
              We do not use this data to identify individual users, build marketing profiles, or
              serve advertisements. You may be able to opt out of certain analytics through your
              device settings.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Third-Party Services</h2>
            <p className="mb-3">We use the following third-party services:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <span className="font-medium">Apple App Store</span> — Purchase processing. Subject
                to Apple's privacy policy.
              </li>
              <li>
                <span className="font-medium">RevenueCat</span> — Purchase validation and
                restoration. Receives only transaction receipts, not personal data.
              </li>
              <li>
                <span className="font-medium">Google Analytics</span> — Usage analytics to improve
                the App. Subject to Google's privacy policy.
              </li>
              <li>
                <span className="font-medium">Supabase</span> — Optional account authentication and
                community content storage. Only used if you create an account.
              </li>
            </ul>
            <p className="mt-3">
              We do not use Facebook SDK, advertising networks, or any services that would share
              your data with advertisers.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Export all your data through the Settings menu</li>
              <li>Delete all local data by removing the app</li>
              <li>Delete your account and all associated data at any time</li>
              <li>Use the app without creating an account</li>
              <li>Contact us about your data at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Children's Privacy</h2>
            <p>
              Still Hours is not directed at children under 13. We do not knowingly collect any
              personal information from children under 13. The app collects minimal data from all
              users regardless of age.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Any changes will be posted in the
              app with an updated "Last updated" date. We will not introduce tracking or data
              collection practices that contradict the spirit of this policy.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Governing Law</h2>
            <p>
              This privacy policy is governed by the laws of the Republic of Ireland and the
              applicable data protection regulations of the European Union, including the General
              Data Protection Regulation (GDPR).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Contact Us</h2>
            <p>
              If you have questions about this privacy policy or your data, please contact us at{' '}
              <a
                href="mailto:privacy@stillhours.app"
                className="text-ink underline hover:text-ink/80"
              >
                privacy@stillhours.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
