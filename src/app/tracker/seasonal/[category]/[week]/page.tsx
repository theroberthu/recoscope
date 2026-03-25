interface Props {
  params: Promise<{ category: string; week: string }>;
}

export default async function SeasonalWeekPage({ params }: Props) {
  const { category, week } = await params;

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-bold tracking-tight capitalize">
        {category.replace(/-/g, " ")} &mdash; Week {week}
      </h1>
      <p className="mt-4 text-gray-600">
        Seasonal weekly report for this period.
      </p>
    </section>
  );
}
