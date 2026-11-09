"use client";

import { BenchmarkPlayer } from "./BenchmarkPlayer";
import { watchPath } from "@/lib/video-watch.mjs";
import type { BenchmarkVideo as VideoDetails } from "@/lib/benchmark-video.mjs";

export function BenchmarkVideo({ video }: { video: VideoDetails }) {
  const durationLabel = video.duration.replace("-second explainer", " seconds");
  return (
    <section
      id="benchmark-video"
      className="report-card benchmark-video"
      aria-labelledby="benchmark-video-title"
    >
      <div className="benchmark-video-copy">
        <p className="report-eyebrow">Video explainer · {durationLabel}</p>
        <h2 id="benchmark-video-title">{video.title}</h2>
        <p id="benchmark-video-context" className="benchmark-video-context">
          Collected <time dateTime={video.collected}>{video.collectedLabel}</time>
          <br />
          {video.context}
        </p>
        {video.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <p className="benchmark-video-limitation">
          These findings describe captured answers. They do not establish
          product quality.
        </p>
        <p
          id="benchmark-video-captions"
          className="benchmark-video-caption-note"
        >
          On-screen English captions are included. Optional closed captions are
          off by default to avoid duplicate text.
        </p>
        <details className="benchmark-video-transcript">
          <summary>Read the transcript</summary>
          <div>
            {video.transcript.map(({ text, visual }) => (
              <p key={text}>{visual ? <em>{text}</em> : text}</p>
            ))}
          </div>
        </details>
      </div>
      <div className="benchmark-video-media">
        <BenchmarkPlayer video={video} />
        <p className="mt-3 text-sm text-brand"><a href={watchPath(video)}>Watch on the dedicated video page →</a></p>
      </div>
    </section>
  );
}
