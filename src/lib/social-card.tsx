import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SOCIAL_IMAGE_SIZE, type SocialCard } from "./social-image.mjs";

// Metadata modules are also imported by ordinary page functions, whose bundles
// do not include the image fonts. Read them only when actually rendering a PNG.
// Memoize the immutable local files across image requests; no font CDN is used.
let fontFiles: Promise<Buffer[]> | undefined;
function loadFonts() {
  return fontFiles ??= Promise.all([
  readFile(join(process.cwd(), "public/fonts/newsreader-og-regular.ttf")),
  readFile(join(process.cwd(), "public/fonts/recoscope-og-sans-regular.ttf")),
  readFile(join(process.cwd(), "public/fonts/recoscope-og-sans-semibold.ttf")),
]);
}
const palette = { paper: "#f2eee6", ink: "#2c2a27", secondary: "#696057", accent: "#914b37", line: "#cdc4b8" };

export async function renderSocialCard(card: SocialCard) {
  const [serif, sans, semibold] = await loadFonts();
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: palette.paper, color: palette.ink, fontFamily: "RecoScope Sans", padding: "42px 60px 32px", borderBottom: `8px solid ${palette.accent}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 25, borderBottom: `1px solid ${palette.line}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width="38" height="38" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="44" stroke={palette.accent} strokeWidth="4" /><circle cx="60" cy="60" r="28" stroke={palette.accent} strokeWidth="2" opacity="0.5" /><circle cx="60" cy="60" r="14" stroke={palette.accent} strokeWidth="1.5" opacity="0.3" /><circle cx="60" cy="60" r="4" fill={palette.accent} /></svg>
          <span style={{ fontSize: 34, fontWeight: 600 }}>RecoScope</span>
        </div>
        <span style={{ fontSize: 19, color: palette.secondary }}>Independent AI commerce research</span>
      </div>
      <div style={{ display: "flex", flex: 1, gap: 38, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", width: 850, flexShrink: 0 }}>
          <div style={{ display: "flex", fontSize: 20, fontWeight: 600, color: palette.accent, marginBottom: 21 }}>{card.kicker}</div>
          <div style={{ display: "flex", fontFamily: "Newsreader", fontSize: card.title.length > 85 ? 58 : card.title.length > 60 ? 68 : 80, lineHeight: 1.04, letterSpacing: "-0.025em" }}>{card.title}</div>
          <div style={{ display: "flex", fontSize: 25, lineHeight: 1.35, color: palette.secondary, marginTop: 23, maxWidth: 780 }}>{card.subtitle}</div>
        </div>
        <div style={{ display: "flex", width: 192, flexShrink: 0, height: 225, borderLeft: `1px solid ${palette.line}`, paddingLeft: 25, color: palette.accent, alignItems: "center" }}>
          {card.video ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}><div style={{ display: "flex", width: 112, height: 112, borderRadius: "50%", background: palette.accent, alignItems: "center", justifyContent: "center" }}><svg width="36" height="42" viewBox="0 0 36 42"><path d="M3 2L34 21L3 40Z" fill={palette.paper} /></svg></div><div style={{ display: "flex", fontSize: 17, fontWeight: 600, marginTop: 20 }}>WATCH THE BRIEF</div></div> : <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: 16 }}><div style={{ display: "flex", fontSize: 18, fontWeight: 600 }}>MENTIONED</div><svg width="72" height="72" viewBox="0 0 72 72"><path d="M8 25H64M8 47H64M47 8L24 64" stroke={palette.accent} strokeWidth="5" /></svg><div style={{ display: "flex", fontSize: 18, fontWeight: 600 }}>FIRST CHOICE</div></div>}
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 19, color: palette.secondary, paddingBottom: 24 }}>{card.context}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 19, borderTop: `1px solid ${palette.line}`, fontSize: 20 }}><span style={{ fontWeight: 600 }}>getrecoscope.com</span><span style={{ color: palette.secondary }}>Research by Robert Hu</span></div>
    </div>,
    { ...SOCIAL_IMAGE_SIZE, fonts: [
      { name: "Newsreader", data: serif, weight: 400, style: "normal" },
      { name: "RecoScope Sans", data: sans, weight: 400, style: "normal" },
      { name: "RecoScope Sans", data: semibold, weight: 600, style: "normal" },
    ], headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400" } },
  );
}
