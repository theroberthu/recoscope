import { getDb } from "./db";
import type {
  AgentResponse,
  BrandMention,
  Category,
  ProspectProfile,
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

export async function getUpcomingCategories(): Promise<Category[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM categories
    WHERE is_active = false
    ORDER BY name
  `;
  return rows as Category[];
}

export async function getCategoryBySlug(
  slug: string,
  trackerType?: TrackerType,
): Promise<Category | null> {
  const sql = getDb();
  const rows = trackerType
    ? await sql`
        SELECT * FROM categories
        WHERE slug = ${slug} AND tracker_type = ${trackerType}
        LIMIT 1
      `
    : await sql`
        SELECT * FROM categories
        WHERE slug = ${slug}
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
        AND is_public = true
        AND status = 'published'
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
          AND is_public = true
        ORDER BY run_date DESC
        LIMIT 1
      `
    : await sql`
        SELECT * FROM runs
        WHERE category_id = ${categoryId}
          AND is_public = true
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
      AND is_public = true
      AND status = 'published'
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

/** Get deduplicated prompts for a run (one per prompt_number). */
export async function getPromptsForRun(
  runId: number,
): Promise<{ prompt_number: number; prompt_text: string }[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT DISTINCT ON (prompt_number) prompt_number, prompt_text
    FROM agent_responses
    WHERE run_id = ${runId}
    ORDER BY prompt_number, id
  `;
  return rows as { prompt_number: number; prompt_text: string }[];
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
      AND r.is_public = true
      AND r.status = 'published'
    GROUP BY brand_name_normalized
    ORDER BY mentions DESC
    LIMIT ${limit}
  `;
  return rows as { brand: string; mentions: number }[];
}

export async function getCrossAgentPreview(): Promise<
  { agent_name: string; brand: string; rank: number }[]
> {
  const sql = getDb();
  // Get all brand mentions from the most recent run for preview
  const rows = await sql`
    SELECT bm.agent_name,
           bm.brand_name_normalized AS brand,
           bm.mention_rank AS rank
    FROM brand_mentions bm
    WHERE bm.run_id = (
      SELECT r.id FROM runs r
      JOIN categories c ON c.id = r.category_id
      WHERE c.is_active = true
        AND r.is_public = true
        AND r.status = 'published'
      ORDER BY r.run_date DESC
      LIMIT 1
    )
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
        AND is_public = true
        AND status = 'published'
      ORDER BY run_date DESC
      LIMIT 1
    ) r ON true
    WHERE c.is_active = true
    ORDER BY
      CASE WHEN r.run_date IS NULL THEN 1 ELSE 0 END,
      r.run_date DESC NULLS LAST,
      c.name
  `;
  return rows as { name: string; slug: string; tracker_type: string; last_run_date: string | null }[];
}

// ---------------------------------------------------------------------------
// Seasonal trend data
// ---------------------------------------------------------------------------

/** Get the previous run for a seasonal category (for week-over-week comparison). */
export async function getPreviousRun(
  categoryId: number,
  currentPeriodLabel: string,
): Promise<Run | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM runs
    WHERE category_id = ${categoryId}
      AND tracker_type = 'seasonal'
      AND period_label < ${currentPeriodLabel}
      AND is_public = true
      AND status = 'published'
    ORDER BY period_label DESC
    LIMIT 1
  `;
  return (rows[0] as Run) ?? null;
}

/** Get all runs for a category (for period navigation). */
export async function getAllRunsForCategory(
  categoryId: number,
): Promise<Run[]> {
  const sql = getDb();
  const id = Number(categoryId);
  const rows = await sql`
    SELECT * FROM runs
    WHERE category_id = ${id}
      AND is_public = true
      AND status = 'published'
    ORDER BY run_date ASC
  `;
  return rows as Run[];
}

/** Get all runs for a seasonal category (for trend chart). */
export async function getAllSeasonalRuns(
  categoryId: number,
): Promise<Run[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM runs
    WHERE category_id = ${categoryId}
      AND tracker_type = 'seasonal'
      AND is_public = true
      AND status = 'published'
    ORDER BY period_label ASC
  `;
  return rows as Run[];
}

/** Get brand rankings for multiple runs at once (for trend chart). */
export async function getBrandRankingsForRuns(
  runIds: number[],
): Promise<{ run_id: number; brand: string; mentions: number }[]> {
  if (runIds.length === 0) return [];
  const sql = getDb();
  const rows = await sql`
    SELECT
      run_id,
      brand_name_normalized AS brand,
      COUNT(*)::int AS mentions
    FROM brand_mentions
    WHERE run_id = ANY(${runIds})
    GROUP BY run_id, brand_name_normalized
    ORDER BY run_id, mentions DESC
  `;
  return rows as { run_id: number; brand: string; mentions: number }[];
}

// ---------------------------------------------------------------------------
// Audit page stats
// ---------------------------------------------------------------------------

export async function getAuditStats(): Promise<{
  brandsTracked: number;
  categoriesActive: number;
  runsCompleted: number;
}> {
  const sql = getDb();
  const [brands, cats, runs] = await Promise.allSettled([
    sql`SELECT COUNT(DISTINCT bm.brand_name_normalized)::int AS c FROM brand_mentions bm JOIN runs r ON r.id = bm.run_id WHERE r.is_public = true AND r.status = 'published'`,
    sql`SELECT COUNT(DISTINCT c.id)::int AS c FROM categories c JOIN runs r ON r.category_id = c.id WHERE c.is_active = true AND r.is_public = true AND r.status = 'published'`,
    sql`SELECT COUNT(*)::int AS c FROM runs WHERE is_public = true AND status = 'published'`,
  ]);

  const getCount = (r: PromiseSettledResult<unknown>): number => {
    if (r.status !== "fulfilled") {
      console.error("[getAuditStats] sub-query failed:", r.reason);
      return 0;
    }
    const rows = r.value as { c: number }[];
    return rows[0]?.c ?? 0;
  };

  return {
    brandsTracked: getCount(brands),
    categoriesActive: getCount(cats),
    runsCompleted: getCount(runs),
  };
}

// ---------------------------------------------------------------------------
// Prospect (private) queries
// ---------------------------------------------------------------------------

export async function getProspectRuns(clientId: string): Promise<(Run & { category_name: string; category_slug: string })[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT r.*, c.name AS category_name, c.slug AS category_slug
    FROM runs r
    JOIN categories c ON c.id = r.category_id
    WHERE r.client_id = ${clientId}
      AND r.is_public = false
    ORDER BY r.run_date DESC
  `;
  return rows as (Run & { category_name: string; category_slug: string })[];
}

export async function getProspectDayCount(clientId: string): Promise<{ dayCount: number; firstDate: string | null; lastDate: string | null }> {
  const sql = getDb();
  const rows = await sql`
    SELECT
      COUNT(DISTINCT run_date)::int AS day_count,
      MIN(run_date)::text AS first_date,
      MAX(run_date)::text AS last_date
    FROM runs
    WHERE client_id = ${clientId}
      AND is_public = false
  `;
  const row = rows[0] as { day_count: number; first_date: string | null; last_date: string | null } | undefined;
  return {
    dayCount: row?.day_count ?? 0,
    firstDate: row?.first_date ?? null,
    lastDate: row?.last_date ?? null,
  };
}

// ---------------------------------------------------------------------------
// Prompt pages (SEO landing pages)
// ---------------------------------------------------------------------------

export interface PromptPageData {
  prompt_text: string;
  category_name: string;
  category_slug: string;
  run_count: number;
  response_count: number;
}

export async function getAllPublishedPrompts(): Promise<PromptPageData[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT
      ar.prompt_text,
      c.name AS category_name,
      c.slug AS category_slug,
      COUNT(DISTINCT r.id)::int AS run_count,
      COUNT(ar.id)::int AS response_count
    FROM agent_responses ar
    JOIN runs r ON r.id = ar.run_id
    JOIN categories c ON c.id = r.category_id
    WHERE r.status = 'published'
      AND r.is_public = true
      AND c.is_active = true
    GROUP BY ar.prompt_text, c.name, c.slug
    HAVING COUNT(ar.id) >= 3
    ORDER BY c.name, ar.prompt_text
  `;
  return rows as PromptPageData[];
}

export async function getPromptDetail(promptText: string): Promise<{
  prompt_text: string;
  category_name: string;
  category_slug: string;
  brands: { brand: string; mentions: number; top3: number; first_picks: number }[];
  agent_breakdown: { agent_name: string; brands: string[] }[];
  insight: { top_brands_summary: string | null; key_takeaway: string | null } | null;
  run_dates: string[];
} | null> {
  const sql = getDb();

  const meta = await sql`
    SELECT DISTINCT c.name AS category_name, c.slug AS category_slug
    FROM agent_responses ar
    JOIN runs r ON r.id = ar.run_id
    JOIN categories c ON c.id = r.category_id
    WHERE ar.prompt_text = ${promptText}
      AND r.status = 'published'
      AND r.is_public = true
    LIMIT 1
  `;
  if (meta.length === 0) return null;
  const { category_name, category_slug } = meta[0] as { category_name: string; category_slug: string };

  const brands = await sql`
    SELECT
      bm.brand_name_normalized AS brand,
      COUNT(*)::int AS mentions,
      COUNT(*) FILTER (WHERE bm.mention_rank <= 3)::int AS top3,
      COUNT(*) FILTER (WHERE bm.is_first = true)::int AS first_picks
    FROM brand_mentions bm
    JOIN agent_responses ar ON ar.run_id = bm.run_id
      AND ar.agent_name = bm.agent_name
      AND ar.prompt_number = bm.prompt_number
    JOIN runs r ON r.id = ar.run_id
    WHERE ar.prompt_text = ${promptText}
      AND r.status = 'published'
      AND r.is_public = true
    GROUP BY bm.brand_name_normalized
    ORDER BY mentions DESC
  `;

  const agents = await sql`
    SELECT
      bm.agent_name,
      bm.brand_name_normalized AS brand
    FROM brand_mentions bm
    JOIN agent_responses ar ON ar.run_id = bm.run_id
      AND ar.agent_name = bm.agent_name
      AND ar.prompt_number = bm.prompt_number
    JOIN runs r ON r.id = ar.run_id
    WHERE ar.prompt_text = ${promptText}
      AND r.status = 'published'
      AND r.is_public = true
      AND bm.mention_rank <= 5
    ORDER BY bm.agent_name, bm.mention_rank
  `;

  const agentMap = new Map<string, string[]>();
  for (const row of agents) {
    const r = row as { agent_name: string; brand: string };
    const list = agentMap.get(r.agent_name) ?? [];
    if (!list.includes(r.brand)) list.push(r.brand);
    agentMap.set(r.agent_name, list);
  }

  const runDates = await sql`
    SELECT DISTINCT r.run_date::text AS run_date
    FROM agent_responses ar
    JOIN runs r ON r.id = ar.run_id
    WHERE ar.prompt_text = ${promptText}
      AND r.status = 'published'
      AND r.is_public = true
    ORDER BY run_date DESC
  `;

  const insightRows = await sql`
    SELECT ri.top_brands_summary, ri.key_takeaway
    FROM run_insights ri
    JOIN runs r ON r.id = ri.run_id
    JOIN categories c ON c.id = r.category_id
    WHERE c.slug = ${category_slug}
      AND r.status = 'published'
      AND r.is_public = true
    ORDER BY r.run_date DESC
    LIMIT 1
  `;

  return {
    prompt_text: promptText,
    category_name,
    category_slug,
    brands: brands as { brand: string; mentions: number; top3: number; first_picks: number }[],
    agent_breakdown: Array.from(agentMap.entries()).map(([agent_name, brandList]) => ({
      agent_name,
      brands: brandList,
    })),
    insight: insightRows.length > 0
      ? insightRows[0] as { top_brands_summary: string | null; key_takeaway: string | null }
      : null,
    run_dates: (runDates as { run_date: string }[]).map((r) => r.run_date),
  };
}

// ---------------------------------------------------------------------------
// Demo queries (pull brand data from public runs)
// ---------------------------------------------------------------------------

export async function getDemoRuns(brandName: string): Promise<(Run & { category_name: string; category_slug: string })[]> {
  const sql = getDb();
  const pattern = `%${brandName}%`;
  const rows = await sql`
    SELECT DISTINCT ON (r.id) r.*, c.name AS category_name, c.slug AS category_slug
    FROM runs r
    JOIN categories c ON c.id = r.category_id
    JOIN brand_mentions bm ON bm.run_id = r.id
    WHERE bm.brand_name_normalized ILIKE ${pattern}
      AND r.is_public = true
      AND r.status = 'published'
    ORDER BY r.id, r.run_date DESC
  `;
  return rows as (Run & { category_name: string; category_slug: string })[];
}

export async function getDemoDayCount(brandName: string): Promise<{ dayCount: number; firstDate: string | null; lastDate: string | null }> {
  const sql = getDb();
  const pattern = `%${brandName}%`;
  const rows = await sql`
    SELECT
      COUNT(DISTINCT r.run_date)::int AS day_count,
      MIN(r.run_date)::text AS first_date,
      MAX(r.run_date)::text AS last_date
    FROM runs r
    JOIN brand_mentions bm ON bm.run_id = r.id
    WHERE bm.brand_name_normalized ILIKE ${pattern}
      AND r.is_public = true
      AND r.status = 'published'
  `;
  const row = rows[0] as { day_count: number; first_date: string | null; last_date: string | null } | undefined;
  return {
    dayCount: row?.day_count ?? 0,
    firstDate: row?.first_date ?? null,
    lastDate: row?.last_date ?? null,
  };
}

export async function getPublicRunsByCategory(categorySlug: string): Promise<(Run & { category_name: string; category_slug: string })[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT r.*, c.name AS category_name, c.slug AS category_slug
    FROM runs r
    JOIN categories c ON c.id = r.category_id
    WHERE c.slug = ${categorySlug}
      AND r.is_public = true
      AND r.status = 'published'
    ORDER BY r.run_date DESC
  `;
  return rows as (Run & { category_name: string; category_slug: string })[];
}

export async function getPublicDayCountByCategory(categorySlug: string): Promise<{ dayCount: number; firstDate: string | null; lastDate: string | null }> {
  const sql = getDb();
  const rows = await sql`
    SELECT
      COUNT(DISTINCT r.run_date)::int AS day_count,
      MIN(r.run_date)::text AS first_date,
      MAX(r.run_date)::text AS last_date
    FROM runs r
    JOIN categories c ON c.id = r.category_id
    WHERE c.slug = ${categorySlug}
      AND r.is_public = true
      AND r.status = 'published'
  `;
  const row = rows[0] as { day_count: number; first_date: string | null; last_date: string | null } | undefined;
  return {
    dayCount: row?.day_count ?? 0,
    firstDate: row?.first_date ?? null,
    lastDate: row?.last_date ?? null,
  };
}

// ---------------------------------------------------------------------------
// Prospect profiles
// ---------------------------------------------------------------------------

export async function getProspectProfile(clientId: string): Promise<ProspectProfile | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM prospect_profiles
    WHERE client_id = ${clientId}
    LIMIT 1
  `;
  return (rows[0] as ProspectProfile) ?? null;
}

export async function updateProspectProfile(
  clientId: string,
  fields: { personal_note?: string; strategy_text?: string; recommendation_1?: string; recommendation_2?: string; recommendation_3?: string },
): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE prospect_profiles
    SET personal_note = ${fields.personal_note ?? null},
        strategy_text = ${fields.strategy_text ?? null},
        recommendation_1 = ${fields.recommendation_1 ?? null},
        recommendation_2 = ${fields.recommendation_2 ?? null},
        recommendation_3 = ${fields.recommendation_3 ?? null}
    WHERE client_id = ${clientId}
  `;
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
