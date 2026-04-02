export type Movement = { type: "new" } | { type: "up"; positions: number } | { type: "down"; positions: number } | { type: "steady" };

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
}

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
      return (
        <span className="font-mono text-[11px] text-white/15">—</span>
      );
  }
}

export function TopBrandsList({ brands, whyTheseWin, droppedBrands }: TopBrandsListProps) {
  const maxMentions = brands.length > 0 ? brands[0].mentionCount : 1;
  const hasLabels = brands.some((b) => b.label);

  return (
    <div>
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
        Top Brands by AI Mention Frequency
      </p>
      <p className="mt-2 text-[13px] text-white/30">
        Mention frequency counts how many times a brand appeared across all AI responses.
        This differs from top-pick rank, which reflects each model&rsquo;s #1 choice.
      </p>

      {/* Tag legend */}
      {hasLabels && (
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-white/25">
          <span><span className="font-semibold text-cyan/50">Overall Leader</span> = most total mentions</span>
          <span><span className="font-semibold text-white/40">Tied #1</span> = tied for most mentions</span>
          <span><span className="font-semibold text-white/40">High Consensus</span> = top 3 in 3+ models</span>
          <span><span className="font-semibold text-white/40">Top in [Model]</span> = #1 pick by that model only</span>
          <span><span className="font-semibold text-amber-400/60">Never Top-Picked</span> = high mentions but not in any model&rsquo;s top 3</span>
        </div>
      )}

      <div className="mt-6 space-y-1.5">
        {brands.map((brand, i) => {
          const isFirst = i === 0;
          const isTop3 = i < 3;
          const barPct = Math.max((brand.mentionCount / maxMentions) * 100, 4);

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
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-4">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold ${
                      isFirst
                        ? "bg-cyan/20 text-cyan"
                        : isTop3
                          ? "bg-white/10 text-white/60"
                          : "text-white/20"
                    }`}
                  >
                    {i + 1}
                  </span>
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
                  {brand.movement && <MovementBadge movement={brand.movement} />}
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

      {/* Dropped brands */}
      {droppedBrands && droppedBrands.length > 0 && (
        <div className="mt-6">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/20">
            Dropped this week
          </p>
          <div className="mt-3 space-y-1">
            {droppedBrands.map((b) => (
              <div
                key={b.name}
                className="flex items-center justify-between px-6 py-2 text-white/20"
              >
                <span className="flex items-center gap-4">
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
