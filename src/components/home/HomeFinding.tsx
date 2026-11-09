import { watchPath } from "@/lib/video-watch.mjs";
import { snapshotVideo } from "@/lib/benchmark-video.mjs";
import { formatSnapshotDate } from "@/lib/discovery.mjs";
import { displayAgent, rankSlots } from "@/lib/report-ranking.mjs";
import type { getLatestPublicSnapshot } from "@/lib/queries";
import { SnapshotPreview } from "./SnapshotPreview";
import { TrackedLink } from "@/components/TrackedLink";

export function HomeFinding({ snapshot }: { snapshot: NonNullable<Awaited<ReturnType<typeof getLatestPublicSnapshot>>> }) {
  const video = snapshotVideo(snapshot.category.slug, snapshot.run);
  if (!video) return <SnapshotPreview snapshot={snapshot} />;
  const href = `/tracker/${snapshot.category.slug}?period=${encodeURIComponent(snapshot.run.period_label)}`;
  const comparisons = snapshot.comparison.filter(row => row.hasResponse && row.rankedBrands.length > 0).length;
  const seconds = video.duration.match(/^\d+/)?.[0];
  return <section className="snapshot-preview home-finding" aria-labelledby="preview-heading">
    <div className="home-finding-meta"><h2 id="preview-heading">{snapshot.category.name}</h2><time dateTime={video.collected}>{formatSnapshotDate(video.collected)}</time></div>
    <div className="home-finding-story">
      <a className="home-finding-poster" href={watchPath(video)} aria-label={`Watch ${video.title}`}>
        {/* Full vertical poster; the MP4 loads only after playback is requested on the report. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={video.poster} alt="" width={90} height={160} />
        <span aria-hidden="true">▶</span>
      </a>
      <div>
        <p className="eyebrow">Latest benchmark brief</p>
        <h3>{video.title}</h3>
        <p className="home-finding-context">{comparisons > 0 ? `${comparisons} comparative answers` : `${snapshot.coverage.eligible} usable answers`} · {snapshot.coverage.models.length} AI assistants</p>
        <TrackedLink href={watchPath(video)} event="benchmark_category_open" source="homepage-featured-brief" className="home-finding-watch">Watch the {seconds ? `${seconds}-second ` : ""}brief <span aria-hidden="true">↗</span></TrackedLink>
      </div>
    </div>
    <p className="home-finding-summary">{video.summary[0]}</p>
    <div className="home-finding-evidence"><span>{snapshot.coverage.eligible} of {snapshot.coverage.captured} responses usable</span></div>
    <details className="home-finding-details"><summary>See the comparative rankings</summary>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Recorded comparative rankings">
        <table className="preview-table"><caption className="sr-only">Recorded ranks in the comparative prompt</caption><thead><tr><th scope="col">Model</th><th scope="col">#1</th><th scope="col">#2</th><th scope="col">#3</th></tr></thead><tbody>{snapshot.comparison.map(row => <tr key={row.agent}><th scope="row">{displayAgent(row.agent)}</th>{row.status ? <td colSpan={3}>{row.status}</td> : rankSlots(row.rankedBrands).map((brand, i) => <td key={i}>{brand || "—"}</td>)}</tr>)}</tbody></table>
      </div>
    </details>
    <div className="home-finding-footer"><a href={href} className="text-link">Explore the answers →</a><p>Captured answers, not product-quality ratings.</p></div>
  </section>;
}
