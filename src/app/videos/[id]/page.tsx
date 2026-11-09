import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WatchExperience } from "@/components/videos/WatchExperience";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import { getWatchVideos } from "@/lib/watch-videos";
import { categoryLabel, watchPath, videoSchema } from "@/lib/video-watch.mjs";
import { canonicalUrl, jsonLd } from "@/lib/seo.mjs";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };
async function findVideo(params: Props["params"]) {
  const { id } = await params;
  return (await getWatchVideos()).find((video) => video.id === id) ?? notFound();
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const video = await findVideo(params);
  const title = `${categoryLabel(video)}: ${video.title}`;
  const description = video.summary.join(" ");
  const url = canonicalUrl(watchPath(video));
  return {
    title, description, alternates: { canonical: url },
    openGraph: { type: "video.other", title, description, url, images: [{ url: canonicalUrl(video.poster) }], videos: [{ url: canonicalUrl(video.src), type: "video/mp4", width: 1080, height: 1920 }] },
    twitter: { card: "summary_large_image", title, description, images: [canonicalUrl(video.poster)] },
  };
}
export default async function WatchPage({ params }: Props) {
  const video = await findVideo(params);
  const category = categoryLabel(video);
  const related = (await getWatchVideos()).filter((item) => item.category !== video.category).slice(0, 3);
  return (
    <>
      <BreadcrumbSchema items={[{ name: "Home", url: canonicalUrl() }, { name: "Videos", url: canonicalUrl("/videos") }, { name: category, url: canonicalUrl(watchPath(video)) }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(videoSchema(video)) }} />
      <WatchExperience video={video} related={related} />
    </>
  );
}
