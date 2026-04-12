import type { Metadata } from "next";
import { AuditRequestForm } from "@/components/audit/AuditRequestForm";
import { getActiveCategories, getCrossAgentPreview } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Free AI Visibility Audit",
  description:
    "We'll run your brand through ChatGPT, Claude, Gemini, and Perplexity and show you exactly where you stand — free.",
};

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  let categories: { name: string; slug: string }[] = [];
  let crossAgentData: { agent_name: string; brand: string; rank: number }[] = [];

  try {
    [categories, crossAgentData] = await Promise.all([
      getActiveCategories(),
      getCrossAgentPreview(),
    ]);
  } catch {
    // DB unavailable
  }

  // Deduplicate: best rank per brand per agent, then top 3 per agent
  const agentBrandRank = new Map<string, Map<string, number>>();
  for (const row of crossAgentData) {
    const brandMap = agentBrandRank.get(row.agent_name) ?? new Map<string, number>();
    const current = brandMap.get(row.brand);
    if (current === undefined || row.rank < current) {
      brandMap.set(row.brand, row.rank);
    }
    agentBrandRank.set(row.agent_name, brandMap);
  }
  const agentEntries = Array.from(agentBrandRank.entries())
    .map(([agent, brandMap]) => [
      agent,
      Array.from(brandMap.entries())
        .sort((a, b) => a[1] - b[1])
        .slice(0, 3)
        .map(([brand]) => brand),
    ] as [string, string[]])
    .slice(0, 5);

  return (
    <div className="bg-dot-grid">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-8 pt-10">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/60">
          Free Audit
        </p>
        <h1 className="mt-4 bg-gradient-to-r from-white to-cyan/70 bg-clip-text text-5xl font-bold leading-[1.1] tracking-tight text-transparent">
          Is AI Recommending Your Brand?
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/40">
          We&rsquo;ll run your brand through ChatGPT, Claude, Gemini, and Perplexity
          and show you exactly where you stand &mdash; free.
        </p>
      </section>

      {/* Why not DIY */}
      <section className="mx-auto max-w-3xl px-6 pb-10 pt-6">
        <div className="rounded-xl border border-white/5 bg-surface px-6 py-5">
          <p className="text-[14px] font-semibold text-white/70">
            Why not just ask ChatGPT yourself?
          </p>
          <p className="mt-2 text-[13px] leading-[1.7] text-white/40">
            We run standardized buyer persona prompts &mdash; not casual questions &mdash; across
            all four models simultaneously. Results are normalized and scored so you can compare
            your brand&rsquo;s position across ChatGPT, Claude, Gemini, and Perplexity in one view.
            You get a competitive breakdown, not just a single answer.
          </p>
        </div>
      </section>

      {/* Form + Value Prop */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-6 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/50">
                Request Your Audit
              </p>
              <AuditRequestForm
                categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
              />
            </div>

            <div>
              <p className="mb-6 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
                What you&rsquo;ll get
              </p>
              <div className="space-y-5 text-[14px] leading-relaxed text-[#c8ccd0]">
                <p>How 4 major AI models talk about your brand.</p>
                <p>Side-by-side: are you visible in independent AI vs commerce-influenced AI?</p>
                <p>Which buyer prompts surface your competitors instead of you.</p>
                <p>Actionable recommendations to improve your AI visibility.</p>
              </div>
              <p className="mt-8 text-[13px] leading-relaxed text-white/30">
                The audit is free. No call required. Delivered to your inbox within 48 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof — live benchmark sample */}
      {agentEntries.length > 0 && (
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/50">
              Sample from our latest benchmark
            </p>
            <p className="mt-2 text-[14px] text-white/40">
              Your audit covers your brand across these same AI models.
            </p>

            <div className="mt-8 overflow-x-auto rounded-xl border border-white/10 bg-surface">
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
                  {agentEntries.map(([agent, brands], i) => (
                    <tr key={agent} className={i < agentEntries.length - 1 ? "border-b border-white/5" : ""}>
                      <td className="px-6 py-4 font-mono text-[13px] font-semibold text-white/60">{agent}</td>
                      {[0, 1, 2].map((idx) => (
                        <td key={idx} className={`px-6 py-4 text-[13px] ${idx === 0 ? "font-medium text-white/70" : "text-white/30"}`}>
                          {brands[idx] ?? "\u2014"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-6 text-center text-[14px] text-white/30">
              Your brand could be in this data.{" "}
              <span className="text-cyan/60">Find out where.</span>
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
