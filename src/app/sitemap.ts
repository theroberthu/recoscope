import type { MetadataRoute } from "next";
import { getPublicSitemapRuns, getAllPublishedPrompts } from "@/lib/queries";
import { getAllPosts } from "@/lib/blog";
import { promptToSlug } from "@/lib/prompt-seo";
import {
  canonicalUrl,
  reportUrl,
  latestDate,
  CONTENT_UPDATED_AT,
} from "@/lib/seo.mjs";

// Refresh from published evidence on each request. A failed DB read must not
// replace a complete sitemap with a misleading HTTP-200 list of static URLs.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [runs, prompts] = await Promise.all([
    getPublicSitemapRuns(),
    getAllPublishedPrompts(),
  ]);
  const posts = getAllPosts();
  const evidenceModified = latestDate(
    CONTENT_UPDATED_AT,
    ...runs.map((r) => r.modified_at),
  );
  const researchModified = latestDate(
    evidenceModified,
    ...posts.map((p) => p.modified_date ?? p.publish_date),
  );
  const staticPages: MetadataRoute.Sitemap = [
    { url: canonicalUrl("/"), lastModified: evidenceModified },
    { url: canonicalUrl("/platform"), lastModified: evidenceModified },
    { url: canonicalUrl("/tracker"), lastModified: evidenceModified },
    {
      url: canonicalUrl("/prompts"),
      lastModified: latestDate(...prompts.map((p) => p.modified_at)),
    },
    { url: canonicalUrl("/demo"), lastModified: evidenceModified },
    { url: canonicalUrl("/blog"), lastModified: researchModified },
    { url: canonicalUrl("/methodology"), lastModified: CONTENT_UPDATED_AT },
    { url: canonicalUrl("/about"), lastModified: CONTENT_UPDATED_AT },
    { url: canonicalUrl("/audit"), lastModified: evidenceModified },
    { url: canonicalUrl("/subscribe"), lastModified: evidenceModified },
    { url: canonicalUrl("/request-category"), lastModified: evidenceModified },
    { url: canonicalUrl("/privacy"), lastModified: "2026-04-11" },
    { url: canonicalUrl("/terms"), lastModified: "2026-04-11" },
  ];

  // Historical report pages also show the category's evolving history/trend.
  const categoryDates = new Map<string, string | undefined>();
  for (const run of runs)
    categoryDates.set(
      run.category_slug,
      latestDate(categoryDates.get(run.category_slug), run.modified_at),
    );

  // Only canonical dated snapshots go in the sitemap. Rolling category pages
  // and legacy path aliases point to the dated query URL through metadata/308.
  const snapshots = runs.map((run) => ({
    url: reportUrl(run.category_slug, run.period_label),
    lastModified: latestDate(
      CONTENT_UPDATED_AT,
      categoryDates.get(run.category_slug),
    ),
  }));
  const promptPages = prompts.map((prompt) => ({
    url: canonicalUrl(`/prompts/${promptToSlug(prompt.prompt_text)}`),
    lastModified: latestDate(prompt.modified_at),
  }));
  const blogPages = posts.map((post) => ({
    url: canonicalUrl(`/blog/${post.slug}`),
    lastModified: latestDate(post.modified_date, post.publish_date),
  }));

  const unique = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of [
    ...staticPages,
    ...snapshots,
    ...promptPages,
    ...blogPages,
  ]) {
    const previous = unique.get(entry.url);
    unique.set(entry.url, {
      ...entry,
      lastModified: latestDate(previous?.lastModified, entry.lastModified),
    });
  }
  return [...unique.values()];
}
