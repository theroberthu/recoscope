"use client";

import type { BenchmarkVideo } from "@/lib/benchmark-video.mjs";

export function BriefVideoLink({ video }: { video: BenchmarkVideo }) {
  const seconds = video.duration.match(/^\d+/)?.[0];
  return (
    <a
      href="#benchmark-video"
      className="report-brief-video"
      onClick={() => {
        // Use the existing player and its existing playback analytics. The
        // visitor's click is the only action that assigns the MP4 source.
        document.querySelector<HTMLButtonElement>("#benchmark-video .benchmark-video-play")?.click();
      }}
    >
      <span className="report-brief-thumbnail" aria-hidden="true">
        {/* Keep the full vertical frame visible, including embedded text. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={video.poster} alt="" width={45} height={80} decoding="async" />
      </span>
      <span className="report-brief-video-copy">
        <span className="report-brief-kicker">Benchmark brief · Video</span>
        <strong>Watch the {seconds ? `${seconds}-second ` : ""}brief</strong>
        <span>Play the finding and its context</span>
      </span>
      <span className="report-brief-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
      </span>
    </a>
  );
}
