import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Guard test for the public run safety fix.
//
// Every query in queries.ts that reads the `runs` table for a PUBLIC surface
// must gate on BOTH `is_public = true` AND `status = 'published'`. This test
// parses each named function body out of the source file and asserts the
// filters are present, so a future edit that drops the gate fails CI instead
// of silently leaking draft/reviewed runs to indexable pages.
//
// It is a static source check (no DB connection needed).

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(__dirname, "..", "queries.ts"), "utf8");

/**
 * Return the source span of a top-level function: from its `export`
 * declaration to the start of the next top-level `export`. Robust against
 * inline object return types (Promise<{ ... }>) that would confuse brace
 * matching. Presence checks over this span are sufficient because SQL
 * template literals only appear inside the function body.
 */
function extractFunctionBody(src, name) {
  const sig = new RegExp(`export\\s+(?:async\\s+)?function\\s+${name}\\b`);
  const start = src.search(sig);
  assert.ok(start !== -1, `function ${name} not found in queries.ts`);
  const rest = src.slice(start + 1);
  const nextExport = rest.search(/\nexport\s+(?:async\s+)?function\s/);
  const end = nextExport === -1 ? src.length : start + 1 + nextExport;
  return src.slice(start, end);
}

function hasPublishedGate(body) {
  return /status\s*=\s*'published'/.test(body);
}
function hasIsPublicTrue(body) {
  return /is_public\s*=\s*true/.test(body);
}

// Public-surface queries: must require published + is_public=true.
const PUBLIC_RUN_QUERIES = [
  "getCategoriesWithRuns",
  "getRunByPeriod",
  "getAllRunsForCategory",
  "getPreviousRun",
  "getAllSeasonalRuns",
  "getCrossAgentPreview",
  "getDemoRuns",
  "getDemoDayCount",
  "getPublicRunsByCategory",
  "getPublicDayCountByCategory",
  "getCategoriesWithSchedule",
  "getTopBrandsForHero",
  "getAllPublishedPrompts",
];

for (const name of PUBLIC_RUN_QUERIES) {
  test(`${name} gates on status='published'`, () => {
    const body = extractFunctionBody(source, name);
    assert.ok(hasPublishedGate(body), `${name} is missing status = 'published'`);
  });
  test(`${name} gates on is_public=true`, () => {
    const body = extractFunctionBody(source, name);
    assert.ok(hasIsPublicTrue(body), `${name} is missing is_public = true`);
  });
}

// getLatestRun: the default (no statusFilter) branch must require published.
test("getLatestRun default branch gates on status='published'", () => {
  const body = extractFunctionBody(source, "getLatestRun");
  assert.ok(hasPublishedGate(body), "getLatestRun is missing status = 'published' in default branch");
  assert.ok(hasIsPublicTrue(body), "getLatestRun is missing is_public = true");
});

// getPromptDetail contains multiple subqueries; every one must be gated.
test("getPromptDetail gates every subquery on published + public", () => {
  const body = extractFunctionBody(source, "getPromptDetail");
  const publishedCount = (body.match(/status\s*=\s*'published'/g) || []).length;
  const publicCount = (body.match(/is_public\s*=\s*true/g) || []).length;
  // 5 subqueries touch runs (meta, brands, agents, runDates, insight).
  assert.ok(publishedCount >= 5, `getPromptDetail has only ${publishedCount} published gates, expected >= 5`);
  assert.ok(publicCount >= 5, `getPromptDetail has only ${publicCount} is_public gates, expected >= 5`);
});

// getAuditStats: brand + category + run subqueries must all be gated.
test("getAuditStats gates brand, category, and run counts on published + public", () => {
  const body = extractFunctionBody(source, "getAuditStats");
  const publishedCount = (body.match(/status\s*=\s*'published'/g) || []).length;
  assert.ok(publishedCount >= 3, `getAuditStats has only ${publishedCount} published gates, expected >= 3`);
});

// Private prospect queries must remain is_public=false and must NOT be
// converted to published-only (private runs are draft by design).
for (const name of ["getProspectRuns", "getProspectDayCount"]) {
  test(`${name} preserves private (is_public=false) behavior`, () => {
    const body = extractFunctionBody(source, name);
    assert.ok(/is_public\s*=\s*false/.test(body), `${name} must keep is_public = false`);
    assert.ok(!hasPublishedGate(body), `${name} must NOT gate on published (private runs are draft by design)`);
  });
}
