import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import * as crypto from "node:crypto";
import ts from "typescript";
import * as config from "../category-poll.mjs";

function compile(path, modules, env) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, URL, process: { env }, console: { error() {} },
    require(name) { if (!(name in modules)) throw new Error(`Unexpected dependency: ${name}`); return modules[name]; },
  });
  return exports;
}

function setup({ fail = false, env = { NODE_ENV: "production" } } = {}) {
  const votes = new Map();
  const queries = [];
  const sql = async (strings, ...values) => {
    const text = strings.join("?");
    queries.push({ text, values });
    if (fail) throw new Error("Database unavailable");
    if (text.includes("INSERT")) {
      const [poll, voter, option] = values;
      assert.equal(poll, config.CATEGORY_POLL.id);
      if (votes.has(voter)) return [];
      votes.set(voter, option);
      return [{ option_key: option }];
    }
    if (text.includes("GROUP BY")) return config.CATEGORY_POLL.options.map(option => ({ option_key: option.id, votes: [...votes.values()].filter(x => x === option.id).length }));
    const selected = votes.get(values[1]);
    return selected ? [{ option_key: selected }] : [];
  };
  const store = compile("../category-poll-store.ts", { "@/lib/db": { getDb: () => sql }, "./category-poll.mjs": config }, env);
  const next = { NextResponse: { json(body, init) {
    const response = Response.json(body, init);
    response.savedCookies = [];
    response.cookies = { set: (...args) => response.savedCookies.push(args) };
    return response;
  } } };
  const route = compile("../../app/api/category-poll/route.ts", { "node:crypto": crypto, "next/server": next, "@/lib/category-poll.mjs": config, "@/lib/category-poll-store": store }, env);
  const req = (body, { cookie, origin = "https://www.getrecoscope.com", contentType = "application/json", raw, length } = {}) => ({
    nextUrl: new URL("https://www.getrecoscope.com/api/category-poll"),
    headers: new Headers({ origin, host: "www.getrecoscope.com", "content-type": contentType, ...(length ? { "content-length": String(length) } : {}) }),
    cookies: { get: () => cookie ? { value: cookie } : undefined },
    text: async () => raw ?? JSON.stringify(body),
  });
  return { route, store, votes, queries, req };
}

const payload = option => ({ pollId: config.CATEGORY_POLL.id, option });

test("poll totals start at zero and use counts from all three options", () => {
  assert.equal(config.pollResults([]).total, 0);
  assert.ok(config.pollResults([]).options.every(x => x.percent === 0));
  const result = config.pollResults([{ option_key: "air-fryers", votes: "2" }, { option_key: "cordless-vacuums", votes: 1 }]);
  assert.equal(result.total, 3);
  assert.deepEqual(result.options.map(x => x.percent), [67, 0, 33]);
});

test("first vote saves only a hash, returns real results, sets a protected cookie", async () => {
  const app = setup();
  const response = await app.route.POST(app.req(payload("air-fryers")));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.results.total, 1);
  assert.equal(body.choice, "air-fryers");
  const [, token, options] = response.savedCookies[0];
  assert.equal(options.httpOnly, true);
  assert.equal(options.sameSite, "lax");
  assert.equal(options.secure, true);
  const [hash] = app.votes.keys();
  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.notEqual(hash, token);
  assert.match(response.headers.get("cache-control"), /no-store/);
});

test("reload restores the original vote; a repeated or changed submission cannot add a vote", async () => {
  const app = setup();
  const first = await app.route.POST(app.req(payload("air-fryers")));
  const cookie = first.savedCookies[0][1];
  const repeated = await app.route.POST(app.req(payload("cordless-vacuums"), { cookie }));
  const result = await repeated.json();
  assert.equal(result.duplicate, true);
  assert.equal(result.choice, "air-fryers");
  assert.equal(result.results.total, 1);
  const reload = await app.route.GET(app.req(null, { cookie }));
  assert.equal((await reload.json()).choice, "air-fryers");
  assert.match(app.queries.find(x => x.text.includes("INSERT")).text, /ON CONFLICT \(poll_id, voter_hash\) DO NOTHING/);
});

test("visitors who have not voted do not receive results or a poll cookie", async () => {
  const app = setup();
  const response = await app.route.GET(app.req(null));
  assert.equal((await response.json()).results, null);
  assert.equal(response.savedCookies.length, 0);
});

for (const [name, body, options, status] of [
  ["cross-origin", payload("air-fryers"), { origin: "https://other.example" }, 403],
  ["wrong content type", payload("air-fryers"), { contentType: "text/plain" }, 415],
  ["malformed JSON", null, { raw: "{" }, 400],
  ["oversized body", null, { raw: "x".repeat(1025) }, 400],
  ["oversized header", payload("air-fryers"), { length: 9999 }, 413],
  ["unknown option", payload("unlisted"), {}, 400],
  ["stale poll", { pollId: "old-poll", option: "air-fryers" }, {}, 400],
  ["empty body", null, {}, 400],
]) test(`rejects ${name} before touching storage`, async () => {
  const app = setup();
  assert.equal((await app.route.POST(app.req(body, options))).status, status);
  assert.equal(app.queries.length, 0);
});

test("database failure is visible and never claims a vote was saved", async () => {
  const app = setup({ fail: true });
  const response = await app.route.POST(app.req(payload("air-fryers")));
  assert.equal(response.status, 503);
  assert.equal(response.savedCookies.length, 0);
  assert.equal((await response.json()).results, undefined);
});

test("preview storage cannot replace Neon in production", async () => {
  const app = setup({ fail: true, env: { NODE_ENV: "production", RECOSCOPE_POLL_PREVIEW: "1" } });
  assert.equal(app.store.isPollPreview(), false);
  assert.equal((await app.route.POST(app.req(payload("air-fryers")))).status, 503);
});

test("uses the incoming host when Next normalizes its internal URL", async () => {
  const app = setup();
  const request = app.req(payload("air-fryers"));
  request.nextUrl = new URL("http://localhost:3038/api/category-poll");
  request.headers.set("host", "127.0.0.1:3038");
  request.headers.set("origin", "http://127.0.0.1:3038");
  assert.equal((await app.route.POST(request)).status, 200);
});
