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

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeader
        title={categoryRow.name}
        subtitle={`Evergreen monthly benchmark — ${periodLabel}`}
        badge={run?.status === "published" ? "Published" : run?.status ?? "No data yet"}
      />

      <section className="mt-8">
        <KeyTakeawayPanel
          takeaway={insight?.key_takeaway ?? "No takeaway available yet."}
          auditAngle={insight?.audit_angle ?? undefined}
        />
      </section>

      <section className="mt-10">
        <TopBrandsList brands={topBrands} />
      </section>

      <section className="mt-10">
        <CrossAgentTable rows={agentRows} />
      </section>

      <section className="mt-10">
        <InsightsSection
          commonTraits={insight?.common_traits ?? undefined}
          crossAgentDifferences={insight?.cross_agent_differences ?? undefined}
          marketGaps={insight?.market_gaps ?? undefined}
        />
      </section>

      <section className="mt-14">
        <CTABox />
      </section>
    </article>
  );
}
