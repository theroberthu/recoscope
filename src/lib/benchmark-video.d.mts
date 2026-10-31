export interface BenchmarkVideo {
  id: string;
  approved: boolean;
  approvedSha256: string | null;
  category: string;
  runId: number;
  period: string;
  collected: string;
  title: string;
  duration: string;
  src: string;
  poster: string;
  captions: string;
  collectedLabel: string;
  context: string;
  summary: string[];
  transcript: { text: string; visual?: boolean }[];
}
export const proteinExplainer: BenchmarkVideo;
export const standingDesksExplainer: BenchmarkVideo;
export const skincareExplainer: BenchmarkVideo;
export const airPurifiersExplainer: BenchmarkVideo;
export const benchmarkExplainers: BenchmarkVideo[];
export function snapshotVideo(
  category: string,
  run: { id: number | string; period_label: string; run_date: string | Date },
  video?: BenchmarkVideo,
): BenchmarkVideo | null;
