interface AgentRow {
  agentName: string;
  topBrands: string[];
}

interface CrossAgentTableProps {
  rows: AgentRow[];
  whatThisMeans?: string[];
}

export function CrossAgentTable({ rows, whatThisMeans }: CrossAgentTableProps) {
  const firstPicks = rows.map((r) => r.topBrands[0]).filter(Boolean);
  const consensus =
    firstPicks.length > 1 && firstPicks.every((p) => p === firstPicks[0]);

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-400">
        Cross-Agent Comparison
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="pb-4 pr-8 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                Agent
              </th>
              <th className="pb-4 pr-8 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                #1
              </th>
              <th className="pb-4 pr-8 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                #2
              </th>
              <th className="pb-4 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                #3
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.agentName}
                className={
                  i < rows.length - 1
                    ? "border-b border-stone-100"
                    : ""
                }
              >
                <td className="py-4 pr-8 text-[13px] font-semibold text-stone-900">
                  {row.agentName}
                </td>
                {[0, 1, 2].map((idx) => (
                  <td
                    key={idx}
                    className={`py-4 pr-8 text-[13px] ${
                      idx === 0
                        ? "font-medium text-stone-900"
                        : "text-stone-500"
                    }`}
                  >
                    {row.topBrands[idx] ?? "\u2014"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {consensus && (
        <p className="mt-5 text-[13px] text-stone-500">
          All {rows.length} models agree on{" "}
          <span className="font-medium text-stone-900">{firstPicks[0]}</span>{" "}
          as the top pick.
        </p>
      )}

      {whatThisMeans && whatThisMeans.length > 0 && (
        <div className="mt-10 pl-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-400">
            What This Means
          </p>
          <ul className="mt-4 space-y-2.5">
            {whatThisMeans.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-[13px] leading-relaxed text-stone-500"
              >
                <span className="mt-[7px] block h-[3px] w-[3px] shrink-0 rounded-full bg-stone-400" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
