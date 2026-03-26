"use client";

import { useState } from "react";

interface CrossAgentPreviewProps {
  data: { agent_name: string; brand: string; rank: number }[];
  reportHref: string;
}

export function CrossAgentPreview({ data, reportHref }: CrossAgentPreviewProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (data.length === 0) return null;

  // Group by agent
  const agents = new Map<string, string[]>();
  for (const row of data) {
    const list = agents.get(row.agent_name) ?? [];
    list.push(row.brand);
    agents.set(row.agent_name, list);
  }

  // Find brands that appear in ALL agents
  const allBrands = new Set<string>();
  const brandAgentCount = new Map<string, number>();
  for (const [, brands] of agents) {
    for (const brand of brands) {
      brandAgentCount.set(brand, (brandAgentCount.get(brand) ?? 0) + 1);
    }
  }
  for (const [brand, count] of brandAgentCount) {
    if (count >= agents.size) allBrands.add(brand);
  }

  const agentEntries = Array.from(agents.entries());

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[500px]" style={{ gridTemplateColumns: `repeat(${agentEntries.length}, 1fr)` }}>
          {/* Headers */}
          {agentEntries.map(([agent]) => (
            <div key={agent} className="border-b border-white/10 px-3 pb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-white/30">
              {agent}
            </div>
          ))}
          {/* Rows: rank 1, 2, 3 */}
          {[0, 1, 2].map((rank) => (
            agentEntries.map(([agent, brands]) => {
              const brand = brands[rank];
              if (!brand) {
                return <div key={`${agent}-${rank}`} className="px-3 py-3 text-[13px] text-white/20">&mdash;</div>;
              }
              const isUniversal = allBrands.has(brand);
              const isHovered = hovered === brand;
              return (
                <div
                  key={`${agent}-${rank}`}
                  className={`cursor-default px-3 py-3 font-mono text-[13px] transition-colors ${
                    isHovered
                      ? "text-cyan"
                      : isUniversal
                        ? "text-cyan/70"
                        : "text-white/50"
                  }`}
                  onMouseEnter={() => setHovered(brand)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {brand}
                </div>
              );
            })
          ))}
        </div>
      </div>
      <a
        href={reportHref}
        className="mt-6 inline-block font-mono text-[12px] font-medium text-cyan/60 transition-colors hover:text-cyan"
      >
        See the full report &rarr;
      </a>
    </div>
  );
}
