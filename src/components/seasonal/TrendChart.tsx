"use client";

import { useId, useState } from "react";
import { spreadChartLabels } from "@/lib/chart-layout.mjs";

interface TrendPoint { week: string; rank: number; }
interface TrendLine { brand: string; points: TrendPoint[]; }
interface TrendChartProps { lines: TrendLine[]; weeks: string[]; }

const LINE_COLORS = ["#07685c", "#3266a3", "#9a4f13", "#7652a0", "#56665e"];
const LINE_DASHES = [undefined, "7 3", "2 3", "9 3 2 3", "5 3"];

export function TrendChart({ lines, weeks }: TrendChartProps) {
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const activeBrand = hoveredBrand ?? selectedBrand;
  const titleId = useId();
  if (!lines.length || weeks.length < 2) return null;

  const maxRank = Math.max(10, ...lines.flatMap(line => line.points.map(p => p.rank)));
  const chartW = 720;
  const chartH = 300;
  const padL = 36;
  const padR = 172;
  const padT = 24;
  const padB = 44;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const x = (index: number) => padL + index / (weeks.length - 1) * plotW;
  const y = (rank: number) => padT + (rank - 1) / (maxRank - 1) * plotH;
  const ticks = Array.from(new Set([1, Math.round(maxRank / 4), Math.round(maxRank / 2), Math.round(maxRank * 3 / 4), maxRank])).sort((a,b) => a-b);
  const plotted = lines.flatMap((line, index) => {
    const weekMap = new Map(line.points.map(p => [p.week, p.rank]));
    const points = weeks.flatMap((week, i) => {
      const rank = weekMap.get(week);
      return rank === undefined ? [] : [{x:x(i),y:y(rank)}];
    });
    return points.length < 2 ? [] : [{...line,index,observations:line.points,points,y:points[points.length-1].y}];
  });
  const labels = new Map(spreadChartLabels(plotted,padT,padT+plotH).map(line => [line.brand,line.labelY]));
  // Keep long date sequences legible on narrow screens, while retaining both ends.
  const labelEvery = Math.max(1, Math.ceil(weeks.length / 7));

  return (
    <div>
      <p className="text-[15px] font-semibold text-ink">Mention Frequency Trend</p>
      <p className="mt-2 text-[14px] text-muted">
        Brands ordered by mention count in each run. Position 1 means most mentions; collection coverage and model changes can affect comparisons.
      </p>
      <p className="mt-2 text-[12px] text-muted sm:hidden">Scroll sideways to see all dates and labels.</p>
      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-surface p-4 sm:p-6">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{minWidth:640}} role="img" aria-labelledby={titleId}>
          <title id={titleId}>Brand mention positions over time. Lower position numbers mean more mentions, not better product quality.</title>
          {ticks.map(rank => <g key={rank}>
            <line x1={padL} y1={y(rank)} x2={padL+plotW} y2={y(rank)} stroke="#d8e1da" />
            <text x={padL-10} y={y(rank)+4} textAnchor="end" fill="#596a61" fontSize={14}>{rank}</text>
          </g>)}
          {weeks.map((week,i) => (i % labelEvery === 0 || i === weeks.length-1) && <text key={week} x={x(i)} y={chartH-15} textAnchor="middle" fill="#596a61" fontSize={14}>{week}</text>)}
          {plotted.map(line => {
            const color = LINE_COLORS[line.index % LINE_COLORS.length];
            const dash = LINE_DASHES[line.index % LINE_DASHES.length];
            const highlighted = activeBrand === line.brand;
            const opacity = activeBrand === null || highlighted ? 1 : 0.38;
            const last = line.points[line.points.length-1];
            const labelY = labels.get(line.brand)!;
            const path = line.points.map((p,i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
            return <g key={line.brand} onMouseEnter={() => setHoveredBrand(line.brand)} onMouseLeave={() => setHoveredBrand(null)} opacity={opacity}>
              <title>{line.brand}: {line.observations.map(p => `${p.week}, position ${p.rank}`).join("; ")}</title>
              <path d={path} fill="none" stroke={color} strokeWidth={highlighted ? 3.5 : 2.4} strokeDasharray={dash} strokeLinejoin="round" />
              {line.points.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r={highlighted ? 4.5 : 3.3} fill={color} stroke="white" strokeWidth={1.5} />)}
              <path d={`M ${last.x+5} ${last.y} L ${padL+plotW+12} ${labelY} L ${padL+plotW+20} ${labelY}`} fill="none" stroke={color} strokeWidth={1.2} />
              <text x={padL+plotW+26} y={labelY+5} fill={color} fontSize={16} fontWeight={600}>{line.brand}</text>
            </g>;
          })}
        </svg>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4" aria-label="Chart legend">
          {plotted.map(line => <button key={line.brand} type="button" className="flex items-center gap-2 rounded px-1 py-1 text-[12px] text-ink" onClick={() => setSelectedBrand(selectedBrand === line.brand ? null : line.brand)} onMouseEnter={() => setHoveredBrand(line.brand)} onMouseLeave={() => setHoveredBrand(null)} onFocus={() => setHoveredBrand(line.brand)} onBlur={() => setHoveredBrand(null)} aria-pressed={selectedBrand === line.brand} aria-label={`Highlight ${line.brand}. ${line.observations.map(p => `${p.week}, position ${p.rank}`).join("; ")}`}>
            <svg width="24" height="8" aria-hidden="true"><line x1="0" y1="4" x2="24" y2="4" stroke={LINE_COLORS[line.index % LINE_COLORS.length]} strokeWidth="2.5" strokeDasharray={LINE_DASHES[line.index % LINE_DASHES.length]} /></svg>
            {line.brand}
          </button>)}
        </div>
      </div>
    </div>
  );
}
