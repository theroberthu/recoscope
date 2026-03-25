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
// Sample data used when no published run exists yet
// ---------------------------------------------------------------------------

const SAMPLE_BRANDS: BrandMention[] = [
  { id: 0, run_id: 0, agent_name: "ChatGPT", prompt_number: 1, brand_name_raw: "Herman Miller", brand_name_normalized: "Herman Miller", mention_rank: 1, is_top_3: true, is_first: true, mentioned: true, created_at: "" },
  { id: 0, run_id: 0, agent_name: "ChatGPT", prompt_number: 1, brand_name_raw: "Steelcase", brand_name_normalized: "Steelcase", mention_rank: 2, is_top_3: true, is_first: false, mentioned: true, created_at: "" },
  { id: 0, run_id: 0, agent_name: "ChatGPT", prompt_number: 1, brand_name_raw: "Secretlab", brand_name_normalized: "Secretlab", mention_rank: 3, is_top_3: true, is_first: false, mentioned: true, created_at: "" },
  { id: 0, run_id: 0, agent_name: "Claude", prompt_number: 1, brand_name_raw: "Steelcase", brand_name_normalized: "Steelcase", mention_rank: 1, is_top_3: true, is_first: true, mentioned: true, created_at: "" },
  { id: 0, run_id: 0, agent_name: "Claude", prompt_number: 1, brand_name_raw: "Herman Miller", brand_name_normalized: "Herman Miller", mention_rank: 2, is_top_3: true, is_first: false, mentioned: true, created_at: "" },
  { id: 0, run_id: 0, agent_name: "Claude", prompt_number: 1, brand_name_raw: "HON", brand_name_normalized: "HON", mention_rank: 3, is_top_3: true, is_first: false, mentioned: true, created_at: "" },
  { id: 0, run_id: 0, agent_name: "Gemini", prompt_number: 1, brand_name_raw: "Herman Miller", brand_name_normalized: "Herman Miller", mention_rank: 1, is_top_3: true, is_first: true, mentioned: true, created_at: "" },
  { id: 0, run_id: 0, agent_name: "Gemini", prompt_number: 1, brand_name_raw: "Secretlab", brand_name_normalized: "Secretlab", mention_rank: 2, is_top_3: true, is_first: false, mentioned: true, created_at: "" },
  { id: 0, run_id: 0, agent_name: "Gemini", prompt_number: 1, brand_name_raw: "Steelcase", brand_name_normalized: "Steelcase", mention_rank: 3, is_top_3: true, is_first: false, mentioned: true, created_at: "" },
  { id: 0, run_id: 0, agent_name: "Perplexity", prompt_number: 1, brand_name_raw: "Herman Miller", brand_name_normalized: "Herman Miller", mention_rank: 1, is_top_3: true, is_first: true, mentioned: true, created_at: "" },
  { id: 0, run_id: 0, agent_name: "Perplexity", prompt_number: 1, brand_name_raw: "Steelcase", brand_name_normalized: "Steelcase", mention_rank: 2, is_top_3: true, is_first: false, mentioned: true, created_at: "" },
  { id: 0, run_id: 0, agent_name: "Perplexity", prompt_number: 1, brand_name_raw: "Autonomous", brand_name_normalized: "Autonomous", mention_rank: 3, is_top_3: true, is_first: false, mentioned: true, created_at: "" },
];

const SAMPLE_INSIGHT: RunInsight = {
  id: 0,
  run_id: 0,
  key_takeaway: "Herman Miller and Steelcase dominate AI recommendations for office chairs, appearing in the top 3 across all four agents tested. Secretlab is the most common challenger brand.",
  audit_angle: "Mid-market ergonomic brands are largely invisible to AI — a clear opportunity for brands investing in structured content and authority signals.",
  top_brands_summary: "Herman Miller leads with 4 first-place picks. Steelcase appears in every agent's top 3.",
  common_traits: "Top-recommended brands share strong review ecosystems, detailed product spec pages, and consistent mentions in editorial roundups.",
  cross_agent_differences: "Claude favors Steelcase over Herman Miller. Perplexity surfaces Autonomous, which no other agent recommends in the top 3.",
  market_gaps: "Budget ergonomic brands (under $500) are almost entirely absent from AI recommendations despite high search volume.",
  reviewed_by_human: false,
  created_at: "",
};

// ---------------------------------------------------------------------------
// Transform brand mentions into component props
// ---------------------------------------------------------------------------

function buildTopBrands(mentions: BrandMention[]) {
  const map = new Map<string, { count: number; isFirst: boolean }>();
  for (const m of mentions) {
    const entry = map.get(m.brand_name_normalized) ?? { count: 0, isFirst: false };
    entry.count += 1;
    if (m.is_first) entry.isFirst = true;
    map.set(m.brand_name_normalized, entry);
  }
  return Array.from(map.entries())
    .map(([name, { count, isFirst }]) => ({ name, mentionCount: count, isFirst }))
    .sort((a, b) => b.mentionCount - a.mentionCount);
}

function buildAgentRows(mentions: BrandMention[]) {
  const map = new Map<string, string[]>();
  for (const m of mentions) {
    if (!m.is_top_3) continue;
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

  let categoryRow;
  try {
    categoryRow = await getCategoryBySlug(category, "evergreen");
  } catch {
    categoryRow = null;
  }

  if (!categoryRow) notFound();

  // Attempt to load real run data; fall back to samples
  let mentions: BrandMention[] = SAMPLE_BRANDS;
  let insight: RunInsight | null = SAMPLE_INSIGHT;
  let periodLabel = "March 2025";
  let usingSample = true;

  try {
    const run = await getLatestRun(categoryRow.id);
    if (run) {
      const [realMentions, realInsight] = await Promise.all([
        getBrandMentions(run.id),
        getRunInsight(run.id),
      ]);
      if (realMentions.length > 0) {
        mentions = realMentions;
        insight = realInsight;
        periodLabel = run.period_label;
        usingSample = false;
      }
    }
  } catch {
    // keep sample data on DB error
  }

  const topBrands = buildTopBrands(mentions);
  const agentRows = buildAgentRows(mentions);

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeader
        title={categoryRow.name}
        subtitle={`Evergreen monthly benchmark — ${periodLabel}`}
        badge={usingSample ? "Sample data" : "Published"}
      />

      {insight?.key_takeaway && (
        <section className="mt-8">
          <KeyTakeawayPanel
            takeaway={insight.key_takeaway}
            auditAngle={insight.audit_angle ?? undefined}
          />
        </section>
      )}

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
