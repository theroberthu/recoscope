import { displayAgent, rankSlots } from "@/lib/report-ranking.mjs";
import { formatSnapshotDate } from "@/lib/discovery.mjs";
import type { getLatestPublicSnapshot } from "@/lib/queries";

export function SnapshotPreview({
  snapshot,
}: {
  snapshot: NonNullable<Awaited<ReturnType<typeof getLatestPublicSnapshot>>>;
}) {
  const href = `/tracker/${snapshot.category.slug}?period=${encodeURIComponent(snapshot.run.period_label)}`;
  return (
    <section className="snapshot-preview" aria-labelledby="preview-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Latest published benchmark</p>
        <time dateTime={String(snapshot.run.run_date).slice(0, 10)}>
          {formatSnapshotDate(String(snapshot.run.run_date))}
        </time>
      </div>
      <h2
        id="preview-heading"
        className="mt-4 text-2xl font-semibold tracking-tight"
      >
        {snapshot.category.name}
      </h2>
      <p className="mt-3 leading-relaxed">{snapshot.finding}</p>
      <p className="snapshot-meta">
        {snapshot.coverage.eligible}/{snapshot.coverage.captured} usable answers
        · {snapshot.coverage.models.length} models · 3 prompt types
      </p>
      <div
        className="mt-5 overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label="Sample comparative rankings"
      >
        <table className="preview-table">
          <caption className="sr-only">
            Recorded ranks in the comparative prompt
          </caption>
          <thead>
            <tr>
              <th scope="col">Model</th>
              <th scope="col">#1</th>
              <th scope="col">#2</th>
              <th scope="col">#3</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.comparison.map((row) => (
              <tr key={row.agent}>
                <th scope="row">{displayAgent(row.agent)}</th>
                {row.status ? (
                  <td colSpan={3}>{row.status}</td>
                ) : (
                  rankSlots(row.rankedBrands).map((brand, i) => (
                    <td key={i}>{brand || "—"}</td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-[var(--secondary)]">
        Mentions measure visibility. Recorded ranks describe these answers.
        Neither establishes product quality.
      </p>
      <a
        href={href}
        className="inline-flex min-h-11 items-center font-semibold text-[var(--brand)] underline underline-offset-4"
      >
        Explore this report →
      </a>
    </section>
  );
}
