import { getPublicSitemapRuns } from "@/lib/queries";
import { benchmarkExplainers } from "@/lib/benchmark-video.mjs";
import { DEFAULT_SOCIAL_CARD, publicSocialCard } from "@/lib/social-image.mjs";
import { renderSocialCard } from "@/lib/social-card";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const type = query.get("type") ?? "site";
  if (type === "site") return renderSocialCard(DEFAULT_SOCIAL_CARD);
  const id = query.get("id");
  if (!["benchmark", "video"].includes(type) || !id || !/^[a-z0-9-]{1,160}$/.test(id)) return new Response("Not found", { status: 404 });
  const card = publicSocialCard(type, id, await getPublicSitemapRuns(), benchmarkExplainers);
  if (!card) return new Response("Not found", { status: 404 });
  return renderSocialCard(card);
}
