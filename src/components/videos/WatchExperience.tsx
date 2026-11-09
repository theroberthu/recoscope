import Link from "next/link";
import { BenchmarkPlayer } from "@/components/tracker/BenchmarkPlayer";
import { TrackedLink } from "@/components/TrackedLink";
import type { BenchmarkVideo } from "@/lib/benchmark-video.mjs";
import { categoryLabel, watchPath } from "@/lib/video-watch.mjs";
import { reportUrl } from "@/lib/seo.mjs";

export function WatchExperience({ video, related }: { video: BenchmarkVideo; related: BenchmarkVideo[] }) {
  const category = categoryLabel(video);
  const report = reportUrl(video.category, video.period);
  return (
    <div className="watch-page page-shell">
      <nav className="watch-breadcrumb" aria-label="Breadcrumb">
        <Link href="/videos">← All benchmark briefs</Link>
        <span aria-hidden="true">/</span><span>{category}</span>
      </nav>
      <article className="watch-hero">
        <header className="watch-heading">
          <p className="watch-kicker">Benchmark Brief <span>· {video.duration.replace("-second explainer", " seconds")}</span></p>
          <h1>{video.title}</h1>
          <p className="watch-date">{category} · Collected <time dateTime={video.collected}>{video.collectedLabel}</time></p>
        </header>
        <figure className="watch-stage">
          <div className="watch-stage-top"><span>Watch the finding</span><span>▶ {video.duration.replace("-second explainer", "s")}</span></div>
          <div className="watch-media"><BenchmarkPlayer video={video} showPlayButton /></div>
          <figcaption>English captions included · Sound on for narration</figcaption>
        </figure>
        <div className="watch-insight">
          <p className="watch-context">{video.context}</p>
          <section aria-labelledby="watch-takeaway-title">
            <h2 id="watch-takeaway-title">The finding, in context</h2>
            {video.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
          <div className="watch-evidence-action">
            <TrackedLink href={report} event="benchmark_category_open" source="video-watch-evidence" className="button-primary">Explore the full benchmark <span aria-hidden="true">↗</span></TrackedLink>
            <p>Compare the AI answers, prompts and recorded ranks.</p>
          </div>
          <p className="watch-limitation">Captured answers, not product-quality ratings.</p>
        </div>
      </article>
      <div className="watch-reading">
        <section className="watch-transcript" aria-labelledby="transcript-title">
          <p className="watch-kicker">Read along</p>
          <h2 id="transcript-title">The transcript</h2>
          <p>Prefer reading? Here’s the narration in full.</p>
          <details>
            <summary>Read the full transcript <span aria-hidden="true">＋</span></summary>
            <div>{video.transcript.map(({ text, visual }) => <p key={text}>{visual ? <em>{text}</em> : text}</p>)}</div>
          </details>
          <p className="watch-caption-note">Optional closed captions are available in the player and off by default, so they don’t overlap the on-screen captions.</p>
        </section>
        <aside className="watch-next-step" aria-labelledby="watch-audit-title">
          <p className="watch-kicker">For your brand</p>
          <h2 id="watch-audit-title">Where does AI put you?</h2>
          <p>Get a free {category} audit to see where your brand appears—and which competitors AI puts ahead.</p>
          <TrackedLink href={`/audit?category=${video.category}&source=video-watch`} event="audit_cta_click" source="video-watch" className="text-link">Get a free audit <span aria-hidden="true">↗</span></TrackedLink>
          <p className="watch-audit-note">Free · No call · Emailed within 48 hours</p>
        </aside>
      </div>
      {related.length > 0 && <section className="watch-related" aria-labelledby="watch-related-title">
        <div className="watch-related-heading"><div><p className="watch-kicker">Keep exploring</p><h2 id="watch-related-title">More benchmark briefs</h2></div><Link href="/videos" className="text-link">View all videos →</Link></div>
        <div className="watch-related-grid">{related.map((item) => <Link href={watchPath(item)} key={item.id} className="watch-related-card">
          <div className="watch-related-poster"><img src={item.poster} alt="" width={1080} height={1920} loading="lazy" /><span aria-hidden="true">▶</span></div>
          <div><p>{categoryLabel(item)} · {item.collectedLabel}</p><h3>{item.title}</h3><span className="watch-related-duration">Watch · {item.duration.replace("-second explainer", " seconds")} ↗</span></div>
        </Link>)}</div>
      </section>}
    </div>
  );
}
