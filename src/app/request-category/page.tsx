import type { Metadata } from "next";
import { getCategoriesWithRuns } from "@/lib/queries";
import { CategoryRequestForm } from "@/components/audit/CategoryRequestForm";

export const metadata: Metadata = {
  title: "Request a Category",
  description:
    "Suggest a category for a future RecoScope benchmark. Browse existing reports before submitting.",
};

export const revalidate = 300;
export default async function RequestCategoryPage() {
  let categories: Awaited<ReturnType<typeof getCategoriesWithRuns>> = [];
  try {
    categories = await getCategoriesWithRuns();
  } catch (e) {
    console.error("[request-category] category data unavailable", e);
  }
  return (
    <div className="bg-dot-grid">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-8 pt-10">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/60">
          Tracker
        </p>
        <h1 className="mt-4 bg-gradient-to-r from-white to-cyan/70 bg-clip-text text-4xl font-bold sm:text-5xl leading-[1.1] tracking-tight text-transparent">
          Don&rsquo;t See Your Category?
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/40">
          Tell us which shopper category you want us to investigate. Requests
          help us choose future collections; a launch date is not guaranteed.
        </p>
      </section>

      {/* Form + Context */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Form */}
            <div>
              <p className="mb-6 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/50">
                Request a Category
              </p>
              <CategoryRequestForm />
            </div>

            {/* Right panel */}
            <div>
              <p className="mb-6 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
                What Happens Next
              </p>
              <ul className="space-y-4">
                {[
                  "We review category requests and consider demand",
                  "Categories with the most demand get prioritized",
                  "We can contact you if your category is selected",
                  "Published reports remain available in the benchmark directory",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan/10">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2.5 6.5L5 9L9.5 3.5"
                          stroke="#00d4aa"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-[14px] leading-relaxed text-[#c8ccd0]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-xl border border-white/10 bg-surface p-5">
                <h2 className="font-semibold">Already published</h2>
                <p className="mt-2 text-sm text-[var(--secondary)]">
                  Your category may already have a report.
                </p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-3">
                  {categories.map((c) => (
                    <a
                      key={c.slug}
                      href={`/tracker/${c.slug}`}
                      className="underline underline-offset-4 text-sm text-[var(--brand)]"
                    >
                      {c.name}
                    </a>
                  ))}
                </div>
                <a href="/tracker" className="text-link">
                  Browse all category reports →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
