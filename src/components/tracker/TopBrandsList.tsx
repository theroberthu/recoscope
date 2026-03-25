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
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Top Brands by AI Mention Frequency
      </p>
      <ol className="space-y-1.5">
        {brands.map((brand, i) => {
          const isTop3 = i < 3;
          return (
            <li
              key={brand.name}
              className={`flex items-center justify-between rounded-md px-4 py-2.5 ${
                isTop3
                  ? "border border-gray-200 bg-gray-50"
                  : "border border-transparent"
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    isTop3
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`text-sm ${
                    isTop3 ? "font-semibold text-gray-900" : "font-medium text-gray-600"
                  }`}
                >
                  {brand.name}
                </span>
                {brand.isFirst && (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                    #1 pick
                  </span>
                )}
              </span>
              <span
                className={`text-xs tabular-nums ${
                  isTop3 ? "font-semibold text-gray-700" : "text-gray-400"
                }`}
              >
                {brand.mentionCount} mention{brand.mentionCount !== 1 && "s"}
              </span>
            </li>
          );
        })}
      </ol>

      {whyTheseWin && whyTheseWin.length > 0 && (
        <div className="mt-6 rounded-md bg-gray-50 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Why These Brands Win
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {whyTheseWin.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2 text-sm leading-relaxed text-gray-600"
              >
                <span className="mt-1.5 block h-1 w-1 flex-shrink-0 rounded-full bg-gray-400" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
