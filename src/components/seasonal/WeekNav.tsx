interface WeekNavProps {
  weeks: { label: string; displayLabel: string; href: string }[];
  currentWeek: string;
}

export function WeekNav({ weeks, currentWeek }: WeekNavProps) {
  if (weeks.length <= 1) return null;

  return (
    <div className="mb-8 flex flex-wrap gap-1.5">
      {weeks.map((w) => {
        const isCurrent = w.label === currentWeek;
        return (
          <a
            key={w.label}
            href={isCurrent ? undefined : w.href}
            className={`rounded-full px-3 py-1 font-mono text-[11px] font-medium transition-all ${
              isCurrent
                ? "bg-cyan/20 text-cyan"
                : "text-white/30 hover:bg-white/5 hover:text-white/50"
            }`}
          >
            {w.displayLabel}
          </a>
        );
      })}
    </div>
  );
}
