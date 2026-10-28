import type { Metadata } from "next";
import { getLatestPublicSnapshot } from "@/lib/queries";
import { mentionCounts, reviewStatus } from "@/lib/report-ranking.mjs";
import { formatSnapshotDate, auditHref } from "@/lib/discovery.mjs";
import { SnapshotPreview } from "@/components/home/SnapshotPreview";
export const metadata: Metadata = {
  title: "Sample AI Visibility Report",
  description:
    "Inspect a real, dated public benchmark with brand mention counts, recorded comparison ranks, exact prompts, coverage and review context.",
};
export const dynamic = "force-dynamic";
export default async function DemoPage() {
  let snapshot: Awaited<ReturnType<typeof getLatestPublicSnapshot>> = null;
  try {
    snapshot = await getLatestPublicSnapshot();
  } catch (e) {
    console.error("[sample-report] unavailable", e);
  }
  if (!snapshot)
    return (
      <div className="page-shell section-space">
        <h1 className="page-title">Sample visibility report</h1>
        <p className="page-description">
          The sample is temporarily unavailable. You can still browse the
          published category reports.
        </p>
        <a href="/tracker" className="button-primary mt-6">
          Browse benchmarks
        </a>
      </div>
    );
  const brands = mentionCounts(snapshot.mentions);
  const lead = brands[0];
  const href = `/tracker/${snapshot.category.slug}?period=${encodeURIComponent(snapshot.run.period_label)}`;
  return (
    <div className="page-shell section-space">
      <p className="eyebrow">Sample report · real public benchmark data</p>
      <h1 className="page-title">What your audit helps you inspect.</h1>
      <p className="page-description">
        This example uses one published {snapshot.category.name} snapshot from{" "}
        {formatSnapshotDate(snapshot.run.run_date)}. It illustrates the measures
        in an audit; it does not describe your own brand.
      </p>
      <div className="sample-metrics">
        {lead && (
          <section className="form-card">
            <p className="eyebrow">Example brand</p>
            <h2 className="mt-3 text-2xl font-semibold">{lead.name}</h2>
            <p className="metric-value">
              {lead.mentionCount}
              <span>/{snapshot.coverage.eligible}</span>
            </p>
            <p>usable answers mentioned this brand</p>
            <p className="mt-4 text-sm text-[var(--secondary)]">
              The denominator includes all usable answers, including answers
              with no brands. Each brand counts once per answer; a mention may
              be an alternative or criticism.
            </p>
          </section>
        )}
        <section className="form-card">
          <p className="eyebrow">Collection scope</p>
          <dl className="definition-list">
            <div>
              <dt>Category</dt>
              <dd>{snapshot.category.name}</dd>
            </div>
            <div>
              <dt>Collection date</dt>
              <dd>{formatSnapshotDate(snapshot.run.run_date)}</dd>
            </div>
            <div>
              <dt>Snapshot count</dt>
              <dd>1</dd>
            </div>
            <div>
              <dt>Usable answers</dt>
              <dd>
                {snapshot.coverage.eligible}/{snapshot.coverage.captured}
              </dd>
            </div>
            <div>
              <dt>Review</dt>
              <dd>{reviewStatus(snapshot.insight?.reviewed_by_human)}</dd>
            </div>
          </dl>
          <p className="mt-5 text-sm text-[var(--secondary)]">
            No combined score or letter grade is inferred. This is a snapshot of
            model output, not a product-quality assessment.
          </p>
        </section>
      </div>
      <div className="max-w-3xl my-10">
        <SnapshotPreview snapshot={snapshot} />
      </div>
      <section className="form-card">
        <h2 className="text-2xl font-semibold">The exact shopper questions</h2>
        <ol className="mt-5 space-y-5 list-decimal pl-6">
          {snapshot.prompts.map((p) => (
            <li key={p.prompt_number} className="leading-relaxed">
              {p.prompt_text}
            </li>
          ))}
        </ol>
        <a href={`${href}#captured-answers`} className="text-link">
          Inspect captured answers and collection notes →
        </a>
      </section>
      <div className="audit-callout mt-10">
        <div>
          <h2>Use your own brand and category.</h2>
          <p>
            Request a free audit with your details. No call required; we email
            the result within 48 hours.
          </p>
        </div>
        <a
          href={auditHref(snapshot.category.slug, "demo")}
          className="button-primary"
        >
          Get my brand’s audit
        </a>
      </div>
    </div>
  );
}
