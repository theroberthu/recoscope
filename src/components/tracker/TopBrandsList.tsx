interface Brand {
  name: string;
  mentionCount: number;
  isFirst: boolean;
}

interface TopBrandsListProps {
  brands: Brand[];
}

export function TopBrandsList({ brands }: TopBrandsListProps) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Top Brands
      </p>
      <ol className="space-y-2">
        {brands.map((brand, i) => (
          <li
            key={brand.name}
            className="flex items-center justify-between rounded-md border border-gray-100 px-4 py-2"
          >
            <span className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-400">
                {i + 1}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {brand.name}
              </span>
              {brand.isFirst && (
                <span className="rounded bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700">
                  #1 pick
                </span>
              )}
            </span>
            <span className="text-xs text-gray-500">
              {brand.mentionCount} mention{brand.mentionCount !== 1 && "s"}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
