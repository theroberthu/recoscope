interface Brand {
  name: string;
  mentionCount: number;
  isFirst: boolean;
}

interface TopBrandsListProps {
  brands: Brand[];
  whyTheseWin?: string[];
}

export function TopBrandsList({ brands, whyTheseWin }: TopBrandsListProps) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
        Top Brands by AI Mention Frequency
      </p>

      <ol className="mt-5 space-y-2">
        {brands.map((brand, i) => {
          const isTop3 = i < 3;
          return (
            <li
              key={brand.name}
              className={`flex items-center justify-between rounded-lg px-5 ${
                isTop3
                  ? "bg-gray-900 py-4 text-white"
                  : "py-3 text-gray-600"
              }`}
            >
              <span className="flex items-center gap-4">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    isTop3
                      ? "bg-white text-gray-900"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`${
                    isTop3 ? "text-base font-semibold" : "text-sm font-medium"
                  }`}
                >
                  {brand.name}
                </span>
                {brand.isFirst && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      isTop3
                        ? "bg-white/20 text-white"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    #1 pick
                  </span>
                )}
              </span>
              <span
                className={`tabular-nums ${
                  isTop3
                    ? "text-sm font-medium text-gray-400"
                    : "text-xs text-gray-400"
                }`}
              >
                {brand.mentionCount}
              </span>
            </li>
          );
        })}
      </ol>

      {whyTheseWin && whyTheseWin.length > 0 && (
        <div className="mt-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Why These Brands Win
          </p>
          <ul className="mt-3 space-y-2">
            {whyTheseWin.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-sm leading-relaxed text-gray-500"
              >
                <span className="mt-2 block h-1 w-1 flex-shrink-0 rounded-full bg-gray-300" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
