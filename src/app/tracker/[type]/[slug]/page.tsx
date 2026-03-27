import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getLatestRun, getBrandMentions, getRunInsight } from "@/lib/queries";
import type { BrandMention, RunInsight, TrackerType } from "@/lib/types";
import { cleanText } from "@/lib/clean-text";
import { ScrollFade } from "@/components/home/ScrollFade";
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
// Synthesize takeaway
// ---------------------------------------------------------------------------

function synthesizeTakeaway(
  topBrands: { name: string; mentionCount: number; label?: string }[],
  agentRows: { agentName: string; topBrands: string[] }[],
): string {
  if (topBrands.length === 0) return "No recommendation data available yet.";
  const leader = topBrands[0];
  const runnerUp = topBrands[1];
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
  if (runnerUp) takeaway += ` ${runnerUp.name} follows with ${runnerUp.mentionCount} mentions.`;
  if (topBrands.length > 5) {
    const lowMention = topBrands.slice(3).filter((b) => b.mentionCount <= 2);
    if (lowMention.length > 0) {
      takeaway += ` ${lowMention.length} brand${lowMention.length > 1 ? "s" : ""} appear only in isolated mentions, suggesting fragmented visibility outside the top tier.`;
    }
  }
  return takeaway;
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
                  <span className={`text-[13px] ${i === 0 ? "font-semibold text-white/70" : "text-white/40"}`}>
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
  params: Promise<{ type: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const label = slug.replace(/-/g, " ");
  return {
    title: `${label} — AI Recommendation Tracker | RecoScope`,
    description: `See which brands AI models recommend for ${label}. Benchmark data from ChatGPT, Claude, Gemini, and more.`,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function TrackerReportPage({ params }: Props) {
  const { type, slug } = await params;

  if (!VALID_TYPES.has(type)) notFound();
  const trackerType = type as TrackerType;

  const categoryRow = await getCategoryBySlug(slug, trackerType);
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
  const channelSplit = buildChannelSplit(mentions);

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
      <SectionHeader
        title={categoryRow.name}
        subtitle={`${TYPE_LABELS[trackerType] ?? trackerType} \u2014 ${periodLabel}`}
        badge={run ? (periodLabel !== "—" ? periodLabel : "Live Report") : "No data yet"}
      />

      <section>
        <KeyTakeawayPanel takeaway={takeaway} />
      </section>

      <ScrollFade className="mt-20">
        <TopBrandsList
          brands={topBrands}
          whyTheseWin={toBullets(clean.commonTraits)}
        />
      </ScrollFade>

      <ScrollFade className="mt-20">
        <CrossAgentTable
          rows={agentRows}
          whatThisMeans={toBullets(clean.crossAgentDifferences)}
        />
      </ScrollFade>

      {channelSplit.hasData && (
        <ScrollFade className="mt-20">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            AI Models vs Marketplace Agents
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

      <ScrollFade className="mt-20">
        <InsightsSection
          commonTraits={clean.commonTraits}
          crossAgentDifferences={clean.crossAgentDifferences}
          marketGaps={clean.marketGaps}
          opportunityBullets={toBullets(clean.marketGaps)}
        />
      </ScrollFade>

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
        <CTABox description={clean.auditAngle ?? undefined} />
      </ScrollFade>
    </article>
  );
}
