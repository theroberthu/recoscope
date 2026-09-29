import type { AgentResponse, BrandMention } from './types';
export function validRank(value: unknown): number | null;
export function reviewStatus(reviewed: unknown): string;
export function buildPromptBreakdown(
  prompts: { prompt_number: number; prompt_text: string }[],
  mentions: BrandMention[],
  responses: AgentResponse[],
): {
  promptNumber: number;
  promptText: string;
  agentBrands: { agent: string; brands: string[]; status: string | null }[];
}[];
