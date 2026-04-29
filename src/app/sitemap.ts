import type { MetadataRoute } from "next";
import { getCategoriesWithRuns } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://getrecoscope.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/tracker`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/methodology`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/audit`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/subscribe`, changeFrequency: "monthly", priority: 0.6 },
  ];

  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await getCategoriesWithRuns();
    categoryPages = categories.map((cat) => ({
      url: `${baseUrl}/tracker/${cat.slug}`,
      changeFrequency: cat.tracker_type === "seasonal" ? "weekly" as const : "monthly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB unavailable
  }

  return [...staticPages, ...categoryPages];
}
