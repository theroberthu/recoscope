import { benchmarkExplainers, snapshotVideo } from "./benchmark-video.mjs";
import { canonicalUrl, isoDate, PUBLISHER, ROBERT_HU } from "./seo.mjs";

export const WATCH_PAGES_UPDATED_AT = "2026-11-10";

// First successful public deployments; collection dates are separate evidence.
const releases = {
  "standing-desks-2026-11-a-tied-mentions-one-first": ["2026-11-10T21:32:10+00:00", 45],
  // First public upload of the approved MP4; the collection date is separate.
  "protein-powder-2026-11-a-read-the-context": ["2026-11-09T15:31:08-06:00", 54.5],
  "protein-powder-2026-10-b-most-mentioned": ["2026-10-28T17:20:00-05:00", 55],
  "standing-desks-2026-10-b-visibility-and-rank": ["2026-10-29T08:01:00-05:00", 56],
  "skincare-2026-10-c-split-decision": ["2026-10-30T08:33:00-05:00", 49.5],
  "air-purifiers-2026-10-c-every-answer": ["2026-10-31T12:17:00-05:00", 50],
  "sunscreen-2026-11-a-first-choice-budget": ["2026-11-01T08:42:00-06:00", 53],
  "espresso-machines-2026-11-a-complete-gift": ["2026-11-02T17:49:00-06:00", 56],
  "dog-food-2026-11-a-budget-shortlist": ["2026-11-04T18:16:00-06:00", 52.6],
  "office-chairs-2026-11-a-mentions-first-choice": ["2026-11-05T17:57:00-06:00", 49.6],
  "running-shoes-2026-11-a-every-answer-half-firsts": ["2026-11-06T17:52:00-06:00", 48.567],
  "robot-vacuums-2026-11-a-same-brands-different-models": ["2026-11-07T13:55:00-06:00", 59],
  "wireless-earbuds-2026-11-a-top-three-never-first": ["2026-11-08T08:26:00-06:00", 47.4],
};

export function watchPath(video) {
  return `/videos/${encodeURIComponent(video.id)}`;
}
export function categoryLabel(video) {
  return video.category.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
}
export function publicWatchVideos(runs) {
  return benchmarkExplainers.filter((video) => releases[video.id] && runs.some((run) =>
    snapshotVideo(run.category_slug, {
      id: run.id, period_label: run.period_label, run_date: run.run_date,
    }, video),
  )).sort((a, b) => b.collected.localeCompare(a.collected));
}
export function videoSchema(video) {
  const release = releases[video.id];
  if (!release || !snapshotVideo(video.category, {
    id: video.runId, period_label: video.period, run_date: video.collected,
  }, video)) throw new Error("Video is not approved for a watch page");
  const url = canonicalUrl(watchPath(video));
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${url}#video`,
    name: `${categoryLabel(video)}: ${video.title}`,
    description: video.summary.join(" "),
    thumbnailUrl: [canonicalUrl(video.poster)],
    uploadDate: isoDate(release[0]),
    duration: `PT${release[1]}S`,
    contentUrl: canonicalUrl(video.src),
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    publisher: PUBLISHER,
    creator: ROBERT_HU,
    inLanguage: "en",
    transcript: video.transcript.filter((line) => !line.visual).map((line) => line.text).join("\n\n"),
  };
}
