interface AgentRow {
  agentName: string;
  topBrands: string[];
}

interface CrossAgentTableProps {
  rows: AgentRow[];
  whatThisMeans?: string[];
}

export function CrossAgentTable({ rows, whatThisMeans }: CrossAgentTableProps) {
  // Collect all #1 picks to highlight consensus
  const firstPicks = rows.map((r) => r.topBrands[0]).filter(Boolean);
  const consensus = firstPicks.length > 0 && firstPicks.every((p) => p === firstPicks[0]);

  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Cross-Agent Comparison
      </p>
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <th className="px-4 py-2.5">Agent</th>
              <th className="px-4 py-2.5">#1</th>
              <th className="px-4 py-2.5">#2</th>
              <th className="px-4 py-2.5">#3</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.agentName}
                className={i < rows.length - 1 ? "border-b border-gray-100" : ""}
              >
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {row.agentName}
                </td>
                {[0, 1, 2].map((idx) => (
                  <td
                    key={idx}
                    className={`px-4 py-3 ${
                      idx === 0 ? "font-medium text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {row.topBrands[idx] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {consensus && (
        <p className="mt-3 text-xs text-gray-400">
          All agents agree on <span className="font-semibold text-gray-600">{firstPicks[0]}</span> as the #1 pick.
        </p>
      )}

      {whatThisMeans && whatThisMeans.length > 0 && (
        <div className="mt-6 rounded-md bg-gray-50 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            What This Means
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {whatThisMeans.map((point) => (
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
