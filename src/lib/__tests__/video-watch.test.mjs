import test from "node:test";
import assert from "node:assert/strict";
import { benchmarkExplainers } from "../benchmark-video.mjs";
import { publicWatchVideos, watchPath, videoSchema } from "../video-watch.mjs";
import { canonicalUrl } from "../seo.mjs";
const runs = benchmarkExplainers.map((video) => ({ id: video.runId, category_slug: video.category, period_label: video.period, run_date: video.collected }));

test("watch listing requires exact published evidence and never substitutes another snapshot", () => {
  assert.equal(publicWatchVideos(runs).length, 11);
  assert.equal(publicWatchVideos([]).length, 0);
  for (const change of [{ id: -1 }, { category_slug: "private-category" }, { period_label: "2026-12-A" }, { run_date: "2025-01-01" }]) {
    assert.equal(publicWatchVideos(runs.map((run) => ({ ...run, ...change }))).length, 0);
  }
});
test("watch metadata identifies the actual media, publication date and stable unique page", () => {
  const paths = new Set();
  for (const video of benchmarkExplainers) {
    const data = videoSchema(video);
    paths.add(watchPath(video));
    assert.equal(data.contentUrl, canonicalUrl(video.src));
    assert.deepEqual(data.thumbnailUrl, [canonicalUrl(video.poster)]);
    assert.equal(data.mainEntityOfPage["@id"], canonicalUrl(watchPath(video)));
    assert.ok(!data.url.includes("#"));
    assert.match(data.duration, /^PT\d+(\.\d+)?S$/);
    assert.ok(Number.isFinite(Date.parse(data.uploadDate)));
    assert.ok(data.transcript.length > 100);
    assert.throws(() => videoSchema({ ...video, approved: false }));
    assert.throws(() => videoSchema({ ...video, id: "unreleased-video" }));
  }
  assert.equal(paths.size, benchmarkExplainers.length);
  const protein = videoSchema(benchmarkExplainers[0]);
  assert.equal(protein.uploadDate, "2026-10-28T22:20:00.000Z");
});
