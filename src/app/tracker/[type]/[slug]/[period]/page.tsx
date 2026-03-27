interface Props {
  params: Promise<{ type: string; slug: string; period: string }>;
}

export default async function PeriodReportPage({ params }: Props) {
  const { type, slug, period } = await params;
  const label = slug.replace(/-/g, " ");
  const periodType = type === "seasonal" ? "Week" : "Month";

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-bold tracking-tight capitalize text-white">
        {label} &mdash; {periodType} {period}
      </h1>
      <p className="mt-4 text-white/40">
        {type === "seasonal" ? "Seasonal weekly" : "Evergreen monthly"} report for this period.
      </p>
    </section>
  );
}
