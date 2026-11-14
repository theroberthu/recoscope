"use client";

import { useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { YOUTUBE_TRAILER_URL } from "@/lib/social-links";

const MEDIA = "/videos/recoscope-intro-2026-11-14";

export function IntroTrailer() {
  const player = useRef<HTMLVideoElement>(null);
  const started = useRef(false);
  const completed = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(false);
  const params = { video_id: "recoscope-channel-intro-2026-11-14", source: "homepage-intro" };

  return (
    <div className="home-intro-trailer">
      {!expanded && (
        <button type="button" className="home-intro-card" aria-expanded={false}
          aria-controls="home-intro-player" aria-label="Play the 40-second RecoScope intro"
          onClick={() => {
            setExpanded(true);
            player.current?.play().then(() => player.current?.focus()).catch(() => setError(true));
          }}>
          <span className="home-intro-thumbnail" aria-hidden="true">
            <img src={`${MEDIA}/poster.png`} width={1920} height={1080} alt="" />
            <span>▶</span>
          </span>
          <span className="home-intro-copy">
            <strong>What is RecoScope?</strong>
            <span>Watch the 40-second intro <span aria-hidden="true">→</span></span>
          </span>
        </button>
      )}
      <div id="home-intro-player" hidden={!expanded}>
        <video ref={player} src={`${MEDIA}/trailer.mp4`} poster={`${MEDIA}/poster.png`}
          width={1920} height={1080} controls playsInline preload="none"
          aria-label="What is RecoScope? Channel intro by Robert Hu"
          onPlay={() => {
            setError(false);
            if (!started.current) { started.current = true; trackEvent("video_start", params); }
          }}
          onEnded={() => {
            if (!completed.current) { completed.current = true; trackEvent("video_complete", params); }
          }}
          onError={() => setError(true)}>
          <track kind="captions" src={`${MEDIA}/captions.vtt`} srcLang="en" label="English (optional)" />
          Your browser does not support video. Read the transcript or watch on YouTube below.
        </video>
        {error && <p role="status" className="home-intro-note">Press play in the player, or use the YouTube link below.</p>}
        <div className="home-intro-links">
          <details>
            <summary>Read transcript</summary>
            <p>Does AI recommend your brand, or your competitor? I’m Robert Hu. I built Recoscope to make those answers visible. We ask ChatGPT, Claude, Gemini and Perplexity consistent shopper questions. Then we publish what they said. A brand can be mentioned most often without ranking first. In our protein powder snapshot, three ranked comparisons produced three different first choices. We separate brand mentions from explicit rankings, and show the dates, prompts and collection notes. These are captured answers, not product-quality ratings. Subscribe for benchmark briefs. Explore benchmark at getrecoscope.com.</p>
            <p>Example: Protein Powder · October 27, 2026 · 12 usable answers · Four AI assistants · Three prompt types. Claude’s comparative answer was unranked. Narration uses Robert Hu’s authorized AI voice clone.</p>
          </details>
          <a href={YOUTUBE_TRAILER_URL} target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>
        </div>
      </div>
    </div>
  );
}
