import test from "node:test";
import assert from "node:assert/strict";
import { validateLogos } from "../../../scripts/check-homepage-logos.mjs";
const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');

test("a new or tied leader without a logo fails publication preflight", () => {
  assert.deepEqual(validateLogos(["UPLIFT", "New tied leader"], { UPLIFT: { src: "/logo.svg" } }, () => svg), ["New tied leader: missing local logo mapping"]);
});
test("missing and invalid logo files cannot pass as successful checks", () => {
  assert.match(validateLogos(["Brand"], { Brand: { src: "/logo.svg" } }, () => { throw new Error("missing"); })[0], /unavailable/);
  assert.match(validateLogos(["Brand"], { Brand: { src: "/logo.svg" } }, () => Buffer.from("<html>404</html>"))[0], /invalid/);
  assert.throws(() => validateLogos([], {}), /nonempty/);
});
test("the repaired brands have actual local logo assets", async () => {
  const { readFileSync } = await import("node:fs");
  const marks = JSON.parse(readFileSync(new URL("../home-brand-marks.json", import.meta.url), "utf8"));
  assert.deepEqual(validateLogos(["Breville", "EltaMD", "FlexiSpot"], marks), []);
});
