import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BenchmarkPlayer } from "@/components/tracker/BenchmarkPlayer";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import { getWatchVideos } from "@/lib/watch-videos";
import { categoryLabel, watchPath, videoSchema } from "@/lib/video-watch.mjs";
import { canonicalUrl, reportUrl, jsonLd } from "@/lib/seo.mjs";

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
  return (
    <article className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <BreadcrumbSchema items={[{ name: "Home", url: canonicalUrl() }, { name: "Videos", url: canonicalUrl("/videos") }, { name: category, url: canonicalUrl(watchPath(video)) }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(videoSchema(video)) }} />
      <header className="mb-5 text-center">
        <Link href="/videos" className="text-sm text-brand">Benchmark videos</Link>
        <p className="mt-3 text-sm text-secondary">{category} · Collected <time dateTime={video.collected}>{video.collectedLabel}</time></p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{video.title}</h1>
      </header>
      <div className="mx-auto" style={{ width: "min(100%, 360px, 35vh)" }}>
        <BenchmarkPlayer video={video} />
      </div>
      <p className="mt-3 text-center text-xs text-secondary">English captions included. Optional closed captions are available in the player.</p>
      <section className="mt-8 space-y-4 text-base leading-relaxed text-secondary" aria-labelledby="video-context-title">
        <h2 id="video-context-title" className="text-xl font-semibold text-ink">About this benchmark brief</h2>
        <p>{video.context}</p>
        {video.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <p>These findings describe captured answers. They do not establish product quality.</p>
        <p><Link href={reportUrl(video.category, video.period)} className="font-semibold text-brand underline">Explore the full {category} benchmark, prompts and captured answers</Link></p>
      </section>
      <section className="mt-8 space-y-4 border-t border-line pt-6 text-base leading-relaxed text-secondary" aria-labelledby="transcript-title">
        <h2 id="transcript-title" className="text-xl font-semibold text-ink">Transcript</h2>
        {video.transcript.map(({ text, visual }) => <p key={text}>{visual ? <em>{text}</em> : text}</p>)}
      </section>
    </article>
  );
}
