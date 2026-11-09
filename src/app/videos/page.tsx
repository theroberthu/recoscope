import type { Metadata } from "next";
import Link from "next/link";
import { getWatchVideos } from "@/lib/watch-videos";
import { categoryLabel, watchPath } from "@/lib/video-watch.mjs";
import { canonicalUrl } from "@/lib/seo.mjs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "AI Recommendation Benchmark Videos",
  description: "Watch short, dated Recoscope benchmark briefs about AI brand mentions and comparative rankings, with transcripts and links to the captured evidence.",
  alternates: { canonical: canonicalUrl("/videos") },
};
export default async function VideosPage() {
  const videos = await getWatchVideos();
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <p className="text-sm font-semibold text-brand">RecoScope benchmark briefs</p>
      <h1 className="mt-3 text-3xl font-semibold text-ink">Watch the findings</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-secondary">Short explainers on captured AI recommendations. Each video includes its transcript and a link to the full benchmark evidence.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Link key={video.id} href={watchPath(video)} className="block rounded-xl border border-line bg-surface p-5">
            <img src={video.poster} alt="" width={1080} height={1920} loading="lazy" style={{ width: "100%", height: 240, objectFit: "contain", background: "#edf4ee", borderRadius: 8 }} />
            <p className="mt-4 text-xs text-secondary">{categoryLabel(video)} · {video.collectedLabel}</p>
            <h2 className="mt-2 text-lg font-semibold text-ink">{video.title}</h2>
            <p className="mt-3 text-sm font-semibold text-brand">Watch video →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
