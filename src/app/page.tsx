import { getCategoriesWithRuns, getTopBrandsForHero, getAuditStats } from "@/lib/queries";
import { BarRace } from "@/components/home/BarRace";
import { OrganizationSchema } from "@/components/seo/JsonLd";

export const revalidate = 300;

const SAMPLE_TABLE = [
  { agent: "ChatGPT", picks: ["Scotts Turf Builder", "Jonathan Green", "The Andersons"] },
  { agent: "Claude", picks: ["Scotts Turf Builder", "Lesco", "Milorganite"] },
  { agent: "Gemini", picks: ["Milorganite", "The Andersons", "Scotts Turf Builder"] },
  { agent: "Perplexity", picks: ["The Andersons", "Milorganite", "Scotts Turf Builder"] },
];

export default async function HomePage() {
  let categories: { name: string; slug: string; tracker_type: string; latest_summary: string | null }[] = [];
  let heroBrands: { brand: string; mentions: number }[] = [];
  let stats = { brandsTracked: 0, categoriesActive: 0, runsCompleted: 0 };

  const [catsResult, brandsResult, statsResult] = await Promise.allSettled([
    getCategoriesWithRuns(),
    getTopBrandsForHero(10),
    getAuditStats(),
  ]);

  if (catsResult.status === "fulfilled") categories = catsResult.value;
  else console.error("[homepage] getCategoriesWithRuns failed:", catsResult.reason);

  if (brandsResult.status === "fulfilled") heroBrands = brandsResult.value;
  else console.error("[homepage] getTopBrandsForHero failed:", brandsResult.reason);

  if (statsResult.status === "fulfilled") stats = statsResult.value;
  else console.error("[homepage] getAuditStats failed:", statsResult.reason);

  return (
    <div className="bg-dot-grid">
      <OrganizationSchema />

      {/* 1. Hero — what RecoScope is */}
      <section className="mx-auto max-w-5xl px-6 pb-8 pt-20 sm:pt-28">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/60">
            Independent AI Commerce Research Platform
          </p>

          <h1 className="mt-5 bg-gradient-to-r from-white to-cyan/70 bg-clip-text text-4xl font-bold leading-[1.15] tracking-tight text-transparent sm:text-5xl lg:text-6xl">
            See How AI Models Recommend Products
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/40">
            RecoScope is a live recommendation intelligence system that benchmarks product
            recommendations across ChatGPT, Claude, Gemini, and Perplexity, normalizes the
            results, and tracks how visibility changes over time.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <a href="/tracker" className="inline-block rounded-full bg-cyan px-8 py-3.5 text-center font-mono text-[13px] font-bold tracking-tight text-void transition-colors hover:bg-cyan/90">
            Explore the Benchmark
          </a>
          <a href="/methodology" className="inline-block rounded-full border border-cyan/30 bg-cyan/10 px-8 py-3.5 text-center font-mono text-[13px] font-bold tracking-tight text-cyan transition-all hover:bg-cyan/20 hover:shadow-[0_0_20px_rgba(0,212,170,0.2)]">
            Read the Methodology
          </a>
        </div>
        <p className="mt-3 text-[12px] text-white/25">
          Designed, built, and operated by Robert Hu.
        </p>
      </section>

      {/* 2. Scale and live metrics */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-white/5 bg-surface px-5 py-4 text-center">
            <p className="font-mono text-2xl font-bold text-cyan">{stats.brandsTracked}</p>
            <p className="mt-1 text-[11px] text-white/25">Brands Tracked</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-surface px-5 py-4 text-center">
            <p className="font-mono text-2xl font-bold text-cyan">4</p>
            <p className="mt-1 text-[11px] text-white/25">AI Models</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-surface px-5 py-4 text-center">
            <p className="font-mono text-2xl font-bold text-cyan">{stats.categoriesActive}</p>
            <p className="mt-1 text-[11px] text-white/25">Categories</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-surface px-5 py-4 text-center">
            <p className="font-mono text-2xl font-bold text-cyan">{stats.runsCompleted}</p>
            <p className="mt-1 text-[11px] text-white/25">Benchmark Runs</p>
          </div>
        </div>
      </section>

      {/* 3. How the system works — Collect / Normalize / Analyze */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            How the system works
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="glow-card rounded-xl border border-white/10 bg-surface p-6">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-cyan/60">Collect</p>
              <p className="mt-3 text-[14px] font-semibold text-white">The same prompts, across every model</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/40">
                The same commercial-intent prompts are evaluated across multiple AI systems, in the
                same time window, so results are comparable rather than anecdotal.
              </p>
            </div>
            <div className="glow-card rounded-xl border border-white/10 bg-surface p-6">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-cyan/60">Normalize</p>
              <p className="mt-3 text-[14px] font-semibold text-white">Raw responses become structured data</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/40">
                Raw recommendations are transformed into consistent brand, ranking, and category
                data, with brand names normalized so the same brand is counted as one.
              </p>
            </div>
            <div className="glow-card rounded-xl border border-white/10 bg-surface p-6">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-cyan/60">Analyze</p>
              <p className="mt-3 text-[14px] font-semibold text-white">Longitudinal, human-reviewed findings</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/40">
                Longitudinal patterns, model differences, and recommendation changes are published
                through human-reviewed reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. A current finding */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-amber-400/60">
                A Finding From The Data
              </p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Marketplace rank does not predict AI visibility
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-white/40">
                AI models recommend brands based on different signals than marketplace search.
                A category-leading product can be almost entirely absent from AI recommendations.
              </p>
              <p className="mt-4 text-[13px] leading-relaxed text-white/30">
                In the running shoes benchmark, Nike leads in total mentions but no model ranks it
                in its top 3. Meanwhile ASICS and Brooks, with smaller marketplace share, dominate
                the AI picks. That gap is what the platform is built to measure.
              </p>
              <a href="/tracker/running-shoes" className="mt-6 inline-block font-mono text-[12px] font-medium text-cyan/60 transition-colors hover:text-cyan">
                See the running shoes benchmark &rarr;
              </a>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-green-400/60">Marketplace Best Sellers</p>
                <p className="mt-4 text-3xl font-bold text-green-400">Nike</p>
                <p className="mt-1 text-[14px] text-green-400/60">#1 in Running Shoes</p>
                <div className="mt-4 h-2 rounded-full bg-green-400/10">
                  <div className="h-2 w-full rounded-full bg-green-400/40" />
                </div>
                <p className="mt-2 text-[12px] text-green-400/40">Marketplace visibility: dominant</p>
              </div>
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-6">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-amber-400/60">AI Recommendations</p>
                <p className="mt-4 text-3xl font-bold text-amber-400">Nike</p>
                <p className="mt-1 text-[14px] text-amber-400/60">Not in any model&rsquo;s top 3</p>
                <div className="mt-4 h-2 rounded-full bg-amber-400/10">
                  <div className="h-2 w-[8%] rounded-full bg-amber-400/40" />
                </div>
                <p className="mt-2 text-[12px] text-amber-400/40">AI visibility: nearly invisible</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Live benchmark access */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          {/* Live data + sample */}
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
                Top brands by AI mention volume
              </p>
              <BarRace brands={heroBrands} />
            </div>
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/50">
                Sample benchmark output
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-white/40">
                Each report captures what every model recommended, in order, for the same set of
                prompts. Lawn Fertilizer, week of Apr 8, 2026.
              </p>
              <div className="mt-4 overflow-x-auto rounded-xl border border-cyan/15 bg-surface shadow-[0_0_30px_rgba(0,212,170,0.06)]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-3 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white/25 sm:px-6 sm:py-4 sm:text-[11px]">Agent</th>
                      <th className="px-3 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-cyan/40 sm:px-6 sm:py-4 sm:text-[11px]">#1</th>
                      <th className="px-3 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white/20 sm:px-6 sm:py-4 sm:text-[11px]">#2</th>
                      <th className="px-3 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white/20 sm:px-6 sm:py-4 sm:text-[11px]">#3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_TABLE.map((row, i) => (
                      <tr key={row.agent} className={i < SAMPLE_TABLE.length - 1 ? "border-b border-white/5" : ""}>
                        <td className="px-3 py-3 font-mono text-[11px] font-semibold text-white/60 sm:px-6 sm:py-4 sm:text-[13px]">{row.agent}</td>
                        {row.picks.map((brand, idx) => (
                          <td key={idx} className={`px-3 py-3 text-[11px] sm:px-6 sm:py-4 sm:text-[13px] ${idx === 0 ? "font-medium text-white/70" : "text-white/30"}`}>{brand}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <a href="/tracker/lawn-fertilizer" className="mt-4 inline-block font-mono text-[12px] font-medium text-cyan/60 transition-colors hover:text-cyan">
                See the full report &rarr;
              </a>
            </div>
          </div>

          {/* Category directory */}
          {categories.length > 0 && (
            <div className="mt-16">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
                Live Benchmarks
              </p>
              <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Every category is tracked over time, not measured once
              </h2>
              <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-white/40">
                Each category is benchmarked on a recurring schedule across ChatGPT, Claude, Gemini,
                and Perplexity, so the data shows how recommendations move, not just where they stand today.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => (
                  <a key={cat.slug} href={`/tracker/${cat.slug}`} className="glow-card block rounded-xl border border-white/10 bg-surface px-6 py-5">
                    <span className="flex items-center gap-3">
                      <span className="text-[15px] font-semibold text-white">{cat.name}</span>
                      <span className="rounded-full bg-cyan/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan">Live</span>
                    </span>
                    {cat.latest_summary && <p className="mt-2 text-[13px] leading-relaxed text-white/35">{cat.latest_summary}</p>}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. Methodology and integrity */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            How the models are evaluated
          </p>
          <p className="mt-3 max-w-xl text-[14px] text-white/40">
            Each model is classified by commercial interest, so the data shows not just what AI
            recommends, but why different models diverge.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="glow-card rounded-xl border border-white/10 bg-surface p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan/10 text-cyan">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <p className="text-[14px] font-semibold text-white">Classified by commercial interest</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/40">
                Independent models (Claude), search-grounded models (Perplexity), and
                commerce-influenced models (ChatGPT, Gemini) are separated to reveal how commercial
                integrations shift what gets recommended.
              </p>
            </div>
            <div className="glow-card rounded-xl border border-white/10 bg-surface p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan/10 text-cyan">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="8" width="3" height="9" rx="1" fill="currentColor" opacity="0.5"/><rect x="8.5" y="5" width="3" height="12" rx="1" fill="currentColor" opacity="0.7"/><rect x="14" y="3" width="3" height="14" rx="1" fill="currentColor"/></svg>
              </div>
              <p className="text-[14px] font-semibold text-white">Standardized and comparable</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/40">
                The same prompts run across every model on a recurring schedule. Responses are parsed
                for brand mentions, rank position, and frequency to build comparable datasets over time.
              </p>
            </div>
            <div className="glow-card rounded-xl border border-white/10 bg-surface p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-coral/10 text-coral">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/><path d="M7 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <p className="text-[14px] font-semibold text-white">Independent and integrity-first</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/40">
                No brand pays to influence rankings. Reports are published only after human review,
                and reflect organic model behavior at the time of testing.
              </p>
            </div>
          </div>
          <p className="mt-8 text-[13px]">
            <a href="/methodology" className="text-cyan/60 transition-colors hover:text-cyan">
              Read the full methodology &rarr;
            </a>
          </p>
        </div>
      </section>

      {/* 7. Builder attribution */}
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-4">
        <div className="rounded-2xl border border-white/10 bg-surface px-6 py-14 text-center sm:px-16 sm:py-16">
          <p className="mx-auto max-w-2xl text-[20px] font-semibold leading-[1.4] tracking-tight text-white/80 sm:text-[24px]">
            RecoScope is an independent AI commerce benchmark designed, built, and operated by Robert Hu.
          </p>
          <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-white/40">
            From system design and data architecture through methodology and published findings.
          </p>
          <a
            href="https://theroberthu.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full border border-cyan/30 bg-cyan/10 px-8 py-3 font-mono text-[13px] font-bold tracking-tight text-cyan transition-all hover:bg-cyan/20"
          >
            About Robert Hu
          </a>
        </div>
      </section>
    </div>
  );
}
