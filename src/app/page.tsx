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

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-8 pt-20 sm:pt-28">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/60">
            AI Recommendation Intelligence
          </p>

          <h1 className="mt-5 bg-gradient-to-r from-white to-cyan/70 bg-clip-text text-4xl font-bold leading-[1.15] tracking-tight text-transparent sm:text-5xl lg:text-6xl">
            Your Amazon BSR doesn&rsquo;t mean anything to ChatGPT.
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/40">
            When buyers ask AI what to buy in your category, a different list comes up.
            We&rsquo;ll run your brand through ChatGPT, Claude, Gemini, and Perplexity
            and show you exactly where you stand. Free, delivered in 48 hours, no call required.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <a href="/audit" className="inline-block rounded-full bg-cyan px-8 py-3.5 text-center font-mono text-[13px] font-bold tracking-tight text-void transition-colors hover:bg-cyan/90">
            Get Your Free Audit
          </a>
          <a href="#sample-benchmark" className="inline-block rounded-full border border-cyan/30 bg-cyan/10 px-8 py-3.5 text-center font-mono text-[13px] font-bold tracking-tight text-cyan transition-all hover:bg-cyan/20 hover:shadow-[0_0_20px_rgba(0,212,170,0.2)]">
            See a sample benchmark &rarr;
          </a>
        </div>
        <p className="mt-3 text-[12px] text-white/25">
          Run personally by Robert Hu.
        </p>
      </section>

      {/* Stats bar */}
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

      {/* Bar race + insight */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
              Top brands by AI mention volume
            </p>
            <BarRace brands={heroBrands} />
          </div>
          <div className="border-l-2 border-cyan/40 py-1 pl-8">
            <p className="text-xl font-medium leading-snug tracking-tight text-white/70">
              The brands AI recommends are not always the brands consumers search for.
              We surface the gap between marketplace popularity and AI visibility.
            </p>
            <a href="/audit" className="mt-6 inline-block font-mono text-[12px] font-medium text-cyan/60 transition-colors hover:text-cyan">
              Check your brand &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Three-tier classification */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            How we analyze AI behavior
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="glow-card rounded-xl border border-white/10 bg-surface p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan/10 text-cyan">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <p className="text-[14px] font-semibold text-white">We classify AI by commercial interest</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/40">
                Not all AI recommendations are equal. We separate independent models (Claude),
                search-grounded models (Perplexity), and commerce-influenced models (ChatGPT, Gemini)
                to reveal how commercial integrations shift what gets recommended.
              </p>
            </div>
            <div className="glow-card rounded-xl border border-white/10 bg-surface p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan/10 text-cyan">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="8" width="3" height="9" rx="1" fill="currentColor" opacity="0.5"/><rect x="8.5" y="5" width="3" height="12" rx="1" fill="currentColor" opacity="0.7"/><rect x="14" y="3" width="3" height="14" rx="1" fill="currentColor"/></svg>
              </div>
              <p className="text-[14px] font-semibold text-white">We run standardized benchmarks</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/40">
                Three prompts per category, same questions across every model, collected monthly.
                We parse brand mentions, rank position, and frequency to build comparable datasets over time.
              </p>
            </div>
            <div className="glow-card rounded-xl border border-white/10 bg-surface p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-coral/10 text-coral">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/><path d="M7 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <p className="text-[14px] font-semibold text-white">We surface who&rsquo;s invisible</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/40">
                Most brands never appear in AI recommendations. We identify the gaps between
                what AI models recommend and what consumers actually buy, so brands can act on the difference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data preview table */}
      <section id="sample-benchmark" className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/50">
                See the Data We Produce
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-white/40">
                A sample from our latest benchmark, delivered monthly to subscribers.
              </p>
              <p className="mt-4 text-[12px] text-white/25">
                Lawn Fertilizer &middot; Week of Apr 8, 2026
              </p>
              <a href="/tracker/lawn-fertilizer" className="mt-4 inline-block font-mono text-[12px] font-medium text-cyan/60 transition-colors hover:text-cyan">
                See the full report &rarr;
              </a>
            </div>
            <div className="lg:col-span-3">
              <div className="overflow-x-auto rounded-xl border border-cyan/15 bg-surface shadow-[0_0_30px_rgba(0,212,170,0.06)]">
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
            </div>
          </div>
        </div>
      </section>

      {/* How AI models think differently */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/50">
            How AI Models Think Differently
          </p>
          <p className="mt-3 max-w-xl text-[14px] text-white/40">
            Each model has a distinct recommendation bias. We track these patterns so you know where your brand fits.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/5 bg-surface p-5">
              <p className="font-mono text-[12px] font-semibold text-white/60">ChatGPT</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/35">
                Favors widely available retail brands with broad name recognition.
                Recommendations skew toward products with strong Amazon presence and high review volume.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-surface p-5">
              <p className="font-mono text-[12px] font-semibold text-white/60">Claude</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/35">
                Emphasizes product quality and specialist brands. More likely to recommend organic,
                science-backed, or category-specific options over mass-market leaders.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-surface p-5">
              <p className="font-mono text-[12px] font-semibold text-white/60">Gemini</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/35">
                Splits between premium and budget picks. Often includes Google Shopping-integrated
                brands and provides more price-conscious recommendations than other models.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-surface p-5">
              <p className="font-mono text-[12px] font-semibold text-white/60">Perplexity</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/35">
                Aggregates from review sites and forums. Surfaces niche brands that rank well on
                Reddit, Wirecutter, and specialist review sites but may lack mainstream visibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Visibility Gap */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-amber-400/60">
                The AI Visibility Gap
              </p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Your best seller might be invisible to AI
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-white/40">
                AI models recommend brands based on different signals than Amazon search.
                A top-selling product can be completely absent from AI recommendations.
              </p>
              <p className="mt-4 text-[13px] leading-relaxed text-white/30">
                In our running shoes benchmark, Nike leads in total mentions (11) but
                zero AI models rank it in their top 3 recommendations. Meanwhile, brands like
                ASICS and Brooks (with smaller market share) dominate AI picks.
                This is the AI visibility gap.
              </p>
              <a href="/audit" className="mt-6 inline-block rounded-full bg-cyan px-8 py-3.5 font-mono text-[13px] font-bold tracking-tight text-void transition-colors hover:bg-cyan/90">
                Get Your Free Audit
              </a>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-green-400/60">Amazon Best Sellers</p>
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

      {/* Active reports */}
      {categories.length > 0 && (
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
              Active Reports
            </p>
            <h2 className="mt-4 max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
              We benchmark Amazon and Walmart brands across categories. Yours is probably here.
            </h2>
            <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-white/40">
              We&rsquo;ve run AI visibility benchmarks across multiple categories,
              tracking hundreds of brands across ChatGPT, Claude, Gemini, and Perplexity.
              If your category is on the list, we have data on you whether you&rsquo;ve asked for it or not.
            </p>
            <p className="mt-2 text-[14px] text-white/40">
              If it&rsquo;s not, request it. New categories take 14 days.
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
            <p className="mt-8 text-[13px]">
              <a href="/audit" className="text-cyan/60 transition-colors hover:text-cyan">
                Don&rsquo;t see your category? Request it &rarr;
              </a>
            </p>
            <p className="mt-2 text-[12px] italic text-white/25">
              Built for Amazon and Walmart brands doing $500K to $5M in revenue.
            </p>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-4">
        <div className="animate-pulse_glow rounded-2xl border border-cyan/20 bg-surface px-6 py-14 text-center sm:px-16 sm:py-20">
          <p className="mx-auto max-w-lg text-[24px] font-bold leading-[1.2] tracking-tight text-white sm:text-[32px]">
            Find out where you stand
          </p>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-white/40">
            Free. Delivered to your inbox in 48 hours. No call required.
          </p>
          <a
            href="/audit"
            className="mt-10 inline-block rounded-full bg-cyan px-10 py-4 font-mono text-[14px] font-bold tracking-tight text-void transition-colors hover:bg-cyan/90"
          >
            Get Your Free Audit
          </a>
        </div>
      </section>
    </div>
  );
}
