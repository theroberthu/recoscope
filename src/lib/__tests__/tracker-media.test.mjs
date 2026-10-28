import test from "node:test";
import assert from "node:assert/strict";
import { snapshotProducts, brandMark } from "../tracker-media.mjs";

const answer = {
  id: 1704,
  run_id: 166,
  agent_name: "chatgpt",
  prompt_number: 3,
  raw_response:
    "Optimum Nutrition Gold Standard 100% Whey and Dymatize ISO100.",
};
test("product photos require the exact pilot run, source answer, prompt and product name", () => {
  assert.equal(snapshotProducts("protein-powder", 166, [answer]).length, 2);
  for (const change of [
    { id: 999 },
    { run_id: 167 },
    { prompt_number: 1 },
    { agent_name: "claude" },
    { raw_response: "Optimum Nutrition and Dymatize are mentioned." },
  ]) {
    assert.deepEqual(
      snapshotProducts("protein-powder", 166, [{ ...answer, ...change }]),
      [],
    );
  }
  assert.deepEqual(snapshotProducts("protein-powder", 167, [answer]), []);
  assert.deepEqual(snapshotProducts("standing-desks", 166, [answer]), []);
});
test("excluded or failed answers cannot supply product imagery evidence", () => {
  assert.deepEqual(
    snapshotProducts("protein-powder", 166, [
      { ...answer, analysis_exclusion_reason: "Excluded for collection error" },
    ]),
    [],
  );
  assert.deepEqual(
    snapshotProducts("protein-powder", 166, [{ ...answer, raw_response: "" }]),
    [],
  );
});
test("unranked Claude evidence stays evidence without inventing product ranks or counts", () => {
  const p = snapshotProducts("protein-powder", 166, [
    {
      ...answer,
      id: 1709,
      agent_name: "claude",
      raw_response:
        "Momentous Whey Protein Isolate and Optimum Nutrition Gold Standard 100% Whey.",
    },
  ]);
  assert.equal(p.length, 2);
  assert.deepEqual(p[0].evidence, [
    { answerId: 1709, agent: "claude", promptNumber: 3 },
  ]);
  assert.ok(!("rank" in p[0]) && !("mentionCount" in p[0]));
});
test("shared brand marks are reusable across categories with null for unknown names", () => {
  assert.ok(
    brandMark("protein-powder", "Optimum Nutrition").src.startsWith(
      "/tracker-media/",
    ),
  );
  assert.ok(brandMark("standing-desks", "UPLIFT").src.endsWith("uplift.svg"));
  assert.equal(brandMark(undefined, "UPLIFT"), null);
  assert.equal(brandMark("protein-powder", "Unknown"), null);
});

test("Neon BIGINT string IDs match the same source records as numeric archive IDs", () => {
  const dbAnswer = { ...answer, id: "1704", run_id: "166" };
  assert.deepEqual(
    snapshotProducts("protein-powder", "166", [dbAnswer]),
    snapshotProducts("protein-powder", 166, [answer]),
  );
  assert.deepEqual(snapshotProducts("protein-powder", "166x", [dbAnswer]), []);
});

test("curated galleries require their precise period, collection date, agent, prompt, run and product text", async () => {
  const { trackerProductCatalog } = await import(
    "../tracker-product-catalog.mjs"
  );
  const { existsSync } = await import("node:fs");
  assert.equal(Object.keys(trackerProductCatalog).length, 13);
  for (const [category, catalog] of Object.entries(trackerProductCatalog)) {
    for (const p of catalog.products) {
      assert.ok(
        existsSync(new URL("../../../public" + p.image, import.meta.url)),
      );
      const m = p.matches[0];
      const row = {
        ...answer,
        id: "9991",
        run_id: "999",
        agent_name: m.agent,
        raw_response: m.needle,
      };
      const snapshot = { period: catalog.period, runDate: catalog.runDate };
      const find = (r = row, meta = snapshot, id = "999") =>
        snapshotProducts(category, id, [r], meta).find((x) => x.id === p.id);
      assert.ok(find(), `${category}: ${p.name}`);
      assert.deepEqual(find().evidence, [
        { answerId: 9991, agent: m.agent, promptNumber: 3 },
      ]);
      for (const meta of [
        null,
        { ...snapshot, period: "2099-01-A" },
        { ...snapshot, runDate: "2099-01-01" },
      ])
        assert.equal(find(row, meta), undefined);
      for (const change of [
        { run_id: "998" },
        { prompt_number: 1 },
        { agent_name: "unknown" },
        { raw_response: p.brand },
        { raw_response: "" },
        { analysis_exclusion_reason: "collection error" },
      ])
        assert.equal(find({ ...row, ...change }), undefined);
      assert.equal(find(row, snapshot, "1000"), undefined);
      assert.ok(
        find(row, {
          ...snapshot,
          runDate: new Date(catalog.runDate + "T00:00:00Z"),
        }),
      );
      assert.ok(!("rank" in find()) && !("mentionCount" in find()));
    }
  }
});
