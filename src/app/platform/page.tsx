import type { Metadata } from "next";
import Link from "next/link";
import { getPlatformStats } from "@/lib/queries";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: { absolute: "RecoScope Platform | AI Recommendation Intelligence System" },
  description:
    "Learn how RecoScope evaluates product recommendations across ChatGPT, Claude, Gemini, and Perplexity, normalizes the results, and publishes longitudinal AI commerce research.",
  openGraph: {
    title: "RecoScope Platform | AI Recommendation Intelligence System",
    description:
      "How RecoScope evaluates product recommendations across ChatGPT, Claude, Gemini, and Perplexity, normalizes the results, and publishes longitudinal AI commerce research.",
    type: "website",
  },
};

export const revalidate = 300;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function sinceLabel(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const m = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return `${MONTHS[parseInt(m[2], 10) - 1]} ${m[1]}`;
}

const FLOW = [
  { step: "Evaluate", body: "The same commercial-intent prompts are tested across ChatGPT, Claude, Gemini, and Perplexity in the same time window, so results are comparable rather than anecdotal." },
  { step: "Capture", body: "Each model's full response is preserved, along with the brands it named, the order it named them in, and which prompt and agent produced them." },
  { step: "Normalize", body: "Brand references are cleaned and standardized, connected to categories, prompts, agents, and time periods, so the same brand is counted as one across models and runs." },
  { step: "Analyze", body: "Cross-model agreement, visibility, rank movement, consistency, and recommendation differences are evaluated across the longitudinal dataset." },
  { step: "Review", body: "Each run moves through a draft, reviewed, and published status. Only published runs are exposed on public surfaces." },
  { step: "Publish", body: "Tracker reports, research findings, prompt-level pages, and private analysis outputs are all generated from the same structured dataset." },
];

const DATA_MODEL = [
  { entity: "Categories", body: "The product categories under evaluation (office chairs, running shoes, protein powder, and more), each with a benchmark cadence." },
  { entity: "Runs", body: "A single benchmark of a category at a point in time. Runs carry a status and are only public once published." },
  { entity: "Agent responses", body: "The raw output from each model for each prompt in a run, preserved separately from the structured data derived from it." },
  { entity: "Brand mentions", body: "Every brand a model named, with its rank position, the raw string, and a normalized brand name for consistent counting." },
  { entity: "Run insights", body: "The interpreted findings for a run: cross-model differences, common traits, gaps, and the key takeaway." },
];

const DECISIONS = [
  { title: "Compare models instead of treating AI as one channel", body: "Recommendations diverge across ChatGPT, Claude, Gemini, and Perplexity. Measuring each separately, and classifying them by commercial interest, is the only way to see where and why they disagree." },
  { title: "Repeat standardized prompts", body: "The same commercial-intent prompts run on a recurring schedule so the data reflects a controlled, repeatable process rather than one-off screenshots." },
  { title: "Preserve raw responses separately from normalized data", body: "Full model outputs are kept alongside the structured mentions derived from them, so findings remain auditable and re-derivable." },
  { title: "Separate raw and normalized brand names", body: "Storing both the raw string and a normalized brand name keeps the evidence intact while making counts consistent across spelling and formatting variants." },
  { title: "Track longitudinally", body: "Categories are benchmarked over time so the system captures how recommendations move, not just where they stand on one day." },
  { title: "Separate public and private outputs", body: "Public tracker reports and private brand analyses are generated from one dataset but gated differently, so private work never leaks onto public surfaces." },
  { title: "Require publication status before exposure", body: "Public queries only return published runs. A run in draft or reviewed status is never rendered on an indexable page." },
  { title: "Balance freshness with caching", body: "Public pages use incremental regeneration and per-route caching so the data stays current without paying a cold database query on every request." },
  { title: "Protect research integrity", body: "No brand pays to influence rankings. Results reflect observed model behavior at the time of testing." },
];

async function loadStats() {
  try {
    return await getPlatformStats();
  } catch (e) {
    console.error("[platform] stats failed:", e);
    return { categories: 0, publishedRuns: 0, brands: 0, mentions: 0, firstRunDate: null };
  }
}

export default async function PlatformPage() {
  const stats = await loadStats();
  const since = sinceLabel(stats.firstRunDate);
  const baseUrl = "https://www.getrecoscope.com";

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "RecoScope",
    applicationCategory: "BusinessApplication",
    url: `${baseUrl}/platform`,
    description:
      "An operating AI recommendation intelligence platform that benchmarks how ChatGPT, Claude, Gemini, and Perplexity recommend products, normalizes the results, and publishes longitudinal AI commerce research.",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const metrics: { value: string; label: string }[] = [
    { value: "4", label: "AI systems evaluated" },
    ...(stats.categories ? [{ value: String(stats.categories), label: "Categories tracked" }] : []),
    ...(stats.publishedRuns ? [{ value: String(stats.publishedRuns), label: "Published brand-runs" }] : []),
    ...(stats.brands ? [{ value: String(stats.brands), label: "Brands measured" }] : []),
    ...(stats.mentions ? [{ value: stats.mentions.toLocaleString(), label: "Recommendation mentions" }] : []),
    ...(since ? [{ value: since, label: "Operating since" }] : []),
  ];

  return (
    <div className="bg-dot-grid min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <BreadcrumbSchema items={[{ name: "Home", url: baseUrl }, { name: "Platform", url: `${baseUrl}/platform` }]} />

      {/* 1. Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-8 pt-20 sm:pt-28">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/60">
            The RecoScope Platform
          </p>
          <h1 className="mt-5 bg-gradient-to-r from-white to-cyan/70 bg-clip-text text-4xl font-bold leading-[1.15] tracking-tight text-transparent sm:text-5xl">
            A System for Measuring AI Product Recommendations
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/40">
            RecoScope evaluates how leading AI systems recommend products, converts unstructured
            responses into normalized longitudinal data, and publishes human-reviewed evidence about
            AI-driven product discovery.
          </p>
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <a href="/tracker" className="inline-block rounded-full bg-cyan px-8 py-3.5 text-center font-mono text-[13px] font-bold tracking-tight text-void transition-colors hover:bg-cyan/90">
            Explore the live benchmark
          </a>
          <a href="/methodology" className="inline-block rounded-full border border-cyan/30 bg-cyan/10 px-8 py-3.5 text-center font-mono text-[13px] font-bold tracking-tight text-cyan transition-all hover:bg-cyan/20">
            Read the methodology
          </a>
        </div>
      </section>

      {/* 2. System overview */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            How the system works
          </p>
          <div className="mt-8 space-y-3">
            {FLOW.map((f, i) => (
              <div key={f.step} className="flex gap-5 rounded-xl border border-white/10 bg-surface p-5 sm:gap-6 sm:p-6">
                <div className="flex shrink-0 flex-col items-center">
                  <span className="font-mono text-[11px] font-bold text-cyan/60">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-white">{f.step}</p>
                  <p className="mt-1.5 text-[13px] leading-[1.7] text-white/40">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Operating scale */}
      {metrics.length > 1 && (
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
              Operating scale
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {metrics.map((m) => (
                <div key={m.label} className="rounded-xl border border-white/5 bg-surface px-4 py-5 text-center">
                  <p className="font-mono text-xl font-bold text-cyan sm:text-2xl">{m.value}</p>
                  <p className="mt-1.5 text-[11px] leading-tight text-white/25">{m.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[12px] text-white/25">
              Figures reflect published, public benchmark data and update as new runs are reviewed and published.
            </p>
          </div>
        </section>
      )}

      {/* 4. Data model */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            The data model
          </p>
          <p className="mt-3 max-w-xl text-[14px] text-white/40">
            Every public output is derived from one normalized model. Each entity connects to the next,
            so a single benchmark run is fully traceable from raw response to published finding.
          </p>
          <div className="mt-8 space-y-2">
            {DATA_MODEL.map((d, i) => (
              <div key={d.entity} className="rounded-xl border border-white/10 bg-surface p-5">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] text-white/25">{String(i + 1).padStart(2, "0")}</span>
                  <p className="font-mono text-[13px] font-semibold text-cyan/70">{d.entity}</p>
                </div>
                <p className="mt-2 pl-8 text-[13px] leading-[1.7] text-white/40">{d.body}</p>
                {i < DATA_MODEL.length - 1 && (
                  <p className="mt-3 pl-8 font-mono text-[11px] text-white/20">↓</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Product decisions */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            Decisions behind the platform
          </p>
          <p className="mt-3 max-w-xl text-[14px] text-white/40">
            The system reflects a series of product and operating decisions, each made to keep the
            evidence comparable, auditable, and honest.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {DECISIONS.map((d) => (
              <div key={d.title} className="glow-card rounded-xl border border-white/10 bg-surface p-6">
                <p className="text-[14px] font-semibold text-white">{d.title}</p>
                <p className="mt-2 text-[13px] leading-[1.7] text-white/40">{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Platform outputs */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            What the system produces
          </p>
          <p className="mt-3 max-w-xl text-[14px] text-white/40">
            Four public outputs, one shared dataset.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link href="/tracker" className="glow-card block rounded-xl border border-white/10 bg-surface p-6">
              <p className="text-[15px] font-semibold text-white">Tracker &rarr;</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/40">Live category benchmarks with cross-model rankings, trend data, and movement over time.</p>
            </Link>
            <Link href="/blog" className="glow-card block rounded-xl border border-white/10 bg-surface p-6">
              <p className="text-[15px] font-semibold text-white">Research &rarr;</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/40">Findings drawn from the dataset: cross-model patterns and how recommendations shift.</p>
            </Link>
            <Link href="/methodology" className="glow-card block rounded-xl border border-white/10 bg-surface p-6">
              <p className="text-[15px] font-semibold text-white">Methodology &rarr;</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/40">How prompts are run, parsed, normalized, and scored, and how models are classified.</p>
            </Link>
            <Link href="/demo" className="glow-card block rounded-xl border border-white/10 bg-surface p-6">
              <p className="text-[15px] font-semibold text-white">Private analysis &rarr;</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/40">A per-brand visibility report, scored from the same data. See an example output.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Current boundaries */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="max-w-3xl border-l-2 border-white/10 pl-8">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
              What RecoScope does not claim
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-white/50">
              RecoScope does not reproduce model training data, explain every causal factor behind a
              recommendation, or provide universal rankings. It measures observed model outputs under
              a controlled and repeatable evaluation process, and reports what those outputs show.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Builder attribution */}
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-4">
        <div className="rounded-2xl border border-white/10 bg-surface px-6 py-14 text-center sm:px-16">
          <p className="mx-auto max-w-2xl text-[20px] font-semibold leading-[1.4] tracking-tight text-white/80">
            RecoScope was designed, built, and is operated by Robert Hu to make AI product discovery measurable.
          </p>
          <Link
            href="/about"
            className="mt-8 inline-block rounded-full border border-cyan/30 bg-cyan/10 px-8 py-3 font-mono text-[13px] font-bold tracking-tight text-cyan transition-all hover:bg-cyan/20"
          >
            Why I built RecoScope
          </Link>
        </div>
      </section>
    </div>
  );
}
