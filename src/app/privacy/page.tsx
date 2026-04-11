import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How RecoScope collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-dot-grid">
      <article className="mx-auto max-w-3xl px-6 py-24">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/60">
          Legal
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
          Privacy Policy
        </h1>
        <p className="mt-4 text-[13px] text-white/30">Last updated: April 11, 2026</p>

        <div className="mt-12 space-y-10 text-[15px] leading-[1.8] text-[#c8ccd0]">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">Who we are</h2>
            <p>
              RecoScope (<a href="https://getrecoscope.com" className="text-cyan/60 underline underline-offset-2 hover:text-cyan">getrecoscope.com</a>) provides
              AI recommendation benchmark data for consumer brands. If you have questions about this policy,
              contact us at <a href="mailto:contact@getrecoscope.com" className="text-cyan/60 underline underline-offset-2 hover:text-cyan">contact@getrecoscope.com</a>.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">Data we collect</h2>
            <p className="mb-3">We collect the following data depending on how you use the site:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong className="text-white/80">Analytics data</strong> &mdash; page views, clicks, and scroll behavior via PostHog.
                Analytics cookies are only set after you accept cookies via our consent banner.
              </li>
              <li>
                <strong className="text-white/80">Newsletter signups</strong> &mdash; email address and optional name, brand name,
                and category interest submitted via the /subscribe form.
              </li>
              <li>
                <strong className="text-white/80">Audit requests</strong> &mdash; name, email, brand name, product URL, category,
                and notes submitted via the /audit form.
              </li>
              <li>
                <strong className="text-white/80">Category requests</strong> &mdash; email, category name, role, brand name,
                and reason submitted via the /request-category form.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">How we store your data</h2>
            <p>
              Form submissions are stored in a Neon PostgreSQL database. Email notifications are sent via Resend.
              The site is hosted on Vercel. Analytics data is processed by PostHog. We do not store payment
              information &mdash; no paid features are currently active.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">How we use your data</h2>
            <p>We use the data we collect to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Deliver benchmark reports and audit results to you</li>
              <li>Send email notifications you&rsquo;ve opted into</li>
              <li>Improve the site based on usage patterns</li>
              <li>Respond to your requests and inquiries</li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or share your personal data with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">Cookies</h2>
            <p>
              We use a cookie consent banner on first visit. If you accept, PostHog analytics cookies are set
              to track page views and interactions. If you decline, no analytics cookies are set and PostHog
              is never initialized. Your consent preference is stored in a <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[13px]">recoscope_consent</code> cookie
              that lasts one year.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">Third-party services</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li><strong className="text-white/80">PostHog</strong> &mdash; analytics (only with consent)</li>
              <li><strong className="text-white/80">Resend</strong> &mdash; email delivery</li>
              <li><strong className="text-white/80">Vercel</strong> &mdash; hosting and deployment</li>
              <li><strong className="text-white/80">Neon</strong> &mdash; database</li>
              <li><strong className="text-white/80">Google Analytics</strong> &mdash; pageview tracking</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">Your rights</h2>
            <p className="mb-3">
              <strong className="text-white/80">GDPR (EU/UK residents):</strong> We obtain consent before setting analytics cookies.
              You can decline cookies at any time. You have the right to access, correct, or delete your personal data.
            </p>
            <p>
              <strong className="text-white/80">CCPA (California residents):</strong> You have the right to know what personal data we collect,
              request deletion, and opt out of any sale of data (we don&rsquo;t sell data).
            </p>
            <p className="mt-3">
              To exercise any of these rights, email{" "}
              <a href="mailto:contact@getrecoscope.com" className="text-cyan/60 underline underline-offset-2 hover:text-cyan">contact@getrecoscope.com</a>.
              We respond to all requests within 30 days.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">Changes to this policy</h2>
            <p>
              We may update this policy from time to time. Changes will be posted on this page with an updated date.
              Continued use of the site after changes constitutes acceptance.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
