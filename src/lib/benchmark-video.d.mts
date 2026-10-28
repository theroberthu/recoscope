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
}
export const proteinExplainer: BenchmarkVideo;
export function snapshotVideo(
  category: string,
  run: { id: number | string; period_label: string; run_date: string | Date },
  video?: BenchmarkVideo,
): BenchmarkVideo | null;
