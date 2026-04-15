import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleSchema } from "@/components/seo/JsonLd";
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
  CTABox,
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

const VALID_TYPES = new Set<string>(["evergreen", "seasonal"]);

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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
  params: Promise<{ type: string; slug: string }>;
  searchParams: Promise<{ period?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, slug } = await params;
  const label = slug.replace(/-/g, " ");
  const cadence = type === "seasonal" ? "weekly" : "monthly";
  return {
    title: `AI Recommendations for ${label}`,
    description: `Which ${label} brands do AI models recommend most? Rankings from ChatGPT, Claude, Gemini & Perplexity, updated ${cadence}.`,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function TrackerReportPage({ params, searchParams }: Props) {
  const { type, slug } = await params;
  const { period } = await searchParams;

  if (!VALID_TYPES.has(type)) notFound();
  const trackerType = type as TrackerType;

  const categoryRow = await getCategoryBySlug(slug, trackerType);
  if (!categoryRow) notFound();

  // Load a specific period if requested, otherwise latest
  let run = period
    ? await getRunByPeriod(categoryRow.id, period)
    : null;
  if (!run) run = await getLatestRun(categoryRow.id, "published");
  if (!run) run = await getLatestRun(categoryRow.id);

  // No runs at all — show coming soon state
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
    prompts = runPrompts;
  }

  const agentRows = buildAgentRows(mentions);
  const topBrands = buildTopBrands(mentions, agentRows);
  const channelSplit = buildChannelSplit(mentions);

  // --- Period navigation (all report types) ---
  const isSeasonal = trackerType === "seasonal";
  let periodNavItems: { label: string; href: string }[] = [];
  let movementMap: Map<string, Movement> | null = null;
  let droppedBrands: { name: string; previousRank: number }[] = [];
  let allRuns: Run[] = [];
  let trendLines: { brand: string; points: { week: string; rank: number }[] }[] = [];
  let trendWeeks: string[] = [];

  if (run) {
    // Get all runs for period navigation
    allRuns = await getAllRunsForCategory(categoryRow.id);
    periodNavItems = allRuns.map((r) => ({
      label: r.period_label,
      href: `/tracker/${type}/${slug}/${r.period_label}`,
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

      trendWeeks = allRuns.map((r) => r.period_label);

      // Get top 5 brands from most recent run
      const top5Names = topBrands.slice(0, 5).map((b) => b.name);
      trendLines = top5Names.map((brand) => ({
        brand,
        points: allRuns
          .map((r) => {
            const rank = runRankings.get(Number(r.id))?.get(brand);
            return rank !== undefined ? { week: r.period_label, rank } : null;
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

  return (
    <article className="bg-dot-grid mx-auto min-h-screen max-w-3xl px-6 py-24">
      <ArticleSchema
        headline={`${categoryRow.name} AI Benchmark — ${periodLabel}`}
        description={`See which brands AI models recommend for ${categoryRow.name}. Benchmark data from ChatGPT, Claude, Gemini, and Perplexity.`}
        datePublished={run.run_date}
        url={`https://getrecoscope.com/tracker/${type}/${slug}`}
      />
      <ReportViewTracker slug={slug} />

      {/* Period nav */}
      {periodNavItems.length > 1 && (
        <WeekNav weeks={periodNavItems} currentWeek={periodLabel} />
      )}

      <SectionHeader
        title={categoryRow.name}
        subtitle={`${TYPE_LABELS[trackerType] ?? trackerType} \u2014 ${periodLabel}`}
        badge={run ? (periodLabel !== "—" ? periodLabel : "Live Report") : "No data yet"}
      />

      <PromptsUsed prompts={prompts} />

      <section className="mt-8">
        <KeyTakeawayPanel takeaway={takeaway} />
      </section>

      {/* Trend chart (any type, 2+ runs) */}
      {trendLines.length > 0 && trendWeeks.length >= 2 && (
        <ScrollFade className="mt-20">
          <TrendChart lines={trendLines} weeks={trendWeeks} />
        </ScrollFade>
      )}

      <ScrollFade className="mt-20">
        <TopBrandsList
          brands={brandsWithMovement}
          whyTheseWin={toBullets(clean.commonTraits)}
          droppedBrands={isSeasonal && droppedBrands.length > 0 ? droppedBrands : undefined}
          category={slug}
        />
      </ScrollFade>

      <ScrollFade className="mt-20">
        <CrossAgentTable
          rows={agentRows}
          whatThisMeans={toBullets(clean.crossAgentDifferences)}
          notableAbsents={notableAbsents.length > 0 ? notableAbsents : undefined}
        />
      </ScrollFade>

      {promptBreakdownData.length > 0 && (
        <section className="mt-14">
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

      <ScrollFade className="mt-24">
        <CTABox description={clean.auditAngle ?? undefined} ctaLocation="report_bottom" />
      </ScrollFade>
    </article>
  );
}
