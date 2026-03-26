interface KeyTakeawayPanelProps {
  takeaway: string;
  auditAngle?: string;
}

export function KeyTakeawayPanel({
  takeaway,
  auditAngle,
}: KeyTakeawayPanelProps) {
  return (
    <div className="border-l-[3px] border-stone-800 py-1 pl-8">
      <p className="text-2xl font-medium leading-snug tracking-tight text-stone-800">
        {takeaway}
      </p>
      {auditAngle && (
        <p className="mt-8 text-[13px] leading-relaxed text-stone-400">
          <span className="font-semibold text-stone-500">Audit angle</span>{" "}
          &mdash; {auditAngle}
        </p>
      )}
    </div>
  );
}
