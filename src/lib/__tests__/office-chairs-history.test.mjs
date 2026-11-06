import { test } from 'node:test';
import assert from 'node:assert/strict';
import { officeChairsHistory } from '../office-chairs-history.mjs';

const agents = ['chatgpt', 'claude', 'gemini', 'perplexity'];
function capture(id, date, period, branchCount) {
  const responses = agents.flatMap(agent_name => [1, 2, 3].map(prompt_number => ({ agent_name, prompt_number, raw_response: '[CAPTURED]' })));
  const mentions = responses.slice(0, branchCount).map(r => ({ ...r, brand_name_normalized: 'Branch', mentioned: true, mention_rank: null }));
  mentions.push(...agents.map(agent_name => ({ agent_name, prompt_number: 3, brand_name_normalized: 'Steelcase', mentioned: true, mention_rank: 1 })));
  return { run: { id, category_id: 1, run_date: date, period_label: period, status: 'published', is_public: true }, responses, mentions };
}
const pair = () => [capture(173, '2026-11-05', '2026-11-A', 11), capture(162, '2026-10-21', '2026-10-B', 12)];

test('separates all-answer frequency from comparative first places', () => {
  const [current, previous] = pair();
  // A budget first place is not a comparative first place; duplicated mentions count once.
  current.mentions.push({ ...current.mentions[0] });
  current.mentions.find(m => m.brand_name_normalized === 'Branch' && m.prompt_number === 2).mention_rank = 1;
  const history = officeChairsHistory('office-chairs', current, previous);
  assert.deepEqual(history.snapshots.map(s => [s.branchMentions, s.usable, s.branchFirsts, s.steelcaseFirsts, s.comparativeAnswers]), [[12, 12, 0, 4, 4], [11, 12, 0, 4, 4]]);
  assert.equal(history.repeatedSplit, true);
});

test('excludes unavailable answers and never ranks an unranked mention first', () => {
  const [current, previous] = pair();
  current.responses.find(r => r.agent_name === 'claude' && r.prompt_number === 3).raw_response = '[UNAVAILABLE]';
  current.mentions.find(m => m.agent_name === 'gemini' && m.prompt_number === 3 && m.brand_name_normalized === 'Steelcase').mention_rank = null;
  const latest = officeChairsHistory('office-chairs', current, previous).snapshots[1];
  assert.equal(latest.usable, 11);
  assert.equal(latest.comparativeAnswers, 3);
  assert.equal(latest.steelcaseFirsts, 2);
  assert.equal(latest.branchFirsts, 0);
});

test('requires the exact reviewed pair and published public records', () => {
  const [current, previous] = pair();
  for (const patch of [{ status: 'draft' }, { is_public: false }, { category_id: 9 }, { id: 999 }, { run_date: '2026-11-06' }, { period_label: '2026-11-B' }]) {
    assert.equal(officeChairsHistory('office-chairs', { ...current, run: { ...current.run, ...patch } }, previous), null);
  }
  assert.equal(officeChairsHistory('dog-food', current, previous), null);
  assert.equal(officeChairsHistory('office-chairs', previous, current), null);
  assert.equal(officeChairsHistory('office-chairs', current, null), null);
  assert.equal(officeChairsHistory('office-chairs', current, { ...previous, run: { ...previous.run, is_public: false } }), null);
});

test('accepts database Date values without changing collection dates', () => {
  const [current, previous] = pair();
  current.run.run_date = new Date('2026-11-05T00:00:00Z');
  assert.equal(officeChairsHistory('office-chairs', current, previous).snapshots[1].date, '2026-11-05');
});
