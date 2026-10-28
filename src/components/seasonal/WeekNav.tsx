interface WeekNavProps {
  weeks: { label: string; displayLabel: string; href: string }[];
  currentWeek: string;
}
export function WeekNav({ weeks, currentWeek }: WeekNavProps) {
  if (weeks.length <= 1) return null;
  return (
    <details className="report-history">
      <summary>
        Report history{" "}
        <span className="text-[var(--secondary)]">
          · {weeks.find((w) => w.label === currentWeek)?.displayLabel} selected
          · {weeks.length} snapshots
        </span>
      </summary>
      <nav aria-label="Report history" className="flex flex-wrap gap-2 mt-4">
        {[...weeks].reverse().map((w) => (
          <a
            key={w.label}
            href={w.href}
            aria-current={w.label === currentWeek ? "page" : undefined}
            className={w.label === currentWeek ? "history-current" : ""}
          >
            {w.displayLabel}
          </a>
        ))}
      </nav>
    </details>
  );
}
