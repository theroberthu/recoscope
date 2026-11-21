export type SocialCard = { kicker: string; title: string; subtitle: string; context: string; video: boolean };
export const SOCIAL_IMAGE_VERSION: string;
export const SOCIAL_IMAGE_SIZE: { width: number; height: number };
export const DEFAULT_SOCIAL_CARD: SocialCard;
export function socialImage(type?: "site" | "benchmark" | "video", id?: string | number): { url: string; width: number; height: number; type: string; alt: string };
export function publicSocialCard(type: string, id: string | null, publicRuns: {id: number | string; category_slug: string; period_label: string; run_date: string | Date}[], videos: import("./benchmark-video.mjs").BenchmarkVideo[]): SocialCard | null;
