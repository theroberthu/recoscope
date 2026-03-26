import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getLatestRun, getBrandMentions, getRunInsight } from "@/lib/queries";
import type { BrandMention, RunInsight } from "@/lib/types";
import {
  SectionHeader,
  KeyTakeawayPanel,
  TopBrandsList,
  CrossAgentTable,
  InsightsSection,
  CTABox,
} from "@/components/tracker";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true" || v === "t";
  return Boolean(v);
}

// ---------------------------------------------------------------------------
// Transforms
// ---------------------------------------------------------------------------

function buildTopBrands(
  mentions: BrandMention[],
  agentRows: { agentName: string; topBrands: string[] }[],
) {
  // Aggregate mention counts
  const map = new Map<string, { count: number; firstInAgents: string[] }>();
  for (const m of mentions) {
    const key = m.brand_name_normalized;
    if (!key) continue;
    const entry = map.get(key) ?? { count: 0, firstInAgents: [] };
    entry.count += 1;
    if (toBool(m.is_first)) entry.firstInAgents.push(m.agent_name);
    map.set(key, entry);
  }

  // Count how many agent top-3 lists each brand appears in
  const top3Appearances = new Map<string, number>();
  for (const row of agentRows) {
    for (const brand of row.topBrands.slice(0, 3)) {
      top3Appearances.set(brand, (top3Appearances.get(brand) ?? 0) + 1);
    }
  }

  const sorted = Array.from(map.entries())
    .map(([name, { count, firstInAgents }]) => ({ name, mentionCount: count, firstInAgents }))
    .sort((a, b) => b.mentionCount - a.mentionCount);

  // Assign labels — only ONE brand gets "Overall Leader"
  const leaderName = sorted[0]?.name;
  const totalAgents = agentRows.length;

  return sorted.map((brand) => {
    let label: string | undefined;

    if (brand.name === leaderName) {
      label = "Overall Leader";
    } else if ((top3Appearances.get(brand.name) ?? 0) >= Math.max(totalAgents - 1, 2)) {
      label = "High Consensus";
    } else if (brand.firstInAgents.length === 1) {
      label = `Top in ${brand.firstInAgents[0]}`;
    }

    return { name: brand.name, mentionCount: brand.mentionCount, label };
  });
}

function buildAgentRows(mentions: BrandMention[]) {
  const map = new Map<string, string[]>();
  for (const m of mentions) {
    const isTop3 = toBool(m.is_top_3) || Number(m.mention_rank) <= 3;
    if (!isTop3) continue;
    const list = map.get(m.agent_name) ?? [];
    list.push(m.brand_name_normalized);
    map.set(m.agent_name, list);
  }
  return Array.from(map.entries()).map(([agentName, topBrands]) => ({
    agentName,
    topBrands,
  }));
}

// ---------------------------------------------------------------------------
// Synthesize takeaway from data when DB insight is missing
// ---------------------------------------------------------------------------

function synthesizeTakeaway(
  topBrands: { name: string; mentionCount: number; label?: string }[],
  agentRows: { agentName: string; topBrands: string[] }[],
): string {
  if (topBrands.length === 0) return "No recommendation data available yet.";

  const leader = topBrands[0];
  const runnerUp = topBrands[1];

  // Check cross-agent consensus on #1
  const firstPicks = agentRows.map((r) => r.topBrands[0]).filter(Boolean);
  const unanimousFirst = firstPicks.length > 1 && firstPicks.every((p) => p === firstPicks[0]);

  let takeaway = "";
  if (unanimousFirst) {
    takeaway = `${leader.name} is the unanimous #1 recommendation across all ${agentRows.length} AI models tested, with ${leader.mentionCount} total mentions.`;
  } else {
    const consensusBrands = topBrands.filter((b) => b.label === "High Consensus");
    if (consensusBrands.length > 0) {
      takeaway = `${leader.name} leads with ${leader.mentionCount} mentions, while ${consensusBrands.map((b) => b.name).join(" and ")} show strong cross-model consensus.`;
    } else {
      takeaway = `${leader.name} dominates AI recommendations with ${leader.mentionCount} mentions across ${agentRows.length} models.`;
    }
  }

  if (runnerUp) {
    takeaway += ` ${runnerUp.name} follows with ${runnerUp.mentionCount} mentions.`;
  }

  if (topBrands.length > 5) {
    const lowMention = topBrands.slice(3).filter((b) => b.mentionCount <= 2);
    if (lowMention.length > 0) {
      takeaway += ` ${lowMention.length} brand${lowMention.length > 1 ? "s" : ""} appear only in isolated mentions, suggesting fragmented visibility outside the top tier.`;
    }
  }

  return takeaway;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const label = category.replace(/-/g, " ");
  return {
    title: `${label} — AI Recommendation Tracker | RecoScope`,
    description: `See which brands AI models recommend for ${label}. Monthly benchmark data from ChatGPT, Claude, Gemini, and more.`,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function EvergreenCategoryPage({ params }: Props) {
  const { category } = await params;

  const categoryRow = await getCategoryBySlug(category, "evergreen");
  if (!categoryRow) notFound();

  let run = await getLatestRun(categoryRow.id, "published");
  if (!run) run = await getLatestRun(categoryRow.id);

  let mentions: BrandMention[] = [];
  let insight: RunInsight | null = null;
  let periodLabel = "—";

  if (run) {
    const [realMentions, realInsight] = await Promise.all([
      getBrandMentions(run.id),
      getRunInsight(run.id),
    ]);
    mentions = realMentions;
    insight = realInsight;
    periodLabel = run.period_label;
  }

  const agentRows = buildAgentRows(mentions);
  const topBrands = buildTopBrands(mentions, agentRows);

  // Use DB takeaway if available, otherwise synthesize from data
  const takeaway = insight?.key_takeaway || synthesizeTakeaway(topBrands, agentRows);

  return (
    <article className="mx-auto max-w-2xl px-6 py-24">
      <SectionHeader
        title={categoryRow.name}
        subtitle={`Evergreen monthly benchmark \u2014 ${periodLabel}`}
        badge={run?.status === "published" ? "Published" : run?.status ?? "No data yet"}
      />

      <section>
        <KeyTakeawayPanel
          takeaway={takeaway}
          auditAngle={insight?.audit_angle ?? undefined}
        />
      </section>

      <section className="mt-20">
        <TopBrandsList
          brands={topBrands}
          whyTheseWin={[
            "Strong ergonomic positioning with detailed product specifications and adjustment features",
            "Deep review ecosystems across major retail and editorial platforms",
            "Consistent brand presence in professional and workspace-focused content",
            "Clear price-tier positioning that AI models can reference confidently",
          ]}
        />
      </section>

      <section className="mt-20">
        <CrossAgentTable
          rows={agentRows}
          whatThisMeans={[
            "High consensus on top picks suggests strong brand authority signals across the web",
            "Budget brands (BestOffice, Mainstays) appear in marketplace results but are rarely recommended by AI models",
            "AI models weight editorial reviews and spec-rich product pages more than marketplace popularity",
          ]}
        />
      </section>

      <section className="mt-20">
        <InsightsSection
          commonTraits={insight?.common_traits ?? undefined}
          crossAgentDifferences={insight?.cross_agent_differences ?? undefined}
          marketGaps={insight?.market_gaps ?? undefined}
          opportunityBullets={[
            "Mid-market ergonomic brands ($300\u2013$600) are almost invisible to AI \u2014 structured content and expert reviews could open this segment",
            "Brands that lack detailed spec pages and third-party editorial coverage are consistently excluded from top recommendations",
            "Standing desk chair and hybrid seating categories are underserved \u2014 no brand owns this niche in AI results",
          ]}
        />
      </section>

      <section className="mt-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-300">
          How we measure this
        </p>
        <div className="mt-5 space-y-4 text-[13px] leading-[1.8] text-gray-400">
          <p>
            Each benchmark runs the same standardized prompts across multiple leading AI systems,
            including ChatGPT, Claude, Gemini, and Perplexity. We use consistent, category-specific
            questions designed to surface genuine product recommendations &mdash; not sponsored results.
          </p>
          <p>
            Responses are parsed to extract brand mentions, rank position, and frequency. We then
            analyze cross-model agreement, identify which brands consistently appear in top positions,
            and flag where AI outputs diverge from marketplace trends.
          </p>
          <p>
            Evergreen categories are benchmarked monthly. Results reflect organic AI behavior at the
            time of testing.{" "}
            <a href="/methodology" className="text-gray-500 underline underline-offset-2 transition-colors hover:text-gray-900">
              Read the full methodology
            </a>
          </p>
        </div>
      </section>

      <section className="mt-24">
        <CTABox />
      </section>
    </article>
  );
}
