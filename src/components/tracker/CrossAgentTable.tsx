"use client";

import { useState } from "react";

interface AgentRow {
  agentName: string;
  topBrands: string[];
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

  const firstPicks = rows.map((r) => r.topBrands[0]).filter(Boolean);
  const consensus =
    firstPicks.length > 1 && firstPicks.every((p) => p === firstPicks[0]);

  // Find brands in all agents
  const brandAgentCount = new Map<string, number>();
  for (const row of rows) {
    for (const brand of row.topBrands) {
      brandAgentCount.set(brand, (brandAgentCount.get(brand) ?? 0) + 1);
    }
  }
  const universalBrands = new Set<string>();
  for (const [brand, count] of brandAgentCount) {
    if (count >= rows.length) universalBrands.add(brand);
  }

  return (
    <div>
      {/* Section intro */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/50">
            Cross-Agent Comparison
          </p>
          <p className="mt-1 text-[14px] text-white/40">
            How {rows.length} AI models rank the same category. Hover a brand to trace it across models.
          </p>
        </div>
        <p className="hidden font-mono text-[10px] text-white/20 sm:block">
          {rows.length} agents &middot; top 3 each
        </p>
      </div>

      {/* Notable absent callout */}
      {notableAbsents && notableAbsents.length > 0 && (
        <div className="mb-6 border-l-2 border-amber-400/30 py-2 pl-6">
          <p className="text-[13px] leading-relaxed text-white/40">
            {notableAbsents.map((b) => (
              <span key={b.name}>
                <span className="font-semibold text-amber-400/80">{b.name}</span>
                {" "}leads in total mentions ({b.mentionCount}) but doesn&rsquo;t appear below.
              </span>
            ))}{" "}
            High mention volume doesn&rsquo;t always equal top-pick authority.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-cyan/15 bg-surface shadow-[0_0_30px_rgba(0,212,170,0.06)]">
        <table className="w-full">
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
                {[0, 1, 2].map((idx) => {
                  const brand = row.topBrands[idx];
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
                      {brand ?? "\u2014"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>

          {/* Notable absent footnote */}
          {notableAbsents && notableAbsents.length > 0 && (
            <tfoot>
              <tr className="border-t border-white/5">
                <td colSpan={4} className="px-6 py-3">
                  <div className="flex items-center gap-3 text-[12px]">
                    {notableAbsents.map((b) => (
                      <span key={b.name} className="flex items-center gap-1.5 text-amber-400/50">
                        <span className="font-mono font-semibold">{b.name}</span>
                        <span className="text-white/20">&middot;</span>
                        <span className="text-white/25">{b.mentionCount} mentions, outside top 3 for all models</span>
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Consensus callout */}
      {consensus && (
        <div className="mt-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
          <p className="text-[13px] text-white/40">
            All {rows.length} models agree on{" "}
            <span className="font-semibold text-cyan">{firstPicks[0]}</span>{" "}
            as the top pick
          </p>
        </div>
      )}

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
