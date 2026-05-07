import type { Metadata } from "next";
import {
  getProspectProfile,
  getDemoRuns,
  getDemoDayCount,
  getBrandMentions,
  getAgentResponses,
  getRunInsight,
  getPromptsForRun,
} from "@/lib/queries";
import type { BrandMention } from "@/lib/types";

export const metadata: Metadata = {
  title: "Demo AI Visibility Report — CeraVe | RecoScope",
  description: "See what an AI Visibility Report looks like. CeraVe's real benchmark data across ChatGPT, Claude, Gemini & Perplexity.",
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

const DEMO_CLIENT_ID = "demo";
const DEMO_BRAND = "CeraVe";
const CTA_URL = "https://theroberthu.com/free-strategy-session";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true" || v === "t";
  return Boolean(v);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(d: unknown): string {
  if (d instanceof Date) return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  const str = String(d);
  const parts = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (parts) return `${MONTHS[parseInt(parts[2], 10) - 1]} ${parseInt(parts[3], 10)}, ${parts[1]}`;
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return `${MONTHS[parsed.getUTCMonth()]} ${parsed.getUTCDate()}, ${parsed.getUTCFullYear()}`;
  return str;
}

function fmtShort(d: unknown): string {
  if (d instanceof Date) return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
  const str = String(d);
  const parts = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (parts) return `${MONTHS[parseInt(parts[2], 10) - 1]} ${parseInt(parts[3], 10)}`;
  return fmtDate(d);
}

function isBrand(brand: string): boolean {
  return brand.toLowerCase().includes("cerave");
}

// ---------------------------------------------------------------------------
// Score computation (same as prospect pages)
// ---------------------------------------------------------------------------

interface ScoreData {
  totalMentions: number;
  totalSlots: number;
  mentionRate: number;
  discoveryRate: number;
  consistencyRate: number;
  rankScore: number;
  top3Count: number;
  firstPickCount: number;
  avgRank: number | null;
  aiScore: number;
  grade: string;
  agentBreakdown: { agent: string; mentions: number; top3: number; firstPick: boolean }[];
}

function computeScore(mentions: BrandMention[]): ScoreData {
  const allAgents = new Set(mentions.map((m) => m.agent_name));
  const totalSlots = new Set(
    mentions.map((m) => `${m.run_id}:${m.agent_name}:${m.prompt_number}`),
  ).size || 1;

  const clientMentions = mentions.filter((m) => isBrand(m.brand_name_normalized));
  const totalMentions = clientMentions.length;
  const clientSlots = new Set(
    clientMentions.map((m) => `${m.run_id}:${m.agent_name}:${m.prompt_number}`),
  ).size;

  const top3Count = clientMentions.filter((m) => toBool(m.is_top_3) || Number(m.mention_rank) <= 3).length;
  const firstPickCount = clientMentions.filter((m) => toBool(m.is_first)).length;
  const ranks = clientMentions.map((m) => Number(m.mention_rank)).filter((r) => r > 0);
  const avgRank = ranks.length > 0 ? ranks.reduce((a, b) => a + b, 0) / ranks.length : null;

  const mentionRate = clientSlots / totalSlots;

  const promptNumbers = Array.from(new Set(mentions.map((m) => Number(m.prompt_number)))).sort((a, b) => a - b);
  const maxPrompt = promptNumbers[promptNumbers.length - 1] ?? 0;
  const discoveryMentions = mentions.filter((m) => Number(m.prompt_number) < maxPrompt);
  const discoverySlots = new Set(
    discoveryMentions.map((m) => `${m.run_id}:${m.agent_name}:${m.prompt_number}`),
  ).size || 1;
  const clientDiscoverySlots = new Set(
    clientMentions
      .filter((m) => Number(m.prompt_number) < maxPrompt)
      .map((m) => `${m.run_id}:${m.agent_name}:${m.prompt_number}`),
  ).size;
  const discoveryRate = promptNumbers.length > 1 ? clientDiscoverySlots / discoverySlots : mentionRate;

  const allRuns = new Set(mentions.map((m) => m.run_id));
  const runsWithClient = new Set(clientMentions.map((m) => m.run_id));
  const consistencyRate = allRuns.size > 0 ? runsWithClient.size / allRuns.size : 0;

  const rankScore = avgRank !== null ? Math.max(0, Math.min(1, (10 - avgRank) / 9)) : 0;

  const aiScore = Math.round(
    (mentionRate * 40) +
    (discoveryRate * 30) +
    (consistencyRate * 15) +
    (rankScore * 15),
  );

  let grade = "F";
  if (aiScore >= 90) grade = "A";
  else if (aiScore >= 80) grade = "B";
  else if (aiScore >= 70) grade = "C";
  else if (aiScore >= 60) grade = "D";

  const agentBreakdown = Array.from(allAgents).map((agent) => {
    const ac = clientMentions.filter((m) => m.agent_name === agent);
    return {
      agent,
      mentions: ac.length,
      top3: ac.filter((m) => toBool(m.is_top_3) || Number(m.mention_rank) <= 3).length,
      firstPick: ac.some((m) => toBool(m.is_first)),
    };
  });

  return { totalMentions, totalSlots, mentionRate, discoveryRate, consistencyRate, rankScore, top3Count, firstPickCount, avgRank, aiScore, grade, agentBreakdown };
}

function buildRankings(mentions: BrandMention[]): { brand: string; mentions: number; top3: number; firstPicks: number }[] {
  const map = new Map<string, { mentions: number; top3: number; firstPicks: number }>();
  for (const m of mentions) {
    const key = m.brand_name_normalized;
    if (!key) continue;
    const entry = map.get(key) ?? { mentions: 0, top3: 0, firstPicks: 0 };
    entry.mentions += 1;
    if (toBool(m.is_top_3) || Number(m.mention_rank) <= 3) entry.top3 += 1;
    if (toBool(m.is_first)) entry.firstPicks += 1;
    map.set(key, entry);
  }
  return Array.from(map.entries())
    .map(([brand, stats]) => ({ brand, ...stats }))
    .sort((a, b) => b.mentions - a.mentions);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DemoPage() {
  let profile;
  try {
    profile = await getProspectProfile(DEMO_CLIENT_ID);
  } catch {
    // prospect_profiles table may not exist
  }

  let runs: Awaited<ReturnType<typeof getDemoRuns>> = [];
  let dayInfo = { dayCount: 0, firstDate: null as string | null, lastDate: null as string | null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allData: { run: any; mentions: BrandMention[]; responses: any[]; insight: any; prompts: any[] }[] = [];

  try {
    [runs, dayInfo] = await Promise.all([
      getDemoRuns(DEMO_BRAND),
      getDemoDayCount(DEMO_BRAND),
    ]);
  } catch (e) {
    console.error("[demo] failed to load runs:", e);
  }

  if (runs.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Demo Report</h1>
          <p className="mt-4 text-[14px] text-white/40">
            The demo report is being prepared. Check back soon.
          </p>
        </div>
      </div>
    );
  }

  try {
    allData = await Promise.all(
      runs.map(async (run) => {
        const [mentions, responses, insight, prompts] = await Promise.all([
          getBrandMentions(run.id),
          getAgentResponses(run.id),
          getRunInsight(run.id),
          getPromptsForRun(run.id),
        ]);
        return { run, mentions, responses, insight, prompts };
      }),
    );
  } catch (e) {
    console.error("[demo] failed to load run data:", e);
  }

  const allMentions = allData.flatMap((d) => d.mentions);
  const score = computeScore(allMentions);
  const rankings = buildRankings(allMentions);
  const agentCount = score.agentBreakdown.length;

  // Diagnosis
  const mentionPct = Math.round(score.mentionRate * 100);
  const topCompetitor = rankings.find((r) => !isBrand(r.brand));
  let diagnosis: string;
  if (allMentions.length === 0) {
    diagnosis = `Data collection is in progress for ${DEMO_BRAND}.`;
  } else if (topCompetitor) {
    const compSlots = new Set(
      allMentions
        .filter((m) => m.brand_name_normalized === topCompetitor.brand)
        .map((m) => `${m.run_id}:${m.agent_name}:${m.prompt_number}`),
    ).size;
    const compPct = Math.round((compSlots / score.totalSlots) * 100);
    if (compPct > mentionPct) {
      diagnosis = `${DEMO_BRAND} appears in ${mentionPct}% of AI responses across ${agentCount} models. ${topCompetitor.brand} leads at ${compPct}%.`;
    } else {
      diagnosis = `${DEMO_BRAND} appears in ${mentionPct}% of AI responses across ${agentCount} models, ahead of ${topCompetitor.brand} at ${compPct}%.`;
    }
  } else {
    diagnosis = `${DEMO_BRAND} appears in ${mentionPct}% of AI responses across ${agentCount} models.`;
  }

  const strategyText = allData.find((d) => d.insight?.audit_angle)?.insight?.audit_angle ?? null;

  const firstDate = fmtShort(dayInfo.firstDate);
  const lastDate = fmtShort(dayInfo.lastDate);
  const dateRange = dayInfo.firstDate === dayInfo.lastDate
    ? `${fmtDate(dayInfo.firstDate)}`
    : `${firstDate}–${lastDate}, ${dayInfo.dayCount} days of tracking`;

  const scoreColor = score.aiScore <= 40 ? "text-red-400" : score.aiScore <= 70 ? "text-amber-400" : "text-green-400";
  const scoreBorder = score.aiScore <= 40 ? "border-red-400/20" : score.aiScore <= 70 ? "border-amber-400/20" : "border-green-400/20";
  const scoreBg = score.aiScore <= 40 ? "bg-red-400/5" : score.aiScore <= 70 ? "bg-amber-400/5" : "bg-green-400/5";

  const recommendations = [
    profile?.recommendation_1,
    profile?.recommendation_2,
    profile?.recommendation_3,
  ].filter(Boolean) as string[];

  const demoNote = profile?.personal_note
    || `This is a sample AI Visibility Report. ${DEMO_BRAND} scored ${score.aiScore}/100 because it ${score.aiScore >= 70 ? "dominates" : score.aiScore >= 40 ? "has moderate presence in" : "is underrepresented in"} skincare AI search. Your report would look just like this, with your brand's data.`;

  return (
    <div className="min-h-screen bg-void">
      {/* Demo banner */}
      <div className="border-b border-amber-400/20 bg-amber-400/5 py-3 text-center">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400/80">
          Demo Report — This is what your brand&rsquo;s report would look like
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-16">

        {/* ── 1. Demo intro ── */}
        <div className="mb-12 rounded-xl border border-white/10 bg-surface p-6">
          <p className="text-[15px] leading-relaxed text-white/60">
            {demoNote}
          </p>
          <p className="mt-4">
            <a
              href={CTA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-cyan/60 underline underline-offset-2 hover:text-cyan"
            >
              Want to see your score? Schedule a free strategy session →
            </a>
          </p>
          <p className="mt-3 text-[13px] text-white/30">— Robert</p>
        </div>

        {/* ── 2. Header ── */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {DEMO_BRAND}
          </h1>
          <p className="mt-2 font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-cyan/60">
            AI Visibility Report
          </p>
          <p className="mt-2 text-[14px] text-white/40">
            {dateRange}
          </p>
        </div>

        {/* ── 3. AI Visibility Score ── */}
        <div className={`mx-auto mt-12 max-w-xs rounded-2xl border ${scoreBorder} ${scoreBg} p-8 text-center`}>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">
            AI Visibility Score
          </p>
          <p className={`mt-4 text-7xl font-bold tabular-nums ${scoreColor}`}>
            {score.aiScore}
          </p>
          <p className="mt-1 text-[14px] text-white/30">out of 100</p>
          <p className={`mt-3 inline-block rounded-full px-4 py-1 font-mono text-[12px] font-bold ${scoreBg} ${scoreColor}`}>
            Grade: {score.grade}
          </p>
        </div>

        {/* ── 4. Diagnosis ── */}
        <p className="mx-auto mt-8 max-w-xl text-center text-[15px] leading-relaxed text-white/50">
          {diagnosis}
        </p>

        {/* ── 5. Primary CTA ── */}
        <div className="mt-8 text-center">
          <a
            href={CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-cyan px-8 py-3 font-mono text-[13px] font-bold text-void transition-colors hover:bg-cyan/90"
          >
            Get My Brand&rsquo;s Report
          </a>
        </div>

        {/* ── 6. Recommended Strategy ── */}
        {strategyText && (
          <div className="mt-16 rounded-xl border-l-4 border-cyan/40 bg-surface p-6">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-cyan/60">
              Recommended Strategy
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-white/60">
              {strategyText}
            </p>
          </div>
        )}

        {/* ── 7. Competitive Landscape ── */}
        <div className="mt-16">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            Competitive Landscape
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-surface">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-white/5">
                  <Th>#</Th>
                  <Th>Brand</Th>
                  <Th>Mentions</Th>
                  <Th>Top-3</Th>
                  <Th>First Picks</Th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r, i) => {
                  const isClient = isBrand(r.brand);
                  return (
                    <tr
                      key={r.brand}
                      className={`border-b border-white/5 last:border-0 ${isClient ? "bg-cyan/[0.08]" : ""}`}
                    >
                      <td className={`px-5 py-3 font-mono ${isClient ? "text-cyan/50" : "text-white/30"}`}>{i + 1}</td>
                      <td className={`px-5 py-3 font-medium ${isClient ? "text-cyan" : "text-white/60"}`}>
                        {r.brand}
                      </td>
                      <td className={`px-5 py-3 font-mono tabular-nums ${isClient ? "text-cyan/60" : "text-white/40"}`}>{r.mentions}</td>
                      <td className={`px-5 py-3 font-mono tabular-nums ${isClient ? "text-cyan/60" : "text-white/40"}`}>{r.top3}</td>
                      <td className={`px-5 py-3 font-mono tabular-nums ${isClient ? "text-cyan/60" : "text-white/40"}`}>{r.firstPicks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 8. Recommendations ── */}
        {recommendations.length > 0 && (
          <div className="mt-16">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
              What We&rsquo;d Recommend
            </p>
            <ol className="mt-4 space-y-4">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex gap-4 rounded-xl border border-white/10 bg-surface p-5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan/10 font-mono text-[12px] font-bold text-cyan">
                    {i + 1}
                  </span>
                  <p className="text-[14px] leading-relaxed text-white/50">{rec}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ── 9. Data Breakdown ── */}
        <div className="mt-16">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            Data Breakdown
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total Mentions" value={String(score.totalMentions)} />
            <StatCard label="Mention Rate" value={`${mentionPct}%`} />
            <StatCard label="Top-3 Appearances" value={String(score.top3Count)} />
            <StatCard label="Avg Rank" value={score.avgRank ? `#${score.avgRank.toFixed(1)}` : "—"} />
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-surface">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-white/5">
                  <Th>Model</Th>
                  <Th>Mentions</Th>
                  <Th>Top-3</Th>
                  <Th>First Pick</Th>
                </tr>
              </thead>
              <tbody>
                {score.agentBreakdown.map((a) => (
                  <tr key={a.agent} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-3 font-medium text-white/60">{a.agent}</td>
                    <td className="px-5 py-3 font-mono tabular-nums text-white/40">{a.mentions}</td>
                    <td className="px-5 py-3 font-mono tabular-nums text-white/40">{a.top3}</td>
                    <td className="px-5 py-3">
                      {a.firstPick ? <span className="text-green-400">Yes</span> : <span className="text-white/20">No</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Per-run detail — collapsed */}
          <details className="mt-6 group">
            <summary className="flex cursor-pointer items-center gap-2 font-mono text-[12px] font-medium text-white/40 hover:text-white/60">
              <span className="transition-transform group-open:rotate-90">&#9654;</span>
              Expand per-prompt breakdown ({allData.length} run{allData.length !== 1 ? "s" : ""})
            </summary>
            <div className="mt-4 space-y-8">
              {allData.map(({ run, mentions, prompts }) => (
                <div key={run.id} className="rounded-xl border border-white/5 bg-surface/50 p-5">
                  <p className="font-mono text-[12px] font-bold text-white/50">
                    {run.category_name} — {fmtDate(run.run_date)}
                  </p>
                  {prompts.map((p) => {
                    const promptMentions = mentions.filter((m) => Number(m.prompt_number) === p.prompt_number);
                    const agentMap = new Map<string, BrandMention[]>();
                    for (const m of promptMentions) {
                      const list = agentMap.get(m.agent_name) ?? [];
                      list.push(m);
                      agentMap.set(m.agent_name, list);
                    }
                    const clientPresentIn = new Set<string>();
                    for (const [agent, agentMentions] of agentMap) {
                      if (agentMentions.some((m) => isBrand(m.brand_name_normalized))) {
                        clientPresentIn.add(agent);
                      }
                    }
                    return (
                      <div key={p.prompt_number} className="mt-4 border-t border-white/5 pt-4">
                        <p className="text-[11px] text-white/25">
                          <span className="font-mono font-bold text-white/40">P{p.prompt_number}</span>{" "}
                          {p.prompt_text}
                        </p>
                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {Array.from(agentMap.entries()).map(([agent, agentMentions]) => {
                            const sorted = [...agentMentions].sort((a, b) => Number(a.mention_rank) - Number(b.mention_rank));
                            const absent = !clientPresentIn.has(agent);
                            return (
                              <div key={agent}>
                                <p className="font-mono text-[10px] font-bold text-white/30">
                                  {agent}
                                  {absent && <span className="ml-1 text-amber-400/80">(absent)</span>}
                                </p>
                                <ol className="mt-0.5 space-y-0">
                                  {sorted.slice(0, 5).map((m, j) => {
                                    const ic = isBrand(m.brand_name_normalized);
                                    return (
                                      <li key={`${m.id}-${j}`} className={`text-[11px] ${ic ? "font-semibold text-cyan" : "text-white/25"}`}>
                                        <span className="mr-1.5 font-mono text-white/15">{m.mention_rank}.</span>
                                        {m.brand_name_normalized}
                                      </li>
                                    );
                                  })}
                                </ol>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </details>
        </div>

        {/* ── 10. Bottom CTA ── */}
        <div className="mt-20 rounded-xl border border-cyan/20 bg-cyan/5 p-8 text-center">
          <p className="text-lg font-semibold text-white">Want to see your brand&rsquo;s AI visibility?</p>
          <p className="mt-2 text-[14px] text-white/40">
            We&rsquo;ll build a report just like this one for your brand — with your real data across ChatGPT, Claude, and more.
          </p>
          <a
            href={CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full bg-cyan px-8 py-3 font-mono text-[13px] font-bold text-void transition-colors hover:bg-cyan/90"
          >
            Get My Brand&rsquo;s Report
          </a>
        </div>

        <p className="mt-8 text-center text-[11px] text-white/15">
          Demo report using real benchmark data. Published by RecoScope.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-wider text-white/25">
      {children}
    </th>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface p-4">
      <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/25">{label}</p>
      <p className="mt-2 text-xl font-bold tabular-nums text-white">{value}</p>
    </div>
  );
}
