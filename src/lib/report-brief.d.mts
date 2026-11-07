import type { Coverage, PromptResult } from './report-ranking.mjs';
export interface BriefMetric { names: string[]; count: number; total: number }
export interface ReportBriefEvidence { mentions: BriefMetric; firstPlaces: BriefMetric; unranked: number }
export function reportBriefEvidence(brands: {name: string; mentionCount: number}[], coverage: Coverage, prompts: PromptResult[]): ReportBriefEvidence;
