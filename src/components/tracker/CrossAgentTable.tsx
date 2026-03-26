"use client";

import { useState } from "react";

interface AgentRow {
  agentName: string;
  topBrands: string[];
}

interface CrossAgentTableProps {
  rows: AgentRow[];
  whatThisMeans?: string[];
}

const AGENT_COLORS: Record<string, string> = {
  Claude: "text-white/70",
  Perplexity: "text-blue-400/70",
  ChatGPT: "text-coral/70",
  Gemini: "text-coral/70",
};

export function CrossAgentTable({ rows, whatThisMeans }: CrossAgentTableProps) {
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
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
        Cross-Agent Comparison
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-surface p-6">
        <table className="w-full">
          <thead>
            <tr>
              <th className="pb-4 pr-8 text-left font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white/20">
                Agent
              </th>
              <th className="pb-4 pr-8 text-left font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white/20">
                #1
              </th>
              <th className="pb-4 pr-8 text-left font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white/20">
                #2
              </th>
              <th className="pb-4 text-left font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white/20">
                #3
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.agentName}
                className={
                  i < rows.length - 1 ? "border-b border-white/5" : ""
                }
              >
                <td className={`py-4 pr-8 font-mono text-[13px] font-semibold ${AGENT_COLORS[row.agentName] ?? "text-white/50"}`}>
                  {row.agentName}
                </td>
                {[0, 1, 2].map((idx) => {
                  const brand = row.topBrands[idx];
                  const isHovered = brand && hovered === brand;
                  const isUniversal = brand && universalBrands.has(brand);
                  return (
                    <td
                      key={idx}
                      className={`cursor-default py-4 pr-8 text-[13px] transition-colors ${
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
        </table>
      </div>

      {consensus && (
        <p className="mt-5 text-[13px] text-white/30">
          All {rows.length} models agree on{" "}
          <span className="font-medium text-cyan">{firstPicks[0]}</span>{" "}
          as the top pick.
        </p>
      )}

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
