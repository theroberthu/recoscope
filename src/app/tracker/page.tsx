import type { Metadata } from "next";
import { getCategoriesWithRuns } from "@/lib/queries";
import { todayCentral } from "@/lib/discovery.mjs";
import { CategoryFinder } from "@/components/tracker/CategoryFinder";
export const metadata: Metadata = {
  title: "AI Recommendation Benchmarks by Category",
  description:
    "Find dated AI brand recommendation benchmarks, with findings, usable-answer coverage, and recorded rankings across four AI services.",
};
export const dynamic = "force-dynamic";
export default async function TrackerIndexPage() {
  let categories: Awaited<ReturnType<typeof getCategoriesWithRuns>> = [];
  try {
    categories = await getCategoriesWithRuns();
  } catch (e) {
    console.error("[tracker] categories unavailable", e);
  }
  return (
    <div className="page-shell section-space min-h-screen">
      <p className="eyebrow">Benchmarks</p>
      <h1 className="page-title">Find your category. Inspect the answers.</h1>
      <p className="page-description">
        The same saved shopper prompts across ChatGPT, Claude, Gemini, and
        Perplexity. Choose a dated snapshot to compare brand visibility,
        explicit ranks, and collection coverage.
      </p>
      <p className="mt-4 mb-8">
        <a href="/methodology" className="text-link">
          How to read the benchmark →
        </a>
      </p>
      {categories.length ? (
        <CategoryFinder categories={categories} today={todayCentral()} />
      ) : (
        <p className="empty-state" role="status">
          The category list is temporarily unavailable. Please try again
          shortly.
        </p>
      )}
      <div className="audit-callout mt-12">
        <div>
          <h2>Don’t see your category?</h2>
          <p>
            Suggest a category for a future collection, or request a private
            audit of your brand.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="/request-category" className="button-secondary">
            Request a category
          </a>
          <a href="/audit?source=tracker" className="button-primary">
            Free brand audit
          </a>
        </div>
      </div>
    </div>
  );
}
