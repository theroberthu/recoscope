interface KeyTakeawayPanelProps {
  takeaway: string;
}

export function KeyTakeawayPanel({ takeaway }: KeyTakeawayPanelProps) {
  return (
    <div className="border-l-2 border-cyan/40 py-1 pl-8">
      <p className="text-2xl font-medium leading-snug tracking-tight text-white/80">
        {takeaway}
      </p>
    </div>
  );
}
