import type { Metadata } from "next";
import {
  getCategoriesWithRuns,
  getLatestPublicSnapshot,
  getAuditStats,
} from "@/lib/queries";
import { todayCentral } from "@/lib/discovery.mjs";
import { OrganizationSchema } from "@/components/seo/JsonLd";
import { CategoryFinder } from "@/components/tracker/CategoryFinder";
import { SnapshotPreview } from "@/components/home/SnapshotPreview";
import { BrandScroller } from "@/components/home/BrandScroller";
import { homeBrandLeaders } from "@/lib/home-brand-leaders.mjs";
import { TrackedLink } from "@/components/TrackedLink";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export const revalidate = 300;
export default async function HomePage() {
  const [cats, latest, corpus] = await Promise.allSettled([
    getCategoriesWithRuns(),
    getLatestPublicSnapshot(),
    getAuditStats(),
  ]);
  const categories = cats.status === "fulfilled" ? cats.value : [];
  const snapshot = latest.status === "fulfilled" ? latest.value : null;
  const stats = corpus.status === "fulfilled" ? corpus.value : null;
  return (
    <div>
      <OrganizationSchema />
      <section className="home-hero page-shell">
        <div>
          <p className="eyebrow">Independent AI commerce research</p>
          <h1>Does AI recommend your brand?</h1>
          <p className="hero-description">
            See which brands ChatGPT, Claude, Gemini, and Perplexity mention,
            how they rank them, and the shopper questions behind each answer.
          </p>
          <div className="hero-actions">
            <TrackedLink
              href="/audit?source=homepage"
              event="audit_cta_click"
              source="homepage"
              className="button-primary"
            >
              Get a free audit
            </TrackedLink>
            <TrackedLink
              href="/tracker"
              event="benchmark_browse_click"
              source="homepage"
              className="button-secondary"
            >
              Explore benchmarks
            </TrackedLink>
          </div>
          <p className="hero-reassurance">
            Free audit · No call required · Emailed within 48 hours
          </p>
          <p className="founder-byline">
            Built and operated by <a href="/about">Robert Hu</a>, with 20+ years
            in commerce. <a href="/platform">See the project case study →</a>
          </p>
        </div>
        {snapshot ? (
          <SnapshotPreview snapshot={snapshot} />
        ) : (
          <aside className="snapshot-preview">
            <p className="eyebrow">Inspect the evidence</p>
            <h2 className="mt-4 text-2xl font-semibold">
              Same shopper questions. Four AI services.
            </h2>
            <p className="mt-4">
              Browse dated reports with usable-answer coverage, recorded ranks,
              and collection notes.
            </p>
            <a href="/tracker" className="text-link">
              Browse published benchmarks →
            </a>
          </aside>
        )}
      </section>
      <BrandScroller
        leaders={homeBrandLeaders(categories)}
        today={todayCentral()}
      />
      {stats && stats.runsCompleted > 0 && (
        <section
          className="page-shell corpus-strip"
          aria-label="Published research corpus"
        >
          <div>
            <strong>{stats.brandsTracked.toLocaleString()}</strong>
            <span>brands recorded</span>
          </div>
          <div>
            <strong>{stats.categoriesActive}</strong>
            <span>published categories</span>
          </div>
          <div>
            <strong>{stats.runsCompleted}</strong>
            <span>published snapshots</span>
          </div>
          <p>
            Research corpus totals.
            <br />
            Each report states its own date and coverage.
          </p>
        </section>
      )}
      <section className="page-shell section-space" id="categories">
        <div className="section-intro">
          <div>
            <p className="eyebrow">Explore the evidence</p>
            <h2>Start with your category.</h2>
          </div>
          <p>
            Recent publications appear first. Each card shows its finding,
            collection date, and usable-answer coverage.
          </p>
        </div>
        {categories.length ? (
          <CategoryFinder
            categories={categories}
            today={todayCentral()}
            compact
          />
        ) : (
          <p className="empty-state">
            Category data is temporarily unavailable.{" "}
            <a href="/tracker" className="text-link">
              Open the benchmark directory →
            </a>
          </p>
        )}
      </section>
      <section className="section-band">
        <div className="page-shell section-space">
          <p className="eyebrow">How it works</p>
          <h2 className="section-title">
            From shopper question to inspectable evidence.
          </h2>
          <div className="steps-grid">
            {[
              [
                "01",
                "Ask consistent questions",
                "Three prompt types cover broad discovery, a budget constraint, and a brand comparison. Repeat collections reuse the saved persona and wording.",
              ],
              [
                "02",
                "Keep the answer and its context",
                "Responses are recorded from consumer interfaces, with collection failures, model settings, and usable-answer coverage kept explicit.",
              ],
              [
                "03",
                "Separate presence from preference",
                "A brand counts once per usable answer. Only explicitly supported positions become numeric ranks; alternatives and criticism remain visible.",
              ],
            ].map(([n, title, body]) => (
              <div key={n}>
                <p className="eyebrow">{n}</p>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
          <a href="/methodology" className="text-link">
            Read the measurement rules →
          </a>
        </div>
      </section>
      <section className="page-shell section-space">
        <div className="audit-callout">
          <div>
            <p className="eyebrow">For brands and commerce teams</p>
            <h2>Find out where your brand enters the answer.</h2>
            <p>
              Get a dated comparison of your brand and competitors, the prompts
              that surfaced them, and questions worth testing next. Results
              describe the captured answers; they do not guarantee future
              recommendations or sales.
            </p>
            <a href="/demo" className="text-link">
              Inspect a sample report →
            </a>
          </div>
          <div>
            <TrackedLink
              href="/audit?source=homepage"
              event="audit_cta_click"
              source="homepage-lower"
              className="button-primary"
            >
              Request your free audit
            </TrackedLink>
            <p className="mt-3 text-sm text-[var(--secondary)]">
              No call required. Delivered by email within 48 hours.
            </p>
          </div>
        </div>
      </section>
      <section className="page-shell pb-16">
        <div className="founder-panel">
          <div>
            <p className="eyebrow">The person behind the benchmark</p>
            <h2>A working project you can inspect.</h2>
            <p>
              I’m Robert Hu. RecoScope shows how I turn a commerce question into
              a measurement system, operate it, and make the findings public.
              I’m exploring AI commerce, strategy, and partnerships roles.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <TrackedLink
              href="/platform"
              event="case_study_open"
              source="homepage"
              className="button-secondary"
            >
              Read the case study
            </TrackedLink>
            <a href="/about" className="text-link">
              About Robert →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
