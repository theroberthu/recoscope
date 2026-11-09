"use client";

import { useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import type { BenchmarkVideo } from "@/lib/benchmark-video.mjs";

export function BenchmarkPlayer({ video }: { video: BenchmarkVideo }) {
  const sentStart = useRef(false);
  const sentComplete = useRef(false);
  const [error, setError] = useState(false);
  const params = { category_slug: video.category, period: video.period, video_id: video.id };
  return (
    <div>
      <video
        src={video.src}
        poster={video.poster}
        width={1080}
        height={1920}
        controls
        playsInline
        preload="none"
        aria-label={video.title}
        style={{ display: "block", width: "100%", height: "auto", aspectRatio: "9 / 16", objectFit: "contain", borderRadius: 14, background: "#153e32" }}
        onPlay={() => {
          setError(false);
          if (!sentStart.current) { sentStart.current = true; trackEvent("video_start", params); }
        }}
        onEnded={() => {
          if (!sentComplete.current) { sentComplete.current = true; trackEvent("video_complete", params); }
        }}
        onError={() => setError(true)}
      >
        <track kind="captions" src={video.captions} srcLang="en" label="English (optional)" />
        Your browser does not support this video. Please read the transcript below.
      </video>
      {error && <p role="status">The video could not load. Please read the transcript or <a href={video.src}>open the video file</a>.</p>}
    </div>
  );
}
