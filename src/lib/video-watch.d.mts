import type { BenchmarkVideo } from "./benchmark-video.mjs";
export const WATCH_PAGES_UPDATED_AT: string;
export function watchPath(video: BenchmarkVideo): string;
export function categoryLabel(video: BenchmarkVideo): string;
export function publicWatchVideos(runs: { id: number | string; category_slug: string; period_label: string; run_date: string | Date }[]): BenchmarkVideo[];
export function videoSchema(video: BenchmarkVideo): Record<string, unknown>;
