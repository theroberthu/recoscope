interface KeyTakeawayPanelProps {
  takeaway: string;
  auditAngle?: string;
}

export function KeyTakeawayPanel({
  takeaway,
  auditAngle,
}: KeyTakeawayPanelProps) {
  return (
    <div className="border-l-2 border-cyan/40 py-1 pl-8">
      <p className="text-2xl font-medium leading-snug tracking-tight text-white/80">
        {takeaway}
      </p>
      {auditAngle && (
        <p className="mt-8 text-[13px] leading-relaxed text-white/30">
          <span className="font-semibold text-cyan/60">Audit angle</span>{" "}
          &mdash; {auditAngle}
        </p>
      )}
    </div>
  );
}
