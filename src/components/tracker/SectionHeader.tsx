interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export function SectionHeader({ title, subtitle, badge }: SectionHeaderProps) {
  return (
    <div className="mb-12">
      {subtitle && (
        <p className="mb-4 font-mono text-[13px] font-medium text-white/30">
          {subtitle}
        </p>
      )}
      <h1 className="bg-gradient-to-r from-white to-cyan/70 bg-clip-text text-5xl font-bold leading-[1.1] tracking-tight text-transparent">
        {title}
      </h1>
      {badge && (
        <span className="mt-5 inline-block rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] font-medium text-cyan/60">
          {badge}
        </span>
      )}
    </div>
  );
}
