"use client";

import { useState } from "react";

interface TrendPoint {
  week: string;
  rank: number;
}

interface TrendLine {
  brand: string;
  points: TrendPoint[];
}

interface TrendChartProps {
  lines: TrendLine[];
  weeks: string[];
}

const LINE_COLORS = [
  "#00d4aa",     // cyan — top brand
  "#00d4aa99",   // cyan muted
  "#00d4aa66",
  "#00d4aa44",
  "#00d4aa33",
];

export function TrendChart({ lines, weeks }: TrendChartProps) {
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);

  if (lines.length === 0 || weeks.length < 2) return null;

  const maxRank = 10;
  const chartW = 600;
  const chartH = 240;
  const padL = 30;
  const padR = 120;
  const padT = 20;
  const padB = 30;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  function x(weekIdx: number): number {
    return padL + (weekIdx / (weeks.length - 1)) * plotW;
  }

  function y(rank: number): number {
    return padT + ((rank - 1) / (maxRank - 1)) * plotH;
  }

  return (
    <div>
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-cyan/50">
        Rank Trend
      </p>
      <p className="mt-1 text-[14px] text-white/40">
        How top brands moved week over week. Rank 1 is the top position.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-surface p-4">
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full"
          style={{ minWidth: 400 }}
        >
          {/* Grid lines */}
          {[1, 3, 5, 7, 10].map((rank) => (
            <g key={rank}>
              <line
                x1={padL} y1={y(rank)} x2={padL + plotW} y2={y(rank)}
                stroke="white" strokeOpacity={0.05}
              />
              <text
                x={padL - 8} y={y(rank) + 4}
                textAnchor="end" fill="white" fillOpacity={0.2}
                fontSize={10} fontFamily="monospace"
              >
                {rank}
              </text>
            </g>
          ))}

          {/* Week labels */}
          {weeks.map((w, i) => (
            <text
              key={w}
              x={x(i)} y={chartH - 6}
              textAnchor="middle" fill="white" fillOpacity={0.3}
              fontSize={10} fontFamily="monospace"
            >
              {w}
            </text>
          ))}

          {/* Lines */}
          {lines.map((line, li) => {
            const weekMap = new Map(line.points.map((p) => [p.week, p.rank]));
            const segments: { x: number; y: number }[] = [];
            for (let i = 0; i < weeks.length; i++) {
              const rank = weekMap.get(weeks[i]);
              if (rank !== undefined) {
                segments.push({ x: x(i), y: y(rank) });
              }
            }
            if (segments.length < 2) return null;

            const pathD = segments
              .map((s, i) => `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`)
              .join(" ");

            const isHovered = hoveredBrand === line.brand;
            const color = LINE_COLORS[li] ?? LINE_COLORS[LINE_COLORS.length - 1];
            const opacity = hoveredBrand === null ? 1 : isHovered ? 1 : 0.2;

            const lastPt = segments[segments.length - 1];

            return (
              <g
                key={line.brand}
                onMouseEnter={() => setHoveredBrand(line.brand)}
                onMouseLeave={() => setHoveredBrand(null)}
                style={{ cursor: "default" }}
              >
                <path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  opacity={opacity}
                  strokeLinejoin="round"
                />
                {/* Dots */}
                {segments.map((s, si) => (
                  <circle
                    key={si}
                    cx={s.x} cy={s.y} r={isHovered ? 4 : 2.5}
                    fill={color}
                    opacity={opacity}
                  />
                ))}
                {/* Label at right end */}
                <text
                  x={lastPt.x + 8}
                  y={lastPt.y + 4}
                  fill={color}
                  fontSize={11}
                  fontFamily="monospace"
                  opacity={opacity}
                >
                  {line.brand}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
