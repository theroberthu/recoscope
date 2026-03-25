interface Props {
  params: Promise<{ category: string; month: string }>;
}

export default async function EvergreenMonthPage({ params }: Props) {
  const { category, month } = await params;

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-bold tracking-tight capitalize">
        {category.replace(/-/g, " ")} &mdash; {month}
      </h1>
      <p className="mt-4 text-gray-600">
        Evergreen benchmark report for this month.
      </p>
    </section>
  );
}
