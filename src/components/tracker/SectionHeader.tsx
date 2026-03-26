interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export function SectionHeader({ title, subtitle, badge }: SectionHeaderProps) {
  return (
    <div className="mb-12">
      {subtitle && (
        <p className="mb-4 text-[13px] font-medium text-gray-400">
          {subtitle}
        </p>
      )}
      <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-gray-900">
        {title}
      </h1>
      {badge && (
        <span className="mt-5 inline-block rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-400">
          {badge}
        </span>
      )}
    </div>
  );
}
