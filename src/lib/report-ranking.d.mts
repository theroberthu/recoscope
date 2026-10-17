import type { AgentResponse, BrandMention } from './types';
export interface Coverage { captured: number; eligible: number; models: string[]; unavailableModels: string[]; excludedModels: string[] }
export interface RankedBrand { name: string; rank: number }
export interface PromptRow { agent: string; brands: string[]; rankedBrands: RankedBrand[]; allBrands: string[]; hasResponse: boolean; status: string | null }
export interface PromptResult { promptNumber: number; promptText: string; agentBrands: PromptRow[] }
export interface BudgetInsights { budgetOnly: string[]; disappearUnderBudget: string[]; modelsCompared: number }
export function validRank(value: unknown): number | null;
export function displayAgent(agent: string): string;
export function isEligibleResponse(response: Pick<AgentResponse, 'raw_response' | 'analysis_exclusion_reason'> | undefined): boolean;
export function eligibleMentions(mentions: BrandMention[], responses: AgentResponse[]): BrandMention[];
export function responseCoverage(responses: AgentResponse[]): Coverage;
export function mentionCounts(mentions: BrandMention[]): {name: string; mentionCount: number}[];
export function buildPromptBreakdown(prompts: {prompt_number: number; prompt_text: string}[], mentions: BrandMention[], responses: AgentResponse[]): PromptResult[];
export function rankSlots(brands: RankedBrand[]): string[];
export function buildBudgetInsights(prompts: PromptResult[]): BudgetInsights | null;
export function snapshotFinding(brands: {name: string; mentionCount: number}[], coverage: Coverage): string;
export function reviewStatus(reviewed: unknown): string;

export function applyRecordedExclusions(responses: AgentResponse[], runId: number): AgentResponse[];
