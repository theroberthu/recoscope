import type { Run, BrandMention, AgentResponse } from './types';
export interface HistorySnapshot { date: string; period: string; usable: number; branchMentions: number; comparativeAnswers: number; branchFirsts: number; steelcaseFirsts: number; branchLeads: boolean }
export interface OfficeChairsHistory { snapshots: HistorySnapshot[]; repeatedSplit: boolean }
export interface SnapshotEvidence { run: Run; mentions: BrandMention[]; responses: AgentResponse[] }
export function officeChairsHistory(slug: string, current: SnapshotEvidence, previous: SnapshotEvidence | null): OfficeChairsHistory | null;
