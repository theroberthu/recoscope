interface AgentRow {
  agentName: string;
  topBrands: string[];
}

interface CrossAgentTableProps {
  rows: AgentRow[];
}

export function CrossAgentTable({ rows }: CrossAgentTableProps) {
  return (
    <div className="overflow-x-auto">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Cross-Agent Comparison
      </p>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <th className="pb-2 pr-6">Agent</th>
            <th className="pb-2 pr-4">#1</th>
            <th className="pb-2 pr-4">#2</th>
            <th className="pb-2">#3</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.agentName} className="border-b border-gray-100">
              <td className="py-2.5 pr-6 font-medium text-gray-900">
                {row.agentName}
              </td>
              {[0, 1, 2].map((idx) => (
                <td key={idx} className="py-2.5 pr-4 text-gray-600">
                  {row.topBrands[idx] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
