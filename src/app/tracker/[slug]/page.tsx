import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleSchema, FAQSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import {
  getCategoryBySlug, getLatestRun, getBrandMentions, getRunInsight,
  getPreviousRun, getAllSeasonalRuns, getBrandRankingsForRuns,
  getAllRunsForCategory, getRunByPeriod, getPromptsForRun,
} from "@/lib/queries";
import type { BrandMention, RunInsight, TrackerType, Run } from "@/lib/types";
import { cleanText } from "@/lib/clean-text";
import { ScrollFade } from "@/components/home/ScrollFade";
import { TrendChart } from "@/components/seasonal/TrendChart";
import { WeekNav } from "@/components/seasonal/WeekNav";
import type { Movement } from "@/components/tracker/TopBrandsList";
import { PromptBreakdown } from "@/components/tracker/PromptBreakdown";
import {
  SectionHeader,
  KeyTakeawayPanel,
  TopBrandsList,
  CrossAgentTable,
} from "@/components/tracker";
import { ReportViewTracker } from "@/components/tracker/ReportViewTracker";
import { PromptsUsed } from "@/components/tracker/PromptsUsed";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true" || v === "t";
  return Boolean(v);
}

function toBullets(text: string | null | undefined): string[] | undefined {
  if (!text) return undefined;
  const trimmed = text.trim();
  if (!trimmed) return undefined;

  const byLine = trimmed
    .split(/\n+/)
    .map((s) => s.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  if (byLine.length > 1) return byLine;

  const bySentence = trimmed
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
  if (bySentence.length > 1) return bySentence;

  return [trimmed];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatRunDate(runDate: unknown): string {
  // Handle Date objects from Neon
  if (runDate instanceof Date) {
    return `${MONTHS[runDate.getUTCMonth()]} ${runDate.getUTCDate()}`;
  }
  // Handle "YYYY-MM-DD" strings
  const str = String(runDate);
  const parts = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (parts) {
    return `${MONTHS[parseInt(parts[2], 10) - 1]} ${parseInt(parts[3], 10)}`;
  }
  // Handle full date strings like "Wed Mar 25 2026 00:00:00 GMT..."
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
  }
  return str;
}

const VALID_TYPES = new Set<string>(["evergreen", "seasonal"]);

export const revalidate = 60; // revalidate every minute

const TYPE_LABELS: Record<string, string> = {
  evergreen: "Evergreen monthly benchmark",
  seasonal: "Seasonal weekly benchmark",
};

// ---------------------------------------------------------------------------
// Transforms
// ---------------------------------------------------------------------------

function buildTopBrands(
  mentions: BrandMention[],
  agentRows: { agentName: string; topBrands: string[] }[],
) {
  const map = new Map<string, { count: number; firstInAgents: string[] }>();
  for (const m of mentions) {
    const key = m.brand_name_normalized;
    if (!key) continue;
    const entry = map.get(key) ?? { count: 0, firstInAgents: [] };
    entry.count += 1;
    if (toBool(m.is_first)) entry.firstInAgents.push(m.agent_name);
    map.set(key, entry);
  }

  const top3Appearances = new Map<string, number>();
  for (const row of agentRows) {
    for (const brand of row.topBrands.slice(0, 3)) {
      top3Appearances.set(brand, (top3Appearances.get(brand) ?? 0) + 1);
    }
  }

  const sorted = Array.from(map.entries())
    .map(([name, { count, firstInAgents }]) => ({ name, mentionCount: count, firstInAgents }))
    .sort((a, b) => b.mentionCount - a.mentionCount);

  const topCount = sorted[0]?.mentionCount ?? 0;
  const tiedAtTop = sorted.filter((b) => b.mentionCount === topCount);
  const totalAgents = agentRows.length;

  // Track which agents pick each brand as #1
  const brandFirstPickAgents = new Map<string, string[]>();
  for (const row of agentRows) {
    if (row.topBrands[0]) {
      const list = brandFirstPickAgents.get(row.topBrands[0]) ?? [];
      list.push(row.agentName);
      brandFirstPickAgents.set(row.topBrands[0], list);
    }
  }

  return sorted.map((brand) => {
    let label: string | undefined;
    const inTop3Count = top3Appearances.get(brand.name) ?? 0;
    const firstPickAgents = brandFirstPickAgents.get(brand.name) ?? [];

    if (brand.mentionCount === topCount && tiedAtTop.length === 1 && inTop3Count === 0) {
      label = "Most Mentioned, Never Top-Picked";
    } else if (brand.mentionCount === topCount && tiedAtTop.length === 1) {
      label = "Overall Leader";
    } else if (brand.mentionCount === topCount && tiedAtTop.length > 1) {
      label = "Tied #1";
    } else if (inTop3Count >= Math.max(totalAgents - 1, 2)) {
      label = "High Consensus";
    } else if (firstPickAgents.length === 1) {
      const displayName = firstPickAgents[0].charAt(0).toUpperCase() + firstPickAgents[0].slice(1);
      label = `Top in ${displayName}`;
    }
    return { name: brand.name, mentionCount: brand.mentionCount, label, neverTopPicked: inTop3Count === 0 };
  });
}

function buildAgentRows(mentions: BrandMention[]) {
  // Track the best (lowest) rank per brand per agent across all prompts
  const agentBrandRank = new Map<string, Map<string, number>>();

  for (const m of mentions) {
    const isTop3 = toBool(m.is_top_3) || Number(m.mention_rank) <= 3;
    if (!isTop3) continue;

    const brandMap = agentBrandRank.get(m.agent_name) ?? new Map<string, number>();
    const rank = Number(m.mention_rank);
    const current = brandMap.get(m.brand_name_normalized);

    if (current === undefined || rank < current) {
      brandMap.set(m.brand_name_normalized, rank);
    }
    agentBrandRank.set(m.agent_name, brandMap);
  }

  return Array.from(agentBrandRank.entries()).map(([agentName, brandMap]) => ({
    agentName,
    topBrands: Array.from(brandMap.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([brand]) => brand),
  }));
}

// ---------------------------------------------------------------------------
// AI vs Marketplace split
// ---------------------------------------------------------------------------

const AI_AGENTS = new Set(["ChatGPT", "Claude", "Gemini", "Perplexity"]);
const MARKETPLACE_AGENTS = new Set(["Rufus", "Sparky", "Amazon Rufus", "Walmart Sparky"]);

function buildChannelSplit(mentions: BrandMention[]) {
  const ai = new Map<string, number>();
  const marketplace = new Map<string, number>();
  for (const m of mentions) {
    const key = m.brand_name_normalized;
    if (!key) continue;
    if (AI_AGENTS.has(m.agent_name)) ai.set(key, (ai.get(key) ?? 0) + 1);
    if (MARKETPLACE_AGENTS.has(m.agent_name)) marketplace.set(key, (marketplace.get(key) ?? 0) + 1);
  }
  const sortDesc = (map: Map<string, number>) =>
    Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  return {
    ai: sortDesc(ai), marketplace: sortDesc(marketplace),
    hasData: ai.size > 0 || marketplace.size > 0,
    hasBothChannels: ai.size > 0 && marketplace.size > 0,
  };
}

// ---------------------------------------------------------------------------
// Synthesize takeaway
// ---------------------------------------------------------------------------

function synthesizeTakeaway(
  topBrands: { name: string; mentionCount: number; label?: string }[],
  agentRows: { agentName: string; topBrands: string[] }[],
): string {
  if (topBrands.length === 0) return "No recommendation data available yet.";

  const leader = topBrands[0];
  const firstPicks = agentRows.map((r) => r.topBrands[0]).filter(Boolean);
  const unanimousFirst = firstPicks.length > 1 && firstPicks.every((p) => p === firstPicks[0]);

  // Count AI models vs marketplace agents separately
  const aiCount = agentRows.filter((r) => AI_AGENTS.has(r.agentName)).length;
  const mktCount = agentRows.filter((r) => MARKETPLACE_AGENTS.has(r.agentName)).length;
  const agentLabel = mktCount > 0
    ? `${aiCount} AI model${aiCount !== 1 ? "s" : ""} and ${mktCount} marketplace agent${mktCount !== 1 ? "s" : ""}`
    : `${agentRows.length} AI model${agentRows.length !== 1 ? "s" : ""}`;

  // Check for ties at the top
  const tiedAtTop = topBrands.filter((b) => b.mentionCount === leader.mentionCount);

  let takeaway = "";
  if (tiedAtTop.length >= 3) {
    const names = tiedAtTop.slice(0, 3).map((b) => b.name);
    takeaway = `${names.join(", ")} are tied at ${leader.mentionCount} mentions each across ${agentLabel}. No single brand dominates.`;
  } else if (tiedAtTop.length === 2) {
    takeaway = `${tiedAtTop[0].name} and ${tiedAtTop[1].name} are tied at ${leader.mentionCount} mentions each across ${agentLabel}.`;
  } else if (unanimousFirst) {
    takeaway = `${leader.name} is the unanimous #1 recommendation across ${agentLabel}, with ${leader.mentionCount} total mentions.`;
  } else {
    takeaway = `${leader.name} leads with ${leader.mentionCount} mentions across ${agentLabel}.`;
  }

  const nextAfterTie = topBrands[tiedAtTop.length];
  if (nextAfterTie && nextAfterTie.mentionCount < leader.mentionCount) {
    takeaway += ` ${nextAfterTie.name} follows with ${nextAfterTie.mentionCount} mentions.`;
  }

  return takeaway;
}

// ---------------------------------------------------------------------------
// Seasonal movement computation
// ---------------------------------------------------------------------------

function computeMovements(
  currentBrands: { name: string; mentionCount: number }[],
  prevBrands: { name: string; mentionCount: number }[],
): {
  movements: Map<string, Movement>;
  droppedBrands: { name: string; previousRank: number }[];
} {
  const prevRankMap = new Map<string, number>();
  prevBrands.forEach((b, i) => prevRankMap.set(b.name, i + 1));

  const currentNames = new Set(currentBrands.map((b) => b.name));
  const movements = new Map<string, Movement>();

  currentBrands.forEach((b, i) => {
    const currentRank = i + 1;
    const prevRank = prevRankMap.get(b.name);

    if (prevRank === undefined) {
      movements.set(b.name, { type: "new" });
    } else if (prevRank > currentRank) {
      movements.set(b.name, { type: "up", positions: prevRank - currentRank });
    } else if (prevRank < currentRank) {
      movements.set(b.name, { type: "down", positions: currentRank - prevRank });
    } else {
      movements.set(b.name, { type: "steady" });
    }
  });

  const droppedBrands: { name: string; previousRank: number }[] = [];
  for (const [name, rank] of prevRankMap) {
    if (!currentNames.has(name)) {
      droppedBrands.push({ name, previousRank: rank });
    }
  }
  droppedBrands.sort((a, b) => a.previousRank - b.previousRank);

  return { movements, droppedBrands };
}

// ---------------------------------------------------------------------------
// Channel split bar
// ---------------------------------------------------------------------------

function ChannelBar({ items, label }: { items: { name: string; count: number }[]; label: string }) {
  const max = items.length > 0 ? items[0].count : 1;
  return (
    <div>
      <p className="mb-4 font-mono text-[12px] font-semibold text-white/50">{label}</p>
      {items.length === 0 ? (
        <p className="text-[13px] text-white/20">No data yet</p>
      ) : (
        <div className="space-y-2">
          {items.map((b, i) => {
            const pct = Math.max((b.count / max) * 100, 6);
            return (
              <div key={b.name}>
                <div className="flex items-baseline justify-between">
                  <span className={`text-[13px] ${i === 0 ? "font-semibold text-white/70" : "text-white/40"}`}>{b.name}</span>
                  <span className="font-mono text-[11px] tabular-nums text-cyan/50">{b.count}</span>
                </div>
                <div className="mt-1 h-1 rounded-full bg-white/5">
                  <div className={`h-1 rounded-full ${i === 0 ? "bg-cyan/50" : "bg-cyan/20"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ period?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const label = slug.replace(/-/g, " ");

  // Try to get top brands for richer meta
  let brandNames = "";
  let cadence = "monthly";
  try {
    const cat = await getCategoryBySlug(slug);
    if (cat) {
      cadence = cat.tracker_type === "seasonal" ? "weekly" : "monthly";
      const run = await getLatestRun(cat.id, "published") ?? await getLatestRun(cat.id);
      if (run) {
        const mentions = await getBrandMentions(run.id);
        const counts = new Map<string, number>();
        for (const m of mentions) {
          counts.set(m.brand_name_normalized, (counts.get(m.brand_name_normalized) ?? 0) + 1);
        }
        const top3 = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n);
        if (top3.length > 0) brandNames = top3.join(", ");
      }
    }
  } catch { /* fallback to generic */ }

  const title = brandNames
    ? `${label}: ${brandNames} lead AI recommendations`
    : `AI Recommendations for ${label}`;
  const description = brandNames
    ? `${brandNames.split(",")[0].trim()} leads AI recommendations for ${label}. See full rankings from ChatGPT, Claude, Gemini & Perplexity, updated ${cadence}.`
    : `Which ${label} brands do AI models recommend most? Rankings from ChatGPT, Claude, Gemini & Perplexity, updated ${cadence}.`;

  return { title, description };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function TrackerReportPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { period } = await searchParams;

  const categoryRow = await getCategoryBySlug(slug);
  if (!categoryRow) notFound();
  const trackerType = categoryRow.tracker_type as TrackerType;

  // Load a specific period if requested, otherwise latest.
  // Public tracker only ever shows published public runs. A category with
  // no published run falls through to the no-data / Coming Soon state below —
  // it must never fall back to a draft or reviewed run.
  let run = period
    ? await getRunByPeriod(categoryRow.id, period)
    : null;
  if (!run) run = await getLatestRun(categoryRow.id, "published");

  // No published run — show coming soon state
  if (!run) {
    return (
      <article className="bg-dot-grid mx-auto min-h-[60vh] max-w-3xl px-6 py-24">
        <ReportViewTracker slug={slug} />
        <SectionHeader
          title={categoryRow.name}
          subtitle={TYPE_LABELS[trackerType] ?? trackerType}
          badge="Coming Soon"
        />
        <div className="mt-8 rounded-xl border border-white/10 bg-surface px-8 py-12 text-center">
          <p className="text-lg font-semibold text-white/60">
            We&rsquo;re collecting data for this category.
          </p>
          <p className="mt-3 text-[14px] text-white/30">
            Check back soon &mdash; or{" "}
            <a href="/subscribe" className="text-cyan/60 underline underline-offset-2 transition-colors hover:text-cyan">
              subscribe
            </a>
            {" "}to get notified when this report launches.
          </p>
        </div>
      </article>
    );
  }

  let mentions: BrandMention[] = [];
  let insight: RunInsight | null = null;
  let periodLabel = "—";
  let periodDisplay = "—";
  let prompts: { prompt_number: number; prompt_text: string }[] = [];

  if (run) {
    const [realMentions, realInsight, runPrompts] = await Promise.all([
      getBrandMentions(run.id),
      getRunInsight(run.id),
      getPromptsForRun(run.id),
    ]);
    mentions = realMentions;
    insight = realInsight;
    periodLabel = run.period_label;
    periodDisplay = formatRunDate(run.run_date);
    prompts = runPrompts;
  }

  const agentRows = buildAgentRows(mentions);
  const topBrands = buildTopBrands(mentions, agentRows);
  const channelSplit = buildChannelSplit(mentions);

  // --- Period navigation (all report types) ---
  const isSeasonal = trackerType === "seasonal";
  let periodNavItems: { label: string; displayLabel: string; href: string }[] = [];
  let movementMap: Map<string, Movement> | null = null;
  let droppedBrands: { name: string; previousRank: number }[] = [];
  let allRuns: Run[] = [];
  let trendLines: { brand: string; points: { week: string; rank: number }[] }[] = [];
  let trendWeeks: string[] = [];

  if (run) {
    // Get all runs for period navigation
    allRuns = await getAllRunsForCategory(categoryRow.id);
    console.log(`[report] ${slug}: categoryId=${categoryRow.id}, allRuns=${allRuns.length}, periods=${allRuns.map(r => r.period_label).join(",")}`);
    periodNavItems = allRuns.map((r) => ({
      label: r.period_label,
      displayLabel: formatRunDate(r.run_date),
      href: `/tracker/${slug}/${r.period_label}`,
    }));
  }

  if (isSeasonal && run) {
    // Movement: compare to previous run (seasonal only)
    const prevRun = await getPreviousRun(categoryRow.id, run.period_label);
    if (prevRun) {
      const prevMentions = await getBrandMentions(prevRun.id);
      const prevAgentRows = buildAgentRows(prevMentions);
      const prevTopBrands = buildTopBrands(prevMentions, prevAgentRows);
      const result = computeMovements(topBrands, prevTopBrands);
      movementMap = result.movements;
      droppedBrands = result.droppedBrands;
    }
  }

  // Trend chart: show for any type with 2+ runs
  if (allRuns.length >= 2) {
      const runIds = allRuns.map((r) => Number(r.id));
      const rankings = await getBrandRankingsForRuns(runIds);

      // Build rank per run per brand
      const runRankings = new Map<number, Map<string, number>>();
      for (const r of allRuns) {
        runRankings.set(Number(r.id), new Map());
      }
      // Group by run_id, then assign ranks by mention count
      const byRun = new Map<number, { brand: string; mentions: number }[]>();
      for (const row of rankings) {
        const rid = Number(row.run_id);
        const list = byRun.get(rid) ?? [];
        list.push(row);
        byRun.set(rid, list);
      }
      for (const [runId, brands] of byRun) {
        brands.sort((a, b) => b.mentions - a.mentions);
        const rankMap = runRankings.get(runId);
        if (!rankMap) continue;
        brands.forEach((b, i) => rankMap.set(b.brand, i + 1));
      }

      trendWeeks = allRuns.map((r) => formatRunDate(r.run_date));

      // Get top 5 brands from most recent run
      const top5Names = topBrands.slice(0, 5).map((b) => b.name);
      trendLines = top5Names.map((brand) => ({
        brand,
        points: allRuns
          .map((r) => {
            const rank = runRankings.get(Number(r.id))?.get(brand);
            return rank !== undefined ? { week: formatRunDate(r.run_date), rank } : null;
          })
          .filter((p): p is { week: string; rank: number } => p !== null),
      }));
    }

  // Apply movements to brands
  const brandsWithMovement = topBrands.map((b) => ({
    ...b,
    movement: movementMap?.get(b.name),
  }));

  // Find brands in the top 3 by mention count that are absent from all agents' top-3 picks
  const notableAbsents = topBrands
    .slice(0, 3)
    .filter((b) => b.neverTopPicked)
    .map((b) => ({ name: b.name, mentionCount: b.mentionCount }));

  // --- Per-prompt breakdown data ---
  const promptBreakdownData = prompts.map((p) => {
    const promptMentions = mentions.filter((m) => Number(m.prompt_number) === p.prompt_number);
    // Best rank per brand per agent for this prompt
    const agentMap = new Map<string, Map<string, number>>();
    for (const m of promptMentions) {
      const brandMap = agentMap.get(m.agent_name) ?? new Map<string, number>();
      const rank = Number(m.mention_rank);
      const cur = brandMap.get(m.brand_name_normalized);
      if (cur === undefined || rank < cur) brandMap.set(m.brand_name_normalized, rank);
      agentMap.set(m.agent_name, brandMap);
    }
    return {
      promptNumber: p.prompt_number,
      promptText: p.prompt_text,
      agentBrands: Array.from(agentMap.entries()).map(([agent, brandMap]) => ({
        agent,
        brands: Array.from(brandMap.entries()).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([b]) => b),
      })),
    };
  });

  // Budget insights: compare prompt 1+3 vs prompt 2
  let budgetInsights: { budgetOnly: string[]; disappearUnderBudget: string[] } | null = null;
  if (promptBreakdownData.length >= 3) {
    const brandsInBroad = new Set(promptBreakdownData[0]?.agentBrands.flatMap((r) => r.brands) ?? []);
    const brandsInComp = new Set(promptBreakdownData[2]?.agentBrands.flatMap((r) => r.brands) ?? []);
    const brandsInBudget = new Set(promptBreakdownData[1]?.agentBrands.flatMap((r) => r.brands) ?? []);
    const nonBudget = new Set([...brandsInBroad, ...brandsInComp]);

    const budgetOnly = [...brandsInBudget].filter((b) => !nonBudget.has(b)).slice(0, 5);
    const disappearUnderBudget = [...nonBudget].filter((b) => !brandsInBudget.has(b)).slice(0, 5);

    if (budgetOnly.length > 0 || disappearUnderBudget.length > 0) {
      budgetInsights = { budgetOnly, disappearUnderBudget };
    }
  }

  const clean = {
    keyTakeaway: cleanText(insight?.key_takeaway),
    auditAngle: cleanText(insight?.audit_angle),
    commonTraits: cleanText(insight?.common_traits),
    crossAgentDifferences: cleanText(insight?.cross_agent_differences),
    marketGaps: cleanText(insight?.market_gaps),
  };

  const takeaway = clean.keyTakeaway || synthesizeTakeaway(topBrands, agentRows);

  // --- Dynamic FAQ ---
  const catName = categoryRow.name;
  const topBrand = topBrands[0]?.name ?? "the leading brand";
  const topMentions = topBrands[0]?.mentionCount ?? 0;
  const budgetBrands = promptBreakdownData.length >= 2
    ? promptBreakdownData[1]?.agentBrands.flatMap((r) => r.brands).slice(0, 1)[0] ?? "varies by model"
    : "varies by model";

  const faqItems = [
    { question: `What ${catName.toLowerCase()} does AI recommend most?`, answer: `${topBrand} leads with ${topMentions} total mentions across ChatGPT, Claude, Gemini, and Perplexity in our latest benchmark.` },
    { question: `Which ${catName.toLowerCase()} brand ranks #1 across all AI models?`, answer: topBrands.find((b) => b.label === "Overall Leader")?.name ? `${topBrands.find((b) => b.label === "Overall Leader")!.name} is the overall leader by mention frequency.` : `No single brand dominates across all models. ${topBrand} leads in total mentions but different models have different #1 picks.` },
    { question: `Why does ChatGPT recommend different ${catName.toLowerCase()} than Claude?`, answer: clean.crossAgentDifferences ?? "Each model draws from different training data and commercial integrations, leading to divergent recommendations." },
    { question: `What ${catName.toLowerCase()} brands are invisible to AI?`, answer: clean.marketGaps ?? "Many popular retail brands don't appear in AI recommendations. Our benchmark identifies which brands are missing and why." },
    { question: `How often is ${topBrand} recommended by AI?`, answer: `${topBrand} appeared ${topMentions} times across all agent responses in our latest ${catName.toLowerCase()} benchmark.` },
    { question: `What's the best budget ${catName.toLowerCase()} according to AI?`, answer: `Under budget-constrained prompts, AI models most frequently recommend ${budgetBrands}.` },
    { question: `Are ${catName.toLowerCase()} AI recommendations biased?`, answer: "We classify AI models by commercial interest: Claude (independent), Perplexity (search-grounded), ChatGPT and Gemini (commerce-influenced). Commerce-influenced models may weight products with advertising or shopping integrations differently." },
    { question: `How does RecoScope track ${catName.toLowerCase()} recommendations?`, answer: `We run three standardized prompts through ChatGPT, Claude, Gemini, and Perplexity, then parse every response for brand mentions, rank position, and frequency. ${trackerType === "seasonal" ? "Seasonal categories are benchmarked weekly." : "Evergreen categories are benchmarked monthly."}` },
  ];

  const baseUrl = "https://getrecoscope.com";

  // Provenance data for the "How this report was produced" block.
  const aiModelsIncluded = Array.from(new Set(agentRows.map((r) => r.agentName))).filter((a) => AI_AGENTS.has(a));
  const aiModelLabel = aiModelsIncluded.length > 0
    ? aiModelsIncluded.join(", ")
    : "ChatGPT, Claude, Gemini, Perplexity";

  return (
    <article className="bg-dot-grid mx-auto min-h-screen max-w-3xl px-6 py-24">
      <ArticleSchema
        headline={`${catName} AI Benchmark — ${periodDisplay}`}
        description={`See which brands AI models recommend for ${catName}. Benchmark data from ChatGPT, Claude, Gemini, and Perplexity.`}
        datePublished={String(run.run_date)}
        url={`${baseUrl}/tracker/${slug}`}
      />
      <FAQSchema items={faqItems} />
      <BreadcrumbSchema items={[
        { name: "Home", url: baseUrl },
        { name: "Tracker", url: `${baseUrl}/tracker` },
        { name: catName, url: `${baseUrl}/tracker/${slug}` },
      ]} />
      <ReportViewTracker slug={slug} />

      {/* Period nav */}
      {periodNavItems.length > 1 && (
        <WeekNav weeks={periodNavItems} currentWeek={periodLabel} />
      )}

      <SectionHeader
        title={categoryRow.name}
        subtitle={`${TYPE_LABELS[trackerType] ?? trackerType} \u2014 ${periodDisplay}`}
        badge={run ? (periodDisplay !== "—" ? periodDisplay : "Live Report") : "No data yet"}
      />

      <PromptsUsed prompts={prompts} />

      {/* Trend chart (any type, 2+ runs) */}
      {trendLines.length > 0 && trendWeeks.length >= 2 && (
        <ScrollFade className="mt-12">
          <TrendChart lines={trendLines} weeks={trendWeeks} />
        </ScrollFade>
      )}

      <section className="mt-12">
        <KeyTakeawayPanel takeaway={takeaway} />
      </section>

      {/* 3. Top Brands */}
      <ScrollFade className="mt-20">
        <TopBrandsList
          brands={brandsWithMovement}
          droppedBrands={isSeasonal && droppedBrands.length > 0 ? droppedBrands : undefined}
          category={slug}
        />
      </ScrollFade>

      {/* 4. Opportunity for Brands (moved up) */}
      {clean.marketGaps && (
        <ScrollFade className="mt-20">
          <div className="border-l-2 border-cyan/30 py-1 pl-8">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
              Opportunity for Brands
            </p>
            <ul className="mt-4 space-y-3">
              {(toBullets(clean.marketGaps) ?? []).map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-[14px] leading-[1.7] text-white/50"
                >
                  <span className="mt-[9px] block h-[3px] w-[3px] shrink-0 rounded-full bg-cyan" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </ScrollFade>
      )}

      {/* 5. Cross-Agent Comparison */}
      <ScrollFade className="mt-20">
        <CrossAgentTable
          rows={agentRows}
          whatThisMeans={toBullets(clean.crossAgentDifferences)}
          notableAbsents={notableAbsents.length > 0 ? notableAbsents : undefined}
        />
      </ScrollFade>

      {/* 6. Why These Brands Win (moved down) */}
      {toBullets(clean.commonTraits) && (toBullets(clean.commonTraits) ?? []).length > 0 && (
        <ScrollFade className="mt-20">
          <div className="border-l-2 border-cyan/20 pl-6">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
              Why These Brands Win
            </p>
            <ul className="mt-4 space-y-2.5">
              {(toBullets(clean.commonTraits) ?? []).map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-[13px] leading-relaxed text-white/40"
                >
                  <span className="mt-[7px] block h-[3px] w-[3px] shrink-0 rounded-full bg-cyan/40" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </ScrollFade>
      )}

      {promptBreakdownData.length > 0 && (
        <section className="premium-content mt-14">
          <PromptBreakdown prompts={promptBreakdownData} budgetInsights={budgetInsights} />
        </section>
      )}

      {channelSplit.hasData && (
        <ScrollFade className="mt-20">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            AI Models vs Marketplace Agents
          </p>
          <p className="mt-2 text-[13px] text-white/25">
            Mentions counted separately by channel. A brand&rsquo;s AI count and marketplace count won&rsquo;t sum to its total above because the total includes all sources.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-6 rounded-xl border border-white/10 bg-surface p-6 sm:grid-cols-2">
            <ChannelBar items={channelSplit.ai} label="AI Models" />
            <ChannelBar items={channelSplit.marketplace} label="Marketplace Agents" />
          </div>
          {channelSplit.hasBothChannels && (
            <p className="mt-6 text-[13px] leading-relaxed text-white/30">
              AI models and marketplace agents often recommend different brands.
              Marketplace results tend to favor best-sellers and price-competitive options,
              while AI models prioritize editorial authority and product depth.
            </p>
          )}
        </ScrollFade>
      )}

      {/* FAQ section */}
      <section className="mt-20">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
          Frequently Asked Questions
        </p>
        <div className="mt-6 space-y-2">
          {faqItems.map((faq) => (
            <details key={faq.question} className="group rounded-lg border border-white/5">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-3 font-mono text-[13px] font-medium text-white/50 hover:text-white/70">
                {faq.question}
                <span className="text-white/20 transition-transform group-open:rotate-180">&#9662;</span>
              </summary>
              <div className="border-t border-white/5 px-5 py-4 text-[13px] leading-[1.7] text-white/35">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <ScrollFade className="mt-24">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/20">
          How we measure this
        </p>
        <div className="mt-5 space-y-4 text-[13px] leading-[1.8] text-white/30">
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
            {trackerType === "seasonal" ? "Seasonal categories are benchmarked weekly during active periods." : "Evergreen categories are benchmarked monthly."}{" "}
            Results reflect organic AI behavior at the time of testing.{" "}
            <a href="/methodology" className="text-cyan/40 underline underline-offset-2 transition-colors hover:text-cyan">
              Read the full methodology
            </a>
          </p>
        </div>
      </ScrollFade>

      {/* How this report was produced */}
      <ScrollFade className="mt-24">
        <div className="rounded-2xl border border-white/10 bg-surface px-8 py-10">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            How this report was produced
          </p>
          <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            <div className="flex items-baseline justify-between border-b border-white/5 pb-3">
              <dt className="text-[13px] text-white/40">Evaluation period</dt>
              <dd className="font-mono text-[13px] text-white/60">{periodDisplay}</dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-white/5 pb-3">
              <dt className="text-[13px] text-white/40">Cadence</dt>
              <dd className="font-mono text-[13px] text-white/60">{trackerType === "seasonal" ? "Weekly" : "Monthly"}</dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-white/5 pb-3">
              <dt className="text-[13px] text-white/40">Prompts evaluated</dt>
              <dd className="font-mono text-[13px] text-white/60">{prompts.length}</dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-white/5 pb-3">
              <dt className="text-[13px] text-white/40">Review status</dt>
              <dd className="font-mono text-[13px] text-white/60">Published after human review</dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-white/5 pb-3 sm:col-span-2">
              <dt className="text-[13px] text-white/40">Models included</dt>
              <dd className="font-mono text-[13px] text-white/60">{aiModelLabel}</dd>
            </div>
          </dl>
          <p className="mt-6 text-[13px] leading-relaxed text-white/30">
            Full details of how prompts are run, parsed, normalized, and scored are in the{" "}
            <a href="/methodology" className="text-cyan/60 underline underline-offset-2 transition-colors hover:text-cyan">
              methodology
            </a>
            , and the{" "}
            <a href="/platform" className="text-cyan/60 underline underline-offset-2 transition-colors hover:text-cyan">
              platform
            </a>
            {" "}page explains how the system is built and operated.
          </p>
        </div>
        <p className="mt-6 text-center text-[12px] text-white/20">
          Are you a brand in this category?{" "}
          <a href="/audit" className="text-white/30 underline underline-offset-2 hover:text-white/50">
            Request a private analysis
          </a>
        </p>
      </ScrollFade>
    </article>
  );
}
