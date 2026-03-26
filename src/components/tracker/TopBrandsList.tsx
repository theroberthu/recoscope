interface Brand {
  name: string;
  mentionCount: number;
  label?: string;
}

interface TopBrandsListProps {
  brands: Brand[];
  whyTheseWin?: string[];
}

export function TopBrandsList({ brands, whyTheseWin }: TopBrandsListProps) {
  const maxMentions = brands.length > 0 ? brands[0].mentionCount : 1;

  return (
    <div>
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
        Top Brands by AI Mention Frequency
      </p>

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
                  {brand.label && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                        isFirst
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
