import { CTABox } from "@/components/tracker";
import { getCategoriesWithRuns } from "@/lib/queries";

export default async function HomePage() {
  let categories: { name: string; slug: string; tracker_type: string; latest_summary: string | null }[] = [];

  try {
    categories = await getCategoriesWithRuns();
  } catch {
    // DB unavailable — render page without dynamic reports
  }

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-2xl px-6 pb-16 pt-28">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-400">
          AI Recommendation Intelligence
        </p>
        <h1 className="mt-4 text-5xl font-bold leading-[1.1] tracking-tight text-stone-900">
          AI is choosing winners in your category. Do you know who?
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-500">
          When someone asks ChatGPT, Claude, or Gemini for a product recommendation,
          certain brands consistently appear at the top. Others don&rsquo;t appear at all.
          We reveal which &mdash; and why.
        </p>
        <a
          href="/tracker"
          className="mt-10 inline-block rounded-full bg-stone-800 px-8 py-3.5 text-[13px] font-bold tracking-tight text-white transition-colors hover:bg-stone-700"
        >
          View the Reports
        </a>
      </section>

      {/* Insight statement */}
      <section className="mx-auto max-w-2xl px-6 pb-24">
        <div className="border-l-[3px] border-stone-800 py-1 pl-8">
          <p className="text-xl font-medium leading-snug tracking-tight text-stone-800">
            The brands AI recommends are not always the brands consumers search for.
            We surface the gap between marketplace popularity and AI visibility.
          </p>
        </div>
      </section>

      {/* How we analyze */}
      <section className="border-t border-stone-200/60">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-400">
            How we analyze AI behavior
          </p>
          <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-stone-800">
                We classify AI by commercial interest
              </p>
              <p className="mt-2 text-[13px] leading-[1.7] text-stone-500">
                Not all AI recommendations are equal. We separate independent models (Claude),
                search-grounded models (Perplexity), and commerce-influenced models (ChatGPT, Gemini)
                to reveal how commercial integrations shift what gets recommended.
              </p>
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-stone-800">
                We run standardized benchmarks
              </p>
              <p className="mt-2 text-[13px] leading-[1.7] text-stone-500">
                Three prompts per category, same questions across every model, collected monthly.
                We parse brand mentions, rank position, and frequency to build comparable datasets
                over time.
              </p>
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-stone-800">
                We surface who&rsquo;s invisible
              </p>
              <p className="mt-2 text-[13px] leading-[1.7] text-stone-500">
                Most brands never appear in AI recommendations. We identify the gaps between
                what AI models recommend and what consumers actually buy, so brands can act
                on the difference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Active reports — dynamic from DB */}
      {categories.length > 0 && (
        <section className="border-t border-stone-200/60">
          <div className="mx-auto max-w-2xl px-6 py-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-400">
              Active Reports
            </p>
            <div className="mt-8 space-y-2">
              {categories.map((cat) => (
                <a
                  key={cat.slug}
                  href={`/tracker/${cat.tracker_type}/${cat.slug}`}
                  className="block rounded-lg bg-stone-100/80 px-6 py-5 transition-colors hover:bg-stone-200/60"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="flex items-center gap-3">
                        <span className="text-[15px] font-semibold tracking-tight text-stone-800">
                          {cat.name}
                        </span>
                        <span className="rounded-full bg-stone-800 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                          Live Report
                        </span>
                      </span>
                      {cat.latest_summary && (
                        <p className="mt-1 text-[13px] text-stone-500">
                          {cat.latest_summary}
                        </p>
                      )}
                    </div>
                    <span className="text-[13px] text-stone-400">&rarr;</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="mx-auto max-w-2xl px-6 pb-24 pt-4">
        <CTABox
          heading="Get your free GEO audit"
          description="See exactly how AI models talk about your brand, what they recommend instead, and where you can improve visibility."
          buttonText="Start Your Audit"
          href="/audit"
        />
      </section>
    </div>
  );
}
