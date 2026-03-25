interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export function SectionHeader({ title, subtitle, badge }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {badge && (
          <span className="rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-600">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}
