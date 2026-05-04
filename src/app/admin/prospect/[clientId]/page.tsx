import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  getProspectRuns,
  getBrandMentions,
  getAgentResponses,
  getRunInsight,
  getPromptsForRun,
} from "@/lib/queries";
import type { BrandMention, RunInsight } from "@/lib/types";

export const metadata: Metadata = {
  title: "Prospect Dashboard — RecoScope",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

const COOKIE_NAME = "prospect_auth";

function isAuthed(cookieStore: Awaited<ReturnType<typeof cookies>>): boolean {
  const password = process.env.PROSPECT_DASHBOARD_PASSWORD;
  if (!password) return false;
  return cookieStore.get(COOKIE_NAME)?.value === password;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true" || v === "t";
  return Boolean(v);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(d: unknown): string {
  if (d instanceof Date) return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  const str = String(d);
  const parts = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (parts) return `${MONTHS[parseInt(parts[2], 10) - 1]} ${parseInt(parts[3], 10)}, ${parts[1]}`;
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return `${MONTHS[parsed.getUTCMonth()]} ${parsed.getUTCDate()}, ${parsed.getUTCFullYear()}`;
  return str;
}

// ---------------------------------------------------------------------------
// Scorecard computation
// ---------------------------------------------------------------------------

interface VisibilityScore {
  clientBrand: string;
  totalMentions: number;
  totalResponses: number;
  mentionRate: number;
  top3Count: number;
  firstPickCount: number;
  avgRank: number | null;
  agentBreakdown: { agent: string; mentions: number; top3: number; firstPick: boolean }[];
}

function computeVisibility(
  mentions: BrandMention[],
  clientId: string,
): VisibilityScore {
  const clientBrand = clientId.charAt(0).toUpperCase() + clientId.slice(1);
  const allAgents = new Set(mentions.map((m) => m.agent_name));
  const allPrompts = new Set(mentions.map((m) => `${m.agent_name}:${m.prompt_number}`));
  const totalResponses = allPrompts.size;

  const clientMentions = mentions.filter(
    (m) => m.brand_name_normalized.toLowerCase() === clientId.toLowerCase()
      || m.brand_name_normalized.toLowerCase().includes(clientId.toLowerCase()),
  );

  const totalMentions = clientMentions.length;
  const top3Count = clientMentions.filter((m) => toBool(m.is_top_3) || Number(m.mention_rank) <= 3).length;
  const firstPickCount = clientMentions.filter((m) => toBool(m.is_first)).length;

  const ranks = clientMentions.map((m) => Number(m.mention_rank)).filter((r) => r > 0);
  const avgRank = ranks.length > 0 ? ranks.reduce((a, b) => a + b, 0) / ranks.length : null;

  const agentBreakdown = Array.from(allAgents).map((agent) => {
    const agentClientMentions = clientMentions.filter((m) => m.agent_name === agent);
    return {
      agent,
      mentions: agentClientMentions.length,
      top3: agentClientMentions.filter((m) => toBool(m.is_top_3) || Number(m.mention_rank) <= 3).length,
      firstPick: agentClientMentions.some((m) => toBool(m.is_first)),
    };
  });

  return {
    clientBrand,
    totalMentions,
    totalResponses,
    mentionRate: totalResponses > 0 ? totalMentions / totalResponses : 0,
    top3Count,
    firstPickCount,
    avgRank,
    agentBreakdown,
  };
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
// Login form (server action)
// ---------------------------------------------------------------------------

async function loginAction(formData: FormData) {
  "use server";
  const password = formData.get("password") as string;
  const clientId = formData.get("clientId") as string;
  if (password === process.env.PROSPECT_DASHBOARD_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    redirect(`/admin/prospect/${clientId}`);
  }
  redirect(`/admin/prospect/${clientId}?error=1`);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface Props {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function ProspectDashboard({ params, searchParams }: Props) {
  const { clientId } = await params;
  const { error } = await searchParams;
  const cookieStore = await cookies();

  // Auth gate
  if (!isAuthed(cookieStore)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-center text-2xl font-bold text-white">Prospect Dashboard</h1>
          <p className="mt-2 text-center text-[13px] text-white/40">Enter the access password to continue.</p>
          {error && (
            <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-center text-[13px] text-red-400">
              Invalid password. Please try again.
            </p>
          )}
          <form action={loginAction} className="mt-6">
            <input type="hidden" name="clientId" value={clientId} />
            <input
              type="password"
              name="password"
              placeholder="Access password"
              autoFocus
              className="w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-[14px] text-white placeholder-white/20 outline-none focus:border-cyan/50"
            />
            <button
              type="submit"
              className="mt-3 w-full rounded-lg bg-cyan px-4 py-3 font-mono text-[13px] font-bold text-void transition-colors hover:bg-cyan/90"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Load all prospect runs for this client
  const runs = await getProspectRuns(clientId);
  if (runs.length === 0) notFound();

  // Load data for each run
  const runData = await Promise.all(
    runs.map(async (run) => {
      const [mentions, responses, insight, prompts] = await Promise.all([
        getBrandMentions(run.id),
        getAgentResponses(run.id),
        getRunInsight(run.id),
        getPromptsForRun(run.id),
      ]);
      const visibility = computeVisibility(mentions, clientId);
      const rankings = buildRankings(mentions);
      return { run, mentions, responses, insight, prompts, visibility, rankings };
    }),
  );

  return (
    <div className="min-h-screen bg-void">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/60">
              Private Report
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">
              {clientId.charAt(0).toUpperCase() + clientId.slice(1)} — AI Visibility Report
            </h1>
          </div>
          <span className="rounded-full bg-amber-400/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400/70">
            Confidential
          </span>
        </div>

        {runData.map(({ run, mentions, responses, insight, prompts, visibility, rankings }) => (
          <section key={run.id} className="mt-16">
            {/* Run header */}
            <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{run.category_name}</h2>
                <p className="mt-1 text-[13px] text-white/40">
                  {formatDate(run.run_date)} &middot; {run.period_label}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                run.status === "published" ? "bg-green-500/10 text-green-400" :
                run.status === "reviewed" ? "bg-cyan/10 text-cyan/70" :
                "bg-white/5 text-white/30"
              }`}>
                {run.status}
              </span>
            </div>

            {/* 1. Visibility Scorecard */}
            <div className="mt-8">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
                Visibility Scorecard
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <ScoreCard label="Total Mentions" value={String(visibility.totalMentions)} />
                <ScoreCard
                  label="Mention Rate"
                  value={`${Math.round(visibility.mentionRate * 100)}%`}
                  subtitle={`${visibility.totalMentions} of ${visibility.totalResponses} responses`}
                />
                <ScoreCard label="Top-3 Appearances" value={String(visibility.top3Count)} />
                <ScoreCard
                  label="Avg Rank"
                  value={visibility.avgRank ? `#${visibility.avgRank.toFixed(1)}` : "—"}
                  subtitle={visibility.firstPickCount > 0 ? `${visibility.firstPickCount} first-pick${visibility.firstPickCount > 1 ? "s" : ""}` : undefined}
                />
              </div>
            </div>

            {/* 2. Per-Agent Breakdown */}
            <div className="mt-10">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
                Per-Agent Breakdown
              </p>
              <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-surface">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-white/5">
                      <Th>Agent</Th>
                      <Th>Mentions</Th>
                      <Th>Top-3</Th>
                      <Th>First Pick</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibility.agentBreakdown.map((a) => (
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
            </div>

            {/* 3. Competitive Landscape */}
            <div className="mt-10">
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
                      const isClient = r.brand.toLowerCase() === clientId.toLowerCase()
                        || r.brand.toLowerCase().includes(clientId.toLowerCase());
                      return (
                        <tr
                          key={r.brand}
                          className={`border-b border-white/5 last:border-0 ${isClient ? "bg-cyan/5" : ""}`}
                        >
                          <td className="px-5 py-3 font-mono text-white/30">{i + 1}</td>
                          <td className={`px-5 py-3 font-medium ${isClient ? "text-cyan" : "text-white/60"}`}>
                            {r.brand}
                            {isClient && (
                              <span className="ml-2 rounded bg-cyan/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-cyan/70">
                                You
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 font-mono tabular-nums text-white/40">{r.mentions}</td>
                          <td className="px-5 py-3 font-mono tabular-nums text-white/40">{r.top3}</td>
                          <td className="px-5 py-3 font-mono tabular-nums text-white/40">{r.firstPicks}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Per-Prompt Results */}
            {prompts.length > 0 && (
              <div className="mt-10">
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
                  Per-Prompt Results
                </p>
                <div className="mt-4 space-y-4">
                  {prompts.map((p) => {
                    const promptMentions = mentions.filter((m) => Number(m.prompt_number) === p.prompt_number);
                    const agentMap = new Map<string, BrandMention[]>();
                    for (const m of promptMentions) {
                      const list = agentMap.get(m.agent_name) ?? [];
                      list.push(m);
                      agentMap.set(m.agent_name, list);
                    }
                    return (
                      <div key={p.prompt_number} className="rounded-xl border border-white/10 bg-surface p-5">
                        <p className="text-[12px] text-white/30">
                          <span className="font-mono font-bold text-white/50">P{p.prompt_number}</span>{" "}
                          {p.prompt_text}
                        </p>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {Array.from(agentMap.entries()).map(([agent, agentMentions]) => {
                            const sorted = [...agentMentions].sort((a, b) => Number(a.mention_rank) - Number(b.mention_rank));
                            return (
                              <div key={agent}>
                                <p className="font-mono text-[11px] font-bold text-white/40">{agent}</p>
                                <ol className="mt-1 space-y-0.5">
                                  {sorted.slice(0, 5).map((m, j) => {
                                    const isClient = m.brand_name_normalized.toLowerCase() === clientId.toLowerCase()
                                      || m.brand_name_normalized.toLowerCase().includes(clientId.toLowerCase());
                                    return (
                                      <li key={`${m.id}-${j}`} className={`text-[12px] ${isClient ? "font-semibold text-cyan" : "text-white/35"}`}>
                                        <span className="mr-2 font-mono text-white/20">{m.mention_rank}.</span>
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
              </div>
            )}

            {/* 5. Insights */}
            {insight && (
              <div className="mt-10">
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
                  AI-Generated Insights
                </p>
                <div className="mt-4 space-y-4">
                  {insight.key_takeaway && (
                    <InsightBlock label="Key Takeaway" text={insight.key_takeaway} />
                  )}
                  {insight.common_traits && (
                    <InsightBlock label="Common Traits of Top Brands" text={insight.common_traits} />
                  )}
                  {insight.cross_agent_differences && (
                    <InsightBlock label="Cross-Agent Differences" text={insight.cross_agent_differences} />
                  )}
                  {insight.market_gaps && (
                    <InsightBlock label="Market Gaps & Opportunities" text={insight.market_gaps} />
                  )}
                  {insight.audit_angle && (
                    <InsightBlock label="Recommended Strategy" text={insight.audit_angle} highlight />
                  )}
                </div>
              </div>
            )}

            {/* 6. Raw Responses */}
            {responses.length > 0 && (
              <details className="mt-10 group">
                <summary className="flex cursor-pointer items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30 hover:text-white/50">
                  <span className="transition-transform group-open:rotate-90">&#9654;</span>
                  Raw AI Responses ({responses.length})
                </summary>
                <div className="mt-4 space-y-4">
                  {responses.map((r) => (
                    <div key={r.id} className="rounded-xl border border-white/5 bg-surface p-5">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-[11px] font-bold text-white/50">{r.agent_name}</span>
                        <span className="font-mono text-[10px] text-white/20">Prompt {r.prompt_number}</span>
                      </div>
                      <pre className="mt-3 max-h-60 overflow-y-auto whitespace-pre-wrap text-[12px] leading-relaxed text-white/30">
                        {r.raw_response}
                      </pre>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </section>
        ))}

        {/* CTA */}
        <div className="mt-20 rounded-xl border border-cyan/20 bg-cyan/5 p-8 text-center">
          <p className="text-lg font-semibold text-white">Ready to improve your AI visibility?</p>
          <p className="mt-2 text-[14px] text-white/40">
            This report shows where your brand stands today. Let&rsquo;s build a strategy to move you up.
          </p>
          <a
            href="/audit"
            className="mt-6 inline-block rounded-full bg-cyan px-8 py-3 font-mono text-[13px] font-bold text-void transition-colors hover:bg-cyan/90"
          >
            Book Your Free Audit
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

function ScoreCard({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface p-4">
      <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/25">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-white">{value}</p>
      {subtitle && <p className="mt-1 text-[11px] text-white/25">{subtitle}</p>}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-wider text-white/25">
      {children}
    </th>
  );
}

function InsightBlock({ label, text, highlight }: { label: string; text: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? "border-cyan/20 bg-cyan/5" : "border-white/10 bg-surface"}`}>
      <p className={`font-mono text-[10px] font-bold uppercase tracking-wider ${highlight ? "text-cyan/60" : "text-white/25"}`}>
        {label}
      </p>
      <p className={`mt-2 text-[13px] leading-relaxed ${highlight ? "text-white/60" : "text-white/40"}`}>
        {text}
      </p>
    </div>
  );
}
