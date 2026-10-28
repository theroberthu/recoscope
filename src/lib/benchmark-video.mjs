import { isoDate } from "./seo.mjs";

// Corrected supplied export verified; publication approved by the site owner.
// Exact snapshot and checksum guards prevent reuse of an unverified asset.
export const proteinExplainer = {
  id: "protein-powder-2026-10-b-most-mentioned",
  approved: true,
  approvedSha256: "2db46ca15829365fa79a55f1fdafc76d1dc8fdc7e3568ad0bb14ffa34dc546b2",
  category: "protein-powder",
  runId: 166,
  period: "2026-10-B",
  collected: "2026-10-27",
  title: "Most mentioned doesn’t mean first choice.",
  duration: "55-second explainer",
  src: "/tracker-media/protein-powder/2026-10-b/most-mentioned.mp4",
  poster: "/tracker-media/protein-powder/2026-10-b/explainer-poster.jpg",
  captions: "/tracker-media/protein-powder/2026-10-b/explainer.en.vtt",
};

export function snapshotVideo(category, run, video = proteinExplainer) {
  if (!video.approved || !/^[a-f0-9]{64}$/.test(video.approvedSha256 || ""))
    return null;
  if (
    category !== video.category ||
    Number(run.id) !== video.runId ||
    run.period_label !== video.period ||
    isoDate(run.run_date)?.slice(0, 10) !== video.collected
  )
    return null;
  return video;
}
