import { CTABox } from "@/components/tracker";

const CATEGORIES = [
  {
    name: "Office Chairs",
    slug: "office-chairs",
    label: "Live Report",
    description: "Which ergonomic brands do AI models recommend most?",
    live: true,
  },
  {
    name: "Lawn Fertilizer",
    slug: "lawn-fertilizer",
    label: "Coming Soon",
    description: "Seasonal tracking across spring and summer cycles.",
    live: false,
  },
  {
    name: "Running Shoes",
    slug: "running-shoes",
    label: "Coming Soon",
    description: "Performance brands vs lifestyle picks across AI models.",
    live: false,
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-2xl px-6 pb-24 pt-28">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-300">
          AI Recommendation Intelligence
        </p>
        <h1 className="mt-4 text-5xl font-bold leading-[1.1] tracking-tight text-gray-900">
          See how AI recommends products in your category
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-400">
          RecoScope tracks what ChatGPT, Claude, Gemini, and Perplexity recommend
          across product categories &mdash; so you can see where your brand stands
          and where you&rsquo;re invisible.
        </p>
        <a
          href="/tracker"
          className="mt-10 inline-block rounded-full bg-gray-900 px-8 py-3.5 text-[13px] font-bold tracking-tight text-white transition-colors hover:bg-gray-800"
        >
          Explore Reports
        </a>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-100">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-300">
            How it works
          </p>
          <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-gray-900">
                Multi-agent testing
              </p>
              <p className="mt-2 text-[13px] leading-[1.7] text-gray-400">
                We run standardized prompts across leading AI systems every month
                to capture real recommendation behavior.
              </p>
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-gray-900">
                Brand-level ranking
              </p>
              <p className="mt-2 text-[13px] leading-[1.7] text-gray-400">
                Every response is parsed for brand mentions, rank position,
                and frequency &mdash; then compared across models.
              </p>
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-gray-900">
                Actionable insights
              </p>
              <p className="mt-2 text-[13px] leading-[1.7] text-gray-400">
                We surface where AI models agree, where they diverge, and
                which brands are invisible to AI entirely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured categories */}
      <section className="border-t border-gray-100">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-300">
            Featured categories
          </p>
          <div className="mt-8 space-y-2">
            {CATEGORIES.map((cat) => (
              <a
                key={cat.slug}
                href={cat.live ? `/tracker/evergreen/${cat.slug}` : undefined}
                className={`block rounded-lg px-6 py-5 ${
                  cat.live
                    ? "bg-gray-50 transition-colors hover:bg-gray-100"
                    : "opacity-60"
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
