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
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
        Cross-Agent Comparison
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-widest text-gray-300">
              <th className="pb-3 pr-6 font-semibold">Agent</th>
              <th className="pb-3 pr-6 font-semibold">#1</th>
              <th className="pb-3 pr-6 font-semibold">#2</th>
              <th className="pb-3 font-semibold">#3</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.agentName}
                className={
                  i < rows.length - 1 ? "border-b border-gray-100" : ""
                }
              >
                <td className="py-3.5 pr-6 text-sm font-semibold text-gray-900">
                  {row.agentName}
                </td>
                {[0, 1, 2].map((idx) => (
                  <td
                    key={idx}
                    className={`py-3.5 pr-6 text-sm ${
                      idx === 0
                        ? "font-medium text-gray-900"
                        : "text-gray-400"
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
        <p className="mt-4 text-xs text-gray-400">
          All {rows.length} models agree on{" "}
          <span className="font-semibold text-gray-600">{firstPicks[0]}</span>{" "}
          as the top recommendation.
        </p>
      )}

      {whatThisMeans && whatThisMeans.length > 0 && (
        <div className="mt-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            What This Means
          </p>
          <ul className="mt-3 space-y-2">
            {whatThisMeans.map((point) => (
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
