import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPromptReport } from '../prompt-report.mjs';

const answer = (run_id, agent_name, raw_response = 'Captured answer', prompt_number = 3) => ({run_id, agent_name, raw_response, prompt_number});
const mention = (run_id, agent_name, brand_name_normalized, mention_rank, extra = {}) => ({run_id, agent_name, prompt_number: 3, brand_name_normalized, mention_rank, mentioned: true, ...extra});
const runs = [{id: 2, run_date: '2026-11-18', period_label: '2026-11-B'}, {id: 1, run_date: '2026-11-11', period_label: '2026-11-A'}];

test('dated model answers preserve changed first choices, ties, gaps and unranked mentions', () => {
  const report = buildPromptReport(runs, [answer(1,'claude'), answer(2,'claude'), answer(2,'chatgpt')], [
    mention(1,'claude','A',1), mention(1,'claude','B',3),
    mention(2,'claude','B',1), mention(2,'claude','C',1), mention(2,'claude','A',null,{is_first:true}),
    mention(2,'chatgpt','A',2), mention(2,'chatgpt','A',2),
    mention(2,'chatgpt','Not mentioned',1,{mentioned:false}),
  ]);
  assert.equal(report.usable_answers,3);
  assert.deepEqual(report.snapshots[0].answers.find(a=>a.agent_name==='Claude').brands, [{brand:'B',rank:1},{brand:'C',rank:1},{brand:'A',rank:null}]);
  assert.deepEqual(report.snapshots[1].answers[0].brands, [{brand:'A',rank:1},{brand:'B',rank:3}]);
  assert.deepEqual(report.brands.find(b=>b.brand==='A'), {brand:'A',mentions:3,top3:2,first_picks:1});
  assert.ok(!report.brands.some(b=>b.brand==='Not mentioned'));
});

test('unavailable, excluded, orphan and other-run mentions cannot contribute; usable zero-brand answers remain', () => {
  const report = buildPromptReport(runs, [answer(2,'claude','[UNAVAILABLE]'), answer(2,'gemini','[EXCLUDED]'), answer(2,'chatgpt')], [
    mention(2,'claude','A',1), mention(2,'gemini','B',1), mention(2,'perplexity','Orphan',1), mention(99,'chatgpt','Other run',1),
  ]);
  assert.equal(report.usable_answers,1);
  assert.equal(report.captured_answers,3);
  assert.deepEqual(report.brands,[]);
  assert.equal(report.snapshots[0].answers.find(a=>a.agent_name==='ChatGPT').status,'No brands recorded');
  assert.equal(report.snapshots[0].answers.find(a=>a.agent_name==='Gemini').status,'Excluded from analysis');
});

test('documented legacy exclusions are applied within their own run, never to later runs', () => {
  const report = buildPromptReport([{...runs[0],id:154}, {...runs[1],id:155}], [answer(154,'gemini'),answer(155,'gemini')], [mention(154,'gemini','Excluded',1),mention(155,'gemini','Kept',null)]);
  assert.equal(report.usable_answers,1);
  assert.deepEqual(report.brands,[{brand:'Kept',mentions:1,top3:0,first_picks:0}]);
});
