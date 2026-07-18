import type { Metadata } from "next";
import { ScrollFade } from "@/components/home/ScrollFade";
import { getCategoriesWithSchedule } from "@/lib/queries";

export const metadata: Metadata = {
  title: "AI Recommendation Reports by Category",
  description: "Weekly and monthly reports tracking which brands AI models recommend across office chairs, running shoes, protein powder & more.",
};

export const dynamic = 'force-dynamic';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function TrackerIndexPage() {
  let categories: { name: string; slug: string; tracker_type: string; last_run_date: string | null }[] = [];

  try {
    categories = await getCategoriesWithSchedule();
  } catch {
    // DB unavailable
  }

  return (
    <div className="bg-dot-grid min-h-screen">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-8 pt-24">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/60">
          Tracker
        </p>
        <h1 className="mt-4 bg-gradient-to-r from-white to-cyan/70 bg-clip-text text-5xl font-bold leading-[1.1] tracking-tight text-transparent">
          AI Recommendation Benchmarks
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/40">
          We run the same buying prompts through ChatGPT, Claude, Gemini, and Perplexity
          every month &mdash; and track which brands AI recommends. Pick a category to see the data.
        </p>
        <p className="mt-4 text-[13px]">
          <a href="/platform" className="text-cyan/60 transition-colors hover:text-cyan">
            See how these reports are produced &rarr;
          </a>
        </p>
      </section>

      {/* Report Schedule */}
      {categories.length > 0 && (
        <ScrollFade className="mx-auto max-w-3xl px-6 py-20">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/50">
            Reports
          </p>

          {/* Desktop table */}
          <div className="mt-8 hidden overflow-x-auto rounded-xl border border-white/10 bg-surface sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white/25">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white/25">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white/25">
                    Last Published
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => (
                  <tr
                    key={cat.slug}
                    className={`transition-colors hover:bg-white/[0.02] ${
                      i < categories.length - 1 ? "border-b border-white/5" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <a
                        href={`/tracker/${cat.slug}`}
                        className="text-[14px] font-semibold text-white transition-colors hover:text-cyan"
                      >
                        {cat.name}
                      </a>
                      {!cat.last_run_date && (
                        <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white/25">
                          Coming Soon
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                          cat.tracker_type === "seasonal"
                            ? "bg-amber-400/10 text-amber-400/70"
                            : "bg-cyan/10 text-cyan/70"
                        }`}
                      >
                        {cat.tracker_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[13px] text-white/40">
                      {cat.last_run_date ? formatDate(cat.last_run_date) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-8 space-y-3 sm:hidden">
            {categories.map((cat) => (
              <a
                key={cat.slug}
                href={`/tracker/${cat.slug}`}
                className="glow-card block rounded-xl border border-white/10 bg-surface p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-white">
                    {cat.name}
                    {!cat.last_run_date && (
                      <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white/25">
                        Coming Soon
                      </span>
                    )}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                      cat.tracker_type === "seasonal"
                        ? "bg-amber-400/10 text-amber-400/70"
                        : "bg-cyan/10 text-cyan/70"
                    }`}
                  >
                    {cat.tracker_type}
                  </span>
                </div>
                <div className="mt-3 font-mono text-[12px]">
                  <span className="text-white/25">Last: </span>
                  <span className="text-white/40">{cat.last_run_date ? formatDate(cat.last_run_date) : "—"}</span>
                </div>
              </a>
            ))}
          </div>

          <p className="mt-6 text-[13px] text-white/30">
            Reports are updated on a rolling basis.{" "}
            <a href="/subscribe" className="text-cyan/60 underline underline-offset-2 transition-colors hover:text-cyan">
              Subscribe
            </a>
            {" "}to get notified when new data drops.
          </p>
        </ScrollFade>
      )}

      {/* Missing category callout */}
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-4">
        <div className="rounded-xl border border-white/10 bg-surface px-8 py-8 sm:flex sm:items-start sm:justify-between sm:gap-8">
          <div>
            <p className="text-[15px] font-semibold text-white">
              Don&rsquo;t see your category yet?
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/40">
              We&rsquo;re adding new categories every month. Request yours and we&rsquo;ll prioritize based on demand.
            </p>
            <a
              href="/request-category"
              className="mt-4 inline-block rounded-full bg-cyan px-6 py-2.5 font-mono text-[12px] font-bold tracking-tight text-void transition-colors hover:bg-cyan/90"
            >
              Request a Category
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
