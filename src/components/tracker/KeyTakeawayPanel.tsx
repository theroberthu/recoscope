interface KeyTakeawayPanelProps {
  takeaway: string;
}

export function KeyTakeawayPanel({ takeaway }: KeyTakeawayPanelProps) {
  return (
    <div className="border-l-2 border-cyan/40 py-1 pl-8">
      <p className="text-lg font-medium leading-relaxed tracking-tight text-white/80 sm:text-2xl sm:leading-snug">
        {takeaway}
      </p>
    </div>
  );
}
