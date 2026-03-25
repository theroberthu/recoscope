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

  // --- Step 1: load category (only hard failure = 404) ---
  let categoryRow;
  try {
    categoryRow = await getCategoryBySlug(category, "evergreen");
  } catch (err) {
    // DB totally down — render the error visibly, don't crash
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: 40, fontFamily: "system-ui, sans-serif" }}>
        <p style={{ background: "red", color: "white", padding: 16, fontSize: 18, fontWeight: "bold" }}>
          DATABASE ERROR (category lookup): {String(err)}
        </p>
      </div>
    );
  }

  if (!categoryRow) notFound();

  // --- Step 2: load run + mentions + insights (catch errors visibly) ---
  let run = null;
  let mentions: BrandMention[] = [];
  let insight: RunInsight | null = null;
  let periodLabel = "—";
  let dataError: string | null = null;

  try {
    run = await getLatestRun(categoryRow.id, "published");
    if (!run) run = await getLatestRun(categoryRow.id);

    if (run) {
      const [realMentions, realInsight] = await Promise.all([
        getBrandMentions(run.id),
        getRunInsight(run.id),
      ]);
      mentions = realMentions;
      insight = realInsight;
      periodLabel = run.period_label;
    }
  } catch (err) {
    dataError = String(err);
  }

  // --- Step 3: transform (always runs, even on empty arrays) ---
  const topBrands = buildTopBrands(mentions);
  const agentRows = buildAgentRows(mentions);

  // --- Step 4: render EVERYTHING unconditionally ---
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 40, fontFamily: "system-ui, sans-serif" }}>
      <p style={{ background: "yellow", color: "black", padding: 16, fontSize: 24, fontWeight: "bold", textAlign: "center", border: "4px solid red", marginBottom: 24 }}>
        RECO TEST ACTIVE — build 004c9f9v2
      </p>

      {/* --- Debug counters --- */}
      <div style={{ background: "#eee", padding: 12, marginBottom: 24, fontFamily: "monospace", fontSize: 14 }}>
        <p>topBrands length: <strong>{topBrands.length}</strong></p>
        <p>agentRows length: <strong>{agentRows.length}</strong></p>
        <p>insight exists: <strong>{String(insight !== null)}</strong></p>
        <p>mentions length: <strong>{mentions.length}</strong></p>
        <p>run: <strong>{run ? `id=${run.id} status=${run.status}` : "null"}</strong></p>
        <p>dataError: <strong>{dataError ?? "none"}</strong></p>
      </div>

      {/* --- Visible error banner if data fetch failed --- */}
      {dataError && (
        <p style={{ background: "red", color: "white", padding: 12, marginBottom: 16, fontWeight: "bold" }}>
          DATA FETCH ERROR: {dataError}
        </p>
      )}

      {/* --- Header --- */}
      <SectionHeader
        title={categoryRow.name}
        subtitle={`Evergreen monthly benchmark — ${periodLabel}`}
        badge={run?.status ?? "no run"}
      />

      <div style={{ padding: '24px', background: '#fee2e2', color: '#991b1b', marginTop: '24px' }}>
        <h2>RECO RENDER TEST</h2>
        <p>If you can see this, the page is rendering below the hero.</p>
        <p>topBrands length: {String(topBrands?.length ?? 'undefined')}</p>
        <p>agentRows length: {String(agentRows?.length ?? 'undefined')}</p>
        <p>mentions length: {String(mentions?.length ?? 'undefined')}</p>
        <p>insight exists: {String(!!insight)}</p>
        <pre>{JSON.stringify({ topBrands, agentRows, mentions: mentions?.slice(0,2), insight }, null, 2)}</pre>
      </div>

      {/* --- Key Takeaway (always rendered) --- */}
      <section style={{ marginTop: 32 }}>
        <KeyTakeawayPanel
          takeaway={insight?.key_takeaway ?? "No takeaway available."}
          auditAngle={insight?.audit_angle ?? undefined}
        />
      </section>

      {/* --- Top Brands (always rendered) --- */}
      <section style={{ marginTop: 32 }}>
        <TopBrandsList brands={topBrands} />
      </section>

      {/* --- Cross Agent Table (always rendered) --- */}
      <section style={{ marginTop: 32 }}>
        <CrossAgentTable rows={agentRows} />
      </section>

      {/* --- Insights (always rendered) --- */}
      <section style={{ marginTop: 32 }}>
        <InsightsSection
          commonTraits={insight?.common_traits ?? "—"}
          crossAgentDifferences={insight?.cross_agent_differences ?? "—"}
          marketGaps={insight?.market_gaps ?? "—"}
        />
      </section>

      {/* --- CTA (always rendered) --- */}
      <section style={{ marginTop: 48 }}>
        <CTABox />
      </section>
    </div>
  );
}
