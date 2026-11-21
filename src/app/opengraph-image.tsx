import { DEFAULT_SOCIAL_CARD, SOCIAL_IMAGE_SIZE } from "@/lib/social-image.mjs";
import { renderSocialCard } from "@/lib/social-card";

export const runtime = "nodejs";
export const alt = "RecoScope — Is AI recommending your competitors?";
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";

// Retain the established endpoint; Next also versions its metadata image URL.
export default async function OGImage() {
  return renderSocialCard(DEFAULT_SOCIAL_CARD);
}
