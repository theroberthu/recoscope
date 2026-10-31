import test from "node:test";
import assert from "node:assert/strict";
import { proteinExplainer, standingDesksExplainer, skincareExplainer, airPurifiersExplainer, benchmarkExplainers, snapshotVideo } from "../benchmark-video.mjs";
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

  const { readFileSync } = await import("node:fs");
  const { createHash } = await import("node:crypto");
  for (const video of benchmarkExplainers.filter((v) => v.approved)) {
    const asset = readFileSync(new URL("../../../public" + video.src, import.meta.url));
    assert.equal(createHash("sha256").update(asset).digest("hex"), video.approvedSha256);
  }
});


test("registry selects the Standing Desks explainer only for run167 on October29", () => {
 const deskRun = { id: 167, period_label: "2026-10-B", run_date: "2026-10-29" };
 assert.equal(snapshotVideo("standing-desks", deskRun), standingDesksExplainer);
 assert.equal(snapshotVideo("protein-powder", run), proteinExplainer);
 for (const change of [{id:157},{period_label:"2026-10-A"},{run_date:"2026-10-13"}])
   assert.equal(snapshotVideo("standing-desks", {...deskRun,...change}), null);
 assert.equal(snapshotVideo("skincare",deskRun),null);
 assert.equal(snapshotVideo("standing-desks",run),null);
});


test("approved Skincare explainer belongs only to the October 30 snapshot", () => {
  const skincareRun = { id: 168, period_label: "2026-10-C", run_date: "2026-10-30" };
  assert.equal(snapshotVideo("skincare", skincareRun), skincareExplainer);
  assert.equal(snapshotVideo("skincare", skincareRun, { ...skincareExplainer, approved: false }), null);
  for (const change of [{ id: 158 }, { period_label: "2026-10-B" }, { run_date: "2026-10-16" }])
    assert.equal(snapshotVideo("skincare", { ...skincareRun, ...change }), null);
});


test("Approved Air Purifiers explainer is isolated to the October 31 snapshot", async () => {
  const airRun = { id: 169, period_label: "2026-10-C", run_date: "2026-10-31" };
  assert.equal(snapshotVideo("air-purifiers", airRun), airPurifiersExplainer);
  assert.equal(snapshotVideo("air-purifiers", airRun, { ...airPurifiersExplainer, approved: false }), null);
  const released = { ...airPurifiersExplainer, approved: true };
  assert.equal(snapshotVideo("air-purifiers", airRun, released), released);
  for (const change of [{ id: 159 }, { period_label: "2026-10-B" }, { run_date: "2026-10-17" }])
    assert.equal(snapshotVideo("air-purifiers", { ...airRun, ...change }, released), null);
  assert.equal(snapshotVideo("skincare", airRun, released), null);
  const { readFileSync } = await import("node:fs");
  const { createHash } = await import("node:crypto");
  const asset = readFileSync(new URL("../../../public" + released.src, import.meta.url));
  assert.equal(createHash("sha256").update(asset).digest("hex"), released.approvedSha256);
});
