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

  if (items.length === 0 && (!opportunityBullets || opportunityBullets.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        Analysis
      </p>
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-sm font-semibold text-gray-800">{item.label}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            {item.value}
          </p>
        </div>
      ))}

      {opportunityBullets && opportunityBullets.length > 0 && (
        <div className="rounded-md border border-gray-200 bg-gray-50 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Opportunity for Brands
          </p>
          <ul className="mt-3 space-y-2">
            {opportunityBullets.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2 text-sm leading-relaxed text-gray-700"
              >
                <span className="mt-1.5 block h-1 w-1 flex-shrink-0 rounded-full bg-gray-900" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
