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
          Collected <time dateTime="2026-10-27">October 27, 2026</time>
          <br />
          12 usable answers · Four AI assistants · Three prompt types
        </p>
        <p>
          Optimum Nutrition appeared in 9 of 12 usable answers. The three ranked
          comparisons named different first choices: Optimum Nutrition in
          ChatGPT, Transparent Labs in Gemini, and Ascent in Perplexity.
        </p>
        <p>
          <strong>Claude’s comparative answer was unranked.</strong> Mention
          frequency measures how often a brand appears; comparative rank records
          its position only when the answer supplies a ranking.
        </p>
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
            <p>
              Most mentioned doesn’t mean first choice. In Recoscope’s October
              27 protein powder snapshot, Optimum Nutrition appeared in 9 of 12
              usable answers across four AI assistants and three prompt types.
            </p>
            <p>
              But look at the comparative prompt. ChatGPT ranked Optimum
              Nutrition first. Gemini ranked Transparent Labs first. Perplexity
              ranked Ascent first.
            </p>
            <p>
              <em>
                On screen: three ranked comparisons; Claude’s answer was
                unranked.
              </em>
            </p>
            <p>
              For brand owners, track both: how often your brand appears and
              where it ranks in comparisons. A mention count shows visibility.
              It doesn’t tell you whether your brand came first.
            </p>
            <p>
              These findings describe the captured answers. They don’t establish
              product quality.
            </p>
            <p>Explore benchmark at getrecoscope.com.</p>
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
