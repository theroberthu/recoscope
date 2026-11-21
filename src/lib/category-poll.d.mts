export const CATEGORY_POLL: { id: string; options: { id: string; label: string }[] };
export function isPollOption(value: unknown): value is string;
export type PollResults = { total: number; options: { id: string; label: string; votes: number; percent: number }[] };
export function pollResults(rows: { option_key: string; votes: string | number }[]): PollResults;
