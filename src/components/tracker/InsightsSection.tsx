interface InsightsSectionProps {
  commonTraits?: string;
  crossAgentDifferences?: string;
  marketGaps?: string;
  opportunityBullets?: string[];
}

export function InsightsSection({
  commonTraits,
  crossAgentDifferences,
  marketGaps,
  opportunityBullets,
}: InsightsSectionProps) {
  const items = [
    { label: "What top brands have in common", value: commonTraits },
    { label: "Where AI models disagree", value: crossAgentDifferences },
    { label: "Gaps in the market", value: marketGaps },
  ].filter((item) => item.value);

  if (
    items.length === 0 &&
    (!opportunityBullets || opportunityBullets.length === 0)
  ) {
    return null;
  }

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
        Analysis
      </p>

      <div className="mt-6 space-y-8">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-sm font-semibold text-gray-900">
              {item.label}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {opportunityBullets && opportunityBullets.length > 0 && (
        <div className="mt-10 border-l-2 border-gray-200 pl-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Opportunity for Brands
          </p>
          <ul className="mt-4 space-y-3">
            {opportunityBullets.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-sm leading-relaxed text-gray-600"
              >
                <span className="mt-2 block h-1 w-1 flex-shrink-0 rounded-full bg-gray-900" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
