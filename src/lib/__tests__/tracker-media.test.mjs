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
test("brand marks are restricted to the pilot category with null for unknown names", () => {
  assert.ok(
    brandMark("protein-powder", "Optimum Nutrition").src.startsWith(
      "/tracker-media/",
    ),
  );
  assert.equal(brandMark("standing-desks", "Optimum Nutrition"), null);
  assert.equal(brandMark("protein-powder", "Unknown"), null);
});
