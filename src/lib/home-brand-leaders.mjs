import { reportUrl, isoDate } from "./seo.mjs";

/** Each category keeps its own snapshot, denominator and ties; no pooled ranking. */
export function homeBrandLeaders(categories) {
  return categories
    .filter((c) => isoDate(c.latest_run_date))
    .sort(
      (a, b) =>
        b.latest_run_date.localeCompare(a.latest_run_date) ||
        a.name.localeCompare(b.name),
    )
    .flatMap((c) => {
      if (
        !c.latest_period_label ||
        !c.coverage?.eligible ||
        !c.leadingBrands?.length
      )
        return [];
      return c.leadingBrands
        .filter(
          (b) =>
            b.name?.trim() &&
            Number.isInteger(b.mentionCount) &&
            b.mentionCount > 0 &&
            b.mentionCount <= c.coverage.eligible,
        )
        .map((b) => ({
          brand: b.name,
          category: c.name,
          slug: c.slug,
          mentionCount: b.mentionCount,
          eligibleAnswers: c.coverage.eligible,
          capturedAnswers: c.coverage.captured,
          runDate: c.latest_run_date,
          tied: c.leadingBrands.length > 1,
          href: reportUrl(c.slug, c.latest_period_label),
        }));
    });
}
