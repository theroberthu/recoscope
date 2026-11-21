"use client";

import { useState } from "react";

interface AgentRow {
  agentName: string;
  topBrands: string[];
  rankSlots?: string[];
  status?: string | null;
}

interface NotableAbsent {
  name: string;
  mentionCount: number;
}

interface CrossAgentTableProps {
  rows: AgentRow[];
  whatThisMeans?: string[];
  notableAbsents?: NotableAbsent[];
}

export function CrossAgentTable({ rows, whatThisMeans, notableAbsents }: CrossAgentTableProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const rankedRows = rows.filter(r => r.topBrands.length > 0);
  const firstPicks = rankedRows.map(r => r.rankSlots?.[0] || r.topBrands[0]).filter(Boolean);
  const consensus =
    firstPicks.length === rankedRows.length && firstPicks.length > 1 && firstPicks.every((p) => p === firstPicks[0]);

  // Find brands in all agents
  const brandAgentCount = new Map<string, number>();
  for (const row of rows) {
    for (const brand of row.topBrands) {
      brandAgentCount.set(brand, (brandAgentCount.get(brand) ?? 0) + 1);
    }
  }
  const universalBrands = new Set<string>();
  for (const [brand, count] of brandAgentCount) {
    if (count >= rankedRows.length) universalBrands.add(brand);
  }

  return (
    <div>
      {/* Section intro */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="report-result-heading">Who ranks first in each AI answer?</h2>
          <p className="mt-1 text-[14px] text-white/40">
            Recorded top-three ranks from the comparative prompt (Prompt 3). A mention alone does not imply a rank or establish product quality.
          </p>
        </div>
        <p className="report-rank-coverage">
          {rankedRows.length}/{rows.length} models with recorded ranks
        </p>
      </div>

      <div className="report-rank-cards">
        {rows.map((row) => <section key={row.agentName} className="report-rank-card" aria-label={`${row.agentName} comparative answer`}>
          <h3>{row.agentName}</h3>
          {row.status ? <p className="report-rank-status">{row.status}</p> : <dl>
            {[0, 1, 2].map((idx) => {
              const brand = row.rankSlots ? row.rankSlots[idx] : row.topBrands[idx];
              return <div key={idx}><dt>#{idx + 1}</dt><dd>{brand || "No rank recorded"}</dd></div>;
            })}
          </dl>}
        </section>)}
      </div>

      {/* A native table supports direct column comparison on larger screens. */}
      <div className="report-rank-table overflow-x-auto rounded-xl border border-cyan/15 bg-surface shadow-[0_0_30px_rgba(0,212,170,0.06)]">
        <table className="w-full">
          <caption className="sr-only">Recorded top-three ranks by AI assistant in the comparative prompt</caption>
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white/25">
                Agent
              </th>
              <th className="px-6 py-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-cyan/40">
                #1
              </th>
              <th className="px-6 py-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white/20">
                #2
              </th>
              <th className="px-6 py-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white/20">
                #3
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.agentName}
                className={`transition-colors hover:bg-white/[0.02] ${
                  i < rows.length - 1 ? "border-b border-white/5" : ""
                }`}
              >
                <td className="px-6 py-4 font-mono text-[13px] font-semibold text-white/60">
                  {row.agentName}
                </td>
                {row.status ? <td colSpan={3} className="px-6 py-4 text-[13px] text-white/50">{row.status}</td> : [0, 1, 2].map((idx) => {
                  const brand = row.rankSlots ? row.rankSlots[idx] : row.topBrands[idx];
                  const isHovered = brand && hovered === brand;
                  const isUniversal = brand && universalBrands.has(brand);
                  return (
                    <td
                      key={idx}
                      className={`cursor-default px-6 py-4 text-[13px] transition-colors ${
                        isHovered
                          ? "text-cyan"
                          : isUniversal
                            ? "text-cyan/60"
                            : idx === 0
                              ? "font-medium text-white/70"
                              : "text-white/30"
                      }`}
                      onMouseEnter={() => brand && setHovered(brand)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {brand || "\u2014"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Consensus callout */}
      {consensus && (
        <div className="mt-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
          <p className="text-[13px] text-white/40">
            All {rankedRows.length} ranked comparisons list{" "}
            <span className="font-semibold text-cyan">{firstPicks[0]}</span>{" "}
            at recorded rank #1
          </p>
        </div>
      )}

      {/* Notable absent callout */}
      {notableAbsents && notableAbsents.length > 0 && (
        <div className="mt-4 border-l-2 border-amber-400/30 py-2 pl-6">
          <p className="text-[13px] leading-relaxed text-white/40">
            {notableAbsents.map((b) => (
              <span key={b.name}>
                <span className="font-semibold text-amber-400/80">{b.name}</span>
                {" "}has a mention count of {b.mentionCount} but is outside the displayed comparison.
              </span>
            ))}{" "}
            Mention frequency and response rank measure different things.
          </p>
        </div>
      )}

      <a href="#captured-answers" className="report-evidence-link">Read the captured answers <span aria-hidden="true">↗</span></a>

      <p className="mt-2 text-[13px] leading-relaxed text-white/40">Historical parsing conventions may differ; use the captured answers and collection notes when comparing snapshots.</p>

      {/* What this means */}
      {whatThisMeans && whatThisMeans.length > 0 && (
        <div className="mt-10 border-l-2 border-cyan/20 pl-6">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            What This Means
          </p>
          <ul className="mt-4 space-y-2.5">
            {whatThisMeans.map((point) => (
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
      )}
    </div>
  );
}
