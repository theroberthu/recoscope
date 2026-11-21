import test from "node:test";
import assert from "node:assert/strict";
import { benchmarkExplainers, runningShoesNovemberCExplainer as video } from "../benchmark-video.mjs";
import { DEFAULT_SOCIAL_CARD, publicSocialCard, socialImage } from "../social-image.mjs";

const run = { id: 195, category_slug: "running-shoes", period_label: "2026-11-C", run_date: "2026-11-21" };

test("social image URLs are versioned, landscape and bound to an exact run", () => {
  const image = socialImage("benchmark", 195);
  const url = new URL(image.url);
  assert.equal(url.origin, "https://www.getrecoscope.com");
  assert.equal(url.searchParams.get("id"), "195");
  assert.equal(url.searchParams.get("v"), "matte-20261121");
  assert.equal(image.width, 1200);
  assert.equal(image.height, 630);
});

test("unpublished or mismatched evidence cannot produce a video share card", () => {
  assert.equal(publicSocialCard("site", null, [], []), DEFAULT_SOCIAL_CARD);
  assert.equal(publicSocialCard("video", video.id, [], benchmarkExplainers), null);
  assert.equal(publicSocialCard("video", "not-a-video", [run], benchmarkExplainers), null);
  for (const change of [{ category_slug: "office-chairs" }, { period_label: "2026-11-B" }, { run_date: "2026-11-16" }]) {
    assert.equal(publicSocialCard("video", video.id, [{ ...run, ...change }], benchmarkExplainers), null);
  }
  const card = publicSocialCard("video", video.id, [run], benchmarkExplainers);
  assert.equal(card.title, "Every answer. Four second places.");
  assert.equal(card.kicker, "Running Shoes · November 21, 2026");
  assert.equal(card.video, true);
});

test("historical reports keep their own date and title; no newer video substitution", () => {
  const prior = { id: 185, category_slug: "running-shoes", period_label: "2026-11-B", run_date: "2026-11-16" };
  const card = publicSocialCard("benchmark", "185", [run, prior], benchmarkExplainers);
  assert.equal(card.kicker, "Running Shoes · November 16, 2026");
  assert.notEqual(card.title, video.title);
  assert.equal(card.video, false);
  assert.equal(publicSocialCard("benchmark", "195", [prior], benchmarkExplainers), null);
  assert.equal(publicSocialCard("arbitrary-title", "195", [run], benchmarkExplainers), null);
});
