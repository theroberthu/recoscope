import { readFileSync } from "node:fs";
import { resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const publicRoot = resolve(root, "public");

export function validateLogos(brands, marks, readAsset = (src) => {
  const path = resolve(publicRoot, src.slice(1));
  if (!path.startsWith(publicRoot + sep)) throw new Error("Invalid asset path");
  return readFileSync(path);
}) {
  if (!Array.isArray(brands) || !brands.length || brands.some((b) => typeof b !== "string" || !b.trim()))
    throw new Error("Supply a nonempty JSON array of leader brand names, including all ties.");
  const errors = [];
  for (const brand of new Set(brands)) {
    const src = marks[brand]?.src;
    if (!src || !src.startsWith("/") || src.startsWith("//")) {
      errors.push(`${brand}: missing local logo mapping`);
      continue;
    }
    try {
      const bytes = Buffer.from(readAsset(src));
      const valid = src.endsWith(".svg") ? /<svg\b/.test(bytes.toString()) && /<\/svg>/.test(bytes.toString())
        : src.endsWith(".png") ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
        : src.endsWith(".webp") ? bytes.subarray(0,4).toString() === "RIFF" && bytes.subarray(8,12).toString() === "WEBP"
        : /\.jpe?g$/.test(src) ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : false;
      if (!valid) errors.push(`${brand}: empty or invalid image at ${src}`);
    } catch {
      errors.push(`${brand}: logo file unavailable at ${src}`);
    }
  }
  return errors;
}

function decodeHtml(text) {
  return text.replace(/&#(x[\da-f]+|\d+);/gi, (_, n) => String.fromCodePoint(n[0].toLowerCase() === "x" ? parseInt(n.slice(1),16) : Number(n)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || !["--leaders", "--url"].includes(args[0])))
    throw new Error("Usage: npm run check:logos [-- --leaders /path/leaders.json | --url https://www.getrecoscope.com/]");
  const marks = JSON.parse(readFileSync(resolve(root, "src/lib/home-brand-marks.json"), "utf8"));
  let brands;
  if (args[0] === "--leaders") {
    brands = JSON.parse(readFileSync(resolve(args[1]), "utf8"));
  } else {
    const response = await fetch(args[1] || "https://www.getrecoscope.com/", { signal: AbortSignal.timeout(30000), cache: "no-store" });
    if (!response.ok) throw new Error(`Homepage returned HTTP ${response.status}`);
    const html = await response.text();
    const rail = html.match(/<ul\b[^>]*\bid="home-brand-list"[^>]*>([\s\S]*?)<\/ul>/)?.[1];
    if (!rail) throw new Error("Homepage brand rail unavailable; logo check cannot pass.");
    brands = [...rail.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => decodeHtml(m[1].replace(/<[^>]*>/g, "").trim()));
  }
  const errors = validateLogos(brands, marks);
  if (errors.length) throw new Error("Homepage logo check failed:\n" + errors.join("\n"));
  console.log(`Homepage logos verified: ${new Set(brands).size} leaders, including ties; all mapped to valid local images.`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url)
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
