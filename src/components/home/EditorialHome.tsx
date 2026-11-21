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
import { AuditDeliverables, AuditSteps } from "@/components/AuditJourney";
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
      <span>Real public example</span>
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
    <p className="editorial-interpretation">Read this as two separate measures: visibility in answers and preference in ranked comparisons. First places use {rankedComparisons} explicitly ranked answers; unranked answers have no recorded first choice.</p>
    <div className="editorial-feature-actions">
      <TrackedLink href={href} event="benchmark_category_open" source="homepage-featured-brief" className="editorial-evidence-link">Explore this benchmark <span aria-hidden="true">↗</span></TrackedLink>
      {video && <TrackedLink href={watchPath(video)} event="benchmark_category_open" source="homepage-featured-brief" className="editorial-watch-link"><span className="editorial-play" aria-hidden="true">▶</span> Watch the {seconds ? `${seconds}-second ` : ""}brief</TrackedLink>}
    </div>
  </section>;
}

export function EditorialHome({ categories, snapshot, stats, today }: Props) {
  return <div className="research-home">
    <OrganizationSchema />
    <div className="editorial-shell">
      <div className="editorial-edition"><span>AI visibility research for commerce teams</span><span>Independent research by Robert Hu</span></div>
      <section className="journey-opening" aria-labelledby="journey-heading">
        <div className="journey-introduction">
          <p className="editorial-kicker">For brand owners & ecommerce marketers</p>
          <h1 id="journey-heading">Is AI recommending<br />{" "}your competitors?</h1>
          <p className="journey-deck">See how your brand compares in AI shopping recommendations—and what to investigate next.</p>
          <div className="journey-actions">
            <TrackedLink href="/audit?source=homepage" event="audit_cta_click" source="homepage" className="button-primary">Get my free brand audit <span aria-hidden="true">↗</span></TrackedLink>
            <TrackedLink href="#example" event="benchmark_browse_click" source="homepage-example" className="editorial-quiet-link">See an example <span aria-hidden="true">↓</span></TrackedLink>
          </div>
          <p className="journey-promise">Free · No call required · Emailed within 48 hours</p>
          <p className="journey-scope">Across ChatGPT, Claude, Gemini and Perplexity. Dated findings, with the original answers attached.</p>
        </div>
        <aside className="journey-receipt" aria-labelledby="audit-delivery-heading">
          <p className="editorial-kicker">Your free audit</p>
          <h2 id="audit-delivery-heading">What lands in your inbox.</h2>
          <AuditDeliverables />
          <p className="journey-receipt-note">Prepared for your brand. Research you can inspect, with clear limits on what each finding establishes.</p>
        </aside>
      </section>
      <section className="journey-process" aria-label="From your brand to your report"><AuditSteps /></section>
      <section className="journey-example" id="example" aria-labelledby="example-heading">
        <div className="journey-example-intro">
          <p className="editorial-kicker">See what the evidence tells you</p>
          <h2 id="example-heading">A mention isn’t<br />{" "}a <TypewriterPhrase /></h2>
          <p>A brand can appear often and still lose the first recommendation. Your audit keeps those two signals separate.</p>
          <p className="journey-example-context">This example uses a published {snapshot?.category.name ?? "category"} benchmark. It illustrates the measures; it is not an assessment of your brand.</p>
          <TrackedLink href="/demo" event="benchmark_browse_click" source="homepage-example" className="editorial-evidence-link">Walk through the example <span aria-hidden="true">↗</span></TrackedLink>
        </div>
        {snapshot ? <Feature snapshot={snapshot} /> : <section className="editorial-feature"><p className="editorial-kicker">The research archive</p><h2>Follow the answers.</h2><a href="/tracker" className="editorial-evidence-link">Browse the benchmarks ↗</a></section>}
      </section>
    </div>
    <BrandScroller leaders={homeBrandLeaders(categories)} today={today} />
    <section className="editorial-shell editorial-index" id="categories" aria-labelledby="research-index-heading">
      <div className="editorial-section-heading"><div><p className="editorial-kicker">Explore your market</p><h2 id="research-index-heading">Browse the public benchmarks.</h2></div><p>Choose a category to see published examples. <br />For your own brand, request the free audit.</p></div>
      {categories.length ? <CategoryFinder categories={categories} today={today} compact /> : <p>Category data is temporarily unavailable. <a href="/tracker">Browse reports →</a></p>}
    </section>
    <section className="editorial-shell editorial-method" aria-labelledby="editorial-method-heading">
      <div className="editorial-method-intro"><p className="editorial-kicker">A note on the method</p><h2 id="editorial-method-heading">The answer is<br />the evidence.</h2><p>A mention measures visibility. An explicit rank records a preference in that answer. Neither establishes product quality.</p><a href="/methodology" className="editorial-evidence-link">Read the measurement rules ↗</a></div>
      <div className="editorial-method-steps">
        {[['01', 'Ask a shopper’s question.', 'Discovery, budget and comparison prompts use a saved shopper profile. Each question starts a fresh conversation.'], ['02', 'Keep the context attached.', 'Every report shows when answers were collected, usable coverage and the prompts behind the findings.'], ['03', 'Show presence and preference.', 'Count each brand once per usable answer. Record numeric ranks only when the answer supplies them.']].map(([n, title, text]) => <div key={n}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}
      </div>
    </section>
    <section className="editorial-audit" aria-labelledby="editorial-audit-heading"><div className="editorial-shell"><div><p className="editorial-kicker">For brands & commerce teams</p><h2 id="editorial-audit-heading">Ready to see where<br />your brand stands?</h2><p>A dated view of your brand’s visibility, recorded ranks and competitors—with the captured answers behind it.</p></div><div><TrackedLink href="/audit?source=homepage" event="audit_cta_click" source="homepage" className="editorial-primary">Get my free brand audit <span aria-hidden="true">↗</span></TrackedLink><p className="editorial-audit-note">Free · No call · Emailed within 48 hours</p><a href="/demo">See an example →</a></div></div></section>
    <section className="editorial-shell editorial-colophon" aria-labelledby="editorial-author-heading"><div><p className="editorial-kicker">Behind the research</p><h2 id="editorial-author-heading">Built to be inspected.</h2><p>I’m Robert Hu. I built RecoScope to make AI brand recommendations visible and open to scrutiny. Each report keeps the shopper question, captured answer and collection context together.</p><div className="editorial-author-links"><TrackedLink href="/platform" event="case_study_open" source="homepage">Read the case study ↗</TrackedLink><a href="/about">About Robert →</a></div></div><div className="editorial-colophon-aside"><IntroTrailer />{stats && <p className="editorial-corpus"><strong>{stats.categoriesActive}</strong> categories <span aria-hidden="true">/</span> <strong>{stats.runsCompleted}</strong> published snapshots<span>Archive totals. Each report has its own date and coverage.</span></p>}</div></section>
  </div>;
}
