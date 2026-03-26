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
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-300">
        Top Brands by AI Mention Frequency
      </p>

      <div className="mt-6 space-y-1">
        {brands.map((brand, i) => {
          const isFirst = i === 0;
          const isTop3 = i < 3;
          const barWidth = Math.max((brand.mentionCount / maxMentions) * 100, 8);

          return (
            <div
              key={brand.name}
              className={`group relative overflow-hidden rounded-lg ${
                isFirst
                  ? "bg-gray-900 px-6 py-5"
                  : isTop3
                    ? "bg-gray-50 px-6 py-4"
                    : "px-6 py-3"
              }`}
            >
              {isTop3 && !isFirst && (
                <div
                  className="absolute inset-y-0 left-0 bg-gray-100"
                  style={{ width: `${barWidth}%` }}
                />
              )}

              <div className="relative flex items-center justify-between">
                <span className="flex items-center gap-4">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      isFirst
                        ? "bg-white text-gray-900"
                        : isTop3
                          ? "bg-gray-900 text-white"
                          : "text-gray-300"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`${
                      isFirst
                        ? "text-lg font-semibold text-white"
                        : isTop3
                          ? "text-[15px] font-semibold text-gray-900"
                          : "text-sm text-gray-500"
                    }`}
                  >
                    {brand.name}
                  </span>
                  {brand.label && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        isFirst
                          ? "bg-white/15 text-white/80"
                          : "text-gray-400"
                      }`}
                    >
                      {brand.label}
                    </span>
                  )}
                </span>
                <span
                  className={`tabular-nums ${
                    isFirst
                      ? "text-sm text-white/50"
                      : isTop3
                        ? "text-[13px] font-medium text-gray-400"
                        : "text-xs text-gray-300"
                  }`}
                >
                  {brand.mentionCount}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {whyTheseWin && whyTheseWin.length > 0 && (
        <div className="mt-10 pl-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-300">
            Why These Brands Win
          </p>
          <ul className="mt-4 space-y-2.5">
            {whyTheseWin.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-[13px] leading-relaxed text-gray-400"
              >
                <span className="mt-[7px] block h-[3px] w-[3px] shrink-0 rounded-full bg-gray-300" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
