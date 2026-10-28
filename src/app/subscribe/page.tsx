import type { Metadata } from "next";
import { AuditForm } from "@/components/audit/AuditForm";
import { getActiveCategories, getLatestPublicSnapshot } from "@/lib/queries";
import { resolveCategory } from "@/lib/discovery.mjs";
import { SnapshotPreview } from "@/components/home/SnapshotPreview";
export const metadata: Metadata = {
  title: "Get Category Report Updates",
  description:
    "Subscribe to free AI recommendation research for the categories you care about.",
};
export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const [cats, latest] = await Promise.allSettled([
    getActiveCategories(),
    getLatestPublicSnapshot(),
  ]);
  const categories = cats.status === "fulfilled" ? cats.value : [];
  const snapshot = latest.status === "fulfilled" ? latest.value : null;
  return (
    <div className="page-shell section-space">
      <div className="conversion-grid">
        <section>
          <p className="eyebrow">Free research updates</p>
          <h1 className="page-title">
            Follow the categories that matter to you.
          </h1>
          <p className="page-description">
            Get new report links and findings by email. Choose a category or
            follow the full benchmark.
          </p>
          <ul className="benefit-list">
            <li>Dated findings across the participating AI services.</li>
            <li>
              Brand mentions and recorded ranks, with coverage and limitations.
            </li>
            <li>Links back to the prompts and evidence.</li>
          </ul>
          <p className="text-sm text-[var(--secondary)]">
            We aim to collect evergreen categories monthly and seasonal
            categories during active periods. Actual publication dates and gaps
            stay visible. Your address is used for the report updates you
            request.
          </p>
        </section>
        <section className="form-card">
          <h2 className="mb-6 text-2xl font-semibold">Get report updates</h2>
          <AuditForm
            categories={categories}
            initialCategory={resolveCategory(params.category, categories)}
          />
        </section>
      </div>
      {snapshot && (
        <div className="max-w-3xl mt-12">
          <SnapshotPreview snapshot={snapshot} />
        </div>
      )}
    </div>
  );
}
