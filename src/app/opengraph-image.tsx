import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RecoScope — AI Recommendation Benchmarks";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f7f4",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo row: radar icon + text */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* Radar/lens icon */}
          <svg width="80" height="80" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="44" stroke="#07685c" strokeWidth="4" fill="none" />
            <circle cx="60" cy="60" r="28" stroke="#07685c" strokeWidth="2" fill="none" opacity="0.5" />
            <circle cx="60" cy="60" r="14" stroke="#07685c" strokeWidth="1.5" fill="none" opacity="0.3" />
            <circle cx="60" cy="60" r="4" fill="#07685c" />
            <path d="M60 60 L60 16 A44 44 0 0 1 91 29 Z" fill="#07685c" opacity="0.1" />
          </svg>

          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#07685c",
              letterSpacing: "0.08em",
            }}
          >
            RECOSCOPE
          </div>
        </div>

        <div
          style={{
            fontSize: 26,
            color: "#43564b",
            marginTop: 28,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          AI Recommendation Benchmarks for Consumer Brands
        </div>

        <div
          style={{
            marginTop: 36,
            fontSize: 15,
            color: "#596a61",
            letterSpacing: "0.18em",
            textTransform: "uppercase" as const,
          }}
        >
          getrecoscope.com
        </div>
      </div>
    ),
    { ...size },
  );
}
