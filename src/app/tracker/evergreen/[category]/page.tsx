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
// Helpers — Neon can return booleans as actual bools or strings
// ---------------------------------------------------------------------------

function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true" || v === "t";
  return Boolean(v);
}

// ---------------------------------------------------------------------------
// Transform brand mentions into component props
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
    // Use mention_rank <= 3 as fallback when is_top_3 is all false
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

  console.log("[evergreen] category:", categoryRow.id, categoryRow.slug);

  // Try published first, then fall back to any status
  let run = await getLatestRun(categoryRow.id, "published");
  if (!run) run = await getLatestRun(categoryRow.id);

  console.log("[evergreen] run:", run?.id ?? "none", "status:", run?.status ?? "—");

  let mentions: BrandMention[] = SAMPLE_BRANDS;
  let insight: RunInsight | null = SAMPLE_INSIGHT;
  let periodLabel = "March 2025";
  let usingSample = true;

  if (run) {
    const [realMentions, realInsight] = await Promise.all([
      getBrandMentions(run.id),
      getRunInsight(run.id),
    ]);

    console.log("[evergreen] mentions:", realMentions.length, "insight:", !!realInsight);
    if (realMentions.length > 0) {
      // Log a sample row to see actual types from Neon
      const sample = realMentions[0];
      console.log("[evergreen] sample mention row:", JSON.stringify(sample));
      console.log("[evergreen] types — is_top_3:", typeof sample.is_top_3, sample.is_top_3,
        "| is_first:", typeof sample.is_first, sample.is_first,
        "| mention_rank:", typeof sample.mention_rank, sample.mention_rank,
        "| brand_name_normalized:", typeof sample.brand_name_normalized, sample.brand_name_normalized);

      mentions = realMentions;
      insight = realInsight;
      periodLabel = run.period_label;
      usingSample = false;
    }
  }

  const topBrands = buildTopBrands(mentions);
  const agentRows = buildAgentRows(mentions);

  console.log("[evergreen] topBrands:", topBrands.length, JSON.stringify(topBrands.slice(0, 3)));
  console.log("[evergreen] agentRows:", agentRows.length, JSON.stringify(agentRows.slice(0, 2)));
  console.log("[evergreen] insight keys:", insight ? Object.keys(insight).filter(k => insight![k as keyof typeof insight]) : "null");

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeader
        title={categoryRow.name}
        subtitle={`Evergreen monthly benchmark — ${periodLabel}`}
        badge={usingSample ? "Sample data" : run?.status === "published" ? "Published" : "Draft"}
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

      {/* --- Temporary debug dump — remove before production --- */}
      <details className="mt-12 rounded border border-amber-300 bg-amber-50 p-4 text-xs">
        <summary className="cursor-pointer font-semibold text-amber-800">
          Debug: data passed to components ({usingSample ? "sample" : "real"})
        </summary>
        <div className="mt-3 space-y-4 overflow-x-auto font-mono">
          <div>
            <p className="font-bold">topBrands ({topBrands.length}):</p>
            <pre>{JSON.stringify(topBrands, null, 2)}</pre>
          </div>
          <div>
            <p className="font-bold">agentRows ({agentRows.length}):</p>
            <pre>{JSON.stringify(agentRows, null, 2)}</pre>
          </div>
          <div>
            <p className="font-bold">insight:</p>
            <pre>{JSON.stringify(insight, null, 2)}</pre>
          </div>
          <div>
            <p className="font-bold">raw mentions sample (first 2):</p>
            <pre>{JSON.stringify(mentions.slice(0, 2), null, 2)}</pre>
          </div>
        </div>
      </details>
    </article>
  );
}
