import { getDb } from "@/lib/db";
import { CATEGORY_POLL, pollResults } from "./category-poll.mjs";

// Local review only. Production always uses Neon and fails visibly if unavailable.
const previewVotes = new Map<string, string>();
export function isPollPreview() {
  return process.env.NODE_ENV === "development" && process.env.RECOSCOPE_POLL_PREVIEW === "1";
}

export async function readPoll(voterHash: string | null) {
  if (isPollPreview()) {
    const choice = voterHash ? previewVotes.get(voterHash) ?? null : null;
    return { choice, results: choice ? pollResults(CATEGORY_POLL.options.map(option => ({
      option_key: option.id,
      votes: [...previewVotes.values()].filter(value => value === option.id).length,
    }))) : null };
  }
  if (!voterHash) return { choice: null, results: null };
  const sql = getDb();
  const [mine, totals] = await Promise.all([
    sql`SELECT option_key FROM category_poll_votes WHERE poll_id = ${CATEGORY_POLL.id} AND voter_hash = ${voterHash}`,
    sql`SELECT option_key, count(*)::int AS votes FROM category_poll_votes WHERE poll_id = ${CATEGORY_POLL.id} GROUP BY option_key`,
  ]);
  const choice = mine[0]?.option_key ?? null;
  return { choice, results: choice ? pollResults(totals as { option_key: string; votes: number }[]) : null };
}

export async function savePollVote(voterHash: string, option: string) {
  if (isPollPreview()) {
    const duplicate = previewVotes.has(voterHash);
    if (!duplicate) previewVotes.set(voterHash, option);
    return { ...await readPoll(voterHash), duplicate };
  }
  const sql = getDb();
  const inserted = await sql`
    INSERT INTO category_poll_votes (poll_id, voter_hash, option_key)
    VALUES (${CATEGORY_POLL.id}, ${voterHash}, ${option})
    ON CONFLICT (poll_id, voter_hash) DO NOTHING
    RETURNING option_key
  `;
  return { ...await readPoll(voterHash), duplicate: inserted.length === 0 };
}
