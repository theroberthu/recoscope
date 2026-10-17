import test from 'node:test';
import assert from 'node:assert/strict';
import { validRank, buildPromptBreakdown, reviewStatus } from '../report-ranking.mjs';
test('null, empty, invalid and boolean ranks cannot become top placements',()=>{
 for(const v of [null,undefined,'',0,-1,NaN,Infinity,true,false,'no',1.5]) assert.equal(validRank(v),null);
 assert.equal(validRank('2'),2);
});
test('unranked brands retain presence without slots; failed responses remain visible',()=>{
 const prompts=[{prompt_number:3,prompt_text:'Compare'}];
 const mentions=[{agent_name:'gemini',prompt_number:3,brand_name_normalized:'Coway',mention_rank:null}, {agent_name:'claude',prompt_number:3,brand_name_normalized:'Coway',mention_rank:1}, {agent_name:'claude',prompt_number:3,brand_name_normalized:'Levoit',mention_rank:2}];
 const responses=[{agent_name:'chatgpt',prompt_number:3,raw_response:'[UNAVAILABLE - service error]'}, {agent_name:'gemini',prompt_number:3,raw_response:'Conflicting lists.'}];
 const rows=buildPromptBreakdown(prompts,mentions,responses)[0].agentBrands;
 assert.equal(rows.find(r=>r.agent==='chatgpt').status,'Unavailable');
 assert.deepEqual(rows.find(r=>r.agent==='gemini').brands,[]);
 assert.match(rows.find(r=>r.agent==='gemini').status,/Unranked/);
 assert.deepEqual(rows.find(r=>r.agent==='claude').brands,['Coway','Levoit']);
 assert.equal(mentions.length,3);
});
test('review wording follows the stored flag, including database string booleans',()=>{
 for(const v of [false,'f','false',null,undefined]) assert.equal(reviewStatus(v),'No human review recorded');
 for(const v of [true,'t','true']) assert.equal(reviewStatus(v),'Human review recorded');
});

import { readFileSync } from 'node:fs';
import { eligibleMentions, responseCoverage, mentionCounts, buildBudgetInsights, rankSlots, snapshotFinding } from '../report-ranking.mjs';
const recorded = JSON.parse(readFileSync(new URL('./recorded-snapshots.json', import.meta.url)));
const threePrompts = [1,2,3].map(prompt_number => ({prompt_number, prompt_text: `Prompt ${prompt_number}`}));

test('Air Purifiers: unranked budget brands are visible and not falsely absent', () => {
  const {responses, mentions} = recorded['air-purifiers'];
  const prompts = buildPromptBreakdown(threePrompts, mentions, responses);
  const budget = prompts.find(p => p.promptNumber === 2);
  assert.ok(budget.agentBrands.every(r => r.brands.length === 0 && r.allBrands.length > 0));
  assert.ok(budget.agentBrands.every(r => r.allBrands.includes('Coway') && r.allBrands.includes('Levoit')));
  const insights = buildBudgetInsights(prompts);
  for (const brand of ['Coway','Levoit','Winix']) assert.ok(!insights?.disappearUnderBudget.includes(brand), brand);
  assert.ok(insights.disappearUnderBudget.includes('Blueair'));
  const counts = mentionCounts(eligibleMentions(mentions, responses));
  assert.equal(counts.reduce((n,b) => n + b.mentionCount, 0), 42);
  assert.equal(snapshotFinding(counts, responseCoverage(responses)), 'Coway and Levoit appeared in 12 of 12 answers each.');
  assert.deepEqual(rankSlots(prompts[2].agentBrands.find(r => r.agent === 'perplexity').rankedBrands), ['Coway','Levoit','Blueair']);
});

test('Standing Desks: failed Gemini answers do not inflate coverage or imply brand absence', () => {
  const {responses, mentions} = recorded['standing-desks'];
  const coverage = responseCoverage(responses);
  assert.deepEqual(coverage, {captured:12, eligible:9, models:['ChatGPT','Claude','Perplexity'], unavailableModels:['Gemini']});
  const withStaleMention = [...mentions, {agent_name:'gemini', prompt_number:2, brand_name_normalized:'Bogus', mention_rank:1}];
  assert.ok(!eligibleMentions(withStaleMention, responses).some(m => m.brand_name_normalized === 'Bogus'));
  const prompts = buildPromptBreakdown(threePrompts, mentions, responses);
  assert.equal(prompts[1].agentBrands.find(r => r.agent === 'gemini').status, 'Unavailable');
});

test('Skincare: a completed answer with zero named brands stays in the denominator', () => {
  const {responses, mentions} = recorded.skincare;
  assert.equal(responseCoverage(responses).eligible, 12);
  const first = buildPromptBreakdown(threePrompts, mentions, responses)[0];
  assert.equal(first.agentBrands.find(r => r.agent === 'claude').hasResponse, true);
  assert.deepEqual(first.agentBrands.find(r => r.agent === 'claude').allBrands, []);
  assert.equal(mentionCounts(eligibleMentions(mentions, responses)).find(b => b.name === 'CeraVe').mentionCount, 11);
});

test('tied ranks and gaps keep their recorded slots', () => {
  assert.deepEqual(rankSlots([{name:'A',rank:1},{name:'B',rank:1},{name:'C',rank:3},{name:'D',rank:4}]), ['A / B','','C']);
});

test('absence comparisons require matched usable coverage; unavailable is not absence', () => {
  const responses = [
    {agent_name:'claude',prompt_number:1,raw_response:'A'},
    {agent_name:'claude',prompt_number:2,raw_response:'[UNAVAILABLE: error]'},
    {agent_name:'claude',prompt_number:3,raw_response:'A'},
  ];
  const mentions = [{agent_name:'claude', prompt_number:1, brand_name_normalized:'A', mention_rank:null}];
  assert.equal(buildBudgetInsights(buildPromptBreakdown(threePrompts, mentions, responses)), null);
  responses[1].raw_response = 'Choose ingredients; no named brands.';
  assert.deepEqual(buildBudgetInsights(buildPromptBreakdown(threePrompts, mentions, responses)), {budgetOnly:[], disappearUnderBudget:['A'], modelsCompared:1});
});

test('duplicate mentions, negative mentioned flags and case variants do not inflate frequency', () => {
  const responses = [{agent_name:'ChatGPT',prompt_number:1,raw_response:'A'}];
  const m = {agent_name:'chatgpt',prompt_number:1,brand_name_normalized:'A',mention_rank:null};
  assert.equal(eligibleMentions([m,{...m,agent_name:'ChatGPT'},{...m,brand_name_normalized:'B',mentioned:false}], responses).length, 1);
});
