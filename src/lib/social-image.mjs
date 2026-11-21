import { canonicalUrl, isoDate } from "./seo.mjs";
import { snapshotVideo } from "./benchmark-video.mjs";

export const SOCIAL_IMAGE_VERSION = "matte-20261121";
export const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 };
export const DEFAULT_SOCIAL_CARD = {
  kicker: "AI visibility research for commerce teams",
  title: "Is AI recommending your competitors?",
  subtitle: "Compare brand mentions and recorded first choices across four AI assistants.",
  context: "ChatGPT · Claude · Gemini · Perplexity",
  video: false,
};

export function socialImage(type = "site", id) {
  const query = new URLSearchParams({ v: SOCIAL_IMAGE_VERSION, type });
  if (id !== undefined) query.set("id", String(id));
  return {
    url: canonicalUrl(`/api/og?${query}`),
    ...SOCIAL_IMAGE_SIZE,
    type: "image/png",
    alt: "RecoScope — brand mentions and recorded AI rankings",
  };
}

// Call only with the existing published/public run query. Never render arbitrary
// query-string copy, or let a private video registry entry become a public card.
export function publicSocialCard(type, id, publicRuns, videos) {
  if (type === "site") return DEFAULT_SOCIAL_CARD;
  if (!["benchmark", "video"].includes(type)) return null;
  const video = type === "video" ? videos.find((item) => item.id === id) : null;
  const run = publicRuns.find((item) => Number(item.id) === Number(video?.runId ?? id));
  if (!run || (type === "video" && !video)) return null;
  const approved = snapshotVideo(run.category_slug, run, video ?? undefined);
  if (type === "video" && !approved) return null;
  const category = run.category_slug.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
  const day = isoDate(run.run_date)?.slice(0, 10);
  if (!day) return null;
  const date = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`));
  return {
    kicker: `${category} · ${date}`,
    title: approved?.title ?? `${category}: AI mentions and rankings.`,
    subtitle: "Explore the captured answers, shopper prompts and recorded rankings.",
    context: "Captured answers, not product-quality ratings.",
    video: type === "video",
  };
}
