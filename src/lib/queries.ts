import { getDb } from "./db";
import type {
  AgentResponse,
  BrandMention,
  Category,
  Run,
  RunInsight,
  TrackerType,
} from "./types";

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function getActiveCategories(): Promise<Category[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM categories
    WHERE is_active = true
    ORDER BY name
  `;
  return rows as Category[];
}

export async function getCategoryBySlug(
  slug: string,
  trackerType: TrackerType,
): Promise<Category | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM categories
    WHERE slug = ${slug}
      AND tracker_type = ${trackerType}
    LIMIT 1
  `;
  return (rows[0] as Category) ?? null;
}

// ---------------------------------------------------------------------------
// Runs
// ---------------------------------------------------------------------------

export async function getLatestRun(categoryId: number): Promise<Run | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM runs
    WHERE category_id = ${categoryId}
      AND status = 'published'
    ORDER BY run_date DESC
    LIMIT 1
  `;
  return (rows[0] as Run) ?? null;
}

export async function getRunByPeriod(
  categoryId: number,
  periodLabel: string,
): Promise<Run | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM runs
    WHERE category_id = ${categoryId}
      AND period_label = ${periodLabel}
    LIMIT 1
  `;
  return (rows[0] as Run) ?? null;
}

// ---------------------------------------------------------------------------
// Agent responses
// ---------------------------------------------------------------------------

export async function getAgentResponses(
  runId: number,
): Promise<AgentResponse[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM agent_responses
    WHERE run_id = ${runId}
    ORDER BY agent_name, prompt_number
  `;
  return rows as AgentResponse[];
}

// ---------------------------------------------------------------------------
// Brand mentions
// ---------------------------------------------------------------------------

export async function getBrandMentions(
  runId: number,
): Promise<BrandMention[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM brand_mentions
    WHERE run_id = ${runId}
    ORDER BY agent_name, prompt_number, mention_rank
  `;
  return rows as BrandMention[];
}

// ---------------------------------------------------------------------------
// Insights
// ---------------------------------------------------------------------------

export async function getRunInsight(
  runId: number,
): Promise<RunInsight | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM run_insights
    WHERE run_id = ${runId}
    LIMIT 1
  `;
  return (rows[0] as RunInsight) ?? null;
}
