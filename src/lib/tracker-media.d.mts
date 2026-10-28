import type { AgentResponse } from "./types";
export interface ProductExample {
  id: string;
  brand: string;
  name: string;
  image: string;
  alt: string;
  source: string;
  evidence: { answerId: number; agent: string; promptNumber: number }[];
}
export function brandMark(
  category: string | undefined,
  brand: string,
): { src: string; dark: boolean } | null;
export function snapshotProducts(
  category: string,
  runId: number,
  responses: AgentResponse[],
  snapshot?: { period: string; runDate: string | Date },
): ProductExample[];
