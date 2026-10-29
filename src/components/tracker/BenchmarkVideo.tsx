"use client";

import { useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import type { BenchmarkVideo as VideoDetails } from "@/lib/benchmark-video.mjs";

export function BenchmarkVideo({ video }: { video: VideoDetails }) {
  const player = useRef<HTMLVideoElement>(null);
  const sentStart = useRef(false);
  const sentComplete = useRef(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");
  const durationLabel = video.duration.replace("-second explainer", " seconds");
  const params = {
    category_slug: video.category,
    period: video.period,
    video_id: video.id,
  };

  function start() {
    const element = player.current;
    if (!element) return;
    // No media URL is assigned until the visitor explicitly requests playback.
    element.src = video.src;
    element.load();
    setStarted(true);
    element
      .play()
      .catch(() => setError("Press play in the video controls to start."));
  }

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
        <div className={`benchmark-video-frame${started ? " is-started" : ""}`}>
          {!started && (
            <span className="benchmark-video-badge" aria-hidden="true">
              Video · {durationLabel}
            </span>
          )}
          <video
            ref={player}
            width={1080}
            height={1920}
            controls={started}
            playsInline
            preload="none"
            poster={video.poster}
            aria-label={video.title}
            aria-describedby="benchmark-video-context benchmark-video-captions"
            onPlay={() => {
              setError("");
              if (!sentStart.current) {
                sentStart.current = true;
                trackEvent("video_start", params);
              }
            }}
            onEnded={() => {
              if (!sentComplete.current) {
                sentComplete.current = true;
                trackEvent("video_complete", params);
              }
            }}
            onError={() =>
              setError(
                "The video could not load. You can read the transcript beside the player.",
              )
            }
          >
            {started && (
              <track
                kind="captions"
                src={video.captions}
                srcLang="en"
                label="English (optional)"
              />
            )}
            Your browser does not support this video. Please read the
            transcript.
          </video>
          {!started && (
            <button
              type="button"
              className="benchmark-video-play"
              onClick={start}
              aria-label={`Play ${video.title}`}
            >
              <span className="benchmark-video-play-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="28"
                  height="28"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="benchmark-video-play-label">
                Watch explainer
              </span>
            </button>
          )}
        </div>
        {error && (
          <p role="status" className="benchmark-video-error">
            {error}
          </p>
        )}
        <noscript>
          <p>Enable JavaScript to play the video, or read the transcript.</p>
        </noscript>
      </div>
    </section>
  );
}
