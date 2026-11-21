import type { Metadata } from "next";
import { getLatestPublicSnapshot } from "@/lib/queries";
import { formatSnapshotDate } from "@/lib/discovery.mjs";
import { SnapshotPreview } from "@/components/home/SnapshotPreview";
import { SampleReadingGuide } from "@/components/AuditJourney";
import { TrackedLink } from "@/components/TrackedLink";

export const metadata: Metadata = {
  alternates: { canonical: "/demo" },
  title: "Sample AI Visibility Report",
  description: "Inspect a real, dated public benchmark with brand mention counts, recorded comparison ranks, exact prompts, coverage and review context.",
};
export const dynamic = "force-dynamic";

export default async function DemoPage() {
  let snapshot: Awaited<ReturnType<typeof getLatestPublicSnapshot>> = null;
  try { snapshot = await getLatestPublicSnapshot(); }
  catch (e) { console.error("[sample-report] unavailable", e); }
  if (!snapshot) return <div className="page-shell section-space">
    <h1 className="page-title">Sample visibility report</h1>
    <p className="page-description">The sample is temporarily unavailable. You can still browse the published category reports or request an audit for your brand.</p>
    <a href="/tracker" className="text-link mt-6">Browse benchmarks →</a>
    <TrackedLink href="/audit?source=demo" event="audit_cta_click" source="demo" className="button-primary mt-6">Get my free brand audit</TrackedLink>
  </div>;
  const href = `/tracker/${snapshot.category.slug}?period=${encodeURIComponent(snapshot.run.period_label)}`;
  return <div className="page-shell section-space">
    <p className="eyebrow">Example report · real public benchmark data</p>
    <h1 className="page-title">See what your brand audit shows.</h1>
    <p className="page-description">This published {snapshot.category.name} snapshot from {formatSnapshotDate(snapshot.run.run_date)} shows how to read the evidence. Your private audit would use your own brand and category.</p>
    <div className="sample-proof-grid">
      <SnapshotPreview snapshot={snapshot} />
      <SampleReadingGuide />
    </div>
    <details className="sample-prompt-disclosure">
      <summary>Read the exact shopper questions</summary>
      <ol className="mt-5 space-y-5 list-decimal pl-6">{snapshot.prompts.map(p => <li key={p.prompt_number} className="leading-relaxed">{p.prompt_text}</li>)}</ol>
      <a href={`${href}#captured-answers`} className="text-link mt-5">Inspect captured answers and collection notes →</a>
    </details>
    <section className="audit-callout mt-10">
      <div><p className="eyebrow">Apply this to your business</p><h2>Where does your brand stand?</h2><p>Share your brand and category. Receive your comparison, the captured answers and product-information questions worth investigating.</p><p>Free · No call required · Emailed within 48 hours</p></div>
      <TrackedLink href="/audit?source=demo" event="audit_cta_click" source="demo" className="button-primary">Get my free brand audit <span aria-hidden="true">↗</span></TrackedLink>
    </section>
  </div>;
}
