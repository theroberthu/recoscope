"use client";

interface BarRaceProps {
  brands: { brand: string; mentions: number }[];
}

export function BarRace({ brands }: BarRaceProps) {
  if (brands.length === 0) return null;

  const max = brands[0].mentions;

  return (
    <div className="mt-12 space-y-2">
      {brands.map((b, i) => {
        const pct = Math.max((b.mentions / max) * 100, 5);
        return (
          <div key={b.brand} className="flex items-center gap-4">
            <span className="w-32 shrink-0 truncate text-right font-mono text-[12px] text-white/50 sm:w-40">
              {b.brand}
            </span>
            <div className="relative h-7 flex-1">
              <div
                className={`absolute inset-y-0 left-0 rounded-r-sm bg-gradient-to-r from-cyan/80 to-cyan/30 animate-bar-grow bar-delay-${i}`}
                style={{ "--bar-width": `${pct}%`, width: 0 } as React.CSSProperties}
              />
              <span
                className={`absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[11px] font-bold text-white/70 opacity-0 animate-fade-in-up bar-delay-${i}`}
              >
                {b.mentions}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
