import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const compiled = ts.transpileModule(
  readFileSync(new URL("../prompt-seo.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } },
).outputText;
const { promptToDescription, CATEGORY_LABELS, promptToSlug, categoryPromptSlug, promptPageSlug, resolvePromptSlug, promptSearchSummary } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);

test("descriptions distinguish comparison, budget, alternatives and discovery questions", () => {
  const ranking = promptToDescription("Compare top wireless earbud brands and rank them, same profile", "Wireless Earbuds");
  const discovery = promptToDescription("What would you recommend?", "Wireless Earbuds");
  const alternatives = promptToDescription("What are the alternatives?", "Wireless Earbuds");
  assert.match(ranking, /Which wireless earbuds did AI rank first/);
  assert.match(discovery, /Which wireless earbuds do AI assistants mention/);
  assert.match(alternatives, /wireless earbuds alternatives/);
  for (const text of [ranking, discovery, alternatives]) {
    assert.doesNotMatch(text, /same profile|lead the recommendations|best products|2026/);
  }
});

test("budget descriptions preserve the actual amount without claiming products meet it", () => {
  for (const amount of ["25", "150", "1,500", "49.99"]) {
    const text = promptToDescription(`Looking for air purifiers under $${amount}.`, "Air Purifiers");
    assert.ok(text.includes(`AI answers to an under-$${amount} question`));
    assert.doesNotMatch(text, /verified|cost less|priced below|lead the recommendations/);
  }
});

test("all category descriptions stay concise without copying lengthy shopper personas", () => {
  for (const category of Object.values(CATEGORY_LABELS)) {
    const text = promptToDescription("I'm a 42-year-old remote manager who spends nine hours a day working from home, looking for the best option. What would you recommend?", category);
    assert.ok(text.includes(category.toLowerCase()));
    assert.ok(text.length <= 190, `${category}: ${text.length} characters`);
    assert.doesNotMatch(text, /42-year-old|nine hours/);
  }
});


test("shared comparison text has category-scoped identities, stable legacy ownership, and no arbitrary fallback", () => {
  const text = "Compare top brands and rank them";
  const all = ["running-shoes", "office-chairs", "electric-shavers"].map(category_slug => ({prompt_text: text, category_slug}));
  assert.equal(new Set(all.map(p => promptPageSlug(p, all))).size, 3);
  for (const prompt of all) {
    const slug = promptPageSlug(prompt, all);
    assert.equal(resolvePromptSlug(slug, all).category_slug, prompt.category_slug);
    assert.equal(resolvePromptSlug(slug, [...all].reverse()).canonicalSlug, slug);
  }
  assert.equal(resolvePromptSlug(promptToSlug(text), all).category_slug, "electric-shavers");
  assert.equal(promptPageSlug(all[2], all), promptToSlug(text));
  assert.equal(resolvePromptSlug(promptToSlug(text), all.filter(p => p.category_slug !== "electric-shavers")), null);
  const unique = [{prompt_text: "Compare top office chair brands and rank them, same profile", category_slug: "office-chairs"}];
  assert.equal(promptPageSlug(unique[0], unique), promptToSlug(unique[0].prompt_text));
  assert.equal(resolvePromptSlug(categoryPromptSlug(unique[0].prompt_text, "office-chairs"), unique).canonicalSlug, promptToSlug(unique[0].prompt_text));
});

test("comparison search descriptions offer a concrete reason to click without a product endorsement", () => {
  const text = promptToDescription("Compare top brands and rank them", "Electric Shavers");
  assert.equal(text, "Which electric shavers did AI rank first? Compare captured picks from ChatGPT, Claude, Gemini and Perplexity, with dates and the exact question.");
  assert.ok(text.length <= 160);
  assert.doesNotMatch(text, /best products|top recommended|guaranteed/);
});

test("evidence-led search copy applies only to the two exact prompt identities", () => {
  const shaver = promptSearchSummary(promptToSlug("Electric shaver under $150 for sensitive skin daily use?"));
  assert.match(shaver.title, /Under \$150 for Sensitive Skin/);
  assert.equal(shaver.snapshotDate, "2026-05-30");
  assert.match(shaver.description, /Braun ranked first in all four/);
  assert.match(shaver.limitation, /did not verify prices/);

  const earbuds = promptSearchSummary(promptToSlug("Compare top wireless earbud brands and rank them, same profile"));
  assert.match(earbuds.description, /Sony took first in two of four/);
  assert.match(earbuds.intro, /Bose appeared in all four answers and received no first-place ranks/);
  assert.equal(earbuds.snapshotDate, "2026-05-25");

  assert.equal(promptSearchSummary("compare-top-brands-and-rank-them-6537e966"), undefined);
  assert.equal(promptSearchSummary("i-am-a-38-year-old-man-in-the-usa-daily-commuter-who-shaves--fe817e54"), undefined);
});
