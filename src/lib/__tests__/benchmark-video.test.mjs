import test from "node:test";
import assert from "node:assert/strict";
import { proteinExplainer, snapshotVideo } from "../benchmark-video.mjs";
const run = { id: "166", period_label: "2026-10-B", run_date: "2026-10-27" };
const approved = {
  ...proteinExplainer,
  approved: true,
  approvedSha256: "a".repeat(64),
};

test("a review video or missing approved checksum cannot appear on the public benchmark", () => {
  assert.equal(
    Boolean(snapshotVideo("protein-powder", run)),
    proteinExplainer.approved &&
      /^[a-f0-9]{64}$/.test(proteinExplainer.approvedSha256 || ""),
  );
  assert.equal(
    snapshotVideo("protein-powder", run, { ...approved, approved: false }),
    null,
  );
  for (const approvedSha256 of [null, "", "review", "g".repeat(64)])
    assert.equal(
      snapshotVideo("protein-powder", run, { ...approved, approvedSha256 }),
      null,
    );
});
test("an approved explainer belongs only to the October 27 protein powder snapshot", () => {
  assert.deepEqual(snapshotVideo("protein-powder", run, approved), approved);
  assert.deepEqual(
    snapshotVideo(
      "protein-powder",
      { ...run, id: 166, run_date: new Date("2026-10-27T00:00:00Z") },
      approved,
    ),
    approved,
  );
  assert.equal(snapshotVideo("standing-desks", run, approved), null);
  for (const change of [
    { id: 167 },
    { period_label: "2026-11-A" },
    { run_date: "2026-10-26" },
    { run_date: "not-a-date" },
  ])
    assert.equal(
      snapshotVideo("protein-powder", { ...run, ...change }, approved),
      null,
    );
});

test("an enabled production video must have an actual MP4 matching its approval checksum", async () => {
  if (!proteinExplainer.approved) return;
  const { readFileSync } = await import("node:fs");
  const { createHash } = await import("node:crypto");
  const asset = readFileSync(
    new URL("../../../public" + proteinExplainer.src, import.meta.url),
  );
  assert.equal(
    createHash("sha256").update(asset).digest("hex"),
    proteinExplainer.approvedSha256,
  );
});
