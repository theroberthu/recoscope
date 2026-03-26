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
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-300">
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
              className={`rounded-lg ${
                isFirst
                  ? "bg-stone-800 px-6 pb-5 pt-5"
                  : isTop3
                    ? "bg-stone-100 px-6 pb-4 pt-4"
                    : "px-6 pb-3 pt-3"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-4">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      isFirst
                        ? "bg-white/90 text-stone-800"
                        : isTop3
                          ? "bg-stone-800 text-white"
                          : "text-stone-300"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`${
                      isFirst
                        ? "text-lg font-semibold text-white"
                        : isTop3
                          ? "text-[15px] font-semibold text-stone-800"
                          : "text-sm text-stone-500"
                    }`}
                  >
                    {brand.name}
                  </span>
                  {brand.label && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        isFirst
                          ? "bg-white/15 text-white/70"
                          : "text-stone-400"
                      }`}
                    >
                      {brand.label}
                    </span>
                  )}
                </span>
                <span
                  className={`tabular-nums ${
                    isFirst
                      ? "text-sm text-white/40"
                      : isTop3
                        ? "text-[13px] font-medium text-stone-400"
                        : "text-xs text-stone-300"
                  }`}
                >
                  {brand.mentionCount}
                </span>
              </div>

              <div
                className={`mt-3 h-1 rounded-full ${
                  isFirst ? "bg-white/10" : "bg-stone-200"
                }`}
              >
                <div
                  className={`h-1 rounded-full ${
                    isFirst
                      ? "bg-white/30"
                      : isTop3
                        ? "bg-stone-700"
                        : "bg-stone-300"
                  }`}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {whyTheseWin && whyTheseWin.length > 0 && (
        <div className="mt-10 pl-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-300">
            Why These Brands Win
          </p>
          <ul className="mt-4 space-y-2.5">
            {whyTheseWin.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-[13px] leading-relaxed text-stone-400"
              >
                <span className="mt-[7px] block h-[3px] w-[3px] shrink-0 rounded-full bg-stone-300" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
