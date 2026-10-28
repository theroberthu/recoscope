import test from "node:test";
import assert from "node:assert/strict";
import { homeBrandLeaders } from "../home-brand-leaders.mjs";
const category = {
  name: "Air Purifiers",
  slug: "air-purifiers",
  latest_run_date: "2026-10-17",
  latest_period_label: "2026-10-B",
  coverage: { eligible: 12, captured: 12 },
  leadingBrands: [
    { name: "Coway", mentionCount: 12 },
    { name: "Levoit", mentionCount: 12 },
  ],
};
test("each tied category leader links to its own dated snapshot and denominator", () => {
  const rows = homeBrandLeaders([category]);
  assert.deepEqual(
    rows.map((r) => r.brand),
    ["Coway", "Levoit"],
  );
  assert.ok(
    rows.every(
      (r) =>
        r.tied &&
        r.mentionCount === 12 &&
        r.eligibleAnswers === 12 &&
        r.href ===
          "https://www.getrecoscope.com/tracker/air-purifiers?period=2026-10-B",
    ),
  );
});
test("newer snapshots sort first without pooling brand frequency across categories", () => {
  const newer = {
    ...category,
    name: "Dog Food",
    slug: "dog-food",
    latest_run_date: "2026-10-19",
    coverage: { eligible: 9, captured: 12 },
    leadingBrands: [{ name: "Purina Pro Plan", mentionCount: 8 }],
  };
  const rows = homeBrandLeaders([category, newer]);
  assert.equal(rows[0].brand, "Purina Pro Plan");
  assert.equal(rows[0].eligibleAnswers, 9);
  assert.equal(rows[0].capturedAnswers, 12);
  assert.equal(rows[0].tied, false);
  assert.equal(rows.length, 3);
});
test("missing dates/coverage/periods and impossible counts do not create unsupported leader cards", () => {
  assert.deepEqual(
    homeBrandLeaders([
      { ...category, latest_period_label: "" },
      { ...category, latest_run_date: "" },
      { ...category, coverage: { eligible: 0, captured: 12 } },
      { ...category, leadingBrands: [] },
      { ...category, leadingBrands: [{ name: "Invalid", mentionCount: 13 }] },
    ]),
    [],
  );
});
