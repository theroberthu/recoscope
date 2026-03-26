import { CTABox } from "@/components/tracker";

const CATEGORIES = [
  {
    name: "Office Chairs",
    slug: "office-chairs",
    label: "Live Report",
    description: "We analyzed 4 AI models. Here\u2019s who they recommend \u2014 and who they ignore.",
    live: true,
  },
  {
    name: "Lawn Fertilizer",
    slug: "lawn-fertilizer",
    label: "Coming Soon",
    description: "Seasonal analysis of AI recommendations across spring and summer.",
    live: false,
  },
  {
    name: "Running Shoes",
    slug: "running-shoes",
    label: "Coming Soon",
    description: "Which performance brands are AI models actually recommending?",
    live: false,
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-2xl px-6 pb-16 pt-28">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-300">
          AI Recommendation Intelligence
        </p>
        <h1 className="mt-4 text-5xl font-bold leading-[1.1] tracking-tight text-gray-900">
          AI is choosing winners in your category. Do you know who?
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-400">
          When someone asks ChatGPT, Claude, or Gemini for a product recommendation,
          certain brands consistently appear at the top. Others don&rsquo;t appear at all.
          We reveal which &mdash; and why.
        </p>
        <a
          href="/tracker"
          className="mt-10 inline-block rounded-full bg-gray-900 px-8 py-3.5 text-[13px] font-bold tracking-tight text-white transition-colors hover:bg-gray-800"
        >
          View the Reports
        </a>
      </section>

      {/* Insight statement */}
      <section className="mx-auto max-w-2xl px-6 pb-24">
        <div className="border-l-[3px] border-gray-900 py-1 pl-8">
          <p className="text-xl font-medium leading-snug tracking-tight text-gray-900">
            The brands AI recommends are not always the brands consumers search for.
            We surface the gap between marketplace popularity and AI visibility.
          </p>
        </div>
      </section>

      {/* How we analyze */}
      <section className="border-t border-gray-100">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-300">
            How we analyze AI behavior
          </p>
          <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-gray-900">
                We query every major model
              </p>
              <p className="mt-2 text-[13px] leading-[1.7] text-gray-400">
                Standardized prompts run monthly across ChatGPT, Claude, Gemini,
                and Perplexity to capture real recommendation patterns.
              </p>
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-gray-900">
                We rank what they recommend
              </p>
              <p className="mt-2 text-[13px] leading-[1.7] text-gray-400">
                Every response is parsed for brand mentions, position,
                and frequency &mdash; then compared across models to reveal consensus.
              </p>
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-gray-900">
                We reveal who&rsquo;s invisible
              </p>
              <p className="mt-2 text-[13px] leading-[1.7] text-gray-400">
                We surface where AI models agree, where they diverge from marketplaces,
                and which brands are completely absent from AI results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Active reports */}
      <section className="border-t border-gray-100">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-300">
            Active Reports
          </p>
          <div className="mt-8 space-y-2">
            {CATEGORIES.map((cat) => (
              <a
                key={cat.slug}
                href={cat.live ? `/tracker/evergreen/${cat.slug}` : undefined}
                className={`block rounded-lg px-6 py-5 ${
                  cat.live
                    ? "bg-gray-50 transition-colors hover:bg-gray-100"
                    : "opacity-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="flex items-center gap-3">
                      <span className="text-[15px] font-semibold tracking-tight text-gray-900">
                        {cat.name}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          cat.live
                            ? "bg-gray-900 text-white"
                            : "text-gray-400"
                        }`}
                      >
                        {cat.label}
                      </span>
                    </span>
                    <p className="mt-1 text-[13px] text-gray-400">
                      {cat.description}
                    </p>
                  </div>
                  {cat.live && (
                    <span className="text-[13px] text-gray-300">&rarr;</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-2xl px-6 pb-24 pt-4">
        <CTABox
          heading="Get your free GEO audit"
          description="See exactly how AI models talk about your brand, what they recommend instead, and where you can improve visibility."
          buttonText="Start Your Audit"
          href="https://yourgeo.report"
        />
      </section>
    </div>
  );
}
