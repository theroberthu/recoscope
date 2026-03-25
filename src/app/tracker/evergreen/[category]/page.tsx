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

function buildTopBrands(mentions: BrandMention[]) {
  const map = new Map<string, { count: number; isFirst: boolean }>();
  for (const m of mentions) {
    const key = m.brand_name_normalized;
    if (!key) continue;
    const entry = map.get(key) ?? { count: 0, isFirst: false };
    entry.count += 1;
    if (toBool(m.is_first)) entry.isFirst = true;
    map.set(key, entry);
  }
  return Array.from(map.entries())
    .map(([name, { count, isFirst }]) => ({ name, mentionCount: count, isFirst }))
    .sort((a, b) => b.mentionCount - a.mentionCount);
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
  topBrands: { name: string; mentionCount: number; isFirst: boolean }[],
  agentRows: { agentName: string; topBrands: string[] }[],
): string {
  if (topBrands.length === 0) return "No recommendation data available yet.";

  const leader = topBrands[0];
  const runnerUp = topBrands[1];
  const firstPickCount = topBrands.filter((b) => b.isFirst).length;

  // Check cross-agent consensus on #1
  const firstPicks = agentRows.map((r) => r.topBrands[0]).filter(Boolean);
  const unanimousFirst = firstPicks.length > 1 && firstPicks.every((p) => p === firstPicks[0]);

  let takeaway = "";
  if (unanimousFirst) {
    takeaway = `${leader.name} is the unanimous #1 recommendation across all ${agentRows.length} AI models tested, with ${leader.mentionCount} total mentions.`;
  } else if (firstPickCount > 1) {
    const firstNames = topBrands.filter((b) => b.isFirst).map((b) => b.name);
    takeaway = `AI models split their top pick between ${firstNames.join(" and ")}, but ${leader.name} leads overall with ${leader.mentionCount} mentions.`;
  } else {
    takeaway = `${leader.name} dominates AI recommendations with ${leader.mentionCount} mentions across ${agentRows.length} models.`;
  }

  if (runnerUp) {
    takeaway += ` ${runnerUp.name} follows with ${runnerUp.mentionCount} mentions.`;
  }

  // Note the long tail
  if (topBrands.length > 5) {
    const tailBrands = topBrands.slice(3);
    const lowMention = tailBrands.filter((b) => b.mentionCount <= 2);
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

  const topBrands = buildTopBrands(mentions);
  const agentRows = buildAgentRows(mentions);

  // Use DB takeaway if available, otherwise synthesize from data
  const takeaway = insight?.key_takeaway || synthesizeTakeaway(topBrands, agentRows);

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeader
        title={categoryRow.name}
        subtitle={`Evergreen monthly benchmark — ${periodLabel}`}
        badge={run?.status === "published" ? "Published" : run?.status ?? "No data yet"}
      />

      <section className="mt-2">
        <KeyTakeawayPanel
          takeaway={takeaway}
          auditAngle={insight?.audit_angle ?? undefined}
        />
      </section>

      <section className="mt-12">
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

      <section className="mt-12">
        <CrossAgentTable
          rows={agentRows}
          whatThisMeans={[
            "High consensus on top picks suggests strong brand authority signals across the web",
            "Budget brands (BestOffice, Mainstays) appear in marketplace results but are rarely recommended by AI models",
            "AI models weight editorial reviews and spec-rich product pages more than marketplace popularity",
          ]}
        />
      </section>

      <section className="mt-12">
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

      <section className="mt-14">
        <CTABox />
      </section>
    </article>
  );
}
