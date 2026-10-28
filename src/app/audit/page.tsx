import type { Metadata } from "next";
import { AuditRequestForm } from "@/components/audit/AuditRequestForm";
import { getActiveCategories, getLatestPublicSnapshot } from "@/lib/queries";
import { resolveCategory } from "@/lib/discovery.mjs";
import { SnapshotPreview } from "@/components/home/SnapshotPreview";
export const metadata: Metadata = {
  alternates: { canonical: "/audit" },
  title: "Free AI Visibility Audit",
  description:
    "Request a free, dated comparison of your brand across ChatGPT, Claude, Gemini, and Perplexity. No call required. Delivered by email within 48 hours.",
};
export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; source?: string }>;
}) {
  const params = await searchParams;
  const [cats, latest] = await Promise.allSettled([
    getActiveCategories(),
    getLatestPublicSnapshot(),
  ]);
  const categories = cats.status === "fulfilled" ? cats.value : [];
  const snapshot = latest.status === "fulfilled" ? latest.value : null;
  const initialCategory = resolveCategory(params.category, categories);
  const sources = [
    "homepage",
    "report",
    "tracker",
    "demo",
    "research",
    "navigation",
  ];
  const source = sources.includes(params.source ?? "")
    ? params.source!
    : "direct";
  return (
    <div className="page-shell section-space">
      <div className="conversion-grid audit-layout">
        <section className="audit-intro">
          <p className="eyebrow">Free brand audit</p>
          <h1 className="page-title">Is AI recommending your brand?</h1>
          <p className="page-description">
            See where your brand and competitors appear in answers from ChatGPT,
            Claude, Gemini, and Perplexity.
          </p>
          <p className="offer-promise">
            Free · No call required · Emailed within 48 hours
          </p>
        </section>
        <section
          className="form-card audit-form"
          aria-labelledby="audit-form-heading"
        >
          <h2 id="audit-form-heading">Request your audit</h2>
          {initialCategory && (
            <p className="mt-2 mb-5 text-sm text-[var(--secondary)]">
              For {initialCategory}. You can change the category below.
            </p>
          )}
          <AuditRequestForm
            categories={categories}
            initialCategory={initialCategory}
            source={source}
          />
        </section>
        <section className="audit-benefits">
          <h2 className="text-xl font-semibold">What your audit includes</h2>
          <ul className="benefit-list">
            <li>
              A dated comparison of brand mentions and explicitly supported
              ranks.
            </li>
            <li>
              The shopper prompts and usable-answer coverage behind the
              findings.
            </li>
            <li>Product-information questions worth testing next.</li>
          </ul>
          <p className="text-sm text-[var(--secondary)]">
            One captured answer can change between sessions. Your audit states
            its collection conditions and limitations.
          </p>
        </section>
      </div>
      <section className="section-space">
        <div className="section-intro">
          <div>
            <p className="eyebrow">Inspect an example</p>
            <h2>Real answers, with their limits.</h2>
          </div>
          <p>
            We reuse standardized shopper questions within a collection. A
            missing numeric rank stays unranked; it never becomes an invented
            recommendation.
          </p>
        </div>
        {snapshot ? (
          <div className="max-w-3xl">
            <SnapshotPreview snapshot={snapshot} />
          </div>
        ) : (
          <a href="/tracker" className="text-link">
            Browse the published reports →
          </a>
        )}
      </section>
    </div>
  );
}
