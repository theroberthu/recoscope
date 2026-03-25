interface KeyTakeawayPanelProps {
  takeaway: string;
  auditAngle?: string;
}

export function KeyTakeawayPanel({
  takeaway,
  auditAngle,
}: KeyTakeawayPanelProps) {
  return (
    <div className="rounded-lg border-l-4 border-gray-900 bg-gray-50 px-6 py-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        Key Takeaway
      </p>
      <p className="mt-3 text-lg font-medium leading-relaxed text-gray-900">
        {takeaway}
      </p>
      {auditAngle && (
        <p className="mt-5 border-t border-gray-200 pt-4 text-sm leading-relaxed text-gray-500">
          <span className="font-semibold text-gray-700">Audit angle:</span>{" "}
          {auditAngle}
        </p>
      )}
    </div>
  );
}
