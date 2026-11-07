import test from 'node:test';
import assert from 'node:assert/strict';
import { reportBriefEvidence } from '../report-brief.mjs';

const coverage = { eligible: 12 };
const row = (ranks, hasResponse = true) => ({ hasResponse, rankedBrands: ranks.map(([name, rank]) => ({ name, rank })) });
const comparison = rows => [{ promptNumber: 3, agentBrands: rows }];

test('opening separates mention leader from comparative leader and keeps ties', () => {
  const actual = reportBriefEvidence([{ name: 'Branch', mentionCount: 11 }], coverage, comparison([
    row([['Steelcase', 1], ['Branch', 3]]), row([['Steelcase', 1]]),
    row([['Herman Miller', 1]]), row([['Herman Miller', 1]]),
  ]));
  assert.deepEqual(actual.mentions, { names: ['Branch'], count: 11, total: 12 });
  assert.deepEqual(actual.firstPlaces, { names: ['Herman Miller', 'Steelcase'], count: 2, total: 4 });
});

test('unranked Claude answer earns no first place and unavailable answers enter neither denominator', () => {
  const actual = reportBriefEvidence([{ name: 'A', mentionCount: 7 }], { eligible: 11 }, comparison([
    row([['A', 1]]), { ...row([]), status: 'Unranked — brand mentions retained' },
    row([['B', 1], ['B', 1]]), { ...row([], false), status: 'Unavailable' },
  ]));
  assert.equal(actual.unranked, 1);
  assert.deepEqual(actual.firstPlaces, { names: ['A', 'B'], count: 1, total: 2 });
  assert.equal(actual.mentions.total, 11);
});

test('missing explicit ranks and tied mention leaders are preserved without invented winners', () => {
  const actual = reportBriefEvidence([{ name: 'A', mentionCount: 8 }, { name: 'B', mentionCount: 8 }], coverage, comparison([row([])]));
  assert.deepEqual(actual.mentions.names, ['A', 'B']);
  assert.deepEqual(actual.firstPlaces, { names: [], count: 0, total: 0 });
  assert.equal(actual.unranked, 1);
});
