import type { AgentResponse, BrandMention } from './types';
import type { PromptRow } from './report-ranking.mjs';
export function homeFeatureEvidence(input: {mentions: BrandMention[]; responses: AgentResponse[]; comparison: PromptRow[]}): {brands: {name: string; mentionCount: number; firstPlaces: number | null}[]; rankedComparisons: number};
