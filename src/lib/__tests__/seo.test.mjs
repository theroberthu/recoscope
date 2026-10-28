import test from "node:test";
import assert from "node:assert/strict";
import {
  isoDate,
  latestDate,
  reportUrl,
  canonicalUrl,
  articleSchemaData,
  jsonLd,
} from "../seo.mjs";

test("database Date objects and legacy report dates become ISO dates without local-day shifts", () => {
  const date = new Date("2026-10-27T00:00:00Z");
  assert.equal(isoDate(date), "2026-10-27T00:00:00.000Z");
  assert.equal(isoDate(date.toString()), "2026-10-27T00:00:00.000Z");
  assert.equal(isoDate("2026-10-27"), "2026-10-27");
  assert.equal(
    isoDate("2026-10-27T23:00:00-05:00"),
    "2026-10-28T04:00:00.000Z",
  );
});

test("unknown or impossible dates are omitted and freshness never defaults to today", () => {
  for (const value of [
    null,
    undefined,
    "",
    "bad date",
    "2026-02-31",
    false,
    0,
  ]) {
    assert.equal(isoDate(value), undefined);
  }
  assert.equal(latestDate(undefined, "bad"), undefined);
  assert.equal(latestDate("2026-05-16", "2026-10-28"), "2026-10-28");
});

test("snapshot citation URLs keep the selected period and use the www origin", () => {
  assert.equal(
    reportUrl("protein-powder", "2026-10-B"),
    "https://www.getrecoscope.com/tracker/protein-powder?period=2026-10-B",
  );
  const url = new URL(reportUrl("category/with spaces", "a&b"));
  assert.equal(url.pathname, "/tracker/category%2Fwith%20spaces");
  assert.equal(url.searchParams.get("period"), "a&b");
  assert.equal(url.searchParams.size, 1);
  assert.throws(() => canonicalUrl("//example.com"));
});

test("article dates and named authors share the site identity; organization bylines stay organizations", () => {
  const props = {
    headline: "Report",
    description: "Evidence",
    datePublished: new Date("2026-10-27T00:00:00Z"),
    dateModified: "2026-10-28",
    url: reportUrl("protein-powder", "2026-10-B"),
  };
  const named = articleSchemaData({ ...props, authorName: "Robert Hu" });
  assert.equal(named.datePublished, "2026-10-27T00:00:00.000Z");
  assert.equal(named.dateModified, "2026-10-28");
  assert.equal(named.author["@type"], "Person");
  assert.equal(
    named.author["@id"],
    "https://www.getrecoscope.com/about#person",
  );
  assert.equal(articleSchemaData(props).author["@type"], "Organization");
  assert.equal(
    named.publisher["@id"],
    "https://www.getrecoscope.com/#organization",
  );
  assert.equal(
    articleSchemaData({ ...props, dateModified: "2026-10-01" }).dateModified,
    props.datePublished.toISOString(),
  );
});

test("JSON-LD containing captured text cannot terminate its script element", () => {
  const value = { text: '</script><script>alert("test")</script>' };
  const serialized = jsonLd(value);
  assert.ok(!serialized.includes("<"));
  assert.deepEqual(JSON.parse(serialized), value);
});
