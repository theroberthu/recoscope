"use client";

import { useState, useEffect, useRef } from "react";
import { BrandMark } from "./TrackerMedia";
import { trackPostHog } from "@/lib/posthog";

export type Movement =
  | { type: "new" }
  | { type: "up"; positions: number }
  | { type: "down"; positions: number }
  | { type: "steady" };

interface Brand {
  name: string;
  mentionCount: number;
  label?: string;
  movement?: Movement;
  neverTopPicked?: boolean;
}

interface DroppedBrand {
  name: string;
  previousRank: number;
}

interface TopBrandsListProps {
  brands: Brand[];
  whyTheseWin?: string[];
  droppedBrands?: DroppedBrand[];
  category?: string;
  eligibleAnswers?: number;
}

const COLLAPSED_COUNT = 5;

function MovementBadge({ movement }: { movement: Movement }) {
  switch (movement.type) {
    case "new":
      return (
        <span className="rounded-full bg-cyan/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan">
          New
        </span>
      );
    case "up":
      return (
        <span className="font-mono text-[11px] font-bold text-green-400">
          ▲ {movement.positions}
        </span>
      );
    case "down":
      return (
        <span className="font-mono text-[11px] font-bold text-amber-400">
          ▼ {movement.positions}
        </span>
      );
    case "steady":
      return <span className="font-mono text-[11px] text-white/15">—</span>;
  }
}

export function TopBrandsList({
  brands,
  whyTheseWin,
  droppedBrands,
  category,
  eligibleAnswers,
}: TopBrandsListProps) {
  const [expanded, setExpanded] = useState(false);
  const droppedRef = useRef<HTMLDivElement>(null);
  const droppedTracked = useRef(false);

  // Event 1: dropped_section_viewed
  useEffect(() => {
    const el = droppedRef.current;
    if (!el || !droppedBrands?.length || droppedTracked.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !droppedTracked.current) {
          droppedTracked.current = true;
          trackPostHog("dropped_section_viewed", {
            category: category ?? "unknown",
            brands_dropped: droppedBrands.length,
          });
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [droppedBrands, category]);

  const maxMentions = brands.length > 0 ? brands[0].mentionCount : 1;
  const hasLabels = brands.some((b) => b.label);
  const canCollapse = brands.length > COLLAPSED_COUNT;
  const visibleBrands =
    canCollapse && !expanded ? brands.slice(0, COLLAPSED_COUNT) : brands;

  return (
    <div>
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
        Top Brands by AI Mention Frequency
      </p>
      <p className="mt-2 text-[13px] text-white/30">
        Mention frequency counts usable answers containing a brand, once per
        answer. Unranked and critical mentions count as visibility.
        Recommendation ranks are shown separately below.
      </p>

      {hasLabels && (
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-white/25">
          <span>
            <span className="font-semibold text-cyan/50">Most Mentioned</span> =
            most answers mentioning a brand
          </span>
          <span>
            <span className="font-semibold text-white/40">Tied #1</span> = tied
            for most mentions
          </span>
          <span>
            <span className="font-semibold text-white/40">
              Top 3 across models
            </span>{" "}
            = a recorded top-three rank in multiple comparisons
          </span>
          <span>
            <span className="font-semibold text-white/40">
              Ranked #1 in [Model]
            </span>{" "}
            = first in that comparative answer
          </span>
          <span>
            <span className="font-semibold text-amber-400/60">
              Unranked mentions
            </span>{" "}
            = visibility without an inferred rank
          </span>
        </div>
      )}

      <div className="mt-6 space-y-1.5">
        {visibleBrands.map((brand, i) => {
          const isFirst = i === 0;
          const isTop3 = i < 3;
          const denominator =
            eligibleAnswers && eligibleAnswers >= maxMentions
              ? eligibleAnswers
              : maxMentions;
          const barPct = Math.min(
            (brand.mentionCount / denominator) * 100,
            100,
          );

          return (
            <div
              key={brand.name}
              className={`group rounded-lg border transition-all ${
                isFirst
                  ? "border-cyan/20 bg-surface px-6 pb-5 pt-5 shadow-[0_0_20px_rgba(0,212,170,0.08)]"
                  : isTop3
                    ? "border-white/5 bg-surface px-6 pb-4 pt-4 hover:border-white/10 hover:shadow-[0_0_12px_rgba(0,212,170,0.05)]"
                    : "border-transparent px-6 pb-3 pt-3 hover:border-white/5"
              }`}
            >
              <div
                className={`flex items-center justify-between ${category === "protein-powder" ? "tracker-brand-row" : ""}`}
              >
                <span className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-4">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold ${
                      isFirst
                        ? "bg-cyan/20 text-cyan"
                        : isTop3
                          ? "bg-white/10 text-white/60"
                          : "text-white/20"
                    }`}
                  >
                    {brands.findIndex(
                      (b) => b.mentionCount === brand.mentionCount,
                    ) + 1}
                  </span>
                  <BrandMark category={category} brand={brand.name} />
                  <span
                    className={`${
                      isFirst
                        ? "text-lg font-semibold text-white"
                        : isTop3
                          ? "text-[15px] font-semibold text-white/80"
                          : "text-sm text-white/40"
                    }`}
                  >
                    {brand.name}
                  </span>
                  {brand.movement && (
                    <MovementBadge movement={brand.movement} />
                  )}
                  {brand.label && !brand.movement && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                        brand.neverTopPicked
                          ? "bg-amber-400/10 text-amber-400/70"
                          : isFirst
                            ? "bg-cyan/10 text-cyan/70"
                            : "text-white/30"
                      }`}
                    >
                      {brand.label}
                    </span>
                  )}
                </span>
                <span
                  className={`font-mono tabular-nums ${
                    isFirst
                      ? "text-sm font-bold text-cyan"
                      : isTop3
                        ? "text-[13px] font-medium text-cyan/50"
                        : "text-xs text-white/20"
                  }`}
                >
                  {brand.mentionCount}
                  {eligibleAnswers && eligibleAnswers >= maxMentions
                    ? `/${eligibleAnswers}`
                    : ""}
                </span>
              </div>

              <div
                className={`mt-3 h-1 rounded-full ${
                  isFirst ? "bg-cyan/10" : "bg-white/5"
                }`}
              >
                <div
                  className={`h-1 rounded-full ${
                    isFirst
                      ? "bg-cyan/50"
                      : isTop3
                        ? "bg-cyan/20"
                        : "bg-white/10"
                  }`}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {canCollapse && (
        <button
          onClick={() => {
            if (!expanded) {
              trackPostHog("full_list_expanded", {
                category: category ?? "unknown",
                total_brands: brands.length,
              });
            }
            setExpanded(!expanded);
          }}
          className="mt-3 w-full rounded-lg py-2.5 text-center font-mono text-[12px] font-medium text-white/30 transition-colors hover:bg-white/5 hover:text-white/50"
        >
          {expanded ? "Show less" : `Show all ${brands.length} brands`}
        </button>
      )}

      {droppedBrands && droppedBrands.length > 0 && (
        <div ref={droppedRef} className="mt-6">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/20">
            Dropped this week
          </p>
          <div className="mt-3 space-y-1">
            {droppedBrands.map((b) => (
              <div
                key={b.name}
                className="flex items-center justify-between px-6 py-2 text-white/20"
              >
                <span className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-4">
                  <span className="h-7 w-7" />
                  <span className="text-sm line-through">{b.name}</span>
                </span>
                <span className="font-mono text-[11px]">
                  was #{b.previousRank}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {whyTheseWin && whyTheseWin.length > 0 && (
        <div className="mt-10 border-l-2 border-cyan/20 pl-6">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
            Why These Brands Win
          </p>
          <ul className="mt-4 space-y-2.5">
            {whyTheseWin.map((point) => (
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
