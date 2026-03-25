interface KeyTakeawayPanelProps {
  takeaway: string;
  auditAngle?: string;
}

export function KeyTakeawayPanel({
  takeaway,
  auditAngle,
}: KeyTakeawayPanelProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        Key Takeaway
      </p>
      <p className="mt-2 text-base leading-relaxed text-gray-800">
        {takeaway}
      </p>
      {auditAngle && (
        <p className="mt-4 text-sm text-gray-500">
          <span className="font-medium text-gray-700">Audit angle:</span>{" "}
          {auditAngle}
        </p>
      )}
    </div>
  );
}
