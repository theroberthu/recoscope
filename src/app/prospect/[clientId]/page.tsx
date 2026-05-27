import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  getProspectProfile,
  getProspectRuns,
  getProspectDayCount,
  getDemoRuns,
  getDemoDayCount,
  getPublicRunsByCategory,
  getPublicDayCountByCategory,
  getBrandMentions,
  getAgentResponses,
  getRunInsight,
  getPromptsForRun,
} from "@/lib/queries";
import type { BrandMention } from "@/lib/types";

export const metadata: Metadata = {
  title: "AI Visibility Report — RecoScope",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

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

function isClientBrand(brand: string, clientId: string): boolean {
  return brand.toLowerCase() === clientId.toLowerCase()
    || brand.toLowerCase().includes(clientId.toLowerCase());
}

// ---------------------------------------------------------------------------
// Score computation
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

function computeScore(mentions: BrandMention[], clientId: string): ScoreData {
  const allAgents = new Set(mentions.map((m) => m.agent_name));

  // Total response slots = unique (run_id, agent_name, prompt_number) tuples
  const totalSlots = new Set(
    mentions.map((m) => `${m.run_id}:${m.agent_name}:${m.prompt_number}`),
  ).size || 1;

  const clientMentions = mentions.filter((m) => isClientBrand(m.brand_name_normalized, clientId));
  const totalMentions = clientMentions.length;

  // Client slots = unique response slots where client brand appears
  const clientSlots = new Set(
    clientMentions.map((m) => `${m.run_id}:${m.agent_name}:${m.prompt_number}`),
  ).size;

  const top3Count = clientMentions.filter((m) => toBool(m.is_top_3) || Number(m.mention_rank) <= 3).length;
  const firstPickCount = clientMentions.filter((m) => toBool(m.is_first)).length;
  const ranks = clientMentions.map((m) => Number(m.mention_rank)).filter((r) => r > 0);
  const avgRank = ranks.length > 0 ? ranks.reduce((a, b) => a + b, 0) / ranks.length : null;

  // Mention rate: fraction of response slots where client appears
  const mentionRate = clientSlots / totalSlots;

  // Discovery presence: does client appear in broad/discovery prompts?
  // Convention: the final prompt is typically direct comparison; earlier prompts are discovery
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

  // Consistency: fraction of runs where client appears at least once
  const allRuns = new Set(mentions.map((m) => m.run_id));
  const runsWithClient = new Set(clientMentions.map((m) => m.run_id));
  const consistencyRate = allRuns.size > 0 ? runsWithClient.size / allRuns.size : 0;

  // Rank quality: when mentioned, how good is the ranking? (lower = better)
  // rank 1 → 1.0, rank 3 → 0.7, rank 5 → 0.5, rank 10+ → 0
  const rankScore = avgRank !== null ? Math.max(0, Math.min(1, (10 - avgRank) / 9)) : 0;

  // Composite: mention_rate(40) + discovery(30) + consistency(15) + rank_quality(15)
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
// Auth
// ---------------------------------------------------------------------------

const COOKIE_PREFIX = "prospect_access_";

function getCookieName(clientId: string): string {
  return `${COOKIE_PREFIX}${clientId}`;
}

async function loginAction(formData: FormData) {
  "use server";
  const password = formData.get("password") as string;
  const clientId = (formData.get("clientId") as string).toLowerCase();
  const { getProspectProfile: getProfile } = await import("@/lib/queries");
  const profile = await getProfile(clientId);
  if (profile && password.toLowerCase() === profile.password.toLowerCase()) {
    const cookieStore = await cookies();
    cookieStore.set(getCookieName(clientId), "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    redirect(`/prospect/${clientId}`);
  }
  redirect(`/prospect/${clientId}?error=1`);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface Props {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ key?: string; error?: string }>;
}

export default async function ProspectPage({ params, searchParams }: Props) {
  const { clientId: rawClientId } = await params;
  const clientId = rawClientId.toLowerCase();
  const { key, error } = await searchParams;
  const cookieStore = await cookies();

  let profile;
  try {
    profile = await getProspectProfile(clientId);
  } catch (e) {
    console.error("[prospect] getProspectProfile failed:", clientId, e);
  }

  // Auth: check URL token, then cookie
  let authed = false;
  if (profile) {
    if (key && key.toLowerCase() === profile.password.toLowerCase()) {
      authed = true;
    } else if (cookieStore.get(getCookieName(clientId))?.value === "1") {
      authed = true;
    }
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-center text-2xl font-bold text-white">AI Visibility Report</h1>
          <p className="mt-2 text-center text-[13px] text-white/40">Enter your password to view this report.</p>
          {error && (
            <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-center text-[13px] text-red-400">
              Incorrect password. Please try again.
            </p>
          )}
          <form action={loginAction} className="mt-6">
            <input type="hidden" name="clientId" value={clientId} />
            <input
              type="password"
              name="password"
              placeholder="Report password"
              autoFocus
              className="w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-[14px] text-white placeholder-white/20 outline-none focus:border-cyan/50"
            />
            <button
              type="submit"
              className="mt-3 w-full rounded-lg bg-cyan px-4 py-3 font-mono text-[13px] font-bold text-void transition-colors hover:bg-cyan/90"
            >
              View Report
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!profile) notFound();

  // Load data — data_source controls where runs come from:
  // null/undefined: use own client_id (private runs)
  // "public": pull from public benchmark runs (by brand, then fallback to category)
  // other string: use that client_id's private runs (data sharing)
  const usePublicData = profile.data_source === "public";
  const dataClientId = (!usePublicData && profile.data_source) || clientId;
  let runs: Awaited<ReturnType<typeof getProspectRuns>> = [];
  let dayInfo = { dayCount: 0, firstDate: null as string | null, lastDate: null as string | null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allData: { run: any; mentions: BrandMention[]; responses: any[]; insight: any; prompts: any[] }[] = [];

  try {
    if (usePublicData) {
      // Try brand-specific first, then fall back to category-wide (for zero-mention brands)
      [runs, dayInfo] = await Promise.all([
        getDemoRuns(profile.brand_name),
        getDemoDayCount(profile.brand_name),
      ]);
      if (runs.length === 0 && profile.category_slug) {
        [runs, dayInfo] = await Promise.all([
          getPublicRunsByCategory(profile.category_slug),
          getPublicDayCountByCategory(profile.category_slug),
        ]);
      }
    } else {
      [runs, dayInfo] = await Promise.all([
        getProspectRuns(dataClientId),
        getProspectDayCount(dataClientId),
      ]);
    }
  } catch (e) {
    console.error("[prospect] failed to load runs:", e);
    runs = [];
    dayInfo = { dayCount: 0, firstDate: null, lastDate: null };
  }

  if (runs.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">{profile.brand_name}</h1>
          <p className="mt-4 text-[14px] text-white/40">
            Your report is being prepared. Data collection is in progress — check back soon.
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
    console.error("[prospect] failed to load run data:", e);
  }

  const allMentions = allData.flatMap((d) => d.mentions);
  const score = computeScore(allMentions, clientId);
  const rankings = buildRankings(allMentions);
  const agentCount = score.agentBreakdown.length;
  const isZeroState = score.totalMentions === 0;

  // Diagnosis
  const mentionPct = Math.round(score.mentionRate * 100);
  let diagnosis: string;
  if (isZeroState) {
    // Zero-state: show top 2 competitors with their rates
    const top2 = rankings.slice(0, 2);
    const compParts = top2.map((r) => {
      const slots = new Set(
        allMentions
          .filter((m) => m.brand_name_normalized === r.brand)
          .map((m) => `${m.run_id}:${m.agent_name}:${m.prompt_number}`),
      ).size;
      const pct = Math.round((slots / (score.totalSlots || 1)) * 100);
      return `${r.brand} appears in ${pct}%`;
    });
    diagnosis = `${profile.brand_name} does not appear in any AI recommendation we tracked. ${compParts.join(". ")}.`;
  } else {
    const topCompetitor = rankings.find((r) => !isClientBrand(r.brand, clientId));
    if (topCompetitor) {
      const compSlots = new Set(
        allMentions
          .filter((m) => m.brand_name_normalized === topCompetitor.brand)
          .map((m) => `${m.run_id}:${m.agent_name}:${m.prompt_number}`),
      ).size;
      const compPct = Math.round((compSlots / score.totalSlots) * 100);
      if (compPct > mentionPct) {
        diagnosis = `${profile.brand_name} appears in ${mentionPct}% of AI responses across ${agentCount} models. ${topCompetitor.brand} leads at ${compPct}%.`;
      } else {
        diagnosis = `${profile.brand_name} appears in ${mentionPct}% of AI responses across ${agentCount} models, ahead of ${topCompetitor.brand} at ${compPct}%.`;
      }
    } else {
      diagnosis = `${profile.brand_name} appears in ${mentionPct}% of AI responses across ${agentCount} models.`;
    }
  }

  // Strategy text: profile override takes precedence
  const strategyText = profile.strategy_text
    ?? allData.find((d) => d.insight?.audit_angle)?.insight?.audit_angle
    ?? null;

  // Date range
  const firstDate = fmtShort(dayInfo.firstDate);
  const lastDate = fmtShort(dayInfo.lastDate);
  const dateRange = dayInfo.firstDate === dayInfo.lastDate
    ? `${fmtDate(dayInfo.firstDate)}, ${dayInfo.dayCount} day of tracking`
    : `${firstDate}–${lastDate}, ${dayInfo.dayCount} days of tracking`;

  // Score color — zero state always red
  const scoreColor = score.aiScore <= 40
    ? "text-red-400"
    : score.aiScore <= 70
      ? "text-amber-400"
      : "text-green-400";
  const scoreBorder = score.aiScore <= 40
    ? "border-red-400/20"
    : score.aiScore <= 70
      ? "border-amber-400/20"
      : "border-green-400/20";
  const scoreBg = score.aiScore <= 40
    ? "bg-red-400/5"
    : score.aiScore <= 70
      ? "bg-amber-400/5"
      : "bg-green-400/5";

  const recommendations = [
    profile.recommendation_1,
    profile.recommendation_2,
    profile.recommendation_3,
  ].filter(Boolean) as string[];

  const category = runs[0]?.category_slug ?? profile.category_slug ?? "";
  const ctaParams = new URLSearchParams({
    brand: profile.brand_name,
    ...(profile.website ? { website: profile.website } : {}),
    ...(category ? { category } : {}),
    source: `prospect-${clientId}`,
  });
  const ctaUrl = `https://theroberthu.com/free-strategy-session?${ctaParams.toString()}`;

  return (
    <div className="min-h-screen bg-void">
      <div className="mx-auto max-w-3xl px-6 py-16">

        {/* ── 1. Personal note ── */}
        <div className="mb-12 rounded-xl border border-white/10 bg-surface p-6">
          <p className="text-[15px] leading-relaxed text-white/60">
            {profile.personal_note
              || `${profile.prospect_name} — this report is your private snapshot of how AI search is treating ${profile.brand_name} right now. I tracked your brand across ChatGPT and Claude over ${dayInfo.dayCount} day${dayInfo.dayCount !== 1 ? "s" : ""}. Findings below.`}
          </p>
          <p className="mt-4 text-[13px] text-white/30">— Robert</p>
        </div>

        {/* ── 2. Header ── */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {profile.brand_name}
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
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-cyan px-8 py-3 font-mono text-[13px] font-bold text-void transition-colors hover:bg-cyan/90"
          >
            Discuss These Findings
          </a>
        </div>

        {/* ── 6. Prompts We Tested ── */}
        {(() => {
          // Parse tested_prompts — Neon may return JSONB as a string
          let tp: { persona: string; prompts: string[] } | null = null;
          if (profile.tested_prompts) {
            tp = typeof profile.tested_prompts === "string"
              ? JSON.parse(profile.tested_prompts)
              : profile.tested_prompts as { persona: string; prompts: string[] };
          }
          if (tp && tp.prompts.length > 0) {
            return (
              <div className="mt-16">
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
                  Prompts We Tested
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-white/35">
                  These are the actual buyer-style queries we ran through ChatGPT and Claude during the tracking period.
                </p>
                <div className="mt-4 rounded-lg border border-white/5 bg-surface px-5 py-3">
                  <p className="text-[12px] text-white/25">
                    <span className="font-mono font-bold text-white/35">Tested as</span>{" "}
                    {tp.persona}
                  </p>
                </div>
                <ol className="mt-3 space-y-2">
                  {tp.prompts.map((text, i) => (
                    <li key={i} className="flex gap-3 rounded-lg border border-white/5 bg-surface px-5 py-3">
                      <span className="shrink-0 font-mono text-[12px] text-white/20">{i + 1}.</span>
                      <span className="text-[13px] leading-relaxed text-white/50">&ldquo;{text}&rdquo;</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-[12px] italic text-white/25">
                  If these prompts don&rsquo;t match how your buyers actually search, that&rsquo;s worth a conversation. We can adjust the test set.
                </p>
              </div>
            );
          }
          // Fallback: show data_source category prompts with disclaimer
          const seen = new Set<string>();
          const fallbackPrompts: string[] = [];
          const normalize = (s: string) => s.toLowerCase().replace(/[—–-]+/g, "-");
          for (const d of allData) {
            for (const p of d.prompts) {
              const text = (p.prompt_text as string)?.trim();
              if (text && !seen.has(normalize(text))) {
                seen.add(normalize(text));
                fallbackPrompts.push(text);
              }
            }
          }
          if (fallbackPrompts.length === 0) return null;
          const categoryName = runs[0]?.category_name ?? "this";
          return (
            <div className="mt-16">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
                Prompts We Tested
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-white/35">
                Tested across our {categoryName} category benchmark. Custom buyer-persona prompts available on request.
              </p>
              <ol className="mt-4 space-y-2">
                {fallbackPrompts.slice(0, 8).map((text, i) => (
                  <li key={i} className="flex gap-3 rounded-lg border border-white/5 bg-surface px-5 py-3">
                    <span className="shrink-0 font-mono text-[12px] text-white/20">{i + 1}.</span>
                    <span className="text-[13px] leading-relaxed text-white/50">&ldquo;{text}&rdquo;</span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-[12px] italic text-white/25">
                If these prompts don&rsquo;t match how your buyers actually search, that&rsquo;s worth a conversation. We can adjust the test set.
              </p>
            </div>
          );
        })()}

        {/* ── 7. Recommended Strategy ── */}
        {strategyText && (
          <div className="mt-16 rounded-xl border-l-4 border-cyan/40 bg-surface p-6">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-cyan/60">
              Recommended Strategy
            </p>
            {strategyText.split(/\n\n+/).map((para: string, i: number) => (
              <p key={i} className={`text-[15px] leading-relaxed text-white/60 ${i > 0 ? "mt-4" : "mt-3"}`}>
                {para.trim()}
              </p>
            ))}
          </div>
        )}

        {/* ── 7. Competitive Landscape ── */}
        <div className="mt-16">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            Competitive Landscape
          </p>
          {isZeroState && (
            <p className="mt-3 rounded-lg border border-red-400/10 bg-red-400/5 px-5 py-3 text-[13px] text-red-400/70">
              {profile.brand_name} is not present in this competitive landscape. The brands below are what AI recommends instead.
            </p>
          )}
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
                  const isClient = !isZeroState && isClientBrand(r.brand, clientId);
                  return (
                    <tr
                      key={r.brand}
                      className={`border-b border-white/5 last:border-0 ${isClient ? "bg-cyan/[0.08]" : ""}`}
                    >
                      <td className={`px-5 py-3 font-mono ${isClient ? "text-cyan/50" : "text-white/30"}`}>{i + 1}</td>
                      <td className={`px-5 py-3 font-medium ${isClient ? "text-cyan" : "text-white/60"}`}>
                        {r.brand}
                        {isClient && (
                          <span className="ml-2 rounded bg-cyan/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-cyan">
                            You
                          </span>
                        )}
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

        {/* ── 8. What we'd recommend ── */}
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

        {/* ── 9. Per-day data breakdown ── */}
        <div className="mt-16">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            Data Breakdown
          </p>

          {/* Consolidated scorecard */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total Mentions" value={String(score.totalMentions)} />
            <StatCard label="Mention Rate" value={`${mentionPct}%`} />
            <StatCard label="Top-3 Appearances" value={String(score.top3Count)} />
            <StatCard label="Avg Rank" value={score.avgRank ? `#${score.avgRank.toFixed(1)}` : isZeroState ? "Not ranked" : "—"} />
          </div>

          {/* Per-agent breakdown */}
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
                      {a.firstPick ? (
                        <span className="text-green-400">Yes</span>
                      ) : (
                        <span className="text-white/20">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Daily breakdown — collapsed */}
          <details className="mt-6 group">
            <summary className="flex cursor-pointer items-center gap-2 font-mono text-[12px] font-medium text-white/40 hover:text-white/60">
              <span className="transition-transform group-open:rotate-90">&#9654;</span>
              Expand daily breakdown ({allData.length} day{allData.length !== 1 ? "s" : ""})
            </summary>
            <div className="mt-4 space-y-8">
              {allData.map(({ run, mentions, prompts, insight }) => {
                const dayScore = computeScore(mentions, clientId);
                const dayRankings = buildRankings(mentions);
                return (
                  <div key={run.id} className="rounded-xl border border-white/5 bg-surface/50 p-5">
                    <div className="flex items-baseline justify-between">
                      <p className="font-mono text-[12px] font-bold text-white/50">
                        {fmtDate(run.run_date)}
                      </p>
                      <span className="font-mono text-[11px] text-white/25">
                        Score: {dayScore.aiScore}/100
                      </span>
                    </div>

                    {/* Day prompts */}
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
                        if (agentMentions.some((m) => isClientBrand(m.brand_name_normalized, clientId))) {
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
                                      const ic = isClientBrand(m.brand_name_normalized, clientId);
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
                );
              })}
            </div>
          </details>
        </div>

        {/* ── 10. Bottom CTA ── */}
        <div className="mt-20 rounded-xl border border-cyan/20 bg-cyan/5 p-8 text-center">
          <p className="text-lg font-semibold text-white">Want to discuss these findings?</p>
          <p className="mt-2 text-[14px] text-white/40">
            Schedule a 30-minute strategy session to walk through what&rsquo;s driving these results and what to do about it.
          </p>
          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full bg-cyan px-8 py-3 font-mono text-[13px] font-bold text-void transition-colors hover:bg-cyan/90"
          >
            Discuss These Findings
          </a>
        </div>

        <p className="mt-8 text-center text-[11px] text-white/15">
          This is a confidential report prepared by RecoScope. Do not distribute.
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
