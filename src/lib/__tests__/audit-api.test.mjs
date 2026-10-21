import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../../app/api/audit/route.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function setup({ existing = [], send = async () => ({ data: { id: 'test-mail' }, error: null }), dbError = false } = {}) {
  const queries = [], emails = [], errors = [];
  const exports = {};
  const modules = {
    'next/server': { NextResponse: { json: (body, options) => Response.json(body, options) } },
    '@/lib/db': { getDb: () => async (strings, ...values) => {
      queries.push({ sql: strings.join('?'), values });
      if (dbError) throw new Error('database unavailable');
      return strings[0].includes('SELECT') ? existing : [];
    } },
    resend: { Resend: class {
      emails = { send: async (payload) => { emails.push(payload); return send(payload); } };
    } },
  };
  vm.runInNewContext(compiled, {
    exports, URL, process: { env: { RESEND_API_KEY: 'test-only' } },
    console: { error: (...args) => errors.push(args) },
    require: (name) => { if (!(name in modules)) throw new Error(`Unexpected dependency: ${name}`); return modules[name]; },
  });
  return { post: (body) => exports.POST({ json: async () => body }), queries, emails, errors };
}

const lead = {
  name: ' Test Person ', email: ' TEST@example.com ', brand_name: ' Test Brand ',
  website: 'www.example.com/product', category_interest: 'Office Chairs', lead_type: 'audit',
};

test('audit saves normalized fields and completes the notification before responding', async () => {
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  const app = setup({ send: () => pending });
  let returned = false;
  const response = app.post(lead).then(value => { returned = true; return value; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(returned, false);
  assert.equal(app.emails.length, 1);
  assert.equal(app.emails[0].replyTo, 'test@example.com');
  assert.deepEqual(Array.from(app.queries[1].values).slice(0, 4), ['Test Person', 'test@example.com', 'Test Brand', 'https://www.example.com/product']);
  release({ data: { id: 'accepted' }, error: null });
  assert.deepEqual(await (await response).json(), { ok: true });
});

test('an existing request returns duplicate without another insert or email', async () => {
  const app = setup({ existing: [{ id: 42 }] });
  assert.deepEqual(await (await app.post(lead)).json(), { duplicate: true });
  assert.equal(app.queries.length, 1);
  assert.equal(app.emails.length, 0);
  assert.match(app.queries[0].sql, /lower\(trim\(email\)\)/);
});

for (const [name, send] of [
  ['provider rejection', async () => ({ data: null, error: { message: 'Rejected' } })],
  ['network failure', async () => { throw new Error('offline'); }],
]) {
  test(`${name} is logged without losing an already saved lead`, async () => {
    const app = setup({ send });
    assert.deepEqual(await (await app.post(lead)).json(), { ok: true });
    assert.equal(app.queries.length, 2);
    assert.equal(app.errors.length, 1);
  });
}

test('malformed inputs are rejected before touching the database', async () => {
  for (const body of [null, [], { ...lead, email: 'a@' }, { ...lead, name: '  ' }, { ...lead, website: 'javascript:alert(1)' }, { ...lead, website: 'not a website' }]) {
    const app = setup();
    assert.equal((await app.post(body)).status, 400);
    assert.equal(app.queries.length, 0);
    assert.equal(app.emails.length, 0);
  }
});

test('a database failure produces an error and sends no notification', async () => {
  const app = setup({ dbError: true });
  assert.equal((await app.post(lead)).status, 500);
  assert.equal(app.emails.length, 0);
});

test('monthly signup still accepts email without audit-only fields', async () => {
  const app = setup();
  assert.deepEqual(await (await app.post({ email: 'reader@example.com', lead_type: 'free_monthly_signup' })).json(), { ok: true });
  assert.equal(app.queries[1].values[6], 'free_monthly_signup');
});
