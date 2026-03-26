interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export function SectionHeader({ title, subtitle, badge }: SectionHeaderProps) {
  return (
    <div className="mb-10">
      {badge && (
        <span className="mb-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
          {badge}
        </span>
      )}
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 text-base text-gray-400">{subtitle}</p>
      )}
    </div>
  );
}
