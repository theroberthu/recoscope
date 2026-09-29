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
