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
          backgroundColor: "#0a0a0f",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: "#00d4aa",
            letterSpacing: "0.1em",
            marginBottom: 24,
          }}
        >
          RecoScope
        </div>
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.5)",
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          AI Recommendation Benchmarks for Consumer Brands
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 16,
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.15em",
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
