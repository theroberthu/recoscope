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

/** Categories that have at least one run, with the latest run's summary. */
export async function getCategoriesWithRuns(): Promise<
  (Category & { latest_summary: string | null; tracker_type: string })[]
> {
  const sql = getDb();
  const rows = await sql`
    SELECT c.*, r.summary AS latest_summary
    FROM categories c
    JOIN LATERAL (
      SELECT summary FROM runs
      WHERE category_id = c.id
      ORDER BY run_date DESC
      LIMIT 1
    ) r ON true
    WHERE c.is_active = true
    ORDER BY c.name
  `;
  return rows as (Category & { latest_summary: string | null })[];
}

// ---------------------------------------------------------------------------
// Runs
// ---------------------------------------------------------------------------

export async function getLatestRun(
  categoryId: number,
  statusFilter?: string,
): Promise<Run | null> {
  const sql = getDb();
  const rows = statusFilter
    ? await sql`
        SELECT * FROM runs
        WHERE category_id = ${categoryId}
          AND status = ${statusFilter}
        ORDER BY run_date DESC
        LIMIT 1
      `
    : await sql`
        SELECT * FROM runs
        WHERE category_id = ${categoryId}
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
// Homepage hero data
// ---------------------------------------------------------------------------

export async function getTopBrandsForHero(limit = 10): Promise<
  { brand: string; mentions: number }[]
> {
  const sql = getDb();
  const rows = await sql`
    SELECT brand_name_normalized AS brand, COUNT(*)::int AS mentions
    FROM brand_mentions bm
    JOIN runs r ON r.id = bm.run_id
    JOIN categories c ON c.id = r.category_id
    WHERE c.is_active = true
    ORDER BY mentions DESC
    LIMIT ${limit}
  `;
  return rows as { brand: string; mentions: number }[];
}

export async function getCrossAgentPreview(): Promise<
  { agent_name: string; brand: string; rank: number }[]
> {
  const sql = getDb();
  const rows = await sql`
    SELECT bm.agent_name, bm.brand_name_normalized AS brand, bm.mention_rank AS rank
    FROM brand_mentions bm
    JOIN runs r ON r.id = bm.run_id
    JOIN categories c ON c.id = r.category_id
    WHERE c.is_active = true
      AND bm.mention_rank <= 3
    ORDER BY bm.agent_name, bm.mention_rank
  `;
  return rows as { agent_name: string; brand: string; rank: number }[];
}

/** Active categories with latest run date for the report schedule. */
export async function getCategoriesWithSchedule(): Promise<
  { name: string; slug: string; tracker_type: string; last_run_date: string | null }[]
> {
  const sql = getDb();
  const rows = await sql`
    SELECT c.name, c.slug, c.tracker_type,
           r.run_date::text AS last_run_date
    FROM categories c
    LEFT JOIN LATERAL (
      SELECT run_date FROM runs
      WHERE category_id = c.id
      ORDER BY run_date DESC
      LIMIT 1
    ) r ON true
    WHERE c.is_active = true
    ORDER BY
      CASE WHEN c.tracker_type = 'seasonal' THEN 0 ELSE 1 END,
      c.name
  `;
  return rows as { name: string; slug: string; tracker_type: string; last_run_date: string | null }[];
}

// ---------------------------------------------------------------------------
// Audit page stats
// ---------------------------------------------------------------------------

export async function getAuditStats(): Promise<{
  brandsTracked: number;
  categoriesActive: number;
}> {
  const sql = getDb();
  const [brands, cats] = await Promise.all([
    sql`SELECT COUNT(DISTINCT brand_name_normalized)::int AS c FROM brand_mentions`,
    sql`SELECT COUNT(*)::int AS c FROM categories WHERE is_active = true`,
  ]);
  return {
    brandsTracked: (brands[0] as { c: number }).c,
    categoriesActive: (cats[0] as { c: number }).c,
  };
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
