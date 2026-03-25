import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getLatestRun, getBrandMentions, getRunInsight } from "@/lib/queries";
import type { BrandMention, RunInsight } from "@/lib/types";
// Components temporarily bypassed for plain-HTML render verification
// import {
//   SectionHeader, KeyTakeawayPanel, TopBrandsList,
//   CrossAgentTable, InsightsSection, CTABox,
// } from "@/components/tracker";

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

  // -----------------------------------------------------------------------
  // TEMPORARY: Plain HTML render to verify data reaches the browser.
  // No custom components. Restore styled version once this proves visible.
  // -----------------------------------------------------------------------
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 40, fontFamily: "system-ui, sans-serif" }}>
      <p style={{ background: "yellow", color: "black", padding: 16, fontSize: 24, fontWeight: "bold", textAlign: "center", border: "4px solid red", marginBottom: 24 }}>
        RECO TEST ACTIVE — build 85d984a
      </p>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>{categoryRow.name}</h1>
      <p style={{ color: "#666" }}>
        Status: <strong>{run?.status ?? "no run"}</strong> | Period: {periodLabel} | Source: {usingSample ? "SAMPLE" : "DATABASE"}
      </p>

      <hr style={{ margin: "24px 0" }} />

      <h2 style={{ fontSize: 20, marginBottom: 12 }}>Key Takeaway</h2>
      <p>{insight?.key_takeaway ?? "—"}</p>
      {insight?.audit_angle && <p style={{ color: "#666", marginTop: 8 }}>Audit angle: {insight.audit_angle}</p>}

      <hr style={{ margin: "24px 0" }} />

      <h2 style={{ fontSize: 20, marginBottom: 12 }}>Top Brands ({topBrands.length})</h2>
      {topBrands.length === 0 ? (
        <p style={{ color: "red" }}>No brands produced by buildTopBrands()</p>
      ) : (
        <ul>
          {topBrands.map((b) => (
            <li key={b.name}>
              <strong>{b.name}</strong> — {b.mentionCount} mentions {b.isFirst ? "(#1 pick)" : ""}
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: "24px 0" }} />

      <h2 style={{ fontSize: 20, marginBottom: 12 }}>Agent Rows ({agentRows.length})</h2>
      {agentRows.length === 0 ? (
        <p style={{ color: "red" }}>No rows produced by buildAgentRows()</p>
      ) : (
        <ul>
          {agentRows.map((r) => (
            <li key={r.agentName}>
              <strong>{r.agentName}</strong>: {r.topBrands.join(", ") || "—"}
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: "24px 0" }} />

      <h2 style={{ fontSize: 20, marginBottom: 12 }}>Insights</h2>
      <p><strong>Common Traits:</strong> {insight?.common_traits ?? "—"}</p>
      <p><strong>Cross-Agent Differences:</strong> {insight?.cross_agent_differences ?? "—"}</p>
      <p><strong>Market Gaps:</strong> {insight?.market_gaps ?? "—"}</p>

      <hr style={{ margin: "24px 0" }} />

      <h2 style={{ fontSize: 20, marginBottom: 12 }}>Raw Data Check</h2>
      <p>mentions.length: <strong>{mentions.length}</strong></p>
      <p>First mention keys: <strong>{mentions.length > 0 ? Object.keys(mentions[0]).join(", ") : "empty"}</strong></p>
      <pre style={{ background: "#f5f5f5", padding: 12, fontSize: 11, overflow: "auto", maxHeight: 300 }}>
        {JSON.stringify(mentions.slice(0, 3), null, 2)}
      </pre>

      <hr style={{ margin: "24px 0" }} />
      <p><a href="/audit" style={{ color: "#0066cc" }}>Request Your Audit →</a></p>
    </div>
  );
}
