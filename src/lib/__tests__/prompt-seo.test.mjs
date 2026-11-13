import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const compiled = ts.transpileModule(
  readFileSync(new URL("../prompt-seo.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } },
).outputText;
const { promptToDescription, CATEGORY_LABELS } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);

test("descriptions distinguish comparison, budget, alternatives and discovery questions", () => {
  const ranking = promptToDescription("Compare top wireless earbud brands and rank them, same profile", "Wireless Earbuds");
  const discovery = promptToDescription("What would you recommend?", "Wireless Earbuds");
  const alternatives = promptToDescription("What are the alternatives?", "Wireless Earbuds");
  assert.match(ranking, /Compare AI rankings for wireless earbuds/);
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
