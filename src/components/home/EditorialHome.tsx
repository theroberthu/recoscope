import type { getCategoriesWithRuns, getLatestPublicSnapshot, getAuditStats } from "@/lib/queries";
import { homeFeatureEvidence } from "@/lib/home-feature-evidence.mjs";
import { formatSnapshotDate } from "@/lib/discovery.mjs";
import { homeBrandLeaders } from "@/lib/home-brand-leaders.mjs";
import { snapshotVideo } from "@/lib/benchmark-video.mjs";
import { watchPath } from "@/lib/video-watch.mjs";
import marks from "@/lib/home-brand-marks.json";
import { TrackedLink } from "@/components/TrackedLink";
import { OrganizationSchema } from "@/components/seo/JsonLd";
import { CategoryFinder } from "@/components/tracker/CategoryFinder";
import { CategoryJump } from "./CategoryJump";
import { BrandScroller } from "./BrandScroller";
import { IntroTrailer } from "./IntroTrailer";
import { TypewriterPhrase } from "./TypewriterPhrase";
import "./editorial-home.css";

type Snapshot = NonNullable<Awaited<ReturnType<typeof getLatestPublicSnapshot>>>;
type Props = {
  categories: Awaited<ReturnType<typeof getCategoriesWithRuns>>;
  snapshot: Snapshot | null;
  stats: Awaited<ReturnType<typeof getAuditStats>> | null;
  today: string;
};

function Feature({ snapshot }: { snapshot: Snapshot }) {
  const video = snapshotVideo(snapshot.category.slug, snapshot.run);
  const href = `/tracker/${snapshot.category.slug}?period=${encodeURIComponent(snapshot.run.period_label)}`;
  const { brands: displayed, rankedComparisons } = homeFeatureEvidence(snapshot);
  const seconds = video?.duration.match(/^\d+/)?.[0];
  return <section className="editorial-feature" aria-labelledby="feature-title">
    <div className="editorial-feature-dateline">
      <span>Latest observation</span>
      <time dateTime={snapshot.run.run_date}>{formatSnapshotDate(snapshot.run.run_date)}</time>
    </div>
    <p className="editorial-category">{snapshot.category.name}</p>
    <h2 id="feature-title">{video?.title ?? snapshot.finding}</h2>
    <div className="editorial-comparison" role="group" aria-label="Mention frequency and comparative first places">
      <div className="editorial-comparison-labels" aria-hidden="true"><span>Mentioned in answers</span><span>Ranked first</span></div>
      {displayed.map(brand => {
        const mark = (marks as Record<string, { src: string }>)[brand.name];
        return <div className="editorial-brand-result" key={brand.name}>
          <div className="editorial-brand-name">
            {mark && <img src={mark.src} alt="" width={76} height={42} />}
            <h3>{brand.name}</h3>
          </div>
          <div className="editorial-brand-measures">
            <div className="editorial-mentions">
              <p><strong>{brand.mentionCount}</strong><span>/{snapshot.coverage.eligible}</span><span className="sr-only"> usable answers mention {brand.name}</span></p>
              <div className="editorial-bar" aria-hidden="true"><span style={{ width: `${snapshot.coverage.eligible ? brand.mentionCount / snapshot.coverage.eligible * 100 : 0}%` }} /></div>
            </div>
            <p className={`editorial-firsts ${(brand.firstPlaces ?? 0) > 0 ? "has-firsts" : ""}`}><strong>{brand.firstPlaces ?? "—"}</strong>{rankedComparisons > 0 && <span>/{rankedComparisons}</span>}<span className="sr-only"> ranked comparative answers put {brand.name} first</span></p>
          </div>
        </div>;
      })}
    </div>
    <p className="editorial-evidence-note">{snapshot.coverage.eligible} usable answers · {snapshot.coverage.models.length} AI assistants · {new Set(snapshot.responses.map(r => r.prompt_number)).size} prompt types</p>
    <p className="editorial-interpretation">First places use {rankedComparisons} explicitly ranked comparative answers. Captured answers, not product-quality ratings.</p>
    <div className="editorial-feature-actions">
      <TrackedLink href={href} event="benchmark_category_open" source="homepage-featured-brief" className="editorial-evidence-link">Inspect the answers <span aria-hidden="true">↗</span></TrackedLink>
      {video && <TrackedLink href={watchPath(video)} event="benchmark_category_open" source="homepage-featured-brief" className="editorial-watch-link"><span className="editorial-play" aria-hidden="true">▶</span> Watch the {seconds ? `${seconds}-second ` : ""}brief</TrackedLink>}
    </div>
  </section>;
}

export function EditorialHome({ categories, snapshot, stats, today }: Props) {
  return <div className="research-home">
    <OrganizationSchema />
    <div className="editorial-shell">
      <div className="editorial-edition"><span>Independent AI commerce research</span><span>By Robert Hu <span aria-hidden="true">/</span> Est. 2026</span></div>
      <section className="editorial-opening" aria-label="Research introduction and latest finding">
        <div className="editorial-introduction">
          <p className="editorial-kicker">The RecoScope notebook</p>
          <h1>A mention isn’t <br />a <TypewriterPhrase /></h1>
          <p className="editorial-deck">Which brands do AI assistants bring up—and which do they actually put first?</p>
          <p className="editorial-intro-description">We ask ChatGPT, Claude, Gemini and Perplexity the same shopper questions. Then we publish the answers, brand mentions and explicit rankings.</p>
          <div className="editorial-opening-actions">
            <TrackedLink href="#categories" event="benchmark_browse_click" source="homepage" className="editorial-primary">Explore the benchmarks <span aria-hidden="true">↘</span></TrackedLink>
            <a href="/methodology" className="editorial-quiet-link">How we measure</a>
          </div>
          <div className="editorial-byline"><span className="editorial-byline-mark" aria-hidden="true">RH</span><p>Research & analysis by <a href="/about">Robert Hu</a><span>20+ years in commerce</span></p></div>
          {categories.length > 0 && <CategoryJump categories={categories} />}
        </div>
        {snapshot ? <Feature snapshot={snapshot} /> : <section className="editorial-feature"><p className="editorial-kicker">The research archive</p><h2>Follow the answers.</h2><p>Explore dated shopper questions, captured responses and recorded rankings.</p><a href="/tracker" className="editorial-evidence-link">Browse the benchmarks ↗</a></section>}
      </section>
    </div>
    <BrandScroller leaders={homeBrandLeaders(categories)} today={today} />
    <section className="editorial-shell editorial-index" id="categories" aria-labelledby="research-index-heading">
      <div className="editorial-section-heading"><div><p className="editorial-kicker">The research index</p><h2 id="research-index-heading">Find your category.</h2></div><p>Dated evidence. Named brands. <br />The original answers, open to inspect.</p></div>
      {categories.length ? <CategoryFinder categories={categories} today={today} compact /> : <p>Category data is temporarily unavailable. <a href="/tracker">Browse reports →</a></p>}
    </section>
    <section className="editorial-shell editorial-method" aria-labelledby="editorial-method-heading">
      <div className="editorial-method-intro"><p className="editorial-kicker">A note on the method</p><h2 id="editorial-method-heading">The answer is<br />the evidence.</h2><p>A mention measures visibility. An explicit rank records a preference in that answer. Neither establishes product quality.</p><a href="/methodology" className="editorial-evidence-link">Read the measurement rules ↗</a></div>
      <div className="editorial-method-steps">
        {[['01', 'Ask a shopper’s question.', 'Discovery, budget and comparison prompts use a saved shopper profile. Each question starts a fresh conversation.'], ['02', 'Keep the context attached.', 'Every report shows when answers were collected, usable coverage and the prompts behind the findings.'], ['03', 'Show presence and preference.', 'Count each brand once per usable answer. Record numeric ranks only when the answer supplies them.']].map(([n, title, text]) => <div key={n}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}
      </div>
    </section>
    <section className="editorial-audit" aria-labelledby="editorial-audit-heading"><div className="editorial-shell"><div><p className="editorial-kicker">For brands & commerce teams</p><h2 id="editorial-audit-heading">Where does your brand<br />enter the answer?</h2><p>A dated view of your brand’s visibility, recorded ranks and competitors—with the captured answers behind it.</p></div><div><TrackedLink href="/audit?source=homepage" event="audit_cta_click" source="homepage" className="editorial-primary">Get a free audit <span aria-hidden="true">↗</span></TrackedLink><p className="editorial-audit-note">Free · No call · Emailed within 48 hours</p><a href="/demo">Inspect a sample report →</a></div></div></section>
    <section className="editorial-shell editorial-colophon" aria-labelledby="editorial-author-heading"><div><p className="editorial-kicker">Behind the research</p><h2 id="editorial-author-heading">Built to be inspected.</h2><p>I’m Robert Hu. I built RecoScope to make AI brand recommendations visible and open to scrutiny. Each report keeps the shopper question, captured answer and collection context together.</p><div className="editorial-author-links"><TrackedLink href="/platform" event="case_study_open" source="homepage">Read the case study ↗</TrackedLink><a href="/about">About Robert →</a></div></div><div className="editorial-colophon-aside"><IntroTrailer />{stats && <p className="editorial-corpus"><strong>{stats.categoriesActive}</strong> categories <span aria-hidden="true">/</span> <strong>{stats.runsCompleted}</strong> published snapshots<span>Archive totals. Each report has its own date and coverage.</span></p>}</div></section>
  </div>;
}
