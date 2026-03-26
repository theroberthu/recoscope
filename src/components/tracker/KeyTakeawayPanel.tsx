interface KeyTakeawayPanelProps {
  takeaway: string;
  auditAngle?: string;
}

export function KeyTakeawayPanel({
  takeaway,
  auditAngle,
}: KeyTakeawayPanelProps) {
  return (
    <div className="border-l-2 border-gray-900 pl-6">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
        Key Takeaway
      </p>
      <p className="mt-4 text-xl font-medium leading-relaxed text-gray-900">
        {takeaway}
      </p>
      {auditAngle && (
        <p className="mt-6 text-sm leading-relaxed text-gray-400">
          <span className="font-semibold text-gray-600">Audit angle</span>{" "}
          &mdash; {auditAngle}
        </p>
      )}
    </div>
  );
}
