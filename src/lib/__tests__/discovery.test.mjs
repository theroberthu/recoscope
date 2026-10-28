import test from "node:test";
import assert from "node:assert/strict";
import {
  snapshotAge,
  formatSnapshotDate,
  auditHref,
  resolveCategory,
} from "../discovery.mjs";

test("publication freshness has an explicit boundary and does not label future or missing records recent", () => {
  assert.equal(snapshotAge("2026-09-13", "2026-10-28"), "Recent snapshot");
  assert.equal(snapshotAge("2026-09-12", "2026-10-28"), "Historical snapshot");
  assert.equal(snapshotAge("2026-05-17", "2026-10-28"), "Historical snapshot");
  assert.equal(snapshotAge("2026-10-29", "2026-10-28"), "Historical snapshot");
  assert.equal(snapshotAge("", "2026-10-28"), "Historical snapshot");
});
test("a dated publication is formatted without moving to the preceding local day", () => {
  assert.equal(formatSnapshotDate("2026-10-27"), "Oct 27, 2026");
});
test("audit handoff encodes category context and only known categories become a form default", () => {
  const cats = [{ slug: "protein-powder", name: "Protein Powder" }];
  assert.equal(resolveCategory("protein-powder", cats), "Protein Powder");
  assert.equal(resolveCategory("not-a-category", cats), "");
  assert.equal(resolveCategory("<script>", cats), "");
  const url = new URL(
    auditHref("protein-powder", "report"),
    "https://www.getrecoscope.com",
  );
  assert.equal(url.pathname, "/audit");
  assert.equal(url.searchParams.get("category"), "protein-powder");
  assert.equal(url.searchParams.get("source"), "report");
});
