interface Props {
  params: Promise<{ category: string }>;
}

export default async function SeasonalCategoryPage({ params }: Props) {
  const { category } = await params;

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-bold tracking-tight capitalize">
        {category.replace(/-/g, " ")}
      </h1>
      <p className="mt-4 text-gray-600">
        Seasonal weekly reports for this category.
      </p>
    </section>
  );
}
