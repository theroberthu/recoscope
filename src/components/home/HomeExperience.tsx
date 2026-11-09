import type { getCategoriesWithRuns, getLatestPublicSnapshot, getAuditStats } from "@/lib/queries";
import { CategoryFinder } from "@/components/tracker/CategoryFinder";
import { HomeFinding } from "./HomeFinding";
import { CategoryJump } from "./CategoryJump";
import { BrandScroller } from "./BrandScroller";
import { homeBrandLeaders } from "@/lib/home-brand-leaders.mjs";
import { TrackedLink } from "@/components/TrackedLink";
import { OrganizationSchema } from "@/components/seo/JsonLd";

type HomeExperienceProps = {
  categories: Awaited<ReturnType<typeof getCategoriesWithRuns>>;
  snapshot: Awaited<ReturnType<typeof getLatestPublicSnapshot>>;
  stats: Awaited<ReturnType<typeof getAuditStats>> | null;
  today: string;
};
export function HomeExperience({ categories, snapshot, stats, today }: HomeExperienceProps) {
  return (
    <div>
      <OrganizationSchema />
      <div className="home-opening">
        <section className="home-hero page-shell">
          <div className="home-hero-copy">
            <div className="home-hero-intro">
              <p className="eyebrow">Independent AI commerce research</p>
              <h1>Does AI recommend your brand?</h1>
              <p className="hero-description">
                See which brands ChatGPT, Claude, Gemini and Perplexity mention—and rank first.
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
                  href="#categories"
                  event="benchmark_browse_click"
                  source="homepage"
                  className="hero-browse-link"
                >
                  Browse reports →
                </TrackedLink>
              </div>
              <p className="hero-reassurance">
                Free · No call · Emailed within 48 hours
              </p>
              {categories.length > 0 && <CategoryJump categories={categories} />}
            </div>
            <p className="founder-byline">Independent research by <a href="/about">Robert Hu</a> · 20+ years in commerce</p>
          </div>
          <div className="home-snapshot-shell">
            {snapshot ? (
              <HomeFinding snapshot={snapshot} />
            ) : (
              <aside className="snapshot-preview">
                <p className="eyebrow">Inspect the evidence</p>
                <h2 className="mt-4 text-2xl font-semibold">
                  Same shopper questions. Four AI services.
                </h2>
                <p className="mt-4">
                  Browse dated reports with usable-answer coverage, recorded
                  ranks, and collection notes.
                </p>
                <a href="/tracker" className="text-link">
                  Browse published benchmarks →
                </a>
              </aside>
            )}
          </div>
        </section>
        <BrandScroller
          leaders={homeBrandLeaders(categories)}
          today={today}
        />
      </div>
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
            Choose a report to explore the brands, prompts and captured answers.
          </p>
        </div>
        {categories.length ? (
          <CategoryFinder
            categories={categories}
            today={today}
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
            <p>Get a clear picture of where your brand appears—and which competitors AI puts ahead.</p>
            <ul className="audit-deliverables">
              <li><strong>Your competitive view</strong><span>A dated comparison of brand mentions and recorded ranks.</span></li>
              <li><strong>The evidence behind it</strong><span>Shopper prompts, captured answers and collection coverage.</span></li>
              <li><strong>Questions to test next</strong><span>Product-information questions worth investigating.</span></li>
            </ul>
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
