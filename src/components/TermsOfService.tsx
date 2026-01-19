/**
 * TermsOfService - In-app terms of service page
 *
 * Required for App Store compliance.
 * Hour-based model, no subscriptions, Irish law jurisdiction.
 * Maximum liability disclaimers within legal bounds.
 */

import { useTapFeedback } from '../hooks/useTapFeedback'

interface TermsOfServiceProps {
  onBack: () => void
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
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

        <h1 className="font-serif text-2xl text-ink mb-2">Terms of Service</h1>
        <p className="text-sm text-ink/40 mb-8">Last updated: January 2026</p>

        {/* Content */}
        <div className="space-y-8 text-ink/70 text-sm leading-relaxed">
          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Agreement to Terms</h2>
            <p>
              By downloading, installing, or using Still Hours ("the App"), you agree to be bound by
              these Terms of Service ("Terms"). If you do not agree to these Terms, you must not use
              the App. These Terms constitute a legally binding agreement between you and Still
              Hours.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Description of Service</h2>
            <p>
              Still Hours is a meditation timing and tracking application. The App provides session
              timing, progress tracking, guided meditation templates, and optional community
              features for sharing insights and meditation guides. The App is designed to support
              personal meditation practice and is not a medical device or healthcare service.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Hour Packs — Our Payment Model</h2>
            <p className="mb-3">
              Still Hours uses a pay-as-you-go model. You purchase hour packs rather than
              subscriptions. Key terms:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <span className="font-medium">No subscriptions:</span> We do not offer recurring
                subscription payments. You purchase hour packs as one-time transactions.
              </li>
              <li>
                <span className="font-medium">Hours do not expire:</span> Purchased meditation hours
                remain available indefinitely. There is no time limit on using your purchased hours.
              </li>
              <li>
                <span className="font-medium">Consumption:</span> Hours are deducted based on actual
                meditation time recorded, rounded up to the nearest minute.
              </li>
              <li>
                <span className="font-medium">Deficit carry-forward:</span> If you meditate longer
                than your available hours, the deficit is deducted from your next purchase.
              </li>
              <li>
                <span className="font-medium">Lifetime option:</span> The Lifetime hour pack grants
                unlimited meditation hours that do not deplete. "Lifetime" refers to the operational
                lifetime of the Still Hours app and service, not the duration of your natural life.
              </li>
              <li>
                <span className="font-medium">Lifetime definition:</span> Lifetime access continues
                for as long as Still Hours remains operational and available. It is tied to your
                account and is non-transferable. It does not obligate us to maintain the App
                indefinitely, does not guarantee compatibility with future operating systems or
                devices, and may terminate if the App is discontinued. We make no representation
                that the App will be available forever.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Purchases and Refunds</h2>
            <p className="mb-3">
              All purchases are processed through Apple's App Store. By making a purchase, you agree
              to Apple's terms and conditions for in-app purchases.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <span className="font-medium">Non-refundable:</span> All hour pack purchases are
                final and non-refundable. Hour packs are consumable digital goods that begin to be
                consumed upon your first meditation session. By completing a purchase, you
                acknowledge and agree that you are not entitled to a refund for any reason,
                including but not limited to: change of mind, failure to use purchased hours,
                dissatisfaction with the App, or discontinuation of the App. This no-refund policy
                applies to the fullest extent permitted by applicable law.
              </li>
              <li>
                <span className="font-medium">Restore purchases:</span> You can restore previous
                purchases on a new device through the App's restore functionality. This does not
                entitle you to additional hours beyond what you originally purchased.
              </li>
              <li>
                <span className="font-medium">Pricing:</span> Prices are set in the App Store and
                may vary by region. We reserve the right to change pricing for future purchases at
                any time without notice.
              </li>
              <li>
                <span className="font-medium">No partial refunds:</span> We do not offer partial
                refunds for unused hours, regardless of the reason for non-use.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Account and Community Features</h2>
            <p className="mb-3">
              Account creation is optional. If you create an account to participate in community
              features:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>You are responsible for maintaining the security of your account</li>
              <li>You are responsible for all activity that occurs under your account</li>
              <li>Content you share (pearls, guided meditations) becomes visible to other users</li>
              <li>
                You retain ownership of your content but grant Still Hours a worldwide, perpetual,
                irrevocable, non-exclusive, royalty-free, transferable, and sublicensable license to
                use, reproduce, modify, adapt, translate, publish, publicly perform, publicly
                display, distribute, and create derivative works from your shared content. This
                license applies across any medium or platform (whether now known or later
                developed), and in any industry or domain, whether or not related to meditation or
                wellness. We may use your shared content for commercial, promotional, marketing, or
                advertising purposes. This license survives any termination of your account.
              </li>
              <li>
                <span className="font-medium">Content warranty:</span> By sharing content, you
                represent and warrant that you have all rights necessary to grant this license and
                that your shared content does not infringe any third party's intellectual property
                rights.
              </li>
              <li>You can delete your shared content or account at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">User Conduct</h2>
            <p className="mb-3">When using community features, you agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Share content that is harmful, offensive, defamatory, or illegal</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Attempt to manipulate voting or engagement metrics</li>
              <li>Use the platform to promote unrelated products, services, or spam</li>
              <li>Attempt to reverse engineer, decompile, or extract source code from the App</li>
              <li>Use the App for any unlawful purpose</li>
            </ul>
            <p className="mt-3">
              We reserve the right to remove content and suspend or terminate accounts that violate
              these guidelines, at our sole discretion and without prior notice.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Intellectual Property</h2>
            <p className="mb-3">
              The App, including its design, features, code, content, and branding (including the
              name "Still Hours"), is owned by Still Hours and protected by copyright, trademark,
              and other intellectual property laws. You may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Copy, modify, or distribute the App or its components</li>
              <li>Reverse engineer, decompile, or attempt to extract source code</li>
              <li>Use our trademarks, logos, or branding without written permission</li>
              <li>Create derivative works based on the App</li>
              <li>Remove or alter any copyright, trademark, or other proprietary notices</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Copyright Complaints</h2>
            <p className="mb-3">
              If you believe content on Still Hours infringes your copyright, please send a notice
              to{' '}
              <a
                href="mailto:legal@stillhours.app"
                className="text-ink underline hover:text-ink/80"
              >
                legal@stillhours.app
              </a>{' '}
              containing:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Your physical or electronic signature</li>
              <li>Identification of the copyrighted work claimed to be infringed</li>
              <li>Identification of the allegedly infringing material and its location</li>
              <li>Your contact information</li>
              <li>A statement that you have a good faith belief the use is unauthorised</li>
              <li>A statement under penalty of perjury that your notice is accurate</li>
            </ul>
            <p className="mt-3">
              We will respond to valid notices in accordance with applicable law and may remove or
              disable access to allegedly infringing content.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Health Disclaimer</h2>
            <p className="mb-3 font-medium text-ink/80">
              Still Hours is not a medical device, healthcare service, or substitute for
              professional medical advice.
            </p>
            <p className="mb-3">
              The App is designed to support general wellness and meditation practice. It is not
              intended to diagnose, treat, cure, or prevent any disease or medical condition. The
              content provided, including guided meditations and community insights, is for
              informational and personal development purposes only.
            </p>
            <p>
              If you have health concerns, mental health conditions, or are considering meditation
              as part of treatment for any condition, please consult a qualified healthcare
              provider. Meditation may not be suitable for everyone. Use your own judgement about
              what practices are appropriate for you.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">
              Disclaimer of Warranties — "As Is" Provision
            </h2>
            <p className="mb-3 font-medium text-ink/80">
              THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND.
            </p>
            <p className="mb-3">
              To the fullest extent permitted by applicable law, we expressly disclaim all
              warranties, whether express, implied, statutory, or otherwise, including but not
              limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Implied warranties of merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Accuracy, reliability, or completeness of content</li>
              <li>Uninterrupted or error-free operation</li>
              <li>That defects will be corrected</li>
              <li>That the App is free of viruses or harmful components</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">
              No Obligation for Continued Support
            </h2>
            <p className="mb-3">
              We reserve the right to modify, suspend, or discontinue the App (or any part thereof)
              at any time, with or without notice. We are under no obligation to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Provide ongoing maintenance, support, or updates to the App</li>
              <li>
                Develop or update the App for compatibility with future versions of iOS, iPadOS, or
                any operating system
              </li>
              <li>
                Maintain compatibility if Apple or any third party changes their platforms, APIs, or
                requirements
              </li>
              <li>Continue operating the App or any community features indefinitely</li>
            </ul>
            <p className="mt-3">
              You acknowledge that the App may cease to function if operating system updates or
              platform changes occur, and we shall have no liability for any resulting inability to
              use the App or access purchased content.
            </p>
            <p className="mt-3">
              If we discontinue the App, holders of Lifetime access will not be entitled to any
              refund, as you will have received the benefit of unlimited access for the period the
              App was operational. By purchasing Lifetime access, you accept this inherent
              uncertainty in the longevity of any digital service.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Limitation of Liability</h2>
            <p className="mb-3 font-medium text-ink/80">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
            </p>
            <p className="mb-3">
              In no event shall Still Hours, its directors, employees, partners, agents, suppliers,
              or affiliates be liable for any indirect, incidental, special, consequential,
              punitive, or exemplary damages, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Loss of profits, revenue, or data</li>
              <li>Loss of use or goodwill</li>
              <li>Business interruption</li>
              <li>Cost of substitute services</li>
              <li>Personal injury or property damage</li>
              <li>Any other intangible losses</li>
            </ul>
            <p className="mt-3">
              This applies whether based on warranty, contract, tort (including negligence), strict
              liability, or any other legal theory, and regardless of whether we have been advised
              of the possibility of such damages.
            </p>
            <p className="mt-3 font-medium text-ink/80">
              Our total aggregate liability for all claims arising from or relating to the App or
              these Terms shall not exceed the total amount you paid for hour packs in the twelve
              (12) months preceding the claim, or fifty euros (€50), whichever is greater.
            </p>
            <p className="mt-3">
              Some jurisdictions do not allow the exclusion or limitation of certain damages. If
              these laws apply to you, some or all of the above exclusions or limitations may not
              apply, and you may have additional rights.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Still Hours and its officers,
              directors, employees, and agents from and against any claims, liabilities, damages,
              losses, costs, or expenses (including reasonable legal fees) arising from your use of
              the App, your violation of these Terms, your violation of any rights of another party,
              or your shared content.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Termination</h2>
            <p className="mb-3">
              You may stop using the App at any time. We may terminate or suspend your access to the
              App immediately, without prior notice or liability, for any reason, including if you
              breach these Terms.
            </p>
            <p>
              Upon termination, your right to use the App ceases immediately. Provisions of these
              Terms which by their nature should survive termination shall survive, including
              ownership provisions, warranty disclaimers, indemnification, and limitations of
              liability.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be posted in the
              App with an updated "Last updated" date. Your continued use of the App after changes
              constitutes acceptance of the modified Terms. If you do not agree to the modified
              Terms, you must stop using the App.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid by a court of
              competent jurisdiction, that provision shall be limited or eliminated to the minimum
              extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between
              you and Still Hours regarding the App and supersede all prior agreements,
              understandings, and communications, whether written or oral.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Governing Law and Jurisdiction</h2>
            <p className="mb-3">
              These Terms and any dispute or claim arising out of or in connection with them
              (including non-contractual disputes or claims) shall be governed by and construed in
              accordance with the laws of the Republic of Ireland, without regard to its conflict of
              law provisions.
            </p>
            <p className="mb-3">
              Any disputes, claims, or proceedings arising from or relating to these Terms or the
              App shall be subject to the exclusive jurisdiction of the courts of the Republic of
              Ireland, and you irrevocably submit to the jurisdiction of such courts.
            </p>
            <p>
              The United Nations Convention on Contracts for the International Sale of Goods does
              not apply to these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-ink mb-3">Contact</h2>
            <p>
              For questions about these Terms, please contact us at{' '}
              <a
                href="mailto:legal@stillhours.app"
                className="text-ink underline hover:text-ink/80"
              >
                legal@stillhours.app
              </a>
            </p>
          </section>

          <section className="pt-4 border-t border-ink/10">
            <p className="text-xs text-ink/40 text-center">
              © 2026 Still Hours. All rights reserved.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
