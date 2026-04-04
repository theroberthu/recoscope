import type { Metadata } from "next";
import { AuditForm } from "@/components/audit/AuditForm";
import { getActiveCategories, getAuditStats, getCrossAgentPreview } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Subscribe",
  description:
    "Free monthly AI recommendation benchmarks delivered to your inbox.",
};

export const dynamic = "force-dynamic";

export default async function SubscribePage() {
  let categories: { name: string; slug: string }[] = [];
  let stats = { brandsTracked: 0, categoriesActive: 0 };
  let crossAgentData: { agent_name: string; brand: string; rank: number }[] = [];

  try {
    [categories, stats, crossAgentData] = await Promise.all([
      getActiveCategories(),
      getAuditStats(),
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

  const VALUE_ITEMS = [
    "Monthly brand ranking reports for your categories",
    "Cross-model comparison data (ChatGPT vs Claude vs Gemini vs Perplexity)",
    "Independent vs commerce-influenced AI analysis",
    "Early access to new category launches",
  ];

  return (
    <div className="bg-dot-grid">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-8 pt-10">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/60">
          Free Reports
        </p>
        <h1 className="mt-4 bg-gradient-to-r from-white to-cyan/70 bg-clip-text text-5xl font-bold leading-[1.1] tracking-tight text-transparent">
          Get the Reports
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/40">
          Free monthly AI recommendation benchmarks delivered to your inbox.
          See which brands AI models recommend in your category &mdash; and which ones they ignore.
        </p>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 bg-surface px-5 py-5 text-center">
            <p className="font-mono text-3xl font-bold text-cyan">{stats.brandsTracked || "100+"}</p>
            <p className="mt-1 text-[12px] text-white/30">Brands Tracked</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-surface px-5 py-5 text-center">
            <p className="font-mono text-3xl font-bold text-cyan">4</p>
            <p className="mt-1 text-[12px] text-white/30">AI Models Benchmarked</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-surface px-5 py-5 text-center">
            <p className="font-mono text-3xl font-bold text-cyan">{stats.categoriesActive || "3+"}</p>
            <p className="mt-1 text-[12px] text-white/30">Active Categories</p>
          </div>
        </div>
      </section>

      {/* Form + Value Prop */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-6 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/50">
                Subscribe
              </p>
              <AuditForm categories={categories.map((c) => ({ name: c.name, slug: c.slug }))} />
            </div>

            <div>
              <p className="mb-6 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
                What you get
              </p>
              <ul className="space-y-4">
                {VALUE_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan/10">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6.5L5 9L9.5 3.5" stroke="#00d4aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-[14px] leading-relaxed text-[#c8ccd0]">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4">
                <p className="text-[13px] leading-relaxed text-white/30">
                  Need weekly reports or custom brand tracking?{" "}
                  <span className="text-cyan/50">Paid plans coming soon.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample preview */}
      {agentEntries.length > 0 && (
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/50">
              See what we track
            </p>
            <p className="mt-2 text-[14px] text-white/40">
              This is real data from our latest benchmark. Subscribers get this monthly.
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
