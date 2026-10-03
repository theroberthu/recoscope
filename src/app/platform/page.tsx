import type { Metadata } from "next";
import Link from "next/link";
import { getPlatformStats } from "@/lib/queries";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: { absolute: "RecoScope Case Study | AI Commerce Benchmark" },
  description:
    "Learn how RecoScope evaluates product recommendations across ChatGPT, Claude, Gemini, and Perplexity, normalizes the results, and publishes longitudinal AI commerce research.",
  openGraph: {
    title: "RecoScope Case Study | AI Commerce Benchmark",
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
  { step: "Evaluate", body: "The same commercial-intent prompts are tested across ChatGPT, Claude, Gemini, and Perplexity in the same time window, with the same persona and prompt text reused for repeat runs. Tier and model changes are recorded as comparison boundaries." },
  { step: "Capture", body: "Responses are collected from the live consumer interfaces, with tier, model, mode, and surface evidence recorded. Unavailable cells and retries remain explicit." },
  { step: "Normalize", body: "Brand references are cleaned and standardized, connected to categories, prompts, agents, and time periods, so the same brand is counted as one across models and runs." },
  { step: "Analyze", body: "Mention frequency and explicit recommendation rank are evaluated separately. Changes over time are interpreted with collection gaps and instrument changes in view." },
  { step: "Validate", body: "Capture and ingestion checks gate publication. Published reports retain their quality and human-review status; publishing a run is not the same as human review." },
  { step: "Publish", body: "Tracker reports, research findings, prompt-level pages, and private analysis outputs are all generated from the same structured dataset." },
];

const DATA_MODEL = [
  { entity: "Categories", body: "The product categories under evaluation (office chairs, running shoes, protein powder, and more), each with a benchmark cadence." },
  { entity: "Runs", body: "A single benchmark of a category at a point in time. Runs carry a status and are only public once published." },
  { entity: "Agent responses", body: "The raw output from each model for each prompt in a run, preserved separately from the structured data derived from it." },
  { entity: "Brand mentions", body: "Brand references retain their raw string and normalized name. Rank is recorded only when explicitly supported; unranked mentions remain unranked." },
  { entity: "Run insights", body: "The interpreted findings for a run: cross-model differences, common traits, gaps, and the key takeaway." },
];

const DECISIONS = [
  { title: "Separate visibility from selection", body: "A brand can be named as an alternative or a poor fit. Mention counts measure presence; explicit ranks measure recommendation position. Carousel placement is never substituted for rank." },
  { title: "Keep the shopper question constant", body: "Repeat runs reuse the category's persona and exact prompts. Changing the question and the model at once would make a movement difficult to interpret." },
  { title: "Record the instrument, not just the answer", body: "The live tier, model, mode, and response surface are recorded. A model or tier change is a boundary in the series, rather than an unexplained change in brand performance." },
  { title: "Keep failures visible", body: "Unavailable responses, retries, and partial runs retain their status. Missing cells are not invented recommendations, and a rejected capture is not presented as a clean result." },
  { title: "Preserve the path back to evidence", body: "Raw responses remain separate from normalized brand records. That makes it possible to check an interpretation against the response instead of treating the extracted table as the only evidence." },
  { title: "Use explicit publication and access gates", body: "Public queries filter for published, public runs. Quality and human-review status remain separate; private analyses have a different access path." },
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
    ...(stats.publishedRuns ? [{ value: String(stats.publishedRuns), label: "Published benchmark runs" }] : []),
    ...(stats.brands ? [{ value: String(stats.brands), label: "Brands measured" }] : []),
    ...(stats.mentions ? [{ value: stats.mentions.toLocaleString(), label: "Brand mentions" }] : []),
    ...(since ? [{ value: since, label: "Operating since" }] : []),
  ];

  return (
    <div className="bg-dot-grid min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <BreadcrumbSchema items={[{ name: "Home", url: baseUrl }, { name: "Platform", url: `${baseUrl}/platform` }]} />

      {/* 1. Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-8 pt-20 sm:pt-28">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/70">
            Project Case Study · Built and Operated by Robert Hu
          </p>
          <h1 className="mt-5 bg-gradient-to-r from-white to-cyan/70 bg-clip-text text-4xl font-bold leading-[1.15] tracking-tight text-transparent sm:text-5xl">
            From a commerce question to a working AI benchmark
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/60">
            Which brands do AI assistants recommend, for which shopper needs, and how does that
            change? I built RecoScope to investigate those questions with repeated prompts,
            structured data, and public reports that people can inspect.
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

      {/* 3. Operating scale */}
      {metrics.length > 1 && (
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
              Operating scale
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {metrics.map((m) => (
                <div key={m.label} className="rounded-xl border border-white/5 bg-surface px-4 py-5 text-center">
                  <p className="font-mono text-xl font-bold text-cyan sm:text-2xl">{m.value}</p>
                  <p className="mt-1.5 text-[11px] leading-tight text-white/50">{m.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[12px] text-white/50">
              Figures come from published, public benchmark records. They measure the research corpus, not users, customers, or commercial impact.
            </p>
          </div>
        </section>
      )}

      {/* 2. System overview */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
            How the system works
          </p>
          <div className="mt-8 space-y-3">
            {FLOW.map((f, i) => (
              <div key={f.step} className="flex gap-5 rounded-xl border border-white/10 bg-surface p-5 sm:gap-6 sm:p-6">
                <div className="flex shrink-0 flex-col items-center">
                  <span className="font-mono text-[11px] font-bold text-cyan/70">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-white">{f.step}</p>
                  <p className="mt-1.5 text-[13px] leading-[1.7] text-white/60">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight text-white">What a commerce team can investigate</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-surface p-6">
              <h3 className="text-[16px] font-semibold text-white">Discovery</h3>
              <p className="mt-3 text-[14px] leading-[1.8] text-white/60">Does a brand appear for the shopper's needs, or only when the shopper names it?</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-surface p-6">
              <h3 className="text-[16px] font-semibold text-white">Selection</h3>
              <p className="mt-3 text-[14px] leading-[1.8] text-white/60">Is the brand explicitly recommended, or simply included among the alternatives?</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-surface p-6">
              <h3 className="text-[16px] font-semibold text-white">Consistency</h3>
              <p className="mt-3 text-[14px] leading-[1.8] text-white/60">Do different assistants select the same brands, and does that pattern persist in repeat runs?</p>
            </div>
          </div>
          <p className="mt-8 max-w-3xl text-[14px] leading-[1.8] text-white/60">
            These observations can help scope a brand or retail pilot and define its research questions.
            They do not establish why a model selected a brand or whether changing product content will improve sales.
          </p>
          <Link href="/tracker/running-shoes" className="mt-6 inline-block text-[14px] font-medium text-cyan underline underline-offset-4 hover:text-white">Inspect a category report &rarr;</Link>
        </div>
      </section>

      {/* 4. Data model */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
            The data model
          </p>
          <p className="mt-3 max-w-xl text-[14px] text-white/60">
            Every public output is derived from one normalized model. Each entity connects to the next,
            so a single benchmark run is fully traceable from raw response to published finding.
          </p>
          <div className="mt-8 space-y-2">
            {DATA_MODEL.map((d, i) => (
              <div key={d.entity} className="rounded-xl border border-white/10 bg-surface p-5">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] text-white/50">{String(i + 1).padStart(2, "0")}</span>
                  <p className="font-mono text-[13px] font-semibold text-cyan/70">{d.entity}</p>
                </div>
                <p className="mt-2 pl-8 text-[13px] leading-[1.7] text-white/60">{d.body}</p>
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
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
            Decisions behind the platform
          </p>
          <p className="mt-3 max-w-xl text-[14px] text-white/60">
            The system reflects a series of product and operating decisions, each made to keep the
            evidence comparable, auditable, and honest.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {DECISIONS.map((d) => (
              <div key={d.title} className="glow-card rounded-xl border border-white/10 bg-surface p-6">
                <p className="text-[14px] font-semibold text-white">{d.title}</p>
                <p className="mt-2 text-[13px] leading-[1.7] text-white/60">{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Platform outputs */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
            What the system produces
          </p>
          <p className="mt-3 max-w-xl text-[14px] text-white/60">
            Public research and an example brand analysis, supported by the same measurement system.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link href="/tracker" className="glow-card block rounded-xl border border-white/10 bg-surface p-6">
              <p className="text-[15px] font-semibold text-white">Tracker &rarr;</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/60">Live category benchmarks with cross-model rankings, trend data, and movement over time.</p>
            </Link>
            <Link href="/blog" className="glow-card block rounded-xl border border-white/10 bg-surface p-6">
              <p className="text-[15px] font-semibold text-white">Research &rarr;</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/60">Findings drawn from the dataset: cross-model patterns and how recommendations shift.</p>
            </Link>
            <Link href="/methodology" className="glow-card block rounded-xl border border-white/10 bg-surface p-6">
              <p className="text-[15px] font-semibold text-white">Methodology &rarr;</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/60">How prompts are run, parsed, normalized, and scored, and how models are classified.</p>
            </Link>
            <Link href="/demo" className="glow-card block rounded-xl border border-white/10 bg-surface p-6">
              <p className="text-[15px] font-semibold text-white">Private analysis &rarr;</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/60">A per-brand visibility report, scored from the same data. See an example output.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight text-white">How it is built</h2>
          <p className="mt-5 max-w-3xl text-[15px] leading-[1.8] text-white/60">
            The public application uses Next.js, React, and TypeScript, with a Neon PostgreSQL database
            and Vercel deployment. Collection uses the live ChatGPT, Claude, Gemini, and Perplexity
            interfaces; those observations are distinct from an API-based model evaluation.
          </p>
          <p className="mt-4 max-w-3xl text-[15px] leading-[1.8] text-white/60">
            I use AI-assisted tools to develop and operate the system. My work centers on the commercial
            question, the measurement rules, the data and report design, and the decisions about what the evidence supports.
          </p>
          <a href="https://github.com/theroberthu/recoscope/tree/main" target="_blank" rel="noopener noreferrer" className="mt-6 inline-block text-[14px] font-medium text-cyan underline underline-offset-4 hover:text-white">Inspect the source code &rarr;</a>
        </div>
      </section>

      {/* 7. Current boundaries */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="max-w-3xl border-l-2 border-white/10 pl-8">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
              What RecoScope does not claim
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-white/50">
              RecoScope does not reproduce model training data, explain every causal factor behind a
              recommendation, or provide universal rankings. It measures observed model outputs for the tested prompts and interfaces. It does not
              establish sales lift, explain model internals, or guarantee that another session will
              return the same answer. Collection can require manual intervention; this is an
              operating research project, not a claim of fully unattended reliability.
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
            About Robert & career focus
          </Link>
        </div>
      </section>
    </div>
  );
}
