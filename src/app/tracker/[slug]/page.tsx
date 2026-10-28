import {
  reportUrl as snapshotUrl,
  CONTENT_UPDATED_AT,
  isoDate,
  latestDate,
} from "@/lib/seo.mjs";
import {
  applyRecordedExclusions,
  buildPromptBreakdown,
  buildBudgetInsights,
  reviewStatus,
  eligibleMentions,
  responseCoverage,
  mentionCounts,
  snapshotFinding,
  rankSlots,
  displayAgent,
} from "@/lib/report-ranking.mjs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArticleSchema,
  FAQSchema,
  BreadcrumbSchema,
} from "@/components/seo/JsonLd";
import {
  getCategoryBySlug,
  getLatestRun,
  getBrandMentions,
  getRunInsight,
  getPreviousRun,
  getAllSeasonalRuns,
  getBrandRankingsForRuns,
  getAllRunsForCategory,
  getRunByPeriod,
  getPromptsForRun,
  getAgentResponses,
} from "@/lib/queries";
import type {
  BrandMention,
  RunInsight,
  TrackerType,
  Run,
  AgentResponse,
} from "@/lib/types";
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
import { formatSnapshotDate, auditHref } from "@/lib/discovery.mjs";
import { snapshotProducts } from "@/lib/tracker-media.mjs";
import { ProductGallery } from "@/components/tracker/TrackerMedia";
import { CapturedAnswers } from "@/components/tracker/CapturedAnswers";
import { TrackedLink } from "@/components/TrackedLink";
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

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

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

function buildAgentRows(
  mentions: BrandMention[],
  responses: AgentResponse[] = [],
  prompts = [{ prompt_number: 3, prompt_text: "" }],
) {
  const comparison = buildPromptBreakdown(prompts, mentions, responses).find(
    (p) => p.promptNumber === 3,
  );
  return (comparison?.agentBrands ?? []).map((row) => ({
    agentName: displayAgent(row.agent),
    topBrands: row.brands,
    rankSlots: rankSlots(row.rankedBrands),
    status: row.status,
  }));
}

function buildTopBrands(
  mentions: BrandMention[],
  agentRows: ReturnType<typeof buildAgentRows>,
) {
  const sorted = mentionCounts(mentions);
  const topCount = sorted[0]?.mentionCount ?? 0;
  const tied = sorted.filter((b) => b.mentionCount === topCount).length > 1;
  return sorted.map((brand) => {
    const top3Count = agentRows.filter((row) =>
      row.topBrands.includes(brand.name),
    ).length;
    const firstAgents = agentRows
      .filter((row) => row.rankSlots[0].split(" / ").includes(brand.name))
      .map((row) => row.agentName);
    const label =
      brand.mentionCount === topCount
        ? tied
          ? "Tied #1 by mentions"
          : "Most Mentioned"
        : firstAgents.length === 1
          ? `Ranked #1 in ${firstAgents[0]}`
          : top3Count >= 2
            ? "Top 3 across models"
            : undefined;
    return { ...brand, label, neverTopPicked: top3Count === 0 };
  });
}

// ---------------------------------------------------------------------------
// AI vs Marketplace split
// ---------------------------------------------------------------------------

const AI_AGENTS = new Set(["chatgpt", "claude", "gemini", "perplexity"]);
const MARKETPLACE_AGENTS = new Set([
  "rufus",
  "sparky",
  "amazon rufus",
  "walmart sparky",
]);

function buildChannelSplit(mentions: BrandMention[]) {
  const ai = new Map<string, number>();
  const marketplace = new Map<string, number>();
  for (const m of mentions) {
    const key = m.brand_name_normalized;
    if (!key) continue;
    if (AI_AGENTS.has(m.agent_name.toLowerCase()))
      ai.set(key, (ai.get(key) ?? 0) + 1);
    if (MARKETPLACE_AGENTS.has(m.agent_name.toLowerCase()))
      marketplace.set(key, (marketplace.get(key) ?? 0) + 1);
  }
  const sortDesc = (map: Map<string, number>) =>
    Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  return {
    ai: sortDesc(ai),
    marketplace: sortDesc(marketplace),
    hasData: ai.size > 0 || marketplace.size > 0,
    hasBothChannels: ai.size > 0 && marketplace.size > 0,
  };
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
      movements.set(b.name, {
        type: "down",
        positions: currentRank - prevRank,
      });
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

function ChannelBar({
  items,
  label,
}: {
  items: { name: string; count: number }[];
  label: string;
}) {
  const max = items.length > 0 ? items[0].count : 1;
  return (
    <div>
      <p className="mb-4 font-mono text-[12px] font-semibold text-white/50">
        {label}
      </p>
      {items.length === 0 ? (
        <p className="text-[13px] text-white/20">No data yet</p>
      ) : (
        <div className="space-y-2">
          {items.map((b, i) => {
            const pct = Math.max((b.count / max) * 100, 6);
            return (
              <div key={b.name}>
                <div className="flex items-baseline justify-between">
                  <span
                    className={`text-[13px] ${i === 0 ? "font-semibold text-white/70" : "text-white/40"}`}
                  >
                    {b.name}
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-cyan/50">
                    {b.count}
                  </span>
                </div>
                <div className="mt-1 h-1 rounded-full bg-white/5">
                  <div
                    className={`h-1 rounded-full ${i === 0 ? "bg-cyan/50" : "bg-cyan/20"}`}
                    style={{ width: `${pct}%` }}
                  />
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

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const { period } = await searchParams;
  const category = await getCategoryBySlug(slug);
  const run = category
    ? period
      ? await getRunByPeriod(category.id, period)
      : await getLatestRun(category.id, "published")
    : null;
  const label = category?.name ?? slug.replace(/-/g, " ");
  if (!run)
    return {
      robots: { index: false, follow: true },
      title: `AI visibility for ${label}`,
      description: `Explore recorded brand mentions and response ranks for ${label}.`,
    };
  const [mentions, rawResponses] = await Promise.all([
    getBrandMentions(run.id),
    getAgentResponses(run.id),
  ]);
  const responses = applyRecordedExclusions(rawResponses, run.id);
  const coverage = responseCoverage(responses);
  const brands = mentionCounts(eligibleMentions(mentions, responses));
  return {
    alternates: { canonical: snapshotUrl(slug, run.period_label) },
    title: `${label}: AI mention frequency — ${formatRunDate(run.run_date)}`,
    description: `${snapshotFinding(brands, coverage)} ${coverage.eligible} usable answers from ${coverage.models.join(", ") || "the recorded services"}. View response ranks and collection limitations.`,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function TrackerReportPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const { period } = await searchParams;

  const categoryRow = await getCategoryBySlug(slug);
  if (!categoryRow) notFound();
  const trackerType = categoryRow.tracker_type as TrackerType;

  // Load a specific period if requested, otherwise latest.
  // Public tracker only ever shows published public runs. A category with
  // no published run falls through to the no-data / Coming Soon state below —
  // it must never fall back to a draft or reviewed run.
  let run = period ? await getRunByPeriod(categoryRow.id, period) : null;
  if (!run && period) notFound();
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
            <a
              href="/subscribe"
              className="text-cyan/60 underline underline-offset-2 transition-colors hover:text-cyan"
            >
              subscribe
            </a>{" "}
            to get notified when this report launches.
          </p>
        </div>
      </article>
    );
  }

  let mentions: BrandMention[] = [];
  let responses: AgentResponse[] = [];
  let insight: RunInsight | null = null;
  let periodLabel = "—";
  let periodDisplay = "—";
  let prompts: { prompt_number: number; prompt_text: string }[] = [];

  if (run) {
    const [realMentions, realInsight, runPrompts, runResponses] =
      await Promise.all([
        getBrandMentions(run.id),
        getRunInsight(run.id),
        getPromptsForRun(run.id),
        getAgentResponses(run.id),
      ]);
    responses = applyRecordedExclusions(runResponses, run.id);
    mentions = eligibleMentions(realMentions, responses);
    insight = realInsight;
    periodLabel = run.period_label;
    periodDisplay = formatRunDate(run.run_date);
    prompts = runPrompts;
  }

  const coverage = responseCoverage(responses);
  const agentRows = buildAgentRows(mentions, responses, prompts);
  const topBrands = buildTopBrands(mentions, agentRows);
  const channelSplit = buildChannelSplit(mentions);

  // --- Period navigation (all report types) ---
  const isSeasonal = trackerType === "seasonal";
  let periodNavItems: { label: string; displayLabel: string; href: string }[] =
    [];
  let movementMap: Map<string, Movement> | null = null;
  let droppedBrands: { name: string; previousRank: number }[] = [];
  let allRuns: Run[] = [];
  let trendLines: {
    brand: string;
    points: { week: string; rank: number }[];
  }[] = [];
  let trendWeeks: string[] = [];

  if (run) {
    // Get all runs for period navigation
    allRuns = await getAllRunsForCategory(categoryRow.id);
    console.log(
      `[report] ${slug}: categoryId=${categoryRow.id}, allRuns=${allRuns.length}, periods=${allRuns.map((r) => r.period_label).join(",")}`,
    );
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
      brands.forEach((b) =>
        rankMap.set(
          b.brand,
          brands.findIndex((other) => other.mentions === b.mentions) + 1,
        ),
      );
    }

    trendWeeks = allRuns.map((r) => formatRunDate(r.run_date));

    // Get top 5 brands from most recent run
    const top5Names = topBrands.slice(0, 5).map((b) => b.name);
    trendLines = top5Names.map((brand) => ({
      brand,
      points: allRuns
        .map((r) => {
          const rank = runRankings.get(Number(r.id))?.get(brand);
          return rank !== undefined
            ? { week: formatRunDate(r.run_date), rank }
            : null;
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
  const promptBreakdownData = buildPromptBreakdown(
    prompts,
    mentions,
    responses,
  );

  const budgetInsights = buildBudgetInsights(promptBreakdownData);

  const clean = {
    keyTakeaway: cleanText(insight?.key_takeaway),
    auditAngle: cleanText(insight?.audit_angle),
    commonTraits: cleanText(insight?.common_traits),
    crossAgentDifferences: cleanText(insight?.cross_agent_differences),
    marketGaps: cleanText(insight?.market_gaps),
  };

  const takeaway = clean.keyTakeaway || snapshotFinding(topBrands, coverage);

  // --- Dynamic FAQ ---
  const catName = categoryRow.name;
  const topBrand = topBrands[0]?.name ?? "the leading brand";
  const topMentions = topBrands[0]?.mentionCount ?? 0;
  const aiModelLabel =
    coverage.models.join(", ") || "No usable answers recorded";
  const frequencyFinding = snapshotFinding(topBrands, coverage);
  const budgetRows =
    promptBreakdownData
      .find((p) => p.promptNumber === 2)
      ?.agentBrands.filter((r) => r.hasResponse) ?? [];
  const budgetCounts = new Map<string, number>();
  for (const row of budgetRows)
    for (const brand of row.allBrands)
      budgetCounts.set(brand, (budgetCounts.get(brand) ?? 0) + 1);
  const mostBudgetMentions = Math.max(0, ...budgetCounts.values());
  const budgetLeaders = [...budgetCounts]
    .filter(([, count]) => count === mostBudgetMentions)
    .map(([brand]) => brand)
    .sort();
  const rankingSummary = agentRows
    .map(
      (row) =>
        `${row.agentName}: ${row.rankSlots[0] || row.status || "no recorded first rank"}`,
    )
    .join("; ");
  const faqItems = [
    {
      question: `Which ${catName.toLowerCase()} brands appear most often?`,
      answer: `${frequencyFinding} This snapshot includes ${coverage.eligible} usable answers from ${aiModelLabel}. Mentions include comparisons and criticism.`,
    },
    {
      question: `Which brands rank first in the ${catName.toLowerCase()} comparison answers?`,
      answer:
        rankingSummary || "No comparison ranks were recorded in this snapshot.",
    },
    {
      question: `Why do models give different ${catName.toLowerCase()} answers?`,
      answer:
        clean.crossAgentDifferences ??
        "The benchmark records differences between answers. It does not establish what caused those differences.",
    },
    {
      question: "Does no mention mean a brand is invisible to AI?",
      answer:
        "No. Absence means the brand was not recorded in this limited set of prompts and usable answers. It does not establish absence from other AI answers.",
    },
    {
      question: `How often is ${topBrand} mentioned?`,
      answer: `${topBrand} appeared in ${topMentions} usable answers in this snapshot. A mention is not necessarily a recommendation.`,
    },
    {
      question: `Which brands appear most in the budget answers?`,
      answer: budgetLeaders.length
        ? `${budgetLeaders.join(", ")} appeared in ${mostBudgetMentions} of ${budgetRows.length} usable budget answers${budgetLeaders.length > 1 ? " each" : ""}. This measures mentions, not verified price or budget compliance.`
        : "No brand mentions were recorded in the usable budget answers. Unavailable answers are excluded.",
    },
    {
      question: `Does this benchmark prove AI recommendations are biased?`,
      answer:
        "No. Differences in answers do not establish bias or prove that advertising or commercial integrations caused a recommendation. Model, tier and collection changes can also affect comparisons.",
    },
    {
      question: `How was this ${catName.toLowerCase()} snapshot collected?`,
      answer: `${prompts.length} prompt types were recorded across the participating services. ${coverage.eligible} of ${coverage.captured} captured response records contain usable answers, from ${aiModelLabel}. Brand mentions and recorded ranks are measured separately. Unavailable and explicitly excluded answers do not contribute to brand analysis.`,
    },
  ];

  const baseUrl = "https://www.getrecoscope.com";
  const reportUrl = snapshotUrl(slug, periodLabel);

  return (
    <article className="benchmark-report">
      <ArticleSchema
        headline={`${catName} AI Benchmark — ${periodDisplay}`}
        description={`${frequencyFinding} Usable answers from ${aiModelLabel}.`}
        datePublished={run.run_date}
        dateModified={latestDate(
          CONTENT_UPDATED_AT,
          run.created_at,
          insight?.created_at,
          ...responses.map((r) => r.created_at),
          ...mentions.map((m) => m.created_at),
          ...allRuns.map((r) => r.created_at),
        )}
        authorName="Robert Hu"
        url={reportUrl}
      />
      <FAQSchema items={faqItems} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: baseUrl },
          { name: "Tracker", url: `${baseUrl}/tracker` },
          { name: catName, url: reportUrl },
        ]}
      />
      <ReportViewTracker slug={slug} />

      <header className="report-hero">
        <SectionHeader
          title={categoryRow.name}
          subtitle={`${TYPE_LABELS[trackerType] ?? trackerType} — ${periodDisplay}`}
        />
        <p className="report-models">
          Research by <a href="/about">Robert Hu</a> · Published by RecoScope ·{" "}
          <time dateTime={isoDate(run.run_date)}>
            Collected {formatSnapshotDate(isoDate(run.run_date) ?? "")}
          </time>
        </p>
        <div className="report-coverage">
          <dl className="report-stats">
            <div>
              <dt>Usable answers</dt>
              <dd>
                {coverage.eligible}
                <span>/{coverage.captured}</span>
              </dd>
            </div>
            <div>
              <dt>Models</dt>
              <dd>{coverage.models.length}</dd>
            </div>
            <div>
              <dt>Prompt types</dt>
              <dd>{prompts.length}</dd>
            </div>
          </dl>
          <p className="report-models">Included: {aiModelLabel}</p>
          {coverage.unavailableModels.length > 0 && (
            <p className="report-warning">
              Unavailable answers from {coverage.unavailableModels.join(", ")}{" "}
              are excluded from mention counts. See the collection notes for
              coverage limitations.
            </p>
          )}
          {responses.some((r) => r.analysis_exclusion_reason) && (
            <p className="report-warning">
              Excluded from analysis:{" "}
              {responses
                .filter((r) => r.analysis_exclusion_reason)
                .map(
                  (r) =>
                    `${displayAgent(r.agent_name)} prompt ${r.prompt_number} (${r.analysis_exclusion_reason})`,
                )
                .join("; ")}
              . Original answers remain retained.
            </p>
          )}
        </div>
      </header>

      {/* Period nav */}
      {periodNavItems.length > 1 && (
        <WeekNav weeks={periodNavItems} currentWeek={periodLabel} />
      )}

      <nav className="report-jump-links" aria-label="Report sections">
        <a href="#overview">Overview</a>
        <a href="#brand-visibility">Brand visibility</a>
        <a href="#model-comparison">Model comparison</a>
        {promptBreakdownData.length > 0 && (
          <a href="#prompt-details">Prompt details</a>
        )}
        <a href="#captured-answers">Captured answers</a>
        <a href="#collection-notes">Collection notes</a>
      </nav>

      <div
        id="overview"
        className={`report-overview ${trendLines.length > 0 && trendWeeks.length >= 2 ? "" : "report-overview-single"}`}
      >
        <section
          className="report-card report-takeaway"
          aria-labelledby="takeaway-heading"
        >
          <h2 id="takeaway-heading" className="report-eyebrow">
            Key takeaway
          </h2>
          <KeyTakeawayPanel takeaway={takeaway} />
          <a className="report-text-link" href="#model-comparison">
            Compare the model rankings <span aria-hidden="true">↗</span>
          </a>
        </section>
        {trendLines.length > 0 && trendWeeks.length >= 2 && (
          <section
            className="report-card report-trend"
            aria-label="Mention frequency trend"
          >
            <TrendChart lines={trendLines} weeks={trendWeeks} />
          </section>
        )}
      </div>

      <aside className="report-audit-cta">
        <div>
          <strong>How does your brand compare?</strong>
          <p>
            Get a free {catName} audit, emailed within 48 hours. No call
            required.
          </p>
        </div>
        <TrackedLink
          href={auditHref(slug)}
          event="audit_cta_click"
          source="report"
          className="button-primary"
        >
          Audit my brand
        </TrackedLink>
        <a
          href={`/subscribe?category=${encodeURIComponent(slug)}`}
          className="text-link"
        >
          Get category updates
        </a>
      </aside>
      <div className="report-results-grid">
        <section
          id="brand-visibility"
          className="report-card report-brands"
          aria-label="Brand mention frequency"
        >
          <TopBrandsList
            brands={brandsWithMovement}
            droppedBrands={
              isSeasonal && droppedBrands.length > 0 ? droppedBrands : undefined
            }
            category={slug}
            eligibleAnswers={coverage.eligible}
          />
        </section>
        <section
          id="model-comparison"
          className="report-card report-comparison"
          aria-label="Model ranking comparison"
        >
          <CrossAgentTable
            rows={agentRows}
            whatThisMeans={toBullets(clean.crossAgentDifferences)}
            notableAbsents={
              notableAbsents.length > 0 ? notableAbsents : undefined
            }
          />
        </section>
      </div>

      <ProductGallery
        products={snapshotProducts(slug, run.id, responses, {
          period: run.period_label,
          runDate: run.run_date,
        })}
      />

      <div id="collection-notes" className="report-notes-grid">
        {/* 4. Opportunity for Brands (moved up) */}
        {clean.marketGaps && (
          <ScrollFade className="report-card report-notes">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
                Findings and Limitations
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

        {/* 6. Recurring themes in the answers (moved down) */}
        {toBullets(clean.commonTraits) &&
          (toBullets(clean.commonTraits) ?? []).length > 0 && (
            <ScrollFade className="report-card report-traits">
              <div>
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
                  Recurring themes in the answers
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
      </div>

      <PromptsUsed prompts={prompts} />
      {promptBreakdownData.length > 0 && (
        <section
          id="prompt-details"
          className="premium-content report-card report-prompt-details"
        >
          <PromptBreakdown
            prompts={promptBreakdownData}
            budgetInsights={budgetInsights}
          />
        </section>
      )}

      <CapturedAnswers
        responses={responses}
        products={snapshotProducts(slug, run.id, responses, {
          period: run.period_label,
          runDate: run.run_date,
        })}
      />

      {channelSplit.hasBothChannels && (
        <ScrollFade className="mt-20">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            AI Models vs Marketplace Agents
          </p>
          <p className="mt-2 text-[13px] text-white/25">
            Mentions counted separately by channel. A brand&rsquo;s AI count and
            marketplace count won&rsquo;t sum to its total above because the
            total includes all sources.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-6 rounded-xl border border-white/10 bg-surface p-6 sm:grid-cols-2">
            <ChannelBar items={channelSplit.ai} label="AI Models" />
            <ChannelBar
              items={channelSplit.marketplace}
              label="Marketplace Agents"
            />
          </div>
          {channelSplit.hasBothChannels && (
            <p className="mt-6 text-[13px] leading-relaxed text-white/30">
              AI models and marketplace agents often recommend different brands.
              Marketplace results tend to favor best-sellers and
              price-competitive options, while AI models prioritize editorial
              authority and product depth.
            </p>
          )}
        </ScrollFade>
      )}

      <div className="report-reference-grid">
        {/* FAQ section */}
        <section className="report-card report-faq">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            Frequently Asked Questions
          </p>
          <div className="mt-6 space-y-2">
            {faqItems.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-lg border border-white/5"
              >
                <summary className="flex cursor-pointer items-center justify-between px-5 py-3 font-mono text-[13px] font-medium text-white/50 hover:text-white/70">
                  {faq.question}
                  <span className="text-white/20 transition-transform group-open:rotate-180">
                    &#9662;
                  </span>
                </summary>
                <div className="border-t border-white/5 px-5 py-4 text-[13px] leading-[1.7] text-white/35">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        <div className="report-methods">
          <ScrollFade className="report-card">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/20">
              How we measure this
            </p>
            <div className="mt-5 space-y-4 text-[13px] leading-[1.8] text-white/30">
              <p>
                This snapshot uses {prompts.length} standardized prompt types.
                Usable answers were captured from {aiModelLabel}. Collection
                failures are excluded; answers that name no brands remain in the
                usable-answer count.
              </p>
              <p>
                Each brand is counted once per answer. Unranked, comparative and
                critical mentions contribute to visibility. Recorded response
                ranks are reported separately from mention frequency; they do
                not establish product quality.
              </p>
              <p>
                {trackerType === "seasonal"
                  ? "Seasonal categories are benchmarked weekly during active periods."
                  : "Evergreen categories are benchmarked monthly."}{" "}
                Results reflect the captured answers at the time of testing.
                Changes in coverage, model tiers and parsing can limit
                comparisons over time.{" "}
                <a
                  href="/methodology"
                  className="text-cyan/40 underline underline-offset-2 transition-colors hover:text-cyan"
                >
                  Read the full methodology
                </a>
              </p>
            </div>
          </ScrollFade>

          {/* How this report was produced */}
          <ScrollFade className="report-card">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
                How this report was produced
              </p>
              <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                <div className="flex items-baseline justify-between border-b border-white/5 pb-3">
                  <dt className="text-[13px] text-white/40">
                    Evaluation period
                  </dt>
                  <dd className="font-mono text-[13px] text-white/60">
                    {periodDisplay}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-b border-white/5 pb-3">
                  <dt className="text-[13px] text-white/40">Cadence</dt>
                  <dd className="font-mono text-[13px] text-white/60">
                    {trackerType === "seasonal" ? "Weekly" : "Monthly"}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-b border-white/5 pb-3">
                  <dt className="text-[13px] text-white/40">
                    Prompts evaluated
                  </dt>
                  <dd className="font-mono text-[13px] text-white/60">
                    {prompts.length}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-b border-white/5 pb-3">
                  <dt className="text-[13px] text-white/40">Review status</dt>
                  <dd className="font-mono text-[13px] text-white/60">
                    {reviewStatus(insight?.reviewed_by_human)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-b border-white/5 pb-3 sm:col-span-2">
                  <dt className="text-[13px] text-white/40">
                    Models with usable answers
                  </dt>
                  <dd className="font-mono text-[13px] text-white/60">
                    {aiModelLabel}
                  </dd>
                </div>
              </dl>
              <p className="mt-6 text-[13px] leading-relaxed text-white/30">
                Full details of how prompts are run, parsed, normalized, and
                scored are in the{" "}
                <a
                  href="/methodology"
                  className="text-cyan/60 underline underline-offset-2 transition-colors hover:text-cyan"
                >
                  methodology
                </a>
                , and the{" "}
                <a
                  href="/platform"
                  className="text-cyan/60 underline underline-offset-2 transition-colors hover:text-cyan"
                >
                  platform
                </a>{" "}
                page explains how the system is built and operated.
              </p>
            </div>
            <p className="mt-6 text-center text-[12px] text-white/20">
              Are you a brand in this category?{" "}
              <a
                href={auditHref(slug)}
                className="text-white/30 underline underline-offset-2 hover:text-white/50"
              >
                Request a private analysis
              </a>
            </p>
          </ScrollFade>
        </div>
      </div>
    </article>
  );
}
