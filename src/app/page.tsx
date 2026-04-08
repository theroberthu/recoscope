import { getCategoriesWithRuns, getTopBrandsForHero } from "@/lib/queries";
import { BarRace } from "@/components/home/BarRace";
import { ScrollFade } from "@/components/home/ScrollFade";

/* Hardcoded sample data for the data preview section — from the latest
   lawn fertilizer seasonal benchmark. Update when new flagship data lands. */
const SAMPLE_TABLE = [
  { agent: "ChatGPT", picks: ["Scotts Turf Builder", "Jonathan Green", "The Andersons"] },
  { agent: "Claude", picks: ["Scotts Turf Builder", "Lesco", "Milorganite"] },
  { agent: "Gemini", picks: ["Milorganite", "The Andersons", "Scotts Turf Builder"] },
  { agent: "Perplexity", picks: ["The Andersons", "Milorganite", "Scotts Turf Builder"] },
];

/* TODO: replace with real quotes */
const TESTIMONIALS = [
  {
    quote: "We had no idea ChatGPT was recommending our top competitor for every buying prompt in our category. RecoScope showed us the gap in an afternoon.",
    author: "Head of Growth",
    company: "DTC Supplement Brand",
  },
  {
    quote: "The independent vs commerce-influenced AI split is exactly the lens our team needed. This isn\u2019t just data \u2014 it\u2019s actionable.",
    author: "Brand Manager",
    company: "Consumer Electronics",
  },
];

export default async function HomePage() {
  let categories: { name: string; slug: string; tracker_type: string; latest_summary: string | null }[] = [];
  let heroBrands: { brand: string; mentions: number }[] = [];

  try {
    [categories, heroBrands] = await Promise.all([
      getCategoriesWithRuns(),
      getTopBrandsForHero(10),
    ]);
  } catch {
    // DB unavailable
  }

  return (
    <div className="bg-dot-grid">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-8 pt-24">
        {/* Item 7: ICP eyebrow label */}
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/60">
          AI Recommendation Intelligence
        </p>
        <p className="mt-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-white/25">
          For Consumer Brands &middot; DTC &middot; Amazon Sellers &middot; Agencies
        </p>

        <h1 className="mt-4 bg-gradient-to-r from-white to-cyan/70 bg-clip-text text-5xl font-bold leading-[1.1] tracking-tight text-transparent sm:text-6xl">
          AI is choosing winners in your category. Do you know who?
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/40">
          When someone asks ChatGPT, Claude, or Gemini for a product recommendation,
          certain brands consistently appear at the top. Others don&rsquo;t appear at all.
          We reveal which &mdash; and why.
        </p>

        <BarRace brands={heroBrands} />

        {/* Item 2: Dual CTA — primary audit, secondary reports */}
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="/audit"
            className="inline-block rounded-full bg-cyan px-8 py-3.5 font-mono text-[13px] font-bold tracking-tight text-void transition-colors hover:bg-cyan/90"
          >
            Get a Free Audit
          </a>
          <a
            href="/tracker"
            className="inline-block rounded-full border border-cyan/30 bg-cyan/10 px-8 py-3.5 font-mono text-[13px] font-bold tracking-tight text-cyan transition-all hover:bg-cyan/20 hover:shadow-[0_0_20px_rgba(0,212,170,0.2)]"
          >
            View the Reports
          </a>
        </div>
      </section>

      {/* Insight statement */}
      <ScrollFade className="mx-auto max-w-3xl px-6 py-20">
        <div className="border-l-2 border-cyan/40 py-1 pl-8">
          <p className="text-xl font-medium leading-snug tracking-tight text-white/70">
            The brands AI recommends are not always the brands consumers search for.
            We surface the gap between marketplace popularity and AI visibility.
          </p>
        </div>
      </ScrollFade>

      {/* Three-tier classification */}
      <ScrollFade className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            How we analyze AI behavior
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="glow-card rounded-xl border border-white/10 bg-surface p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan/10 text-cyan">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <p className="text-[14px] font-semibold text-white">
                We classify AI by commercial interest
              </p>
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
              <p className="text-[14px] font-semibold text-white">
                We run standardized benchmarks
              </p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/40">
                Three prompts per category, same questions across every model, collected monthly.
                We parse brand mentions, rank position, and frequency to build comparable datasets
                over time.
              </p>
            </div>

            <div className="glow-card rounded-xl border border-white/10 bg-surface p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-coral/10 text-coral">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/><path d="M7 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <p className="text-[14px] font-semibold text-white">
                We surface who&rsquo;s invisible
              </p>
              <p className="mt-2 text-[13px] leading-[1.7] text-white/40">
                Most brands never appear in AI recommendations. We identify the gaps between
                what AI models recommend and what consumers actually buy, so brands can act
                on the difference.
              </p>
            </div>
          </div>
        </div>
      </ScrollFade>

      {/* Item 3: Report data preview with hardcoded sample table */}
      <ScrollFade className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/50">
            See the Data We Produce
          </p>
          <p className="mt-3 text-[14px] text-white/40">
            A sample from our latest benchmark &mdash; delivered monthly to subscribers.
          </p>
          <div className="mt-8 overflow-x-auto rounded-xl border border-cyan/15 bg-surface shadow-[0_0_30px_rgba(0,212,170,0.06)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white/25">Agent</th>
                  <th className="px-6 py-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-cyan/40">#1</th>
                  <th className="px-6 py-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white/20">#2</th>
                  <th className="px-6 py-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white/20">#3</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_TABLE.map((row, i) => (
                  <tr key={row.agent} className={i < SAMPLE_TABLE.length - 1 ? "border-b border-white/5" : ""}>
                    <td className="px-6 py-4 font-mono text-[13px] font-semibold text-white/60">{row.agent}</td>
                    {row.picks.map((brand, idx) => (
                      <td key={idx} className={`px-6 py-4 text-[13px] ${idx === 0 ? "font-medium text-white/70" : "text-white/30"}`}>
                        {brand}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-[12px] text-white/25">
            Lawn Fertilizer &middot; Week of Apr 8, 2026
          </p>
          <p className="mt-2 text-center">
            <a
              href="/tracker/seasonal/lawn-fertilizer"
              className="font-mono text-[12px] font-medium text-cyan/60 transition-colors hover:text-cyan"
            >
              See the full report &rarr;
            </a>
          </p>
        </div>
      </ScrollFade>

      {/* Active reports */}
      {categories.length > 0 && (
        <ScrollFade className="border-t border-white/5">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
              Active Reports
            </p>
            <div className="mt-8 space-y-3">
              {categories.map((cat) => (
                <a
                  key={cat.slug}
                  href={`/tracker/${cat.tracker_type}/${cat.slug}`}
                  className="glow-card block rounded-xl border border-white/10 bg-surface px-6 py-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="flex items-center gap-3">
                        <span className="text-[15px] font-semibold text-white">{cat.name}</span>
                        <span className="rounded-full bg-cyan/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan">
                          Live
                        </span>
                      </span>
                      {cat.latest_summary && (
                        <p className="mt-1 text-[13px] text-white/40">{cat.latest_summary}</p>
                      )}
                    </div>
                    <span className="text-[13px] text-white/20">&rarr;</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </ScrollFade>
      )}

      {/* Item 4: Social proof quotes */}
      {/* TODO: replace with real quotes */}
      <ScrollFade className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            What Brands Are Saying
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="rounded-xl border border-white/10 bg-surface p-6">
                <p className="text-[14px] leading-[1.7] text-white/50">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="mt-4 font-mono text-[11px] text-white/30">
                  {t.author}, <span className="text-white/20">{t.company}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </ScrollFade>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-4">
        <div className="animate-pulse_glow rounded-2xl border border-cyan/20 bg-surface px-8 py-16 text-center sm:px-12">
          <p className="mx-auto max-w-lg text-[28px] font-bold leading-[1.2] tracking-tight text-white">
            Your competitors are showing up in AI results. Are you?
          </p>
          <p className="mx-auto mt-5 max-w-sm text-[14px] leading-relaxed text-white/40">
            Get a free AI Visibility Audit &mdash; see exactly how ChatGPT, Claude,
            and Gemini talk about your brand.
          </p>
          <a
            href="/audit"
            className="mt-10 inline-block rounded-full bg-cyan px-8 py-3.5 font-mono text-[13px] font-bold tracking-tight text-void transition-colors hover:bg-cyan/90"
          >
            Request Your Free Audit
          </a>
        </div>
      </section>
    </div>
  );
}
