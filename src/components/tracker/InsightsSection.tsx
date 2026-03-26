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
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-400">
        Analysis
      </p>

      <div className="mt-8 space-y-10">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-[15px] font-semibold tracking-tight text-stone-800">
              {item.label}
            </p>
            <p className="mt-2 text-[14px] leading-[1.7] text-stone-500">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {opportunityBullets && opportunityBullets.length > 0 && (
        <div className="mt-12 border-l-[3px] border-stone-200 py-1 pl-8">
          <p className="text-[15px] font-semibold tracking-tight text-stone-800">
            Opportunity for brands
          </p>
          <ul className="mt-4 space-y-3">
            {opportunityBullets.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-[14px] leading-[1.7] text-stone-600"
              >
                <span className="mt-[9px] block h-[3px] w-[3px] shrink-0 rounded-full bg-stone-800" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
