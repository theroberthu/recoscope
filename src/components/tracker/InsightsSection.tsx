interface InsightsSectionProps {
  commonTraits?: string;
  crossAgentDifferences?: string;
  marketGaps?: string;
}

export function InsightsSection({
  commonTraits,
  crossAgentDifferences,
  marketGaps,
}: InsightsSectionProps) {
  const items = [
    { label: "Common Traits", value: commonTraits },
    { label: "Cross-Agent Differences", value: crossAgentDifferences },
    { label: "Market Gaps", value: marketGaps },
  ].filter((item) => item.value);

  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        Insights
      </p>
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-sm font-medium text-gray-700">{item.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
