"use client";

import { useState } from "react";

interface Ranking {
  brand: string;
  mentions: number;
  top3: number;
  firstPicks: number;
  isClient: boolean;
}

export function ExpandableRankingsTable({
  rankings,
  initialCount = 15,
}: {
  rankings: Ranking[];
  initialCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rankings : rankings.slice(0, initialCount);
  const hiddenCount = rankings.length - initialCount;

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface">
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
            {visible.map((r, i) => (
              <tr
                key={r.brand}
                className={`border-b border-white/5 last:border-0 ${r.isClient ? "bg-cyan/[0.08]" : ""}`}
              >
                <td className={`px-5 py-3 font-mono ${r.isClient ? "text-cyan/50" : "text-white/30"}`}>{i + 1}</td>
                <td className={`px-5 py-3 font-medium ${r.isClient ? "text-cyan" : "text-white/60"}`}>
                  {r.brand}
                </td>
                <td className={`px-5 py-3 font-mono tabular-nums ${r.isClient ? "text-cyan/60" : "text-white/40"}`}>{r.mentions}</td>
                <td className={`px-5 py-3 font-mono tabular-nums ${r.isClient ? "text-cyan/60" : "text-white/40"}`}>{r.top3}</td>
                <td className={`px-5 py-3 font-mono tabular-nums ${r.isClient ? "text-cyan/60" : "text-white/40"}`}>{r.firstPicks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full rounded-lg border border-white/5 py-2.5 font-mono text-[12px] text-white/30 transition-colors hover:border-white/10 hover:text-white/50"
        >
          {expanded ? "Show top 15 only" : `Expand to view all ${rankings.length} brands`}
        </button>
      )}
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-wider text-white/25">
      {children}
    </th>
  );
}
