import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as seo from "../seo.mjs";

const compiled = ts.transpileModule(
  readFileSync(new URL("../../app/sitemap.ts", import.meta.url), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;

function loadSitemap({
  runs = [],
  prompts = [],
  posts = [],
  fail = false,
} = {}) {
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      if (name === "@/lib/seo.mjs") return seo;
      if (name === "@/lib/queries")
        return {
          getPublicSitemapRuns: async () => {
            if (fail) throw new Error("database unavailable");
            return runs;
          },
          getAllPublishedPrompts: async () => prompts,
        };
      if (name === "@/lib/blog") return { getAllPosts: () => posts };
      if (name === "@/lib/prompt-seo")
        return { promptToSlug: (value) => value };
      throw new Error(`Unexpected import ${name}`);
    },
  });
  return exports.default;
}

test("sitemap lists canonical snapshots and preserves separate periods while deduplicating prompt URLs", async () => {
  const entries = await loadSitemap({
    runs: [
      {
        category_slug: "protein-powder",
        period_label: "2026-10-B",
        modified_at: "2026-10-29T15:00:00Z",
      },
      {
        category_slug: "protein-powder",
        period_label: "2026-10-A",
        modified_at: "2026-10-13",
      },
      {
        category_slug: "lawn-fertilizer",
        period_label: "2026-04",
        modified_at: "2026-04-08",
      },
    ],
    prompts: [
      { prompt_text: "same-question", modified_at: "2026-05-01" },
      { prompt_text: "same-question", modified_at: "2026-05-30" },
    ],
    posts: [
      {
        slug: "archive",
        publish_date: "2026-05-16",
        modified_date: "2026-10-28",
      },
    ],
  })();
  const urls = entries.map((entry) => entry.url);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.includes(seo.reportUrl("protein-powder", "2026-10-B")));
  assert.ok(urls.includes(seo.reportUrl("protein-powder", "2026-10-A")));
  assert.ok(urls.includes(seo.reportUrl("lawn-fertilizer", "2026-04")));
  assert.ok(!urls.includes(seo.canonicalUrl("/tracker/protein-powder")));
  assert.equal(
    entries.find((e) => e.url.endsWith("/prompts/same-question")).lastModified,
    "2026-05-30",
  );
  assert.equal(
    entries.find((e) => e.url.endsWith("/blog/archive")).lastModified,
    "2026-10-28",
  );
  assert.equal(
    entries.find((e) => e.url.endsWith("period=2026-10-A")).lastModified,
    "2026-10-29T15:00:00.000Z",
  );
  assert.equal(
    entries.find((e) => e.url.endsWith("/privacy")).lastModified,
    "2026-04-11",
  );
  assert.ok(entries.every((e) => e.url.startsWith(seo.SITE_URL)));
});

test("failed evidence reads fail the sitemap instead of publishing a partial successful response", async () => {
  await assert.rejects(loadSitemap({ fail: true })(), /database unavailable/);
});
